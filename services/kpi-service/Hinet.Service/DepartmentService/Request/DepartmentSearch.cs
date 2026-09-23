using Hinet.Service.Dto;

namespace Hinet.Service.DepartmentService.Dto
{
    public class DepartmentSearch : SearchBase
    {
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
        public long? ParentId { get; set; }
        public long? Priority { get; set; }
        public string? Name { get; set; }
        public string? Code { get; set; }
        public string? Loai { get; set; }
        public int? Level { get; set; }
        public bool? IsActive { get; set; }
    }
}
