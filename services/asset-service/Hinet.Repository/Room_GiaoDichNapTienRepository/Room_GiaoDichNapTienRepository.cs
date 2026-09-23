using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.Room_GiaoDichNapTienRepository
{
    public class Room_GiaoDichNapTienRepository : Repository<Room_GiaoDichNapTien>, IRoom_GiaoDichNapTienRepository
    {
        public Room_GiaoDichNapTienRepository(DbContext context) : base(context)
        {
        }
    }
}
