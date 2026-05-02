using System.ComponentModel.DataAnnotations;

namespace Core.Models;

public class Major
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Major code used by the university (e.g., '7480201')
    /// </summary>
    [MaxLength(50)]
    public string? Code { get; set; }

    /// <summary>
    /// Field of study category (e.g., 'CNTT', 'Điện - Điện tử', 'Y Dược')
    /// </summary>
    [MaxLength(100)]
    public string? FieldOfStudy { get; set; }

    /// <summary>
    /// Tuition fee amount (in VND)
    /// </summary>
    public decimal? TuitionFeeAmount { get; set; }

    /// <summary>
    /// Unit of measurement for the tuition fee (e.g., per credit, per semester, per year)
    /// </summary>
    public TuitionFeeUnit? TuitionFeeUnit { get; set; }

    /// <summary>
    /// Total enrollment quota for this major
    /// </summary>
    public int? EnrollmentQuota { get; set; }

    [Required]
    public int UniversityId { get; set; }

    // Navigation properties
    public University University { get; set; } = null!;
    public ICollection<AdmissionRequirement> AdmissionRequirements { get; set; } = new List<AdmissionRequirement>();
}
