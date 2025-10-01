namespace Core.Models;

/// <summary>
/// Vietnamese high school subject combinations for university admission
/// </summary>
public enum SubjectCombination
{
    // Group A - Natural Sciences
    A00,  // Toán, Lý, Hóa
    A01,  // Toán, Lý, Anh
    A02,  // Toán, Lý, Sinh

    // Group B - Biology & Chemistry
    B00,  // Toán, Sinh, Hóa
    B01,  // Toán, Sinh, Anh

    // Group C - Social Sciences
    C00,  // Văn, Sử, Địa
    C01,  // Văn, Toán, Lý

    // Group D - Mathematics & Foreign Languages
    D01,  // Toán, Văn, Anh
    D07,  // Toán, Hóa, Anh
    D14,  // Toán, Văn, Địa

    // TODO: Add remaining combinations 
}
