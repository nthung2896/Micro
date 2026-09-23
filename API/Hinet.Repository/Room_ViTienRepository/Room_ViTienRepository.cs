using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.Room_ViTienRepository
{
    public class Room_ViTienRepository : Repository<Room_ViTien>, IRoom_ViTienRepository
    {
        public Room_ViTienRepository(DbContext context) : base(context)
        {
        }
    }
}
