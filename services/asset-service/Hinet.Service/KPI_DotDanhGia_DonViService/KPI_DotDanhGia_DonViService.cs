using Hinet.Model.Entities;
using Hinet.Repository.KPI_DotDanhGia_DonViRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_DotDanhGia_DonViService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using Hinet.Model;

namespace Hinet.Service.KPI_DotDanhGia_DonViService
{
    public class KPI_DotDanhGia_DonViService : Service<KPI_DotDanhGia_DonVi>, IKPI_DotDanhGia_DonViService
    {
        private readonly HinetContext _context;

        public KPI_DotDanhGia_DonViService(
            IKPI_DotDanhGia_DonViRepository kPI_DotDanhGia_DonViRepository,
            HinetContext context
            ) : base(kPI_DotDanhGia_DonViRepository)
        {
            _context = context;
        }

        public async Task<PagedList<KPI_DotDanhGia_DonViDto>> GetData(KPI_DotDanhGia_DonViSearch search)
        {
            var query = from q in _context.KPI_DotDanhGia_DonVi.Where(x => !x.IsDeleted)
                        join donviObj in _context.Department on q.IdDonVi equals donviObj.Id into donviGroup
                        from donvi in donviGroup.DefaultIfEmpty()
                        join dotObj in _context.KPI_DotTheoDoiDanhGia on q.IdDotDanhGia equals dotObj.Id into dotGroup
                        from dot in dotGroup.DefaultIfEmpty()
                        join btcDonviObj in _context.KPI_BoTieuChiDonVi.Where(x => !x.IsDeleted) on q.IdBoChiSoNhiemVu equals btcDonviObj.Id into btcDonviGroup
                        from btcDonvi in btcDonviGroup.DefaultIfEmpty()
                        join btcChungObj in _context.KPI_BoTieuChiChung.Where(x => !x.IsDeleted) on q.IdBoTieuChiChung equals btcChungObj.Id into btcChungGroup
                        from btcChung in btcChungGroup.DefaultIfEmpty()

                        select new KPI_DotDanhGia_DonViDto()
                        {
                            IdDotDanhGia = q.IdDotDanhGia,
                            IdDonVi = q.IdDonVi,
                            IdBoChiSoNhiemVu = q.IdBoChiSoNhiemVu,
                            IdBoTieuChiChung = q.IdBoTieuChiChung,
                            TenDonVi = donvi != null ? donvi.Name : null,
                            TenDotDanhGia = dot != null ? dot.TenDotTheoDoiDanhGia : null,
                            TenBoChiSoNhiemVu = btcDonvi != null ? btcDonvi.TenBoTieuChiDonVi : null,
                            TenBoTieuChiChung = btcChung != null ? btcChung.TenBoTieuChiDonVi : null,
                            SoQuyetDinhBoChiSoNhiemVu = btcDonvi != null ? btcDonvi.SoQuyetDinh : null,
                            SoQuyetDinhBoTieuChiChung = btcChung != null ? btcChung.SoQuyetDinh : null,
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
                if (!string.IsNullOrEmpty(search.IdDotDanhGia) && Guid.TryParse(search.IdDotDanhGia, out var idDotDanhGia))
                {
                    query = query.Where(x => x.IdDotDanhGia == idDotDanhGia);
                }
                if (!string.IsNullOrEmpty(search.IdDonVi) && Guid.TryParse(search.IdDonVi, out var idDonVi))
                {
                    query = query.Where(x => x.IdDonVi == idDonVi);
                }
                if (!string.IsNullOrEmpty(search.IdBoChiSoNhiemVu) && Guid.TryParse(search.IdBoChiSoNhiemVu, out var idBoChiSoNhiemVu))
                {
                    query = query.Where(x => x.IdBoChiSoNhiemVu == idBoChiSoNhiemVu);
                }
                if (!string.IsNullOrEmpty(search.IdBoTieuChiChung) && Guid.TryParse(search.IdBoTieuChiChung, out var idBoTieuChiChung))
                {
                    query = query.Where(x => x.IdBoTieuChiChung == idBoTieuChiChung);
                }
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<KPI_DotDanhGia_DonViDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_DotDanhGia_DonViDto?> GetDto(Guid id)
        {
            var item = await (from q in _context.KPI_DotDanhGia_DonVi.Where(x => x.Id == id && !x.IsDeleted)
                        join donviObj in _context.Department on q.IdDonVi equals donviObj.Id into donviGroup
                        from donvi in donviGroup.DefaultIfEmpty()
                        join dotObj in _context.KPI_DotTheoDoiDanhGia on q.IdDotDanhGia equals dotObj.Id into dotGroup
                        from dot in dotGroup.DefaultIfEmpty()
                        join btcDonviObj in _context.KPI_BoTieuChiDonVi.Where(x => !x.IsDeleted) on q.IdBoChiSoNhiemVu equals btcDonviObj.Id into btcDonviGroup
                        from btcDonvi in btcDonviGroup.DefaultIfEmpty()
                        join btcChungObj in _context.KPI_BoTieuChiChung.Where(x => !x.IsDeleted) on q.IdBoTieuChiChung equals btcChungObj.Id into btcChungGroup
                        from btcChung in btcChungGroup.DefaultIfEmpty()

                        select new KPI_DotDanhGia_DonViDto()
                        {
                            IdDotDanhGia = q.IdDotDanhGia,
                            IdDonVi = q.IdDonVi,
                            IdBoChiSoNhiemVu = q.IdBoChiSoNhiemVu,
                            IdBoTieuChiChung = q.IdBoTieuChiChung,
                            TenDonVi = donvi != null ? donvi.Name : null,
                            TenDotDanhGia = dot != null ? dot.TenDotTheoDoiDanhGia : null,
                            TenBoChiSoNhiemVu = btcDonvi != null ? btcDonvi.TenBoTieuChiDonVi : null,
                            TenBoTieuChiChung = btcChung != null ? btcChung.TenBoTieuChiDonVi : null,
                            SoQuyetDinhBoChiSoNhiemVu = btcDonvi != null ? btcDonvi.SoQuyetDinh : null,
                            SoQuyetDinhBoTieuChiChung = btcChung != null ? btcChung.SoQuyetDinh : null,
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
