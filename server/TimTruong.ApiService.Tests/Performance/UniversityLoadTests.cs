using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Services;
using Core.Models;
using Xunit;
using Xunit.Abstractions;

namespace TimTruong.ApiService.Tests.Performance;

public class UniversityLoadTests : IDisposable
{
    private readonly DbContextOptions<ApplicationDbContext> _options;
    private readonly ApplicationDbContext _context;
    private readonly UniversityService _service;
    private readonly ITestOutputHelper _output;

    public UniversityLoadTests(ITestOutputHelper output)
    {
        _output = output;

        // Store options for creating multiple contexts
        _options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(_options);

        // Seed 10,000 universities
        for (int i = 1; i <= 10000; i++)
        {
            _context.Universities.Add(new University
            {
                Id = i,
                Name = $"University {i}",
                Code = $"U{i:0000}",
                Type = i % 2 == 0 ? UniType.Public : UniType.Private
            });
        }
        _context.SaveChanges();

        var logger = Mock.Of<ILogger<UniversityService>>();
        _service = new UniversityService(_context, logger);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task GetAllUniversities_10000Records_CompletesInReasonableTime()
    {
        // Arrange
        var sw = Stopwatch.StartNew();

        // Act
        var result = await _service.GetAllUniversitiesAsync();
        sw.Stop();

        // Assert
        Assert.Equal(10000, result.Count);
        
        _output.WriteLine($"Fetched {result.Count} universities in {sw.ElapsedMilliseconds}ms");
        
        // Should complete in under 1 second
        Assert.True(sw.ElapsedMilliseconds < 1000, 
            $"Query took {sw.ElapsedMilliseconds}ms, expected < 1000ms");
    }

    [Fact]
    public async Task ConcurrentRequests_100Parallel_HandlesLoad()
    {
        // Arrange
        var tasks = new List<Task>();
        var sw = Stopwatch.StartNew();

        // Act - 100 concurrent requests, each with its own DbContext
        for (int i = 0; i < 100; i++)
        {
            tasks.Add(Task.Run(async () =>
            {
                // Create a new context for each concurrent request
                using var context = new ApplicationDbContext(_options);
                var logger = Mock.Of<ILogger<UniversityService>>();
                var service = new UniversityService(context, logger);
                await service.GetAllUniversitiesAsync();
            }));
        }

        await Task.WhenAll(tasks);
        sw.Stop();

        // Assert
        _output.WriteLine($"100 concurrent requests completed in {sw.ElapsedMilliseconds}ms");
        _output.WriteLine($"Average: {sw.ElapsedMilliseconds / 100}ms per request");
        
        // All should complete in under 10 seconds
        Assert.True(sw.ElapsedMilliseconds < 10000);
    }

    [Fact]
    public async Task SearchQuery_LargeDataset_PerformsWell()
    {
        // Arrange
        var sw = Stopwatch.StartNew();

        // Act
        var result = await _service.GetAllUniversitiesAsync(search: "University 5000");
        sw.Stop();

        // Assert
        Assert.Single(result);
        _output.WriteLine($"Search on 10,000 records took {sw.ElapsedMilliseconds}ms");
        
        // Should complete in under 100ms
        Assert.True(sw.ElapsedMilliseconds < 100);
    }
}