import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import { memo, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { useIntersection } from "../hooks/useIntersection";
import { usePdfDocument, type Size } from "../hooks/usePdfDocument";
import { iconBtnMd } from "../ui";
import { FileBadge } from "./FileBadge";
import { DownloadIcon, ExternalIcon, MinusIcon, PlusIcon, XIcon } from "./icons";
import { Spinner } from "./Spinner";

type Props = { url: string; filename: string; onClose: () => void };
type Zoom = number | "fit";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const STEP = 0.25;
const GAP = 16; // px between pages
const PADDING_X = 32;
const MAX_CANVAS_PIXELS = 16_000_000; // stay under mobile canvas limits at high zoom × DPR

const clampScale = (s: number) => Math.min(Math.max(s, MIN_SCALE), MAX_SCALE);

/**
 * Full-screen PDF viewer rendered with pdf.js (same on desktop, iOS and Android, unlike
 * the browser's built-in viewer). Pages render lazily as they scroll near the viewport.
 */
export default function PdfViewer({ url, filename, onClose }: Props) {
	const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
	const { doc, pageSizes, error, setPageSize } = usePdfDocument(url);
	const [zoom, setZoom] = useState<Zoom>("fit");
	const fitScale = useFitScale(scroller, pageSizes);
	const scale = zoom === "fit" ? fitScale : zoom;
	const [current, setCurrent] = useState(1);
	const currentRef = useRef(1);
	const observe = useIntersection(scroller, "800px 0px");

	// Top offset of each page inside the scroll content: pure arithmetic, no DOM reads.
	const tops = useMemo(() => {
		const out: number[] = [];
		let y = GAP;
		for (const s of pageSizes) {
			out.push(y);
			y += s.h * (scale ?? 1) + GAP;
		}
		return out;
	}, [pageSizes, scale]);

	const onScroll = () => {
		if (!scroller) return;
		const mark = scroller.scrollTop + scroller.clientHeight / 3;
		// Last page whose top is above the mark (binary search).
		let lo = 0;
		let hi = tops.length - 1;
		while (lo < hi) {
			const mid = (lo + hi + 1) >> 1;
			if (tops[mid] <= mark) lo = mid;
			else hi = mid - 1;
		}
		currentRef.current = lo + 1;
		setCurrent(lo + 1);
	};

	const goTo = (n: number, behavior: ScrollBehavior = "smooth") =>
		scroller?.scrollTo({ top: tops[n - 1] - GAP, behavior });

	// Zoom changes every page's height: keep the page that was in view at the top.
	const reanchor = useEffectEvent(() => {
		if (currentRef.current > 1) goTo(currentRef.current, "instant");
	});
	useLayoutEffect(() => {
		reanchor();
	}, [scale]);

	const zoomBy = (delta: number) => setZoom(clampScale(Math.round(((scale ?? 1) + delta) / STEP) * STEP));

	useBodyScrollLock();
	const onKey = useEffectEvent((e: KeyboardEvent) => {
		if (e.key === "Escape") onClose();
		if (e.key === "+" || e.key === "=") zoomBy(STEP);
		if (e.key === "-") zoomBy(-STEP);
	});
	useEffect(() => {
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const numPages = doc?.numPages ?? 0;

	return (
		<div
			className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink/50 backdrop-blur-sm sm:p-6"
			role="dialog"
			aria-modal="true"
			aria-label={filename}
			onMouseDown={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="relative flex w-full max-w-5xl flex-col overflow-hidden bg-paper shadow-2xl sm:rounded-2xl">
				<PdfToolbar
					url={url}
					filename={filename}
					current={current}
					numPages={numPages}
					scale={scale}
					fit={zoom === "fit"}
					onGoTo={goTo}
					onZoom={zoomBy}
					onFit={() => setZoom("fit")}
					onClose={onClose}
				/>

				<div ref={setScroller} onScroll={onScroll} className="relative flex-1 overflow-auto bg-stone-100">
					{error ? (
						<div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
							<p className="text-sm text-red-700">{error}</p>
							<a href={url} download={filename} className="text-sm font-medium underline underline-offset-4">
								Download instead
							</a>
						</div>
					) : !doc || !scale || !observe ? (
						<div className="flex h-full items-center justify-center">
							<Spinner />
						</div>
					) : (
						<div className="flex min-w-fit flex-col items-center px-4" style={{ gap: GAP, paddingBlock: GAP }}>
							{pageSizes.map((size, i) => (
								<PdfPage
									key={i}
									doc={doc}
									num={i + 1}
									size={size}
									scale={scale}
									observe={observe}
									onSize={setPageSize}
								/>
							))}
						</div>
					)}
				</div>

				{numPages > 0 && (
					<p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-xs tabular-nums text-white sm:hidden">
						{current} / {numPages}
					</p>
				)}
			</div>
		</div>
	);
}

/** Scale that fits the widest page to the scroller width; tracks resizes (rounded to avoid churn). */
function useFitScale(scroller: HTMLElement | null, pageSizes: Size[]) {
	const [fit, setFit] = useState<number>();
	const widest = useMemo(() => Math.max(0, ...pageSizes.map((s) => s.w)), [pageSizes]);

	useLayoutEffect(() => {
		if (!scroller || !widest) return;
		const measure = () =>
			setFit(Math.round(Math.min(Math.max((scroller.clientWidth - PADDING_X) / widest, MIN_SCALE), 2) * 100) / 100);
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(scroller);
		return () => ro.disconnect();
	}, [scroller, widest]);

	return fit;
}

type ToolbarProps = {
	url: string;
	filename: string;
	current: number;
	numPages: number;
	scale?: number;
	fit: boolean;
	onGoTo: (n: number) => void;
	onZoom: (delta: number) => void;
	onFit: () => void;
	onClose: () => void;
};

function PdfToolbar({ url, filename, current, numPages, scale, fit, onGoTo, onZoom, onFit, onClose }: ToolbarProps) {
	return (
		<header className="flex h-14 shrink-0 items-center gap-2 border-b border-stone-200 bg-white px-3 sm:px-4">
			<FileBadge name={filename} type="application/pdf" compact />
			<p className="min-w-0 flex-1 truncate text-sm font-medium" title={filename}>
				{filename}
			</p>

			{numPages > 0 && (
				<div className="hidden items-center gap-1 text-sm text-stone-500 sm:flex">
					<input
						type="number"
						min={1}
						max={numPages}
						value={current}
						onChange={(e) => {
							const n = Number(e.target.value);
							if (n >= 1 && n <= numPages) onGoTo(n);
						}}
						className="w-12 rounded-md border border-stone-200 bg-white px-1.5 py-1 text-center tabular-nums outline-none focus:border-accent"
						aria-label="Page number"
					/>
					<span className="tabular-nums">/ {numPages}</span>
				</div>
			)}

			<div className="mx-1 hidden h-5 w-px bg-stone-200 sm:block" />

			<div className="flex items-center">
				<button
					onClick={() => onZoom(-STEP)}
					disabled={!scale || scale <= MIN_SCALE}
					className={`inline-flex ${iconBtnMd}`}
					aria-label="Zoom out"
				>
					<MinusIcon />
				</button>
				<button
					onClick={onFit}
					className={`h-8 min-w-14 rounded-lg px-1.5 text-xs font-medium tabular-nums transition hover:bg-stone-100 ${fit ? "text-ink" : "text-stone-500"}`}
					title="Fit to width"
				>
					{scale ? `${Math.round(scale * 100)}%` : "—"}
				</button>
				<button
					onClick={() => onZoom(STEP)}
					disabled={!scale || scale >= MAX_SCALE}
					className={`inline-flex ${iconBtnMd}`}
					aria-label="Zoom in"
				>
					<PlusIcon />
				</button>
			</div>

			<div className="mx-1 h-5 w-px bg-stone-200" />

			<a
				href={url}
				target="_blank"
				rel="noreferrer"
				className={`hidden sm:inline-flex ${iconBtnMd}`}
				aria-label="Open in new tab"
				title="Open in new tab"
			>
				<ExternalIcon />
			</a>
			<a href={url} download={filename} className={`inline-flex ${iconBtnMd}`} aria-label="Download" title="Download">
				<DownloadIcon />
			</a>
			<button onClick={onClose} className={`inline-flex ${iconBtnMd}`} aria-label="Close" title="Close (Esc)">
				<XIcon />
			</button>
		</header>
	);
}

type PageProps = {
	doc: PDFDocumentProxy;
	num: number;
	size: Size;
	scale: number;
	observe: (el: Element, cb: (visible: boolean) => void) => () => void;
	onSize: (num: number, size: Size) => void;
};

/**
 * One page. Renders to its canvas only while near the viewport; when it scrolls far
 * away the bitmap and pdf.js page resources are released. Memoized so scrolling
 * (current-page updates) doesn't re-render every page.
 */
const PdfPage = memo(function PdfPage({ doc, num, size, scale, observe, onSize }: PageProps) {
	const box = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const [near, setNear] = useState(false);

	useEffect(() => observe(box.current!, setNear), [observe]);

	useEffect(() => {
		const c = canvas.current;
		if (!c || !near) return;
		let task: RenderTask | undefined;
		let page: PDFPageProxy | undefined;
		let cancelled = false;

		doc.getPage(num).then((p) => {
			if (cancelled) return;
			page = p;
			const base = p.getViewport({ scale: 1 });
			onSize(num, { w: base.width, h: base.height });
			// Crisp on retina, but cap the bitmap size at high zoom.
			const cssPixels = base.width * base.height * scale * scale;
			const ratio = Math.min(window.devicePixelRatio || 1, Math.sqrt(MAX_CANVAS_PIXELS / cssPixels));
			const viewport = p.getViewport({ scale: scale * ratio });
			c.width = Math.floor(viewport.width);
			c.height = Math.floor(viewport.height);
			task = p.render({ canvas: c, viewport });
			task.promise.catch((err: Error) => {
				if (err?.name !== "RenderingCancelledException") console.error(`PDF page ${num}`, err);
			});
		});

		return () => {
			cancelled = true;
			task?.cancel();
			c.width = c.height = 0; // release the bitmap
			page?.cleanup();
		};
	}, [near, scale, doc, num, onSize]);

	return (
		<div
			ref={box}
			className="relative shrink-0 bg-white shadow-card ring-1 ring-stone-200"
			style={{ width: size.w * scale, height: size.h * scale }}
		>
			<canvas ref={canvas} className="block size-full" />
		</div>
	);
});
