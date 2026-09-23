using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("DM_NhomDanhMuc")]
    public class DM_NhomDanhMuc : AuditableEntity
    {
        [Required]
        [StringLength(150)]
        public string GroupName { get; set; }
        [Required]
        [StringLength(150)]
        public string GroupCode { get; set; }
    }
}
