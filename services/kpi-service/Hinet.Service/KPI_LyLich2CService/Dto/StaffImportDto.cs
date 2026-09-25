using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_LyLich2CService.Dto
{
    public class StaffImportItemDto
    {
        public string? MaCanBo { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? SoDienThoai { get; set; }
        public string? ChucVu { get; set; }
        public Guid? PhongBanId { get; set; }
        public Guid? DonViSuDungId { get; set; }
        public DateTime? NgaySinh { get; set; }
        public int? GioiTinh { get; set; } // 1: Nam, 2: Nữ
        public string? CCCD { get; set; }
        public string? DiaChi { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public List<string>? Roles { get; set; }
    }

    public class StaffImportResultItemDto
    {
        public string? MaCanBo { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public Guid? UserId { get; set; }
        public Guid? LyLichId { get; set; }
        public bool Success { get; set; }
        public string? Message { get; set; }
    }

    public class BatchStaffImportResultDto
    {
        public int TotalItems { get; set; }
        public int SuccessCount { get; set; }
        public int FailedCount { get; set; }
        public List<StaffImportResultItemDto> Details { get; set; } = new();
    }
}
