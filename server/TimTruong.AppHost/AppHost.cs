var builder = DistributedApplication.CreateBuilder(args);

// Persistent: container sống tiếp sau khi tắt AppHost, để ApiService chạy standalone được
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithHostPort(5432)
    // Aspire's default proxied endpoint only forwards :5432 while AppHost is running.
    // Standalone ApiService needs the container's real port reachable without AppHost, so bind it directly.
    .WithEndpoint("tcp", e => e.IsProxied = false)
    .WithLifetime(ContainerLifetime.Persistent);

var database = postgres.AddDatabase("timtruongdb");

var apiService =builder.AddProject<Projects.TimTruong_ApiService>("apiservice")
    .WithReference(database)
    .WaitFor(postgres)
    .WithHttpHealthCheck("/health");

builder.Build().Run();
