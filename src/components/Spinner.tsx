export function Spinner({ light = false }: { light?: boolean }) {
	return (
		<span
			role="status"
			aria-label="Loading"
			className={`size-6 animate-spin rounded-full border-2 ${light ? "border-white/40 border-t-white" : "border-stone-300 border-t-accent"}`}
		/>
	);
}
