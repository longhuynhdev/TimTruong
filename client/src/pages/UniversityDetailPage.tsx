import { Link, useParams } from "@tanstack/react-router";
import {
	type Column,
	type ColumnDef,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Award,
	ChevronDown,
	ExternalLink,
	MapPin,
	Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import JsonLd from "@/components/JsonLd";
import PageMetadata from "@/components/PageMetadata";
import { latestPerSystem, rankSentence } from "@/components/RankingBadges";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn, normalizeVi } from "@/lib/utils";
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

const hasPublishedScore = (m: MajorWithRequirements) =>
	m.admissionRequirements.some((r) => r.score != null);

// "Ngành mới": the school published the combos (đề án) but no cutoff in any year yet.
// A major with no admission-requirement rows at all is "chưa có dữ liệu", not new.
const isNewMajor = (m: MajorWithRequirements) =>
	m.admissionRequirements.length > 0 && !hasPublishedScore(m);

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
					<UniversityLogo
						name={u.name}
						imageUrl={u.imageUrl}
						className="w-20 h-20 p-3"
						fallbackClassName="text-base font-semibold"
					/>
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

// Whether a university has any dormitory signal worth a tab (known flag or rows).
const hasDormitoryInfo = (u: UniversityListItem) =>
	u.hasDormitory != null || (u.dormitories ?? []).length > 0;

const DormitoryTab = ({
	university: u,
}: {
	university: UniversityListItem;
}) => {
	const dorms = u.dormitories ?? [];

	if (u.hasDormitory === false) {
		return (
			<p className="text-sm text-muted-foreground">Trường không có ký túc xá.</p>
		);
	}
	if (dorms.length > 0) {
		return (
			<div className="space-y-3">
				{dorms.map((d) => (
					<DormitoryItem key={d.name} dorm={d} />
				))}
			</div>
		);
	}
	return (
		<p className="text-sm text-muted-foreground">
			Trường có ký túc xá — thông tin chi tiết đang được cập nhật.
		</p>
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
											className="border-b border-border px-3 py-2 text-left align-bottom font-medium text-muted-foreground w-16"
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
											<td className="px-3 py-2 font-medium text-foreground tabular-nums">
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

// ─── majors table (TanStack) ──────────────────────────────────────────────────

/** Latest-year tuition string for a major, or null when not published. */
const majorTuition = (m: MajorWithRequirements): string | null => {
	const latest = m.years[0];
	return latest?.tuitionFeeMin != null
		? formatTuition(latest.tuitionFeeMin, latest.tuitionFeeMax, latest.tuitionFeeUnit)
		: null;
};

/** Clickable column header that toggles sorting and shows the current direction. */
const SortableHeader = ({
	column,
	label,
	className,
}: {
	column: Column<MajorWithRequirements>;
	label: string;
	className?: string;
}) => {
	const sorted = column.getIsSorted();
	const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
	return (
		<button
			type="button"
			onClick={column.getToggleSortingHandler()}
			className={cn(
				"inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors",
				className,
			)}
		>
			{label}
			<Icon
				className={cn(
					"h-3.5 w-3.5",
					sorted ? "text-foreground" : "text-muted-foreground/60",
				)}
			/>
		</button>
	);
};

// Search by major name + code, diacritic-insensitive (mirrors SubjectCombinationsPage).
const majorFilter: FilterFn<MajorWithRequirements> = (row, _columnId, filterValue: string) => {
	const q = normalizeVi(filterValue);
	if (!q) return true;
	const m = row.original;
	return normalizeVi(m.name).includes(q) || normalizeVi(m.code ?? "").includes(q);
};

const majorColumns: ColumnDef<MajorWithRequirements>[] = [
	{
		id: "name",
		accessorFn: (m) => m.name,
		header: ({ column }) => <SortableHeader column={column} label="Ngành" />,
		cell: ({ row }) => {
			const m = row.original;
			return (
				<div className="whitespace-normal">
					<div className="flex items-start gap-2 flex-wrap">
						<span className="font-medium text-foreground leading-snug">{m.name}</span>
						{isNewMajor(m) && (
							<Badge
								variant="outline"
								className="border-primary/40 text-primary text-[10px]"
							>
								Ngành mới
							</Badge>
						)}
					</div>
					{m.code && (
						<p className="text-xs text-muted-foreground mt-0.5">
							Mã ngành: <span className="font-mono">{m.code}</span>
						</p>
					)}
				</div>
			);
		},
	},
	{
		id: "tuition",
		// undefined (not null) so sortUndefined keeps "chưa công bố" rows last either direction.
		accessorFn: (m) => m.years[0]?.tuitionFeeMin ?? undefined,
		sortUndefined: "last",
		header: ({ column }) => <SortableHeader column={column} label="Học phí" />,
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">{majorTuition(row.original) ?? "—"}</span>
		),
	},
	{
		id: "quota",
		accessorFn: (m) => m.years[0]?.enrollmentQuota ?? undefined,
		sortUndefined: "last",
		header: ({ column }) => <SortableHeader column={column} label="Chỉ tiêu" />,
		cell: ({ row }) => {
			const quota = row.original.years[0]?.enrollmentQuota ?? null;
			return (
				<span className="text-sm text-muted-foreground tabular-nums">
					{quota != null ? quota : "—"}
				</span>
			);
		},
	},
	{
		id: "score",
		enableSorting: false,
		header: () => <span className="font-medium">Điểm chuẩn</span>,
		meta: { align: "right" },
		cell: ({ row }) =>
			row.getCanExpand() ? (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						row.toggleExpanded();
					}}
					aria-expanded={row.getIsExpanded()}
					className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
				>
					{row.getIsExpanded() ? "Ẩn" : "Xem"}
					<ChevronDown
						className={cn(
							"h-4 w-4 transition-transform",
							row.getIsExpanded() && "rotate-180",
						)}
					/>
				</button>
			) : (
				<span className="text-sm text-muted-foreground">—</span>
			),
	},
];

const MajorTableRow = ({
	row,
	columnCount,
}: {
	row: Row<MajorWithRequirements>;
	columnCount: number;
}) => {
	const m = row.original;
	const canExpand = row.getCanExpand();
	return (
		<>
			<TableRow
				className={canExpand ? "cursor-pointer" : undefined}
				onClick={canExpand ? row.getToggleExpandedHandler() : undefined}
			>
				{row.getVisibleCells().map((cell) => {
					const align = (cell.column.columnDef.meta as { align?: string } | undefined)?.align;
					return (
						<TableCell
							key={cell.id}
							className={cn("align-top py-3", align === "right" && "text-right")}
						>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</TableCell>
					);
				})}
			</TableRow>

			{row.getIsExpanded() && canExpand && (
				<TableRow className="hover:bg-transparent">
					<TableCell
						colSpan={columnCount}
						className="bg-muted/20 py-3 whitespace-normal"
					>
						{isNewMajor(m) && (
							<p className="text-xs text-muted-foreground mb-2">
								Ngành mới mở — chưa công bố điểm chuẩn. Dưới đây là các tổ hợp xét
								tuyển.
							</p>
						)}
						<RequirementsTable requirements={m.admissionRequirements} />
					</TableCell>
				</TableRow>
			)}
		</>
	);
};

const MajorsTable = ({ majors }: { majors: MajorWithRequirements[] }) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	const columns = useMemo(() => majorColumns, []);

	const table = useReactTable({
		data: majors,
		columns,
		state: { sorting, globalFilter },
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: majorFilter,
		getRowCanExpand: (row) => row.original.admissionRequirements.length > 0,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
	});

	const rows = table.getRowModel().rows;
	const columnCount = columns.length;

	return (
		<div className="space-y-4">
			<div className="relative max-w-sm">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Tìm kiếm ngành học..."
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="pl-9"
				/>
			</div>

			<p className="text-sm text-muted-foreground">
				{table.getFilteredRowModel().rows.length} ngành học
			</p>

			{/* Horizontal swipe on mobile keeps all columns (min-width forces overflow). */}
			<div className="rounded-lg border border-border overflow-x-auto">
				<Table className="min-w-[640px]">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="bg-muted/40 hover:bg-muted/40"
							>
								{headerGroup.headers.map((header) => {
									const align = (
										header.column.columnDef.meta as { align?: string } | undefined
									)?.align;
									return (
										<TableHead
											key={header.id}
											className={cn(align === "right" && "text-right")}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{rows.length ? (
							rows.map((row) => (
								<MajorTableRow
									key={row.id}
									row={row}
									columnCount={columnCount}
								/>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columnCount}
									className="h-24 text-center text-muted-foreground"
								>
									Không tìm thấy ngành học phù hợp.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
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

type TabId = "majors" | "dormitory";

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

	const tabs: { id: TabId; label: string }[] = [
		{ id: "majors", label: "Danh sách ngành học" },
		...(university && hasDormitoryInfo(university)
			? [{ id: "dormitory" as TabId, label: "Ký túc xá" }]
			: []),
	];

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

					{/* Section 1.5 — Rankings */}
					{!loadingInfo && !errorInfo && university && (
						<RankingSection university={university} />
					)}

					{/* Section 2 — Tabs (majors + dormitory) */}
					<div>
						{/* Tab bar */}
						<div className="border-b border-border">
							<div className="flex gap-0 -mb-px">
								{tabs.map((tab) => (
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
										<MajorsTable majors={majorsData.majors} />
									) : (
										<p className="text-sm text-muted-foreground py-8 text-center">
											Chưa có thông tin ngành học.
										</p>
									)}
								</>
							)}

							{activeTab === "dormitory" && university && (
								<DormitoryTab university={university} />
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default UniversityDetailPage;
