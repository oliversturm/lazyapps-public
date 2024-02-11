using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using readmodel_dotnet;
using System.Text;
using System.Text.Json;

IConnection Connect(ConnectionFactory factory) {
  IConnection connection;
  int tries = 0;
  const int maxTries = 10;
  while (tries < maxTries) {
    try {
      connection = factory.CreateConnection();
      return connection;
    }
    catch {
      Console.WriteLine($"Attempt {tries + 1} failed connecting to RabbitMQ.");
      tries++;
      Thread.Sleep(1000);
    }
  }

  throw new Exception($"Couldn't connect to RabbitMQ in {maxTries} attempts.");
}

double totalUsdValue = 0;
string saveFileContent = File.ReadAllText("/totalUsdValue.txt");
if (!string.IsNullOrEmpty(saveFileContent)) {
  if (double.TryParse(saveFileContent, out double savedValue)) {
    totalUsdValue = savedValue;
  }
}

ConnectionFactory factory = new();
factory.Uri = new Uri(Environment.GetEnvironmentVariable("RABBIT_URL") ?? "amqp://localhost");

using (IConnection connection = Connect(factory)) {
  using (IModel? channel = connection.CreateModel()) {
    string exchange = "events";

    channel.ExchangeDeclare(exchange, ExchangeType.Topic);

    string? queueName = channel.QueueDeclare().QueueName;
    channel.QueueBind(queueName, exchange, "#");

    EventingBasicConsumer consumer = new(channel);
    consumer.Received += (model, ea) => {
      byte[] body = ea.Body.ToArray();
      string message = Encoding.UTF8.GetString(body);
      string? routingKey = ea.RoutingKey;
      Console.WriteLine($"Received for key '{routingKey}':'{message}'");

      EventBase? ev = JsonSerializer.Deserialize<EventBase>(message,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true, Converters = { new EventConverter() } });

      if (ev is OrderUsdRateAndValueAddedEvent oev && oev.Payload != null) {
        Console.WriteLine($"USD rate for order {oev.AggregateId} is {oev.Payload.UsdRate}");
        totalUsdValue += oev.Payload.UsdValue.GetValueOrDefault();
        File.WriteAllText("/totalUsdValue.txt", totalUsdValue.ToString());
      }
    };
    channel.BasicConsume(queueName, true, consumer);

    WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
    WebApplication app = builder.Build();
    app.MapGet("/", () => Results.Json(new { totalUsdValue }));

    app.Run();
  }
}