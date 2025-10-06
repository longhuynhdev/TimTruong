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
            .Where(ar => ar.ExamType == request.ExamType)
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
                Majors: g.Select(ar => new MajorRecommendation(
                    MajorId: ar.Major.Id,
                    MajorName: ar.Major.Name,
                    MajorCode: ar.Major.Code,
                    FieldOfStudy: ar.Major.FieldOfStudy,
                    TuitionFee: ar.Major.TuitionFee,
                    EnrollmentQuota: ar.Major.EnrollmentQuota,
                    AdmissionScore: ar.Score,
                    SubjectCombination: ar.SubjectCombination?.ToString() ?? "N/A",
                    Year: ar.Year
                ))
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
}
