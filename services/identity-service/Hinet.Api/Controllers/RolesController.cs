using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Models;
using Hinet.Model.Entities;
using Hinet.Repository;

namespace Hinet.Api.Controllers
{
    [ApiController]
    [Route("api/auth/roles")]
    [Route("api/roles")]
    public class RolesController : ControllerBase
    {
        private readonly IdentityContext _dbContext;

        public RolesController(IdentityContext dbContext)
        {
            _dbContext = dbContext;
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

        [HttpGet]
        public async Task<IActionResult> GetRoles([FromQuery] string? search)
        {
            var query = _dbContext.Role.Where(r => !r.IsDeleted).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(r => r.Name.ToLower().Contains(s) || r.Code.ToLower().Contains(s));
            }

            var roles = await query.OrderBy(r => r.Name).ToListAsync();

            if (roles.Count == 0)
            {
                var defaultRoles = new List<Role>
                {
                    new Role { Id = Guid.NewGuid(), Code = "ADMIN", Name = "Quản trị viên toàn hệ thống", Type = "SYSTEM", IsActive = true, CreatedDate = DateTime.UtcNow },
                    new Role { Id = Guid.NewGuid(), Code = "ROLE_TAISAN", Name = "Cán bộ Quản lý Tài sản", Type = "ASSET", IsActive = true, CreatedDate = DateTime.UtcNow },
                    new Role { Id = Guid.NewGuid(), Code = "ROLE_KPI", Name = "Cán bộ Đánh giá KPI & Thi đua", Type = "KPI", IsActive = true, CreatedDate = DateTime.UtcNow },
                    new Role { Id = Guid.NewGuid(), Code = "ROLE_ROOM", Name = "Quản lý Phòng trọ & Ví tiền", Type = "ROOM", IsActive = true, CreatedDate = DateTime.UtcNow },
                    new Role { Id = Guid.NewGuid(), Code = "USER", Name = "Người dùng thông thường", Type = "GENERAL", IsActive = true, CreatedDate = DateTime.UtcNow }
                };
                _dbContext.Role.AddRange(defaultRoles);
                await _dbContext.SaveChangesAsync();
                roles = defaultRoles;
            }

            var result = roles.Select(r => new
            {
                id = r.Id,
                code = r.Code,
                name = FixVietnameseEncoding(r.Name),
                type = r.Type ?? "GENERAL",
                isActive = r.IsActive
            });

            return Ok(ApiResponse<object>.Ok(result, "Lấy danh sách vai trò thành công"));
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(ApiResponse<object>.Fail("Mã vai trò và tên vai trò không được để trống"));
            }

            var code = request.Code.Trim().ToUpper();
            var exists = await _dbContext.Role.AnyAsync(r => r.Code.ToUpper() == code && !r.IsDeleted);
            if (exists)
            {
                return BadRequest(ApiResponse<object>.Fail($"Mã vai trò '{code}' đã tồn tại"));
            }

            var role = new Role
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = request.Name.Trim(),
                Type = request.Type?.Trim() ?? "GENERAL",
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _dbContext.Role.Add(role);
            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(role, "Tạo nhóm quyền thành công"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
        {
            var role = await _dbContext.Role.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
            if (role == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy vai trò"));
            }

            if (!string.IsNullOrWhiteSpace(request.Name)) role.Name = request.Name.Trim();
            if (!string.IsNullOrWhiteSpace(request.Type)) role.Type = request.Type.Trim();
            if (request.IsActive.HasValue) role.IsActive = request.IsActive.Value;
            role.UpdatedDate = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(role, "Cập nhật vai trò thành công"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var role = await _dbContext.Role.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
            if (role == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy vai trò"));
            }

            if (role.Code.ToUpper() == "ADMIN")
            {
                return BadRequest(ApiResponse<object>.Fail("Không thể xóa vai trò ADMIN hệ thống"));
            }

            role.IsDeleted = true;
            role.UpdatedDate = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(null, "Xóa vai trò thành công"));
        }
    }

    public class CreateRoleRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; } = "GENERAL";
    }

    public class UpdateRoleRequest
    {
        public string? Name { get; set; }
        public string? Type { get; set; }
        public bool? IsActive { get; set; }
    }
}
