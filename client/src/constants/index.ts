import type { SubjectCombo, HelpItem } from "@/types";

// Available subject combinations for THPTQG
export const SUBJECT_COMBINATIONS: SubjectCombo[] = [
  { code: "A00", name: "Toán, Lí, Hóa" },
  { code: "A01", name: "Toán, Lí, Anh" },
  { code: "B00", name: "Toán, Hóa, Sinh" },
  { code: "C00", name: "Văn, Sử, Địa" },
  { code: "D01", name: "Toán, Văn, Anh" },
  { code: "D07", name: "Toán, Hóa, Anh" },
];

// Help items for subject combination popup
export const HELP_ITEMS: HelpItem[] = [
  {
    title: "Tổ hợp A00: Toán, Lý, Hóa",
    description: "Phù hợp cho ngành Kỹ thuật, Công nghệ",
  },
  {
    title: "Tổ hợp A01: Toán, Lý, Anh",
    description: "Phù hợp cho ngành Công nghệ Thông tin",
  },
  {
    title: "Tổ hợp B00: Toán, Hóa, Sinh",
    description: "Phù hợp cho ngành Y Dược, Sinh học",
  },
  {
    title: "Tổ hợp C00: Văn, Sử, Địa",
    description: "Phù hợp cho ngành Khoa học Xã hội",
  },
  {
    title: "Tổ hợp D01: Toán, Văn, Anh",
    description: "Phù hợp cho ngành Ngôn ngữ, Kinh tế",
  },
  {
    title: "Tổ hợp D07: Toán, Hóa, Anh",
    description: "Phù hợp cho ngành Kinh tế, Quản trị",
  },
];

// Score ranges for validation
export const SCORE_RANGES = {
  THPTQG: { min: 9, max: 30 },
  ĐGNL: { min: 300, max: 1200 }
} as const;
