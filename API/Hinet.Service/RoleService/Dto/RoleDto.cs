using Hinet.Model.Entities;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace Hinet.Service.RoleService.Dto
{
    public class RoleDto : Role
    {
        public bool IsGanNguoi { get; set; }
        public string Type_txt { get; set; }
    }
}
