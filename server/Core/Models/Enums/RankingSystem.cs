namespace Core.Models;

/// <summary>
/// University ranking systems. Stored as integer in the database, so adding a new
/// member needs no migration (same convention as <see cref="ExamType"/>).
/// Keep the order stable; only append new members at the end.
/// </summary>
public enum RankingSystem
{
    VNUR,        // Viet Nam's University Rankings
    QS,
    THE,
    CWUR,         
}
