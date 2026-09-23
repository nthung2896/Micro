using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.PhongTroService;
using Hinet.Service.PhongTroService.Dto;
using Hinet.Service.PhongTroService.ViewModels;
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
    public class PhongTroController : HinetController
    {
        private readonly IPhongTroService _phongTroService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<PhongTroController> _logger;

        public PhongTroController(
            IPhongTroService phongTroService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<PhongTroController> logger
            )
        {
            this._phongTroService = phongTroService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<PhongTro>> Create([FromBody] PhongTroCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<PhongTroCreateVM, PhongTro>(model);
                await _phongTroService.CreateAsync(entity);

                // Gắn liên kết các file đính kèm từ bảng TaiLieuDinhKem
                if (model.FileDinhKemIds != null && model.FileDinhKemIds.Any())
                {
                    await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.FileDinhKemIds);

                    if (model.AvatarFileId.HasValue)
                    {
                        var avatarFile = await _taiLieuDinhKemService.GetById(model.AvatarFileId.Value);
                        if (avatarFile != null)
                        {
                            entity.HinhAnhDaiDien = avatarFile.DuongDanFile;
                            await _phongTroService.UpdateAsync(entity);
                        }
                    }
                    else if (string.IsNullOrEmpty(entity.HinhAnhDaiDien))
                    {
                        var firstFile = await _taiLieuDinhKemService.GetById(model.FileDinhKemIds.First());
                        if (firstFile != null)
                        {
                            entity.HinhAnhDaiDien = firstFile.DuongDanFile;
                            await _phongTroService.UpdateAsync(entity);
                        }
                    }
                }

                return DataResponse<PhongTro>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo PhongTro");
                return DataResponse<PhongTro>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<PhongTro>> Update([FromBody] PhongTroEditVM model)
        {
            try
            {
                var entity = await _phongTroService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<PhongTro>.False("PhongTro không tồn tại");

                entity = _mapper.Map(model, entity);
                await _phongTroService.UpdateAsync(entity);

                // Cập nhật liên kết file đính kèm
                if (model.FileDinhKemIds != null && model.FileDinhKemIds.Any() && model.Id.HasValue)
                {
                    await _taiLieuDinhKemService.UpdateItemIdAsync(model.Id.Value, model.FileDinhKemIds);

                    if (model.AvatarFileId.HasValue)
                    {
                        var avatarFile = await _taiLieuDinhKemService.GetById(model.AvatarFileId.Value);
                        if (avatarFile != null)
                        {
                            entity.HinhAnhDaiDien = avatarFile.DuongDanFile;
                            await _phongTroService.UpdateAsync(entity);
                        }
                    }
                }

                return DataResponse<PhongTro>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật PhongTro với Id: {Id}", model.Id);
                return new DataResponse<PhongTro>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        [AllowAnonymous]
        public async Task<DataResponse<PhongTroDto>> Get(Guid id)
        {
            var dto = await _phongTroService.GetDto(id);
            if (dto != null)
            {
                var files = await _taiLieuDinhKemService.GetByItemId(id, null);
                if (files != null && files.Any())
                {
                    dto.DanhSachTaiLieu = files;
                }
            }
            return DataResponse<PhongTroDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [AllowAnonymous]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<PhongTroDto>>> GetData([FromBody] PhongTroSearch search)
        {
            var data = await _phongTroService.GetData(search);
            return DataResponse<PagedList<PhongTroDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _phongTroService.GetByIdAsync(id);
                await _phongTroService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa PhongTro với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpPost("DayTin/{id}")]
        [AllowAnonymous]
        public async Task<DataResponse<PhongTro>> DayTin(Guid id)
        {
            try
            {
                var entity = await _phongTroService.DayTin(id);
                if (entity == null)
                    return DataResponse<PhongTro>.False("Tin đăng không tồn tại");

                return DataResponse<PhongTro>.Success(entity, "Đẩy tin lên đầu trang thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đẩy tin PhongTro với Id: {Id}", id);
                return DataResponse<PhongTro>.False("Đã xảy ra lỗi khi đẩy tin.");
            }
        }

        [HttpPost("GiaHan/{id}")]
        [AllowAnonymous]
        public async Task<DataResponse<PhongTro>> GiaHan(Guid id, [FromQuery] int soNgay = 30)
        {
            try
            {
                if (soNgay <= 0) soNgay = 30;
                var entity = await _phongTroService.GiaHan(id, soNgay);
                if (entity == null)
                    return DataResponse<PhongTro>.False("Tin đăng không tồn tại");

                return DataResponse<PhongTro>.Success(entity, $"Gia hạn tin đăng thêm {soNgay} ngày thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gia hạn PhongTro với Id: {Id}", id);
                return DataResponse<PhongTro>.False("Đã xảy ra lỗi khi gia hạn tin.");
            }
        }

        [HttpPost("NangCapVip/{id}")]
        [AllowAnonymous]
        public async Task<DataResponse<PhongTro>> NangCapVip(Guid id, [FromQuery] int goiTin = 1, [FromQuery] int? soNgay = null)
        {
            try
            {
                var entity = await _phongTroService.NangCapVip(id, goiTin, soNgay);
                if (entity == null)
                    return DataResponse<PhongTro>.False("Tin đăng không tồn tại");

                return DataResponse<PhongTro>.Success(entity, "Nâng cấp gói tin VIP thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi nâng cấp VIP PhongTro với Id: {Id}", id);
                return DataResponse<PhongTro>.False("Đã xảy ra lỗi khi nâng cấp gói tin.");
            }
        }

        [HttpPost("GanNhan/{id}")]
        [AllowAnonymous]
        public async Task<DataResponse<PhongTro>> GanNhan(Guid id)
        {
            try
            {
                var entity = await _phongTroService.GanNhan(id);
                if (entity == null)
                    return DataResponse<PhongTro>.False("Tin đăng không tồn tại");

                var msg = entity.IsNoiBat ? "Đã gắn nhãn nổi bật cho tin đăng!" : "Đã gỡ nhãn nổi bật của tin đăng!";
                return DataResponse<PhongTro>.Success(entity, msg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gắn nhãn PhongTro với Id: {Id}", id);
                return DataResponse<PhongTro>.False("Đã xảy ra lỗi khi cập nhật nhãn tin.");
            }
        }

        [HttpPost("DoiTrangThai/{id}")]
        [AllowAnonymous]
        public async Task<DataResponse<PhongTro>> DoiTrangThai(Guid id)
        {
            try
            {
                var entity = await _phongTroService.DoiTrangThai(id);
                if (entity == null)
                    return DataResponse<PhongTro>.False("Tin đăng không tồn tại");

                var msg = entity.TrangThai == 0 ? "Tin đăng đã được hiển thị (Còn phòng)!" : "Tin đăng đã chuyển sang Đã thuê / Tạm ẩn!";
                return DataResponse<PhongTro>.Success(entity, msg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đổi trạng thái PhongTro với Id: {Id}", id);
                return DataResponse<PhongTro>.False("Đã xảy ra lỗi khi đổi trạng thái tin.");
            }
        }

        [HttpPost("DuyetTin/{id}")]
        [AllowAnonymous]
        public async Task<DataResponse<PhongTro>> DuyetTin(Guid id, [FromQuery] int trangThai = 1, [FromQuery] string? lyDo = null)
        {
            try
            {
                var nguoiDuyet = FullName;
                var entity = await _phongTroService.DuyetTin(id, trangThai, lyDo, nguoiDuyet);
                if (entity == null)
                    return DataResponse<PhongTro>.False("Tin đăng không tồn tại");

                return DataResponse<PhongTro>.Success(entity, "Cập nhật trạng thái duyệt thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi duyệt tin PhongTro với Id: {Id}", id);
                return DataResponse<PhongTro>.False("Đã xảy ra lỗi khi duyệt tin.");
            }
        }

        [HttpGet("ThongKe")]
        [AllowAnonymous]
        public async Task<DataResponse<ThongKeTinDangDto>> ThongKe([FromQuery] Guid? chuTroId = null)
        {
            try
            {
                var stats = await _phongTroService.GetThongKe(chuTroId);
                return DataResponse<ThongKeTinDangDto>.Success(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy thống kê tin đăng PhongTro");
                return DataResponse<ThongKeTinDangDto>.False("Đã xảy ra lỗi khi lấy thống kê.");
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
                var search = new PhongTroSearch();
                var data = await _phongTroService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<PhongTroDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "PhongTro");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<PhongTro>(rootPath, "PhongTro");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<PhongTro>();
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

                var importHelper = new ImportExcelHelperNetCore<PhongTro>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<PhongTro>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<PhongTro>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _phongTroService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<PhongTro>();


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
