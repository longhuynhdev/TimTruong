import type { SubjectCombo, HelpItem, SubjectCombinationDetail } from "@/types";

// Full subject combination data (single source of truth)
export const SUBJECT_COMBINATIONS_FULL: SubjectCombinationDetail[] = [
  {
    code: "A00",
    name: "Khối A00",
    subjects: ["Toán", "Vật lý", "Hóa học"],
  },
  {
    code: "A01",
    name: "Khối A01",
    subjects: ["Toán", "Vật lý", "Tiếng Anh"],
  },
  {
    code: "B00",
    name: "Khối B00",
    subjects: ["Toán", "Hóa học", "Sinh học"],
  },
  {
    code: "C00",
    name: "Khối C00",
    subjects: ["Ngữ văn", "Lịch sử", "Địa lý"],
  },
  {
    code: "D01",
    name: "Khối D01",
    subjects: ["Toán", "Ngữ văn", "Tiếng Anh"],
  },
  {
    code: "D07",
    name: "Khối D07",
    subjects: ["Toán", "Hóa học", "Tiếng Anh"],
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
