using System.ComponentModel.DataAnnotations;

namespace Core.Models;

public class Campus
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public int UniversityId { get; set; }

    /// <summary>
    /// Full street address
    /// </summary>
    [MaxLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// City or province (e.g., 'TP HCM', 'Hà Nội', 'Đà Nẵng')
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    /// <summary>
    /// District (only for major cities, e.g., 'Quận 5', 'Quận 1')
    /// </summary>
    [MaxLength(100)]
    public string? District { get; set; }
    
    [MaxLength(500)]
    public string? OldAddress { get; set; }

    [Required]
    [MaxLength(100)]
    public string OldCity { get; set; } = string.Empty;


    // Navigation properties
    public University University { get; set; } = null!;
}
