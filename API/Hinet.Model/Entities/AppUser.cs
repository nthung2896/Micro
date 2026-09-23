using Microsoft.AspNetCore.Identity;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    public class AppUser : IdentityUser<Guid>, IAuditableEntity
    {
        [DisplayName("Mã cán bộ")]
        public string? MaCanBo { get; set; }

        [DisplayName("Tên đăng nhập")]
        public string? Name { get; set; }

        [DisplayName("Giới tính")]
        public int Gender { get; set; }

        [DisplayName("Ảnh đại diện")]
        public string? Picture { get; set; }

        [DisplayName("Loại")]
        public string? Type { get; set; }

        [DisplayName("Mã đơn vị")]
        public Guid? DonViId { get; set; }
        [ForeignKey("DonViId")]
        public virtual Department Department { get; set; }

        [DisplayName("Ngày sinh")]
        public DateTime? NgaySinh { get; set; }

        [DisplayName("Địa chỉ")]
        public string? DiaChi { get; set; }

        [DisplayName("SSO")]
        public bool? IsSSO { get; set; }

        [DisplayName("Cán bộ ID")]
        public Guid? CanBoId { get; set; }

        [DisplayName("GroupRole")]
        public string? GroupRole { get; set; }

        [DisplayName("CCCD")]
        [RegularExpression(@"^([0-9]{9}|[0-9]{12})$", ErrorMessage = "Số CMT/CCCD không hợp lệ (9 hoặc 12 chữ số)")]
        public string? CCCD { get; set; }

        [DisplayName("Ký số")]
        public bool IsKySo { get; set; }

        public Guid? OrganizationId { get; set; }


        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; }
        public Guid? UpdatedId { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedDate { get; set; }
        public Guid? DeletedId { get; set; }
    }
}
