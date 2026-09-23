using Hinet.Service.Dto;

namespace Hinet.Service.Room_BangGiaService.Dto
{
    public class Room_BangGiaSearch : SearchBase
    {
        public string? LoaiTin { get; set; }
        public string? ThuocTinh { get; set; }
        public bool? IsHienThiNutGoi { get; set; }
        public bool? IsTuDongDuyet { get; set; }
        public bool? IsDuyTriThem10Ngay { get; set; }
    }
}
