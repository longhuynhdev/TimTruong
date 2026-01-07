using Microsoft.AspNetCore.Mvc;
using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.Validators;
using TimTruong.ApiService.DataAccess;
using MiniValidation;

namespace TimTruong.ApiService.Endpoints;

/// <summary>
/// Endpoints for university CRUD operations
/// </summary>
public static class UniversityEndpoints
{
    public static void MapUniversityEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/v1/universities")
            .WithTags("Universities")
            .WithOpenApi();

        // GET /api/v1/universities
        group.MapGet("/", GetAllUniversities)
            .WithName("GetAllUniversities")
            .WithSummary("Get all universities")
            .WithDescription("Returns a list of all universities with optional filtering")
            .Produces<List<UniversityDto>>(StatusCodes.Status200OK);

        // TODO: need to change this endpoint
        // GET /api/v1/universities/simple
        group.MapGet("/simple", GetSimpleUniversities)
            .WithName("GetSimpleUniversities")
            .WithSummary("Get simple university list")
            .WithDescription("Returns a simplified list of universities for dropdowns")
            .Produces<List<UniversitySimpleDto>>(StatusCodes.Status200OK);

        // GET /api/v1/universities/{id}
        group.MapGet("/{id:int}", GetUniversityById)
            .WithName("GetUniversityById")
            .WithSummary("Get university by ID")
            .WithDescription("Returns a single university by its ID")
            .Produces<UniversityDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetAllUniversities(
        [FromQuery] string? search,
        [FromQuery] string? type,
        [FromQuery] string? city,
        IUniversityService universityService,
        ILogger<IUniversityService> logger)
    {
        try
        {
            var universities = await universityService.GetAllUniversitiesAsync(search, type, city);
            return Results.Ok(universities);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting universities");
            return Results.Problem(
                title: "Error getting universities",
                detail: "An error occurred while retrieving universities",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetSimpleUniversities(
        IUniversityService universityService,
        ILogger<IUniversityService> logger)
    {
        try
        {
            var universities = await universityService.GetSimpleUniversitiesAsync();
            return Results.Ok(universities);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting simple universities list");
            return Results.Problem(
                title: "Error getting universities",
                detail: "An error occurred while retrieving universities",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetUniversityById(
        int id,
        IUniversityService universityService,
        ILogger<IUniversityService> logger)
    {
        try
        {
            var university = await universityService.GetUniversityByIdAsync(id);
            
            if (university == null)
            {
                return Results.NotFound(new { message = $"University with ID {id} not found" });
            }

            return Results.Ok(university);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting university with ID {Id}", id);
            return Results.Problem(
                title: "Error getting university",
                detail: "An error occurred while retrieving the university",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
