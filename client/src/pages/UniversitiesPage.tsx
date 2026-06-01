import { ChevronRight, MapPin, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import PageMetadata from "@/components/PageMetadata";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAllUniversities } from "@/services/api";
import type { UniversityListItem } from "@/types";

const ALL = "__all__";

/** Bỏ dấu tiếng Việt + lowercase để tìm kiếm khoan dung (vd: "khtn" khớp "KHTN"). */
const normalize = (s: string) =>
	s
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/đ/g, "d");

const UniversitiesPage = () => {
	const [universities, setUniversities] = useState<UniversityListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [query, setQuery] = useState("");
	const [selectedType, setSelectedType] = useState<string>(ALL);
	const [selectedAutonomy, setSelectedAutonomy] = useState<string>(ALL);

	const hasActiveFilter =
		query.trim() !== "" || selectedType !== ALL || selectedAutonomy !== ALL;

	const resetFilters = () => {
		setQuery("");
		setSelectedType(ALL);
		setSelectedAutonomy(ALL);
	};

	useEffect(() => {
		fetchAllUniversities()
			.then(setUniversities)
			.catch(() =>
				setError("Không thể tải danh sách trường. Vui lòng thử lại."),
			)
			.finally(() => setLoading(false));
	}, []);

	const filtered = useMemo(() => {
		const q = normalize(query.trim());
		return universities.filter((u) => {
			if (selectedType !== ALL && u.type !== selectedType) return false;
			if (selectedAutonomy === "autonomous" && u.isFinanciallyAutonomous !== true)
				return false;
			if (selectedAutonomy === "non-autonomous" && u.isFinanciallyAutonomous !== false)
				return false;
			if (q) {
				const haystack = normalize(
					[u.name, u.shortName, u.englishName, u.code]
						.filter(Boolean)
						.join(" "),
				);
				if (!haystack.includes(q)) return false;
			}
			return true;
		});
	}, [universities, query, selectedType, selectedAutonomy]);

	return (
		<>
			<PageMetadata
				title="Danh sách trường Đại học ở TP. HCM"
				description="Khám phá danh sách các trường đại học tại TP. HCM"
			/>

			<div className="flex-1 bg-background p-4 md:p-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-semibold text-foreground mb-6 text-center">
						Danh sách các trường Đại học ở TP. HCM
					</h1>

					{/* Search */}
					<div className="mb-4">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
							<Input
								type="search"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Tìm trường theo tên, tên viết tắt hoặc mã trường…"
								aria-label="Tìm kiếm trường đại học"
								className="pl-9"
							/>
						</div>
					</div>

					{/* Filters */}
					<div className="mb-6 rounded-lg border border-border bg-card/50 p-4">
						<div className="flex items-center justify-between mb-3">
							<p className="text-sm font-medium text-foreground">Bộ lọc</p>
							{hasActiveFilter && (
								<button
									type="button"
									onClick={resetFilters}
									className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									<X className="h-3.5 w-3.5" />
									Xóa bộ lọc
								</button>
							)}
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<label className="flex flex-col gap-1.5">
								<span className="text-xs font-medium text-muted-foreground">
									Theo loại trường (công, tư)
								</span>
								<select
									value={selectedType}
									onChange={(e) => setSelectedType(e.target.value)}
									className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
								>
									<option value={ALL}>Tất cả loại trường</option>
									<option value="Public">Trường công lập</option>
									<option value="Private">Trường tư thục</option>
								</select>
							</label>

							<label className="flex flex-col gap-1.5">
								<span className="text-xs font-medium text-muted-foreground">
									Theo cơ chế tài chính
								</span>
								<select
									value={selectedAutonomy}
									onChange={(e) => setSelectedAutonomy(e.target.value)}
									className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
								>
									<option value={ALL}>Tất cả cơ chế</option>
									<option value="autonomous">Đã tự chủ tài chính</option>
									<option value="non-autonomous">Chưa tự chủ tài chính</option>
								</select>
							</label>
						</div>
					</div>

					{/* Results count */}
					{!loading && !error && (
						<p className="text-sm text-muted-foreground mb-4">
							Tìm thấy{" "}
							<span className="font-medium text-foreground">
								{filtered.length}
							</span>{" "}
							trường
						</p>
					)}

					{/* Loading skeleton */}
					{loading && (
						<div className="space-y-3">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="h-20 rounded-lg bg-muted animate-pulse"
								/>
							))}
						</div>
					)}

					{error && <p className="text-sm text-destructive">{error}</p>}

					{/* University list */}
					{!loading && !error && (
						<div className="space-y-3">
							{filtered.length === 0 ? (
								<p className="text-sm text-muted-foreground py-8 text-center">
									Không tìm thấy trường nào phù hợp với tìm kiếm và bộ lọc.
								</p>
							) : (
								filtered.map((u) => (
									<UniversityCard key={u.id} university={u} />
								))
							)}
						</div>
					)}
				</div>
			</div>
		</>
	);
};

const UniversityCard = ({
	university: u,
}: {
	university: UniversityListItem;
}) => {
	// Gom các thành phố (loại trùng) để hiển thị vị trí campus.
	const cities = Array.from(
		new Set(u.campuses?.map((c) => c.city).filter(Boolean)),
	);
	const locationLabel =
		cities.length === 0
			? null
			: cities.length <= 2
				? cities.join(" · ")
				: `${cities.slice(0, 2).join(" · ")} +${cities.length - 2}`;

	// Tên viết tắt — luôn hiển thị khi có (kể cả khi trùng mã trường).
	const shortName = u.shortName || null;

	return (
		<Link
			to="/danh-sach-truong/$slug"
			params={{ slug: u.slug ?? String(u.id) }}
			className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
			aria-label={`Xem chi tiết ${u.name}`}
		>
			<Card className="shadow-sm transition-all border-border bg-card cursor-pointer group-hover:shadow-md group-hover:border-primary/40">
				<CardContent className="p-4">
					<div className="flex items-center gap-3 sm:gap-4">
						{/* Logo */}
						<div className="flex-shrink-0">
							<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-card dark:bg-[#181818] border border-border/70 flex items-center justify-center overflow-hidden p-2 sm:p-2.5">
								{u.imageUrl ? (
									<img
										src={u.imageUrl}
										alt={`Logo ${u.name}`}
										className="w-full h-full object-contain"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.style.display = "none";
											const parent = target.parentElement;
											if (parent) {
												parent.innerHTML = `<span class="text-sm font-medium text-muted-foreground">${u.name.charAt(0)}</span>`;
											}
										}}
									/>
								) : (
									<span className="text-sm font-medium text-muted-foreground">
										{u.name.charAt(0)}
									</span>
								)}
							</div>
						</div>

						{/* Info */}
						<div className="flex-1 min-w-0">
							<p className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
								{u.name}
							</p>
							{(u.englishName || shortName) && (
								<p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
									{u.englishName}
									{u.englishName && shortName && " "}
									{shortName && (
										<span className="font-medium text-foreground/70">
											({shortName})
										</span>
									)}
								</p>
							)}

							{/* Meta: mã trường (nổi bật — dùng để tuyển sinh) + viết tắt + vị trí */}
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2">
								<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
									Mã trường
									<span className="rounded-md bg-primary px-2 py-0.5 text-sm font-bold tracking-wide text-primary-foreground tabular-nums shadow-sm">
										{u.code}
									</span>
								</span>
								{locationLabel && (
									<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
										<MapPin className="h-3.5 w-3.5 flex-shrink-0" />
										{locationLabel}
									</span>
								)}
							</div>

							{/* Badges */}
							<div className="flex flex-wrap gap-1.5 mt-2">
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
							</div>
						</div>

						{/* Affordance: gợi ý bấm để xem chi tiết */}
						<div className="flex-shrink-0 self-center flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
							<span className="hidden sm:inline text-xs font-medium">
								Xem chi tiết
							</span>
							<ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-0.5" />
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};

export default UniversitiesPage;
