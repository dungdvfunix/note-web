export type Note = { id: number; content: string; created_at: string };

const BASE = "/api/notes";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});
	if (!res.ok) {
		const body = (await res.json().catch(() => null)) as { error?: string } | null;
		throw new Error(body?.error ?? `Request failed (${res.status})`);
	}
	return (res.status === 204 ? undefined : await res.json()) as T;
}

export type NotesPage = { data: Note[]; nextCursor: number | null };

/** Newest first. Pass the previous page's `nextCursor` to get the next page. */
export const listNotes = (cursor?: number | null, limit = 20) => {
	const params = new URLSearchParams({ limit: String(limit) });
	if (cursor) params.set("cursor", String(cursor));
	return call<NotesPage>(`?${params}`);
};

export const createNote = (content: string) =>
	call<Note>("", { method: "POST", body: JSON.stringify({ content }) });

export const updateNote = (id: number, content: string) =>
	call<Note>(`/${id}`, { method: "PUT", body: JSON.stringify({ content }) });

export const deleteNote = (id: number) => call<void>(`/${id}`, { method: "DELETE" });
