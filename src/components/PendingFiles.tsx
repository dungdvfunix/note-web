import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACCEPT } from "../api";
import { fileKind, fileSize } from "../format";
import { FileBadge } from "./FileBadge";
import { XIcon } from "./icons";

export type PendingFile = { key: string; file: File; progress?: number; error?: string };

export function AttachButton({
	onFiles,
	disabled,
	className,
	children,
	label,
}: {
	onFiles: (files: FileList) => void;
	disabled?: boolean;
	className: string;
	children: ReactNode;
	label?: string;
}) {
	const input = useRef<HTMLInputElement>(null);
	return (
		<>
			<button
				type="button"
				onClick={() => input.current?.click()}
				disabled={disabled}
				className={className}
				aria-label={label}
				title={label}
			>
				{children}
			</button>
			<input
				ref={input}
				type="file"
				multiple
				accept={ACCEPT}
				hidden
				onChange={(e) => {
					if (e.target.files?.length) onFiles(e.target.files);
					e.target.value = "";
				}}
			/>
		</>
	);
}

export function PendingFiles({
	items,
	onRemove,
	uploading,
}: {
	items: PendingFile[];
	onRemove: (key: string) => void;
	uploading: boolean;
}) {
	if (items.length === 0) return null;
	return (
		<ul className="flex flex-wrap gap-2 px-2 pt-2">
			{items.map((p) => (
				<li
					key={p.key}
					className={`relative flex w-44 items-center gap-2 overflow-hidden rounded-lg border bg-white p-1.5 pr-7 ${
						p.error ? "border-red-200 bg-red-50" : "border-stone-200"
					}`}
					title={p.error ?? p.file.name}
				>
					<Thumb file={p.file} />
					<div className="min-w-0">
						<p className="truncate text-xs font-medium text-stone-800">{p.file.name}</p>
						<p className={`truncate text-[11px] ${p.error ? "text-red-600" : "text-stone-400"}`}>
							{p.error ?? fileSize(p.file.size)}
						</p>
					</div>
					{!uploading && (
						<button
							type="button"
							onClick={() => onRemove(p.key)}
							className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded text-stone-400 hover:bg-stone-100 hover:text-ink"
							aria-label={`Remove ${p.file.name}`}
						>
							<XIcon width={12} height={12} />
						</button>
					)}
					{p.progress !== undefined && !p.error && (
						<span
							className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transition-[width]"
							style={{ width: `${Math.round(p.progress * 100)}%` }}
						/>
					)}
				</li>
			))}
		</ul>
	);
}

function Thumb({ file }: { file: File }) {
	const isImage = fileKind(file.type) === "image";
	const [url, setUrl] = useState<string>();
	useEffect(() => {
		if (!isImage) return;
		const u = URL.createObjectURL(file);
		setUrl(u);
		return () => URL.revokeObjectURL(u);
	}, [file, isImage]);

	return isImage && url ? (
		<img src={url} alt="" className="size-9 shrink-0 rounded-md object-cover" />
	) : (
		<FileBadge name={file.name} type={file.type} />
	);
}
