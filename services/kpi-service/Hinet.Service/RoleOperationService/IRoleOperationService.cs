using Hinet.Model.Entities;
using Hinet.Service.RoleOperationService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.RoleOperationService.Request;

namespace Hinet.Service.RoleOperationService
{
    public interface IRoleOperationService : IService<RoleOperation>
    {
        Task<PagedList<RoleOperationDto>> GetData(RoleOperationSearch search);

        Task<RoleOperationDto> GetDto(Guid id);

        List<RoleOperation> GetByRoleId(Guid RoleId);

        Task<List<RoleOperationViewModel>> GetOperationByRoleId(Guid? id);
    }
}