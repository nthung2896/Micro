using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.PhongTroRepository
{
    public class PhongTroRepository : Repository<PhongTro>, IPhongTroRepository
    {
        public PhongTroRepository(DbContext context) : base(context)
        {
        }
    }
}
