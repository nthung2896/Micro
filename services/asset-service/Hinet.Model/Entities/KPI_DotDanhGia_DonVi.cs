using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_DotDanhGia_DonVi")]
    public class KPI_DotDanhGia_DonVi : AuditableEntity
    {
        public Guid IdDotDanhGia { get; set; }
        public Guid IdDonVi { get; set; }
        public Guid? IdBoChiSoNhiemVu { get; set; }
        public Guid? IdBoTieuChiChung { get; set; }
        //public string Type { get; set; } // 'TIEUCHICHUNG','NHIEMVU'
    }
}
