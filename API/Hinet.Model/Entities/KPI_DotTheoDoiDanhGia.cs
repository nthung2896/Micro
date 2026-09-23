using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_DotTheoDoiDanhGia")]
    public class KPI_DotTheoDoiDanhGia: AuditableEntity
    {
        public string? TenDotTheoDoiDanhGia { get; set; }
        public int? Thang {  get; set; }
        public int? Quy { get; set; }
        public int? Nam { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public string? Type {  get; set; }
        public string? TrangThai  { get; set; }
        public Guid?  DefaultTieuChiChung { get; set; }
        public Guid? DefaultTieuChiDonVi { get; set; }
    }
}
