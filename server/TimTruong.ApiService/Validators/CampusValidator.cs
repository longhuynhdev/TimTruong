using TimTruong.ApiService.DataAccess;
using Microsoft.EntityFrameworkCore;
using Core.Models;

namespace TimTruong.ApiService.Validators;

// validate campus request with business rules
// + Ensures university exists.
// + Validates name uniqueness within the university.
// + Validates location uniqueness within the university.
public static class CampusValidator
{
    // 1) Check that the university exists
    public static async Task<(bool IsValid, string? ErrorMessage, University? University)> ValidateUniversityExistsAsync(
        ApplicationDbContext context,
        string universityCode)
    {
        if (string.IsNullOrWhiteSpace(universityCode))
            return (false, "University code is required", null);

        var university = await context.Universities
                               .AsNoTracking() //for validation reads — it's faster when you don't plan to change the entity
                               .FirstOrDefaultAsync(u => u.Code == universityCode);

        if (university == null)
            return (false, $"University with Code '{universityCode}' not found", null);

        return (true, null, university);
    }

    // 2) Validate campus name uniqueness WITHIN the university
    public static async Task<(bool IsValid, string? ErrorMessage)> ValidateUniqueNameAsync(
        ApplicationDbContext context,
        string name,
        int universityId,
        int? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            return (false, "Campus name is required");

        var normalized = name.Trim();

        var query = context.Campuses
            .AsNoTracking()
            .Where(c => c.UniversityId == universityId && EF.Functions.Like(c.Name, normalized));

        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        var exists = await query.AnyAsync();

        if (exists)
            return (false, $"Campus with name '{name}' already exists for this university");

        return (true, null);
    }

    // validate if address of campus is unique, include district and city ==> called location
    // that means address is not shared for other campuses
    // 3) Validate location uniqueness (address + optional district + city) WITHIN the university and with other universities
    public static async Task<(bool IsValid, string? ErrorMessage)> ValidateUniqueLocationAsync(
        ApplicationDbContext context,
        string address,
        string? district,
        string city,
        int universityId,
        int? excludeId = null)
    {
        // TODO: schema of table Campus has some issues
        // why can address, district be nullable ?
        // Ask Leader

        var addrNorm = address.Trim();
        var cityNorm = city.Trim();
        var districtNorm = district?.Trim();

        // Use case-insensitive comparison via LOWER in SQL (ToLowerInvariant) or EF.Functions.Like depending DB.
        var query = context.Campuses
            .AsNoTracking()
            .Where(c => c.UniversityId == universityId
                && c.Address != null
                && c.Address.ToLower().Contains(addrNorm.ToLower())
                && c.City.ToLower() == cityNorm.ToLower()         // exact city match
            );

        if (!string.IsNullOrWhiteSpace(districtNorm))
        {
            // only filter by district when provided
            query = query.Where(c => c.District != null && EF.Functions.Like(c.District, districtNorm));
        }

        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        var exists = await query.Include(c => c.University).FirstOrDefaultAsync();

        if (exists != null)
        {
            if(exists.UniversityId == universityId)
            {
                return (false, $"Campus at location '{address}', '{district}', '{city}' already exists for this university");
            }
            else
            {
                return (false, $"Campus at location '{address}', '{district}', '{city}' already belongs to another university with Code '{exists.University.Code}'");
            }
        }

        return (true, null);
    }
}