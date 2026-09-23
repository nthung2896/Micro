using Hinet.Api.Dto;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.EmailConfigsService;
using Hinet.Service.EmailConfigsService.Dto;
using Hinet.Service.EmailConfigsService.Request;
using Microsoft.AspNetCore.Mvc;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class EmailConfigsController : HinetController
    {
        private readonly IEmailConfigsService _service;
        private readonly ILogger<EmailConfigsController> _logger;

        public EmailConfigsController(IEmailConfigsService service, ILogger<EmailConfigsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách cấu hình email (có phân trang, filter)
        /// </summary>
        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<EmailConfigsDto>>> GetData([FromBody] EmailConfigsSearch search)
        {
            try
            {
                var data = await _service.GetData(search);
                return DataResponse<PagedList<EmailConfigsDto>>.Success(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách cấu hình email");
                return DataResponse<PagedList<EmailConfigsDto>>.False(ex.Message);
            }
        }

        /// <summary>
        /// Lấy chi tiết cấu hình email theo Id
        /// </summary>
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<EmailConfigsDto>> Get(Guid id)
        {
            try
            {
                var dto = await _service.GetDto(id);
                if (dto == null)
                    return DataResponse<EmailConfigsDto>.False("Không tìm thấy cấu hình email");
                return DataResponse<EmailConfigsDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy chi tiết cấu hình email {Id}", id);
                return DataResponse<EmailConfigsDto>.False(ex.Message);
            }
        }

        /// <summary>
        /// Tạo mới cấu hình email
        /// </summary>
        [HttpPost("Create")]
        public async Task<DataResponse<object>> Create([FromBody] EmailConfigsRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.From))
                    return DataResponse<object>.False("Email gửi không được để trống");

                var entity = new EmailConfigs
                {
                    From = request.From,
                    Host = request.Host,
                    Alias = request.Alias,
                    Port = request.Port,
                    UserName = request.UserName,
                    Password = request.Password,
                    EnableSsl = request.EnableSsl ?? true,
                    AllowSendMail = request.AllowSendMail ?? true,
                    DailyLimit = request.DailyLimit ?? 500,
                    SentToday = 0,
                    ConsecutiveFailures = 0,
                };

                await _service.CreateAsync(entity);
                return DataResponse<object>.Success(new { entity.Id }, "Tạo mới thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo cấu hình email");
                return DataResponse<object>.False(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật cấu hình email
        /// </summary>
        [HttpPut("Update")]
        public async Task<DataResponse<object>> Update([FromBody] EmailConfigsRequest request)
        {
            try
            {
                if (!request.Id.HasValue)
                    return DataResponse<object>.False("Id không được để trống");

                var entity = await _service.GetByIdOrThrowAsync(request.Id);
                var existingPassword = entity.Password;

                entity.From = request.From;
                entity.Host = request.Host;
                entity.Alias = request.Alias;
                entity.Port = request.Port;
                entity.UserName = request.UserName;
                entity.EnableSsl = request.EnableSsl;
                entity.AllowSendMail = request.AllowSendMail;
                entity.DailyLimit = request.DailyLimit;

                // Nếu admin để trống password → giữ password cũ
                if (!string.IsNullOrWhiteSpace(request.Password))
                    entity.Password = request.Password;
                else
                    entity.Password = existingPassword;

                // Re-enable: reset counter lỗi
                if (entity.AllowSendMail == true && (entity.ConsecutiveFailures ?? 0) > 0)
                {
                    entity.ConsecutiveFailures = 0;
                    entity.LastFailedAt = null;
                    entity.LastFailReason = null;
                }

                await _service.UpdateAsync(entity);
                return DataResponse<object>.Success(new { entity.Id }, "Cập nhật thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật cấu hình email");
                return DataResponse<object>.False(ex.Message);
            }
        }

        /// <summary>
        /// Xoá mềm cấu hình email
        /// </summary>
        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _service.GetByIdOrThrowAsync(id);
                await _service.DeleteAsync(entity);
                return DataResponse.Success(null, "Xoá thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xoá cấu hình email {Id}", id);
                return DataResponse.False(ex.Message);
            }
        }
    }
}
