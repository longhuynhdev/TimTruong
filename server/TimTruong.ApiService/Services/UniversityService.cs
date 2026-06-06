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

    public async Task<List<UniversityDto>> GetAllUniversitiesAsync(string? search = null, string? type = null, string? city = null, bool? hasDormitory = null, string? sort = null)
    {
        _logger.LogInformation("Getting all universities with filters - Search: {Search}, Type: {Type}, City: {City}, HasDormitory: {HasDormitory}, Sort: {Sort}",
            search, type, city, hasDormitory, sort);

        var query = _context.Universities
            .Include(u => u.Campuses)
            .Include(u => u.Rankings)
            .AsQueryable();

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

        // Apply dormitory filter (only universities that have a KTX)
        if (hasDormitory == true)
        {
            query = query.Where(u => u.HasDormitory == true);
        }

        var universities = await query
            .Select(u => new UniversityDto
            {
                Id = u.Id,
                Name = u.Name,
                Slug = u.Slug,
                ShortName = u.ShortName,
                EnglishName = u.EnglishName,
                OldName = u.OldName,
                Code = u.Code,
                Type = u.Type.ToString(),
                ImageUrl = u.ImageUrl,
                IsFinanciallyAutonomous = u.IsFinanciallyAutonomous,
                HasDormitory = u.HasDormitory,
                Campuses = u.Campuses.Select(c => new CampusLocationDto(c.City, c.District)).ToList(),
                Rankings = u.Rankings
                    .OrderByDescending(r => r.Year)
                    .ThenBy(r => r.RankingSystem)
                    .Select(r => new RankingDto(r.RankingSystem.ToString(), r.Year, r.RankFrom, r.RankTo, r.SourceUrl))
                    .ToList()
            })
            .ToListAsync();

        // Default sort: by VNUR ranking (broadest domestic coverage) — ranked schools
        // first (best rank first), unranked after, alphabetical as tiebreak.
        // `sort=name` keeps a plain alphabetical order.
        universities = sort?.Trim().ToLower() == "name"
            ? universities.OrderBy(u => u.Name).ToList()
            : universities
                .Select(u => new { U = u, Rank = VnurRank(u) })
                .OrderBy(x => x.Rank.HasValue ? 0 : 1)
                .ThenBy(x => x.Rank ?? int.MaxValue)
                .ThenBy(x => x.U.Name)
                .Select(x => x.U)
                .ToList();

        _logger.LogInformation("Found {Count} universities", universities.Count);
        return universities;
    }

    /// <summary>Latest-year VNUR RankFrom used for default sorting; null if no VNUR ranking.</summary>
    private static int? VnurRank(UniversityDto u) =>
        u.Rankings
            .Where(r => r.System == nameof(RankingSystem.VNUR))
            .OrderByDescending(r => r.Year)
            .Select(r => (int?)r.RankFrom)
            .FirstOrDefault();

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
            .Include(u => u.Dormitories)
            .Include(u => u.Rankings)
            .Where(u => u.Id == id)
            .Select(u => new UniversityDto
            {
                Id = u.Id,
                Name = u.Name,
                Slug = u.Slug,
                ShortName = u.ShortName,
                EnglishName = u.EnglishName,
                OldName = u.OldName,
                Code = u.Code,
                Type = u.Type.ToString(),
                ImageUrl = u.ImageUrl,
                IsFinanciallyAutonomous = u.IsFinanciallyAutonomous,
                HasDormitory = u.HasDormitory,
                Campuses = u.Campuses.Select(c => new CampusLocationDto(c.City, c.District)).ToList(),
                Dormitories = u.Dormitories
                    .OrderBy(d => d.Name)
                    .Select(d => new DormitoryDto(d.Name, d.Address, d.Note, d.RegistrationUrl))
                    .ToList(),
                Rankings = u.Rankings
                    .OrderByDescending(r => r.Year)
                    .ThenBy(r => r.RankingSystem)
                    .Select(r => new RankingDto(r.RankingSystem.ToString(), r.Year, r.RankFrom, r.RankTo, r.SourceUrl))
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (university == null)
        {
            _logger.LogWarning("University with ID {Id} not found", id);
        }

        return university;
    }

    public async Task<UniversityDto?> GetUniversityBySlugAsync(string slug)
    {
        _logger.LogInformation("Getting university with slug: {Slug}", slug);

        var university = await _context.Universities
            .Include(u => u.Campuses)
            .Include(u => u.Dormitories)
            .Include(u => u.Rankings)
            .Where(u => u.Slug == slug)
            .Select(u => new UniversityDto
            {
                Id = u.Id,
                Name = u.Name,
                Slug = u.Slug,
                ShortName = u.ShortName,
                EnglishName = u.EnglishName,
                OldName = u.OldName,
                Code = u.Code,
                Type = u.Type.ToString(),
                ImageUrl = u.ImageUrl,
                IsFinanciallyAutonomous = u.IsFinanciallyAutonomous,
                HasDormitory = u.HasDormitory,
                Campuses = u.Campuses.Select(c => new CampusLocationDto(c.City, c.District)).ToList(),
                Dormitories = u.Dormitories
                    .OrderBy(d => d.Name)
                    .Select(d => new DormitoryDto(d.Name, d.Address, d.Note, d.RegistrationUrl))
                    .ToList(),
                Rankings = u.Rankings
                    .OrderByDescending(r => r.Year)
                    .ThenBy(r => r.RankingSystem)
                    .Select(r => new RankingDto(r.RankingSystem.ToString(), r.Year, r.RankFrom, r.RankTo, r.SourceUrl))
                    .ToList()
            })
            .FirstOrDefaultAsync();

        if (university == null)
        {
            _logger.LogWarning("University with slug {Slug} not found", slug);
        }

        return university;
    }

    public async Task<UniversityMajorsDto?> GetUniversityMajorsAsync(int id)
    {
        _logger.LogInformation("Getting majors for university with ID: {Id}", id);

        var university = await _context.Universities
            .Where(u => u.Id == id)
            .Select(u => new { u.Id, u.Name, u.Code })
            .FirstOrDefaultAsync();

        if (university == null)
        {
            _logger.LogWarning("University with ID {Id} not found", id);
            return null;
        }

        // Built via the shared projection so this matches the recommendation endpoint's
        // major shape exactly (one source of truth). Separate query because EF can't
        // inline a referenced expression nested inside the university projection.
        var majors = await _context.Majors
            .Where(m => m.UniversityId == id)
            .OrderBy(m => m.Name)
            .Select(MajorProjections.ToDto)
            .ToListAsync();

        return new UniversityMajorsDto(university.Id, university.Name, university.Code, majors);
    }

}
