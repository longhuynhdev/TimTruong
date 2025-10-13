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

    // Navigation properties
    public ICollection<Campus> Campuses { get; set; } = new List<Campus>();
    public ICollection<Major> Majors { get; set; } = new List<Major>();
}
