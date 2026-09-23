using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
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
using Hinet.Repository.KPI_PhieuDanhGiaRepository;
using Hinet.Service.KPI_PhieuDanhGiaService;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService.Dto;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_DashboardController : HinetController
    {

        private readonly IKPI_LyLich2CService _kPI_LyLich2CService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly ILogger<KPI_LyLich2CController> _logger;
        private readonly IMapper _mapper;
        private readonly IAppUserService _appUserService;
        private readonly IKPI_PhieuDanhGiaService _kPI_PhieuDanhGiaService;
        private readonly IKPI_DotTheoDoiDanhGiaService _kPI_DotTheoDoiDanhGiaService;
        public KPI_DashboardController(
                IKPI_LyLich2CService kPI_LyLich2CService,
                ITaiLieuDinhKemService taiLieuDinhKemService,
                IMapper mapper,
                IAppUserService appUserService,
                ILogger<KPI_LyLich2CController> logger,
                IKPI_PhieuDanhGiaService kPI_PhieuDanhGiaService,
                IKPI_DotTheoDoiDanhGiaService kPI_DotTheoDoiDanhGiaService
            )
        {
            _logger = logger;
            this._kPI_LyLich2CService = kPI_LyLich2CService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            this._appUserService = appUserService;
            _kPI_PhieuDanhGiaService = kPI_PhieuDanhGiaService;
            _kPI_DotTheoDoiDanhGiaService = kPI_DotTheoDoiDanhGiaService;
        }


        [HttpGet("GetDataKhoiThongKeCaNhan")]
        public async Task<JsonResult> GetDataKhoiThongKeCaNhan(Guid? IdLyLich)
        {
            var yearNow = DateTime.Now.Year;
            var AllDotDanhGia = _kPI_DotTheoDoiDanhGiaService.GetQueryable().Where(x => x.Nam == yearNow && x.TrangThai == "ACTIVE").ToList();

            var AllPhieuDahGia = _kPI_PhieuDanhGiaService.GetQueryable().Where(x => x.IdLyLich == IdLyLich).ToList();

            // Lấy các phiếu đánh giá thuộc các đợt đánh giá của năm nay
            var phieuDanhGiaNamNay = AllPhieuDahGia.Where(p => AllDotDanhGia.Any(d => d.Id == p.IdDotDanhGia)).ToList();

            // 1. Tính số lượng Chờ đánh giá
            var soDotDaCoPhieu = phieuDanhGiaNamNay.Select(x => x.IdDotDanhGia).Distinct().Count();
            var soDotChuaCoPhieu = AllDotDanhGia.Count - soDotDaCoPhieu;
            var choDanhGia = soDotChuaCoPhieu + phieuDanhGiaNamNay.Count(x => x.TrangThai == "KhoiTao");

            // 2. Tính số lượng Đã hoàn thành (Năm nay)
            var daHoanThanh = phieuDanhGiaNamNay.Count(x => x.TrangThai == "DaDuyet");

            // 3. Tính điểm trung bình (Năm nay) của các phiếu đã hoàn thành
            var diemTrungBinh = phieuDanhGiaNamNay
                .Where(x => x.TrangThai == "DaDuyet" && x.TongDiem.HasValue)
                .Average(x => x.TongDiem) ?? 0;

            // 4. Tìm Xếp loại gần nhất
            var phieuGanNhat = AllPhieuDahGia
                .Where(x => x.TrangThai == "DaDuyet")
                .OrderByDescending(x => x.CreatedDate)
                .FirstOrDefault();

            var xepLoaiGanNhat = "Chưa có";
            if (phieuGanNhat != null && phieuGanNhat.TongDiem.HasValue)
            {
                var diem = phieuGanNhat.TongDiem.Value;
                if (diem >= 90) xepLoaiGanNhat = "Hoàn thành xuất sắc";
                else if (diem >= 70) xepLoaiGanNhat = "Hoàn thành tốt";
                else if (diem >= 50) xepLoaiGanNhat = "Hoàn thành nhiệm vụ";
                else xepLoaiGanNhat = "Không hoàn thành";
            }

            return new JsonResult(new
            {
                Status = true,
                Message = "Thành công",
                Data = new
                {
                    ChoDanhGia = choDanhGia,
                    DaHoanThanh = daHoanThanh,
                    DiemTrungBinh = Math.Round(diemTrungBinh, 1),
                    XepLoaiGanNhat = xepLoaiGanNhat
                }
            });
        }

        [HttpGet("GetThongKeDiemNhanSu")]
        public async Task<IActionResult> GetThongKeDiemNhanSu(
            [FromQuery] string chucVuCode,
            [FromQuery] Guid idDotDanhGia,
            [FromQuery] string? vaiTroDanhGia = null)
        {
            if (!HasRole(RoleConstant.CucTruong) && !HasRole(RoleConstant.PhoCucTruong))
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    DataResponse<List<ThongKeDiemNhanSuDto>>.False("Bạn không có quyền xem thống kê điểm nhân sự."));
            }

            if (string.IsNullOrWhiteSpace(chucVuCode))
            {
                return BadRequest(DataResponse<List<ThongKeDiemNhanSuDto>>.False("Vui lòng chọn chức vụ."));
            }

            if (idDotDanhGia == Guid.Empty)
            {
                return BadRequest(DataResponse<List<ThongKeDiemNhanSuDto>>.False("Vui lòng chọn đợt đánh giá."));
            }

            try
            {
                var data = await _kPI_PhieuDanhGiaService.ThongKeDiemNhanSuTheoChucVu(chucVuCode, idDotDanhGia, vaiTroDanhGia);
                return Ok(DataResponse<List<ThongKeDiemNhanSuDto>>.Success(data));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(DataResponse<List<ThongKeDiemNhanSuDto>>.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy thống kê điểm nhân sự theo chức vụ và đợt đánh giá");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    DataResponse<List<ThongKeDiemNhanSuDto>>.False("Không thể lấy thống kê điểm nhân sự."));
            }
        }

        [HttpGet("GetPhongBanSoSanh")]
        public async Task<IActionResult> GetPhongBanSoSanh()
        {
            var isCapCuc = HasRole(RoleConstant.CucTruong) || HasRole(RoleConstant.PhoCucTruong);
            var isCapPhong = HasRole(RoleConstant.TruongPhong) || HasRole(RoleConstant.PhoTruongPhong);
            if (!isCapCuc && !isCapPhong)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    DataResponse<List<PhongBanSoSanhDto>>.False("Bạn không có quyền xem danh sách phòng ban so sánh."));
            }

            if (!UserId.HasValue || UserId.Value == Guid.Empty)
            {
                return Unauthorized(DataResponse<List<PhongBanSoSanhDto>>.False("Không xác định được tài khoản đăng nhập."));
            }

            try
            {
                var data = await _kPI_PhieuDanhGiaService.GetPhongBanSoSanh(
                    UserId.Value,
                    onlyCurrentPhongBan: !isCapCuc && isCapPhong);
                return Ok(DataResponse<List<PhongBanSoSanhDto>>.Success(data));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách phòng ban so sánh điểm nhân sự");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    DataResponse<List<PhongBanSoSanhDto>>.False("Không thể lấy danh sách phòng ban."));
            }
        }

        [HttpGet("GetPhamViSoSanhNhanSu")]
        public async Task<IActionResult> GetPhamViSoSanhNhanSu()
        {
            var isCapCuc = HasRole(RoleConstant.CucTruong) || HasRole(RoleConstant.PhoCucTruong);
            var isCapPhong = HasRole(RoleConstant.TruongPhong) || HasRole(RoleConstant.PhoTruongPhong);
            if (!isCapCuc && !isCapPhong)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    DataResponse<PhamViSoSanhNhanSuDto>.False("Bạn không có quyền xem phạm vi so sánh nhân sự."));
            }

            if (!UserId.HasValue || UserId.Value == Guid.Empty)
            {
                return Unauthorized(DataResponse<PhamViSoSanhNhanSuDto>.False("Không xác định được tài khoản đăng nhập."));
            }

            try
            {
                var data = await _kPI_PhieuDanhGiaService.GetPhamViSoSanhNhanSu(UserId.Value);
                return Ok(DataResponse<PhamViSoSanhNhanSuDto>.Success(data));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(DataResponse<PhamViSoSanhNhanSuDto>.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xác định phạm vi so sánh điểm nhân sự");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    DataResponse<PhamViSoSanhNhanSuDto>.False("Không thể xác định phạm vi so sánh nhân sự."));
            }
        }

        [HttpGet("GetNhanSuSoSanh")]
        public async Task<IActionResult> GetNhanSuSoSanh([FromQuery] Guid? phongBanId)
        {
            var isCapCuc = HasRole(RoleConstant.CucTruong) || HasRole(RoleConstant.PhoCucTruong);
            var isCapPhong = HasRole(RoleConstant.TruongPhong) || HasRole(RoleConstant.PhoTruongPhong);
            if (!isCapCuc && !isCapPhong)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    DataResponse<List<NhanSuSoSanhDto>>.False("Bạn không có quyền xem danh sách nhân sự so sánh."));
            }

            if (!UserId.HasValue || UserId.Value == Guid.Empty)
            {
                return Unauthorized(DataResponse<List<NhanSuSoSanhDto>>.False("Không xác định được tài khoản đăng nhập."));
            }

            try
            {
                var phamVi = await _kPI_PhieuDanhGiaService.GetPhamViSoSanhNhanSu(UserId.Value);
                var theoDonViSuDung = isCapCuc && phamVi.TheoDonViSuDung;
                if (isCapCuc && !theoDonViSuDung && (!phongBanId.HasValue || phongBanId.Value == Guid.Empty))
                {
                    return BadRequest(DataResponse<List<NhanSuSoSanhDto>>.False("Vui lòng chọn phòng ban."));
                }

                var data = await _kPI_PhieuDanhGiaService.GetNhanSuSoSanh(
                    UserId.Value,
                    isCapCuc ? phongBanId : null,
                    theoDonViSuDung);
                return Ok(DataResponse<List<NhanSuSoSanhDto>>.Success(data));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(DataResponse<List<NhanSuSoSanhDto>>.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách nhân sự so sánh điểm");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    DataResponse<List<NhanSuSoSanhDto>>.False("Không thể lấy danh sách nhân sự."));
            }
        }

        [HttpPost("GetSoSanhDiemNhanSu")]
        public async Task<IActionResult> GetSoSanhDiemNhanSu([FromBody] SoSanhDiemNhanSuRequest request)
        {
            var isCapCuc = HasRole(RoleConstant.CucTruong) || HasRole(RoleConstant.PhoCucTruong);
            var isCapPhong = HasRole(RoleConstant.TruongPhong) || HasRole(RoleConstant.PhoTruongPhong);
            if (!isCapCuc && !isCapPhong)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    DataResponse<SoSanhDiemNhanSuDto>.False("Bạn không có quyền xem so sánh điểm nhân sự."));
            }

            if (!UserId.HasValue || UserId.Value == Guid.Empty)
            {
                return Unauthorized(DataResponse<SoSanhDiemNhanSuDto>.False("Không xác định được tài khoản đăng nhập."));
            }

            if (request == null)
            {
                return BadRequest(DataResponse<SoSanhDiemNhanSuDto>.False("Dữ liệu so sánh không hợp lệ."));
            }

            try
            {
                var data = await _kPI_PhieuDanhGiaService.GetSoSanhDiemNhanSu(
                    UserId.Value,
                    request,
                    restrictToCurrentPhongBan: !isCapCuc && isCapPhong);
                return Ok(DataResponse<SoSanhDiemNhanSuDto>.Success(data));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(DataResponse<SoSanhDiemNhanSuDto>.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy so sánh điểm giữa hai nhân sự");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    DataResponse<SoSanhDiemNhanSuDto>.False("Không thể lấy dữ liệu so sánh điểm nhân sự."));
            }
        }

        [HttpGet("GetTopSoSanhDiemNhanSu")]
        public async Task<IActionResult> GetTopSoSanhDiemNhanSu([FromQuery] Guid idDotDanhGia)
        {
            var isCapCuc = HasRole(RoleConstant.CucTruong) || HasRole(RoleConstant.PhoCucTruong);
            var isCapPhong = HasRole(RoleConstant.TruongPhong) || HasRole(RoleConstant.PhoTruongPhong);
            if (!isCapCuc && !isCapPhong)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    DataResponse<SoSanhDiemNhanSuDto>.False("Bạn không có quyền xem so sánh điểm nhân sự."));
            }

            if (!UserId.HasValue || UserId.Value == Guid.Empty)
            {
                return Unauthorized(DataResponse<SoSanhDiemNhanSuDto>.False("Không xác định được tài khoản đăng nhập."));
            }

            if (idDotDanhGia == Guid.Empty)
            {
                return BadRequest(DataResponse<SoSanhDiemNhanSuDto>.False("Vui lòng chọn đợt đánh giá."));
            }

            try
            {
                var data = await _kPI_PhieuDanhGiaService.GetTopSoSanhDiemNhanSu(
                    UserId.Value,
                    idDotDanhGia,
                    restrictToCurrentPhongBan: !isCapCuc && isCapPhong);
                return Ok(DataResponse<SoSanhDiemNhanSuDto>.Success(data));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(DataResponse<SoSanhDiemNhanSuDto>.False(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tự động lấy hai nhân sự có điểm cao nhất để so sánh");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    DataResponse<SoSanhDiemNhanSuDto>.False("Không thể lấy dữ liệu so sánh điểm nhân sự."));
            }
        }

        [HttpGet("GetThongKeNhanSuPhongBan")]
        public async Task<IActionResult> GetThongKeNhanSuPhongBan()
        {
            var currentUserLyLich = _kPI_LyLich2CService.GetQueryable().FirstOrDefault(x => x.UserId == UserId);
            var isCapCuc = HasRole(RoleConstant.CucTruong) || HasRole(RoleConstant.PhoCucTruong) || HasRole(RoleConstant.Admin) || HasRole(RoleConstant.LanhDaoCuc);
            if (!isCapCuc && currentUserLyLich != null)
            {
                if (ChucVuConstant.ChucVuCucTruong.Contains(currentUserLyLich.ChucVuHienTai) ||
                    ChucVuConstant.ChucVuPhoCucTruong.Contains(currentUserLyLich.ChucVuHienTai) ||
                    ChucVuConstant.LanhDaoCap2.Contains(currentUserLyLich.ChucVuHienTai))
                {
                    isCapCuc = true;
                }
            }

            var isCapPhong = HasRole(RoleConstant.TruongPhong) || HasRole(RoleConstant.PhoTruongPhong) || HasRole(RoleConstant.TruongPhongCuc) || HasRole(RoleConstant.TruongPhongSo);
            if (!isCapPhong && currentUserLyLich != null)
            {
                if (ChucVuConstant.ChucVuTruongPhong.Contains(currentUserLyLich.ChucVuHienTai) ||
                    ChucVuConstant.ChucVuPhoTruongPhong.Contains(currentUserLyLich.ChucVuHienTai))
                {
                    isCapPhong = true;
                }
            }

            var donViId = currentUserLyLich?.DonViSuDungId;
            var phongBanId = currentUserLyLich?.PhongBanId;

            var search = new KPI_LyLich2CSearch
            {
                PageIndex = 1,
                PageSize = 5000,
            };

            if (!isCapCuc && (isCapPhong || (phongBanId.HasValue && phongBanId.Value != Guid.Empty)))
            {
                search.PhongBanId = phongBanId;
                search.DonViSuDungId = donViId;
            }
            else if (donViId.HasValue && donViId.Value != Guid.Empty && !HasRole("Admin"))
            {
                search.DonViSuDungId = donViId;
            }

            var pagedData = await _kPI_LyLich2CService.GetData(search);
            return Ok(DataResponse<PagedList<KPI_LyLich2CDto>>.Success(pagedData));
        }

    }
}
