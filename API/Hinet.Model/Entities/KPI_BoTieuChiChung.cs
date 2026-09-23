using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_BoTieuChiChung")]
    public class KPI_BoTieuChiChung : AuditableEntity
    {
        public string? SoQuyetDinh { get; set; }
        public string? TenBoTieuChiDonVi { get; set; }
        public string? Type { get; set; }
        public Guid? IdDonVi { get; set; }
        public Guid? IdDot { get; set; }
        public DateTime? NgayQuyetDinh { get; set; }
        public DateTime? ApDungTuNgay { get; set; }
        public DateTime? ApDungToiNgay { get; set; }
        public bool? IsActive { get; set; }
    }
}
