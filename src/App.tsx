import { useSession } from "./auth";
import { AuthForm } from "./components/AuthForm";
import { NewNoteForm } from "./components/NewNoteForm";
import { NotesList } from "./components/NotesList";
import { TopBar } from "./components/TopBar";
import { useNotes } from "./hooks/useNotes";

export function App() {
	const { data: session, isPending } = useSession();

	if (isPending) return <div className="min-h-screen" aria-busy />;

	if (!session)
		return (
			<main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_1px_1px,rgb(28_27_25/0.07)_1px,transparent_0)] bg-size-[22px_22px] px-4 py-16">
				<AuthForm />
			</main>
		);

	const { user } = session;
	return <NotesPage key={user.id} name={user.name || user.email} email={user.email} />;
}

function NotesPage({ name, email }: { name: string; email: string }) {
	const notes = useNotes();

	return (
		<div className="min-h-screen">
			<TopBar name={name} email={email} />
			<main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
				<section className="mx-auto w-full max-w-2xl">
					<h1 className="mb-1 text-2xl font-semibold tracking-tight">Hi, {name.split(" ")[0]}</h1>
					<p className="mb-5 text-sm text-stone-500">What's on your mind today?</p>
					<NewNoteForm onCreated={notes.add} />
				</section>

				{notes.error && (
					<div
						role="alert"
						className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
					>
						<span>{notes.error}</span>
						<button onClick={notes.reload} className="font-medium underline-offset-2 hover:underline">
							Retry
						</button>
					</div>
				)}

				<NotesList {...notes} />
			</main>
		</div>
	);
}
