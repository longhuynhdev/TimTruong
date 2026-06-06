import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { defaultStyles, TooltipWithBounds, useTooltip } from "@visx/tooltip";
import {
	buildScoreSeries,
	type ExamSeries,
	formatScore,
	hasScoreTrend,
	type ScoreSeries,
} from "@/lib/majors";
import type { AdmissionRequirement } from "@/types";

interface MajorScoreChartProps {
	requirements: AdmissionRequirement[];
}

// Small palette — merging keeps the line count low (usually 1–3 per facet).
const PALETTE = ["#2563eb", "#16a34a", "#db2777", "#d97706", "#7c3aed"];

const examTypeLabel = (examType: string) =>
	examType === "THPTQG" ? "Tốt nghiệp THPT" : "Đánh giá năng lực";

const seriesLabel = (s: ScoreSeries) =>
	s.combos.length > 0 ? s.combos.join(", ") : "ĐHQG-HCM";

const HEIGHT = 200;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 40 };

interface TooltipDatum {
	year: number;
	score: number;
	labels: string[]; // every series whose dot sits on this exact point
}

const Facet = ({ block, width }: { block: ExamSeries; width: number }) => {
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

	const years = block.years;
	const scores = block.series
		.flatMap((s) => s.points.map((p) => p.score))
		.filter((s): s is number => s != null);
	const minScore = Math.min(...scores);
	const maxScore = Math.max(...scores);
	// Pad the score domain so lines don't hug the edges (≥1 point when flat).
	const pad = Math.max((maxScore - minScore) * 0.15, 1);

	const xScale = scaleLinear<number>({
		domain: [Math.min(...years), Math.max(...years)],
		range: [0, innerW],
	});
	const yScale = scaleLinear<number>({
		domain: [minScore - pad, maxScore + pad],
		range: [innerH, 0],
		nice: true,
	});

	// Collapse coincident dots (same year + score across series) so one hover target
	// reports every combo on that point — otherwise stacked dots hide each other.
	const pointGroups = new Map<string, TooltipDatum>();
	for (const s of block.series) {
		const label = seriesLabel(s);
		for (const p of s.points) {
			if (p.score == null) continue;
			const key = `${p.year}|${p.score}`;
			const g = pointGroups.get(key);
			if (g) g.labels.push(label);
			else
				pointGroups.set(key, {
					year: p.year,
					score: p.score,
					labels: [label],
				});
		}
	}

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
						tickFormat={(v) => formatScore(v as number)}
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
					{block.series.map((s, i) => {
						const color = PALETTE[i % PALETTE.length];
						return (
							<Group key={seriesLabel(s)}>
								<LinePath
									data={s.points}
									defined={(p) => p.score != null}
									x={(p) => xScale(p.year)}
									y={(p) => yScale(p.score ?? 0)}
									stroke={color}
									strokeWidth={2}
									strokeLinecap="round"
								/>
								{s.points.map((p) =>
									p.score != null ? (
										<circle
											key={p.year}
											cx={xScale(p.year)}
											cy={yScale(p.score)}
											r={3}
											fill={color}
										/>
									) : null,
								)}
							</Group>
						);
					})}
					{/* One hover target per coincident point — reports every combo there. */}
					{[...pointGroups.values()].map((g) => (
						<circle
							key={`${g.year}|${g.score}`}
							cx={xScale(g.year)}
							cy={yScale(g.score)}
							r={10}
							fill="transparent"
							className="cursor-pointer"
							onMouseMove={() =>
								showTooltip({
									tooltipData: g,
									tooltipLeft: MARGIN.left + xScale(g.year),
									tooltipTop: MARGIN.top + yScale(g.score),
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
						Năm: {tooltipData.year}, Điểm: {formatScore(tooltipData.score)}
					</div>
					{tooltipData.labels.map((label) => (
						<div key={label} className="font-mono text-muted-foreground">
							{label}
						</div>
					))}
				</TooltipWithBounds>
			)}
		</div>
	);
};

/**
 * Trend chart of điểm chuẩn over years, one faceted line chart per exam type (THPTQG and
 * ĐGNL never share a Y axis — different score scales). Renders nothing unless a facet has
 * ≥2 years of published scores, so single-year majors fall back to the table alone.
 */
const MajorScoreChart = ({ requirements }: MajorScoreChartProps) => {
	const blocks = buildScoreSeries(requirements).filter(hasScoreTrend);
	if (blocks.length === 0) return null;

	return (
		<div className="mt-4 space-y-4">
			{blocks.map((block) => (
				<div key={block.examType}>
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
						Xu hướng điểm chuẩn · {examTypeLabel(block.examType)}
					</p>
					<div className="rounded-md border border-border p-2">
						<div className="flex flex-wrap gap-x-3 gap-y-1 px-1 pb-1">
							{block.series.map((s, i) => (
								<span
									key={seriesLabel(s)}
									className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
								>
									<span
										className="inline-block h-2 w-2 rounded-full"
										style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
									/>
									<span className="font-mono">{seriesLabel(s)}</span>
								</span>
							))}
						</div>
						<ParentSize>
							{({ width }) =>
								width > 0 ? <Facet block={block} width={width} /> : null
							}
						</ParentSize>
					</div>
				</div>
			))}
		</div>
	);
};

export default MajorScoreChart;
