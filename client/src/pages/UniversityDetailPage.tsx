import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import PageMetadata from "@/components/PageMetadata";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchUniversityById, fetchUniversityMajors } from "@/services/api";
import type {
	AdmissionRequirement,
	MajorWithRequirements,
	UniversityListItem,
	UniversityMajors,
} from "@/types";
import { cn } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatScore(score: number): string {
	return score % 1 === 0 ? score.toFixed(0) : score.toFixed(2).replace(/\.?0+$/, "");
}

function formatTuition(fee: number): string {
	if (fee >= 1_000_000) {
		const millions = fee / 1_000_000;
		return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} triệu đồng/năm`;
	}
	return fee.toLocaleString("vi-VN") + " đồng/năm";
}

/** Group requirements by examType, then build a year × combo grid */
function groupRequirements(reqs: AdmissionRequirement[]) {
	const byType: Record<string, AdmissionRequirement[]> = {};
	for (const r of reqs) {
		(byType[r.examType] ??= []).push(r);
	}
	return byType;
}

function uniqueSorted<T>(arr: T[]): T[] {
	return [...new Set(arr)].sort() as T[];
}

// ─── sub-components ───────────────────────────────────────────────────────────

const UniversityInfoCard = ({ university: u }: { university: UniversityListItem }) => (
	<Card className="border-border bg-card shadow-sm">
		<CardContent className="p-6">
			<div className="flex flex-col sm:flex-row gap-5">
				{/* Logo */}
				<div className="flex-shrink-0 flex sm:items-start">
					<div className="w-20 h-20 rounded-xl bg-card dark:bg-[#181818] border border-border/70 flex items-center justify-center overflow-hidden p-3">
						{u.imageUrl ? (
							<img
								src={u.imageUrl}
								alt={`${u.name} logo`}
								className="w-full h-full object-contain"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = "none";
									const parent = target.parentElement;
									if (parent) {
										parent.innerHTML = `<span class="text-base font-semibold text-muted-foreground">${u.name.charAt(0)}</span>`;
									}
								}}
							/>
						) : (
							<span className="text-base font-semibold text-muted-foreground">
								{u.name.charAt(0)}
							</span>
						)}
					</div>
				</div>

				{/* Details */}
				<div className="flex-1 min-w-0 space-y-3">
					<div>
						<h1 className="text-xl font-bold text-foreground leading-snug">
							{u.name}
						</h1>
						{(u.shortName || u.englishName) && (
							<p className="text-sm text-muted-foreground mt-0.5">
								{[u.shortName, u.englishName].filter(Boolean).join(" · ")}
							</p>
						)}
						<p className="text-xs text-muted-foreground mt-1">
							Mã trường:{" "}
							<span className="font-mono font-medium text-foreground">
								{u.code}
							</span>
						</p>
					</div>

					<div className="flex flex-wrap gap-1.5">
						<Badge variant="outline" className="text-xs border-border">
							{u.type === "Public" ? "Trường công" : "Trường tư"}
						</Badge>
						<Badge
							variant="outline"
							className={cn(
								"text-xs border-border",
								!u.isFinanciallyAutonomous && "text-muted-foreground",
							)}
						>
							{u.isFinanciallyAutonomous
								? "Tự chủ tài chính"
								: "Chưa tự chủ tài chính"}
						</Badge>
					</div>

					{u.campuses.length > 0 && (
						<div className="flex items-start gap-1.5">
							<span className="text-muted-foreground mt-px text-xs">📍</span>
							<p className="text-sm text-muted-foreground">
								{u.campuses
									.map((c) =>
										[c.district, c.city].filter(Boolean).join(", "),
									)
									.join(" · ")}
							</p>
						</div>
					)}
				</div>
			</div>
		</CardContent>
	</Card>
);

const RequirementsTable = ({
	requirements,
}: {
	requirements: AdmissionRequirement[];
}) => {
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

				// Build lookup: combo → year → score
				const lookup: Record<string, Record<number, number>> = {};
				for (const r of reqs) {
					const key = r.subjectCombination ?? "";
					(lookup[key] ??= {})[r.year] = r.score;
				}

				const hasCombos = combos.length > 0;

				return (
					<div key={examType}>
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
							{examType === "THPTQG" ? "Tốt nghiệp THPT" : "Đánh giá năng lực"}
						</p>
						<div className="overflow-x-auto rounded-md border border-border">
							<table className="w-full text-xs">
								<thead>
									<tr className="bg-muted/40">
										{hasCombos && (
											<th className="px-3 py-2 text-left font-medium text-muted-foreground w-16">
												Tổ hợp
											</th>
										)}
										{years.map((y) => (
											<th
												key={y}
												className="px-3 py-2 text-right font-medium text-muted-foreground"
											>
												{y}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{hasCombos ? (
										combos.map((combo) => (
											<tr
												key={combo}
												className="border-t border-border hover:bg-muted/20 transition-colors"
											>
												<td className="px-3 py-2 font-mono text-foreground">
													{combo}
												</td>
												{years.map((y) => (
													<td
														key={y}
														className="px-3 py-2 text-right tabular-nums text-foreground"
													>
														{lookup[combo]?.[y] != null
															? formatScore(lookup[combo][y])
															: "—"}
													</td>
												))}
											</tr>
										))
									) : (
										// No subject combos (e.g. ĐGNL)
										<tr className="border-t border-border">
											{years.map((y) => {
												const entry = reqs.find((r) => r.year === y);
												return (
													<td
														key={y}
														className="px-3 py-2 text-right tabular-nums text-foreground"
													>
														{entry ? formatScore(entry.score) : "—"}
													</td>
												);
											})}
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				);
			})}
		</div>
	);
};

const MajorCard = ({ major: m }: { major: MajorWithRequirements }) => (
	<Card className="border-border bg-card shadow-sm">
		<CardContent className="p-4">
			<div className="flex items-start justify-between gap-3 flex-wrap">
				<div className="min-w-0">
					<p className="font-semibold text-foreground leading-snug">{m.name}</p>
					{m.code && (
						<p className="text-xs text-muted-foreground font-mono mt-0.5">
							{m.code}
						</p>
					)}
				</div>
				<div className="flex flex-wrap gap-2 text-xs text-muted-foreground shrink-0">
					{m.tuitionFee != null && (
						<span className="inline-flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
							💰 {formatTuition(m.tuitionFee)}
						</span>
					)}
					{m.enrollmentQuota != null && (
						<span className="inline-flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
							🎓 {m.enrollmentQuota} chỉ tiêu
						</span>
					)}
				</div>
			</div>

			{m.admissionRequirements.length > 0 && (
				<RequirementsTable requirements={m.admissionRequirements} />
			)}
		</CardContent>
	</Card>
);

const MajorsSkeleton = () => (
	<div className="space-y-3">
		{[...Array(4)].map((_, i) => (
			<div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
		))}
	</div>
);

// ─── tabs ─────────────────────────────────────────────────────────────────────

type TabId = "majors";

const TABS: { id: TabId; label: string }[] = [
	{ id: "majors", label: "Danh sách ngành học" },
];

// ─── page ─────────────────────────────────────────────────────────────────────

const UniversityDetailPage = () => {
	const { universityId } = useParams({ from: "/danh-sach-truong/$universityId" });
	const id = Number(universityId);

	const [university, setUniversity] = useState<UniversityListItem | null>(null);
	const [majorsData, setMajorsData] = useState<UniversityMajors | null>(null);
	const [loadingInfo, setLoadingInfo] = useState(true);
	const [loadingMajors, setLoadingMajors] = useState(true);
	const [errorInfo, setErrorInfo] = useState<string | null>(null);
	const [errorMajors, setErrorMajors] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<TabId>("majors");

	useEffect(() => {
		setLoadingInfo(true);
		fetchUniversityById(id)
			.then(setUniversity)
			.catch(() => setErrorInfo("Không thể tải thông tin trường. Vui lòng thử lại."))
			.finally(() => setLoadingInfo(false));

		setLoadingMajors(true);
		fetchUniversityMajors(id)
			.then(setMajorsData)
			.catch(() => setErrorMajors("Không thể tải danh sách ngành. Vui lòng thử lại."))
			.finally(() => setLoadingMajors(false));
	}, [id]);

	return (
		<>
			<PageMetadata
				title={university ? university.name : "Chi tiết trường đại học"}
				description={
					university
						? `Thông tin và danh sách ngành học của ${university.name}`
						: "Chi tiết trường đại học"
				}
			/>

			<div className="flex-1 bg-background p-4 md:p-8">
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Back link */}
					<Link
						to="/danh-sach-truong"
						className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<span aria-hidden>←</span> Danh sách trường
					</Link>

					{/* Section 1 — University info */}
					{loadingInfo ? (
						<div className="h-36 rounded-xl bg-muted animate-pulse" />
					) : errorInfo ? (
						<p className="text-sm text-destructive">{errorInfo}</p>
					) : university ? (
						<UniversityInfoCard university={university} />
					) : null}

					{/* Section 2 — Tabs */}
					<div>
						{/* Tab bar */}
						<div className="border-b border-border">
							<div className="flex gap-0 -mb-px">
								{TABS.map((tab) => (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveTab(tab.id)}
										className={cn(
											"px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
											activeTab === tab.id
												? "border-foreground text-foreground"
												: "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
										)}
									>
										{tab.label}
									</button>
								))}
							</div>
						</div>

						{/* Tab content */}
						<div className="pt-5">
							{activeTab === "majors" && (
								<>
									{loadingMajors ? (
										<MajorsSkeleton />
									) : errorMajors ? (
										<p className="text-sm text-destructive">{errorMajors}</p>
									) : majorsData && majorsData.majors.length > 0 ? (
										<>
											<p className="text-sm text-muted-foreground mb-4">
												{majorsData.majors.length} ngành học
											</p>
											<div className="space-y-3">
												{majorsData.majors.map((major) => (
													<MajorCard key={major.id} major={major} />
												))}
											</div>
										</>
									) : (
										<p className="text-sm text-muted-foreground py-8 text-center">
											Chưa có thông tin ngành học.
										</p>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default UniversityDetailPage;
