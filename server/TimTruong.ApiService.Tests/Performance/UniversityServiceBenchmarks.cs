using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Services;
using Core.Models;

namespace TimTruong.ApiService.Tests.Performance;

[MemoryDiagnoser]
[SimpleJob(warmupCount: 3, iterationCount: 10)]
public class UniversityServiceBenchmarks
{
    private ApplicationDbContext _context = null!;
    private UniversityService _service = null!;

    [GlobalSetup]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);

        // Seed 1000 universities for realistic testing
        for (int i = 1; i <= 1000; i++)
        {
            _context.Universities.Add(new University
            {
                Id = i,
                Name = $"University {i}",
                Code = $"U{i:000}",
                Type = i % 2 == 0 ? UniType.Public : UniType.Private
            });
        }
        _context.SaveChanges();

        var logger = Mock.Of<ILogger<UniversityService>>();
        _service = new UniversityService(_context, logger);
    }

    [Benchmark]
    public async Task GetAllUniversities_1000Records()
    {
        await _service.GetAllUniversitiesAsync();
    }

    [Benchmark]
    public async Task GetAllUniversities_WithSearch()
    {
        await _service.GetAllUniversitiesAsync(search: "University 500");
    }

    [Benchmark]
    public async Task GetAllUniversities_WithTypeFilter()
    {
        await _service.GetAllUniversitiesAsync(type: "Public");
    }

    [Benchmark]
    public async Task GetUniversityById_MultipleQueries()
    {
        for (int i = 1; i <= 10; i++)
        {
            await _service.GetUniversityByIdAsync(i);
        }
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        _context.Dispose();
    }
}

// // Runner class
// public class BenchmarkRunner
// {
//     public static void Main(string[] args)
//     {
//         BenchmarkDotNet.Running.BenchmarkRunner.Run<UniversityServiceBenchmarks>();
//     }
// }
