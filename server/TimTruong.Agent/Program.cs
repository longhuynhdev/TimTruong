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
ChatClientAgent agent = new ChatClientAgent(client);

AgentResponse response = await agent.RunAsync("What is the capital of VietNam?");

Console.WriteLine(response);