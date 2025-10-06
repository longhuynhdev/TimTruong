using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Services;

/// <summary>
/// Service for generating university and major recommendations
/// </summary>
public interface IRecommendationService
{
    /// <summary>
    /// Gets university and major recommendations based on student's exam scores
    /// </summary>
    /// <param name="request">Recommendation criteria</param>
    /// <returns>List of recommended universities with matching majors</returns>
    Task<RecommendationResponse> GetRecommendationsAsync(RecommendationRequest request);
}
