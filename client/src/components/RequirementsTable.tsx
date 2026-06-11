import { ExternalLink } from "lucide-react";
import { buildScoreSeries, formatScore } from "@/lib/majors";
import type { AdmissionRequirement } from "@/types";

interface RequirementsTableProps {
	requirements: AdmissionRequirement[];
}

const examTypeLabel = (examType: string) =>
	examType === "THPTQG" ? "Tốt nghiệp THPT" : "Đánh giá năng lực";

/**
 * Year × combo grid of điểm chuẩn, grouped by exam type. Combos sharing the same
 * per-year score signature merge into one column (see `buildScoreSeries`, shared with
 * the trend chart so columns and lines always agree).
 */
export const RequirementsTable = ({ requirements }: RequirementsTableProps) => {
	if (requirements.length === 0) return null;

	const blocks = buildScoreSeries(requirements);

	// Nguồn công bố điểm chuẩn theo (examType, year) — các dòng cùng trường-năm
	// thường chung một link, lấy link đầu tiên có giá trị.
	const sourceByTypeYear = new Map<string, string>();
	for (const r of requirements) {
		const key = `${r.examType}|${r.year}`;
		if (r.sourceUrl && !sourceByTypeYear.has(key)) {
			sourceByTypeYear.set(key, r.sourceUrl);
		}
	}

	return (
		<div className="space-y-3 mt-3">
			{blocks.map((block) => {
				// Years descending — schools publish điểm chuẩn newest-first.
				const years = [...block.years].reverse();
				const hasCombos = block.series.some((s) => s.combos.length > 0);
				// Per-series year → score lookup for cell rendering.
				const scoreByYear = block.series.map(
					(s) => new Map(s.points.map((p) => [p.year, p.score])),
				);

				return (
					<div key={block.examType}>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
							{examTypeLabel(block.examType)}
						</p>
						<div className="overflow-x-auto rounded-md border border-border">
							<table className="w-full border-collapse text-xs">
								<thead>
									<tr className="bg-muted/40">
										<th
											rowSpan={hasCombos ? 2 : 1}
											className="border-b border-border px-3 py-2 text-center align-middle font-medium text-muted-foreground w-16"
										>
											Năm
										</th>
										{hasCombos ? (
											<th
												colSpan={block.series.length}
												className="border-b border-l border-border px-3 py-1.5 text-center font-medium text-muted-foreground"
											>
												Tổ hợp xét tuyển
											</th>
										) : (
											<th className="border-b border-l border-border px-3 py-2 text-center font-medium text-muted-foreground">
												Điểm chuẩn
											</th>
										)}
									</tr>
									{hasCombos && (
										<tr className="bg-muted/40">
											{block.series.map((s) => (
												<th
													key={s.combos.join(",")}
													className="border-b border-l border-border px-3 py-1.5 text-center font-mono font-medium text-muted-foreground"
												>
													<div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5">
														{s.combos.map((c) => (
															<span key={c}>{c}</span>
														))}
													</div>
												</th>
											))}
										</tr>
									)}
								</thead>
								<tbody>
									{years.map((y) => (
										<tr
											key={y}
											className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
										>
											<td className="px-3 py-2 text-center font-medium text-foreground tabular-nums whitespace-nowrap">
												{y}
												{sourceByTypeYear.has(`${block.examType}|${y}`) && (
													<a
														href={sourceByTypeYear.get(
															`${block.examType}|${y}`,
														)}
														target="_blank"
														rel="noopener noreferrer"
														title="Nguồn công bố điểm chuẩn"
														className="ml-1 inline-flex align-middle text-muted-foreground hover:text-primary"
													>
														<ExternalLink className="h-3 w-3" />
													</a>
												)}
											</td>
											{block.series.map((s, i) => {
												const score = scoreByYear[i].get(y);
												return (
													<td
														key={s.combos.join(",") || "_"}
														className="border-l border-border px-3 py-2 text-center tabular-nums text-foreground"
													>
														{score != null ? formatScore(score) : "—"}
													</td>
												);
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				);
			})}
		</div>
	);
};
