import { signOut } from "../auth";
import { btnGhost } from "../ui";
import { Logo, LogOutIcon } from "./icons";

export function TopBar({ name, email }: { name: string; email: string }) {
	return (
		<header className="sticky top-0 z-10 border-b border-stone-200/70 bg-paper/80 backdrop-blur">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
				<div className="flex items-center gap-2.5">
					<Logo size={28} />
					<span className="font-semibold tracking-tight">Notes</span>
				</div>
				<div className="flex items-center gap-1">
					<div className="flex items-center gap-2.5 rounded-lg px-2 py-1" title={email}>
						<span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-amber-800">
							{name.trim().charAt(0).toUpperCase()}
						</span>
						<span className="hidden max-w-40 truncate text-sm font-medium text-stone-700 sm:block">{name}</span>
					</div>
					<button onClick={() => signOut()} className={btnGhost}>
						<LogOutIcon width={14} height={14} />
						<span className="hidden sm:inline">Sign out</span>
					</button>
				</div>
			</div>
		</header>
	);
}
