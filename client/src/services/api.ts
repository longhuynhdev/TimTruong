import type {
	ExamType,
	MajorWithRequirements,
	SubjectCombinationDetailData,
	SubjectCombinationSummary,
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

interface UniversityRecommendation {
	universityId: number;
	universityName: string;
	universityCode: string;
	universityType: "Public" | "Private";
	universityImageUrl: string | null;
	// Full major shape, same as GET /universities/{id}/majors.
	majors: MajorWithRequirements[];
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

// Memoize the combinations list — both the subject-combinations page and the
// search form's combo picker share it, so we only hit the API once per session.
let subjectCombinationsPromise: Promise<SubjectCombinationSummary[]> | null =
	null;

/**
 * Fetch all subject combinations (server enum) with usage counts. Cached after the
 * first call; pass `force` to re-fetch.
 */
export function fetchSubjectCombinations(
	force = false,
): Promise<SubjectCombinationSummary[]> {
	if (force || !subjectCombinationsPromise) {
		subjectCombinationsPromise = getJson<SubjectCombinationSummary[]>(
			"/api/v1/subject-combinations",
		).catch((err) => {
			// Don't cache a rejected promise — let the next call retry.
			subjectCombinationsPromise = null;
			throw err;
		});
	}
	return subjectCombinationsPromise;
}

/**
 * Fetch the universities + majors that admit by a given subject combination
 */
export async function fetchSubjectCombinationDetail(
	code: string,
): Promise<SubjectCombinationDetailData> {
	return getJson(`/api/v1/subject-combinations/${encodeURIComponent(code)}`);
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

	// Map each matched university straight through; majors already carry their full
	// admission requirements (all combos/years/exam types).
	return data.recommendations.map((u) => ({
		universityId: u.universityId,
		universityName: u.universityName,
		universityCode: u.universityCode,
		universityType: u.universityType,
		logo: u.universityImageUrl ?? null,
		majors: u.majors,
	}));
}
