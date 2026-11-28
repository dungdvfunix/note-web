import { memo, useState, useTransition, type KeyboardEvent } from "react";
import {
	deleteAttachment,
	deleteNote,
	MAX_FILES_PER_NOTE,
	partitionFiles,
	updateNote,
	uploadAttachments,
	type Attachment,
	type Note,
} from "../api";
import { errorMessage, fullDate, isSubmitShortcut, parseDate, relativeTime } from "../format";
import { dangerHover, iconBtnSm } from "../ui";
import { AttachmentList } from "./Attachments";
import { PaperclipIcon, PenIcon, TrashIcon } from "./icons";
import { AttachButton } from "./PendingFiles";

type Props = {
	note: Note;
	onChange: (id: number, patch: (note: Note) => Note) => void;
	onDeleted: (id: number) => void;
};

const textBtn = "rounded-md px-2.5 py-1 text-xs font-medium transition disabled:opacity-40";

export const NoteItem = memo(function NoteItem({ note, onChange, onDeleted }: Props) {
	const [editing, setEditing] = useState(false);
	const [text, setText] = useState(note.content);
	const [error, setError] = useState<string>();
	const [pending, startTransition] = useTransition();
	const created = parseDate(note.created_at);

	const run = (action: () => Promise<void>) =>
		startTransition(async () => {
			try {
				await action();
				setError(undefined);
			} catch (e) {
				setError(errorMessage(e));
			}
		});

	const save = () => {
		const content = text.trim();
		if (!content) return;
		run(async () => {
			const updated = await updateNote(note.id, content);
			setEditing(false);
			onChange(note.id, () => updated);
		});
	};

	const cancel = () => {
		setEditing(false);
		setText(note.content);
		setError(undefined);
	};

	const remove = () => {
		if (!confirm("Delete this note?")) return;
		run(async () => {
			await deleteNote(note.id);
			onDeleted(note.id);
		});
	};

	const removeAttachment = (a: Attachment) =>
		run(async () => {
			await deleteAttachment(note.id, a.id);
			onChange(note.id, (n) => ({ ...n, attachments: n.attachments.filter((x) => x.id !== a.id) }));
		});

	const addAttachments = (list: FileList) => {
		const { files, problem } = partitionFiles(list, note.attachments.length);
		setError(problem);
		if (files.length === 0) return;
		run(async () => {
			let failed = 0;
			const added = await uploadAttachments(
				note.id,
				files.map((file) => ({ key: file.name, file })),
				{ onError: () => failed++ },
			);
			if (added.length) onChange(note.id, (n) => ({ ...n, attachments: [...n.attachments, ...added] }));
			if (failed) throw new Error(`${failed} file${failed > 1 ? "s" : ""} failed to upload`);
		});
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (isSubmitShortcut(e)) save();
		if (e.key === "Escape") cancel();
	};

	return (
		<li
			className={`group mb-4 flex break-inside-avoid flex-col rounded-xl border bg-white p-4 shadow-card transition ${
				editing ? "border-accent/60 ring-4 ring-accent/10" : "border-stone-200/80 hover:shadow-lift"
			} ${pending ? "opacity-60" : ""}`}
		>
			{editing ? (
				<textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={onKeyDown}
					aria-label="Edit note"
					autoFocus
					className="field-sizing-content block max-h-96 min-h-24 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none"
				/>
			) : (
				<p
					onDoubleClick={() => setEditing(true)}
					className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-stone-800"
				>
					{note.content}
				</p>
			)}

			<AttachmentList items={note.attachments} onRemove={editing ? removeAttachment : undefined} busy={pending} />

			{error && <p className="mt-2 text-xs text-red-600">{error}</p>}

			<div className="mt-3 flex h-7 items-center justify-between gap-2">
				<time dateTime={created.toISOString()} title={fullDate(created)} className="text-xs text-stone-400">
					{relativeTime(created)}
				</time>
				{editing ? (
					<div className="flex gap-1">
						<AttachButton
							onFiles={addAttachments}
							disabled={pending || note.attachments.length >= MAX_FILES_PER_NOTE}
							className={iconBtnSm}
							label="Attach files"
						>
							<PaperclipIcon width={14} height={14} />
						</AttachButton>
						<button onClick={cancel} className={`${textBtn} text-stone-500 hover:bg-stone-100 hover:text-ink`}>
							Cancel
						</button>
						<button
							onClick={save}
							disabled={pending || !text.trim()}
							className={`${textBtn} bg-ink text-white hover:bg-stone-800`}
						>
							Save
						</button>
					</div>
				) : (
					<div className="flex gap-0.5 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
						<button onClick={() => setEditing(true)} className={iconBtnSm} aria-label="Edit note" title="Edit">
							<PenIcon width={14} height={14} />
						</button>
						<button
							onClick={remove}
							disabled={pending}
							className={`${iconBtnSm} ${dangerHover}`}
							aria-label="Delete note"
							title="Delete"
						>
							<TrashIcon width={14} height={14} />
						</button>
					</div>
				)}
			</div>
		</li>
	);
});
