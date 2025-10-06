using Microsoft.AspNetCore.Mvc;
using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.Validators;

namespace TimTruong.ApiService.Endpoints;

/// <summary>
/// Endpoints for university recommendations
/// </summary>
public static class RecommendationEndpoints
{
    public static void MapRecommendationEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/v1/recommendations")
            .WithTags("Recommendations")
            .WithOpenApi();

        group.MapPost("/", GetRecommendations)
            .WithName("GetRecommendations")
            .WithSummary("Get university and major recommendations")
            .WithDescription("Returns recommended universities and majors based on exam scores and criteria")
            .Produces<RecommendationResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> GetRecommendations(
        [FromBody] RecommendationRequest request,
        IRecommendationService recommendationService,
        ILogger<IRecommendationService> logger)
    {
        // Validate request
        var (isValid, errors) = RecommendationRequestValidator.Validate(request);
        if (!isValid)
        {
            logger.LogWarning("Invalid recommendation request: {Errors}", errors);
            return Results.ValidationProblem(errors);
        }

        try
        {
            var response = await recommendationService.GetRecommendationsAsync(request);
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting recommendations for {ExamType} with score {Score}",
                request.ExamType, request.Score);
            return Results.Problem(
                title: "Error getting recommendations",
                detail: "An error occurred while processing your request",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
