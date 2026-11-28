import type { SVGProps } from "react";

const base = {
	width: 16,
	height: 16,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": true,
} as const;

export const PenIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="M12 20h9" />
		<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
	</svg>
);

export const TrashIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="M3 6h18" />
		<path d="M8 6V4h8v2" />
		<path d="M19 6l-1 14H6L5 6" />
	</svg>
);

export const LogOutIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<path d="m16 17 5-5-5-5" />
		<path d="M21 12H9" />
	</svg>
);

export function Logo({ size = 32 }: { size?: number }) {
	return (
		<span
			className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-accent text-ink shadow-card"
			style={{ width: size, height: size }}
		>
			<PenIcon width={size * 0.5} height={size * 0.5} strokeWidth={2.4} />
		</span>
	);
}

export const PaperclipIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
	</svg>
);

export const XIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);

export const DownloadIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<path d="m7 10 5 5 5-5" />
		<path d="M12 15V3" />
	</svg>
);

export const ExternalIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="M15 3h6v6" />
		<path d="M10 14 21 3" />
		<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
	</svg>
);

export const MinusIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="M5 12h14" />
	</svg>
);

export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...p}>
		<path d="M12 5v14" />
		<path d="M5 12h14" />
	</svg>
);

export const GitHubIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
		<path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
	</svg>
);

export const GoogleIcon = (p: SVGProps<SVGSVGElement>) => (
	<svg width={16} height={16} viewBox="0 0 24 24" aria-hidden {...p}>
		<path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z" />
		<path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z" />
		<path fill="#FBBC05" d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z" />
		<path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z" />
	</svg>
);
