import { useCallback, useEffect, useRef, useState } from "react";

type Callback = (visible: boolean) => void;

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
