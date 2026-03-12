// Simple string enums matching the backend
export type ExamType = "THPTQG" | "ĐGNL";
export type SubjectCombination = "A00" | "A01" | "B00" | "C00" | "D01" | "D07";

// University search result
export interface UniversityResult {
	id: string;
	universityName: string;
	major: string;
	logo: string | null;
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

// University list item (for the universities listing page)
export interface CampusLocation {
	city: string;
	district: string | null;
}

export interface UniversityListItem {
	id: number;
	name: string;
	shortName: string | null;
	englishName: string | null;
	code: string;
	type: "Public" | "Private";
	imageUrl: string | null;
	isFinanciallyAutonomous: boolean;
	campuses: CampusLocation[];
}

// Simple subject combination for display
export interface SubjectCombo {
	code: string;
}

export interface HelpItem {
	title: string;
}

// Detailed subject combination with full information
export interface SubjectCombinationDetail {
	code: string;
	subjects: string[];
	description?: string;
}
