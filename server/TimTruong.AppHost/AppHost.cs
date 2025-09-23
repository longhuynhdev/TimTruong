var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.TimTruong_ApiService>("apiservice")
    .WithHttpHealthCheck("/health");

builder.Build().Run();
