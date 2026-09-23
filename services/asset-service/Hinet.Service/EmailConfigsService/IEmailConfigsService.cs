using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.EmailConfigsService.Dto;
using Hinet.Service.EmailConfigsService.Request;

namespace Hinet.Service.EmailConfigsService
{
    public interface IEmailConfigsService : IService<EmailConfigs>
    {
        Task<PagedList<EmailConfigsDto>> GetData(EmailConfigsSearch search);
        Task<EmailConfigsDto?> GetDto(Guid id);
    }
}
