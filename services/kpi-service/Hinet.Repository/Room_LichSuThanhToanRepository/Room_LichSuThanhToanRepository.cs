using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.Room_LichSuThanhToanRepository
{
    public class Room_LichSuThanhToanRepository : Repository<Room_LichSuThanhToan>, IRoom_LichSuThanhToanRepository
    {
        public Room_LichSuThanhToanRepository(DbContext context) : base(context)
        {
        }
    }
}
