import type { SubjectCombination, HelpItem } from "@/types";

export const SUBJECT_COMBINATIONS: SubjectCombination[] = [
  { code: "A00" },
  { code: "A01" },
  { code: "B00" },
  { code: "C00" },
  { code: "D01" },
  { code: "D07" },
];

export const HELP_ITEMS: HelpItem[] = [
  {
    title: "Tổ hợp A00: Toán, Lý, Hóa",
    description: "",
  },
  {
    title: "Tổ hợp A01: Toán, Lý, Anh",
    description: "",
  },
  {
    title: "Tổ hợp B00: Toán, Hóa, Sinh",
    description: "",
  },
  {
    title: "Tổ hợp C00: Văn, Sử, Địa",
    description: "",
  },
  {
    title: "Tổ hợp D01: Văn, Toán, Anh",
    description: "",
  },
  {
    title: "Tổ hợp D07: Toán, Hóa, Anh",
    description: "",
  },
];

export const SCORE_RANGES = {
  THPTQG: { min: 9, max: 30 },
  DGNL: { min: 300, max: 1200 }
} as const;