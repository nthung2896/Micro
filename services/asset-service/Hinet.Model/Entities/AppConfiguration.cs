using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("AppConfiguration")]
    public class AppConfiguration: AuditableEntity
    {
        public string? TenApp { get; set; }
        public string? TenDoanhNghiep { get; set; }
        public string? DiaChi { get; set; }
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        public string? LogoLink { get; set; }
        public string? LoginBackgroundLink { get; set; }
        public string? LoginModalImage { get; set; }
        public string? PrimaryColor { get; set; }
        public bool? isActive {get; set;}
    }
}
