using Hinet.Model.Entities;
using Hinet.Service.ApiPermissionsService.Dto;
using Hinet.Service.ApiPermissionsService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.ApiPermissionsService
{
    public interface IApiPermissionsService : IService<ApiPermissions>
    {
        Task<PagedList<ApiPermissionsDto>> GetData(ApiPermissionsSearch search);
        Task<ApiPermissionsDto?> GetDto(Guid id);
        Task<List<string?>> GetApiPermistionOfUser(Guid? userId);
        Task<List<ApiPermissions>> GetByUserId(Guid? userId);
        Task<List<ApiPermissions>> GetByRoleId(Guid? roleId);
        Task Save(ApiPermissionsSaveVM model);
    }
}
