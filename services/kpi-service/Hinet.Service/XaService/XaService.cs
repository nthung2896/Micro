using Hinet.Model.Entities;
using Hinet.Repository.XaRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.XaService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;



namespace Hinet.Service.XaService
{
    public class XaService : Service<Xa>, IXaService
    {

        public XaService(
            IXaRepository xaRepository
            ) : base(xaRepository)
        {
            
        }

        public async Task<PagedList<XaDto>> GetData(XaSearch search)
        {
            var query = from q in GetQueryable()
                        
                        select new XaDto()
                        {
                            IsXaMoi = q.IsXaMoi,
							MaXa = q.MaXa,
							TenXa = q.TenXa,
							MaHuyen = q.MaHuyen,
							Loai = q.Loai,
							MaTinh = q.MaTinh,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            //IsDelete = q.IsDelete,
                            //DeleteId = q.DeleteId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            //DeleteTime = q.DeleteTime,
                            Id = q.Id,
                        };
            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.MaTinh))
                {
                    var maTinhNorm = int.TryParse(search.MaTinh, out var val) ? val.ToString("00") : search.MaTinh;
                    query = query.Where(x => x.MaTinh == search.MaTinh || x.MaTinh == maTinhNorm);
                }
                if (!string.IsNullOrEmpty(search.MaHuyen))
                {
                    query = query.Where(x => x.MaHuyen == search.MaHuyen);
                }
                if (!string.IsNullOrEmpty(search.TenXa))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenXa, $"%{search.TenXa}%"));
                }
                if (!string.IsNullOrEmpty(search.MaXa))
                {
                    query = query.Where(x => EF.Functions.Like(x.MaXa, $"%{search.MaXa}%"));
                }
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<XaDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<XaDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        
                        select new XaDto()
                        {
                            IsXaMoi = q.IsXaMoi,
							MaXa = q.MaXa,
							TenXa = q.TenXa,
							MaHuyen = q.MaHuyen,
							Loai = q.Loai,
							MaTinh = q.MaTinh,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            //IsDelete = q.IsDelete,
                            //DeleteId = q.DeleteId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            //DeleteTime = q.DeleteTime,
                            Id = q.Id,
                        }).FirstOrDefaultAsync();
            
            return item;
        }

    }
}
