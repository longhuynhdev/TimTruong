using System;
using Core;
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
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed data
    }
}
