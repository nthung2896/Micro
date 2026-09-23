using Hinet.Model;
using Hinet.Model.Entities;
using Hinet.Repository.KPI_CauHinhCongThucNhiemVuRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_CauHinhCongThucNhiemVuService.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;

namespace Hinet.Service.KPI_CauHinhCongThucNhiemVuService
{
    public class KPI_CauHinhCongThucNhiemVuService : Service<KPI_CauHinhCongThucNhiemVu>, IKPI_CauHinhCongThucNhiemVuService
    {
        private readonly IKPI_CauHinhCongThucNhiemVuRepository _kPI_CauHinhCongThucNhiemVuRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IKPI_DotTheoDoiDanhGiaRepository _kPIDotTheoDoiDanhGiaRepository;

        public KPI_CauHinhCongThucNhiemVuService(
            IKPI_CauHinhCongThucNhiemVuRepository kPI_CauHinhCongThucNhiemVuRepository,
            IDepartmentRepository departmentRepository,
            IKPI_DotTheoDoiDanhGiaRepository kPIDotTheoDoiDanhGiaRepository
            ) : base(kPI_CauHinhCongThucNhiemVuRepository)
        {
            _kPI_CauHinhCongThucNhiemVuRepository = kPI_CauHinhCongThucNhiemVuRepository;
            _departmentRepository = departmentRepository;
            _kPIDotTheoDoiDanhGiaRepository = kPIDotTheoDoiDanhGiaRepository;
        }

        public async Task<PagedList<KPI_CauHinhCongThucNhiemVuDto>> GetData(KPI_CauHinhCongThucNhiemVuSearch search)
        {
            var query = GetQueryable();

            if (search == null)
            {
                search = new KPI_CauHinhCongThucNhiemVuSearch();
            }

            var queryDto = from q in query
                           select new KPI_CauHinhCongThucNhiemVuDto()
                           {
                               Id = q.Id,
                               IdDonVi = q.IdDonVi,
                               IdDotDanhGia = q.IdDotDanhGia,
                               TargetTable = q.TargetTable,
                               TargetColumn = q.TargetColumn,
                               fomula = q.fomula,
                               Type = q.Type,
                               CreatedDate = q.CreatedDate,
                               UpdatedDate = q.UpdatedDate,
                           };

            var pagedList = await PagedList<KPI_CauHinhCongThucNhiemVuDto>.CreateAsync(queryDto, search);

            var donViIds = pagedList.Items.Where(x => x.IdDonVi.HasValue).Select(x => x.IdDonVi.Value).Distinct().ToList();
            var dotDanhGiaIds = pagedList.Items.Where(x => x.IdDotDanhGia.HasValue).Select(x => x.IdDotDanhGia.Value).Distinct().ToList();

            var donVis = await _departmentRepository.GetQueryable().Where(x => donViIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name);
            var dotDanhGias = await _kPIDotTheoDoiDanhGiaRepository.GetQueryable().Where(x => dotDanhGiaIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.TenDotTheoDoiDanhGia);

            foreach (var item in pagedList.Items)
            {
                if (item.IdDonVi.HasValue && donVis.ContainsKey(item.IdDonVi.Value))
                {
                    item.TenDonVi = donVis[item.IdDonVi.Value];
                }
                if (item.IdDotDanhGia.HasValue && dotDanhGias.ContainsKey(item.IdDotDanhGia.Value))
                {
                    item.TenDotDanhGia = dotDanhGias[item.IdDotDanhGia.Value];
                }
            }

            return pagedList;
        }

        public async Task<KPI_CauHinhCongThucNhiemVuDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)
                        select new KPI_CauHinhCongThucNhiemVuDto()
                        {
                               Id = q.Id,
                               IdDonVi = q.IdDonVi,
                               IdDotDanhGia = q.IdDotDanhGia,
                               TargetTable = q.TargetTable,
                               TargetColumn = q.TargetColumn,
                               fomula = q.fomula,
                               Type = q.Type,
                               CreatedDate = q.CreatedDate,
                               UpdatedDate = q.UpdatedDate,
                        }).FirstOrDefaultAsync();
            return item;
        }
    }
}
