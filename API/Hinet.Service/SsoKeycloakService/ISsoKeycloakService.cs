using Hinet.Service.SsoKeycloakService.Dto;

namespace Hinet.Service.SsoKeycloakService
{
    public interface ISsoKeycloakService
    {
        string BuildLoginUrl();
        string BuildLogoutUrl(string idTokenHint);
        Task<KeycloakTokenResponse?> GetTokenAsync(string code);
        Task<KeycloakUserInfo?> GetUserInfoAsync(string accessToken);
    }
}
