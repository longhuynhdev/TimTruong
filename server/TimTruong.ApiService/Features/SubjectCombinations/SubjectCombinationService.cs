using Core.Models;
using Microsoft.EntityFrameworkCore;
using TimTruong.ApiService.DataAccess;

namespace TimTruong.ApiService.Features.SubjectCombinations;

public interface ISubjectCombinationService
{
    Task<List<SubjectCombinationSummaryDto>> GetAllAsync();
    Task<SubjectCombinationDetailDto?> GetDetailAsync(string code);
}

/// <summary>
/// Reads subject combinations from the enum (the single source of truth) and joins
/// usage counts/details from <see cref="AdmissionRequirement"/>. "Currently used" =
/// any admission requirement with that combination, across all years (distinct).
/// </summary>
public class SubjectCombinationService : ISubjectCombinationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SubjectCombinationService> _logger;

    public SubjectCombinationService(ApplicationDbContext context, ILogger<SubjectCombinationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<SubjectCombinationSummaryDto>> GetAllAsync()
    {
        _logger.LogInformation("Getting all subject combinations with usage counts");

        // One grouped query: per combination, distinct majors and distinct universities.
        var usage = await _context.AdmissionRequirements
            .Where(r => r.SubjectCombination != null)
            .GroupBy(r => r.SubjectCombination!.Value)
            .Select(g => new
            {
                Combination = g.Key,
                MajorCount = g.Select(r => r.MajorId).Distinct().Count(),
                UniversityCount = g.Select(r => r.Major.UniversityId).Distinct().Count(),
            })
            .ToDictionaryAsync(x => x.Combination);

        // Merge with the full enum so every combination shows (0 when unused).
        return Enum.GetValues<SubjectCombination>()
            .OrderBy(c => c.ToString(), StringComparer.Ordinal)
            .Select(c => new SubjectCombinationSummaryDto(
                c.ToString(),
                [.. c.GetSubjects()],
                usage.TryGetValue(c, out var u) ? u.UniversityCount : 0,
                usage.TryGetValue(c, out var m) ? m.MajorCount : 0))
            .ToList();
    }

    public async Task<SubjectCombinationDetailDto?> GetDetailAsync(string code)
    {
        if (!Enum.TryParse<SubjectCombination>(code, ignoreCase: false, out var combination))
        {
            _logger.LogInformation("Unknown subject combination code: {Code}", code);
            return null;
        }

        _logger.LogInformation("Getting universities/majors for subject combination {Code}", code);

        // Distinct majors (a major may appear across multiple years) admitting by this combination,
        // with their university, fetched flat then grouped in memory by university.
        var rows = await _context.AdmissionRequirements
            .Where(r => r.SubjectCombination == combination)
            .Select(r => new
            {
                MajorId = r.MajorId,
                MajorName = r.Major.Name,
                MajorCode = r.Major.Code,
                UniversityId = r.Major.UniversityId,
                UniversityName = r.Major.University.Name,
                UniversitySlug = r.Major.University.Slug,
                UniversityCode = r.Major.University.Code,
            })
            .Distinct()
            .ToListAsync();

        var universities = rows
            .GroupBy(r => new { r.UniversityId, r.UniversityName, r.UniversitySlug, r.UniversityCode })
            .OrderBy(g => g.Key.UniversityName)
            .Select(g => new SubjectCombinationUniversityDto(
                g.Key.UniversityId,
                g.Key.UniversityName,
                g.Key.UniversitySlug,
                g.Key.UniversityCode,
                g.OrderBy(m => m.MajorName)
                    .Select(m => new SubjectCombinationMajorDto(m.MajorId, m.MajorName, m.MajorCode))
                    .ToList()))
            .ToList();

        return new SubjectCombinationDetailDto(
            combination.ToString(),
            [.. combination.GetSubjects()],
            universities);
    }
}
