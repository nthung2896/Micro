using Hinet.Model.Entities;
using Hinet.Service.AppConfigurationService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.AppConfigurationService
{
    public interface IAppConfigurationService : IService<AppConfiguration>
    {
        Task<PagedList<AppConfigurationDto>> GetData(AppConfigurationSearch search);
        Task<AppConfigurationDto?> GetDto(Guid id);
        Task SetActiveConfigAsync(Guid activeId);
    }
}
