using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Api.Dto;
using Hinet.Api.Filter;
using Hinet.Api.Request.Import;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Core.Mapper;
using Hinet.Service.Dto;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using Hinet.Service.KPI_PhieuDanhGiaTapTheService;
using Hinet.Service.KPI_PhieuDanhGiaTapTheService.Dto;
using Hinet.Service.KPI_PhieuDanhGiaTapTheService.ViewModels;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Web.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_PhieuDanhGiaTapTheController : HinetController
    {
        private readonly IKPI_PhieuDanhGiaTapTheService _kPI_PhieuDanhGiaTapTheService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_PhieuDanhGiaTapTheController> _logger;

        public KPI_PhieuDanhGiaTapTheController(
            IKPI_PhieuDanhGiaTapTheService kPI_PhieuDanhGiaTapTheService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_PhieuDanhGiaTapTheController> logger
            )
        {
            _kPI_PhieuDanhGiaTapTheService = kPI_PhieuDanhGiaTapTheService;
            _taiLieuDinhKemService = taiLieuDinhKemService;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_PhieuDanhGiaTapThe>> Create([FromBody] KPI_PhieuDanhGiaTapTheCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_PhieuDanhGiaTapTheCreateVM, KPI_PhieuDanhGiaTapThe>(model);
                await _kPI_PhieuDanhGiaTapTheService.CreateAsync(entity);
                return DataResponse<KPI_PhieuDanhGiaTapThe>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_PhieuDanhGiaTapThe");
                return DataResponse<KPI_PhieuDanhGiaTapThe>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }

        [HttpPost("InitPhieuDanhGiaTapThe")]
        public async Task<DataResponse<Guid>> InitPhieuDanhGiaTapThe(
            [FromQuery] Guid idDotDanhGia,
            [FromQuery] Guid donViId,
            [FromQuery] Guid? phongBanId = null)
        {
            try
            {
                var phieuId = await _kPI_PhieuDanhGiaTapTheService.InitPhieuDanhGiaTapThe(idDotDanhGia, donViId, phongBanId, UserId);
                return DataResponse<Guid>.Success(phieuId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi InitPhieuDanhGiaTapThe");
                return DataResponse<Guid>.False("Đã xảy ra lỗi khi khởi tạo phiếu đánh giá tập thể.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_PhieuDanhGiaTapThe>> Update([FromBody] KPI_PhieuDanhGiaTapTheEditVM model)
        {
            try
            {
                var entity = await _kPI_PhieuDanhGiaTapTheService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_PhieuDanhGiaTapThe>.False("KPI_PhieuDanhGiaTapThe không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_PhieuDanhGiaTapTheService.UpdateAsync(entity);
                return DataResponse<KPI_PhieuDanhGiaTapThe>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_PhieuDanhGiaTapThe với Id: {Id}", model.Id);
                return DataResponse<KPI_PhieuDanhGiaTapThe>.False("Đã xảy ra lỗi khi cập nhật dữ liệu.");
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_PhieuDanhGiaTapTheDto>> Get(Guid id)
        {
            var dto = await _kPI_PhieuDanhGiaTapTheService.GetDto(id);
            return DataResponse<KPI_PhieuDanhGiaTapTheDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_PhieuDanhGiaTapTheDto>>> GetData([FromBody] KPI_PhieuDanhGiaTapTheSearch search)
        {
            var data = await _kPI_PhieuDanhGiaTapTheService.GetData(search);
            return DataResponse<PagedList<KPI_PhieuDanhGiaTapTheDto>>.Success(data);
        }

        [HttpPost("GetDotDanhGiaWithPhieu/{userId}")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<DotDanhGiaWithPhieuTapTheDto>>> GetDotDanhGiaWithPhieu(Guid userId, [FromBody] KPI_PhieuDanhGiaTapTheSearch search)
        {
            var currentUserId = UserId ?? userId;
            var data = await _kPI_PhieuDanhGiaTapTheService.GetDotDanhGiaWithPhieu(currentUserId, search);
            return DataResponse<PagedList<DotDanhGiaWithPhieuTapTheDto>>.Success(data);
        }

        [HttpPost("GetDanhSachDonViDanhGia/{userId}")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<DotDanhGiaWithPhieuTapTheDto>>> GetDanhSachDonViDanhGia(Guid userId, [FromBody] KPI_PhieuDanhGiaTapTheSearch search)
        {
            var currentUserId = UserId ?? userId;
            var data = await _kPI_PhieuDanhGiaTapTheService.GetDanhSachDonViDanhGia(currentUserId, search);
            return DataResponse<PagedList<DotDanhGiaWithPhieuTapTheDto>>.Success(data);
        }

        [HttpPost("GetTabCounts/{userId}")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<KPI_PhieuDanhGiaTapTheTabCountDto>> GetTabCounts(Guid userId, [FromBody] KPI_PhieuDanhGiaTapTheSearch search)
        {
            var currentUserId = UserId ?? userId;
            var data = await _kPI_PhieuDanhGiaTapTheService.GetTabCounts(currentUserId, search);
            return DataResponse<KPI_PhieuDanhGiaTapTheTabCountDto>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_PhieuDanhGiaTapTheService.GetByIdAsync(id);
                if (entity == null) return DataResponse.False("Dữ liệu không tồn tại.");
                await _kPI_PhieuDanhGiaTapTheService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_PhieuDanhGiaTapThe với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpPost("ChuyenBuocLuong")]
        public async Task<DataResponse> ChuyenBuocLuong([FromBody] ChuyenBuocLuongRequest request)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaTapTheService.ChuyenBuocLuong(request);
                return DataResponse.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chuyển bước luồng phiếu đánh giá tập thể");
                return DataResponse.False(ex.Message);
            }
        }

        [HttpPost("ThuHoiPhieu")]
        public async Task<DataResponse> ThuHoiPhieu([FromBody] ThuHoiPhieuRequest request)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaTapTheService.ThuHoiPhieu(request);
                return DataResponse.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thu hồi phiếu đánh giá tập thể");
                return DataResponse.False(ex.Message);
            }
        }

        [HttpGet("GetNguoiXuLy/{idPhieuDanhGia}/{chucVuNguoiXuLy}")]
        public async Task<DataResponse<List<NguoiXuLyDto>>> GetNguoiXuLy(Guid idPhieuDanhGia, string chucVuNguoiXuLy)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaTapTheService.GetNguoiXuLyTheoChucVu(idPhieuDanhGia, chucVuNguoiXuLy);
                return DataResponse<List<NguoiXuLyDto>>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách người xử lý cho phiếu tập thể");
                return DataResponse<List<NguoiXuLyDto>>.False("Đã xảy ra lỗi khi lấy danh sách người xử lý.");
            }
        }

        [HttpGet("CheckQuyenChamDiem")]
        public async Task<DataResponse<CheckQuyenChamDiemDto>> CheckQuyenChamDiem(
            [FromQuery] Guid? idPhieuDanhGia,
            [FromQuery] Guid? donViId,
            [FromQuery] Guid? idDotDanhGia)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaTapTheService.CheckQuyenChamDiem(idPhieuDanhGia, donViId, idDotDanhGia, UserId);
                return DataResponse<CheckQuyenChamDiemDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra quyền chấm điểm phiếu tập thể");
                return DataResponse<CheckQuyenChamDiemDto>.False("Lỗi khi kiểm tra quyền chấm điểm");
            }
        }

        [HttpGet("GetTreeDataForTapThe")]
        public async Task<DataResponse<List<KPI_TieuChiTapTheTreeDto>>> GetTreeDataForTapThe(
            [FromQuery] Guid idDot,
            [FromQuery] Guid? idPhieu,
            [FromQuery] Guid? idDonVi)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaTapTheService.GetTreeDataForTapThe(idDot, idPhieu, idDonVi);
                return DataResponse<List<KPI_TieuChiTapTheTreeDto>>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy cây tiêu chí tập thể");
                return DataResponse<List<KPI_TieuChiTapTheTreeDto>>.False("Lỗi khi lấy cây tiêu chí tập thể: " + ex.Message);
            }
        }

        [HttpPost("SaveScoresTapThe")]
        public async Task<DataResponse> SaveScoresTapThe([FromBody] SaveScoresTapTheVM model)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaTapTheService.SaveScoresTapThe(model, UserId ?? Guid.Empty);
                if (result)
                {
                    return DataResponse.Success("Lưu đánh giá thành công.");
                }
                return DataResponse.False("Lưu đánh giá thất bại.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu điểm đánh giá tập thể");
                return DataResponse.False("Lỗi khi lưu điểm đánh giá: " + ex.Message);
            }
        }


        [HttpGet("GetDropdowns")]
        public async Task<DataResponse<Dictionary<string, List<DropdownOption>>>> GetDropdowns([FromQuery] string[] types)
        {
            var result = new Dictionary<string, List<DropdownOption>>()
            {
            };

            return DataResponse<Dictionary<string, List<DropdownOption>>>.Success(result);
        }

        [HttpGet("export")]
        public async Task<DataResponse> ExportExcel()
        {
            try
            {
                var search = new KPI_PhieuDanhGiaTapTheSearch();
                var data = await _kPI_PhieuDanhGiaTapTheService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_PhieuDanhGiaTapTheDto>(data?.Items);
                if (string.IsNullOrEmpty(base64Excel))
                {
                    return DataResponse.False("Kết xuất thất bại hoặc dữ liệu trống");
                }
                return DataResponse.Success(base64Excel);
            }
            catch (Exception)
            {
                return DataResponse.False("Kết xuất thất bại");
            }
        }

        [HttpGet("ExportTemplateImport")]
        public async Task<DataResponse<string>> ExportTemplateImport()
        {
            try
            {
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_PhieuDanhGiaTapThe");
                if (string.IsNullOrEmpty(base64))
                {
                    return DataResponse<string>.False("Kết xuất thất bại hoặc dữ liệu trống");
                }
                return DataResponse<string>.Success(base64);
            }
            catch (Exception)
            {
                return DataResponse<string>.False("Kết xuất thất bại");
            }
        }

        [HttpGet("Import")]
        public async Task<DataResponse> Import()
        {
            try
            {
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_PhieuDanhGiaTapThe>(rootPath, "KPI_PhieuDanhGiaTapThe");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_PhieuDanhGiaTapThe>();
                return DataResponse.Success(columns);
            }
            catch (Exception)
            {
                return DataResponse.False("Lấy dữ liệu màn hình import thất bại");
            }
        }

        [HttpPost("ImportExcel")]
        public async Task<DataResponse> ImportExcel([FromBody] DataImport data)
        {
            try
            {
                var filePathQuery = await _taiLieuDinhKemService.GetPathFromId(data.IdFile);
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                string filePath = rootPath + filePathQuery;

                var importHelper = new ImportExcelHelperNetCore<KPI_PhieuDanhGiaTapThe>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_PhieuDanhGiaTapThe>(data.Collection);

                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_PhieuDanhGiaTapThe>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_PhieuDanhGiaTapTheService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_PhieuDanhGiaTapThe>();
                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }
    }
}