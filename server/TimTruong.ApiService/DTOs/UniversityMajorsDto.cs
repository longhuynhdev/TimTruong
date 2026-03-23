namespace TimTruong.ApiService.DTOs;

/// <summary>
/// A major with its admission requirements for a university
/// </summary>
public record MajorWithRequirementsDto(
    int Id,
    string Name,
    string? Code,
    decimal? TuitionFee,
    int? EnrollmentQuota,
    List<AdmissionRequirementDto> AdmissionRequirements
);

/// <summary>
/// An admission requirement entry
/// </summary>
public record AdmissionRequirementDto(
    int Id,
    string ExamType,
    decimal Score,
    string? SubjectCombination,
    int Year
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
