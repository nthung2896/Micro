using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_TieuChiChung_DiemSoService.Dto
{
    public class KPI_TongHopTieuChiChungDto
    {
        public Guid? IdDot { get; set; }
        public string TenDot { get; set; }
        public Guid DonViSuDungId { get; set; }
        public string TenDonViSuDung { get; set; }
        public Guid PhongBanId { get; set; }
        public string TenPhongBan { get; set; }
        public List<KPI_TongHopTieuChiChungNhanSuDto> ListThongTinNhanSu { get; set; }
    }

    public class KPI_TongHopTieuChiChungNhanSuDto
    {
        public Guid LyLichId { get; set; }
        public Guid? IdPhieuDanhGia { get; set; }
        public string? TenNhanSu { get; set; }
        public string? ChucVu { get; set; }
        public string? ChucVu_txt { get; set; }
        public Guid? PhongBanId { get; set; }
        public string? TenPhongBan { get; set; }
        //Tháng
        public double? DiemTheoBTC_TrongKeHoach { get; set; }
        public double? DiemTheoBTC_DamNhanDotXuat { get; set; }
        public double? DiemTheoBTC_TongThucTe { get; set; }
        public decimal? DiemTieuChiKetQuaNV_TheoDiem { get; set; }
        public decimal? DiemTieuChiKetQuaNV_TheoThang { get; set; }
        public bool DuDiemNhiemVuTheoVaiTro { get; set; } = true;
        public int SoDauRaThieuDiem { get; set; }
        //Qúy
        public double? DiemTieuChiKQNhiemVu_ThangThuNhat { get; set; }
        public double? DiemTieuChiKQNhiemVu_ThangThuHai { get; set; }
        public double? DiemTieuChiKQNhiemVu_ThangCuoi { get; set; }
        public double? DiemTieuChiKQNhiemVu_TrungBinh { get; set; }
        public double? DiemTieuChiChung { get; set; }
        public double? DiemTheoDoiDanhGiaQuy { get; set; }

        public string? GhiChu { get; set; }
        public bool DaDanhGia { get; set; }
        public string? TrangThai { get; set; }
        public int? ChucVuPriority { get; set; }
    }

    public class KPI_TongHopToanCucDto
    {
        public Guid? IdDot { get; set; }
        public string TenDot { get; set; }
        public Guid DonViSuDungId { get; set; }
        public string TenDonViSuDung { get; set; }
        public List<KPI_TongHopToanCucPhongBanDto> ListPhongBan { get; set; } = new List<KPI_TongHopToanCucPhongBanDto>();
    }

    public class KPI_TongHopToanCucPhongBanDto
    {
        public Guid PhongBanId { get; set; }
        public string TenPhongBan { get; set; }
        public long? Priority { get; set; }
        public List<KPI_TongHopTieuChiChungNhanSuDto> ListThongTinNhanSu { get; set; } = new List<KPI_TongHopTieuChiChungNhanSuDto>();
    }

    public class KPI_TongHopTieuChiChungSearchDto
    {
        public Guid? PhongBanId { get; set; }
        public Guid? DonViSuDungId { get; set; }
        public Guid? IdDot { get; set; }
        public int? Quy { get; set; }
        public int? Nam { get; set; }
        public string? Type { get; set; } = "Thang";
        public Guid? CurrentUserId { get; set; }
        public string? VaiTroDanhGia { get; set; }
    }
}
