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
    [Table("KPI_NhomTieuChi")]
    public class KPI_NhomTieuChi : AuditableEntity
    {
        public Guid? IdBoTieuChiDonVi { get; set; }
        public string? TenNhomTieuChi { get; set; }
        public string? CongViecChiTiet { get; set; }
        public string? SanPhamDauRa { get; set; }
        public string? PhanNhom { get; set; }
        public int? KhungDiemToiDa { get; set; }
        public int? Diem { get; set; }
        public int? HeSoQuyDoi { get; set; }
        public int? GhiChu { get; set; }
        public Guid? IdDonVi { get; set; }
        public Guid? ParentID { get; set; }
        public int? Level { get; set; }
        public int? STT { get; set; }
    }
}
