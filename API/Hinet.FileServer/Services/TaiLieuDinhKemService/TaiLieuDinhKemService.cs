using Hinet.FileServer.Model;
using Hinet.FileServer.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hinet.FileServer.Services.TaiLieuDinhKemService
{
    public class TaiLieuDinhKemService : ITaiLieuDinhKemService
    {
        private readonly HinetContext _hinetContext;

        public TaiLieuDinhKemService(HinetContext hinetContext)
        {
            this._hinetContext = hinetContext;
        }
        public async Task CreateAsync(TaiLieuDinhKem entity)
        {
            await _hinetContext.AddAsync(entity);
            await _hinetContext.SaveChangesAsync();
        }

        public async Task CreateRangeAsync(List<TaiLieuDinhKem> entities)
        {
            if (entities == null || entities.Count == 0)
                return;

            await _hinetContext.TaiLieuDinhKem.AddRangeAsync(entities);
            await _hinetContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(List<Guid> guids, Guid? userId)
        {
            var entities = await _hinetContext.TaiLieuDinhKem
                .Where(t => guids.Contains(t.Id) && !t.IsDeleted)
                .ToListAsync();
            foreach (var entity in entities)
            {
                if (entity.LoaiTaiLieu == "MAUCHUKY_NGUOIDUOCUYQUYEN_DOC")
                {
                    var oldEntity = await _hinetContext.TaiLieuDinhKem.Where(x => x.ItemId == entity.ItemId && x.LoaiTaiLieu == "MAUCHUKY_NGUOIDUOCUYQUYEN_DOC_OLD").FirstOrDefaultAsync();
                    if (oldEntity != null)
                    {
                        oldEntity.IsDeleted = true;
                        oldEntity.DeletedId = userId;
                        oldEntity.DeletedDate = DateTime.Now;
                        _hinetContext.TaiLieuDinhKem.UpdateRange(oldEntity);
                    }
                    entity.LoaiTaiLieu = "MAUCHUKY_NGUOIDUOCUYQUYEN_DOC_OLD";
                }
                else if (entity.LoaiTaiLieu == "DM_COSOSX_DOC")
                {
                    var oldEntity = await _hinetContext.TaiLieuDinhKem.Where(x => x.ItemId == entity.ItemId && x.LoaiTaiLieu == "DM_COSOSX_DOC_OLD").FirstOrDefaultAsync();
                    if (oldEntity != null)
                    {
                        oldEntity.IsDeleted = true;
                        oldEntity.DeletedId = userId;
                        oldEntity.DeletedDate = DateTime.Now;
                        _hinetContext.TaiLieuDinhKem.UpdateRange(oldEntity);
                    }
                    entity.LoaiTaiLieu = "DM_COSOSX_DOC_OLD";
                }
                else
                {
                    entity.IsDeleted = true;
                    entity.DeletedId = userId;
                    entity.DeletedDate = DateTime.Now;
                }
            }
            _hinetContext.TaiLieuDinhKem.UpdateRange(entities);
            await _hinetContext.SaveChangesAsync();
        }

        public async Task<TaiLieuDinhKem?> GetById(Guid id)
        {
            return await _hinetContext.TaiLieuDinhKem
                .Where(t => t.Id == id && !t.IsDeleted)
                .FirstOrDefaultAsync();
        }

        public async Task<List<TaiLieuDinhKem>> GetByItemId(Guid itemId)
        {
            return await _hinetContext.TaiLieuDinhKem
                .Where(t => t.ItemId == itemId && !t.IsDeleted)
                .ToListAsync();
        }
    }
}
