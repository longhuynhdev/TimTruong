import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import type * as React from "react";
import { RankingBadges } from "@/components/RankingBadges";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Ranking } from "@/types";
import { FeatureRow } from "./FeatureRow";

/**
 * Homepage features section — sits below the LogoCloud. Each row pairs a real
 * product feature with a small, on-brand vignette built from the app's own
 * components. Swap any vignette for a recorded GIF by dropping an <img> in its
 * place.
 */
export function FeaturesSection() {
	const navigate = useNavigate();

	return (
		<section className="px-4 pb-24 pt-2">
			<div className="mx-auto max-w-[1040px]">
				<div className="mx-auto mb-2 max-w-xl text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.07em] text-primary">
						Tính năng
					</p>
					<h2 className="mt-2.5 text-balance text-[clamp(1.5rem,3.4vw,2.125rem)] font-semibold leading-tight text-foreground">
						TimTruong có mọi thứ bạn cần để chọn đúng trường
					</h2>
					<p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
						Từ gợi ý trường theo điểm thi của bạn đến danh sách trường, xu hướng điểm chuẩn và tổ
						hợp môn,..
					</p>
				</div>

				<FeatureRow
					eyebrow="Đề xuất trường dựa theo điểm thi THPTQG, ĐGNL,..."
					title="Tìm trường dựa theo điểm thi của bạn"
					description="Nhập điểm THPTQG hoặc ĐGNL — TimTruong giúp tìm ngay những trường, những ngành trong tầm với của bạn."
					cta="Tìm trường ngay"
					onCtaClick={() => navigate({ to: "/tim-kiem" })}
				>
					<SearchVignette />
				</FeatureRow>

				<FeatureRow
					reverse
					eyebrow="Danh sách trường đại học"
					title="Với đầy đủ thông tin của 64 trường đại học ở TP.HCM"
					description="Lọc theo loại trường, học phí, ký túc xá và nhiều tiêu chí khác để nhanh chóng tìm được ngôi trường phù hợp với định hướng của bạn."
					cta="Xem danh sách trường"
					onCtaClick={() => navigate({ to: "/danh-sach-truong" })}
				>
					<DirectoryVignette />
				</FeatureRow>

				<FeatureRow
					eyebrow="Xu hướng điểm chuẩn"
					title="Nắm bắt biến động điểm chuẩn qua từng năm"
					description="Không chỉ cung cấp điểm số mới nhất, TimTruong giúp bạn theo dõi xu hướng điểm chuẩn và học phí qua nhiều năm để đánh giá chính xác hơn khả năng trúng tuyển của mình."
					cta="Xem chi tiết trường"
					onCtaClick={() => navigate({ to: "/danh-sach-truong" })}
				>
					<TrendVignette />
				</FeatureRow>

				<FeatureRow
					reverse
					eyebrow="Danh sách tổ hợp môn"
					title="Tra cứu nhanh mọi tổ hợp môn xét tuyển THPTQG"
					description="Tìm nhanh các môn thuộc từng tổ hợp kể cả những tổ hợp lạ như X06, X26,... để lựa chọn phương thức xét tuyển phù hợp."
					cta="Xem tổ hợp môn"
					onCtaClick={() => navigate({ to: "/to-hop-mon" })}
				>
					<CombosVignette />
				</FeatureRow>
			</div>
		</section>
	);
}

/* ── vignettes ─────────────────────────────────────────────────────────── */

function VignetteFrame({ children }: { children: React.ReactNode }) {
	return (
		<div className="rounded-xl border bg-muted/40 p-5 shadow-sm dark:bg-muted/20">
			{children}
		</div>
	);
}

function SearchVignette() {
	return (
		<VignetteFrame>
			<Card className="gap-4 py-4 shadow-md">
				<CardContent className="flex flex-col gap-3.5">
					<p className="text-center text-sm text-muted-foreground">
						Nhập điểm thi dự kiến của bạn
					</p>
					<Input
						value="950"
						readOnly
						className="text-center text-lg font-semibold"
					/>
					<div className="flex justify-center gap-2.5">
						<Badge variant="outline" className="px-4 py-1.5 text-sm">THPTQG</Badge>
						<Badge  className="px-4 py-1.5 text-sm">
							ĐGNL
						</Badge>
					</div>
					<Button className="w-full">
						<Search />
						Tìm trường phù hợp
					</Button>
				</CardContent>
			</Card>
		</VignetteFrame>
	);
}

const SAMPLE_RANKINGS: Ranking[] = [
	{ system: "VNUR", year: 2025, rankFrom: 5, rankTo: 5, sourceUrl: null },
];

function DirectoryVignette() {
	return (
		<VignetteFrame>
			<div className="mb-3 flex flex-wrap gap-2">
				<Badge>Trường công lập</Badge>
				<Badge variant="outline">Có ký túc xá</Badge>
				<Badge variant="outline">Đã tự chủ</Badge>
			</div>
			<Card className="py-3.5">
				<CardContent className="flex items-center gap-3">
					<UniversityLogo
						name="Trường Đại học Khoa học Tự nhiên"
						imageUrl="/universities-logo/hcmus.png"
						className="h-12 w-12 p-2"
						fallbackClassName="text-sm"
					/>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-semibold leading-snug text-foreground">
							Trường Đại học Khoa học Tự nhiên
						</p>
						<p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
							Mã trường
							<Badge className="font-mono text-xs">QST</Badge>
						</p>
						<RankingBadges rankings={SAMPLE_RANKINGS} className="mt-1.5" />
					</div>
					<ChevronRight className="size-5 shrink-0 text-muted-foreground" />
				</CardContent>
			</Card>
		</VignetteFrame>
	);
}

function TrendVignette() {
	const values = [26.5, 27.2, 27.8, 28.0];
	const W = 380;
	const H = 150;
	const P = 26;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const pad = Math.max((max - min) * 0.25, 0.4);
	const lo = min - pad;
	const hi = max + pad;
	const y0 = 2026 - values.length + 1;
	const x = (i: number) => P + (i / (values.length - 1)) * (W - 2 * P);
	const y = (v: number) => H - P - ((v - lo) / (hi - lo)) * (H - 2 * P);
	const line = values
		.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
		.join(" ");
	const area = `${line} L${x(values.length - 1).toFixed(1)} ${H - P} L${x(0).toFixed(1)} ${H - P} Z`;

	return (
		<VignetteFrame>
			<Card className="py-4">
				<CardContent>
					<p className="mb-1 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
						Xu hướng điểm chuẩn · Khoa học máy tính
					</p>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative marketing vignette */}
					<svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden>
						{[0, 0.5, 1].map((t) => (
							<line
								key={t}
								x1={P}
								x2={W - P}
								y1={P + t * (H - 2 * P)}
								y2={P + t * (H - 2 * P)}
								stroke="var(--border)"
								strokeOpacity="0.6"
							/>
						))}
						<path
							d={area}
							fill="var(--primary)"
							fillOpacity="0.1"
							stroke="none"
						/>
						<path
							d={line}
							fill="none"
							stroke="var(--primary)"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						{values.map((v, i) => (
							<g key={`${y0 + i}`}>
								<circle cx={x(i)} cy={y(v)} r="3.5" fill="var(--primary)" />
								<text
									x={x(i)}
									y={H - 8}
									textAnchor="middle"
									fontSize="10"
									fill="var(--muted-foreground)"
								>
									{y0 + i}
								</text>
								<text
									x={x(i)}
									y={y(v) - 9}
									textAnchor="middle"
									fontSize="10"
									fontWeight="600"
									fill="var(--foreground)"
								>
									{v}
								</text>
							</g>
						))}
					</svg>
				</CardContent>
			</Card>
		</VignetteFrame>
	);
}

const SAMPLE_COMBOS = [
	{ code: "A00", subjects: "Toán, Vật lý, Hóa học" },
	{ code: "A01", subjects: "Toán, Vật lý, Tiếng Anh" },
	{ code: "B00", subjects: "Toán, Hóa học, Sinh học" },
	{ code: "C00", subjects: "Ngữ văn, Lịch sử, Địa lý" },
];

function CombosVignette() {
	return (
		<VignetteFrame>
			<Card className="py-3.5">
				<CardContent className="flex flex-col">
					{SAMPLE_COMBOS.map((c, i) => (
						<div
							key={c.code}
							className={`flex items-center gap-3 py-2.5 ${i ? "border-t border-border" : ""}`}
						>
							<Badge variant="outline" className="font-mono text-sm">
								{c.code}
							</Badge>
							<span className="text-sm text-muted-foreground">
								{c.subjects}
							</span>
						</div>
					))}
				</CardContent>
			</Card>
		</VignetteFrame>
	);
}
