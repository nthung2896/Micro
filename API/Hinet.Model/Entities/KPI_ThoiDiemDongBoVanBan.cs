using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_ThoiDiemDongBoVanBan")]
    public class KPI_ThoiDiemDongBoVanBan : AuditableEntity
    {
        public long? IdVanBan { get; set; }
        public string? TypeVanBan { get; set; }
        public DateTime? ThoiGianDongBoVanBan { get; set; }
        public bool? IsTuNhap { get; set; }
    }
}
