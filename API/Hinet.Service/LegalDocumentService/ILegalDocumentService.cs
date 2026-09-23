using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.LegalDocumentService.Dto;
using Hinet.Service.LegalDocumentService.Request;

namespace Hinet.Service.LegalDocumentService
{
    public interface ILegalDocumentService : IService<LegalDocument>
    {
        Task<PagedList<LegalDocumentDto>> GetData(LegalDocumentSearch search);
        Task<LegalDocumentDto> GetDto(Guid id);
        Task<LegalDocument> Create(LegalDocumentCreateRequest request);
        Task<LegalDocument> Update(LegalDocumentCreateRequest request);
        Task UpdateStatus(Guid id, string status);
        Task UpdateStatusMultiple(List<Guid> ids, string status);
    }
}
