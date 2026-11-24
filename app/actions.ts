"use server";

import { revalidatePath } from "next/cache";
import { createNote, deleteNote, updateNote } from "@/lib/notes-api";

export type ActionResult = { error?: string };

async function mutate(fn: () => Promise<unknown>): Promise<ActionResult> {
	try {
		await fn();
	} catch (e) {
		return { error: e instanceof Error ? e.message : String(e) };
	}
	revalidatePath("/");
	return {};
}

export async function createNoteAction(_prev: ActionResult, formData: FormData) {
	const content = String(formData.get("content") ?? "").trim();
	if (!content) return { error: "content is required" };
	return mutate(() => createNote(content));
}

export async function updateNoteAction(id: number, content: string) {
	return mutate(() => updateNote(id, content));
}

export async function deleteNoteAction(id: number) {
	return mutate(() => deleteNote(id));
}
