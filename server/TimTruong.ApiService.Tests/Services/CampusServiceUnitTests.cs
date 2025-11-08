using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.Tests.Helpers;
using Core.Models;

namespace TimTruong.ApiService.Tests.Services;

public class CampusServiceUnitTests
{
    private readonly ApplicationDbContext _context;
    private readonly CampusService _service;
    private readonly Mock<ILogger<CampusService>> _mockLogger;

    public CampusServiceUnitTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _mockLogger = new Mock<ILogger<CampusService>>();
        _service = new CampusService(_context, _mockLogger.Object);

        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        var university = TestData.CreateSampleUniversityEntity(1);
        _context.Universities.Add(university);

        var campuses = TestData.CreateSampleCampusList();
        _context.Campuses.AddRange(campuses);

        _context.SaveChanges();
    }

    [Fact]
    public async Task GetAllCampusesAsync_ReturnsAllCampuses()
    {
        // Act
        var result = await _service.GetAllCampusesAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, campus => Assert.NotNull(campus.UniversityName));
    }

    [Fact]
    public async Task GetAllCampusesAsync_WithSearchFilter_ReturnsFilteredResults()
    {
        // Act
        var result = await _service.GetAllCampusesAsync(search: "Dĩ An");

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Contains("Dĩ An", result[0].Name);
    }

    [Fact]
    public async Task GetAllCampusesAsync_WithCityFilter_ReturnsFilteredResults()
    {
        // Act
        var result = await _service.GetAllCampusesAsync(city: "TP HCM");

        // Assert
        Assert.NotNull(result);
        Assert.Single(result);
        Assert.Equal("TP HCM", result[0].City);
    }

    [Fact]
    public async Task GetAllCampusesAsync_WithUniversityFilter_ReturnsFilteredResults()
    {
        // Act
        var result = await _service.GetAllCampusesAsync(university: "BKA");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, campus => Assert.Equal("BKA", campus.UniversityCode));
    }

    [Fact]
    public async Task GetCampusByIdAsync_ExistingId_ReturnsCampus()
    {
        // Act
        var result = await _service.GetCampusByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("Cơ sở Dĩ An", result.Name);
        Assert.Equal("BKA", result.UniversityCode);
    }

    [Fact]
    public async Task GetCampusByIdAsync_NonExistingId_ReturnsNull()
    {
        // Act
        var result = await _service.GetCampusByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateCampusAsync_ValidRequest_CreatesCampus()
    {
        // Arrange
        var request = new CreateCampusRequest
        {
            Name = "Cơ sở Hóc Môn",
            Address = "1 Võ Văn Ngân",
            City = "TP HCM",
            District = "Hóc Môn",
            UniversityCode = "BKA"
        };

        // Act
        var result = await _service.CreateCampusAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Cơ sở Hóc Môn", result.Name);
        Assert.Equal("BKA", result.UniversityCode);
        Assert.Equal(1, result.UniversityId);

        var campusInDb = await _context.Campuses.FindAsync(result.Id);
        Assert.NotNull(campusInDb);
    }

    [Fact]
    public async Task CreateCampusAsync_NonExistentUniversity_ReturnsNull()
    {
        // Arrange
        var request = new CreateCampusRequest
        {
            Name = "Test Campus",
            Address = "Test Address",
            City = "Test City",
            District = null,
            UniversityCode = "XXX"
        };

        // Act
        var result = await _service.CreateCampusAsync(request);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateCampusAsync_ExistingCampus_UpdatesSuccessfully()
    {
        // Arrange
        var request = new UpdateCampusRequest
        {
            Name = "Cơ sở Dĩ An Updated",
            Address = "273 An Dương Vương",
            City = "Bình Dương",
            District = "Dĩ An",
            UniversityCode = "BKA"
        };

        // Act
        var result = await _service.UpdateCampusAsync(1, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Cơ sở Dĩ An Updated", result.Name);

        var campusInDb = await _context.Campuses.FindAsync(1);
        Assert.NotNull(campusInDb);
        Assert.Equal("Cơ sở Dĩ An Updated", campusInDb!.Name);
    }

    [Fact]
    public async Task UpdateCampusAsync_NonExistingCampus_ReturnsNull()
    {
        // Arrange
        var request = TestData.CreateSampleUpdateCampusRequest();

        // Act
        var result = await _service.UpdateCampusAsync(999, request);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateCampusAsync_TransferToNewUniversity_UpdatesUniversityId()
    {
        // Arrange
        var newUniversity = new University
        {
            Id = 2,
            Name = "Test University",
            Code = "TST",
            Type = UniType.Public
        };
        _context.Universities.Add(newUniversity);
        await _context.SaveChangesAsync();

        var request = new UpdateCampusRequest
        {
            Name = "Cơ sở Dĩ An",
            Address = "273 An Dương Vương",
            City = "Bình Dương",
            District = "Dĩ An",
            UniversityCode = "TST"
        };

        // Act
        var result = await _service.UpdateCampusAsync(1, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.UniversityId);
        Assert.Equal("TST", result.UniversityCode);
    }

    [Fact]
    public async Task DeleteCampusAsync_ExistingCampus_DeletesSuccessfully()
    {
        // Act
        var result = await _service.DeleteCampusAsync(1);

        // Assert
        Assert.True(result);

        var campusInDb = await _context.Campuses.FindAsync(1);
        Assert.Null(campusInDb);
    }

    [Fact]
    public async Task DeleteCampusAsync_NonExistingCampus_ReturnsFalse()
    {
        // Act
        var result = await _service.DeleteCampusAsync(999);

        // Assert
        Assert.False(result);
    }
}

