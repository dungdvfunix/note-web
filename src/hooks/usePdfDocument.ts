import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useCallback, useEffect, useState } from "react";

GlobalWorkerOptions.workerSrc = workerUrl;

export type Size = { w: number; h: number };

/**
 * Opens a PDF. Only page 1 is read up front: its size is used for every page until
 * a page renders and reports its real size (most PDFs use one size throughout).
 */
export function usePdfDocument(url: string) {
	const [doc, setDoc] = useState<PDFDocumentProxy>();
	const [pageSizes, setPageSizes] = useState<Size[]>([]);
	const [error, setError] = useState<string>();

	useEffect(() => {
		const task = getDocument({ url }); // same origin: the session cookie is sent; Range requests used
		task.promise
			.then(async (pdf) => {
				const vp = (await pdf.getPage(1)).getViewport({ scale: 1 });
				setPageSizes(Array.from({ length: pdf.numPages }, () => ({ w: vp.width, h: vp.height })));
				setDoc(pdf);
			})
			.catch((err: Error) => setError(err.message || "Could not open this PDF"));
		return () => void task.destroy(); // also tears down the document and its worker
	}, [url]);

	/** Corrects one page's size (scale 1) once it is known; no-op if unchanged. */
	const setPageSize = useCallback((num: number, size: Size) => {
		setPageSizes((prev) => {
			const cur = prev[num - 1];
			return cur && cur.w === size.w && cur.h === size.h ? prev : prev.map((s, i) => (i === num - 1 ? size : s));
		});
	}, []);

	return { doc, pageSizes, error, setPageSize };
}
