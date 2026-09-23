using Hinet.Model.Entities;
using Hinet.Model;
using Hinet.Repository.KPI_NhiemVuRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_NhiemVuService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using Hinet.Repository.KPI_DauRaNhiemVuRepository;
using Hinet.Repository.KPI_NhomTieuChiRepository;
using Hinet.Service.KPI_DauRaNhiemVuService.Dto;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Service.TaiLieuDinhKemService.Dto;
using Hinet.Service.Constant;
using System.Text.Json;


namespace Hinet.Service.KPI_NhiemVuService
{
    public class KPI_NhiemVuService : Service<KPI_NhiemVu>, IKPI_NhiemVuService
    {
        private readonly IKPI_NhiemVuRepository _kPI_NhiemVuRepository;
        private readonly IKPI_DauRaNhiemVuRepository _kPI_DauRaNhiemVuRepository;
        private readonly IKPI_NhomTieuChiRepository _kPI_NhomTieuChiRepository;
        private readonly HinetContext _dbContext;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;

        public KPI_NhiemVuService(
            IKPI_NhiemVuRepository kPI_NhiemVuRepository,
            IKPI_DauRaNhiemVuRepository kPI_DauRaNhiemVuRepository,
            IKPI_NhomTieuChiRepository kPI_NhomTieuChiRepository,
            HinetContext dbContext,
            ITaiLieuDinhKemService taiLieuDinhKemService
            ) : base(kPI_NhiemVuRepository)
        {
            _kPI_NhiemVuRepository = kPI_NhiemVuRepository;
            _kPI_DauRaNhiemVuRepository = kPI_DauRaNhiemVuRepository;
            _kPI_NhomTieuChiRepository = kPI_NhomTieuChiRepository;
            _dbContext = dbContext;
            _taiLieuDinhKemService = taiLieuDinhKemService;
        }

        public async Task<PagedList<KPI_NhiemVuDto>> GetData(KPI_NhiemVuSearch search)
        {
            var query = from q in GetQueryable()
                        
                        select new KPI_NhiemVuDto()
                        {
                            IdNhiemVuTraVe = q.IdNhiemVuTraVe,
							TenNhiemVuDayDu = q.TenNhiemVuDayDu,
							TenNhiemVuRutGon = q.TenNhiemVuRutGon,
							MaLoaiNhiemVu = q.MaLoaiNhiemVu,
							TenLoaiNhiemVu = q.TenLoaiNhiemVu,
							NhiemVuTrongTam = q.NhiemVuTrongTam,
							ThoiHan = q.ThoiHan,
							NgayHoanThanh = q.NgayHoanThanh,
							NgayVanBan = q.NgayVanBan,
							MaNhiemVuCha = q.MaNhiemVuCha,
							LoaiHanXuLy = q.LoaiHanXuLy,
							Email = q.Email,
							IdDotTheoDoiDanhGia = q.IdDotTheoDoiDanhGia,
							IdLyLich = q.IdLyLich,
							IdPhongBan = q.IdPhongBan,
							TenPhongBan = q.TenPhongBan,
							IdNguoiXuLy = q.IdNguoiXuLy,
							TenNguoiXuLy = q.TenNguoiXuLy,
							IdLinhVuc = q.IdLinhVuc,
							TenLinhVuc = q.TenLinhVuc,
							SoLanCapNhatTienDo = q.SoLanCapNhatTienDo,
							IsHoanThanh = q.IsHoanThanh,
							IsDaDuyet = q.IsDaDuyet,
							Status = q.Status,
							KetQuaXuLyMoiNhat = q.KetQuaXuLyMoiNhat,
							KetQuaTuXepLoai = q.KetQuaTuXepLoai,
							KetQuaPhoPhongXepLoai = q.KetQuaPhoPhongXepLoai,
							KetQuaLanhDaoXepLoai = q.KetQuaLanhDaoXepLoai,
							Type = q.Type,
							TypeCaNhanTruongBan = q.TypeCaNhanTruongBan,
							EmailsNguoiThucHien = q.EmailsNguoiThucHien,
							TimeDongBo = q.TimeDongBo,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                        };
            if(search != null )
            {
				if(!string.IsNullOrEmpty(search.IdNhiemVuTraVe))
				{
                    if (Guid.TryParse(search.IdNhiemVuTraVe, out Guid searchIdNhiemVuTraVe))
                    {
					    query = query.Where(x => x.IdNhiemVuTraVe == searchIdNhiemVuTraVe);
                    }
				}
				if(!string.IsNullOrEmpty(search.TenNhiemVuDayDu))
				{
					query = query.Where(x => EF.Functions.Like(x.TenNhiemVuDayDu, $"%{search.TenNhiemVuDayDu}%"));
				}
				if(!string.IsNullOrEmpty(search.TenNhiemVuRutGon))
				{
					query = query.Where(x => EF.Functions.Like(x.TenNhiemVuRutGon, $"%{search.TenNhiemVuRutGon}%"));
				}
				if(!string.IsNullOrEmpty(search.MaLoaiNhiemVu))
				{
                    if (Guid.TryParse(search.MaLoaiNhiemVu, out Guid searchMaLoaiNhiemVu))
                    {
					    query = query.Where(x => x.MaLoaiNhiemVu == searchMaLoaiNhiemVu);
                    }
				}
				if(!string.IsNullOrEmpty(search.TenLoaiNhiemVu))
				{
					query = query.Where(x => EF.Functions.Like(x.TenLoaiNhiemVu, $"%{search.TenLoaiNhiemVu}%"));
				}
				if(!string.IsNullOrEmpty(search.NhiemVuTrongTam))
				{
					query = query.Where(x => EF.Functions.Like(x.NhiemVuTrongTam, $"%{search.NhiemVuTrongTam}%"));
				}
				if(search.ThoiHanFrom.HasValue)
				{
					query = query.Where(x => x.ThoiHan >= search.ThoiHanFrom);
				}
				if(search.ThoiHanTo.HasValue)
				{
					query = query.Where(x => x.ThoiHan <= search.ThoiHanTo);
				}
				if(search.NgayHoanThanhFrom.HasValue)
				{
					query = query.Where(x => x.NgayHoanThanh >= search.NgayHoanThanhFrom);
				}
				if(search.NgayHoanThanhTo.HasValue)
				{
					query = query.Where(x => x.NgayHoanThanh <= search.NgayHoanThanhTo);
				}
				if(search.NgayVanBanFrom.HasValue)
				{
					query = query.Where(x => x.NgayVanBan >= search.NgayVanBanFrom);
				}
				if(search.NgayVanBanTo.HasValue)
				{
					query = query.Where(x => x.NgayVanBan <= search.NgayVanBanTo);
				}
				if(!string.IsNullOrEmpty(search.MaNhiemVuCha))
				{
                    if (Guid.TryParse(search.MaNhiemVuCha, out Guid searchMaNhiemVuCha))
                    {
					    query = query.Where(x => x.MaNhiemVuCha == searchMaNhiemVuCha);
                    }
				}
				if(!string.IsNullOrEmpty(search.LoaiHanXuLy))
				{
					query = query.Where(x => EF.Functions.Like(x.LoaiHanXuLy, $"%{search.LoaiHanXuLy}%"));
				}
				if(!string.IsNullOrEmpty(search.Email))
				{
					query = query.Where(x => EF.Functions.Like(x.Email, $"%{search.Email}%"));
				}
				if(!string.IsNullOrEmpty(search.IdDotTheoDoiDanhGia))
				{
                    if (Guid.TryParse(search.IdDotTheoDoiDanhGia, out Guid searchIdDotTheoDoiDanhGia))
                    {
					    query = query.Where(x => x.IdDotTheoDoiDanhGia == searchIdDotTheoDoiDanhGia);
                    }
				}
				if(!string.IsNullOrEmpty(search.IdLyLich))
				{
                    if (Guid.TryParse(search.IdLyLich, out Guid searchIdLyLich))
                    {
					    query = query.Where(x => x.IdLyLich == searchIdLyLich);
                    }
				}
				if(!string.IsNullOrEmpty(search.IdPhongBan))
				{
                    if (Guid.TryParse(search.IdPhongBan, out Guid searchIdPhongBan))
                    {
					    query = query.Where(x => x.IdPhongBan == searchIdPhongBan);
                    }
				}
				if(!string.IsNullOrEmpty(search.TenPhongBan))
				{
					query = query.Where(x => EF.Functions.Like(x.TenPhongBan, $"%{search.TenPhongBan}%"));
				}
				if(!string.IsNullOrEmpty(search.IdNguoiXuLy))
				{
                    if (Guid.TryParse(search.IdNguoiXuLy, out Guid searchIdNguoiXuLy))
                    {
					    query = query.Where(x => x.IdNguoiXuLy == searchIdNguoiXuLy);
                    }
				}
				if(!string.IsNullOrEmpty(search.TenNguoiXuLy))
				{
					query = query.Where(x => EF.Functions.Like(x.TenNguoiXuLy, $"%{search.TenNguoiXuLy}%"));
				}
				if(!string.IsNullOrEmpty(search.IdLinhVuc))
				{
                    if (Guid.TryParse(search.IdLinhVuc, out Guid searchIdLinhVuc))
                    {
					    query = query.Where(x => x.IdLinhVuc == searchIdLinhVuc);
                    }
				}
				if(!string.IsNullOrEmpty(search.TenLinhVuc))
				{
					query = query.Where(x => EF.Functions.Like(x.TenLinhVuc, $"%{search.TenLinhVuc}%"));
				}
				if(search.SoLanCapNhatTienDo.HasValue)
				{
					query = query.Where(x => x.SoLanCapNhatTienDo == search.SoLanCapNhatTienDo);
				}
				if(search.IsHoanThanh.HasValue)
				{
					query = query.Where(x => x.IsHoanThanh == search.IsHoanThanh);
				}
				if(search.IsDaDuyet.HasValue)
				{
					query = query.Where(x => x.IsDaDuyet == search.IsDaDuyet);
				}
				if(!string.IsNullOrEmpty(search.Status))
				{
					query = query.Where(x => EF.Functions.Like(x.Status, $"%{search.Status}%"));
				}
				if(!string.IsNullOrEmpty(search.KetQuaXuLyMoiNhat))
				{
					query = query.Where(x => EF.Functions.Like(x.KetQuaXuLyMoiNhat, $"%{search.KetQuaXuLyMoiNhat}%"));
				}
				if(!string.IsNullOrEmpty(search.KetQuaTuXepLoai))
				{
					query = query.Where(x => EF.Functions.Like(x.KetQuaTuXepLoai, $"%{search.KetQuaTuXepLoai}%"));
				}
				if(!string.IsNullOrEmpty(search.KetQuaPhoPhongXepLoai))
				{
					query = query.Where(x => EF.Functions.Like(x.KetQuaPhoPhongXepLoai, $"%{search.KetQuaPhoPhongXepLoai}%"));
				}
				if(!string.IsNullOrEmpty(search.KetQuaLanhDaoXepLoai))
				{
					query = query.Where(x => EF.Functions.Like(x.KetQuaLanhDaoXepLoai, $"%{search.KetQuaLanhDaoXepLoai}%"));
				}
				if(!string.IsNullOrEmpty(search.Type))
				{
					query = query.Where(x => EF.Functions.Like(x.Type, $"%{search.Type}%"));
				}
				if(!string.IsNullOrEmpty(search.TypeCaNhanTruongBan))
				{
					query = query.Where(x => EF.Functions.Like(x.TypeCaNhanTruongBan, $"%{search.TypeCaNhanTruongBan}%"));
				}
				if(!string.IsNullOrEmpty(search.EmailsNguoiThucHien))
				{
					query = query.Where(x => EF.Functions.Like(x.EmailsNguoiThucHien, $"%{search.EmailsNguoiThucHien}%"));
				}
				if(search.TimeDongBoFrom.HasValue)
				{
					query = query.Where(x => x.TimeDongBo >= search.TimeDongBoFrom);
				}
				if(search.TimeDongBoTo.HasValue)
				{
					query = query.Where(x => x.TimeDongBo <= search.TimeDongBoTo);
				}
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<KPI_NhiemVuDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_NhiemVuDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        
                        select new KPI_NhiemVuDto()
                        {
                            IdNhiemVuTraVe = q.IdNhiemVuTraVe,
							TenNhiemVuDayDu = q.TenNhiemVuDayDu,
							TenNhiemVuRutGon = q.TenNhiemVuRutGon,
							MaLoaiNhiemVu = q.MaLoaiNhiemVu,
							TenLoaiNhiemVu = q.TenLoaiNhiemVu,
							NhiemVuTrongTam = q.NhiemVuTrongTam,
							ThoiHan = q.ThoiHan,
							NgayHoanThanh = q.NgayHoanThanh,
							NgayVanBan = q.NgayVanBan,
							MaNhiemVuCha = q.MaNhiemVuCha,
							LoaiHanXuLy = q.LoaiHanXuLy,
							Email = q.Email,
							IdDotTheoDoiDanhGia = q.IdDotTheoDoiDanhGia,
							IdLyLich = q.IdLyLich,
							IdPhongBan = q.IdPhongBan,
							TenPhongBan = q.TenPhongBan,
							IdNguoiXuLy = q.IdNguoiXuLy,
							TenNguoiXuLy = q.TenNguoiXuLy,
							IdLinhVuc = q.IdLinhVuc,
							TenLinhVuc = q.TenLinhVuc,
							SoLanCapNhatTienDo = q.SoLanCapNhatTienDo,
							IsHoanThanh = q.IsHoanThanh,
							IsDaDuyet = q.IsDaDuyet,
							Status = q.Status,
							KetQuaXuLyMoiNhat = q.KetQuaXuLyMoiNhat,
							KetQuaTuXepLoai = q.KetQuaTuXepLoai,
							KetQuaPhoPhongXepLoai = q.KetQuaPhoPhongXepLoai,
							KetQuaLanhDaoXepLoai = q.KetQuaLanhDaoXepLoai,
							Type = q.Type,
							TypeCaNhanTruongBan = q.TypeCaNhanTruongBan,
							EmailsNguoiThucHien = q.EmailsNguoiThucHien,
							TimeDongBo = q.TimeDongBo,
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

        public async Task<List<KPI_NhiemVuDto>> GetListByTypeAndLyLich(Guid idLyLich, string type, Guid idDotTheoDoiDanhGia)
        {
            var query = from q in GetQueryable().Where(x => x.IdLyLich == idLyLich && x.Type == type && x.IdDotTheoDoiDanhGia == idDotTheoDoiDanhGia)
                        select new KPI_NhiemVuDto()
                        {
                            IdNhiemVuTraVe = q.IdNhiemVuTraVe,
                            TenNhiemVuDayDu = q.TenNhiemVuDayDu,
                            TenNhiemVuRutGon = q.TenNhiemVuRutGon,
                            MaLoaiNhiemVu = q.MaLoaiNhiemVu,
                            TenLoaiNhiemVu = q.TenLoaiNhiemVu,
                            NhiemVuTrongTam = q.NhiemVuTrongTam,
                            ThoiHan = q.ThoiHan,
                            NgayHoanThanh = q.NgayHoanThanh,
                            NgayVanBan = q.NgayVanBan,
                            MaNhiemVuCha = q.MaNhiemVuCha,
                            LoaiHanXuLy = q.LoaiHanXuLy,
                            Email = q.Email,
                            IdDotTheoDoiDanhGia = q.IdDotTheoDoiDanhGia,
                            IdLyLich = q.IdLyLich,
                            IdPhongBan = q.IdPhongBan,
                            TenPhongBan = q.TenPhongBan,
                            IdNguoiXuLy = q.IdNguoiXuLy,
                            TenNguoiXuLy = q.TenNguoiXuLy,
                            IdLinhVuc = q.IdLinhVuc,
                            TenLinhVuc = q.TenLinhVuc,
                            SoLanCapNhatTienDo = q.SoLanCapNhatTienDo,
                            IsHoanThanh = q.IsHoanThanh,
                            IsDaDuyet = q.IsDaDuyet,
                            Status = q.Status,
                            KetQuaXuLyMoiNhat = q.KetQuaXuLyMoiNhat,
                            KetQuaTuXepLoai = q.KetQuaTuXepLoai,
                            KetQuaPhoPhongXepLoai = q.KetQuaPhoPhongXepLoai,
                            KetQuaLanhDaoXepLoai = q.KetQuaLanhDaoXepLoai,
                            Type = q.Type,
                            TypeCaNhanTruongBan = q.TypeCaNhanTruongBan,
                            EmailsNguoiThucHien = q.EmailsNguoiThucHien,
                            TimeDongBo = q.TimeDongBo,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                            DiemTheoBoTieuChi = q.DiemTheoBoTieuChi,
                            ChamDiemSoLuong_HoanThanh = q.ChamDiemSoLuong_HoanThanh,
                            ChamDiemSoLuong_KhongHoanThanh = q.ChamDiemSoLuong_KhongHoanThanh,
                            ChamDiemSoLuong_Diem = q.ChamDiemSoLuong_Diem,
                            ChamDiemChatLuong_KhongDat = q.ChamDiemChatLuong_KhongDat,
                            ChamDiemChatLuong_SoDiemConLai = q.ChamDiemChatLuong_SoDiemConLai,
                            ChamDiemChatLuong_Diem = q.ChamDiemChatLuong_Diem,
                            ChamDiemTienDo_KhongDat = q.ChamDiemTienDo_KhongDat,
                            ChamDiemTienDo_SoDiemConLai = q.ChamDiemTienDo_SoDiemConLai,
                            ChamDiemTienDo_Diem = q.ChamDiemTienDo_Diem,
                            GhiChuGiaTrinh = q.GhiChuGiaTrinh,
                        };
            
            var list = await query.OrderByDescending(x => x.CreatedDate).ToListAsync();
            var ids = list.Select(x => (Guid?)x.Id).ToList();
            var dauRaList = await _kPI_DauRaNhiemVuRepository.GetQueryable()
                             .Where(d => ids.Contains(d.IdNhiemVu))
                             .ToListAsync();

            var dauRaIds = dauRaList.Select(x => x.Id).ToList();
            var attachmentList = await _dbContext.TaiLieuDinhKem
                .Where(x => x.ItemId.HasValue
                    && dauRaIds.Contains(x.ItemId.Value)
                    && x.LoaiTaiLieu == LoaiTaiLieuConstant.KPI_DAU_RA_NHIEM_VU
                    && !x.IsDeleted)
                .ToListAsync();

            var tieuChiIds = dauRaList.Where(x => x.TieuChiId.HasValue).Select(x => x.TieuChiId!.Value).Distinct().ToList();
            
            // Load leaf tieuChi nodes
            var leafTieuChiNodes = await _kPI_NhomTieuChiRepository.GetQueryable()
                              .Where(t => tieuChiIds.Contains(t.Id))
                              .ToListAsync();

            // Collect all parent IDs to build full paths
            var allParentIds = new HashSet<Guid>();
            foreach (var node in leafTieuChiNodes)
            {
                if (node.ParentID.HasValue)
                    allParentIds.Add(node.ParentID.Value);
            }

            // Iteratively load all ancestor nodes
            var allNodesDict = leafTieuChiNodes.ToDictionary(n => n.Id);
            var parentIdsToLoad = allParentIds.Where(pid => !allNodesDict.ContainsKey(pid)).ToList();
            while (parentIdsToLoad.Count > 0)
            {
                var parentNodes = await _kPI_NhomTieuChiRepository.GetQueryable()
                    .Where(t => parentIdsToLoad.Contains(t.Id))
                    .ToListAsync();
                
                if (parentNodes.Count == 0) break;

                var nextParentIds = new HashSet<Guid>();
                foreach (var pNode in parentNodes)
                {
                    allNodesDict[pNode.Id] = pNode;
                    if (pNode.ParentID.HasValue && !allNodesDict.ContainsKey(pNode.ParentID.Value))
                        nextParentIds.Add(pNode.ParentID.Value);
                }
                parentIdsToLoad = nextParentIds.ToList();
            }

            // Build full path for each leaf tieuChi by traversing up the parent chain
            var tieuChiDict = new Dictionary<Guid, string>();
            foreach (var leaf in leafTieuChiNodes)
            {
                var pathParts = new List<string>();
                var current = leaf;
                while (current != null)
                {
                    var name = current.TenNhomTieuChi ?? current.CongViecChiTiet ?? current.SanPhamDauRa ?? "";
                    if (!string.IsNullOrEmpty(name))
                        pathParts.Insert(0, name);
                    
                    if (current.ParentID.HasValue && allNodesDict.TryGetValue(current.ParentID.Value, out var parentNode))
                        current = parentNode;
                    else
                        current = null;
                }
                tieuChiDict[leaf.Id] = pathParts.Count > 0 ? string.Join(" / ", pathParts) : "";
            }

            foreach (var dr in dauRaList)
            {
                if (dr.TieuChiId.HasValue && tieuChiDict.TryGetValue(dr.TieuChiId.Value, out var tenTieuChi))
                {
                    dr.TenTieuChi = tenTieuChi;
                }
            }

            foreach (var item in list) {
                item.SanPhamDauRaList = dauRaList.Where(d => d.IdNhiemVu == item.Id).Select(d => d.TenSanPhamDauRa).ToList();
                item.DanhSachDauRa = dauRaList
                    .Where(d => d.IdNhiemVu == item.Id)
                    .Select(d => MapDauRaDto(d, attachmentList.Where(a => a.ItemId == d.Id)))
                    .ToList();
            }
            return list;
        }

        private static KPI_DauRaNhiemVuDto MapDauRaDto(
            KPI_DauRaNhiemVu source,
            IEnumerable<TaiLieuDinhKem> attachments)
        {
            return new KPI_DauRaNhiemVuDto
            {
                Id = source.Id,
                IdNhiemVu = source.IdNhiemVu,
                IdThoiDiemDongBoVanBan = source.IdThoiDiemDongBoVanBan,
                IdDotDanhGia = source.IdDotDanhGia,
                TypeVanBan = source.TypeVanBan,
                TenSanPhamDauRa = source.TenSanPhamDauRa,
                TieuChiId = source.TieuChiId,
                DiemTheoBoTieuChi = source.DiemTheoBoTieuChi,
                ChamDiemSoLuong_HoanThanh = source.ChamDiemSoLuong_HoanThanh,
                ChamDiemSoLuong_KhongHoanThanh = source.ChamDiemSoLuong_KhongHoanThanh,
                ChamDiemSoLuong_Diem = source.ChamDiemSoLuong_Diem,
                ChamDiemChatLuong_KhongDat = source.ChamDiemChatLuong_KhongDat,
                ChamDiemChatLuong_SoDiemConLai = source.ChamDiemChatLuong_SoDiemConLai,
                ChamDiemChatLuong_Diem = source.ChamDiemChatLuong_Diem,
                ChamDiemTienDo_KhongDat = source.ChamDiemTienDo_KhongDat,
                ChamDiemTienDo_SoDiemConLai = source.ChamDiemTienDo_SoDiemConLai,
                ChamDiemTienDo_Diem = source.ChamDiemTienDo_Diem,
                GhiChuGiaTrinh = source.GhiChuGiaTrinh,
                TenTieuChi = source.TenTieuChi,
                CreatedBy = source.CreatedBy,
                CreatedId = source.CreatedId,
                UpdatedBy = source.UpdatedBy,
                UpdatedId = source.UpdatedId,
                IsDeleted = source.IsDeleted,
                DeletedId = source.DeletedId,
                DeletedDate = source.DeletedDate,
                CreatedDate = source.CreatedDate,
                UpdatedDate = source.UpdatedDate,
                TaiLieuDinhKem = attachments.Select(x => new TaiLieuDinhKemDto
                {
                    Id = x.Id,
                    ItemId = x.ItemId,
                    TenTaiLieu = x.TenTaiLieu,
                    Extension = x.Extension,
                    KichThuoc = x.KichThuoc,
                    DuongDanFile = x.DuongDanFile,
                    LoaiTaiLieu = x.LoaiTaiLieu,
                }).ToList(),
            };
        }

        public async Task<KPI_NhiemVuSaveWithAttachmentsResponse> SaveWithAttachmentsAsync(
            KPI_NhiemVuSaveWithAttachmentsRequest request,
            Guid? userId)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Payload))
                throw new ArgumentException("Payload lưu nhiệm vụ không được để trống.");

            var items = JsonSerializer.Deserialize<List<KPI_NhiemVuPhatSinhCreateDto>>(
                request.Payload,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (items == null)
                throw new ArgumentException("Payload lưu nhiệm vụ không hợp lệ.");
            if (items.Any(x => string.IsNullOrWhiteSpace(x.TenNhiemVuDayDu)))
                throw new ArgumentException("Miêu tả nhiệm vụ không được để trống.");

            request.Files ??= new List<Microsoft.AspNetCore.Http.IFormFile>();
            request.FileProductKeys ??= new List<string>();
            if (request.Files.Count != request.FileProductKeys.Count)
                throw new ArgumentException("Danh sách Files và FileProductKeys phải có cùng số phần tử.");

            var products = items.SelectMany(x => x.DanhSachDauRa ?? new List<KPI_DauRaNhiemVuCreateDto>()).ToList();
            if (products.Any(x => string.IsNullOrWhiteSpace(x.TenSanPhamDauRa)))
                throw new ArgumentException("Tên sản phẩm đầu ra không được để trống.");
            var productKeys = products
                .Where(x => !string.IsNullOrWhiteSpace(x.ClientKey))
                .Select(x => x.ClientKey!)
                .ToList();
            if (productKeys.Count != products.Count)
                throw new ArgumentException("Mỗi sản phẩm phải có ClientKey.");
            if (productKeys.Count != productKeys.Distinct(StringComparer.Ordinal).Count())
                throw new ArgumentException("ClientKey của sản phẩm phải là duy nhất.");

            var productByKey = products
                .Where(x => !string.IsNullOrWhiteSpace(x.ClientKey))
                .ToDictionary(x => x.ClientKey!, StringComparer.Ordinal);
            var totalNewBytes = request.Files.Sum(x => x?.Length ?? 0);
            if (totalNewBytes > 200L * 1024 * 1024)
                throw new ArgumentException("Tổng dung lượng file mới không được vượt quá 200 MB.");

            foreach (var file in request.Files)
            {
                if (file == null || file.Length == 0)
                    throw new ArgumentException("File tải lên bị rỗng.");
                if (file.Length > 10L * 1024 * 1024)
                    throw new ArgumentException("Dung lượng file không được vượt quá 10 MB.");
            }
            foreach (var key in request.FileProductKeys)
            {
                if (string.IsNullOrWhiteSpace(key) || !productByKey.ContainsKey(key))
                    throw new ArgumentException("File được gắn với sản phẩm không hợp lệ.");
            }

            var filesByProductKey = request.Files
                .Select((file, index) => new { file, key = request.FileProductKeys[index] })
                .GroupBy(x => x.key, StringComparer.Ordinal)
                .ToDictionary(x => x.Key, x => x.Select(y => y.file).ToList(), StringComparer.Ordinal);

            var existingProductIds = products
                .Where(x => x.Id.HasValue && x.Id.Value != Guid.Empty)
                .Select(x => x.Id!.Value)
                .Distinct()
                .ToList();
            var existingProducts = existingProductIds.Count == 0
                ? new List<KPI_DauRaNhiemVu>()
                : await _dbContext.KPI_DauRaNhiemVu
                    .Where(x => existingProductIds.Contains(x.Id) && !x.IsDeleted)
                    .ToListAsync();
            var existingProductById = existingProducts.ToDictionary(x => x.Id);

            var attachmentIds = products
                .Where(x => x.AttachmentsTouched)
                .SelectMany(x => x.KeptAttachmentIds ?? new List<Guid>())
                .Distinct()
                .ToList();
            var existingAttachments = attachmentIds.Count == 0
                ? new List<TaiLieuDinhKem>()
                : await _dbContext.TaiLieuDinhKem
                    .Where(x => attachmentIds.Contains(x.Id) && !x.IsDeleted)
                    .ToListAsync();
            var existingAttachmentsByProduct = existingProductIds.Count == 0
                ? new Dictionary<Guid, List<TaiLieuDinhKem>>()
                : await _dbContext.TaiLieuDinhKem
                    .Where(x => x.ItemId.HasValue
                        && existingProductIds.Contains(x.ItemId.Value)
                        && x.LoaiTaiLieu == LoaiTaiLieuConstant.KPI_DAU_RA_NHIEM_VU
                        && !x.IsDeleted)
                    .GroupBy(x => x.ItemId!.Value)
                    .ToDictionaryAsync(x => x.Key, x => x.ToList());

            ValidateAttachmentCounts(products, existingProductById, existingAttachmentsByProduct, filesByProductKey);
            await ValidateSheetPermissionAsync(items, userId);

            var mappings = new List<KPI_NhiemVuAttachmentMappingDto>();
            var writtenPaths = new List<string>();
            await using var transaction = await _dbContext.Database.BeginTransactionAsync();
            try
            {
                foreach (var item in items)
                {
                    var task = await AddOrUpdateTaskAsync(item);
                    foreach (var product in item.DanhSachDauRa ?? new List<KPI_DauRaNhiemVuCreateDto>())
                    {
                        var dauRa = AddOrUpdateProduct(task, product, existingProductById);
                        var productAttachmentIds = new List<Guid>();
                        var key = product.ClientKey ?? string.Empty;
                        var currentAttachments = existingAttachmentsByProduct.TryGetValue(dauRa.Id, out var current)
                            ? current
                            : new List<TaiLieuDinhKem>();

                        if (product.AttachmentsTouched)
                        {
                            var keepIds = (product.KeptAttachmentIds ?? new List<Guid>()).Distinct().ToHashSet();
                            foreach (var attachment in currentAttachments.Where(x => !keepIds.Contains(x.Id)))
                            {
                                attachment.IsDeleted = true;
                                attachment.DeletedId = userId;
                                attachment.DeletedDate = DateTime.Now;
                            }

                            foreach (var keptId in keepIds)
                            {
                                var kept = existingAttachments.FirstOrDefault(x => x.Id == keptId);
                                if (kept == null || kept.ItemId != dauRa.Id || kept.LoaiTaiLieu != LoaiTaiLieuConstant.KPI_DAU_RA_NHIEM_VU)
                                    throw new UnauthorizedAccessException("Không thể giữ tài liệu thuộc sản phẩm hoặc phiếu khác.");
                                productAttachmentIds.Add(kept.Id);
                            }
                        }
                        else
                        {
                            productAttachmentIds.AddRange(currentAttachments.Select(x => x.Id));
                        }

                        if (filesByProductKey.TryGetValue(key, out var productFiles))
                        {
                            foreach (var file in productFiles)
                            {
                                await using var stream = file.OpenReadStream();
                                var attachment = await _taiLieuDinhKemService.UploadAndCreateKpiAttachmentAsync(
                                    stream, file.FileName, dauRa.Id, userId);
                                _dbContext.TaiLieuDinhKem.Add(attachment);
                                writtenPaths.Add(attachment.DuongDanFile);
                                productAttachmentIds.Add(attachment.Id);
                            }
                        }

                        mappings.Add(new KPI_NhiemVuAttachmentMappingDto
                        {
                            ClientKey = key,
                            ProductId = dauRa.Id,
                            AttachmentIds = productAttachmentIds,
                        });
                    }
                }

                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
                return new KPI_NhiemVuSaveWithAttachmentsResponse { Items = mappings };
            }
            catch
            {
                await transaction.RollbackAsync();
                foreach (var path in writtenPaths)
                    _taiLieuDinhKemService.DeletePhysicalFile(path);
                throw;
            }
        }

        private async Task ValidateSheetPermissionAsync(
            IEnumerable<KPI_NhiemVuPhatSinhCreateDto> items,
            Guid? userId)
        {
            var first = items.FirstOrDefault();
            if (first?.IdPhieuDanhGia is Guid phieuId && phieuId != Guid.Empty)
            {
                var phieu = await _dbContext.KPI_PhieuDanhGia.FirstOrDefaultAsync(x => x.Id == phieuId && !x.IsDeleted);
                if (phieu == null)
                    throw new UnauthorizedAccessException("Phiếu đánh giá không tồn tại.");
                if (!string.IsNullOrWhiteSpace(phieu.TrangThai)
                    && phieu.TrangThai == Hinet.Service.KPI_PhieuDanhGiaService.Constant.TrangThaiPhieuConstant.DaDuyet)
                    throw new UnauthorizedAccessException("Phiếu đánh giá đã duyệt, không thể sửa.");
                if (items.Any(x => x.IdPhieuDanhGia.HasValue && x.IdPhieuDanhGia != phieuId))
                    throw new UnauthorizedAccessException("Dữ liệu nhiệm vụ không cùng phiếu đánh giá.");

                var taskIds = items.Where(x => x.Id.HasValue && x.Id.Value != Guid.Empty)
                    .Select(x => x.Id!.Value)
                    .Distinct()
                    .ToList();
                var tasks = taskIds.Count == 0
                    ? new List<KPI_NhiemVu>()
                    : await _dbContext.KPI_NhiemVu.Where(x => taskIds.Contains(x.Id) && !x.IsDeleted).ToListAsync();
                if (tasks.Any(x => x.IdPhieuDanhGia.HasValue && x.IdPhieuDanhGia != phieuId
                    || x.IdLyLich != phieu.IdLyLich
                    || x.IdDotTheoDoiDanhGia != phieu.IdDotDanhGia))
                    throw new UnauthorizedAccessException("Không thể sửa nhiệm vụ thuộc phiếu hoặc đợt đánh giá khác.");

                // Cho phép người dùng lưu khi phiếu chưa duyệt và các nhiệm vụ thuộc đúng phiếu/đợt
                if (userId.HasValue && phieu.IdLyLich.HasValue)
                {
                    var isOwner = await _dbContext.KPI_LyLich2C.AnyAsync(x => x.Id == phieu.IdLyLich && x.UserId == userId);
                    if (!isOwner)
                    {
                        // Kiểm tra nếu là cấp trên đang tham gia quy trình xử lý hoặc tài khoản có quyền thao tác trên phiếu
                        var hasProcess = await _dbContext.KPI_QuaTrinhXuLyPhieuDanhGia.AnyAsync(x => x.IdPhieuDanhGia == phieuId && (x.IdNguoiGui == userId || x.IdNguoiXuLy == userId));
                        if (!hasProcess && !string.IsNullOrWhiteSpace(phieu.TrangThai) && phieu.TrangThai == Hinet.Service.KPI_PhieuDanhGiaService.Constant.TrangThaiPhieuConstant.KhoiTao)
                        {
                            throw new UnauthorizedAccessException("Bạn không có quyền sửa phiếu đánh giá này.");
                        }
                    }
                }
            }
            else if (userId.HasValue && first?.IdLyLich is Guid idLyLich
                && !await _dbContext.KPI_LyLich2C.AnyAsync(x => x.Id == idLyLich && x.UserId == userId))
            {
                // Cho phép lưu khi khởi tạo nhiệm vụ cho lý lịch
            }
        }

        private void ValidateAttachmentCounts(
            IEnumerable<KPI_DauRaNhiemVuCreateDto> products,
            IReadOnlyDictionary<Guid, KPI_DauRaNhiemVu> existingProducts,
            IReadOnlyDictionary<Guid, List<TaiLieuDinhKem>> existingAttachments,
            IReadOnlyDictionary<string, List<Microsoft.AspNetCore.Http.IFormFile>> filesByProductKey)
        {
            foreach (var product in products)
            {
                var existingCount = 0;
                if (product.Id.HasValue && existingProducts.ContainsKey(product.Id.Value)
                    && existingAttachments.TryGetValue(product.Id.Value, out var attachments))
                    existingCount = product.AttachmentsTouched
                        ? attachments.Count(x => (product.KeptAttachmentIds ?? new List<Guid>()).Contains(x.Id))
                        : attachments.Count;

                var newCount = !string.IsNullOrWhiteSpace(product.ClientKey)
                    && filesByProductKey.TryGetValue(product.ClientKey, out var files)
                    ? files.Count
                    : 0;
                if (existingCount + newCount > 20)
                    throw new ArgumentException("Mỗi sản phẩm chỉ được giữ tối đa 20 file.");
            }
        }

        private async Task<KPI_NhiemVu> AddOrUpdateTaskAsync(KPI_NhiemVuPhatSinhCreateDto item)
        {
            KPI_NhiemVu task;
            if (item.Id.HasValue && item.Id.Value != Guid.Empty)
            {
                task = await _dbContext.KPI_NhiemVu.FirstOrDefaultAsync(x => x.Id == item.Id && !x.IsDeleted)
                    ?? throw new UnauthorizedAccessException("Nhiệm vụ không tồn tại hoặc đã bị xóa.");
                if (item.IdPhieuDanhGia.HasValue && task.IdPhieuDanhGia.HasValue
                    && item.IdPhieuDanhGia != task.IdPhieuDanhGia)
                    throw new UnauthorizedAccessException("Không thể sửa nhiệm vụ thuộc phiếu đánh giá khác.");
                if (item.IdLyLich.HasValue && task.IdLyLich.HasValue && item.IdLyLich != task.IdLyLich)
                    throw new UnauthorizedAccessException("Không thể sửa nhiệm vụ thuộc hồ sơ khác.");
                if (item.IdDotTheoDoiDanhGia.HasValue && task.IdDotTheoDoiDanhGia.HasValue
                    && item.IdDotTheoDoiDanhGia != task.IdDotTheoDoiDanhGia)
                    throw new UnauthorizedAccessException("Không thể sửa nhiệm vụ thuộc đợt đánh giá khác.");
            }
            else
            {
                task = new KPI_NhiemVu { CreatedDate = DateTime.Now };
                _dbContext.KPI_NhiemVu.Add(task);
            }

            task.TenNhiemVuDayDu = item.TenNhiemVuDayDu;
            task.IdLyLich = item.IdLyLich;
            task.IdDotTheoDoiDanhGia = item.IdDotTheoDoiDanhGia;
            task.IdPhieuDanhGia = item.IdPhieuDanhGia;
            task.Type = string.IsNullOrWhiteSpace(item.TypeNhiemVu) ? "PHATSINH" : item.TypeNhiemVu;
            return task;
        }

        private KPI_DauRaNhiemVu AddOrUpdateProduct(
            KPI_NhiemVu task,
            KPI_DauRaNhiemVuCreateDto product,
            IReadOnlyDictionary<Guid, KPI_DauRaNhiemVu> existingProducts)
        {
            KPI_DauRaNhiemVu dauRa;
            if (product.Id.HasValue && product.Id.Value != Guid.Empty)
            {
                if (!existingProducts.TryGetValue(product.Id.Value, out dauRa!) || dauRa.IdNhiemVu != task.Id)
                    throw new UnauthorizedAccessException("Không thể sửa sản phẩm thuộc nhiệm vụ khác.");
            }
            else
            {
                dauRa = new KPI_DauRaNhiemVu { IdNhiemVu = task.Id, CreatedDate = DateTime.Now };
                _dbContext.KPI_DauRaNhiemVu.Add(dauRa);
            }

            dauRa.IdNhiemVu = task.Id;
            dauRa.IdDotDanhGia = task.IdDotTheoDoiDanhGia;
            dauRa.TenSanPhamDauRa = product.TenSanPhamDauRa;
            dauRa.TieuChiId = product.TieuChiId;
            dauRa.DiemTheoBoTieuChi = product.DiemTheoBoTieuChi;
            dauRa.ChamDiemSoLuong_HoanThanh = product.ChamDiemSoLuong_HoanThanh ?? product.DiemTheoBoTieuChi;
            dauRa.ChamDiemSoLuong_KhongHoanThanh = product.ChamDiemSoLuong_KhongHoanThanh ?? 0;
            dauRa.ChamDiemSoLuong_Diem = product.ChamDiemSoLuong_Diem ?? (product.DiemTheoBoTieuChi > 0 ? 100 : 0);
            dauRa.ChamDiemChatLuong_KhongDat = product.ChamDiemChatLuong_KhongDat ?? 0;
            dauRa.ChamDiemChatLuong_SoDiemConLai = product.ChamDiemChatLuong_SoDiemConLai ?? product.DiemTheoBoTieuChi;
            dauRa.ChamDiemChatLuong_Diem = product.ChamDiemChatLuong_Diem ?? (product.DiemTheoBoTieuChi > 0 ? 100 : 0);
            dauRa.ChamDiemTienDo_KhongDat = product.ChamDiemTienDo_KhongDat ?? 0;
            dauRa.ChamDiemTienDo_SoDiemConLai = product.ChamDiemTienDo_SoDiemConLai ?? product.DiemTheoBoTieuChi;
            dauRa.ChamDiemTienDo_Diem = product.ChamDiemTienDo_Diem ?? (product.DiemTheoBoTieuChi > 0 ? 100 : 0);
            dauRa.GhiChuGiaTrinh = product.GhiChuGiaTrinh;
            return dauRa;
        }

        public async Task DeleteWithAttachmentsAsync(Guid id, Guid? userId)
        {
            var task = await _dbContext.KPI_NhiemVu.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted)
                ?? throw new KeyNotFoundException("Không tìm thấy nhiệm vụ.");
            var products = await _dbContext.KPI_DauRaNhiemVu
                .Where(x => x.IdNhiemVu == id && !x.IsDeleted)
                .ToListAsync();
            var productIds = products.Select(x => x.Id).ToList();
            var attachments = await _dbContext.TaiLieuDinhKem
                .Where(x => x.ItemId.HasValue
                    && productIds.Contains(x.ItemId.Value)
                    && x.LoaiTaiLieu == LoaiTaiLieuConstant.KPI_DAU_RA_NHIEM_VU
                    && !x.IsDeleted)
                .ToListAsync();

            task.IsDeleted = true;
            task.DeletedId = userId;
            task.DeletedDate = DateTime.Now;
            foreach (var product in products)
            {
                product.IsDeleted = true;
                product.DeletedId = userId;
                product.DeletedDate = DateTime.Now;
            }
            foreach (var attachment in attachments)
            {
                attachment.IsDeleted = true;
                attachment.DeletedId = userId;
                attachment.DeletedDate = DateTime.Now;
            }

            await _dbContext.SaveChangesAsync();
        }

        public async Task<KPI_NhiemVu> SaveNhiemVuTCCBAsync(ViewModels.SaveNhiemVuTCCBVM model, Guid? userId)
        {
            KPI_NhiemVu task;
            if (model.Id.HasValue && model.Id.Value != Guid.Empty)
            {
                task = await _kPI_NhiemVuRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == model.Id.Value && !x.IsDeleted)
                    ?? throw new KeyNotFoundException("Không tìm thấy nhiệm vụ");
                
                // Update
                task.UpdatedDate = DateTime.Now;
                task.UpdatedBy = userId?.ToString();
                _kPI_NhiemVuRepository.Update(task);
            }
            else
            {
                // Create
                task = new KPI_NhiemVu 
                { 
                    CreatedDate = DateTime.Now,
                    CreatedBy = userId?.ToString(),
                    IdPhieuDanhGia = model.IdPhieuDanhGia,
                    IdDotTheoDoiDanhGia = model.IdDotDanhGia,
                    IdLyLich = model.IdLyLich,
                    Type = "HETHONG"
                };
                _kPI_NhiemVuRepository.Add(task);
            }

            // Map fields
            task.TenNhiemVuDayDu = model.MoTaCongViec;
            
            task.DiemTheoBoTieuChi = model.DiemTheoBoTieuChi;
            task.ChamDiemSoLuong_HoanThanh = model.ChamDiemSoLuong_HoanThanh ?? model.DiemTheoBoTieuChi;
            task.ChamDiemSoLuong_KhongHoanThanh = model.ChamDiemSoLuong_KhongHoanThanh ?? 0;
            task.ChamDiemSoLuong_Diem = model.ChamDiemSoLuong_Diem ?? (model.DiemTheoBoTieuChi > 0 ? 100 : 0);
            
            task.ChamDiemChatLuong_KhongDat = model.ChamDiemChatLuong_KhongDat ?? 0;
            task.ChamDiemChatLuong_SoDiemConLai = model.ChamDiemChatLuong_SoDiemConLai ?? model.DiemTheoBoTieuChi;
            task.ChamDiemChatLuong_Diem = model.ChamDiemChatLuong_Diem ?? (model.DiemTheoBoTieuChi > 0 ? 100 : 0);
            
            task.ChamDiemTienDo_KhongDat = model.ChamDiemTienDo_KhongDat ?? 0;
            task.ChamDiemTienDo_SoDiemConLai = model.ChamDiemTienDo_SoDiemConLai ?? model.DiemTheoBoTieuChi;
            task.ChamDiemTienDo_Diem = model.ChamDiemTienDo_Diem ?? (model.DiemTheoBoTieuChi > 0 ? 100 : 0);
            
            await _kPI_NhiemVuRepository.SaveAsync();

            // Handle KPI_DauRaNhiemVu
            // Check if there is an existing KPI_DauRaNhiemVu for this task
            var dauRa = await _kPI_DauRaNhiemVuRepository.GetQueryable().FirstOrDefaultAsync(x => x.IdNhiemVu == task.Id && !x.IsDeleted);
            if (dauRa == null)
            {
                dauRa = new KPI_DauRaNhiemVu
                {
                    IdNhiemVu = task.Id,
                    CreatedDate = DateTime.Now,
                    CreatedBy = userId?.ToString()
                };
                _kPI_DauRaNhiemVuRepository.Add(dauRa);
            }
            else
            {
                dauRa.UpdatedDate = DateTime.Now;
                dauRa.UpdatedBy = userId?.ToString();
                _kPI_DauRaNhiemVuRepository.Update(dauRa);
            }

            dauRa.TenSanPhamDauRa = model.TenSanPhamDauRa;
            dauRa.TieuChiId = model.TieuChiId;
            dauRa.IdDotDanhGia = model.IdDotDanhGia;
            
            dauRa.DiemTheoBoTieuChi = model.DiemTheoBoTieuChi;
            dauRa.ChamDiemSoLuong_HoanThanh = model.ChamDiemSoLuong_HoanThanh ?? model.DiemTheoBoTieuChi;
            dauRa.ChamDiemSoLuong_KhongHoanThanh = model.ChamDiemSoLuong_KhongHoanThanh ?? 0;
            dauRa.ChamDiemSoLuong_Diem = model.ChamDiemSoLuong_Diem ?? (model.DiemTheoBoTieuChi > 0 ? 100 : 0);
            
            dauRa.ChamDiemChatLuong_KhongDat = model.ChamDiemChatLuong_KhongDat ?? 0;
            dauRa.ChamDiemChatLuong_SoDiemConLai = model.ChamDiemChatLuong_SoDiemConLai ?? model.DiemTheoBoTieuChi;
            dauRa.ChamDiemChatLuong_Diem = model.ChamDiemChatLuong_Diem ?? (model.DiemTheoBoTieuChi > 0 ? 100 : 0);
            
            dauRa.ChamDiemTienDo_KhongDat = model.ChamDiemTienDo_KhongDat ?? 0;
            dauRa.ChamDiemTienDo_SoDiemConLai = model.ChamDiemTienDo_SoDiemConLai ?? model.DiemTheoBoTieuChi;
            dauRa.ChamDiemTienDo_Diem = model.ChamDiemTienDo_Diem ?? (model.DiemTheoBoTieuChi > 0 ? 100 : 0);
            
            dauRa.GhiChuGiaTrinh = model.GhiChuGiaTrinh;

            await _kPI_DauRaNhiemVuRepository.SaveAsync();

            if (task.IdPhieuDanhGia.HasValue && task.IdPhieuDanhGia.Value != Guid.Empty)
            {
                await UpdatePhieuDiemThucHienNhiemVuAsync(task.IdPhieuDanhGia.Value);
            }

            return task;
        }

        public async Task DeleteNhiemVuTCCBAsync(Guid id, Guid? userId)
        {
            var task = await _kPI_NhiemVuRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted)
                ?? throw new KeyNotFoundException("Không tìm thấy nhiệm vụ.");
            
            var phieuId = task.IdPhieuDanhGia;

            task.IsDeleted = true;
            task.DeletedId = userId;
            task.DeletedDate = DateTime.Now;
            _kPI_NhiemVuRepository.Update(task);

            var products = await _kPI_DauRaNhiemVuRepository.GetQueryable()
                .Where(x => x.IdNhiemVu == id && !x.IsDeleted)
                .ToListAsync();
            
            foreach (var product in products)
            {
                product.IsDeleted = true;
                product.DeletedId = userId;
                product.DeletedDate = DateTime.Now;
                _kPI_DauRaNhiemVuRepository.Update(product);
            }

            await _kPI_NhiemVuRepository.SaveAsync();

            if (phieuId.HasValue && phieuId.Value != Guid.Empty)
            {
                await UpdatePhieuDiemThucHienNhiemVuAsync(phieuId.Value);
            }
        }

        private async Task UpdatePhieuDiemThucHienNhiemVuAsync(Guid idPhieu)
        {
            try
            {
                var phieu = await _dbContext.Set<KPI_PhieuDanhGia>().FirstOrDefaultAsync(x => x.Id == idPhieu && !x.IsDeleted);
                if (phieu == null) return;

                var tasks = await _kPI_NhiemVuRepository.GetQueryable()
                    .Where(x => x.IdPhieuDanhGia == idPhieu && !x.IsDeleted)
                    .ToListAsync();

                if (tasks.Any())
                {
                    var sumBase = tasks.Sum(x => (double)(x.DiemTheoBoTieuChi ?? 0));
                    decimal finalScoreOutOf70 = 0;
                    if (sumBase > 0)
                    {
                        var sumSl = tasks.Sum(x => (double)(x.ChamDiemSoLuong_HoanThanh ?? 0));
                        var sumCl = tasks.Sum(x => (double)(x.ChamDiemChatLuong_SoDiemConLai ?? 0));
                        var sumTd = tasks.Sum(x => (double)(x.ChamDiemTienDo_SoDiemConLai ?? 0));

                        var pctSl = (sumSl / sumBase) * 100d;
                        var pctCl = (sumCl / sumBase) * 100d;
                        var pctTd = (sumTd / sumBase) * 100d;
                        var avgPct = (pctSl + pctCl + pctTd) / 3d;
                        finalScoreOutOf70 = (decimal)Math.Round((avgPct * 70d) / 100d, 2);
                    }
                    else
                    {
                        var count = tasks.Count;
                        if (count > 0)
                        {
                            var avgSl = tasks.Average(x => (double)(x.ChamDiemSoLuong_Diem ?? 0));
                            var avgCl = tasks.Average(x => (double)(x.ChamDiemChatLuong_Diem ?? 0));
                            var avgTd = tasks.Average(x => (double)(x.ChamDiemTienDo_Diem ?? 0));
                            var avgPct = (avgSl + avgCl + avgTd) / 3d;
                            finalScoreOutOf70 = (decimal)Math.Round((avgPct * 70d) / 100d, 2);
                        }
                    }

                    phieu.DiemThucHienNhiemVu = finalScoreOutOf70;
                    phieu.TongDiem = (phieu.DiemTieuChiChung ?? 0m) + finalScoreOutOf70;
                    phieu.UpdatedDate = DateTime.Now;
                    await _dbContext.SaveChangesAsync();
                }
                else
                {
                    phieu.DiemThucHienNhiemVu = 0;
                    phieu.TongDiem = phieu.DiemTieuChiChung ?? 0m;
                    phieu.UpdatedDate = DateTime.Now;
                    await _dbContext.SaveChangesAsync();
                }
            }
            catch
            {
                // Bỏ qua lỗi phụ nếu có để không gián đoạn luồng lưu nhiệm vụ chính
            }
        }

    }
}
