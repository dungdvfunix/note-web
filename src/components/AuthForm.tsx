import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { signIn, signUp } from "../auth";
import { GitHubIcon, GoogleIcon, Logo } from "./icons";

type Mode = "sign-in" | "sign-up";

const COPY = {
	"sign-in": {
		title: "Welcome back",
		subtitle: "Sign in to pick up where you left off.",
		submit: "Sign in",
		switchPrompt: "New here?",
		switchAction: "Create an account",
	},
	"sign-up": {
		title: "Create your account",
		subtitle: "Start capturing ideas in seconds.",
		submit: "Create account",
		switchPrompt: "Already have an account?",
		switchAction: "Sign in",
	},
} as const;

const PROVIDERS = [
	{ id: "google", label: "Continue with Google", Icon: GoogleIcon },
	{ id: "github", label: "Continue with GitHub", Icon: GitHubIcon },
] as const;

const input =
	"w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm shadow-card outline-none transition placeholder:text-stone-400 focus:border-accent focus:ring-4 focus:ring-accent/15";

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="flex flex-col gap-1.5">
			<span className="text-[13px] font-medium text-stone-700">{label}</span>
			{children}
		</label>
	);
}

export function AuthForm() {
	const [mode, setMode] = useState<Mode>("sign-in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string>();
	const [pending, startTransition] = useTransition();
	const isSignUp = mode === "sign-up";
	const copy = COPY[mode];

	const submit = (e: FormEvent) => {
		e.preventDefault();
		if (pending) return;
		startTransition(async () => {
			const { error } = isSignUp
				? await signUp.email({ name: name.trim() || email.split("@")[0], email, password })
				: await signIn.email({ email, password });
			setError(error ? (error.message ?? error.statusText) : undefined);
		});
	};

	const signInWith = (provider: (typeof PROVIDERS)[number]["id"]) =>
		startTransition(async () => {
			const { error } = await signIn.social({ provider, callbackURL: "/", errorCallbackURL: "/" });
			if (error) setError(error.message ?? error.statusText);
		});

	const toggle = () => {
		setMode(isSignUp ? "sign-in" : "sign-up");
		setError(undefined);
	};

	return (
		<div className="flex w-full max-w-sm flex-col items-center">
			<Logo size={44} />
			<h1 className="mt-6 text-2xl font-semibold tracking-tight">{copy.title}</h1>
			<p className="mt-1.5 text-sm text-stone-500">{copy.subtitle}</p>

			<form
				onSubmit={submit}
				className="mt-8 flex w-full flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white/80 p-6 shadow-lift backdrop-blur"
			>
				{isSignUp && (
					<Field label="Name">
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Ada Lovelace"
							autoComplete="name"
							className={input}
						/>
					</Field>
				)}
				<Field label="Email">
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
						autoComplete="email"
						className={input}
					/>
				</Field>
				<Field label="Password">
					<input
						type="password"
						required
						minLength={8}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="At least 8 characters"
						autoComplete={isSignUp ? "new-password" : "current-password"}
						className={input}
					/>
				</Field>
				{error && (
					<p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
						{error}
					</p>
				)}
				<button
					type="submit"
					disabled={pending}
					className="mt-1 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-card transition hover:bg-stone-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{pending ? "Please wait…" : copy.submit}
				</button>
				<div className="flex items-center gap-3 text-xs text-stone-400">
					<span className="h-px flex-1 bg-stone-200" />
					or
					<span className="h-px flex-1 bg-stone-200" />
				</div>
				{PROVIDERS.map(({ id, label, Icon }) => (
					<button
						key={id}
						type="button"
						onClick={() => signInWith(id)}
						disabled={pending}
						className="flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-card transition hover:bg-stone-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Icon />
						{label}
					</button>
				))}
			</form>

			<p className="mt-6 text-sm text-stone-500">
				{copy.switchPrompt}{" "}
				<button type="button" onClick={toggle} className="font-medium text-ink underline-offset-4 hover:underline">
					{copy.switchAction}
				</button>
			</p>
		</div>
	);
}
