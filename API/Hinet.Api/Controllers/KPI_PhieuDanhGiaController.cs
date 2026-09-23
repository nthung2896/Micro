using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Api.Dto;
using Hinet.Api.Filter;
using Hinet.Api.Request.Import;
using Hinet.Model.Entities;
using Hinet.Service.AppUserService;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.DepartmentService;
using Hinet.Service.Dto;
using Hinet.Service.KPI_LyLich2CService;
using Hinet.Service.KPI_PhieuDanhGiaService;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using Hinet.Service.KPI_PhieuDanhGiaService.ViewModels;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Web.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_PhieuDanhGiaController : HinetController
    {
        private readonly IKPI_PhieuDanhGiaService _kPI_PhieuDanhGiaService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;

        private readonly IDepartmentService _departmentService;
        private readonly IKPI_LyLich2CService _kpiLyLich2CService;
        private readonly IAppUserService _appUserService;
        private readonly ILogger<KPI_PhieuDanhGiaController> _logger;

        public KPI_PhieuDanhGiaController(
            IKPI_PhieuDanhGiaService kPI_PhieuDanhGiaService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            IDepartmentService departmentService,
            IKPI_LyLich2CService kpiLyLich2CService,
            IAppUserService appUserService,
            ILogger<KPI_PhieuDanhGiaController> logger
            )
        {
            this._kPI_PhieuDanhGiaService = kPI_PhieuDanhGiaService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            _departmentService = departmentService;
            _kpiLyLich2CService = kpiLyLich2CService;
            _appUserService = appUserService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_PhieuDanhGia>> Create([FromBody] KPI_PhieuDanhGiaCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_PhieuDanhGiaCreateVM, KPI_PhieuDanhGia>(model);
                await _kPI_PhieuDanhGiaService.CreateAsync(entity);
                return DataResponse<KPI_PhieuDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_PhieuDanhGia");
                return DataResponse<KPI_PhieuDanhGia>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }

        [HttpPost("InitPhieuDanhGia")]
        public async Task<DataResponse<Guid>> InitPhieuDanhGia([FromQuery] Guid idDotDanhGia, [FromQuery] Guid idLyLich)
        {
            try
            {
                var existingPhieu = await _kPI_PhieuDanhGiaService.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdDotDanhGia == idDotDanhGia && x.IdLyLich == idLyLich && x.IsDeleted == false);

                if (existingPhieu != null)
                {
                    return DataResponse<Guid>.Success(existingPhieu.Id);
                }

                var lyLich = await _kpiLyLich2CService.GetByIdAsync(idLyLich);

                var newPhieu = new KPI_PhieuDanhGia
                {
                    IdDotDanhGia = idDotDanhGia,
                    IdLyLich = idLyLich,
                    DonVi = lyLich?.DonViSuDungId,
                    PhongBan = lyLich?.PhongBanId.ToString(),
                    TrangThai = "KhoiTao",
                    CreatedDate = DateTime.Now,
                    CreatedBy = UserId?.ToString(),
                };

                await _kPI_PhieuDanhGiaService.CreateAsync(newPhieu);

                return DataResponse<Guid>.Success(newPhieu.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi InitPhieuDanhGia");
                return DataResponse<Guid>.False("Đã xảy ra lỗi khi tạo phiếu.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_PhieuDanhGia>> Update([FromBody] KPI_PhieuDanhGiaEditVM model)
        {
            try
            {
                var entity = await _kPI_PhieuDanhGiaService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_PhieuDanhGia>.False("KPI_PhieuDanhGia không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_PhieuDanhGiaService.UpdateAsync(entity);
                return DataResponse<KPI_PhieuDanhGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_PhieuDanhGia với Id: {Id}", model.Id);
                return new DataResponse<KPI_PhieuDanhGia>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_PhieuDanhGiaDto>> Get(Guid id)
        {
            var dto = await _kPI_PhieuDanhGiaService.GetDto(id);
            return DataResponse<KPI_PhieuDanhGiaDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_PhieuDanhGiaDto>>> GetData([FromBody] KPI_PhieuDanhGiaSearch search)
        {
            var data = await _kPI_PhieuDanhGiaService.GetData(search);
            return DataResponse<PagedList<KPI_PhieuDanhGiaDto>>.Success(data);
        }

        [HttpPost("GetDotDanhGiaWithPhieu/{userId}")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<DotDanhGiaWithPhieuDto>>> GetDotDanhGiaWithPhieu(Guid userId, [FromBody] KPI_PhieuDanhGiaSearch search)
        {
            var data = await _kPI_PhieuDanhGiaService.GetDotDanhGiaWithPhieu(userId, search);
            return DataResponse<PagedList<DotDanhGiaWithPhieuDto>>.Success(data);
        }

        [HttpPost("GetDanhSachNhanSuDanhGia/{userId}")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<DotDanhGiaWithPhieuDto>>> GetDanhSachNhanSuDanhGia(Guid userId, [FromBody] KPI_PhieuDanhGiaSearch search)
        {
            var currentUserId = UserId ?? userId;
            var data = await _kPI_PhieuDanhGiaService.GetDanhSachNhanSuDanhGia(currentUserId, search);
            return DataResponse<PagedList<DotDanhGiaWithPhieuDto>>.Success(data);
        }

        [HttpPost("GetThongKePhieuDanhGiaTheoThang/{userId}")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<List<ThongKePhieuDanhGiaTheoThangDto>>> GetThongKePhieuDanhGiaTheoThang(Guid userId, [FromBody] KPI_PhieuDanhGiaSearch search)
        {
            var data = await _kPI_PhieuDanhGiaService.GetThongKePhieuDanhGiaTheoThang(userId, search);
            return DataResponse<List<ThongKePhieuDanhGiaTheoThangDto>>.Success(data);
        }

        [HttpPost("GetTabCounts/{userId}")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<KPI_PhieuDanhGiaTabCountDto>> GetTabCounts(Guid userId, [FromBody] KPI_PhieuDanhGiaSearch search)
        {
            var data = await _kPI_PhieuDanhGiaService.GetTabCounts(userId, search);
            return DataResponse<KPI_PhieuDanhGiaTabCountDto>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_PhieuDanhGiaService.GetByIdAsync(id);
                await _kPI_PhieuDanhGiaService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_PhieuDanhGia với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpPost("ChuyenBuocLuong")]
        public async Task<DataResponse> ChuyenBuocLuong([FromBody] ChuyenBuocLuongRequest request)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaService.ChuyenBuocLuong(request);
                return DataResponse.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chuyển bước luồng phiếu đánh giá");
                return DataResponse.False(ex.Message);
            }
        }

        [HttpPost("ThuHoiPhieu")]
        public async Task<DataResponse> ThuHoiPhieu([FromBody] ThuHoiPhieuRequest request)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaService.ThuHoiPhieu(request);
                return DataResponse.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thu hồi phiếu đánh giá");
                return DataResponse.False(ex.Message);
            }
        }

        [HttpGet("GetNguoiXuLy/{idPhieuDanhGia}/{chucVuNguoiXuLy}")]
        public async Task<DataResponse<List<NguoiXuLyDto>>> GetNguoiXuLy(Guid idPhieuDanhGia, string chucVuNguoiXuLy)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaService.GetNguoiXuLyTheoChucVu(idPhieuDanhGia, chucVuNguoiXuLy);
                return DataResponse<List<NguoiXuLyDto>>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách người xử lý");
                return DataResponse<List<NguoiXuLyDto>>.False("Đã xảy ra lỗi khi lấy danh sách người xử lý.");
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
                var search = new KPI_PhieuDanhGiaSearch();
                var data = await _kPI_PhieuDanhGiaService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_PhieuDanhGiaDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_PhieuDanhGia");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_PhieuDanhGia>(rootPath, "KPI_PhieuDanhGia");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_PhieuDanhGia>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_PhieuDanhGia>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_PhieuDanhGia>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_PhieuDanhGia>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_PhieuDanhGiaService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_PhieuDanhGia>();


                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }

        [HttpGet("CheckQuyenChamDiem")]
        public async Task<DataResponse<CheckQuyenChamDiemDto>> CheckQuyenChamDiem([FromQuery] Guid? idPhieuDanhGia, [FromQuery] Guid? idLyLich, [FromQuery] Guid? idDotDanhGia)
        {
            try
            {
                var result = await _kPI_PhieuDanhGiaService.CheckQuyenChamDiem(idPhieuDanhGia, idLyLich, idDotDanhGia);
                return DataResponse<CheckQuyenChamDiemDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra quyền chấm điểm");
                return DataResponse<CheckQuyenChamDiemDto>.False("Lỗi khi kiểm tra quyền chấm điểm");
            }
        }

        [HttpGet("CheckIsVuToChucCanBo")]
        public async Task<DataResponse<bool>> CheckIsVuToChucCanBo(

            [FromQuery] Guid? idLyLich = null,
            [FromQuery] Guid? idUser = null)
        {
            try
            {
                Guid? targetDonViId = null;

                if (idLyLich.HasValue && idLyLich.Value != Guid.Empty)
                {
                    var lyLich = await _kpiLyLich2CService.GetByIdAsync(idLyLich.Value);
                    if (lyLich != null)
                    {
                        targetDonViId = lyLich.DonViSuDungId;
                    }
                }
                else if (idUser.HasValue && idUser.Value != Guid.Empty)
                {
                    var user = await _appUserService.GetByIdAsync(idUser.Value);
                    if (user != null)
                    {
                        targetDonViId = user.DonViId;
                    }
                }
                else
                {
                    // Fallback to current user token
                    targetDonViId = DonViId;
                }

                if (targetDonViId.HasValue && targetDonViId.Value != Guid.Empty)
                {
                    var donVi = await _departmentService.GetByIdAsync(targetDonViId.Value);
                    while (donVi != null)
                    {
                        var name = donVi.Name?.ToLower() ?? "";
                        var code = donVi.Code?.ToLower() ?? "";

                        if (name.Contains("tổ chức cán bộ") || code.Contains("vu_tccb") || code.Contains("tccb") || name.Contains("tổ chức - cán bộ"))
                        {
                            return DataResponse<bool>.Success(true);
                        }

                        if (donVi.ParentId.HasValue && donVi.ParentId != Guid.Empty)
                        {
                            donVi = await _departmentService.GetByIdAsync(donVi.ParentId.Value);
                        }
                        else
                        {
                            break;
                        }
                    }
                }
                return DataResponse<bool>.Success(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra vụ tổ chức cán bộ");
                return DataResponse<bool>.False("Đã xảy ra lỗi khi kiểm tra.");
            }
        }

    }
}
