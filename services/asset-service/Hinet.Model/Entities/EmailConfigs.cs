using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("EmailConfigs")]
    [DisplayName("Cấu hình email")]
    public class EmailConfigs : AuditableEntity
    {
        public string? From { get; set; }
        public string? Host { get; set; }
        public string? Alias { get; set; }
        public string? Port { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public bool? EnableSsl { get; set; }
        public bool? AllowSendMail { get; set; }

        /// <summary>Hạn mức gửi mail / ngày (Gmail free ~ 500).</summary>
        public int? DailyLimit { get; set; }

        /// <summary>Số mail đã gửi trong ngày hiện tại.</summary>
        public int? SentToday { get; set; }

        /// <summary>Ngày của lần reset quota gần nhất.</summary>
        public DateTime? QuotaResetDate { get; set; }

        /// <summary>Mốc thời gian gửi gần nhất.</summary>
        public DateTime? LastUsedAt { get; set; }

        /// <summary>Số lần gửi fail liên tiếp.</summary>
        public int? ConsecutiveFailures { get; set; }

        /// <summary>Mốc thời gian fail gần nhất.</summary>
        public DateTime? LastFailedAt { get; set; }

        /// <summary>Lý do fail gần nhất.</summary>
        public string? LastFailReason { get; set; }
    }
}
