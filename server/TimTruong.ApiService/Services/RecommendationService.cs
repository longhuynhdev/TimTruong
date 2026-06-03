using Microsoft.EntityFrameworkCore;
using Core.Models;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Services;

/// <summary>
/// Service implementation for generating university and major recommendations
/// </summary>
public class RecommendationService : IRecommendationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(ApplicationDbContext context, ILogger<RecommendationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<RecommendationResponse> GetRecommendationsAsync(RecommendationRequest request)
    {
        _logger.LogInformation(
            "Getting recommendations for {ExamType} with score {Score}",
            request.ExamType,
            request.Score);

        // Build query for admission requirements that match the criteria
        var query = _context.AdmissionRequirements
            .Include(ar => ar.Major)
                .ThenInclude(m => m.University)
            .Include(ar => ar.Major)
                .ThenInclude(m => m.Years)
            .Where(ar => ar.ExamType == request.ExamType)
            .Where(ar => ar.Score != null) // Skip combos with no published cutoff yet (new majors)
            .Where(ar => ar.Score <= request.Score); // Student's score meets or exceeds requirement

        // For THPTQG, filter by subject combination
        if (request.ExamType == ExamType.THPTQG && request.SubjectCombination.HasValue)
        {
            query = query.Where(ar => ar.SubjectCombination == request.SubjectCombination.Value);
        }

        // Execute query and get matching admission requirements
        var matchingRequirements = await query
            .OrderByDescending(ar => ar.Score) // Higher score requirements first (more competitive programs)
            .ToListAsync();

        // Group by university
        var groupedByUniversity = matchingRequirements
            .GroupBy(ar => ar.Major.University)
            .Select(g => new UniversityRecommendation(
                UniversityId: g.Key.Id,
                UniversityName: g.Key.Name,
                UniversityCode: g.Key.Code,
                UniversityType: g.Key.Type.ToString(),
                UniversityImageUrl: g.Key.ImageUrl,
                Majors: g.Select(ar => BuildMajorRecommendation(ar))
                .OrderByDescending(m => m.AdmissionScore) // Order majors by score within each university
                .ToList()
            ))
            .OrderBy(u => u.UniversityName) // Sort universities alphabetically
            .ToList();

        _logger.LogInformation(
            "Found {UniversityCount} universities with {MajorCount} matching majors",
            groupedByUniversity.Count,
            matchingRequirements.Count);

        return new RecommendationResponse(groupedByUniversity);
    }

    // Tuition/quota live on the per-year MajorYear row; pick the one matching this
    // requirement's year (null fields if that year has no offering data yet).
    private static MajorRecommendation BuildMajorRecommendation(AdmissionRequirement ar)
    {
        var yearInfo = ar.Major.Years.FirstOrDefault(my => my.Year == ar.Year);
        return new MajorRecommendation(
            MajorId: ar.Major.Id,
            MajorName: ar.Major.Name,
            MajorCode: ar.Major.Code,
            FieldOfStudy: ar.Major.FieldOfStudy ?? string.Empty,
            TuitionFeeMin: yearInfo?.TuitionFeeMin,
            TuitionFeeMax: yearInfo?.TuitionFeeMax,
            TuitionFeeUnit: yearInfo?.TuitionFeeUnit?.ToString(),
            EnrollmentQuota: yearInfo?.EnrollmentQuota,
            AdmissionScore: ar.Score!.Value, // non-null: query filters Score != null
            SubjectCombination: ar.SubjectCombination?.ToString() ?? "N/A",
            Year: ar.Year
        );
    }
}
