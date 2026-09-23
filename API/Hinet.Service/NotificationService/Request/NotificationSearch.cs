using Hinet.Service.Dto;


namespace Hinet.Service.NotificationService.Request
{
    public class NotificationSearch : SearchBase
    {
        public string? ItemId { get; set; }
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
        public string? FromUser { get; set; }
        public string? FromUserName { get; set; }//
        public string? ToUser { get; set; }
        public string? Message { get; set; }
        public string? Link { get; set; }
        public string? Type { get; set; }
        public DateTime? FromDate { get; set; } //
        public DateTime? ToDate { get; set; } //
        public bool? IsRead { get; set; }

        public string? Email { get; set; }
        public string? LoaiThongBao { get; set; }

        public string? ProductId { get; set; }
        public string? ProductName { get; set; }
    }
}
