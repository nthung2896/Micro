using Hinet.Model.Entities;
using Hinet.Service.DM_NhomDanhMucService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.DM_NhomDanhMucService.Request;

namespace Hinet.Service.DM_NhomDanhMucService
{
    public interface IDM_NhomDanhMucService : IService<DM_NhomDanhMuc>
    {
        Task<PagedList<DM_NhomDanhMucDto>> GetData(DM_NhomDanhMucSearch search);

        Task<DM_NhomDanhMucDto> GetDto(Guid id);

        Task<List<DanhMucDto>> GetListDanhMuc();
    }
}