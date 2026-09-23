using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.EmailTemplatesService.Request
{
    public class SendEmailByCodeRequest
    {
        /// <summary>Mã template (VD: WELCOME_USER, RESET_PASSWORD)</summary>
        [Required]
        public string Code { get; set; } = "";

        /// <summary>Email người nhận</summary>
        [Required]
        public string ToEmail { get; set; } = "";

        /// <summary>Dữ liệu động: { "full_name": "...", "otp": "..." }</summary>
        public Dictionary<string, object>? Data { get; set; }
    }
}
