using Hinet.Model.Entities;
using Hinet.Service.XaService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.XaService
{
    public interface IXaService : IService<Xa>
    {
        Task<PagedList<XaDto>> GetData(XaSearch search);
        Task<XaDto?> GetDto(Guid id);
    }
}
