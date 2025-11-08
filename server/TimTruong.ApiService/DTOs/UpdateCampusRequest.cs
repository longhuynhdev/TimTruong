using System.ComponentModel.DataAnnotations;

namespace TimTruong.ApiService.DTOs;

public record UpdateCampusRequest
{
    // Fullname of campus
    [Required(ErrorMessage = "Name is required")]
    [MinLength(3, ErrorMessage = "Name must be at least 3 characters")]
    [MaxLength(200, ErrorMessage = "Name must not exceed 200 characters")]
    public required string Name { get; init; }

    // Address maybe does not include district, city
    [Required(ErrorMessage = "Address is required")]
    [MinLength(3, ErrorMessage = "Address must be at least 3 characters")]
    [MaxLength(500, ErrorMessage = "Address must not exceed 500 characters")]
    public required string Address { get; init; }

    // District
    // TODO: Ask Leader == Schema consistency - nullability mismatch
    // [Required(ErrorMessage = "District is required")]
    // [MinLength(3, ErrorMessage = "District must be at least 3 characters")]
    [MaxLength(100, ErrorMessage = "District must not exceed 100 characters")]
    public string? District { get; init; }

    // City
    [Required(ErrorMessage = "City is required")]
    [MinLength(3, ErrorMessage = "City must be at least 3 characters")]
    [MaxLength(100, ErrorMessage = "City must not exceed 100 characters")]
    public required string City { get; init; }

    /// <summary>
    /// optionally given when transfer of ownership between universities is allowed
    /// </summary>
    // [Required(ErrorMessage = "University Code is required")]
    [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "University Code must be exactly 3 uppercase letters")]
    public string? UniversityCode { get; init; }
}