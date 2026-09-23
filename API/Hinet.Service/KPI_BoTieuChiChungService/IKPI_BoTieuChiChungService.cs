using Hinet.Model.Entities;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_BoTieuChiChungService.Dto;
using Hinet.Service.KPI_BoTieuChiChungService.ViewModels;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_BoTieuChiChungService
{
    public interface IKPI_BoTieuChiChungService : IService<KPI_BoTieuChiChung>
    {
        Task<KPI_BoTieuChiChungDto> GetDto(System.Guid id);
        Task<PagedList<KPI_BoTieuChiChungDto>> GetData(KPI_BoTieuChiChungSearch search);
        Task SetActiveBoTieuChiChungAsync(System.Guid activeId, System.Guid idDonVi, string? type = null);
        Task<ImportExcelResultDto> ImportExcelDirectAsync(Microsoft.AspNetCore.Http.IFormFile file, KPI_BoTieuChiChungImportVM data);
        Task<string> ExportTemplateImportAsync();
    }
}
