import { listNotes } from "@/lib/notes-api";
import { NewNoteForm } from "./new-note-form";
import { NoteItem } from "./note-item";

export const dynamic = "force-dynamic";

export default async function Home() {
	const notes = await listNotes();

	return (
		<main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
			<section className="mx-auto flex max-w-2xl flex-col gap-6">
				<h1 className="text-3xl font-semibold">Notes</h1>
				<NewNoteForm />
				{notes.length === 0 ? (
					<p className="text-slate-500">No notes yet.</p>
				) : (
					<ul>
						{notes.map((note) => (
							<NoteItem key={note.id} note={note} />
						))}
					</ul>
				)}
			</section>
		</main>
	);
}
