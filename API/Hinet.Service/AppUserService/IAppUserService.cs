using Hinet.Model.Entities;
using Hinet.Service.AppUserService.Dto;
using Hinet.Service.AppUserService.Request;
using Hinet.Service.Common.Service;
using Hinet.Service.SsoKeycloakService.Dto;

namespace Hinet.Service.AppUserService
{
    public interface IAppUserService : IService<AppUser>
    {
        Task<LoginResponseDto> LoginUser(string email, string password);

        Task<string> ResetPassword(string email, string baseUri);

        Task<AppUserDto> ChangePassword(Guid? id, string oldPassword, string newPassword, string confirmPassword);

        Task<bool> UpdatePasswordDirectAsync(Guid userId, string newPassword);

        Task<LoginResponseDto> RefreshToken(string refreshToken);

        Task CreateAccountByLyLichId(Guid id);

        Task CreateAccountForAllLyLich();

        Task<AppUserDto> CheckLogin(Guid? id);

        Task LogoutUser();

        Task<AppUser?> GetByUserName(string UserName);

        Task<AppUserDto> GetInfo(Guid? id);

        Task<AppUserDto> GetDto(Guid? id);

        Task<AppUserDto> RegisterUser(RegisterViewModel model);

        Task<LoginResponseDto> RegisterAccount(RegisterRequest model);

        Task<AppUserDto> UpdateProfile(ProfileUserEditRequest dto);

        Task<AppUserDto> UpdateAvatarUser(Stream stream, string? fileName, string? fileType, Guid userId, Guid? itemId = null);

        // Upsert tài khoản từ thông tin SSO Keycloak của VNPT, trả về JWT.
        Task<LoginResponseDto> LoginByKeycloakSsoAsync(KeycloakUserInfo userInfo);

        /// <summary>
        /// Đồng bộ role cho tất cả tài khoản dựa trên chức vụ hiện tại trong lý lịch 2C.
        /// </summary>
        Task<SyncRoleResultDto> SyncRolesByChucVuAsync();

    }
}
