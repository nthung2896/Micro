using Hinet.Model.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("Room_BangGia")]
    public class Room_BangGia : AuditableEntity
    {
        public string ThuocTinh { get; set; }
        public string LoaiTin { get; set; }
        public string? MaMau { get; set; }
        public decimal? GiaTin { get; set; }
        public bool? IsTuDongDuyet { get; set; } = false;
        public bool? IsDuyTriThem10Ngay { get; set; } = false;
        public bool IsHienThiNutGoi { get; set; } = false;
    }
}
