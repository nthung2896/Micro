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
    [Table("KPI_PhieuDanhGia")]
    public class KPI_PhieuDanhGia : AuditableEntity
    {
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public Guid? DonVi { get; set; }
        public int Luong { get; set; }
        public string? PhongBan { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        public string? UuDiem { get; set; }
        public string? HanChe { get; set; }
        public string? YKienNhanXet { get; set; }
        public string TrangThai { get; set; }
    }
}
