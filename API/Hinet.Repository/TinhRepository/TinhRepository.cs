using VKS.Domain;
using VKS.Domain.Entites;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Repository.TinhRepository
{
    public class TinhRepository : Repository<Tinh>, ITinhRepository
    {
        public TinhRepository(DbContext preContext) : base(preContext)
        {

        }
    }
}
