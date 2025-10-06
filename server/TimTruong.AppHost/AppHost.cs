using Microsoft.Extensions.Hosting;

var builder = DistributedApplication.CreateBuilder(args);
IResourceBuilder<IResourceWithConnectionString> database;

if (builder.Environment.IsDevelopment())
{
    var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .WithDataVolume();
    database = postgres.AddDatabase("timtruongdb");
}
else
{
    database = builder.AddConnectionString("timtruongdb");
}

var apiService = builder.AddProject<Projects.TimTruong_ApiService>("apiservice")
    .WithReference(database)
    .WithHttpHealthCheck("/health");

builder.Build().Run();
