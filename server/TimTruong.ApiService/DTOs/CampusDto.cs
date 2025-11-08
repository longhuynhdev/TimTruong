namespace TimTruong.ApiService.DTOs;

/// <summary>
/// Campus data transfer object for API responses
/// </summary>

public record CampusDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Address { get; init; }
    public string City { get; init; } = string.Empty;
    public string? District { get; init; }
    // Essential university info in response (no extra query needed)
    public int UniversityId { get; init; }
    public string UniversityName { get; init; } = string.Empty;
    public string UniversityCode { get; init; } = string.Empty;
}