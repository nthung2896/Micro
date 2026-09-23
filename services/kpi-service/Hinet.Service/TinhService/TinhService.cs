using Hinet.Model.Entities;
using Hinet.Repository.TinhRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.TinhService.Dto;
using Hinet.Service.TinhService.Request;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using VKS.Domain.Entites;

namespace Hinet.Service.TinhService
{
    public class TinhService : Service<Tinh>, ITinhService
    {

        public TinhService(
            ITinhRepository tinhRepository
            ) : base(tinhRepository)
        {

        }

        public override async Task CreateAsync(Tinh entity)
        {
            var query = GetQueryable();

            if (await query.AnyAsync(t => t.MaTinh == entity.MaTinh))
            {
                throw new Exception("Mã tỉnh đã tồn tại");
            }

            await base.CreateAsync(entity);
        }

        public override async Task CreateAsync(IEnumerable<Tinh> entities)
        {
            foreach (var entity in entities)
            {
                await CreateAsync(entity);
            }
        }

        public override async Task UpdateAsync(Tinh entity)
        {
            var query = GetQueryable();
            var exist = await query.FirstOrDefaultAsync(t =>
                                t.Id != entity.Id
                                && t.MaTinh == entity.MaTinh);

            if (exist != null)
            {
                if (exist.MaTinh == entity.MaTinh)
                    throw new Exception("Mã tỉnh đã tồn tại");
            }
            await base.UpdateAsync(entity);
        }

        public override async Task UpdateAsync(IEnumerable<Tinh> entities)
        {
            foreach (var entity in entities)
                await UpdateAsync(entity);
        }

        public async Task<PagedList<TinhDto>> GetData(TinhSearch search)
        {
            var query = from q in GetQueryable()

                        select new TinhDto()
                        {
                            STT = q.STT,
                            MaTinh = q.MaTinh,
                            TenTinh = q.TenTinh,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        };
            if (search != null)
            {

                if (search.STT.HasValue)
                {
                    query = query.Where(x => x.STT == search.STT);
                }

                if (!string.IsNullOrEmpty(search.MaTinh))
                {
                    var maTinh = int.Parse(search.MaTinh).ToString("00");
                    query = query.Where(x => x.MaTinh == search.MaTinh);
                }
                if (!string.IsNullOrEmpty(search.TenTinh))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenTinh, $"%{search.TenTinh}%"));
                }
            }
            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<TinhDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<TinhDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)

                              select new TinhDto()
                              {
                                  STT = q.STT,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  IsDeleted = q.IsDeleted,
                                  DeletedId = q.DeletedId,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  DeletedDate = q.DeletedDate,
                                  TenTinh = q.TenTinh,
                                  MaTinh = q.MaTinh,
                                  Id = q.Id,
                              }).FirstOrDefaultAsync();

            return item;
        }

    }
}
