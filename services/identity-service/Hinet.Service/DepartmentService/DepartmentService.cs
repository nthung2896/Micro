using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;
using Hinet.Repository;
using Hinet.Service.Common;
using Hinet.Service.RabbitMQ;
using SharedKernel.Events;

namespace Hinet.Service.DepartmentService
{
    public class DepartmentDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ShortName { get; set; }
        public Guid? ParentId { get; set; }
        public string? ParentName { get; set; }
        public int Level { get; set; }
        public long Priority { get; set; }
        public string Loai { get; set; } = "PHONG_BAN";
        public bool IsActive { get; set; }
        public string? Address { get; set; }
        public string? Hotline { get; set; }
        public string? Email { get; set; }
        public string CreatedDate { get; set; } = string.Empty;
    }

    public class DepartmentCreateRequest
    {
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
    }

    public class DepartmentUpdateRequest
    {
        public string? Name { get; set; }
        public string? ShortName { get; set; }
        public Guid? ParentId { get; set; }
        public int? Level { get; set; }
        public string? Loai { get; set; }
        public long? Priority { get; set; }
        public bool? IsActive { get; set; }
        public string? Address { get; set; }
        public string? Hotline { get; set; }
        public string? Email { get; set; }
    }

    public interface IDepartmentService : IService<Department>
    {
        Task<List<DepartmentDto>> GetDepartmentsAsync(string? search, bool? isActive);
        Task<DepartmentDto?> GetDepartmentByIdAsync(Guid id);
        Task<Department> CreateDepartmentAsync(DepartmentCreateRequest request);
        Task<Department?> UpdateDepartmentAsync(Guid id, DepartmentUpdateRequest request);
        Task<bool> DeleteDepartmentAsync(Guid id);
    }

    public class DepartmentService : Service<Department>, IDepartmentService
    {
        private readonly IRabbitMQPublisher _publisher;

        public DepartmentService(IRepository<Department> repository, IRabbitMQPublisher publisher)
            : base(repository)
        {
            _publisher = publisher;
        }

        private static string FixVietnameseEncoding(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return text;
            if (text.Contains("Ã") || text.Contains("á»") || text.Contains("áº") || text.Contains("Æ") || text.Contains("Ä") || text.Contains("â"))
            {
                try
                {
                    byte[] bytes = Encoding.GetEncoding("ISO-8859-1").GetBytes(text);
                    string decoded = Encoding.UTF8.GetString(bytes);
                    if (!string.IsNullOrWhiteSpace(decoded)) return decoded;
                }
                catch { }
            }
            return text;
        }

        public async Task<List<DepartmentDto>> GetDepartmentsAsync(string? search, bool? isActive)
        {
            var query = _repository.GetQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(d => d.Name.ToLower().Contains(s) || d.Code.ToLower().Contains(s));
            }

            if (isActive.HasValue)
            {
                query = query.Where(d => d.IsActive == isActive.Value);
            }

            var list = await query.OrderBy(d => d.Level).ThenBy(d => d.Priority).ThenBy(d => d.Name).ToListAsync();

            return list.Select(d => new DepartmentDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = FixVietnameseEncoding(d.Name),
                ShortName = d.ShortName,
                ParentId = d.ParentId,
                ParentName = d.ParentId.HasValue ? list.FirstOrDefault(p => p.Id == d.ParentId.Value)?.Name : null,
                Level = d.Level,
                Priority = d.Priority ?? 1,
                Loai = d.Loai ?? "PHONG_BAN",
                IsActive = d.IsActive,
                Address = FixVietnameseEncoding(d.Address ?? ""),
                Hotline = d.Hotline,
                Email = d.Email,
                CreatedDate = d.CreatedDate.ToString("yyyy-MM-dd HH:mm:ss")
            }).ToList();
        }

        public async Task<DepartmentDto?> GetDepartmentByIdAsync(Guid id)
        {
            var d = await _repository.GetByIdAsync(id);
            if (d == null) return null;

            return new DepartmentDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = FixVietnameseEncoding(d.Name),
                ShortName = d.ShortName,
                ParentId = d.ParentId,
                Level = d.Level,
                Priority = d.Priority ?? 1,
                Loai = d.Loai ?? "PHONG_BAN",
                IsActive = d.IsActive,
                Address = FixVietnameseEncoding(d.Address ?? ""),
                Hotline = d.Hotline,
                Email = d.Email,
                CreatedDate = d.CreatedDate.ToString("yyyy-MM-dd HH:mm:ss")
            };
        }

        public async Task<Department> CreateDepartmentAsync(DepartmentCreateRequest request)
        {
            var dept = new Department
            {
                Id = Guid.NewGuid(),
                Code = request.Code.Trim().ToUpper(),
                Name = request.Name.Trim(),
                ShortName = request.ShortName?.Trim(),
                ParentId = request.ParentId,
                Level = request.Level > 0 ? request.Level : (request.ParentId.HasValue ? 2 : 1),
                Loai = !string.IsNullOrWhiteSpace(request.Loai) ? request.Loai : "PHONG_BAN",
                Priority = request.Priority ?? 1,
                IsActive = request.IsActive,
                Address = request.Address?.Trim(),
                Hotline = request.Hotline?.Trim(),
                Email = request.Email?.Trim(),
                CreatedDate = DateTime.UtcNow
            };

            _repository.Add(dept);
            await _repository.SaveAsync();

            _publisher.PublishDepartmentCreated(new DepartmentCreatedEvent
            {
                Id = dept.Id,
                Code = dept.Code,
                Name = dept.Name,
                ShortName = dept.ShortName,
                ParentId = dept.ParentId,
                Level = dept.Level,
                Loai = dept.Loai,
                Priority = dept.Priority,
                IsActive = dept.IsActive,
                Address = dept.Address,
                Hotline = dept.Hotline,
                Email = dept.Email,
                CreatedAt = dept.CreatedDate
            });

            return dept;
        }

        public async Task<Department?> UpdateDepartmentAsync(Guid id, DepartmentUpdateRequest request)
        {
            var dept = await _repository.GetByIdAsync(id);
            if (dept == null) return null;

            if (!string.IsNullOrWhiteSpace(request.Name)) dept.Name = request.Name.Trim();
            if (request.ShortName != null) dept.ShortName = request.ShortName.Trim();
            if (request.ParentId.HasValue) dept.ParentId = request.ParentId.Value == Guid.Empty ? null : request.ParentId;
            if (request.Level.HasValue) dept.Level = request.Level.Value;
            if (!string.IsNullOrWhiteSpace(request.Loai)) dept.Loai = request.Loai;
            if (request.Priority.HasValue) dept.Priority = request.Priority.Value;
            if (request.IsActive.HasValue) dept.IsActive = request.IsActive.Value;
            if (request.Address != null) dept.Address = request.Address.Trim();
            if (request.Hotline != null) dept.Hotline = request.Hotline.Trim();
            if (request.Email != null) dept.Email = request.Email.Trim();
            dept.UpdatedDate = DateTime.UtcNow;

            _repository.Update(dept);
            await _repository.SaveAsync();

            _publisher.PublishDepartmentUpdated(new DepartmentUpdatedEvent
            {
                Id = dept.Id,
                Code = dept.Code,
                Name = dept.Name,
                ShortName = dept.ShortName,
                ParentId = dept.ParentId,
                Level = dept.Level,
                Loai = dept.Loai,
                Priority = dept.Priority,
                IsActive = dept.IsActive,
                Address = dept.Address,
                Hotline = dept.Hotline,
                Email = dept.Email,
                UpdatedAt = dept.UpdatedDate
            });

            return dept;
        }

        public async Task<bool> DeleteDepartmentAsync(Guid id)
        {
            var dept = await _repository.GetByIdAsync(id);
            if (dept == null) return false;

            _repository.Delete(dept);
            await _repository.SaveAsync();

            _publisher.PublishDepartmentDeleted(new DepartmentDeletedEvent
            {
                Id = dept.Id,
                Code = dept.Code,
                Name = dept.Name,
                DeletedAt = DateTime.UtcNow
            });

            return true;
        }
    }
}
