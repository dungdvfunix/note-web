// Shared Tailwind class sets. Kept as full literal strings so Tailwind can see every class.

export const btnPrimary =
	"rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400";

export const btnGhost =
	"inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-ink disabled:opacity-40";

/** Square icon button without a display class, so callers can pick `inline-flex` or `hidden sm:inline-flex`. */
const iconBtnBase =
	"items-center justify-center text-stone-500 transition hover:bg-stone-100 hover:text-ink disabled:opacity-30";
export const iconBtnSm = `inline-flex size-7 rounded-md ${iconBtnBase}`;
export const iconBtnMd = `size-8 rounded-lg ${iconBtnBase}`; // add inline-flex / hidden sm:inline-flex

export const dangerHover = "hover:bg-red-50 hover:text-red-600";

export const masonry = "columns-1 gap-4 sm:columns-2 lg:columns-3";
