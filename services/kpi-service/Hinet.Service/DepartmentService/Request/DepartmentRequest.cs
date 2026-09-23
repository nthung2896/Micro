using System;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.DepartmentService.Request
{
    public class DepartmentRequest
    {
        public Guid? Id { get; set; }
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
        public Guid? ParentId { get; set; }
        public long? Priority { get; set; }
        [Required]
        public string? Name { get; set; }
        [Required]
        public string? Code { get; set; }
        [Required]
        public string? Loai { get; set; }
        [Required]
        public int Level { get; set; }
        [Required]
        public bool IsActive { get; set; }
        public string? DiaDanh { get; set; }
        public string? MaTinh { get; set; }
        public string? Address { get; set; }
        public string? Hotline { get; set; }
        public string? Email { get; set; }

        // tạm xóa
        public string? idcha { get; set; }
        public string? idchinhno { get; set; }
    }
}