using Hinet.Service.AppUserService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.AspNetUsersService.Dto
{
    public class ImportDto
    {
        public List<AppUserDto> ListTrue { get; set; }

        public List<AppUserDto> ListFalse { get; set; }
    }
}
