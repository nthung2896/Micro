using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Api.Dto;
using Hinet.Api.Filter;
using Hinet.Api.Request.Import;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.Dto;
using Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService;
using Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService.Dto;
using Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService.ViewModels;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Web.Common;
using Microsoft.AspNetCore.Mvc;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_QuaTrinhXuLyPhieuDanhGiaController : HinetController
    {
        private readonly IKPI_QuaTrinhXuLyPhieuDanhGiaService _kPI_QuaTrinhXuLyPhieuDanhGiaService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_QuaTrinhXuLyPhieuDanhGiaController> _logger;

        public KPI_QuaTrinhXuLyPhieuDanhGiaController(
            IKPI_QuaTrinhXuLyPhieuDanhGiaService kPI_QuaTrinhXuLyPhieuDanhGiaService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_QuaTrinhXuLyPhieuDanhGiaController> logger
            )
        {
            this._kPI_QuaTrinhXuLyPhieuDanhGiaService = kPI_QuaTrinhXuLyPhieuDanhGiaService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_QuaTrinhXuLyPhieuDanhGia>> Create([FromBody] KPI_QuaTrinhXuLyPhieuDanhGiaCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_QuaTrinhXuLyPhieuDanhGiaCreateVM, KPI_QuaTrinhXuLyPhieuDanhGia>(model);
                await _kPI_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(entity);
                return DataResponse<KPI_QuaTrinhXuLyPhieuDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_QuaTrinhXuLyPhieuDanhGia");
                return DataResponse<KPI_QuaTrinhXuLyPhieuDanhGia>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_QuaTrinhXuLyPhieuDanhGia>> Update([FromBody] KPI_QuaTrinhXuLyPhieuDanhGiaEditVM model)
        {
            try
            {
                var entity = await _kPI_QuaTrinhXuLyPhieuDanhGiaService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_QuaTrinhXuLyPhieuDanhGia>.False("KPI_QuaTrinhXuLyPhieuDanhGia không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_QuaTrinhXuLyPhieuDanhGiaService.UpdateAsync(entity);
                return DataResponse<KPI_QuaTrinhXuLyPhieuDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_QuaTrinhXuLyPhieuDanhGia với Id: {Id}", model.Id);
                return new DataResponse<KPI_QuaTrinhXuLyPhieuDanhGia>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_QuaTrinhXuLyPhieuDanhGiaDto>> Get(Guid id)
        {
            var dto = await _kPI_QuaTrinhXuLyPhieuDanhGiaService.GetDto(id);
            return DataResponse<KPI_QuaTrinhXuLyPhieuDanhGiaDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_QuaTrinhXuLyPhieuDanhGiaDto>>> GetData([FromBody] KPI_QuaTrinhXuLyPhieuDanhGiaSearch search)
        {
            var data = await _kPI_QuaTrinhXuLyPhieuDanhGiaService.GetData(search);
            return DataResponse<PagedList<KPI_QuaTrinhXuLyPhieuDanhGiaDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_QuaTrinhXuLyPhieuDanhGiaService.GetByIdAsync(id);
                await _kPI_QuaTrinhXuLyPhieuDanhGiaService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_QuaTrinhXuLyPhieuDanhGia với Id: {Id}", id);
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
                var search = new KPI_QuaTrinhXuLyPhieuDanhGiaSearch();
                var data = await _kPI_QuaTrinhXuLyPhieuDanhGiaService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_QuaTrinhXuLyPhieuDanhGiaDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_QuaTrinhXuLyPhieuDanhGia");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_QuaTrinhXuLyPhieuDanhGia>(rootPath, "KPI_QuaTrinhXuLyPhieuDanhGia");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_QuaTrinhXuLyPhieuDanhGia>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_QuaTrinhXuLyPhieuDanhGia>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_QuaTrinhXuLyPhieuDanhGia>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_QuaTrinhXuLyPhieuDanhGia>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_QuaTrinhXuLyPhieuDanhGia>();


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
