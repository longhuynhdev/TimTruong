using System.ComponentModel.DataAnnotations;
using Core.Models;

namespace Core;

public class University
{
    [Key]
    public Guid Id { get; set; }
    [Required]
    public string Name { get; set; } = String.Empty;

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


}
