using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.Tests.Infrastructure;
using TimTruong.ApiService.Tests.Helpers;
using Core.Models;

namespace TimTruong.ApiService.Tests.E2E;

public class CampusEndpointsE2ETests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public CampusEndpointsE2ETests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        ResetDatabase();
    }

    private void ResetDatabase()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        db.Campuses.RemoveRange(db.Campuses);
        db.Universities.RemoveRange(db.Universities);
        db.SaveChanges();

        // Seed universities first
        db.Universities.AddRange(
            new University { Id = 1, Name = "Trường Đại học Bách Khoa TP.HCM", Code = "BKA", Type = UniType.Public },
            new University { Id = 2, Name = "Trường Đại học Quốc tế Sài Gòn", Code = "QST", Type = UniType.Private }
        );

        // Seed campuses
        db.Campuses.AddRange(TestData.CreateSampleCampusList());
        db.SaveChanges();
    }

    [Fact]
    public async Task GetAllCampuses_ReturnsSuccessAndCorrectContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/campuses");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal("application/json; charset=utf-8", response.Content.Headers.ContentType?.ToString());
    }

    [Fact]
    public async Task GetAllCampuses_ReturnsListOfCampuses()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/campuses");
        var campuses = await response.Content.ReadFromJsonAsync<List<CampusDto>>();

        // Assert
        Assert.NotNull(campuses);
        Assert.Equal(2, campuses.Count);
        Assert.All(campuses, campus =>
        {
            Assert.NotNull(campus.UniversityName);
            Assert.NotNull(campus.UniversityCode);
        });
    }

    [Fact]
    public async Task GetAllCampuses_WithSearchFilter_ReturnsFilteredResults()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/campuses?search=Dĩ An");
        var campuses = await response.Content.ReadFromJsonAsync<List<CampusDto>>();

        // Assert
        Assert.NotNull(campuses);
        Assert.Single(campuses);
        Assert.Contains("Dĩ An", campuses[0].Name);
    }

    [Fact]
    public async Task GetAllCampuses_WithCityFilter_ReturnsFilteredResults()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/campuses?city=TP HCM");
        var campuses = await response.Content.ReadFromJsonAsync<List<CampusDto>>();

        // Assert
        Assert.NotNull(campuses);
        Assert.Single(campuses);
        Assert.Equal("TP HCM", campuses[0].City);
    }

    [Fact]
    public async Task GetCampusById_ExistingId_ReturnsOkAndCampus()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/campuses/1");
        var campus = await response.Content.ReadFromJsonAsync<CampusDto>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(campus);
        Assert.Equal(1, campus.Id);
        Assert.Equal("Cơ sở Dĩ An", campus.Name);
    }

    [Fact]
    public async Task GetCampusById_NonExistingId_Returns404()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/campuses/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task CreateCampus_ValidRequest_Returns201Created()
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
        var response = await _client.PostAsJsonAsync("/api/v1/campuses", request);
        var createdCampus = await response.Content.ReadFromJsonAsync<CampusDto>();

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(createdCampus);
        Assert.Equal("Cơ sở Hóc Môn", createdCampus.Name);
        Assert.Equal("BKA", createdCampus.UniversityCode);
        Assert.Equal(1, createdCampus.UniversityId);
        Assert.True(response.Headers.Location?.ToString().Contains($"/api/v1/campuses/{createdCampus.Id}"));
    }

    [Fact]
    public async Task CreateCampus_InvalidName_Returns400()
    {
        // Arrange
        var request = new CreateCampusRequest
        {
            Name = "AB", // Too short
            Address = "Test Address",
            City = "Test City",
            District = null,
            UniversityCode = "BKA"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/campuses", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateCampus_NonExistentUniversity_Returns400()
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
        var response = await _client.PostAsJsonAsync("/api/v1/campuses", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateCampus_DuplicateName_Returns400()
    {
        // Arrange
        var request = new CreateCampusRequest
        {
            Name = "Cơ sở Dĩ An", // Already exists
            Address = "Different Address",
            City = "Different City",
            District = null,
            UniversityCode = "BKA"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/campuses", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateCampus_ExistingCampus_Returns200()
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
        var response = await _client.PutAsJsonAsync("/api/v1/campuses/1", request);
        var updatedCampus = await response.Content.ReadFromJsonAsync<CampusDto>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(updatedCampus);
        Assert.Equal("Cơ sở Dĩ An Updated", updatedCampus.Name);
    }

    [Fact]
    public async Task UpdateCampus_NonExistingCampus_Returns404()
    {
        // Arrange
        var request = TestData.CreateSampleUpdateCampusRequest();

        // Act
        var response = await _client.PutAsJsonAsync("/api/v1/campuses/999", request);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteCampus_ExistingCampus_Returns204()
    {
        // Act
        var response = await _client.DeleteAsync("/api/v1/campuses/1");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify deletion
        var getResponse = await _client.GetAsync("/api/v1/campuses/1");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteCampus_NonExistingCampus_Returns404()
    {
        // Act
        var response = await _client.DeleteAsync("/api/v1/campuses/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task FullCrudFlow_CreateReadUpdateDelete_WorksCorrectly()
    {
        // 1. Create
        var createRequest = new CreateCampusRequest
        {
            Name = "Cơ sở Test",
            Address = "Test Address",
            City = "Test City",
            District = "Test District",
            UniversityCode = "BKA"
        };
        var createResponse = await _client.PostAsJsonAsync("/api/v1/campuses", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<CampusDto>();
        Assert.NotNull(created);
        var campusId = created.Id;

        // 2. Read
        var readResponse = await _client.GetAsync($"/api/v1/campuses/{campusId}");
        var read = await readResponse.Content.ReadFromJsonAsync<CampusDto>();
        Assert.NotNull(read);
        Assert.Equal("Cơ sở Test", read.Name);

        // 3. Update
        var updateRequest = new UpdateCampusRequest
        {
            Name = "Cơ sở Test Updated",
            Address = "Test Address",
            City = "Test City",
            District = "Test District",
            UniversityCode = "BKA"
        };
        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/campuses/{campusId}", updateRequest);
        var updated = await updateResponse.Content.ReadFromJsonAsync<CampusDto>();
        Assert.NotNull(updated);
        Assert.Equal("Cơ sở Test Updated", updated!.Name);

        // 4. Delete
        var deleteResponse = await _client.DeleteAsync($"/api/v1/campuses/{campusId}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // 5. Verify deletion
        var verifyResponse = await _client.GetAsync($"/api/v1/campuses/{campusId}");
        Assert.Equal(HttpStatusCode.NotFound, verifyResponse.StatusCode);
    }
}

