using Microsoft.Extensions.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

// Configure database resource based on environment
IResourceBuilder<IResourceWithConnectionString> database;

if (builder.Environment.IsDevelopment())
{
    // Development: Full PostgreSQL with pgAdmin and persistent volume
    var postgres = builder.AddPostgres("postgres")
        .WithPgAdmin()
        .WithDataVolume();

    database = postgres.AddDatabase("timtruongdb");
}
else
{
    // Production: Use external connection string from environment
    database = builder.AddConnectionString("timtruongdb");
}

// Configure API service
var apiService = builder.AddProject<Projects.TimTruong_ApiService>("apiservice")
    .WithReference(database);

// Add health check only in Development (where it's available)
if (builder.Environment.IsDevelopment())
{
    apiService.WithHttpHealthCheck("/health");
}

builder.Build().Run();
