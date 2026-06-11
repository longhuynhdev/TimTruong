import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { Area, LinePath } from "@visx/shape";
import { defaultStyles, TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { ExternalLink } from "lucide-react";
import {
	formatAcademicYear,
	formatTuition,
	TUITION_UNIT_LABEL,
} from "@/lib/majors";
import type { MajorYear } from "@/types";

interface MajorTuitionHistoryProps {
	/** Newest-first, as the API returns them. */
	years: MajorYear[];
}

const LINE_COLOR = "#2563eb";

const HEIGHT = 180;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 40 };

interface TuitionPoint {
	year: number;
	min: number;
	max: number | null;
}

interface TooltipDatum extends TuitionPoint {
	unit: string | null;
}

/** Đơn vị null hiển thị như "/năm" (xem formatTuition) — gộp chung khi xét vẽ chart. */
const unitKey = (y: MajorYear) => y.tuitionFeeUnit ?? "PerYear";

const TuitionChart = ({
	points,
	unit,
	width,
}: {
	points: TuitionPoint[];
	unit: string | null;
	width: number;
}) => {
	const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
	const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;

	const {
		tooltipData,
		tooltipLeft,
		tooltipTop,
		tooltipOpen,
		showTooltip,
		hideTooltip,
	} = useTooltip<TooltipDatum>();

	const years = points.map((p) => p.year);
	const values = points.flatMap((p) => [p.min, p.max ?? p.min]);
	const minVal = Math.min(...values);
	const maxVal = Math.max(...values);
	// Pad so a flat line doesn't hug the edges (≥0.5tr when flat).
	const pad = Math.max((maxVal - minVal) * 0.15, 500_000);

	const xScale = scaleLinear<number>({
		domain: [Math.min(...years), Math.max(...years)],
		range: [0, innerW],
	});
	const yScale = scaleLinear<number>({
		domain: [Math.max(0, minVal - pad), maxVal + pad],
		range: [innerH, 0],
		nice: true,
	});

	const fmtMillions = (v: number) => {
		const m = v / 1_000_000;
		return m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
	};

	return (
		<div className="relative" style={{ width }}>
			<svg width={width} height={HEIGHT} className="text-muted-foreground">
				<Group left={MARGIN.left} top={MARGIN.top}>
					<GridRows
						scale={yScale}
						width={innerW}
						numTicks={4}
						stroke="currentColor"
						strokeOpacity={0.12}
					/>
					<AxisLeft
						scale={yScale}
						numTicks={4}
						tickFormat={(v) => fmtMillions(v as number)}
						stroke="currentColor"
						tickStroke="currentColor"
						tickLength={4}
						tickLabelProps={() => ({
							fill: "currentColor",
							fontSize: 10,
							textAnchor: "end",
							dx: -2,
							dy: 3,
						})}
					/>
					<AxisBottom
						top={innerH}
						scale={xScale}
						tickValues={years}
						tickFormat={(v) => String(v)}
						stroke="currentColor"
						tickStroke="currentColor"
						tickLength={4}
						tickLabelProps={() => ({
							fill: "currentColor",
							fontSize: 10,
							textAnchor: "middle",
							dy: 2,
						})}
					/>
					{/* Dải min–max cho các năm công bố khoảng học phí. */}
					<Area
						data={points}
						defined={(p) => p.max != null}
						x={(p) => xScale(p.year)}
						y0={(p) => yScale(p.min)}
						y1={(p) => yScale(p.max ?? p.min)}
						fill={LINE_COLOR}
						fillOpacity={0.12}
					/>
					<LinePath
						data={points}
						x={(p) => xScale(p.year)}
						y={(p) => yScale(p.min)}
						stroke={LINE_COLOR}
						strokeWidth={2}
						strokeLinecap="round"
					/>
					{points.map((p) => (
						<circle
							key={p.year}
							cx={xScale(p.year)}
							cy={yScale(p.min)}
							r={3}
							fill={LINE_COLOR}
						/>
					))}
					{points.map((p) => (
						<circle
							key={`hover-${p.year}`}
							cx={xScale(p.year)}
							cy={yScale(p.min)}
							r={10}
							fill="transparent"
							className="cursor-pointer"
							onMouseMove={() =>
								showTooltip({
									tooltipData: { ...p, unit },
									tooltipLeft: MARGIN.left + xScale(p.year),
									tooltipTop: MARGIN.top + yScale(p.min),
								})
							}
							onMouseLeave={hideTooltip}
						/>
					))}
				</Group>
			</svg>
			{tooltipOpen && tooltipData && (
				<TooltipWithBounds
					top={tooltipTop}
					left={tooltipLeft}
					style={{
						...defaultStyles,
						background: "var(--popover, #fff)",
						color: "var(--popover-foreground, #111)",
						border: "1px solid var(--border, #e5e7eb)",
						borderRadius: 6,
						padding: "6px 8px",
						fontSize: 12,
						lineHeight: 1.4,
						pointerEvents: "none",
					}}
				>
					<div className="font-medium tabular-nums">
						Năm học {formatAcademicYear(tooltipData.year)}
					</div>
					<div className="text-muted-foreground">
						{formatTuition(tooltipData.min, tooltipData.max, tooltipData.unit)}
					</div>
				</TooltipWithBounds>
			)}
		</div>
	);
};

/**
 * Per-year tuition/quota history for one major: a table of every MajorYear row
 * (newest first), plus a trend chart when ≥2 years have a published tuition AND
 * share the same unit — tuition per credit and per year are not comparable on
 * one axis. Renders nothing with fewer than 2 year rows (no history to show;
 * the majors table already carries the latest figures).
 */
const MajorTuitionHistory = ({ years }: MajorTuitionHistoryProps) => {
	if (years.length < 2) return null;

	const priced = years.filter((y) => y.tuitionFeeMin != null);
	const sameUnit = new Set(priced.map(unitKey)).size === 1;
	const chartPoints: TuitionPoint[] =
		priced.length >= 2 && sameUnit
			? priced
					.map((y) => ({
						year: y.year,
						min: y.tuitionFeeMin as number, // priced filters out null tuitionFeeMin
						max: y.tuitionFeeMax,
					}))
					.sort((a, b) => a.year - b.year)
			: [];
	const chartUnit = priced[0]?.tuitionFeeUnit ?? null;
	const chartUnitLabel = chartUnit
		? (TUITION_UNIT_LABEL[chartUnit] ?? "năm")
		: "năm";

	return (
		<div className="mt-4 space-y-4">
			<div>
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
					Học phí · chỉ tiêu theo năm
				</p>
				<div className="overflow-x-auto rounded-md border border-border">
					<table className="w-full border-collapse text-xs">
						<thead>
							<tr className="bg-muted/40">
								<th className="border-b border-border px-3 py-2 text-center font-medium text-muted-foreground">
									Năm học
								</th>
								<th className="border-b border-l border-border px-3 py-2 text-center font-medium text-muted-foreground">
									Học phí
								</th>
								<th className="border-b border-l border-border px-3 py-2 text-center font-medium text-muted-foreground">
									Chỉ tiêu
								</th>
							</tr>
						</thead>
						<tbody>
							{years.map((y) => (
								<tr
									key={y.year}
									className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
								>
									<td className="px-3 py-2 text-center font-medium text-foreground tabular-nums whitespace-nowrap">
										{formatAcademicYear(y.year)}
										{y.sourceUrl && (
											<a
												href={y.sourceUrl}
												target="_blank"
												rel="noopener noreferrer"
												title="Nguồn (đề án tuyển sinh)"
												onClick={(e) => e.stopPropagation()}
												className="ml-1 inline-flex align-middle text-muted-foreground hover:text-primary"
											>
												<ExternalLink className="h-3 w-3" />
											</a>
										)}
									</td>
									<td className="border-l border-border px-3 py-2 text-center tabular-nums text-foreground">
										{y.tuitionFeeMin != null
											? formatTuition(
													y.tuitionFeeMin,
													y.tuitionFeeMax,
													y.tuitionFeeUnit,
												)
											: "—"}
									</td>
									<td className="border-l border-border px-3 py-2 text-center tabular-nums text-foreground">
										{y.enrollmentQuota ?? "—"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			{chartPoints.length > 0 && (
				<div>
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
						Xu hướng học phí · triệu đồng/{chartUnitLabel}
					</p>
					<div className="rounded-md border border-border p-2">
						<ParentSize>
							{({ width }) =>
								width > 0 ? (
									<TuitionChart
										points={chartPoints}
										unit={chartUnit}
										width={width}
									/>
								) : null
							}
						</ParentSize>
					</div>
				</div>
			)}
		</div>
	);
};

export default MajorTuitionHistory;
