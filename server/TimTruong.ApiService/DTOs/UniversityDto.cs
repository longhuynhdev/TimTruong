namespace TimTruong.ApiService.DTOs;

/// <summary>
/// University data transfer object for API responses
/// </summary>
public record UniversityDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? ShortName { get; init; }
    public string? EnglishName { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty; // "Public" or "Private"
    public string? ImageUrl { get; init; }
}


// TODO: why do we need to create many files for DTOs that are related to one component ???
// [ ] DTOs/UniversityDto.cs
// [ ] DTOs/UniversitySimpleDto.cs
// [ ] DTOs/CreateUniversityRequest.cs
// [ ] DTOs/UpdateUniversityRequest.cs