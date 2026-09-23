using Hinet.Extensions;
using Hinet.Service.SsoKeycloakService.Dto;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Hinet.Service.SsoKeycloakService
{
    public class SsoKeycloakService : ISsoKeycloakService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<SsoKeycloakService> _logger;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true,
        };

        public SsoKeycloakService(IHttpClientFactory httpClientFactory, ILogger<SsoKeycloakService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public string BuildLoginUrl()
        {
            var cfg = AppSettings.SsoKeycloak;
            return $"{cfg.Authority}/protocol/openid-connect/auth"
                + $"?response_type=code"
                + $"&client_id={Uri.EscapeDataString(cfg.ClientId)}"
                + $"&scope=openid%20email%20profile"
                + $"&redirect_uri={Uri.EscapeDataString(cfg.RedirectUri)}"
                + $"&prompt=login";
        }

        public string BuildLogoutUrl(string idTokenHint)
        {
            var cfg = AppSettings.SsoKeycloak;
            return $"{cfg.Authority}/protocol/openid-connect/logout"
                + $"?post_logout_redirect_uri={Uri.EscapeDataString(cfg.PostLogoutRedirectUri)}"
                + $"&id_token_hint={Uri.EscapeDataString(idTokenHint)}"
                + $"&client_id={Uri.EscapeDataString(cfg.ClientId)}";
        }

        public async Task<KeycloakTokenResponse?> GetTokenAsync(string code)
        {
            var cfg = AppSettings.SsoKeycloak;
            var url = $"{cfg.Authority}/protocol/openid-connect/token";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(30);

                var fields = new Dictionary<string, string>
                {
                    { "grant_type", "authorization_code" },
                    { "client_id", cfg.ClientId },
                    { "client_secret", cfg.ClientSecret },
                    { "code", code },
                    { "redirect_uri", cfg.RedirectUri }
                };

                using var content = new FormUrlEncodedContent(fields);
                var response = await http.PostAsync(url, content);
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Keycloak GetToken failed. Status: {Status}, Error: {Error}", response.StatusCode, errorBody);
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<KeycloakTokenResponse>(json, JsonOpts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Keycloak GetToken error on url {Url}", url);
                return null;
            }
        }

        public async Task<KeycloakUserInfo?> GetUserInfoAsync(string accessToken)
        {
            var cfg = AppSettings.SsoKeycloak;
            var url = $"{cfg.Authority}/protocol/openid-connect/userinfo";
           
            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(50);
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

                var response = await http.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Keycloak GetUserInfo failed. Status: {Status}, Error: {Error}", response.StatusCode, errorBody);
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Keycloak GetUserInfo raw response: {Json}", json);

                try
                {
                    return JsonSerializer.Deserialize<KeycloakUserInfo>(json, JsonOpts);
                }
                catch (JsonException ex)
                {
                    _logger.LogWarning(ex, "Keycloak GetUserInfo deserialization failed. Raw JSON: {Json}", json);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Keycloak GetUserInfo error on url {Url}", url);
                return null;
            }
        }
    }
}
