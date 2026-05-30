using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace TimTruong.ApiService.Utils;

/// <summary>
/// Builds URL-friendly ASCII slugs from Vietnamese university names.
/// Example: ("Đại học Khoa học Tự nhiên", "HCMUS") → "dai-hoc-khoa-hoc-tu-nhien-hcmus".
/// </summary>
/// <remarks>
/// Must stay consistent with the Python implementation in data/slugify.py.
/// </remarks>
public static partial class SlugGenerator
{
    public static string Generate(string name, string? shortName = null)
    {
        var text = string.IsNullOrWhiteSpace(shortName) ? name : $"{name} {shortName}";
        return Slugify(text);
    }

    private static string Slugify(string text)
    {
        text = text.ToLowerInvariant().Replace('đ', 'd');

        // Decompose accented chars and drop the combining diacritic marks.
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        text = sb.ToString().Normalize(NormalizationForm.FormC);
        // Any run of non-alphanumeric chars becomes a single hyphen.
        text = NonAlphanumeric().Replace(text, "-").Trim('-');
        return text;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonAlphanumeric();
}
