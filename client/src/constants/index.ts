import type { SubjectCombinationDetail } from "@/types";

// `as const` preserves literal types for each `code` (e.g. "A00" not just string)
// `satisfies SubjectCombinationDetail[]` type-checks every entry at compile time
export const SUBJECT_COMBINATIONS = [
	{ code: "A00", subjects: ["Toán", "Vật lý", "Hóa học"] },
	{ code: "A01", subjects: ["Toán", "Vật lý", "Tiếng Anh"] },
	{ code: "A02", subjects: ["Toán", "Vật lý", "Sinh học"] },
	{ code: "B00", subjects: ["Toán", "Hóa học", "Sinh học"] },
	{ code: "C00", subjects: ["Ngữ văn", "Lịch sử", "Địa lý"] },
	{ code: "C10", subjects: ["Ngữ văn", "Lịch sử", "Hóa học"] },
	{ code: "D01", subjects: ["Toán", "Ngữ văn", "Tiếng Anh"] },
	{ code: "D04", subjects: ["Toán", "Ngữ văn", "Tiếng Trung"] },
	{ code: "D07", subjects: ["Toán", "Hóa học", "Tiếng Anh"] },
	{ code: "D08", subjects: ["Toán", "Sinh học", "Tiếng Anh"] },
	{ code: "D09", subjects: ["Toán", "Lịch sử", "Tiếng Anh"] },
	{ code: "D14", subjects: ["Ngữ văn", "Lịch sử", "Tiếng Anh"] },
	{ code: "D15", subjects: ["Ngữ văn", "Địa lý", "Tiếng Anh"] },
	{ code: "X02", subjects: ["Toán", "Ngữ văn", "Tin học"] },
	{ code: "X03", subjects: ["Toán", "Ngữ văn", "Công nghệ công nghiệp"] },
	{ code: "X04", subjects: ["Toán", "Ngữ văn", "Công nghệ nông nghiệp"] },
	{ code: "X06", subjects: ["Toán", "Vật lý", "Tin Học"] },
	{ code: "X26", subjects: ["Toán", "Tiếng Anh", "Tin Học"] },
] as const satisfies SubjectCombinationDetail[];

// Derived from the constant — automatically stays in sync when entries are added/removed.
// Type is: "A00" | "A01" | "B00" | "C00" | "C10" | "D01" | ... (all 15)
export type SubjectCombinationCode =
	(typeof SUBJECT_COMBINATIONS)[number]["code"];

// Score ranges for validation
export const SCORE_RANGES = {
	THPTQG: { min: 9, max: 30 },
	ĐGNL: { min: 300, max: 1200 },
} as const;
