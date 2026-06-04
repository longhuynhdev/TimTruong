import { useState } from "react";
import { cn } from "@/lib/utils";

interface UniversityLogoProps {
	name: string;
	imageUrl: string | null;
	/** Classes for the square wrapper (size + padding, e.g. "w-20 h-20 p-3"). */
	className?: string;
	/** Classes for the fallback initial letter (e.g. "text-base font-semibold"). */
	fallbackClassName?: string;
}

/**
 * University logo with a graceful fallback to the name's initial — used by the
 * search results, listing cards, and the detail header. Falls back when there's
 * no image URL or the image fails to load.
 */
export function UniversityLogo({
	name,
	imageUrl,
	className,
	fallbackClassName,
}: UniversityLogoProps) {
	const [failed, setFailed] = useState(false);

	return (
		<div
			className={cn(
				"rounded-xl bg-card dark:bg-[#181818] border border-border/70 flex items-center justify-center overflow-hidden",
				className,
			)}
		>
			{imageUrl && !failed ? (
				<img
					src={imageUrl}
					alt={`Logo ${name}`}
					className="w-full h-full object-contain"
					onError={() => setFailed(true)}
				/>
			) : (
				<span
					className={cn("font-medium text-muted-foreground", fallbackClassName)}
				>
					{name.charAt(0)}
				</span>
			)}
		</div>
	);
}
