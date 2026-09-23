using Hinet.FileServer.Model.Entities;

namespace Hinet.FileServer.Services.TaiLieuDinhKemService
{
    public interface ITaiLieuDinhKemService
    {
        Task CreateAsync(TaiLieuDinhKem entity);
        Task CreateRangeAsync(List<TaiLieuDinhKem> entities);
        Task DeleteAsync(List<Guid> guids, Guid? userId);
        Task<TaiLieuDinhKem?> GetById(Guid id);
        Task<List<TaiLieuDinhKem>> GetByItemId(Guid itemId);
    }
}
