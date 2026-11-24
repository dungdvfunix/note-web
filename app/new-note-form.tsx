"use client";

import { useActionState, useEffect, useRef } from "react";
import { createNoteAction } from "./actions";

export function NewNoteForm() {
	const [state, action, pending] = useActionState(createNoteAction, {});
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (!pending && !state.error) formRef.current?.reset();
	}, [pending, state]);

	return (
		<form ref={formRef} action={action} className="flex flex-col gap-2">
			<div className="flex gap-2">
				<input
					name="content"
					placeholder="Write a note..."
					aria-label="New note"
					required
					className="flex-1 rounded-md border border-slate-300 px-3 py-2"
				/>
				<button
					type="submit"
					disabled={pending}
					className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
				>
					Add
				</button>
			</div>
			{state.error && <p className="text-sm text-red-600">{state.error}</p>}
		</form>
	);
}
