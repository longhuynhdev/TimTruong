using System.ComponentModel.DataAnnotations;

namespace TimTruong.ApiService.DTOs;

/// <summary>
/// Request DTO for updating an existing university
/// </summary>
public record UpdateUniversityRequest
{
    [Required(ErrorMessage = "Name is required")]
    [MinLength(3, ErrorMessage = "Name must be at least 3 characters")]
    [MaxLength(255, ErrorMessage = "Name must not exceed 255 characters")]
    public required string Name { get; init; }

    [MaxLength(50, ErrorMessage = "ShortName must not exceed 50 characters")]
    public string? ShortName { get; init; }

    [MaxLength(255, ErrorMessage = "EnglishName must not exceed 255 characters")]
    public string? EnglishName { get; init; }

    [Required(ErrorMessage = "Code is required")]
    [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "Code must be exactly 3 uppercase letters")]
    public required string Code { get; init; }

    [Required(ErrorMessage = "Type is required")]
    [RegularExpression(@"^(Public|Private)$", ErrorMessage = "Type must be 'Public' or 'Private'")]
    public required string Type { get; init; }

    [MaxLength(500, ErrorMessage = "ImageUrl must not exceed 500 characters")]
    [Url(ErrorMessage = "ImageUrl must be a valid URL")]
    public string? ImageUrl { get; init; }
}
