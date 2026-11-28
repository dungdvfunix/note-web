import { useCallback, useState } from "react";
import type { Attachment } from "../api";
import { fileKind, fileSize } from "../format";
import { dangerHover, iconBtnSm } from "../ui";
import { FileBadge } from "./FileBadge";
import { DownloadIcon, XIcon } from "./icons";
import { PdfViewerModal } from "./PdfViewerModal";

type ListProps = {
	items: Attachment[];
	/** When set (edit mode), each item gets a remove button. */
	onRemove?: (a: Attachment) => void;
	busy?: boolean;
};

/** Saved attachments of a note: image grid, inline players, then a file list. */
export function AttachmentList({ items, onRemove, busy }: ListProps) {
	const [viewing, setViewing] = useState<Attachment>();
	const closeViewer = useCallback(() => setViewing(undefined), []);
	if (items.length === 0) return null;

	const images: Attachment[] = [];
	const media: Attachment[] = [];
	const files: Attachment[] = [];
	for (const a of items) {
		const kind = fileKind(a.contentType);
		(kind === "image" ? images : kind === "video" || kind === "audio" ? media : files).push(a);
	}
	const remove = onRemove && { onRemove, busy };

	return (
		<div className="mt-3 flex flex-col gap-2">
			{images.length > 0 && (
				<div className={`grid gap-1.5 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
					{images.map((a) => (
						<ImageTile key={a.id} a={a} single={images.length === 1} remove={remove} />
					))}
				</div>
			)}
			{media.map((a) => (
				<MediaItem key={a.id} a={a} remove={remove} />
			))}
			{files.map((a) => (
				<FileRow key={a.id} a={a} remove={remove} onView={fileKind(a.contentType) === "pdf" ? setViewing : undefined} />
			))}
			{viewing && <PdfViewerModal url={viewing.url} filename={viewing.filename} onClose={closeViewer} />}
		</div>
	);
}

type Removable = { remove?: { onRemove: (a: Attachment) => void; busy?: boolean } };

function RemoveButton({ a, remove, overlay }: { a: Attachment; overlay?: boolean } & Required<Removable>) {
	return (
		<button
			onClick={() => remove.onRemove(a)}
			disabled={remove.busy}
			aria-label={`Remove ${a.filename}`}
			className={
				overlay
					? `absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-white/90 text-stone-600 shadow-card ring-1 ring-stone-200 transition disabled:opacity-40 ${dangerHover}`
					: `${iconBtnSm} ${dangerHover}`
			}
		>
			<XIcon width={overlay ? 12 : 14} height={overlay ? 12 : 14} />
		</button>
	);
}

function ImageTile({ a, single, remove }: { a: Attachment; single: boolean } & Removable) {
	return (
		<div className="relative overflow-hidden rounded-lg bg-stone-100 ring-1 ring-stone-200/70">
			<a href={a.url} target="_blank" rel="noreferrer" title={a.filename}>
				<img
					src={a.url}
					alt={a.filename}
					loading="lazy"
					decoding="async"
					className={`w-full object-cover transition hover:opacity-90 ${single ? "max-h-72" : "aspect-square"}`}
				/>
			</a>
			{remove && <RemoveButton a={a} remove={remove} overlay />}
		</div>
	);
}

function MediaItem({ a, remove }: { a: Attachment } & Removable) {
	return (
		<div className="relative">
			{fileKind(a.contentType) === "video" ? (
				<video src={a.url} controls preload="metadata" className="w-full rounded-lg bg-black" />
			) : (
				<audio src={a.url} controls preload="metadata" className="w-full" />
			)}
			{remove && <RemoveButton a={a} remove={remove} overlay />}
		</div>
	);
}

function FileRow({ a, remove, onView }: { a: Attachment; onView?: (a: Attachment) => void } & Removable) {
	const info = (
		<>
			<FileBadge name={a.filename} type={a.contentType} />
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm font-medium text-stone-800 group-hover/file:underline group-hover/file:underline-offset-2">
					{a.filename}
				</span>
				<span className="block text-xs text-stone-400">
					{fileSize(a.size)}
					{onView && " · Click to view"}
				</span>
			</span>
		</>
	);

	return (
		<div className="group/file flex items-center gap-3 rounded-lg border border-stone-200/80 bg-stone-50/60 p-2 transition hover:bg-stone-50">
			{onView ? (
				<button
					type="button"
					onClick={() => onView(a)}
					title={`View ${a.filename}`}
					className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
				>
					{info}
				</button>
			) : (
				<div className="flex min-w-0 flex-1 items-center gap-3" title={a.filename}>
					{info}
				</div>
			)}
			{remove ? (
				<RemoveButton a={a} remove={remove} />
			) : (
				<a href={a.url} download={a.filename} className={iconBtnSm} aria-label={`Download ${a.filename}`}>
					<DownloadIcon width={14} height={14} />
				</a>
			)}
		</div>
	);
}
