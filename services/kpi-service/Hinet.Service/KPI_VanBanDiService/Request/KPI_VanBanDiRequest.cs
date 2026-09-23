using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System;

namespace Hinet.Service.KPI_VanBanDiService.Request
{
    public class KPI_VanBanDiRequest
    {
        public Guid? Id { get; set; }
        public long? DoMat { get; set; }
        public long? DepartmentId { get; set; }
        public string? LoaiVanBan { get; set; }
        public string? SoHieu { get; set; }
        public string? DoKhan { get; set; }
        public string? TrichYeu { get; set; }
        public DateTime? HanXuLy { get; set; }
        public int? SoBan { get; set; }
        public string? SoDi { get; set; }
        public long? SoVanBanId { get; set; }
        public DateTime? NgayBanHanh { get; set; }
        public bool? IsCapSo { get; set; }
        public DateTime? NgayVanBan { get; set; }
        public long? NguoiSoanThao { get; set; }
        public string? TrichYeuNormalized { get; set; }
        public string? TrangThai { get; set; }
        public string? GhiChu { get; set; }
    }
}
