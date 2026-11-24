import { useState, useTransition, type KeyboardEvent } from "react";
import { deleteNote, updateNote, type Note } from "../api";
import { fullDate, parseDate, relativeTime } from "../format";

type Props = {
	note: Note;
	onUpdated: (note: Note) => void;
	onDeleted: (id: number) => void;
};

const ghost =
	"rounded-md px-2.5 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-40 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100";

export function NoteItem({ note, onUpdated, onDeleted }: Props) {
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(note.content);
	const [error, setError] = useState<string>();
	const [pending, startTransition] = useTransition();
	const created = parseDate(note.created_at);

	const run = <T,>(fn: () => Promise<T>, onOk: (result: T) => void) =>
		startTransition(async () => {
			let result: T;
			try {
				result = await fn();
			} catch (e) {
				setError(e instanceof Error ? e.message : String(e));
				return;
			}
			setError(undefined);
			onOk(result);
		});

	const save = () => {
		if (!text.trim()) return;
		run(
			() => updateNote(note.id, text.trim()),
			(updated) => {
				setEditing(false);
				onUpdated(updated);
			},
		);
	};

	const cancel = () => {
		setEditing(false);
		setText(note.content);
		setError(undefined);
	};

	const remove = () => {
		if (confirm("Delete this note?")) run(() => deleteNote(note.id), () => onDeleted(note.id));
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
		if (e.key === "Escape") cancel();
	};

	return (
		<li
			className={`group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-stone-900 dark:ring-stone-800 ${
				pending ? "opacity-60" : ""
			}`}
		>
			{editing ? (
				<textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={onKeyDown}
					aria-label="Edit note"
					autoFocus
					rows={4}
					className="w-full flex-1 resize-none rounded-lg bg-stone-50 p-2 outline-none ring-2 ring-amber-400 dark:bg-stone-800"
				/>
			) : (
				<p className="flex-1 whitespace-pre-wrap break-words leading-relaxed">{note.content}</p>
			)}

			{error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

			<div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
				<time dateTime={created.toISOString()} title={fullDate(created)} className="text-xs text-stone-400">
					{relativeTime(created)}
				</time>
				<div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
					{editing ? (
						<>
							<button onClick={cancel} className={ghost}>
								Cancel
							</button>
							<button
								onClick={save}
								disabled={pending || !text.trim()}
								className="rounded-md bg-amber-400 px-2.5 py-1 text-xs font-medium text-stone-950 transition hover:bg-amber-300 disabled:opacity-40"
							>
								Save
							</button>
						</>
					) : (
						<>
							<button onClick={() => setEditing(true)} className={ghost}>
								Edit
							</button>
							<button
								onClick={remove}
								disabled={pending}
								className={`${ghost} hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400`}
							>
								Delete
							</button>
						</>
					)}
				</div>
			</div>
		</li>
	);
}
