using Hinet.Model.Entities;
using Hinet.Repository.AppUserRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Repository.KPI_DauRaNhiemVu_ChiTietDanhGiaRepository;
using Hinet.Repository.KPI_DauRaNhiemVuRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.KPI_NhiemVuRepository;
using Hinet.Repository.KPI_PhieuDanhGiaRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Constant;
using Hinet.Service.Dto;
using Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.Dto;
using Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService
{
    public class KPI_DauRaNhiemVu_ChiTietDanhGiaService : Service<KPI_DauRaNhiemVu_ChiTietDanhGia>, IKPI_DauRaNhiemVu_ChiTietDanhGiaService
    {
        private readonly IAppUserRepository _appUserRepository;
        private readonly IKPI_LyLich2CRepository _lyLich2CRepository;
        private readonly IKPI_PhieuDanhGiaRepository _phieuDanhGiaRepository;
        private readonly IKPI_DauRaNhiemVuRepository _dauRaNhiemVuRepository;
        private readonly IKPI_NhiemVuRepository _nhiemVuRepository;
        private readonly IDM_NhomDanhMucRepository _nhomDanhMucRepository;
        private readonly IDM_DuLieuDanhMucRepository _danhMucRepository;

        public KPI_DauRaNhiemVu_ChiTietDanhGiaService(
            IKPI_DauRaNhiemVu_ChiTietDanhGiaRepository kPI_DauRaNhiemVu_ChiTietDanhGiaRepository,
            IAppUserRepository appUserRepository,
            IKPI_LyLich2CRepository lyLich2CRepository,
            IKPI_PhieuDanhGiaRepository phieuDanhGiaRepository,
            IKPI_DauRaNhiemVuRepository dauRaNhiemVuRepository,
            IKPI_NhiemVuRepository nhiemVuRepository
,
            IDM_NhomDanhMucRepository nhomDanhMucRepository,
            IDM_DuLieuDanhMucRepository danhMucRepository) : base(kPI_DauRaNhiemVu_ChiTietDanhGiaRepository)
        {
            _appUserRepository = appUserRepository;
            _lyLich2CRepository = lyLich2CRepository;
            _phieuDanhGiaRepository = phieuDanhGiaRepository;
            _dauRaNhiemVuRepository = dauRaNhiemVuRepository;
            _nhiemVuRepository = nhiemVuRepository;
            _nhomDanhMucRepository = nhomDanhMucRepository;
            _danhMucRepository = danhMucRepository;
        }

        public async Task<PagedList<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>> GetData(KPI_DauRaNhiemVu_ChiTietDanhGiaSearch search)
        {
            var query = from q in GetQueryable()
                        select new KPI_DauRaNhiemVu_ChiTietDanhGiaDto()
                        {
                            IdDauRaNhiemVu = q.IdDauRaNhiemVu,
                            IdPhieuDanhGia = q.IdPhieuDanhGia,
                            VaiTroDanhGia = q.VaiTroDanhGia,
                            NguoiDanhGiaId = q.NguoiDanhGiaId,
                            ChamDiemSoLuong_HoanThanh = q.ChamDiemSoLuong_HoanThanh,
                            ChamDiemSoLuong_KhongHoanThanh = q.ChamDiemSoLuong_KhongHoanThanh,
                            ChamDiemSoLuong_Diem = q.ChamDiemSoLuong_Diem,
                            ChamDiemChatLuong_KhongDat = q.ChamDiemChatLuong_KhongDat,
                            ChamDiemChatLuong_SoDiemConLai = q.ChamDiemChatLuong_SoDiemConLai,
                            ChamDiemChatLuong_Diem = q.ChamDiemChatLuong_Diem,
                            ChamDiemTienDo_KhongDat = q.ChamDiemTienDo_KhongDat,
                            ChamDiemTienDo_SoDiemConLai = q.ChamDiemTienDo_SoDiemConLai,
                            ChamDiemTienDo_Diem = q.ChamDiemTienDo_Diem,
                            GhiChu = q.GhiChu,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        };

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.IdDauRaNhiemVu) && Guid.TryParse(search.IdDauRaNhiemVu, out var idDauRa))
                {
                    query = query.Where(x => x.IdDauRaNhiemVu == idDauRa);
                }
                if (!string.IsNullOrEmpty(search.IdPhieuDanhGia) && Guid.TryParse(search.IdPhieuDanhGia, out var idPhieu))
                {
                    query = query.Where(x => x.IdPhieuDanhGia == idPhieu);
                }
                if (!string.IsNullOrEmpty(search.VaiTroDanhGia))
                {
                    query = query.Where(x => EF.Functions.Like(x.VaiTroDanhGia, $"%{search.VaiTroDanhGia}%"));
                }
                if (!string.IsNullOrEmpty(search.NguoiDanhGiaId) && Guid.TryParse(search.NguoiDanhGiaId, out var idNguoiDg))
                {
                    query = query.Where(x => x.NguoiDanhGiaId == idNguoiDg);
                }
                if (search.ChamDiemSoLuong_HoanThanh.HasValue)
                {
                    query = query.Where(x => x.ChamDiemSoLuong_HoanThanh == search.ChamDiemSoLuong_HoanThanh);
                }
                if (search.ChamDiemSoLuong_KhongHoanThanh.HasValue)
                {
                    query = query.Where(x => x.ChamDiemSoLuong_KhongHoanThanh == search.ChamDiemSoLuong_KhongHoanThanh);
                }
                if (search.ChamDiemSoLuong_Diem.HasValue)
                {
                    query = query.Where(x => x.ChamDiemSoLuong_Diem == search.ChamDiemSoLuong_Diem);
                }
                if (search.ChamDiemChatLuong_KhongDat.HasValue)
                {
                    query = query.Where(x => x.ChamDiemChatLuong_KhongDat == search.ChamDiemChatLuong_KhongDat);
                }
                if (search.ChamDiemChatLuong_SoDiemConLai.HasValue)
                {
                    query = query.Where(x => x.ChamDiemChatLuong_SoDiemConLai == search.ChamDiemChatLuong_SoDiemConLai);
                }
                if (search.ChamDiemChatLuong_Diem.HasValue)
                {
                    query = query.Where(x => x.ChamDiemChatLuong_Diem == search.ChamDiemChatLuong_Diem);
                }
                if (search.ChamDiemTienDo_KhongDat.HasValue)
                {
                    query = query.Where(x => x.ChamDiemTienDo_KhongDat == search.ChamDiemTienDo_KhongDat);
                }
                if (search.ChamDiemTienDo_SoDiemConLai.HasValue)
                {
                    query = query.Where(x => x.ChamDiemTienDo_SoDiemConLai == search.ChamDiemTienDo_SoDiemConLai);
                }
                if (search.ChamDiemTienDo_Diem.HasValue)
                {
                    query = query.Where(x => x.ChamDiemTienDo_Diem == search.ChamDiemTienDo_Diem);
                }
                if (!string.IsNullOrEmpty(search.GhiChu))
                {
                    query = query.Where(x => EF.Functions.Like(x.GhiChu, $"%{search.GhiChu}%"));
                }
            }

            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_DauRaNhiemVu_ChiTietDanhGiaDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable()
                              where q.Id == id
                              select new KPI_DauRaNhiemVu_ChiTietDanhGiaDto()
                              {
                                  IdDauRaNhiemVu = q.IdDauRaNhiemVu,
                                  IdPhieuDanhGia = q.IdPhieuDanhGia,
                                  VaiTroDanhGia = q.VaiTroDanhGia,
                                  NguoiDanhGiaId = q.NguoiDanhGiaId,
                                  ChamDiemSoLuong_HoanThanh = q.ChamDiemSoLuong_HoanThanh,
                                  ChamDiemSoLuong_KhongHoanThanh = q.ChamDiemSoLuong_KhongHoanThanh,
                                  ChamDiemSoLuong_Diem = q.ChamDiemSoLuong_Diem,
                                  ChamDiemChatLuong_KhongDat = q.ChamDiemChatLuong_KhongDat,
                                  ChamDiemChatLuong_SoDiemConLai = q.ChamDiemChatLuong_SoDiemConLai,
                                  ChamDiemChatLuong_Diem = q.ChamDiemChatLuong_Diem,
                                  ChamDiemTienDo_KhongDat = q.ChamDiemTienDo_KhongDat,
                                  ChamDiemTienDo_SoDiemConLai = q.ChamDiemTienDo_SoDiemConLai,
                                  ChamDiemTienDo_Diem = q.ChamDiemTienDo_Diem,
                                  GhiChu = q.GhiChu,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  IsDeleted = q.IsDeleted,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  Id = q.Id,
                              }).FirstOrDefaultAsync();

            return item;
        }

        /// <summary>
        /// Lấy tất cả chi tiết đánh giá cho một phiếu (tất cả vai trò)
        /// </summary>
        public async Task<List<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>> GetByPhieu(Guid idPhieuDanhGia)
        {
            var query = from q in GetQueryable()
                        where q.IdPhieuDanhGia == idPhieuDanhGia && q.IsDeleted == false
                        select new KPI_DauRaNhiemVu_ChiTietDanhGiaDto()
                        {
                            IdDauRaNhiemVu = q.IdDauRaNhiemVu,
                            IdPhieuDanhGia = q.IdPhieuDanhGia,
                            VaiTroDanhGia = q.VaiTroDanhGia,
                            NguoiDanhGiaId = q.NguoiDanhGiaId,
                            ChamDiemSoLuong_HoanThanh = q.ChamDiemSoLuong_HoanThanh,
                            ChamDiemSoLuong_KhongHoanThanh = q.ChamDiemSoLuong_KhongHoanThanh,
                            ChamDiemSoLuong_Diem = q.ChamDiemSoLuong_Diem,
                            ChamDiemChatLuong_KhongDat = q.ChamDiemChatLuong_KhongDat,
                            ChamDiemChatLuong_SoDiemConLai = q.ChamDiemChatLuong_SoDiemConLai,
                            ChamDiemChatLuong_Diem = q.ChamDiemChatLuong_Diem,
                            ChamDiemTienDo_KhongDat = q.ChamDiemTienDo_KhongDat,
                            ChamDiemTienDo_SoDiemConLai = q.ChamDiemTienDo_SoDiemConLai,
                            ChamDiemTienDo_Diem = q.ChamDiemTienDo_Diem,
                            GhiChu = q.GhiChu,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                        };

            var list = await query.OrderBy(x => x.IdDauRaNhiemVu).ThenBy(x => x.VaiTroDanhGia).ToListAsync();

            if (list.Any())
            {
                var userIds = list.Where(x => x.NguoiDanhGiaId.HasValue).Select(x => x.NguoiDanhGiaId.Value).Distinct().ToList();
                var users = await _appUserRepository.GetQueryable().Where(x => userIds.Contains(x.Id)).ToListAsync();
                var lyLichs = await _lyLich2CRepository.GetQueryable().Where(x => userIds.Contains(x.Id) || (x.UserId.HasValue && userIds.Contains(x.UserId.Value))).ToListAsync();

                // Lấy thông tin chủ phiếu nếu vai trò là Cá nhân
                var phieu = await _phieuDanhGiaRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == idPhieuDanhGia);
                KPI_LyLich2C? ownerLyLich = null;
                AppUser? ownerUser = null;
                if (phieu != null && phieu.IdLyLich.HasValue)
                {
                    ownerLyLich = await _lyLich2CRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == phieu.IdLyLich.Value);
                    if (ownerLyLich != null && ownerLyLich.UserId.HasValue)
                    {
                        ownerUser = await _appUserRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == ownerLyLich.UserId.Value);
                    }
                }

                foreach (var item in list)
                {
                    if (item.NguoiDanhGiaId.HasValue)
                    {
                        var u = users.FirstOrDefault(x => x.Id == item.NguoiDanhGiaId.Value);
                        var ll = lyLichs.FirstOrDefault(x => x.Id == item.NguoiDanhGiaId.Value || x.UserId == item.NguoiDanhGiaId.Value);
                        item.TenNguoiDanhGia = ll?.HoTen ?? u?.Name ?? u?.UserName ?? item.CreatedBy;
                        item.UserName = u?.UserName ?? item.CreatedBy;
                        item.TenChucVu = ll?.ChucVuHienTai;
                    }
                    else if (string.Equals(item.VaiTroDanhGia, "CaNhan", StringComparison.OrdinalIgnoreCase))
                    {
                        item.TenNguoiDanhGia = ownerLyLich?.HoTen ?? ownerUser?.Name ?? item.CreatedBy;
                        item.UserName = ownerUser?.UserName ?? item.CreatedBy;
                        item.TenChucVu = ownerLyLich?.ChucVuHienTai;
                    }
                }
            }

            return list;
        }

        /// <summary>
        /// Lưu hàng loạt điểm chi tiết cho một phiếu + vai trò.
        /// Nếu đã tồn tại (cùng IdDauRaNhiemVu + IdPhieuDanhGia + VaiTroDanhGia) thì update, ngược lại create.
        /// </summary>
        public async Task SaveBatch(Guid idPhieuDanhGia, string vaiTroDanhGia, Guid nguoiDanhGiaId, List<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM> items)
        {
            var phieu = await _phieuDanhGiaRepository.GetQueryable()
                .Where(x => x.Id == idPhieuDanhGia)
                .Select(x => new { x.IdLyLich, x.IdDotDanhGia })
                .FirstOrDefaultAsync();

            var idNhomChucVu = await _nhomDanhMucRepository
                .GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.ChucVu)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

            var vaiTro = await _danhMucRepository
                .GetQueryable()
                .Where(x => x.GroupId == idNhomChucVu && x.IsDeleted == false)
                .Select(x => x.Code)
                .ToListAsync();

            if (phieu == null || !phieu.IdLyLich.HasValue || !phieu.IdDotDanhGia.HasValue)
                throw new InvalidOperationException("Phiếu đánh giá không có đủ thông tin nhân sự hoặc đợt đánh giá.");

            var normVaiTro = vaiTroDanhGia?.Trim();
            if (string.Equals(vaiTroDanhGia, "PhoPhong", StringComparison.OrdinalIgnoreCase))
                normVaiTro = "PhoTruongPhong";

            var vaiTroHopLe = vaiTro
                .FirstOrDefault(x => string.Equals(x, normVaiTro, StringComparison.OrdinalIgnoreCase));
            if (vaiTroHopLe == null)
                throw new InvalidOperationException("Vai trò đánh giá không hợp lệ.");
            normVaiTro = vaiTroHopLe;

            items ??= new List<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM>();
            if (items.Any(x => x.IdDauRaNhiemVu == Guid.Empty))
                throw new InvalidOperationException("Danh sách điểm có đầu ra nhiệm vụ không hợp lệ.");
            if (items.Select(x => x.IdDauRaNhiemVu).Distinct().Count() != items.Count)
                throw new InvalidOperationException("Danh sách điểm có đầu ra nhiệm vụ bị trùng.");

            var dauRaHopLe = await (from dr in _dauRaNhiemVuRepository.GetQueryable()
                                    join nv in _nhiemVuRepository.GetQueryable() on dr.IdNhiemVu equals nv.Id
                                    where nv.IdLyLich == phieu.IdLyLich
                                          && nv.IdDotTheoDoiDanhGia == phieu.IdDotDanhGia
                                          && dr.IsDeleted == false && nv.IsDeleted == false
                                    select dr.Id)
                .ToListAsync();
            var dauRaHopLeSet = dauRaHopLe.ToHashSet();
            if (dauRaHopLe.Count > 0 && items.Count == 0)
                throw new InvalidOperationException("Phiếu có nhiệm vụ nhưng chưa có dữ liệu chấm điểm để lưu.");

            var soDauRaSaiPhieu = items.Count(x => !dauRaHopLeSet.Contains(x.IdDauRaNhiemVu));
            if (soDauRaSaiPhieu > 0)
                throw new InvalidOperationException($"Có {soDauRaSaiPhieu} đầu ra nhiệm vụ không thuộc phiếu đánh giá này.");

            // Lấy tất cả bản ghi hiện có cho phiếu + vai trò này
            var existing = await GetQueryable()
                .Where(x => x.IdPhieuDanhGia == idPhieuDanhGia
                         && (x.VaiTroDanhGia == normVaiTro || x.VaiTroDanhGia == vaiTroDanhGia || (normVaiTro == "PhoTruongPhong" && x.VaiTroDanhGia == "PhoPhong"))
                         && x.IsDeleted == false)
                .ToListAsync();

            var existingByDauRa = existing.GroupBy(x => x.IdDauRaNhiemVu).ToDictionary(g => g.Key, g => g.First());

            foreach (var item in items)
            {
                var idDauRa = item.IdDauRaNhiemVu;
                if (idDauRa == Guid.Empty)
                    continue;

                if (existingByDauRa.TryGetValue(idDauRa, out var entity))
                {
                    // Update
                    entity.VaiTroDanhGia = normVaiTro;
                    entity.ChamDiemSoLuong_HoanThanh = item.ChamDiemSoLuong_HoanThanh;
                    entity.ChamDiemSoLuong_KhongHoanThanh = item.ChamDiemSoLuong_KhongHoanThanh;
                    entity.ChamDiemSoLuong_Diem = item.ChamDiemSoLuong_Diem;
                    entity.ChamDiemChatLuong_KhongDat = item.ChamDiemChatLuong_KhongDat;
                    entity.ChamDiemChatLuong_SoDiemConLai = item.ChamDiemChatLuong_SoDiemConLai;
                    entity.ChamDiemChatLuong_Diem = item.ChamDiemChatLuong_Diem;
                    entity.ChamDiemTienDo_KhongDat = item.ChamDiemTienDo_KhongDat;
                    entity.ChamDiemTienDo_SoDiemConLai = item.ChamDiemTienDo_SoDiemConLai;
                    entity.ChamDiemTienDo_Diem = item.ChamDiemTienDo_Diem;
                    entity.GhiChu = item.GhiChu;
                    entity.NguoiDanhGiaId = nguoiDanhGiaId;
                    await UpdateAsync(entity);
                }
                else
                {
                    // Create
                    var newEntity = new KPI_DauRaNhiemVu_ChiTietDanhGia
                    {
                        IdDauRaNhiemVu = idDauRa,
                        IdPhieuDanhGia = idPhieuDanhGia,
                        VaiTroDanhGia = normVaiTro,
                        NguoiDanhGiaId = nguoiDanhGiaId,
                        ChamDiemSoLuong_HoanThanh = item.ChamDiemSoLuong_HoanThanh,
                        ChamDiemSoLuong_KhongHoanThanh = item.ChamDiemSoLuong_KhongHoanThanh,
                        ChamDiemSoLuong_Diem = item.ChamDiemSoLuong_Diem,
                        ChamDiemChatLuong_KhongDat = item.ChamDiemChatLuong_KhongDat,
                        ChamDiemChatLuong_SoDiemConLai = item.ChamDiemChatLuong_SoDiemConLai,
                        ChamDiemChatLuong_Diem = item.ChamDiemChatLuong_Diem,
                        ChamDiemTienDo_KhongDat = item.ChamDiemTienDo_KhongDat,
                        ChamDiemTienDo_SoDiemConLai = item.ChamDiemTienDo_SoDiemConLai,
                        ChamDiemTienDo_Diem = item.ChamDiemTienDo_Diem,
                        GhiChu = item.GhiChu,
                    };
                    await CreateAsync(newEntity);
                }
            }
        }
    }
}
