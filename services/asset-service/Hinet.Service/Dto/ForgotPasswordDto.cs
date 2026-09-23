using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Dto
{
    public class ForgotPasswordDto
    {
        [DisplayName("Tên đăng nhập")]
        public string? UserName { get; set; }
        [DisplayName("Email")]

        public string? Email { get; set; }
        [DisplayName("Điện thoại")]

        public string? PhoneNumber { get; set; }
        [DisplayName("Sinh nhật")]
        public DateTime? BirthDay { get; set; }

        [DisplayName("Giới tính")]

        public int Gender { get; set; }
        [DisplayName("Địa chỉ")]

        public string? Address { get; set; }
        [DisplayName("Họ tên")]

        public string? FullName { get; set; }
        [DisplayName("Mã xác nhận")]
        public string? Token { get; set; }
        public string? Url { get; set; }
    }
}
