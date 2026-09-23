using Hinet.Model.Entities;
using Hinet.Service.OperationService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.OperationService.Request;

namespace Hinet.Service.OperationService
{
    public interface IOperationService : IService<Operation>
    {
        Task<PagedList<OperationDto>> GetData(OperationSearch search);

        Task<OperationDto> GetDto(Guid id);

        Task<List<MenuDataDto>> GetListOperationOfUser(Guid userId);

        Task<List<ModuleMenuDTO>> GetListOperationOfRole(Guid roleId);

        Task<List<MenuDataDto>> GetListMenu(Guid userId, List<string> RoleCodes);
    }
}