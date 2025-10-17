using Scalar.AspNetCore;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.Endpoints;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

// //
// builder.AddNpgsqlDbContext<ApplicationDbContext>("timtruongdb");

// Conditionally register DbContext - skip Aspire registration in test environment
if (builder.Environment.EnvironmentName != "Testing")
{
    builder.AddNpgsqlDbContext<ApplicationDbContext>("timtruongdb");
}
// Note: In Testing environment, the TestWebApplicationFactory will register the DbContext

// Add services to the container.
builder.Services.AddProblemDetails();

// Register application services
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IUniversityService, UniversityService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => options.Title = "TimTruong API Documentation");
}

// Map API endpoints
app.MapRecommendationEndpoints();
app.MapUniversityEndpoints();
app.MapDefaultEndpoints();

// // Apply migrations automatically on startup
// if (app.Environment.IsDevelopment())
// {
//     using var scope = app.Services.CreateScope();
//     var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//     var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

//     try
//     {
//         var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
//         if (pendingMigrations.Any())
//         {
//             logger.LogInformation("Applying {Count} pending migrations: {Migrations}",
//                 pendingMigrations.Count(),
//                 string.Join(", ", pendingMigrations));

//             await dbContext.Database.MigrateAsync();
//             logger.LogInformation("Database migrations applied successfully");
//         }
//         else
//         {
//             logger.LogInformation("Database is up-to-date, no pending migrations");
//         }
//     }
//     catch (Exception ex)
//     {
//         logger.LogError(ex, "Failed to apply database migrations");
//         throw;
//     }
// }

app.Run();

// make Program.cs testable for E2E Testing
public partial class Program { }