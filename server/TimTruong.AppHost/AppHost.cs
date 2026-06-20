var builder = DistributedApplication.CreateBuilder(args);

// Persistent: container sống tiếp sau khi tắt AppHost, để ApiService chạy standalone được
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithHostPort(5432)
    .WithLifetime(ContainerLifetime.Persistent);

var database = postgres.AddDatabase("timtruongdb");

var apiService =builder.AddProject<Projects.TimTruong_ApiService>("apiservice")
    .WithReference(database)
    .WaitFor(postgres)
    .WithHttpHealthCheck("/health");

builder.Build().Run();
