import { Link, useNavigate } from "@tanstack/react-router";
import {
	type ColumnDef,
	type ExpandedState,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import PageMetadata from "@/components/PageMetadata";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
	fetchSubjectCombinationDetail,
	fetchSubjectCombinations,
} from "@/services/api";
import type {
	SubjectCombinationDetailData,
	SubjectCombinationSummary,
} from "@/types";

const subjectFilter: FilterFn<SubjectCombinationSummary> = (
	row,
	_columnId,
	filterValue: string,
) => {
	const q = normalizeVi(filterValue);
	if (!q) return true;
	return (
		normalizeVi(row.original.code).includes(q) ||
		row.original.subjects.some((s) => normalizeVi(s).includes(q))
	);
};

const SubjectCombinationsPage = () => {
	const [combinations, setCombinations] = useState<SubjectCombinationSummary[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [expanded, setExpanded] = useState<ExpandedState>({});

	// Lazy-loaded detail per combination code (universities + majors using it).
	const [details, setDetails] = useState<
		Record<string, SubjectCombinationDetailData>
	>({});
	const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>(
		{},
	);
	const [detailError, setDetailError] = useState<Record<string, string>>({});

	useEffect(() => {
		fetchSubjectCombinations()
			.then(setCombinations)
			.catch(() =>
				setError("Không thể tải danh sách tổ hợp môn. Vui lòng thử lại."),
			)
			.finally(() => setLoading(false));
	}, []);

	const loadDetail = useCallback((code: string) => {
		setDetails((prev) => {
			if (prev[code]) return prev; // already cached
			setDetailLoading((l) => ({ ...l, [code]: true }));
			setDetailError((e) => {
				const { [code]: _omit, ...rest } = e;
				return rest;
			});
			fetchSubjectCombinationDetail(code)
				.then((d) => setDetails((p) => ({ ...p, [code]: d })))
				.catch(() =>
					setDetailError((e) => ({
						...e,
						[code]: "Không thể tải danh sách trường/ngành.",
					})),
				)
				.finally(() => setDetailLoading((l) => ({ ...l, [code]: false })));
			return prev;
		});
	}, []);

	const columns = useMemo<ColumnDef<SubjectCombinationSummary>[]>(
		() => [
			{
				id: "expander",
				header: "",
				cell: ({ row }) =>
					row.getCanExpand() ? (
						<span className="text-muted-foreground">
							{row.getIsExpanded() ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</span>
					) : null,
				enableSorting: false,
			},
			{
				accessorKey: "code",
				header: "Tên tổ hợp",
				cell: ({ row }) => (
					<Badge variant="outline" className="font-mono text-base px-3 py-1">
						{row.original.code}
					</Badge>
				),
			},
			{
				accessorKey: "subjects",
				header: "Các môn trong tổ hợp",
				cell: ({ row }) => (
					<div className="flex flex-wrap gap-x-1 gap-y-0.5">
						{row.original.subjects.map((subject, index) => (
							<span key={subject} className="text-foreground">
								{subject}
								{index < row.original.subjects.length - 1 && (
									<span className="text-muted-foreground">, </span>
								)}
							</span>
						))}
					</div>
				),
				enableSorting: false,
			},
			{
				accessorKey: "universityCount",
				header: "Số trường xét tuyển",
				cell: ({ row }) => (
					<span className="tabular-nums font-medium">
						{row.original.universityCount}
					</span>
				),
			},
			{
				accessorKey: "majorCount",
				header: "Số ngành xét tuyển",
				cell: ({ row }) => (
					<span className="tabular-nums font-medium">
						{row.original.majorCount}
					</span>
				),
			},
		],
		[],
	);

	const table = useReactTable({
		data: combinations,
		columns,
		state: {
			sorting,
			globalFilter,
			expanded,
		},
		getRowCanExpand: (row) => row.original.universityCount > 0,
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onExpandedChange: setExpanded,
		globalFilterFn: subjectFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
	});

	return (
		<>
			<PageMetadata
				title="Danh sách tổ hợp môn"
				description="Danh sách đầy đủ các tổ hợp môn thi THPTQG cùng các trường và ngành đang dùng để xét tuyển - Hệ thống tư vấn tuyển sinh TimTruong"
			/>
			<div className="flex-1 bg-background p-4 md:p-8">
				<div className="max-w-6xl mx-auto">
					<Card className="shadow-lg bg-card border-border">
						<CardHeader>
							<CardTitle className="text-2xl text-center text-foreground">
								Danh sách các tổ hợp môn THPTQG
							</CardTitle>
							<p className="text-center text-muted-foreground mt-2">
								Ấn vào một tổ hợp để xem các trường và ngành đang dùng để xét
								tuyển
							</p>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Search Input */}
							<div className="flex items-center gap-2">
								<Input
									placeholder="Tìm kiếm tổ hợp môn..."
									value={globalFilter}
									onChange={(e) => setGlobalFilter(e.target.value)}
									className="max-w-sm"
								/>
							</div>

							{/* Table */}
							<div className="rounded-md border border-border overflow-x-auto">
								<Table>
									<TableHeader>
										{table.getHeaderGroups().map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup.headers.map((header) => (
													<TableHead key={header.id} className="font-semibold">
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext(),
																)}
													</TableHead>
												))}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										{loading ? (
											<TableRow>
												<TableCell
													colSpan={columns.length}
													className="h-24 text-center text-muted-foreground"
												>
													Đang tải...
												</TableCell>
											</TableRow>
										) : error ? (
											<TableRow>
												<TableCell
													colSpan={columns.length}
													className="h-24 text-center text-destructive"
												>
													{error}
												</TableCell>
											</TableRow>
										) : table.getRowModel().rows?.length ? (
											table.getRowModel().rows.map((row) => {
												const canExpand = row.getCanExpand();
												const code = row.original.code;
												return (
													<Fragment key={row.id}>
														<TableRow
															className={
																canExpand ? "cursor-pointer" : undefined
															}
															onClick={
																canExpand
																	? () => {
																			const willExpand = !row.getIsExpanded();
																			row.toggleExpanded();
																			if (willExpand) loadDetail(code);
																		}
																	: undefined
															}
														>
															{row.getVisibleCells().map((cell) => (
																<TableCell key={cell.id}>
																	{flexRender(
																		cell.column.columnDef.cell,
																		cell.getContext(),
																	)}
																</TableCell>
															))}
														</TableRow>
														{row.getIsExpanded() && (
															<TableRow className="bg-muted/30 hover:bg-muted/30">
																<TableCell colSpan={columns.length}>
																	<ComboDetail
																		loading={detailLoading[code]}
																		error={detailError[code]}
																		detail={details[code]}
																	/>
																</TableCell>
															</TableRow>
														)}
													</Fragment>
												);
											})
										) : (
											<TableRow>
												<TableCell
													colSpan={columns.length}
													className="h-24 text-center"
												>
													Không tìm thấy kết quả.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>

							{/* Results Count */}
							{!loading && !error && (
								<div className="text-sm text-muted-foreground text-center">
									Hiển thị {table.getFilteredRowModel().rows.length} tổ hợp môn
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
};

const ComboDetail = ({
	loading,
	error,
	detail,
}: {
	loading?: boolean;
	error?: string;
	detail?: SubjectCombinationDetailData;
}) => {
	const navigate = useNavigate();
	const [selectedUniId, setSelectedUniId] = useState<number | null>(null);

	useEffect(() => {
		setSelectedUniId((prev) => {
			if (!detail) return null;
			if (prev && detail.universities.some((u) => u.id === prev)) return prev;
			return detail.universities[0]?.id ?? null;
		});
	}, [detail]);

	if (loading) {
		return <p className="text-sm text-muted-foreground py-2">Đang tải...</p>;
	}
	if (error) {
		return <p className="text-sm text-destructive py-2">{error}</p>;
	}
	if (!detail || detail.universities.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-2">
				Chưa có trường nào dùng tổ hợp này.
			</p>
		);
	}

	const selectedUni =
		detail.universities.find((u) => u.id === selectedUniId) ??
		detail.universities[0];

	return (
		<div className="flex flex-col gap-3 py-2 sm:h-[420px] sm:flex-row sm:gap-0">
			{/* University list */}
			<div className="flex gap-1.5 overflow-x-auto pb-1 sm:w-64 sm:shrink-0 sm:flex-col sm:gap-0.5 sm:overflow-y-auto sm:overflow-x-visible sm:border-r sm:border-border sm:pb-0 sm:pr-3">
				{detail.universities.map((uni) => {
					const isSelected = uni.id === selectedUni.id;
					return (
						<button
							key={uni.id}
							type="button"
							onClick={() => setSelectedUniId(uni.id)}
							className={cn(
								"shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors sm:whitespace-normal sm:rounded-none sm:border-l-2 sm:px-3",
								isSelected
									? "bg-accent sm:border-l-primary"
									: "hover:bg-muted sm:border-l-transparent",
							)}
						>
							<div className="font-medium">{uni.name}</div>
							<Badge
								variant={isSelected ? "default" : "secondary"}
								className="mt-1 font-normal"
							>
								{uni.majors.length} ngành
							</Badge>
						</button>
					);
				})}
			</div>

			{/* Selected university's majors */}
			<div className="min-w-0 flex-1 sm:overflow-y-auto sm:pl-4">
				<div className="mb-2 font-medium">
					{selectedUni.slug ? (
						<Link
							to="/danh-sach-truong/$slug"
							params={{ slug: selectedUni.slug }}
							className="text-primary hover:underline"
						>
							{selectedUni.name}
						</Link>
					) : (
						<span className="text-foreground">{selectedUni.name}</span>
					)}
				</div>
				<div className="overflow-hidden rounded-md border border-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Ngành</TableHead>
								<TableHead className="text-right">Mã ngành</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{selectedUni.majors.map((major) => {
								const slug = selectedUni.slug;
								return (
									<TableRow
										key={major.id}
										className={slug ? "cursor-pointer" : undefined}
										onClick={
											slug
												? () =>
														navigate({
															to: "/danh-sach-truong/$slug",
															params: { slug },
															search: { major: major.id },
														})
												: undefined
										}
									>
										<TableCell>{major.name}</TableCell>
										<TableCell className="text-right font-mono text-xs text-muted-foreground">
											{major.code}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
};

export default SubjectCombinationsPage;
