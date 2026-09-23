using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.AppUserService.Dto
{
    public class ProfileUserEditRequest
    {
        public Guid? Id { get; set; }

        public string? Name { get; set; }

        public int Gender { get; set; }

        public DateTime? NgaySinh { get; set; }

        public string? PhoneNumber { get; set; }

        public string? DiaChi { get; set; }
        public string? Email { get; set; }
        public bool? IsKySo { get; set; }
    }
}
