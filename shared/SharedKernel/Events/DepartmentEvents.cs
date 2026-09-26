using System;
using System.Collections.Generic;

namespace SharedKernel.Events
{
    public static class DepartmentRabbitMQConstants
    {
        public const string DepartmentExchange = "department.events.exchange";
        public const string AssetDepartmentQueue = "asset.service.department.sync";
        public const string KpiDepartmentQueue = "kpi.service.department.sync";

        public const string DepartmentCreatedRoutingKey = "department.created";
        public const string DepartmentUpdatedRoutingKey = "department.updated";
        public const string DepartmentDeletedRoutingKey = "department.deleted";
        public const string DepartmentAllRoutingKey = "department.#";
    }

    public class DepartmentCreatedEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public string EventType { get; set; } = "DepartmentCreatedEvent";
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ShortName { get; set; }
        public Guid? ParentId { get; set; }
        public int Level { get; set; } = 1;
        public string? Loai { get; set; }
        public long? Priority { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public string? Address { get; set; }
        public string? Hotline { get; set; }
        public string? Email { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string SourceService { get; set; } = "identity-service";
    }

    public class DepartmentUpdatedEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public string EventType { get; set; } = "DepartmentUpdatedEvent";
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ShortName { get; set; }
        public Guid? ParentId { get; set; }
        public int Level { get; set; } = 1;
        public string? Loai { get; set; }
        public long? Priority { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public string? Address { get; set; }
        public string? Hotline { get; set; }
        public string? Email { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string SourceService { get; set; } = "identity-service";
    }

    public class DepartmentDeletedEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public string EventType { get; set; } = "DepartmentDeletedEvent";
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime DeletedAt { get; set; } = DateTime.UtcNow;
        public string SourceService { get; set; } = "identity-service";
    }
}
