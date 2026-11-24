import { useCallback, useEffect, useState } from "react";
import { listNotes, type Note } from "./api";
import { NewNoteForm } from "./components/NewNoteForm";
import { NoteItem } from "./components/NoteItem";

export function App() {
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
			setError(e instanceof Error ? e.message : String(e));
		}
	}, []);

	const refresh = useCallback(() => load(), [load]);

	const loadMore = async () => {
		if (!nextCursor || loadingMore) return;
		setLoadingMore(true);
		await load(nextCursor);
		setLoadingMore(false);
	};

	useEffect(() => {
		refresh();
	}, [refresh]);

	// Patch the loaded list in place so already-loaded pages aren't thrown away.
	const onCreated = (note: Note) => setNotes((prev) => [note, ...(prev ?? [])]);
	const onUpdated = (note: Note) =>
		setNotes((prev) => prev?.map((n) => (n.id === note.id ? note : n)));
	const onDeleted = (id: number) => setNotes((prev) => prev?.filter((n) => n.id !== id));

	return (
		<div className="min-h-screen bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
			<main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
				<header className="flex items-end justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Notes</h1>
						<p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
							Capture ideas before they slip away.
						</p>
					</div>
					{notes && notes.length > 0 && (
						<span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
							{notes.length}
							{nextCursor ? "+" : ""} {notes.length === 1 && !nextCursor ? "note" : "notes"}
						</span>
					)}
				</header>

				<NewNoteForm onCreated={onCreated} />

				{error && (
					<div
						role="alert"
						className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
					>
						<span>{error}</span>
						<button onClick={refresh} className="font-medium underline-offset-2 hover:underline">
							Retry
						</button>
					</div>
				)}

				{notes === undefined ? (
					!error && <Skeleton />
				) : notes.length === 0 ? (
					<EmptyState />
				) : (
					<>
						<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{notes.map((note) => (
								<NoteItem key={note.id} note={note} onUpdated={onUpdated} onDeleted={onDeleted} />
							))}
						</ul>
						{nextCursor && (
							<button
								onClick={loadMore}
								disabled={loadingMore}
								className="mx-auto rounded-lg px-4 py-2 text-sm font-medium text-stone-600 ring-1 ring-stone-300 transition hover:bg-white hover:text-stone-900 disabled:opacity-40 dark:text-stone-300 dark:ring-stone-700 dark:hover:bg-stone-900 dark:hover:text-stone-100"
							>
								{loadingMore ? "Loading..." : "Load more"}
							</button>
						)}
					</>
				)}
			</main>
		</div>
	);
}

function Skeleton() {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading notes">
			{Array.from({ length: 3 }, (_, i) => (
				<li key={i} className="h-36 animate-pulse rounded-2xl bg-white/70 dark:bg-stone-900" />
			))}
		</ul>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 px-6 py-16 text-center dark:border-stone-800">
			<span className="text-4xl" aria-hidden>
				✎
			</span>
			<p className="font-medium">No notes yet</p>
			<p className="text-sm text-stone-500 dark:text-stone-400">Write your first note above.</p>
		</div>
	);
}
