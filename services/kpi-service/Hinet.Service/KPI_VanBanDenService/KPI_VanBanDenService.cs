using Hinet.Model.Entities;
using Hinet.Repository.KPI_VanBanDenRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_VanBanDenService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;



namespace Hinet.Service.KPI_VanBanDenService
{
    public class KPI_VanBanDenService : Service<KPI_VanBanDen>, IKPI_VanBanDenService
    {

        public KPI_VanBanDenService(
            IKPI_VanBanDenRepository kPI_VanBanDenRepository
            ) : base(kPI_VanBanDenRepository)
        {
            
        }

        public async Task<PagedList<KPI_VanBanDenDto>> GetData(KPI_VanBanDenSearch search)
        {
            var query = from q in GetQueryable()
                        
                        select new KPI_VanBanDenDto()
                        {
                            IdVanBanDongBo = q.IdVanBanDongBo,
							SoVanBan = q.SoVanBan,
							NgayVanBan = q.NgayVanBan,
							TrichYeu = q.TrichYeu,
							TrangThai = q.TrangThai,
							NgayHoanThanh = q.NgayHoanThanh,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            //IsDelete = q.IsDelete,
                            //DeleteId = q.DeleteId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            //DeleteTime = q.DeleteTime,
                            Id = q.Id,
                        };
            if(search != null )
            {
    //            if(!string.IsNullOrEmpty(search.IdVanBanDongBo))
				//{
				//	query = query.Where(x => EF.Functions.Like(x.IdVanBanDongBo, $"%{search.IdVanBanDongBo}%"));
				//}
				if(!string.IsNullOrEmpty(search.SoVanBan))
				{
					query = query.Where(x => EF.Functions.Like(x.SoVanBan, $"%{search.SoVanBan}%"));
				}
				if(search.NgayVanBanFrom.HasValue)
				{
					query = query.Where(x => x.NgayVanBan >= search.NgayVanBanFrom);
				}
				if(search.NgayVanBanTo.HasValue)
				{
					query = query.Where(x => x.NgayVanBan <= search.NgayVanBanTo);
				}
				if(!string.IsNullOrEmpty(search.TrichYeu))
				{
					query = query.Where(x => EF.Functions.Like(x.TrichYeu, $"%{search.TrichYeu}%"));
				}
				if(!string.IsNullOrEmpty(search.TrangThai))
				{
					query = query.Where(x => EF.Functions.Like(x.TrangThai, $"%{search.TrangThai}%"));
				}
				if(search.NgayHoanThanhFrom.HasValue)
				{
					query = query.Where(x => x.NgayHoanThanh >= search.NgayHoanThanhFrom);
				}
				if(search.NgayHoanThanhTo.HasValue)
				{
					query = query.Where(x => x.NgayHoanThanh <= search.NgayHoanThanhTo);
				}
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<KPI_VanBanDenDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_VanBanDenDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        
                        select new KPI_VanBanDenDto()
                        {
                            IdVanBanDongBo = q.IdVanBanDongBo,
							SoVanBan = q.SoVanBan,
							NgayVanBan = q.NgayVanBan,
							TrichYeu = q.TrichYeu,
							TrangThai = q.TrangThai,
							NgayHoanThanh = q.NgayHoanThanh,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            //IsDelete = q.IsDelete,
                            //DeleteId = q.DeleteId,
                            //DeleteTime = q.DeleteTime,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                        }).FirstOrDefaultAsync();
            
            return item;
        }

    }
}
