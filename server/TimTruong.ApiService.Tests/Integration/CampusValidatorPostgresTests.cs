using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Validators;
using TimTruong.ApiService.Tests.Infrastructure;
using TimTruong.ApiService.Tests.Helpers;

namespace TimTruong.ApiService.Tests.Integration;

public class CampusValidatorPostgresTests : IAsyncLifetime
{
    private readonly PostgresTestDatabase _testDb;
    private ApplicationDbContext _context = null!;

    public CampusValidatorPostgresTests()
    {
        _testDb = new PostgresTestDatabase();
    }

    public async Task InitializeAsync()
    {
        await _testDb.InitializeAsync();
        _context = _testDb.Context;

        // Seed test data
        var university = TestData.CreateSampleUniversityEntity(1);
        _context.Universities.Add(university);

        var campuses = TestData.CreateSampleCampusList();
        _context.Campuses.AddRange(campuses);

        await _context.SaveChangesAsync();
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
        await _testDb.DisposeAsync();
    }

    [Fact]
    public async Task ValidateUniversityExistsAsync_ExistingCode_ReturnsValid()
    {
        // Act
        var (isValid, errorMessage, university) = await CampusValidator.ValidateUniversityExistsAsync(_context, "BKA");

        // Assert
        Assert.True(isValid);
        Assert.Null(errorMessage);
        Assert.NotNull(university);
        Assert.Equal("BKA", university.Code);
    }

    [Fact]
    public async Task ValidateUniversityExistsAsync_NonExistingCode_ReturnsInvalid()
    {
        // Act
        var (isValid, errorMessage, university) = await CampusValidator.ValidateUniversityExistsAsync(_context, "XXX");

        // Assert
        Assert.False(isValid);
        Assert.NotNull(errorMessage);
        Assert.Null(university);
        Assert.Contains("not found", errorMessage);
    }

    [Fact]
    public async Task ValidateUniqueNameAsync_NewName_ReturnsValid()
    {
        // Act
        var (isValid, errorMessage) = await CampusValidator.ValidateUniqueNameAsync(_context, "Cơ sở Mới", 1);

        // Assert
        Assert.True(isValid);
        Assert.Null(errorMessage);
    }

    [Fact]
    public async Task ValidateUniqueNameAsync_DuplicateName_ReturnsInvalid()
    {
        // Act
        var (isValid, errorMessage) = await CampusValidator.ValidateUniqueNameAsync(_context, "Cơ sở Dĩ An", 1);

        // Assert
        Assert.False(isValid);
        Assert.NotNull(errorMessage);
        Assert.Contains("already exists", errorMessage);
    }

    [Fact]
    public async Task ValidateUniqueNameAsync_SameNameButExcluded_ReturnsValid()
    {
        // Act - Excluding campus ID 1 which has "Cơ sở Dĩ An"
        var (isValid, errorMessage) = await CampusValidator.ValidateUniqueNameAsync(_context, "Cơ sở Dĩ An", 1, excludeId: 1);

        // Assert
        Assert.True(isValid);
        Assert.Null(errorMessage);
    }

    [Fact]
    public async Task ValidateUniqueLocationAsync_NewLocation_ReturnsValid()
    {
        // Act
        var (isValid, errorMessage) = await CampusValidator.ValidateUniqueLocationAsync(
            _context, "New Address", "New District", "New City", 1);

        // Assert
        Assert.True(isValid);
        Assert.Null(errorMessage);
    }

    [Fact]
    public async Task ValidateUniqueLocationAsync_DuplicateLocation_ReturnsInvalid()
    {
        // Act
        var (isValid, errorMessage) = await CampusValidator.ValidateUniqueLocationAsync(
            _context, "273 An Dương Vương", "Dĩ An", "Bình Dương", 1);

        // Assert
        Assert.False(isValid);
        Assert.NotNull(errorMessage);
        Assert.Contains("already exists", errorMessage);
    }

    [Fact]
    public async Task ValidateUniqueLocationAsync_SameLocationButExcluded_ReturnsValid()
    {
        // Act - Excluding campus ID 1
        var (isValid, errorMessage) = await CampusValidator.ValidateUniqueLocationAsync(
            _context, "273 An Dương Vương", "Dĩ An", "Bình Dương", 1, excludeId: 1);

        // Assert
        Assert.True(isValid);
        Assert.Null(errorMessage);
    }
}

