using Hinet.Service.Dto;


namespace Hinet.Service.RoleService.Request
{
    public class RoleSearch : SearchBase
    {
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
        public string? Name { get; set; }
        public string? Code { get; set; }
        public Guid? DepartmentId { get; set; }
    }
}
