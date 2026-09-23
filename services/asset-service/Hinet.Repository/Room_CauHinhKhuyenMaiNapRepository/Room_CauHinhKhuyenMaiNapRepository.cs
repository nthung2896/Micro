using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.Room_CauHinhKhuyenMaiNapRepository
{
    public class Room_CauHinhKhuyenMaiNapRepository : Repository<Room_CauHinhKhuyenMaiNap>, IRoom_CauHinhKhuyenMaiNapRepository
    {
        public Room_CauHinhKhuyenMaiNapRepository(DbContext context) : base(context)
        {
        }
    }
}
