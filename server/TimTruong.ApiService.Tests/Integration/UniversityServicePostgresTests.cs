using Microsoft.Extensions.Logging;
using Moq;
using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.Tests.Infrastructure;
using Xunit;

namespace TimTruong.ApiService.Tests.Integration;

public class UniversityServicePostgresTests : IAsyncLifetime
{
    private readonly PostgresTestDatabase _database;
    private UniversityService _service = null!;

    public UniversityServicePostgresTests()
    {
        _database = new PostgresTestDatabase();
    }

    // Each test gets fresh PostgreSQL container
    public async Task InitializeAsync()
    {
        await _database.InitializeAsync();
        _database.SeedTestData();
        
        var logger = Mock.Of<ILogger<UniversityService>>();
        _service = new UniversityService(_database.Context, logger);
    }

    public async Task DisposeAsync()
    {
        await _database.DisposeAsync();
    }

    [Fact]
    public async Task GetAllUniversities_WithRealPostgres_ReturnsData()
    {
        // Act
        var result = await _service.GetAllUniversitiesAsync();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains(result, u => u.Code == "BKA");
        Assert.Contains(result, u => u.Code == "QST");
    }

    [Fact]
    public async Task GetAllUniversities_SearchByName_ReturnsFiltered()
    {
        // Act
        var result = await _service.GetAllUniversitiesAsync(search: "bách khoa");

        // Assert
        Assert.Single(result);
        Assert.Equal("BKA", result[0].Code);
    }

    [Fact]
    public async Task GetAllUniversities_FilterByType_ReturnsFiltered()
    {
        // Act
        var result = await _service.GetAllUniversitiesAsync(type: "Public");

        // Assert
        Assert.Single(result);
        Assert.Equal("Public", result[0].Type);
    }

    [Fact]
    public async Task CreateUniversity_WithRealPostgres_PersistsToDatabase()
    {
        // Arrange
        var request = new CreateUniversityRequest
        {
            Name = "Trường Đại học FPT",
            Code = "FPT",
            Type = "Private",
            ShortName = "FPT Uni",
            EnglishName = "FPT University",
            ImageUrl = "https://example.com/fpt.jpg"
        };

        // Act
        var result = await _service.CreateUniversityAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("FPT", result.Code);
        Assert.True(result.Id > 0);

        // Verify it's in database by querying again
        var fromDb = await _database.Context.Universities.FindAsync(result.Id);
        Assert.NotNull(fromDb);
        Assert.Equal("FPT", fromDb.Code);
    }

    [Fact]
    public async Task UpdateUniversity_WithRealPostgres_UpdatesDatabase()
    {
        // Arrange - Get first university
        var universities = await _service.GetAllUniversitiesAsync();
        var firstId = universities[0].Id;

        var updateRequest = new UpdateUniversityRequest
        {
            Name = "Updated Name",
            Code = "BKA",
            Type = "Public",
            ShortName = "Updated Short",
            EnglishName = "Updated English",
            ImageUrl = "https://example.com/updated.jpg"
        };

        // Act
        var result = await _service.UpdateUniversityAsync(firstId, updateRequest);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.Name);

        // Verify update in database
        var fromDb = await _database.Context.Universities.FindAsync(firstId);
        Assert.Equal("Updated Name", fromDb!.Name);
    }

    [Fact]
    public async Task DeleteUniversity_WithRealPostgres_RemovesFromDatabase()
    {
        // Arrange - Get first university
        var universities = await _service.GetAllUniversitiesAsync();
        var firstId = universities[0].Id;

        // Act
        var result = await _service.DeleteUniversityAsync(firstId);

        // Assert
        Assert.True(result);

        // Verify deletion
        var fromDb = await _database.Context.Universities.FindAsync(firstId);
        Assert.Null(fromDb);
    }
}
