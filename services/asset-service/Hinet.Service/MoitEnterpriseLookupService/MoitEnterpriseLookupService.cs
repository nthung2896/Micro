using Hinet.Extensions;
using Hinet.Service.MoitEnterpriseLookupService.Dto;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Xml.Serialization;

namespace Hinet.Service.MoitEnterpriseLookupService
{
    public class MoitEnterpriseLookupService : IMoitEnterpriseLookupService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<MoitEnterpriseLookupService> _logger;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true,
        };

        public MoitEnterpriseLookupService(IHttpClientFactory httpClientFactory, ILogger<MoitEnterpriseLookupService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<string?> LoginAndGetTokenAsync()
        {
            var cfg = AppSettings.MoitEnterpriseLookup;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/ad/dvcqg175/mapi/login";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(30);

                var requestData = new MoitLookupLoginRequest
                {
                    Username = cfg.Username,
                    Password = cfg.Password
                };

                // Serialize XML
                var serializer = new XmlSerializer(typeof(MoitLookupLoginRequest));
                using var writer = new StringWriter();
                serializer.Serialize(writer, requestData);
                var xmlContent = writer.ToString();

                var bodyContent = new StringContent(xmlContent, Encoding.UTF8, "application/xml");

                // Cần set Header Accept và Content-Type là application/xml
                http.DefaultRequestHeaders.Accept.Clear();
                http.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/xml"));

                var response = await http.PostAsync(url, bodyContent);
                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("BCT Lookup Login failed: {Status}, Error: {Error}", response.StatusCode, err);
                    return null;
                }

                var xmlResponse = await response.Content.ReadAsStringAsync();

                // Deserialize XML
                var responseSerializer = new XmlSerializer(typeof(MoitLookupLoginResponse));
                using var reader = new StringReader(xmlResponse);
                var loginResponse = (MoitLookupLoginResponse)responseSerializer.Deserialize(reader);

                if (loginResponse?.ErrorCode == 0)
                {
                    return loginResponse.Token;
                }

                _logger.LogWarning("BCT Lookup Login ErrorCode: {Code}, Message: {Msg}", loginResponse?.ErrorCode, loginResponse?.Message);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "BCT Lookup Login Exception");
                return null;
            }
        }

        public async Task<MoitEnterpriseDetail?> LookupEnterpriseAsync(string msdn)
        {
            if (string.IsNullOrWhiteSpace(msdn)) return null;

            var token = await LoginAndGetTokenAsync();
            if (string.IsNullOrEmpty(token)) return null;

            var cfg = AppSettings.MoitEnterpriseLookup;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/reusendap/officers/reuse/BTC-DKKD-FLOW/--lookup";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(30);
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var payload = new { msdn = msdn };
                var bodyContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var response = await http.PostAsync(url, bodyContent);
                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("BCT Lookup Enterprise failed: {Status}, Error: {Error}", response.StatusCode, err);
                    return null;
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<MoitLookupResponse>(jsonResponse, JsonOpts);

                if (result?.Data?.Status == 1 && result.Data.Data != null)
                {
                    return result.Data.Data;
                }

                _logger.LogWarning("BCT Lookup Enterprise status is not success or empty. Msg: {Msg}", result?.Message);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "BCT Lookup Enterprise Exception for msdn: {Msdn}", msdn);
                return null;
            }
        }
    }
}
