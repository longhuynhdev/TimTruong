using Core.Models;
using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Validators;

/// <summary>
/// Validates recommendation requests with business rules
/// </summary>
public static class RecommendationRequestValidator
{
    /// <summary>
    /// Validates the recommendation request and returns validation errors if any
    /// </summary>
    public static (bool IsValid, Dictionary<string, string[]> Errors) Validate(RecommendationRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        // Validate score ranges based on exam type
        if (request.ExamType == ExamType.THPTQG)
        {
            if (request.Score > 30)
            {
                errors["score"] = ["Score for THPTQG must not exceed 30"];
            }

            // SubjectCombination is required for THPTQG
            if (request.SubjectCombination == null)
            {
                errors["subjectCombination"] = ["SubjectCombination is required for THPTQG exam type"];
            }
        }
        else if (request.ExamType == ExamType.ĐGNL)
        {
            if (request.Score > 1200)
            {
                errors["score"] = ["Score for ĐGNL must not exceed 1200"];
            }
        }

        return (errors.Count == 0, errors);
    }
}
