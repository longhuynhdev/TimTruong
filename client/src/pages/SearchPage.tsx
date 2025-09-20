import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HelpPopover } from "@/components/ui/help-popover";
import UniversityResults from "@/components/UniversityResults";
import { searchUniversities } from "@/utils/mockData";
import type { UniversityResult, ScoreType } from "@/types";
import { z } from "zod";
import { dgnlScoreSchema, thptqgScoreSchema } from "@/lib/validations";
import { SUBJECT_COMBINATIONS, HELP_ITEMS } from "@/constants";

const SearchPage = () => {
  const [score, setScore] = useState("");
  const [selectedScoreType, setSelectedScoreType] = useState<ScoreType | null>(
    "THPTQG"
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<UniversityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (selectedScoreType) {
      setValidationError(null);
    }
  }, [selectedScoreType]);

  const handleScoreTypeSelect = (type: ScoreType) => {
    setSelectedScoreType(type);
    setValidationError(null);
    setScore("");
    setSearchResults([]);
    setHasSearched(false);
    if (type === "ĐGNL") {
      setSelectedSubject(null);
    }
  };

  const handleSubjectSelect = (subjectCode: string) => {
    setSelectedSubject(selectedSubject === subjectCode ? null : subjectCode);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  const handleScoreChange = (value: string) => {
    setScore(value);
    setValidationError(null);
  };

  const handleScoreBlur = () => {
    validateInput();
  };

  const validateScore = async () => {
    if (!selectedScoreType || !score.trim()) return false;

    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) {
      setValidationError("Vui lòng nhập số hợp lệ");
      return false;
    }

    try {
      if (selectedScoreType === "ĐGNL") {
        dgnlScoreSchema.parse(numericScore);
      } else {
        thptqgScoreSchema.parse(numericScore);
      }

      if (selectedScoreType === "THPTQG" && !selectedSubject) {
        setValidationError("Vui lòng chọn tổ hợp môn");
        return false;
      }

      setIsLoading(true);
      setValidationError(null);

      try {
        const results = await searchUniversities(
          numericScore,
          selectedScoreType,
          selectedSubject || undefined
        );
        setSearchResults(results);
        setHasSearched(true);
      } catch {
        setValidationError("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }

      return true;
    } catch (error) {
      if (
        error instanceof z.ZodError &&
        error.issues &&
        error.issues.length > 0
      ) {
        setValidationError(error.issues[0].message);
      }
      return false;
    }
  };

  const isValidScore = () => {
    if (!selectedScoreType || !score.trim()) return false;

    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) return false;

    try {
      if (selectedScoreType === "ĐGNL") {
        dgnlScoreSchema.parse(numericScore);
      } else {
        thptqgScoreSchema.parse(numericScore);
      }
      return true;
    } catch {
      return false;
    }
  };

  const validateInput = () => {
    if (!selectedScoreType || !score.trim()) {
      setValidationError(null);
      return;
    }

    const numericScore = parseFloat(score);
    if (isNaN(numericScore)) {
      setValidationError("Vui lòng nhập số hợp lệ");
      return;
    }

    try {
      if (selectedScoreType === "ĐGNL") {
        dgnlScoreSchema.parse(numericScore);
      } else {
        thptqgScoreSchema.parse(numericScore);
      }
      setValidationError(null);
    } catch (error) {
      if (
        error instanceof z.ZodError &&
        error.issues &&
        error.issues.length > 0
      ) {
        setValidationError(error.issues[0].message);
      }
    }
  };

  const getScorePlaceholder = () => {
    return selectedScoreType === "THPTQG" ? "9-30" : "300-1200";
  };

  return (
    <div className="flex-1 bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-foreground text-xl md:text-2xl">
              Nhập tổng điểm tốt nghiệp hoặc điểm ĐGNL của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Input */}
            <div className="space-y-2">
              <Input
                type="text"
                value={score}
                onChange={(e) => handleScoreChange(e.target.value)}
                onBlur={handleScoreBlur}
                placeholder={getScorePlaceholder()}
                className={`text-center text-lg font-medium bg-input border-border text-foreground placeholder:text-muted-foreground ${
                  validationError ? "border-red-500" : ""
                }`}
                tabIndex={1}
              />
              {validationError && (
                <p className="text-sm text-red-500 text-center">
                  {validationError}
                </p>
              )}
              <p className="text-sm text-muted-foreground text-center">
                Nhập loại điểm của bạn
              </p>
            </div>

            {/* Score Type Selection */}
            <div className="flex gap-3 justify-center">
              <Badge
                variant={selectedScoreType === "THPTQG" ? "default" : "outline"}
                className={`cursor-pointer px-6 py-3 text-base transition-colors ${
                  selectedScoreType === "THPTQG"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground border-border"
                }`}
                onClick={() => handleScoreTypeSelect("THPTQG")}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => handleScoreTypeSelect("THPTQG"))
                }
                tabIndex={2}
              >
                THPTQG
              </Badge>
              <Badge
                variant={selectedScoreType === "ĐGNL" ? "default" : "outline"}
                className={`cursor-pointer px-6 py-3 text-base transition-colors ${
                  selectedScoreType === "ĐGNL"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground border-border"
                }`}
                onClick={() => handleScoreTypeSelect("ĐGNL")}
                onKeyDown={(e) =>
                  handleKeyDown(e, () => handleScoreTypeSelect("ĐGNL"))
                }
                tabIndex={3}
              >
                ĐGNL
              </Badge>
            </div>

            {/* Subject Combinations (only show for THPTQG) */}
            {selectedScoreType === "THPTQG" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <p className="text-base text-muted-foreground">
                    Nhập tổ hợp của bạn
                  </p>
                  <HelpPopover
                    title="Hướng dẫn tổ hợp môn"
                    helpItems={HELP_ITEMS}
                    align="start"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {SUBJECT_COMBINATIONS.map((combo, index) => (
                    <Badge
                      key={combo.code}
                      variant={
                        selectedSubject === combo.code ? "default" : "outline"
                      }
                      className={`cursor-pointer px-4 py-2 text-base transition-colors ${
                        selectedSubject === combo.code
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground border-border"
                      }`}
                      onClick={() => handleSubjectSelect(combo.code)}
                      onKeyDown={(e) =>
                        handleKeyDown(e, () => handleSubjectSelect(combo.code))
                      }
                      tabIndex={4 + index}
                    >
                      {combo.code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search Button */}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-medium transition-colors"
              disabled={
                !selectedScoreType ||
                !score.trim() ||
                !isValidScore() ||
                isLoading
              }
              onClick={validateScore}
              onKeyDown={(e) => handleKeyDown(e, validateScore)}
              tabIndex={10}
            >
              {isLoading ? "Đang tìm kiếm..." : "Tìm trường phù hợp ngay"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {hasSearched && (
          <div className="mt-8">
            {searchResults.length > 0 ? (
              <UniversityResults
                results={searchResults}
                scoreType={selectedScoreType as ScoreType}
              />
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
    </div>
  );
};

export default SearchPage;
