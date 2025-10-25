using Moq;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.DTOs;
using Core.Models;
using Xunit;

namespace TimTruong.ApiService.Tests.Services;

/// <summary>
/// Unit tests for UniversityService - uses in-memory database for speed
/// </summary>
public class UniversityServiceUnitTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly UniversityService _service;
    private readonly Mock<ILogger<UniversityService>> _mockLogger;

    public UniversityServiceUnitTests()
    {
        // Use IN-MEMORY database (not real PostgreSQL)
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        
        // Seed test data
        SeedData();

        _mockLogger = new Mock<ILogger<UniversityService>>();
        _service = new UniversityService(_context, _mockLogger.Object);
    }

    private void SeedData()
    {
        _context.Universities.AddRange(
            new University
            {
                Id = 1,
                Name = "Trường Đại học Bách Khoa TP.HCM",
                Code = "BKA",
                Type = UniType.Public,
                ShortName = "ĐHBK",
                EnglishName = "HCMUT"
            },
            new University
            {
                Id = 2,
                Name = "Trường Đại học Quốc tế Sài Gòn",
                Code = "QST",
                Type = UniType.Private
            },
            new University
            {
                Id = 3,
                Name = "Trường Đại học FPT",
                Code = "FPT",
                Type = UniType.Private
            }
        );
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    // ========== READ TESTS ==========

    [Fact]
    public async Task GetAllUniversitiesAsync_NoFilters_ReturnsAllUniversities()
    {
        // Act
        var result = await _service.GetAllUniversitiesAsync();

        // Assert
        Assert.Equal(3, result.Count);
        Assert.All(result, u => Assert.NotNull(u.Name));
    }

    [Fact]
    public async Task GetAllUniversitiesAsync_WithSearch_ReturnsMatchingUniversities()
    {
        // Act
        var result = await _service.GetAllUniversitiesAsync(search: "bách khoa");

        // Assert
        Assert.Single(result);
        Assert.Equal("BKA", result[0].Code);
    }

    [Theory]
    [InlineData("Public", 1)]
    [InlineData("Private", 2)]
    public async Task GetAllUniversitiesAsync_FilterByType_ReturnsCorrectCount(string type, int expectedCount)
    {
        // Act
        var result = await _service.GetAllUniversitiesAsync(type: type);

        // Assert
        Assert.Equal(expectedCount, result.Count);
        Assert.All(result, u => Assert.Equal(type, u.Type));
    }

    [Fact]
    public async Task GetUniversityByIdAsync_ExistingId_ReturnsUniversity()
    {
        // Act
        var result = await _service.GetUniversityByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("BKA", result.Code);
        Assert.Equal("Trường Đại học Bách Khoa TP.HCM", result.Name);
    }

    [Fact]
    public async Task GetUniversityByIdAsync_NonExistingId_ReturnsNull()
    {
        // Act
        var result = await _service.GetUniversityByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetSimpleUniversitiesAsync_ReturnsSimplifiedList()
    {
        // Act
        var result = await _service.GetSimpleUniversitiesAsync();

        // Assert
        Assert.Equal(3, result.Count);
        Assert.All(result, u =>
        {
            Assert.NotNull(u.Name);
            Assert.NotNull(u.Code);
            Assert.True(u.Id > 0);
        });
    }

    // ========== CREATE TESTS ==========

    [Fact]
    public async Task CreateUniversityAsync_ValidRequest_CreatesAndReturnsUniversity()
    {
        // Arrange
        var request = new CreateUniversityRequest
        {
            Name = "Trường Đại học Tôn Đức Thắng",
            Code = "TDT",
            Type = "Public",
            ShortName = "TDTU",
            EnglishName = "Ton Duc Thang University",
            ImageUrl = "https://example.com/tdtu.jpg"
        };

        // Act
        var result = await _service.CreateUniversityAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("TDT", result.Code);
        Assert.True(result.Id > 0);

        // Verify it's in database
        var inDb = await _context.Universities.FindAsync(result.Id);
        Assert.NotNull(inDb);
        Assert.Equal("TDT", inDb.Code);
    }

    [Fact]
    public async Task CreateUniversityAsync_InvalidType_ThrowsArgumentException()
    {
        // Arrange
        var request = new CreateUniversityRequest
        {
            Name = "Test University",
            Code = "TST",
            Type = "InvalidType" // Invalid enum value
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => _service.CreateUniversityAsync(request)
        );
    }

    // ========== UPDATE TESTS ==========

    [Fact]
    public async Task UpdateUniversityAsync_ExistingUniversity_UpdatesAndReturns()
    {
        // Arrange
        var request = new UpdateUniversityRequest
        {
            Name = "Trường Đại học Bách Khoa TP.HCM - Updated",
            Code = "BKA",
            Type = "Public",
            ShortName = "ĐHBK Updated",
            EnglishName = "HCMUT Updated",
            ImageUrl = "https://example.com/updated.jpg"
        };

        // Act
        var result = await _service.UpdateUniversityAsync(1, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Trường Đại học Bách Khoa TP.HCM - Updated", result.Name);
        Assert.Equal("ĐHBK Updated", result.ShortName);

        // Verify database was updated
        var inDb = await _context.Universities.FindAsync(1);
        Assert.Equal("ĐHBK Updated", inDb!.ShortName);
    }

    [Fact]
    public async Task UpdateUniversityAsync_NonExistingUniversity_ReturnsNull()
    {
        // Arrange
        var request = new UpdateUniversityRequest
        {
            Name = "Test",
            Code = "TST",
            Type = "Public"
        };

        // Act
        var result = await _service.UpdateUniversityAsync(999, request);

        // Assert
        Assert.Null(result);
    }

    // ========== DELETE TESTS ==========

    [Fact]
    public async Task DeleteUniversityAsync_ExistingUniversity_DeletesAndReturnsTrue()
    {
        // Act
        var result = await _service.DeleteUniversityAsync(1);

        // Assert
        Assert.True(result);

        // Verify deletion
        var deleted = await _context.Universities.FindAsync(1);
        Assert.Null(deleted);

        // Verify count decreased
        var remaining = await _context.Universities.CountAsync();
        Assert.Equal(2, remaining);
    }

    [Fact]
    public async Task DeleteUniversityAsync_NonExistingUniversity_ReturnsFalse()
    {
        // Act
        var result = await _service.DeleteUniversityAsync(999);

        // Assert
        Assert.False(result);

        // Verify no data was affected
        var count = await _context.Universities.CountAsync();
        Assert.Equal(3, count);
    }

    // ========== EDGE CASE TESTS ==========

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task GetAllUniversitiesAsync_EmptySearch_ReturnsAllUniversities(string? search)
    {
        // Act
        var result = await _service.GetAllUniversitiesAsync(search: search);

        // Assert
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public async Task GetAllUniversitiesAsync_CaseInsensitiveSearch_Works()
    {
        // Act
        var lowercase = await _service.GetAllUniversitiesAsync(search: "bách khoa");
        var uppercase = await _service.GetAllUniversitiesAsync(search: "BÁCH KHOA");
        var mixed = await _service.GetAllUniversitiesAsync(search: "BáCh KhOa");

        // Assert
        Assert.Single(lowercase);
        Assert.Single(uppercase);
        Assert.Single(mixed);
        Assert.Equal(lowercase[0].Id, uppercase[0].Id);
        Assert.Equal(lowercase[0].Id, mixed[0].Id);
    }
}
