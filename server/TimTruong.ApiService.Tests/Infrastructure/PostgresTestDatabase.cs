using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;
using TimTruong.ApiService.DataAccess;

namespace TimTruong.ApiService.Tests.Infrastructure;

public class PostgresTestDatabase : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container;
    public ApplicationDbContext Context { get; private set; } = null!;

    public PostgresTestDatabase()
    {
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:15-alpine")
            .WithDatabase("testdb")
            .WithUsername("testuser")
            .WithPassword("testpass")
            .WithCleanUp(true)
            .Build();
    }

    public async Task InitializeAsync()
    {
        // Start PostgreSQL container
        await _container.StartAsync();

        // Create DbContext with container connection string
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_container.GetConnectionString())
            .Options;

        Context = new ApplicationDbContext(options);

        // Apply migrations
        await Context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await Context.DisposeAsync();
        await _container.StopAsync();
        await _container.DisposeAsync();
    }

    public void SeedTestData()
    {
        Context.Universities.AddRange(
            new Core.Models.University
            {
                Name = "Trường Đại học Bách Khoa TP.HCM",
                Code = "BKA",
                Type = Core.Models.UniType.Public,
                ShortName = "ĐHBK",
                EnglishName = "HCMUT",
                ImageUrl = "https://example.com/hcmut.jpg"
            },
            new Core.Models.University
            {
                Name = "Trường Đại học Quốc tế Sài Gòn",
                Code = "QST",
                Type = Core.Models.UniType.Private,
                ShortName = "SIU",
                EnglishName = "SIU"
            }
        );
        
        Context.SaveChanges();
    }
}
