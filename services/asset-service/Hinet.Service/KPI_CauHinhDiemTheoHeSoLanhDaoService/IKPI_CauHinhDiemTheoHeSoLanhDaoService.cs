using Hinet.Model.Entities;
using Hinet.Service.Common.Service;
using Hinet.Service.Common;
using Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService
{
    public interface IKPI_CauHinhDiemTheoHeSoLanhDaoService : IService<KPI_CauHinhDiemTheoHeSoLanhDao>
    {
        Task<PagedList<KPI_CauHinhDiemTheoHeSoLanhDaoDto>> GetData(KPI_CauHinhDiemTheoHeSoLanhDaoSearch search);
        Task<KPI_CauHinhDiemTheoHeSoLanhDaoDto> GetDto(Guid id);
    }
}
