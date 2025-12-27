import type { SubjectCombo, HelpItem } from "@/types";

// Available subject combinations for THPTQG
export const SUBJECT_COMBINATIONS: SubjectCombo[] = [
  { code: "A00" },
  { code: "A01" },
  { code: "B00" },
  { code: "C00" },
  { code: "D01" },
  { code: "D07" },
];

// Help items for subject combination popup
export const HELP_ITEMS: HelpItem[] = [
  {
    title: "A00: Toán, Vật lý, Hóa học",
  },
  {
    title: "A01: Toán, Vật lý, tiếng Anh",
  },
  {
    title: "B00: Toán, Hóa học, Sinh học",
  },
  {
    title: "C00: Ngữ văn, Lịch sử, Địa lý",
  },
  {
    title: "D01: Toán, Ngữ Văn, tiếng Anh",
  },
  {
    title: "D07: Toán, Hóa học, tiếng Anh",
  },
];

// Score ranges for validation
export const SCORE_RANGES = {
  THPTQG: { min: 9, max: 30 },
  ĐGNL: { min: 300, max: 1200 },
} as const;
