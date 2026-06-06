import type {
	ExamType,
	MajorWithRequirements,
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
