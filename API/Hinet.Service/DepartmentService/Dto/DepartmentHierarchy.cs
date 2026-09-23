namespace Hinet.Service.DepartmentService.Dto
{
    public class DepartmentHierarchy
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Code { get; set; }
        public string? ShortName { get; set; }
        public string? DiaDanh { get; set; }
        public Guid? ParentId { get; set; }
        public long? Priority { get; set; }
        public int Level { get; set; }
        public string Loai { get; set; }
        public bool IsActive { get; set; }
        public string? MaTinh { get; set; }
        public List<DepartmentHierarchy>? Children { get; set; }
    }
}
