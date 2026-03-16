using Microsoft.EntityFrameworkCore;
using Core.Models;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Services;

/// <summary>
/// Service implementation for university operations
/// </summary>
public class UniversityService : IUniversityService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UniversityService> _logger;

    public UniversityService(ApplicationDbContext context, ILogger<UniversityService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<UniversityDto>> GetAllUniversitiesAsync(string? search = null, string? type = null, string? city = null)
    {
        _logger.LogInformation("Getting all universities with filters - Search: {Search}, Type: {Type}, City: {City}", 
            search, type, city);

        var query = _context.Universities.Include(u => u.Campuses).AsQueryable();

        // Apply search filter (name or code)
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            query = query.Where(u =>
                u.Name.ToLower().Contains(search) ||
                u.Code.ToLower().Contains(search));
        }

        // Apply type filter
        if (!string.IsNullOrWhiteSpace(type))
        {
            if (Enum.TryParse<UniType>(type, true, out var uniType))
            {
                query = query.Where(u => u.Type == uniType);
            }
        }

        // Apply city filter 
        if (!string.IsNullOrWhiteSpace(city))
        {
            query = query.Where(u => u.Campuses.Any(c => c.City != null && c.City.ToLower().Contains(city.ToLower())));
        }

        var universities = await query
            .OrderBy(u => u.Name)
            .Select(u => new UniversityDto
            {
                Id = u.Id,
                Name = u.Name,
                ShortName = u.ShortName,
                EnglishName = u.EnglishName,
                Code = u.Code,
                Type = u.Type.ToString(),
                ImageUrl = u.ImageUrl,
                IsFinanciallyAutonomous = u.IsFinanciallyAutonomous,
                Campuses = u.Campuses.Select(c => new CampusLocationDto(c.City, c.District)).ToList()
            })
            .ToListAsync();

        _logger.LogInformation("Found {Count} universities", universities.Count);
        return universities;
    }

    public async Task<List<UniversitySimpleDto>> GetSimpleUniversitiesAsync()
    {
        _logger.LogInformation("Getting simple university list");

        var universities = await _context.Universities
            .OrderBy(u => u.Name)
            .Select(u => new UniversitySimpleDto
            {
                Id = u.Id,
                Name = u.Name,
                Code = u.Code
            })
            .ToListAsync();

        return universities;
    }

    public async Task<UniversityDto?> GetUniversityByIdAsync(int id)
    {
        _logger.LogInformation("Getting university with ID: {Id}", id);

        var university = await _context.Universities
            .Include(u => u.Campuses)
            .Where(u => u.Id == id)
            .Select(u => new UniversityDto
            {
                Id = u.Id,
                Name = u.Name,
                ShortName = u.ShortName,
                EnglishName = u.EnglishName,
                Code = u.Code,
                Type = u.Type.ToString(),
                ImageUrl = u.ImageUrl,
                IsFinanciallyAutonomous = u.IsFinanciallyAutonomous,
                Campuses = u.Campuses.Select(c => new CampusLocationDto(c.City, c.District)).ToList()
            })
            .FirstOrDefaultAsync();

        if (university == null)
        {
            _logger.LogWarning("University with ID {Id} not found", id);
        }

        return university;
    }

    public async Task<UniversityDto> CreateUniversityAsync(CreateUniversityRequest request)
    {
        _logger.LogInformation("Creating university with code: {Code}", request.Code);

        // Parse type
        if (!Enum.TryParse<UniType>(request.Type, out var uniType))
        {
            throw new ArgumentException($"Invalid university type: {request.Type}");
        }

        // Create entity
        var university = new University
        {
            Name = request.Name.Trim(),
            ShortName = request.ShortName?.Trim(),
            EnglishName = request.EnglishName?.Trim(),
            Code = request.Code.ToUpper().Trim(),
            Type = uniType,
            ImageUrl = request.ImageUrl
        };

        _context.Universities.Add(university);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Successfully created university with ID: {Id}", university.Id);

        return new UniversityDto
        {
            Id = university.Id,
            Name = university.Name,
            ShortName = university.ShortName,
            EnglishName = university.EnglishName,
            Code = university.Code,
            Type = university.Type.ToString(),
            ImageUrl = university.ImageUrl
        };
    }

    public async Task<UniversityDto?> UpdateUniversityAsync(int id, UpdateUniversityRequest request)
    {
        _logger.LogInformation("Updating university with ID: {Id}", id);

        var university = await _context.Universities.FindAsync(id);
        if (university == null)
        {
            _logger.LogWarning("University with ID {Id} not found for update", id);
            return null;
        }

        // Parse type
        if (!Enum.TryParse<UniType>(request.Type, out var uniType))
        {
            throw new ArgumentException($"Invalid university type: {request.Type}");
        }

        // Update properties
        university.Name = request.Name.Trim();
        university.ShortName = request.ShortName?.Trim();
        university.EnglishName = request.EnglishName?.Trim();
        university.Code = request.Code.ToUpper().Trim();
        university.Type = uniType;
        university.ImageUrl = request.ImageUrl;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Successfully updated university with ID: {Id}", id);

        return new UniversityDto
        {
            Id = university.Id,
            Name = university.Name,
            ShortName = university.ShortName,
            EnglishName = university.EnglishName,
            Code = university.Code,
            Type = university.Type.ToString(),
            ImageUrl = university.ImageUrl
        };
    }

    public async Task<UniversityMajorsDto?> GetUniversityMajorsAsync(int id)
    {
        _logger.LogInformation("Getting majors for university with ID: {Id}", id);

        var university = await _context.Universities
            .Where(u => u.Id == id)
            .Select(u => new UniversityMajorsDto(
                u.Id,
                u.Name,
                u.Code,
                u.Majors
                    .OrderBy(m => m.Name)
                    .Select(m => new MajorWithRequirementsDto(
                        m.Id,
                        m.Name,
                        m.Code,
                        m.TuitionFee,
                        m.EnrollmentQuota,
                        m.AdmissionRequirements
                            .OrderByDescending(r => r.Year)
                            .ThenBy(r => r.ExamType)
                            .Select(r => new AdmissionRequirementDto(
                                r.Id,
                                r.ExamType.ToString(),
                                r.Score,
                                r.SubjectCombination.HasValue ? r.SubjectCombination.Value.ToString() : null,
                                r.Year
                            ))
                            .ToList()
                    ))
                    .ToList()
            ))
            .FirstOrDefaultAsync();

        if (university == null)
        {
            _logger.LogWarning("University with ID {Id} not found", id);
        }

        return university;
    }

    // WARNING: This will CASCADE DELETE all campuses and majors
    // TODO: Add safety checks before production (see note-of-Huy.md line 1042)
    public async Task<bool> DeleteUniversityAsync(int id)
    {
        _logger.LogInformation("Deleting university with ID: {Id}", id);

        var university = await _context.Universities.FindAsync(id);
        if (university == null)
        {
            _logger.LogWarning("University with ID {Id} not found for deletion", id);
            return false;
        }

        _context.Universities.Remove(university);
        await _context.SaveChangesAsync(); // CASCADE DELETES ALL CHILDREN

        _logger.LogInformation("Successfully deleted university with ID: {Id}", id);
        return true;
    }
}
