using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Models;
using SharedKernel.Events;
using Hinet.Model.Entities;
using Hinet.Repository;
using Hinet.Service.RabbitMQ;

namespace Hinet.Api.Controllers
{
    [ApiController]
    [Route("api/auth/users")]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly IdentityContext _dbContext;
        private readonly UserManager<AppUser> _userManager;
        private readonly IRabbitMQPublisher _publisher;

        public UsersController(
            IdentityContext dbContext,
            UserManager<AppUser> userManager,
            IRabbitMQPublisher publisher)
        {
            _dbContext = dbContext;
            _userManager = userManager;
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

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] string? roleCode, [FromQuery] bool? isActive)
        {
            var usersQuery = _dbContext.Users.Where(u => !u.IsDeleted).AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                usersQuery = usersQuery.Where(u =>
                    (u.UserName != null && u.UserName.ToLower().Contains(s)) ||
                    (u.FullName != null && u.FullName.ToLower().Contains(s)) ||
                    (u.Email != null && u.Email.ToLower().Contains(s)));
            }

            if (isActive.HasValue)
            {
                usersQuery = usersQuery.Where(u => u.IsActive == isActive.Value);
            }

            var users = await usersQuery.OrderBy(u => u.UserName).ToListAsync();
            var userIds = users.Select(u => u.Id).ToList();

            var userRoles = await (from ur in _dbContext.UserRole
                                   join r in _dbContext.Role on ur.RoleId equals r.Id
                                   where userIds.Contains(ur.UserId) && !r.IsDeleted && !ur.IsDeleted
                                   select new { ur.UserId, RoleCode = r.Code })
                                  .ToListAsync();

            var result = users.Select(u =>
            {
                var roles = userRoles.Where(r => r.UserId == u.Id).Select(r => r.RoleCode).ToList();
                if (roles.Count == 0 && u.UserName == "admin") roles = new List<string> { "ADMIN", "ROLE_TAISAN", "ROLE_KPI", "ROLE_ROOM" };
                return new
                {
                    id = u.Id,
                    userName = u.UserName,
                    fullName = FixVietnameseEncoding(u.FullName ?? u.UserName ?? ""),
                    email = u.Email,
                    phoneNumber = u.PhoneNumber,
                    isActive = u.IsActive,
                    avatar = u.Avatar,
                    createdDate = u.CreatedDate.ToString("yyyy-MM-dd HH:mm:ss"),
                    roles = roles
                };
            }).ToList();

            if (!string.IsNullOrWhiteSpace(roleCode) && roleCode != "ALL")
            {
                result = result.Where(u => u.roles.Contains(roleCode)).ToList();
            }

            return Ok(ApiResponse<object>.Ok(result, "Lấy danh sách người dùng thành công"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            var roles = await (from ur in _dbContext.UserRole
                               join r in _dbContext.Role on ur.RoleId equals r.Id
                               where ur.UserId == user.Id && !r.IsDeleted && !ur.IsDeleted
                               select r.Code).ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                fullName = FixVietnameseEncoding(user.FullName ?? user.UserName ?? ""),
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                isActive = user.IsActive,
                avatar = user.Avatar,
                createdDate = user.CreatedDate.ToString("yyyy-MM-dd HH:mm:ss"),
                roles = roles
            }));
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(ApiResponse<object>.Fail("Tên đăng nhập và mật khẩu không được để trống"));
            }

            var normalizedUserName = request.UserName.Trim().ToUpper();
            var exists = await _dbContext.Users.AnyAsync(u => u.NormalizedUserName == normalizedUserName && !u.IsDeleted);
            if (exists)
            {
                return BadRequest(ApiResponse<object>.Fail($"Tên đăng nhập '{request.UserName}' đã tồn tại"));
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
                IsActive = request.IsActive,
                CreatedDate = DateTime.UtcNow,
                SecurityStamp = Guid.NewGuid().ToString("D")
            };

            var createResult = await _userManager.CreateAsync(user, request.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                return BadRequest(ApiResponse<object>.Fail($"Tạo người dùng thất bại: {errors}"));
            }

            var roleCodes = request.RoleCodes ?? new List<string> { "USER" };
            foreach (var code in roleCodes)
            {
                var role = await _dbContext.Role.FirstOrDefaultAsync(r => r.Code == code && !r.IsDeleted);
                if (role == null)
                {
                    role = new Role
                    {
                        Id = Guid.NewGuid(),
                        Code = code,
                        Name = code,
                        Type = "CUSTOM",
                        IsActive = true,
                        CreatedDate = DateTime.UtcNow
                    };
                    _dbContext.Role.Add(role);
                    await _dbContext.SaveChangesAsync();
                }

                _dbContext.UserRole.Add(new UserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    RoleId = role.Id,
                    CreatedDate = DateTime.UtcNow
                });
            }
            await _dbContext.SaveChangesAsync();

            _publisher.PublishUserCreated(new UserCreatedEvent
            {
                UserId = user.Id,
                UserName = user.UserName ?? string.Empty,
                FullName = user.FullName ?? user.UserName ?? string.Empty,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Roles = roleCodes,
                CreatedAt = user.CreatedDate,
                SourceService = "identity-service"
            });

            return Ok(ApiResponse<object>.Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                fullName = user.FullName,
                email = user.Email,
                roles = roleCodes
            }, "Tạo tài khoản và phát sự kiện đồng bộ thành công"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName.Trim();
            if (request.Email != null)
            {
                user.Email = request.Email.Trim();
                user.NormalizedEmail = request.Email.Trim().ToUpper();
            }
            if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber.Trim();
            if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
            user.UpdatedDate = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            _publisher.PublishUserUpdated(new UserUpdatedEvent
            {
                UserId = user.Id,
                UserName = user.UserName ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                IsActive = user.IsActive,
                UpdatedAt = user.UpdatedDate,
                SourceService = "identity-service"
            });

            return Ok(ApiResponse<object>.Ok(user, "Cập nhật thông tin người dùng thành công"));
        }

        [HttpPost("{id}/roles")]
        public async Task<IActionResult> AssignRoles(Guid id, [FromBody] AssignRolesRequest request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            var oldUserRoles = await _dbContext.UserRole.Where(ur => ur.UserId == id).ToListAsync();
            _dbContext.UserRole.RemoveRange(oldUserRoles);

            var newRoles = request.RoleCodes ?? new List<string>();
            foreach (var code in newRoles)
            {
                var role = await _dbContext.Role.FirstOrDefaultAsync(r => r.Code == code && !r.IsDeleted);
                if (role == null)
                {
                    role = new Role
                    {
                        Id = Guid.NewGuid(),
                        Code = code,
                        Name = code,
                        Type = "CUSTOM",
                        IsActive = true,
                        CreatedDate = DateTime.UtcNow
                    };
                    _dbContext.Role.Add(role);
                    await _dbContext.SaveChangesAsync();
                }

                _dbContext.UserRole.Add(new UserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = id,
                    RoleId = role.Id,
                    CreatedDate = DateTime.UtcNow
                });
            }

            await _dbContext.SaveChangesAsync();

            _publisher.PublishUserRolesChanged(new UserRolesChangedEvent
            {
                UserId = user.Id,
                UserName = user.UserName ?? string.Empty,
                Roles = newRoles,
                UpdatedAt = DateTime.UtcNow,
                SourceService = "identity-service"
            });

            return Ok(ApiResponse<object>.Ok(newRoles, "Gán quyền và phát sự kiện đồng bộ thành công"));
        }

        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return BadRequest(ApiResponse<object>.Fail("Mật khẩu mới phải có ít nhất 6 ký tự"));
            }

            var passwordHasher = new PasswordHasher<AppUser>();
            user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
            user.UpdatedDate = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(null, $"Đặt lại mật khẩu cho @{user.UserName} thành công"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy người dùng"));
            }

            if (user.UserName?.ToUpper() == "ADMIN")
            {
                return BadRequest(ApiResponse<object>.Fail("Không thể xóa tài khoản Quản trị viên tối cao (admin)"));
            }

            user.IsDeleted = true;
            user.UpdatedDate = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok(null, $"Đã xóa người dùng @{user.UserName} thành công"));
        }
    }

    public class CreateUserRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string Password { get; set; } = "123456";
        public bool IsActive { get; set; } = true;
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
        public List<string>? RoleCodes { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}
