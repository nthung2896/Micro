using Hinet.Model.Entities;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.KPI_BoTieuChiDonViRepository;
using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;
using Hinet.Service.KPI_BoTieuChiDonViService.Dto;
using Hinet.Service.Constant;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;



namespace Hinet.Service.KPI_BoTieuChiDonViService
{
    public class KPI_BoTieuChiDonViService : Service<KPI_BoTieuChiDonVi>, IKPI_BoTieuChiDonViService
    {
        private readonly IKPI_BoTieuChiDonViRepository _boTieuChiDonViRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IKPI_DotTheoDoiDanhGiaRepository _dotTheoDoiDanhGiaRepository;
        private readonly Hinet.Repository.KPI_CauHinhDiemTheoHeSoLanhDaoRepository.IKPI_CauHinhDiemTheoHeSoLanhDaoRepository _cauHinhDiemRepository;
        private readonly Hinet.Service.DM_DuLieuDanhMucService.IDM_DuLieuDanhMucService _dmDuLieuDanhMucService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public KPI_BoTieuChiDonViService(
            IKPI_BoTieuChiDonViRepository kPI_BoTieuChiDonViRepository,
            IDepartmentRepository departmentRepository,
            IKPI_DotTheoDoiDanhGiaRepository dotTheoDoiDanhGiaRepository,
            Hinet.Repository.KPI_CauHinhDiemTheoHeSoLanhDaoRepository.IKPI_CauHinhDiemTheoHeSoLanhDaoRepository cauHinhDiemRepository,
            Hinet.Service.DM_DuLieuDanhMucService.IDM_DuLieuDanhMucService dmDuLieuDanhMucService,
            IHttpContextAccessor httpContextAccessor
            ) : base(kPI_BoTieuChiDonViRepository)
        {
            _boTieuChiDonViRepository = kPI_BoTieuChiDonViRepository;
            _departmentRepository = departmentRepository;
            _dotTheoDoiDanhGiaRepository = dotTheoDoiDanhGiaRepository;
            _cauHinhDiemRepository = cauHinhDiemRepository;
            _dmDuLieuDanhMucService = dmDuLieuDanhMucService;
            _httpContextAccessor = httpContextAccessor;
        }

        private bool IsCurrentUserAdmin()
        {
            return _httpContextAccessor.HttpContext?.User?
                .FindAll(ClaimTypes.Role)
                .SelectMany(x => x.Value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                .Contains(RoleConstant.Admin) == true;
        }

        public async Task<PagedList<KPI_BoTieuChiDonViDto>> GetData(KPI_BoTieuChiDonViSearch search)
        {
            var query = from q in GetQueryable()
                        join donVi in _departmentRepository.GetQueryable() on q.IdDonVi equals donVi.Id into donViGroup
                        from dv in donViGroup.DefaultIfEmpty()
                        join dot in _dotTheoDoiDanhGiaRepository.GetQueryable() on q.IdDot equals dot.Id into dotGroup
                        from dt in dotGroup.DefaultIfEmpty()
                        select new KPI_BoTieuChiDonViDto()
                        {
                            SoQuyetDinh = q.SoQuyetDinh,
                            NgayQuyetDinh = q.NgayQuyetDinh,
                            TenBoTieuChiDonVi = q.TenBoTieuChiDonVi,
                            IdDonVi = q.IdDonVi,
                            TenDonVi = dv != null ? dv.Name : "",
                            IdDot = q.IdDot,
                            TenDot = dt != null ? dt.TenDotTheoDoiDanhGia : "",
                            ApDungTuNgay = q.ApDungTuNgay,
                            ApDungToiNgay = q.ApDungToiNgay,
                            Is_locked = q.Is_locked || (dt != null && (dt.TrangThai == TrangThaiDotDanhGiaConstant.CLOSED || dt.TrangThai == "CLOSED" || dt.TrangThai == "Đã đóng/Kết thúc")),
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
                if (!string.IsNullOrEmpty(search.SoQuyetDinh))
                {
                    query = query.Where(x => EF.Functions.Like(x.SoQuyetDinh, $"%{search.SoQuyetDinh}%"));
                }
                if (!string.IsNullOrEmpty(search.TenBoTieuChiDonVi))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenBoTieuChiDonVi, $"%{search.TenBoTieuChiDonVi}%"));
                }
                if (search.IdDonVi.HasValue)
                {
                    query = query.Where(x => x.IdDonVi == search.IdDonVi);
                }
                if (search.ListIdDonVi != null && search.ListIdDonVi.Any())
                {
                    query = query.Where(x => x.IdDonVi.HasValue && search.ListIdDonVi.Contains(x.IdDonVi.Value));
                }
                if (search.IdDot.HasValue)
                {
                    query = query.Where(x => x.IdDot == search.IdDot);
                }
                if (search.Is_locked.HasValue)
                {
                    query = query.Where(x => x.Is_locked == search.Is_locked.Value);
                }
            }
            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_BoTieuChiDonViDto>.CreateAsync(query, search);
            if (result?.Items != null && result.Items.Any())
            {
                var listIds = result.Items.Select(x => x.Id).ToList();

                var closedDotIds = await _dotTheoDoiDanhGiaRepository.GetQueryable()
                    .Where(x => x.TrangThai == TrangThaiDotDanhGiaConstant.CLOSED || x.TrangThai == "CLOSED" || x.TrangThai == "Đã đóng/Kết thúc")
                    .Select(x => x.Id)
                    .ToListAsync();

                if (closedDotIds.Any())
                {
                    var lockedBtcIds = await _dotTheoDoiDanhGiaRepository.GetQueryable()
                        .Where(x => closedDotIds.Contains(x.Id) && x.DefaultTieuChiDonVi.HasValue)
                        .Select(x => x.DefaultTieuChiDonVi.Value)
                        .ToListAsync();

                    foreach (var item in result.Items)
                    {
                        if (lockedBtcIds.Contains(item.Id))
                        {
                            item.Is_locked = true;
                        }
                    }
                }

                var lstCauHinh = await _cauHinhDiemRepository.GetQueryable()
                    .Where(x => x.IdBoTieuChi.HasValue && listIds.Contains(x.IdBoTieuChi.Value))
                    .ToListAsync();
                var listChucVu = await _dmDuLieuDanhMucService.GetByGroupCode("CHUCVUVNU");
                foreach (var item in result.Items)
                {
                    var cauHinhs = lstCauHinh.Where(x => x.IdBoTieuChi == item.Id).Select(x => 
                    {
                        var tenChucVu = listChucVu.FirstOrDefault(c => c.Code == x.ChucVu)?.Name ?? x.ChucVu;
                        return $"{tenChucVu}: <strong>{x.HeSo}</strong>";
                    }).ToList();
                    item.CauHinhDiemLanhDaoText = string.Join("\n", cauHinhs);
                }
            }
            var isAdmin = IsCurrentUserAdmin();
            foreach (var item in result.Items)
            {
                item.IsAdmin = isAdmin;
            }
            return result;
        }

        public async Task<KPI_BoTieuChiDonViDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)
                              join donVi in _departmentRepository.GetQueryable() on q.IdDonVi equals donVi.Id into donViGroup
                              from dv in donViGroup.DefaultIfEmpty()
                              join dot in _dotTheoDoiDanhGiaRepository.GetQueryable() on q.IdDot equals dot.Id into dotGroup
                              from dt in dotGroup.DefaultIfEmpty()
                              select new KPI_BoTieuChiDonViDto()
                              {
                                  SoQuyetDinh = q.SoQuyetDinh,
                                  NgayQuyetDinh = q.NgayQuyetDinh,
                                  TenBoTieuChiDonVi = q.TenBoTieuChiDonVi,
                                  IdDonVi = q.IdDonVi,
                                  TenDonVi = dv != null ? dv.Name : "",
                                  IdDot = q.IdDot,
                                  TenDot = dt != null ? dt.TenDotTheoDoiDanhGia : "",
                                  ApDungTuNgay = q.ApDungTuNgay,
                                  ApDungToiNgay = q.ApDungToiNgay,
                                  Is_locked = q.Is_locked || (dt != null && (dt.TrangThai == TrangThaiDotDanhGiaConstant.CLOSED || dt.TrangThai == "CLOSED" || dt.TrangThai == "Đã đóng/Kết thúc")),
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
                var lstCauHinh = await _cauHinhDiemRepository.GetQueryable()
                    .Where(x => x.IdBoTieuChi == item.Id)
                    .ToListAsync();
                var listChucVu = await _dmDuLieuDanhMucService.GetByGroupCode("CHUCVUVNU");
                var cauHinhs = lstCauHinh.Select(x => 
                {
                    var tenChucVu = listChucVu.FirstOrDefault(c => c.Code == x.ChucVu)?.Name ?? x.ChucVu;
                    return $"{tenChucVu}: <strong>{x.HeSo}</strong>";
                }).ToList();
                item.CauHinhDiemLanhDaoText = string.Join("\n", cauHinhs);
            }

            return item;
        }

        public async Task SetActiveBoTieuChiDonViAsync(Guid activeId, Guid idDonVi)
        {
            var otherItems = await _boTieuChiDonViRepository.GetQueryableWithTracking()
                .Where(x => x.Id != activeId && x.IdDonVi == idDonVi)
                .ToListAsync();

            if (otherItems.Count == 0) return;

            foreach (var item in otherItems)
            {
                item.Is_locked = true; // Inactive / Khóa các bộ cũ của cùng đơn vị
                _boTieuChiDonViRepository.Update(item);
            }
            await _boTieuChiDonViRepository.SaveAsync();
        }
    }
}
