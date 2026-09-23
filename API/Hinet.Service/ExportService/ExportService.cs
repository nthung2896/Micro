using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Hinet.Model.MongoEntities;
//using Hinet.Service.BCBaoCaoDoiTuongService;
//using Hinet.Service.BCDotBaoCaoService;
//using Hinet.Service.PlatformManageService;
using Hinet.Service.BCSubmissionDataService;
using Hinet.Service.BCSubmissionDataService.Dto;

namespace Hinet.Service.ExportService
{
    public class ExportService : IExportService
    {
        private readonly IBCSubmissionDataService _submissionService;
        //private readonly IBCBaoCaoDoiTuongService _doiTuongService;
        //private readonly IBCDotBaoCaoService _dotBaoCaoService;
        //private readonly IPlatformManageService _platformManageService;

        public ExportService(
            IBCSubmissionDataService submissionService
            //IBCBaoCaoDoiTuongService doiTuongService,
            //IBCDotBaoCaoService dotBaoCaoService,
            //IPlatformManageService platformManageService
            )
        {
            _submissionService = submissionService;
            //_doiTuongService = doiTuongService;
            //_dotBaoCaoService = dotBaoCaoService;
            //_platformManageService = platformManageService;
        }

        /// <summary>
        /// Lấy dữ liệu phục vụ xuất Excel theo đúng kiến trúc Clean Architecture:
        /// - Nếu truyền idDotBaoCao (SQL-first): Lọc các BaoCaoDoiTuongId thuộc đợt báo cáo trong SQL trước, sau đó query MongoDB theo danh sách ID này.
        /// - Nếu không truyền idDotBaoCao (Mongo-first): Lọc submissions từ MongoDB trước, sau đó trích xuất Guid để query SQL map tên nền tảng.
        /// </summary>
        public async Task<List<BCSubmissionDataDto>> GetExportDataAsync(Guid? idDoiTuongBaoCao, Guid idDotBaoCao, int? thang, int? nam)
        {
            //var dtoList = new List<BCSubmissionDataDto>();

            // SQL-first: Trích xuất danh sách assignment thuộc đợt báo cáo trước
            //var sqlQuery = from dt in _doiTuongService.GetQueryable()
            //               join dot in _dotBaoCaoService.GetQueryable() on dt.IdDotBaoCao equals dot.Id
            //               join nt in _platformManageService.GetQueryable() on dt.IdDoiTuong equals nt.Id into ntJoin
            //               from nt in ntJoin.DefaultIfEmpty()
            //               where dt.IdDotBaoCao == idDotBaoCao
            //               select new
            //               {
            //                   AssignmentId = dt.Id.ToString(),
            //                   PlatformName = nt != null ? nt.Name : "",
            //                   PlatformManageTypeId = nt.AppManageTypeId != null ? nt.AppManageTypeId.ToString() : null,
            //                   dot.MongoFormTemplateId,
            //                   dot.LoaiKyBaoCao,
            //                   dot.NamBaoCao

            //               };

            //if (idDoiTuongBaoCao.HasValue)
            //{
            //    sqlQuery = sqlQuery.Where(x => x.AssignmentId == idDoiTuongBaoCao.Value.ToString());
            //}

            //var assignments = await sqlQuery.ToListAsync();
            //var assignmentIds = assignments.Select(x => x.AssignmentId).ToList();

            // Truy vấn MongoDB cho các đối tượng đã lấy ở trên
            //var submissions = await _submissionService.GetListSubmissionsWithData(
            //    assignmentIds,
            //    thang,
            //    nam);

            //var submissionMap = (submissions ?? new List<BCSubmissionData>())
            //    .GroupBy(s => s.BaoCaoDoiTuongId)
            //    .ToDictionary(g => g.Key, g => g.ToList(), StringComparer.OrdinalIgnoreCase);

            //var platformTypeNames = new Dictionary<string, string>
            //{
            //    ["1"] = "Nền tảng TMĐT kinh doanh trực tiếp có chức năng đặt hàng trực tuyến",
            //    ["2"] = "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có chức năng đặt hàng trực tuyến có hoạt động TMĐT tại Việt Nam",
            //    ["3"] = "Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, nền tảng TMĐT tích hợp",
            //    ["4"] = "Nền tảng TMĐT trung gian nước ngoài, mạng xã hội hoạt động TMĐT nước ngoài, nền tảng TMĐT tích hợp nước ngoài"
            //};

            //foreach (var assign in assignments)
            //{
            //    platformTypeNames.TryGetValue(assign.PlatformManageTypeId ?? "", out var loaiNenTang);
            //    if (submissionMap.TryGetValue(assign.AssignmentId, out var subList) && subList.Any())
            //    {
            //        foreach (var s in subList)
            //        {
            //            dtoList.Add(new BCSubmissionDataDto
            //            {
            //                Id = s.Id,
            //                BaoCaoDoiTuongId = s.BaoCaoDoiTuongId,
            //                FormTemplateId = s.FormTemplateId,
            //                Status = s.Status,
            //                ThangBaoCao = s.ThangBaoCao,
            //                NamBaoCao = s.NamBaoCao,
            //                CreatedDate = s.CreatedDate,
            //                UpdatedDate = s.UpdatedDate,
            //                DataValues = s.DataValues,
            //                TenNenTang = assign.PlatformName,
            //                LoaiNenTang = loaiNenTang ,
            //                LoaiKyBaoCao = assign.LoaiKyBaoCao
            //            });
            //        }
            //    }
            //else
            //{
            //    // Lấy cấu trúc trống mặc định ứng với template của đợt
            //    var emptySub = await _submissionService.LayGiaTriRongMacDinhAsync(assign.AssignmentId, assign.MongoFormTemplateId, thang, nam);
            //    if (emptySub != null)
            //    {
            //        dtoList.Add(new BCSubmissionDataDto
            //        {
            //            Id = emptySub.Id,
            //            BaoCaoDoiTuongId = emptySub.BaoCaoDoiTuongId,
            //            FormTemplateId = emptySub.FormTemplateId,
            //            Status = emptySub.Status,
            //            ThangBaoCao = emptySub.ThangBaoCao,
            //            NamBaoCao = assign.NamBaoCao,
            //            CreatedDate = emptySub.CreatedDate,
            //            UpdatedDate = emptySub.UpdatedDate,
            //            DataValues = emptySub.DataValues,
            //            TenNenTang = assign.PlatformName,
            //            LoaiNenTang = assign.PlatformType
            //        });
            //    }
            //}
            //}

            //return dtoList;

            return null;
        }
    }
}
