using Hinet.Model.Entities;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.AppUserRepository;
using Hinet.Repository.RoleRepository;
using Hinet.Repository.UserRoleRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_LyLich2CService.Dto;
using Hinet.Service.KPI_LyLich2CService.Request;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Globalization;
using Hinet.Service.Constant;
using Hinet.Service.Common.IdentityClient;
using Microsoft.Extensions.Logging;

namespace Hinet.Service.KPI_LyLich2CService
{
    public class KPI_LyLich2CService : Service<KPI_LyLich2C>, IKPI_LyLich2CService
    {
        private readonly IKPI_LyLich2CRepository _kPI_LyLich2CRepository;
        private readonly IDM_DuLieuDanhMucRepository _dmDuLieuDanhMucRepository;
        private readonly IDM_NhomDanhMucRepository _dmNhomDanhMucRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IAppUserRepository _appUserRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IIdentityServiceClient _identityServiceClient;
        private readonly ILogger<KPI_LyLich2CService> _logger;

        public KPI_LyLich2CService(
            IKPI_LyLich2CRepository kPI_LyLich2CRepository,
            IDM_DuLieuDanhMucRepository dmDuLieuDanhMucRepository,
            IDM_NhomDanhMucRepository dmNhomDanhMucRepository,
            IDepartmentRepository departmentRepository,
            IAppUserRepository appUserRepository,
            IRoleRepository roleRepository,
            IUserRoleRepository userRoleRepository,
            IIdentityServiceClient identityServiceClient,
            ILogger<KPI_LyLich2CService> logger
            ) : base(kPI_LyLich2CRepository)
        {
            _kPI_LyLich2CRepository = kPI_LyLich2CRepository;
            _dmDuLieuDanhMucRepository = dmDuLieuDanhMucRepository;
            _dmNhomDanhMucRepository = dmNhomDanhMucRepository;
            _departmentRepository = departmentRepository;
            _appUserRepository = appUserRepository;
            _roleRepository = roleRepository;
            _userRoleRepository = userRoleRepository;
            _identityServiceClient = identityServiceClient;
            _logger = logger;
        }

        public async Task<PagedList<KPI_LyLich2CDto>> GetData(KPI_LyLich2CSearch search)
        {
            var nhomChucVuIds = _dmNhomDanhMucRepository.GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.ChucVu)
                .Select(x => x.Id);

            var dmChucVuQuery = _dmDuLieuDanhMucRepository.GetQueryable()
                .Where(x => x.GroupId.HasValue && nhomChucVuIds.Contains(x.GroupId.Value));

            var nhomTrinhDoIds = _dmNhomDanhMucRepository.GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.DM_TRINHDODAOTAO)
                .Select(x => x.Id);
            var dmTrinhDoQuery = _dmDuLieuDanhMucRepository.GetQueryable()
                .Where(x => x.GroupId.HasValue && nhomTrinhDoIds.Contains(x.GroupId.Value));

            var nhomLyLuanIds = _dmNhomDanhMucRepository.GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.LYLUANCT)
                .Select(x => x.Id);
            var dmLyLuanQuery = _dmDuLieuDanhMucRepository.GetQueryable()
                .Where(x => x.GroupId.HasValue && nhomLyLuanIds.Contains(x.GroupId.Value));

            var nhomLoaiHoSoIds = _dmNhomDanhMucRepository.GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.LoaiHoSo)
                .Select(x => x.Id);
            var dmLoaiHoSoQuery = _dmDuLieuDanhMucRepository.GetQueryable()
                .Where(x => x.GroupId.HasValue && nhomLoaiHoSoIds.Contains(x.GroupId.Value));

            var deptQuery = _departmentRepository.GetQueryable();
            var userQuery = _appUserRepository.GetQueryable();

            var query = from q in GetQueryable()
                        join cv in dmChucVuQuery on q.ChucVuHienTai equals cv.Code into cvJoin
                        from cv in cvJoin.DefaultIfEmpty()
                        join td in dmTrinhDoQuery on q.TrinhDoMax equals td.Code into tdJoin
                        from td in tdJoin.DefaultIfEmpty()
                        join ll in dmLyLuanQuery on q.LyLuanChinhTri equals ll.Code into llJoin
                        from ll in llJoin.DefaultIfEmpty()
                        join hd in dmLoaiHoSoQuery on q.LoaiHopDong equals hd.Code into hdJoin
                        from hd in hdJoin.DefaultIfEmpty()
                        join dv in deptQuery on q.DonViSuDungId equals dv.Id into dvJoin
                        from dv in dvJoin.DefaultIfEmpty()
                        join pb in deptQuery on q.PhongBanId equals pb.Id into pbJoin
                        from pb in pbJoin.DefaultIfEmpty()
                        join u in userQuery on q.UserId equals u.Id into uJoin
                        from u in uJoin.DefaultIfEmpty()
                        select new KPI_LyLich2CDto()
                        {
                            DonViSuDungId = q.DonViSuDungId,
                            PhongBanId = q.PhongBanId,
                            DonViSuDungName = dv != null ? dv.Name : null,
                            DonViSuDungPriority = dv != null ? dv.Priority : 999999,
                            PhongBanName = pb != null ? pb.Name : null,
                            PhongBanPriority = (q.PhongBanId == null || q.PhongBanId == Guid.Empty) ? -1 : (pb != null ? pb.Priority : 999999),
                            UserName = u != null ? u.UserName : null,
                            ChucVuHienTai = q.ChucVuHienTai,
                            ChucVuHienTaiName = cv != null ? cv.Name : q.ChucVuHienTai,
                            ChucVuHienTaiPriority = cv != null && cv.Priority.HasValue ? cv.Priority.Value : int.MaxValue,
                            TrinhDoMaxName = td != null ? td.Name : q.TrinhDoMax,
                            LyLuanChinhTriName = ll != null ? ll.Name : q.LyLuanChinhTri,
                            LoaiHopDongName = hd != null ? hd.Name : q.LoaiHopDong,
                            MaCanBo = q.MaCanBo,
                            UserId = q.UserId,
                            HoTen = q.HoTen,
                            Avatar = q.Avatar,
                            GioiTinh = q.GioiTinh,
                            SoHieuCCVC = q.SoHieuCCVC,
                            NgayBoNhiem = q.NgayBoNhiem,
                            NgayBoNhiemLai = q.NgayBoNhiemLai,
                            Ngaysinh = q.Ngaysinh,
                            Email = q.Email,
                            Status = q.Status,
                            TinhTrangHonNhan = q.TinhTrangHonNhan,
                            TenKhac = q.TenKhac,
                            Phone = q.Phone,
                            LoaiHopDong = q.LoaiHopDong,
                            SoCMND = q.SoCMND,
                            NgayCapCMND = q.NgayCapCMND,
                            NoiCapCMND = q.NoiCapCMND,
                            NoiSinhTinh = q.NoiSinhTinh,
                            NoiSinhXa = q.NoiSinhXa,
                            IsNoiSinh = q.IsNoiSinh,
                            NoiSinh = q.NoiSinh,
                            QueQuanGoc = q.QueQuanGoc,
                            QueQuanTinh = q.QueQuanTinh,
                            QueQuanXa = q.QueQuanXa,
                            QueQuan = q.QueQuan,
                            DanToc = q.DanToc,
                            TonGiao = q.TonGiao,
                            QuocTich = q.QuocTich,
                            HoKhauThuongTru_Tinh = q.HoKhauThuongTru_Tinh,
                            HoKhauThuongTru_Xa = q.HoKhauThuongTru_Xa,
                            NoiDangKyHKTT = q.NoiDangKyHKTT,
                            NoiOHienNay_Tinh = q.NoiOHienNay_Tinh,
                            NoiOHienNay_Xa = q.NoiOHienNay_Xa,
                            DiaChiHienTai = q.DiaChiHienTai,
                            CoQuanTuyenDung = q.CoQuanTuyenDung,
                            NgayTuyenDung = q.NgayTuyenDung,
                            NVaoCoQuanHienDangCongTac = q.NVaoCoQuanHienDangCongTac,
                            CongViecChinh = q.CongViecChinh,
                            SoTruongCongTac = q.SoTruongCongTac,
                            CongViecLamLauNhat = q.CongViecLamLauNhat,
                            ChucDanh = q.ChucDanh,
                            ChucDanhQuyHoach = q.ChucDanhQuyHoach,
                            LoaiHinhDaoTao = q.LoaiHinhDaoTao,
                            BoiDuongLanhDaoCapVu = q.BoiDuongLanhDaoCapVu,
                            QuanLyNN = q.QuanLyNN,
                            TrinhDoGiaoDucPhoThong = q.TrinhDoGiaoDucPhoThong,
                            TrinhDoMax = q.TrinhDoMax,
                            TrinhDo = q.TrinhDo,
                            ViTriViecLam = q.ViTriViecLam,
                            NoteTrinhDoCM = q.NoteTrinhDoCM,
                            LyLuanChinhTri = q.LyLuanChinhTri,
                            QuanLyNhaNuoc = q.QuanLyNhaNuoc,
                            QuanLyNganh = q.QuanLyNganh,
                            TinHoc = q.TinHoc,
                            ThongTinTinHoc = q.ThongTinTinHoc,
                            TiengAnh = q.TiengAnh,
                            ThongTinTiengAnh = q.ThongTinTiengAnh,
                            NgoaiNgu = q.NgoaiNgu,
                            ThongTinNgoaiNgu = q.ThongTinNgoaiNgu,
                            TiengDanToc = q.TiengDanToc,
                            ThongTinTiengDanToc = q.ThongTinTiengDanToc,
                            NgayVaoDang = q.NgayVaoDang,
                            NgayVaoDangChinhThucTxt = q.NgayVaoDangChinhThucTxt,
                            NoiKetNapDang = q.NoiKetNapDang,
                            ChucVuDangHienTai = q.ChucVuDangHienTai,
                            ChiBoSinhHoatDang = q.ChiBoSinhHoatDang,
                            DaiBieuHoiDongNhanDan = q.DaiBieuHoiDongNhanDan,
                            NgayVaoDoan = q.NgayVaoDoan,
                            NoiKetNapDoan = q.NoiKetNapDoan,
                            ChucVuDoan = q.ChucVuDoan,
                            NgayNhapNgu = q.NgayNhapNgu,
                            DanhHieuPhongTang = q.DanhHieuPhongTang,
                            DanhHieuMax = q.DanhHieuMax,
                            HocHam = q.HocHam,
                            NamPhongHocHam = q.NamPhongHocHam,
                            NamPhongChucDanhKhoaHoc = q.NamPhongChucDanhKhoaHoc,
                            ChuyenNganhHocHam = q.ChuyenNganhHocHam,
                            ChucDanhKhoaHoc = q.ChucDanhKhoaHoc,
                            LevelThuongBinh = q.LevelThuongBinh,
                            LaConGiaDinhChinhSach = q.LaConGiaDinhChinhSach,
                            SoBaoHiemXH = q.SoBaoHiemXH,
                            TPhanGiaDinhXuatThan = q.TPhanGiaDinhXuatThan,
                            TPhanBanThanXuatThan = q.TPhanBanThanXuatThan,
                            NgayThamGiaCachMang = q.NgayThamGiaCachMang,
                            DoiTuongChinhSach = q.DoiTuongChinhSach,
                            Luong = q.Luong,
                            NguonThuKhac = q.NguonThuKhac,
                            NhanXetDanhGia = q.NhanXetDanhGia,
                            NgayKyQuyetDinh = q.NgayKyQuyetDinh,
                            NgayHieuLuc = q.NgayHieuLuc,
                            LyDo = q.LyDo,
                            SoQuyetDinh = q.SoQuyetDinh,
                            NguoiKy = q.NguoiKy,
                            NgayHuongLuong = q.NgayHuongLuong,
                            MaNgach = q.MaNgach,
                            HeSoLuong = q.HeSoLuong,
                            BacLuong = q.BacLuong,
                            NgachCongVienChuc = q.NgachCongVienChuc,
                            IdBacLuong = q.IdBacLuong,
                            LoaiDieuChinhLuongLyLich = q.LoaiDieuChinhLuongLyLich,
                            LoaiLuong = q.LoaiLuong,
                            SoTienLuongThoaThuan = q.SoTienLuongThoaThuan,
                            NgayBoNhiemChucDanh = q.NgayBoNhiemChucDanh,
                            PhanTramHuong = q.PhanTramHuong,
                            NgayHuongPhuCapThamNienVuotKhung = q.NgayHuongPhuCapThamNienVuotKhung,
                            VuotKhung = q.VuotKhung,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        };
            if(search != null )
            {
                if(!string.IsNullOrEmpty(search.HoTen))
                {
                    query = query.Where(x => EF.Functions.Like(x.HoTen, $"%{search.HoTen}%"));
                }
                if(!string.IsNullOrEmpty(search.UserName))
                {
                    query = query.Where(x => x.UserName != null && EF.Functions.Like(x.UserName, $"%{search.UserName}%"));
                }
                if(!string.IsNullOrEmpty(search.TaiKhoan))
                {
                    query = query.Where(x => x.UserName != null && EF.Functions.Like(x.UserName, $"%{search.TaiKhoan}%"));
                }
                if(!string.IsNullOrEmpty(search.MaCanBo))
                {
                    query = query.Where(x => EF.Functions.Like(x.MaCanBo, $"%{search.MaCanBo}%"));
                }
                if(search.DonViSuDungId.HasValue)
                {
                    var departmentScopeIds = await GetDepartmentAndDescendantIdsAsync(search.DonViSuDungId.Value);

                    if (departmentScopeIds.Count > 0)
                    {
                        query = query.Where(x => departmentScopeIds.Contains(x.DonViSuDungId)
                                              || departmentScopeIds.Contains(x.PhongBanId));
                    }
                    else
                    {
                        query = query.Where(x => x.DonViSuDungId == search.DonViSuDungId.Value);
                    }
                }
                if(search.PhongBanId.HasValue)
                {
                    query = query.Where(x => x.PhongBanId == search.PhongBanId.Value);
                }
                if(!string.IsNullOrEmpty(search.Email))
                {
                    query = query.Where(x => EF.Functions.Like(x.Email, $"%{search.Email}%"));
                }
                if(!string.IsNullOrEmpty(search.Phone))
                {
                    query = query.Where(x => EF.Functions.Like(x.Phone, $"%{search.Phone}%"));
                }
                if(search.UserId.HasValue)
                {
                    query = query.Where(x => x.UserId == search.UserId.Value);
                }
                if(search.GioiTinh.HasValue)
                {
                    query = query.Where(x => x.GioiTinh == search.GioiTinh.Value);
                }
                if(search.RoleId.HasValue)
                {
                    var userIdsWithRole = from userRole in _userRoleRepository.GetQueryable()
                                          join role in _roleRepository.GetQueryable() on userRole.RoleId equals role.Id
                                          where role.Id == search.RoleId.Value
                                          select userRole.UserId;

                    query = query.Where(x => x.UserId.HasValue && userIdsWithRole.Contains(x.UserId.Value));
                }
                if(search.NgaysinhFrom.HasValue)
                {
                    var fromDate = search.NgaysinhFrom.Value.Date;
                    query = query.Where(x => x.Ngaysinh != null && x.Ngaysinh.Value >= fromDate);
                }
                if(search.NgaysinhTo.HasValue)
                {
                    var toDate = search.NgaysinhTo.Value.Date.AddDays(1).AddTicks(-1);
                    query = query.Where(x => x.Ngaysinh != null && x.Ngaysinh.Value <= toDate);
                }
                if(!string.IsNullOrEmpty(search.ChucVuHienTai))
                {
                    query = query.Where(x => (x.ChucVuHienTai != null && EF.Functions.Like(x.ChucVuHienTai, $"%{search.ChucVuHienTai}%"))
                                          || (x.ChucVuHienTaiName != null && EF.Functions.Like(x.ChucVuHienTaiName, $"%{search.ChucVuHienTai}%")));
                }
                if(!string.IsNullOrEmpty(search.TrinhDoMax))
                {
                    query = query.Where(x => (x.TrinhDoMax != null && EF.Functions.Like(x.TrinhDoMax, $"%{search.TrinhDoMax}%"))
                                          || (x.TrinhDoMaxName != null && EF.Functions.Like(x.TrinhDoMaxName, $"%{search.TrinhDoMax}%")));
                }
                if(!string.IsNullOrEmpty(search.LyLuanChinhTri))
                {
                    query = query.Where(x => (x.LyLuanChinhTri != null && EF.Functions.Like(x.LyLuanChinhTri, $"%{search.LyLuanChinhTri}%"))
                                          || (x.LyLuanChinhTriName != null && EF.Functions.Like(x.LyLuanChinhTriName, $"%{search.LyLuanChinhTri}%")));
                }
                if(!string.IsNullOrEmpty(search.LoaiHopDong))
                {
                    query = query.Where(x => (x.LoaiHopDong != null && EF.Functions.Like(x.LoaiHopDong, $"%{search.LoaiHopDong}%"))
                                          || (x.LoaiHopDongName != null && EF.Functions.Like(x.LoaiHopDongName, $"%{search.LoaiHopDong}%")));
                }
            }
            query = query
                .OrderBy(x => x.ChucVuHienTaiPriority)
                .ThenBy(x => x.DonViSuDungPriority)
                .ThenBy(x => x.PhongBanPriority)
                .ThenByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_LyLich2CDto>.CreateAsync(query, search);

            var userIds = result.Items
                .Where(x => x.UserId.HasValue && x.UserId.Value != Guid.Empty)
                .Select(x => x.UserId!.Value)
                .Distinct()
                .ToList();

            if (userIds.Count > 0)
            {
                var rolesByUser = await (
                    from userRole in _userRoleRepository.GetQueryable()
                    join role in _roleRepository.GetQueryable() on userRole.RoleId equals role.Id
                    where userIds.Contains(userRole.UserId)
                    select new { userRole.UserId, role.Code, role.Name }
                ).ToListAsync();

                foreach (var item in result.Items)
                {
                    if (!item.UserId.HasValue)
                    {
                        continue;
                    }

                    var roles = rolesByUser.Where(x => x.UserId == item.UserId.Value).ToList();
                    item.RoleCodes = roles.Select(x => x.Code).Distinct().ToList();
                    item.RoleNames = roles.Select(x => x.Name).Distinct().ToList();
                }
            }

            return result;
        }

        private async Task<HashSet<Guid>> GetDepartmentAndDescendantIdsAsync(Guid departmentId)
        {
            var departments = await _departmentRepository.GetQueryable()
                .Select(x => new { x.Id, x.ParentId })
                .ToListAsync();

            var result = new HashSet<Guid>();
            if (!departments.Any(x => x.Id == departmentId))
            {
                return result;
            }

            var childrenByParent = departments
                .Where(x => x.ParentId.HasValue)
                .GroupBy(x => x.ParentId!.Value)
                .ToDictionary(group => group.Key, group => group.Select(x => x.Id).ToList());

            var pending = new Stack<Guid>();
            pending.Push(departmentId);

            while (pending.Count > 0)
            {
                var currentId = pending.Pop();
                if (!result.Add(currentId) || !childrenByParent.TryGetValue(currentId, out var childIds))
                {
                    continue;
                }

                foreach (var childId in childIds)
                {
                    pending.Push(childId);
                }
            }

            return result;
        }

        public async Task<KPI_LyLich2CDto?> GetDto(Guid id)
        {
            var nhomChucVuIds = _dmNhomDanhMucRepository.GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.ChucVu)
                .Select(x => x.Id);

            var dmChucVuQuery = _dmDuLieuDanhMucRepository.GetQueryable()
                .Where(x => x.GroupId.HasValue && nhomChucVuIds.Contains(x.GroupId.Value));

            var nhomTrinhDoIds = _dmNhomDanhMucRepository.GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.DM_TRINHDODAOTAO)
                .Select(x => x.Id);
            var dmTrinhDoQuery = _dmDuLieuDanhMucRepository.GetQueryable()
                .Where(x => x.GroupId.HasValue && nhomTrinhDoIds.Contains(x.GroupId.Value));

            var nhomLyLuanIds = _dmNhomDanhMucRepository.GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.LYLUANCT)
                .Select(x => x.Id);
            var dmLyLuanQuery = _dmDuLieuDanhMucRepository.GetQueryable()
                .Where(x => x.GroupId.HasValue && nhomLyLuanIds.Contains(x.GroupId.Value));

            var nhomLoaiHoSoIds = _dmNhomDanhMucRepository.GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.LoaiHoSo)
                .Select(x => x.Id);
            var dmLoaiHoSoQuery = _dmDuLieuDanhMucRepository.GetQueryable()
                .Where(x => x.GroupId.HasValue && nhomLoaiHoSoIds.Contains(x.GroupId.Value));

            var deptQuery = _departmentRepository.GetQueryable();
            var userQuery = _appUserRepository.GetQueryable();

            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        join cv in dmChucVuQuery on q.ChucVuHienTai equals cv.Code into cvJoin
                        from cv in cvJoin.DefaultIfEmpty()
                        join td in dmTrinhDoQuery on q.TrinhDoMax equals td.Code into tdJoin
                        from td in tdJoin.DefaultIfEmpty()
                        join ll in dmLyLuanQuery on q.LyLuanChinhTri equals ll.Code into llJoin
                        from ll in llJoin.DefaultIfEmpty()
                        join hd in dmLoaiHoSoQuery on q.LoaiHopDong equals hd.Code into hdJoin
                        from hd in hdJoin.DefaultIfEmpty()
                        join dv in deptQuery on q.DonViSuDungId equals dv.Id into dvJoin
                        from dv in dvJoin.DefaultIfEmpty()
                        join pb in deptQuery on q.PhongBanId equals pb.Id into pbJoin
                        from pb in pbJoin.DefaultIfEmpty()
                        join u in userQuery on q.UserId equals u.Id into uJoin
                        from u in uJoin.DefaultIfEmpty()
                        select new KPI_LyLich2CDto()
                        {
                            DonViSuDungId = q.DonViSuDungId,
                            PhongBanId = q.PhongBanId,
                            DonViSuDungName = dv != null ? dv.Name : null,
                            PhongBanName = pb != null ? pb.Name : null,
                            UserName = u != null ? u.UserName : null,
                            ChucVuHienTai = q.ChucVuHienTai,
                            ChucVuHienTaiName = cv != null ? cv.Name : q.ChucVuHienTai,
                            TrinhDoMaxName = td != null ? td.Name : q.TrinhDoMax,
                            LyLuanChinhTriName = ll != null ? ll.Name : q.LyLuanChinhTri,
                            LoaiHopDongName = hd != null ? hd.Name : q.LoaiHopDong,
                            MaCanBo = q.MaCanBo,
                            UserId = q.UserId,
                            HoTen = q.HoTen,
                            Avatar = q.Avatar,
                            GioiTinh = q.GioiTinh,
                            SoHieuCCVC = q.SoHieuCCVC,
                            NgayBoNhiem = q.NgayBoNhiem,
                            NgayBoNhiemLai = q.NgayBoNhiemLai,
                            Ngaysinh = q.Ngaysinh,
                            Email = q.Email,
                            Status = q.Status,
                            TinhTrangHonNhan = q.TinhTrangHonNhan,
                            TenKhac = q.TenKhac,
                            Phone = q.Phone,
                            LoaiHopDong = q.LoaiHopDong,
                            SoCMND = q.SoCMND,
                            NgayCapCMND = q.NgayCapCMND,
                            NoiCapCMND = q.NoiCapCMND,
                            NoiSinhTinh = q.NoiSinhTinh,
                            NoiSinhXa = q.NoiSinhXa,
                            IsNoiSinh = q.IsNoiSinh,
                            NoiSinh = q.NoiSinh,
                            QueQuanGoc = q.QueQuanGoc,
                            QueQuanTinh = q.QueQuanTinh,
                            QueQuanXa = q.QueQuanXa,
                            QueQuan = q.QueQuan,
                            DanToc = q.DanToc,
                            TonGiao = q.TonGiao,
                            QuocTich = q.QuocTich,
                            HoKhauThuongTru_Tinh = q.HoKhauThuongTru_Tinh,
                            HoKhauThuongTru_Xa = q.HoKhauThuongTru_Xa,
                            NoiDangKyHKTT = q.NoiDangKyHKTT,
                            NoiOHienNay_Tinh = q.NoiOHienNay_Tinh,
                            NoiOHienNay_Xa = q.NoiOHienNay_Xa,
                            DiaChiHienTai = q.DiaChiHienTai,
                            CoQuanTuyenDung = q.CoQuanTuyenDung,
                            NgayTuyenDung = q.NgayTuyenDung,
                            NVaoCoQuanHienDangCongTac = q.NVaoCoQuanHienDangCongTac,
                            CongViecChinh = q.CongViecChinh,
                            SoTruongCongTac = q.SoTruongCongTac,
                            CongViecLamLauNhat = q.CongViecLamLauNhat,
                            ChucDanh = q.ChucDanh,
                            ChucDanhQuyHoach = q.ChucDanhQuyHoach,
                            LoaiHinhDaoTao = q.LoaiHinhDaoTao,
                            BoiDuongLanhDaoCapVu = q.BoiDuongLanhDaoCapVu,
                            QuanLyNN = q.QuanLyNN,
                            TrinhDoGiaoDucPhoThong = q.TrinhDoGiaoDucPhoThong,
                            TrinhDoMax = q.TrinhDoMax,
                            TrinhDo = q.TrinhDo,
                            ViTriViecLam = q.ViTriViecLam,
                            NoteTrinhDoCM = q.NoteTrinhDoCM,
                            LyLuanChinhTri = q.LyLuanChinhTri,
                            QuanLyNhaNuoc = q.QuanLyNhaNuoc,
                            QuanLyNganh = q.QuanLyNganh,
                            TinHoc = q.TinHoc,
                            ThongTinTinHoc = q.ThongTinTinHoc,
                            TiengAnh = q.TiengAnh,
                            ThongTinTiengAnh = q.ThongTinTiengAnh,
                            NgoaiNgu = q.NgoaiNgu,
                            ThongTinNgoaiNgu = q.ThongTinNgoaiNgu,
                            TiengDanToc = q.TiengDanToc,
                            ThongTinTiengDanToc = q.ThongTinTiengDanToc,
                            NgayVaoDang = q.NgayVaoDang,
                            NgayVaoDangChinhThucTxt = q.NgayVaoDangChinhThucTxt,
                            NoiKetNapDang = q.NoiKetNapDang,
                            ChucVuDangHienTai = q.ChucVuDangHienTai,
                            ChiBoSinhHoatDang = q.ChiBoSinhHoatDang,
                            DaiBieuHoiDongNhanDan = q.DaiBieuHoiDongNhanDan,
                            NgayVaoDoan = q.NgayVaoDoan,
                            NoiKetNapDoan = q.NoiKetNapDoan,
                            ChucVuDoan = q.ChucVuDoan,
                            NgayNhapNgu = q.NgayNhapNgu,
                            DanhHieuPhongTang = q.DanhHieuPhongTang,
                            DanhHieuMax = q.DanhHieuMax,
                            HocHam = q.HocHam,
                            NamPhongHocHam = q.NamPhongHocHam,
                            NamPhongChucDanhKhoaHoc = q.NamPhongChucDanhKhoaHoc,
                            ChuyenNganhHocHam = q.ChuyenNganhHocHam,
                            ChucDanhKhoaHoc = q.ChucDanhKhoaHoc,
                            LevelThuongBinh = q.LevelThuongBinh,
                            LaConGiaDinhChinhSach = q.LaConGiaDinhChinhSach,
                            SoBaoHiemXH = q.SoBaoHiemXH,
                            TPhanGiaDinhXuatThan = q.TPhanGiaDinhXuatThan,
                            TPhanBanThanXuatThan = q.TPhanBanThanXuatThan,
                            NgayThamGiaCachMang = q.NgayThamGiaCachMang,
                            DoiTuongChinhSach = q.DoiTuongChinhSach,
                            Luong = q.Luong,
                            NguonThuKhac = q.NguonThuKhac,
                            NhanXetDanhGia = q.NhanXetDanhGia,
                            NgayKyQuyetDinh = q.NgayKyQuyetDinh,
                            NgayHieuLuc = q.NgayHieuLuc,
                            LyDo = q.LyDo,
                            SoQuyetDinh = q.SoQuyetDinh,
                            NguoiKy = q.NguoiKy,
                            NgayHuongLuong = q.NgayHuongLuong,
                            MaNgach = q.MaNgach,
                            HeSoLuong = q.HeSoLuong,
                            BacLuong = q.BacLuong,
                            NgachCongVienChuc = q.NgachCongVienChuc,
                            IdBacLuong = q.IdBacLuong,
                            LoaiDieuChinhLuongLyLich = q.LoaiDieuChinhLuongLyLich,
                            LoaiLuong = q.LoaiLuong,
                            SoTienLuongThoaThuan = q.SoTienLuongThoaThuan,
                            NgayBoNhiemChucDanh = q.NgayBoNhiemChucDanh,
                            PhanTramHuong = q.PhanTramHuong,
                            NgayHuongPhuCapThamNienVuotKhung = q.NgayHuongPhuCapThamNienVuotKhung,
                            VuotKhung = q.VuotKhung,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        }).FirstOrDefaultAsync();
            
            return item;
        }

        public async Task<object> ImportExcelDirectAsync(IFormFile file, Guid donViSuDungId, int startRow = 2)
        {
            if (file == null || file.Length == 0)
            {
                return new
                {
                    status = false,
                    message = "Vui lòng chọn file Excel để import",
                    listTrue = new List<KPI_LyLich2C>(),
                    lstFalse = new List<object>(),
                    totalSuccess = 0,
                    totalFailed = 0
                };
            }

            var listTrue = new List<KPI_LyLich2C>();
            var lstFalse = new List<object>();

            var groupChucVu = await _dmNhomDanhMucRepository.GetQueryable().FirstOrDefaultAsync(x => x.GroupCode == DanhMucConstantBase.ChucVu);
            var listChucVuData = groupChucVu != null ? await _dmDuLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == groupChucVu.Id).ToListAsync() : new List<DM_DuLieuDanhMuc>();

            var groupTrinhDo = await _dmNhomDanhMucRepository.GetQueryable().FirstOrDefaultAsync(x => x.GroupCode == DanhMucConstantBase.DM_TRINHDODAOTAO);
            var listTrinhDoData = groupTrinhDo != null ? await _dmDuLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == groupTrinhDo.Id).ToListAsync() : new List<DM_DuLieuDanhMuc>();

            var groupLyLuan = await _dmNhomDanhMucRepository.GetQueryable().FirstOrDefaultAsync(x => x.GroupCode == DanhMucConstantBase.LYLUANCT);
            var listLyLuanData = groupLyLuan != null ? await _dmDuLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == groupLyLuan.Id).ToListAsync() : new List<DM_DuLieuDanhMuc>();

            var groupLoaiHoSo = await _dmNhomDanhMucRepository.GetQueryable().FirstOrDefaultAsync(x => x.GroupCode == DanhMucConstantBase.LoaiHoSo);
            var listLoaiHoSoData = groupLoaiHoSo != null ? await _dmDuLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == groupLoaiHoSo.Id).ToListAsync() : new List<DM_DuLieuDanhMuc>();

            var listDepartments = await _departmentRepository.GetQueryable().Where(x => !x.IsDeleted).ToListAsync();
            Guid? currentDonViId = null;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                    {
                        return new
                        {
                            status = false,
                            message = "File Excel không có dữ liệu hoặc không có worksheet",
                            listTrue = new List<KPI_LyLich2C>(),
                            lstFalse = new List<object>(),
                            totalSuccess = 0,
                            totalFailed = 0
                        };
                    }

                    int rowCount = worksheet.Dimension.Rows;
                    startRow = 8;
                    for (int row = startRow; row <= rowCount; row++)
                    {
                        string stt = worksheet.Cells[row, 2].Text?.Trim() ?? "";
                        string hoTen = worksheet.Cells[row, 3].Text?.Trim() ?? "";

                        // Kiểm tra nếu là dòng đơn vị (có tên nhưng không có STT số)
                        if (string.IsNullOrWhiteSpace(stt) && !string.IsNullOrWhiteSpace(hoTen))
                        {
                            string cleanDeptName = System.Text.RegularExpressions.Regex.Replace(hoTen, @"^[IVXLCDM]+\.\s*", "").Trim();
                            cleanDeptName = System.Text.RegularExpressions.Regex.Replace(cleanDeptName, @"\s*\(\d+\)$", "").Trim();
                            var matchDept = listDepartments.FirstOrDefault(x => x.Name.Trim().ToLower().Contains(cleanDeptName.ToLower()) || x.Code.Trim().ToLower() == cleanDeptName.ToLower());
                            if (matchDept != null)
                            {
                                currentDonViId = matchDept.Id;
                            }
                            else
                            {
                                currentDonViId = null;
                            }
                            continue;
                        }

                        // Bỏ qua dòng trống hoặc không có Họ Tên (không phải tiêu đề nhóm vì đã bị break ở trên)
                        if (string.IsNullOrWhiteSpace(hoTen) || string.IsNullOrWhiteSpace(stt))
                        {
                            continue;
                        }

                        string ngaySinhNam = worksheet.Cells[row, 4].Text?.Trim() ?? "";
                        string ngaySinhNu = worksheet.Cells[row, 6].Text?.Trim() ?? "";
                        
                        string chucVu = worksheet.Cells[row, 8].Text?.Trim();
                        if (!string.IsNullOrWhiteSpace(chucVu))
                        {
                            var dm = listChucVuData.FirstOrDefault(x => x.Name.Trim().ToLower() == chucVu.ToLower());
                            chucVu = dm?.Code;
                        }
                        else
                        {
                            chucVu = null;
                        }

                        string qlnn = worksheet.Cells[row, 9].Text?.Trim() ?? "";
                        string maNgach = worksheet.Cells[row, 10].Text?.Trim() ?? "";
                        string heSoLuongTxt = worksheet.Cells[row, 11].Text?.Trim() ?? "";
                        string thoiGianTinhNangBacLansau = worksheet.Cells[row, 12].Text?.Trim() ?? "";
                        
                        string trinhDoMax = worksheet.Cells[row, 13].Text?.Trim();
                        if (!string.IsNullOrWhiteSpace(trinhDoMax))
                        {
                            var dm = listTrinhDoData.FirstOrDefault(x => x.Name.Trim().ToLower() == trinhDoMax.ToLower());
                            trinhDoMax = dm?.Code;
                        }
                        else
                        {
                            trinhDoMax = null;
                        }

                        string lyLuanChinhTri = worksheet.Cells[row, 14].Text?.Trim();
                        if (!string.IsNullOrWhiteSpace(lyLuanChinhTri))
                        {
                            var dm = listLyLuanData.FirstOrDefault(x => x.Name.Trim().ToLower() == lyLuanChinhTri.ToLower());
                            lyLuanChinhTri = dm?.Code;
                        }
                        else
                        {
                            lyLuanChinhTri = null;
                        }

                        string ngayVaoDangTxt = worksheet.Cells[row, 15].Text?.Trim() ?? "";
                        string vaoCucTxt = worksheet.Cells[row, 16].Text?.Trim() ?? "";
                        string tuyenDungTxt = worksheet.Cells[row, 17].Text?.Trim() ?? "";
                        string ghiChu = worksheet.Cells[row, 18].Text?.Trim();
                        if (!string.IsNullOrWhiteSpace(ghiChu))
                        {
                            var dm = listLoaiHoSoData.FirstOrDefault(x => x.Name.Trim().ToLower() == ghiChu.ToLower());
                            ghiChu = dm?.Code;
                        }
                        else
                        {
                            ghiChu = null;
                        }

                        int? gioiTinhVal = null;
                        DateTime? ngaySinh = null;
                        if (!string.IsNullOrWhiteSpace(ngaySinhNam))
                        {
                            gioiTinhVal = 1;
                            ngaySinh = ParseDateTimeSafe(ngaySinhNam);
                        }
                        else if (!string.IsNullOrWhiteSpace(ngaySinhNu))
                        {
                            gioiTinhVal = 2;
                            ngaySinh = ParseDateTimeSafe(ngaySinhNu);
                        }

                        var entity = new KPI_LyLich2C
                        {
                            Id = Guid.NewGuid(),
                            PhongBanId = currentDonViId ?? Guid.Empty,
                            DonViSuDungId = donViSuDungId,
                            HoTen = hoTen,
                            GioiTinh = gioiTinhVal,
                            Ngaysinh = ngaySinh,
                            ChucVuHienTai = chucVu,
                            QuanLyNN = qlnn,
                            MaNgach = maNgach,
                            HeSoLuong = ParseDoubleSafe(heSoLuongTxt),
                            NgayHuongLuong = ParseDateTimeSafe(thoiGianTinhNangBacLansau),
                            TrinhDoMax = trinhDoMax,
                            LyLuanChinhTri = lyLuanChinhTri,
                            NgayVaoDang = ParseDateTimeSafe(ngayVaoDangTxt),
                            NVaoCoQuanHienDangCongTac = ParseDateTimeSafe(vaoCucTxt),
                            NgayTuyenDung = ParseDateTimeSafe(tuyenDungTxt),
                            LoaiHopDong = ghiChu,
                            CreatedDate = DateTime.Now
                        };

                        listTrue.Add(entity);
                    }
                }
            }

            if (listTrue.Any())
            {
                await CreateAsync(listTrue);
            }

            return new
            {
                status = true,
                message = $"Import hoàn tất: Thành công {listTrue.Count} dòng, lỗi {lstFalse.Count} dòng.",
                listTrue = listTrue,
                lstFalse = lstFalse,
                totalSuccess = listTrue.Count,
                totalFailed = lstFalse.Count
            };
        }

        private DateTime? ParseDateTimeSafe(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;

            if (DateTime.TryParseExact(text, new[] { "dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd", "dd-MM-yyyy" }, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt))
            {
                return dt;
            }

            if (DateTime.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dtGeneral))
            {
                return dtGeneral;
            }

            if (double.TryParse(text, out double excelDate))
            {
                try
                {
                    return DateTime.FromOADate(excelDate);
                }
                catch
                {
                    return null;
                }
            }

            return null;
        }

        private double? ParseDoubleSafe(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            if (double.TryParse(text.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out double val))
            {
                return val;
            }
            return null;
        }

        private int? ParseIntSafe(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            if (int.TryParse(text, out int val))
            {
                return val;
            }
            return null;
        }

        public async Task<BatchStaffImportResultDto> ImportStaffBatchAsync(List<StaffImportItemDto> staffList, string? defaultPassword = null)
        {
            var result = new BatchStaffImportResultDto
            {
                TotalItems = staffList?.Count ?? 0
            };

            if (staffList == null || staffList.Count == 0)
            {
                return result;
            }

            _logger.LogInformation("🚀 [KPI Service] Starting batch staff import for {Count} records...", staffList.Count);

            // BƯỚC 1: Chuẩn bị payload gửi sang Identity Service để tạo User/Account chuẩn SSO
            var requestDto = new BatchCreateUsersRequestDto
            {
                DefaultPassword = !string.IsNullOrWhiteSpace(defaultPassword) ? defaultPassword : "Password@123",
                Users = staffList.Select(s => new BatchCreateUserItemDto
                {
                    UserName = !string.IsNullOrWhiteSpace(s.UserName)
                        ? s.UserName.Trim()
                        : (!string.IsNullOrWhiteSpace(s.Email) ? s.Email.Split('@')[0].Trim() : s.MaCanBo?.Trim().ToLower()),
                    Email = s.Email?.Trim(),
                    FullName = s.HoTen?.Trim(),
                    PhoneNumber = s.SoDienThoai?.Trim(),
                    Password = s.Password,
                    DepartmentId = s.DonViSuDungId ?? s.PhongBanId,
                    Roles = s.Roles != null && s.Roles.Count > 0 ? s.Roles : new List<string> { "CaNhan" }
                }).ToList()
            };

            // BƯỚC 2: Gọi Identity Service tạo tài khoản trong Identity_DB
            var identityResponse = await _identityServiceClient.BatchCreateUsersAsync(requestDto);

            var resultMap = new Dictionary<string, BatchCreateUserItemResultDto>(StringComparer.OrdinalIgnoreCase);
            if (identityResponse?.Data != null)
            {
                foreach (var item in identityResponse.Data)
                {
                    if (!string.IsNullOrEmpty(item.UserName)) resultMap[item.UserName] = item;
                    if (!string.IsNullOrEmpty(item.Email)) resultMap[item.Email] = item;
                }
            }

            // BƯỚC 3: Lưu / cập nhật dữ liệu hồ sơ nhân sự vào KPI_DB (KPI_LyLich2C và AppUser local replica)
            for (int i = 0; i < staffList.Count; i++)
            {
                var staff = staffList[i];
                var reqUser = requestDto.Users[i];
                
                BatchCreateUserItemResultDto? accountResult = null;
                if (!string.IsNullOrEmpty(reqUser.UserName) && resultMap.TryGetValue(reqUser.UserName, out var r1))
                {
                    accountResult = r1;
                }
                else if (!string.IsNullOrEmpty(reqUser.Email) && resultMap.TryGetValue(reqUser.Email, out var r2))
                {
                    accountResult = r2;
                }

                if (accountResult != null && accountResult.Success && accountResult.UserId.HasValue)
                {
                    var userId = accountResult.UserId.Value;

                    // 3.1 Tìm hoặc tạo mới bản ghi KPI_LyLich2C
                    var lyLich = _kPI_LyLich2CRepository.GetQueryable().FirstOrDefault(x => 
                        x.UserId == userId || 
                        (!string.IsNullOrEmpty(staff.MaCanBo) && x.MaCanBo == staff.MaCanBo) ||
                        (!string.IsNullOrEmpty(staff.Email) && x.Email == staff.Email));

                    bool isNew = false;
                    if (lyLich == null)
                    {
                        isNew = true;
                        lyLich = new KPI_LyLich2C { Id = Guid.NewGuid() };
                    }

                    lyLich.UserId = userId;
                    lyLich.HoTen = staff.HoTen;
                    lyLich.MaCanBo = staff.MaCanBo;
                    lyLich.Email = staff.Email;
                    lyLich.Phone = staff.SoDienThoai;
                    lyLich.ChucVuHienTai = staff.ChucVu;
                    lyLich.PhongBanId = staff.PhongBanId ?? Guid.Empty;
                    lyLich.DonViSuDungId = staff.DonViSuDungId ?? Guid.Empty;
                    lyLich.Ngaysinh = staff.NgaySinh;
                    lyLich.GioiTinh = staff.GioiTinh;
                    lyLich.SoCMND = staff.CCCD;
                    lyLich.DiaChiHienTai = staff.DiaChi;

                    if (isNew)
                    {
                        _kPI_LyLich2CRepository.Add(lyLich);
                    }
                    else
                    {
                        _kPI_LyLich2CRepository.Update(lyLich);
                    }

                    // 3.2 Lưu local replica vào bảng AppUser của KPI_DB để query join không bị phụ thuộc
                    var localUser = _appUserRepository.GetQueryable().FirstOrDefault(x => x.Id == userId);
                    if (localUser == null)
                    {
                        localUser = new AppUser
                        {
                            Id = userId,
                            UserName = reqUser.UserName ?? staff.Email,
                            Email = staff.Email,
                            Name = staff.HoTen,
                            PhoneNumber = staff.SoDienThoai,
                            DonViId = staff.DonViSuDungId,
                            CCCD = staff.CCCD,
                            DiaChi = staff.DiaChi,
                            NgaySinh = staff.NgaySinh,
                            Gender = staff.GioiTinh ?? 0,
                            Type = "1"
                        };
                        _appUserRepository.Add(localUser);
                    }
                    else
                    {
                        localUser.Name = staff.HoTen;
                        localUser.Email = staff.Email;
                        localUser.PhoneNumber = staff.SoDienThoai;
                        localUser.DonViId = staff.DonViSuDungId ?? localUser.DonViId;
                        _appUserRepository.Update(localUser);
                    }

                    result.SuccessCount++;
                    result.Details.Add(new StaffImportResultItemDto
                    {
                        MaCanBo = staff.MaCanBo,
                        HoTen = staff.HoTen,
                        UserName = reqUser.UserName,
                        Email = staff.Email,
                        UserId = userId,
                        LyLichId = lyLich.Id,
                        Success = true,
                        Message = "Import hồ sơ và tạo tài khoản Identity thành công"
                    });
                }
                else
                {
                    result.FailedCount++;
                    result.Details.Add(new StaffImportResultItemDto
                    {
                        MaCanBo = staff.MaCanBo,
                        HoTen = staff.HoTen,
                        UserName = reqUser.UserName,
                        Email = staff.Email,
                        Success = false,
                        Message = accountResult?.Error ?? identityResponse?.Message ?? "Không thể tạo tài khoản trên Identity Service"
                    });
                }
            }

            await _kPI_LyLich2CRepository.SaveAsync();
            await _appUserRepository.SaveAsync();

            _logger.LogInformation("✅ [KPI Service] Batch import completed: {Success}/{Total} succeeded.", result.SuccessCount, result.TotalItems);
            return result;
        }

        public async Task<BatchStaffImportResultDto> DemoImport10StaffAsync(Guid? donViSuDungId = null)
        {
            var dept = donViSuDungId.HasValue 
                ? _departmentRepository.GetQueryable().FirstOrDefault(x => x.Id == donViSuDungId.Value)
                : _departmentRepository.GetQueryable().FirstOrDefault();

            var deptId = dept?.Id ?? Guid.NewGuid();

            var demoList = new List<StaffImportItemDto>
            {
                new StaffImportItemDto { MaCanBo = "NV001", HoTen = "Nguyễn Văn An", Email = "nguyenvanan@hinet.vn", SoDienThoai = "0901000001", ChucVu = "Chuyên viên", DonViSuDungId = deptId, GioiTinh = 1, CCCD = "001200000001", DiaChi = "Hà Nội" },
                new StaffImportItemDto { MaCanBo = "NV002", HoTen = "Trần Thị Bình", Email = "tranbinh@hinet.vn", SoDienThoai = "0901000002", ChucVu = "Chuyên viên chính", DonViSuDungId = deptId, GioiTinh = 2, CCCD = "001200000002", DiaChi = "Hà Nội" },
                new StaffImportItemDto { MaCanBo = "NV003", HoTen = "Lê Hoàng Cường", Email = "lecuong@hinet.vn", SoDienThoai = "0901000003", ChucVu = "Trưởng phòng", DonViSuDungId = deptId, GioiTinh = 1, CCCD = "001200000003", DiaChi = "Hà Nội", Roles = new List<string> { "TruongPhong", "CaNhan" } },
                new StaffImportItemDto { MaCanBo = "NV004", HoTen = "Phạm Minh Dung", Email = "minhdung@hinet.vn", SoDienThoai = "0901000004", ChucVu = "Phó Trưởng phòng", DonViSuDungId = deptId, GioiTinh = 2, CCCD = "001200000004", DiaChi = "Hải Phòng", Roles = new List<string> { "PhoTruongPhong", "CaNhan" } },
                new StaffImportItemDto { MaCanBo = "NV005", HoTen = "Hoàng Gia Bảo", Email = "giabao@hinet.vn", SoDienThoai = "0901000005", ChucVu = "Chuyên viên", DonViSuDungId = deptId, GioiTinh = 1, CCCD = "001200000005", DiaChi = "Nam Định" },
                new StaffImportItemDto { MaCanBo = "NV006", HoTen = "Vũ Thanh Hương", Email = "thanhhuong@hinet.vn", SoDienThoai = "0901000006", ChucVu = "Chuyên viên", DonViSuDungId = deptId, GioiTinh = 2, CCCD = "001200000006", DiaChi = "Hà Nội" },
                new StaffImportItemDto { MaCanBo = "NV007", HoTen = "Đỗ Quốc Hùng", Email = "quochung@hinet.vn", SoDienThoai = "0901000007", ChucVu = "Kế toán viên", DonViSuDungId = deptId, GioiTinh = 1, CCCD = "001200000007", DiaChi = "Hà Nội" },
                new StaffImportItemDto { MaCanBo = "NV008", HoTen = "Bùi Tuyết Mai", Email = "tuyetmai@hinet.vn", SoDienThoai = "0901000008", ChucVu = "Nhân viên văn phòng", DonViSuDungId = deptId, GioiTinh = 2, CCCD = "001200000008", DiaChi = "Bắc Ninh" },
                new StaffImportItemDto { MaCanBo = "NV009", HoTen = "Ngô Văn Nam", Email = "ngovannam@hinet.vn", SoDienThoai = "0901000009", ChucVu = "Chuyên viên CNTT", DonViSuDungId = deptId, GioiTinh = 1, CCCD = "001200000009", DiaChi = "Hà Nội" },
                new StaffImportItemDto { MaCanBo = "NV010", HoTen = "Trịnh Hồng Phúc", Email = "hongphuc@hinet.vn", SoDienThoai = "0901000010", ChucVu = "Trưởng bộ phận", DonViSuDungId = deptId, GioiTinh = 1, CCCD = "001200000010", DiaChi = "Hà Nội" }
            };

            return await ImportStaffBatchAsync(demoList, "P@ssword123");
        }

    }
}
