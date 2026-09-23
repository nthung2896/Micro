using DocumentFormat.OpenXml.Vml.Spreadsheet;
using Hinet.Model.Entities;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Repository.KPI_DauRaNhiemVu_ChiTietDanhGiaRepository;
using Hinet.Repository.KPI_DauRaNhiemVuRepository;
using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;
using Hinet.Repository.KPI_KetQuaThucHienNhiemVuRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.KPI_NhiemVuRepository;
using Hinet.Repository.KPI_PhieuDanhGiaRepository;
using Hinet.Repository.KPI_QuaTrinhXuLyPhieuDanhGiaRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSo_CapTrenRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSoRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;
using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_TieuChiChung_DiemSoService.Dto;
using Hinet.Service.KPI_TieuChiChungService;
using Hinet.Service.KPI_TieuChiChungService.Dto;
using Microsoft.EntityFrameworkCore;



namespace Hinet.Service.KPI_TieuChiChung_DiemSoService
{
    public class KPI_TieuChiChung_DiemSoService : Service<KPI_TieuChiChung_DiemSo>, IKPI_TieuChiChung_DiemSoService
    {
        private readonly IKPI_LyLich2CRepository _kPI_LyLich2CRepository;
        private readonly IKPI_PhieuDanhGiaRepository _kpi_PhieuDanhGiaRepository;
        private readonly IKPI_NhiemVuRepository _kPI_NhiemVuRepository;
        private readonly IKPI_DotTheoDoiDanhGiaRepository _kPI_DotTheoDoiDanhGiaRepository;
        private readonly IDM_DuLieuDanhMucRepository _dm_DuLieuDanhMucRepository;
        private readonly IDM_NhomDanhMucRepository _dm_NhomDanhMucRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IKPI_DauRaNhiemVuRepository _kPI_DauRaNhiemVuRepository;
        private readonly IKPI_DauRaNhiemVu_ChiTietDanhGiaRepository _kPI_DauRaNhiemVu_ChiTietDanhGiaRepository;
        private readonly IKPI_TieuChiChung_DiemSo_CapTrenRepository _kPI_TieuChiChung_DiemSo_CapTrenRepository;
        private readonly IKPI_KetQuaThucHienNhiemVuRepository _kPI_KetQuaThucHienNhiemVuRepository;
        private readonly IKPI_QuaTrinhXuLyPhieuDanhGiaRepository _kPI_QuaTrinhXuLyPhieuDanhGiaRepository;

        private readonly IKPI_TieuChiChungService _kPI_TieuChiChungService;
        public KPI_TieuChiChung_DiemSoService(
            IKPI_TieuChiChung_DiemSoRepository kPI_TieuChiChung_DiemSoRepository,
            IKPI_LyLich2CRepository kPI_LyLich2CRepository,
            IKPI_DotTheoDoiDanhGiaRepository kPI_DotTheoDoiDanhGiaRepository,
            IKPI_NhiemVuRepository kPI_NhiemVuRepository,
            IDM_DuLieuDanhMucRepository dm_DuLieuDanhMucRepository,
            IDM_NhomDanhMucRepository dm_NhomDanhMucRepository,
            IDepartmentRepository departmentRepository,
            IKPI_PhieuDanhGiaRepository kpi_PhieuDanhGiaRepository,
            IKPI_DauRaNhiemVuRepository kPI_DauRaNhiemVuRepository,
            IKPI_DauRaNhiemVu_ChiTietDanhGiaRepository kPI_DauRaNhiemVu_ChiTietDanhGiaRepository,
            IKPI_TieuChiChung_DiemSo_CapTrenRepository kPI_TieuChiChung_DiemSo_CapTrenRepository,
            IKPI_KetQuaThucHienNhiemVuRepository kPI_KetQuaThucHienNhiemVuRepository,
            IKPI_QuaTrinhXuLyPhieuDanhGiaRepository kPI_QuaTrinhXuLyPhieuDanhGiaRepository,
            IKPI_TieuChiChungService kPI_TieuChiChungService) : base(kPI_TieuChiChung_DiemSoRepository)
        {
            _kPI_LyLich2CRepository = kPI_LyLich2CRepository;
            _kPI_NhiemVuRepository = kPI_NhiemVuRepository;
            _kPI_DotTheoDoiDanhGiaRepository = kPI_DotTheoDoiDanhGiaRepository;
            _dm_DuLieuDanhMucRepository = dm_DuLieuDanhMucRepository;
            _dm_NhomDanhMucRepository = dm_NhomDanhMucRepository;
            _departmentRepository = departmentRepository;
            _kpi_PhieuDanhGiaRepository = kpi_PhieuDanhGiaRepository;
            _kPI_DauRaNhiemVuRepository = kPI_DauRaNhiemVuRepository;
            _kPI_DauRaNhiemVu_ChiTietDanhGiaRepository = kPI_DauRaNhiemVu_ChiTietDanhGiaRepository;
            _kPI_TieuChiChung_DiemSo_CapTrenRepository = kPI_TieuChiChung_DiemSo_CapTrenRepository;
            _kPI_KetQuaThucHienNhiemVuRepository = kPI_KetQuaThucHienNhiemVuRepository;
            _kPI_QuaTrinhXuLyPhieuDanhGiaRepository = kPI_QuaTrinhXuLyPhieuDanhGiaRepository;
            _kPI_TieuChiChungService = kPI_TieuChiChungService;
        }

        public async Task<PagedList<KPI_TieuChiChung_DiemSoDto>> GetData(KPI_TieuChiChung_DiemSoSearch search)
        {
            var query = from q in GetQueryable()

                        select new KPI_TieuChiChung_DiemSoDto()
                        {
                            IdTieuChiChung = q.IdTieuChiChung,
                            IdLyLich = q.IdLyLich,
                            IdDotDanhGia = q.IdDotDanhGia,
                            IdPhieuDanhGia = q.IdPhieuDanhGia,
                            DiemTuCham = q.DiemTuCham,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                        };
            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.IdTieuChiChung) && Guid.TryParse(search.IdTieuChiChung, out var idTieuChiChung))
                {
                    query = query.Where(x => x.IdTieuChiChung == idTieuChiChung);
                }
                if (!string.IsNullOrEmpty(search.IdLyLich) && Guid.TryParse(search.IdLyLich, out var idLyLich))
                {
                    query = query.Where(x => x.IdLyLich == idLyLich);
                }
                if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotDanhGia))
                {
                    query = query.Where(x => x.IdDotDanhGia == idDotDanhGia);
                }
                if (search.DiemTuCham.HasValue)
                {
                    query = query.Where(x => x.DiemTuCham == search.DiemTuCham);
                }
            }
            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_TieuChiChung_DiemSoDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_TieuChiChung_DiemSoDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)

                              select new KPI_TieuChiChung_DiemSoDto()
                              {
                                  IdTieuChiChung = q.IdTieuChiChung,
                                  IdLyLich = q.IdLyLich,
                                  IdDotDanhGia = q.IdDotDanhGia,
                                  DiemTuCham = q.DiemTuCham,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  //IsDelete = q.IsDelete,
                                  //DeleteId = q.DeleteId,
                                  //DeleteTime = q.DeleteTime,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  Id = q.Id,
                              }).FirstOrDefaultAsync();

            return item;
        }

        public async Task<KPI_TieuChiChung_DiemSoKeThuaResponseDto> GetDanhSachKeThua(Guid idDotDanhGia, Guid currentUserId)
        {
            if (idDotDanhGia == Guid.Empty)
            {
                throw new InvalidOperationException("Đợt đánh giá không hợp lệ.");
            }

            if (currentUserId == Guid.Empty)
            {
                throw new InvalidOperationException("Không xác định được người dùng đăng nhập.");
            }

            var lyLich = await _kPI_LyLich2CRepository.GetQueryable()
                .Where(x => x.UserId == currentUserId)
                .OrderByDescending(x => x.UpdatedDate)
                .ThenByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            if (lyLich == null)
            {
                throw new InvalidOperationException("Không tìm thấy hồ sơ nhân sự của người dùng đăng nhập.");
            }

            // Dùng cùng resolver với GetTreeDataForDot để bộ tiêu chí ở modal
            // không thể khác bộ tiêu chí đang hiển thị ở phiếu hiện tại.
            var boTieuChiHienTai = await _kPI_TieuChiChungService.GetBoTieuChiChungApDungForDot(
                idDotDanhGia,
                lyLich.Id,
                null);

            var result = new KPI_TieuChiChung_DiemSoKeThuaResponseDto
            {
                IdBoTieuChiChung = boTieuChiHienTai?.IdBoTieuChiChung,
                TenBoTieuChiChung = boTieuChiHienTai?.TenBoTieuChiChung
            };

            if (boTieuChiHienTai == null)
            {
                return result;
            }

            // Chỉ cho phép kế thừa từ phiếu đã được duyệt, thuộc chính người dùng,
            // khác đợt hiện tại và dùng cùng bộ tiêu chí chung.
            var phieuNguon = await (
                from phieu in _kpi_PhieuDanhGiaRepository.GetQueryable()
                join dot in _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                    on phieu.IdDotDanhGia equals (Guid?)dot.Id
                where phieu.IdLyLich == lyLich.Id
                    && phieu.IdDotDanhGia.HasValue
                    && phieu.IdDotDanhGia.Value != idDotDanhGia
                    && phieu.TrangThai == TrangThaiPhieuConstant.DaDuyet
                select new
                {
                    IdDotDanhGia = phieu.IdDotDanhGia.Value,
                    TenDotDanhGia = dot.TenDotTheoDoiDanhGia,
                    IdPhieuDanhGia = phieu.Id,
                    ThoiGianBatDau = dot.ThoiGianBatDau,
                    DotCreatedDate = dot.CreatedDate,
                    PhieuUpdatedDate = phieu.UpdatedDate,
                    PhieuCreatedDate = phieu.CreatedDate
                })
                .ToListAsync();

            // Mỗi đợt chỉ xuất hiện một lần. Trường hợp dữ liệu cũ có nhiều
            // phiếu cho cùng đợt, lấy phiếu cập nhật gần nhất một cách xác định.
            var phieuNguonTheoDot = phieuNguon
                .GroupBy(x => x.IdDotDanhGia)
                .Select(group => group
                    .OrderByDescending(x => x.PhieuUpdatedDate)
                    .ThenByDescending(x => x.PhieuCreatedDate)
                    .ThenByDescending(x => x.IdPhieuDanhGia)
                    .First())
                .OrderByDescending(x => x.ThoiGianBatDau ?? DateTime.MinValue)
                .ThenByDescending(x => x.DotCreatedDate)
                .ThenByDescending(x => x.PhieuCreatedDate)
                .ToList();

            var nguonCungBoTieuChi = new List<(Guid IdDotDanhGia, string? TenDotDanhGia, Guid IdPhieuDanhGia)>();
            foreach (var phieu in phieuNguonTheoDot)
            {
                // So sánh theo bộ tiêu chí được resolver áp dụng cho chính đợt nguồn
                // và hồ sơ của người dùng hiện tại, không suy ra từ các dòng điểm.
                var boTieuChiNguon = await _kPI_TieuChiChungService.GetBoTieuChiChungApDungForDot(
                    phieu.IdDotDanhGia,
                    lyLich.Id,
                    phieu.IdPhieuDanhGia);

                if (boTieuChiNguon?.IdBoTieuChiChung == boTieuChiHienTai.IdBoTieuChiChung)
                {
                    nguonCungBoTieuChi.Add((phieu.IdDotDanhGia, phieu.TenDotDanhGia, phieu.IdPhieuDanhGia));
                }
            }

            if (nguonCungBoTieuChi.Count == 0)
            {
                return result;
            }

            var idPhieuNguon = nguonCungBoTieuChi.Select(x => x.IdPhieuDanhGia).ToList();
            var idDotNguon = nguonCungBoTieuChi.Select(x => x.IdDotDanhGia).Distinct().ToList();
            var diemNguon = await GetQueryable()
                .Where(x =>
                    (x.IdPhieuDanhGia.HasValue && idPhieuNguon.Contains(x.IdPhieuDanhGia.Value))
                    || (x.IdLyLich == lyLich.Id
                        && x.IdDotDanhGia.HasValue
                        && idDotNguon.Contains(x.IdDotDanhGia.Value)))
                .ToListAsync();

            foreach (var nguon in nguonCungBoTieuChi)
            {
                // Ưu tiên dòng điểm gắn trực tiếp với phiếu. Chỉ fallback theo
                // lý lịch/đợt cho dữ liệu cũ khi phiếu hoàn toàn chưa có dòng điểm.
                var diemTheoPhieu = diemNguon
                    .Where(x => x.IdPhieuDanhGia == nguon.IdPhieuDanhGia)
                    .ToList();
                var diemApDung = diemTheoPhieu.Count > 0
                    ? diemTheoPhieu
                    : diemNguon
                        .Where(x => x.IdLyLich == lyLich.Id && x.IdDotDanhGia == nguon.IdDotDanhGia)
                        .ToList();

                var diemTheoTieuChi = diemApDung
                    .Where(x => x.IdTieuChiChung.HasValue)
                    .OrderBy(x => x.UpdatedDate)
                    .ThenBy(x => x.CreatedDate)
                    .ThenBy(x => x.Id)
                    .GroupBy(x => x.IdTieuChiChung!.Value)
                    .ToDictionary(group => group.Key, group => (decimal?)(group.Last().DiemTuCham ?? 0m));

                var cayTieuChi = await _kPI_TieuChiChungService.GetTreeDataForBoTieuChiChung(
                    boTieuChiHienTai.IdBoTieuChiChung,
                    diemTheoTieuChi);
                var cayTieuChiKeThua = ChuyenCayTieuChiKeThua(cayTieuChi);

                result.DanhSachNguon.Add(new KPI_TieuChiChung_DiemSoKeThuaNguonDto
                {
                    IdDotDanhGia = nguon.IdDotDanhGia,
                    TenDotDanhGia = nguon.TenDotDanhGia,
                    IdPhieuDanhGia = nguon.IdPhieuDanhGia,
                    TongDiemTieuChiChung = TinhTongDiemTieuChiLa(cayTieuChiKeThua),
                    CayTieuChi = cayTieuChiKeThua
                });
            }

            return result;
        }

        private static List<KPI_TieuChiChung_DiemSoKeThuaTieuChiDto> ChuyenCayTieuChiKeThua(
            IEnumerable<KPI_TieuChiChungTreeDto> cayTieuChi)
        {
            return cayTieuChi.Select(tieuChi => new KPI_TieuChiChung_DiemSoKeThuaTieuChiDto
            {
                IdTieuChiChung = tieuChi.Id,
                Stt = tieuChi.Stt,
                Ten = tieuChi.Ten,
                DiemToiDa = tieuChi.MyProperty,
                // Tất cả tiêu chí thiếu dòng điểm đều được chuẩn hóa về 0.
                DiemTuCham = tieuChi.DiemTuCham ?? 0m,
                Children = ChuyenCayTieuChiKeThua(tieuChi.Children ?? new List<KPI_TieuChiChungTreeDto>())
            }).ToList();
        }

        private static decimal TinhTongDiemTieuChiLa(IEnumerable<KPI_TieuChiChung_DiemSoKeThuaTieuChiDto> cayTieuChi)
        {
            decimal tongDiem = 0m;
            foreach (var tieuChi in cayTieuChi)
            {
                if (tieuChi.Children.Count > 0)
                {
                    tongDiem += TinhTongDiemTieuChiLa(tieuChi.Children);
                }
                else
                {
                    tongDiem += tieuChi.DiemTuCham;
                }
            }

            return tongDiem;
        }

        public async Task<KPI_TongHopTieuChiChungDto> GetTongHopTieuChi(KPI_TongHopTieuChiChungSearchDto search)
        {
            string tenPhongBan = "";

            // Tự động lấy Đợt đánh giá gần nhất nếu chưa truyền IdDot khi tìm kiếm theo Tháng
            if (search.Type == "Thang" && (!search.IdDot.HasValue || search.IdDot == Guid.Empty))
            {
                var latestDot = await _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                    .OrderByDescending(x => x.CreatedDate)
                    .FirstOrDefaultAsync();
                if (latestDot != null)
                {
                    search.IdDot = latestDot.Id;
                }
            }

            // Nếu search.PhongBanId được truyền lên nhưng là Đơn vị Cấp 1 (Cục/Đơn vị), chuyển sang DonViSuDungId và reset PhongBanId
            if (search.PhongBanId.HasValue && search.PhongBanId != Guid.Empty)
            {
                var inputDept = await _departmentRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == search.PhongBanId.Value && x.IsDeleted != true);
                if (inputDept != null && (inputDept.Level == 1 || !inputDept.ParentId.HasValue || inputDept.ParentId == Guid.Empty))
                {
                    if (!search.DonViSuDungId.HasValue || search.DonViSuDungId == Guid.Empty)
                    {
                        search.DonViSuDungId = search.PhongBanId;
                    }
                    search.PhongBanId = null;
                }
            }

            // Tự động lấy Phòng ban phù hợp nếu chưa chọn
            if (!search.PhongBanId.HasValue || search.PhongBanId == Guid.Empty)
            {
                if (search.CurrentUserId.HasValue && search.CurrentUserId != Guid.Empty)
                {
                    var lyLich = await _kPI_LyLich2CRepository.GetQueryable()
                        .FirstOrDefaultAsync(x => x.UserId == search.CurrentUserId.Value);
                    if (lyLich != null && lyLich.PhongBanId != Guid.Empty)
                    {
                        var userDept = await _departmentRepository.GetQueryable()
                            .FirstOrDefaultAsync(x => x.Id == lyLich.PhongBanId && x.IsDeleted != true);
                        if (userDept != null && (userDept.Level == 2 || (userDept.ParentId.HasValue && userDept.ParentId != Guid.Empty)))
                        {
                            search.PhongBanId = lyLich.PhongBanId;
                        }
                    }
                }
            }

            if (!search.PhongBanId.HasValue || search.PhongBanId == Guid.Empty)
            {
                var query = from l in _kPI_LyLich2CRepository.GetQueryable()
                            join d in _departmentRepository.GetQueryable() on l.PhongBanId equals d.Id
                            where l.PhongBanId != Guid.Empty && d.IsDeleted != true && (d.Level == 2 || (d.ParentId.HasValue && d.ParentId != Guid.Empty))
                            select new { l, d };

                if (search.DonViSuDungId.HasValue && search.DonViSuDungId != Guid.Empty)
                {
                    query = query.Where(x => x.d.ParentId == search.DonViSuDungId.Value);
                }
                // Nếu Controller đã gán UserId (qua logic lấy từ CurrentUserId nếu có), có thể dùng để lọc
                else if (search.CurrentUserId.HasValue && search.CurrentUserId != Guid.Empty)
                {
                    var userDonViId = await _kPI_LyLich2CRepository.GetQueryable()
                        .Where(x => x.UserId == search.CurrentUserId.Value)
                        .Select(x => x.DonViSuDungId)
                        .FirstOrDefaultAsync();
                    if (userDonViId != Guid.Empty)
                    {
                        query = query.Where(x => x.d.ParentId == userDonViId);
                    }
                }

                var firstDeptId = await query
                    .Select(x => x.l.PhongBanId)
                    .FirstOrDefaultAsync();

                if (firstDeptId != Guid.Empty)
                {
                    search.PhongBanId = firstDeptId;
                }
            }

            // 1. Lấy danh sách nhân sự theo phòng ban (1 query duy nhất)
            var lstNhanSu = await _kPI_LyLich2CRepository
                .GetQueryable()
                .Where(x => x.PhongBanId == search.PhongBanId)
                .Select(x => new
                {
                    x.Id,
                    x.HoTen,
                    x.ChucVuHienTai,
                    x.DonViSuDungId,
                    x.PhongBanId
                })
                .ToListAsync();

            var nhanSuIds = lstNhanSu.Select(x => x.Id).ToList();

            // 2. Lấy nhiệm vụ theo phòng ban (1 query duy nhất, dùng chung cho cả Tháng & Quý)
            var listNhiemVu = (await _kPI_NhiemVuRepository
                .GetQueryable()
                .Where(x => x.IdLyLich.HasValue && nhanSuIds.Contains(x.IdLyLich.Value))
                .ToListAsync())
                .ToLookup(x => x.IdLyLich);
            var nhiemVuIds = listNhiemVu.SelectMany(x => x).Select(x => x.Id).ToList();
            var dauRaTheoNhiemVu = (await _kPI_DauRaNhiemVuRepository
                .GetQueryable()
                .Where(x => x.IdNhiemVu.HasValue && nhiemVuIds.Contains(x.IdNhiemVu.Value))
                .ToListAsync())
                .ToLookup(x => x.IdNhiemVu!.Value);
            var ketQuaTheoNhanSuVaDot = (await _kPI_KetQuaThucHienNhiemVuRepository
                .GetQueryable()
                .Where(x => x.IdLyLich.HasValue && nhanSuIds.Contains(x.IdLyLich.Value))
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync())
                .ToLookup(x => (x.IdLyLich, x.IdDotDanhGia));
            var dictChucVu = new Dictionary<string, string>();
            var dictChucVuPriority = new Dictionary<string, int>();
            var nhomChucVu = await _dm_NhomDanhMucRepository.GetQueryable().FirstOrDefaultAsync(x => x.GroupCode == "CHUCVUVNU" && x.IsDeleted != true);
            if (nhomChucVu != null)
            {
                var listChucVu = await _dm_DuLieuDanhMucRepository.GetQueryable()
                    .Where(x => x.GroupId == nhomChucVu.Id && x.IsDeleted != true)
                    .ToListAsync();
                dictChucVu = listChucVu.ToDictionary(x => x.Code, x => x.Name);
                dictChucVuPriority = listChucVu.ToDictionary(x => x.Code, x => x.Priority ?? int.MaxValue);
            }

            var lstThongTinNhanSu = new List<KPI_TongHopTieuChiChungNhanSuDto>();

            if (search.Type == "Thang")
            {
                // Lấy phiếu đánh giá theo đợt (1 query)
                var lstPhieuDanhGia = await _kpi_PhieuDanhGiaRepository
                    .GetQueryable()
                    .Where(x => x.IdDotDanhGia == search.IdDot)
                    .Select(x => new
                    {
                        x.Id,
                        x.IdLyLich,
                        x.DiemThucHienNhiemVu,
                        x.TrangThai
                    })
                    .ToListAsync();

                var lstTieuChiChung = await GetQueryable()
                    .Where(x => x.IdDotDanhGia == search.IdDot)
                    .ToListAsync();

                Dictionary<Guid, decimal> dictDiemNV = new Dictionary<Guid, decimal>();
                Dictionary<Guid, double> dictDiemTCC = new Dictionary<Guid, double>();
                Dictionary<Guid, int> dictSoDauRaThieuDiem = new Dictionary<Guid, int>();
                var vaiTroLoc = NormalizeVaiTroDanhGia(search.VaiTroDanhGia);
                var phieuDaDanhGiaTheoVaiTro = new HashSet<Guid>();

                if (vaiTroLoc != null && lstPhieuDanhGia.Any())
                {
                    var phieuIds = lstPhieuDanhGia.Select(p => p.Id).Distinct().ToList();
                    var res = await TinhDiemTheoVaiTro(phieuIds, vaiTroLoc);
                    dictDiemNV = res.dictDiemNV;
                    dictDiemTCC = res.dictDiemTCC;
                    dictSoDauRaThieuDiem = res.dictSoDauRaThieuDiem;
                    phieuDaDanhGiaTheoVaiTro = await GetPhieuDaDanhGiaTheoVaiTro(phieuIds, vaiTroLoc);
                }

                lstThongTinNhanSu = lstNhanSu.Select(x =>
                {
                    var nhiemVuNhanSu = listNhiemVu[x.Id];
                    var nhiemVuDot = nhiemVuNhanSu.Where(nv => nv.IdDotTheoDoiDanhGia == search.IdDot).ToList();
                    var nvHeThong = nhiemVuDot.Where(nv => nv.Type == "HETHONG").ToList();
                    var nvPhatSinh = nhiemVuDot.Where(nv => nv.Type == "PHATSINH").ToList();
                    var diemHeThong = TinhTongDiemDauRa(nvHeThong, dauRaTheoNhiemVu, ketQuaTheoNhanSuVaDot);
                    var diemPhatSinh = TinhTongDiemDauRa(nvPhatSinh, dauRaTheoNhiemVu, ketQuaTheoNhanSuVaDot);

                    var pd = lstPhieuDanhGia.FirstOrDefault(p => p.IdLyLich == x.Id);
                    decimal? diemNV = null;
                    if (pd != null)
                    {
                        if (vaiTroLoc != null)
                        {
                            if (phieuDaDanhGiaTheoVaiTro.Contains(pd.Id) && dictDiemNV.TryGetValue(pd.Id, out var diemTheoVaiTro))
                            {
                                diemNV = diemTheoVaiTro;
                            }
                        }
                        else
                        {
                            diemNV = pd.DiemThucHienNhiemVu;
                        }
                    }

                    bool daDanhGia = vaiTroLoc != null
                        ? pd != null && phieuDaDanhGiaTheoVaiTro.Contains(pd.Id)
                        : pd != null;
                    string? trangThai = pd?.TrangThai;

                    double? diemTieuChiChung = null;
                    if (vaiTroLoc != null)
                    {
                        if (pd != null && phieuDaDanhGiaTheoVaiTro.Contains(pd.Id) && dictDiemTCC.TryGetValue(pd.Id, out var diemTheoVaiTro))
                        {
                            diemTieuChiChung = diemTheoVaiTro;
                        }
                    }
                    else
                    {
                        var tieuChiChungNhanSu = lstTieuChiChung.Where(tc => tc.IdLyLich == x.Id).ToList();
                        diemTieuChiChung = tieuChiChungNhanSu.Any()
                            ? Math.Round((double)tieuChiChungNhanSu.Sum(tc => (double)(tc.DiemTuCham ?? 0)), 2)
                            : (double?)null;
                    }

                    return new KPI_TongHopTieuChiChungNhanSuDto()
                    {
                        LyLichId = x.Id,
                        IdPhieuDanhGia = pd?.Id,
                        TenNhanSu = x.HoTen,
                        ChucVu = x.ChucVuHienTai,
                        ChucVu_txt = dictChucVu.ContainsKey(x.ChucVuHienTai ?? "") ? dictChucVu[x.ChucVuHienTai] : x.ChucVuHienTai,
                        ChucVuPriority = dictChucVuPriority.ContainsKey(x.ChucVuHienTai ?? "") ? dictChucVuPriority[x.ChucVuHienTai] : int.MaxValue,
                        PhongBanId = x.PhongBanId,
                        TenPhongBan = tenPhongBan,
                        DiemTheoBTC_TrongKeHoach = diemHeThong,
                        DiemTheoBTC_DamNhanDotXuat = diemPhatSinh,
                        DiemTheoBTC_TongThucTe = Math.Round(diemHeThong + diemPhatSinh, 2),
                        DiemTieuChiKetQuaNV_TheoDiem = diemNV.HasValue ? Math.Round(diemNV.Value * 100m / 70m, 2) : (decimal?)null,
                        DiemTieuChiKetQuaNV_TheoThang = diemNV.HasValue ? Math.Round(diemNV.Value, 2) : (decimal?)null,
                        DuDiemNhiemVuTheoVaiTro = vaiTroLoc == null || pd == null || !phieuDaDanhGiaTheoVaiTro.Contains(pd.Id) || !dictSoDauRaThieuDiem.TryGetValue(pd.Id, out var soDauRaThieu) || soDauRaThieu == 0,
                        SoDauRaThieuDiem = vaiTroLoc != null && pd != null && phieuDaDanhGiaTheoVaiTro.Contains(pd.Id) && dictSoDauRaThieuDiem.TryGetValue(pd.Id, out var soDauRaThieuTheoVaiTro) ? soDauRaThieuTheoVaiTro : 0,
                        DiemTieuChiChung = diemTieuChiChung,
                        DaDanhGia = daDanhGia,
                        TrangThai = trangThai,
                        GhiChu = string.Join("; ", nhiemVuDot
                            .Where(nv => !string.IsNullOrWhiteSpace(nv.GhiChuGiaTrinh))
                            .Select(nv => nv.GhiChuGiaTrinh)),
                    };
                }).ToList();
            }
            else if (search.Type == "Quy")
            {
                // Lấy 3 đợt đánh giá theo Quý + Năm (có Thang), sắp xếp theo Tháng
                var lstDotTrongQuy = await _kPI_DotTheoDoiDanhGiaRepository
                    .GetQueryable()
                    .Where(x => x.Quy == search.Quy && x.Nam == search.Nam && x.Thang.HasValue)
                    .OrderBy(x => x.Thang)
                    .ToListAsync();

                var dotIds = lstDotTrongQuy.Select(x => x.Id).ToList();

                // Lấy tất cả phiếu đánh giá của 3 tháng trong quý (1 query)
                var lstPhieuDanhGiaQuy = await _kpi_PhieuDanhGiaRepository
                    .GetQueryable()
                    .Where(x => x.IdDotDanhGia.HasValue && dotIds.Contains(x.IdDotDanhGia.Value))
                    .Select(x => new
                    {
                        x.Id,
                        x.IdLyLich,
                        x.IdDotDanhGia,
                        x.DiemThucHienNhiemVu,
                        x.DiemTieuChiChung
                    })
                    .ToListAsync();

                // Lấy tất cả điểm tiêu chí chung (DiemTuCham) của 3 tháng trong quý (1 query)
                var lstTieuChiChungQuy = await GetQueryable()
                    .Where(x => x.IdDotDanhGia.HasValue && dotIds.Contains(x.IdDotDanhGia.Value))
                    .ToListAsync();

                var vaiTroLocQuy = NormalizeVaiTroDanhGia(search.VaiTroDanhGia);
                var dictDiemNVQuy = new Dictionary<Guid, decimal>();
                var dictDiemTCCQuy = new Dictionary<Guid, double>();
                var dictSoDauRaThieuDiemQuy = new Dictionary<Guid, int>();
                var phieuDaDanhGiaTheoVaiTroQuy = new HashSet<Guid>();
                if (vaiTroLocQuy != null && lstPhieuDanhGiaQuy.Any())
                {
                    var phieuIds = lstPhieuDanhGiaQuy.Select(x => x.Id).Distinct().ToList();
                    var diemTheoVaiTro = await TinhDiemTheoVaiTro(phieuIds, vaiTroLocQuy);
                    dictDiemNVQuy = diemTheoVaiTro.dictDiemNV;
                    dictDiemTCCQuy = diemTheoVaiTro.dictDiemTCC;
                    dictSoDauRaThieuDiemQuy = diemTheoVaiTro.dictSoDauRaThieuDiem;
                    phieuDaDanhGiaTheoVaiTroQuy = await GetPhieuDaDanhGiaTheoVaiTro(phieuIds, vaiTroLocQuy);
                }

                // Xác định Id từng đợt (tháng 1, 2, 3 trong quý) theo thứ tự tăng dần
                int startMonthQuy1 = ((search.Quy ?? 1) - 1) * 3 + 1;
                var dotThang1 = lstDotTrongQuy.FirstOrDefault(x => x.Thang == startMonthQuy1)?.Id ?? lstDotTrongQuy.ElementAtOrDefault(0)?.Id;
                var dotThang2 = lstDotTrongQuy.FirstOrDefault(x => x.Thang == startMonthQuy1 + 1)?.Id ?? lstDotTrongQuy.ElementAtOrDefault(1)?.Id;
                var dotThang3 = lstDotTrongQuy.FirstOrDefault(x => x.Thang == startMonthQuy1 + 2)?.Id ?? lstDotTrongQuy.ElementAtOrDefault(2)?.Id;

                lstThongTinNhanSu = lstNhanSu.Select(x =>
                {
                    var nhiemVuNhanSu = listNhiemVu[x.Id];
                    var nhiemVuDot = nhiemVuNhanSu.Where(nv => nv.IdDotTheoDoiDanhGia.HasValue && dotIds.Contains(nv.IdDotTheoDoiDanhGia.Value)).ToList();
                    var nvHeThong = nhiemVuDot.Where(nv => nv.Type == "HETHONG").ToList();
                    var nvPhatSinh = nhiemVuDot.Where(nv => nv.Type == "PHATSINH").ToList();
                    var diemHeThong = TinhTongDiemDauRa(nvHeThong, dauRaTheoNhiemVu, ketQuaTheoNhanSuVaDot);
                    var diemPhatSinh = TinhTongDiemDauRa(nvPhatSinh, dauRaTheoNhiemVu, ketQuaTheoNhanSuVaDot);

                    Func<Guid?, double?> getDiemNvForDot = dotId =>
                    {
                        if (!dotId.HasValue) return null;
                        var pd = lstPhieuDanhGiaQuy.FirstOrDefault(p => p.IdLyLich == x.Id && p.IdDotDanhGia == dotId.Value);
                        if (pd == null) return null;
                        if (vaiTroLocQuy == null)
                            return pd.DiemThucHienNhiemVu.HasValue ? Math.Round((double)pd.DiemThucHienNhiemVu.Value, 2) : (double?)null;
                        if (!phieuDaDanhGiaTheoVaiTroQuy.Contains(pd.Id)) return null;
                        return dictDiemNVQuy.TryGetValue(pd.Id, out var diem) ? Math.Round((double)diem, 2) : (double?)null;
                    };

                    var diemThang1 = getDiemNvForDot(dotThang1);
                    var diemThang2 = getDiemNvForDot(dotThang2);
                    var diemThang3 = getDiemNvForDot(dotThang3);

                    // Trung bình = điểm các tháng / số tháng có điểm
                    var danhSachDiem = new[] { diemThang1, diemThang2, diemThang3 }.Where(d => d.HasValue).Select(d => d.Value).ToList();
                    var trungBinh = danhSachDiem.Any() ? Math.Round(danhSachDiem.Average(), 2) : (double?)null;

                    // Điểm tiêu chí chung từng tháng (chia 3 cho quý)
                    var tieuChiChungNhanSu = lstTieuChiChungQuy.Where(tc => tc.IdLyLich == x.Id).ToList();

                    Func<Guid?, double?> getTccForDot = (dotId) =>
                    {
                        if (!dotId.HasValue) return null;
                        var pd = lstPhieuDanhGiaQuy.FirstOrDefault(p => p.IdLyLich == x.Id && p.IdDotDanhGia == dotId.Value);
                        if (vaiTroLocQuy != null)
                        {
                            if (pd == null || !phieuDaDanhGiaTheoVaiTroQuy.Contains(pd.Id)) return null;
                            return dictDiemTCCQuy.TryGetValue(pd.Id, out var diem) ? Math.Round(diem, 2) : (double?)null;
                        }
                        var listTcDot = tieuChiChungNhanSu.Where(tc => tc.IdDotDanhGia == dotId.Value).ToList();
                        if (listTcDot.Any())
                        {
                            return (double?)Math.Round((double)listTcDot.Sum(tc => (double)(tc.DiemTuCham ?? 0)), 2);
                        }
                        if (pd != null && pd.DiemTieuChiChung.HasValue)
                        {
                            return (double?)Math.Round((double)pd.DiemTieuChiChung.Value, 2);
                        }
                        return null;
                    };

                    var tccThang1 = getTccForDot(dotThang1);
                    var tccThang2 = getTccForDot(dotThang2);
                    var tccThang3 = getTccForDot(dotThang3);

                    var danhSachTCC = new[] { tccThang1, tccThang2, tccThang3 }.Where(d => d.HasValue).Select(d => d.Value).ToList();
                    var diemTieuChiChung = danhSachTCC.Any()
                        ? Math.Round(danhSachTCC.Average(), 2)
                        : (double?)null;

                    // Điểm theo dõi đánh giá quý = Trung bình + Điểm tiêu chí chung
                    var diemTheoDoiDanhGiaQuy = (trungBinh.HasValue || diemTieuChiChung.HasValue)
                        ? Math.Round((trungBinh ?? 0) + (diemTieuChiChung ?? 0), 2)
                        : (double?)null;

                    var phieuNhanSuTrongQuy = lstPhieuDanhGiaQuy.Where(p => p.IdLyLich == x.Id).ToList();
                    var soDauRaThieuDiem = vaiTroLocQuy == null ? 0 : phieuNhanSuTrongQuy
                        .Where(p => phieuDaDanhGiaTheoVaiTroQuy.Contains(p.Id))
                        .Sum(p => dictSoDauRaThieuDiemQuy.TryGetValue(p.Id, out var soThieu) ? soThieu : 0);
                    var daDanhGia = vaiTroLocQuy == null
                        ? phieuNhanSuTrongQuy.Any()
                        : phieuNhanSuTrongQuy.Any(p => phieuDaDanhGiaTheoVaiTroQuy.Contains(p.Id));

                    return new KPI_TongHopTieuChiChungNhanSuDto()
                    {
                        LyLichId = x.Id,
                        TenNhanSu = x.HoTen,
                        ChucVu = x.ChucVuHienTai,
                        ChucVu_txt = dictChucVu.ContainsKey(x.ChucVuHienTai ?? "") ? dictChucVu[x.ChucVuHienTai] : x.ChucVuHienTai,
                        PhongBanId = x.PhongBanId,
                        TenPhongBan = tenPhongBan,
                        DiemTheoBTC_TrongKeHoach = diemHeThong,
                        DiemTheoBTC_DamNhanDotXuat = diemPhatSinh,
                        DiemTheoBTC_TongThucTe = Math.Round(diemHeThong + diemPhatSinh, 2),
                        // Điểm Quý
                        DiemTieuChiKQNhiemVu_ThangThuNhat = diemThang1,
                        DiemTieuChiKQNhiemVu_ThangThuHai = diemThang2,
                        DiemTieuChiKQNhiemVu_ThangCuoi = diemThang3,
                        DiemTieuChiKQNhiemVu_TrungBinh = trungBinh,
                        DiemTieuChiChung = diemTieuChiChung,
                        DiemTheoDoiDanhGiaQuy = diemTheoDoiDanhGiaQuy,
                        DuDiemNhiemVuTheoVaiTro = vaiTroLocQuy == null || soDauRaThieuDiem == 0,
                        SoDauRaThieuDiem = soDauRaThieuDiem,
                        DaDanhGia = daDanhGia,
                        TrangThai = null,
                        ChucVuPriority = dictChucVuPriority.ContainsKey(x.ChucVuHienTai ?? "") ? dictChucVuPriority[x.ChucVuHienTai] : int.MaxValue,
                        GhiChu = string.Join("; ", nhiemVuDot
                            .Where(nv => !string.IsNullOrWhiteSpace(nv.GhiChuGiaTrinh))
                            .Select(nv => nv.GhiChuGiaTrinh)),
                    };
                }).ToList();
            }

            // Lấy thông tin đợt đánh giá / tên hiển thị
            string tenDot;
            Guid? idDot = null;
            if (search.Type == "Thang" && search.IdDot.HasValue)
            {
                var dotDanhGia = await _kPI_DotTheoDoiDanhGiaRepository
                    .GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == search.IdDot.Value);
                idDot = dotDanhGia?.Id;
                tenDot = dotDanhGia?.TenDotTheoDoiDanhGia ?? "";
            }
            else
            {
                tenDot = $"Quý {search.Quy} năm {search.Nam}";
            }

            // Lấy thông tin phòng ban & đơn vị sử dụng
            string tenDonViSuDung = "";
            Guid donViSuDungId = Guid.Empty;

            if (search.PhongBanId.HasValue && search.PhongBanId.Value != Guid.Empty)
            {
                var phongBan = await _departmentRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == search.PhongBanId.Value);
                if (phongBan != null)
                {
                    tenPhongBan = phongBan.Name;
                    if (phongBan.ParentId.HasValue && phongBan.ParentId.Value != Guid.Empty)
                    {
                        donViSuDungId = phongBan.ParentId.Value;
                        var donVi = await _departmentRepository.GetQueryable()
                            .FirstOrDefaultAsync(x => x.Id == donViSuDungId);
                        if (donVi != null && !string.IsNullOrEmpty(donVi.Name))
                        {
                            tenDonViSuDung = donVi.Name.ToUpper();
                        }
                    }
                }
            }
            if (donViSuDungId == Guid.Empty && lstNhanSu.Any())
            {
                donViSuDungId = lstNhanSu.First().DonViSuDungId;
                var donVi = await _departmentRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == donViSuDungId);
                if (donVi != null && !string.IsNullOrEmpty(donVi.Name))
                {
                    tenDonViSuDung = donVi.Name.ToUpper();
                }
            }

            // Gán lại TenPhongBan nếu cần cho các nhân sự
            foreach (var nv in lstThongTinNhanSu)
            {
                if (string.IsNullOrEmpty(nv.TenPhongBan))
                {
                    nv.TenPhongBan = tenPhongBan;
                }
            }

            return new KPI_TongHopTieuChiChungDto()
            {
                IdDot = idDot,
                TenDot = tenDot,
                PhongBanId = search.PhongBanId ?? Guid.Empty,
                TenPhongBan = tenPhongBan,
                DonViSuDungId = donViSuDungId,
                TenDonViSuDung = tenDonViSuDung,
                ListThongTinNhanSu = lstThongTinNhanSu.OrderBy(x => x.ChucVuPriority ?? int.MaxValue).ThenBy(x => x.TenNhanSu).ToList()
            };
        }

        public async Task<KPI_TongHopToanCucDto> GetTongHopToanCuc(KPI_TongHopTieuChiChungSearchDto search)
        {
            // Tự động lấy Đợt đánh giá gần nhất nếu chưa truyền IdDot khi tìm kiếm theo Tháng
            if (search.Type == "Thang" && (!search.IdDot.HasValue || search.IdDot == Guid.Empty))
            {
                var latestDot = await _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                    .OrderByDescending(x => x.CreatedDate)
                    .FirstOrDefaultAsync();
                if (latestDot != null)
                {
                    search.IdDot = latestDot.Id;
                }
            }

            Guid donViSuDungId = search.DonViSuDungId ?? Guid.Empty;
            if (donViSuDungId == Guid.Empty && search.CurrentUserId.HasValue && search.CurrentUserId.Value != Guid.Empty)
            {
                var userDonVi = await _kPI_LyLich2CRepository.GetQueryable()
                    .Where(x => x.UserId == search.CurrentUserId.Value)
                    .Select(x => x.DonViSuDungId)
                    .FirstOrDefaultAsync();
                if (userDonVi != Guid.Empty)
                {
                    donViSuDungId = userDonVi;
                }
            }

            string tenDonViSuDung = "";

            if (donViSuDungId != Guid.Empty)
            {
                var donVi = await _departmentRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == donViSuDungId);
                if (donVi != null && !string.IsNullOrEmpty(donVi.Name))
                {
                    tenDonViSuDung = donVi.Name.Trim();
                }
            }

            // 1. Lấy danh sách nhân sự theo đơn vị sử dụng
            var queryNhanSu = _kPI_LyLich2CRepository.GetQueryable();
            if (donViSuDungId != Guid.Empty)
            {
                queryNhanSu = queryNhanSu.Where(x => x.DonViSuDungId == donViSuDungId);
            }
            else if (search.PhongBanId.HasValue && search.PhongBanId.Value != Guid.Empty)
            {
                queryNhanSu = queryNhanSu.Where(x => x.PhongBanId == search.PhongBanId.Value);
            }

            var lstNhanSu = await queryNhanSu
                .Select(x => new
                {
                    x.Id,
                    x.HoTen,
                    x.ChucVuHienTai,
                    x.DonViSuDungId,
                    x.PhongBanId
                })
                .ToListAsync();

            if (donViSuDungId == Guid.Empty && lstNhanSu.Any())
            {
                donViSuDungId = lstNhanSu.First().DonViSuDungId;
                var donVi = await _departmentRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == donViSuDungId);
                if (donVi != null && !string.IsNullOrEmpty(donVi.Name))
                {
                    tenDonViSuDung = donVi.Name.ToUpper();
                }
            }

            // Nhân sự trực thuộc trực tiếp đơn vị sử dụng không có PhongBanId.
            // Với các nhân sự này, dùng DonViSuDungId làm nhóm hiển thị để lấy được
            // đúng tên đơn vị thay vì rơi vào nhóm "Khác".
            var phongBanIds = lstNhanSu
                .Select(x => x.PhongBanId != Guid.Empty ? x.PhongBanId : x.DonViSuDungId)
                .Where(x => x != Guid.Empty)
                .Distinct()
                .ToList();
            var phongBanList = await _departmentRepository.GetQueryable()
                .Where(x => phongBanIds.Contains(x.Id))
                .ToListAsync();
            var dictPhongBan = phongBanList.ToDictionary(x => x.Id, x => x.Name);
            var dictPhongBanPriority = phongBanList.ToDictionary(x => x.Id, x => x.Priority ?? long.MaxValue);

            var nhanSuIds = lstNhanSu.Select(x => x.Id).ToList();

            // 2. Lấy nhiệm vụ
            var listNhiemVu = (await _kPI_NhiemVuRepository
                .GetQueryable()
                .Where(x => x.IdLyLich.HasValue && nhanSuIds.Contains(x.IdLyLich.Value))
                .ToListAsync())
                .ToLookup(x => x.IdLyLich);
            var nhiemVuIds = listNhiemVu.SelectMany(x => x).Select(x => x.Id).ToList();
            var dauRaTheoNhiemVu = (await _kPI_DauRaNhiemVuRepository
                .GetQueryable()
                .Where(x => x.IdNhiemVu.HasValue && nhiemVuIds.Contains(x.IdNhiemVu.Value))
                .ToListAsync())
                .ToLookup(x => x.IdNhiemVu!.Value);
            var ketQuaTheoNhanSuVaDot = (await _kPI_KetQuaThucHienNhiemVuRepository
                .GetQueryable()
                .Where(x => x.IdLyLich.HasValue && nhanSuIds.Contains(x.IdLyLich.Value))
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync())
                .ToLookup(x => (x.IdLyLich, x.IdDotDanhGia));

            var dictChucVu = new Dictionary<string, string>();
            var dictChucVuPriority = new Dictionary<string, int>();
            var nhomChucVu = await _dm_NhomDanhMucRepository.GetQueryable().FirstOrDefaultAsync(x => x.GroupCode == "CHUCVUVNU" && x.IsDeleted != true);
            if (nhomChucVu != null)
            {
                var listChucVu = await _dm_DuLieuDanhMucRepository.GetQueryable()
                    .Where(x => x.GroupId == nhomChucVu.Id && x.IsDeleted != true)
                    .ToListAsync();
                dictChucVu = listChucVu.ToDictionary(x => x.Code, x => x.Name);
                dictChucVuPriority = listChucVu.ToDictionary(x => x.Code, x => x.Priority ?? int.MaxValue);
            }

            var lstThongTinNhanSu = new List<KPI_TongHopTieuChiChungNhanSuDto>();

            if (search.Type == "Thang")
            {
                var lstPhieuDanhGia = await _kpi_PhieuDanhGiaRepository
                    .GetQueryable()
                    .Where(x => x.IdDotDanhGia == search.IdDot)
                    .Select(x => new
                    {
                        x.Id,
                        x.IdLyLich,
                        x.DiemThucHienNhiemVu,
                        x.TrangThai
                    })
                    .ToListAsync();

                var lstTieuChiChung = await GetQueryable()
                    .Where(x => x.IdDotDanhGia == search.IdDot)
                    .ToListAsync();

                Dictionary<Guid, decimal> dictDiemNV = new Dictionary<Guid, decimal>();
                Dictionary<Guid, double> dictDiemTCC = new Dictionary<Guid, double>();
                Dictionary<Guid, int> dictSoDauRaThieuDiem = new Dictionary<Guid, int>();
                var vaiTroLoc = NormalizeVaiTroDanhGia(search.VaiTroDanhGia);
                var phieuDaDanhGiaTheoVaiTro = new HashSet<Guid>();

                if (vaiTroLoc != null && lstPhieuDanhGia.Any())
                {
                    var phieuIds = lstPhieuDanhGia.Select(p => p.Id).Distinct().ToList();
                    var res = await TinhDiemTheoVaiTro(phieuIds, vaiTroLoc);
                    dictDiemNV = res.dictDiemNV;
                    dictDiemTCC = res.dictDiemTCC;
                    dictSoDauRaThieuDiem = res.dictSoDauRaThieuDiem;
                    phieuDaDanhGiaTheoVaiTro = await GetPhieuDaDanhGiaTheoVaiTro(phieuIds, vaiTroLoc);
                }

                lstThongTinNhanSu = lstNhanSu.Select(x =>
                {
                    var nhiemVuNhanSu = listNhiemVu[x.Id];
                    var nhiemVuDot = nhiemVuNhanSu.Where(nv => nv.IdDotTheoDoiDanhGia == search.IdDot).ToList();
                    var nvHeThong = nhiemVuDot.Where(nv => nv.Type == "HETHONG").ToList();
                    var nvPhatSinh = nhiemVuDot.Where(nv => nv.Type == "PHATSINH").ToList();
                    var diemHeThong = TinhTongDiemDauRa(nvHeThong, dauRaTheoNhiemVu, ketQuaTheoNhanSuVaDot);
                    var diemPhatSinh = TinhTongDiemDauRa(nvPhatSinh, dauRaTheoNhiemVu, ketQuaTheoNhanSuVaDot);

                    var pd = lstPhieuDanhGia.FirstOrDefault(p => p.IdLyLich == x.Id);
                    decimal? diemNV = null;
                    if (pd != null)
                    {
                        if (vaiTroLoc != null)
                        {
                            if (phieuDaDanhGiaTheoVaiTro.Contains(pd.Id) && dictDiemNV.TryGetValue(pd.Id, out var diemTheoVaiTro))
                            {
                                diemNV = diemTheoVaiTro;
                            }
                        }
                        else
                        {
                            diemNV = pd.DiemThucHienNhiemVu;
                        }
                    }

                    bool daDanhGia = vaiTroLoc != null
                        ? pd != null && phieuDaDanhGiaTheoVaiTro.Contains(pd.Id)
                        : pd != null;
                    string? trangThai = pd?.TrangThai;

                    double? diemTieuChiChung = null;
                    if (vaiTroLoc != null)
                    {
                        if (pd != null && phieuDaDanhGiaTheoVaiTro.Contains(pd.Id) && dictDiemTCC.TryGetValue(pd.Id, out var diemTheoVaiTro))
                        {
                            diemTieuChiChung = diemTheoVaiTro;
                        }
                    }
                    else
                    {
                        var tieuChiChungNhanSu = lstTieuChiChung.Where(tc => tc.IdLyLich == x.Id).ToList();
                        diemTieuChiChung = tieuChiChungNhanSu.Any()
                            ? Math.Round((double)tieuChiChungNhanSu.Sum(tc => (double)(tc.DiemTuCham ?? 0)), 2)
                            : (double?)null;
                    }

                    var phongBanIdHienThi = x.PhongBanId != Guid.Empty ? x.PhongBanId : x.DonViSuDungId;
                    string tenPB = dictPhongBan.TryGetValue(phongBanIdHienThi, out var tenPhongBan)
                        ? tenPhongBan
                        : "Khác";

                    return new KPI_TongHopTieuChiChungNhanSuDto()
                    {
                        LyLichId = x.Id,
                        TenNhanSu = x.HoTen,
                        ChucVu = x.ChucVuHienTai,
                        ChucVu_txt = dictChucVu.ContainsKey(x.ChucVuHienTai ?? "") ? dictChucVu[x.ChucVuHienTai] : x.ChucVuHienTai,
                        ChucVuPriority = dictChucVuPriority.ContainsKey(x.ChucVuHienTai ?? "") ? dictChucVuPriority[x.ChucVuHienTai] : int.MaxValue,
                        PhongBanId = phongBanIdHienThi,
                        TenPhongBan = tenPB,
                        DiemTheoBTC_TrongKeHoach = diemHeThong,
                        DiemTheoBTC_DamNhanDotXuat = diemPhatSinh,
                        DiemTheoBTC_TongThucTe = Math.Round(diemHeThong + diemPhatSinh, 2),
                        DiemTieuChiKetQuaNV_TheoDiem = diemNV.HasValue ? Math.Round(diemNV.Value * 100m / 70m, 2) : (decimal?)null,
                        DiemTieuChiKetQuaNV_TheoThang = diemNV.HasValue ? Math.Round(diemNV.Value, 2) : (decimal?)null,
                        DuDiemNhiemVuTheoVaiTro = vaiTroLoc == null || pd == null || !phieuDaDanhGiaTheoVaiTro.Contains(pd.Id) || !dictSoDauRaThieuDiem.TryGetValue(pd.Id, out var soDauRaThieu) || soDauRaThieu == 0,
                        SoDauRaThieuDiem = vaiTroLoc != null && pd != null && phieuDaDanhGiaTheoVaiTro.Contains(pd.Id) && dictSoDauRaThieuDiem.TryGetValue(pd.Id, out var soDauRaThieuTheoVaiTro) ? soDauRaThieuTheoVaiTro : 0,
                        DiemTieuChiChung = diemTieuChiChung,
                        DaDanhGia = daDanhGia,
                        TrangThai = trangThai,
                        GhiChu = string.Join("; ", nhiemVuDot
                            .Where(nv => !string.IsNullOrWhiteSpace(nv.GhiChuGiaTrinh))
                            .Select(nv => nv.GhiChuGiaTrinh)),
                    };
                }).ToList();
            }
            else if (search.Type == "Quy")
            {
                var lstDotTrongQuy = await _kPI_DotTheoDoiDanhGiaRepository
                    .GetQueryable()
                    .Where(x => x.Quy == search.Quy && x.Nam == search.Nam && x.Thang.HasValue)
                    .OrderBy(x => x.Thang)
                    .ToListAsync();

                var dotIds = lstDotTrongQuy.Select(x => x.Id).ToList();

                var lstPhieuDanhGiaQuy = await _kpi_PhieuDanhGiaRepository
                    .GetQueryable()
                    .Where(x => x.IdDotDanhGia.HasValue && dotIds.Contains(x.IdDotDanhGia.Value))
                    .Select(x => new
                    {
                        x.Id,
                        x.IdLyLich,
                        x.IdDotDanhGia,
                        x.DiemThucHienNhiemVu,
                        x.DiemTieuChiChung
                    })
                    .ToListAsync();

                var lstTieuChiChungQuy = await GetQueryable()
                    .Where(x => x.IdDotDanhGia.HasValue && dotIds.Contains(x.IdDotDanhGia.Value))
                    .ToListAsync();

                var vaiTroLocQuy = NormalizeVaiTroDanhGia(search.VaiTroDanhGia);
                var dictDiemNVQuy = new Dictionary<Guid, decimal>();
                var dictDiemTCCQuy = new Dictionary<Guid, double>();
                var dictSoDauRaThieuDiemQuy = new Dictionary<Guid, int>();
                var phieuDaDanhGiaTheoVaiTroQuy = new HashSet<Guid>();
                if (vaiTroLocQuy != null && lstPhieuDanhGiaQuy.Any())
                {
                    var phieuIds = lstPhieuDanhGiaQuy.Select(x => x.Id).Distinct().ToList();
                    var diemTheoVaiTro = await TinhDiemTheoVaiTro(phieuIds, vaiTroLocQuy);
                    dictDiemNVQuy = diemTheoVaiTro.dictDiemNV;
                    dictDiemTCCQuy = diemTheoVaiTro.dictDiemTCC;
                    dictSoDauRaThieuDiemQuy = diemTheoVaiTro.dictSoDauRaThieuDiem;
                    phieuDaDanhGiaTheoVaiTroQuy = await GetPhieuDaDanhGiaTheoVaiTro(phieuIds, vaiTroLocQuy);
                }

                int startMonthQuy2 = ((search.Quy ?? 1) - 1) * 3 + 1;
                var dotThang1 = lstDotTrongQuy.FirstOrDefault(x => x.Thang == startMonthQuy2)?.Id ?? lstDotTrongQuy.ElementAtOrDefault(0)?.Id;
                var dotThang2 = lstDotTrongQuy.FirstOrDefault(x => x.Thang == startMonthQuy2 + 1)?.Id ?? lstDotTrongQuy.ElementAtOrDefault(1)?.Id;
                var dotThang3 = lstDotTrongQuy.FirstOrDefault(x => x.Thang == startMonthQuy2 + 2)?.Id ?? lstDotTrongQuy.ElementAtOrDefault(2)?.Id;

                lstThongTinNhanSu = lstNhanSu.Select(x =>
                {
                    var nhiemVuNhanSu = listNhiemVu[x.Id];

                    var nhiemVuDot = nhiemVuNhanSu.Where(nv => nv.IdDotTheoDoiDanhGia.HasValue && dotIds.Contains(nv.IdDotTheoDoiDanhGia.Value)).ToList();

                    var nvHeThong = nhiemVuDot.Where(nv => nv.Type == "HETHONG").ToList();

                    var nvPhatSinh = nhiemVuDot.Where(nv => nv.Type == "PHATSINH").ToList();
                    var diemHeThong = TinhTongDiemDauRa(nvHeThong, dauRaTheoNhiemVu, ketQuaTheoNhanSuVaDot);
                    var diemPhatSinh = TinhTongDiemDauRa(nvPhatSinh, dauRaTheoNhiemVu, ketQuaTheoNhanSuVaDot);

                    Func<Guid?, double?> getDiemNvForDot = dotId =>
                    {
                        if (!dotId.HasValue) return null;
                        var pd = lstPhieuDanhGiaQuy.FirstOrDefault(p => p.IdLyLich == x.Id && p.IdDotDanhGia == dotId.Value);
                        if (pd == null) return null;
                        if (vaiTroLocQuy == null)
                            return pd.DiemThucHienNhiemVu.HasValue ? Math.Round((double)pd.DiemThucHienNhiemVu.Value, 2) : (double?)null;
                        if (!phieuDaDanhGiaTheoVaiTroQuy.Contains(pd.Id)) return null;
                        return dictDiemNVQuy.TryGetValue(pd.Id, out var diem) ? Math.Round((double)diem, 2) : (double?)null;
                    };

                    var diemThang1 = getDiemNvForDot(dotThang1);
                    var diemThang2 = getDiemNvForDot(dotThang2);
                    var diemThang3 = getDiemNvForDot(dotThang3);

                    var danhSachDiem = new[] { diemThang1, diemThang2, diemThang3 }.Where(d => d.HasValue).Select(d => d.Value).ToList();

                    var trungBinh = danhSachDiem.Any() ? Math.Round(danhSachDiem.Average(), 2) : (double?)null;

                    // Điểm tiêu chí chung từng tháng (chia 3 cho quý)
                    var tieuChiChungNhanSu = lstTieuChiChungQuy.Where(tc => tc.IdLyLich == x.Id).ToList();

                    Func<Guid?, double?> getTccForDot = (dotId) =>
                    {
                        if (!dotId.HasValue) return null;
                        var pd = lstPhieuDanhGiaQuy.FirstOrDefault(p => p.IdLyLich == x.Id && p.IdDotDanhGia == dotId.Value);
                        if (vaiTroLocQuy != null)
                        {
                            if (pd == null || !phieuDaDanhGiaTheoVaiTroQuy.Contains(pd.Id)) return null;
                            return dictDiemTCCQuy.TryGetValue(pd.Id, out var diem) ? Math.Round(diem, 2) : (double?)null;
                        }
                        var listTcDot = tieuChiChungNhanSu.Where(tc => tc.IdDotDanhGia == dotId.Value).ToList();
                        if (listTcDot.Any())
                        {
                            return (double?)Math.Round((double)listTcDot.Sum(tc => (double)(tc.DiemTuCham ?? 0)), 2);
                        }
                        if (pd != null && pd.DiemTieuChiChung.HasValue)
                        {
                            return (double?)Math.Round((double)pd.DiemTieuChiChung.Value, 2);
                        }
                        return null;
                    };

                    var tccThang1 = getTccForDot(dotThang1);
                    var tccThang2 = getTccForDot(dotThang2);
                    var tccThang3 = getTccForDot(dotThang3);

                    var danhSachTCC = new[] { tccThang1, tccThang2, tccThang3 }.Where(d => d.HasValue).Select(d => d.Value).ToList();
                    var diemTieuChiChung = danhSachTCC.Any()
                        ? Math.Round(danhSachTCC.Average(), 2)
                        : (double?)null;

                    var diemTheoDoiDanhGiaQuy = (trungBinh.HasValue || diemTieuChiChung.HasValue)
                        ? Math.Round((trungBinh ?? 0) + (diemTieuChiChung ?? 0), 2)
                        : (double?)null;

                    var phieuNhanSuTrongQuy = lstPhieuDanhGiaQuy.Where(p => p.IdLyLich == x.Id).ToList();
                    var soDauRaThieuDiem = vaiTroLocQuy == null ? 0 : phieuNhanSuTrongQuy
                        .Where(p => phieuDaDanhGiaTheoVaiTroQuy.Contains(p.Id))
                        .Sum(p => dictSoDauRaThieuDiemQuy.TryGetValue(p.Id, out var soThieu) ? soThieu : 0);
                    var daDanhGia = vaiTroLocQuy == null
                        ? phieuNhanSuTrongQuy.Any()
                        : phieuNhanSuTrongQuy.Any(p => phieuDaDanhGiaTheoVaiTroQuy.Contains(p.Id));

                    var phongBanIdHienThi = x.PhongBanId != Guid.Empty ? x.PhongBanId : x.DonViSuDungId;
                    string tenPB = dictPhongBan.TryGetValue(phongBanIdHienThi, out var tenPhongBan)
                        ? tenPhongBan
                        : "Khác";

                    return new KPI_TongHopTieuChiChungNhanSuDto()
                    {
                        LyLichId = x.Id,
                        TenNhanSu = x.HoTen,
                        ChucVu = x.ChucVuHienTai,
                        ChucVu_txt = dictChucVu.ContainsKey(x.ChucVuHienTai ?? "") ? dictChucVu[x.ChucVuHienTai] : x.ChucVuHienTai,
                        ChucVuPriority = dictChucVuPriority.ContainsKey(x.ChucVuHienTai ?? "") ? dictChucVuPriority[x.ChucVuHienTai] : int.MaxValue,
                        PhongBanId = phongBanIdHienThi,
                        TenPhongBan = tenPB,
                        DiemTheoBTC_TrongKeHoach = diemHeThong,
                        DiemTheoBTC_DamNhanDotXuat = diemPhatSinh,
                        DiemTheoBTC_TongThucTe = Math.Round(diemHeThong + diemPhatSinh, 2),
                        DiemTieuChiKQNhiemVu_ThangThuNhat = diemThang1,
                        DiemTieuChiKQNhiemVu_ThangThuHai = diemThang2,
                        DiemTieuChiKQNhiemVu_ThangCuoi = diemThang3,
                        DiemTieuChiKQNhiemVu_TrungBinh = trungBinh,
                        DiemTieuChiChung = diemTieuChiChung,
                        DiemTheoDoiDanhGiaQuy = diemTheoDoiDanhGiaQuy,
                        DuDiemNhiemVuTheoVaiTro = vaiTroLocQuy == null || soDauRaThieuDiem == 0,
                        SoDauRaThieuDiem = soDauRaThieuDiem,
                        DaDanhGia = daDanhGia,
                        TrangThai = null,
                        GhiChu = string.Join("; ", nhiemVuDot
                            .Where(nv => !string.IsNullOrWhiteSpace(nv.GhiChuGiaTrinh))
                            .Select(nv => nv.GhiChuGiaTrinh)),
                    };

                }).ToList();
            }

            string tenDot;
            Guid? idDot = null;
            if (search.Type == "Thang" && search.IdDot.HasValue)
            {
                var dotDanhGia = await _kPI_DotTheoDoiDanhGiaRepository
                    .GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == search.IdDot.Value);
                idDot = dotDanhGia?.Id;
                tenDot = dotDanhGia?.TenDotTheoDoiDanhGia ?? "";
            }
            else
            {
                tenDot = $"Quý {search.Quy} năm {search.Nam}";
            }

            var listPhongBanDto = lstThongTinNhanSu
                .GroupBy(x => x.PhongBanId)
                .Select(g =>
                {
                    var pbId = g.Key ?? Guid.Empty;
                    var pbPriority = dictPhongBanPriority.ContainsKey(pbId) ? dictPhongBanPriority[pbId] : long.MaxValue;
                    return new KPI_TongHopToanCucPhongBanDto
                    {
                        PhongBanId = pbId,
                        TenPhongBan = g.First().TenPhongBan ?? (!string.IsNullOrEmpty(tenDonViSuDung) ? (dictPhongBan.Any() ? "Lãnh đạo đơn vị" : tenDonViSuDung) : "Nhân sự thuộc Vụ"),
                        Priority = pbPriority,
                        ListThongTinNhanSu = g.OrderBy(x => x.ChucVuPriority ?? int.MaxValue).ThenBy(x => x.TenNhanSu).ToList()
                    };
                })
                .OrderBy(x => x.TenPhongBan == "Nhân sự thuộc Vụ" || x.TenPhongBan == "Lãnh đạo đơn vị" || string.IsNullOrEmpty(x.TenPhongBan))
                .ThenBy(x => x.Priority ?? long.MaxValue)
                .ThenBy(x => x.TenPhongBan)
                .ToList();

            return new KPI_TongHopToanCucDto()
            {
                IdDot = idDot,
                TenDot = tenDot,
                DonViSuDungId = donViSuDungId,
                TenDonViSuDung = tenDonViSuDung,
                ListPhongBan = listPhongBanDto
            };
        }

        private async Task<Guid> GetDonViSuDungIdByUser(Guid? userId)
        {
            if (!userId.HasValue || userId.Value == Guid.Empty) return Guid.Empty;

            var lyLich = await _kPI_LyLich2CRepository.GetQueryable().FirstOrDefaultAsync(x => x.UserId == userId.Value);

            if (lyLich != null)
            {
                if (lyLich.DonViSuDungId != Guid.Empty && lyLich.DonViSuDungId != null)
                {
                    return lyLich.DonViSuDungId;
                }
                if (lyLich.PhongBanId != Guid.Empty && lyLich.PhongBanId != null)
                {
                    var pb = await _departmentRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == lyLich.PhongBanId);
                    if (pb != null)
                    {
                        if (pb.ParentId.HasValue && pb.ParentId.Value != Guid.Empty)
                        {
                            return pb.ParentId.Value;
                        }
                        return pb.Id;
                    }
                }
            }

            return Guid.Empty;

        }

        public async Task<List<KPI_ThongKeQuyDonViDto>> GetChartThongKeQuyToanCuc(int quy, int nam, Guid? donViSuDungId = null, Guid? currentUserId = null)
        {
            var search = new KPI_TongHopTieuChiChungSearchDto
            {
                Type = "Quy",
                Quy = quy,
                Nam = nam,
                DonViSuDungId = donViSuDungId,
                CurrentUserId = currentUserId
            };

            var toanCucData = await GetTongHopToanCuc(search);

            var result = new List<KPI_ThongKeQuyDonViDto>();

            if (toanCucData != null && toanCucData.ListPhongBan != null)
            {
                foreach (var pb in toanCucData.ListPhongBan)
                {
                    double sumScore = 0;
                    int count = 0;
                    int daDanhGiaCount = 0;
                    if (pb.ListThongTinNhanSu != null && pb.ListThongTinNhanSu.Any())
                    {
                        foreach (var ns in pb.ListThongTinNhanSu)
                        {
                            var score = ns.DiemTheoDoiDanhGiaQuy ?? ns.DiemTieuChiKQNhiemVu_TrungBinh;
                            if (score.HasValue && score.Value > 0)
                            {
                                sumScore += score.Value;
                                count++;
                            }
                            if (ns.DaDanhGia || (score.HasValue && score.Value > 0))
                            {
                                daDanhGiaCount++;
                            }
                        }
                    }

                    var tenPB = pb.TenPhongBan;
                    if (string.IsNullOrWhiteSpace(tenPB) || tenPB == "Khác" || tenPB == "Các nhân sự trực thuộc Vụ")
                    {
                        tenPB = !string.IsNullOrEmpty(toanCucData.TenDonViSuDung) ? toanCucData.TenDonViSuDung : "Nhân sự thuộc Vụ";
                    }

                    result.Add(new KPI_ThongKeQuyDonViDto
                    {
                        PhongBanId = pb.PhongBanId,
                        TenPhongBan = tenPB,
                        DiemTrungBinhQuy = count > 0 ? Math.Round(sumScore / count, 2) : 0,
                        SoLuongNhanSu = pb.ListThongTinNhanSu?.Count ?? 0,
                        SoLuongDaDanhGia = daDanhGiaCount,
                        ListNhanSu = pb.ListThongTinNhanSu ?? new List<KPI_TongHopTieuChiChungNhanSuDto>()
                    });
                }
            }

            return result.OrderByDescending(x => x.DiemTrungBinhQuy).ToList();
        }

        private static string? NormalizeVaiTroDanhGia(string? vaiTroDanhGia)
        {
            if (string.IsNullOrWhiteSpace(vaiTroDanhGia)) return null;

            var vaiTro = vaiTroDanhGia.Trim();
            if (string.Equals(vaiTro, "PhoPhong", StringComparison.OrdinalIgnoreCase))
                return "PhoTruongPhong";

            return new[] { "CaNhan", "PhoTruongPhong", "TruongPhong", "PhoCucTruong", "CucTruong" }
                .FirstOrDefault(x => string.Equals(x, vaiTro, StringComparison.OrdinalIgnoreCase));
        }

        private async Task<HashSet<Guid>> GetPhieuDaDanhGiaTheoVaiTro(List<Guid> phieuIds, string vaiTroDanhGia)
        {
            var trangThai = vaiTroDanhGia switch
            {
                "CaNhan" => "KhoiTao",
                "PhoTruongPhong" => "GuiPhoTruongPhong",
                "TruongPhong" => "GuiTruongPhong",
                "PhoCucTruong" => "GuiPhoCucTruong",
                "CucTruong" => "GuiCucTruong",
                _ => null
            };

            if (trangThai == null || phieuIds.Count == 0)
                return new HashSet<Guid>();

            var ids = await _kPI_QuaTrinhXuLyPhieuDanhGiaRepository.GetQueryable()
                .Where(x => phieuIds.Contains(x.IdPhieuDanhGia) && x.TrangThai == trangThai && x.IsXuLy)
                .Select(x => x.IdPhieuDanhGia)
                .Distinct()
                .ToListAsync();

            return ids.ToHashSet();
        }

        private static double TinhTongDiemDauRa(
            IEnumerable<KPI_NhiemVu> nhiemVus,
            ILookup<Guid, KPI_DauRaNhiemVu> dauRaTheoNhiemVu,
            ILookup<(Guid? IdLyLich, Guid? IdDotDanhGia), KPI_KetQuaThucHienNhiemVu> ketQuaTheoNhanSuVaDot)
        {
            double tongDiem = 0;
            foreach (var nhiemVu in nhiemVus)
            {
                var diemDauRa = dauRaTheoNhiemVu[nhiemVu.Id].Sum(dauRa => dauRa.DiemTheoBoTieuChi ?? 0d);
                var ketQua = ketQuaTheoNhanSuVaDot[(nhiemVu.IdLyLich, nhiemVu.IdDotTheoDoiDanhGia)].FirstOrDefault();

                if (ketQua?.CoApDungHeSoLanhDao == true && ketQua.HeSoLanhDaoApDung.HasValue)
                {
                    diemDauRa *= (double)ketQua.HeSoLanhDaoApDung.Value;
                }

                tongDiem += diemDauRa;
            }

            return Math.Round(tongDiem, 2);
        }

        private async Task<(Dictionary<Guid, decimal> dictDiemNV, Dictionary<Guid, double> dictDiemTCC, Dictionary<Guid, int> dictSoDauRaThieuDiem)> TinhDiemTheoVaiTro(List<Guid> phieuIds, string vaiTroDanhGia)
        {
            var dictDiemNV = new Dictionary<Guid, decimal>();
            var dictDiemTCC = new Dictionary<Guid, double>();
            var dictSoDauRaThieuDiem = new Dictionary<Guid, int>();

            if (phieuIds == null || !phieuIds.Any() || string.IsNullOrWhiteSpace(vaiTroDanhGia))
                return (dictDiemNV, dictDiemTCC, dictSoDauRaThieuDiem);

            var normVaiTro = NormalizeVaiTroDanhGia(vaiTroDanhGia);
            if (normVaiTro == null)
                return (dictDiemNV, dictDiemTCC, dictSoDauRaThieuDiem);

            var phieuInfoList = await _kpi_PhieuDanhGiaRepository.GetQueryable()
                .Where(x => phieuIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    x.IdLyLich,
                    x.IdDotDanhGia,
                    x.DiemThucHienNhiemVu,
                    x.DiemTieuChiChung
                })
                .ToListAsync();

            var lyLichIds = phieuInfoList.Where(x => x.IdLyLich.HasValue).Select(x => x.IdLyLich.Value).Distinct().ToList();
            var dotIds = phieuInfoList.Where(x => x.IdDotDanhGia.HasValue).Select(x => x.IdDotDanhGia.Value).Distinct().ToList();

            var dauRaDb = await (from dr in _kPI_DauRaNhiemVuRepository.GetQueryable()
                                 join nv in _kPI_NhiemVuRepository.GetQueryable() on dr.IdNhiemVu equals nv.Id
                                 where nv.IdLyLich.HasValue && lyLichIds.Contains(nv.IdLyLich.Value)
                                       && nv.IdDotTheoDoiDanhGia.HasValue && dotIds.Contains(nv.IdDotTheoDoiDanhGia.Value)
                                 select new
                                 {
                                     IdDauRa = dr.Id,
                                     IdNhiemVu = nv.Id,
                                     IdLyLich = nv.IdLyLich.Value,
                                     IdDotDanhGia = nv.IdDotTheoDoiDanhGia.Value,
                                     DiemTheoBoTieuChi = dr.DiemTheoBoTieuChi.HasValue ? dr.DiemTheoBoTieuChi.Value : (nv.DiemTheoBoTieuChi ?? 0d),
                                     CaNhan_SoLuong = dr.ChamDiemSoLuong_HoanThanh ?? 0d,
                                     CaNhan_ChatLuong = dr.ChamDiemChatLuong_SoDiemConLai ?? 0d,
                                     CaNhan_TienDo = dr.ChamDiemTienDo_SoDiemConLai ?? 0d,
                                     CaNhanCoDuDiem = dr.ChamDiemSoLuong_HoanThanh.HasValue
                                         && dr.ChamDiemChatLuong_SoDiemConLai.HasValue
                                         && dr.ChamDiemTienDo_SoDiemConLai.HasValue,
                                     CaNhan_SoLuongDiem = dr.ChamDiemSoLuong_Diem,
                                     CaNhan_ChatLuongDiem = dr.ChamDiemChatLuong_Diem,
                                     CaNhan_TienDoDiem = dr.ChamDiemTienDo_Diem
                                 }).ToListAsync();

            var chiTietDb = await _kPI_DauRaNhiemVu_ChiTietDanhGiaRepository.GetQueryable()
                .Where(ct => ct.IdPhieuDanhGia.HasValue && phieuIds.Contains(ct.IdPhieuDanhGia.Value))
                .Select(ct => new
                {
                    IdPhieuDanhGia = ct.IdPhieuDanhGia.Value,
                    IdDauRaNhiemVu = ct.IdDauRaNhiemVu,
                    VaiTroDanhGia = ct.VaiTroDanhGia == "PhoPhong" ? "PhoTruongPhong" : ct.VaiTroDanhGia,
                    ChamDiemSoLuong_HoanThanh = ct.ChamDiemSoLuong_HoanThanh,
                    ChamDiemChatLuong_SoDiemConLai = ct.ChamDiemChatLuong_SoDiemConLai,
                    ChamDiemTienDo_SoDiemConLai = ct.ChamDiemTienDo_SoDiemConLai,
                    ChamDiemSoLuong_Diem = ct.ChamDiemSoLuong_Diem,
                    ChamDiemChatLuong_Diem = ct.ChamDiemChatLuong_Diem,
                    ChamDiemTienDo_Diem = ct.ChamDiemTienDo_Diem
                })
                .ToListAsync();

            var kqThucHienDict = await _kPI_KetQuaThucHienNhiemVuRepository.GetQueryable()
                .Where(x => x.IdPhieuDanhGia.HasValue && phieuIds.Contains(x.IdPhieuDanhGia.Value))
                .ToDictionaryAsync(x => x.IdPhieuDanhGia!.Value, x => x);

            foreach (var phieu in phieuInfoList)
            {
                var dauRasOfPhieu = dauRaDb
                    .Where(x => x.IdLyLich == phieu.IdLyLich && x.IdDotDanhGia == phieu.IdDotDanhGia)
                    .ToList();
                dictSoDauRaThieuDiem[phieu.Id] = 0;

                if (dauRasOfPhieu.Any())
                {
                    kqThucHienDict.TryGetValue(phieu.Id, out var kqThucHien);
                    var coApDungHeSo = kqThucHien != null && kqThucHien.CoApDungHeSoLanhDao && kqThucHien.HeSoLanhDaoApDung.HasValue;
                    var heSo = coApDungHeSo ? (double)kqThucHien!.HeSoLanhDaoApDung!.Value : 1d;

                    var chiTietOfPhieu = chiTietDb.Where(x => x.IdPhieuDanhGia == phieu.Id).ToList();

                    var evaluatedDauRas = dauRasOfPhieu.Select(dr =>
                    {
                        var foundCt = chiTietOfPhieu.FirstOrDefault(x =>
                            x.IdDauRaNhiemVu == dr.IdDauRa
                            && string.Equals(x.VaiTroDanhGia, normVaiTro, StringComparison.OrdinalIgnoreCase));

                        var laDiemCaNhan = normVaiTro == "CaNhan";

                        return new
                        {
                            DiemTheoBoTieuChi = dr.DiemTheoBoTieuChi,
                            CoDiemDungVaiTro = laDiemCaNhan ? dr.CaNhanCoDuDiem : foundCt != null
                                && foundCt.ChamDiemSoLuong_HoanThanh.HasValue
                                && foundCt.ChamDiemChatLuong_SoDiemConLai.HasValue
                                && foundCt.ChamDiemTienDo_SoDiemConLai.HasValue,
                            SoLuongHoanThanh = laDiemCaNhan ? dr.CaNhan_SoLuong : foundCt?.ChamDiemSoLuong_HoanThanh ?? 0d,
                            ChatLuongConLai = laDiemCaNhan ? dr.CaNhan_ChatLuong : foundCt?.ChamDiemChatLuong_SoDiemConLai ?? 0d,
                            TienDoConLai = laDiemCaNhan ? dr.CaNhan_TienDo : foundCt?.ChamDiemTienDo_SoDiemConLai ?? 0d,
                            SoLuongDiem = laDiemCaNhan ? dr.CaNhan_SoLuongDiem : foundCt?.ChamDiemSoLuong_Diem,
                            ChatLuongDiem = laDiemCaNhan ? dr.CaNhan_ChatLuongDiem : foundCt?.ChamDiemChatLuong_Diem,
                            TienDoDiem = laDiemCaNhan ? dr.CaNhan_TienDoDiem : foundCt?.ChamDiemTienDo_Diem
                        };
                    }).ToList();

                    var soDauRaThieu = evaluatedDauRas.Count(x => !x.CoDiemDungVaiTro);
                    dictSoDauRaThieuDiem[phieu.Id] = soDauRaThieu;
                    if (soDauRaThieu > 0)
                    {
                        continue;
                    }

                    var sumBase = evaluatedDauRas.Sum(x => x.DiemTheoBoTieuChi * heSo);
                    decimal finalScoreOutOf70 = 0;
                    if (sumBase > 0)
                    {
                        var sumSl = evaluatedDauRas.Sum(x => x.SoLuongHoanThanh);
                        var sumCl = evaluatedDauRas.Sum(x => x.ChatLuongConLai);
                        var sumTd = evaluatedDauRas.Sum(x => x.TienDoConLai);

                        var pctSl = (sumSl / sumBase) * 100d;
                        var pctCl = (sumCl / sumBase) * 100d;
                        var pctTd = (sumTd / sumBase) * 100d;

                        var avgPct = coApDungHeSo
                            ? (pctSl + pctCl + pctTd
                                + (kqThucHien?.KetQuaLinhVucPhanTram ?? 100d)
                                + (kqThucHien?.KhaNangToChucPhanTram ?? 100d)
                                + (kqThucHien?.NangLucTapHopPhanTram ?? 100d)) / 6d
                            : (pctSl + pctCl + pctTd) / 3d;

                        finalScoreOutOf70 = (decimal)Math.Round((avgPct * 70d) / 100d, 2);
                    }
                    else
                    {
                        var count = evaluatedDauRas.Count;
                        if (count > 0)
                        {
                            var avgSl = evaluatedDauRas.Average(x => x.SoLuongDiem ?? 0d);
                            var avgCl = evaluatedDauRas.Average(x => x.ChatLuongDiem ?? 0d);
                            var avgTd = evaluatedDauRas.Average(x => x.TienDoDiem ?? 0d);
                            var avgPct = (avgSl + avgCl + avgTd) / 3d;
                            finalScoreOutOf70 = (decimal)Math.Round((avgPct * 70d) / 100d, 2);
                        }
                    }
                    dictDiemNV[phieu.Id] = finalScoreOutOf70;
                }
            }

            var lstTcc = await GetQueryable()
                .Where(x => (x.IdPhieuDanhGia.HasValue && phieuIds.Contains(x.IdPhieuDanhGia.Value))
                            || (x.IdDotDanhGia.HasValue && dotIds.Contains(x.IdDotDanhGia.Value) && x.IdLyLich.HasValue && lyLichIds.Contains(x.IdLyLich.Value)))
                .ToListAsync();

            if (normVaiTro == "CaNhan")
            {
                foreach (var phieu in phieuInfoList)
                {
                    var tccItems = lstTcc.Where(x => x.IdPhieuDanhGia == phieu.Id || (x.IdLyLich == phieu.IdLyLich && x.IdDotDanhGia == phieu.IdDotDanhGia)).ToList();
                    if (tccItems.Any())
                    {
                        dictDiemTCC[phieu.Id] = Math.Round((double)tccItems.Sum(x => (double)(x.DiemTuCham ?? 0)), 2);
                    }
                }
            }
            else
            {
                var lstCapTren = await _kPI_TieuChiChung_DiemSo_CapTrenRepository.GetQueryable()
                    .Where(x => x.Id_PhieuDanhGia.HasValue && phieuIds.Contains(x.Id_PhieuDanhGia.Value))
                    .ToListAsync();

                foreach (var phieu in phieuInfoList)
                {
                    var tccItems = lstTcc.Where(x => x.IdPhieuDanhGia == phieu.Id || (x.IdLyLich == phieu.IdLyLich && x.IdDotDanhGia == phieu.IdDotDanhGia)).ToList();
                    double totalTcc = 0d;
                    bool coDuDiemDungVaiTro = tccItems.Any();
                    foreach (var tc in tccItems)
                    {
                        var match = lstCapTren.FirstOrDefault(x =>
                            x.Id_PhieuDanhGia == phieu.Id
                            && x.Id_TieuChiChung_DiemSo == tc.Id
                            && (string.Equals(x.VaiTroDanhGia, normVaiTro, StringComparison.OrdinalIgnoreCase)
                                || (normVaiTro == "PhoTruongPhong" && string.Equals(x.VaiTroDanhGia, "PhoPhong", StringComparison.OrdinalIgnoreCase))));
                        if (match?.Diem == null)
                        {
                            coDuDiemDungVaiTro = false;
                            break;
                        }
                        totalTcc += (double)match.Diem.Value;
                    }

                    if (coDuDiemDungVaiTro)
                    {
                        dictDiemTCC[phieu.Id] = Math.Round(totalTcc, 2);
                    }
                }
            }

            return (dictDiemNV, dictDiemTCC, dictSoDauRaThieuDiem);
        }
    }
}
