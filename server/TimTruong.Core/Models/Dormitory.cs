using System.ComponentModel.DataAnnotations;

namespace TimTruong.Core.Models;

public class Dormitory
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Dormitory name — unique across all dormitories (e.g., 'KTX Khu A - ĐHQG TP.HCM').
    /// Used as the ETL upsert key.
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Full address of the dormitory
    /// </summary>
    [MaxLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// General note: amenities (máy lạnh, wifi, máy giặt), curfew, gender rules, etc.
    /// </summary>
    [MaxLength(1000)]
    public string? Note { get; set; }

    /// <summary>
    /// Registration / info page URL for the dormitory
    /// </summary>
    [MaxLength(500)]
    public string? RegistrationUrl { get; set; }

    // Many-to-many: a dormitory can be shared by multiple universities (e.g., KTX Làng ĐH
    // is used by HCMUS, HCMUT, HCMUSSH, etc.)
    public ICollection<University> Universities { get; set; } = new List<University>();
}
