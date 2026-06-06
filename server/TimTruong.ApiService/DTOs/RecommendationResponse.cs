namespace TimTruong.ApiService.DTOs;

/// <summary>
/// Response containing university and major recommendations
/// </summary>
public record RecommendationResponse(
    List<UniversityRecommendation> Recommendations
);

/// <summary>
/// A single university recommendation with matching majors.
/// Each major carries its full admission requirements (all years, combos and
/// exam types) so the client can show the complete điểm chuẩn picture, not just
/// the row that matched the student's criteria.
/// </summary>
public record UniversityRecommendation(
    int UniversityId,
    string UniversityName,
    string UniversityCode,
    string UniversityType,
    string? UniversityImageUrl,
    List<MajorWithRequirementsDto> Majors
);
