// Simple string enums matching the backend
export type ExamType = "THPTQG" | "ĐGNL";
export type TuitionFeeUnit = "PerCredit" | "PerSemester" | "PerYear";

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

export interface Dormitory {
	name: string;
	address: string | null;
	note: string | null;
	registrationUrl: string | null;
}

// A university's rank in one ranking system for a given year.
// rankTo encodes the shape: == rankFrom → single rank; > rankFrom → closed band;
// null → open band (e.g. "1001+").
export interface Ranking {
	system: string; // "VNUR" | "QS" | "THE" | "CWUR"
	year: number;
	rankFrom: number;
	rankTo: number | null;
	sourceUrl: string | null;
}

export interface UniversityListItem {
	id: number;
	name: string;
	slug: string | null;
	shortName: string | null;
	englishName: string | null;
	code: string;
	type: "Public" | "Private";
	imageUrl: string | null;
	isFinanciallyAutonomous: boolean | null;
	hasDormitory: boolean | null;
	campuses: CampusLocation[];
	dormitories: Dormitory[];
	rankings: Ranking[];
}

// University detail — admission requirements and majors
export interface AdmissionRequirement {
	id: number;
	examType: string;
	score: number;
	subjectCombination: string | null;
	year: number;
}

export interface MajorWithRequirements {
	id: number;
	name: string;
	code: string | null;
	tuitionFeeAmount: number | null;
	tuitionFeeUnit: TuitionFeeUnit | null;
	enrollmentQuota: number | null;
	admissionRequirements: AdmissionRequirement[];
}

export interface UniversityMajors {
	universityId: number;
	universityName: string;
	universityCode: string;
	majors: MajorWithRequirements[];
}

// Subject combination with full display information
export interface SubjectCombinationDetail {
	code: string;
	// readonly: subject arrays are data — they should never be mutated
	subjects: readonly string[];
	description?: string;
}
