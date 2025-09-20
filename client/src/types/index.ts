export interface UniversityResult {
  id: string;
  universityName: string;
  major: string;
  logo: string;
  subjectCombinations?: string[];
  thptScores?: {
    year2025: number;
    year2024: number;
    year2023: number;
  };
  dgnlScores?: {
    year2025: number;
    year2024: number;
    year2023: number;
  };
}

export type ScoreType = "THPTQG" | "ĐGNL";

export interface SubjectCombination {
  code: string;
  name?: string;
}

export interface HelpItem {
  title: string;
  description: string;
}