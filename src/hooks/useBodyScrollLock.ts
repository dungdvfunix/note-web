import { useEffect } from "react";

/** Prevents the page behind a modal from scrolling while mounted. */
export function useBodyScrollLock() {
	useEffect(() => {
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, []);
}
