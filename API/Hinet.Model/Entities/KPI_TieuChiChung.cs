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
    [Table("KPI_TieuChiChung")]
    public class KPI_TieuChiChung : AuditableEntity
    {
        public string? Ten { get; set; }
        public Guid? ParentId { get; set; }
        public decimal? MyProperty { get; set; }
        public int? Priority { get; set; }
        public Guid? IdBoTieuChiChung { get; set; }
    }
}
