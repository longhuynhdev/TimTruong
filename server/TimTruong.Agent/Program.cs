using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;

var builder = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddUserSecrets<Program>();
    
IConfiguration config = builder.Build();

var apiKey = config.GetValue<string>("ApiKey");
var model = "gemini-3.1-flash-lite";

IChatClient client = new Google.GenAI.Client(apiKey: apiKey).AsIChatClient(model);

ChatClientAgent agent =
    client.AsAIAgent(
        instructions:"You are a friendly assistant. Keep your answers brief. And your answer needs to be in Vietnamese",
        name: "HelloAgent",
        tools: []
        );

AgentSession session = await agent.CreateSessionAsync();

while (true)
{
    Console.Write("> ");
    var userInput = Console.ReadLine() ?? string.Empty;
    AgentResponse response = await agent.RunAsync(userInput, session);
    Console.WriteLine(response);
    Console.WriteLine("=============================================");
    Console.WriteLine($"Token usage: Input Token: {response.Usage!.InputTokenCount}, Output Token: {response.Usage!.OutputTokenCount}");
}


