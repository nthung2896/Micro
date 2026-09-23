using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_CauHinhDiemTheoHeSoLanhDao")]
    public class KPI_CauHinhDiemTheoHeSoLanhDao : AuditableEntity
    {
        public string? ChucVu { get; set; }
        public decimal? HeSo { get; set; }
        public Guid? IdBoTieuChi { get; set; }
    }
}
