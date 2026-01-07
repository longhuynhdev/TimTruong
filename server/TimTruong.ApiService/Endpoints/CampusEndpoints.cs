using Microsoft.AspNetCore.Mvc;
using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Validators;
using MiniValidation;

namespace TimTruong.ApiService.Endpoints;

public static class CampusEndpoints
{
    public static void MapCampusEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("api/v1/campuses")
            .WithTags("Campus")
            .WithOpenApi();

        // GET /api/v1/campuses
        group.MapGet("/", GetAllCampuses)
            .WithName("GetAllCampuses")
            .WithSummary("Get all campuses")
            .WithDescription("Return a list of all campuses with optional filtering")
            .Produces<List<CampusDto>>(StatusCodes.Status200OK);

        // GET /api/v1/campuses/{id}
        group.MapGet("/{id:int}", GetCampusById)
            .WithName("GetCampusById")
            .WithSummary("Get campus by ID")
            .WithDescription("Returns a single campus by its ID")
            .Produces<CampusDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetAllCampuses(
        [FromQuery] string? search,
        [FromQuery] string? city,
        [FromQuery] string? university,
        ICampusService campusService,
        ILogger<ICampusService> logger)
    {
        try
        {
            var campuses = await campusService.GetAllCampusesAsync(search, city, university);
            return Results.Ok(campuses);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting campuses");
            return Results.Problem(
                title: "Error getting campuses",
                detail: "An error occurred while retrieving campuses",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetCampusById(
        int id,
        ICampusService campusService,
        ILogger<ICampusService> logger)
    {
        try
        {
            var campus = await campusService.GetCampusByIdAsync(id);
            if (campus == null)
            {
                return Results.NotFound(new { message = $"Campus with ID {id} not found" });
            }
            return Results.Ok(campus);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting campus with ID {Id}", id);
            return Results.Problem(
                title: "Error getting campus",
                detail: "An error occurred while retrieving the campus",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}