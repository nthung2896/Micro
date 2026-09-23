using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService.Dto;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService.Request;
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
using Hinet.Service.KPI_BoTieuChiChungService;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_DotTheoDoiDanhGiaController : HinetController
    {

        private readonly IKPI_DotTheoDoiDanhGiaService _kPI_DotTheoDoiDanhGiaService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly ILogger<KPI_DotTheoDoiDanhGiaController> _logger;
        private readonly IMapper _mapper;

        public KPI_DotTheoDoiDanhGiaController(
                IKPI_DotTheoDoiDanhGiaService kPI_DotTheoDoiDanhGiaService,
                ITaiLieuDinhKemService taiLieuDinhKemService,
                IMapper mapper,
                ILogger<KPI_DotTheoDoiDanhGiaController> logger
            )
        {
            _logger = logger;
            this._kPI_DotTheoDoiDanhGiaService = kPI_DotTheoDoiDanhGiaService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_DotTheoDoiDanhGia>> Create([FromBody] KPI_DotTheoDoiDanhGiaRequest model, [FromServices] IKPI_BoTieuChiChungService boTieuChiChungService)
        {
            try
            {
                var entity = _mapper.Map<KPI_DotTheoDoiDanhGiaRequest, KPI_DotTheoDoiDanhGia>(model);

                // Tự động gán bộ tiêu chí chung phù hợp theo loại nếu người dùng chưa chọn
                if (!entity.DefaultTieuChiChung.HasValue)
                {
                    var isTapThe = entity.Type == LoaiDotDanhGiaConstant.TAP_THE || entity.Type == "TapThe";
                    var btcQuery = boTieuChiChungService.GetQueryable().Where(x => !x.IsDeleted && x.IsActive == true);
                    if (isTapThe)
                    {
                        btcQuery = btcQuery.Where(x => x.Type == LoaiDotDanhGiaConstant.TAP_THE || x.Type == "TapThe" || (x.Type == null && EF.Functions.ILike(x.TenBoTieuChiDonVi, "%tập thể%")));
                    }
                    else
                    {
                        btcQuery = btcQuery.Where(x => x.Type != LoaiDotDanhGiaConstant.TAP_THE && x.Type != "TapThe" && (x.TenBoTieuChiDonVi == null || !EF.Functions.ILike(x.TenBoTieuChiDonVi, "%tập thể%")));
                    }
                    var defaultBtc = await btcQuery.OrderByDescending(x => x.CreatedDate).FirstOrDefaultAsync();
                    if (defaultBtc != null)
                    {
                        entity.DefaultTieuChiChung = defaultBtc.Id;
                    }
                }

                await _kPI_DotTheoDoiDanhGiaService.CreateAsync(entity);
                return DataResponse<KPI_DotTheoDoiDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_DotTheoDoiDanhGia");
                return DataResponse<KPI_DotTheoDoiDanhGia>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }

        [HttpPost("Clone")]
        public async Task<DataResponse<KPI_DotTheoDoiDanhGia>> Clone([FromBody] KPI_DotTheoDoiDanhGiaCloneRequest model)
        {
            try
            {
                var entity = await _kPI_DotTheoDoiDanhGiaService.CloneAsync(model);
                return DataResponse<KPI_DotTheoDoiDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi sao chép KPI_DotTheoDoiDanhGia với SourceId: {SourceId}", model.SourceId);
                return DataResponse<KPI_DotTheoDoiDanhGia>.False("Đã xảy ra lỗi khi sao chép đợt đánh giá.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_DotTheoDoiDanhGia>> Update([FromBody] KPI_DotTheoDoiDanhGiaRequest model, [FromServices] IKPI_BoTieuChiChungService boTieuChiChungService)
        {
            try
            {
                var entity = await _kPI_DotTheoDoiDanhGiaService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_DotTheoDoiDanhGia>.False("KPI_DotTheoDoiDanhGia không tồn tại");

                entity = _mapper.Map(model, entity);

                // Nếu là đợt tập thể nhưng chưa có tiêu chí chung tập thể, tự động lấy bộ tiêu chí chung tập thể
                if (entity.Type == LoaiDotDanhGiaConstant.TAP_THE || entity.Type == "TapThe")
                {
                    bool needAutoAssign = !entity.DefaultTieuChiChung.HasValue;
                    if (entity.DefaultTieuChiChung.HasValue)
                    {
                        var currentBtc = await boTieuChiChungService.GetByIdAsync(entity.DefaultTieuChiChung.Value);
                        if (currentBtc != null && currentBtc.Type != LoaiDotDanhGiaConstant.TAP_THE && currentBtc.Type != "TapThe" && (currentBtc.TenBoTieuChiDonVi == null || !currentBtc.TenBoTieuChiDonVi.ToLower().Contains("tập thể")))
                        {
                            needAutoAssign = true;
                        }
                    }
                    if (needAutoAssign)
                    {
                        var defaultBtc = await boTieuChiChungService.GetQueryable()
                            .Where(x => !x.IsDeleted && x.IsActive == true && (x.Type == LoaiDotDanhGiaConstant.TAP_THE || x.Type == "TapThe" || (x.Type == null && EF.Functions.ILike(x.TenBoTieuChiDonVi, "%tập thể%"))))
                            .OrderByDescending(x => x.CreatedDate)
                            .FirstOrDefaultAsync();
                        if (defaultBtc != null)
                        {
                            entity.DefaultTieuChiChung = defaultBtc.Id;
                        }
                    }
                }

                await _kPI_DotTheoDoiDanhGiaService.UpdateAsync(entity);
                return DataResponse<KPI_DotTheoDoiDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_DotTheoDoiDanhGia với Id: {Id}", model.Id);
                return new DataResponse<KPI_DotTheoDoiDanhGia>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_DotTheoDoiDanhGiaDto>> Get(Guid id)
        {
            var dto = await _kPI_DotTheoDoiDanhGiaService.GetDto(id);
            return DataResponse<KPI_DotTheoDoiDanhGiaDto>.Success(dto);
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<KPI_DotTheoDoiDanhGiaDto>>> GetData([FromBody] KPI_DotTheoDoiDanhGiaSearch search)
        {
            var data = await _kPI_DotTheoDoiDanhGiaService.GetData(search);
            return DataResponse<PagedList<KPI_DotTheoDoiDanhGiaDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_DotTheoDoiDanhGiaService.GetByIdAsync(id);
                await _kPI_DotTheoDoiDanhGiaService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_DotTheoDoiDanhGia với Id: {Id}", id);
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

        [HttpGet("GetDropdownDotDanhGia")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdownDotDanhGia([FromQuery] bool activeOnly = false, [FromQuery] string? type = null)
        {
            var data = await _kPI_DotTheoDoiDanhGiaService.GetDropdownDotDanhGia(activeOnly, type);
            return DataResponse<List<DropdownOption>>.Success(data);
        }

        [HttpGet("ExportExcel")]
        public async Task<DataResponse> ExportExcel([FromBody] KPI_DotTheoDoiDanhGiaSearch search)
        {
            try
            {
                var data = await _kPI_DotTheoDoiDanhGiaService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_DotTheoDoiDanhGiaDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_DotTheoDoiDanhGia");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_DotTheoDoiDanhGia>(rootPath, "KPI_DotTheoDoiDanhGia");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_DotTheoDoiDanhGia>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_DotTheoDoiDanhGia>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_DotTheoDoiDanhGia>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_DotTheoDoiDanhGia>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_DotTheoDoiDanhGiaService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_DotTheoDoiDanhGia>();

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
