using System.ComponentModel.DataAnnotations;

namespace Core.Models;

public class AdmissionRequirement
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid MajorId { get; set; }

    /// <summary>
    /// Exam type: THPTQG or ĐGNL
    /// </summary>
    [Required]
    public ExamType ExamType { get; set; }

    /// <summary>
    /// Admission score threshold
    /// </summary>
    [Required]
    public decimal Score { get; set; }

    /// <summary>
    /// Subject combination (required for THPTQG, null for ĐGNL)
    /// </summary>
    public SubjectCombination? SubjectCombination { get; set; }

    /// <summary>
    /// Academic year this requirement applies to (e.g., 2024)
    /// </summary>
    [Required]
    public int Year { get; set; }

    // Navigation properties
    public Major Major { get; set; } = null!;
}


