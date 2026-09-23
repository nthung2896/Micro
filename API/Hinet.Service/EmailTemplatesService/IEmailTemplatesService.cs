using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.EmailTemplatesService.Dto;
using Hinet.Service.EmailTemplatesService.Request;

namespace Hinet.Service.EmailTemplatesService
{
    public interface IEmailTemplatesService : IService<EmailTemplates>
    {
        Task<PagedList<EmailTemplatesDto>> GetData(EmailTemplatesSearch search);
        Task<EmailTemplatesDto?> GetDto(Guid id);
        Task<bool> SendDynamicEmailAsync(SendDynamicEmailRequest request);
        Task<bool> SendByCodeAsync(SendEmailByCodeRequest request);
    }
}
