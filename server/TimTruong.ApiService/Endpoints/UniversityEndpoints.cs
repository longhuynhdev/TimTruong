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
            // TODO: compare this line (UniversityDto) with scripts of Recommendations
            // do these endpoints need Status400BadRequest ?
            // TODO: how about get all universities with no filtering ? --> already implemented because parameters are optional

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

        // POST /api/v1/universities
        group.MapPost("/", CreateUniversity)
            .WithName("CreateUniversity")
            .WithSummary("Create a new university")
            .WithDescription("Creates a new university in the system")
            .Produces<UniversityDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);

        // PUT /api/v1/universities/{id}
        group.MapPut("/{id:int}", UpdateUniversity)
            .WithName("UpdateUniversity")
            .WithSummary("Update an existing university")
            .WithDescription("Updates an existing university's information")
            .Produces<UniversityDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);

        // DELETE /api/v1/universities/{id}
        group.MapDelete("/{id:int}", DeleteUniversity)
            .WithName("DeleteUniversity")
            .WithSummary("Delete a university")
            .WithDescription("Deletes a university from the system")
            .Produces(StatusCodes.Status204NoContent)
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

    private static async Task<IResult> CreateUniversity(
        [FromBody] CreateUniversityRequest request,
        IUniversityService universityService,
        ApplicationDbContext context,
        ILogger<IUniversityService> logger)
    {
        try
        {
            // TODO: compare Validator between Recommendations (line 33) and Universities
            // which one follow the standard ?
        
            // Validate data annotations first
            if (!MiniValidator.TryValidate(request, out var errors))
            {
                return Results.ValidationProblem(errors);
            }
            
            // Validate unique code
            var (isCodeValid, codeError) = await UniversityValidator.ValidateUniqueCodeAsync(context, request.Code);
            if (!isCodeValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["code"] = [codeError!]
                });
            }

            // Validate unique name
            var (isNameValid, nameError) = await UniversityValidator.ValidateUniqueNameAsync(context, request.Name);
            if (!isNameValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["name"] = [nameError!]
                });
            }

            var university = await universityService.CreateUniversityAsync(request);
            return Results.Created($"/api/v1/universities/{university.Id}", university);
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Validation error creating university");
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["type"] = [ex.Message]
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating university");
            return Results.Problem(
                title: "Error creating university",
                detail: "An error occurred while creating the university",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> UpdateUniversity(
        int id,
        [FromBody] UpdateUniversityRequest request,
        IUniversityService universityService,
        ApplicationDbContext context,
        ILogger<IUniversityService> logger)
    {
        try
        {
            // Validate unique code (excluding current university)
            var (isCodeValid, codeError) = await UniversityValidator.ValidateUniqueCodeAsync(context, request.Code, id);
            if (!isCodeValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["code"] = [codeError!]
                });
            }

            // Validate unique name (excluding current university)
            var (isNameValid, nameError) = await UniversityValidator.ValidateUniqueNameAsync(context, request.Name, id);
            if (!isNameValid)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["name"] = [nameError!]
                });
            }

            var university = await universityService.UpdateUniversityAsync(id, request);
            
            if (university == null)
            {
                return Results.NotFound(new { message = $"University with ID {id} not found" });
            }

            return Results.Ok(university);
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Validation error updating university");
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["type"] = [ex.Message]
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating university with ID {Id}", id);
            return Results.Problem(
                title: "Error updating university",
                detail: "An error occurred while updating the university",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> DeleteUniversity(
        int id,
        IUniversityService universityService,
        ILogger<IUniversityService> logger)
    {
        try
        {
            var deleted = await universityService.DeleteUniversityAsync(id);
            
            if (!deleted)
            {
                return Results.NotFound(new { message = $"University with ID {id} not found" });
            }

            return Results.NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting university with ID {Id}", id);
            return Results.Problem(
                title: "Error deleting university",
                detail: "An error occurred while deleting the university",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
