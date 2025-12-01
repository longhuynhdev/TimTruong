import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UniversityResult, ExamType } from "@/types";

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
        <Card key={result.id} className="shadow-sm hover:shadow-md transition-shadow border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* University Logo */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                  <img
                    src={result.logo}
                    alt={`${result.universityName} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-xs font-medium text-muted-foreground text-center">${result.universityName.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>
              </div>

              {/* University Info */}
              <div className="flex-1 min-w-0">
                <div className="space-y-3">
                  {/* University Name and Major */}
                  <div>
                    <h3 className="font-semibold text-foreground text-lg leading-tight">
                      {result.universityName}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {result.major}
                    </p>
                  </div>

                  {/* Subject Combinations (for THPTQG) */}
                  {examType === "THPTQG" && result.subjectCombinations && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Tổ hợp môn:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.subjectCombinations.map((combo) => (
                          <Badge key={combo} variant="outline" className="text-xs border-border">
                            {combo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scores */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Điểm {examType === "THPTQG" ? "THPT" : "ĐGNL"} các năm:
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {examType === "THPTQG" && result.thptScores && (
                        <>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">2025</p>
                            <p className="text-sm font-semibold text-foreground">
                              {result.thptScores.year2025}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">2024</p>
                            <p className="text-sm font-semibold text-foreground">
                              {result.thptScores.year2024}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">2023</p>
                            <p className="text-sm font-semibold text-foreground">
                              {result.thptScores.year2023}
                            </p>
                          </div>
                        </>
                      )}
                      {examType === "ĐGNL" && result.dgnlScores && (
                        <>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">2025</p>
                            <p className="text-sm font-semibold text-foreground">
                              {result.dgnlScores.year2025}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">2024</p>
                            <p className="text-sm font-semibold text-foreground">
                              {result.dgnlScores.year2024}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">2023</p>
                            <p className="text-sm font-semibold text-foreground">
                              {result.dgnlScores.year2023}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
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
