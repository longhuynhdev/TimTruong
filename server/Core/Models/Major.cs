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
    /// Codes this major used in previous years, before the university renumbered it.
    /// Lets the ETL link historical files (which keep the old code) to the same major.
    /// Stored as a Postgres text[].
    /// </summary>
    public List<string> OldCodes { get; set; } = new();

    /// <summary>
    /// Field of study category (e.g., 'CNTT', 'Điện - Điện tử', 'Y Dược')
    /// </summary>
    [MaxLength(100)]
    public string? FieldOfStudy { get; set; }

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
