using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_VanBanDenService;
using Hinet.Service.KPI_VanBanDenService.Dto;
using Hinet.Service.KPI_VanBanDenService.ViewModels;
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
    public class KPI_VanBanDenController : HinetController
    {
        private readonly IKPI_VanBanDenService _kPI_VanBanDenService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_VanBanDenController> _logger;

        public KPI_VanBanDenController(
            IKPI_VanBanDenService kPI_VanBanDenService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_VanBanDenController> logger
            )
        {
            this._kPI_VanBanDenService = kPI_VanBanDenService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_VanBanDen>> Create([FromBody] KPI_VanBanDenCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_VanBanDenCreateVM, KPI_VanBanDen>(model);
                await _kPI_VanBanDenService.CreateAsync(entity);
                return DataResponse<KPI_VanBanDen>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_VanBanDen");
                return DataResponse<KPI_VanBanDen>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_VanBanDen>> Update([FromBody] KPI_VanBanDenEditVM model)
        {
            try
            {
                var entity = await _kPI_VanBanDenService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_VanBanDen>.False("KPI_VanBanDen không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_VanBanDenService.UpdateAsync(entity);
                return DataResponse<KPI_VanBanDen>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_VanBanDen với Id: {Id}", model.Id);
                return new DataResponse<KPI_VanBanDen>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_VanBanDenDto>> Get(Guid id)
        {
            var dto = await _kPI_VanBanDenService.GetDto(id);
            return DataResponse<KPI_VanBanDenDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_VanBanDenDto>>> GetData([FromBody] KPI_VanBanDenSearch search)
        {
            var data = await _kPI_VanBanDenService.GetData(search);
            return DataResponse<PagedList<KPI_VanBanDenDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_VanBanDenService.GetByIdAsync(id);
                await _kPI_VanBanDenService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_VanBanDen với Id: {Id}", id);
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
                var search = new KPI_VanBanDenSearch();
                var data = await _kPI_VanBanDenService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_VanBanDenDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_VanBanDen");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_VanBanDen>(rootPath, "KPI_VanBanDen");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_VanBanDen>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_VanBanDen>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_VanBanDen>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_VanBanDen>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_VanBanDenService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_VanBanDen>();


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
