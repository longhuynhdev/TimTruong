import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import PageMetadata from "@/components/PageMetadata";
import UniversityResults from "@/components/UniversityResults";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SUBJECT_COMBINATIONS } from "@/constants";
import { normalizeVi } from "@/lib/utils";
import { dgnlScoreSchema, thptqgScoreSchema } from "@/lib/validations";
import { Route } from "@/routes/tim-kiem";
import { searchUniversities } from "@/services/api";
import type { ExamType, UniversityResult } from "@/types";

const SearchPage = () => {
	// Read URL search params — typed and validated by the schema in tim-kiem.tsx
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	// Form state — initialized from URL so back/forward navigation restores the form
	const [score, setScore] = useState(search.score ?? "");
	// examType defaults to THPTQG when not in URL
	const [examType, setExamType] = useState<ExamType>(
		search.examType ?? "THPTQG",
	);
	const [selectedSubject, setSelectedSubject] = useState(
		search.subject ?? "",
	);

	// UI-only state (not in URL)
	const [validationError, setValidationError] = useState("");
	const [searchResults, setSearchResults] = useState<UniversityResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [comboOpen, setComboOpen] = useState(false);
	const [comboSearch, setComboSearch] = useState("");

	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		};
	}, []);

	// validateScore takes examType as a parameter (no closure dependency)
	const validateScore = useCallback(
		(scoreValue: string, type: ExamType): string | null => {
			if (!scoreValue.trim()) return null;
			const numericScore = parseFloat(scoreValue);
			if (Number.isNaN(numericScore)) return "Vui lòng nhập số hợp lệ";
			try {
				if (type === "ĐGNL") {
					dgnlScoreSchema.parse(numericScore);
				} else {
					thptqgScoreSchema.parse(numericScore);
				}
				return null;
			} catch (error) {
				if (error instanceof z.ZodError) return error.issues[0].message;
				return null;
			}
		},
		[],
	);

	// Extracted so it can be called both on submit and on auto-search
	const performSearch = useCallback(
		async (
			scoreVal: string,
			examTypeVal: ExamType,
			subjectVal: string | undefined,
		) => {
			setIsLoading(true);
			try {
				const results = await searchUniversities(
					parseFloat(scoreVal),
					examTypeVal,
					subjectVal,
				);
				setSearchResults(results);
				setHasSearched(true);
			} catch (error) {
				toast.error("Có lỗi xảy ra khi tìm kiếm", {
					description: "Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.",
				});
				console.error("Search API error:", error);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	// Auto-search on mount when URL already has valid params (e.g. shared/bookmarked URL)
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally mount-only
	useEffect(() => {
		const et = search.examType ?? "THPTQG";
		if (search.score && !validateScore(search.score, et)) {
			performSearch(search.score, et, search.subject);
		}
	}, []);

	// Debounced score validation while typing
	useEffect(() => {
		if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
		if (score.trim()) {
			debounceTimerRef.current = setTimeout(() => {
				const error = validateScore(score, examType);
				if (error) setValidationError(error);
			}, 800);
		}
	}, [score, examType, validateScore]);

	const handleExamTypeSelect = (type: ExamType) => {
		setExamType(type);
		setValidationError("");
		setScore("");
		setSelectedSubject("");
		setSearchResults([]);
		setHasSearched(false);
	};

	const handleSubjectSelect = (subjectCode: string) => {
		setSelectedSubject(selectedSubject === subjectCode ? "" : subjectCode);
		setValidationError("");
	};

	const isValidScore = () =>
		score.trim() !== "" && validateScore(score, examType) === null;

	const handleSearch = async () => {
		if (!score.trim()) {
			setValidationError("Vui lòng nhập điểm");
			return;
		}
		const scoreError = validateScore(score, examType);
		if (scoreError) {
			setValidationError(scoreError);
			return;
		}
		if (examType === "THPTQG" && !selectedSubject) {
			setValidationError("Vui lòng chọn tổ hợp môn");
			return;
		}
		setValidationError("");

		// Update URL — makes this search shareable and bookmarkable
		// e.g. /tim-kiem?score=24.5&examType=THPTQG&subject=A00
		navigate({
			search: {
				score,
				examType,
				subject: selectedSubject || undefined,
			},
		});

		await performSearch(score, examType, selectedSubject || undefined);
	};

	const handleScoreBlur = () => {
		const error = validateScore(score, examType);
		if (error) setValidationError(error);
		else if (score.trim()) setValidationError("");
	};

	return (
		<>
			<PageMetadata
				title="Tìm trường"
				description="Tìm trường đại học phù hợp dựa theo điểm thi trung học phổ thông quốc gia (THPTQG) hoặc điểm thi đánh giá năng lực (ĐGNL) của bạn"
			/>
			<div className="flex-1 bg-background p-4 md:p-8">
				<div className="max-w-2xl mx-auto">
					<Card className="shadow-lg bg-card border-border">
						<CardHeader className="pb-4">
							<CardTitle className="text-center text-foreground text-xl md:text-2xl">
								Tìm trường đại học phù hợp theo điểm
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Score Input */}
							<div className="space-y-2">
								<p className="text-base text-muted-foreground">
									Nhập điểm thi dự kiến của bạn
								</p>
								<Input
									type="text"
									inputMode="decimal"
									value={score}
									onChange={(e) => {
										setScore(e.target.value);
										setValidationError("");
									}}
									onBlur={handleScoreBlur}
									placeholder={examType === "THPTQG" ? "9-30" : "300-1200"}
									className={`text-center text-lg font-medium bg-input border-border text-foreground placeholder:text-muted-foreground ${
										validationError ? "border-red-500" : ""
									}`}
								/>
								{validationError && (
									<p className="text-sm text-red-500 text-center">
										{validationError}
									</p>
								)}
								<p className="text-base text-muted-foreground">
									Nhập loại kỳ thi của bạn
								</p>
							</div>

							{/* Score Type Selection */}
							<div className="flex gap-3 justify-center">
								<Badge
									variant={examType === "THPTQG" ? "default" : "outline"}
									className={`cursor-pointer px-6 py-3 text-base transition-colors ${
										examType === "THPTQG"
											? "bg-primary hover:bg-primary/90 text-primary-foreground"
											: "hover:bg-accent hover:text-accent-foreground border-border"
									}`}
									onClick={() => handleExamTypeSelect("THPTQG")}
								>
									THPTQG
								</Badge>
								<Badge
									variant={examType === "ĐGNL" ? "default" : "outline"}
									className={`cursor-pointer px-6 py-3 text-base transition-colors ${
										examType === "ĐGNL"
											? "bg-primary hover:bg-primary/90 text-primary-foreground"
											: "hover:bg-accent hover:text-accent-foreground border-border"
									}`}
									onClick={() => handleExamTypeSelect("ĐGNL")}
								>
									ĐGNL
								</Badge>
							</div>

							{/* Subject Combinations (only show for THPTQG) */}
							{examType === "THPTQG" && (
								<div className="space-y-4">
									<p className="text-base text-muted-foreground">
										Nhập tổ hợp môn của bạn
									</p>

									<Popover open={comboOpen} onOpenChange={setComboOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={comboOpen}
												className="w-full justify-between bg-input border-border text-foreground hover:bg-accent hover:text-accent-foreground"
											>
												{selectedSubject
													? (() => {
															const combo = SUBJECT_COMBINATIONS.find(
																(c) => c.code === selectedSubject,
															);
															return combo
																? `${combo.code}: ${combo.subjects.join(", ")}`
																: selectedSubject;
														})()
													: "Chọn tổ hợp môn..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="p-0 w-[--radix-popover-trigger-width]"
											align="start"
											onOpenAutoFocus={(e) => e.preventDefault()}
										>
											<div className="flex items-center border-b border-border px-3">
												<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
												<input
													className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
													placeholder="Tìm tổ hợp..."
													value={comboSearch}
													onChange={(e) => setComboSearch(e.target.value)}
												/>
											</div>
											<div className="max-h-60 overflow-y-auto">
												{SUBJECT_COMBINATIONS.filter((combo) => {
													const q = normalizeVi(comboSearch);
													return (
														normalizeVi(combo.code).includes(q) ||
														combo.subjects.some((s) =>
															normalizeVi(s).includes(q),
														)
													);
												}).length === 0 ? (
													<p className="py-6 text-center text-sm text-muted-foreground">
														Không tìm thấy tổ hợp.
													</p>
												) : (
													SUBJECT_COMBINATIONS.filter((combo) => {
														const q = normalizeVi(comboSearch);
														return (
															normalizeVi(combo.code).includes(q) ||
															combo.subjects.some((s) =>
																normalizeVi(s).includes(q),
															)
														);
													}).map((combo) => (
														<div
															key={combo.code}
															className={`flex items-center gap-2 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
																selectedSubject === combo.code
																	? "bg-accent text-accent-foreground"
																	: ""
															}`}
															onClick={() => {
																handleSubjectSelect(combo.code);
																setComboSearch("");
																setComboOpen(false);
															}}
														>
															<Check
																className={`h-4 w-4 shrink-0 ${
																	selectedSubject === combo.code
																		? "opacity-100"
																		: "opacity-0"
																}`}
															/>
															<span className="font-medium">{combo.code}</span>
															<span className="text-muted-foreground">
																{combo.subjects.join(", ")}
															</span>
														</div>
													))
												)}
											</div>
										</PopoverContent>
									</Popover>
								</div>
							)}

							{/* Search Button */}
							<Button
								className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-medium transition-colors"
								disabled={!score.trim() || !isValidScore() || isLoading}
								onClick={handleSearch}
							>
								{isLoading ? "Đang tìm kiếm..." : "Tìm trường phù hợp ngay"}
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Results Section — wider than the form */}
				{hasSearched && (
					<div className="max-w-4xl mx-auto mt-8">
						{searchResults.length > 0 ? (
							<UniversityResults results={searchResults} examType={examType} />
						) : (
							<Card className="shadow-sm border-border bg-card">
								<CardContent className="p-6 text-center">
									<p className="text-muted-foreground">
										Không tìm thấy trường nào phù hợp với điểm số của bạn. Hãy
										thử điều chỉnh điểm số hoặc tổ hợp môn.
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				)}
			</div>
		</>
	);
};

export default SearchPage;
