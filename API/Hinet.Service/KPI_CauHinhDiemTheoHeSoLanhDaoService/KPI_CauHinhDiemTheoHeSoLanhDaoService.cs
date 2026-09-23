//using AutoMapper;
using Hinet.Model.Entities;
using Hinet.Repository.KPI_CauHinhDiemTheoHeSoLanhDaoRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.Common;
using Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService.Dto;
//using log4net;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hinet.Model;

namespace Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService
{
    public class KPI_CauHinhDiemTheoHeSoLanhDaoService : Service<KPI_CauHinhDiemTheoHeSoLanhDao>, IKPI_CauHinhDiemTheoHeSoLanhDaoService
    {
        private readonly IKPI_CauHinhDiemTheoHeSoLanhDaoRepository _kPI_CauHinhDiemTheoHeSoLanhDaoRepository;
        private readonly HinetContext _context;

        public KPI_CauHinhDiemTheoHeSoLanhDaoService(
            IKPI_CauHinhDiemTheoHeSoLanhDaoRepository kPI_CauHinhDiemTheoHeSoLanhDaoRepository,
            HinetContext context
            ) : base(kPI_CauHinhDiemTheoHeSoLanhDaoRepository)
        {
            _kPI_CauHinhDiemTheoHeSoLanhDaoRepository = kPI_CauHinhDiemTheoHeSoLanhDaoRepository;
            _context = context;
        }

        public async Task<PagedList<KPI_CauHinhDiemTheoHeSoLanhDaoDto>> GetData(KPI_CauHinhDiemTheoHeSoLanhDaoSearch search)
        {
            var query = from q in _context.KPI_CauHinhDiemTheoHeSoLanhDao.Where(x => x.IsDeleted != true)
                        join btc in _context.KPI_BoTieuChiChung on q.IdBoTieuChi equals btc.Id into btcGroup
                        from b in btcGroup.DefaultIfEmpty()
                        join btdv in _context.KPI_BoTieuChiDonVi on q.IdBoTieuChi equals btdv.Id into btdvGroup
                        from bv in btdvGroup.DefaultIfEmpty()
                        select new KPI_CauHinhDiemTheoHeSoLanhDaoDto
                        {
                            Id = q.Id,
                            ChucVu = q.ChucVu,
                            HeSo = q.HeSo,
                            IdBoTieuChi = q.IdBoTieuChi,
                            TenBoTieuChi = b != null ? b.TenBoTieuChiDonVi : (bv != null ? bv.TenBoTieuChiDonVi : null),
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            CreatedId = q.CreatedId,
                            UpdatedId = q.UpdatedId
                        };

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.ChucVu))
                {
                    query = query.Where(x => x.ChucVu != null && x.ChucVu.ToLower().Contains(search.ChucVu.Trim().ToLower()));
                }
                if (search.HeSo.HasValue)
                {
                    query = query.Where(x => x.HeSo == search.HeSo);
                }
                if (search.IdBoTieuChi.HasValue)
                {
                    query = query.Where(x => x.IdBoTieuChi == search.IdBoTieuChi);
                }
            }
            
            query = query.OrderByDescending(x => x.CreatedDate);
            return await PagedList<KPI_CauHinhDiemTheoHeSoLanhDaoDto>.CreateAsync(query, search ?? new KPI_CauHinhDiemTheoHeSoLanhDaoSearch());
        }

        public async Task<KPI_CauHinhDiemTheoHeSoLanhDaoDto> GetDto(Guid id)
        {
            var data = await (from q in _context.KPI_CauHinhDiemTheoHeSoLanhDao.Where(x => x.IsDeleted != true)
                              join btc in _context.KPI_BoTieuChiChung on q.IdBoTieuChi equals btc.Id into btcGroup
                              from b in btcGroup.DefaultIfEmpty()
                              join btdv in _context.KPI_BoTieuChiDonVi on q.IdBoTieuChi equals btdv.Id into btdvGroup
                              from bv in btdvGroup.DefaultIfEmpty()
                              where q.Id == id
                              select new KPI_CauHinhDiemTheoHeSoLanhDaoDto
                              {
                                  Id = q.Id,
                                  ChucVu = q.ChucVu,
                                  HeSo = q.HeSo,
                                  IdBoTieuChi = q.IdBoTieuChi,
                                  TenBoTieuChi = b != null ? b.TenBoTieuChiDonVi : (bv != null ? bv.TenBoTieuChiDonVi : null),
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  CreatedId = q.CreatedId,
                                  UpdatedId = q.UpdatedId
                              }).FirstOrDefaultAsync();
            return data ?? new KPI_CauHinhDiemTheoHeSoLanhDaoDto();
        }
    }
}
