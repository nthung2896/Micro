using Hinet.Extensions;
using Hinet.Model.Entities;
using Hinet.Repository.AspNetUsersRepository;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Repository.KPI_BoTieuChiChungRepository;
using Hinet.Repository.KPI_BoTieuChiDonViRepository;
using Hinet.Repository.KPI_DauRaNhiemVu_ChiTietDanhGiaRepository;
using Hinet.Repository.KPI_DauRaNhiemVuRepository;
using Hinet.Repository.KPI_DotDanhGia_DonViRepository;
using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;
using Hinet.Repository.KPI_KetQuaThucHienNhiemVuRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.KPI_NhiemVuRepository;
using Hinet.Repository.KPI_PhieuDanhGiaRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSo_CapTrenRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSoRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Constant;
using Hinet.Service.Dto;
using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using Hinet.Service.KPI_PhieuDanhGiaService.EvaluationWorkflow;
using Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace Hinet.Service.KPI_PhieuDanhGiaService
{
    public class KPI_PhieuDanhGiaService : Service<KPI_PhieuDanhGia>, IKPI_PhieuDanhGiaService
    {
        private readonly IKPI_QuaTrinhXuLyPhieuDanhGiaService _kpi_QuaTrinhXuLyPhieuDanhGiaService;
        private readonly IAspNetUsersRepository _aspNetUsersRepository;
        private readonly IDM_NhomDanhMucRepository _nhomDanhMucRepository;
        private readonly IDM_DuLieuDanhMucRepository _duLieuDanhMucRepository;
        private readonly IKPI_DotTheoDoiDanhGiaRepository _kPI_DotTheoDoiDanhGiaRepository;
        private readonly IKPI_LyLich2CRepository _lyLich2CRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IKPI_NhiemVuRepository _kPI_NhiemVuRepository;
        private readonly IKPI_DauRaNhiemVuRepository _kPI_DauRaNhiemVuRepository;
        private readonly IKPI_KetQuaThucHienNhiemVuRepository _kPI_KetQuaThucHienNhiemVuRepository;
        private readonly IKPI_DotDanhGia_DonViRepository _kPI_DotDanhGia_DonViRepository;
        private readonly IKPI_BoTieuChiChungRepository _kPI_BoTieuChiChungRepository;
        private readonly IKPI_BoTieuChiDonViRepository _kPI_BoTieuChiDonViRepository;
        private readonly IKPI_DauRaNhiemVu_ChiTietDanhGiaRepository _chiTietDanhGiaRepository;
        private readonly IKPI_TieuChiChung_DiemSoRepository _tieuChiChungDiemSoRepository;
        private readonly IKPI_TieuChiChung_DiemSo_CapTrenRepository _tieuChiChungDiemSoCapTrenRepository;
        private readonly ILogger<KPI_PhieuDanhGiaService> _logger;

        public KPI_PhieuDanhGiaService(
            IKPI_PhieuDanhGiaRepository kPI_PhieuDanhGiaRepository,
            IKPI_DotTheoDoiDanhGiaRepository kPI_DotTheoDoiDanhGiaRepository,
            IKPI_LyLich2CRepository lyLich2CRepository,
            IKPI_QuaTrinhXuLyPhieuDanhGiaService kpi_QuaTrinhXuLyPhieuDanhGiaService,
            IAspNetUsersRepository aspNetUsersRepository,
            IDM_DuLieuDanhMucRepository duLieuDanhMucRepositor,
            IDepartmentRepository departmentRepository,
            IKPI_NhiemVuRepository kPI_NhiemVuRepository,
            IKPI_DauRaNhiemVuRepository kPI_DauRaNhiemVuRepository,
            IKPI_KetQuaThucHienNhiemVuRepository kPI_KetQuaThucHienNhiemVuRepository,
            IKPI_DotDanhGia_DonViRepository kPI_DotDanhGia_DonViRepository,
            IKPI_BoTieuChiChungRepository kPI_BoTieuChiChungRepository,
            IKPI_BoTieuChiDonViRepository kPI_BoTieuChiDonViRepository,
            IDM_NhomDanhMucRepository nhomDanhMucRepository,
            IKPI_DauRaNhiemVu_ChiTietDanhGiaRepository chiTietDanhGiaRepository,
            IKPI_TieuChiChung_DiemSoRepository tieuChiChungDiemSoRepository,
            IKPI_TieuChiChung_DiemSo_CapTrenRepository tieuChiChungDiemSoCapTrenRepository,
            ILogger<KPI_PhieuDanhGiaService> logger) : base(kPI_PhieuDanhGiaRepository)
        {
            _kPI_DotTheoDoiDanhGiaRepository = kPI_DotTheoDoiDanhGiaRepository;
            _kpi_QuaTrinhXuLyPhieuDanhGiaService = kpi_QuaTrinhXuLyPhieuDanhGiaService;
            _lyLich2CRepository = lyLich2CRepository;
            _aspNetUsersRepository = aspNetUsersRepository;
            _duLieuDanhMucRepository = duLieuDanhMucRepositor;
            _departmentRepository = departmentRepository;
            _nhomDanhMucRepository = nhomDanhMucRepository;
            _kPI_NhiemVuRepository = kPI_NhiemVuRepository;
            _kPI_DauRaNhiemVuRepository = kPI_DauRaNhiemVuRepository;
            _kPI_KetQuaThucHienNhiemVuRepository = kPI_KetQuaThucHienNhiemVuRepository;
            _kPI_DotDanhGia_DonViRepository = kPI_DotDanhGia_DonViRepository;
            _kPI_BoTieuChiChungRepository = kPI_BoTieuChiChungRepository;
            _kPI_BoTieuChiDonViRepository = kPI_BoTieuChiDonViRepository;
            _chiTietDanhGiaRepository = chiTietDanhGiaRepository;
            _tieuChiChungDiemSoRepository = tieuChiChungDiemSoRepository;
            _tieuChiChungDiemSoCapTrenRepository = tieuChiChungDiemSoCapTrenRepository;
            _logger = logger;
        }

        public async Task<PagedList<KPI_PhieuDanhGiaDto>> GetData(KPI_PhieuDanhGiaSearch search)
        {
            var query = from q in GetQueryable()
                        join lyLich in _lyLich2CRepository.GetQueryable() on q.IdLyLich equals lyLich.Id into lyLichGroup
                        from ll in lyLichGroup.DefaultIfEmpty()

                        join dept in _departmentRepository.GetQueryable() on q.PhongBan equals dept.Id.ToString() into deptGroup
                        from d in deptGroup.DefaultIfEmpty()

                        join deptLyLich in _departmentRepository.GetQueryable() on (ll != null ? ll.PhongBanId : Guid.Empty) equals deptLyLich.Id into deptLyLichGroup
                        from dll in deptLyLichGroup.DefaultIfEmpty()

                        join donVi in _departmentRepository.GetQueryable() on (q.DonVi.HasValue && q.DonVi.Value != Guid.Empty ? q.DonVi.Value : (ll != null ? ll.DonViSuDungId : Guid.Empty)) equals donVi.Id into donViGroup
                        from dv in donViGroup.DefaultIfEmpty()

                        select new KPI_PhieuDanhGiaDto()
                        {
                            IdLyLich = q.IdLyLich,
                            HoTen = ll != null ? ll.HoTen : "",
                            DonVi = q.DonVi,
                            TenDonVi = dv != null ? dv.Name : "",
                            PhongBan = q.PhongBan,
                            TenPhongBan = d != null ? d.Name : (dll != null ? dll.Name : q.PhongBan),
                            IdDotDanhGia = q.IdDotDanhGia,
                            Luong = q.Luong,
                            TrangThai = q.TrangThai,
                            DiemTieuChiChung = q.DiemTieuChiChung,
                            DiemThucHienNhiemVu = q.DiemThucHienNhiemVu,
                            TongDiem = q.TongDiem,
                            UuDiem = q.UuDiem,
                            HanChe = q.HanChe,
                            YKienNhanXet = q.YKienNhanXet,
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
                if (search.IdLyLich.HasValue)
                {
                    query = query.Where(x => x.IdLyLich == search.IdLyLich);
                }
                if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotDanhGia))
                {
                    query = query.Where(x => x.IdDotDanhGia == idDotDanhGia);
                }
                if (!string.IsNullOrEmpty(search.PhongBan))
                {
                    query = query.Where(x => EF.Functions.Like(x.PhongBan, $"%{search.PhongBan}%"));
                }
                if (search.DiemTieuChiChung.HasValue)
                {
                    query = query.Where(x => x.DiemTieuChiChung == search.DiemTieuChiChung);
                }
                if (search.DiemThucHienNhiemVu.HasValue)
                {
                    query = query.Where(x => x.DiemThucHienNhiemVu == search.DiemThucHienNhiemVu);
                }
                if (search.TongDiem.HasValue)
                {
                    query = query.Where(x => x.TongDiem == search.TongDiem);
                }
                if (!string.IsNullOrEmpty(search.UuDiem))
                {
                    query = query.Where(x => EF.Functions.Like(x.UuDiem, $"%{search.UuDiem}%"));
                }
                if (!string.IsNullOrEmpty(search.HanChe))
                {
                    query = query.Where(x => EF.Functions.Like(x.HanChe, $"%{search.HanChe}%"));
                }
                if (!string.IsNullOrEmpty(search.YKienNhanXet))
                {
                    query = query.Where(x => EF.Functions.Like(x.YKienNhanXet, $"%{search.YKienNhanXet}%"));
                }
            }
            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_PhieuDanhGiaDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_PhieuDanhGiaDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)
                              join lyLich in _lyLich2CRepository.GetQueryable() on q.IdLyLich equals lyLich.Id into lyLichGroup
                              from ll in lyLichGroup.DefaultIfEmpty()

                              join dept in _departmentRepository.GetQueryable() on q.PhongBan equals dept.Id.ToString() into deptGroup
                              from d in deptGroup.DefaultIfEmpty()

                              join deptLyLich in _departmentRepository.GetQueryable() on (ll != null ? ll.PhongBanId : Guid.Empty) equals deptLyLich.Id into deptLyLichGroup
                              from dll in deptLyLichGroup.DefaultIfEmpty()

                              join donVi in _departmentRepository.GetQueryable() on (q.DonVi.HasValue && q.DonVi.Value != Guid.Empty ? q.DonVi.Value : (ll != null ? ll.DonViSuDungId : Guid.Empty)) equals donVi.Id into donViGroup
                              from dv in donViGroup.DefaultIfEmpty()

                              select new KPI_PhieuDanhGiaDto()
                              {
                                  IdLyLich = q.IdLyLich,
                                  HoTen = ll != null ? ll.HoTen : "",
                                  DonVi = q.DonVi,
                                  TenDonVi = dv != null ? dv.Name : "",
                                  PhongBan = q.PhongBan,
                                  TenPhongBan = d != null ? d.Name : (dll != null ? dll.Name : q.PhongBan),
                                  IdDotDanhGia = q.IdDotDanhGia,
                                  Luong = q.Luong,
                                  TrangThai = q.TrangThai,
                                  DiemTieuChiChung = q.DiemTieuChiChung,
                                  DiemThucHienNhiemVu = q.DiemThucHienNhiemVu,
                                  TongDiem = q.TongDiem,
                                  UuDiem = q.UuDiem,
                                  HanChe = q.HanChe,
                                  YKienNhanXet = q.YKienNhanXet,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  IsDeleted = q.IsDeleted,
                                  DeletedId = q.DeletedId,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  Id = q.Id,
                              }).FirstOrDefaultAsync();

            if (item != null)
            {
                // Phiếu cũ có thể được tạo khi ChucVuHienTai còn ở dạng mã viết hoa
                // nhưng Luong chưa được xác định. Sửa lại ngay khi đọc để cả hai
                // màn hình nhận được cùng một buttonLuong.
                if (item.Luong <= 0 && item.IdLyLich.HasValue)
                {
                    var phieuEntity = await GetByIdAsync(id);
                    if (phieuEntity != null)
                    {
                        item.Luong = await EnsureLuongAsync(phieuEntity);
                    }
                }

                item.ButtonLuong = GetButtonLuong(item.Luong, item.TrangThai ?? TrangThaiPhieuConstant.KhoiTao);
            }

            return item;
        }

        public async Task<PagedList<DotDanhGiaWithPhieuDto>> GetDotDanhGiaWithPhieu(Guid userId, KPI_PhieuDanhGiaSearch search)
        {
            var dotDanhGias = _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                .Where(x => x.Type != LoaiDotDanhGiaConstant.TAP_THE && x.Type != "TapThe");
            var phieuDanhGias = GetQueryable();

            if (search.IdLyLich.HasValue)
            {
                phieuDanhGias = phieuDanhGias.Where(x => x.IdLyLich == search.IdLyLich.Value);
            }

            var queryQuaTrinh = _kpi_QuaTrinhXuLyPhieuDanhGiaService
                .GetQueryable();
            /////
            var queryLyLich = _lyLich2CRepository.GetQueryable();
            var queryDepartment = _departmentRepository.GetQueryable();

            var idDmChucVu = await _nhomDanhMucRepository
                .GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.CHUCVUVNU)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();


            var queryNhiemVu = _kPI_NhiemVuRepository.GetQueryable();
            Guid? effectiveLyLichId = search != null && search.IdLyLich.HasValue ? search.IdLyLich.Value : null;
            var currentLyLich = await _lyLich2CRepository.GetQueryable()
                .FirstOrDefaultAsync(x => (effectiveLyLichId.HasValue && x.Id == effectiveLyLichId.Value) || x.UserId == userId);

            Guid targetDonViId = currentLyLich?.DonViSuDungId ?? Guid.Empty;
            Guid targetPhongBanId = currentLyLich?.PhongBanId ?? Guid.Empty;
            Guid finalLyLichId = currentLyLich?.Id ?? (effectiveLyLichId ?? Guid.Empty);
            var targetLyLichId = finalLyLichId != Guid.Empty ? finalLyLichId : userId;

            var query = from dot in dotDanhGias
                        join phieu in phieuDanhGias on dot.Id equals phieu.IdDotDanhGia into leftJ
                        from left in leftJ.DefaultIfEmpty()

                        join lyLich in queryLyLich
                        on (left != null ? left.IdLyLich : finalLyLichId) equals lyLich.Id into lyLichJ
                        from ll in lyLichJ.DefaultIfEmpty()

                        join chucVuTbl in _duLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == idDmChucVu)
                        on (ll != null ? ll.ChucVuHienTai : (currentLyLich != null ? currentLyLich.ChucVuHienTai : "")) equals chucVuTbl.Code into chucVuJoin
                        from chucVuInfo in chucVuJoin.DefaultIfEmpty()

                        join dep in queryDepartment
                        on (ll != null ? ll.DonViSuDungId : targetDonViId) equals dep.Id into depJ
                        from department in depJ.DefaultIfEmpty()

                        join pb in queryDepartment
                        on (ll != null ? ll.PhongBanId : targetPhongBanId) equals pb.Id into pbJ
                        from phongBan in pbJ.DefaultIfEmpty()

                        join dotDvPb in _kPI_DotDanhGia_DonViRepository.GetQueryable()
                        on new { IdDot = dot.Id, IdDonVi = (left != null && left.DonVi.HasValue ? left.DonVi.Value : (ll != null ? ll.PhongBanId : targetPhongBanId)) }
                        equals new { IdDot = dotDvPb.IdDotDanhGia, IdDonVi = dotDvPb.IdDonVi } into dotDvPbJoin
                        from ddvPb in dotDvPbJoin.DefaultIfEmpty()

                        join dotDvDv in _kPI_DotDanhGia_DonViRepository.GetQueryable()
                        on new { IdDot = dot.Id, IdDonVi = (left != null && left.DonVi.HasValue ? left.DonVi.Value : (ll != null ? ll.DonViSuDungId : targetDonViId)) }
                        equals new { IdDot = dotDvDv.IdDotDanhGia, IdDonVi = dotDvDv.IdDonVi } into dotDvDvJoin
                        from ddvDv in dotDvDvJoin.DefaultIfEmpty()

                        join btcPb in _kPI_BoTieuChiChungRepository.GetQueryable()
                        on ddvPb.IdBoTieuChiChung equals (Guid?)btcPb.Id into btcPbJoin
                        from boTieuChiChungPb in btcPbJoin.DefaultIfEmpty()

                        join btcDv in _kPI_BoTieuChiChungRepository.GetQueryable()
                        on ddvDv.IdBoTieuChiChung equals (Guid?)btcDv.Id into btcDvJoin
                        from boTieuChiChungDv in btcDvJoin.DefaultIfEmpty()

                        join btcDonViPb in _kPI_BoTieuChiDonViRepository.GetQueryable()
                        on ddvPb.IdBoChiSoNhiemVu equals (Guid?)btcDonViPb.Id into btcDonViPbJoin
                        from boTieuChiDonViPb in btcDonViPbJoin.DefaultIfEmpty()

                        join btcDonViDv in _kPI_BoTieuChiDonViRepository.GetQueryable()
                        on ddvDv.IdBoChiSoNhiemVu equals (Guid?)btcDonViDv.Id into btcDonViDvJoin
                        from boTieuChiDonViDv in btcDonViDvJoin.DefaultIfEmpty()

                        join defaultBtc in _kPI_BoTieuChiChungRepository.GetQueryable()
                        on dot.DefaultTieuChiChung equals (Guid?)defaultBtc.Id into defaultBtcJoin
                        from defaultBoTieuChiChung in defaultBtcJoin.DefaultIfEmpty()

                        join defaultBtcDonVi in _kPI_BoTieuChiDonViRepository.GetQueryable()
                        on dot.DefaultTieuChiDonVi equals (Guid?)defaultBtcDonVi.Id into defaultBtcDonViJoin
                        from defaultBoTieuChiDonVi in defaultBtcDonViJoin.DefaultIfEmpty()

                        select new DotDanhGiaWithPhieuDto
                        {
                            IdDotDanhGia = dot.Id,
                            TenDotDanhGia = dot.TenDotTheoDoiDanhGia,
                            Thang = dot.Thang,
                            Quy = dot.Quy,
                            Nam = dot.Nam,
                            ThoiGianBatDau = dot.ThoiGianBatDau,
                            ThoiGianKetThuc = dot.ThoiGianKetThuc,
                            TrangThaiDot = dot.TrangThai,
                            IdPhieuDanhGia = left != null ? left.Id : null,
                            IdLyLich = left != null ? left.IdLyLich : (search != null && search.IdLyLich.HasValue ? search.IdLyLich.Value : (ll != null ? (Guid?)ll.Id : (finalLyLichId != Guid.Empty ? (Guid?)finalLyLichId : null))),
                            IdDonVi = left != null && left.DonVi.HasValue ? left.DonVi.Value : (ll != null ? (Guid?)ll.PhongBanId : (targetPhongBanId != Guid.Empty ? (Guid?)targetPhongBanId : (targetDonViId != Guid.Empty ? (Guid?)targetDonViId : null))),

                            IdBoTieuChiChung = boTieuChiChungPb != null ? boTieuChiChungPb.Id : (boTieuChiChungDv != null ? boTieuChiChungDv.Id : (defaultBoTieuChiChung != null ? defaultBoTieuChiChung.Id : null)),
                            IdBoTieuChiNhiemVu = boTieuChiDonViPb != null ? boTieuChiDonViPb.Id : (boTieuChiDonViDv != null ? boTieuChiDonViDv.Id : (defaultBoTieuChiDonVi != null ? defaultBoTieuChiDonVi.Id : null)),
                            TenBoTieuChiChung = boTieuChiChungPb != null ? boTieuChiChungPb.TenBoTieuChiDonVi : (boTieuChiChungDv != null ? boTieuChiChungDv.TenBoTieuChiDonVi : (defaultBoTieuChiChung != null ? defaultBoTieuChiChung.TenBoTieuChiDonVi : null)),
                            TenBoTieuChiNhiemVu = boTieuChiDonViPb != null ? boTieuChiDonViPb.TenBoTieuChiDonVi : (boTieuChiDonViDv != null ? boTieuChiDonViDv.TenBoTieuChiDonVi : (defaultBoTieuChiDonVi != null ? defaultBoTieuChiDonVi.TenBoTieuChiDonVi : null)),

                            DiemTieuChiChung = left != null ? left.DiemTieuChiChung : null,
                            DiemThucHienNhiemVu = left != null ? left.DiemThucHienNhiemVu : null,
                            TongDiem = left != null ? left.TongDiem : null,
                            UuDiem = left != null ? left.UuDiem : null,
                            HanChe = left != null ? left.HanChe : null,
                            YKienNhanXet = left != null ? left.YKienNhanXet : null,
                            DaDanhGia = left != null,
                            DaDanhGiaNhiemVu = (left != null && queryNhiemVu.Any(nv => nv.IdPhieuDanhGia == left.Id)) || queryNhiemVu.Any(nv => nv.IdDotTheoDoiDanhGia == dot.Id && nv.IdLyLich == (left != null ? left.IdLyLich : targetLyLichId)),
                            ThoiGianTao = left != null ? left.CreatedDate : null,
                            TrangThai = left != null ? left.TrangThai : "",
                            Luong = left != null ? left.Luong : 0,
                            TenChuPhieu = ll != null ? ll.HoTen : (currentLyLich != null ? currentLyLich.HoTen : (left != null ? left.CreatedBy : null)),
                            ChucVuChuPhieu = chucVuInfo != null ? chucVuInfo.Name : null,
                            DonViChuPhieu = department != null ? department.Name : (left != null && left.DonVi.HasValue ? left.DonVi.Value.ToString() : null),
                            PhongBanChuPhieu = (phongBan != null ? phongBan.Name : null),
                        };

            query = query.OrderByDescending(x => x.ThoiGianBatDau);

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotGuid))
                {
                    query = query.Where(x => x.IdDotDanhGia == idDotGuid);
                }
                if (!string.IsNullOrEmpty(search.DonVi))
                {
                    if (Guid.TryParse(search.DonVi, out var donViGuidSearch))
                    {
                        query = query.Where(x => x.IdDonVi == donViGuidSearch);
                    }
                    else
                    {
                        query = query.Where(x => x.DonViChuPhieu != null && EF.Functions.Like(x.DonViChuPhieu, $"%{search.DonVi}%"));
                    }
                }
                if (!string.IsNullOrEmpty(search.PhongBan))
                {
                    if (Guid.TryParse(search.PhongBan, out var pbGuidSearch))
                    {
                        var pbNameSearch = await _departmentRepository.GetQueryable().Where(d => d.Id == pbGuidSearch).Select(d => d.Name).FirstOrDefaultAsync();
                        query = query.Where(x =>
                            (x.PhongBanChuPhieu != null && pbNameSearch != null && EF.Functions.Like(x.PhongBanChuPhieu, $"%{pbNameSearch}%")) ||
                            (x.PhongBanChuPhieu != null && EF.Functions.Like(x.PhongBanChuPhieu, $"%{search.PhongBan}%"))
                        );
                    }
                    else
                    {
                        query = query.Where(x => !string.IsNullOrEmpty(x.PhongBanChuPhieu) && EF.Functions.Like(x.PhongBanChuPhieu, $"%{search.PhongBan}%"));
                    }
                }
                if (search.IdLyLich.HasValue && search.IdLyLich.Value != Guid.Empty)
                {
                    query = query.Where(x => x.IdLyLich == search.IdLyLich.Value
                        && (x.TrangThaiDot == TrangThaiDotDanhGiaConstant.ACTIVE
                            || x.TrangThaiDot == "Đang hoạt động"
                            || x.IdPhieuDanhGia != null));
                }
                if (search.IsXuLy.HasValue && search.IdNguoiXuLy.HasValue)
                {
                    var targetUserId = search.IdNguoiXuLy.Value;
                    var userLyLichObj = await queryLyLich.FirstOrDefaultAsync(x => x.UserId == targetUserId);
                    var userLyLichId = userLyLichObj?.Id;

                    var isPersonalSearch = search.IdLyLich.HasValue && userLyLichId.HasValue && search.IdLyLich.Value == userLyLichId.Value;

                    if (isPersonalSearch)
                    {
                        if (search.IsXuLy.Value == false)
                        {
                            // Trang cá nhân tự đánh giá - Chờ xử lý: Đợt chưa tạo phiếu HOẶC phiếu ở trạng thái Khởi tạo / Trả về
                            query = query.Where(x => x.IdPhieuDanhGia == null
                                || x.TrangThai == TrangThaiPhieuConstant.KhoiTao
                                || x.TrangThai == TrangThaiPhieuConstant.TraVe);
                        }
                        else
                        {
                            // Trang cá nhân tự đánh giá - Đã xử lý / Đang gửi cấp trên duyệt: Phiếu của chính mình đã gửi đi
                            query = query.Where(x => x.IdPhieuDanhGia != null
                                && x.TrangThai != TrangThaiPhieuConstant.KhoiTao
                                && x.TrangThai != TrangThaiPhieuConstant.TraVe
                                && x.TrangThai != TrangThaiPhieuConstant.ThuHoi);
                        }
                    }
                    else
                    {
                        if (search.IsXuLy.Value == true)
                        {
                            query = query.Where(x => queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia && (qt.IdNguoiXuLy == targetUserId || qt.IdNguoiGui == targetUserId) && qt.IsXuLy == true)
                                && !queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia && qt.IdNguoiXuLy == targetUserId && qt.IsXuLy == false));
                        }
                        else
                        {
                            // Quá trình khởi tạo/trả về cũng được gán người xử lý là chủ phiếu
                            // với IsXuLy = false. Không đưa các trạng thái này vào danh sách
                            // chờ xử lý của người duyệt; đây chỉ là phiếu đang chờ chủ phiếu xử lý
                            query = query.Where(x =>
                                x.TrangThai != TrangThaiPhieuConstant.KhoiTao
                                && x.TrangThai != TrangThaiPhieuConstant.TraVe
                                && x.TrangThai != TrangThaiPhieuConstant.ThuHoi
                                && (!userLyLichId.HasValue || x.IdLyLich != userLyLichId.Value)
                                && queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia && qt.IdNguoiXuLy == targetUserId && qt.IsXuLy == false));
                        }
                    }
                }
                if (search.IsKhacHoanThanh.HasValue)
                {
                    if (search.IsKhacHoanThanh.Value)
                    {
                        query = query.Where(x => x.TrangThai != TrangThaiPhieuConstant.DaDuyet);
                    }
                    else
                    {
                        query = query.Where(x => x.TrangThai == TrangThaiPhieuConstant.DaDuyet);
                    }
                }
                if (search.Quy.HasValue)
                {
                    query = query.Where(x => x.Quy == search.Quy.Value);
                }
                if (search.Thang.HasValue)
                {
                    query = query.Where(x => x.Thang == search.Thang.Value);
                }
                if (search.Nam.HasValue)
                {
                    query = query.Where(x => x.Nam == search.Nam.Value);
                }
            }

            var result = await PagedList<DotDanhGiaWithPhieuDto>.CreateAsync(query, search);

            // Gắn ButtonLuong cho từng item sau khi phân trang
            if (result?.Items != null)
            {
                var currentUserId = search?.IdNguoiXuLy ?? Guid.Empty;
                if (currentUserId == Guid.Empty && userId != Guid.Empty)
                {
                    var lyLichUserId = await _lyLich2CRepository
                        .GetQueryable()
                        .Where(x => x.UserId == userId)
                        .Select(x => x.UserId)
                        .FirstOrDefaultAsync();
                    if (lyLichUserId != null)
                    {
                        currentUserId = lyLichUserId.Value;
                    }
                }

                var phieuIds = result.Items
                    .Where(x => x.IdPhieuDanhGia.HasValue)
                    .Select(x => x.IdPhieuDanhGia!.Value)
                    .ToList();

                var activeProcessPhieuIds = new HashSet<Guid>();
                if (phieuIds.Any() && currentUserId != Guid.Empty)
                {
                    // Lấy ra những bản ghi được hiển thị button lên (những bản ghi được hiển thị nút là chưa xử lý và người xử lý là currentUserId)
                    var listIds = await queryQuaTrinh
                        .Where(qt => phieuIds.Contains(qt.IdPhieuDanhGia) && qt.IsXuLy == false && qt.IdNguoiXuLy == currentUserId)
                        .Select(qt => qt.IdPhieuDanhGia)
                        .ToListAsync();
                    activeProcessPhieuIds = new HashSet<Guid>(listIds);
                }

                // Lấy điểm chi tiết
                var dotIds = result.Items.Where(x => x.IdDotDanhGia != Guid.Empty).Select(x => x.IdDotDanhGia).Distinct().ToList();
                var targetLyLichIdDetail = search != null && search.IdLyLich.HasValue ? search.IdLyLich.Value : userId;

                var diemTheoDot = new Dictionary<Guid, (decimal DiemTheoBoTieuChi, decimal DiemSoLuong, decimal DiemChatLuong, decimal DiemTienDo)>();
                if (dotIds.Count > 0)
                {
                    var nhiemVuQuery = _kPI_NhiemVuRepository.GetQueryable();
                    var dauRaQuery = _kPI_DauRaNhiemVuRepository.GetQueryable();
                    var diemNhiemVuRows = await (
                        from nhiemVu in nhiemVuQuery
                        join dauRa in dauRaQuery on (Guid?)nhiemVu.Id equals dauRa.IdNhiemVu
                        where nhiemVu.IdLyLich == targetLyLichIdDetail
                              && nhiemVu.IdDotTheoDoiDanhGia.HasValue
                              && dotIds.Contains(nhiemVu.IdDotTheoDoiDanhGia.Value)
                        select new
                        {
                            IdDotDanhGia = nhiemVu.IdDotTheoDoiDanhGia.Value,
                            dauRa.DiemTheoBoTieuChi,
                            dauRa.ChamDiemSoLuong_HoanThanh,
                            dauRa.ChamDiemChatLuong_SoDiemConLai,
                            dauRa.ChamDiemTienDo_SoDiemConLai
                        }).ToListAsync();

                    diemTheoDot = diemNhiemVuRows
                        .GroupBy(x => x.IdDotDanhGia)
                        .ToDictionary(
                            group => group.Key,
                            group => (
                                DiemTheoBoTieuChi: (decimal)group.Sum(x => x.DiemTheoBoTieuChi ?? 0d),
                                DiemSoLuong: (decimal)group.Sum(x => x.ChamDiemSoLuong_HoanThanh ?? 0d),
                                DiemChatLuong: (decimal)group.Sum(x => Math.Max(0d, x.ChamDiemChatLuong_SoDiemConLai ?? 0d)),
                                DiemTienDo: (decimal)group.Sum(x => Math.Max(0d, x.ChamDiemTienDo_SoDiemConLai ?? 0d))
                            ));
                }

                var isPhoPhongTroLen = KPI_VaiTroDanhGiaHelper.IsPhoPhongTroLen(currentLyLich?.ChucVuHienTai);
                foreach (var item in result.Items)
                {
                    item.IsPhoPhongTroLen = isPhoPhongTroLen;
                    if (diemTheoDot.TryGetValue(item.IdDotDanhGia, out var diem))
                    {
                        item.DiemTheoBoTieuChi = diem.DiemTheoBoTieuChi;
                        item.DiemSoLuong = diem.DiemSoLuong;
                        item.DiemChatLuong = diem.DiemChatLuong;
                        item.DiemTienDo = diem.DiemTienDo;
                    }

                    if (item.DaDanhGia && !string.IsNullOrEmpty(item.TrangThai))
                    {
                        item.ButtonLuong = GetButtonLuong(item.Luong, item.TrangThai);
                        if (item.ButtonLuong != null)
                        {
                            if (item.TrangThai == TrangThaiPhieuConstant.KhoiTao || item.TrangThai == TrangThaiPhieuConstant.TraVe)
                            {
                                item.IsShowButton = true;
                            }
                            else if (item.IdPhieuDanhGia.HasValue && activeProcessPhieuIds.Contains(item.IdPhieuDanhGia.Value))
                            {
                                item.IsShowButton = true;
                            }
                        }
                    }
                }
            }

            return result;
        }

        public async Task<PagedList<DotDanhGiaWithPhieuDto>> GetDanhSachNhanSuDanhGia(Guid userId, KPI_PhieuDanhGiaSearch search)
        {
            search ??= new KPI_PhieuDanhGiaSearch();
            var dotDanhGias = _kPI_DotTheoDoiDanhGiaRepository.GetQueryable();
            var phieuDanhGias = GetQueryable();
            var queryLyLich = _lyLich2CRepository.GetQueryable();
            var queryDepartment = _departmentRepository.GetQueryable();
            var queryNhiemVu = _kPI_NhiemVuRepository.GetQueryable();

            var currentUserProfile = await queryLyLich
                .Where(x => x.UserId == userId)
                .Select(x => new
                {
                    IdLyLich = x.Id,
                    x.DonViSuDungId,
                    x.PhongBanId,
                    x.ChucVuHienTai,
                    OrganizationType = queryDepartment
                        .Where(department => department.Id == x.DonViSuDungId)
                        .Select(department => department.Loai)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            var chucVuHienTai = currentUserProfile?.ChucVuHienTai ?? string.Empty;
            if (!KPI_EvaluationWorkflowConfiguration.TryResolve(
                    currentUserProfile?.OrganizationType,
                    chucVuHienTai,
                    out var evaluationWorkflow))
            {
                _logger.LogWarning(
                    "Không xác định được workflow theo dõi đánh giá. UserId={UserId}, DonViSuDungId={DonViSuDungId}, Loai={OrganizationType}, ChucVu={ChucVu}",
                    userId,
                    currentUserProfile?.DonViSuDungId,
                    currentUserProfile?.OrganizationType,
                    chucVuHienTai);
                return new PagedList<DotDanhGiaWithPhieuDto>(new List<DotDanhGiaWithPhieuDto>(), search.PageIndex < 1 ? 1 : search.PageIndex, search.PageSize, 0);
            }

            // Các cờ cũ được giữ để tương thích API khác. Màn hình theo dõi dùng metadata workflow bên dưới.
            var visibleRoleCodes = evaluationWorkflow.VisibleSteps.Select(x => x.RoleCode).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var isCT_PCT = visibleRoleCodes.Contains("PhoCucTruong") || visibleRoleCodes.Contains("CucTruong");
            var isTP_PTP = visibleRoleCodes.Contains("PhoTruongPhong") || visibleRoleCodes.Contains("TruongPhong");
            var showTruongPhongCol = visibleRoleCodes.Contains("TruongPhong");
            var showPhoCucCol = visibleRoleCodes.Contains("PhoCucTruong");
            var showCucTruongCol = visibleRoleCodes.Contains("CucTruong");
            var showPhoVuTruongCol = visibleRoleCodes.Contains("PHOVUTRUONG");
            var showVuTruongCol = visibleRoleCodes.Contains("VUTRUONG");

            var idDmChucVu = await _nhomDanhMucRepository
                .GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.CHUCVUVNU)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

            var idDotDanhGia = Guid.Empty;
            if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var parsedDot))
            {
                idDotDanhGia = parsedDot;
            }

            var query = from ll in queryLyLich
                        join chucVuTbl in _duLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == idDmChucVu)
                        on ll.ChucVuHienTai equals chucVuTbl.Code into chucVuJoin
                        from chucVuInfo in chucVuJoin.DefaultIfEmpty()

                        join dep in queryDepartment
                        on ll.DonViSuDungId equals dep.Id into depJ
                        from department in depJ.DefaultIfEmpty()

                        join pb in queryDepartment
                        on ll.PhongBanId equals pb.Id into pbJ
                        from phongBan in pbJ.DefaultIfEmpty()

                        select new { ll, chucVuInfo, department, phongBan };

            if (!string.IsNullOrEmpty(search.PhongBan))
            {
                var pbSearch = search.PhongBan;
                query = query.Where(x => x.phongBan != null && (x.phongBan.Name.Contains(pbSearch) || x.phongBan.Id.ToString() == pbSearch));
            }
            else if (currentUserProfile != null)
            {
                if (currentUserProfile.PhongBanId != Guid.Empty)
                {
                    query = query.Where(x => x.ll.PhongBanId == currentUserProfile.PhongBanId);
                }
                else if (currentUserProfile.DonViSuDungId != Guid.Empty)
                {
                    query = query.Where(x => x.ll.DonViSuDungId == currentUserProfile.DonViSuDungId);
                }
            }

            var joinedQuery = from x in query
                              from dot in dotDanhGias.Where(d => d.Id == idDotDanhGia).DefaultIfEmpty()
                              join phieu in phieuDanhGias.Where(p => p.IdDotDanhGia == idDotDanhGia) on x.ll.Id equals phieu.IdLyLich into leftJ
                              from left in leftJ.DefaultIfEmpty()

                              select new DotDanhGiaWithPhieuDto
                              {
                                  IdDotDanhGia = dot != null ? dot.Id : Guid.Empty,
                                  TenDotDanhGia = dot != null ? dot.TenDotTheoDoiDanhGia : "",
                                  ThoiGianBatDau = dot != null ? dot.ThoiGianBatDau : null,
                                  ThoiGianKetThuc = dot != null ? dot.ThoiGianKetThuc : null,
                                  TrangThaiDot = dot != null ? dot.TrangThai : "",

                                  IdPhieuDanhGia = left != null ? left.Id : null,
                                  IdLyLich = (Guid?)x.ll.Id,
                                  IdDonVi = x.ll.DonViSuDungId,
                                  IdPhongBan = x.ll.PhongBanId,
                                  IsCT_PCT = isCT_PCT,
                                  IsTP_PTP = isTP_PTP,

                                  DiemTieuChiChung = left != null ? left.DiemTieuChiChung : null,
                                  DiemThucHienNhiemVu = left != null ? left.DiemThucHienNhiemVu : null,
                                  TongDiem = left != null ? left.TongDiem : null,
                                  UuDiem = left != null ? left.UuDiem : null,
                                  HanChe = left != null ? left.HanChe : null,
                                  YKienNhanXet = left != null ? left.YKienNhanXet : null,
                                  DaDanhGia = left != null,
                                  DaDanhGiaNhiemVu = left != null && queryNhiemVu.Any(nv => nv.IdPhieuDanhGia == left.Id) || queryNhiemVu.Any(nv => nv.IdDotTheoDoiDanhGia == idDotDanhGia && nv.IdLyLich == x.ll.Id),
                                  ThoiGianTao = left != null ? left.CreatedDate : null,
                                  TrangThai = left != null ? left.TrangThai : "",
                                  TenChuPhieu = x.ll.HoTen,
                                  ChucVuChuPhieu = x.chucVuInfo != null ? x.chucVuInfo.Name : null,
                                  ChucVuCodeChuPhieu = x.ll.ChucVuHienTai,
                                  ChucVuPriority = x.chucVuInfo != null ? x.chucVuInfo.Priority : int.MaxValue,
                                  DonViChuPhieu = x.department != null ? x.department.Name : null,
                                  PhongBanChuPhieu = x.phongBan != null ? x.phongBan.Name : null,
                              };

            var result = await PagedList<DotDanhGiaWithPhieuDto>.CreateAsync(joinedQuery.OrderBy(x => x.ChucVuPriority).ThenBy(x => x.TenChuPhieu), search);

            var phieuIds = result.Items.Where(x => x.IdPhieuDanhGia.HasValue).Select(x => x.IdPhieuDanhGia.Value).ToList();
            if (phieuIds.Any())
            {
                var queryChiTietDb = await (from ct in _chiTietDanhGiaRepository.GetQueryable()
                                            join dr in _kPI_DauRaNhiemVuRepository.GetQueryable() on ct.IdDauRaNhiemVu equals dr.Id into drJoin
                                            from dauRa in drJoin.DefaultIfEmpty()
                                            join nv in _kPI_NhiemVuRepository.GetQueryable() on dauRa.IdNhiemVu equals nv.Id into nvJoin
                                            from nhiemVu in nvJoin.DefaultIfEmpty()
                                            where (ct.VaiTroDanhGia != "CaNhan")
                                                  && ct.IdPhieuDanhGia.HasValue
                                                  && phieuIds.Contains(ct.IdPhieuDanhGia.Value)
                                            select new
                                            {
                                                IdPhieuDanhGia = ct.IdPhieuDanhGia.Value,
                                                IdDauRaNhiemVu = ct.IdDauRaNhiemVu,
                                                VaiTroDanhGia = ct.VaiTroDanhGia,
                                                DiemTheoBoTieuChi = dauRa != null && dauRa.DiemTheoBoTieuChi.HasValue
                                                    ? dauRa.DiemTheoBoTieuChi.Value
                                                    : (nhiemVu != null && nhiemVu.DiemTheoBoTieuChi.HasValue ? nhiemVu.DiemTheoBoTieuChi.Value : 0d),
                                                SoLuongHoanThanh = ct.ChamDiemSoLuong_HoanThanh ?? 0d,
                                                ChatLuongConLai = ct.ChamDiemChatLuong_SoDiemConLai ?? 0d,
                                                TienDoConLai = ct.ChamDiemTienDo_SoDiemConLai ?? 0d,
                                                SoLuongDiem = ct.ChamDiemSoLuong_Diem,
                                                ChatLuongDiem = ct.ChamDiemChatLuong_Diem,
                                                TienDoDiem = ct.ChamDiemTienDo_Diem,
                                            }).ToListAsync();

                var queryChiTiet = queryChiTietDb
                    .GroupBy(x => new { x.IdPhieuDanhGia, x.IdDauRaNhiemVu })
                    .Select(g =>
                    {
                        return g.FirstOrDefault(x => x.VaiTroDanhGia == "TruongPhong")
                            ?? g.FirstOrDefault(x => x.VaiTroDanhGia == "PhoTruongPhong" || x.VaiTroDanhGia == "PhoPhong")
                            ?? g.FirstOrDefault(x => x.VaiTroDanhGia == "LanhDao")
                            ?? g.First();
                    })
                    .ToList();

                var kqThucHienDict = await _kPI_KetQuaThucHienNhiemVuRepository.GetQueryable()
                    .Where(x => x.IdPhieuDanhGia.HasValue && phieuIds.Contains(x.IdPhieuDanhGia.Value))
                    .ToDictionaryAsync(x => x.IdPhieuDanhGia!.Value, x => x);

                var queryTccDb = await (from ds in _tieuChiChungDiemSoRepository.GetQueryable()
                                        join ct in _tieuChiChungDiemSoCapTrenRepository.GetQueryable() on ds.Id equals ct.Id_TieuChiChung_DiemSo
                                        where ds.IdPhieuDanhGia.HasValue && phieuIds.Contains(ds.IdPhieuDanhGia.Value)
                                           && ct.VaiTroDanhGia != "CaNhan"
                                        select new
                                        {
                                            IdPhieuDanhGia = ds.IdPhieuDanhGia.Value,
                                            IdTieuChiChung = ds.IdTieuChiChung,
                                            VaiTroDanhGia = ct.VaiTroDanhGia,
                                            Diem = ct.Diem
                                        }).ToListAsync();

                // Tính điểm theo role dữ liệu của workflow. Các trường điểm cũ vẫn được gán
                // ở SetEvaluationRoleScore để các màn hình chưa chuyển đổi không bị ảnh hưởng.
                var rolesToCompute = KPI_EvaluationWorkflowConfiguration.ScoreRoleCodes;

                foreach (var role in rolesToCompute)
                {
                    var scoreRoleCode = role;

                    // 1. Tính điểm nhiệm vụ cho role
                    var chiTietForRole = queryChiTietDb
                        .Where(x => KPI_EvaluationWorkflowConfiguration.RoleMatchesScoreCode(x.VaiTroDanhGia, scoreRoleCode))
                        .GroupBy(x => new { x.IdPhieuDanhGia, x.IdDauRaNhiemVu })
                        .Select(g => g.First())
                        .GroupBy(x => x.IdPhieuDanhGia);

                    foreach (var g in chiTietForRole)
                    {
                        kqThucHienDict.TryGetValue(g.Key, out var kqThucHien);
                        var coApDungHeSo = kqThucHien != null && kqThucHien.CoApDungHeSoLanhDao && kqThucHien.HeSoLanhDaoApDung.HasValue;
                        var heSo = coApDungHeSo ? (double)kqThucHien!.HeSoLanhDaoApDung!.Value : 1d;

                        var sumBase = g.Sum(x => x.DiemTheoBoTieuChi * heSo);
                        decimal finalScoreOutOf70 = 0;
                        if (sumBase > 0)
                        {
                            var sumSl = g.Sum(x => x.SoLuongHoanThanh);
                            var sumCl = g.Sum(x => x.ChatLuongConLai);
                            var sumTd = g.Sum(x => x.TienDoConLai);

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
                            var count = g.Count();
                            if (count > 0)
                            {
                                var avgSl = g.Average(x => x.SoLuongDiem ?? 0d);
                                var avgCl = g.Average(x => x.ChatLuongDiem ?? 0d);
                                var avgTd = g.Average(x => x.TienDoDiem ?? 0d);
                                var avgPct = (avgSl + avgCl + avgTd) / 3d;
                                finalScoreOutOf70 = (decimal)Math.Round((avgPct * 70d) / 100d, 2);
                            }
                        }

                        var targetItem = result.Items.FirstOrDefault(x => x.IdPhieuDanhGia == g.Key);
                        if (targetItem != null)
                        {
                            SetEvaluationRoleScore(targetItem, scoreRoleCode, diemThucHienNhiemVu: finalScoreOutOf70);
                        }
                    }

                    var queryTccForRole = queryTccDb
                        .Where(x => KPI_EvaluationWorkflowConfiguration.RoleMatchesScoreCode(x.VaiTroDanhGia, scoreRoleCode))
                        .GroupBy(x => new { x.IdPhieuDanhGia, x.IdTieuChiChung })
                        .Select(g => g.First())
                        .ToList();

                    var tccGrouped = queryTccForRole.GroupBy(x => x.IdPhieuDanhGia);
                    foreach (var gTcc in tccGrouped)
                    {
                        var targetItem = result.Items.FirstOrDefault(x => x.IdPhieuDanhGia == gTcc.Key);
                        if (targetItem != null)
                        {
                            var totalTcc = gTcc.Sum(x => x.Diem ?? 0m);
                            SetEvaluationRoleScore(targetItem, scoreRoleCode, diemTieuChiChung: totalTcc);
                        }
                    }

                    // 3. Tính tổng điểm cho từng vai trò
                    foreach (var item in result.Items.Where(x => x.IdPhieuDanhGia.HasValue))
                    {
                        if (item.PhoPhong_DiemThucHienNhiemVu.HasValue || item.PhoPhong_DiemTieuChiChung.HasValue)
                        {
                            item.PhoPhong_TongDiem = (item.PhoPhong_DiemThucHienNhiemVu ?? 0m) + (item.PhoPhong_DiemTieuChiChung ?? 0m);
                        }
                        if (item.TruongPhong_DiemThucHienNhiemVu.HasValue || item.TruongPhong_DiemTieuChiChung.HasValue)
                        {
                            item.TruongPhong_TongDiem = (item.TruongPhong_DiemThucHienNhiemVu ?? 0m) + (item.TruongPhong_DiemTieuChiChung ?? 0m);
                        }
                        if (item.PhoCucTruong_DiemThucHienNhiemVu.HasValue || item.PhoCucTruong_DiemTieuChiChung.HasValue)
                        {
                            item.PhoCucTruong_TongDiem = (item.PhoCucTruong_DiemThucHienNhiemVu ?? 0m) + (item.PhoCucTruong_DiemTieuChiChung ?? 0m);
                        }
                        if (item.CucTruong_DiemThucHienNhiemVu.HasValue || item.CucTruong_DiemTieuChiChung.HasValue)
                        {
                            item.CucTruong_TongDiem = (item.CucTruong_DiemThucHienNhiemVu ?? 0m) + (item.CucTruong_DiemTieuChiChung ?? 0m);
                        }
                        if (item.PhoVuTruong_DiemThucHienNhiemVu.HasValue || item.PhoVuTruong_DiemTieuChiChung.HasValue)
                        {
                            item.PhoVuTruong_TongDiem = (item.PhoVuTruong_DiemThucHienNhiemVu ?? 0m) + (item.PhoVuTruong_DiemTieuChiChung ?? 0m);
                        }
                        if (item.VuTruong_DiemThucHienNhiemVu.HasValue || item.VuTruong_DiemTieuChiChung.HasValue)
                        {
                            item.VuTruong_TongDiem = (item.VuTruong_DiemThucHienNhiemVu ?? 0m) + (item.VuTruong_DiemTieuChiChung ?? 0m);
                        }
                        UpdateEvaluationRoleScoreTotals(item);
                    }

                }

                var phieuCanHienThiNguoiXuLy = result.Items
                    .Where(x => x.IdPhieuDanhGia.HasValue
                        && (x.TrangThai == TrangThaiPhieuConstant.DaDuyet
                            || (!string.IsNullOrEmpty(x.TrangThai) && x.TrangThai.StartsWith("Gui", StringComparison.Ordinal))))
                    .ToList();

                if (phieuCanHienThiNguoiXuLy.Any())
                {
                    var phieuCanHienThiIds = phieuCanHienThiNguoiXuLy
                        .Select(x => x.IdPhieuDanhGia!.Value)
                        .ToList();

                    var quaTrinhTheoPhieu = await _kpi_QuaTrinhXuLyPhieuDanhGiaService.GetQueryable()
                        .Where(x => phieuCanHienThiIds.Contains(x.IdPhieuDanhGia))
                        .OrderByDescending(x => x.CreatedDate)
                        .ThenByDescending(x => x.Id)
                        .ToListAsync();

                    var lichSuTheoPhieu = quaTrinhTheoPhieu
                        .GroupBy(x => x.IdPhieuDanhGia)
                        .ToDictionary(x => x.Key, x => x.ToList());
                    var nguoiXuLyTheoPhieu = new Dictionary<Guid, (Guid IdNguoiXuLy, string TrangThaiBuocXuLy)>();

                    foreach (var item in phieuCanHienThiNguoiXuLy)
                    {
                        var idPhieu = item.IdPhieuDanhGia!.Value;
                        if (!lichSuTheoPhieu.TryGetValue(idPhieu, out var lichSu) || !lichSu.Any())
                        {
                            continue;
                        }

                        if (item.TrangThai == TrangThaiPhieuConstant.DaDuyet)
                        {
                            var banGhiDaDuyet = lichSu[0];
                            if (banGhiDaDuyet.TrangThai != TrangThaiPhieuConstant.DaDuyet || lichSu.Count < 2)
                            {
                                continue;
                            }

                            var buocTruocKhiDuyet = lichSu[1];
                            if (banGhiDaDuyet.IdNguoiGui != Guid.Empty)
                            {
                                nguoiXuLyTheoPhieu[idPhieu] = (banGhiDaDuyet.IdNguoiGui, buocTruocKhiDuyet.TrangThai);
                            }
                        }
                        else
                        {
                            var banGhiMoiNhat = lichSu[0];
                            if (banGhiMoiNhat.IdNguoiXuLy != Guid.Empty)
                            {
                                nguoiXuLyTheoPhieu[idPhieu] = (banGhiMoiNhat.IdNguoiXuLy, item.TrangThai);
                            }
                        }
                    }

                    var idNguoiXuLyList = nguoiXuLyTheoPhieu.Values
                        .Select(x => x.IdNguoiXuLy)
                        .Where(x => x != Guid.Empty)
                        .Distinct()
                        .ToList();

                    var lyLichDict = new Dictionary<Guid, string>();
                    if (idNguoiXuLyList.Any())
                    {
                        var lyLichNguoiXuLy = await _lyLich2CRepository.GetQueryable()
                            .Where(x => x.UserId.HasValue && idNguoiXuLyList.Contains(x.UserId.Value))
                            .Select(x => new { UserId = x.UserId!.Value, x.HoTen })
                            .ToListAsync();

                        lyLichDict = lyLichNguoiXuLy
                            .Where(x => x.UserId != Guid.Empty && !string.IsNullOrWhiteSpace(x.HoTen))
                            .GroupBy(x => x.UserId)
                            .ToDictionary(x => x.Key, x => x.First().HoTen);
                    }

                    foreach (var item in phieuCanHienThiNguoiXuLy)
                    {
                        var idPhieu = item.IdPhieuDanhGia!.Value;
                        if (nguoiXuLyTheoPhieu.TryGetValue(idPhieu, out var nguoiXuLy)
                            && lyLichDict.TryGetValue(nguoiXuLy.IdNguoiXuLy, out var hoTen))
                        {
                            item.IdNguoiXuLyHienTai = nguoiXuLy.IdNguoiXuLy;
                            item.TenNguoiXuLyHienTai = hoTen;
                            item.TrangThaiBuocXuLyHienThi = nguoiXuLy.TrangThaiBuocXuLy;
                        }
                    }
                }

                foreach (var item in result.Items)
                {
                    // Với các chức vụ có cột đánh giá tương ứng, điểm tự đánh giá cá nhân
                    // có thể được dùng làm dữ liệu dự phòng cho cột chức vụ.
                    if (item.DaDanhGia)
                    {
                        var cvChuPhieu = item.ChucVuCodeChuPhieu ?? item.ChucVuChuPhieu ?? string.Empty;
                        var luongType = KPI_VaiTroDanhGiaHelper.GetLuongTypeFromChucVu(cvChuPhieu);

                        switch (luongType)
                        {
                            case LuongConstant.LuongType.LuongPhoTruongPhong:
                                // PTP tự đánh giá chỉ hiển thị ở cột Cá nhân, không nhân bản sang cột PTP.
                                item.PhoPhong_DiemThucHienNhiemVu = null;
                                item.PhoPhong_DiemTieuChiChung = null;
                                item.PhoPhong_TongDiem = null;
                                break;
                            case LuongConstant.LuongType.LuongTruongPhong:
                                // TP tự đánh giá chỉ hiển thị ở cột Cá nhân, không nhân bản sang cột TP.
                                item.TruongPhong_DiemThucHienNhiemVu = null;
                                item.TruongPhong_DiemTieuChiChung = null;
                                item.TruongPhong_TongDiem = null;
                                break;
                            case LuongConstant.LuongType.LuongPhoCucTruong:
                                // PCT tự đánh giá chỉ hiển thị ở cột Cá nhân, không nhân bản sang cột PCT.
                                item.PhoCucTruong_DiemThucHienNhiemVu = null;
                                item.PhoCucTruong_DiemTieuChiChung = null;
                                item.PhoCucTruong_TongDiem = null;
                                break;
                            case LuongConstant.LuongType.LuongCucTruong:
                                // Cục trưởng tự đánh giá chỉ hiển thị ở cột Cá nhân, không nhân bản sang cột Cục trưởng.
                                item.CucTruong_DiemThucHienNhiemVu = null;
                                item.CucTruong_DiemTieuChiChung = null;
                                item.CucTruong_TongDiem = null;
                                break;
                            case LuongConstant.LuongType.LuongPhoVuTruong:
                                // PVT tự đánh giá chỉ hiển thị ở cột Cá nhân, không nhân bản sang cột PVT.
                                item.PhoVuTruong_DiemThucHienNhiemVu = null;
                                item.PhoVuTruong_DiemTieuChiChung = null;
                                item.PhoVuTruong_TongDiem = null;
                                break;
                            case LuongConstant.LuongType.LuongVuTruong:
                                // VT tự đánh giá chỉ hiển thị ở cột Cá nhân, không nhân bản sang cột VT.
                                item.VuTruong_DiemThucHienNhiemVu = null;
                                item.VuTruong_DiemTieuChiChung = null;
                                item.VuTruong_TongDiem = null;
                                break;
                        }

                        // Áp dụng cùng quy tắc cho các role chỉ có trong workflow mới
                        // (Phó/Quyền Giám đốc và Phó/Chánh Văn phòng).
                        if (KPI_EvaluationWorkflowConfiguration.TryGetScoreRoleCode(cvChuPhieu, out var selfScoreRoleCode))
                        {
                            ClearEvaluationRoleScore(item, selfScoreRoleCode);
                        }
                    }
                }

            }

            // Metadata quyền/cột phải được trả về cả khi đợt chưa có phiếu nào.
            foreach (var item in result.Items)
            {
                item.ShowTruongPhongCol = showTruongPhongCol;
                item.ShowPhoCucCol = showPhoCucCol;
                item.ShowCucTruongCol = showCucTruongCol;
                item.ShowPhoVuTruongCol = showPhoVuTruongCol;
                item.ShowVuTruongCol = showVuTruongCol;
                item.IsTP = IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuTruongPhong);
                item.IsPTP = IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuPhoTruongPhong);
                item.IsPCT = IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuPhoCucTruong);
                item.IsCT = IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuCucTruong);
                item.IsPhoPhongTroLen = KPI_VaiTroDanhGiaHelper.IsPhoPhongTroLen(
                    chucVuHienTai,
                    isCT: item.IsCT,
                    isPCT: item.IsPCT,
                    isTP: item.IsTP,
                    isPTP: item.IsPTP);
                item.ChucVuNguoiThaoTac = chucVuHienTai;
                item.EvaluationWorkflowType = evaluationWorkflow.OrganizationType;
                item.VisibleEvaluationColumns = evaluationWorkflow.VisibleColumns.ToList();
                item.EvaluationRoleScores = evaluationWorkflow.VisibleSteps.ToDictionary(
                    step => step.RoleCode,
                    step => item.EvaluationRoleScores.TryGetValue(step.ScoreRoleCode, out var score)
                        ? score
                        : new EvaluationRoleScoreDto(),
                    StringComparer.OrdinalIgnoreCase);
            }
            return result;
        }

        public async Task<List<ThongKePhieuDanhGiaTheoThangDto>> GetThongKePhieuDanhGiaTheoThang(Guid userId, KPI_PhieuDanhGiaSearch search)
        {
            var nam = search?.Nam is > 0 ? search.Nam.Value : DateTime.Now.Year;
            var idLyLich = search?.IdLyLich;

            if (!idLyLich.HasValue || idLyLich.Value == Guid.Empty)
            {
                idLyLich = await _lyLich2CRepository
                    .GetQueryable()
                    .Where(x => x.UserId == userId)
                    .Select(x => (Guid?)x.Id)
                    .FirstOrDefaultAsync();
            }

            var phieuMoiNhatTheoThang = new Dictionary<int, ThongKePhieuDanhGiaTheoThangDto>();

            if (idLyLich.HasValue && idLyLich.Value != Guid.Empty)
            {
                var phieuTrongNam = await (from phieu in GetQueryable()
                                           join dot in _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                                               on phieu.IdDotDanhGia equals dot.Id
                                           where phieu.IdLyLich == idLyLich.Value
                                                 && phieu.Id != Guid.Empty
                                                 && dot.Nam == nam
                                                 && dot.TrangThai == TrangThaiDotDanhGiaConstant.ACTIVE
                                                 && dot.Thang.HasValue
                                                 && dot.Thang.Value >= 1
                                                 && dot.Thang.Value <= 12
                                           select new
                                           {
                                               Thang = dot.Thang.Value,
                                               IdPhieuDanhGia = (Guid?)phieu.Id,
                                               IdDotDanhGia = (Guid?)dot.Id,
                                               TenDotDanhGia = dot.TenDotTheoDoiDanhGia,
                                               DiemTieuChiChung = phieu.DiemTieuChiChung,
                                               DiemThucHienNhiemVu = phieu.DiemThucHienNhiemVu,
                                               TongDiem = phieu.TongDiem,
                                               ThoiGianTao = phieu.CreatedDate,
                                               TrangThai = phieu.TrangThai
                                           })
                    .OrderBy(x => x.Thang)
                    .ThenByDescending(x => x.TrangThai == TrangThaiPhieuConstant.DaDuyet ? 2 : (x.TrangThai != TrangThaiPhieuConstant.KhoiTao ? 1 : 0))
                    .ThenByDescending(x => x.TongDiem ?? 0)
                    .ThenByDescending(x => x.ThoiGianTao)
                    .ThenByDescending(x => x.IdPhieuDanhGia)
                    .ToListAsync();

                var dotIds = phieuTrongNam
                    .GroupBy(x => x.Thang)
                    .Select(group => group.First().IdDotDanhGia!.Value)
                    .Distinct()
                    .ToList();

                var phieuIds = phieuTrongNam
                    .Where(x => x.IdPhieuDanhGia.HasValue)
                    .Select(x => x.IdPhieuDanhGia!.Value)
                    .Distinct()
                    .ToList();
                var diemKetQuaTheoPhieu = phieuIds.Count == 0
                    ? new Dictionary<Guid, double?>()
                    : (await _kPI_KetQuaThucHienNhiemVuRepository
                        .GetQueryable()
                        .Where(x => !x.IsDeleted
                            && x.IdPhieuDanhGia.HasValue
                            && phieuIds.Contains(x.IdPhieuDanhGia.Value))
                        .OrderByDescending(x => x.CreatedDate)
                        .Select(x => new { x.IdPhieuDanhGia, x.DiemTieuChiKetQua })
                        .ToListAsync())
                    .GroupBy(x => x.IdPhieuDanhGia!.Value)
                    .ToDictionary(
                        group => group.Key,
                        group => group.First().DiemTieuChiKetQua);

                var diemTheoDot = new Dictionary<Guid, (decimal DiemTheoBoTieuChi, decimal DiemSoLuong, decimal DiemChatLuong, decimal DiemTienDo, decimal SoLuongKhongHoanThanh, decimal ChatLuongKhongDat, decimal TienDoChamMuon)>();
                if (dotIds.Count > 0)
                {
                    var nhiemVuQuery = _kPI_NhiemVuRepository.GetQueryable();
                    var dauRaQuery = _kPI_DauRaNhiemVuRepository.GetQueryable();
                    var diemNhiemVuRows = await (
                        from nhiemVu in nhiemVuQuery
                        join dauRa in dauRaQuery on (Guid?)nhiemVu.Id equals dauRa.IdNhiemVu
                        where nhiemVu.IdLyLich == idLyLich.Value
                              && nhiemVu.IdDotTheoDoiDanhGia.HasValue
                              && dotIds.Contains(nhiemVu.IdDotTheoDoiDanhGia.Value)
                        select new
                        {
                            IdDotDanhGia = nhiemVu.IdDotTheoDoiDanhGia.Value,
                            dauRa.DiemTheoBoTieuChi,
                            dauRa.ChamDiemSoLuong_HoanThanh,
                            dauRa.ChamDiemChatLuong_SoDiemConLai,
                            dauRa.ChamDiemTienDo_SoDiemConLai,
                            dauRa.ChamDiemSoLuong_KhongHoanThanh,
                            dauRa.ChamDiemChatLuong_KhongDat,
                            dauRa.ChamDiemTienDo_KhongDat
                        }).ToListAsync();

                    diemTheoDot = diemNhiemVuRows
                        .GroupBy(x => x.IdDotDanhGia)
                        .ToDictionary(
                            group => group.Key,
                            group => (
                                DiemTheoBoTieuChi: (decimal)group.Sum(x => x.DiemTheoBoTieuChi ?? 0d),
                                DiemSoLuong: (decimal)group.Sum(x => x.ChamDiemSoLuong_HoanThanh ?? 0d),
                                DiemChatLuong: (decimal)group.Sum(x => Math.Max(0d, x.ChamDiemChatLuong_SoDiemConLai ?? 0d)),
                                DiemTienDo: (decimal)group.Sum(x => Math.Max(0d, x.ChamDiemTienDo_SoDiemConLai ?? 0d)),
                                SoLuongKhongHoanThanh: (decimal)group.Sum(x => x.ChamDiemSoLuong_KhongHoanThanh ?? 0d),
                                ChatLuongKhongDat: (decimal)group.Sum(x => x.ChamDiemChatLuong_KhongDat ?? 0d),
                                TienDoChamMuon: (decimal)group.Sum(x => x.ChamDiemTienDo_KhongDat ?? 0d)
                            ));
                }

                phieuMoiNhatTheoThang = phieuTrongNam
                    .GroupBy(x => x.Thang)
                    .ToDictionary(
                        grouped => grouped.Key,
                        grouped =>
                        {
                            var phieu = grouped.First();
                            var diemThucHienNhiemVu = phieu.IdPhieuDanhGia.HasValue
                                && diemKetQuaTheoPhieu.TryGetValue(phieu.IdPhieuDanhGia.Value, out var diemTieuChiKetQua)
                                && diemTieuChiKetQua.HasValue
                                ? (decimal)(diemTieuChiKetQua.Value * 70d / 100d)
                                : phieu.DiemThucHienNhiemVu;
                            var result = new ThongKePhieuDanhGiaTheoThangDto
                            {
                                Thang = phieu.Thang,
                                IdPhieuDanhGia = phieu.IdPhieuDanhGia,
                                IdDotDanhGia = phieu.IdDotDanhGia,
                                TenDotDanhGia = phieu.TenDotDanhGia,
                                DiemTieuChiChung = phieu.DiemTieuChiChung,
                                DiemThucHienNhiemVu = diemThucHienNhiemVu,
                                TongDiem = phieu.DiemTieuChiChung.HasValue && diemThucHienNhiemVu.HasValue
                                    ? phieu.DiemTieuChiChung.Value + diemThucHienNhiemVu.Value
                                    : phieu.TongDiem,
                                ThoiGianTao = phieu.ThoiGianTao,
                                TenTieuChiChung = "Điểm tiêu chí chung",
                                DiemToiDaTieuChiChung = 30,
                                TenTieuChiKetQua = "Điểm tiêu chí kết quả thực hiện nhiệm vụ",
                                DiemToiDaTieuChiKetQua = 70
                            };

                            if (phieu.IdDotDanhGia.HasValue
                                && diemTheoDot.TryGetValue(phieu.IdDotDanhGia.Value, out var diem))
                            {
                                result.DiemTheoBoTieuChi = diem.DiemTheoBoTieuChi;
                                result.DiemSoLuong = diem.DiemSoLuong;
                                result.DiemChatLuong = diem.DiemChatLuong;
                                result.DiemTienDo = diem.DiemTienDo;
                                result.SoLuongKhongHoanThanh = diem.SoLuongKhongHoanThanh;
                                result.ChatLuongKhongDat = diem.ChatLuongKhongDat;
                                result.TienDoChamMuon = diem.TienDoChamMuon;
                            }

                            return result;
                        });
            }

            return Enumerable.Range(1, 12)
                .Select(thang => phieuMoiNhatTheoThang.TryGetValue(thang, out var phieu)
                    ? phieu
                    : new ThongKePhieuDanhGiaTheoThangDto
                    {
                        Thang = thang,
                        TenTieuChiChung = "Điểm tiêu chí chung",
                        DiemToiDaTieuChiChung = 30,
                        TenTieuChiKetQua = "Điểm tiêu chí kết quả thực hiện nhiệm vụ",
                        DiemToiDaTieuChiKetQua = 70
                    })
                .ToList();
        }

        public async Task<List<ThongKeDiemNhanSuDto>> ThongKeDiemNhanSuTheoChucVu(string chucVuCode, Guid idDotDanhGia, string? vaiTroDanhGia = null)
        {
            if (string.IsNullOrWhiteSpace(chucVuCode))
            {
                throw new ArgumentException("Chức vụ không được để trống.", nameof(chucVuCode));
            }

            var groupChucVuId = await _nhomDanhMucRepository
                .GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.CHUCVUVNU)
                .Select(x => (Guid?)x.Id)
                .FirstOrDefaultAsync();

            if (!groupChucVuId.HasValue)
            {
                throw new ArgumentException("Không tìm thấy nhóm danh mục chức vụ.", nameof(chucVuCode));
            }

            var chucVuName = await _duLieuDanhMucRepository
                .GetQueryable()
                .Where(x => x.GroupId == groupChucVuId.Value && x.Code == chucVuCode)
                .Select(x => x.Name)
                .FirstOrDefaultAsync();

            if (string.IsNullOrWhiteSpace(chucVuName))
            {
                throw new ArgumentException("Chức vụ không thuộc nhóm CHUCVUVNU.", nameof(chucVuCode));
            }

            var dotDanhGia = await _kPI_DotTheoDoiDanhGiaRepository
                .GetQueryable()
                .Where(x => x.Id == idDotDanhGia && x.TrangThai == TrangThaiDotDanhGiaConstant.ACTIVE)
                .Select(x => new
                {
                    x.Id,
                    x.TenDotTheoDoiDanhGia
                })
                .FirstOrDefaultAsync();

            if (dotDanhGia == null)
            {
                throw new ArgumentException("Đợt đánh giá không tồn tại hoặc chưa ở trạng thái ACTIVE.", nameof(idDotDanhGia));
            }

            var phieuDanhGia = await (from phieu in GetQueryable()
                                      join lyLich in _lyLich2CRepository.GetQueryable()
                                          on phieu.IdLyLich equals lyLich.Id
                                      where phieu.IdDotDanhGia == idDotDanhGia
                                            && phieu.IdLyLich.HasValue
                                            && lyLich.ChucVuHienTai == chucVuCode
                                      select new
                                      {
                                          IdLyLich = lyLich.Id,
                                          UserId = lyLich.UserId,
                                          HoTen = lyLich.HoTen,
                                          IdPhieuDanhGia = phieu.Id,
                                          DiemTieuChiChung = phieu.DiemTieuChiChung ?? 0m,
                                          DiemTieuChiKetQua = phieu.DiemThucHienNhiemVu ?? 0m,
                                          TongDiem = (phieu.DiemTieuChiChung ?? 0m) + (phieu.DiemThucHienNhiemVu ?? 0m),
                                          ThoiGianTao = phieu.CreatedDate
                                      }).ToListAsync();

            var phieuList = phieuDanhGia
                .GroupBy(x => x.IdLyLich)
                .Select(group => group
                    .OrderByDescending(x => x.ThoiGianTao)
                    .ThenByDescending(x => x.IdPhieuDanhGia)
                    .First())
                .ToList();

            var phieuIds = phieuList.Select(x => x.IdPhieuDanhGia).Distinct().ToList();

            Dictionary<Guid, decimal> dictDiemNV = new Dictionary<Guid, decimal>();
            Dictionary<Guid, decimal> dictDiemTCC = new Dictionary<Guid, decimal>();
            Dictionary<Guid, int> dictSoDauRaThieuDiem = new Dictionary<Guid, int>();
            var normVaiTro = NormalizeVaiTroDanhGia(vaiTroDanhGia);
            var phieuDaDanhGiaTheoVaiTro = new HashSet<Guid>();

            if (normVaiTro != null && phieuIds.Any())
            {
                phieuDaDanhGiaTheoVaiTro = await GetPhieuDaDanhGiaTheoVaiTro(phieuIds, normVaiTro);

                var lyLichIds = phieuList.Select(x => x.IdLyLich).Distinct().ToList();

                var dauRaDb = await (from dr in _kPI_DauRaNhiemVuRepository.GetQueryable()
                                     join nv in _kPI_NhiemVuRepository.GetQueryable() on dr.IdNhiemVu equals nv.Id
                                     where nv.IdLyLich.HasValue && lyLichIds.Contains(nv.IdLyLich.Value)
                                           && nv.IdDotTheoDoiDanhGia == idDotDanhGia
                                     select new
                                     {
                                         IdDauRa = dr.Id,
                                         IdNhiemVu = nv.Id,
                                         IdLyLich = nv.IdLyLich.Value,
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

                var chiTietDb = await _chiTietDanhGiaRepository.GetQueryable()
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

                foreach (var phieu in phieuList)
                {
                    var dauRasOfPhieu = dauRaDb.Where(x => x.IdLyLich == phieu.IdLyLich).ToList();
                    dictSoDauRaThieuDiem[phieu.IdPhieuDanhGia] = 0;
                    if (dauRasOfPhieu.Any())
                    {
                        kqThucHienDict.TryGetValue(phieu.IdPhieuDanhGia, out var kqThucHien);
                        var coApDungHeSo = kqThucHien != null && kqThucHien.CoApDungHeSoLanhDao && kqThucHien.HeSoLanhDaoApDung.HasValue;
                        var heSo = coApDungHeSo ? (double)kqThucHien!.HeSoLanhDaoApDung!.Value : 1d;

                        var chiTietOfPhieu = chiTietDb.Where(x => x.IdPhieuDanhGia == phieu.IdPhieuDanhGia).ToList();

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
                        dictSoDauRaThieuDiem[phieu.IdPhieuDanhGia] = soDauRaThieu;
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
                        dictDiemNV[phieu.IdPhieuDanhGia] = finalScoreOutOf70;
                    }
                }

                var lstTcc = await _tieuChiChungDiemSoRepository.GetQueryable()
                    .Where(x => (x.IdPhieuDanhGia.HasValue && phieuIds.Contains(x.IdPhieuDanhGia.Value))
                                || (x.IdDotDanhGia == idDotDanhGia && x.IdLyLich.HasValue && lyLichIds.Contains(x.IdLyLich.Value)))
                    .ToListAsync();

                if (normVaiTro == "CaNhan")
                {
                    foreach (var phieu in phieuList)
                    {
                        var tccItems = lstTcc.Where(x => x.IdPhieuDanhGia == phieu.IdPhieuDanhGia || x.IdLyLich == phieu.IdLyLich).ToList();
                        if (tccItems.Any())
                        {
                            dictDiemTCC[phieu.IdPhieuDanhGia] = (decimal)tccItems.Sum(x => x.DiemTuCham ?? 0);
                        }
                    }
                }
                else
                {
                    var lstCapTren = await _tieuChiChungDiemSoCapTrenRepository.GetQueryable()
                        .Where(x => x.Id_PhieuDanhGia.HasValue && phieuIds.Contains(x.Id_PhieuDanhGia.Value))
                        .ToListAsync();

                    foreach (var phieu in phieuList)
                    {
                        var tccItems = lstTcc.Where(x => x.IdPhieuDanhGia == phieu.IdPhieuDanhGia || x.IdLyLich == phieu.IdLyLich).ToList();
                        decimal totalTcc = 0m;
                        bool coDuDiemDungVaiTro = tccItems.Any();
                        foreach (var tc in tccItems)
                        {
                            var match = lstCapTren.FirstOrDefault(x =>
                                x.Id_PhieuDanhGia == phieu.IdPhieuDanhGia
                                && x.Id_TieuChiChung_DiemSo == tc.Id
                                && (string.Equals(x.VaiTroDanhGia, normVaiTro, StringComparison.OrdinalIgnoreCase)
                                    || (normVaiTro == "PhoTruongPhong" && string.Equals(x.VaiTroDanhGia, "PhoPhong", StringComparison.OrdinalIgnoreCase))));
                            if (match?.Diem == null)
                            {
                                coDuDiemDungVaiTro = false;
                                break;
                            }
                            totalTcc += match.Diem.Value;
                        }

                        if (coDuDiemDungVaiTro)
                        {
                            dictDiemTCC[phieu.IdPhieuDanhGia] = totalTcc;
                        }
                    }
                }
            }

            return phieuList
                .Select(x =>
                {
                    decimal? diemTcc = normVaiTro != null
                        ? (phieuDaDanhGiaTheoVaiTro.Contains(x.IdPhieuDanhGia) && dictDiemTCC.TryGetValue(x.IdPhieuDanhGia, out var diemTccTheoVaiTro) ? diemTccTheoVaiTro : null)
                        : x.DiemTieuChiChung;
                    decimal? diemNV = normVaiTro != null
                        ? (phieuDaDanhGiaTheoVaiTro.Contains(x.IdPhieuDanhGia) && dictDiemNV.TryGetValue(x.IdPhieuDanhGia, out var diemNvTheoVaiTro) ? diemNvTheoVaiTro : null)
                        : x.DiemTieuChiKetQua;

                    return new ThongKeDiemNhanSuDto
                    {
                        IdLyLich = x.IdLyLich,
                        UserId = x.UserId,
                        HoTen = x.HoTen,
                        ChucVuCode = chucVuCode,
                        ChucVuName = chucVuName,
                        IdPhieuDanhGia = x.IdPhieuDanhGia,
                        IdDotDanhGia = dotDanhGia.Id,
                        TenDotDanhGia = dotDanhGia.TenDotTheoDoiDanhGia,
                        DiemTieuChiChung = diemTcc,
                        DiemTieuChiKetQua = diemNV,
                        TongDiem = diemTcc.HasValue && diemNV.HasValue ? diemTcc.Value + diemNV.Value : null,
                        DuDiemNhiemVuTheoVaiTro = normVaiTro == null || !phieuDaDanhGiaTheoVaiTro.Contains(x.IdPhieuDanhGia) || !dictSoDauRaThieuDiem.TryGetValue(x.IdPhieuDanhGia, out var soDauRaThieu) || soDauRaThieu == 0,
                        SoDauRaThieuDiem = normVaiTro != null && phieuDaDanhGiaTheoVaiTro.Contains(x.IdPhieuDanhGia) && dictSoDauRaThieuDiem.TryGetValue(x.IdPhieuDanhGia, out var soDauRaThieuTheoVaiTro) ? soDauRaThieuTheoVaiTro : 0
                    };
                })
                .OrderBy(x => x.HoTen)
                .ThenBy(x => x.IdLyLich)
                .ToList();
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

            var ids = await _kpi_QuaTrinhXuLyPhieuDanhGiaService.GetQueryable()
                .Where(x => phieuIds.Contains(x.IdPhieuDanhGia) && x.TrangThai == trangThai && x.IsXuLy)
                .Select(x => x.IdPhieuDanhGia)
                .Distinct()
                .ToListAsync();

            return ids.ToHashSet();
        }

        // Kiểm tra nhân sự trực thuộc đơn vị hay phòng ban, nếu thuộc đơn vị thì = true
        // dùng để so sánh nhân sự trong đơn vị không có phòng ban trực thuộc
        public async Task<PhamViSoSanhNhanSuDto> GetPhamViSoSanhNhanSu(Guid userId)
        {
            var currentProfile = await _lyLich2CRepository
                .GetQueryable()
                .Where(x => x.UserId == userId)
                .Select(x => new { x.DonViSuDungId, x.PhongBanId })
                .FirstOrDefaultAsync();

            if (currentProfile == null || currentProfile.DonViSuDungId == Guid.Empty)
            {
                throw new ArgumentException("Không xác định được đơn vị sử dụng của tài khoản.");
            }

            return new PhamViSoSanhNhanSuDto
            {
                TheoDonViSuDung = currentProfile.PhongBanId == Guid.Empty
            };
        }

        /// danh sách phòng ban dưới quyền cục trưởng
        public async Task<List<PhongBanSoSanhDto>> GetPhongBanSoSanh(Guid userId, bool onlyCurrentPhongBan = false)
        {
            var currentProfile = await _lyLich2CRepository
                .GetQueryable()
                .Where(x => x.UserId == userId)
                .Select(x => new { x.DonViSuDungId, x.PhongBanId })
                .FirstOrDefaultAsync();

            if (currentProfile == null || currentProfile.DonViSuDungId == Guid.Empty)
            {
                return new List<PhongBanSoSanhDto>();
            }

            if (onlyCurrentPhongBan)
            {
                return await _departmentRepository
                    .GetQueryable()
                    .Where(x => x.Id == currentProfile.PhongBanId && x.IsActive && !x.IsDeleted)
                    .Select(x => new PhongBanSoSanhDto
                    {
                        Id = x.Id,
                        Name = x.Name
                    })
                    .ToListAsync();
            }

            var phongBanIds = _lyLich2CRepository
                .GetQueryable()
                .Where(x => x.DonViSuDungId == currentProfile.DonViSuDungId)
                .Select(x => x.PhongBanId)
                .Distinct();

            return await _departmentRepository
                .GetQueryable()
                .Where(x => x.IsActive && !x.IsDeleted && phongBanIds.Contains(x.Id))
                .OrderBy(x => x.Priority)
                .ThenBy(x => x.Name)
                .Select(x => new PhongBanSoSanhDto
                {
                    Id = x.Id,
                    Name = x.Name
                })
                .ToListAsync();
        }

        public async Task<List<NhanSuSoSanhDto>> GetNhanSuSoSanh(
            Guid userId,
            Guid? phongBanId = null,
            bool theoDonViSuDung = false)
        {
            var currentProfile = await _lyLich2CRepository
                .GetQueryable()
                .Where(x => x.UserId == userId)
                .Select(x => new { x.DonViSuDungId, x.PhongBanId })
                .FirstOrDefaultAsync();

            if (currentProfile == null || currentProfile.DonViSuDungId == Guid.Empty)
            {
                return new List<NhanSuSoSanhDto>();
            }

            var isTheoDonViSuDung = theoDonViSuDung && currentProfile.PhongBanId == Guid.Empty;
            if (theoDonViSuDung && !isTheoDonViSuDung)
            {
                throw new ArgumentException("Tài khoản đang thuộc phòng ban nên không thể lấy nhân sự theo toàn đơn vị.");
            }

            var targetPhongBanId = phongBanId.GetValueOrDefault() == Guid.Empty
                ? currentProfile.PhongBanId
                : phongBanId.Value;

            var query = from lyLich in _lyLich2CRepository.GetQueryable()
                        join phongBan in _departmentRepository.GetQueryable()
                            on lyLich.PhongBanId equals phongBan.Id into phongBanGroup
                        from phongBan in phongBanGroup.DefaultIfEmpty()
                        where lyLich.DonViSuDungId == currentProfile.DonViSuDungId
                              && (isTheoDonViSuDung || lyLich.PhongBanId == targetPhongBanId)
                              && (isTheoDonViSuDung || (phongBan != null && phongBan.IsActive && !phongBan.IsDeleted))
                        select new NhanSuSoSanhDto
                        {
                            IdLyLich = lyLich.Id,
                            UserId = lyLich.UserId,
                            HoTen = lyLich.HoTen,
                            PhongBanId = lyLich.PhongBanId,
                            PhongBanName = phongBan == null ? string.Empty : phongBan.Name
                        };

            return await query
                .OrderBy(x => x.HoTen)
                .ThenBy(x => x.IdLyLich)
                .ToListAsync();
        }

        public async Task<SoSanhDiemNhanSuDto> GetTopSoSanhDiemNhanSu(
            Guid userId,
            Guid idDotDanhGia,
            bool restrictToCurrentPhongBan = false)
        {
            if (idDotDanhGia == Guid.Empty)
            {
                throw new ArgumentException("Vui lòng chọn đợt đánh giá.");
            }

            var currentProfile = await _lyLich2CRepository
                .GetQueryable()
                .Where(x => x.UserId == userId)
                .Select(x => new { x.DonViSuDungId, x.PhongBanId })
                .FirstOrDefaultAsync();

            if (currentProfile == null || currentProfile.DonViSuDungId == Guid.Empty)
            {
                throw new ArgumentException("Không xác định được đơn vị sử dụng của tài khoản.");
            }

            var isTheoDonViSuDung = !restrictToCurrentPhongBan && currentProfile.PhongBanId == Guid.Empty;

            var personnel = await (from lyLich in _lyLich2CRepository.GetQueryable()
                                   join phongBan in _departmentRepository.GetQueryable()
                                       on lyLich.PhongBanId equals phongBan.Id into phongBanGroup
                                   from phongBan in phongBanGroup.DefaultIfEmpty()
                                   where lyLich.DonViSuDungId == currentProfile.DonViSuDungId
                                         && (isTheoDonViSuDung
                                             || (!restrictToCurrentPhongBan
                                                 || lyLich.PhongBanId == currentProfile.PhongBanId))
                                         && (isTheoDonViSuDung
                                             || (phongBan != null && phongBan.IsActive && !phongBan.IsDeleted))
                                   select new
                                   {
                                       IdLyLich = lyLich.Id,
                                       lyLich.HoTen,
                                       PhongBanId = lyLich.PhongBanId,
                                       PhongBanName = phongBan == null ? string.Empty : phongBan.Name
                                   })
                .OrderBy(x => x.HoTen)
                .ThenBy(x => x.IdLyLich)
                .ToListAsync();

            if (personnel.Count < 2)
            {
                throw new ArgumentException("Phạm vi hiện tại chưa đủ hai nhân sự để so sánh.");
            }

            var personnelIds = personnel.Select(x => x.IdLyLich).ToList();
            var phieuList = await GetQueryable()
                .Where(x => x.IdDotDanhGia == idDotDanhGia
                            && x.IdLyLich.HasValue
                            && personnelIds.Contains(x.IdLyLich.Value))
                .OrderByDescending(x => x.CreatedDate)
                .ThenByDescending(x => x.Id)
                .Select(x => new
                {
                    IdLyLich = x.IdLyLich!.Value,
                    Diem = x.TongDiem
                        ?? ((x.DiemTieuChiChung ?? 0m) + (x.DiemThucHienNhiemVu ?? 0m))
                })
                .ToListAsync();

            var diemTheoNhanSu = phieuList
                .GroupBy(x => x.IdLyLich)
                .ToDictionary(x => x.Key, x => x.First().Diem);

            var topPersonnel = personnel
                .OrderByDescending(x => diemTheoNhanSu.TryGetValue(x.IdLyLich, out var diem) ? diem : 0m)
                .ThenBy(x => x.HoTen)
                .ThenBy(x => x.IdLyLich)
                .Take(2)
                .ToList();

            var nhanSu1 = topPersonnel[0];
            var nhanSu2 = topPersonnel[1];
            return await GetSoSanhDiemNhanSu(
                userId,
                new SoSanhDiemNhanSuRequest
                {
                    PhongBanNhanSu1Id = nhanSu1.PhongBanId,
                    PhongBanNhanSu2Id = nhanSu2.PhongBanId,
                    IdLyLichNhanSu1 = nhanSu1.IdLyLich,
                    IdLyLichNhanSu2 = nhanSu2.IdLyLich,
                    IdDotDanhGia = idDotDanhGia
                },
                restrictToCurrentPhongBan);
        }

        public async Task<SoSanhDiemNhanSuDto> GetSoSanhDiemNhanSu(Guid userId, SoSanhDiemNhanSuRequest request, bool restrictToCurrentPhongBan = false)
        {
            if (request.IdLyLichNhanSu1 == Guid.Empty || request.IdLyLichNhanSu2 == Guid.Empty)
            {
                throw new ArgumentException("Vui lòng chọn đủ hai nhân sự.");
            }

            if (request.IdLyLichNhanSu1 == request.IdLyLichNhanSu2)
            {
                throw new ArgumentException("Hai nhân sự phải khác nhau.");
            }

            var currentProfile = await _lyLich2CRepository
                .GetQueryable()
                .Where(x => x.UserId == userId)
                .Select(x => new { x.DonViSuDungId, x.PhongBanId })
                .FirstOrDefaultAsync();

            if (currentProfile == null || currentProfile.DonViSuDungId == Guid.Empty)
            {
                throw new ArgumentException("Không xác định được đơn vị sử dụng của tài khoản.");
            }

            // Cấp Cục không được gán phòng ban so sánh toàn bộ nhân sự cùng đơn vị sử dụng.
            // Phạm vi này luôn được suy ra từ hồ sơ đăng nhập, không tin dữ liệu phòng ban do client gửi lên.
            var isTheoDonViSuDung = !restrictToCurrentPhongBan && currentProfile.PhongBanId == Guid.Empty;
            var phongBanNhanSu1Id = restrictToCurrentPhongBan
                ? currentProfile.PhongBanId
                : request.PhongBanNhanSu1Id;
            var phongBanNhanSu2Id = restrictToCurrentPhongBan
                ? currentProfile.PhongBanId
                : request.PhongBanNhanSu2Id;

            if (!isTheoDonViSuDung)
            {
                var selectedPhongBanIds = new[]
                {
                    phongBanNhanSu1Id,
                    phongBanNhanSu2Id
                };

                var phongBanIdsTrongDonVi = await _lyLich2CRepository
                    .GetQueryable()
                    .Where(x => x.DonViSuDungId == currentProfile.DonViSuDungId
                                && selectedPhongBanIds.Contains(x.PhongBanId))
                    .Select(x => x.PhongBanId)
                    .Distinct()
                    .ToListAsync();

                if (phongBanIdsTrongDonVi.Count != selectedPhongBanIds.Distinct().Count())
                {
                    throw new ArgumentException("Phòng ban không thuộc phạm vi đơn vị của tài khoản.");
                }
            }

            var lyLichList = await (from lyLich in _lyLich2CRepository.GetQueryable()
                                    join phongBan in _departmentRepository.GetQueryable()
                                        on lyLich.PhongBanId equals phongBan.Id into phongBanGroup
                                    from phongBan in phongBanGroup.DefaultIfEmpty()
                                    where lyLich.DonViSuDungId == currentProfile.DonViSuDungId
                                          && (lyLich.Id == request.IdLyLichNhanSu1
                                              || lyLich.Id == request.IdLyLichNhanSu2)
                                          && (isTheoDonViSuDung
                                              || (phongBan != null && phongBan.IsActive && !phongBan.IsDeleted))
                                    select new
                                    {
                                        lyLich.Id,
                                        lyLich.UserId,
                                        lyLich.HoTen,
                                        lyLich.PhongBanId,
                                        PhongBanName = phongBan == null ? string.Empty : phongBan.Name
                                    }).ToListAsync();

            var nhanSu1 = lyLichList.FirstOrDefault(x => x.Id == request.IdLyLichNhanSu1);
            var nhanSu2 = lyLichList.FirstOrDefault(x => x.Id == request.IdLyLichNhanSu2);

            if (nhanSu1 == null || nhanSu2 == null
                || (!isTheoDonViSuDung
                    && (nhanSu1.PhongBanId != phongBanNhanSu1Id
                        || nhanSu2.PhongBanId != phongBanNhanSu2Id)))
            {
                throw new ArgumentException(isTheoDonViSuDung
                    ? "Nhân sự không thuộc phạm vi đơn vị sử dụng của tài khoản."
                    : "Nhân sự không thuộc phòng ban đã chọn.");
            }

            var dotDanhGia = await _kPI_DotTheoDoiDanhGiaRepository
                .GetQueryable()
                .Where(x => x.Id == request.IdDotDanhGia
                            && x.TrangThai == TrangThaiDotDanhGiaConstant.ACTIVE)
                .Select(x => new
                {
                    x.Id,
                    x.TenDotTheoDoiDanhGia
                })
                .FirstOrDefaultAsync();

            if (dotDanhGia == null)
            {
                throw new ArgumentException("Đợt đánh giá không tồn tại hoặc chưa ở trạng thái ACTIVE.");
            }

            var selectedLyLichIds = new[]
            {
                request.IdLyLichNhanSu1,
                request.IdLyLichNhanSu2
            };

            var phieuList = await GetQueryable()
                .Where(x => x.IdDotDanhGia == request.IdDotDanhGia
                            && x.IdLyLich.HasValue
                            && selectedLyLichIds.Contains(x.IdLyLich.Value))
                .OrderByDescending(x => x.CreatedDate)
                .ThenByDescending(x => x.Id)
                .ToListAsync();

            var phieuMoiNhat = phieuList
                .GroupBy(x => x.IdLyLich!.Value)
                .ToDictionary(x => x.Key, x => x.First());

            var selectedPhieuIds = phieuMoiNhat.Values
                .Select(x => x.Id)
                .Distinct()
                .ToList();
            var diemThanhPhanTheoPhieu = selectedPhieuIds.Count == 0
                ? new Dictionary<Guid, (decimal? DiemHeSoLanhDao, decimal DiemBoTieuChi, decimal DiemSoLuong, decimal DiemChatLuong, decimal DiemTienDo)>()
                : (await _kPI_KetQuaThucHienNhiemVuRepository
                    .GetQueryable()
                    .Where(x => !x.IsDeleted
                                && x.IdPhieuDanhGia.HasValue
                                && selectedPhieuIds.Contains(x.IdPhieuDanhGia.Value))
                    .OrderByDescending(x => x.UpdatedDate)
                    .ThenByDescending(x => x.CreatedDate)
                    .Select(x => new
                    {
                        IdPhieuDanhGia = x.IdPhieuDanhGia!.Value,
                        x.DiemHeSoLanhDao,
                        x.DiemBoTieuChi,
                        x.KhoiLuongDiem,
                        x.ChatLuongDiem,
                        x.TienDoDiem
                    })
                    .ToListAsync())
                    .GroupBy(x => x.IdPhieuDanhGia)
                    .ToDictionary(
                        group => group.Key,
                        group =>
                        {
                            var score = group.First();
                            return (
                                DiemHeSoLanhDao: (decimal?)score.DiemHeSoLanhDao,
                                DiemBoTieuChi: (decimal)(score.DiemBoTieuChi ?? 0d),
                                DiemSoLuong: (decimal)(score.KhoiLuongDiem ?? 0d),
                                DiemChatLuong: (decimal)(score.ChatLuongDiem ?? 0d),
                                DiemTienDo: (decimal)(score.TienDoDiem ?? 0d));
                        });

            SoSanhDiemNhanSuItemDto ToItem(
                Guid idLyLich,
                string hoTen,
                Guid phongBanId,
                string phongBanName)
            {
                if (!phieuMoiNhat.TryGetValue(idLyLich, out var phieu))
                {
                    return new SoSanhDiemNhanSuItemDto
                    {
                        IdLyLich = idLyLich,
                        HoTen = hoTen,
                        PhongBanId = phongBanId,
                        PhongBanName = phongBanName,
                        IdPhieuDanhGia = null,
                        DiemTieuChiChung = 0,
                        DiemTieuChiKetQua = 0,
                        DiemBoTieuChi = 0,
                        DiemHeSoLanhDao = null,
                        DiemSoLuong = 0,
                        DiemChatLuong = 0,
                        DiemTienDo = 0,
                        TongDiem = 0
                    };
                }

                var diemTieuChiChung = phieu.DiemTieuChiChung ?? 0m;
                var diemTieuChiKetQua = phieu.DiemThucHienNhiemVu ?? 0m;
                var diemThanhPhan = diemThanhPhanTheoPhieu.TryGetValue(phieu.Id, out var score)
                    ? score
                    : (DiemHeSoLanhDao: (decimal?)null, DiemBoTieuChi: 0m, DiemSoLuong: 0m, DiemChatLuong: 0m, DiemTienDo: 0m);

                return new SoSanhDiemNhanSuItemDto
                {
                    IdLyLich = idLyLich,
                    HoTen = hoTen,
                    PhongBanId = phongBanId,
                    PhongBanName = phongBanName,
                    IdPhieuDanhGia = phieu.Id,
                    DiemTieuChiChung = diemTieuChiChung,
                    DiemTieuChiKetQua = diemTieuChiKetQua,
                    DiemBoTieuChi = diemThanhPhan.DiemBoTieuChi,
                    DiemHeSoLanhDao = diemThanhPhan.DiemHeSoLanhDao,
                    DiemSoLuong = diemThanhPhan.DiemSoLuong,
                    DiemChatLuong = diemThanhPhan.DiemChatLuong,
                    DiemTienDo = diemThanhPhan.DiemTienDo,
                    TongDiem = phieu.TongDiem ?? (diemTieuChiChung + diemTieuChiKetQua)
                };
            }

            var resultNhanSu1 = ToItem(
                nhanSu1.Id,
                nhanSu1.HoTen,
                nhanSu1.PhongBanId,
                nhanSu1.PhongBanName);
            var resultNhanSu2 = ToItem(
                nhanSu2.Id,
                nhanSu2.HoTen,
                nhanSu2.PhongBanId,
                nhanSu2.PhongBanName);
            var thieuDuLieuIds = new List<Guid>();

            if (!resultNhanSu1.IdPhieuDanhGia.HasValue)
            {
                thieuDuLieuIds.Add(resultNhanSu1.IdLyLich);
            }

            if (!resultNhanSu2.IdPhieuDanhGia.HasValue)
            {
                thieuDuLieuIds.Add(resultNhanSu2.IdLyLich);
            }

            return new SoSanhDiemNhanSuDto
            {
                TenDotDanhGia = dotDanhGia.TenDotTheoDoiDanhGia,
                DuDuLieuSoSanh = thieuDuLieuIds.Count == 0,
                ThieuDuLieuNhanSuIds = thieuDuLieuIds,
                NhanSu1 = resultNhanSu1,
                NhanSu2 = resultNhanSu2,
                TieuChi = new SoSanhTieuChiDto()
            };
        }

        public async Task<KPI_PhieuDanhGiaTabCountDto> GetTabCounts(Guid userId, KPI_PhieuDanhGiaSearch search)
        {
            var queryPhieu = GetQueryable();
            var queryDot = _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                .Where(x => (x.TrangThai == TrangThaiDotDanhGiaConstant.ACTIVE || x.TrangThai == "Đang hoạt động")
                    && x.Type != LoaiDotDanhGiaConstant.TAP_THE && x.Type != "TapThe");
            var queryQuaTrinh = _kpi_QuaTrinhXuLyPhieuDanhGiaService.GetQueryable();
            var queryLyLich = _lyLich2CRepository.GetQueryable();

            var userLyLich = await queryLyLich.FirstOrDefaultAsync(x => x.UserId == userId);
            var userLyLichId = userLyLich?.Id;

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotDanhGia))
                {
                    queryPhieu = queryPhieu.Where(x => x.IdDotDanhGia == idDotDanhGia);
                }
                else
                {
                    var activeDotIds = queryDot.Select(d => d.Id);
                    queryPhieu = queryPhieu.Where(x => x.IdDotDanhGia.HasValue && activeDotIds.Contains(x.IdDotDanhGia.Value));
                }
                if (search.IdLyLich.HasValue && search.IdLyLich.Value != Guid.Empty)
                {
                    queryPhieu = queryPhieu.Where(x => x.IdLyLich == search.IdLyLich.Value);
                }
                if (!string.IsNullOrEmpty(search.DonVi))
                {
                    if (Guid.TryParse(search.DonVi, out var donViGuid))
                    {
                        var matchLyLichIds = queryLyLich.Where(l => l.DonViSuDungId == donViGuid).Select(l => l.Id);
                        queryPhieu = queryPhieu.Where(x => (x.DonVi.HasValue && x.DonVi.Value == donViGuid) || (x.IdLyLich.HasValue && matchLyLichIds.Contains(x.IdLyLich.Value)));
                    }
                }
                if (!string.IsNullOrEmpty(search.PhongBan))
                {
                    if (Guid.TryParse(search.PhongBan, out var phongBanGuid))
                    {
                        var matchLyLichIds = queryLyLich.Where(l => l.PhongBanId == phongBanGuid).Select(l => l.Id);
                        var pbName = await _departmentRepository.GetQueryable().Where(d => d.Id == phongBanGuid).Select(d => d.Name).FirstOrDefaultAsync();
                        queryPhieu = queryPhieu.Where(x =>
                            (x.IdLyLich.HasValue && matchLyLichIds.Contains(x.IdLyLich.Value)) ||
                            (!string.IsNullOrEmpty(x.PhongBan) && (x.PhongBan == search.PhongBan || (pbName != null && x.PhongBan.Contains(pbName))))
                        );
                    }
                    else
                    {
                        queryPhieu = queryPhieu.Where(x => !string.IsNullOrEmpty(x.PhongBan) && EF.Functions.Like(x.PhongBan, $"%{search.PhongBan}%"));
                    }
                }
                if (search.Quy.HasValue || search.Nam.HasValue)
                {
                    var dotQuery = queryDot;
                    if (search.Quy.HasValue) dotQuery = dotQuery.Where(d => d.Quy == search.Quy.Value);
                    if (search.Nam.HasValue) dotQuery = dotQuery.Where(d => d.Nam == search.Nam.Value);
                    var validDotIds = dotQuery.Select(d => d.Id);
                    queryPhieu = queryPhieu.Where(x => x.IdDotDanhGia.HasValue && validDotIds.Contains(x.IdDotDanhGia.Value));
                }
            }

            var isPersonalView = search != null && search.IdLyLich.HasValue && userLyLichId.HasValue && search.IdLyLich.Value == userLyLichId.Value;

            int choXuLy;
            int daXuLy;
            int daDuyet;

            if (isPersonalView)
            {
                // Đối với trang cá nhân tự đánh giá: chỉ xét các đợt đang mở (ACTIVE)
                var dotActiveQuery = queryDot;

                if (search != null)
                {
                    if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotDanhGia))
                    {
                        dotActiveQuery = dotActiveQuery.Where(d => d.Id == idDotDanhGia);
                    }
                    if (search.Quy.HasValue)
                    {
                        dotActiveQuery = dotActiveQuery.Where(d => d.Quy == search.Quy.Value);
                    }
                    if (search.Nam.HasValue)
                    {
                        dotActiveQuery = dotActiveQuery.Where(d => d.Nam == search.Nam.Value);
                    }
                }

                var activeDotList = await dotActiveQuery.Select(d => d.Id).ToListAsync();

                var targetLyLichId = search.IdLyLich.Value;
                // Lấy tất cả phiếu của cá nhân trong các đợt active này
                var userPhieusInActiveDots = await GetQueryable()
                    .Where(p => p.IdLyLich == targetLyLichId
                        && p.IdDotDanhGia.HasValue
                        && activeDotList.Contains(p.IdDotDanhGia.Value))
                    .ToListAsync();

                // 1. Chờ xử lý cá nhân: Các đợt active mà người dùng chưa tạo phiếu HOẶC phiếu ở trạng thái Khởi tạo / Trả về
                choXuLy = activeDotList.Count(dotId =>
                {
                    var p = userPhieusInActiveDots.FirstOrDefault(x => x.IdDotDanhGia == dotId);
                    return p == null || p.TrangThai == TrangThaiPhieuConstant.KhoiTao || p.TrangThai == TrangThaiPhieuConstant.TraVe;
                });

                // 2. Đã xử lý (Đang chờ cấp trên duyệt): Phiếu của chính mình đã gửi đi trong các đợt active
                daXuLy = userPhieusInActiveDots.Count(p =>
                    p.TrangThai != TrangThaiPhieuConstant.DaDuyet
                    && p.TrangThai != TrangThaiPhieuConstant.KhoiTao
                    && p.TrangThai != TrangThaiPhieuConstant.TraVe
                    && p.TrangThai != TrangThaiPhieuConstant.ThuHoi);

                // 3. Đã duyệt: Phiếu của chính mình đã hoàn thành duyệt trong các đợt active
                daDuyet = userPhieusInActiveDots.Count(p => p.TrangThai == TrangThaiPhieuConstant.DaDuyet);
            }
            else
            {
                // Đối với trang quản lý / duyệt cấp dưới:
                // 1. Chờ xử lý: TrangThai != DaDuyet && có quá trình IsXuLy == false của userId (loại trừ phiếu khởi tạo/trả về của người khác)
                choXuLy = await queryPhieu
                    .CountAsync(p => p.TrangThai != TrangThaiPhieuConstant.DaDuyet
                        && p.TrangThai != TrangThaiPhieuConstant.KhoiTao
                        && p.TrangThai != TrangThaiPhieuConstant.TraVe
                        && p.TrangThai != TrangThaiPhieuConstant.ThuHoi
                        && (!userLyLichId.HasValue || p.IdLyLich != userLyLichId.Value)
                        && queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == p.Id && qt.IdNguoiXuLy == userId && qt.IsXuLy == false));

                // 2. Đã xử lý: TrangThai != DaDuyet && có vết quá trình đã xử lý (IsXuLy == true) của userId (hoặc người gửi là userId)
                daXuLy = await queryPhieu
                    .CountAsync(p => p.TrangThai != TrangThaiPhieuConstant.DaDuyet
                        && queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == p.Id && (qt.IdNguoiXuLy == userId || qt.IdNguoiGui == userId) && qt.IsXuLy == true)
                        && !queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == p.Id && qt.IdNguoiXuLy == userId && qt.IsXuLy == false));

                // 3. Đã duyệt: TrangThai == DaDuyet && có tham gia trong quá trình hoặc là chủ phiếu
                daDuyet = await queryPhieu
                    .CountAsync(p => p.TrangThai == TrangThaiPhieuConstant.DaDuyet
                        && (queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == p.Id && (qt.IdNguoiXuLy == userId || qt.IdNguoiGui == userId))
                            || (search != null && search.IdLyLich.HasValue && userLyLichId.HasValue && p.IdLyLich == userLyLichId.Value)));
            }

            var tongNhanSu = 0;
            var daGui = 0;
            var chuaGui = 0;

            if (search != null && !string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var selectedDotId))
            {
                var targetPhongBanId = userLyLich?.PhongBanId;
                var targetDonViId = userLyLich?.DonViSuDungId;

                var lyLichQuery = queryLyLich;
                var phieuQueryDot = GetQueryable().Where(p => p.IdDotDanhGia == selectedDotId);

                if (targetPhongBanId.HasValue && targetPhongBanId != Guid.Empty)
                {
                    lyLichQuery = lyLichQuery.Where(x => x.PhongBanId == targetPhongBanId.Value);
                    var pbName = await _departmentRepository.GetQueryable().Where(d => d.Id == targetPhongBanId.Value).Select(d => d.Name).FirstOrDefaultAsync();
                    if (!string.IsNullOrEmpty(pbName))
                    {
                        phieuQueryDot = phieuQueryDot.Where(x => EF.Functions.Like(x.PhongBan, $"%{pbName}%"));
                    }
                }
                else if (targetDonViId.HasValue && targetDonViId != Guid.Empty)
                {
                    lyLichQuery = lyLichQuery.Where(x => x.DonViSuDungId == targetDonViId.Value);
                    phieuQueryDot = phieuQueryDot.Where(x => x.DonVi == targetDonViId.Value);
                }

                tongNhanSu = await lyLichQuery.CountAsync();
                daGui = await phieuQueryDot.CountAsync();
                chuaGui = tongNhanSu - daGui;
                if (chuaGui < 0) chuaGui = 0;
            }

            return new KPI_PhieuDanhGiaTabCountDto
            {
                ChoXuLy = choXuLy,
                DaXuLy = daXuLy,
                DaDuyet = daDuyet,
                TongNhanSu = tongNhanSu,
                DaGui = daGui,
                ChuaGui = chuaGui
            };
        }

        private static bool IsChucVu(string? chucVu, IEnumerable<string> danhSachChucVu)
        {
            if (string.IsNullOrWhiteSpace(chucVu))
            {
                return false;
            }

            var normalizedChucVu = new string(chucVu.Trim().Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant();
            return danhSachChucVu.Any(x => string.Equals(
                new string(x.Trim().Where(char.IsLetterOrDigit).ToArray()).ToUpperInvariant(),
                normalizedChucVu,
                StringComparison.Ordinal));
        }

        private async Task<int> EnsureLuongAsync(KPI_PhieuDanhGia phieu)
        {
            if (phieu.Luong > 0 || !phieu.IdLyLich.HasValue)
            {
                return phieu.Luong;
            }

            var luong = await GetLuongTheoLyLich(phieu.IdLyLich.Value);
            if (luong <= 0)
            {
                return phieu.Luong;
            }

            phieu.Luong = luong;
            await UpdateAsync(phieu);
            return luong;
        }

        private ButtonLuongDto? GetButtonLuong(int luong, string trangThaiHienTai)
        {
            if (trangThaiHienTai == TrangThaiPhieuConstant.DaDuyet)
                return null;

            List<string>? luongSteps = null;

            switch (luong)
            {
                case (int)LuongConstant.LuongType.LuongChuyenVien:
                    luongSteps = TrangThaiPhieuConstant.LuongChuyenVien;
                    break;
                case (int)LuongConstant.LuongType.LuongPhoTruongPhong:
                    luongSteps = TrangThaiPhieuConstant.LuongPhoTruongPhong;
                    break;
                case (int)LuongConstant.LuongType.LuongTruongPhong:
                    luongSteps = TrangThaiPhieuConstant.LuongTruongPhong;
                    break;
                case (int)LuongConstant.LuongType.LuongPhoCucTruong:
                    luongSteps = TrangThaiPhieuConstant.LuongPhoCucTruong;
                    break;
                case (int)LuongConstant.LuongType.LuongCucTruong:
                    luongSteps = TrangThaiPhieuConstant.LuongCucTruong;
                    break;
                case (int)LuongConstant.LuongType.LuongChuyenVienCapVu:
                    luongSteps = TrangThaiPhieuConstant.LuongChuyenVienCapVu;
                    break;
                case (int)LuongConstant.LuongType.LuongPhoVuTruong:
                    luongSteps = TrangThaiPhieuConstant.LuongPhoVuTruong;
                    break;
                case (int)LuongConstant.LuongType.LuongVuTruong:
                    luongSteps = TrangThaiPhieuConstant.LuongVuTruong;
                    break;
                case (int)LuongConstant.LuongType.LuongTruongPhongTT:
                    luongSteps = TrangThaiPhieuConstant.LuongTruongPhongTT;
                    break;
                case (int)LuongConstant.LuongType.LuongPhoGiamDocTT:
                    luongSteps = TrangThaiPhieuConstant.LuongPhoGiamDocTT;
                    break;
                case (int)LuongConstant.LuongType.LuongGiamDocTT:
                    luongSteps = TrangThaiPhieuConstant.LuongGiamDocTT;
                    break;
                case (int)LuongConstant.LuongType.LuongChuyenVienVanPhongCap2:
                    luongSteps = TrangThaiPhieuConstant.LuongChuyenVienVanPhongCap2;
                    break;
                case (int)LuongConstant.LuongType.LuongPhoChanhVanPhong:
                    luongSteps = TrangThaiPhieuConstant.LuongPhoChanhVanPhong;
                    break;
                case (int)LuongConstant.LuongType.LuongChanhVanPhong:
                    luongSteps = TrangThaiPhieuConstant.LuongChanhVanPhong;
                    break;
                default:
                    return null;
            }

            if (luongSteps == null)
            {
                return null;
            }

            var stepToFind = trangThaiHienTai == TrangThaiPhieuConstant.TraVe
                ? TrangThaiPhieuConstant.KhoiTao
                : trangThaiHienTai;
            var currentIndex = luongSteps.IndexOf(stepToFind);
            if (currentIndex < 0 || currentIndex >= luongSteps.Count - 1)
                return null;

            var trangThaiTiepTheo = luongSteps[currentIndex + 1];

            var (tenButton, chucVuNguoiXuLy, canChonNguoiXuLy) = MapTrangThaiToButton(trangThaiTiepTheo);

            return new ButtonLuongDto
            {
                TrangThaiHienTai = trangThaiHienTai,
                TrangThaiTiepTheo = trangThaiTiepTheo,
                TenButton = tenButton,
                ChucVuNguoiXuLy = chucVuNguoiXuLy,
                CanChonNguoiXuLy = canChonNguoiXuLy,
            };
        }

        private (string tenButton, string? chucVuNguoiXuLy, bool canChonNguoiXuLy) MapTrangThaiToButton(string trangThaiTiepTheo)
        {
            switch (trangThaiTiepTheo)
            {
                case TrangThaiPhieuConstant.GuiPhoTruongPhong:
                    return ("Gửi Phó Trưởng Phòng", ChucVuConstant.PhoTruongPhong, true);
                case TrangThaiPhieuConstant.GuiPhoVuTruong:
                    return ("Gửi Phó Vụ Trưởng", ChucVuConstant.PhoVuTruong, true);
                case TrangThaiPhieuConstant.GuiVuTruong:
                    return ("Gửi Vụ Trưởng", ChucVuConstant.VuTruong, true);
                case TrangThaiPhieuConstant.GuiChanhVanPhong:
                    return ("Gửi Chánh Văn Phòng", ChucVuConstant.ChanhVanPhong, true);
                case TrangThaiPhieuConstant.GuiPhoChanhVanPhong:
                    return ("Gửi Phó Chánh Văn Phòng", ChucVuConstant.PhoChanhVanPhong, true);
                case TrangThaiPhieuConstant.GuiTruongPhong:
                    return ("Gửi Trưởng Phòng", ChucVuConstant.TruongPhong, true);
                case TrangThaiPhieuConstant.GuiPhoCucTruong:
                    return ("Gửi Phó Cục Trưởng", ChucVuConstant.PhoCucTruong, true);
                case TrangThaiPhieuConstant.GuiCucTruong:
                    return ("Gửi Cục Trưởng", ChucVuConstant.CucTruong, true);
                case TrangThaiPhieuConstant.GuiGiamDocTT:
                    return ("Gửi Giám Đốc TT", ChucVuConstant.GiamDoc, true);
                case TrangThaiPhieuConstant.GuiPhoGiamDocTT:
                    return ("Gửi Phó Giám Đốc TT", ChucVuConstant.PhoGDTT, true);
                case TrangThaiPhieuConstant.DaDuyet:
                    return ("Duyệt", null, false);
                default:
                    return ("Chuyển bước", null, false);
            }
        }

        public async Task<bool> ChuyenBuocLuong(ChuyenBuocLuongRequest request)
        {
            if (request == null || request.IdPhieuDanhGia == Guid.Empty)
            {
                throw new Exception("Phiếu đánh giá không hợp lệ.");
            }

            if (request.IdNguoiGui == Guid.Empty)
            {
                throw new Exception("Không xác định được người gửi phiếu đánh giá.");
            }

            var phieu = await GetByIdAsync(request.IdPhieuDanhGia);

            if (phieu == null)
            {
                throw new Exception("Phiếu đánh giá không tồn tại.");
            }

            // 1. Đánh dấu IsXuLy = true cho bản ghi quá trình hiện tại của người gửi
            var quaTrinhHienTai = await _kpi_QuaTrinhXuLyPhieuDanhGiaService
                .GetQueryable()
                .Where(x => x.IdPhieuDanhGia == request.IdPhieuDanhGia
                    && x.IdNguoiXuLy == request.IdNguoiGui
                    && x.IsXuLy == false)
                .OrderByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            if (request.IsTuChoi)
            {
                if (quaTrinhHienTai != null)
                {
                    quaTrinhHienTai.IsXuLy = true;
                    await _kpi_QuaTrinhXuLyPhieuDanhGiaService.UpdateAsync(quaTrinhHienTai);
                }

                // Truy vấn trực tiếp UserId của chủ phiếu theo IdLyLich
                var userIdChuPhieu = await _lyLich2CRepository.GetQueryable()
                    .Where(x => x.Id == phieu.IdLyLich)
                    .Select(x => x.UserId ?? Guid.Empty)
                    .FirstOrDefaultAsync();

                // 1. Cập nhật trạng thái phiếu về Trả về (TraVe) để phân biệt rõ với Khởi tạo ban đầu
                phieu.TrangThai = TrangThaiPhieuConstant.TraVe;
                await UpdateAsync(phieu);

                // 2. Tạo bản ghi quá trình trả về (TraVe), gán IdNguoiXuLy là UserId của chủ phiếu
                var newQuaTrinhTraVe = new KPI_QuaTrinhXuLyPhieuDanhGia()
                {
                    IdPhieuDanhGia = request.IdPhieuDanhGia,
                    TrangThai = TrangThaiPhieuConstant.TraVe,
                    IdNguoiGui = request.IdNguoiGui,
                    IdNguoiXuLy = userIdChuPhieu,
                    IsXuLy = false,
                    GhiChu = request.GhiChu,
                };

                await _kpi_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(newQuaTrinhTraVe);
                return true;
            }

            // Các phiếu được tạo trước khi chuẩn hóa mã chức vụ có thể đã lưu Luong = 0.
            // Tính lại một lần để phiếu cũ vẫn chuyển đúng luồng.
            var luong = await EnsureLuongAsync(phieu);

            var buttonLuong = GetButtonLuong(luong, phieu.TrangThai);

            if (buttonLuong == null)
            {
                throw new Exception("Không thể chuyển bước luồng cho phiếu này.");
            }

            if (buttonLuong.CanChonNguoiXuLy
                && (!request.IdNguoiXuLy.HasValue || request.IdNguoiXuLy.Value == Guid.Empty))
            {
                throw new Exception("Vui lòng chọn người xử lý cho bước tiếp theo.");
            }

            await ValidateDuDiemNhiemVuTruocKhiChuyenBuoc(phieu);

            if (quaTrinhHienTai != null)
            {
                quaTrinhHienTai.IsXuLy = true;
                await _kpi_QuaTrinhXuLyPhieuDanhGiaService.UpdateAsync(quaTrinhHienTai);
            }

            // 2. Cập nhật trạng thái phiếu
            phieu.TrangThai = buttonLuong.TrangThaiTiepTheo;
            await UpdateAsync(phieu);

            // 3. Tạo bản ghi quá trình mới (kể cả DaDuyet cũng tạo nhưng không có người xử lý)
            var newQuaTrinh = new KPI_QuaTrinhXuLyPhieuDanhGia()
            {
                IdPhieuDanhGia = request.IdPhieuDanhGia,
                TrangThai = buttonLuong.TrangThaiTiepTheo,
                IdNguoiGui = request.IdNguoiGui,
                IdNguoiXuLy = request.IdNguoiXuLy ?? Guid.Empty,
                IsXuLy = buttonLuong.TrangThaiTiepTheo == TrangThaiPhieuConstant.DaDuyet,
                GhiChu = request.GhiChu,
            };

            await _kpi_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(newQuaTrinh);

            return true;
        }

        public async Task<bool> ThuHoiPhieu(ThuHoiPhieuRequest request)
        {
            var phieu = await GetByIdAsync(request.IdPhieuDanhGia);
            if (phieu == null)
            {
                throw new Exception("Phiếu đánh giá không tồn tại.");
            }

            if (phieu.TrangThai == TrangThaiPhieuConstant.DaDuyet)
            {
                throw new Exception("Không thể thu hồi phiếu đã được phê duyệt hoàn tất.");
            }

            if (phieu.TrangThai == TrangThaiPhieuConstant.KhoiTao || phieu.TrangThai == TrangThaiPhieuConstant.TraVe || string.IsNullOrEmpty(phieu.TrangThai))
            {
                throw new Exception("Phiếu đang ở trạng thái chỉnh sửa, không cần thu hồi.");
            }

            // Lấy userId của chủ phiếu theo IdLyLich
            var userIdChuPhieu = await _lyLich2CRepository.GetQueryable()
                .Where(x => x.Id == phieu.IdLyLich)
                .Select(x => x.UserId ?? Guid.Empty)
                .FirstOrDefaultAsync();

            // Tìm quá trình chưa xử lý gần nhất
            var quaTrinhHienTai = await _kpi_QuaTrinhXuLyPhieuDanhGiaService
                .GetQueryable()
                .Where(x => x.IdPhieuDanhGia == request.IdPhieuDanhGia && x.IsXuLy == false)
                .OrderByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            // Kiểm tra quyền thu hồi: Phải là chủ phiếu hoặc người gửi ở bước chưa xử lý
            bool isOwner = (userIdChuPhieu != Guid.Empty && userIdChuPhieu == request.IdNguoiThuHoi)
                || (phieu.CreatedId.HasValue && phieu.CreatedId.Value == request.IdNguoiThuHoi);

            bool isNguoiGuiTruoc = quaTrinhHienTai != null && quaTrinhHienTai.IdNguoiGui == request.IdNguoiThuHoi;

            if (!isOwner && !isNguoiGuiTruoc)
            {
                throw new Exception("Bạn không có quyền thu hồi phiếu đánh giá này.");
            }

            // 1. Đóng bản ghi quá trình đang chờ xử lý
            if (quaTrinhHienTai != null)
            {
                quaTrinhHienTai.IsXuLy = true;
                quaTrinhHienTai.GhiChu = string.IsNullOrEmpty(quaTrinhHienTai.GhiChu)
                    ? "Đã thu hồi"
                    : quaTrinhHienTai.GhiChu + " (Đã thu hồi)";
                await _kpi_QuaTrinhXuLyPhieuDanhGiaService.UpdateAsync(quaTrinhHienTai);
            }

            // 2. Chuyển trạng thái phiếu về Khởi tạo
            phieu.TrangThai = TrangThaiPhieuConstant.KhoiTao;
            await UpdateAsync(phieu);

            // 3. Tạo bản ghi quá trình mới ghi nhận việc thu hồi.
            // Không dùng KhoiTao ở đây: KhoiTao là trạng thái hiện tại của phiếu,
            // còn bản ghi lịch sử cần có trạng thái riêng để phân biệt sự kiện thu hồi.
            var newQuaTrinhThuHoi = new KPI_QuaTrinhXuLyPhieuDanhGia()
            {
                IdPhieuDanhGia = request.IdPhieuDanhGia,
                TrangThai = TrangThaiPhieuConstant.ThuHoi,
                IdNguoiGui = request.IdNguoiThuHoi,
                IdNguoiXuLy = userIdChuPhieu != Guid.Empty ? userIdChuPhieu : request.IdNguoiThuHoi,
                IsXuLy = false,
                GhiChu = !string.IsNullOrEmpty(request.GhiChu) ? request.GhiChu : "Thu hồi phiếu đánh giá",
            };

            await _kpi_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(newQuaTrinhThuHoi);
            return true;
        }

        private async Task ValidateDuDiemNhiemVuTruocKhiChuyenBuoc(KPI_PhieuDanhGia phieu)
        {
            try
            {
                if (!phieu.IdLyLich.HasValue || !phieu.IdDotDanhGia.HasValue)
                    throw new InvalidOperationException("Phiếu đánh giá không có đủ thông tin nhân sự hoặc đợt đánh giá.");

                var vaiTroDanhGia = phieu.TrangThai switch
                {
                    TrangThaiPhieuConstant.KhoiTao => "CaNhan",
                    TrangThaiPhieuConstant.TraVe => "CaNhan",
                    TrangThaiPhieuConstant.GuiPhoTruongPhong => "PhoTruongPhong",
                    TrangThaiPhieuConstant.GuiTruongPhong => "TruongPhong",
                    TrangThaiPhieuConstant.GuiPhoCucTruong => "PhoCucTruong",
                    TrangThaiPhieuConstant.GuiCucTruong => "CucTruong",
                    TrangThaiPhieuConstant.GuiPhoVuTruong => "PHOVUTRUONG",
                    TrangThaiPhieuConstant.GuiVuTruong => "VUTRUONG",
                    TrangThaiPhieuConstant.GuiPhoChanhVanPhong => "PhoChanhVanPhong",
                    TrangThaiPhieuConstant.GuiChanhVanPhong => "ChanhVanPhong",
                    TrangThaiPhieuConstant.GuiGiamDocTT => "GiamDocTT",
                    TrangThaiPhieuConstant.GuiPhoGiamDocTT => "PhoGiamDocTT",
                    _ => null
                };
                if (vaiTroDanhGia == null)
                    return;

                var dauRa = await (from dr in _kPI_DauRaNhiemVuRepository.GetQueryable()
                                   join nv in _kPI_NhiemVuRepository.GetQueryable() on dr.IdNhiemVu equals nv.Id
                                   where nv.IdLyLich == phieu.IdLyLich
                                         && nv.IdDotTheoDoiDanhGia == phieu.IdDotDanhGia
                                         && dr.IsDeleted == false && nv.IsDeleted == false
                                   select new
                                   {
                                       dr.Id,
                                       dr.ChamDiemSoLuong_HoanThanh,
                                       dr.ChamDiemChatLuong_SoDiemConLai,
                                       dr.ChamDiemTienDo_SoDiemConLai
                                   })
                    .ToListAsync();

                if (dauRa.Count == 0)
                    throw new InvalidOperationException("Vui lòng thêm ít nhất 1 nhiệm vụ để hoàn tất đánh giá.");

                int soDauRaThieu;
                if (vaiTroDanhGia == "CaNhan")
                {
                    // Tự động hoàn thiện điểm tự chấm cho Cá nhân nếu các đầu ra chưa có điểm (mặc định hoàn thành 100% theo tiêu chí)
                    var unratedDauRa = await (from dr in _kPI_DauRaNhiemVuRepository.GetQueryable()
                                              join nv in _kPI_NhiemVuRepository.GetQueryable() on dr.IdNhiemVu equals nv.Id
                                              where nv.IdLyLich == phieu.IdLyLich
                                                    && nv.IdDotTheoDoiDanhGia == phieu.IdDotDanhGia
                                                    && dr.IsDeleted == false && nv.IsDeleted == false
                                                    && (!dr.ChamDiemSoLuong_HoanThanh.HasValue
                                                        || !dr.ChamDiemChatLuong_SoDiemConLai.HasValue
                                                        || !dr.ChamDiemTienDo_SoDiemConLai.HasValue)
                                              select dr)
                                             .ToListAsync();

                    if (unratedDauRa.Any())
                    {
                        foreach (var dr in unratedDauRa)
                        {
                            var diem = dr.DiemTheoBoTieuChi ?? 0;
                            dr.ChamDiemSoLuong_HoanThanh ??= diem;
                            dr.ChamDiemSoLuong_KhongHoanThanh ??= 0;
                            dr.ChamDiemSoLuong_Diem ??= (diem > 0 ? 100 : 0);
                            dr.ChamDiemChatLuong_KhongDat ??= 0;
                            dr.ChamDiemChatLuong_SoDiemConLai ??= diem;
                            dr.ChamDiemChatLuong_Diem ??= (diem > 0 ? 100 : 0);
                            dr.ChamDiemTienDo_KhongDat ??= 0;
                            dr.ChamDiemTienDo_SoDiemConLai ??= diem;
                            dr.ChamDiemTienDo_Diem ??= (diem > 0 ? 100 : 0);
                            _kPI_DauRaNhiemVuRepository.Update(dr);
                        }
                        await _kPI_DauRaNhiemVuRepository.SaveAsync();
                    }

                    // Đảm bảo KPI_DauRaNhiemVu_ChiTietDanhGia có bản ghi cho CaNhan
                    var dauRaAll = await (from dr in _kPI_DauRaNhiemVuRepository.GetQueryable()
                                          join nv in _kPI_NhiemVuRepository.GetQueryable() on dr.IdNhiemVu equals nv.Id
                                          where nv.IdLyLich == phieu.IdLyLich
                                                && nv.IdDotTheoDoiDanhGia == phieu.IdDotDanhGia
                                                && dr.IsDeleted == false && nv.IsDeleted == false
                                          select dr)
                                         .ToListAsync();

                    var existingChiTietCaNhan = await _chiTietDanhGiaRepository.GetQueryable()
                        .Where(x => x.IdPhieuDanhGia == phieu.Id
                            && x.VaiTroDanhGia.ToLower() == "canhan"
                            && x.IsDeleted == false)
                        .Select(x => x.IdDauRaNhiemVu)
                        .ToListAsync();

                    var missingChiTietDauRa = dauRaAll.Where(x => !existingChiTietCaNhan.Contains(x.Id)).ToList();
                    if (missingChiTietDauRa.Any())
                    {
                        var newChiTietEntities = missingChiTietDauRa.Select(dr => new KPI_DauRaNhiemVu_ChiTietDanhGia
                        {
                            IdPhieuDanhGia = phieu.Id,
                            IdDauRaNhiemVu = dr.Id,
                            VaiTroDanhGia = "CaNhan",
                            NguoiDanhGiaId = phieu.UpdatedId ?? phieu.CreatedId,
                            ChamDiemSoLuong_HoanThanh = dr.ChamDiemSoLuong_HoanThanh ?? dr.DiemTheoBoTieuChi ?? 0,
                            ChamDiemSoLuong_KhongHoanThanh = dr.ChamDiemSoLuong_KhongHoanThanh ?? 0,
                            ChamDiemSoLuong_Diem = dr.ChamDiemSoLuong_Diem ?? 100,
                            ChamDiemChatLuong_KhongDat = dr.ChamDiemChatLuong_KhongDat ?? 0,
                            ChamDiemChatLuong_SoDiemConLai = dr.ChamDiemChatLuong_SoDiemConLai ?? dr.DiemTheoBoTieuChi ?? 0,
                            ChamDiemChatLuong_Diem = dr.ChamDiemChatLuong_Diem ?? 100,
                            ChamDiemTienDo_KhongDat = dr.ChamDiemTienDo_KhongDat ?? 0,
                            ChamDiemTienDo_SoDiemConLai = dr.ChamDiemTienDo_SoDiemConLai ?? dr.DiemTheoBoTieuChi ?? 0,
                            ChamDiemTienDo_Diem = dr.ChamDiemTienDo_Diem ?? 100,
                            GhiChu = dr.GhiChuGiaTrinh
                        }).ToList();

                        _chiTietDanhGiaRepository.AddRange(newChiTietEntities);
                        await _chiTietDanhGiaRepository.SaveAsync();
                    }

                    soDauRaThieu = 0;
                }
                else
                {
                    var dauRaIds = dauRa.Select(x => x.Id).ToList();
                    var chiTietDaCham = await _chiTietDanhGiaRepository.GetQueryable()
                        .Where(x => x.IdPhieuDanhGia == phieu.Id
                            && dauRaIds.Contains(x.IdDauRaNhiemVu)
                            && (x.VaiTroDanhGia.ToLower() == vaiTroDanhGia.ToLower())
                            && x.ChamDiemSoLuong_HoanThanh.HasValue
                            && x.ChamDiemChatLuong_SoDiemConLai.HasValue
                            && x.ChamDiemTienDo_SoDiemConLai.HasValue
                            && x.IsDeleted == false)
                        .Select(x => x.IdDauRaNhiemVu)
                        .Distinct()
                        .ToListAsync();
                    var missingDauRaIds = dauRaIds.Except(chiTietDaCham).ToList();
                    if (missingDauRaIds.Count > 0)
                    {
                        var dauRaList = await _kPI_DauRaNhiemVuRepository.GetQueryable()
                            .Where(x => missingDauRaIds.Contains(x.Id) && x.IsDeleted == false)
                            .ToListAsync();

                        var canInheritList = dauRaList.Where(x => x.ChamDiemSoLuong_HoanThanh.HasValue
                            && x.ChamDiemChatLuong_SoDiemConLai.HasValue
                            && x.ChamDiemTienDo_SoDiemConLai.HasValue).ToList();

                        if (canInheritList.Count > 0)
                        {
                            var newEntities = canInheritList.Select(dr => new KPI_DauRaNhiemVu_ChiTietDanhGia
                            {
                                IdPhieuDanhGia = phieu.Id,
                                IdDauRaNhiemVu = dr.Id,
                                VaiTroDanhGia = vaiTroDanhGia,
                                NguoiDanhGiaId = phieu.UpdatedId ?? phieu.CreatedId,
                                ChamDiemSoLuong_HoanThanh = dr.ChamDiemSoLuong_HoanThanh,
                                ChamDiemSoLuong_KhongHoanThanh = dr.ChamDiemSoLuong_KhongHoanThanh ?? 0,
                                ChamDiemSoLuong_Diem = dr.ChamDiemSoLuong_Diem,
                                ChamDiemChatLuong_KhongDat = dr.ChamDiemChatLuong_KhongDat ?? 0,
                                ChamDiemChatLuong_SoDiemConLai = dr.ChamDiemChatLuong_SoDiemConLai,
                                ChamDiemChatLuong_Diem = dr.ChamDiemChatLuong_Diem,
                                ChamDiemTienDo_KhongDat = dr.ChamDiemTienDo_KhongDat ?? 0,
                                ChamDiemTienDo_SoDiemConLai = dr.ChamDiemTienDo_SoDiemConLai,
                                ChamDiemTienDo_Diem = dr.ChamDiemTienDo_Diem,
                                GhiChu = dr.GhiChuGiaTrinh
                            }).ToList();

                            _chiTietDanhGiaRepository.AddRange(newEntities);
                            await _chiTietDanhGiaRepository.SaveAsync();
                            chiTietDaCham.AddRange(canInheritList.Select(dr => dr.Id));
                        }
                    }

                    soDauRaThieu = dauRaIds.Except(chiTietDaCham).Count();
                }

                if (soDauRaThieu > 0)
                    throw new InvalidOperationException($"Còn {soDauRaThieu} đầu ra nhiệm vụ chưa được chấm đầy đủ bởi vai trò {vaiTroDanhGia}.");
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(ex.Message, ex);
            }
        }

        public async Task<List<NguoiXuLyDto>> GetNguoiXuLyTheoChucVu(Guid idPhieuDanhGia, string chucVuNguoiXuLy)
        {
            var phieu = await GetByIdAsync(idPhieuDanhGia);
            if (phieu == null)
            {
                return new List<NguoiXuLyDto>();
            }

            // Lấy thông tin lý lịch của chủ phiếu
            var lyLichChuPhieu = await _lyLich2CRepository
                .GetQueryable()
                .Where(x => x.Id == phieu.IdLyLich)
                .FirstOrDefaultAsync();

            if (lyLichChuPhieu == null)
            {
                return new List<NguoiXuLyDto>();
            }

            // Xác định danh sách mã chức vụ cần tìm
            List<string> danhSachChucVu;
            switch (chucVuNguoiXuLy)
            {
                case "PhoTruongPhong":
                    danhSachChucVu = ChucVuConstant.ChucVuPhoTruongPhong;
                    break;
                case "TruongPhong":
                    danhSachChucVu = ChucVuConstant.ChucVuTruongPhong;
                    break;
                case "PhoCucTruong":
                    danhSachChucVu = ChucVuConstant.ChucVuPhoCucTruong;
                    break;
                case "CucTruong":
                    danhSachChucVu = ChucVuConstant.ChucVuCucTruong;
                    break;
                case "PhoVuTruong":
                case "PHOCHANHVANPHONG":
                    danhSachChucVu = ChucVuConstant.ChucVuPhoVuTruong;
                    break;
                case "VuTruong":
                case "ChanhVanPhong":
                    danhSachChucVu = ChucVuConstant.ChucVuVuTruong;
                    break;
                case "PhoGDTT":
                case "PV":
                    danhSachChucVu = ChucVuConstant.ChucVuPhoGiamDoc;
                    break;
                case "GiamDoc":
                case "GD":
                    danhSachChucVu = ChucVuConstant.ChucVuGiamDoc;
                    break;
                default:
                    return new List<NguoiXuLyDto>();
            }

            // 1. Chuẩn hóa danh sách chức vụ sang chữ thường trước
            var danhSachChucVuLower = danhSachChucVu.Select(c => c.ToLower()).ToList();

            // 2. Thực hiện query và chuyển ChucVuHienTai về chữ thường
            var queryLyLich = _lyLich2CRepository.GetQueryable()
                .Where(x => x.ChucVuHienTai != null && danhSachChucVuLower.Contains(x.ChucVuHienTai.ToLower()));

            var phongBanChuPhieu = await _departmentRepository
                    .GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == lyLichChuPhieu.PhongBanId);

            if (ChucVuConstant.LanhDaoCap2.Contains(chucVuNguoiXuLy))
            {
                queryLyLich = queryLyLich.Where(x => x.DonViSuDungId == lyLichChuPhieu.DonViSuDungId);
            }
            else
            {
                queryLyLich = queryLyLich.Where(x => x.DonViSuDungId == lyLichChuPhieu.DonViSuDungId && x.PhongBanId == lyLichChuPhieu.PhongBanId);
            }

            var idDmChucVu = await _nhomDanhMucRepository
                .GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.CHUCVUVNU)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

            var result = from lylichTbl in queryLyLich.Where(x => x.Id != Guid.Empty)
                         join chucVuTbl in _duLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == idDmChucVu)
                         on lylichTbl.ChucVuHienTai equals chucVuTbl.Code into chucVuJoin
                         from chucVuInfo in chucVuJoin.DefaultIfEmpty()

                         join userTbl in _aspNetUsersRepository.GetQueryable()
                         on lylichTbl.UserId equals userTbl.Id into userJoin
                         from userInfo in userJoin.DefaultIfEmpty()

                         select new NguoiXuLyDto
                         {
                             Id = lylichTbl.UserId ?? Guid.Empty,
                             HoTen = lylichTbl.HoTen + " (" + userInfo.UserName + ")",
                             ChucVu = lylichTbl.ChucVuHienTai != null ? chucVuInfo != null ? chucVuInfo.Name : lylichTbl.ChucVuHienTai : null,
                         };

            return await result.ToListAsync();
        }

        private static EvaluationRoleScoreDto GetEvaluationRoleScore(DotDanhGiaWithPhieuDto item, string scoreRoleCode)
        {
            if (!item.EvaluationRoleScores.TryGetValue(scoreRoleCode, out var score))
            {
                score = new EvaluationRoleScoreDto();
                item.EvaluationRoleScores[scoreRoleCode] = score;
            }

            return score;
        }

        private static void SetEvaluationRoleScore(
            DotDanhGiaWithPhieuDto item,
            string scoreRoleCode,
            decimal? diemTieuChiChung = null,
            decimal? diemThucHienNhiemVu = null)
        {
            var score = GetEvaluationRoleScore(item, scoreRoleCode);
            if (diemTieuChiChung.HasValue)
            {
                score.DiemTieuChiChung = diemTieuChiChung;
            }
            if (diemThucHienNhiemVu.HasValue)
            {
                score.DiemThucHienNhiemVu = diemThucHienNhiemVu;
            }

            // Giữ các trường điểm cũ cho những màn hình API chưa chuyển sang map roleCode.
            switch (scoreRoleCode)
            {
                case "PhoTruongPhong":
                    if (diemTieuChiChung.HasValue) item.PhoPhong_DiemTieuChiChung = diemTieuChiChung;
                    if (diemThucHienNhiemVu.HasValue) item.PhoPhong_DiemThucHienNhiemVu = diemThucHienNhiemVu;
                    break;
                case "TruongPhong":
                    if (diemTieuChiChung.HasValue) item.TruongPhong_DiemTieuChiChung = diemTieuChiChung;
                    if (diemThucHienNhiemVu.HasValue) item.TruongPhong_DiemThucHienNhiemVu = diemThucHienNhiemVu;
                    break;
                case "PhoCucTruong":
                    if (diemTieuChiChung.HasValue) item.PhoCucTruong_DiemTieuChiChung = diemTieuChiChung;
                    if (diemThucHienNhiemVu.HasValue) item.PhoCucTruong_DiemThucHienNhiemVu = diemThucHienNhiemVu;
                    break;
                case "CucTruong":
                    if (diemTieuChiChung.HasValue) item.CucTruong_DiemTieuChiChung = diemTieuChiChung;
                    if (diemThucHienNhiemVu.HasValue) item.CucTruong_DiemThucHienNhiemVu = diemThucHienNhiemVu;
                    break;
                case "PhoVuTruong":
                    if (diemTieuChiChung.HasValue) item.PhoVuTruong_DiemTieuChiChung = diemTieuChiChung;
                    if (diemThucHienNhiemVu.HasValue) item.PhoVuTruong_DiemThucHienNhiemVu = diemThucHienNhiemVu;
                    break;
                case "VuTruong":
                    if (diemTieuChiChung.HasValue) item.VuTruong_DiemTieuChiChung = diemTieuChiChung;
                    if (diemThucHienNhiemVu.HasValue) item.VuTruong_DiemThucHienNhiemVu = diemThucHienNhiemVu;
                    break;
            }
        }

        private static void UpdateEvaluationRoleScoreTotals(DotDanhGiaWithPhieuDto item)
        {
            foreach (var score in item.EvaluationRoleScores.Values)
            {
                if (score.DiemThucHienNhiemVu.HasValue || score.DiemTieuChiChung.HasValue)
                {
                    score.TongDiem = (score.DiemThucHienNhiemVu ?? 0m) + (score.DiemTieuChiChung ?? 0m);
                }
            }
        }

        private static void ClearEvaluationRoleScore(DotDanhGiaWithPhieuDto item, string scoreRoleCode)
        {
            var score = GetEvaluationRoleScore(item, scoreRoleCode);
            score.DiemTieuChiChung = null;
            score.DiemThucHienNhiemVu = null;
            score.TongDiem = null;

            switch (scoreRoleCode)
            {
                case "PhoTruongPhong":
                    item.PhoPhong_DiemTieuChiChung = null;
                    item.PhoPhong_DiemThucHienNhiemVu = null;
                    item.PhoPhong_TongDiem = null;
                    break;
                case "TruongPhong":
                    item.TruongPhong_DiemTieuChiChung = null;
                    item.TruongPhong_DiemThucHienNhiemVu = null;
                    item.TruongPhong_TongDiem = null;
                    break;
                case "PhoCucTruong":
                    item.PhoCucTruong_DiemTieuChiChung = null;
                    item.PhoCucTruong_DiemThucHienNhiemVu = null;
                    item.PhoCucTruong_TongDiem = null;
                    break;
                case "CucTruong":
                    item.CucTruong_DiemTieuChiChung = null;
                    item.CucTruong_DiemThucHienNhiemVu = null;
                    item.CucTruong_TongDiem = null;
                    break;
                case "PhoVuTruong":
                    item.PhoVuTruong_DiemTieuChiChung = null;
                    item.PhoVuTruong_DiemThucHienNhiemVu = null;
                    item.PhoVuTruong_TongDiem = null;
                    break;
                case "VuTruong":
                    item.VuTruong_DiemTieuChiChung = null;
                    item.VuTruong_DiemThucHienNhiemVu = null;
                    item.VuTruong_TongDiem = null;
                    break;
            }
        }

        private async Task<int> GetLuongTheoLyLich(Guid idLyLich)
        {
            var thongTinLyLich = await _lyLich2CRepository
                .GetQueryable()
                .Where(x => x.Id == idLyLich)
                .Select(x => new
                {
                    x.ChucVuHienTai,
                    x.DonViSuDungId,
                    x.PhongBanId
                })
                .FirstOrDefaultAsync();

            if (thongTinLyLich == null)
            {
                throw new Exception("Không tìm thấy thông tin lý lịch cho nhân sự.");
            }

            var deptInfo = await _departmentRepository
                .GetQueryable()
                .Where(x => x.Id == (thongTinLyLich.PhongBanId != Guid.Empty ? thongTinLyLich.PhongBanId : thongTinLyLich.DonViSuDungId))
                .Select(x => new
                {
                    x.Loai,
                    x.Level
                })
                .FirstOrDefaultAsync();

            if (deptInfo == null)
            {
                throw new Exception("Không tìm thấy thông tin phòng ban cho nhân sự.");
            }

            var chucVuHienTai = thongTinLyLich.ChucVuHienTai?.Trim();
            var luong = 0;
            if (deptInfo.Loai != DepartmentConstant.Vu)
            {
                // Luồng phòng ban cấp 2 ngang vụ, cục
                if (deptInfo.Loai == DepartmentConstant.PHONG_BAN && deptInfo.Level == 2)
                {
                    if (string.IsNullOrEmpty(thongTinLyLich.ChucVuHienTai) || ChucVuConstant.ChucVuChuyenVien.Contains(thongTinLyLich.ChucVuHienTai))
                    {
                        luong = LuongConstant.LuongType.LuongChuyenVienVanPhongCap2.GetHashCode();
                    }
                    else if (ChucVuConstant.ChucVuPhoVuTruong.Contains(thongTinLyLich.ChucVuHienTai))
                    {
                        luong = LuongConstant.LuongType.LuongPhoChanhVanPhong.GetHashCode();
                    }
                    else if (ChucVuConstant.ChucVuVuTruong.Contains(thongTinLyLich.ChucVuHienTai))
                    {
                        luong = LuongConstant.LuongType.LuongChanhVanPhong.GetHashCode();
                    }
                }
                else
                {
                    // Luồng phòng ban thông thường
                    if (string.IsNullOrEmpty(thongTinLyLich.ChucVuHienTai) || ChucVuConstant.ChucVuChuyenVien.Contains(thongTinLyLich.ChucVuHienTai))
                    {
                        luong = LuongConstant.LuongType.LuongChuyenVien.GetHashCode();
                    }
                    else if (ChucVuConstant.ChucVuPhoTruongPhong.Contains(thongTinLyLich.ChucVuHienTai))
                    {
                        luong = LuongConstant.LuongType.LuongPhoTruongPhong.GetHashCode();
                    }

                    // Luồng lãnh đạo trung tâm
                    if (deptInfo.Loai == DepartmentConstant.TT)
                    {
                        if (string.IsNullOrWhiteSpace(chucVuHienTai) || IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuTruongPhong))
                        {
                            luong = LuongConstant.LuongType.LuongTruongPhongTT.GetHashCode();
                        }
                        else if (IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuPhoGiamDoc))
                        {
                            luong = LuongConstant.LuongType.LuongPhoGiamDocTT.GetHashCode();
                        }
                        else if (IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuGiamDoc))
                        {
                            luong = LuongConstant.LuongType.LuongGiamDocTT.GetHashCode();
                        }
                    }
                    // Luồng lãnh đạo cho phòng ban thông thường
                    else
                    {
                        if (ChucVuConstant.ChucVuTruongPhong.Contains(thongTinLyLich.ChucVuHienTai))
                        {
                            luong = LuongConstant.LuongType.LuongTruongPhong.GetHashCode();
                        }
                        else if (ChucVuConstant.ChucVuPhoCucTruong.Contains(thongTinLyLich.ChucVuHienTai))
                        {
                            luong = LuongConstant.LuongType.LuongPhoCucTruong.GetHashCode();
                        }
                        else if (ChucVuConstant.ChucVuCucTruong.Contains(thongTinLyLich.ChucVuHienTai))
                        {
                            luong = LuongConstant.LuongType.LuongCucTruong.GetHashCode();
                        }
                    }
                }
            }
            // Luồng cho vụ
            else if (deptInfo.Loai == DepartmentConstant.Vu)
            {
                if (string.IsNullOrWhiteSpace(chucVuHienTai) || IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuChuyenVien))
                {
                    luong = LuongConstant.LuongType.LuongChuyenVienCapVu.GetHashCode();
                }
                else if (IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuPhoVuTruong))
                {
                    luong = LuongConstant.LuongType.LuongPhoVuTruong.GetHashCode();
                }
                else if (IsChucVu(chucVuHienTai, ChucVuConstant.ChucVuVuTruong))
                {
                    luong = LuongConstant.LuongType.LuongVuTruong.GetHashCode();
                }
            }

            return luong;
        }

        public override async Task CreateAsync(KPI_PhieuDanhGia entity)
        {
            entity.TrangThai = TrangThaiPhieuConstant.KhoiTao;
            var luong = await GetLuongTheoLyLich(entity.IdLyLich ?? Guid.Empty);
            entity.Luong = luong;
            await base.CreateAsync(entity);

            var newQuaTrinhXuLy = new KPI_QuaTrinhXuLyPhieuDanhGia()
            {
                IdPhieuDanhGia = entity.Id,
                TrangThai = entity.TrangThai,
                GhiChu = "Khởi tạo phiếu đánh giá",
                IdNguoiXuLy = entity.CreatedId ?? Guid.Empty,
                IdNguoiGui = entity.CreatedId ?? Guid.Empty,
                IsXuLy = false,
            };

            try
            {
                await _kpi_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(newQuaTrinhXuLy);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi tạo quá trình xử lý phiếu đánh giá: " + ex.Message);
            }
        }

        public async Task<CheckQuyenChamDiemDto> CheckQuyenChamDiem(Guid? idPhieuDanhGia, Guid? idLyLich, Guid? idDotDanhGia)
        {
            KPI_PhieuDanhGia? phieu = null;
            if (idPhieuDanhGia.HasValue && idPhieuDanhGia.Value != Guid.Empty)
            {
                phieu = await GetByIdAsync(idPhieuDanhGia.Value);
            }
            else if (idLyLich.HasValue && idDotDanhGia.HasValue)
            {
                phieu = await GetQueryable().FirstOrDefaultAsync(x => x.IdLyLich == idLyLich && x.IdDotDanhGia == idDotDanhGia);
            }

            if (phieu == null)
            {
                return new CheckQuyenChamDiemDto
                {
                    IsOwner = true,
                    CanEdit = true,
                    TrangThai = TrangThaiPhieuConstant.KhoiTao
                };
            }

            bool isOwner = idLyLich.HasValue && phieu.IdLyLich.HasValue && phieu.IdLyLich.Value == idLyLich.Value;
            bool canEdit = isOwner && (phieu.TrangThai == TrangThaiPhieuConstant.KhoiTao || phieu.TrangThai == TrangThaiPhieuConstant.TraVe || string.IsNullOrEmpty(phieu.TrangThai));

            return new CheckQuyenChamDiemDto
            {
                IsOwner = isOwner,
                CanEdit = canEdit,
                TrangThai = phieu.TrangThai
            };
        }
    }
}
