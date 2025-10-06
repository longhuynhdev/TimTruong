namespace TimTruong.ApiService.DTOs;

/// <summary>
/// Response containing university and major recommendations
/// </summary>
public record RecommendationResponse(
    List<UniversityRecommendation> Recommendations
);

/// <summary>
/// A single university recommendation with matching majors
/// </summary>
public record UniversityRecommendation(
    int UniversityId,
    string UniversityName,
    string UniversityCode,
    string UniversityType,
    string? UniversityImageUrl,
    List<MajorRecommendation> Majors
);

/// <summary>
/// A major that matches the student's criteria
/// </summary>
public record MajorRecommendation(
    int MajorId,
    string MajorName,
    string? MajorCode,
    string FieldOfStudy,
    decimal? TuitionFee,
    int? EnrollmentQuota,
    decimal AdmissionScore,
    string SubjectCombination,
    int Year
);
