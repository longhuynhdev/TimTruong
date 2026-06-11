namespace TimTruong.ApiService.DTOs;

/// <summary>
/// A major with its admission requirements for a university
/// </summary>
public record MajorWithRequirementsDto(
    int Id,
    string Name,
    string? Code,
    List<MajorYearDto> Years,
    List<AdmissionRequirementDto> AdmissionRequirements
);

/// <summary>
/// A major's per-year offering data (tuition, quota).
/// <c>TuitionFeeMax</c> is null for a concrete amount, set for a range.
/// </summary>
public record MajorYearDto(
    int Year,
    decimal? TuitionFeeMin,
    decimal? TuitionFeeMax,
    string? TuitionFeeUnit,
    int? EnrollmentQuota,
    string? Note,
    string? SourceUrl
);

/// <summary>
/// An admission requirement entry
/// </summary>
public record AdmissionRequirementDto(
    int Id,
    string ExamType,
    decimal? Score,
    string? SubjectCombination,
    int Year,
    string? SourceUrl
);

/// <summary>
/// Response for GET /api/v1/universities/{id}/majors
/// </summary>
public record UniversityMajorsDto(
    int UniversityId,
    string UniversityName,
    string UniversityCode,
    List<MajorWithRequirementsDto> Majors
);
