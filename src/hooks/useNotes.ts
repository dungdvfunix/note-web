import { useCallback, useEffect, useState } from "react";
import { listNotes, type Note } from "../api";
import { errorMessage } from "../format";

/**
 * The signed-in user's notes: first page on mount, "load more" pagination, and
 * local patches after create/update/delete so loaded pages aren't refetched.
 * All returned callbacks are stable (safe for memoized children).
 */
export function useNotes() {
	const [notes, setNotes] = useState<Note[]>();
	const [nextCursor, setNextCursor] = useState<number | null>(null);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string>();

	/** Loads the first page, or appends the page after `cursor`. */
	const load = useCallback(async (cursor?: number) => {
		try {
			const page = await listNotes(cursor);
			setNotes((prev) => (cursor && prev ? [...prev, ...page.data] : page.data));
			setNextCursor(page.nextCursor);
			setError(undefined);
		} catch (e) {
			setError(errorMessage(e));
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const reload = useCallback(() => load(), [load]);

	const loadMore = async () => {
		if (!nextCursor || loadingMore) return;
		setLoadingMore(true);
		await load(nextCursor);
		setLoadingMore(false);
	};

	const add = useCallback((note: Note) => setNotes((prev) => [note, ...(prev ?? [])]), []);
	/** Functional patch so concurrent changes to the same note (e.g. two uploads) don't overwrite each other. */
	const update = useCallback(
		(id: number, patch: (note: Note) => Note) => setNotes((prev) => prev?.map((n) => (n.id === id ? patch(n) : n))),
		[],
	);
	const remove = useCallback((id: number) => setNotes((prev) => prev?.filter((n) => n.id !== id)), []);

	return { notes, error, hasMore: nextCursor !== null, loadingMore, loadMore, reload, add, update, remove };
}
