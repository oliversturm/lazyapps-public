using System.Text.Json;
using System.Text.Json.Serialization;

namespace readmodel_dotnet;

public abstract class EventBase {
  public string? Type { get; set; }
  public long? Timestamp { get; set; }
  public string? AggregateName { get; set; }
  public string? AggregateId { get; set; }
  public PayloadBase? Payload { get; set; }
}

public abstract class PayloadBase {
}

public class CustomerCreatedEvent : EventBase {
  public new CustomerCreatedPayload? Payload { get; set; }
}

public class CustomerCreatedPayload : PayloadBase {
  public string? Location { get; set; }
  public string? Name { get; set; }
}

public class CustomerUpdatedEvent : EventBase {
  public new CustomerUpdatedPayload? Payload { get; set; }
}

public class CustomerUpdatedPayload : PayloadBase {
  public string? Id { get; set; }
  public string? Name { get; set; }
  public string? Location { get; set; }
}

public class OrderCreatedEvent : EventBase {
  public new OrderCreatedPayload? Payload { get; set; }
}

public class OrderCreatedPayload : PayloadBase {
  public string? Value { get; set; }
  public string? Text { get; set; }
  public string? CustomerId { get; set; }
}

public class OrderUsdRateAndValueAddedEvent : EventBase {
  public new OrderUsdRateAndValueAddedPayload? Payload { get; set; }
}

public class OrderUsdRateAndValueAddedPayload : PayloadBase {
  public string? Time { get; set; }
  public string? UsdRate { get; set; }
  public double? UsdValue { get; set; }
}

public class EventConverter : JsonConverter<EventBase> {
  public override EventBase? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions? options) {
    using (JsonDocument jsonDoc = JsonDocument.ParseValue(ref reader)) {
      JsonElement root = jsonDoc.RootElement;
      string? type = root.GetProperty("type").GetString();

      switch (type) {
        case "CUSTOMER_CREATED":
          return JsonSerializer.Deserialize<CustomerCreatedEvent>(root.GetRawText(), options);
        case "CUSTOMER_UPDATED":
          return JsonSerializer.Deserialize<CustomerUpdatedEvent>(root.GetRawText(), options);
        case "ORDER_CREATED":
          return JsonSerializer.Deserialize<OrderCreatedEvent>(root.GetRawText(), options);
        case "ORDER_USD_RATE_AND_VALUE_ADDED":
          return JsonSerializer.Deserialize<OrderUsdRateAndValueAddedEvent>(root.GetRawText(), options);
        default:
          throw new JsonException($"Event type {type} is not supported.");
      }
    }
  }

  public override void Write(Utf8JsonWriter writer, EventBase value, JsonSerializerOptions options) {
    JsonSerializer.Serialize(writer, value, value.GetType(), options);
  }
}
