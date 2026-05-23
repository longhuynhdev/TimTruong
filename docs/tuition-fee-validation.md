# Tuition Fee Validation Guide

This document explains how to implement code-level validation for `TuitionFeeAmount` and `TuitionFeeUnit` fields when creating Major management API endpoints.

## Current State

A database CHECK constraint ensures data integrity at the database level:

```sql
CONSTRAINT "CK_Majors_TuitionFee_Consistency"
CHECK (
    ("TuitionFeeAmount" IS NULL AND "TuitionFeeUnit" IS NULL) OR
    ("TuitionFeeAmount" IS NOT NULL AND "TuitionFeeUnit" IS NOT NULL)
)
```

This prevents invalid data from being inserted but returns unfriendly PostgreSQL error messages.

## Why Add Code-Level Validation?

- **Better UX**: Return clear, user-friendly error messages
- **Fail fast**: Validate before hitting the database
- **Consistent pattern**: Follow existing validator pattern in the codebase

## Implementation Steps

### Step 1: Create MajorValidator

Create `server/TimTruong.ApiService/Validators/MajorValidator.cs`:

```csharp
using TimTruong.ApiService.DTOs;

namespace TimTruong.ApiService.Validators;

public static class MajorValidator
{
    public static (bool IsValid, Dictionary<string, string[]> Errors) Validate(CreateMajorRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        // TuitionFeeAmount and TuitionFeeUnit must both be present or both be null
        bool hasAmount = request.TuitionFeeAmount.HasValue;
        bool hasUnit = request.TuitionFeeUnit.HasValue;

        if (hasAmount != hasUnit)
        {
            if (hasAmount && !hasUnit)
            {
                errors["tuitionFeeUnit"] = ["TuitionFeeUnit is required when TuitionFeeAmount is provided"];
            }
            else
            {
                errors["tuitionFeeAmount"] = ["TuitionFeeAmount is required when TuitionFeeUnit is provided"];
            }
        }

        // Additional validations
        if (hasAmount && request.TuitionFeeAmount <= 0)
        {
            errors["tuitionFeeAmount"] = ["TuitionFeeAmount must be greater than 0"];
        }

        return (errors.Count == 0, errors);
    }
}
```

### Step 2: Create DTO for Major Creation

Add to `server/TimTruong.ApiService/DTOs/MajorDtos.cs`:

```csharp
using Core.Models;

namespace TimTruong.ApiService.DTOs;

public record CreateMajorRequest(
    string Name,
    string? Code,
    string? FieldOfStudy,
    decimal? TuitionFeeAmount,
    TuitionFeeUnit? TuitionFeeUnit,
    int? EnrollmentQuota,
    int UniversityId
);
```

### Step 3: Use Validator in Endpoint

In your Major creation endpoint:

```csharp
group.MapPost("/", async (
    [FromBody] CreateMajorRequest request,
    IMajorService majorService,
    ILogger<IMajorService> logger) =>
{
    // Validate request
    var (isValid, errors) = MajorValidator.Validate(request);
    if (!isValid)
    {
        logger.LogWarning("Invalid major request: {Errors}", errors);
        return Results.ValidationProblem(errors);
    }

    // Proceed with creation...
});
```

## Reference

See `RecommendationRequestValidator.cs` and `RecommendationEndpoints.cs` for the existing validation pattern used in this codebase.
