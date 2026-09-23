using Hinet.Service.Dto;

namespace Hinet.Service.KPI_DotTheoDoiDanhGiaService.Request
{
    public class KPI_DotTheoDoiDanhGiaSearch : SearchBase
    {
        public string? TenDotTheoDoiDanhGia { get; set; }
        public int? Thang { get; set; }
        public int? Quy { get; set; }
        public int? Nam { get; set; }
        public DateTime? ThoiGianBatDauFrom { get; set; }
        public DateTime? ThoiGianBatDauTo { get; set; }
        public DateTime? ThoiGianKetThucFrom { get; set; }
        public DateTime? ThoiGianKetThucTo { get; set; }
        public string? Type { get; set; }
        public string? TrangThai { get; set; }

        public string? DefaultTieuChiChungName { get; set;}
        public string? DefaultTieuChiDonViName { get; set; }
        public Guid? DefaultTieuChiChung { get; set; }
        public Guid? DefaultTieuChiDonVi { get; set; }
    }
}
