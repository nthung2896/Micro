
using Hinet.Api.Dto;
using Hinet.Service.AppUserService;
using Hinet.Service.AppUserService.Dto;
using Hinet.Service.AppUserService.Request;
using Hinet.Service.Core.Mapper;
using Hinet.Service.OperationService.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class AccountController : HinetController
    {
        private readonly ILogger<AccountController> _logger;
        private readonly IAppUserService _userService;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IMapper _mapper;

        public AccountController(
            IAppUserService AuthService,
            ILogger<AccountController> logger,
            IWebHostEnvironment webHostEnvironment,
            IConfiguration configuration,
            IMapper mapper)
        {
            _logger = logger;
            _userService = AuthService;
            _webHostEnvironment = webHostEnvironment;
            _mapper = mapper;
        }

        [HttpPost("Login")]
        [AllowAnonymous]
        [EnableRateLimiting("login")]
        public async Task<DataResponse<LoginResponseDto>> Login([FromBody] LoginViewModel model)
        {
            try
            {
                var result = await _userService.LoginUser(model.UserName, model.Password);

                return new DataResponse<LoginResponseDto>
                {
                    Data = result,
                    Message = "Đăng nhập thành công",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpPost("Register")]
        [AllowAnonymous]
        public async Task<DataResponse<LoginResponseDto>> Register([FromBody] RegisterRequest model)
        {
            try
            {
                var result = await _userService.RegisterAccount(model);
                return new DataResponse<LoginResponseDto>
                {
                    Data = result,
                    Message = "Đăng ký tài khoản thành công",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đăng ký tài khoản");
                return new DataResponse<LoginResponseDto>
                {
                    Data = null,
                    Message = ex.Message,
                    Status = false
                };
            }
        }

        [HttpPost("Logout")]
        public async Task<DataResponse> Logout()
        {
            await _userService.LogoutUser();
            return new DataResponse
            {
                Message = "Đăng xuất thành công",
                Status = true
            };
        }

        [HttpGet("GetInfo")]
        [Authorize]
        public async Task<DataResponse<AppUserDto>> GetInfo()
        {
            AppUserDto? result = null;
            if (UserId.HasValue)
            {
                try
                {
                    result = await _userService.GetInfo(UserId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Không tìm thấy user theo UserId: {Id}, thử tìm theo Username. Lỗi: {Msg}", UserId, ex.Message);
                }
            }

            if (result == null)
            {
                var username = User.FindFirst("username")?.Value ?? User.Identity?.Name;
                if (!string.IsNullOrEmpty(username))
                {
                    try
                    {
                        var userByUsername = await _userService.GetByUserName(username);
                        if (userByUsername != null)
                        {
                            result = await _userService.GetInfo(userByUsername.Id);
                        }
                    }
                    catch { }
                }
            }

            if (result == null)
            {
                var username = User.FindFirst("username")?.Value ?? User.Identity?.Name ?? "admin";
                var fullName = User.FindFirst("fullName")?.Value ?? (username == "admin" ? "Quản Trị Viên Hệ Thống" : "Cán Bộ " + username);
                var roles = User.Claims
                    .Where(c => c.Type == ClaimTypes.Role || c.Type == "role" || c.Type == "roles")
                    .Select(r => r.Value)
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .ToList();
                result = new AppUserDto
                {
                    Id = UserId ?? Guid.NewGuid(),
                    UserName = username,
                    Name = fullName,
                    Email = $"{username}@ebizoffice.vn",
                    ListRole = roles.Count > 0 ? roles : new List<string> { "Admin" },
                    Type = "Admin"
                };
            }

            // Luôn gộp quyền từ JWT Token SSO đã được Identity Service ký cấp
            var jwtRoles = User.Claims
                .Where(c => c.Type == ClaimTypes.Role || c.Type == "role" || c.Type == "roles")
                .Select(c => c.Value)
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .ToList();
            if (jwtRoles.Count > 0)
            {
                var existingRoles = result.ListRole ?? new List<string>();
                result.ListRole = existingRoles.Union(jwtRoles, StringComparer.OrdinalIgnoreCase).ToList();
            }

            if (result.MenuData == null || result.MenuData.Count == 0)
            {
                result.MenuData = BuildDefaultKpiMenuData();
            }

            return new DataResponse<AppUserDto>
            {
                Data = result,
                Message = "Lấy thông tin tài khoản thành công",
                Status = true
            };
        }

        private static List<MenuDataDto> BuildDefaultKpiMenuData()
        {
            return new List<MenuDataDto>
            {
                new MenuDataDto
                {
                    Id = Guid.NewGuid(),
                    Name = "Bàn Làm Việc",
                    Code = "DASHBOARD",
                    Order = 1,
                    IsShow = true,
                    IsAccess = true,
                    ClassCss = "<DashboardOutlined />",
                    Url = "/dashboard",
                    ListMenu = new List<MenuDataDto>()
                },
                new MenuDataDto
                {
                    Id = Guid.NewGuid(),
                    Name = "Nghiệp Vụ Đánh Giá KPI",
                    Code = "KPI_MODULE",
                    Order = 2,
                    IsShow = true,
                    IsAccess = true,
                    ClassCss = "<AuditOutlined />",
                    Url = "/kPI_NhiemVu",
                    ListMenu = new List<MenuDataDto>
                    {
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Nhiệm Vụ KPI", Code = "KPI_NHIEMVU", Order = 1, IsShow = true, IsAccess = true, Url = "/kPI_NhiemVu" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Phiếu Đánh Giá Cán Bộ", Code = "KPI_PHIEUDANHGIA", Order = 2, IsShow = true, IsAccess = true, Url = "/kPI_PhieuDanhGia" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Bộ Tiêu Chí Chung", Code = "KPI_BOTIEUCHICHUNG", Order = 3, IsShow = true, IsAccess = true, Url = "/kPI_BoTieuChiChung" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Bộ Tiêu Chí Đơn Vị", Code = "KPI_BOTIEUCHIDONVI", Order = 4, IsShow = true, IsAccess = true, Url = "/kPI_BoTieuChiDonVi" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Đợt Theo Dõi Đánh Giá", Code = "KPI_DOTTHEODOI", Order = 5, IsShow = true, IsAccess = true, Url = "/kPI_DotTheoDoiDanhGia" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Chấm Điểm Tiêu Chí", Code = "KPI_DIEMSO", Order = 6, IsShow = true, IsAccess = true, Url = "/kPI_TieuChiChung_DiemSo" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Hồ Sơ Lý Lịch 2C", Code = "KPI_LYLICH2C", Order = 7, IsShow = true, IsAccess = true, Url = "/kPI_LyLich2C" }
                    }
                },
                new MenuDataDto
                {
                    Id = Guid.NewGuid(),
                    Name = "Cơ Cấu Tổ Chức",
                    Code = "ORG_MODULE",
                    Order = 3,
                    IsShow = true,
                    IsAccess = true,
                    ClassCss = "<ApartmentOutlined />",
                    Url = "/Department",
                    ListMenu = new List<MenuDataDto>
                    {
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Phòng Ban & Đơn Vị", Code = "DEPARTMENT", Order = 1, IsShow = true, IsAccess = true, Url = "/Department" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Tỉnh / Thành Phố", Code = "TINH", Order = 2, IsShow = true, IsAccess = true, Url = "/tinh" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Quận / Huyện", Code = "HUYEN", Order = 3, IsShow = true, IsAccess = true, Url = "/huyen" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Xã / Phường", Code = "XA", Order = 4, IsShow = true, IsAccess = true, Url = "/xa" }
                    }
                },
                new MenuDataDto
                {
                    Id = Guid.NewGuid(),
                    Name = "Văn Bản & Báo Cáo",
                    Code = "DOC_MODULE",
                    Order = 4,
                    IsShow = true,
                    IsAccess = true,
                    ClassCss = "<FileTextOutlined />",
                    Url = "/kPI_VanBanDen",
                    ListMenu = new List<MenuDataDto>
                    {
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Văn Bản Đến", Code = "VAN_BAN_DEN", Order = 1, IsShow = true, IsAccess = true, Url = "/kPI_VanBanDen" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Văn Bản Đi", Code = "VAN_BAN_DI", Order = 2, IsShow = true, IsAccess = true, Url = "/kPI_VanBanDi" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Mẫu Báo Cáo", Code = "MAU_BAO_CAO", Order = 3, IsShow = true, IsAccess = true, Url = "/mauBaoCao" }
                    }
                },
                new MenuDataDto
                {
                    Id = Guid.NewGuid(),
                    Name = "Quản Trị Hệ Thống",
                    Code = "SYS_MODULE",
                    Order = 5,
                    IsShow = true,
                    IsAccess = true,
                    ClassCss = "<SettingOutlined />",
                    Url = "/QLNguoiDung",
                    ListMenu = new List<MenuDataDto>
                    {
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Quản Lý Người Dùng", Code = "QL_NGUOIDUNG", Order = 1, IsShow = true, IsAccess = true, Url = "/QLNguoiDung" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Vai Trò & Phân Quyền", Code = "QL_ROLE", Order = 2, IsShow = true, IsAccess = true, Url = "/QLRole" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Dữ Liệu Danh Mục", Code = "DULIEUDANHMUC", Order = 3, IsShow = true, IsAccess = true, Url = "/DuLieuDanhMuc" },
                        new MenuDataDto { Id = Guid.NewGuid(), Name = "Cấu Hình Ứng Dụng", Code = "APP_CONFIG", Order = 4, IsShow = true, IsAccess = true, Url = "/appConfiguration" }
                    }
                }
            };
        }

        [HttpPut("UpdateProfile")]
        [Authorize]
        public async Task<DataResponse<AppUserDto>> UpdateInfo([FromBody] ProfileUserEditRequest edit)
        {
            try
            {
                var newInfo = await _userService.UpdateProfile(edit);
                return DataResponse<AppUserDto>.Success(newInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật profile với Id: {Id}", edit.Id);
                return new DataResponse<AppUserDto>()
                {
                    Data = null,
                    Status = false,
                    Message = ex.Message,
                };
            }
        }

        [HttpPut("UpdateProfile/UpdateAvatar")]
        //ignore-sync
        public async Task<DataResponse<AppUserDto>> UpdateAvatar([FromForm] IFormFile avatar)
        {
            try
            {
                if (avatar == null || avatar.Length == 0)
                    return DataResponse<AppUserDto>.False("File rỗng");

                var result = await _userService.UpdateAvatarUser(
                    avatar.OpenReadStream(),
                    avatar.FileName,
                    avatar.ContentType,
                    (Guid)UserId!);
                return DataResponse<AppUserDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật profile với Id: {Id}", UserId);
                return new DataResponse<AppUserDto>()
                {
                    Data = null,
                    Status = false,
                    Message = ex.Message,
                };
            }
        }


        [HttpPut("UpdateProfile/ChangePassword")]
        [Authorize]
        public async Task<DataResponse<AppUserDto>> ChangePassword([FromBody] ChangePasswordViewModel vm)
        {
            try
            {
                var newInfo = await _userService.ChangePassword(UserId, vm.OldPassword, vm.NewPassword, vm.ConfirmPassword);
                return DataResponse<AppUserDto>.Success(newInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật password với Id: {Id}", UserId);
                return new DataResponse<AppUserDto>()
                {
                    Data = null,
                    Status = false,
                    Message = ex.Message,
                };
            }
        }



        [HttpPut("UpdateProfile/AdminChangePassword")]
        public async Task<DataResponse<AppUserDto>> AdminChangePassword([FromBody] ChangePasswordViewModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.NewPassword))
                    return DataResponse<AppUserDto>.False("Mật khẩu mới không được để trống");

                if (model.NewPassword != model.ConfirmPassword)
                    return DataResponse<AppUserDto>.False("Mật khẩu nhập lại không trùng khớp với mật khẩu mới");

                if (model.UserId == null)
                    return DataResponse<AppUserDto>.False("Không tìm thấy thông tin tài khoản");

                if (!await _userService.UpdatePasswordDirectAsync(model.UserId.Value, model.NewPassword))
                    return DataResponse<AppUserDto>.False("Không tìm thấy thông tin tài khoản");

                return new DataResponse<AppUserDto>
                {
                    Data = null,
                    Message = "Thay đổi mật khẩu thành công",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new DataResponse<AppUserDto>
                {
                    Data = null,
                    Message = ex.Message,
                    Status = false
                };
            }
        }

        // Reset password tài khoản khác – CHỈ admin được phép.
        [HttpGet("ResetPassword")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<string>> ResetPasswordById(Guid id)
        {
            try
            {
                const string defaultResetPassword = "12345678";

                if (!await _userService.UpdatePasswordDirectAsync(id, defaultResetPassword))
                    return DataResponse<string>.False("User not found");

                return DataResponse<string>.Success(defaultResetPassword);
            }
            catch (Exception ex)
            {
                return DataResponse<string>.False($"An error occurred: {ex.Message}");
            }
        }

        /// <summary>
        /// Đồng bộ role cho tất cả tài khoản dựa trên chức vụ hiện tại trong lý lịch 2C.
        /// Ánh xạ: PhoTP/PhoTruongPhong → PhoTruongPhong, TP/TruongPhong → TruongPhong,
        /// PhoCucTruong → PhoCucTruong, CucTruong → CucTruong.
        /// </summary>
        [HttpPost("SyncRolesByChucVu")]
        [AllowAnonymous]
        public async Task<DataResponse<SyncRoleResultDto>> SyncRolesByChucVu()
        {
            try
            {
                var result = await _userService.SyncRolesByChucVuAsync();
                return new DataResponse<SyncRoleResultDto>
                {
                    Data = result,
                    Message = $"Đồng bộ hoàn tất: {result.TotalAssigned} role được gán, {result.TotalSkipped} bỏ qua, {result.TotalFailed} lỗi.",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đồng bộ role theo chức vụ");
                return new DataResponse<SyncRoleResultDto>
                {
                    Data = null,
                    Status = false,
                    Message = ex.Message
                };
            }
        }

        private static string GenerateRandomPassword(int length)
        {
            const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
            const string lower = "abcdefghjkmnpqrstuvwxyz";
            const string digit = "0123456789";
            const string special = "!@#$%&*";
            var all = upper + lower + digit + special;
            var bytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(length);
            var chars = new char[length];
            // đảm bảo có ít nhất 1 ký tự mỗi nhóm
            chars[0] = upper[bytes[0] % upper.Length];
            chars[1] = lower[bytes[1] % lower.Length];
            chars[2] = digit[bytes[2] % digit.Length];
            chars[3] = special[bytes[3] % special.Length];
            for (int i = 4; i < length; i++) chars[i] = all[bytes[i] % all.Length];
            // shuffle
            for (int i = chars.Length - 1; i > 0; i--)
            {
                int j = bytes[i] % (i + 1);
                (chars[i], chars[j]) = (chars[j], chars[i]);
            }
            return new string(chars);
        }
    }
}
