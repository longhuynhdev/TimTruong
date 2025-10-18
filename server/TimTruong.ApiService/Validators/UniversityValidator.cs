using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace TimTruong.ApiService.Validators;

/// <summary>
/// Validates university requests with business rules
/// </summary>
public static class UniversityValidator
{
    /// <summary>
    /// Validates if university code is unique (not already in use)
    /// </summary>
    public static async Task<(bool IsValid, string? ErrorMessage)> ValidateUniqueCodeAsync(
        ApplicationDbContext context, 
        string code, 
        int? excludeId = null)
    {
        var query = context.Universities.Where(u => u.Code == code);
        
        // Exclude current university when updating
        if (excludeId.HasValue)
        {
            query = query.Where(u => u.Id != excludeId.Value);
        }

        var exists = await query.AnyAsync();
        
        if (exists)
        {
            return (false, $"University with code '{code}' already exists");
        }

        return (true, null);
    }

    /// <summary>
    /// Validates if university name is unique (not already in use)
    /// </summary>
    public static async Task<(bool IsValid, string? ErrorMessage)> ValidateUniqueNameAsync(
        ApplicationDbContext context, 
        string name, 
        int? excludeId = null)
    {
        var query = context.Universities.Where(u => u.Name == name);
        
        // Exclude current university when updating
        if (excludeId.HasValue)
        {
            query = query.Where(u => u.Id != excludeId.Value);
        }

        var exists = await query.AnyAsync();
        
        if (exists)
        {
            return (false, $"University with name '{name}' already exists");
        }

        return (true, null);
    }
}
