// Simple string enums matching the backend
export type ExamType = "THPTQG" | "ĐGNL";
export type TuitionFeeUnit = "PerCredit" | "PerSemester" | "PerYear";

// University search result — a matched university with the qualifying majors,
// each carrying its full admission requirements (all combos/years/exam types).
export interface UniversityResult {
	universityId: number;
	universityName: string;
	universityCode: string;
	universityType: "Public" | "Private";
	logo: string | null;
	majors: MajorWithRequirements[];
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
	oldName: string | null;
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
	// null = tổ hợp có xét nhưng chưa công bố điểm chuẩn (ngành mới / chưa tới mùa)
	score: number | null;
	subjectCombination: string | null;
	year: number;
	// Nguồn công bố điểm chuẩn — thường dùng chung cho cả trường-năm
	sourceUrl: string | null;
}

// Per-year offering data (tuition, quota).
// tuitionFeeMax is null for a concrete amount, set for a range.
export interface MajorYear {
	year: number;
	tuitionFeeMin: number | null;
	tuitionFeeMax: number | null;
	tuitionFeeUnit: TuitionFeeUnit | null;
	enrollmentQuota: number | null;
	// Chú thích tuyển sinh năm đó (vd "tuyển theo phương thức riêng")
	note: string | null;
	// Nguồn học phí và nguồn chỉ tiêu — tách riêng vì có trường công bố ở 2 trang;
	// chung 1 đề án thì hai field cùng một URL
	tuitionSourceUrl: string | null;
	quotaSourceUrl: string | null;
}

export interface MajorWithRequirements {
	id: number;
	name: string;
	code: string | null;
	years: MajorYear[];
	admissionRequirements: AdmissionRequirement[];
}

export interface UniversityMajors {
	universityId: number;
	universityName: string;
	universityCode: string;
	majors: MajorWithRequirements[];
}

// Subject combinations — sourced from the server (GET /api/v1/subject-combinations).
// The server enum is the single source of truth for the list + subject names.

// One combination with how many universities/majors currently admit by it.
export interface SubjectCombinationSummary {
	code: string;
	subjects: string[];
	universityCount: number;
	majorCount: number;
}

export interface SubjectCombinationMajor {
	id: number;
	name: string;
	code: string | null;
}

export interface SubjectCombinationUniversity {
	id: number;
	name: string;
	slug: string | null;
	code: string;
	majors: SubjectCombinationMajor[];
}

// Detail for one combination — universities (each with their matching majors).
export interface SubjectCombinationDetailData {
	code: string;
	subjects: string[];
	universities: SubjectCombinationUniversity[];
}
