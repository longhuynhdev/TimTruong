namespace TimTruong.ApiService.Features.SubjectCombinations;

/// <summary>
/// Endpoints exposing subject combinations (the enum) and which universities/majors use them.
/// </summary>
public static class SubjectCombinationEndpoints
{
    public static void MapSubjectCombinationEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/v1/subject-combinations")
            .WithTags("SubjectCombinations")
            .WithOpenApi();

        // GET /api/v1/subject-combinations
        group.MapGet("/", GetAll)
            .WithName("GetSubjectCombinations")
            .WithSummary("Get all subject combinations")
            .WithDescription("Returns every subject combination with its subjects and how many universities/majors currently admit by it")
            .Produces<List<SubjectCombinationSummaryDto>>(StatusCodes.Status200OK);

        // GET /api/v1/subject-combinations/{code}
        group.MapGet("/{code}", GetDetail)
            .WithName("GetSubjectCombinationDetail")
            .WithSummary("Get universities/majors using a subject combination")
            .WithDescription("Returns the universities (with their matching majors) that admit by the given subject combination")
            .Produces<SubjectCombinationDetailDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetAll(
        ISubjectCombinationService service,
        ILogger<ISubjectCombinationService> logger)
    {
        try
        {
            var result = await service.GetAllAsync();
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting subject combinations");
            return Results.Problem(
                title: "Error getting subject combinations",
                detail: "An error occurred while retrieving subject combinations",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetDetail(
        string code,
        ISubjectCombinationService service,
        ILogger<ISubjectCombinationService> logger)
    {
        try
        {
            var result = await service.GetDetailAsync(code);

            if (result == null)
            {
                return Results.NotFound(new { message = $"Subject combination '{code}' not found" });
            }

            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting subject combination detail for {Code}", code);
            return Results.Problem(
                title: "Error getting subject combination",
                detail: "An error occurred while retrieving the subject combination",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
