// Simple string enums matching the backend
export type ExamType = "THPTQG" | "ĐGNL";

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

// Subject combination with full display information
export interface SubjectCombinationDetail {
	code: string;
	// readonly: subject arrays are data — they should never be mutated
	subjects: readonly string[];
	description?: string;
}
