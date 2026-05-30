namespace TimTruong.ApiService.DTOs;

/// <summary>
/// University data transfer object for API responses
/// </summary>
public record UniversityDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Slug { get; init; }
    public string? ShortName { get; init; }
    public string? EnglishName { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty; // "Public" or "Private"
    public string? ImageUrl { get; init; }
    public bool? IsFinanciallyAutonomous { get; init; }
    public List<CampusLocationDto> Campuses { get; init; } = new();
}

public record CampusLocationDto(string City, string? District);
