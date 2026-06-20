namespace TimTruong.ApiService.Features.SubjectCombinations;

/// <summary>
/// One subject combination with how many universities/majors currently admit by it.
/// Response item for GET /api/v1/subject-combinations.
/// </summary>
public record SubjectCombinationSummaryDto(
    string Code,
    List<string> Subjects,
    int UniversityCount,
    int MajorCount
);

/// <summary>
/// A subject combination with the universities (and their majors) that admit by it.
/// Response for GET /api/v1/subject-combinations/{code}.
/// </summary>
public record SubjectCombinationDetailDto(
    string Code,
    List<string> Subjects,
    List<SubjectCombinationUniversityDto> Universities
);

/// <summary>A university (with its matching majors) admitting by a subject combination.</summary>
public record SubjectCombinationUniversityDto(
    int Id,
    string Name,
    string? Slug,
    string Code,
    List<SubjectCombinationMajorDto> Majors
);

/// <summary>A major admitting by a subject combination.</summary>
public record SubjectCombinationMajorDto(
    int Id,
    string Name,
    string? Code
);
