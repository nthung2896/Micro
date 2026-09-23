using Hinet.Model.Entities;
using Hinet.Repository.KPI_DauRaNhiemVuRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_DauRaNhiemVuService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;



namespace Hinet.Service.KPI_DauRaNhiemVuService
{
    public class KPI_DauRaNhiemVuService : Service<KPI_DauRaNhiemVu>, IKPI_DauRaNhiemVuService
    {

        public KPI_DauRaNhiemVuService(
            IKPI_DauRaNhiemVuRepository kPI_DauRaNhiemVuRepository
            ) : base(kPI_DauRaNhiemVuRepository)
        {
            
        }

        public async Task<PagedList<KPI_DauRaNhiemVuDto>> GetData(KPI_DauRaNhiemVuSearch search)
        {
            var query = from q in GetQueryable()
                        
                        select new KPI_DauRaNhiemVuDto()
                        {
                            IdNhiemVu = q.IdNhiemVu,
							IdThoiDiemDongBoVanBan = q.IdThoiDiemDongBoVanBan,
							IdDotDanhGia = q.IdDotDanhGia,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        };
            if(search != null )
            {
                if(search.IdNhiemVu.HasValue)
				{
					query = query.Where(x => x.IdNhiemVu == search.IdNhiemVu);
				}
				if(search.IdThoiDiemDongBoVanBan.HasValue)
				{
					query = query.Where(x => x.IdThoiDiemDongBoVanBan == search.IdThoiDiemDongBoVanBan);
				}
				if(search.IdDotDanhGia.HasValue)
				{
					query = query.Where(x => x.IdDotDanhGia == search.IdDotDanhGia);
				}
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<KPI_DauRaNhiemVuDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_DauRaNhiemVuDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        
                        select new KPI_DauRaNhiemVuDto()
                        {
                            IdNhiemVu = q.IdNhiemVu,
							IdThoiDiemDongBoVanBan = q.IdThoiDiemDongBoVanBan,
							IdDotDanhGia = q.IdDotDanhGia,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        }).FirstOrDefaultAsync();
            
            return item;
        }

    }
}
