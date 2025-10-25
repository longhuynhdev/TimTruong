using System.Net;
using System.Net.Http.Json;
using TimTruong.ApiService.DTOs;
using TimTruong.ApiService.Tests.Infrastructure;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using TimTruong.ApiService.DataAccess;         
using Core.Models;                             
 
namespace TimTruong.ApiService.Tests.E2E;

/// <summary>
/// End-to-End tests - tests full HTTP request/response cycle
/// </summary>
public class UniversityEndpointsE2ETests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    // public UniversityEndpointsE2ETests(TestWebApplicationFactory factory)
    // {
    //     _client = factory.CreateClient();
    // }

    public UniversityEndpointsE2ETests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        
        // Reset database before each test
        ResetDatabase();
    }

    private void ResetDatabase()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Clear all universities
        db.Universities.RemoveRange(db.Universities);
        db.SaveChanges();
        
        // Re-seed
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

    // ========== GET ALL TESTS ==========

    [Fact]
    public async Task GetAllUniversities_ReturnsSuccessAndCorrectContentType()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/universities");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task GetAllUniversities_ReturnsListOfUniversities()
    {
        // Act
        var universities = await _client.GetFromJsonAsync<List<UniversityDto>>("/api/v1/universities");

        // Assert
        Assert.NotNull(universities);
        Assert.Equal(2, universities.Count);
        Assert.Contains(universities, u => u.Code == "BKA");
        Assert.Contains(universities, u => u.Code == "QST");
    }

    [Fact]
    public async Task GetAllUniversities_WithSearchQuery_ReturnsFilteredResults()
    {
        // Act
        var universities = await _client.GetFromJsonAsync<List<UniversityDto>>(
            "/api/v1/universities?search=bách"
        );

        // Assert
        Assert.NotNull(universities);
        Assert.Single(universities);
        Assert.Equal("BKA", universities[0].Code);
    }

    [Fact]
    public async Task GetAllUniversities_WithTypeFilter_ReturnsFilteredResults()
    {
        // Act
        var universities = await _client.GetFromJsonAsync<List<UniversityDto>>(
            "/api/v1/universities?type=Public"
        );

        // Assert
        Assert.NotNull(universities);
        Assert.Single(universities);
        Assert.Equal("Public", universities[0].Type);
    }

    // ========== GET BY ID TESTS ==========

    [Fact]
    public async Task GetUniversityById_ExistingId_ReturnsUniversity()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/universities/1");
        var university = await response.Content.ReadFromJsonAsync<UniversityDto>();

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.NotNull(university);
        Assert.Equal(1, university.Id);
        Assert.Equal("BKA", university.Code);
    }

    [Fact]
    public async Task GetUniversityById_NonExistingId_Returns404()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/universities/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetUniversityById_InvalidId_Returns404()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/universities/abc");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ========== GET SIMPLE LIST TESTS ==========

    [Fact]
    public async Task GetSimpleUniversities_ReturnsSimplifiedList()
    {
        // Act
        var universities = await _client.GetFromJsonAsync<List<UniversitySimpleDto>>(
            "/api/v1/universities/simple"
        );

        // Assert
        Assert.NotNull(universities);
        Assert.Equal(2, universities.Count);
        Assert.All(universities, u =>
        {
            Assert.True(u.Id > 0);
            Assert.NotNull(u.Name);
            Assert.NotNull(u.Code);
        });
    }

    // ========== CREATE TESTS ==========

    [Fact]
    public async Task CreateUniversity_ValidRequest_Returns201Created()
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
        var response = await _client.PostAsJsonAsync("/api/v1/universities", request);
        var created = await response.Content.ReadFromJsonAsync<UniversityDto>();

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(created);
        Assert.Equal("FPT", created.Code);
        Assert.True(created.Id > 0);

        // Verify Location header
        Assert.NotNull(response.Headers.Location);
        Assert.Contains($"/api/v1/universities/{created.Id}", response.Headers.Location.ToString());
    }

    [Fact]
    public async Task CreateUniversity_DuplicateCode_Returns400()
    {
        // Arrange
        var request = new CreateUniversityRequest
        {
            Name = "Another University",
            Code = "BKA", // Duplicate code
            Type = "Public"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/universities", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateUniversity_InvalidCode_Returns400()
    {
        // Arrange
        var request = new CreateUniversityRequest
        {
            Name = "Test University",
            Code = "INVALID", // More than 3 letters
            Type = "Public"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/v1/universities", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ========== UPDATE TESTS ==========

    [Fact]
    public async Task UpdateUniversity_ExistingId_Returns200OK()
    {
        // Arrange
        var request = new UpdateUniversityRequest
        {
            Name = "Trường Đại học Bách Khoa TP.HCM - Updated",
            Code = "BKA",
            Type = "Public",
            ShortName = "ĐHBK Updated",
            EnglishName = "HCMUT Updated"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/v1/universities/1", request);
        var updated = await response.Content.ReadFromJsonAsync<UniversityDto>();

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.NotNull(updated);
        Assert.Equal("Trường Đại học Bách Khoa TP.HCM - Updated", updated.Name);
    }

    [Fact]
    public async Task UpdateUniversity_NonExistingId_Returns404()
    {
        // Arrange
        var request = new UpdateUniversityRequest
        {
            Name = "Test",
            Code = "TST",
            Type = "Public"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/v1/universities/999", request);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ========== DELETE TESTS ==========

    [Fact]
    public async Task DeleteUniversity_ExistingId_Returns204NoContent()
    {
        // Act
        var response = await _client.DeleteAsync("/api/v1/universities/2");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify deletion
        var getResponse = await _client.GetAsync("/api/v1/universities/2");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteUniversity_NonExistingId_Returns404()
    {
        // Act
        var response = await _client.DeleteAsync("/api/v1/universities/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ========== INTEGRATION FLOW TEST ==========

    [Fact]
    public async Task FullCRUDFlow_CreateReadUpdateDelete_Works()
    {
        // CREATE
        var createRequest = new CreateUniversityRequest
        {
            Name = "Trường Đại học Tôn Đức Thắng",
            Code = "TDT",
            Type = "Public"
        };

        var createResponse = await _client.PostAsJsonAsync("/api/v1/universities", createRequest);
        var created = await createResponse.Content.ReadFromJsonAsync<UniversityDto>();
        Assert.NotNull(created);
        var id = created.Id;

        // READ
        var getResponse = await _client.GetAsync($"/api/v1/universities/{id}");
        var fetched = await getResponse.Content.ReadFromJsonAsync<UniversityDto>();
        Assert.NotNull(fetched);
        Assert.Equal("TDT", fetched.Code);

        // UPDATE
        var updateRequest = new UpdateUniversityRequest
        {
            Name = "Trường Đại học Tôn Đức Thắng - Updated",
            Code = "TDT",
            Type = "Public"
        };
        var updateResponse = await _client.PutAsJsonAsync($"/api/v1/universities/{id}", updateRequest);
        var updated = await updateResponse.Content.ReadFromJsonAsync<UniversityDto>();
        Assert.NotNull(updated);
        Assert.Contains("Updated", updated.Name);

        // DELETE
        var deleteResponse = await _client.DeleteAsync($"/api/v1/universities/{id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // VERIFY DELETED
        var verifyResponse = await _client.GetAsync($"/api/v1/universities/{id}");
        Assert.Equal(HttpStatusCode.NotFound, verifyResponse.StatusCode);
    }
}
