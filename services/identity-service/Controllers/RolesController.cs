using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Models;
using IdentityService.Data;
using IdentityService.Entities;

namespace IdentityService.Controllers
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
                catch
                {
                }
            }
            return text;
        }

        /// <summary>
        /// Lấy danh sách toàn bộ vai trò và tự động sửa lỗi font tiếng Việt nếu có
        /// </summary>
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

            // Nếu DB chưa có roles chuẩn nào, thêm mặc định
            if (!roles.Any())
            {
                var defaultRoles = new List<Role>
                {
                    new Role { Id = Guid.NewGuid(), Code = "ADMIN", Name = "Quản trị viên toàn hệ thống", Type = "SYSTEM", IsActive = true },
                    new Role { Id = Guid.NewGuid(), Code = "ROLE_TAISAN", Name = "Quản lý Cơ sở vật chất & Tài sản", Type = "ASSET", IsActive = true },
                    new Role { Id = Guid.NewGuid(), Code = "ROLE_KPI", Name = "Quản lý Đánh giá KPI & Thi đua", Type = "KPI", IsActive = true },
                    new Role { Id = Guid.NewGuid(), Code = "ROLE_ROOM", Name = "Quản lý Phòng trọ & Dịch vụ", Type = "ROOM", IsActive = true },
                    new Role { Id = Guid.NewGuid(), Code = "USER", Name = "Người dùng thông thường", Type = "GENERAL", IsActive = true }
                };

                _dbContext.Role.AddRange(defaultRoles);
                await _dbContext.SaveChangesAsync();
                roles = defaultRoles;
            }
            else
            {
                // Tự động kiểm tra và sửa lỗi encoding tiếng Việt bị lỗi lưu trước đó trong DB
                bool hasChanges = false;
                foreach (var role in roles)
                {
                    // Fix trường hợp hardcoded mapping
                    if (role.Code == "ADMIN" && (role.Name.Contains("Quá") || role.Name.Contains("Ã")))
                    {
                        role.Name = "Quản trị viên toàn hệ thống";
                        hasChanges = true;
                    }
                    else if (role.Code == "USER" && (role.Name.Contains("NgÆ") || role.Name.Contains("Ã")))
                    {
                        role.Name = "Người dùng thông thường";
                        hasChanges = true;
                    }
                    else if (role.Code == "MANAGER" && (role.Name.Contains("CÃ") || role.Name.Contains("bá")))
                    {
                        role.Name = "Cán bộ quản lý";
                        hasChanges = true;
                    }
                    else
                    {
                        var fixedName = FixVietnameseEncoding(role.Name);
                        if (fixedName != role.Name)
                        {
                            role.Name = fixedName;
                            hasChanges = true;
                        }
                    }
                }

                if (hasChanges)
                {
                    await _dbContext.SaveChangesAsync();
                }
            }

            return Ok(ApiResponse<object>.Ok(roles, "Lấy danh sách vai trò thành công"));
        }

        /// <summary>
        /// Tạo mới vai trò
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(ApiResponse<object>.Fail("Mã vai trò và tên vai trò không được để trống"));
            }

            var code = request.Code.Trim().ToUpper();
            var exists = await _dbContext.Role.AnyAsync(r => r.Code == code && !r.IsDeleted);
            if (exists)
            {
                return BadRequest(ApiResponse<object>.Fail("Mã vai trò này đã tồn tại"));
            }

            var role = new Role
            {
                Id = Guid.NewGuid(),
                Code = code,
                Name = request.Name.Trim(),
                Type = request.Type?.Trim() ?? "GENERAL",
                IsActive = true,
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _dbContext.Role.Add(role);
            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(role, "Tạo vai trò mới thành công"));
        }

        /// <summary>
        /// Cập nhật vai trò
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequest request)
        {
            var role = await _dbContext.Role.FindAsync(id);
            if (role == null || role.IsDeleted)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy vai trò"));
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                role.Name = request.Name.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Type))
            {
                role.Type = request.Type.Trim();
            }

            if (request.IsActive.HasValue)
            {
                role.IsActive = request.IsActive.Value;
            }
            role.UpdatedDate = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(role, "Cập nhật vai trò thành công"));
        }

        /// <summary>
        /// Xóa vai trò (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var role = await _dbContext.Role.FindAsync(id);
            if (role == null || role.IsDeleted)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy vai trò"));
            }

            if (role.Code == "ADMIN")
            {
                return BadRequest(ApiResponse<object>.Fail("Không thể xóa vai trò ADMIN mặc định"));
            }

            role.IsDeleted = true;
            role.UpdatedDate = DateTime.UtcNow;

            // Xóa phân quyền user role liên quan
            var userRoles = await _dbContext.UserRole.Where(ur => ur.RoleId == id).ToListAsync();
            _dbContext.UserRole.RemoveRange(userRoles);

            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(true, "Xóa vai trò thành công"));
        }
    }

    public class CreateRoleRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
    }

    public class UpdateRoleRequest
    {
        public string? Name { get; set; }
        public string? Type { get; set; }
        public bool? IsActive { get; set; }
    }
}
