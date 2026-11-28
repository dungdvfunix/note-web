import { lazy, Suspense } from "react";
import { Spinner } from "./Spinner";

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
