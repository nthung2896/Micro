using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_DauRaNhiemVuService;
using Hinet.Service.KPI_DauRaNhiemVuService.Dto;
using Hinet.Service.KPI_DauRaNhiemVuService.ViewModels;
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


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_DauRaNhiemVuController : HinetController
    {
        private readonly IKPI_DauRaNhiemVuService _kPI_DauRaNhiemVuService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_DauRaNhiemVuController> _logger;

        public KPI_DauRaNhiemVuController(
            IKPI_DauRaNhiemVuService kPI_DauRaNhiemVuService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_DauRaNhiemVuController> logger
            )
        {
            this._kPI_DauRaNhiemVuService = kPI_DauRaNhiemVuService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_DauRaNhiemVu>> Create([FromBody] KPI_DauRaNhiemVuCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_DauRaNhiemVuCreateVM, KPI_DauRaNhiemVu>(model);
                await _kPI_DauRaNhiemVuService.CreateAsync(entity);
                return DataResponse<KPI_DauRaNhiemVu>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_DauRaNhiemVu");
                return DataResponse<KPI_DauRaNhiemVu>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_DauRaNhiemVu>> Update([FromBody] KPI_DauRaNhiemVuEditVM model)
        {
            try
            {
                var entity = await _kPI_DauRaNhiemVuService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_DauRaNhiemVu>.False("KPI_DauRaNhiemVu không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_DauRaNhiemVuService.UpdateAsync(entity);
                return DataResponse<KPI_DauRaNhiemVu>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_DauRaNhiemVu với Id: {Id}", model.Id);
                return new DataResponse<KPI_DauRaNhiemVu>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_DauRaNhiemVuDto>> Get(Guid id)
        {
            var dto = await _kPI_DauRaNhiemVuService.GetDto(id);
            return DataResponse<KPI_DauRaNhiemVuDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_DauRaNhiemVuDto>>> GetData([FromBody] KPI_DauRaNhiemVuSearch search)
        {
            var data = await _kPI_DauRaNhiemVuService.GetData(search);
            return DataResponse<PagedList<KPI_DauRaNhiemVuDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_DauRaNhiemVuService.GetByIdAsync(id);
                await _kPI_DauRaNhiemVuService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_DauRaNhiemVu với Id: {Id}", id);
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
                var search = new KPI_DauRaNhiemVuSearch();
                var data = await _kPI_DauRaNhiemVuService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_DauRaNhiemVuDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_DauRaNhiemVu");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_DauRaNhiemVu>(rootPath, "KPI_DauRaNhiemVu");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_DauRaNhiemVu>();
                return DataResponse.Success(columns);
            }
            catch (Exception)
            {
                return DataResponse.False("Lấy dữ liệu màn hình import thất bại");
            }
        }

        //[HttpPost("ImportExcel")]
        //public async Task<DataResponse> ImportExcel([FromBody] DataImport data)
        //{
        //    try
        //    {
        //        #region Config để import dữ liệu    
        //        var filePathQuery = await _taiLieuDinhKemService.GetPathFromId(data.IdFile);
        //        string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
        //        string filePath = rootPath + filePathQuery;

        //        var importHelper = new ImportExcelHelperNetCore<KPI_DauRaNhiemVu>();
        //        importHelper.PathTemplate = filePath;
        //        importHelper.StartCol = 1;
        //        importHelper.StartRow = 2;
        //        importHelper.ConfigColumn = new List<ConfigModule>();
        //        importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_DauRaNhiemVu>(data.Collection);
        //        #endregion
        //        var rsl = importHelper.Import();

        //        var listImportReponse = new List<KPI_DauRaNhiemVu>();
        //        if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
        //        {
        //            listImportReponse.AddRange(rsl.ListTrue);
        //            await _kPI_DauRaNhiemVuService.CreateAsync(rsl.ListTrue);
        //        }

        //        var response = new ResponseImport<KPI_DauRaNhiemVu>();


        //        response.ListTrue = listImportReponse;
        //        response.lstFalse = rsl.lstFalse;

        //        return DataResponse.Success(response);
        //    }
        //    catch (Exception)
        //    {
        //        return DataResponse.False("Import thất bại");
        //    }
        //}
    }
}
