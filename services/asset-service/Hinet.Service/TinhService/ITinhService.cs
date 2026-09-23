using Hinet.Model.Entities;
using Hinet.Service.TinhService.Dto;
using Hinet.Service.TinhService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using VKS.Domain.Entites;

namespace Hinet.Service.TinhService
{
    public interface ITinhService : IService<Tinh>
    {
        Task<PagedList<TinhDto>> GetData(TinhSearch search);
        Task<TinhDto?> GetDto(Guid id);
    }
}
