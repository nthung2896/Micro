using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.Room_ThongTinNganHangRepository
{
    public class Room_ThongTinNganHangRepository : Repository<Room_ThongTinNganHang>, IRoom_ThongTinNganHangRepository
    {
        public Room_ThongTinNganHangRepository(DbContext context) : base(context)
        {
        }
    }
}
