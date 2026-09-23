using Hinet.Extensions;
using Hinet.Service.AppUserService;
using Hinet.Service.SsoKeycloakService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class SsoKeycloakController : ControllerBase
    {
        private readonly ISsoKeycloakService _ssoService;
        private readonly IAppUserService _userService;
        private readonly ILogger<SsoKeycloakController> _logger;

        public SsoKeycloakController(
            ISsoKeycloakService ssoService,
            IAppUserService userService,
            ILogger<SsoKeycloakController> logger)
        {
            _ssoService = ssoService;
            _userService = userService;
            _logger = logger;
        }

        // GET /api/SsoKeycloak/InitiateLogin
        [HttpGet("InitiateLogin")]
        public IActionResult InitiateLogin()
        {
            var url = _ssoService.BuildLoginUrl();
            return Redirect(url);
        }

        // GET /api/SsoKeycloak/Callback?code=...
        [HttpGet("Callback")]
        public async Task<IActionResult> Callback([FromQuery] string code)
        {
            var feUrl = AppSettings.SsoKeycloak.RedirectUri; // URL callback của FE
            if (string.IsNullOrWhiteSpace(code))
            {
                return Redirect($"{feUrl}?error=missing_code");
            }

            try
            {
                var tokenResp = await _ssoService.GetTokenAsync(code);
                if (tokenResp == null)
                {
                    _logger.LogWarning("Callback failed: tokenResp is null for code {Code}", code);
                    return Redirect($"{feUrl}?error=exchange_code_failed_null");
                }
                if (string.IsNullOrEmpty(tokenResp.AccessToken))
                {
                    _logger.LogWarning("Callback failed: AccessToken is null or empty for code {Code}", code);
                    return Redirect($"{feUrl}?error=exchange_code_failed_empty");
                }

                var userInfo = await _ssoService.GetUserInfoAsync(tokenResp.AccessToken);
                if (userInfo == null)
                {
                    return Redirect($"{feUrl}?error=get_user_info_failed");
                }

                var loginResp = await _userService.LoginByKeycloakSsoAsync(userInfo);

                // Truyền JWT và idToken (để sau này logout) về FE
                return Redirect($"{feUrl}?token={Uri.EscapeDataString(loginResp.Token ?? string.Empty)}&id_token={Uri.EscapeDataString(tokenResp.IdToken ?? string.Empty)}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Keycloak callback failed");
                return Redirect($"{feUrl}?error={Uri.EscapeDataString(ex.Message)}");
            }
        }

        // GET /api/SsoKeycloak/LogoutUrl?idTokenHint=...
        [HttpGet("LogoutUrl")]
        public IActionResult LogoutUrl([FromQuery] string idTokenHint)
        {
            if (string.IsNullOrEmpty(idTokenHint))
            {
                return Ok(new { url = AppSettings.SsoKeycloak.PostLogoutRedirectUri });
            }
            return Ok(new { url = _ssoService.BuildLogoutUrl(idTokenHint) });
        }
    }
}
