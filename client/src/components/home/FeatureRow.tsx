import { ArrowRight } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export interface FeatureRowProps
	extends Omit<React.ComponentProps<"div">, "title"> {
	/** Small mint uppercase label above the title (optional). */
	eyebrow?: React.ReactNode;
	/** Feature name. */
	title: React.ReactNode;
	/** What the feature does (muted body copy). */
	description?: React.ReactNode;
	/** Optional mint text CTA (renders with a trailing arrow). */
	cta?: React.ReactNode;
	/** Click handler for the CTA. */
	onCtaClick?: () => void;
	/** Flip the media to the opposite side on wide screens. @default false */
	reverse?: boolean;
	/** The visual — an <img>/GIF or a product vignette — as children. */
	children?: React.ReactNode;
}

/**
 * One marketing feature row, split two-up: title + description (+ optional CTA)
 * on one side, a visual (illustration / GIF / product vignette) on the other.
 * Pass `reverse` on alternating rows to flip the visual to the opposite side
 * for the classic zig-zag rhythm. The visual is the row's children. Stacks
 * (text above visual) on narrow screens.
 */
export function FeatureRow({
	eyebrow,
	title,
	description,
	cta,
	onCtaClick,
	reverse = false,
	className,
	children,
	...props
}: FeatureRowProps) {
	return (
		<div
			className={cn(
				"grid grid-cols-1 items-center gap-7 py-11 md:grid-cols-2 md:gap-[72px] md:py-14",
				className,
			)}
			{...props}
		>
			<div className={cn("flex flex-col", reverse && "md:order-2")}>
				{eyebrow && (
					<p className="mb-3 text-xs font-semibold uppercase tracking-[0.07em] text-primary">
						{eyebrow}
					</p>
				)}
				<h3 className="text-balance text-[clamp(1.375rem,2.6vw,1.875rem)] font-semibold leading-tight text-foreground">
					{title}
				</h3>
				{description && (
					<p className="mt-3.5 max-w-[46ch] text-pretty text-base leading-relaxed text-muted-foreground">
						{description}
					</p>
				)}
				{cta && (
					<button
						type="button"
						onClick={onCtaClick}
						className="group mt-5 inline-flex w-fit items-center gap-1.5 text-base font-medium text-primary hover:underline"
					>
						{cta}
						<ArrowRight className="size-[1em] transition-transform group-hover:translate-x-[3px]" />
					</button>
				)}
			</div>
			<div
				className={cn(
					"flex min-w-0 items-center justify-center [&>*]:w-full [&>*]:max-w-[440px]",
					reverse && "md:order-1",
				)}
			>
				{children}
			</div>
		</div>
	);
}
