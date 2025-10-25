import type { UniversityResult, ScoreType } from "@/types";

// API base URL - update this based on your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5309";

interface RecommendationRequest {
  examType: 0 | 1; // 0 = THPTQG, 1 = ĐGNL
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
 * Fetches university recommendations from the API
 */
export const searchUniversities = async (
  score: number,
  scoreType: ScoreType,
  subjectCombination?: string
): Promise<UniversityResult[]> => {
  const requestBody: RecommendationRequest = {
    examType: scoreType,
    score,
    subjectCombination,
  };

  try {
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

    // Transform API response to match UniversityResult interface
    return transformRecommendations(data.recommendations, scoreType);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};

/**
 * Transforms API response to UniversityResult format
 */
function transformRecommendations(
  recommendations: UniversityRecommendation[],
  scoreType: ScoreType
): UniversityResult[] {
  const results: UniversityResult[] = [];

  // Flatten university recommendations into individual university-major pairs
  for (const university of recommendations) {
    for (const major of university.majors) {
      results.push({
        id: `${university.universityId}-${major.majorId}`,
        universityName: university.universityName,
        major: major.majorName,
        logo: university.universityImageUrl || "",
        subjectCombinations:
          scoreType === 0 ? [major.subjectCombination] : undefined,
        thptScores:
          scoreType === 0
            ? {
                year2025: major.admissionScore,
                year2024: major.admissionScore,
                year2023: major.admissionScore,
              }
            : undefined,
        dgnlScores:
          scoreType === 1
            ? {
                year2025: major.admissionScore,
                year2024: major.admissionScore,
                year2023: major.admissionScore,
              }
            : undefined,
      });
    }
  }

  return results;
}