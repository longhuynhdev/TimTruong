namespace TimTruong.ApiService.DTOs;

/// <summary>
/// Simplified university DTO for dropdowns and lists
/// </summary>
public record UniversitySimpleDto
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}
