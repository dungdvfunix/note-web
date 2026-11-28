import { fileExt, fileKind, type FileKind } from "../format";

const TONE: Record<FileKind, string> = {
	pdf: "bg-red-50 text-red-700",
	sheet: "bg-emerald-50 text-emerald-700",
	doc: "bg-sky-50 text-sky-700",
	slides: "bg-orange-50 text-orange-700",
	audio: "bg-violet-50 text-violet-700",
	video: "bg-violet-50 text-violet-700",
	image: "bg-stone-100 text-stone-600",
	file: "bg-stone-100 text-stone-600",
};

/** Colored tile with the file extension; color hints the kind of document. */
export function FileBadge({ name, type, compact = false }: { name: string; type: string; compact?: boolean }) {
	return (
		<span
			className={`inline-flex shrink-0 items-center justify-center font-bold tracking-wide ${TONE[fileKind(type)]} ${
				compact ? "h-6 rounded px-1.5 text-[10px]" : "size-9 rounded-lg text-[10px]"
			}`}
		>
			{fileExt(name)}
		</span>
	);
}
