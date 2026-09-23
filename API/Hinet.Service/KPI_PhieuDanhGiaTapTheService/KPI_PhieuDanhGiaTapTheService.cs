using Hinet.Model.Entities;
using Hinet.Repository.AspNetUsersRepository;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Repository.KPI_BoTieuChiChungRepository;
using Hinet.Repository.KPI_BoTieuChiDonViRepository;
using Hinet.Repository.KPI_DotDanhGia_DonViRepository;
using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.KPI_PhieuDanhGiaTapTheRepository;
using Hinet.Repository.RoleRepository;
using Hinet.Repository.UserRoleRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Constant;
using Hinet.Service.Dto;
using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using Hinet.Service.KPI_PhieuDanhGiaTapTheService.Constant;
using Hinet.Service.KPI_PhieuDanhGiaTapTheService.Dto;
using Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Hinet.Repository.KPI_TieuChiChungRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSoRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSo_CapTrenRepository;
using Hinet.Service.KPI_PhieuDanhGiaTapTheService.ViewModels;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService
{
    public class KPI_PhieuDanhGiaTapTheService : Service<KPI_PhieuDanhGiaTapThe>, IKPI_PhieuDanhGiaTapTheService
    {
        private readonly IKPI_QuaTrinhXuLyPhieuDanhGiaService _kpi_QuaTrinhXuLyPhieuDanhGiaService;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IKPI_DotTheoDoiDanhGiaRepository _kPI_DotTheoDoiDanhGiaRepository;
        private readonly IKPI_DotDanhGia_DonViRepository _kPI_DotDanhGia_DonViRepository;
        private readonly IKPI_BoTieuChiChungRepository _kPI_BoTieuChiChungRepository;
        private readonly IKPI_BoTieuChiDonViRepository _kPI_BoTieuChiDonViRepository;
        private readonly IKPI_LyLich2CRepository _lyLich2CRepository;
        private readonly IAspNetUsersRepository _aspNetUsersRepository;
        private readonly IDM_NhomDanhMucRepository _nhomDanhMucRepository;
        private readonly IDM_DuLieuDanhMucRepository _duLieuDanhMucRepository;
        private readonly IKPI_TieuChiChungRepository _kPI_TieuChiChungRepository;
        private readonly IKPI_TieuChiChung_DiemSoRepository _kPI_TieuChiChung_DiemSoRepository;
        private readonly IKPI_TieuChiChung_DiemSo_CapTrenRepository _kPI_TieuChiChung_DiemSo_CapTrenRepository;
        private readonly Hinet.Service.KPI_TieuChiChungService.IKPI_TieuChiChungService _kpi_TieuChiChungService;
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRoleRepository _userRoleRepository;

        public KPI_PhieuDanhGiaTapTheService(
            IKPI_PhieuDanhGiaTapTheRepository kPI_PhieuDanhGiaTapTheRepository,
            IKPI_QuaTrinhXuLyPhieuDanhGiaService kpi_QuaTrinhXuLyPhieuDanhGiaService,
            IDepartmentRepository departmentRepository,
            IKPI_DotTheoDoiDanhGiaRepository kPI_DotTheoDoiDanhGiaRepository,
            IKPI_DotDanhGia_DonViRepository kPI_DotDanhGia_DonViRepository,
            IKPI_BoTieuChiChungRepository kPI_BoTieuChiChungRepository,
            IKPI_BoTieuChiDonViRepository kPI_BoTieuChiDonViRepository,
            IKPI_LyLich2CRepository lyLich2CRepository,
            IAspNetUsersRepository aspNetUsersRepository,
            IDM_NhomDanhMucRepository nhomDanhMucRepository,
            IDM_DuLieuDanhMucRepository duLieuDanhMucRepository,
            IKPI_TieuChiChungRepository kPI_TieuChiChungRepository,
            IKPI_TieuChiChung_DiemSoRepository kPI_TieuChiChung_DiemSoRepository,
            IKPI_TieuChiChung_DiemSo_CapTrenRepository kPI_TieuChiChung_DiemSo_CapTrenRepository,
            Hinet.Service.KPI_TieuChiChungService.IKPI_TieuChiChungService kpi_TieuChiChungService,
            IRoleRepository roleRepository,
            IUserRoleRepository userRoleRepository
            ) : base(kPI_PhieuDanhGiaTapTheRepository)
        {
            _kpi_QuaTrinhXuLyPhieuDanhGiaService = kpi_QuaTrinhXuLyPhieuDanhGiaService;
            _departmentRepository = departmentRepository;
            _kPI_DotTheoDoiDanhGiaRepository = kPI_DotTheoDoiDanhGiaRepository;
            _kPI_DotDanhGia_DonViRepository = kPI_DotDanhGia_DonViRepository;
            _kPI_BoTieuChiChungRepository = kPI_BoTieuChiChungRepository;
            _kPI_BoTieuChiDonViRepository = kPI_BoTieuChiDonViRepository;
            _lyLich2CRepository = lyLich2CRepository;
            _aspNetUsersRepository = aspNetUsersRepository;
            _nhomDanhMucRepository = nhomDanhMucRepository;
            _duLieuDanhMucRepository = duLieuDanhMucRepository;
            _kPI_TieuChiChungRepository = kPI_TieuChiChungRepository;
            _kPI_TieuChiChung_DiemSoRepository = kPI_TieuChiChung_DiemSoRepository;
            _kPI_TieuChiChung_DiemSo_CapTrenRepository = kPI_TieuChiChung_DiemSo_CapTrenRepository;
            _kpi_TieuChiChungService = kpi_TieuChiChungService;
            _roleRepository = roleRepository;
            _userRoleRepository = userRoleRepository;
        }

        public async Task<PagedList<KPI_PhieuDanhGiaTapTheDto>> GetData(KPI_PhieuDanhGiaTapTheSearch search)
        {
            var query = from q in GetQueryable().Where(x => !x.IsDeleted)
                        join dot in _kPI_DotTheoDoiDanhGiaRepository.GetQueryable() on q.IdDotDanhGia equals dot.Id into dotGroup
                        from d in dotGroup.DefaultIfEmpty()

                        join donVi in _departmentRepository.GetQueryable() on q.DonVi equals donVi.Id into donViGroup
                        from dv in donViGroup.DefaultIfEmpty()

                        join phongBan in _departmentRepository.GetQueryable() on q.PhongBan equals phongBan.Id.ToString() into pbGroup
                        from pb in pbGroup.DefaultIfEmpty()

                        select new KPI_PhieuDanhGiaTapTheDto
                        {
                            Id = q.Id,
                            IdDotDanhGia = q.IdDotDanhGia,
                            TenDotDanhGia = d != null ? d.TenDotTheoDoiDanhGia : "",
                            DonVi = q.DonVi,
                            TenDonVi = dv != null ? dv.Name : "",
                            Luong = q.Luong,
                            PhongBan = q.PhongBan,
                            TenPhongBan = pb != null ? pb.Name : q.PhongBan,
                            DiemTieuChiChung = q.DiemTieuChiChung,
                            DiemThucHienNhiemVu = q.DiemThucHienNhiemVu,
                            TongDiem = q.TongDiem,
                            ChatLuongTuDanhGia = q.ChatLuongTuDanhGia,
                            TenChatLuongTuDanhGia = LuongTapTheConstant.GetTenXepLoai(q.ChatLuongTuDanhGia),
                            ChatLuongCapTrenDanhGia = q.ChatLuongCapTrenDanhGia,
                            TenChatLuongCapTrenDanhGia = LuongTapTheConstant.GetTenXepLoai(q.ChatLuongCapTrenDanhGia),
                            TrangThai = q.TrangThai,
                            CreatedBy = q.CreatedBy,
                            CreatedDate = q.CreatedDate,
                            UpdatedBy = q.UpdatedBy,
                            UpdatedDate = q.UpdatedDate,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            DeletedDate = q.DeletedDate,
                        };

            if (search != null)
            {
                if (search.IdDonVi.HasValue && search.IdDonVi.Value != Guid.Empty)
                {
                    query = query.Where(x => x.DonVi == search.IdDonVi.Value);
                }
                else if (!string.IsNullOrEmpty(search.DonVi))
                {
                    if (Guid.TryParse(search.DonVi, out var donViGuid))
                    {
                        query = query.Where(x => x.DonVi == donViGuid);
                    }
                    else
                    {
                        query = query.Where(x => x.TenDonVi != null && EF.Functions.Like(x.TenDonVi, $"%{search.DonVi}%"));
                    }
                }

                if (search.IdPhongBan.HasValue && search.IdPhongBan.Value != Guid.Empty)
                {
                    query = query.Where(x => x.PhongBan == search.IdPhongBan.Value.ToString());
                }
                else if (!string.IsNullOrEmpty(search.PhongBan))
                {
                    query = query.Where(x => (x.PhongBan != null && EF.Functions.Like(x.PhongBan, $"%{search.PhongBan}%"))
                        || (x.TenPhongBan != null && EF.Functions.Like(x.TenPhongBan, $"%{search.PhongBan}%")));
                }

                if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotGuid))
                {
                    query = query.Where(x => x.IdDotDanhGia == idDotGuid);
                }

                if (search.Luong.HasValue)
                {
                    query = query.Where(x => x.Luong == search.Luong.Value);
                }
                if (!string.IsNullOrEmpty(search.TrangThai))
                {
                    query = query.Where(x => x.TrangThai == search.TrangThai);
                }
                if (search.ChatLuongTuDanhGia.HasValue)
                {
                    query = query.Where(x => x.ChatLuongTuDanhGia == search.ChatLuongTuDanhGia.Value);
                }
                if (search.ChatLuongCapTrenDanhGia.HasValue)
                {
                    query = query.Where(x => x.ChatLuongCapTrenDanhGia == search.ChatLuongCapTrenDanhGia.Value);
                }
                if (search.DiemTieuChiChung.HasValue)
                {
                    query = query.Where(x => x.DiemTieuChiChung == search.DiemTieuChiChung.Value);
                }
                if (search.DiemThucHienNhiemVu.HasValue)
                {
                    query = query.Where(x => x.DiemThucHienNhiemVu == search.DiemThucHienNhiemVu.Value);
                }
                if (search.TongDiem.HasValue)
                {
                    query = query.Where(x => x.TongDiem == search.TongDiem.Value);
                }
            }

            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_PhieuDanhGiaTapTheDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_PhieuDanhGiaTapTheDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id && !x.IsDeleted)
                              join dot in _kPI_DotTheoDoiDanhGiaRepository.GetQueryable() on q.IdDotDanhGia equals dot.Id into dotGroup
                              from d in dotGroup.DefaultIfEmpty()

                              join donVi in _departmentRepository.GetQueryable() on q.DonVi equals donVi.Id into donViGroup
                              from dv in donViGroup.DefaultIfEmpty()

                              join phongBan in _departmentRepository.GetQueryable() on q.PhongBan equals phongBan.Id.ToString() into pbGroup
                              from pb in pbGroup.DefaultIfEmpty()

                              select new KPI_PhieuDanhGiaTapTheDto
                              {
                                  Id = q.Id,
                                  IdDotDanhGia = q.IdDotDanhGia,
                                  TenDotDanhGia = d != null ? d.TenDotTheoDoiDanhGia : "",
                                  DonVi = q.DonVi,
                                  TenDonVi = dv != null ? dv.Name : "",
                                  Luong = q.Luong,
                                  PhongBan = q.PhongBan,
                                  TenPhongBan = pb != null ? pb.Name : q.PhongBan,
                                  DiemTieuChiChung = q.DiemTieuChiChung,
                                  DiemThucHienNhiemVu = q.DiemThucHienNhiemVu,
                                  TongDiem = q.TongDiem,
                                  ChatLuongTuDanhGia = q.ChatLuongTuDanhGia,
                                  TenChatLuongTuDanhGia = LuongTapTheConstant.GetTenXepLoai(q.ChatLuongTuDanhGia),
                                  ChatLuongCapTrenDanhGia = q.ChatLuongCapTrenDanhGia,
                                  TenChatLuongCapTrenDanhGia = LuongTapTheConstant.GetTenXepLoai(q.ChatLuongCapTrenDanhGia),
                                  TrangThai = q.TrangThai,
                                  CreatedBy = q.CreatedBy,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedBy = q.UpdatedBy,
                                  UpdatedDate = q.UpdatedDate,
                                  IsDeleted = q.IsDeleted,
                                  DeletedId = q.DeletedId,
                                  DeletedDate = q.DeletedDate,
                              }).FirstOrDefaultAsync();

            if (item != null)
            {
                var luong = item.Luong ?? (int)LuongTapTheConstant.LuongTapTheType.LuongPhongBan;
                item.ButtonLuong = LuongTapTheConstant.GetButtonLuong(luong, item.TrangThai ?? TrangThaiPhieuConstant.KhoiTao);
            }

            return item;
        }

        public async Task<Guid> InitPhieuDanhGiaTapThe(Guid idDotDanhGia, Guid donViId, Guid? phongBanId, Guid? userId)
        {
            string? phongBanStr = phongBanId.HasValue ? phongBanId.Value.ToString() : null;

            var existingPhieu = await GetQueryable()
                .FirstOrDefaultAsync(x => x.IdDotDanhGia == idDotDanhGia
                    && x.DonVi == donViId
                    && (phongBanStr == null ? (x.PhongBan == null || x.PhongBan == "") : x.PhongBan == phongBanStr)
                    && !x.IsDeleted);

            if (existingPhieu != null)
            {
                return existingPhieu.Id;
            }

            int luong = phongBanId.HasValue
                ? (int)LuongTapTheConstant.LuongTapTheType.LuongPhongBan
                : (int)LuongTapTheConstant.LuongTapTheType.LuongDonVi;

            var newPhieu = new KPI_PhieuDanhGiaTapThe
            {
                IdDotDanhGia = idDotDanhGia,
                DonVi = donViId,
                PhongBan = phongBanStr,
                Luong = luong,
                TrangThai = TrangThaiPhieuConstant.KhoiTao,
                CreatedDate = DateTime.Now,
                CreatedBy = userId?.ToString(),
                CreatedId = userId,
            };

            await CreateAsync(newPhieu);
            return newPhieu.Id;
        }

        public async Task<PagedList<DotDanhGiaWithPhieuTapTheDto>> GetDotDanhGiaWithPhieu(Guid userId, KPI_PhieuDanhGiaTapTheSearch search)
        {
            var dotDanhGias = _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                .Where(x => x.Type == LoaiDotDanhGiaConstant.TAP_THE
                         || x.Type == "TapThe"
                         || (x.Type == null && x.TenDotTheoDoiDanhGia != null && EF.Functions.ILike(x.TenDotTheoDoiDanhGia, "%tập thể%")));
            var phieuDanhGias = GetQueryable().Where(x => !x.IsDeleted);
            var queryQuaTrinh = _kpi_QuaTrinhXuLyPhieuDanhGiaService.GetQueryable();
            var queryDepartment = _departmentRepository.GetQueryable();

            var userLyLich = await _lyLich2CRepository.GetQueryable().FirstOrDefaultAsync(x => x.UserId == userId);
            var userObj = await _aspNetUsersRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == userId);

            Guid targetDonViId = Guid.Empty;
            if (search != null && search.IdDonVi.HasValue && search.IdDonVi.Value != Guid.Empty)
            {
                targetDonViId = search.IdDonVi.Value;
            }
            else if (search != null && !string.IsNullOrEmpty(search.DonVi) && Guid.TryParse(search.DonVi, out var dvGuid))
            {
                targetDonViId = dvGuid;
            }
            else
            {
                targetDonViId = userLyLich?.DonViSuDungId ?? userObj?.DonViId ?? Guid.Empty;
            }

            Guid? targetPhongBanId = null;
            if (search != null && search.IdPhongBan.HasValue && search.IdPhongBan.Value != Guid.Empty)
            {
                targetPhongBanId = search.IdPhongBan.Value;
            }
            else if (search != null && !string.IsNullOrEmpty(search.PhongBan) && Guid.TryParse(search.PhongBan, out var pbGuid))
            {
                targetPhongBanId = pbGuid;
            }
            else
            {
                targetPhongBanId = userLyLich?.PhongBanId;
            }

            string? phongBanStr = targetPhongBanId.HasValue ? targetPhongBanId.Value.ToString() : null;

            bool isTabDot = search == null || (!search.IsXuLy.HasValue && !search.IsKhacHoanThanh.HasValue);

            if (isTabDot)
            {
                if (targetDonViId != Guid.Empty)
                {
                    phieuDanhGias = phieuDanhGias.Where(x => x.DonVi == targetDonViId);
                }
                if (!string.IsNullOrEmpty(phongBanStr))
                {
                    phieuDanhGias = phieuDanhGias.Where(x => x.PhongBan == phongBanStr);
                }
            }

            var query = from dot in dotDanhGias
                        join phieu in phieuDanhGias on dot.Id equals phieu.IdDotDanhGia into phieuJ
                        from p in phieuJ.DefaultIfEmpty()

                        join dv in queryDepartment on (p != null && p.DonVi.HasValue ? p.DonVi.Value : targetDonViId) equals dv.Id into dvJ
                        from department in dvJ.DefaultIfEmpty()

                        join pb in queryDepartment on (p != null && !string.IsNullOrEmpty(p.PhongBan) ? p.PhongBan : phongBanStr) equals pb.Id.ToString() into pbJ
                        from phongBanDept in pbJ.DefaultIfEmpty()

                        join dotDvDv in _kPI_DotDanhGia_DonViRepository.GetQueryable()
                        on new { IdDot = dot.Id, IdDonVi = (p != null && p.DonVi.HasValue ? p.DonVi.Value : targetDonViId) }
                        equals new { IdDot = dotDvDv.IdDotDanhGia, IdDonVi = dotDvDv.IdDonVi } into dotDvDvJoin
                        from ddvDv in dotDvDvJoin.DefaultIfEmpty()

                        join btc in _kPI_BoTieuChiChungRepository.GetQueryable()
                        on ddvDv.IdBoTieuChiChung equals (Guid?)btc.Id into btcJoin
                        from boTieuChiChung in btcJoin.DefaultIfEmpty()

                        join btcDv in _kPI_BoTieuChiDonViRepository.GetQueryable()
                        on ddvDv.IdBoChiSoNhiemVu equals (Guid?)btcDv.Id into btcDvJoin
                        from boTieuChiDonVi in btcDvJoin.DefaultIfEmpty()

                        join defaultBtc in _kPI_BoTieuChiChungRepository.GetQueryable()
                        on dot.DefaultTieuChiChung equals (Guid?)defaultBtc.Id into defaultBtcJoin
                        from defaultBoTieuChiChung in defaultBtcJoin.DefaultIfEmpty()

                        join defaultBtcDonVi in _kPI_BoTieuChiDonViRepository.GetQueryable()
                        on dot.DefaultTieuChiDonVi equals (Guid?)defaultBtcDonVi.Id into defaultBtcDonViJoin
                        from defaultBoTieuChiDonVi in defaultBtcDonViJoin.DefaultIfEmpty()

                        select new DotDanhGiaWithPhieuTapTheDto
                        {
                            IdDotDanhGia = dot.Id,
                            TenDotDanhGia = dot.TenDotTheoDoiDanhGia,
                            Thang = dot.Thang,
                            Quy = dot.Quy,
                            Nam = dot.Nam,
                            ThoiGianBatDau = dot.ThoiGianBatDau,
                            ThoiGianKetThuc = dot.ThoiGianKetThuc,
                            TrangThaiDot = dot.TrangThai,

                            IdPhieuDanhGia = p != null ? p.Id : null,
                            IdDonVi = p != null && p.DonVi.HasValue ? p.DonVi.Value : (targetDonViId != Guid.Empty ? (Guid?)targetDonViId : null),
                            TenDonVi = department != null ? department.Name : "",
                            PhongBan = p != null ? p.PhongBan : phongBanStr,
                            TenPhongBan = phongBanDept != null ? phongBanDept.Name : "",

                            IdBoTieuChiChung = boTieuChiChung != null ? boTieuChiChung.Id : (defaultBoTieuChiChung != null ? defaultBoTieuChiChung.Id : dot.DefaultTieuChiChung),
                            TenBoTieuChiChung = boTieuChiChung != null ? boTieuChiChung.TenBoTieuChiDonVi : (defaultBoTieuChiChung != null ? defaultBoTieuChiChung.TenBoTieuChiDonVi : ""),
                            IdBoTieuChiNhiemVu = boTieuChiDonVi != null ? boTieuChiDonVi.Id : (defaultBoTieuChiDonVi != null ? defaultBoTieuChiDonVi.Id : dot.DefaultTieuChiDonVi),
                            TenBoTieuChiNhiemVu = boTieuChiDonVi != null ? boTieuChiDonVi.TenBoTieuChiDonVi : (defaultBoTieuChiDonVi != null ? defaultBoTieuChiDonVi.TenBoTieuChiDonVi : ""),

                            DiemTieuChiChung = p != null ? p.DiemTieuChiChung : null,
                            DiemThucHienNhiemVu = p != null ? p.DiemThucHienNhiemVu : null,
                            TongDiem = p != null ? p.TongDiem : null,
                            ChatLuongTuDanhGia = p != null ? p.ChatLuongTuDanhGia : null,
                            TenChatLuongTuDanhGia = p != null ? LuongTapTheConstant.GetTenXepLoai(p.ChatLuongTuDanhGia) : null,
                            ChatLuongCapTrenDanhGia = p != null ? p.ChatLuongCapTrenDanhGia : null,
                            TenChatLuongCapTrenDanhGia = p != null ? LuongTapTheConstant.GetTenXepLoai(p.ChatLuongCapTrenDanhGia) : null,

                            DaDanhGia = p != null,
                            ThoiGianTao = p != null ? p.CreatedDate : null,
                            TrangThai = p != null ? p.TrangThai : "",
                            Luong = p != null ? p.Luong : null,
                        };

            query = query.OrderByDescending(x => x.ThoiGianBatDau);

            if (isTabDot)
            {
                query = query.Where(x => x.TrangThaiDot == TrangThaiDotDanhGiaConstant.ACTIVE
                    || x.TrangThaiDot == "Đang hoạt động"
                    || x.IdPhieuDanhGia != null);
            }
            else
            {
                query = query.Where(x => x.IdPhieuDanhGia != null);

                if (search != null && search.IsXuLy.HasValue && search.IdNguoiXuLy.HasValue)
                {
                    var targetUserId = search.IdNguoiXuLy.Value;
                    if (search.IsXuLy.Value == true)
                    {
                        query = query.Where(x => queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia && (qt.IdNguoiXuLy == targetUserId || qt.IdNguoiGui == targetUserId) && qt.IsXuLy == true)
                            && !queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia && qt.IdNguoiXuLy == targetUserId && qt.IsXuLy == false));
                    }
                    else
                    {
                        query = query.Where(x => queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia && qt.IdNguoiXuLy == targetUserId && qt.IsXuLy == false)
                            || (x.IdDonVi == targetDonViId && (x.TrangThai == TrangThaiPhieuConstant.KhoiTao || x.TrangThai == TrangThaiPhieuConstant.TraVe)));
                    }
                }
                if (search != null && search.IsKhacHoanThanh.HasValue)
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
            }

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
                        query = query.Where(x => x.TenDonVi != null && EF.Functions.Like(x.TenDonVi, $"%{search.DonVi}%"));
                    }
                }
                if (search.IdDonVi.HasValue && search.IdDonVi.Value != Guid.Empty)
                {
                    query = query.Where(x => x.IdDonVi == search.IdDonVi.Value);
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

            var pagedResult = await PagedList<DotDanhGiaWithPhieuTapTheDto>.CreateAsync(query, search);
            foreach (var item in pagedResult.Items)
            {
                if (item.IdPhieuDanhGia.HasValue && item.Luong.HasValue)
                {
                    item.ButtonLuong = LuongTapTheConstant.GetButtonLuong(item.Luong.Value, item.TrangThai ?? TrangThaiPhieuConstant.KhoiTao);
                    item.IsShowButton = true;
                }
            }
            return pagedResult;
        }

        public async Task<PagedList<DotDanhGiaWithPhieuTapTheDto>> GetDanhSachDonViDanhGia(Guid userId, KPI_PhieuDanhGiaTapTheSearch search)
        {
            var queryQuaTrinh = _kpi_QuaTrinhXuLyPhieuDanhGiaService.GetQueryable();
            var phieuDanhGias = GetQueryable().Where(x => !x.IsDeleted);
            var dotDanhGias = _kPI_DotTheoDoiDanhGiaRepository.GetQueryable();
            var queryDepartment = _departmentRepository.GetQueryable();
            var queryDotDonVi = _kPI_DotDanhGia_DonViRepository.GetQueryable();
            var queryBtcChung = _kPI_BoTieuChiChungRepository.GetQueryable();
            var queryBtcDonVi = _kPI_BoTieuChiDonViRepository.GetQueryable();

            Guid idDotGuid = Guid.Empty;
            if (!string.IsNullOrEmpty(search?.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var parsedDot))
            {
                idDotGuid = parsedDot;
            }

            var hasConfiguredUnits = idDotGuid != Guid.Empty && await queryDotDonVi.AnyAsync(x => x.IdDotDanhGia == idDotGuid);

            IQueryable<DotDanhGiaWithPhieuTapTheDto> query;

            if (hasConfiguredUnits)
            {
                var configuredUnits = queryDotDonVi.Where(x => x.IdDotDanhGia == idDotGuid);

                query = from ddv in configuredUnits
                        join dot in dotDanhGias on ddv.IdDotDanhGia equals dot.Id into dotJ
                        from d in dotJ.DefaultIfEmpty()

                        join dv in queryDepartment on ddv.IdDonVi equals dv.Id into dvJ
                        from department in dvJ.DefaultIfEmpty()

                        join p in phieuDanhGias.Where(x => x.IdDotDanhGia == idDotGuid)
                        on ddv.IdDonVi equals p.DonVi into pJ
                        from phieu in pJ.DefaultIfEmpty()

                        join pb in queryDepartment on (phieu != null ? phieu.PhongBan : "") equals pb.Id.ToString() into pbJ
                        from phongBanDept in pbJ.DefaultIfEmpty()

                        join btc in queryBtcChung on ddv.IdBoTieuChiChung equals (Guid?)btc.Id into btcJoin
                        from boTieuChiChung in btcJoin.DefaultIfEmpty()

                        join btcDv in queryBtcDonVi on ddv.IdBoChiSoNhiemVu equals (Guid?)btcDv.Id into btcDvJoin
                        from boTieuChiDonVi in btcDvJoin.DefaultIfEmpty()

                        join defaultBtc in queryBtcChung on (d != null ? d.DefaultTieuChiChung : null) equals (Guid?)defaultBtc.Id into defaultBtcJoin
                        from defaultBoTieuChiChung in defaultBtcJoin.DefaultIfEmpty()

                        join defaultBtcDonVi in queryBtcDonVi on (d != null ? d.DefaultTieuChiDonVi : null) equals (Guid?)defaultBtcDonVi.Id into defaultBtcDonViJoin
                        from defaultBoTieuChiDonVi in defaultBtcDonViJoin.DefaultIfEmpty()

                        select new DotDanhGiaWithPhieuTapTheDto
                        {
                            IdDotDanhGia = d != null ? d.Id : ddv.IdDotDanhGia,
                            TenDotDanhGia = d != null ? d.TenDotTheoDoiDanhGia : "",
                            Thang = d != null ? d.Thang : null,
                            Quy = d != null ? d.Quy : null,
                            Nam = d != null ? d.Nam : null,
                            ThoiGianBatDau = d != null ? d.ThoiGianBatDau : null,
                            ThoiGianKetThuc = d != null ? d.ThoiGianKetThuc : null,
                            TrangThaiDot = d != null ? d.TrangThai : "",

                            IdPhieuDanhGia = phieu != null ? phieu.Id : null,
                            IdDonVi = ddv.IdDonVi,
                            TenDonVi = department != null ? department.Name : "",
                            PhongBan = phieu != null ? phieu.PhongBan : null,
                            TenPhongBan = phongBanDept != null ? phongBanDept.Name : (phieu != null ? phieu.PhongBan : null),

                            IdBoTieuChiChung = boTieuChiChung != null ? boTieuChiChung.Id : (defaultBoTieuChiChung != null ? defaultBoTieuChiChung.Id : (d != null ? d.DefaultTieuChiChung : null)),
                            TenBoTieuChiChung = boTieuChiChung != null ? boTieuChiChung.TenBoTieuChiDonVi : (defaultBoTieuChiChung != null ? defaultBoTieuChiChung.TenBoTieuChiDonVi : ""),
                            IdBoTieuChiNhiemVu = boTieuChiDonVi != null ? boTieuChiDonVi.Id : (defaultBoTieuChiDonVi != null ? defaultBoTieuChiDonVi.Id : (d != null ? d.DefaultTieuChiDonVi : null)),
                            TenBoTieuChiNhiemVu = boTieuChiDonVi != null ? boTieuChiDonVi.TenBoTieuChiDonVi : (defaultBoTieuChiDonVi != null ? defaultBoTieuChiDonVi.TenBoTieuChiDonVi : ""),

                            DiemTieuChiChung = phieu != null ? phieu.DiemTieuChiChung : null,
                            DiemThucHienNhiemVu = phieu != null ? phieu.DiemThucHienNhiemVu : null,
                            TongDiem = phieu != null ? phieu.TongDiem : null,
                            ChatLuongTuDanhGia = phieu != null ? phieu.ChatLuongTuDanhGia : null,
                            TenChatLuongTuDanhGia = phieu != null ? LuongTapTheConstant.GetTenXepLoai(phieu.ChatLuongTuDanhGia) : null,
                            ChatLuongCapTrenDanhGia = phieu != null ? phieu.ChatLuongCapTrenDanhGia : null,
                            TenChatLuongCapTrenDanhGia = phieu != null ? LuongTapTheConstant.GetTenXepLoai(phieu.ChatLuongCapTrenDanhGia) : null,

                            DaDanhGia = phieu != null,
                            ThoiGianTao = phieu != null ? phieu.CreatedDate : null,
                            TrangThai = phieu != null ? phieu.TrangThai : "",
                            Luong = phieu != null ? phieu.Luong : (int)LuongTapTheConstant.LuongTapTheType.LuongDonVi,
                        };
            }
            else
            {
                query = from p in phieuDanhGias
                        join dot in dotDanhGias on p.IdDotDanhGia equals dot.Id into dotJ
                        from d in dotJ.DefaultIfEmpty()

                        join dv in queryDepartment on p.DonVi equals dv.Id into dvJ
                        from department in dvJ.DefaultIfEmpty()

                        join pb in queryDepartment on p.PhongBan equals pb.Id.ToString() into pbJ
                        from phongBanDept in pbJ.DefaultIfEmpty()

                        join dotDvDv in queryDotDonVi
                        on new { IdDot = p.IdDotDanhGia ?? Guid.Empty, IdDonVi = p.DonVi ?? Guid.Empty } equals new { IdDot = dotDvDv.IdDotDanhGia, IdDonVi = dotDvDv.IdDonVi } into dotDvDvJoin
                        from ddvDv in dotDvDvJoin.DefaultIfEmpty()

                        join btc in queryBtcChung on ddvDv.IdBoTieuChiChung equals (Guid?)btc.Id into btcJoin
                        from boTieuChiChung in btcJoin.DefaultIfEmpty()

                        join btcDv in queryBtcDonVi on ddvDv.IdBoChiSoNhiemVu equals (Guid?)btcDv.Id into btcDvJoin
                        from boTieuChiDonVi in btcDvJoin.DefaultIfEmpty()

                        join defaultBtc in queryBtcChung on (d != null ? d.DefaultTieuChiChung : null) equals (Guid?)defaultBtc.Id into defaultBtcJoin
                        from defaultBoTieuChiChung in defaultBtcJoin.DefaultIfEmpty()

                        join defaultBtcDonVi in queryBtcDonVi on (d != null ? d.DefaultTieuChiDonVi : null) equals (Guid?)defaultBtcDonVi.Id into defaultBtcDonViJoin
                        from defaultBoTieuChiDonVi in defaultBtcDonViJoin.DefaultIfEmpty()

                        select new DotDanhGiaWithPhieuTapTheDto
                        {
                            IdDotDanhGia = d != null ? d.Id : Guid.Empty,
                            TenDotDanhGia = d != null ? d.TenDotTheoDoiDanhGia : "",
                            Thang = d != null ? d.Thang : null,
                            Quy = d != null ? d.Quy : null,
                            Nam = d != null ? d.Nam : null,
                            ThoiGianBatDau = d != null ? d.ThoiGianBatDau : null,
                            ThoiGianKetThuc = d != null ? d.ThoiGianKetThuc : null,
                            TrangThaiDot = d != null ? d.TrangThai : "",

                            IdPhieuDanhGia = p.Id,
                            IdDonVi = p.DonVi,
                            TenDonVi = department != null ? department.Name : "",
                            PhongBan = p.PhongBan,
                            TenPhongBan = phongBanDept != null ? phongBanDept.Name : p.PhongBan,

                            IdBoTieuChiChung = boTieuChiChung != null ? boTieuChiChung.Id : (defaultBoTieuChiChung != null ? defaultBoTieuChiChung.Id : (d != null ? d.DefaultTieuChiChung : null)),
                            TenBoTieuChiChung = boTieuChiChung != null ? boTieuChiChung.TenBoTieuChiDonVi : (defaultBoTieuChiChung != null ? defaultBoTieuChiChung.TenBoTieuChiDonVi : ""),
                            IdBoTieuChiNhiemVu = boTieuChiDonVi != null ? boTieuChiDonVi.Id : (defaultBoTieuChiDonVi != null ? defaultBoTieuChiDonVi.Id : (d != null ? d.DefaultTieuChiDonVi : null)),
                            TenBoTieuChiNhiemVu = boTieuChiDonVi != null ? boTieuChiDonVi.TenBoTieuChiDonVi : (defaultBoTieuChiDonVi != null ? defaultBoTieuChiDonVi.TenBoTieuChiDonVi : ""),

                            DiemTieuChiChung = p.DiemTieuChiChung,
                            DiemThucHienNhiemVu = p.DiemThucHienNhiemVu,
                            TongDiem = p.TongDiem,
                            ChatLuongTuDanhGia = p.ChatLuongTuDanhGia,
                            TenChatLuongTuDanhGia = LuongTapTheConstant.GetTenXepLoai(p.ChatLuongTuDanhGia),
                            ChatLuongCapTrenDanhGia = p.ChatLuongCapTrenDanhGia,
                            TenChatLuongCapTrenDanhGia = LuongTapTheConstant.GetTenXepLoai(p.ChatLuongCapTrenDanhGia),

                            DaDanhGia = true,
                            ThoiGianTao = p.CreatedDate,
                            TrangThai = p.TrangThai,
                            Luong = p.Luong,
                        };
            }

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotGuidSearch))
                {
                    query = query.Where(x => x.IdDotDanhGia == idDotGuidSearch);
                }
                if (search.IdDonVi.HasValue && search.IdDonVi.Value != Guid.Empty)
                {
                    query = query.Where(x => x.IdDonVi == search.IdDonVi.Value);
                }
                if (!string.IsNullOrEmpty(search.DonVi))
                {
                    if (Guid.TryParse(search.DonVi, out var donViGuidSearch))
                    {
                        query = query.Where(x => x.IdDonVi == donViGuidSearch);
                    }
                    else
                    {
                        query = query.Where(x => x.TenDonVi != null && EF.Functions.Like(x.TenDonVi, $"%{search.DonVi}%"));
                    }
                }
                if (search.IdPhongBan.HasValue && search.IdPhongBan.Value != Guid.Empty)
                {
                    query = query.Where(x => x.PhongBan == search.IdPhongBan.Value.ToString());
                }
                if (!string.IsNullOrEmpty(search.PhongBan))
                {
                    query = query.Where(x => (x.PhongBan != null && EF.Functions.Like(x.PhongBan, $"%{search.PhongBan}%"))
                        || (x.TenPhongBan != null && EF.Functions.Like(x.TenPhongBan, $"%{search.PhongBan}%")));
                }
                if (search.IsXuLy.HasValue)
                {
                    if (search.IsXuLy.Value)
                    {
                        query = query.Where(x => x.IdPhieuDanhGia.HasValue
                            && queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia.Value && (qt.IdNguoiXuLy == userId || qt.IdNguoiGui == userId) && qt.IsXuLy == true)
                            && !queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia.Value && qt.IdNguoiXuLy == userId && qt.IsXuLy == false));
                    }
                    else
                    {
                        query = query.Where(x => x.IdPhieuDanhGia.HasValue
                            && queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.IdPhieuDanhGia.Value && qt.IdNguoiXuLy == userId && qt.IsXuLy == false));
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
            }

            query = query.OrderBy(x => x.TenDonVi).ThenBy(x => x.TenPhongBan);
            var pagedResult = await PagedList<DotDanhGiaWithPhieuTapTheDto>.CreateAsync(query, search);

            var phieuIds = pagedResult.Items.Where(x => x.IdPhieuDanhGia.HasValue).Select(x => x.IdPhieuDanhGia!.Value).ToList();
            if (phieuIds.Any())
            {
                var capTrenScores = await (from ct in _kPI_TieuChiChung_DiemSo_CapTrenRepository.GetQueryable()
                                           join ds in _kPI_TieuChiChung_DiemSoRepository.GetQueryable() on ct.Id_TieuChiChung_DiemSo equals ds.Id
                                           where ct.Id_PhieuDanhGia.HasValue && phieuIds.Contains(ct.Id_PhieuDanhGia.Value)
                                           select new
                                           {
                                               IdPhieu = ct.Id_PhieuDanhGia.Value,
                                               Diem = ct.Diem,
                                               IdTieuChi = ds.IdTieuChiChung
                                           }).ToListAsync();

                Guid idNv1 = Guid.Parse("00000000-0000-0000-0000-000000000021");
                Guid idNv2 = Guid.Parse("00000000-0000-0000-0000-000000000022");
                Guid idNv3 = Guid.Parse("00000000-0000-0000-0000-000000000023");

                foreach (var item in pagedResult.Items)
                {
                    if (item.IdPhieuDanhGia.HasValue)
                    {
                        var phieuScores = capTrenScores.Where(x => x.IdPhieu == item.IdPhieuDanhGia.Value && x.Diem.HasValue).ToList();
                        if (phieuScores.Any())
                        {
                            var nvScore = phieuScores.Where(x => x.IdTieuChi == idNv1 || x.IdTieuChi == idNv2 || x.IdTieuChi == idNv3 || (x.IdTieuChi.HasValue && (x.IdTieuChi.Value.ToString().EndsWith("0106") || x.IdTieuChi.Value.ToString().EndsWith("0107") || x.IdTieuChi.Value.ToString().EndsWith("0108")))).Sum(x => x.Diem ?? 0);
                            var totalScore = phieuScores.Sum(x => x.Diem ?? 0);
                            var chungScore = totalScore - nvScore;

                            item.DiemCapTrenTongDiem = totalScore;
                            item.DiemCapTrenThucHienNhiemVu = nvScore;
                            item.DiemCapTrenTieuChiChung = chungScore;
                        }
                    }

                    if (item.Luong.HasValue)
                    {
                        item.ButtonLuong = LuongTapTheConstant.GetButtonLuong(item.Luong.Value, item.TrangThai ?? TrangThaiPhieuConstant.KhoiTao);
                    }
                }
            }
            else
            {
                foreach (var item in pagedResult.Items)
                {
                    if (item.Luong.HasValue)
                    {
                        item.ButtonLuong = LuongTapTheConstant.GetButtonLuong(item.Luong.Value, item.TrangThai ?? TrangThaiPhieuConstant.KhoiTao);
                    }
                }
            }

            return pagedResult;
        }

        public async Task<KPI_PhieuDanhGiaTapTheTabCountDto> GetTabCounts(Guid userId, KPI_PhieuDanhGiaTapTheSearch search)
        {
            var dotTapTheIds = _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                .Where(x => x.Type == LoaiDotDanhGiaConstant.TAP_THE
                         || x.Type == "TapThe"
                         || (x.Type == null && x.TenDotTheoDoiDanhGia != null && EF.Functions.ILike(x.TenDotTheoDoiDanhGia, "%tập thể%")))
                .Select(x => x.Id);

            var queryQuaTrinh = _kpi_QuaTrinhXuLyPhieuDanhGiaService.GetQueryable();
            var phieuQuery = GetQueryable().Where(x => !x.IsDeleted && x.IdDotDanhGia.HasValue && dotTapTheIds.Contains(x.IdDotDanhGia.Value));

            if (search != null && !string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotGuid))
            {
                phieuQuery = phieuQuery.Where(x => x.IdDotDanhGia == idDotGuid);
            }

            var choXuLyCount = await phieuQuery.CountAsync(x =>
                queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.Id && qt.IdNguoiXuLy == userId && qt.IsXuLy == false));

            var daXuLyCount = await phieuQuery.CountAsync(x =>
                queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.Id && (qt.IdNguoiXuLy == userId || qt.IdNguoiGui == userId) && qt.IsXuLy == true)
                && !queryQuaTrinh.Any(qt => qt.IdPhieuDanhGia == x.Id && qt.IdNguoiXuLy == userId && qt.IsXuLy == false));

            var hoanThanhCount = await phieuQuery.CountAsync(x => x.TrangThai == TrangThaiPhieuConstant.DaDuyet);
            var tatCaCount = await phieuQuery.CountAsync();

            return new KPI_PhieuDanhGiaTapTheTabCountDto
            {
                ChoXuLy = choXuLyCount,
                DaXuLy = daXuLyCount,
                HoanThanh = hoanThanhCount,
                TatCa = tatCaCount
            };
        }

        public async Task<bool> ChuyenBuocLuong(ChuyenBuocLuongRequest request)
        {
            if (request == null || request.IdPhieuDanhGia == Guid.Empty)
                throw new Exception("Phiếu đánh giá tập thể không hợp lệ.");

            if (request.IdNguoiGui == Guid.Empty)
                throw new Exception("Không xác định được người gửi phiếu đánh giá.");

            var phieu = await GetByIdAsync(request.IdPhieuDanhGia);
            if (phieu == null)
                throw new Exception("Phiếu đánh giá tập thể không tồn tại.");

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

                phieu.TrangThai = TrangThaiPhieuConstant.TraVe;
                await UpdateAsync(phieu);

                var newQuaTrinhTraVe = new KPI_QuaTrinhXuLyPhieuDanhGia
                {
                    IdPhieuDanhGia = request.IdPhieuDanhGia,
                    TrangThai = TrangThaiPhieuConstant.TraVe,
                    IdNguoiGui = request.IdNguoiGui,
                    IdNguoiXuLy = phieu.CreatedId ?? Guid.Empty,
                    IsXuLy = false,
                    GhiChu = request.GhiChu
                };

                await _kpi_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(newQuaTrinhTraVe);
                return true;
            }

            var luong = phieu.Luong ?? (int)LuongTapTheConstant.LuongTapTheType.LuongPhongBan;
            var buttonLuong = LuongTapTheConstant.GetButtonLuong(luong, phieu.TrangThai ?? TrangThaiPhieuConstant.KhoiTao);

            if (buttonLuong == null)
                throw new Exception("Không thể chuyển bước luồng cho phiếu tập thể này.");

            if (buttonLuong.CanChonNguoiXuLy && (!request.IdNguoiXuLy.HasValue || request.IdNguoiXuLy.Value == Guid.Empty))
                throw new Exception("Vui lòng chọn người xử lý cho bước tiếp theo.");

            if (quaTrinhHienTai != null)
            {
                quaTrinhHienTai.IsXuLy = true;
                await _kpi_QuaTrinhXuLyPhieuDanhGiaService.UpdateAsync(quaTrinhHienTai);
            }

            phieu.TrangThai = buttonLuong.TrangThaiTiepTheo;
            await UpdateAsync(phieu);

            var newQuaTrinh = new KPI_QuaTrinhXuLyPhieuDanhGia
            {
                IdPhieuDanhGia = request.IdPhieuDanhGia,
                TrangThai = buttonLuong.TrangThaiTiepTheo,
                IdNguoiGui = request.IdNguoiGui,
                IdNguoiXuLy = request.IdNguoiXuLy ?? Guid.Empty,
                IsXuLy = buttonLuong.TrangThaiTiepTheo == TrangThaiPhieuConstant.DaDuyet,
                GhiChu = request.GhiChu
            };

            await _kpi_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(newQuaTrinh);
            return true;
        }

        public async Task<bool> ThuHoiPhieu(ThuHoiPhieuRequest request)
        {
            var phieu = await GetByIdAsync(request.IdPhieuDanhGia);
            if (phieu == null)
                throw new Exception("Phiếu đánh giá tập thể không tồn tại.");

            if (phieu.TrangThai == TrangThaiPhieuConstant.DaDuyet)
                throw new Exception("Không thể thu hồi phiếu tập thể đã được phê duyệt hoàn tất.");

            if (phieu.TrangThai == TrangThaiPhieuConstant.KhoiTao || phieu.TrangThai == TrangThaiPhieuConstant.TraVe || string.IsNullOrEmpty(phieu.TrangThai))
                throw new Exception("Phiếu đang ở trạng thái chỉnh sửa, không cần thu hồi.");

            var quaTrinhChoXuLy = await _kpi_QuaTrinhXuLyPhieuDanhGiaService
                .GetQueryable()
                .Where(x => x.IdPhieuDanhGia == request.IdPhieuDanhGia && x.IsXuLy == false)
                .OrderByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            if (quaTrinhChoXuLy != null)
            {
                quaTrinhChoXuLy.IsXuLy = true;
                await _kpi_QuaTrinhXuLyPhieuDanhGiaService.UpdateAsync(quaTrinhChoXuLy);
            }

            phieu.TrangThai = TrangThaiPhieuConstant.KhoiTao;
            await UpdateAsync(phieu);

            var newQuaTrinhThuHoi = new KPI_QuaTrinhXuLyPhieuDanhGia
            {
                IdPhieuDanhGia = request.IdPhieuDanhGia,
                TrangThai = TrangThaiPhieuConstant.ThuHoi,
                IdNguoiGui = request.IdNguoiThuHoi,
                IdNguoiXuLy = request.IdNguoiThuHoi,
                IsXuLy = true,
                GhiChu = request.GhiChu
            };

            await _kpi_QuaTrinhXuLyPhieuDanhGiaService.CreateAsync(newQuaTrinhThuHoi);
            return true;
        }

        public async Task<List<NguoiXuLyDto>> GetNguoiXuLyTheoChucVu(Guid idPhieuDanhGia, string chucVuNguoiXuLy)
        {
            var phieu = await GetByIdAsync(idPhieuDanhGia);
            if (phieu == null) return new List<NguoiXuLyDto>();

            // Trường hợp đặc biệt: gửi cho QLNS Đơn vị của Vụ TCCB
            if (chucVuNguoiXuLy == "QLNS_VuTCCB")
            {
                return await GetQLNSVuTCCBAsync();
            }

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
                    danhSachChucVu = ChucVuConstant.ChucVuPhoVuTruong;
                    break;
                case "VuTruong":
                    danhSachChucVu = ChucVuConstant.ChucVuVuTruong;
                    break;
                default:
                    danhSachChucVu = new List<string> { chucVuNguoiXuLy };
                    break;
            }

            var danhSachChucVuLower = danhSachChucVu.Select(c => c.ToLower()).ToList();

            var queryLyLich = _lyLich2CRepository.GetQueryable()
                .Where(x => x.ChucVuHienTai != null && danhSachChucVuLower.Contains(x.ChucVuHienTai.ToLower()));

            if (phieu.DonVi.HasValue && phieu.DonVi.Value != Guid.Empty)
            {
                queryLyLich = queryLyLich.Where(x => x.DonViSuDungId == phieu.DonVi.Value);
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
                             HoTen = lylichTbl.HoTen + (userInfo != null ? " (" + userInfo.UserName + ")" : ""),
                             ChucVu = chucVuInfo != null ? chucVuInfo.Name : lylichTbl.ChucVuHienTai,
                         };

            return await result.ToListAsync();
        }

        /// <summary>
        /// Tìm tài khoản người xử lý theo Role (QLNS_DonVi, QLNS_TCCB) và Phòng ban / Đơn vị (Vụ TCCB).
        /// </summary>
        private async Task<List<NguoiXuLyDto>> GetQLNSVuTCCBAsync()
        {
            // 1. Xác định Đơn vị / Phòng ban Vụ TCCB
            var vuTCCBDepartmentIds = await _departmentRepository.GetQueryable()
                .Where(x => x.Code == "VU_TCCB"
                         || (x.Name != null && (EF.Functions.ILike(x.Name, "%TCCB%")
                         || EF.Functions.ILike(x.Name, "%tổ chức cán bộ%")
                         || EF.Functions.ILike(x.Name, "%to chuc can bo%"))))
                .Select(x => x.Id)
                .ToListAsync();

            if (!vuTCCBDepartmentIds.Any())
                return new List<NguoiXuLyDto>();

            // 2. Xác định Role QLNS Đơn vị / QLNS TCCB
            var qlnsRoleIds = await _roleRepository.GetQueryable()
                .Where(x => x.Code == "QLNS_DonVi" || x.Code == "QLNS_TCCB")
                .Select(x => x.Id)
                .ToListAsync();

            if (!qlnsRoleIds.Any())
                return new List<NguoiXuLyDto>();

            // 3. Tìm các UserRole có Role thuộc qlnsRoleIds và gán cho Đơn vị Vụ TCCB (hoặc toàn cục)
            var userRolesQuery = _userRoleRepository.GetQueryable()
                .Where(x => qlnsRoleIds.Contains(x.RoleId)
                         && (vuTCCBDepartmentIds.Contains(x.DepartmentId) || x.DepartmentId == Guid.Empty));

            var userQuery = _aspNetUsersRepository.GetQueryable().Where(x => !x.IsDeleted);

            // 4. Lấy người dùng thuộc phân quyền Role và Đơn vị Vụ TCCB
            var query = from ur in userRolesQuery
                        join u in userQuery on ur.UserId equals u.Id
                        where (u.DonViId.HasValue && vuTCCBDepartmentIds.Contains(u.DonViId.Value))
                           || vuTCCBDepartmentIds.Contains(ur.DepartmentId)
                        select new NguoiXuLyDto
                        {
                            Id = u.Id,
                            HoTen = (u.Name ?? u.UserName ?? "") + (u.UserName != null ? " (" + u.UserName + ")" : ""),
                            ChucVu = "QLNS Đơn vị Vụ TCCB",
                        };

            var users = await query.Distinct().ToListAsync();
            return users;
        }

        public async Task<CheckQuyenChamDiemDto> CheckQuyenChamDiem(Guid? idPhieuDanhGia, Guid? donViId, Guid? idDotDanhGia, Guid? userId)
        {
            KPI_PhieuDanhGiaTapThe? phieu = null;
            if (idPhieuDanhGia.HasValue && idPhieuDanhGia.Value != Guid.Empty)
            {
                phieu = await GetByIdAsync(idPhieuDanhGia.Value);
            }
            else if (donViId.HasValue && idDotDanhGia.HasValue)
            {
                phieu = await GetQueryable().FirstOrDefaultAsync(x => x.DonVi == donViId && x.IdDotDanhGia == idDotDanhGia && !x.IsDeleted);
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

            bool isOwner = false;
            if (userId.HasValue && userId.Value != Guid.Empty)
            {
                var userLyLich = await _lyLich2CRepository.GetQueryable().FirstOrDefaultAsync(x => x.UserId == userId.Value);
                var userObj = await _aspNetUsersRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == userId.Value);
                var userDonViId = userLyLich?.DonViSuDungId ?? userObj?.DonViId;

                isOwner = (userDonViId.HasValue && phieu.DonVi.HasValue && userDonViId.Value == phieu.DonVi.Value)
                    || (phieu.CreatedId.HasValue && phieu.CreatedId.Value == userId.Value);
            }

            bool canEdit = isOwner && (phieu.TrangThai == TrangThaiPhieuConstant.KhoiTao || phieu.TrangThai == TrangThaiPhieuConstant.TraVe || string.IsNullOrEmpty(phieu.TrangThai));

            if (!canEdit && userId.HasValue)
            {
                var dangChoXuLy = await _kpi_QuaTrinhXuLyPhieuDanhGiaService.GetQueryable()
                    .AnyAsync(x => x.IdPhieuDanhGia == phieu.Id && x.IdNguoiXuLy == userId.Value && x.IsXuLy == false);
                if (dangChoXuLy)
                {
                    canEdit = true;
                }
            }

            return new CheckQuyenChamDiemDto
            {
                IsOwner = isOwner,
                CanEdit = canEdit,
                TrangThai = phieu.TrangThai
            };
        }

        public async Task<List<KPI_TieuChiTapTheTreeDto>> GetTreeDataForTapThe(Guid idDot, Guid? idPhieu, Guid? idDonVi)
        {
            KPI_PhieuDanhGiaTapThe? phieu = null;
            if (idPhieu.HasValue && idPhieu.Value != Guid.Empty)
            {
                phieu = await GetByIdAsync(idPhieu.Value);
            }

            var targetDonViId = phieu?.DonVi ?? idDonVi;

            // 1. Lấy thông tin đợt
            var dot = await _kPI_DotTheoDoiDanhGiaRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idDot);

            // 2. Lấy bộ tiêu chí chung áp dụng động (giống hệt quy tắc của GetBoTieuChiChungApDungForDot)
            var boTieuChiChungApDung = await _kpi_TieuChiChungService.GetBoTieuChiChungApDungForDot(idDot, null, phieu?.Id, targetDonViId);

            // 3. Lấy cây tiêu chí chung động
            var tieuChiChungTree = new List<Hinet.Service.KPI_TieuChiChungService.Dto.KPI_TieuChiChungTreeDto>();
            if (boTieuChiChungApDung != null && boTieuChiChungApDung.IdBoTieuChiChung != Guid.Empty)
            {
                tieuChiChungTree = await _kpi_TieuChiChungService.GetTreeDataForBoTieuChiChung(boTieuChiChungApDung.IdBoTieuChiChung);
            }

            if (tieuChiChungTree.Count == 0)
            {
                var fallbackTapTheBtcId = await _kPI_BoTieuChiChungRepository.GetQueryable()
                    .Where(x => !x.IsDeleted && (x.Type == "TapThe" || (x.TenBoTieuChiDonVi != null && EF.Functions.Like(x.TenBoTieuChiDonVi.ToLower(), "%tập thể%"))))
                    .OrderByDescending(x => x.IsActive)
                    .ThenByDescending(x => x.CreatedDate)
                    .Select(x => (Guid?)x.Id)
                    .FirstOrDefaultAsync();

                if (fallbackTapTheBtcId.HasValue)
                {
                    tieuChiChungTree = await _kpi_TieuChiChungService.GetTreeDataForBoTieuChiChung(fallbackTapTheBtcId.Value);
                    if (tieuChiChungTree.Count > 0)
                    {
                        var tenBtc = await _kPI_BoTieuChiChungRepository.GetQueryable()
                            .Where(x => x.Id == fallbackTapTheBtcId.Value)
                            .Select(x => x.TenBoTieuChiDonVi)
                            .FirstOrDefaultAsync();
                        boTieuChiChungApDung = new Hinet.Service.KPI_TieuChiChungService.Dto.KPI_BoTieuChiChungApDungDto
                        {
                            IdBoTieuChiChung = fallbackTapTheBtcId.Value,
                            TenBoTieuChiChung = tenBtc
                        };
                    }
                }
            }

            // 4. Lấy điểm tự chấm và cấp trên chấm đã lưu nếu có phiếu
            var diemTuChamMap = new Dictionary<Guid, decimal?>();
            var diemCapTrenMap = new Dictionary<Guid, decimal?>();
            var ghiChuMap = new Dictionary<Guid, string?>();

            if (idPhieu.HasValue && idPhieu.Value != Guid.Empty)
            {
                var diemSoList = await _kPI_TieuChiChung_DiemSoRepository.GetQueryable()
                    .Where(x => x.IdPhieuDanhGia == idPhieu.Value && x.IdTieuChiChung.HasValue)
                    .ToListAsync();

                var diemSoIds = diemSoList.Select(x => x.Id).ToList();
                var capTrenList = await _kPI_TieuChiChung_DiemSo_CapTrenRepository.GetQueryable()
                    .Where(x => diemSoIds.Contains(x.Id_TieuChiChung_DiemSo))
                    .ToListAsync();

                foreach (var ds in diemSoList)
                {
                    diemTuChamMap[ds.IdTieuChiChung!.Value] = ds.DiemTuCham;
                    var ct = capTrenList.FirstOrDefault(x => x.Id_TieuChiChung_DiemSo == ds.Id);
                    if (ct != null)
                    {
                        diemCapTrenMap[ds.IdTieuChiChung!.Value] = ct.Diem;
                        ghiChuMap[ds.IdTieuChiChung!.Value] = ct.GhiChu;
                    }
                }
            }

            // 5. Xác định bộ tiêu chí nhiệm vụ áp dụng
            Guid? idBoTieuChiNhiemVu = null;
            string? tenBoTieuChiNhiemVu = null;
            if (targetDonViId.HasValue && targetDonViId.Value != Guid.Empty)
            {
                var cauHinh = await _kPI_DotDanhGia_DonViRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdDotDanhGia == idDot && x.IdDonVi == targetDonViId.Value);
                if (cauHinh?.IdBoChiSoNhiemVu.HasValue == true && cauHinh.IdBoChiSoNhiemVu.Value != Guid.Empty)
                {
                    idBoTieuChiNhiemVu = cauHinh.IdBoChiSoNhiemVu.Value;
                }
            }
            if (!idBoTieuChiNhiemVu.HasValue || idBoTieuChiNhiemVu == Guid.Empty)
            {
                idBoTieuChiNhiemVu = dot?.DefaultTieuChiDonVi;
            }
            if (idBoTieuChiNhiemVu.HasValue && idBoTieuChiNhiemVu.Value != Guid.Empty)
            {
                tenBoTieuChiNhiemVu = await _kPI_BoTieuChiDonViRepository.GetQueryable()
                    .Where(x => x.Id == idBoTieuChiNhiemVu.Value)
                    .Select(x => x.TenBoTieuChiDonVi)
                    .FirstOrDefaultAsync();
            }

            // 6. Chuyển đổi cây tiêu chí chung sang DTO tập thể
            KPI_TieuChiTapTheTreeDto ConvertNode(Hinet.Service.KPI_TieuChiChungService.Dto.KPI_TieuChiChungTreeDto src)
            {
                diemTuChamMap.TryGetValue(src.Id, out var diemTuCham);
                diemCapTrenMap.TryGetValue(src.Id, out var diemCapTren);
                ghiChuMap.TryGetValue(src.Id, out var ghiChu);

                var dest = new KPI_TieuChiTapTheTreeDto
                {
                    Id = src.Id,
                    Ten = src.Ten,
                    ParentId = src.ParentId,
                    DiemToiDa = src.MyProperty,
                    Priority = src.Priority,
                    Stt = src.Stt,
                    IdBoTieuChi = src.IdBoTieuChiChung,
                    TenBoTieuChi = boTieuChiChungApDung?.TenBoTieuChiChung,
                    DiemTuCham = diemTuCham ?? src.DiemTuCham,
                    DiemCapTren = diemCapTren,
                    GhiChu = ghiChu,
                    Children = new List<KPI_TieuChiTapTheTreeDto>()
                };

                if (src.Children != null)
                {
                    foreach (var c in src.Children)
                    {
                        dest.Children.Add(ConvertNode(c));
                    }
                }
                return dest;
            }

            var resultTree = new List<KPI_TieuChiTapTheTreeDto>();

            // Kiểm tra xem bộ tiêu chí chung đã có đủ 2 phần (Chung + Nhiệm vụ) hay chưa
            bool hasNhiemVuSection = tieuChiChungTree.Any(x => x.Ten != null && x.Ten.ToLower().Contains("nhiệm vụ"));

            if (hasNhiemVuSection)
            {
                foreach (var node in tieuChiChungTree)
                {
                    resultTree.Add(ConvertNode(node));
                }
            }
            else
            {
                // Bộ tiêu chí chung chỉ gồm phần Tiêu chí chung (30 điểm).
                // Ta gom các nhóm tiêu chí chung lại dưới mục: "I. TIÊU CHÍ CHUNG"
                var sectionChung = new KPI_TieuChiTapTheTreeDto
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                    Ten = "TIÊU CHÍ CHUNG",
                    Stt = "I",
                    DiemToiDa = 30,
                    TenBoTieuChi = boTieuChiChungApDung?.TenBoTieuChiChung,
                    Children = new List<KPI_TieuChiTapTheTreeDto>()
                };

                for (int i = 0; i < tieuChiChungTree.Count; i++)
                {
                    var converted = ConvertNode(tieuChiChungTree[i]);
                    converted.Stt = (i + 1).ToString();
                    sectionChung.Children.Add(converted);
                }
                resultTree.Add(sectionChung);

                // Thêm mục: "II. TIÊU CHÍ VỀ KẾT QUẢ THỰC HIỆN NHIỆM VỤ" (70 điểm)
                Guid idNv1 = Guid.Parse("00000000-0000-0000-0000-000000000021");
                Guid idNv2 = Guid.Parse("00000000-0000-0000-0000-000000000022");
                Guid idNv3 = Guid.Parse("00000000-0000-0000-0000-000000000023");

                diemTuChamMap.TryGetValue(idNv1, out var tc1);
                diemTuChamMap.TryGetValue(idNv2, out var tc2);
                diemTuChamMap.TryGetValue(idNv3, out var tc3);

                diemCapTrenMap.TryGetValue(idNv1, out var ct1);
                diemCapTrenMap.TryGetValue(idNv2, out var ct2);
                diemCapTrenMap.TryGetValue(idNv3, out var ct3);

                var sectionNhiemVu = new KPI_TieuChiTapTheTreeDto
                {
                    Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                    Ten = "TIÊU CHÍ VỀ KẾT QUẢ THỰC HIỆN NHIỆM VỤ",
                    Stt = "II",
                    DiemToiDa = 70,
                    TenBoTieuChi = tenBoTieuChiNhiemVu,
                    Children = new List<KPI_TieuChiTapTheTreeDto>
                    {
                        new KPI_TieuChiTapTheTreeDto
                        {
                            Id = idNv1,
                            Ten = "Khối lượng kết quả thực hiện nhiệm vụ",
                            Stt = "1",
                            DiemToiDa = 25,
                            TenBoTieuChi = tenBoTieuChiNhiemVu,
                            DiemTuCham = tc1,
                            DiemCapTren = ct1
                        },
                        new KPI_TieuChiTapTheTreeDto
                        {
                            Id = idNv2,
                            Ten = "Chất lượng kết quả thực hiện nhiệm vụ",
                            Stt = "2",
                            DiemToiDa = 25,
                            TenBoTieuChi = tenBoTieuChiNhiemVu,
                            DiemTuCham = tc2,
                            DiemCapTren = ct2
                        },
                        new KPI_TieuChiTapTheTreeDto
                        {
                            Id = idNv3,
                            Ten = "Tiến độ thực hiện nhiệm vụ",
                            Stt = "3",
                            DiemToiDa = 20,
                            TenBoTieuChi = tenBoTieuChiNhiemVu,
                            DiemTuCham = tc3,
                            DiemCapTren = ct3
                        }
                    }
                };
                resultTree.Add(sectionNhiemVu);
            }

            return resultTree;
        }

        public async Task<bool> SaveScoresTapThe(SaveScoresTapTheVM model, Guid currentUserId)
        {
            if (model == null || model.IdPhieuDanhGia == Guid.Empty)
                return false;

            var phieu = await GetByIdAsync(model.IdPhieuDanhGia);
            if (phieu == null)
                return false;

            // 1. Cập nhật điểm tổng và xếp loại trên phiếu
            if (model.DiemTieuChiChung.HasValue) phieu.DiemTieuChiChung = model.DiemTieuChiChung;
            if (model.DiemThucHienNhiemVu.HasValue) phieu.DiemThucHienNhiemVu = model.DiemThucHienNhiemVu;
            if (model.TongDiem.HasValue) phieu.TongDiem = model.TongDiem;
            if (model.ChatLuongTuDanhGia.HasValue) phieu.ChatLuongTuDanhGia = model.ChatLuongTuDanhGia;
            if (model.ChatLuongCapTrenDanhGia.HasValue) phieu.ChatLuongCapTrenDanhGia = model.ChatLuongCapTrenDanhGia;
            phieu.UpdatedDate = DateTime.Now;
            phieu.UpdatedId = currentUserId;
            await UpdateAsync(phieu);

            // 2. Lưu chi tiết điểm từng tiêu chí
            if (model.Scores != null && model.Scores.Count > 0)
            {
                var existingScores = await _kPI_TieuChiChung_DiemSoRepository.GetQueryable()
                    .Where(x => x.IdPhieuDanhGia == phieu.Id)
                    .ToListAsync();

                var diemSoIds = existingScores.Select(x => x.Id).ToList();
                var existingCapTren = await _kPI_TieuChiChung_DiemSo_CapTrenRepository.GetQueryable()
                    .Where(x => diemSoIds.Contains(x.Id_TieuChiChung_DiemSo))
                    .ToListAsync();

                foreach (var item in model.Scores)
                {
                    if (item.IdTieuChi == Guid.Empty) continue;

                    var ds = existingScores.FirstOrDefault(x => x.IdTieuChiChung == item.IdTieuChi);
                    if (ds == null)
                    {
                        ds = new KPI_TieuChiChung_DiemSo
                        {
                            Id = Guid.NewGuid(),
                            IdDotDanhGia = phieu.IdDotDanhGia,
                            IdPhieuDanhGia = phieu.Id,
                            IdTieuChiChung = item.IdTieuChi,
                            DiemTuCham = item.DiemTuCham,
                            CreatedDate = DateTime.Now,
                            CreatedId = currentUserId,
                        };
                        _kPI_TieuChiChung_DiemSoRepository.Add(ds);
                    }
                    else
                    {
                        if (item.DiemTuCham.HasValue)
                        {
                            ds.DiemTuCham = item.DiemTuCham;
                            ds.UpdatedDate = DateTime.Now;
                            ds.UpdatedId = currentUserId;
                            _kPI_TieuChiChung_DiemSoRepository.Update(ds);
                        }
                    }

                    // Lưu điểm cấp trên nếu có
                    if (item.DiemCapTren.HasValue || !string.IsNullOrEmpty(item.GhiChu))
                    {
                        var ct = existingCapTren.FirstOrDefault(x => x.Id_TieuChiChung_DiemSo == ds.Id);
                        if (ct == null)
                        {
                            ct = new KPI_TieuChiChung_DiemSo_CapTren
                            {
                                Id = Guid.NewGuid(),
                                Id_TieuChiChung_DiemSo = ds.Id,
                                Id_PhieuDanhGia = phieu.Id,
                                Id_DotDanhGia = phieu.IdDotDanhGia,
                                Diem = item.DiemCapTren,
                                GhiChu = item.GhiChu,
                                CreatedDate = DateTime.Now,
                                CreatedId = currentUserId,
                            };
                            _kPI_TieuChiChung_DiemSo_CapTrenRepository.Add(ct);
                        }
                        else
                        {
                            ct.Diem = item.DiemCapTren;
                            if (item.GhiChu != null) ct.GhiChu = item.GhiChu;
                            ct.UpdatedDate = DateTime.Now;
                            ct.UpdatedId = currentUserId;
                            _kPI_TieuChiChung_DiemSo_CapTrenRepository.Update(ct);
                        }
                    }
                }

                await _kPI_TieuChiChung_DiemSoRepository.SaveAsync();
                await _kPI_TieuChiChung_DiemSo_CapTrenRepository.SaveAsync();
            }

            return true;
        }
    }
}
