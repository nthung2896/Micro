using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;



namespace Hinet.Repository.XaRepository
{
    public class XaRepository : Repository<Xa>, IXaRepository
    {
        public XaRepository(DbContext context) : base(context)
        {
        }
    }
}
