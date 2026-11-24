const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const full = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

// D1/SQLite CURRENT_TIMESTAMP is "YYYY-MM-DD HH:MM:SS" in UTC without a zone marker.
export function parseDate(value: string): Date {
	const iso = value.includes("T") ? value : value.replace(" ", "T");
	return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
}

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 31536000],
	["month", 2592000],
	["week", 604800],
	["day", 86400],
	["hour", 3600],
	["minute", 60],
];

export function relativeTime(date: Date, now = Date.now()): string {
	const diff = (date.getTime() - now) / 1000;
	for (const [unit, secs] of steps) {
		if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
	}
	return "just now";
}

export const fullDate = (date: Date) => full.format(date);
