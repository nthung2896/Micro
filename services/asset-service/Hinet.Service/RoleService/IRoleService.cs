using Hinet.Model.Entities;
using Hinet.Service.RoleService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;
using Hinet.Service.RoleService.Request;

namespace Hinet.Service.RoleService
{
    public interface IRoleService : IService<Role>
    {
        Task<PagedList<RoleDto>> GetData(RoleSearch search);

        Task<RoleDto> GetDto(Guid id);

        Task<List<RoleDto>> GetRole(Guid userId);

        Task<List<DropdownOption>> GetDropDown(string? selected);

        Task<Role> GetByCode(string code);

        Task<List<RoleDto>> GetRolesOfUser(Guid? userId);

        Task<List<DropdownOption>> GetDropDownVaiTroIds(string? selected);
        Task<List<DropdownOption>> GetDropDownByUserDepartment(string? selected, Guid? departmentId);
        Task<List<DropdownOption>> GetDropDownIdByUserDepartment(string? selected, Guid? departmentId);
    }
}