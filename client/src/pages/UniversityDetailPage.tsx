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
	type LucideIcon,
	MapPin,
	Search,
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import JsonLd from "@/components/JsonLd";
import PageMetadata from "@/components/PageMetadata";
import { latestPerSystem, rankSentence } from "@/components/RankingBadges";
import { UniversityBadges } from "@/components/UniversityBadges";
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
import { RequirementsTable } from "@/components/RequirementsTable";
// Chart pulls in visx; lazy so it only loads when a row with trend data expands.
const MajorScoreChart = lazy(() => import("@/components/MajorScoreChart"));
import { isNewMajor, majorTuition } from "@/lib/majors";
import { cn, normalizeVi } from "@/lib/utils";
import { fetchUniversityBySlug, fetchUniversityMajors } from "@/services/api";
import type {
	Dormitory,
	MajorWithRequirements,
	Ranking,
	UniversityListItem,
	UniversityMajors,
} from "@/types";

// ─── sub-components ───────────────────────────────────────────────────────────

/** Một dòng thông tin có nhãn (icon + nhãn trái, nội dung phải) — khuôn dùng
 *  chung trong card thông tin trường, dễ mở rộng cho các mục về sau. */
const InfoRow = ({
	icon: Icon,
	label,
	children,
}: {
	icon: LucideIcon;
	label: string;
	children: React.ReactNode;
}) => (
	<div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
		<span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:w-24 sm:flex-shrink-0 sm:pt-0.5">
			<Icon className="h-3.5 w-3.5 flex-shrink-0" />
			{label}
		</span>
		<div className="min-w-0 flex-1">{children}</div>
	</div>
);

const RANKING_YEAR = 2026;

const RankingRow = ({
	items,
	currentYear,
}: {
	items: Ranking[];
	currentYear: number;
}) => {
	const chipClass =
		"inline-flex items-center gap-1 rounded-md border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{items.map((r) => {
				const content = (
					<>
						<span className="font-semibold">{r.system}</span>
						<span>{rankSentence(r)}</span>
						{r.year !== currentYear && (
							<span className="text-amber-700/70 dark:text-amber-300/70">
								· {r.year}
							</span>
						)}
						{r.sourceUrl && <ExternalLink className="h-3 w-3 opacity-70" />}
					</>
				);
				return r.sourceUrl ? (
					<a
						key={r.system}
						href={r.sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
						title={`${r.system} · ${rankSentence(r)} (${r.year})`}
						className={cn(
							chipClass,
							"transition-colors hover:bg-amber-100 dark:hover:bg-amber-500/20",
						)}
					>
						{content}
					</a>
				) : (
					<span
						key={r.system}
						title={`${r.system} · ${rankSentence(r)} (${r.year})`}
						className={chipClass}
					>
						{content}
					</span>
				);
			})}
		</div>
	);
};

const UniversityInfoCard = ({
	university: u,
}: {
	university: UniversityListItem;
}) => {
	const rankItems = latestPerSystem(u.rankings ?? []);
	const campusText = u.campuses
		.map((c) => [c.district, c.city].filter(Boolean).join(", "))
		.join(" · ");
	const hasRows = u.campuses.length > 0 || rankItems.length > 0;

	return (
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

						<UniversityBadges university={u} showDormitory />
					</div>
				</div>

				{/* Dòng có nhãn — địa chỉ, xếp hạng, … (mở rộng về sau) */}
				{hasRows && (
					<div className="mt-5 border-t border-border pt-4 space-y-3">
						{u.campuses.length > 0 && (
							<InfoRow icon={MapPin} label="Địa chỉ">
								<p className="text-sm text-muted-foreground">{campusText}</p>
							</InfoRow>
						)}
						{rankItems.length > 0 && (
							<InfoRow icon={Award} label={`Xếp hạng (${RANKING_YEAR})`}>
								<RankingRow items={rankItems} currentYear={RANKING_YEAR} />
							</InfoRow>
						)}
					</div>
				)}
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
			<p className="text-sm text-muted-foreground">
				Trường không có ký túc xá.
			</p>
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

// ─── majors table (TanStack) ──────────────────────────────────────────────────

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
	const Icon =
		sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
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
const majorFilter: FilterFn<MajorWithRequirements> = (
	row,
	_columnId,
	filterValue: string,
) => {
	const q = normalizeVi(filterValue);
	if (!q) return true;
	const m = row.original;
	return (
		normalizeVi(m.name).includes(q) || normalizeVi(m.code ?? "").includes(q)
	);
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
						<span className="font-medium text-foreground leading-snug">
							{m.name}
						</span>
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
			<span className="text-sm text-muted-foreground">
				{majorTuition(row.original) ?? "—"}
			</span>
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
					const align = (
						cell.column.columnDef.meta as { align?: string } | undefined
					)?.align;
					return (
						<TableCell
							key={cell.id}
							className={cn(
								"align-top py-3",
								align === "right" && "text-right",
							)}
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
								Ngành mới mở — chưa công bố điểm chuẩn. Dưới đây là các tổ hợp
								xét tuyển.
							</p>
						)}
						<RequirementsTable requirements={m.admissionRequirements} />
						<Suspense fallback={null}>
							<MajorScoreChart requirements={m.admissionRequirements} />
						</Suspense>
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
										header.column.columnDef.meta as
											| { align?: string }
											| undefined
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
