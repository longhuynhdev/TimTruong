import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Ranking } from "@/types";

// Display order for ranking systems (domestic VNUR first, then international).
const SYSTEM_ORDER = ["VNUR", "QS", "THE", "CWUR"];

// Scope of each ranking system. Derived from the system because each list we load
// has a single, fixed scope (VNUR = trong nước; QS/THE/CWUR = quốc tế). If a system
// ever gains multiple scopes (e.g. QS Asia), promote this to a stored column.
const SYSTEM_SCOPE: Record<string, string> = {
	VNUR: "toàn quốc",
	QS: "thế giới",
	THE: "thế giới",
	CWUR: "thế giới",
};

/** Số hạng dạng người đọc: "Top 2" | "Hạng 1367" | "Hạng 801–1000" | "Hạng 1501+". */
function rankNumber(r: Ranking): string {
	if (r.rankTo == null) return `Hạng ${r.rankFrom}+`; // band mở
	if (r.rankTo === r.rankFrom)
		// hạng đơn — "Top N" cho hạng cao, "Hạng N" cho số lớn (đỡ gượng)
		return r.rankFrom <= 100 ? `Top ${r.rankFrom}` : `Hạng ${r.rankFrom}`;
	return `Hạng ${r.rankFrom}–${r.rankTo}`; // band đóng
}

/** Câu đầy đủ kèm phạm vi: "Top 2 toàn quốc" | "Hạng 801–1000 thế giới". */
export function rankSentence(r: Ranking): string {
	const scope = SYSTEM_SCOPE[r.system];
	return scope ? `${rankNumber(r)} ${scope}` : rankNumber(r);
}

/** Keep only the most recent year per system, ordered by SYSTEM_ORDER. */
export function latestPerSystem(rankings: Ranking[]): Ranking[] {
	const best = new Map<string, Ranking>();
	for (const r of rankings) {
		const cur = best.get(r.system);
		if (!cur || r.year > cur.year) best.set(r.system, r);
	}
	return [...best.values()].sort(
		(a, b) =>
			(SYSTEM_ORDER.indexOf(a.system) + 1 || 99) -
			(SYSTEM_ORDER.indexOf(b.system) + 1 || 99),
	);
}

/** Compact ranking badges (latest year per system) — used on cards. */
export function RankingBadges({
	rankings,
	className,
}: {
	rankings: Ranking[];
	className?: string;
}) {
	const items = latestPerSystem(rankings ?? []);
	if (items.length === 0) return null;

	return (
		<div
			className={cn(
				// Một hàng, cuộn ngang khi tràn (ẩn thanh cuộn) — tránh xuống dòng trên card.
				"flex flex-nowrap gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				className,
			)}
		>
			{items.map((r) => (
				<Badge
					key={r.system}
					variant="outline"
					className="text-xs border-amber-300/70 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
					title={`${r.system} · ${rankSentence(r)} (${r.year})`}
				>
					<Award className="h-3 w-3" />
					<span className="font-semibold">{r.system}</span>
					<span className="font-normal">{rankSentence(r)}</span>
				</Badge>
			))}
		</div>
	);
}
