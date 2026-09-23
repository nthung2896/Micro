using Hinet.Model.Entities;
using Hinet.Service.ModuleService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;
using Hinet.Service.ModuleService.Request;

namespace Hinet.Service.ModuleService
{
    public interface IModuleService : IService<Module>
    {
        Task<PagedList<ModuleDto>> GetData(ModuleSearch search);

        Task<List<DropdownOption>> GetDropDown(string? selected);

        Task<ModuleDto> GetDto(Guid id);

        Task<List<ModuleGroup>> GetModuleGroupData(Guid roleId);
    }
}