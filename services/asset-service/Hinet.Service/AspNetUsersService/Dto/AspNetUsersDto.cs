using Hinet.Model.Entities;
using System.ComponentModel;

namespace Hinet.Service.AspNetUsersService.Dto
{
    public class AspNetUsersDto : AppUser
    {
        public Guid? Id { get; set; }
        public Guid? UserId { get; set; }
        public string TenDonVi_txt { get; set; }
        public string GioiTinh_txt { get; set; }
        public string VaiTro_response { get; set; }
        public List<string> VaiTro_txt_response { get; set; }
    }

    public class UserDto1
    {
        public Guid Id { get; set; }

        [DisplayName("Tài khoản")]
        public string? UserName { get; set; }

        [DisplayName("Họ tên")]
        public string? Name { get; set; }

        [DisplayName("Email")]
        public string? Email { get; set; }

        [DisplayName("Số điện thoại")]
        public string? PhoneNumber { get; set; }

        [DisplayName("Ngày sinh")]
        public DateTime? NgaySinh { get; set; }



        [DisplayName("Giới tính")]
        public string? GioiTinh_txt { get; set; }
        [DisplayName("Địa chỉ")]
        public string? DiaChi { get; set; }
        public string? Type { get; set; }
        public bool LockoutEnabled { get; set; }
        public Guid? DonViId { get; set; }
        public string? Gender { get; set; }
        public string? Picture { get; set; }
        public List<string>? vaiTro { get; set; }
        public List<string>? ListPhongBan { get; set; }

        //[DisplayName("Tên đơn vị")]
        public string? TenDonVi_txt { get; set; }



        //[DisplayName("Vai trò")]
        public string? VaiTro_response { get; set; }
        public List<string>? VaiTro_txt_response { get; set; }

        public string? GroupRole_txt { get; set; }
        public List<string>? GroupRole_response { get; set; }

        public string? DepartmentId { get; set; }
        public string? Department_txt { get; set; }

        public List<Guid>? NhomNguoi { get; set; }
        public List<string>? NhomNguoi_txt { get; set; }

    }
}
