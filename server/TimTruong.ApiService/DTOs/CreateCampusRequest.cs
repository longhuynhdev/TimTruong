using System.ComponentModel.DataAnnotations;

namespace TimTruong.ApiService.DTOs;

public record CreateCampusRequest
{
    // Fullname of campus
    [Required(ErrorMessage = "Name is required")]
    [MinLength(3, ErrorMessage = "Name must be at least 3 characters")]
    [MaxLength(200, ErrorMessage = "Name must not exceed 200 characters")]
    public required string Name { get; init; }

    // Optional because of the designed schema
    // TODO: Ask Leader
    // Address maybe does not include district, city
    // [Required(ErrorMessage = "Address is required")]
    // [MinLength(3, ErrorMessage = "Address must be at least 3 characters")]
    [MaxLength(500, ErrorMessage = "Address must not exceed 500 characters")]
    public string? Address { get; init; }

    // District
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
    /// Each campus must belong to a university
    /// The easiest way to link newly created campus to a university
    /// is via 3-letter university code (e.g., QST, BKA)
    /// </summary>
    [Required(ErrorMessage = "University Code is required")]
    [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "University Code must be exactly 3 uppercase letters")]
    public required string UniversityCode { get; init; }
}