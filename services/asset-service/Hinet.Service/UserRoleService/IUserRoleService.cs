using Hinet.Model.Entities;
using Hinet.Service.UserRoleService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;
using Hinet.Service.UserRoleService.Request;

namespace Hinet.Service.UserRoleService
{
    public interface IUserRoleService : IService<UserRole>
    {
        Task<PagedList<UserRoleDto>> GetData(UserRoleSearch search);

        Task<UserRoleDto> GetDto(Guid id);

        UserRole GetByUserAndRole(Guid userId, Guid roleId);

        List<UserRole> GetByUser(Guid userId);

        Task<UserRoleVM> GetUserRoleVM(Guid userId);
        List<string> GetListRoleCodeByUserId(Guid userId);
    }
}