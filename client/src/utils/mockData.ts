import type { UniversityResult, ScoreType } from "@/types";

const mockUniversities: UniversityResult[] = [
  {
    id: "1",
    universityName: "Đại học Bách khoa TP Hồ Chí Minh",
    major: "Khoa học máy tính",
    logo: "https://via.placeholder.com/64/0ea5e9/ffffff?text=BK",
    subjectCombinations: ["A00", "A01", "D01"],
    thptScores: {
      year2025: 28.5,
      year2024: 28.0,
      year2023: 27.8,
    },
    dgnlScores: {
      year2025: 1150,
      year2024: 1130,
      year2023: 1120,
    },
  },
  {
    id: "2",
    universityName: "Đại học Quốc gia TP Hồ Chí Minh",
    major: "Công nghệ thông tin",
    logo: "https://via.placeholder.com/64/10b981/ffffff?text=QG",
    subjectCombinations: ["A00", "A01", "D01"],
    thptScores: {
      year2025: 27.8,
      year2024: 27.5,
      year2023: 27.2,
    },
    dgnlScores: {
      year2025: 1120,
      year2024: 1100,
      year2023: 1080,
    },
  },
  {
    id: "3",
    universityName: "Đại học Kinh tế",
    major: "Quản trị kinh doanh",
    logo: "https://via.placeholder.com/64/f59e0b/ffffff?text=KT",
    subjectCombinations: ["C00", "D01", "A01"],
    thptScores: {
      year2025: 26.5,
      year2024: 26.2,
      year2023: 25.8,
    },
    dgnlScores: {
      year2025: 1050,
      year2024: 1030,
      year2023: 1010,
    },
  },
  {
    id: "4",
    universityName: "Đại học Y TP Hồ Chí Minh",
    major: "Y khoa",
    logo: "https://via.placeholder.com/64/ef4444/ffffff?text=YH",
    subjectCombinations: ["A00", "B00", "D07"],
    thptScores: {
      year2025: 29.2,
      year2024: 28.8,
      year2023: 28.5,
    },
    dgnlScores: {
      year2025: 1180,
      year2024: 1160,
      year2023: 1140,
    },
  },
  {
    id: "5",
    universityName: "Đại học Ngoại thương",
    major: "Kinh doanh quốc tế",
    logo: "https://via.placeholder.com/64/8b5cf6/ffffff?text=NT",
    subjectCombinations: ["C00", "D01", "A01"],
    thptScores: {
      year2025: 26.0,
      year2024: 25.8,
      year2023: 25.5,
    },
    dgnlScores: {
      year2025: 1020,
      year2024: 1000,
      year2023: 980,
    },
  },
  {
    id: "6",
    universityName: "Đại học Sư phạm TP Hồ Chí Minh",
    major: "Sư phạm Toán học",
    logo: "https://via.placeholder.com/64/06b6d4/ffffff?text=SP",
    subjectCombinations: ["A00", "A01", "D01"],
    thptScores: {
      year2025: 24.5,
      year2024: 24.2,
      year2023: 23.8,
    },
    dgnlScores: {
      year2025: 950,
      year2024: 930,
      year2023: 910,
    },
  },
  {
    id: "7",
    universityName: "Đại học Luật TP Hồ Chí Minh",
    major: "Luật kinh tế",
    logo: "https://via.placeholder.com/64/84cc16/ffffff?text=LU",
    subjectCombinations: ["C00", "D01"],
    thptScores: {
      year2025: 25.8,
      year2024: 25.5,
      year2023: 25.2,
    },
    dgnlScores: {
      year2025: 1000,
      year2024: 980,
      year2023: 960,
    },
  },
  {
    id: "8",
    universityName: "Đại học Công nghệ",
    major: "Kỹ thuật phần mềm",
    logo: "https://via.placeholder.com/64/f97316/ffffff?text=CN",
    subjectCombinations: ["A00", "A01", "D01"],
    thptScores: {
      year2025: 27.2,
      year2024: 26.8,
      year2023: 26.5,
    },
    dgnlScores: {
      year2025: 1080,
      year2024: 1060,
      year2023: 1040,
    },
  },
];

export const searchUniversities = async (
  score: number,
  scoreType: ScoreType,
  subjectCombination?: string
): Promise<UniversityResult[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return mockUniversities
    .filter((university) => {
      if (scoreType === "THPTQG") {
        const hasSubjectMatch =
          !subjectCombination ||
          university.subjectCombinations?.includes(subjectCombination);

        const minScore = Math.min(
          university.thptScores?.year2025 || 0,
          university.thptScores?.year2024 || 0,
          university.thptScores?.year2023 || 0
        );

        return hasSubjectMatch && score >= minScore - 1;
      } else {
        const minScore = Math.min(
          university.dgnlScores?.year2025 || 0,
          university.dgnlScores?.year2024 || 0,
          university.dgnlScores?.year2023 || 0
        );

        return score >= minScore - 50;
      }
    })
    .sort((a, b) => {
      if (scoreType === "THPTQG") {
        const scoreA = a.thptScores?.year2025 || 0;
        const scoreB = b.thptScores?.year2025 || 0;
        return Math.abs(scoreA - score) - Math.abs(scoreB - score);
      } else {
        const scoreA = a.dgnlScores?.year2025 || 0;
        const scoreB = b.dgnlScores?.year2025 || 0;
        return Math.abs(scoreA - score) - Math.abs(scoreB - score);
      }
    });
};
