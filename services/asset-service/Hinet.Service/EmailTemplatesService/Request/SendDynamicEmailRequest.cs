using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.EmailTemplatesService.Request
{
    public class SendDynamicEmailRequest
    {
        /// <summary>Id của template email</summary>
        [Required]
        public Guid IdEmailTemplate { get; set; }

        /// <summary>Email người nhận</summary>
        [Required]
        public string ToEmail { get; set; } = "";

        /// <summary>
        /// Dữ liệu động để fill template Scriban.
        /// VD: { "full_name": "Nguyễn Văn A", "otp": "123456" }
        /// </summary>
        public Dictionary<string, object>? Data { get; set; }
    }
}
