using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("KPI_TieuChiChung_DiemSo_CapTren")]
    public class KPI_TieuChiChung_DiemSo_CapTren : AuditableEntity
    {
        public Guid Id_TieuChiChung_DiemSo { get; set; }
        public Guid? Id_PhieuDanhGia { get; set; }
        public Guid? Id_LyLich { get; set; }
        public Guid? Id_DotDanhGia { get; set; }
        // Vai trò đánh giá (vd: "CaNhan", "PhoPhong", "TruongPhong", "LanhDaoCuc")
        public string? VaiTroDanhGia { get; set; }
        public decimal? Diem { get; set; }

        public string? GhiChu { get; set; }
    }
}
