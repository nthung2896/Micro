using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    public class KPI_QuaTrinhXuLyPhieuDanhGia : AuditableEntity
    {
        public Guid IdPhieuDanhGia { get; set; }
        public string TrangThai { get; set; }
        public Guid IdNguoiXuLy { get; set; }
        public Guid IdNguoiGui { get; set; }
        public string? GhiChu { get; set; }
        public bool IsXuLy { get; set; }
    }
}
