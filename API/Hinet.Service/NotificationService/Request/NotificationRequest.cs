
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.NotificationService.Request
{
    public class NotificationRequest
    {
        public Guid? Id { get; set; }
        public string? ItemId { get; set; }
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
        public string? FromUser { get; set; }
        public string? ToUser { get; set; }

        public string? Message { get; set; }

        public string? Link { get; set; }

        public string? Type { get; set; }
        public string? DonViId { get; set; }
        public string? ItemType { get; set; }
        public bool? IsDisplay { get; set; }
        public bool? SendToFrontEndUser { get; set; }

        public string? ItemName { get; set; }

        public bool IsRead { get; set; }

        public string? Email { get; set; }
        public string? LoaiThongBao { get; set; }

        public string? ProductId { get; set; }
        public string? ProductName { get; set; }

        [Required]
        public string? TieuDe { get; set; }
        [Required]
        public string? NoiDung { get; set; }
        public Guid? NguoiTao { get; set; }
        public string? FileDinhKem { get; set; }

        public bool? IsXuatBan { get; set; }
    }
}