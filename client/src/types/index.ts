// Simple string enums matching the backend
export type ExamType = "THPTQG" | "ĐGNL";
export type SubjectCombination = "A00" | "A01" | "A02" | "B00" | "B01" | "C00" | "D01" | "D07";

// University search result
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

// Simple subject combination for display
export interface SubjectCombo {
  code: string;
  name: string;
}

export interface HelpItem {
  title: string;
  description: string;
}
