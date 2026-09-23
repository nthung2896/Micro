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
    [Table("KPI_TieuChiChung_DiemSo")]
    public class KPI_TieuChiChung_DiemSo : AuditableEntity
    {
        public Guid? IdTieuChiChung { get; set; }
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public Guid? IdPhieuDanhGia { get; set; }
        public decimal? DiemTuCham { get; set; }
    }
}
