using System;

namespace Hinet.Service.KPI_QLNgachService.Request
{
    public class KPI_QLNgachRequest
    {
        public Guid Id { get; set; }
        public long? OldNhomNgach { get; set; }
        public string MaNgach { get; set; }
        public string TenNgach { get; set; }
        public string NhomVienChuc { get; set; }
        public Guid? NhomNgach { get; set; } = Guid.Empty;
        public int? ThoiGianNangLuong { get; set; }
        public string? ThongTinMoTa { get; set; }
        public bool? IsActive { get; set; }
        public int? SoThuTu { get; set; }
        public bool? IsNganhYTe { get; set; }
        public DateTime? NgayApDung { get; set; }
        public DateTime? NgayHetHan { get; set; }
    }
}
