using Microsoft.EntityFrameworkCore;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Services;

public class CampusService : ICampusService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CampusService> _logger;

    public CampusService(ApplicationDbContext context, ILogger<CampusService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<CampusDto>> GetAllCampusesAsync(string? search = null, string? city = null, string? university = null)
    {
        _logger.LogInformation("Generating all campuses with filters - Search: {Search}, City: {City}, University: {University}", search, city, university);

        var query = _context.Campuses.AsQueryable();

        // Apply search filter - name or address
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            query = query.Where(c =>
            c.Name.ToLower().Contains(search) ||
            (c.Address != null && c.Address.ToLower().Contains(search)));
        }

        // Apply city filter
        if (!string.IsNullOrWhiteSpace(city))
        {
            query = query.Where(c => c.City.ToLower().Contains(city.ToLower()));
        }

        // Apply university filter if needed
        if (!string.IsNullOrWhiteSpace(university))
        {
            query = query
                .Include(c => c.University)
                .Where(c => c.University.Code.ToLower().Contains(university.ToLower()));
        }

        var campuses = await query
            .OrderBy(c => c.Name)
            .Select(c => new CampusDto
            {
                Id = c.Id,
                Name = c.Name,
                // TODO: ask Leader why these columns are set as nullable
                Address = c.Address,
                District = c.District,
                City = c.City,
                UniversityId = c.UniversityId,
                UniversityName = c.University.Name,
                UniversityCode = c.University.Code
            }).ToListAsync();

        _logger.LogInformation("Found {Count} campuses", campuses.Count);
        return campuses;
    }

    public async Task<CampusDto?> GetCampusByIdAsync(int id)
    {
        _logger.LogInformation("Getting campus with ID: {Id}", id);

        var campus = await _context.Campuses
            .Where(c => c.Id == id)
            .Select(c => new CampusDto
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                District = c.District,
                City = c.City,
                UniversityId = c.UniversityId,
                UniversityName = c.University.Name,
                UniversityCode = c.University.Code
            }).FirstOrDefaultAsync();

        if (campus == null)
        {
            _logger.LogWarning("Campus with ID {Id} not found", id);
        }

        return campus;
    }

}