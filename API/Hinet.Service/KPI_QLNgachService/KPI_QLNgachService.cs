using Hinet.Model.Entities;
using Hinet.Repository.KPI_QLNgachRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_QLNgachService.Dto;
using Hinet.Service.KPI_QLNgachService.Request;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Service.KPI_QLNgachService
{
    public class KPI_QLNgachService : Service<KPI_QLNgach>, IKPI_QLNgachService
    {
        public KPI_QLNgachService(
            IKPI_QLNgachRepository repository
            ) : base(repository)
        {
        }

        public async Task<PagedList<KPI_QLNgachDto>> GetData(KPI_QLNgachSearch search)
        {
            var query = from q in GetQueryable()
                        select new KPI_QLNgachDto()
                        {
                            OldNhomNgach = q.OldNhomNgach,
                            MaNgach = q.MaNgach,
                            TenNgach = q.TenNgach,
                            NhomVienChuc = q.NhomVienChuc,
                            NhomNgach = q.NhomNgach,
                            ThoiGianNangLuong = q.ThoiGianNangLuong,
                            ThongTinMoTa = q.ThongTinMoTa,
                            IsActive = q.IsActive,
                            SoThuTu = q.SoThuTu,
                            IsNganhYTe = q.IsNganhYTe,
                            NgayApDung = q.NgayApDung,
                            NgayHetHan = q.NgayHetHan,
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
                if(!string.IsNullOrEmpty(search.TenNgach))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenNgach, "%$((search.TenNgach))%"));
                }
                if(!string.IsNullOrEmpty(search.MaNgach))
                {
                    query = query.Where(x => EF.Functions.Like(x.MaNgach, "%$((search.MaNgach))%"));
                }
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<KPI_QLNgachDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_QLNgachDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        select new KPI_QLNgachDto()
                        {
                            OldNhomNgach = q.OldNhomNgach,
                            MaNgach = q.MaNgach,
                            TenNgach = q.TenNgach,
                            NhomVienChuc = q.NhomVienChuc,
                            NhomNgach = q.NhomNgach,
                            ThoiGianNangLuong = q.ThoiGianNangLuong,
                            ThongTinMoTa = q.ThongTinMoTa,
                            IsActive = q.IsActive,
                            SoThuTu = q.SoThuTu,
                            IsNganhYTe = q.IsNganhYTe,
                            NgayApDung = q.NgayApDung,
                            NgayHetHan = q.NgayHetHan,
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
