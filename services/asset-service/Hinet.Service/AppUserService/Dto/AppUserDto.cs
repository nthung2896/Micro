using Hinet.Model.Entities;
using Hinet.Service.AspNetUsersService.Dto;
using Hinet.Service.AspNetUsersService.Request;
using Hinet.Service.OperationService.Dto;
using System.ComponentModel;

namespace Hinet.Service.AppUserService.Dto
{
    public class AppUserDto
    {

        public Guid? Id { get; set; }
        public string? MaCanBo { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public int Gender { get; set; }
        public string? Picture { get; set; }
        public List<string> ListRole { get; set; }
        public Guid? DonViId { get; set; }
        public bool? IsSSO { get; set; }
        public bool? isHasRole { get; set; }
        public string? AnhDaiDien { get; set; }
        public string? TenDonVi_txt { get; set; }
        public Guid IdJoin { get; set; }
        public string? Type { get; set; }
        public DateTime? CreatedDate { get; set; }

        public string? UserName { get; set; }
        public string? DiaChi { get; set; }
        public string? Tinh { get; set; }
        public string? MaTinh { get; set; }
        public string? Huyen { get; set; }
        public string? CCCD { get; set; }

        public string? PhoneNumber { get; set; }

        public DateTime? NgaySinh { get; set; }
        [DisplayName("Giới tính")]
        public string? GioiTinh_txt { get; set; }
        public string? VaiTro_response { get; set; }
        public List<string>? VaiTro_txt_response { get; set; }

        public string? GroupRole_txt { get; set; }
        public string? Department_txt { get; set; }

        public bool LockoutEnabled { get; set; }
        public string DepartmentId { get; set; }
        public Guid? PhongBanId { get; set; }
        public List<string> GroupRole_response { get; set; }
        public List<string> ListPhongBan { get; set; }
        public List<string> vaiTro { get; set; }
        public List<MenuDataDto>? MenuData { get; set; }
        public bool IsKySo { get; set; }
        public string? TenChucVu { get; set; }
        public string? ChucVuCode { get; set; }
        public Guid? IdLyLich { get; set; }
        public bool IsCT { get; set; }
        public bool IsPCT { get; set; }
        public bool IsTP { get; set; }
        public bool IsPTP { get; set; }

        public static AppUserDto FromAppUser(AppUser? user)
        {
            if (user == null)
            {
                return new AppUserDto();
            }
            return new AppUserDto()
            {
                MaCanBo = user.MaCanBo,
                Gender = user.Gender,
                Id = user.Id,
                Email = user.Email,
                Name = user.Name ?? "",
                Type = user.Type,
                Picture = user.Picture,
                DonViId = user.DonViId,
                IdJoin = user.Id,
                CCCD = user.CCCD,
                UserName = user.UserName,
                DiaChi = user.DiaChi,
                PhoneNumber = user.PhoneNumber,
                NgaySinh = user.NgaySinh,
                GioiTinh_txt = user.Gender == 1 ? "Nam" : "Nữ",
                IsKySo = user.IsKySo,

            };
        }
    }
}
