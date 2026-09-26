using Hinet.Model.Entities;
using Hinet.Service.KPI_LyLich2CService.Dto;
using Hinet.Service.KPI_LyLich2CService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_LyLich2CService
{
    public interface IKPI_LyLich2CService : IService<KPI_LyLich2C>
    {
        Task<PagedList<KPI_LyLich2CDto>> GetData(KPI_LyLich2CSearch search);
        Task<KPI_LyLich2CDto?> GetDto(Guid id);
        Task<object> ImportExcelDirectAsync(Microsoft.AspNetCore.Http.IFormFile file, Guid donViSuDungId, int startRow = 2);
        Task<BatchStaffImportResultDto> ImportStaffBatchAsync(List<StaffImportItemDto> staffList, string? defaultPassword = null);
        Task<BatchStaffImportResultDto> DemoImport10StaffAsync(Guid? donViSuDungId = null);
    }
}
