using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Services;

/// <summary>
/// Service interface for university operations
/// </summary>
public interface IUniversityService
{
    /// <summary>
    /// Gets all universities with optional filtering
    /// </summary>

    Task<List<UniversityDto>> GetAllUniversitiesAsync(string? search = null, string? type = null, string? city = null, bool? hasDormitory = null);

    /// <summary>
    /// Gets a simplified list of universities for dropdowns
    /// </summary>
    Task<List<UniversitySimpleDto>> GetSimpleUniversitiesAsync();

    /// <summary>
    /// Gets a single university by ID
    /// </summary>
    Task<UniversityDto?> GetUniversityByIdAsync(int id);

    /// <summary>
    /// Gets a single university by its URL slug
    /// </summary>
    Task<UniversityDto?> GetUniversityBySlugAsync(string slug);

    /// <summary>
    /// Gets all majors and their admission requirements for a university
    /// </summary>
    Task<UniversityMajorsDto?> GetUniversityMajorsAsync(int id);
}
