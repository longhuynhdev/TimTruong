import { UniversityLogo } from "@/components/UniversityLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ExamType, UniversityResult } from "@/types";

interface UniversityResultsProps {
	results: UniversityResult[];
	examType: ExamType;
}

const UniversityResults = ({ results, examType }: UniversityResultsProps) => {
	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold text-foreground mb-4">
				Kết quả tìm kiếm ({results.length} trường phù hợp)
			</h2>

			{results.map((result) => (
				<Card
					key={result.id}
					className="shadow-sm hover:shadow-md transition-shadow border-border bg-card"
				>
					<CardContent className="p-5 sm:p-6">
						<div className="flex items-start gap-5">
							{/* University Logo */}
							<div className="flex-shrink-0">
								<UniversityLogo
									name={result.universityName}
									imageUrl={result.logo}
									className="w-20 h-20 p-3"
									fallbackClassName="text-base"
								/>
							</div>

							{/* University Info */}
							<div className="flex-1 min-w-0">
								<div className="space-y-3">
									{/* University Name and Major */}
									<div>
										<h3 className="font-semibold text-foreground text-xl leading-tight">
											{result.universityName}
										</h3>
										<p className="text-muted-foreground text-base mt-1">
											{result.major}
										</p>
									</div>

									{/* Subject Combinations (for THPTQG) */}
									{examType === "THPTQG" && result.subjectCombinations && (
										<div className="space-y-2">
											<p className="text-sm font-medium text-foreground">
												Tổ hợp môn:
											</p>
											<div className="flex flex-wrap gap-2">
												{result.subjectCombinations.map((combo) => (
													<Badge
														key={combo}
														variant="outline"
														className="text-sm border-border"
													>
														{combo}
													</Badge>
												))}
											</div>
										</div>
									)}

									{/* Scores */}
									{(() => {
										const scores =
											examType === "THPTQG"
												? result.thptScores
												: result.dgnlScores;
										if (!scores) return null;
										const byYear = [
											["2025", scores.year2025],
											["2024", scores.year2024],
											["2023", scores.year2023],
										] as const;
										return (
											<div className="space-y-2">
												<p className="text-sm font-medium text-foreground">
													Điểm {examType === "THPTQG" ? "THPT" : "ĐGNL"} các
													năm:
												</p>
												<div className="grid grid-cols-3 gap-4 max-w-xs">
													{byYear.map(([year, value]) => (
														<div key={year} className="text-center">
															<p className="text-xs text-muted-foreground">
																{year}
															</p>
															<p className="text-base font-semibold text-foreground">
																{value}
															</p>
														</div>
													))}
												</div>
											</div>
										);
									})()}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default UniversityResults;
