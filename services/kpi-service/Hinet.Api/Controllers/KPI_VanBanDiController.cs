using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_VanBanDiService;
using Hinet.Service.KPI_VanBanDiService.Dto;
using Hinet.Service.KPI_VanBanDiService.Request;
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
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_VanBanDiController : HinetController
    {
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_VanBanDiController> _logger;
        private readonly IKPI_VanBanDiService _kPI_VanBanDiService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;

        public KPI_VanBanDiController(
                IMapper mapper,
                ILogger<KPI_VanBanDiController> logger,
                IKPI_VanBanDiService kPI_VanBanDiService,
                ITaiLieuDinhKemService taiLieuDinhKemService
            )
        {
            _logger = logger;
            this._mapper = mapper;
            this._kPI_VanBanDiService = kPI_VanBanDiService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
        }


        [HttpPost("Create")]
        public async Task<DataResponse<KPI_VanBanDi>> Create([FromBody] KPI_VanBanDiRequest model)
        {
            try
            {
                var entity = _mapper.Map<KPI_VanBanDiRequest, KPI_VanBanDi>(model);
                await _kPI_VanBanDiService.CreateAsync(entity);
                return DataResponse<KPI_VanBanDi>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_VanBanDi");
                return DataResponse<KPI_VanBanDi>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_VanBanDi>> Update([FromBody] KPI_VanBanDiRequest model)
        {
            try
            {
                if (model.Id == null) return DataResponse<KPI_VanBanDi>.False("Thiếu tham số Id");
                var entity = await _kPI_VanBanDiService.GetByIdAsync(model.Id.Value);
                if (entity == null)
                    return DataResponse<KPI_VanBanDi>.False("KPI_VanBanDi không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_VanBanDiService.UpdateAsync(entity);
                return DataResponse<KPI_VanBanDi>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_VanBanDi với Id: {Id}", model.Id);
                return new DataResponse<KPI_VanBanDi>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_VanBanDiDto>> Get(Guid id)
        {
            var dto = await _kPI_VanBanDiService.GetDto(id);
            return DataResponse<KPI_VanBanDiDto>.Success(dto);
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<KPI_VanBanDiDto>>> GetData([FromBody] KPI_VanBanDiSearch search)
        {
            var data = await _kPI_VanBanDiService.GetData(search);
            return DataResponse<PagedList<KPI_VanBanDiDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_VanBanDiService.GetByIdAsync(id);
                await _kPI_VanBanDiService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_VanBanDi với Id: {Id}", id);
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

        [HttpGet("ExportExcel")]
        public async Task<DataResponse> ExportExcel([FromBody] KPI_VanBanDiSearch search)
        {
            try
            {
                var data = await _kPI_VanBanDiService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_VanBanDiDto>(data?.Items);
                if (string.IsNullOrEmpty(base64Excel))
                {
                    return DataResponse.False("Kết xuất thất bại hoặc dữ liệu trống");
                }
                return DataResponse.Success(base64Excel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi export");
                return DataResponse.False("Kết xuất thất bại");
            }
        }

        [HttpGet("ExportTemplateImport")]
        public async Task<DataResponse<string>> ExportTemplateImport()
        {
            try
            {
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_VanBanDi");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_VanBanDi>(rootPath, "KPI_VanBanDi");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_VanBanDi>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_VanBanDi>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_VanBanDi>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_VanBanDi>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_VanBanDiService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_VanBanDi>();

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
