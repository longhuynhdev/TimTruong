using System.ComponentModel.DataAnnotations;

namespace Core.Models;

/// <summary>
/// A university's rank in a given ranking system for a specific year.
/// Modeled as a yearly row (like <see cref="AdmissionRequirement"/>) so a new year
/// is just a new row — no schema change. Multiple universities may share the same rank.
/// </summary>
public class UniversityRanking
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UniversityId { get; set; }

    /// <summary>
    /// Ranking system: VNUR, QS, THE, ...
    /// </summary>
    [Required]
    public RankingSystem RankingSystem { get; set; }

    /// <summary>
    /// Year this ranking applies to (e.g., 2024).
    /// </summary>
    [Required]
    public int Year { get; set; }

    /// <summary>
    /// Rank position, or the lower bound of a band (e.g., 5, or 601 for "601–800").
    /// Used for numeric sorting/filtering. Ties are allowed — universities can share a rank.
    /// </summary>
    [Required]
    public int RankFrom { get; set; }

    /// <summary>
    /// Upper bound, encoding the rank shape so a single rank is distinguishable from an
    /// open band: equal to <see cref="RankFrom"/> for a single rank (e.g., 5 → 5),
    /// the band's upper bound for a closed band (e.g., 601–800 → 800), and null for an
    /// open-ended band (e.g., "1001+"). Some systems (QS, THE) publish bands.
    /// </summary>
    public int? RankTo { get; set; }

    /// <summary>
    /// Source page for this ranking edition. May be shared across many universities
    /// (e.g., a single VNUR 2024 page listing every school).
    /// </summary>
    [MaxLength(500)]
    public string? SourceUrl { get; set; }

    // Navigation properties
    public University University { get; set; } = null!;
}
