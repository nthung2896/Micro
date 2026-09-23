
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.TaiLieuDinhKemService.Request
{
    public class TaiLieuDinhKemRequest
    {
        public Guid? Id { get; set; }
        public string? Item_ID { get; set; }
        public string? IdBuocThucHienDVC { get; set; }
        public string? UserId { get; set; }
        public string? IdDonViUpload { get; set; }
        public string? IdDotKeKhaiSoLieu { get; set; }
        public string? IdDonViKhaoSat { get; set; }
        public string? IdDotKhaoSat { get; set; }
        public string? IdRootItem { get; set; }
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
        [Required]
        public int SoLuongDownload { get; set; }
        public int? LanKeKhai { get; set; }
        public int? ThangKhaoSat { get; set; }
        public int? QuyKhaoSat { get; set; }
        public int? NamKhaoSat { get; set; }
        public bool? IsTempDelete { get; set; }
        public bool? IsKySo { get; set; }
        public long? KichThuoc { get; set; }
        [Required]
        public string? TenTaiLieu { get; set; }
        [Required]
        public string? LoaiTaiLieu { get; set; }
        [Required]
        public string? MoTa { get; set; }
        [Required]
        public string? DuongDanFile { get; set; }
        [Required]
        public string? DuongDanFilePDF { get; set; }
        [Required]
        public string? DinhDangFile { get; set; }
        public string? NgayPhatHanh { get; set; }
        [Required]
        public string? Guid { get; set; }
        [Required]
        public string? KeyTieuChiKeKhai { get; set; }
        [Required]
        public string? NguoiKy { get; set; }
        [Required]
        public string? DonViPhatHanh { get; set; }
        [Required]
        public string? NgayKy { get; set; }
    }
}