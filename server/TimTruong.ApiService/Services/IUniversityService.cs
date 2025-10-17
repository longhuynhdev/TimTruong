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
    Task<List<UniversityDto>> GetAllUniversitiesAsync(string? search = null, string? type = null, string? city = null);

    /// <summary>
    /// Gets a simplified list of universities for dropdowns
    /// </summary>
    Task<List<UniversitySimpleDto>> GetSimpleUniversitiesAsync();

    /// <summary>
    /// Gets a single university by ID
    /// </summary>
    Task<UniversityDto?> GetUniversityByIdAsync(int id);

    /// <summary>
    /// Creates a new university
    /// </summary>
    Task<UniversityDto> CreateUniversityAsync(CreateUniversityRequest request);

    /// <summary>
    /// Updates an existing university
    /// </summary>
    Task<UniversityDto?> UpdateUniversityAsync(int id, UpdateUniversityRequest request);

    /// <summary>
    /// Deletes a university (soft delete - not implemented yet, or hard delete)
    /// </summary>
    Task<bool> DeleteUniversityAsync(int id);
}
