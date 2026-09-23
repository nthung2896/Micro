using Hinet.Model;
using Hinet.Model.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Repository.KPI_CauHinhDiemTheoHeSoLanhDaoRepository
{
    public class KPI_CauHinhDiemTheoHeSoLanhDaoRepository : Repository<KPI_CauHinhDiemTheoHeSoLanhDao>, IKPI_CauHinhDiemTheoHeSoLanhDaoRepository
    {
        public KPI_CauHinhDiemTheoHeSoLanhDaoRepository(DbContext dbContext) : base(dbContext)
        {
        }
    }
}
