using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.AspNetUsersService.Request
{
    public class AnhChuKySoRequest
    {
        public Guid? UserId { get; set; }
        public Guid? TaiLieuDinhKemId { get; set; }
        public string? TenFile { get; set; }
        public string? DuongDanFile { get; set; }
    }
}
