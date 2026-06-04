import type {
	ExamType,
	TuitionFeeUnit,
	UniversityListItem,
	UniversityMajors,
	UniversityResult,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5309";

/** GET `path` (relative to the API base) and parse the JSON body, throwing on a non-2xx response. */
async function getJson<T>(path: string): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`);
	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}
	return response.json();
}

// API Request/Response types
interface RecommendationRequest {
	examType: ExamType;
	score: number;
	subjectCombination?: string;
}

interface MajorRecommendation {
	majorId: number;
	majorName: string;
	majorCode: string | null;
	fieldOfStudy: string;
	tuitionFeeMin: number | null;
	tuitionFeeMax: number | null;
	tuitionFeeUnit: TuitionFeeUnit | null;
	enrollmentQuota: number | null;
	admissionScore: number;
	subjectCombination: string;
	year: number;
}

interface UniversityRecommendation {
	universityId: number;
	universityName: string;
	universityCode: string;
	universityType: string;
	universityImageUrl: string | null;
	majors: MajorRecommendation[];
}

interface RecommendationResponse {
	recommendations: UniversityRecommendation[];
}

/**
 * Fetch all universities for the universities listing page
 */
export async function fetchAllUniversities(): Promise<UniversityListItem[]> {
	return getJson("/api/v1/universities");
}

/**
 * Fetch a single university by ID
 */
export async function fetchUniversityById(
	id: number,
): Promise<UniversityListItem> {
	return getJson(`/api/v1/universities/${id}`);
}

/**
 * Fetch a single university by its URL slug (used by the SEO-friendly detail route)
 */
export async function fetchUniversityBySlug(
	slug: string,
): Promise<UniversityListItem> {
	return getJson(`/api/v1/universities/by-slug/${encodeURIComponent(slug)}`);
}

/**
 * Fetch all majors with admission requirements for a university
 */
export async function fetchUniversityMajors(
	id: number,
): Promise<UniversityMajors> {
	return getJson(`/api/v1/universities/${id}/majors`);
}

/**
 * Search for university recommendations
 */
export async function searchUniversities(
	score: number,
	examType: ExamType,
	subjectCombination?: string,
): Promise<UniversityResult[]> {
	const requestBody: RecommendationRequest = {
		examType,
		score,
		subjectCombination,
	};

	const response = await fetch(`${API_BASE_URL}/api/v1/recommendations`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	const data: RecommendationResponse = await response.json();

	// Transform API response to UI format
	return data.recommendations.flatMap((university) =>
		university.majors.map((major) => ({
			id: `${university.universityId}-${major.majorId}`,
			universityName: university.universityName,
			major: major.majorName,
			logo: university.universityImageUrl ?? null,
			subjectCombinations:
				examType === "THPTQG" ? [major.subjectCombination] : undefined,
			thptScores:
				examType === "THPTQG"
					? {
							year2025: major.admissionScore,
							year2024: major.admissionScore,
							year2023: major.admissionScore,
						}
					: undefined,
			dgnlScores:
				examType === "ĐGNL"
					? {
							year2025: major.admissionScore,
							year2024: major.admissionScore,
							year2023: major.admissionScore,
						}
					: undefined,
		})),
	);
}
