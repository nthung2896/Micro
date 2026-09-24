using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Models;
using IdentityService.Data;
using IdentityService.Entities;

namespace IdentityService.Controllers
{
    [ApiController]
    [Route("api/auth/users")]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly IdentityContext _dbContext;
        private readonly PasswordHasher<AppUser> _passwordHasher;
        private readonly IdentityService.Services.IRabbitMQPublisher _rabbitMQPublisher;

        public UsersController(
            IdentityContext dbContext,
            IdentityService.Services.IRabbitMQPublisher rabbitMQPublisher)
        {
            _dbContext = dbContext;
            _passwordHasher = new PasswordHasher<AppUser>();
            _rabbitMQPublisher = rabbitMQPublisher;
        }

        private static string FixVietnameseEncoding(string? text)
        {
            if (string.IsNullOrWhiteSpace(text)) return text ?? string.Empty;
            if (text.Contains("Ã") || text.Contains("á»") || text.Contains("áº") || text.Contains("Æ") || text.Contains("Ä") || text.Contains("â"))
            {
                try
                {
                    byte[] bytes = System.Text.Encoding.GetEncoding("ISO-8859-1").GetBytes(text);
                    string decoded = System.Text.Encoding.UTF8.GetString(bytes);
                    if (!string.IsNullOrWhiteSpace(decoded)) return decoded;
                }
                catch
                {
                }
            }
            return text;
        }

        /// <summary>
        /// Lấy danh sách toàn bộ người dùng kèm vai trò
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] string? search)
        {
            var query = _dbContext.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(u => 
                    (u.UserName != null && u.UserName.ToLower().Contains(s)) ||
                    (u.FullName != null && u.FullName.ToLower().Contains(s)) ||
                    (u.Email != null && u.Email.ToLower().Contains(s))
                );
            }

            var users = await query.OrderByDescending(u => u.CreatedDate).ToListAsync();

            // Auto-fix FullName encoding
            bool hasChanges = false;
            foreach (var u in users)
            {
                if (!string.IsNullOrEmpty(u.FullName))
                {
                    var fixedName = FixVietnameseEncoding(u.FullName);
                    if (fixedName != u.FullName)
                    {
                        u.FullName = fixedName;
                        hasChanges = true;
                    }
                }
            }
            if (hasChanges)
            {
                await _dbContext.SaveChangesAsync();
            }

            // Load roles mapping
            var userRoles = await (from ur in _dbContext.UserRole
                                   join r in _dbContext.Role on ur.RoleId equals r.Id
                                   where !r.IsDeleted && !ur.IsDeleted
                                   select new { ur.UserId, RoleId = r.Id, RoleCode = r.Code, RoleName = r.Name }).ToListAsync();

            var roleGroup = userRoles.GroupBy(ur => ur.UserId)
                                     .ToDictionary(g => g.Key, g => g.ToList());

            var result = users.Select(u => new
            {
                id = u.Id,
                userName = u.UserName,
                fullName = u.FullName ?? u.UserName,
                email = u.Email,
                phoneNumber = u.PhoneNumber,
                isActive = u.IsActive,
                createdDate = u.CreatedDate,
                roles = roleGroup.ContainsKey(u.Id) ? roleGroup[u.Id].Select(r => r.RoleCode).ToList() : new List<string>(),
                roleDetails = roleGroup.ContainsKey(u.Id) ? roleGroup[u.Id].Cast<object>().ToList() : new List<object>()
            });

            return Ok(ApiResponse<object>.Ok(result, "Lấy danh sách người dùng thành công"));
        }

        /// <summary>
        /// Tạo mới tài khoản người dùng và bắn sự kiện UserCreatedEvent vào Message Queue
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName))
            {
                return BadRequest(ApiResponse<object>.Fail("Tên đăng nhập không được để trống"));
            }

            var normalizedUserName = request.UserName.Trim().ToUpper();
            var exists = await _dbContext.Users.AnyAsync(u => u.NormalizedUserName == normalizedUserName || u.UserName == request.UserName);
            if (exists)
            {
                return BadRequest(ApiResponse<object>.Fail("Tên đăng nhập đã tồn tại trong hệ thống"));
            }

            var user = new AppUser
            {
                Id = Guid.NewGuid(),
                UserName = request.UserName.Trim(),
                NormalizedUserName = normalizedUserName,
                FullName = request.FullName?.Trim() ?? request.UserName.Trim(),
                Email = request.Email?.Trim(),
                NormalizedEmail = request.Email?.Trim().ToUpper(),
                PhoneNumber = request.PhoneNumber?.Trim(),
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            var password = string.IsNullOrWhiteSpace(request.Password) ? "123456" : request.Password;
            user.PasswordHash = _passwordHasher.HashPassword(user, password);

            _dbContext.Users.Add(user);

            var assignedRoleCodes = new List<string>();

            // Gán vai trò ban đầu nếu có
            if (request.RoleCodes != null && request.RoleCodes.Any())
            {
                var roles = await _dbContext.Role.Where(r => request.RoleCodes.Contains(r.Code) && !r.IsDeleted).ToListAsync();
                foreach (var r in roles)
                {
                    assignedRoleCodes.Add(r.Code);
                    _dbContext.UserRole.Add(new UserRole
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        RoleId = r.Id,
                        CreatedDate = DateTime.UtcNow,
                        IsDeleted = false
                    });
                }
            }

            await _dbContext.SaveChangesAsync();

            // =========================================================================
            // EVENT-DRIVEN: BẮN SỰ KIỆN UserCreatedEvent VÀO RABBITMQ MESSAGE QUEUE
            // =========================================================================
            try
            {
                _rabbitMQPublisher.PublishUserCreated(new SharedKernel.Events.UserCreatedEvent
                {
                    UserId = user.Id,
                    UserName = user.UserName,
                    FullName = user.FullName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Roles = assignedRoleCodes.Count > 0 ? assignedRoleCodes : (request.RoleCodes ?? new List<string>()),
                    CreatedAt = user.CreatedDate,
                    SourceService = "identity-service"
                });
            }
            catch { }

            return Ok(ApiResponse<object>.Ok(new { id = user.Id, userName = user.UserName, eventPublished = true }, "Tạo người dùng và đồng bộ qua Message Queue thành công"));
        }

        /// <summary>
        /// Cập nhật thông tin người dùng
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            user.FullName = request.FullName?.Trim() ?? user.FullName;
            user.Email = request.Email?.Trim();
            user.NormalizedEmail = request.Email?.Trim().ToUpper();
            user.PhoneNumber = request.PhoneNumber?.Trim();
            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            await _dbContext.SaveChangesAsync();

            // EVENT-DRIVEN: Bắn sự kiện UserUpdatedEvent
            try
            {
                _rabbitMQPublisher.PublishUserUpdated(new SharedKernel.Events.UserUpdatedEvent
                {
                    UserId = user.Id,
                    UserName = user.UserName,
                    FullName = user.FullName ?? user.UserName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    IsActive = user.IsActive,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            catch { }

            return Ok(ApiResponse<object>.Ok(new { id = user.Id, userName = user.UserName }, "Cập nhật người dùng thành công"));
        }

        /// <summary>
        /// Gán / Cập nhật danh sách vai trò cho người dùng
        /// </summary>
        [HttpPost("{id}/roles")]
        public async Task<IActionResult> AssignRoles(Guid id, [FromBody] AssignRolesRequest request)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            // Xóa các vai trò cũ
            var existingUserRoles = await _dbContext.UserRole.Where(ur => ur.UserId == id).ToListAsync();
            _dbContext.UserRole.RemoveRange(existingUserRoles);

            // Thêm các vai trò mới
            if (request.RoleCodes != null && request.RoleCodes.Any())
            {
                var roles = await _dbContext.Role.Where(r => request.RoleCodes.Contains(r.Code) && !r.IsDeleted).ToListAsync();
                foreach (var r in roles)
                {
                    _dbContext.UserRole.Add(new UserRole
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        RoleId = r.Id,
                        CreatedDate = DateTime.UtcNow,
                        IsDeleted = false
                    });
                }
            }

            await _dbContext.SaveChangesAsync();

            // EVENT-DRIVEN: Bắn sự kiện UserRolesChangedEvent
            try
            {
                _rabbitMQPublisher.PublishUserRolesChanged(new SharedKernel.Events.UserRolesChangedEvent
                {
                    UserId = user.Id,
                    UserName = user.UserName,
                    Roles = request.RoleCodes ?? new List<string>(),
                    UpdatedAt = DateTime.UtcNow
                });
            }
            catch { }

            return Ok(ApiResponse<object>.Ok(new { userId = id, roles = request.RoleCodes }, "Phân quyền vai trò và đồng bộ Message Queue thành công"));
        }

        /// <summary>
        /// Đặt lại mật khẩu người dùng
        /// </summary>
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            var newPassword = string.IsNullOrWhiteSpace(request.NewPassword) ? "123456" : request.NewPassword;
            user.PasswordHash = _passwordHasher.HashPassword(user, newPassword);

            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(true, "Đặt lại mật khẩu thành công"));
        }

        /// <summary>
        /// Khóa / Kích hoạt hoặc Xóa người dùng
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrToggleUser(Guid id)
        {
            var user = await _dbContext.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            // Đổi trạng thái Active
            user.IsActive = !user.IsActive;
            await _dbContext.SaveChangesAsync();

            var message = user.IsActive ? "Đã kích hoạt lại tài khoản" : "Đã khóa tài khoản thành công";
            return Ok(ApiResponse<object>.Ok(new { id = user.Id, isActive = user.IsActive }, message));
        }
    }

    public class CreateUserRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Password { get; set; }
        public List<string>? RoleCodes { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AssignRolesRequest
    {
        public List<string> RoleCodes { get; set; } = new List<string>();
    }

    public class ResetPasswordRequest
    {
        public string? NewPassword { get; set; }
    }
}
