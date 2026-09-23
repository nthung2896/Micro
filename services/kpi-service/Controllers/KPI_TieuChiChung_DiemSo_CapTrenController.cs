using Hinet.Api.Dto;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService;
using Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.Dto;
using Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_TieuChiChung_DiemSo_CapTrenController : HinetController
    {
        private readonly IKPI_TieuChiChung_DiemSo_CapTrenService _service;
        private readonly ILogger<KPI_TieuChiChung_DiemSo_CapTrenController> _logger;

        public KPI_TieuChiChung_DiemSo_CapTrenController(
            IKPI_TieuChiChung_DiemSo_CapTrenService service,
            ILogger<KPI_TieuChiChung_DiemSo_CapTrenController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_TieuChiChung_DiemSo_CapTren>> Create([FromBody] KPI_TieuChiChung_DiemSo_CapTrenCreateVM model)
        {
            try
            {
                if (model == null || model.Id_TieuChiChung_DiemSo == Guid.Empty)
                {
                    return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.False("Dòng điểm cá nhân không hợp lệ.");
                }
                if (!await _service.CanEditPersonalScore(model.Id_TieuChiChung_DiemSo, UserId))
                {
                    return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.False("Bạn không phải Phó Trưởng phòng đang được giao xử lý phiếu này.");
                }

                var entity = new KPI_TieuChiChung_DiemSo_CapTren
                {
                    Id_TieuChiChung_DiemSo = model.Id_TieuChiChung_DiemSo,
                    Id_PhieuDanhGia = model.IdPhieuDanhGia,
                    Id_LyLich = model.IdLyLich,
                    Id_DotDanhGia = model.IdDotDanhGia,
                    VaiTroDanhGia = model.VaiTroDanhGia,
                    Diem = model.Diem,
                    GhiChu = model.GhiChu,
                };
                await _service.CreateAsync(entity);
                return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo điểm tiêu chí chung cấp trên");
                return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.False(ex.Message);
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_TieuChiChung_DiemSo_CapTren>> Update([FromBody] KPI_TieuChiChung_DiemSo_CapTrenEditVM model)
        {
            try
            {
                if (model?.Id is null || model.Id == Guid.Empty)
                {
                    return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.False("ID điểm cấp trên không hợp lệ.");
                }

                var entity = await _service.GetByIdAsync(model.Id);
                if (entity == null)
                {
                    return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.False("Điểm tiêu chí chung cấp trên không tồn tại.");
                }
                if (!await _service.CanEditRecord(entity.Id, UserId))
                {
                    return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.False("Bạn không phải Phó Trưởng phòng đang được giao xử lý phiếu này.");
                }

                entity.Id_TieuChiChung_DiemSo = model.Id_TieuChiChung_DiemSo;
                if (model.IdPhieuDanhGia.HasValue) entity.Id_PhieuDanhGia = model.IdPhieuDanhGia;
                if (model.IdLyLich.HasValue) entity.Id_LyLich = model.IdLyLich;
                if (model.IdDotDanhGia.HasValue) entity.Id_DotDanhGia = model.IdDotDanhGia;
                entity.VaiTroDanhGia = model.VaiTroDanhGia;
                entity.Diem = model.Diem;
                entity.GhiChu = model.GhiChu;
                await _service.UpdateAsync(entity);
                return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật điểm tiêu chí chung cấp trên với Id: {Id}", model?.Id);
                return DataResponse<KPI_TieuChiChung_DiemSo_CapTren>.False(ex.Message);
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_TieuChiChung_DiemSo_CapTrenDto>> Get(Guid id)
        {
            var data = await _service.GetDto(id);
            return data == null
                ? DataResponse<KPI_TieuChiChung_DiemSo_CapTrenDto>.False("Điểm tiêu chí chung cấp trên không tồn tại.")
                : DataResponse<KPI_TieuChiChung_DiemSo_CapTrenDto>.Success(data);
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<KPI_TieuChiChung_DiemSo_CapTrenDto>>> GetData([FromBody] KPI_TieuChiChung_DiemSo_CapTrenSearch search)
        {
            var data = await _service.GetData(search);
            return DataResponse<PagedList<KPI_TieuChiChung_DiemSo_CapTrenDto>>.Success(data);
        }

        [HttpGet("GetByPhieu/{idPhieu}")]
        public async Task<DataResponse<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse>> GetByPhieu(Guid idPhieu)
        {
            try
            {
                var data = await _service.GetByPhieu(idPhieu, UserId);
                return DataResponse<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse>.Success(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy điểm PTP theo phiếu {IdPhieu}", idPhieu);
                return DataResponse<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse>.False(ex.Message);
            }
        }

        [HttpPost("SaveBatch")]
        public async Task<DataResponse> SaveBatch([FromBody] KPI_TieuChiChung_DiemSo_CapTrenSaveBatchVM request)
        {
            try
            {
                await _service.SaveBatch(request, UserId);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu batch điểm PTP cho phiếu {IdPhieu}", request?.IdPhieuDanhGia);
                return DataResponse.False(ex.Message);
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _service.GetByIdAsync(id);
                if (entity == null)
                {
                    return DataResponse.False("Điểm tiêu chí chung cấp trên không tồn tại.");
                }
                if (!await _service.CanEditRecord(entity.Id, UserId))
                {
                    return DataResponse.False("Bạn không phải Phó Trưởng phòng đang được giao xử lý phiếu này.");
                }

                await _service.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa điểm tiêu chí chung cấp trên với Id: {Id}", id);
                return DataResponse.False(ex.Message);
            }
        }
    }
}
