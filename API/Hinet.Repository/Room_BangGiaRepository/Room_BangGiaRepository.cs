using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.Room_BangGiaRepository
{
    public class Room_BangGiaRepository : Repository<Room_BangGia>, IRoom_BangGiaRepository
    {
        public Room_BangGiaRepository(DbContext context) : base(context)
        {
        }
    }
}
