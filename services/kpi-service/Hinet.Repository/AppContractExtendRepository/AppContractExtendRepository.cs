using Hinet.Model.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Repository.AppContractExtendRepository
{
    public class AppContractExtendRepository : Repository<AppContractExtend>, IAppContractExtendRepository
    {
        public AppContractExtendRepository(DbContext context) : base(context)
        {
        }
    }
}
