
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.DM_NhomDanhMucService.Request
{
    public class DM_NhomDanhMucRequest
    {
        public Guid? Id { get; set; }
        [Required]
        public string? GroupName { get; set; }
        [Required]
        public string? GroupCode { get; set; }
    }
}