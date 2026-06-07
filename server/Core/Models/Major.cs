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
    /// Major code currently used by the university (e.g., '7480201').
    /// </summary>
    [MaxLength(50)]
    public string? Code { get; set; }

    /// <summary>
    /// Code this major used previously, before the university renumbered it.
    /// </summary>
    [MaxLength(50)]
    public string? OldCode { get; set; }

    [Required]
    public int UniversityId { get; set; }

    // Navigation properties
    public University University { get; set; } = null!;
    public ICollection<AdmissionRequirement> AdmissionRequirements { get; set; } = new List<AdmissionRequirement>();

    /// <summary>
    /// Per-year offering data (tuition, quota, year-specific code). One row per academic year.
    /// </summary>
    public ICollection<MajorYear> Years { get; set; } = new List<MajorYear>();
}
