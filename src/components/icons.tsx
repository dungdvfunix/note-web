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
