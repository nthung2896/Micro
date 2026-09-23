using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    public class KPI_BoTieuChiDonVi : AuditableEntity
    {
        public string SoQuyetDinh { get; set; }
        public string TenBoTieuChiDonVi { get; set; }
        public Guid? IdDonVi { get; set; }
        public Guid? IdDot { get; set; }
        public DateTime? NgayQuyetDinh { get; set; }
        public DateTime? ApDungTuNgay { get; set; }
        public DateTime? ApDungToiNgay { get; set; }

        public bool Is_locked { get; set; } = false;
    }
}
