import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { RequirementsTable } from "@/components/RequirementsTable";
import { UniversityLogo } from "@/components/UniversityLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	formatScore,
	isNewMajor,
	latestCutoff,
	majorTuition,
} from "@/lib/majors";
import { cn } from "@/lib/utils";
import type {
	ExamType,
	MajorWithRequirements,
	UniversityResult,
} from "@/types";

const PAGE_SIZE = 10;

const EXAM_LABEL: Record<ExamType, string> = {
	THPTQG: "THPT",
	ĐGNL: "ĐGNL",
};

interface UniversityResultsProps {
	results: UniversityResult[];
	/** Exam type the user searched with — chỉ dùng cho dòng tóm tắt điểm chuẩn. */
	examType: ExamType;
}

const MajorResult = ({
	major: m,
	examType,
}: {
	major: MajorWithRequirements;
	examType: ExamType;
}) => {
	const [open, setOpen] = useState(false);
	const tuition = majorTuition(m);
	const quota = m.years[0]?.enrollmentQuota ?? null;
	const cutoff = latestCutoff(m, examType);
	const isNew = isNewMajor(m);

	const cutoffText = cutoff
		? cutoff.min === cutoff.max
			? formatScore(cutoff.min)
			: `${formatScore(cutoff.min)}–${formatScore(cutoff.max)}`
		: null;

	return (
		<div className="rounded-lg border border-border bg-background/60 p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					{/* Name + Ngành mới */}
					<div className="flex flex-wrap items-start gap-2">
						<span className="font-medium leading-snug text-foreground">
							{m.name}
						</span>
						{isNew && (
							<Badge
								variant="outline"
								className="border-primary/40 text-[10px] text-primary"
							>
								Ngành mới
							</Badge>
						)}
					</div>

					{/* Meta: điểm chuẩn mới nhất · học phí · chỉ tiêu */}
					<div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
						<span>
							{cutoffText ? (
								<>
									Điểm chuẩn {EXAM_LABEL[examType]} {cutoff?.year}:{" "}
									<span className="font-medium tabular-nums text-foreground">
										{cutoffText}
									</span>
								</>
							) : (
								"Chưa công bố điểm chuẩn"
							)}
						</span>
						{tuition && <span>Học phí: {tuition}</span>}
						{quota != null && (
							<span>
								Chỉ tiêu: <span className="tabular-nums">{quota}</span>
							</span>
						)}
					</div>
				</div>

				{/* Toggle — icon-only on mobile so it doesn't float apart from the
				 * text column above; full label returns from sm: up. */}
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					aria-expanded={open}
					aria-label={open ? "Ẩn" : isNew ? "Xem tổ hợp" : "Xem điểm chuẩn"}
					className="inline-flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-md p-1.5 text-sm font-medium text-primary hover:bg-primary/10 sm:p-0 sm:hover:bg-transparent sm:hover:underline"
				>
					<span className="hidden sm:inline">
						{open ? "Ẩn" : isNew ? "Xem tổ hợp" : "Xem điểm chuẩn"}
					</span>
					<ChevronDown
						className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
					/>
				</button>
			</div>

			{open && <RequirementsTable requirements={m.admissionRequirements} />}
		</div>
	);
};

const UniversityResults = ({ results, examType }: UniversityResultsProps) => {
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	// Reset pagination whenever a new search returns a fresh results array.
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset is keyed on the results array
	useEffect(() => setVisibleCount(PAGE_SIZE), [results]);
	const visible = results.slice(0, visibleCount);
	const remaining = results.length - visible.length;

	return (
		<div className="space-y-4">
			<h2 className="mb-4 text-xl font-semibold text-foreground">
				Kết quả tìm kiếm ({results.length} trường phù hợp)
			</h2>

			{visible.map((result) => (
				<Card
					key={result.universityId}
					className="border-border bg-card shadow-sm transition-shadow hover:shadow-md"
				>
					<CardContent className="space-y-4 p-5 sm:p-6">
						{/* University header */}
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0">
								<UniversityLogo
									name={result.universityName}
									imageUrl={result.logo}
									className="h-16 w-16 p-2.5"
									fallbackClassName="text-sm"
								/>
							</div>
							<div className="min-w-0 flex-1">
								<h3 className="text-lg font-semibold leading-tight text-foreground">
									{result.universityName}
								</h3>
								<p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
									<span>
										Mã trường:{" "}
										<span className="font-mono text-foreground">
											{result.universityCode}
										</span>
									</span>
									<span aria-hidden>·</span>
									<span>
										{result.universityType === "Public"
											? "Công lập"
											: "Tư thục"}
									</span>
								</p>
							</div>
						</div>

						{/* Matching majors */}
						<div className="space-y-3">
							{result.majors.map((m) => (
								<MajorResult key={m.id} major={m} examType={examType} />
							))}
						</div>
					</CardContent>
				</Card>
			))}

			{remaining > 0 && (
				<div className="flex justify-center pt-2">
					<Button
						variant="outline"
						onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
					>
						Xem thêm {remaining} trường
					</Button>
				</div>
			)}
		</div>
	);
};

export default UniversityResults;
