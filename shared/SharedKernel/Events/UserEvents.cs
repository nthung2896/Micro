using System;
using System.Collections.Generic;

namespace SharedKernel.Events
{
    public static class RabbitMQConstants
    {
        public const string UserExchange = "user.events.exchange";
        public const string AssetUserQueue = "asset.service.user.sync";
        public const string KpiUserQueue = "kpi.service.user.sync";
        
        public const string UserCreatedRoutingKey = "user.created";
        public const string UserUpdatedRoutingKey = "user.updated";
        public const string UserRolesChangedRoutingKey = "user.roles.changed";
        public const string UserDeletedRoutingKey = "user.deleted";
        public const string UserAllRoutingKey = "user.#";
    }

    public class UserCreatedEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public string EventType { get; set; } = "UserCreatedEvent";
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public List<string> Roles { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string SourceService { get; set; } = "identity-service";
    }

    public class UserUpdatedEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public string EventType { get; set; } = "UserUpdatedEvent";
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public bool? IsActive { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string SourceService { get; set; } = "identity-service";
    }

    public class UserRolesChangedEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public string EventType { get; set; } = "UserRolesChangedEvent";
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new();
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string SourceService { get; set; } = "identity-service";
    }

    public class EventLogItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string EventType { get; set; } = string.Empty;
        public string RoutingKey { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty;
        public string Status { get; set; } = "Published";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string Source { get; set; } = "identity-service";
        public List<string> Consumers { get; set; } = new() { "asset-service", "kpi-service" };
    }
}
