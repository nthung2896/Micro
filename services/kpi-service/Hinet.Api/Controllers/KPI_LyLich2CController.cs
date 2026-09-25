using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;
using Hinet.Service.KPI_LyLich2CService;
using Hinet.Service.KPI_LyLich2CService.Dto;
using Hinet.Service.KPI_LyLich2CService.Request;
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
using Hinet.Service.AppUserService;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_LyLich2CController : HinetController
    {

        private readonly IKPI_LyLich2CService _kPI_LyLich2CService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly ILogger<KPI_LyLich2CController> _logger;
        private readonly IMapper _mapper;
        private readonly IAppUserService _appUserService;

        public KPI_LyLich2CController(
                IKPI_LyLich2CService kPI_LyLich2CService,
                ITaiLieuDinhKemService taiLieuDinhKemService,
                IMapper mapper,
                IAppUserService appUserService,
                ILogger<KPI_LyLich2CController> logger
            )
        {
            _logger = logger;
            this._kPI_LyLich2CService = kPI_LyLich2CService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            this._appUserService = appUserService;
        }

        [HttpGet("GetDropdown")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdown()
        {
            var list = await _kPI_LyLich2CService.GetQueryable()
                .Select(x => new DropdownOption
                {
                    Value = x.Id.ToString(),
                    Label = x.HoTen + (!string.IsNullOrEmpty(x.MaCanBo) ? $" ({x.MaCanBo})" : "")
                })
                .ToListAsync();
            return DataResponse<List<DropdownOption>>.Success(list);
        }

        [HttpPost("CreateAccountForAll")]
        public async Task<DataResponse> CreateAccountForAll()
        {
            try
            {
                await _appUserService.CreateAccountForAllLyLich();
                return DataResponse.Success("Đã tạo tài khoản cho tất cả lý lịch chưa có tài khoản thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo tài khoản hàng loạt cho KPI_LyLich2C");
                return DataResponse.False("Đã xảy ra lỗi khi tạo tài khoản hàng loạt.");
            }
        }

        [HttpPost("CreateAccountByLyLichId/{id}")]
        public async Task<DataResponse> CreateAccountByLyLichId(Guid id)
        {
            try
            {
                await _appUserService.CreateAccountByLyLichId(id);
                return DataResponse.Success("Tạo tài khoản thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo tài khoản cho KPI_LyLich2C với Id: {Id}", id);
                return DataResponse.False(ex.Message ?? "Đã xảy ra lỗi khi tạo tài khoản.");
            }
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_LyLich2C>> Create([FromBody] KPI_LyLich2CRequest model)
        {
            try
            {
                var entity = _mapper.Map<KPI_LyLich2CRequest, KPI_LyLich2C>(model);
                await _kPI_LyLich2CService.CreateAsync(entity);
                return DataResponse<KPI_LyLich2C>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_LyLich2C");
                return DataResponse<KPI_LyLich2C>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_LyLich2C>> Update([FromBody] KPI_LyLich2CRequest model)
        {
            try
            {
                var entity = await _kPI_LyLich2CService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_LyLich2C>.False("KPI_LyLich2C không tồn tại");

                var currentUserId = entity.UserId;
                entity = _mapper.Map(model, entity);

                if (!model.UserId.HasValue || model.UserId == Guid.Empty)
                {
                    entity.UserId = currentUserId;
                }

                await _kPI_LyLich2CService.UpdateAsync(entity);
                return DataResponse<KPI_LyLich2C>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_LyLich2C với Id: {Id}", model.Id);
                return new DataResponse<KPI_LyLich2C>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_LyLich2CDto>> Get(Guid id)
        {
            var dto = await _kPI_LyLich2CService.GetDto(id);
            return DataResponse<KPI_LyLich2CDto>.Success(dto);
        }

        [HttpGet("GetByUserId/{id}")]
        public async Task<DataResponse<KPI_LyLich2CDto>> GetByUserId(Guid id)
        {
            var entity = _kPI_LyLich2CService.GetQueryable().FirstOrDefault(x => x.UserId == id);
            if (entity != null)
            {
                var dto = await _kPI_LyLich2CService.GetDto(entity.Id);
                return DataResponse<KPI_LyLich2CDto>.Success(dto);
            }
            return DataResponse<KPI_LyLich2CDto>.False("Không tìm thấy lý lịch của người dùng này");
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<KPI_LyLich2CDto>>> GetData([FromBody] KPI_LyLich2CSearch search)
        {
            var currentUserLyLich = _kPI_LyLich2CService.GetQueryable().FirstOrDefault(x => x.UserId == UserId);
            
            bool isAdminOrHR = HasRole("Admin") || HasRole("QLNS_DonVi") || HasRole("LanhDaoDonVi") || HasRole("LanhDaoCuc") || HasRole("CucTruong");
            
            if (!isAdminOrHR && currentUserLyLich != null)
            {
                if (Hinet.Service.Constant.ChucVuConstant.ChucVuTruongPhong.Contains(currentUserLyLich.ChucVuHienTai) ||
                    Hinet.Service.Constant.ChucVuConstant.ChucVuPhoTruongPhong.Contains(currentUserLyLich.ChucVuHienTai))
                {
                    search.PhongBanId = currentUserLyLich.PhongBanId;
                    search.DonViSuDungId = currentUserLyLich.DonViSuDungId;
                }
                else
                {
                    search.UserId = UserId;
                }
            }

            var data = await _kPI_LyLich2CService.GetData(search);
            return DataResponse<PagedList<KPI_LyLich2CDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_LyLich2CService.GetByIdAsync(id);
                await _kPI_LyLich2CService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_LyLich2C với Id: {Id}", id);
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
        public async Task<DataResponse> ExportExcel([FromBody] KPI_LyLich2CSearch search)
        {
            try
            {
                var data = await _kPI_LyLich2CService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_LyLich2CDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_LyLich2C");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_LyLich2C>(rootPath, "KPI_LyLich2C");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_LyLich2C>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_LyLich2C>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_LyLich2C>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_LyLich2C>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_LyLich2CService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_LyLich2C>();

                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }

        [HttpPost("ImportExcelDirect")]
        public async Task<DataResponse> ImportExcelDirect(IFormFile file, [FromQuery] Guid donViSuDungId, [FromQuery] int startRow = 2)
        {
            try
            {
                var result = await _kPI_LyLich2CService.ImportExcelDirectAsync(file, donViSuDungId, startRow);
                return DataResponse.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi import Excel trực tiếp cho KPI_LyLich2C");
                return DataResponse.False("Đã xảy ra lỗi khi đọc file Excel: " + ex.Message);
            }
        }

        /// <summary>
        /// Import danh sách nhân sự hàng loạt, tự động tạo tài khoản SSO trên Identity Service
        /// và đồng bộ liên kết UserId vào KPI Service Database.
        /// </summary>
        [HttpPost("ImportStaffBatch")]
        public async Task<DataResponse<BatchStaffImportResultDto>> ImportStaffBatch([FromBody] List<StaffImportItemDto> staffList, [FromQuery] string? defaultPassword = null)
        {
            try
            {
                var result = await _kPI_LyLich2CService.ImportStaffBatchAsync(staffList, defaultPassword);
                return DataResponse<BatchStaffImportResultDto>.Success(result, $"Đã xử lý {result.SuccessCount}/{result.TotalItems} nhân sự.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi import danh sách nhân sự hàng loạt");
                return DataResponse<BatchStaffImportResultDto>.False(ex.Message);
            }
        }

        /// <summary>
        /// DEMO: Tạo và Import mẫu 10 nhân sự, tự động gọi Identity Service tạo tài khoản Identity_DB
        /// </summary>
        [HttpPost("DemoImport10Staff")]
        public async Task<DataResponse<BatchStaffImportResultDto>> DemoImport10Staff([FromQuery] Guid? donViSuDungId = null)
        {
            try
            {
                var result = await _kPI_LyLich2CService.DemoImport10StaffAsync(donViSuDungId);
                return DataResponse<BatchStaffImportResultDto>.Success(result, $"Đã hoàn tất DEMO Import {result.SuccessCount}/{result.TotalItems} nhân sự với tài khoản Identity.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chạy DEMO import 10 nhân sự");
                return DataResponse<BatchStaffImportResultDto>.False(ex.Message);
            }
        }

    }
}
