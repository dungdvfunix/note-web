import { fileSize } from "./format";

export type Attachment = {
	id: string;
	filename: string;
	contentType: string;
	size: number;
	created_at: string;
	url: string;
};

export type Note = { id: number; content: string; created_at: string; attachments: Attachment[] };
export type NotesPage = { data: Note[]; nextCursor: number | null };

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_FILES_PER_NOTE = 10;
export const ACCEPT = "image/*,video/*,audio/*,.pdf,.txt,.md,.csv,.json,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
const UPLOAD_CONCURRENCY = 3;
const BASE = "/api/notes";


let unauthorizedHandler = () => {};
export const onUnauthorized = (fn: () => void) => void (unauthorizedHandler = fn);

function toError(status: number, body: unknown): Error {
	if (status === 401) unauthorizedHandler();
	const message = (body as { error?: string } | null)?.error;
	return new Error(message ?? `Request failed (${status})`);
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});
	if (!res.ok) throw toError(res.status, await res.json().catch(() => null));
	return (res.status === 204 ? undefined : await res.json()) as T;
}


export const listNotes = (cursor?: number | null, limit = 20) => {
	const params = new URLSearchParams({ limit: String(limit) });
	if (cursor) params.set("cursor", String(cursor));
	return call<NotesPage>(`?${params}`);
};

export const createNote = (content: string) => call<Note>("", { method: "POST", body: JSON.stringify({ content }) });

export const updateNote = (id: number, content: string) =>
	call<Note>(`/${id}`, { method: "PUT", body: JSON.stringify({ content }) });

export const deleteNote = (id: number) => call<void>(`/${id}`, { method: "DELETE" });


export const deleteAttachment = (noteId: number, id: string) =>
	call<void>(`/${noteId}/attachments/${id}`, { method: "DELETE" });

export function uploadAttachment(noteId: number, file: File, onProgress?: (p: number) => void) {
	return new Promise<Attachment>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", `${BASE}/${noteId}/attachments?filename=${encodeURIComponent(file.name)}`);
		xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
		xhr.responseType = "json";
		if (onProgress) xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
		xhr.onload = () =>
			xhr.status >= 200 && xhr.status < 300
				? resolve(xhr.response as Attachment)
				: reject(toError(xhr.status, xhr.response));
		xhr.onerror = () => reject(new Error("Network error"));
		xhr.send(file);
	});
}

type UploadItem = { key: string; file: File };
type UploadCallbacks = {
	onProgress?: (key: string, progress: number) => void;
	onError?: (key: string, error: unknown) => void;
};

export async function uploadAttachments(noteId: number, items: UploadItem[], cb: UploadCallbacks = {}) {
	const queue = [...items];
	const done: Attachment[] = [];
	const worker = async () => {
		for (let item = queue.shift(); item; item = queue.shift()) {
			const { key, file } = item;
			try {
				done.push(await uploadAttachment(noteId, file, cb.onProgress && ((p) => cb.onProgress!(key, p))));
			} catch (err) {
				cb.onError?.(key, err);
			}
		}
	};
	await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker));
	return done;
}

export function checkFile(file: File): string | undefined {
	if (file.size === 0) return `${file.name} is empty`;
	if (file.size > MAX_FILE_BYTES) return `${file.name} is larger than ${fileSize(MAX_FILE_BYTES)}`;
	if (/svg|html|javascript/.test(file.type)) return `${file.name}: file type not allowed`;
}

export function partitionFiles(list: FileList | File[], existingCount: number) {
	const problems: string[] = [];
	const valid = Array.from(list).filter((f) => {
		const problem = checkFile(f);
		if (problem) problems.push(problem);
		return !problem;
	});
	const room = Math.max(MAX_FILES_PER_NOTE - existingCount, 0);
	if (valid.length > room) problems.push(`Max ${MAX_FILES_PER_NOTE} files per note`);
	return { files: valid.slice(0, room), problem: problems[0] };
}
