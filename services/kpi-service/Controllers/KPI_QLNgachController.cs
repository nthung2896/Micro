using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_QLNgachService;
using Hinet.Service.KPI_QLNgachService.Dto;
using Hinet.Service.KPI_QLNgachService.Request;
using Hinet.Service.Common;
using Hinet.Api.Filter;
using Hinet.Web.Common;
using Hinet.Api.Dto;
using Hinet.Service.Dto;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_QLNgachController : HinetController
    {

        private readonly IKPI_QLNgachService _KPI_QLNgachService;
        private readonly ILogger<KPI_QLNgachController> _logger;
        private readonly IMapper _mapper;

        public KPI_QLNgachController(
                IKPI_QLNgachService KPI_QLNgachService,
                IMapper mapper,
                ILogger<KPI_QLNgachController> logger
            )
        {
            _logger = logger;
            this._KPI_QLNgachService = KPI_QLNgachService;
            this._mapper = mapper;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_QLNgach>> Create([FromBody] KPI_QLNgachRequest model)
        {
            try
            {
                var entity = _mapper.Map<KPI_QLNgachRequest, KPI_QLNgach>(model);
                await _KPI_QLNgachService.CreateAsync(entity);
                return DataResponse<KPI_QLNgach>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_QLNgach");
                return DataResponse<KPI_QLNgach>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_QLNgach>> Update([FromBody] KPI_QLNgachRequest model)
        {
            try
            {
                var entity = await _KPI_QLNgachService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_QLNgach>.False("KPI_QLNgach không tồn tại");

                entity = _mapper.Map(model, entity);
                await _KPI_QLNgachService.UpdateAsync(entity);
                return DataResponse<KPI_QLNgach>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_QLNgach với Id: {Id}", model.Id);
                return new DataResponse<KPI_QLNgach>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_QLNgachDto>> Get(Guid id)
        {
            var dto = await _KPI_QLNgachService.GetDto(id);
            return DataResponse<KPI_QLNgachDto>.Success(dto);
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<KPI_QLNgachDto>>> GetData([FromBody] KPI_QLNgachSearch search)
        {
            var data = await _KPI_QLNgachService.GetData(search);
            return DataResponse<PagedList<KPI_QLNgachDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _KPI_QLNgachService.GetByIdAsync(id);
                await _KPI_QLNgachService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_QLNgach với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }
    }
}
