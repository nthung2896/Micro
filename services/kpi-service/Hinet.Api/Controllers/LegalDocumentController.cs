using Hinet.Api.Dto;
using Hinet.Controllers;
using Hinet.Service.Common;
using Hinet.Service.LegalDocumentService;
using Hinet.Service.LegalDocumentService.Dto;
using Hinet.Service.LegalDocumentService.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Hinet.Api.Controllers
{
    [Route("api/[controller]")]
    public class LegalDocumentController : HinetController
    {
        private readonly ILegalDocumentService _service;
        private readonly ILogger<LegalDocumentController> _logger;

        public LegalDocumentController(ILegalDocumentService service, ILogger<LegalDocumentController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách văn bản pháp lý (có phân trang, filter)
        /// </summary>
        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<LegalDocumentDto>>> GetData([FromBody] LegalDocumentSearch search)
        {
            try
            {
                var data = await _service.GetData(search);
                return DataResponse<PagedList<LegalDocumentDto>>.Success(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách văn bản pháp lý");
                return DataResponse<PagedList<LegalDocumentDto>>.False(ex.Message);
            }
        }

        /// <summary>
        /// Lấy danh sách văn bản pháp lý cho public portal (không yêu cầu đăng nhập)
        /// </summary>
        [AllowAnonymous]
        [HttpPost("GetPublicData")]
        public async Task<DataResponse<PagedList<LegalDocumentDto>>> GetPublicData([FromBody] LegalDocumentSearch search)
        {
            try
            {
                search.Status = "Approved";
                var data = await _service.GetData(search);
                return DataResponse<PagedList<LegalDocumentDto>>.Success(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách văn bản pháp lý public");
                return DataResponse<PagedList<LegalDocumentDto>>.False(ex.Message);
            }
        }

        /// <summary>
        /// Lấy chi tiết văn bản pháp lý
        /// </summary>
        [HttpGet("Get/{id}")]
        public async Task<DataResponse<LegalDocumentDto>> Get(Guid id)
        {
            try
            {
                var dto = await _service.GetDto(id);
                return DataResponse<LegalDocumentDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy chi tiết văn bản {Id}", id);
                return DataResponse<LegalDocumentDto>.False(ex.Message);
            }
        }

        /// <summary>
        /// Tạo mới văn bản pháp lý
        /// </summary>
        [HttpPost("Create")]
        public async Task<DataResponse<object>> Create([FromBody] LegalDocumentCreateRequest request)
        {
            try
            {
                var entity = await _service.Create(request);
                return DataResponse<object>.Success(new { entity.Id }, "Tạo mới thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo mới văn bản pháp lý");
                return DataResponse<object>.False(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật văn bản pháp lý
        /// </summary>
        [HttpPost("Update")]
        public async Task<DataResponse<object>> Update([FromBody] LegalDocumentCreateRequest request)
        {
            try
            {
                var entity = await _service.Update(request);
                return DataResponse<object>.Success(new { entity.Id }, "Cập nhật thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật văn bản pháp lý");
                return DataResponse<object>.False(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật trạng thái (Draft, Approved, Removed)
        /// </summary>
        [HttpPut("UpdateStatus/{id}/{status}")]
        public async Task<DataResponse> UpdateStatus(Guid id, string status)
        {
            try
            {
                await _service.UpdateStatus(id, status);
                return DataResponse.Success(null, "Cập nhật trạng thái thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật trạng thái văn bản {Id}", id);
                return DataResponse.False(ex.Message);
            }
        }

        /// <summary>
        /// Cập nhật trạng thái nhiều văn bản pháp lý
        /// </summary>
        [HttpPut("UpdateStatusMultiple")]
        public async Task<DataResponse> UpdateStatusMultiple([FromBody] UpdateStatusMultipleRequest request)
        {
            try
            {
                await _service.UpdateStatusMultiple(request.Ids, request.Status);
                return DataResponse.Success(null, "Cập nhật trạng thái thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật trạng thái hàng loạt");
                return DataResponse.False(ex.Message);
            }
        }

    public class UpdateStatusMultipleRequest
    {
        public List<Guid> Ids { get; set; } = new List<Guid>();
        public string Status { get; set; } = "";
    }

        /// <summary>
        /// Xoá mềm văn bản pháp lý
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
                _logger.LogError(ex, "Lỗi khi xoá văn bản {Id}", id);
                return DataResponse.False(ex.Message);
            }
        }
    }
}
