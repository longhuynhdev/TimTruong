using System;
using Core;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace TimTruong.ApiService.DataAccess;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {

    }
    // Define DbSets for entities here
    public DbSet<University> Universities { get; set; }
    public DbSet<Campus> Campuses { get; set; }
    public DbSet<Major> Majors { get; set; }
    public DbSet<AdmissionRequirement> AdmissionRequirements { get; set; }
    public DbSet<Dormitory> Dormitories { get; set; }
    public DbSet<UniversityRanking> UniversityRankings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique slug per university (Postgres allows multiple NULLs, so rows
        // can be backfilled by the ETL pipeline without violating the index).
        modelBuilder.Entity<University>()
            .HasIndex(u => u.Slug)
            .IsUnique();

        // Many-to-many: University ↔ Dormitory (shared KTX like Làng ĐH used by multiple universities).
        // EF Core 6+ auto-creates the join table; we name it explicitly for clarity.
        modelBuilder.Entity<University>()
            .HasMany(u => u.Dormitories)
            .WithMany(d => d.Universities)
            .UsingEntity("UniversityDormitories");

        // Unique dormitory name (used as ETL upsert key).
        modelBuilder.Entity<Dormitory>()
            .HasIndex(d => d.Name)
            .IsUnique();

        // A university has one rank per (system, year) — also the ETL upsert key.
        modelBuilder.Entity<UniversityRanking>()
            .HasIndex(r => new { r.UniversityId, r.RankingSystem, r.Year })
            .IsUnique();

        modelBuilder.Entity<UniversityRanking>()
            .HasOne(r => r.University)
            .WithMany(u => u.Rankings)
            .HasForeignKey(r => r.UniversityId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed data
    }
}
