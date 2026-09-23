using Hinet.Model.Entities;
using Hinet.Service.Room_BangGiaService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.Room_BangGiaService
{
    public interface IRoom_BangGiaService : IService<Room_BangGia>
    {
        Task<PagedList<Room_BangGiaDto>> GetData(Room_BangGiaSearch search);
        Task<Room_BangGiaDto?> GetDto(Guid id);
    }
}
