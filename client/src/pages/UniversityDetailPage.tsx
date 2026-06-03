import { Link, useParams } from "@tanstack/react-router";
import { Award, Building2, ExternalLink, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import JsonLd from "@/components/JsonLd";
import PageMetadata from "@/components/PageMetadata";
import { latestPerSystem, rankSentence } from "@/components/RankingBadges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fetchUniversityBySlug, fetchUniversityMajors } from "@/services/api";
import type {
	AdmissionRequirement,
	Dormitory,
	MajorWithRequirements,
	UniversityListItem,
	UniversityMajors,
} from "@/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatScore(score: number): string {
	return score % 1 === 0
		? score.toFixed(0)
		: score.toFixed(2).replace(/\.?0+$/, "");
}

const TUITION_UNIT_LABEL: Record<string, string> = {
	PerCredit: "tín chỉ",
	PerSemester: "học kỳ",
	PerYear: "năm",
};

/** Format a tuition fee as a concrete amount (max null) or a range (min – max). */
function formatTuition(
	min: number,
	max: number | null,
	unit: string | null,
): string {
	const suffix = unit ? (TUITION_UNIT_LABEL[unit] ?? "năm") : "năm";
	const inMillions = min >= 1_000_000 && (max == null || max >= 1_000_000);
	const fmt = (v: number) => {
		if (!inMillions) return v.toLocaleString("vi-VN");
		const millions = v / 1_000_000;
		return millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
	};
	const unitWord = inMillions ? "triệu đồng" : "đồng";
	const amount =
		max != null && max !== min ? `${fmt(min)} – ${fmt(max)}` : fmt(min);
	return `${amount} ${unitWord}/${suffix}`;
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

const UniversityInfoCard = ({
	university: u,
}: {
	university: UniversityListItem;
}) => (
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
						{u.isFinanciallyAutonomous === true && (
							<Badge variant="outline" className="text-xs border-border">
								Tự chủ tài chính
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
					</div>

					{u.campuses.length > 0 && (
						<div className="flex items-start gap-1.5">
							<span className="text-muted-foreground mt-px text-xs">📍</span>
							<p className="text-sm text-muted-foreground">
								{u.campuses
									.map((c) => [c.district, c.city].filter(Boolean).join(", "))
									.join(" · ")}
							</p>
						</div>
					)}
				</div>
			</div>
		</CardContent>
	</Card>
);

const RankingSection = ({
	university: u,
}: {
	university: UniversityListItem;
}) => {
	const items = latestPerSystem(u.rankings ?? []);
	if (items.length === 0) return null;

	return (
		<Card className="border-border bg-card shadow-sm">
			<CardContent className="p-6">
				<div className="flex items-center gap-2">
					<Award className="h-5 w-5 text-muted-foreground" />
					<h2 className="text-base font-semibold text-foreground">
						Bảng xếp hạng
					</h2>
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					{items.map((r) => {
						const chipClass =
							"inline-flex items-center gap-1.5 rounded-md border border-amber-300/70 bg-amber-50 px-2.5 py-1 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
						const content = (
							<>
								<Award className="h-3.5 w-3.5" />
								<span className="font-semibold">{r.system}</span>
								<span>{rankSentence(r)}</span>
								<span className="text-amber-700/70 dark:text-amber-300/70">
									· {r.year}
								</span>
								{r.sourceUrl && <ExternalLink className="h-3 w-3 opacity-70" />}
							</>
						);
						return r.sourceUrl ? (
							<a
								key={r.system}
								href={r.sourceUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									chipClass,
									"transition-colors hover:bg-amber-100 dark:hover:bg-amber-500/20",
								)}
							>
								{content}
							</a>
						) : (
							<span key={r.system} className={chipClass}>
								{content}
							</span>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};

const DormitoryItem = ({ dorm }: { dorm: Dormitory }) => (
	<div className="rounded-lg border border-border bg-background/60 p-4">
		<p className="font-medium text-foreground leading-snug">{dorm.name}</p>
		{dorm.address && (
			<p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
				<MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
				<span>{dorm.address}</span>
			</p>
		)}
		{dorm.note && (
			<p className="mt-2 text-sm text-muted-foreground">{dorm.note}</p>
		)}
		{dorm.registrationUrl && (
			<a
				href={dorm.registrationUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
			>
				Trang đăng ký / thông tin KTX
				<ExternalLink className="h-3.5 w-3.5" />
			</a>
		)}
	</div>
);

const DormitorySection = ({
	university: u,
}: {
	university: UniversityListItem;
}) => {
	const dorms = u.dormitories ?? [];

	// Hide entirely when we have no signal at all (unknown flag, no rows).
	if (u.hasDormitory == null && dorms.length === 0) return null;

	return (
		<Card className="border-border bg-card shadow-sm">
			<CardContent className="p-6">
				<div className="flex items-center gap-2">
					<Building2 className="h-5 w-5 text-muted-foreground" />
					<h2 className="text-base font-semibold text-foreground">Ký túc xá</h2>
				</div>

				{u.hasDormitory === false ? (
					<p className="mt-3 text-sm text-muted-foreground">
						Trường không có ký túc xá.
					</p>
				) : dorms.length > 0 ? (
					<div className="mt-4 space-y-3">
						{dorms.map((d) => (
							<DormitoryItem key={d.name} dorm={d} />
						))}
					</div>
				) : (
					<p className="mt-3 text-sm text-muted-foreground">
						Trường có ký túc xá — thông tin chi tiết đang được cập nhật.
					</p>
				)}
			</CardContent>
		</Card>
	);
};

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

const MajorCard = ({ major: m }: { major: MajorWithRequirements }) => {
	// years is sorted by year descending (server-side); show the latest offering.
	const latest = m.years[0];
	return (
		<Card className="border-border bg-card shadow-sm">
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-3 flex-wrap">
					<div className="min-w-0">
						<p className="font-semibold text-foreground leading-snug">
							{m.name}
						</p>
						{m.code && (
							<p className="text-xs text-muted-foreground font-mono mt-0.5">
								{m.code}
							</p>
						)}
					</div>
					{latest && (
						<div className="flex flex-wrap gap-2 text-xs text-muted-foreground shrink-0">
							{latest.tuitionFeeMin != null && (
								<span className="inline-flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
									💰{" "}
									{formatTuition(
										latest.tuitionFeeMin,
										latest.tuitionFeeMax,
										latest.tuitionFeeUnit,
									)}
									<span className="text-muted-foreground/70">
										· {latest.year}
									</span>
								</span>
							)}
							{latest.enrollmentQuota != null && (
								<span className="inline-flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
									🎓 {latest.enrollmentQuota} chỉ tiêu
								</span>
							)}
						</div>
					)}
				</div>

				{m.admissionRequirements.length > 0 && (
					<RequirementsTable requirements={m.admissionRequirements} />
				)}
			</CardContent>
		</Card>
	);
};

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
	const { slug } = useParams({ from: "/danh-sach-truong/$slug" });

	const [university, setUniversity] = useState<UniversityListItem | null>(null);
	const [majorsData, setMajorsData] = useState<UniversityMajors | null>(null);
	const [loadingInfo, setLoadingInfo] = useState(true);
	const [loadingMajors, setLoadingMajors] = useState(true);
	const [errorInfo, setErrorInfo] = useState<string | null>(null);
	const [errorMajors, setErrorMajors] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<TabId>("majors");

	useEffect(() => {
		setLoadingInfo(true);
		setLoadingMajors(true);

		fetchUniversityBySlug(slug)
			.then((uni) => {
				setUniversity(uni);
				setLoadingInfo(false);
				// Majors are keyed by id, which we only learn from the university response.
				return fetchUniversityMajors(uni.id);
			})
			.then(setMajorsData)
			.catch(() => {
				setErrorInfo("Không thể tải thông tin trường. Vui lòng thử lại.");
				setErrorMajors("Không thể tải danh sách ngành. Vui lòng thử lại.");
			})
			.finally(() => {
				setLoadingInfo(false);
				setLoadingMajors(false);
			});
	}, [slug]);

	return (
		<>
			<PageMetadata
				title={university ? university.name : "Chi tiết trường đại học"}
				description={
					university
						? `Thông tin tuyển sinh, học phí và danh sách ngành học của ${university.name}`
						: "Chi tiết trường đại học"
				}
				image={university?.imageUrl ?? undefined}
			/>
			{university && (
				<JsonLd
					data={{
						"@context": "https://schema.org",
						"@type": "CollegeOrUniversity",
						name: university.name,
						...(university.englishName && {
							alternateName: university.englishName,
						}),
						url: `https://timtruong.app/danh-sach-truong/${slug}`,
						...(university.imageUrl && { logo: university.imageUrl }),
					}}
				/>
			)}

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

					{/* Section 1.5 — Dormitory (KTX) */}
					{!loadingInfo && !errorInfo && university && (
						<RankingSection university={university} />
					)}

					{!loadingInfo && !errorInfo && university && (
						<DormitorySection university={university} />
					)}

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
