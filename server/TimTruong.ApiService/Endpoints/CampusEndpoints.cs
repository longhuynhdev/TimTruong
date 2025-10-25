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

        // POST /api/v1/campuses
        group.MapPost("/", CreateCampus)
            .WithName("CreateCampus")
            .WithSummary("Create a new campus")
            .WithDescription("Creates a new campus with the provided data")
            .Produces<CampusDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);

        // PUT /api/v1/campuses/{id}
        group.MapPut("/{id:int}", UpdateCampus)
            .WithName("UpdateCampus")
            .WithSummary("Update an existing campus")
            .WithDescription("Updates an existing campus with the provided data")
            .Produces<CampusDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);

        // DELETE /api/v1/campuses/{id}
        group.MapDelete("/{id:int}", DeleteCampus)
            .WithName("DeleteCampus")
            .WithSummary("Delete a campus")
            .WithDescription("Deletes a campus from the system")
            .Produces(StatusCodes.Status204NoContent)
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

    private static async Task<IResult> CreateCampus(
        [FromBody] CreateCampusRequest request,
        ICampusService campusService,
        ApplicationDbContext context,
        ILogger<ICampusService> logger)
    {
        try
        {
            // Validate data annotations first
            if (!MiniValidator.TryValidate(request, out var errors))
            {
                return Results.ValidationProblem(errors);
            }

            // Validate existing university
            var (isUniversityValid, universityError, university) = await CampusValidator.ValidateUniversityExistsAsync(context, request.UniversityCode);
            if (!isUniversityValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["university"] = [universityError!]
                });
            }

            // Validate campus name uniqueness within the university
            var (isNameValid, nameError) = await CampusValidator.ValidateUniqueNameAsync(context, request.Name, university.Id);
            if (!isNameValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["name"] = [nameError!]
                });
            }

            // Validate campus location uniqueness within the university and with other universities
            var (isLocationValid, locationError) = await CampusValidator.ValidateUniqueLocationAsync(context, request.Address, request.District, request.City, university.Id);
            if (!isLocationValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["location"] = [locationError!]
                });
            }

            var campus = await campusService.CreateCampusAsync(request);
            // NULL CHECK - Handles "service said no"
            if (campus == null)
            {
                // This happens if validation passed BUT service still failed
                return Results.Problem(
                    title: "Error creating campus",
                    detail: "University not found or campus creation failed",
                    statusCode: StatusCodes.Status500InternalServerError);
            }
            return Results.Created($"/api/v1/campuses/{campus.Id}", campus);
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Validation error creating campus");
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["type"] = [ex.Message]
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating campus");
            return Results.Problem(
                title: "Error creating campus",
                detail: "An error occurred while creating the campus",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> UpdateCampus(
        int id,
        [FromBody] UpdateCampusRequest request,
        ICampusService campusService,
        ApplicationDbContext context,
        ILogger<ICampusService> logger)
    {
        try
        {
            // Validate data annotations first
            if (!MiniValidator.TryValidate(request, out var errors))
            {
                return Results.ValidationProblem(errors);
            }

            // Validate existing university
            var (isUniversityValid, universityError,university) = await CampusValidator.ValidateUniversityExistsAsync(context, request.UniversityCode);
            if (!isUniversityValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["university"] = [universityError!]
                });
            }

            // Validate campus name uniqueness within the university
            var (isNameValid, nameError) = await CampusValidator.ValidateUniqueNameAsync(context, request.Name, university.Id);
            if (!isNameValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["name"] = [nameError!]
                });
            }

            // Validate campus location uniqueness within the university and with other universities
            var (isLocationValid, locationError) = await CampusValidator.ValidateUniqueLocationAsync(context, request.Address, request.District, request.City, university.Id);
            if (isLocationValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["location"] = [locationError!]
                });
            }

            var campus = await campusService.UpdateCampusAsync(id, request);

            if (campus == null)
            {
                return Results.NotFound(new { message = $"Campus with ID {id} not found" });
            }

            return Results.Ok(campus);
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Validation error updating campus");
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["type"] = [ex.Message]
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating campus");
            return Results.Problem(
                title: "Error updating campus",
                detail: "An error occurred while updating the campus",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    // This implementation is for testing, but dangerous for production
    // check note-of-huy.md for more details
    private static async Task<IResult> DeleteCampus(
        int id,
        ICampusService campusService,
        ILogger<ICampusService> logger)
    {
        try
        {
            var deleted = await campusService.DeleteCampusAsync(id);

            if (!deleted)
            {
                return Results.NotFound(new { message = $"Campus with ID {id} not found" });
            }

            return Results.NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting campus with ID {Id}", id);
            return Results.Problem(
                title: "Error deleting campus",
                detail: "An error occurred while deleting the campus",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}