using System.ComponentModel.DataAnnotations;

namespace Core.Models;

public class University
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = String.Empty;
    
    [MaxLength(50)]
    public string? ShortName { get; set; }

    public string? EnglishName { get; set; }

    /// <summary>
    /// Former name of the university (before it was renamed)
    /// </summary>
    public string? OldName { get; set; }

    /// <summary>
    /// URL-friendly, ASCII slug derived from the name (+ short name).
    /// Used for SEO-friendly detail URLs, e.g. "dai-hoc-khoa-hoc-tu-nhien-hcmus".
    /// </summary>
    /// <remarks>
    /// Nullable so the column can be added to existing rows; populated by the ETL
    /// pipeline and on create/update. A unique index is configured in ApplicationDbContext.
    /// </remarks>
    [MaxLength(160)]
    public string? Slug { get; set; }
    /// <summary>
    /// Unique code for the university
    /// </summary>
    /// /// <remarks>
    /// Examples: QST, QSB, QSC
    /// </remarks>
    [Required]
    [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "Code must be exactly 3 uppercase letters")]
    public string Code { get; set; } = String.Empty;
    /// <summary>
    /// Type of the university (e.g., Public, Private)
    /// </summary>
    [Required]
    public UniType Type { get; set; }
    public string? ImageUrl { get; set; }

    public bool? IsFinanciallyAutonomous { get; set; }

    /// <summary>
    /// Whether the university provides a dormitory (KTX): true = yes, false = no,
    /// null = not yet known. Used for the "có ký túc xá" search filter.
    /// </summary>
    public bool? HasDormitory { get; set; }

    // Navigation properties
    public ICollection<Campus> Campuses { get; set; } = new List<Campus>();
    public ICollection<Major> Majors { get; set; } = new List<Major>();
    public ICollection<Dormitory> Dormitories { get; set; } = new List<Dormitory>();
    public ICollection<UniversityRanking> Rankings { get; set; } = new List<UniversityRanking>();
}
