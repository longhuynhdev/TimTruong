using System.ComponentModel.DataAnnotations;

namespace TimTruong.ApiService.DTOs;

/// <summary>
/// Request DTO for creating a new university
/// </summary>
public record CreateUniversityRequest
{
    /// <summary>
    /// Full name of the university
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    [MinLength(3, ErrorMessage = "Name must be at least 3 characters")]
    [MaxLength(255, ErrorMessage = "Name must not exceed 255 characters")]
    public required string Name { get; init; }

    /// <summary>
    /// Short name of the university (optional)
    /// </summary>
    [MaxLength(50, ErrorMessage = "ShortName must not exceed 50 characters")]
    public string? ShortName { get; init; }

    /// <summary>
    /// English name of the university (optional)
    /// </summary>
    [MaxLength(255, ErrorMessage = "EnglishName must not exceed 255 characters")]
    public string? EnglishName { get; init; }

    /// <summary>
    /// 3-letter university code (e.g., QST, BKA)
    /// </summary>
    [Required(ErrorMessage = "Code is required")]
    [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "Code must be exactly 3 uppercase letters")]
    public required string Code { get; init; }

    /// <summary>
    /// Type of university: Public or Private
    /// </summary>
    [Required(ErrorMessage = "Type is required")]
    [RegularExpression(@"^(Public|Private)$", ErrorMessage = "Type must be 'Public' or 'Private'")]
    public required string Type { get; init; }

    /// <summary>
    /// URL to university image (optional)
    /// </summary>
    [MaxLength(500, ErrorMessage = "ImageUrl must not exceed 500 characters")]
    [Url(ErrorMessage = "ImageUrl must be a valid URL")]
    public string? ImageUrl { get; init; }
}
