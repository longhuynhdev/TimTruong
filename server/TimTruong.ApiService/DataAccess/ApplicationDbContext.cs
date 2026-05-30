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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique slug per university (Postgres allows multiple NULLs, so rows
        // can be backfilled by the ETL pipeline without violating the index).
        modelBuilder.Entity<University>()
            .HasIndex(u => u.Slug)
            .IsUnique();

        // Seed data
    }
}
