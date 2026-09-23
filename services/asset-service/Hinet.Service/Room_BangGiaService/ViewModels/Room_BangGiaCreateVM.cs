using System;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.Room_BangGiaService.ViewModels
{
    public class Room_BangGiaCreateVM
    {
        [Required(ErrorMessage = "Vui lòng nhập loại tin!")]
        public string LoaiTin { get; set; }

        public string? ThuocTinh { get; set; }

        public string? MaMau { get; set; }

        public decimal? GiaTin { get; set; }

        public bool? IsTuDongDuyet { get; set; } = false;

        public bool? IsDuyTriThem10Ngay { get; set; } = false;

        public bool IsHienThiNutGoi { get; set; } = false;
    }
}