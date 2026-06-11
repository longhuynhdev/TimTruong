using System.ComponentModel.DataAnnotations;

namespace TimTruong.Core.Models;

/// <summary>
/// A major's year-varying data for a specific academic year (tuition, enrollment quota).
/// Modeled as a yearly row (like <see cref="AdmissionRequirement"/> and
/// <see cref="UniversityRanking"/>) so a new year is just a new row — no schema change. This
/// lets a university publish a multi-year tuition roadmap (one row per year), while
/// <see cref="Major"/> holds only the stable identity (name, field of study, canonical code).
/// </summary>
public class MajorYear
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int MajorId { get; set; }

    /// <summary>
    /// Academic year this offering applies to (e.g., 2026).
    /// </summary>
    [Required]
    public int Year { get; set; }

    /// <summary>
    /// Tuition fee (in VND): the concrete amount, or the lower bound of a range.
    /// </summary>
    public decimal? TuitionFeeMin { get; set; }

    /// <summary>
    /// Upper bound of the tuition range, encoding the shape so a single amount is distinguishable
    /// from a range: null for a concrete amount (e.g., 25,000,000), or the upper bound for a range
    /// (e.g., 25,000,000–35,000,000). Some schools publish a range rather than a single figure.
    /// </summary>
    public decimal? TuitionFeeMax { get; set; }

    /// <summary>
    /// Unit of measurement for the tuition fee (e.g., per credit, per semester, per year).
    /// </summary>
    public TuitionFeeUnit? TuitionFeeUnit { get; set; }

    /// <summary>
    /// Total enrollment quota for this major in this year.
    /// </summary>
    public int? EnrollmentQuota { get; set; }

    // Navigation properties
    public Major Major { get; set; } = null!;
}
