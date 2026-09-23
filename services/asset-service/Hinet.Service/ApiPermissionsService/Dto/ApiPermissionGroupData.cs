using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.ApiPermissionsService.Dto
{
    public class ApiPermissionGroupData
    {
        public string? Name { get; set; }
        public string? Path { get; set; }
        public bool Checked { get; set; }
        public List<ApiPermissionAction>? Actions { get; set; }
    }
    public class ApiPermissionAction
    {
        public string? Name { get; set; }
        public string? Path { get; set; }
        public bool Checked { get; set; }
    }


}
