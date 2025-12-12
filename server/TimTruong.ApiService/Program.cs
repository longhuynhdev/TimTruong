using Scalar.AspNetCore;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.Endpoints;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

var builder = WebApplication.CreateBuilder(args);

// Configure CORS based on environment
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins, policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Development: Allow localhost
            policy.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            // Production: Read from configuration
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? Array.Empty<string>();

            if (allowedOrigins.Length > 0)
            {
                policy.WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
        }
    });
});

// Add service defaults & Aspire client integrations only in Development
if (builder.Environment.IsDevelopment())
{
    builder.AddServiceDefaults();
}

// Configure Database Context
if (builder.Environment.EnvironmentName != "Testing")
{
    if (builder.Environment.IsDevelopment())
    {
        // Development: Use Aspire service discovery
        builder.AddNpgsqlDbContext<ApplicationDbContext>("timtruongdb");
    }
    else
    {
        // Production: Use standard connection string from environment variables
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));
    }
}
// Note: In Testing environment, the TestWebApplicationFactory will register the DbContext

// Add services to the container.
builder.Services.AddProblemDetails();

// Register application services
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IUniversityService, UniversityService>();
builder.Services.AddScoped<ICampusService, CampusService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure JSON serialization to use string enums instead of numeric values
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

app.MapOpenApi();
app.MapScalarApiReference(options => options.Title = "TimTruong API Documentation");


// Map API endpoints
app.MapRecommendationEndpoints();
app.MapUniversityEndpoints();
app.MapCampusEndpoints();

// Map default endpoints (health checks) only in Development
if (app.Environment.IsDevelopment())
{
    app.MapDefaultEndpoints();
}

app.UseCors(MyAllowSpecificOrigins);

// Apply migrations automatically on startup
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            logger.LogInformation("Applying {Count} pending migrations: {Migrations}",
                pendingMigrations.Count(),
                string.Join(", ", pendingMigrations));

            await dbContext.Database.MigrateAsync();
            logger.LogInformation("Database migrations applied successfully");
        }
        else
        {
            logger.LogInformation("Database is up-to-date, no pending migrations");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to apply database migrations");
        throw;
    }
}

app.Run();

// make Program.cs testable for E2E Testing
public partial class Program { }