using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Services;

// Service interface for campus operations
public interface ICampusService
{
    // Get all campuses with optional filtering
    Task<List<CampusDto>> GetAllCampusesAsync(string? search = null, string? city = null, string? university = null);

    // Get a single campus by ID
    Task<CampusDto?> GetCampusByIdAsync(int id);

    // Create a new campus (returns null if university not found)
    Task<CampusDto?> CreateCampusAsync(CreateCampusRequest request);

    // Update an existing campus
    Task<CampusDto?> UpdateCampusAsync(int id, UpdateCampusRequest request);

    // Delete a campus
    Task<bool> DeleteCampusAsync(int id);
}