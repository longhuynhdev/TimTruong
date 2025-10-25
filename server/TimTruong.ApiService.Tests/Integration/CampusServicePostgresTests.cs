using Microsoft.Extensions.Logging;
using Moq;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.Tests.Infrastructure;
using TimTruong.ApiService.Tests.Helpers;
using Core.Models;

namespace TimTruong.ApiService.Tests.Integration;

public class CampusServicePostgresTests : IAsyncLifetime
{
    private readonly PostgresTestDatabase _testDb;
    private ApplicationDbContext _context = null!;
    private CampusService _service = null!;
    private readonly Mock<ILogger<CampusService>> _mockLogger;

    public CampusServicePostgresTests()
    {
        _testDb = new PostgresTestDatabase();
        _mockLogger = new Mock<ILogger<CampusService>>();
    }

    public async Task InitializeAsync()
    {
        await _testDb.InitializeAsync();
        _context = _testDb.Context;
        _service = new CampusService(_context, _mockLogger.Object);

        // Seed test data
        var university = TestData.CreateSampleUniversityEntity(1);
        _context.Universities.Add(university);
        await _context.SaveChangesAsync();
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
        await _testDb.DisposeAsync();
    }

    [Fact]
    public async Task GetAllCampusesAsync_WithRealPostgres_ReturnsData()
    {
        // Arrange
        var campuses = TestData.CreateSampleCampusList();
        _context.Campuses.AddRange(campuses);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetAllCampusesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, campus => Assert.NotNull(campus.UniversityName));
    }

    [Fact]
    public async Task CreateCampusAsync_WithRealPostgres_PersistsToDatabase()
    {
        // Arrange
        var request = new CreateCampusRequest
        {
            Name = "Cơ sở Test",
            Address = "Test Address",
            City = "Test City",
            District = "Test District",
            UniversityCode = "BKA"
        };

        // Act
        var result = await _service.CreateCampusAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Cơ sở Test", result.Name);

        // Verify persistence by querying database directly
        var campusFromDb = await _context.Campuses.FindAsync(result.Id);
        Assert.NotNull(campusFromDb);
        Assert.Equal("Cơ sở Test", campusFromDb.Name);
    }

    [Fact]
    public async Task UpdateCampusAsync_WithRealPostgres_UpdatesPersistently()
    {
        // Arrange
        var campus = TestData.CreateSampleCampusEntity(1, 1);
        _context.Campuses.Add(campus);
        await _context.SaveChangesAsync();

        var request = new UpdateCampusRequest
        {
            Name = "Updated Name",
            Address = "Updated Address",
            City = "Updated City",
            District = "Updated District",
            UniversityCode = "BKA"
        };

        // Act
        var result = await _service.UpdateCampusAsync(1, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.Name);

        // Verify persistence by clearing tracked entities and reloading
        _context.ChangeTracker.Clear();
        var campusFromDb = await _context.Campuses.FindAsync(1);
        Assert.NotNull(campusFromDb);
        Assert.Equal("Updated Name", campusFromDb!.Name);
    }

    [Fact]
    public async Task DeleteCampusAsync_WithRealPostgres_RemovesFromDatabase()
    {
        // Arrange
        var campus = TestData.CreateSampleCampusEntity(1, 1);
        _context.Campuses.Add(campus);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.DeleteCampusAsync(1);

        // Assert
        Assert.True(result);

        // Verify deletion
        var campusFromDb = await _context.Campuses.FindAsync(1);
        Assert.Null(campusFromDb);
    }

    [Fact]
    public async Task GetAllCampusesAsync_WithFilters_WorksCorrectly()
    {
        // Arrange
        _context.Campuses.AddRange(TestData.CreateSampleCampusList());
        await _context.SaveChangesAsync();

        // Act & Assert - Search filter
        var searchResult = await _service.GetAllCampusesAsync(search: "Quận 5");
        Assert.Single(searchResult);

        // Act & Assert - City filter
        var cityResult = await _service.GetAllCampusesAsync(city: "TP HCM");
        Assert.Single(cityResult);
    }

    [Fact]
    public async Task CreateCampusAsync_TransactionalIntegrity_RollsBackOnError()
    {
        // Arrange - Create campus with invalid FK (university doesn't exist)
        var request = new CreateCampusRequest
        {
            Name = "Test Campus",
            Address = "Test",
            City = "Test",
            District = null,
            UniversityCode = "XXX" // Non-existent
        };

        // Act
        var result = await _service.CreateCampusAsync(request);

        // Assert - Should return null, no partial data saved
        Assert.Null(result);

        // Verify no campus was created
        var campusCount = _context.Campuses.Count();
        Assert.Equal(0, campusCount);
    }
}

