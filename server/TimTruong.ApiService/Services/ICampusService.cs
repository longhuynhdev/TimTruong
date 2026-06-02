using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Services;

// Service interface for campus operations
public interface ICampusService
{
    // Get all campuses with optional filtering
    Task<List<CampusDto>> GetAllCampusesAsync(string? search = null, string? city = null, string? university = null);

    // Get a single campus by ID
    Task<CampusDto?> GetCampusByIdAsync(int id);

}