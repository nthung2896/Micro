using Hinet.Model.Entities;
using Hinet.Repository.KPI_VanBanDiRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_VanBanDiService.Dto;
using Hinet.Service.KPI_VanBanDiService.Request;
using Hinet.Service.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_VanBanDiService
{
    public class KPI_VanBanDiService : Service<KPI_VanBanDi>, IKPI_VanBanDiService
    {

        public KPI_VanBanDiService(
            IKPI_VanBanDiRepository kPI_VanBanDiRepository
            ) : base(kPI_VanBanDiRepository)
        {
            
        }

        public async Task<PagedList<KPI_VanBanDiDto>> GetData(KPI_VanBanDiSearch search)
        {
            var query = from q in GetQueryable()
                        
                        select new KPI_VanBanDiDto()
                        {
                            DoMat = q.DoMat,
                            DepartmentId = q.DepartmentId,
                            LoaiVanBan = q.LoaiVanBan,
                            SoHieu = q.SoHieu,
                            DoKhan = q.DoKhan,
                            TrichYeu = q.TrichYeu,
                            HanXuLy = q.HanXuLy,
                            SoBan = q.SoBan,
                            SoDi = q.SoDi,
                            SoVanBanId = q.SoVanBanId,
                            NgayBanHanh = q.NgayBanHanh,
                            IsCapSo = q.IsCapSo,
                            NgayVanBan = q.NgayVanBan,
                            NguoiSoanThao = q.NguoiSoanThao,
                            TrichYeuNormalized = q.TrichYeuNormalized,
                            TrangThai = q.TrangThai,
                            GhiChu = q.GhiChu,

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
                if(!string.IsNullOrEmpty(search.SoHieu))
				{
					query = query.Where(x => EF.Functions.Like(x.SoHieu, $"%{search.SoHieu}%"));
				}
                if(!string.IsNullOrEmpty(search.TrichYeu))
				{
					query = query.Where(x => EF.Functions.Like(x.TrichYeu, $"%{search.TrichYeu}%"));
				}
                if(!string.IsNullOrEmpty(search.LoaiVanBan))
				{
					query = query.Where(x => EF.Functions.Like(x.LoaiVanBan, $"%{search.LoaiVanBan}%"));
				}
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<KPI_VanBanDiDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_VanBanDiDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        
                        select new KPI_VanBanDiDto()
                        {
                            DoMat = q.DoMat,
                            DepartmentId = q.DepartmentId,
                            LoaiVanBan = q.LoaiVanBan,
                            SoHieu = q.SoHieu,
                            DoKhan = q.DoKhan,
                            TrichYeu = q.TrichYeu,
                            HanXuLy = q.HanXuLy,
                            SoBan = q.SoBan,
                            SoDi = q.SoDi,
                            SoVanBanId = q.SoVanBanId,
                            NgayBanHanh = q.NgayBanHanh,
                            IsCapSo = q.IsCapSo,
                            NgayVanBan = q.NgayVanBan,
                            NguoiSoanThao = q.NguoiSoanThao,
                            TrichYeuNormalized = q.TrichYeuNormalized,
                            TrangThai = q.TrangThai,
                            GhiChu = q.GhiChu,

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
