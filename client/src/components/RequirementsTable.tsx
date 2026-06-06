import { formatScore, groupRequirements, uniqueSorted } from "@/lib/majors";
import type { AdmissionRequirement } from "@/types";

interface RequirementsTableProps {
	requirements: AdmissionRequirement[];
}

/**
 * Year × combo grid of điểm chuẩn, grouped by exam type. Combos sharing the same
 * per-year score signature merge into one column.
 */
export const RequirementsTable = ({ requirements }: RequirementsTableProps) => {
	if (requirements.length === 0) return null;

	const byType = groupRequirements(requirements);
	const examTypes = Object.keys(byType).sort();

	return (
		<div className="space-y-3 mt-3">
			{examTypes.map((examType) => {
				const reqs = byType[examType];
				const years = uniqueSorted(reqs.map((r) => r.year)).reverse();
				const combos = uniqueSorted(
					reqs.map((r) => r.subjectCombination ?? ""),
				).filter(Boolean);

				// Build lookup: year → combo → score (null = chưa công bố điểm).
				// Combos are columns and years are rows, matching how schools publish
				// điểm chuẩn (tổ hợp across the top, one score line per year).
				const lookup: Record<number, Record<string, number | null>> = {};
				for (const r of reqs) {
					const key = r.subjectCombination ?? "";
					(lookup[r.year] ??= {})[key] = r.score;
				}

				const hasCombos = combos.length > 0;

				// Merge combos that share the same score across every displayed year into
				// one column (e.g. UIT, where A00/A01/D01/D07 all carry the same điểm chuẩn
				// each year). The per-year signature includes nulls, so a combo missing some
				// years (X06/X26) stays its own column instead of falsely merging.
				const groups: string[][] = [];
				if (hasCombos) {
					const bySig = new Map<string, string[]>();
					for (const combo of combos) {
						const sig = years
							.map((y) => {
								const s = lookup[y]?.[combo];
								return s == null ? "·" : String(s);
							})
							.join("|");
						const existing = bySig.get(sig);
						if (existing) {
							existing.push(combo);
						} else {
							const arr = [combo];
							bySig.set(sig, arr);
							groups.push(arr);
						}
					}
				}

				return (
					<div key={examType}>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
							{examType === "THPTQG" ? "Tốt nghiệp THPT" : "Đánh giá năng lực"}
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
												colSpan={groups.length}
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
											{groups.map((g) => (
												<th
													key={g.join(",")}
													className="border-b border-l border-border px-3 py-1.5 text-center font-mono font-medium text-muted-foreground"
												>
													<div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5">
														{g.map((c) => (
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
											<td className="px-3 py-2 text-center font-medium text-foreground tabular-nums">
												{y}
											</td>
											{hasCombos ? (
												groups.map((g) => {
													const s = lookup[y]?.[g[0]];
													return (
														<td
															key={g.join(",")}
															className="border-l border-border px-3 py-2 text-center tabular-nums text-foreground"
														>
															{s != null ? formatScore(s) : "—"}
														</td>
													);
												})
											) : (
												<td className="border-l border-border px-3 py-2 text-center tabular-nums text-foreground">
													{lookup[y]?.[""] != null
														? formatScore(lookup[y][""])
														: "—"}
												</td>
											)}
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
