using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;
using Hinet.Service.AppConfigurationService;
using Hinet.Service.AppConfigurationService.Dto;
using Hinet.Service.AppConfigurationService.ViewModels;
using Hinet.Service.Common;
using Hinet.Api.Filter;
using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Web.Common;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Api.Dto;
using Hinet.Service.Dto;
using Hinet.Service.Constant;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class AppConfigurationController : HinetController
    {
        private readonly IAppConfigurationService _appConfigurationService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<AppConfigurationController> _logger;

        public AppConfigurationController(
            IAppConfigurationService appConfigurationService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<AppConfigurationController> logger
            )
        {
            this._appConfigurationService = appConfigurationService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<AppConfigurationDto>> Create([FromBody] AppConfigurationCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<AppConfigurationCreateVM, AppConfiguration>(model);
                if (entity.Id == Guid.Empty)
                {
                    entity.Id = Guid.NewGuid();
                }

                if (model.LogoFileId.HasValue)
                {
                    var tailieu = await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.LogoFileId.Value);
                    if (tailieu != null)
                    {
                        entity.LogoLink = tailieu.DuongDanFile;
                    }
                }

                if (model.BgFileId.HasValue)
                {
                    var tailieu = await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.BgFileId.Value);
                    if (tailieu != null)
                    {
                        entity.LoginBackgroundLink = tailieu.DuongDanFile;
                    }
                }

                if (model.LoginModalImageFileId.HasValue)
                {
                    var tailieu = await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.LoginModalImageFileId.Value);
                    if (tailieu != null)
                    {
                        entity.LoginModalImage = tailieu.DuongDanFile;
                    }
                }

                await _appConfigurationService.CreateAsync(entity);

                if (entity.isActive == true)
                {
                    await _appConfigurationService.SetActiveConfigAsync(entity.Id);
                }

                // Trả về Dto thay vì entity để không lộ field nội bộ
                var dto = await _appConfigurationService.GetDto(entity.Id);
                return DataResponse<AppConfigurationDto>.Success(dto, "Tạo cấu hình thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo AppConfiguration");
                return DataResponse<AppConfigurationDto>.False(ex.Message ?? "Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<AppConfigurationDto>> Update([FromBody] AppConfigurationEditVM model)
        {
            try
            {
                var entity = await _appConfigurationService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<AppConfigurationDto>.False("Cấu hình không tồn tại");

                entity = _mapper.Map(model, entity);

                if (string.IsNullOrEmpty(model.LogoLink)) entity.LogoLink = "";
                if (string.IsNullOrEmpty(model.LoginBackgroundLink)) entity.LoginBackgroundLink = "";
                if (string.IsNullOrEmpty(model.LoginModalImage)) entity.LoginModalImage = "";

                if (model.LogoFileId.HasValue)
                {
                    var tailieu = await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.LogoFileId.Value);
                    if (tailieu != null)
                    {
                        entity.LogoLink = tailieu.DuongDanFile;
                    }
                }

                if (model.BgFileId.HasValue)
                {
                    var tailieu = await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.BgFileId.Value);
                    if (tailieu != null)
                    {
                        entity.LoginBackgroundLink = tailieu.DuongDanFile;
                    }
                }

                if (model.LoginModalImageFileId.HasValue)
                {
                    var tailieu = await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.LoginModalImageFileId.Value);
                    if (tailieu != null)
                    {
                        entity.LoginModalImage = tailieu.DuongDanFile;
                    }
                }

                await _appConfigurationService.UpdateAsync(entity);

                if (entity.isActive == true)
                {
                    await _appConfigurationService.SetActiveConfigAsync(entity.Id);
                }

                // Trả về Dto thay vì entity để không lộ field nội bộ
                var dto = await _appConfigurationService.GetDto(entity.Id);
                return DataResponse<AppConfigurationDto>.Success(dto, "Cập nhật cấu hình thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật AppConfiguration với Id: {Id}", model.Id);
                return DataResponse<AppConfigurationDto>.False(ex.Message ?? "Đã xảy ra lỗi khi cập nhật dữ liệu.");
            }
        }

        [HttpPost("ToggleActive/{id}")]
        public async Task<DataResponse<AppConfiguration>> ToggleActive(Guid id)
        {
            try
            {
                var entity = await _appConfigurationService.GetByIdAsync(id);
                if (entity == null)
                    return DataResponse<AppConfiguration>.False("Cấu hình không tồn tại");

                bool targetActive = !(entity.isActive ?? false);
                entity.isActive = targetActive;
                await _appConfigurationService.UpdateAsync(entity);

                if (targetActive)
                {
                    await _appConfigurationService.SetActiveConfigAsync(entity.Id);
                }

                return DataResponse<AppConfiguration>.Success(entity, entity.isActive == true ? "Kích hoạt cấu hình thành công" : "Hủy kích hoạt cấu hình thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thay đổi trạng thái kích hoạt");
                return DataResponse<AppConfiguration>.False(ex.Message);
            }
        }

        [HttpGet("GetActiveConfig")]
        [AllowAnonymous]
        public async Task<DataResponse<AppConfigurationDto>> GetActiveConfig()
        {
            try
            {
                var baseQuery = _appConfigurationService.GetQueryable().Where(x => !x.IsDeleted);

                var activeConfig = await (from q in baseQuery
                                          where q.isActive == true
                                          orderby q.CreatedDate descending
                                          select new AppConfigurationDto
                                          {
                                              Id = q.Id,
                                              TenApp = q.TenApp,
                                              TenDoanhNghiep = q.TenDoanhNghiep,
                                              DiaChi = q.DiaChi,
                                              SoDienThoai = q.SoDienThoai,
                                              Email = q.Email,
                                              LogoLink = q.LogoLink,
                                              LoginBackgroundLink = q.LoginBackgroundLink,
                                              LoginModalImage = q.LoginModalImage,
                                              PrimaryColor = q.PrimaryColor,
                                              isActive = q.isActive,
                                          }).FirstOrDefaultAsync();

                if (activeConfig == null)
                {
                    activeConfig = await (from q in baseQuery
                                          orderby q.CreatedDate descending
                                          select new AppConfigurationDto
                                          {
                                              Id = q.Id,
                                              TenApp = q.TenApp,
                                              TenDoanhNghiep = q.TenDoanhNghiep,
                                              DiaChi = q.DiaChi,
                                              SoDienThoai = q.SoDienThoai,
                                              Email = q.Email,
                                              LogoLink = q.LogoLink,
                                              LoginBackgroundLink = q.LoginBackgroundLink,
                                              LoginModalImage = q.LoginModalImage,
                                              PrimaryColor = q.PrimaryColor,
                                              isActive = q.isActive,
                                          }).FirstOrDefaultAsync();
                }

                return DataResponse<AppConfigurationDto>.Success(activeConfig);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy AppConfiguration đang kích hoạt");
                return DataResponse<AppConfigurationDto>.False(ex.Message);
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<AppConfigurationDto>> Get(Guid id)
        {
            var dto = await _appConfigurationService.GetDto(id);
            return DataResponse<AppConfigurationDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<AppConfigurationDto>>> GetData([FromBody] AppConfigurationSearch search)
        {
            var data = await _appConfigurationService.GetData(search);
            return DataResponse<PagedList<AppConfigurationDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _appConfigurationService.GetByIdAsync(id);
                if (entity != null)
                {
                    bool wasActive = entity.isActive == true;
                    await _appConfigurationService.DeleteAsync(entity);

                    if (wasActive)
                    {
                        var latest = await _appConfigurationService.GetQueryable()
                            .Where(x => !x.IsDeleted && x.Id != entity.Id)
                            .OrderByDescending(x => x.CreatedDate)
                            .FirstOrDefaultAsync();

                        if (latest != null)
                        {
                            await _appConfigurationService.SetActiveConfigAsync(latest.Id);
                        }
                    }
                }
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa AppConfiguration với Id: {Id}", id);
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
                var search = new AppConfigurationSearch();
                var data = await _appConfigurationService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<AppConfigurationDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "AppConfiguration");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<AppConfiguration>(rootPath, "AppConfiguration");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<AppConfiguration>();
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

        //        var importHelper = new ImportExcelHelperNetCore<AppConfiguration>();
        //        importHelper.PathTemplate = filePath;
        //        importHelper.StartCol = 1;
        //        importHelper.StartRow = 2;
        //        importHelper.ConfigColumn = new List<ConfigModule>();
        //        importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<AppConfiguration>(data.Collection);
        //        #endregion
        //        var rsl = importHelper.Import();

        //        var listImportReponse = new List<AppConfiguration>();
        //        if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
        //        {
        //            listImportReponse.AddRange(rsl.ListTrue);
        //            await _appConfigurationService.CreateAsync(rsl.ListTrue);
        //        }

        //        var response = new ResponseImport<AppConfiguration>();


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
