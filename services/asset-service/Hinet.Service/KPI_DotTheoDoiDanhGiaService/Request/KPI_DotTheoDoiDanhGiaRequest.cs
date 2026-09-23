using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_DotTheoDoiDanhGiaService.Request
{
    public class KPI_DotTheoDoiDanhGiaRequest
    {
        public Guid? Id { get; set; }
		public string? TenDotTheoDoiDanhGia { get; set; }
        public int? Thang {  get; set; }
        public int? Quy { get; set; }
        public int? Nam { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public string? Type {  get; set; }
        public string? TrangThai  { get; set; }
        public Guid? DefaultTieuChiChung { get; set; }
        public Guid? DefaultTieuChiDonVi { get; set; }
    }
}
