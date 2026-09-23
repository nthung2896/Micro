using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_TieuChiChungService;
using Hinet.Service.KPI_TieuChiChungService.Dto;
using Hinet.Service.KPI_TieuChiChungService.ViewModels;
using Hinet.Service.Common;
using Hinet.Api.Filter;
using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Web.Common;
//using Hinet.Api.ViewModels.Import;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Api.Dto;
using Hinet.Service.Dto;
using Hinet.Service.Constant;
using Hinet.Api.Request.Import;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_TieuChiChungController : HinetController
    {
        private readonly IKPI_TieuChiChungService _kPI_TieuChiChungService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_TieuChiChungController> _logger;

        public KPI_TieuChiChungController(
            IKPI_TieuChiChungService kPI_TieuChiChungService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_TieuChiChungController> logger
            )
        {
            this._kPI_TieuChiChungService = kPI_TieuChiChungService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_TieuChiChung>> Create([FromBody] KPI_TieuChiChungCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_TieuChiChungCreateVM, KPI_TieuChiChung>(model);
                await _kPI_TieuChiChungService.CreateAsync(entity);
                return DataResponse<KPI_TieuChiChung>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_TieuChiChung");
                return DataResponse<KPI_TieuChiChung>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_TieuChiChung>> Update([FromBody] KPI_TieuChiChungEditVM model)
        {
            try
            {
                var entity = await _kPI_TieuChiChungService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_TieuChiChung>.False("KPI_TieuChiChung không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_TieuChiChungService.UpdateAsync(entity);
                return DataResponse<KPI_TieuChiChung>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_TieuChiChung với Id: {Id}", model.Id);
                return new DataResponse<KPI_TieuChiChung>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_TieuChiChungDto>> Get(Guid id)
        {
            var dto = await _kPI_TieuChiChungService.GetDto(id);
            return DataResponse<KPI_TieuChiChungDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_TieuChiChungDto>>> GetData([FromBody] KPI_TieuChiChungSearch search)
        {
            var data = await _kPI_TieuChiChungService.GetData(search);
            return DataResponse<PagedList<KPI_TieuChiChungDto>>.Success(data);
        }

        [HttpGet("GetTreeDataForDot")]
        public async Task<DataResponse<List<KPI_TieuChiChungTreeDto>>> GetTreeDataForDot([FromQuery] Guid idDot, [FromQuery] Guid? idLyLich, [FromQuery] Guid? idPhieuDanhGia, [FromQuery] Guid? idDonVi)
        {
            var data = await _kPI_TieuChiChungService.GetTreeDataForDot(idDot, idLyLich, idPhieuDanhGia, idDonVi);
            return DataResponse<List<KPI_TieuChiChungTreeDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_TieuChiChungService.GetByIdAsync(id);
                await _kPI_TieuChiChungService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_TieuChiChung với Id: {Id}", id);
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
                var search = new KPI_TieuChiChungSearch();
                var data = await _kPI_TieuChiChungService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_TieuChiChungDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_TieuChiChung");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_TieuChiChung>(rootPath, "KPI_TieuChiChung");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_TieuChiChung>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_TieuChiChung>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_TieuChiChung>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_TieuChiChung>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_TieuChiChungService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_TieuChiChung>();


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
