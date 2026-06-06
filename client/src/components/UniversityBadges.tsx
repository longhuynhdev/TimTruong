import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UniversityListItem } from "@/types";

/**
 * Attribute badges for a university (loại trường, tự chủ tài chính, ký túc xá).
 * Shared by the list card and the detail page so labels stay in sync.
 * Dormitory badges are opt-in (`showDormitory`) — the detail page surfaces KTX
 * in its own tab, so it leaves them off.
 */
export function UniversityBadges({
	university: u,
	showDormitory = false,
	className,
}: {
	university: UniversityListItem;
	showDormitory?: boolean;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-wrap gap-1.5", className)}>
			<Badge variant="outline" className="text-xs border-border">
				{u.type === "Public" ? "Trường công lập" : "Trường tư thục"}
			</Badge>
			{u.isFinanciallyAutonomous === true && (
				<Badge variant="outline" className="text-xs border-border">
					Đã tự chủ tài chính
				</Badge>
			)}
			{u.isFinanciallyAutonomous === false && (
				<Badge
					variant="outline"
					className="text-xs border-border text-muted-foreground"
				>
					Chưa tự chủ tài chính
				</Badge>
			)}
			{showDormitory && u.hasDormitory === true && (
				<Badge variant="outline" className="text-xs border-border">
					Có ký túc xá
				</Badge>
			)}
			{showDormitory && u.hasDormitory === false && (
				<Badge
					variant="outline"
					className="text-xs border-border text-muted-foreground"
				>
					Không có ký túc xá
				</Badge>
			)}
		</div>
	);
}
