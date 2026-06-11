using Microsoft.EntityFrameworkCore;
using TimTruong.Core.Models;
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

        var examType = request.ExamType;
        var score = request.Score;
        // Only filter by combo for THPTQG when one is supplied.
        var combo = examType == ExamType.THPTQG ? request.SubjectCombination : null;

        // A major qualifies when its MOST RECENT published cutoff for the requested
        // exam type (and combo, for THPTQG) is within the student's score. We compare
        // only the latest year — older, usually-lower cutoffs would over-recommend
        // majors whose current cutoff is above the student's score. If the newest year
        // hasn't published a cutoff yet (ngành mới / chưa tới mùa), the Score != null
        // filter makes this fall back to the latest year that does have one.
        // Qualification is decided per major; the full requirements are still returned
        // so the client can show every combo/year and both exam types.
        var matching = _context.Majors
            .Where(m => m.AdmissionRequirements
                .Where(ar => ar.ExamType == examType
                    && ar.Score != null
                    && (combo == null || ar.SubjectCombination == combo))
                .OrderByDescending(ar => ar.Year)
                .Select(ar => ar.Score)
                .FirstOrDefault() <= score);

        // Two queries (EF can't inline a shared projection nested in another projection):
        // one maps each matching major to its university, the other builds the full DTOs
        // via the shared MajorProjections.ToDto so the shape matches the majors endpoint.
        var majorUniversities = await matching
            .Select(m => new { MajorId = m.Id, University = m.University })
            .ToListAsync();

        var majorDtos = await matching
            .Select(MajorProjections.ToDto)
            .ToListAsync();

        var universityByMajorId = majorUniversities.ToDictionary(x => x.MajorId, x => x.University);

        var groupedByUniversity = majorDtos
            .GroupBy(dto => universityByMajorId[dto.Id].Id)
            .Select(g =>
            {
                var university = universityByMajorId[g.First().Id];
                return new UniversityRecommendation(
                    UniversityId: university.Id,
                    UniversityName: university.Name,
                    UniversityCode: university.Code,
                    UniversityType: university.Type.ToString(),
                    UniversityImageUrl: university.ImageUrl,
                    Majors: g.OrderBy(m => m.Name).ToList()
                );
            })
            .OrderBy(u => u.UniversityName)
            .ToList();

        _logger.LogInformation(
            "Found {UniversityCount} universities with {MajorCount} matching majors",
            groupedByUniversity.Count,
            majorDtos.Count);

        return new RecommendationResponse(groupedByUniversity);
    }
}
