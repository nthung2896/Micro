using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;
using Hinet.Service.KPI_DotDanhGia_DonViService;
using Hinet.Service.KPI_DotDanhGia_DonViService.Dto;
using Hinet.Service.KPI_DotDanhGia_DonViService.ViewModels;
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
using Hinet.Api.Request.Import;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_DotDanhGia_DonViController : HinetController
    {

        private readonly IMapper _mapper;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly ILogger<KPI_DotDanhGia_DonViController> _logger;
        private readonly IKPI_DotDanhGia_DonViService _kPI_DotDanhGia_DonViService;

        public KPI_DotDanhGia_DonViController(
            IKPI_DotDanhGia_DonViService kPI_DotDanhGia_DonViService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_DotDanhGia_DonViController> logger
            )
        {
            this._kPI_DotDanhGia_DonViService = kPI_DotDanhGia_DonViService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_DotDanhGia_DonVi>> Create([FromBody] KPI_DotDanhGia_DonViCreateVM model)
        {
            try
            {
                var existing = await _kPI_DotDanhGia_DonViService.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdDotDanhGia == model.IdDotDanhGia && x.IdDonVi == model.IdDonVi);
                if (existing != null)
                {
                    return DataResponse<KPI_DotDanhGia_DonVi>.False("Đơn vị này đã được cấu hình trong đợt theo dõi đánh giá.");
                }

                var entity = _mapper.Map<KPI_DotDanhGia_DonViCreateVM, KPI_DotDanhGia_DonVi>(model);
                await _kPI_DotDanhGia_DonViService.CreateAsync(entity);
                return DataResponse<KPI_DotDanhGia_DonVi>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_DotDanhGia_DonVi");
                return DataResponse<KPI_DotDanhGia_DonVi>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_DotDanhGia_DonVi>> Update([FromBody] KPI_DotDanhGia_DonViEditVM model)
        {
            try
            {
                var entity = await _kPI_DotDanhGia_DonViService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_DotDanhGia_DonVi>.False("KPI_DotDanhGia_DonVi không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_DotDanhGia_DonViService.UpdateAsync(entity);
                return DataResponse<KPI_DotDanhGia_DonVi>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_DotDanhGia_DonVi với Id: {Id}", model.Id);
                return new DataResponse<KPI_DotDanhGia_DonVi>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_DotDanhGia_DonViDto>> Get(Guid id)
        {
            var dto = await _kPI_DotDanhGia_DonViService.GetDto(id);
            return DataResponse<KPI_DotDanhGia_DonViDto>.Success(dto);
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<KPI_DotDanhGia_DonViDto>>> GetData([FromBody] KPI_DotDanhGia_DonViSearch search)
        {
            var data = await _kPI_DotDanhGia_DonViService.GetData(search);
            return DataResponse<PagedList<KPI_DotDanhGia_DonViDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_DotDanhGia_DonViService.GetByIdAsync(id);
                await _kPI_DotDanhGia_DonViService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_DotDanhGia_DonVi với Id: {Id}", id);
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
                var search = new KPI_DotDanhGia_DonViSearch();
                var data = await _kPI_DotDanhGia_DonViService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_DotDanhGia_DonViDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_DotDanhGia_DonVi");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_DotDanhGia_DonVi>(rootPath, "KPI_DotDanhGia_DonVi");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_DotDanhGia_DonVi>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_DotDanhGia_DonVi>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_DotDanhGia_DonVi>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_DotDanhGia_DonVi>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_DotDanhGia_DonViService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_DotDanhGia_DonVi>();


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
