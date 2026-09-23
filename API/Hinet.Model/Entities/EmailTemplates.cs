using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("EmailTemplates")]
    [DisplayName("Mẫu email")]
    public class EmailTemplates : AuditableEntity
    {
        /// <summary>Mã template duy nhất (VD: RESET_PASSWORD, WELCOME_USER)</summary>
        [MaxLength(100)]
        public string? Code { get; set; }

        /// <summary>Tiêu đề email (hỗ trợ biến Scriban: {{full_name}})</summary>
        [MaxLength(255)]
        public string? Subject { get; set; }

        /// <summary>Nội dung email HTML/Text (hỗ trợ biến Scriban)</summary>
        public string? Body { get; set; }

        /// <summary>Kiểu nội dung: html hoặc text</summary>
        [MaxLength(20)]
        public string? BodyType { get; set; } = "html";

        /// <summary>Danh sách biến sử dụng (JSON array: ["name","otp","expired_minutes"])</summary>
        public string? Variables { get; set; }

        /// <summary>Mô tả mục đích template</summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>Trạng thái hoạt động</summary>
        public bool IsActive { get; set; } = true;
    }
}
