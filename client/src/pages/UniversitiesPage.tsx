import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import PageMetadata from "@/components/PageMetadata";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAllUniversities } from "@/services/api";
import type { UniversityListItem } from "@/types";

const ALL = "__all__";

const UniversitiesPage = () => {
	const [universities, setUniversities] = useState<UniversityListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedType, setSelectedType] = useState<string>(ALL);
	const [selectedAutonomy, setSelectedAutonomy] = useState<string>(ALL);

	useEffect(() => {
		fetchAllUniversities()
			.then(setUniversities)
			.catch(() =>
				setError("Không thể tải danh sách trường. Vui lòng thử lại."),
			)
			.finally(() => setLoading(false));
	}, []);

	const filtered = useMemo(() => {
		return universities.filter((u) => {
			if (selectedType !== ALL && u.type !== selectedType) return false;
			if (selectedAutonomy === "autonomous" && u.isFinanciallyAutonomous !== true)
				return false;
			if (selectedAutonomy === "non-autonomous" && u.isFinanciallyAutonomous !== false)
				return false;
			return true;
		});
	}, [universities, selectedType, selectedAutonomy]);

	return (
		<>
			<PageMetadata
				title="Danh sách trường Đại học"
				description="Khám phá danh sách các trường đại học tại Việt Nam"
			/>

			<div className="flex-1 bg-background p-4 md:p-8">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-semibold text-foreground mb-6 text-center">
						Danh sách các trường Đại học
					</h1>

					{/* Filters */}
					<div className="mb-6 space-y-3">
						<p className="text-sm font-medium text-muted-foreground">
							Lọc trường
						</p>
						<div className="flex flex-wrap gap-3">
							<select
								value={selectedType}
								onChange={(e) => setSelectedType(e.target.value)}
								className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
							>
								<option value={ALL}>Tất cả loại trường</option>
								<option value="Public">Trường công</option>
								<option value="Private">Trường tư</option>
							</select>

							<select
								value={selectedAutonomy}
								onChange={(e) => setSelectedAutonomy(e.target.value)}
								className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
							>
								<option value={ALL}>Tất cả</option>
								<option value="autonomous">Tự chủ tài chính</option>
								<option value="non-autonomous">Chưa tự chủ tài chính</option>
							</select>
						</div>
					</div>

					{/* Results count */}
					{!loading && !error && (
						<p className="text-sm text-muted-foreground mb-4">
							{filtered.length} trường
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
									Không tìm thấy trường nào phù hợp với bộ lọc.
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
}) => (
	<Link to="/danh-sach-truong/$universityId" params={{ universityId: String(u.id) }} className="block">
		<Card className="shadow-sm hover:shadow-md transition-shadow border-border bg-card cursor-pointer">
		<CardContent className="p-4">
			<div className="flex items-center gap-4">
				{/* Logo */}
				<div className="flex-shrink-0">
					<div className="w-14 h-14 rounded-xl bg-card dark:bg-[#181818] border border-border/70 flex items-center justify-center overflow-hidden p-2.5">
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
					<p className="font-semibold text-foreground leading-snug">{u.name}</p>
					<p className="text-xs text-muted-foreground mt-0.5">{u.code}</p>
					<div className="flex flex-wrap gap-1.5 mt-2">
						<Badge variant="outline" className="text-xs border-border">
							{u.type === "Public" ? "Trường công" : "Trường tư"}
						</Badge>
						{u.isFinanciallyAutonomous === true && (
							<Badge variant="outline" className="text-xs border-border">
								Tự chủ tài chính
							</Badge>
						)}
						{u.isFinanciallyAutonomous === false && (
							<Badge variant="outline" className="text-xs border-border text-muted-foreground">
								Chưa tự chủ tài chính
							</Badge>
						)}
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
	</Link>
);

export default UniversitiesPage;
