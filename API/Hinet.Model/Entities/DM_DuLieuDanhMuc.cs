using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("DM_DuLieuDanhMuc")]
    public class DM_DuLieuDanhMuc : AuditableEntity
    {
        public Guid? GroupId { get; set; }
        [Required]
        [StringLength(250)]
        public string Name { get; set; }
        [StringLength(250)]
        public string Code { get; set; }
        public string? Note { get; set; }
        public int? Priority { get; set; }

        public Guid? DonViId { get; set; }
        public string? DuongDanFile { get; set; }
        public string? NoiDung { get; set; }
    }
}
