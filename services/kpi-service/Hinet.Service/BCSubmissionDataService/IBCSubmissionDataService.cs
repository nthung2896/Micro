using Hinet.Model.MongoEntities;
using Hinet.Service.BCSubmissionDataService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hinet.Service.BCSubmissionDataService
{
    public interface IBCSubmissionDataService : IMongoService<BCSubmissionData>
    {
        Task<BCSubmissionData?> GetByBaoCaoDoiTuongIdAsync(string baoCaoDoiTuongId);
        Task<BCSubmissionData> LayGiaTriRongMacDinhAsync(string baoCaoDoiTuongId, string? mongoFormTemplateId = null, int? thang = null, int? nam = null);
        Task<BCFormTemplate?> GetTemplateSchemaAsync(string mongoFormTemplateId);
        Task LuuKhaiBaoAsync(string baoCaoDoiTuongId, string? formTemplateId, List<BCSubmissionValueItem> submittedValues, string username, string userId, string? status = null);
        Task<List<TongHopTinhThanhDto>> ThongKeTheoTinhThanhAsync(int thang, int nam);
        Task<List<TongHopNganhHangDto>> ThongKeTheoNganhHangAsync(int thang, int nam);

        Task<BCSubmissionData> GetFormTemplate(string id);
        Task<BCSubmissionData> GetByBaoCaoDoiTuongAndFormTemplate(string baoCaoDoiTuongId, string? mongoFormTemplateId = null, int? thang = null, int? nam = null);

        Task<List<TongHopTinhThanhDto>> ThongKeTheoTinhThanhNamAsync(int nam);
        Task<List<TongHopNganhHangDto>> ThongKeTheoNganhHangNamAsync(int nam);
        Task<List<BCSubmissionData>> GetListSubmissionByBaoCaoDoiTuong(Guid baoCaoDoiTuongId);
        Task<List<BCSubmissionData>> GetListSubmissionsWithData(List<string>? listBaoCaoDoiTuongId, int? thang, int? nam);
        byte[] ExportExcel(List<BCSubmissionDataDto> listData);
    }


    public class TongHopTinhThanhDto
    {
        public string TinhThanhName { get; set; } = "";
        public string TinhThanhCode { get; set; } = "";
        public long TongNguoiBan { get; set; }
        public long TongNguoiMua { get; set; }
        public long TongDonHang { get; set; }
        public decimal TongDoanhThu { get; set; }
        public decimal TongChiPhi { get; set; }
    }

    public class TongHopNganhHangDto
    {
        public string NganhHangName { get; set; } = "";
        public int NganhHangId { get; set; }
        public long TongDonThanhCong { get; set; }
        public decimal TongGiaTriGiaoDich { get; set; }
    }
}
