using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_VanBanDen")]
    public class KPI_VanBanDen : AuditableEntity
    {

        // thông tin chính
        public Guid? IdVanBanDongBo { get; set; }

        public string? SoVanBan { get; set; }

        public DateTime? NgayVanBan { get; set; }

        public string? TrichYeu { get; set; }

        public string? TrangThai { get; set; }

        public DateTime? NgayHoanThanh { get; set; }

    }
}
