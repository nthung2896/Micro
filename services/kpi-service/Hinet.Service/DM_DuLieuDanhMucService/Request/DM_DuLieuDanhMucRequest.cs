
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.DM_DuLieuDanhMucService.Request
{
    public class DM_DuLieuDanhMucRequest
    {
        public Guid? Id { get; set; }
        public Guid? GroupId { get; set; }
        [Required]
        public string? Name { get; set; }
        [Required]
        public string? Code { get; set; }
        public string? Note { get; set; }
        public int? Priority { get; set; }

        public Guid? DonViId { get; set; }
        public Guid? FileId { get; set; }
        public string? NoiDung { get; set; }
    }
}