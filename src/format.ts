const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const full = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export function parseDate(value: string): Date {
	const iso = value.includes("T") ? value : value.replace(" ", "T");
	return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
}

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 31536000],
	["month", 2592000],
	["week", 604800],
	["day", 86400],
	["hour", 3600],
	["minute", 60],
];

export function relativeTime(date: Date, now = Date.now()): string {
	const diff = (date.getTime() - now) / 1000;
	for (const [unit, secs] of steps) {
		if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
	}
	return "just now";
}

export const fullDate = (date: Date) => full.format(date);

export function fileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileExt(name: string): string {
	const ext = name.includes(".") ? name.split(".").pop()! : "";
	return ext.slice(0, 4).toUpperCase() || "FILE";
}

export type FileKind = "image" | "video" | "audio" | "pdf" | "sheet" | "doc" | "slides" | "file";

const KINDS: [RegExp, FileKind][] = [
	[/^image\/(png|jpeg|gif|webp|avif)$/, "image"],
	[/^video\//, "video"],
	[/^audio\//, "audio"],
	[/^application\/pdf$/, "pdf"],
	[/sheet|excel|csv/, "sheet"],
	[/word|wordprocessing/, "doc"],
	[/presentation|powerpoint/, "slides"],
];

export const fileKind = (contentType: string): FileKind => KINDS.find(([re]) => re.test(contentType))?.[1] ?? "file";

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

export const isSubmitShortcut = (e: { key: string; metaKey: boolean; ctrlKey: boolean }) =>
	e.key === "Enter" && (e.metaKey || e.ctrlKey);
