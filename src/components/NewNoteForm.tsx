import { useState, type ClipboardEvent, type DragEvent, type FormEvent, type KeyboardEvent } from "react";
import { createNote, MAX_FILES_PER_NOTE, partitionFiles, uploadAttachments, type Note } from "../api";
import { errorMessage, isSubmitShortcut } from "../format";
import { btnGhost, btnPrimary } from "../ui";
import { PaperclipIcon } from "./icons";
import { AttachButton, PendingFiles, type PendingFile } from "./PendingFiles";

const kbd = "rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-sans text-[11px] text-stone-500";
const BUSY_LABEL = { saving: "Saving…", uploading: "Uploading…" } as const;
const PROGRESS_STEP = 0.05;

export function NewNoteForm({ onCreated }: { onCreated: (note: Note) => void }) {
	const [content, setContent] = useState("");
	const [files, setFiles] = useState<PendingFile[]>([]);
	const [error, setError] = useState<string>();
	const [busy, setBusy] = useState<keyof typeof BUSY_LABEL>();
	const [dragging, setDragging] = useState(false);
	const trimmed = content.trim();

	const addFiles = (list: FileList) => {
		const { files: accepted, problem } = partitionFiles(list, files.length);
		setFiles((prev) => [...prev, ...accepted.map((file) => ({ key: crypto.randomUUID(), file }))]);
		setError(problem);
	};

	const patch = (key: string, p: Partial<PendingFile>) =>
		setFiles((prev) => {
			const i = prev.findIndex((f) => f.key === key);
			if (i < 0 || Object.entries(p).every(([k, v]) => prev[i][k as keyof PendingFile] === v)) return prev;
			return prev.map((f, j) => (j === i ? { ...f, ...p } : f));
		});

	const submit = async (e?: FormEvent) => {
		e?.preventDefault();
		if (!trimmed || busy) return;
		setBusy("saving");
		setError(undefined);
		try {
			const note = await createNote(trimmed);
			let failed = 0;
			if (files.length) setBusy("uploading");
			const attachments = await uploadAttachments(note.id, files, {
				onProgress: (key, p) => patch(key, { progress: Math.floor(p / PROGRESS_STEP) * PROGRESS_STEP }),
				onError: (key, err) => {
					failed++;
					patch(key, { error: errorMessage(err) });
				},
			});
			if (failed) setError(`Note saved, but ${failed} file${failed > 1 ? "s" : ""} failed to upload`);
			onCreated({ ...note, attachments });
			setContent("");
			setFiles([]);
		} catch (err) {
			setError(errorMessage(err));
		} finally {
			setBusy(undefined);
		}
	};

	const onKeyDown = (e: KeyboardEvent) => isSubmitShortcut(e) && submit();

	const onPaste = (e: ClipboardEvent) => {
		if (!e.clipboardData.files.length) return;
		e.preventDefault();
		addFiles(e.clipboardData.files);
	};

	const onDragOver = (e: DragEvent) => {
		if (!e.dataTransfer.types.includes("Files")) return;
		e.preventDefault();
		setDragging(true);
	};

	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		setDragging(false);
		if (!busy) addFiles(e.dataTransfer.files);
	};

	return (
		<form
			onSubmit={submit}
			onDragOver={onDragOver}
			onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setDragging(false)}
			onDrop={onDrop}
			className={`relative rounded-2xl border bg-white p-2 shadow-card transition focus-within:border-accent/60 focus-within:shadow-lift focus-within:ring-4 focus-within:ring-accent/10 ${
				dragging ? "border-accent ring-4 ring-accent/20" : "border-stone-200"
			}`}
		>
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				onKeyDown={onKeyDown}
				onPaste={onPaste}
				placeholder="Write a note…"
				aria-label="New note"
				rows={3}
				className="field-sizing-content block max-h-80 min-h-20 w-full resize-none bg-transparent px-3 pt-2 text-[15px] leading-relaxed outline-none placeholder:text-stone-400"
			/>

			<PendingFiles
				items={files}
				uploading={!!busy}
				onRemove={(key) => setFiles((prev) => prev.filter((f) => f.key !== key))}
			/>

			<div className="flex items-center justify-between gap-3 px-1 pb-1 pt-2">
				<div className="flex min-w-0 items-center gap-2">
					<AttachButton
						onFiles={addFiles}
						disabled={!!busy || files.length >= MAX_FILES_PER_NOTE}
						className={`${btnGhost} px-2`}
					>
						<PaperclipIcon width={15} height={15} />
						<span>Attach</span>
					</AttachButton>
					<span className="truncate text-xs text-stone-400">
						{error ? (
							<span className="text-red-600">{error}</span>
						) : (
							<span className="hidden sm:inline">
								<kbd className={kbd}>⌘</kbd> <kbd className={kbd}>Enter</kbd> to save · drop or paste files
							</span>
						)}
					</span>
				</div>
				<button type="submit" disabled={!!busy || !trimmed} className={`shrink-0 ${btnPrimary}`}>
					{busy ? BUSY_LABEL[busy] : "Add note"}
				</button>
			</div>

			{dragging && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-accent-soft/70 text-sm font-medium text-amber-900 backdrop-blur-[1px]">
					Drop files to attach
				</div>
			)}
		</form>
	);
}
