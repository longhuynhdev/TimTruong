using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using TimTruong.ApiService.DataAccess;

namespace TimTruong.ApiService.Tests.Infrastructure;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"TestDb_{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set environment to "Testing" BEFORE any services are configured
        builder.UseEnvironment("Testing");
        
        builder.ConfigureServices(services =>
        {
            // Remove any existing DbContext registrations
            var descriptors = services.Where(d => 
                d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                d.ServiceType == typeof(ApplicationDbContext)).ToList();
            
            foreach (var descriptor in descriptors)
            {
                services.Remove(descriptor);
            }

            // Add in-memory database - use the SAME database name for all requests from this factory
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(_dbName);
            });
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        
        // Seed data ONCE when host is created
        SeedDatabase(host.Services);
        
        return host;
    }

    private void SeedDatabase(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Ensure database is created
        db.Database.EnsureCreated();
        
        // Only seed if empty (to avoid re-seeding)
        if (!db.Universities.Any())
        {
            db.Universities.AddRange(
                new Core.Models.University
                {
                    Id = 1,
                    Name = "Trường Đại học Bách Khoa TP.HCM",
                    Code = "BKA",
                    Type = Core.Models.UniType.Public,
                    ShortName = "ĐHBK",
                    EnglishName = "HCMUT"
                },
                new Core.Models.University
                {
                    Id = 2,
                    Name = "Trường Đại học Quốc tế Sài Gòn",
                    Code = "QST",
                    Type = Core.Models.UniType.Private,
                    ShortName = "ĐHQT",
                    EnglishName = "Saigon International University"
                }
            );
            
            db.SaveChanges();
        }
    }
}