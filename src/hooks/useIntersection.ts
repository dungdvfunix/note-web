import { useCallback, useEffect, useRef, useState } from "react";

type Callback = (visible: boolean) => void;

/**
 * One shared IntersectionObserver for many elements (instead of one per element).
 * Returns a stable `observe(el, cb)` that returns its own unobserve, or undefined until `root` exists.
 */
export function useIntersection(root: HTMLElement | null, rootMargin: string) {
	const callbacks = useRef(new Map<Element, Callback>());
	const [io, setIo] = useState<IntersectionObserver>();

	useEffect(() => {
		if (!root) return;
		const observer = new IntersectionObserver(
			(entries) => entries.forEach((e) => callbacks.current.get(e.target)?.(e.isIntersecting)),
			{ root, rootMargin },
		);
		setIo(observer);
		return () => {
			observer.disconnect();
			setIo(undefined);
		};
	}, [root, rootMargin]);

	return useCallback(
		(el: Element, cb: Callback) => {
			if (!io) return () => {};
			callbacks.current.set(el, cb);
			io.observe(el);
			return () => {
				io.unobserve(el);
				callbacks.current.delete(el);
			};
		},
		[io],
	);
}
