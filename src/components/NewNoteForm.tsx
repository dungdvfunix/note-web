import { useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { createNote } from "../api";

export function NewNoteForm({ onChanged }: { onChanged: () => Promise<void> }) {
	const [content, setContent] = useState("");
	const [error, setError] = useState<string>();
	const [pending, startTransition] = useTransition();
	const trimmed = content.trim();

	const submit = (e?: FormEvent) => {
		e?.preventDefault();
		if (!trimmed || pending) return;
		startTransition(async () => {
			try {
				await createNote(trimmed);
			} catch (err) {
				setError(err instanceof Error ? err.message : String(err));
				return;
			}
			setError(undefined);
			setContent("");
			await onChanged();
		});
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
	};

	return (
		<form
			onSubmit={submit}
			className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200 transition focus-within:ring-2 focus-within:ring-amber-400 dark:bg-stone-900 dark:ring-stone-800"
		>
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				onKeyDown={onKeyDown}
				placeholder="What's on your mind?"
				aria-label="New note"
				rows={3}
				className="w-full resize-none bg-transparent text-base outline-none placeholder:text-stone-400"
			/>
			<div className="mt-2 flex items-center justify-between gap-3">
				<span className="text-xs text-stone-400">
					{error ? <span className="text-red-600 dark:text-red-400">{error}</span> : "⌘/Ctrl + Enter to save"}
				</span>
				<button
					type="submit"
					disabled={pending || !trimmed}
					className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
				>
					{pending ? "Saving..." : "Add note"}
				</button>
			</div>
		</form>
	);
}
