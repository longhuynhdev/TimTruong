import type { UniversityResult, UniversityListItem, ExamType } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5309";

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
  tuitionFee: number | null;
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
  const response = await fetch(`${API_BASE_URL}/api/v1/universities`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Search for university recommendations
 */
export async function searchUniversities(
  score: number,
  examType: ExamType,
  subjectCombination?: string
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
      subjectCombinations: examType === "THPTQG" ? [major.subjectCombination] : undefined,
      thptScores: examType === "THPTQG"
        ? {
            year2025: major.admissionScore,
            year2024: major.admissionScore,
            year2023: major.admissionScore,
          }
        : undefined,
      dgnlScores: examType === "ĐGNL"
        ? {
            year2025: major.admissionScore,
            year2024: major.admissionScore,
            year2023: major.admissionScore,
          }
        : undefined,
    }))
  );
}
