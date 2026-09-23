
using Hinet.Api.Dto;
using Hinet.Service.AppUserService;
using Hinet.Service.AppUserService.Dto;
using Hinet.Service.AppUserService.Request;
using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

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
            _logger.LogWarning("Lỗi khi tìm profile với Id: {Id}", UserId);
            var result = await _userService.GetInfo(UserId);
            return new DataResponse<AppUserDto>
            {
                Data = result,
                Message = "Lấy thông tin tài khoản thành công",
                Status = true
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
