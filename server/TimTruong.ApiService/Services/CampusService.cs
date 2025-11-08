using Microsoft.EntityFrameworkCore;
using Core.Models;
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

    public async Task<CampusDto?> CreateCampusAsync(CreateCampusRequest request)
    {
        _logger.LogInformation("Creating campus of the university has Code: {Code}", request.UniversityCode);

        // connected university must be found,
        // and be found via its code in current implementation
        var university = await _context.Universities.FirstOrDefaultAsync(u => u.Code == request.UniversityCode);

        if (university == null)
        {
            _logger.LogWarning("University with Code: {Code} not found for creating new campus", request.UniversityCode);
            return null;
        }

        // Create entity
        var campus = new Campus
        {
            Name = request.Name.Trim(),
            Address = request.Address?.Trim(),
            District = request.District?.Trim(),
            City = request.City.Trim(),
            // how to add the remaining features ?
            UniversityId = university.Id,
            University = university // Redundant; EF will set this automatically via UniversityId FK ? -> not sure, research later
        };

        _context.Campuses.Add(campus);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Successfully created campus with ID: {Id}", campus.Id);

        return new CampusDto
        {
            Id = campus.Id,
            Name = campus.Name,
            Address = campus.Address,
            District = campus.District,
            City = campus.City,
            UniversityId = campus.UniversityId,
            UniversityName = campus.University.Name,
            UniversityCode = campus.University.Code
        };
    }

    public async Task<CampusDto?> UpdateCampusAsync(int id, UpdateCampusRequest request)
    {
        _logger.LogInformation("Updating campus with ID: {Id}", id);

        // Include University navigation property to access Name and Code later
        var campus = await _context.Campuses
            .Include(c => c.University)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        if (campus == null)
        {
            _logger.LogWarning("Campus with ID {Id} not found for update", id);
            return null;
        }

        // Update properties
        campus.Name = request.Name.Trim();
        campus.Address = request.Address?.Trim();
        campus.District = request.District?.Trim();
        campus.City = request.City.Trim();
        // change ownership of campus
        if (!string.IsNullOrWhiteSpace(request.UniversityCode))
        {
            var newUniversity = await _context.Universities.FirstOrDefaultAsync(u => u.Code == request.UniversityCode);
            if (newUniversity == null)
            {
                _logger.LogWarning("University with Code: {Code} not found for updating campus", request.UniversityCode);
                return null;
            }
            campus.UniversityId = newUniversity.Id;
            campus.University = newUniversity;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Successfully updated campus with ID: {Id}", id);

        return new CampusDto
        {
            Id = campus.Id,
            Name = campus.Name,
            Address = campus.Address,
            District = campus.District,
            City = campus.City,
            UniversityId = campus.UniversityId,
            UniversityName = campus.University.Name,
            UniversityCode = campus.University.Code
        };
    }

    public async Task<bool> DeleteCampusAsync(int id)
    {
        _logger.LogInformation("Deleting campus with ID: {Id}", id);

        var campus = await _context.Campuses.FindAsync(id);
        if (campus == null)
        {
            _logger.LogWarning("Campus with ID {Id} not found for deletion", id);
            return false;
        }

        _context.Campuses.Remove(campus);
        await _context.SaveChangesAsync(); // CASCADE DELETES ALL ADMISSION REQUIREMENTS

        _logger.LogInformation("Successfully deleted campus with Id: {Id}", id);
        return true;
    }
}