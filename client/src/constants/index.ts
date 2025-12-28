import type { SubjectCombo, HelpItem, SubjectCombinationDetail } from "@/types";

// Full subject combination data (single source of truth)
export const SUBJECT_COMBINATIONS_FULL: SubjectCombinationDetail[] = [
  {
    code: "A00",
    subjects: ["Toán", "Vật lý", "Hóa học"],
  },
  {
    code: "A01",
    subjects: ["Toán", "Vật lý", "Tiếng Anh"],
  },
  {
    code: "B00",
    subjects: ["Toán", "Hóa học", "Sinh học"],
  },
  {
    code: "C00",
    subjects: ["Ngữ văn", "Lịch sử", "Địa lý"],
  },
  {
    code: "C10",
    subjects: ["Ngữ văn", "Lịch sử", "Hóa học"],
  },
  {
    code: "D01",
    subjects: ["Toán", "Ngữ văn", "Tiếng Anh"],
  },
  {
    code: "D04",
    subjects: ["Toán", "Ngữ văn", "Tiếng Trung"],
  },
  {
    code: "D07",
    subjects: ["Toán", "Hóa học", "Tiếng Anh"],
  },
  {
    code: "D08",
    subjects: ["Toán", "Sinh học", "Tiếng Anh"],
  },
  {
    code: "D09",
    subjects: ["Toán", "Lịch sử", "Tiếng Anh"],
  },
  {
    code: "D14",
    subjects: ["Ngữ văn", "Lịch sử", "Tiếng Anh"],
  },
  {
    code: "D15",
    subjects: ["Ngữ văn", "Địa lý", "Tiếng Anh"],
  },
  {
    code: "X02",
    subjects: ["Toán", "Ngữ văn", "Tin học"],
  },
  {
    code: "X03",
    subjects: ["Toán", "Ngữ văn", "Công nghệ công nghiệp"],
  },
  {
    code: "X04",
    subjects: ["Toán", "Ngữ văn", "Công nghệ nông nghiệp"],
  },
];

// Available subject combinations for THPTQG (backward compatibility)
export const SUBJECT_COMBINATIONS: SubjectCombo[] = SUBJECT_COMBINATIONS_FULL.map(
  (combo) => ({ code: combo.code })
);

// Help items for subject combination popup (backward compatibility)
export const HELP_ITEMS: HelpItem[] = SUBJECT_COMBINATIONS_FULL.map(
  (combo) => ({
    title: `${combo.code}: ${combo.subjects.join(", ")}`,
  })
);

// Score ranges for validation
export const SCORE_RANGES = {
  THPTQG: { min: 9, max: 30 },
  ĐGNL: { min: 300, max: 1200 },
} as const;
