using Scalar.AspNetCore;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Services;
using TimTruong.ApiService.Endpoints;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Read feature flags from configuration
var enableOpenApi = builder.Configuration.GetValue<bool>("Features:EnableOpenApi");
var enableAutoMigrations = builder.Configuration.GetValue<bool>("Features:EnableAutoMigrations");

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});


// Configure Database
if (builder.Environment.IsDevelopment())
{
    builder.AddServiceDefaults();
    builder.AddNpgsqlDbContext<ApplicationDbContext>("timtruongdb");
}
else
{
    // Production: Use connection string from environment
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}

// Add core services
builder.Services.AddProblemDetails();

// Register application services
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IUniversityService, UniversityService>();
builder.Services.AddScoped<ICampusService, CampusService>();

// Configure OpenAPI
if (enableOpenApi)
{
    builder.Services.AddOpenApi();
}

// Configure JSON serialization
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

// Configure middleware pipeline
app.UseExceptionHandler();
app.UseCors();

// Configure OpenAPI documentation
if (enableOpenApi)
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => options.Title = "TimTruong API Documentation");
}

// Map API endpoints
app.MapRecommendationEndpoints();
app.MapUniversityEndpoints();
app.MapCampusEndpoints();

// Map Aspire health checks (Development only)
if (app.Environment.IsDevelopment())
{
    app.MapDefaultEndpoints();
}

// Apply database migrations automatically
if (enableAutoMigrations)
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
