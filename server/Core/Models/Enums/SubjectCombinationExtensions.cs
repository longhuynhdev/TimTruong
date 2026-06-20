using System.Collections.Concurrent;
using System.ComponentModel;
using System.Reflection;

namespace Core.Models;

/// <summary>
/// Helpers for reading the display metadata attached to <see cref="SubjectCombination"/> members.
/// </summary>
public static class SubjectCombinationExtensions
{
    // Cache the reflected subject list per member so we only reflect once.
    private static readonly ConcurrentDictionary<SubjectCombination, string[]> _subjectsCache = new();

    /// <summary>
    /// Returns the full, display-ready subject names for a combination
    /// (e.g. A00 → ["Toán", "Vật lý", "Hóa học"]), read from its
    /// <see cref="DescriptionAttribute"/>. Falls back to the enum name if absent.
    /// </summary>
    public static string[] GetSubjects(this SubjectCombination combination)
        => _subjectsCache.GetOrAdd(combination, static c =>
        {
            var description = typeof(SubjectCombination)
                .GetField(c.ToString())
                ?.GetCustomAttribute<DescriptionAttribute>()
                ?.Description;

            return string.IsNullOrWhiteSpace(description)
                ? [c.ToString()]
                : description.Split(", ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        });
}
