using System.ComponentModel.DataAnnotations;
using Core.Models;

namespace TimTruong.ApiService.DTOs;

/// <summary>
/// Request for university and major recommendations based on exam scores
/// </summary>
public record RecommendationRequest
{
    /// <summary>
    /// Type of exam (THPTQG or ĐGNL)
    /// </summary>
    [Required(ErrorMessage = "ExamType is required")]
    public required ExamType ExamType { get; init; }

    /// <summary>
    /// Student's exam score
    /// </summary>
    [Required(ErrorMessage = "Score is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Score must be greater than 0")]
    public required decimal Score { get; init; }

    /// <summary>
    /// Subject combination (required for THPTQG)
    /// </summary>
    public SubjectCombination? SubjectCombination { get; init; }
}
