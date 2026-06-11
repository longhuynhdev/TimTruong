using System.ComponentModel.DataAnnotations;

namespace Core.Models;

public class AdmissionRequirement
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int MajorId { get; set; }

    /// <summary>
    /// Exam type: THPTQG or ĐGNL
    /// </summary>
    [Required]
    public ExamType ExamType { get; set; }

    /// <summary>
    /// Admission score threshold. Null means the subject combination is offered for this
    /// year (known from the đề án) but the cutoff score has not been published yet —
    /// e.g. a newly opened major, or before the admission season ends.
    /// </summary>
    public decimal? Score { get; set; }

    /// <summary>
    /// Subject combination (required for THPTQG, null for ĐGNL)
    /// </summary>
    public SubjectCombination? SubjectCombination { get; set; }

    /// <summary>
    /// Academic year this requirement applies to (e.g., 2024)
    /// </summary>
    [Required]
    public int Year { get; set; }

    /// <summary>
    /// Source page for this cutoff (the school's điểm chuẩn announcement).
    /// May be shared across many rows of the same school-year.
    /// </summary>
    [MaxLength(500)]
    public string? SourceUrl { get; set; }

    // Navigation properties
    public Major Major { get; set; } = null!;
}


