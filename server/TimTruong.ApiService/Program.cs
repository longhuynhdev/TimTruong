using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;
using TimTruong.ApiService.DataAccess;
using TimTruong.ApiService.Endpoints;
using TimTruong.ApiService.Services;

var builder = WebApplication.CreateBuilder(args);

var enableOpenApi = builder.Configuration.GetValue<bool>("Features:EnableOpenApi");
var enableAutoMigrations = builder.Configuration.GetValue<bool>("Features:EnableAutoMigrations");

builder.AddServiceDefaults(); // OpenTelemetry + health checks

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    if (allowedOrigins.Length > 0)
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
}));

// "timtruongdb" do Aspire inject khi chạy qua AppHost; standalone/prod dùng "DefaultConnection"
builder.AddNpgsqlDbContext<ApplicationDbContext>("timtruongdb", settings =>
{
    settings.ConnectionString ??= builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("No connection string found ('timtruongdb' or 'DefaultConnection').");
});

builder.Services.AddProblemDetails();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<IUniversityService, UniversityService>();
builder.Services.AddScoped<ICampusService, CampusService>();

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

if (enableOpenApi)
    builder.Services.AddOpenApi();

var app = builder.Build();

// Prod sits behind a TLS-terminating proxy (Cloudflare Tunnel + Caddy);
// X-Forwarded-* is honored via ASPNETCORE_FORWARDEDHEADERS_ENABLED in docker-compose.
app.UseExceptionHandler();
app.UseCors();

if (enableOpenApi)
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => options.Title = "TimTruong API Documentation");
}

app.MapRecommendationEndpoints();
app.MapUniversityEndpoints();
app.MapCampusEndpoints();
app.MapDefaultEndpoints(); // health checks

if (enableAutoMigrations)
    await ApplyMigrationsAsync(app);

app.Run();

static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    var pending = (await db.Database.GetPendingMigrationsAsync()).ToList();
    if (pending.Count == 0)
    {
        logger.LogInformation("Database is up-to-date, no pending migrations");
        return;
    }

    logger.LogInformation("Applying {Count} pending migrations: {Migrations}",
        pending.Count, string.Join(", ", pending));
    await db.Database.MigrateAsync();
    logger.LogInformation("Database migrations applied successfully");
}
