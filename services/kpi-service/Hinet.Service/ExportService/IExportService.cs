using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hinet.Service.BCSubmissionDataService.Dto;

namespace Hinet.Service.ExportService
{
    public interface IExportService
    {
        Task<List<BCSubmissionDataDto>> GetExportDataAsync(Guid? idDoiTuongBaoCao, Guid idDotBaoCao, int? thang, int? nam);
    }
}
