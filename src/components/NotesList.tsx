import type { useNotes } from "../hooks/useNotes";
import { masonry } from "../ui";
import { PenIcon } from "./icons";
import { NoteItem } from "./NoteItem";

type Props = ReturnType<typeof useNotes>;

export function NotesList({ notes, error, hasMore, loadingMore, loadMore, update, remove }: Props) {
	return (
		<section>
			<div className="mb-4 flex items-baseline justify-between">
				<h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Your notes</h2>
				{!!notes?.length && (
					<span className="text-xs tabular-nums text-stone-400">
						{notes.length}
						{hasMore && "+"} total
					</span>
				)}
			</div>
			{renderBody()}
		</section>
	);

	function renderBody() {
		if (!notes) return error ? null : <Skeleton />;
		if (notes.length === 0) return <EmptyState />;
		return (
			<>
				<ul className={masonry}>
					{notes.map((note) => (
						<NoteItem key={note.id} note={note} onChange={update} onDeleted={remove} />
					))}
				</ul>
				{hasMore && (
					<div className="mt-4 flex justify-center">
						<button
							onClick={loadMore}
							disabled={loadingMore}
							className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-card transition hover:text-ink hover:shadow-lift disabled:opacity-50"
						>
							{loadingMore ? "Loading…" : "Load more"}
						</button>
					</div>
				)}
			</>
		);
	}
}

const SKELETON_HEIGHTS = [28, 20, 36, 24, 32, 20];

function Skeleton() {
	return (
		<ul className={masonry} aria-label="Loading notes">
			{SKELETON_HEIGHTS.map((h, i) => (
				<li
					key={i}
					className="mb-4 animate-pulse break-inside-avoid rounded-xl border border-stone-200/60 bg-white"
					style={{ height: h * 4 }}
				/>
			))}
		</ul>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/50 px-6 py-16 text-center">
			<span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-amber-700">
				<PenIcon width={20} height={20} />
			</span>
			<p className="mt-4 font-medium">No notes yet</p>
			<p className="mt-1 text-sm text-stone-500">Your first idea is one keystroke away.</p>
		</div>
	);
}
