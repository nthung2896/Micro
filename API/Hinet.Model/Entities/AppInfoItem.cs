using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    /// <summary>
    /// Thực thể lưu thông tin ứng dụng di động độc lập (Decoupled)
    /// </summary>
    [Table("AppInfoItem")]
    public class AppInfoItem : AuditableEntity
    {
        
        /// <summary>
        /// Khóa ngoại logic trỏ tới PlatformManage
        /// </summary>
        public Guid PlatformManageId { get; set; }

        /// <summary> Tên ứng dụng </summary>
        public string? AppName { get; set; }

        /// <summary> Mã hệ điều hành (IOS, Android, Web...) </summary>
        public string? OsCode { get; set; }

        /// <summary> Đường dẫn tải ứng dụng </summary>
        public string? AppLink { get; set; }

        /// <summary> File đính kèm / logo của ứng dụng </summary>
        public string? AppLogo { get; set; }
    }
}
