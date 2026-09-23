using Hinet.Model.Entities;
using Hinet.Repository.PhongTroRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.PhongTroService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;



namespace Hinet.Service.PhongTroService
{
    public class PhongTroService : Service<PhongTro>, IPhongTroService
    {

        public PhongTroService(
            IPhongTroRepository phongTroRepository
            ) : base(phongTroRepository)
        {
            
        }

        public async Task<PagedList<PhongTroDto>> GetData(PhongTroSearch search)
        {
            var query = from q in GetQueryable()
                        
                        select new PhongTroDto()
                        {
                            ChuTroId = q.ChuTroId,
							NgayTrong = q.NgayTrong,
							NgayBatDau = q.NgayBatDau,
							NgayHetHan = q.NgayHetHan,
							NgayDayTin = q.NgayDayTin,
							NgayDuyet = q.NgayDuyet,
							Tang = q.Tang,
							SoNguoiOToiDa = q.SoNguoiOToiDa,
							SoPhongNgu = q.SoPhongNgu,
							SoPhongTam = q.SoPhongTam,
							TrangThai = q.TrangThai,
							LuotXem = q.LuotXem,
							GoiTin = q.GoiTin,
							SoLuotDayTin = q.SoLuotDayTin,
							TrangThaiDuyet = q.TrangThaiDuyet,
							DienTich = q.DienTich,
							GioGiacTuDo = q.GioGiacTuDo,
							CoMayGiat = q.CoMayGiat,
							CoDieuHoa = q.CoDieuHoa,
							CoNongLanh = q.CoNongLanh,
							CoTuLanh = q.CoTuLanh,
							CoGiuongTu = q.CoGiuongTu,
							CoKeBep = q.CoKeBep,
							IsNoiBat = q.IsNoiBat,
							CoBanCong = q.CoBanCong,
							CoThangMay = q.CoThangMay,
							CoChoDeXe = q.CoChoDeXe,
							CoKhoaVanTay = q.CoKhoaVanTay,
							KhongChungChu = q.KhongChungChu,
							ChoNuoiThuCung = q.ChoNuoiThuCung,
							GiaChoThue = q.GiaChoThue,
							TienCoc = q.TienCoc,
							GiaDien = q.GiaDien,
							GiaNuoc = q.GiaNuoc,
							GiaInternet = q.GiaInternet,
							GiaDichVuChung = q.GiaDichVuChung,
							GiaGuiXe = q.GiaGuiXe,
							GiaVeSinh = q.GiaVeSinh,
							PhiDangTin = q.PhiDangTin,
							TieuDe = q.TieuDe,
							MaPhong = q.MaPhong,
							TenPhong = q.TenPhong,
							LoaiPhong = q.LoaiPhong,
							DiaChi = q.DiaChi,
							MaTinh = q.MaTinh,
							MoTa = q.MoTa,
							QuyDinh = q.QuyDinh,
							LyDoTuChoi = q.LyDoTuChoi,
							NguoiDuyet = q.NguoiDuyet,
							HinhAnhDaiDien = q.HinhAnhDaiDien,
							DanhSachHinhAnh = q.DanhSachHinhAnh,
							VideoLink = q.VideoLink,
							TenLienHe = q.TenLienHe,
							SoDienThoaiLienHe = q.SoDienThoaiLienHe,
							ZaloLienHe = q.ZaloLienHe,
							DonViDien = q.DonViDien,
							DonViNuoc = q.DonViNuoc,
							DonViInternet = q.DonViInternet,
							DonViDichVuChung = q.DonViDichVuChung,
							QuyDinhGioGiac = q.QuyDinhGioGiac,
							TienNghiKhac = q.TienNghiKhac,
							TenTinh = q.TenTinh,
							MaHuyen = q.MaHuyen,
							TenHuyen = q.TenHuyen,
							MaXa = q.MaXa,
							TenXa = q.TenXa,
							ToaDo = q.ToaDo,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            //IsDelete = q.IsDelete,
                            //DeleteId = q.DeleteId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            //DeleteTime = q.DeleteTime,
                            Id = q.Id,
                        };
            if(search != null )
            {
                if(search.TrangThai.HasValue)
				{
					query = query.Where(x => x.TrangThai == search.TrangThai);
				}
				if(search.LuotXem.HasValue)
				{
					query = query.Where(x => x.LuotXem == search.LuotXem);
				}
				if(search.GoiTin.HasValue)
				{
					query = query.Where(x => x.GoiTin == search.GoiTin);
				}
				if(search.SoLuotDayTin.HasValue)
				{
					query = query.Where(x => x.SoLuotDayTin == search.SoLuotDayTin);
				}
				if(search.TrangThaiDuyet.HasValue)
				{
					query = query.Where(x => x.TrangThaiDuyet == search.TrangThaiDuyet);
				}
				if(search.IsNoiBat.HasValue)
				{
					query = query.Where(x => x.IsNoiBat == search.IsNoiBat);
				}
				if(!string.IsNullOrEmpty(search.TieuDe))
				{
					query = query.Where(x => EF.Functions.Like(x.TieuDe, $"%{search.TieuDe}%"));
				}
            }
            query = query.OrderByDescending(x => x.GoiTin)
                         .ThenByDescending(x => x.NgayDayTin ?? x.CreatedDate);
            var result = await PagedList<PhongTroDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<PhongTroDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        
                        select new PhongTroDto()
                        {
                            ChuTroId = q.ChuTroId,
							NgayTrong = q.NgayTrong,
							NgayBatDau = q.NgayBatDau,
							NgayHetHan = q.NgayHetHan,
							NgayDayTin = q.NgayDayTin,
							NgayDuyet = q.NgayDuyet,
							Tang = q.Tang,
							SoNguoiOToiDa = q.SoNguoiOToiDa,
							SoPhongNgu = q.SoPhongNgu,
							SoPhongTam = q.SoPhongTam,
							TrangThai = q.TrangThai,
							LuotXem = q.LuotXem,
							GoiTin = q.GoiTin,
							SoLuotDayTin = q.SoLuotDayTin,
							TrangThaiDuyet = q.TrangThaiDuyet,
							DienTich = q.DienTich,
							GioGiacTuDo = q.GioGiacTuDo,
							CoMayGiat = q.CoMayGiat,
							CoDieuHoa = q.CoDieuHoa,
							CoNongLanh = q.CoNongLanh,
							CoTuLanh = q.CoTuLanh,
							CoGiuongTu = q.CoGiuongTu,
							CoKeBep = q.CoKeBep,
							IsNoiBat = q.IsNoiBat,
							CoBanCong = q.CoBanCong,
							CoThangMay = q.CoThangMay,
							CoChoDeXe = q.CoChoDeXe,
							CoKhoaVanTay = q.CoKhoaVanTay,
							KhongChungChu = q.KhongChungChu,
							ChoNuoiThuCung = q.ChoNuoiThuCung,
							GiaChoThue = q.GiaChoThue,
							TienCoc = q.TienCoc,
							GiaDien = q.GiaDien,
							GiaNuoc = q.GiaNuoc,
							GiaInternet = q.GiaInternet,
							GiaDichVuChung = q.GiaDichVuChung,
							GiaGuiXe = q.GiaGuiXe,
							GiaVeSinh = q.GiaVeSinh,
							PhiDangTin = q.PhiDangTin,
							TieuDe = q.TieuDe,
							MaPhong = q.MaPhong,
							TenPhong = q.TenPhong,
							LoaiPhong = q.LoaiPhong,
							DiaChi = q.DiaChi,
							MaTinh = q.MaTinh,
							MoTa = q.MoTa,
							QuyDinh = q.QuyDinh,
							LyDoTuChoi = q.LyDoTuChoi,
							NguoiDuyet = q.NguoiDuyet,
							HinhAnhDaiDien = q.HinhAnhDaiDien,
							DanhSachHinhAnh = q.DanhSachHinhAnh,
							VideoLink = q.VideoLink,
							TenLienHe = q.TenLienHe,
							SoDienThoaiLienHe = q.SoDienThoaiLienHe,
							ZaloLienHe = q.ZaloLienHe,
							DonViDien = q.DonViDien,
							DonViNuoc = q.DonViNuoc,
							DonViInternet = q.DonViInternet,
							DonViDichVuChung = q.DonViDichVuChung,
							QuyDinhGioGiac = q.QuyDinhGioGiac,
							TienNghiKhac = q.TienNghiKhac,
							TenTinh = q.TenTinh,
							MaHuyen = q.MaHuyen,
							TenHuyen = q.TenHuyen,
							MaXa = q.MaXa,
							TenXa = q.TenXa,
							ToaDo = q.ToaDo,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            //IsDelete = q.IsDelete,
                            //DeleteId = q.DeleteId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            //DeleteTime = q.DeleteTime,
                            Id = q.Id,
                        }).FirstOrDefaultAsync();
            
            return item;
        }

        public async Task<PhongTro?> DayTin(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null) return null;

            entity.NgayDayTin = DateTime.Now;
            entity.SoLuotDayTin += 1;
            entity.UpdatedDate = DateTime.Now;
            await UpdateAsync(entity);
            return entity;
        }

        public async Task<PhongTro?> GiaHan(Guid id, int soNgay)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null) return null;

            var baseDate = entity.NgayHetHan.HasValue && entity.NgayHetHan.Value > DateTime.Now 
                ? entity.NgayHetHan.Value 
                : DateTime.Now;
            entity.NgayHetHan = baseDate.AddDays(soNgay);

            // Nếu đang ở trạng thái hết hạn, đổi lại thành đã duyệt / hiển thị
            if (entity.TrangThaiDuyet == 3)
            {
                entity.TrangThaiDuyet = 1;
            }

            entity.UpdatedDate = DateTime.Now;
            await UpdateAsync(entity);
            return entity;
        }

        public async Task<PhongTro?> NangCapVip(Guid id, int goiTin, int? soNgay = null)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null) return null;

            entity.GoiTin = goiTin;
            entity.IsNoiBat = (goiTin > 0);

            if (soNgay.HasValue && soNgay.Value > 0)
            {
                var baseDate = entity.NgayHetHan.HasValue && entity.NgayHetHan.Value > DateTime.Now 
                    ? entity.NgayHetHan.Value 
                    : DateTime.Now;
                entity.NgayHetHan = baseDate.AddDays(soNgay.Value);
            }

            if (entity.TrangThaiDuyet == 3)
            {
                entity.TrangThaiDuyet = 1;
            }

            entity.UpdatedDate = DateTime.Now;
            await UpdateAsync(entity);
            return entity;
        }

        public async Task<PhongTro?> GanNhan(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null) return null;

            entity.IsNoiBat = !entity.IsNoiBat;
            entity.UpdatedDate = DateTime.Now;
            await UpdateAsync(entity);
            return entity;
        }

        public async Task<PhongTro?> DoiTrangThai(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null) return null;

            // 0: Còn trống / Hiển thị, 1: Đã thuê / Tạm ẩn
            entity.TrangThai = entity.TrangThai == 0 ? 1 : 0;
            entity.UpdatedDate = DateTime.Now;
            await UpdateAsync(entity);
            return entity;
        }

        public async Task<PhongTro?> DuyetTin(Guid id, int trangThaiDuyet, string? lyDoTuChoi = null, string? nguoiDuyet = null)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null) return null;

            entity.TrangThaiDuyet = trangThaiDuyet;
            entity.LyDoTuChoi = lyDoTuChoi;
            entity.NguoiDuyet = nguoiDuyet;
            entity.NgayDuyet = DateTime.Now;
            entity.UpdatedDate = DateTime.Now;
            await UpdateAsync(entity);
            return entity;
        }

        public async Task<ThongKeTinDangDto> GetThongKe(Guid? chuTroId = null)
        {
            var query = GetQueryable();
            if (chuTroId.HasValue)
            {
                query = query.Where(x => x.ChuTroId == chuTroId.Value);
            }

            var now = DateTime.Now;
            var result = new ThongKeTinDangDto
            {
                TatCa = await query.CountAsync(),
                DangHienThi = await query.CountAsync(x => x.TrangThai == 0 && x.TrangThaiDuyet == 1 && (x.NgayHetHan == null || x.NgayHetHan > now)),
                TinThuong = await query.CountAsync(x => x.GoiTin == 0),
                TinVip = await query.CountAsync(x => x.GoiTin > 0 || x.IsNoiBat),
                ChoDuyet = await query.CountAsync(x => x.TrangThaiDuyet == 0),
                HetHan = await query.CountAsync(x => x.TrangThaiDuyet == 3 || (x.NgayHetHan.HasValue && x.NgayHetHan < now)),
                DaThue = await query.CountAsync(x => x.TrangThai == 1)
            };

            return result;
        }
    }
}
