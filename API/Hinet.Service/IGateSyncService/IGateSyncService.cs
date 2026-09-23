using Hinet.Extensions;
using Hinet.Service.IGateSyncService.Dto;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace Hinet.Service.IGateSyncService
{
    public class IGateSyncService : IIGateSyncService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<IGateSyncService> _logger;

        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true,
        };

        public IGateSyncService(IHttpClientFactory httpClientFactory, ILogger<IGateSyncService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<string?> GetConnectorTokenAsync()
        {
            var cfg = AppSettings.IGateSync;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/connector/connector/v1/login";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(30);

                var payload = new
                {
                    client_id = cfg.ClientId,
                    client_secret = cfg.ClientSecret
                };

                var bodyContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await http.PostAsync(url, bodyContent);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("iGate Token fetch failed: {Status}, Error: {Error}", response.StatusCode, error);
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                var tokenData = JsonSerializer.Deserialize<IGateTokenResponse>(json, JsonOpts);
                return tokenData?.AccessToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "iGate Token fetch error on {Url}", url);
                return null;
            }
        }

        public async Task<List<IGateDossierItem>?> SyncNewDossiersAsync(string? maTthc = null)
        {
            var token = await GetConnectorTokenAsync();
            if (string.IsNullOrEmpty(token)) return null;

            var cfg = AppSettings.IGateSync;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/connector/connector/v1/laydanhsachhoso";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(30);
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var payload = new
                {
                    TrangThaiHoSo = "",
                    MaTTHC = maTthc ?? cfg.MaTTHC,
                    HinhThucTiepNhan = ""
                };

                var bodyContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await http.PostAsync(url, bodyContent);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("iGate laydanhsachhoso failed: {Status}, Error: {Error}", response.StatusCode, error);
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<List<IGateDossierItem>>(json, JsonOpts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "iGate laydanhsachhoso exception");
                return null;
            }
        }

        public async Task<bool> ConfirmDossierReceivedAsync(string maHoSo, int trangThaiNhan = 1)
        {
            var token = await GetConnectorTokenAsync();
            if (string.IsNullOrEmpty(token)) return false;

            var cfg = AppSettings.IGateSync;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/connector/connector/v1/hoso/xacnhantrangthainhan";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(30);
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var payload = new[]
                {
                    new { MaHoSo = maHoSo, TrangThaiNhanHoSo = trangThaiNhan }
                };

                var bodyContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await http.PostAsync(url, bodyContent);

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "iGate ConfirmDossierReceivedAsync error for {MaHoSo}", maHoSo);
                return false;
            }
        }

        public async Task<string?> UploadAttachmentAsync(string maHoSo, string fileName, Stream fileStream)
        {
            var token = await GetConnectorTokenAsync();
            if (string.IsNullOrEmpty(token)) return null;

            var cfg = AppSettings.IGateSync;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/fi/v1/file/upload";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(60);
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                using var form = new MultipartFormDataContent();
                using var streamContent = new StreamContent(fileStream);
                streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
                form.Add(streamContent, "file", fileName);
                form.Add(new StringContent(maHoSo), "maHoSo");

                var response = await http.PostAsync(url, form);
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("iGate File Upload failed: {Status}, Error: {Error}", response.StatusCode, error);
                    return null;
                }

                var responseString = await response.Content.ReadAsStringAsync();
                return responseString; // Trả về ID file đính kèm
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "iGate File Upload exception");
                return null;
            }
        }

        public async Task<Stream?> DownloadAttachmentAsync(string fileId, string maHoSo)
        {
            var token = await GetConnectorTokenAsync();
            if (string.IsNullOrEmpty(token)) return null;

            var cfg = AppSettings.IGateSync;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/fi/file/download/{fileId}?maHoSo={maHoSo}";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(60);
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var response = await http.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsStreamAsync();
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "iGate DownloadAttachment error for file {FileId}", fileId);
                return null;
            }
        }

        public async Task<bool> UpdateProcessProgressAsync(List<DossierProgressDto> progresses)
        {
            var token = await GetConnectorTokenAsync();
            if (string.IsNullOrEmpty(token)) return false;

            var cfg = AppSettings.IGateSync;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/connector/connector/v1/hoso/capnhatientrinh";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(30);
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var bodyContent = new StringContent(JsonSerializer.Serialize(progresses), Encoding.UTF8, "application/json");
                var response = await http.PostAsync(url, bodyContent);

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "iGate UpdateProcessProgressAsync exception");
                return false;
            }
        }

        public async Task<bool> UpdateDossierStatusAsync(string maHoSo, int trangThai)
        {
            var token = await GetConnectorTokenAsync();
            if (string.IsNullOrEmpty(token)) return false;

            var cfg = AppSettings.IGateSync;
            var url = $"{cfg.BaseUrl.TrimEnd('/')}/connector/connector/v1/hoso/capnhattrangthai";

            try
            {
                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(30);
                http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

                var payload = new[]
                {
                    new { MaHoSo = maHoSo, TrangThai = trangThai }
                };

                var bodyContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await http.PostAsync(url, bodyContent);

                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "iGate UpdateDossierStatusAsync exception for {MaHoSo}", maHoSo);
                return false;
            }
        }
    }
}
