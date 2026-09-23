
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.RoleService.Request
{
    public class RoleRequest
    {
        public Guid? Id { get; set; }
        [Required]
        public string? Name { get; set; }
        [Required]
        public string? Code { get; set; }
        public string? Type { get; set; }
    }
}