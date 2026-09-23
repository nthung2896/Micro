using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_QLNgach")]
    public class KPI_QLNgach : AuditableEntity
    {
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
