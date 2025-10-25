using TimTruong.ApiService.Tests.Infrastructure;
using TimTruong.ApiService.Validators;
using Xunit;

namespace TimTruong.ApiService.Tests.Integration;

public class UniversityValidatorPostgresTests : IAsyncLifetime
{
    private readonly PostgresTestDatabase _database;

    public UniversityValidatorPostgresTests()
    {
        _database = new PostgresTestDatabase();
    }

    public async Task InitializeAsync()
    {
        await _database.InitializeAsync();
        _database.SeedTestData();
    }

    public async Task DisposeAsync()
    {
        await _database.DisposeAsync();
    }

    [Fact]
    public async Task ValidateUniqueCode_ExistingCode_ReturnsInvalid()
    {
        // Act
        var (isValid, error) = await UniversityValidator.ValidateUniqueCodeAsync(
            _database.Context, 
            "BKA"
        );

        // Assert
        Assert.False(isValid);
        Assert.Contains("already exists", error);
    }

    [Fact]
    public async Task ValidateUniqueCode_NewCode_ReturnsValid()
    {
        // Act
        var (isValid, error) = await UniversityValidator.ValidateUniqueCodeAsync(
            _database.Context, 
            "NEW"
        );

        // Assert
        Assert.True(isValid);
        Assert.Null(error);
    }

    [Fact]
    public async Task ValidateUniqueName_ExistingName_ReturnsInvalid()
    {
        // Act
        var (isValid, error) = await UniversityValidator.ValidateUniqueNameAsync(
            _database.Context, 
            "Trường Đại học Bách Khoa TP.HCM"
        );

        // Assert
        Assert.False(isValid);
        Assert.Contains("already exists", error);
    }
}
