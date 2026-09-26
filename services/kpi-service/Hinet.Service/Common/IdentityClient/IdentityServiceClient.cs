using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Hinet.Service.Common.IdentityClient
{
    public class BatchCreateUserItemDto
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Password { get; set; }
        public Guid? DepartmentId { get; set; }
        public List<string>? Roles { get; set; }
    }

    public class BatchCreateUsersRequestDto
    {
        public List<BatchCreateUserItemDto> Users { get; set; } = new();
        public string? DefaultPassword { get; set; } = "Password@123";
    }

    public class BatchCreateUserItemResultDto
    {
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public Guid? UserId { get; set; }
        public bool Success { get; set; }
        public string? Error { get; set; }
    }

    public class IdentityApiResponse<T>
    {
        public bool Status { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }

    public interface IIdentityServiceClient
    {
        Task<IdentityApiResponse<List<BatchCreateUserItemResultDto>>> BatchCreateUsersAsync(BatchCreateUsersRequestDto request);
    }

    public class IdentityServiceClient : IIdentityServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<IdentityServiceClient> _logger;
        private readonly string _baseUrl;

        public IdentityServiceClient(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<IdentityServiceClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _baseUrl = configuration["IdentityService:BaseUrl"] ?? "http://localhost:5001";
            if (!_baseUrl.EndsWith("/"))
            {
                _baseUrl += "/";
            }
        }

        public async Task<IdentityApiResponse<List<BatchCreateUserItemResultDto>>> BatchCreateUsersAsync(BatchCreateUsersRequestDto request)
        {
            var url = $"{_baseUrl}api/auth/users/batch-create";
            try
            {
                var payload = request.Users.Select(u => new
                {
                    UserName = u.UserName,
                    FullName = !string.IsNullOrWhiteSpace(u.FullName) ? u.FullName : u.UserName,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Password = !string.IsNullOrWhiteSpace(u.Password) ? u.Password : (request.DefaultPassword ?? "123456"),
                    IsActive = true,
                    RoleCodes = u.Roles != null && u.Roles.Count > 0 ? u.Roles : new List<string> { "ROLE_KPI", "USER" }
                }).ToList();

                var response = await _httpClient.PostAsJsonAsync(url, payload);
                
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<IdentityApiResponse<List<BatchCreateUserItemResultDto>>>(
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    return result ?? new IdentityApiResponse<List<BatchCreateUserItemResultDto>>
                    {
                        Status = false,
                        Message = "Empty response from Identity Service"
                    };
                }

                var errorText = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ [IdentityServiceClient] Failed to batch create users: HTTP {Code} - {Body}", response.StatusCode, errorText);

                return new IdentityApiResponse<List<BatchCreateUserItemResultDto>>
                {
                    Status = false,
                    Message = $"Identity Service returned HTTP {response.StatusCode}: {errorText}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [IdentityServiceClient] Exception calling {Url}: {Message}", url, ex.Message);
                return new IdentityApiResponse<List<BatchCreateUserItemResultDto>>
                {
                    Status = false,
                    Message = $"Lỗi kết nối tới Identity Service: {ex.Message}"
                };
            }
        }
    }
}
