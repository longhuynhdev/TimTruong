var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .WithDataVolume();

var timtruongDb = postgres.AddDatabase("timtruongdb");

var apiService = builder.AddProject<Projects.TimTruong_ApiService>("apiservice")
    .WithReference(timtruongDb)
    .WithHttpHealthCheck("/health");

builder.Build().Run();
