using Hinet.Model.Entities;
using Hinet.Repository.KPI_ThoiDiemDongBoVanBanRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_ThoiDiemDongBoVanBanService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;



namespace Hinet.Service.KPI_ThoiDiemDongBoVanBanService
{
    public class KPI_ThoiDiemDongBoVanBanService : Service<KPI_ThoiDiemDongBoVanBan>, IKPI_ThoiDiemDongBoVanBanService
    {

        public KPI_ThoiDiemDongBoVanBanService(
            IKPI_ThoiDiemDongBoVanBanRepository kPI_ThoiDiemDongBoVanBanRepository
            ) : base(kPI_ThoiDiemDongBoVanBanRepository)
        {
            
        }

        public async Task<PagedList<KPI_ThoiDiemDongBoVanBanDto>> GetData(KPI_ThoiDiemDongBoVanBanSearch search)
        {
            var query = from q in GetQueryable()
                        
                        select new KPI_ThoiDiemDongBoVanBanDto()
                        {
                            IdVanBan = q.IdVanBan,
							TypeVanBan = q.TypeVanBan,
							ThoiGianDongBoVanBan = q.ThoiGianDongBoVanBan,
							IsTuNhap = q.IsTuNhap,
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
                if(search.IdVanBan.HasValue)
				{
					query = query.Where(x => x.IdVanBan == search.IdVanBan);
				}
				if(!string.IsNullOrEmpty(search.TypeVanBan))
				{
					query = query.Where(x => EF.Functions.Like(x.TypeVanBan, $"%{search.TypeVanBan}%"));
				}
				if(search.ThoiGianDongBoVanBanFrom.HasValue)
				{
					query = query.Where(x => x.ThoiGianDongBoVanBan >= search.ThoiGianDongBoVanBanFrom);
				}
				if(search.ThoiGianDongBoVanBanTo.HasValue)
				{
					query = query.Where(x => x.ThoiGianDongBoVanBan <= search.ThoiGianDongBoVanBanTo);
				}
				if(search.IsTuNhap.HasValue)
				{
					query = query.Where(x => x.IsTuNhap == search.IsTuNhap);
				}
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<KPI_ThoiDiemDongBoVanBanDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_ThoiDiemDongBoVanBanDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        
                        select new KPI_ThoiDiemDongBoVanBanDto()
                        {
                            IdVanBan = q.IdVanBan,
							TypeVanBan = q.TypeVanBan,
							ThoiGianDongBoVanBan = q.ThoiGianDongBoVanBan,
							IsTuNhap = q.IsTuNhap,
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
