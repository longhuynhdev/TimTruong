import type {
	AdmissionRequirement,
	ExamType,
	MajorWithRequirements,
} from "@/types";

/** Format a điểm chuẩn: drop trailing zeros (24 not 24.00, 24.5 not 24.50). */
export function formatScore(score: number): string {
	return score % 1 === 0
		? score.toFixed(0)
		: score.toFixed(2).replace(/\.?0+$/, "");
}

export const TUITION_UNIT_LABEL: Record<string, string> = {
	PerCredit: "tín chỉ",
	PerSemester: "học kỳ",
	PerYear: "năm",
};

/** Format a tuition fee as a concrete amount (max null) or a range (min – max). */
export function formatTuition(
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

/** Group requirements by examType. */
export function groupRequirements(reqs: AdmissionRequirement[]) {
	const byType: Record<string, AdmissionRequirement[]> = {};
	for (const r of reqs) {
		(byType[r.examType] ??= []).push(r);
	}
	return byType;
}

export function uniqueSorted<T>(arr: T[]): T[] {
	return [...new Set(arr)].sort() as T[];
}

/** One merged group of combos plus its per-year score line (years ascending). */
export interface ScoreSeries {
	combos: string[]; // merged combos that share the same per-year scores, e.g. ["A00","A01"]
	points: { year: number; score: number | null }[]; // null = chưa công bố
}

/** All score series for one exam type (one chart facet / one table block). */
export interface ExamSeries {
	examType: string;
	years: number[]; // ascending
	series: ScoreSeries[];
}

/**
 * Build per-exam-type merged score series from a major's requirements — the single
 * source of truth behind both the điểm-chuẩn table and the trend chart. Combos whose
 * per-year score signature is identical (incl. nulls) merge into one series, so a school
 * where A00/A01/D01/D07 share the same cutoff each year shows one line/column, while a
 * combo missing some years stays separate. Years are ascending (the table reverses for
 * display). A block with no combos collapses to a single series with `combos: []`.
 */
export function buildScoreSeries(reqs: AdmissionRequirement[]): ExamSeries[] {
	const byType = groupRequirements(reqs);
	return Object.keys(byType)
		.sort()
		.map((examType) => {
			const rows = byType[examType];
			const years = uniqueSorted(rows.map((r) => r.year));
			const combos = uniqueSorted(
				rows.map((r) => r.subjectCombination ?? ""),
			).filter(Boolean);

			// year → combo → score ("" combo when the school lists no tổ hợp).
			const lookup: Record<number, Record<string, number | null>> = {};
			for (const r of rows) {
				(lookup[r.year] ??= {})[r.subjectCombination ?? ""] = r.score;
			}

			const keys = combos.length > 0 ? combos : [""];
			const bySig = new Map<string, string[]>();
			const order: string[][] = [];
			for (const combo of keys) {
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
					order.push(arr);
				}
			}

			const series: ScoreSeries[] = order.map((group) => ({
				combos: combos.length > 0 ? group : [],
				points: years.map((y) => ({
					year: y,
					score: lookup[y]?.[group[0]] ?? null,
				})),
			}));

			return { examType, years, series };
		});
}

/** ≥2 distinct years with a published (non-null) score — enough to draw a trend. */
export function hasScoreTrend(s: ExamSeries): boolean {
	const scoredYears = new Set<number>();
	for (const series of s.series) {
		for (const p of series.points) {
			if (p.score != null) scoredYears.add(p.year);
		}
	}
	return scoredYears.size >= 2;
}

export const hasPublishedScore = (m: MajorWithRequirements) =>
	m.admissionRequirements.some((r) => r.score != null);

// "Ngành mới": the school published the combos (đề án) but no cutoff in any year yet.
// A major with no admission-requirement rows at all is "chưa có dữ liệu", not new.
export const isNewMajor = (m: MajorWithRequirements) =>
	m.admissionRequirements.length > 0 && !hasPublishedScore(m);

/**
 * Latest-year điểm chuẩn for a major, scoped to one exam type (so THPT's 0–30
 * scale never mixes with ĐGNL's 0–1200). Picks the most recent year that has a
 * published cutoff, then the min/max score across combos that year.
 * Returns null when the major has no published cutoff for this exam type.
 */
export function latestCutoff(
	m: MajorWithRequirements,
	examType: ExamType,
): { year: number; min: number; max: number } | null {
	const scored = m.admissionRequirements.filter(
		(r) => r.examType === examType && r.score != null,
	);
	if (scored.length === 0) return null;
	const year = Math.max(...scored.map((r) => r.year));
	const scores = scored
		.filter((r) => r.year === year)
		.map((r) => r.score as number);
	return { year, min: Math.min(...scores), max: Math.max(...scores) };
}

/** Latest-year tuition string for a major, or null when not published. */
export const majorTuition = (m: MajorWithRequirements): string | null => {
	const latest = m.years[0];
	return latest?.tuitionFeeMin != null
		? formatTuition(
				latest.tuitionFeeMin,
				latest.tuitionFeeMax,
				latest.tuitionFeeUnit,
			)
		: null;
};
