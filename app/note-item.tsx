"use client";

import { useState, useTransition } from "react";
import type { Note } from "@/lib/notes-api";
import { deleteNoteAction, updateNoteAction, type ActionResult } from "./actions";

const button = "rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 disabled:opacity-50";

export function NoteItem({ note }: { note: Note }) {
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(note.content);
	const [error, setError] = useState<string>();
	const [pending, startTransition] = useTransition();

	const run = (fn: () => Promise<ActionResult>, onOk?: () => void) =>
		startTransition(async () => {
			const { error } = await fn();
			setError(error);
			if (!error) onOk?.();
		});

	const save = () => run(() => updateNoteAction(note.id, text.trim()), () => setEditing(false));

	const remove = () => {
		if (confirm("Delete this note?")) run(() => deleteNoteAction(note.id));
	};

	return (
		<li className="flex flex-col gap-1 border-b border-slate-200 py-3">
			<div className="flex items-center gap-2">
				{editing ? (
					<>
						<input
							value={text}
							onChange={(e) => setText(e.target.value)}
							aria-label="Edit note"
							autoFocus
							className="flex-1 rounded-md border border-slate-300 px-3 py-1"
						/>
						<button onClick={save} disabled={pending || !text.trim()} className={button}>
							Save
						</button>
						<button
							onClick={() => {
								setEditing(false);
								setText(note.content);
							}}
							className={button}
						>
							Cancel
						</button>
					</>
				) : (
					<>
						<div className="flex flex-1 flex-col break-words">
							<span>{note.content}</span>
							<small className="text-slate-500">{note.created_at}</small>
						</div>
						<button onClick={() => setEditing(true)} className={button}>
							Edit
						</button>
						<button onClick={remove} disabled={pending} className={button}>
							Delete
						</button>
					</>
				)}
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
		</li>
	);
}
