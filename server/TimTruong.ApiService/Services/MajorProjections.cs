using System.Linq.Expressions;
using Core.Models;
using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Services;

/// <summary>
/// Shared EF-translatable projections for <see cref="Major"/>, so the majors
/// listing and the recommendation endpoint produce the exact same shape.
/// Use at the top level of a query (e.g. <c>_context.Majors.Select(MajorProjections.ToDto)</c>);
/// EF Core cannot inline a referenced expression when nested inside another projection.
/// </summary>
public static class MajorProjections
{
    /// <summary>
    /// Projects a major with its full per-year offering data and every admission
    /// requirement (all years, combos and exam types). Years and requirements are
    /// ordered newest-first, matching how schools publish điểm chuẩn.
    /// </summary>
    public static readonly Expression<Func<Major, MajorWithRequirementsDto>> ToDto = m => new MajorWithRequirementsDto(
        m.Id,
        m.Name,
        m.Code,
        m.Years
            .OrderByDescending(my => my.Year)
            .Select(my => new MajorYearDto(
                my.Year,
                my.TuitionFeeMin,
                my.TuitionFeeMax,
                my.TuitionFeeUnit.HasValue ? my.TuitionFeeUnit.Value.ToString() : null,
                my.EnrollmentQuota
            ))
            .ToList(),
        m.AdmissionRequirements
            .OrderByDescending(r => r.Year)
            .ThenBy(r => r.ExamType)
            .Select(r => new AdmissionRequirementDto(
                r.Id,
                r.ExamType.ToString(),
                r.Score,
                r.SubjectCombination.HasValue ? r.SubjectCombination.Value.ToString() : null,
                r.Year
            ))
            .ToList()
    );
}
