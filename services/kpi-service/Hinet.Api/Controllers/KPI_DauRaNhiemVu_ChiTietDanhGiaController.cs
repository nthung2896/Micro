using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService;
using Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.Dto;
using Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.ViewModels;
using Hinet.Service.Common;
using Hinet.Api.Filter;
using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Web.Common;
using Hinet.Api.Request.Import;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Api.Dto;
using Hinet.Service.Dto;
using Hinet.Service.Constant;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_DauRaNhiemVu_ChiTietDanhGiaController : HinetController
    {
        private readonly IKPI_DauRaNhiemVu_ChiTietDanhGiaService _kPI_DauRaNhiemVu_ChiTietDanhGiaService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_DauRaNhiemVu_ChiTietDanhGiaController> _logger;

        public KPI_DauRaNhiemVu_ChiTietDanhGiaController(
            IKPI_DauRaNhiemVu_ChiTietDanhGiaService kPI_DauRaNhiemVu_ChiTietDanhGiaService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_DauRaNhiemVu_ChiTietDanhGiaController> logger
            )
        {
            this._kPI_DauRaNhiemVu_ChiTietDanhGiaService = kPI_DauRaNhiemVu_ChiTietDanhGiaService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGia>> Create([FromBody] KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM, KPI_DauRaNhiemVu_ChiTietDanhGia>(model);
                await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.CreateAsync(entity);
                return DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_DauRaNhiemVu_ChiTietDanhGia");
                return DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGia>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGia>> Update([FromBody] KPI_DauRaNhiemVu_ChiTietDanhGiaEditVM model)
        {
            try
            {
                var entity = await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGia>.False("KPI_DauRaNhiemVu_ChiTietDanhGia không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.UpdateAsync(entity);
                return DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_DauRaNhiemVu_ChiTietDanhGia với Id: {Id}", model.Id);
                return new DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGia>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>> Get(Guid id)
        {
            var dto = await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.GetDto(id);
            return DataResponse<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>>> GetData([FromBody] KPI_DauRaNhiemVu_ChiTietDanhGiaSearch search)
        {
            var data = await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.GetData(search);
            return DataResponse<PagedList<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>>.Success(data);
        }

        [HttpGet("GetByPhieu/{idPhieu}")]
        public async Task<DataResponse<List<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>>> GetByPhieu(Guid idPhieu)
        {
            try
            {
                var data = await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.GetByPhieu(idPhieu);
                return DataResponse<List<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>>.Success(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy chi tiết đánh giá theo phiếu {idPhieu}", idPhieu);
                return DataResponse<List<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>>.False("Lỗi khi tải chi tiết đánh giá.");
            }
        }

        [HttpPost("SaveBatch")]
        public async Task<DataResponse> SaveBatch([FromBody] SaveBatchChiTietDanhGiaRequest request)
        {
            try
            {
                if (request == null || request.IdPhieuDanhGia == Guid.Empty || string.IsNullOrEmpty(request.VaiTroDanhGia))
                {
                    return DataResponse.False("Thông tin lưu điểm không hợp lệ.");
                }

                var evaluatorId = request.NguoiDanhGiaId ?? UserId ?? Guid.Empty;
                await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.SaveBatch(
                    request.IdPhieuDanhGia,
                    request.VaiTroDanhGia,
                    evaluatorId,
                    request.Items ?? new List<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM>()
                );
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu batch chi tiết đánh giá cho phiếu {IdPhieu}", request?.IdPhieuDanhGia);
                return DataResponse.False("Lỗi khi lưu điểm đánh giá: " + ex.Message);
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.GetByIdAsync(id);
                await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_DauRaNhiemVu_ChiTietDanhGia với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
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
                var search = new KPI_DauRaNhiemVu_ChiTietDanhGiaSearch();
                var data = await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>(data?.Items);
                if (string.IsNullOrEmpty(base64Excel))
                {
                    return DataResponse.False("Kết xuất thất bại hoặc dữ liệu trống");
                }
                return DataResponse.Success(base64Excel);
            }
            catch (Exception ex)
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_DauRaNhiemVu_ChiTietDanhGia");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_DauRaNhiemVu_ChiTietDanhGia>(rootPath, "KPI_DauRaNhiemVu_ChiTietDanhGia");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_DauRaNhiemVu_ChiTietDanhGia>();
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
                #region Config để import dữ liệu    
                var filePathQuery = await _taiLieuDinhKemService.GetPathFromId(data.IdFile);
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                string filePath = rootPath + filePathQuery;

                var importHelper = new ImportExcelHelperNetCore<KPI_DauRaNhiemVu_ChiTietDanhGia>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_DauRaNhiemVu_ChiTietDanhGia>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_DauRaNhiemVu_ChiTietDanhGia>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_DauRaNhiemVu_ChiTietDanhGiaService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_DauRaNhiemVu_ChiTietDanhGia>();


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