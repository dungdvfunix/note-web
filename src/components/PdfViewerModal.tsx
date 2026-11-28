import { lazy, Suspense } from "react";
import { Spinner } from "./Spinner";

// pdf.js is ~1 MB: only fetched the first time a PDF is opened.
const PdfViewer = lazy(() => import("./PdfViewer"));

type Props = { url: string; filename: string; onClose: () => void };

export function PdfViewerModal(props: Props) {
	return (
		<Suspense
			fallback={
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
					<Spinner light />
				</div>
			}
		>
			<PdfViewer {...props} />
		</Suspense>
	);
}
