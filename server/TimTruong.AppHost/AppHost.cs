using Microsoft.Extensions.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

// Configure database resource based on environment
IResourceBuilder<IResourceWithConnectionString> database;
IResourceBuilder<PostgresServerResource>? postgres = null;

if (builder.Environment.IsDevelopment())
{
    // Development: Full PostgreSQL with persistent volume
    postgres = builder.AddPostgres("postgres")
        .WithDataVolume()
        .WithHostPort(5432);

    database = postgres.AddDatabase("timtruongdb");
}
else
{
    // Production: Use external connection string from environment
    database = builder.AddConnectionString("timtruongdb");
}

// Configure API service — wait for postgres to be healthy before starting
var apiService = builder.AddProject<Projects.TimTruong_ApiService>("apiservice")
    .WithReference(database);

if (postgres != null)
{
    apiService.WaitFor(postgres);
}

// Add health check only in Development (where it's available)
if (builder.Environment.IsDevelopment())
{
    apiService.WithHttpHealthCheck("/health");
}

builder.Build().Run();
