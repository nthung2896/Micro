using Hinet.Model.Entities;
using Hinet.Service.HuyenService.Dto;
using Hinet.Service.HuyenService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Domain.Entites;

namespace Hinet.Service.HuyenService
{
    public interface IHuyenService : IService<Huyen>
    {
        Task<PagedList<HuyenDto>> GetData(HuyenSearch search);
        Task<HuyenDto?> GetDto(Guid id);
    }
}
