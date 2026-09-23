using Hinet.Api.Dto;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.EmailTemplatesService;
using Hinet.Service.EmailTemplatesService.Dto;
using Hinet.Service.EmailTemplatesService.Request;
using Microsoft.AspNetCore.Mvc;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class EmailTemplatesController : HinetController
    {
        private readonly IEmailTemplatesService _service;
        private readonly ILogger<EmailTemplatesController> _logger;

        public EmailTemplatesController(IEmailTemplatesService service, ILogger<EmailTemplatesController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách mẫu email (có phân trang, filter)
        /// </summary>
        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<EmailTemplatesDto>>> GetData([FromBody] EmailTemplatesSearch search)
        {
            try
            {
                var data = await _service.GetData(search);
                return DataResponse<PagedList<EmailTemplatesDto>>.Success(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách mẫu email");
                return DataResponse<PagedList<EmailTemplatesDto>>.False(ex.Message);
            }
        }

        /// <summary>
        /// Lấy chi tiết mẫu email theo Id
        /// </summary>
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<EmailTemplatesDto>> Get(Guid id)
        {
            try
            {
                var dto = await _service.GetDto(id);
                if (dto == null)
                    return DataResponse<EmailTemplatesDto>.False("Không tìm thấy mẫu email");
                return DataResponse<EmailTemplatesDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy chi tiết mẫu email {Id}", id);
                return DataResponse<EmailTemplatesDto>.False(ex.Message);
            }
        }

        /// <summary>
        /// Tạo mới mẫu email
        /// </summary>
        [HttpPost("Create")]
        public async Task<DataResponse<object>> Create([FromBody] EmailTemplatesRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Code))
                    return DataResponse<object>.False("Mã template không được để trống");

                var normalizedCode = request.Code.Trim().ToUpper();

                // Kiểm tra trùng code (so sánh upper-case để tránh duplicate)
                var exists = await _service.AnyAsync(x => x.Code == normalizedCode);
                if (exists)
                    return DataResponse<object>.False($"Mã template '{request.Code}' đã tồn tại");

                var entity = new EmailTemplates
                {
                    Code = normalizedCode,
                    Subject = request.Subject,
                    Body = request.Body,
                    BodyType = request.BodyType ?? "html",
                    Variables = request.Variables,
                    Description = request.Description,
                    IsActive = request.IsActive,
                };

                await _service.CreateAsync(entity);
                return DataResponse<object>.Success(new { entity.Id }, "Tạo mới thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo mẫu email");
                return DataResponse<object>.False(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật mẫu email
        /// </summary>
        [HttpPut("Update")]
        public async Task<DataResponse<object>> Update([FromBody] EmailTemplatesRequest request)
        {
            try
            {
                if (!request.Id.HasValue)
                    return DataResponse<object>.False("Id không được để trống");

                var entity = await _service.GetByIdOrThrowAsync(request.Id);

                var normalizedCode = request.Code.Trim().ToUpper();

                // Kiểm tra trùng code (trừ chính nó, so sánh upper-case)
                var exists = await _service.AnyAsync(x => x.Code == normalizedCode && x.Id != request.Id);
                if (exists)
                    return DataResponse<object>.False($"Mã template '{request.Code}' đã tồn tại");

                entity.Code = normalizedCode;
                entity.Subject = request.Subject;
                entity.Body = request.Body;
                entity.BodyType = request.BodyType ?? "html";
                entity.Variables = request.Variables;
                entity.Description = request.Description;
                entity.IsActive = request.IsActive;

                await _service.UpdateAsync(entity);
                return DataResponse<object>.Success(new { entity.Id }, "Cập nhật thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật mẫu email");
                return DataResponse<object>.False(ex.Message);
            }
        }

        /// <summary>
        /// Xoá mềm mẫu email
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
                _logger.LogError(ex, "Lỗi khi xoá mẫu email {Id}", id);
                return DataResponse.False(ex.Message);
            }
        }

        /// <summary>
        /// Gửi email động theo template + dữ liệu
        /// </summary>
        [HttpPost("SendDynamicEmail")]
        public async Task<DataResponse> SendDynamicEmail([FromBody] SendDynamicEmailRequest request)
        {
            try
            {
                var ok = await _service.SendDynamicEmailAsync(request);
                if (!ok)
                    return DataResponse.False("Gửi email thất bại. Kiểm tra template, cấu hình SMTP và trạng thái AllowSendMail.");

                return DataResponse.Success(null, $"Đã gửi email tới {request.ToEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi gửi email động");
                return DataResponse.False(ex.Message);
            }
        }

        /// <summary>
        /// Gửi email theo mã template (code) — tiện hơn dùng Id
        /// </summary>
        [HttpPost("SendByCode")]
        public async Task<DataResponse> SendByCode([FromBody] SendEmailByCodeRequest request)
        {
            try
            {
                var ok = await _service.SendByCodeAsync(request);
                if (!ok)
                    return DataResponse.False("Gửi email thất bại. Kiểm tra mã template, cấu hình SMTP và trạng thái.");

                return DataResponse.Success(null, $"Đã gửi email tới {request.ToEmail} (template: {request.Code})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi gửi email theo code {Code}", request.Code);
                return DataResponse.False(ex.Message);
            }
        }
    }
}
