using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_CauHinhCongThucNhiemVu")]
    public class KPI_CauHinhCongThucNhiemVu : AuditableEntity
    {
        public Guid? IdDonVi { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public string? TargetTable { get; set; }
        public string? TargetColumn { get; set; }
        public string? fomula { get; set; }
        public string? Type { get; set; }
    }
}
