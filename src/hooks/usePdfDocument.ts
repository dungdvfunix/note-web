import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useCallback, useEffect, useState } from "react";

GlobalWorkerOptions.workerSrc = workerUrl;

export type Size = { w: number; h: number };

export function usePdfDocument(url: string) {
	const [doc, setDoc] = useState<PDFDocumentProxy>();
	const [pageSizes, setPageSizes] = useState<Size[]>([]);
	const [error, setError] = useState<string>();

	useEffect(() => {
		const task = getDocument({ url });
		task.promise
			.then(async (pdf) => {
				const vp = (await pdf.getPage(1)).getViewport({ scale: 1 });
				setPageSizes(Array.from({ length: pdf.numPages }, () => ({ w: vp.width, h: vp.height })));
				setDoc(pdf);
			})
			.catch((err: Error) => setError(err.message || "Could not open this PDF"));
		return () => void task.destroy();
	}, [url]);

	const setPageSize = useCallback((num: number, size: Size) => {
		setPageSizes((prev) => {
			const cur = prev[num - 1];
			return cur && cur.w === size.w && cur.h === size.h ? prev : prev.map((s, i) => (i === num - 1 ? size : s));
		});
	}, []);

	return { doc, pageSizes, error, setPageSize };
}
