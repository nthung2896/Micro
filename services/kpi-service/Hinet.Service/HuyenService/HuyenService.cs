using Hinet.Model.Entities;
using Hinet.Repository.HuyenRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.HuyenService.Dto;
using Hinet.Service.HuyenService.Request;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using Hinet.Domain.Entites;
using Hinet.Repository.TinhRepository;

namespace Hinet.Service.HuyenService
{
    public class HuyenService : Service<Huyen>, IHuyenService
    {
        private readonly ITinhRepository _tinhRepository;
        public HuyenService(
            IHuyenRepository huyenRepository,
            ITinhRepository tinhRepository
            ) : base(huyenRepository)
        {
            _tinhRepository = tinhRepository;
        }

        public override async Task CreateAsync(Huyen entity)
        {
            var query = GetQueryable();

            if (await query.AnyAsync(t => t.Ma == entity.Ma && t.MaTinh == entity.MaTinh))
            {
                throw new Exception("Mã huyện đã tồn tại");
            }
            if (!await _tinhRepository.AnyAsync(t => t.MaTinh == entity.MaTinh))
            {
                throw new Exception("Mã tỉnh không tồn tại");
            }
            await base.CreateAsync(entity);
        }

        public override async Task CreateAsync(IEnumerable<Huyen> entities)
        {
            foreach (var entity in entities)
            {
                await CreateAsync(entity);
            }
        }

        public override async Task UpdateAsync(Huyen entity)
        {
            var query = GetQueryable();
            var exist = await query.FirstOrDefaultAsync(x =>
                        x.Id != entity.Id &&
                        x.MaTinh == entity.MaTinh &&
                        x.Ma == entity.Ma);

            if (exist != null)
                throw new Exception("Mã huyện đã tồn tại trong tỉnh này");
            await base.UpdateAsync(entity);
        }

        public override async Task UpdateAsync(IEnumerable<Huyen> entities)
        {
            foreach (var entity in entities)
                await UpdateAsync(entity);
        }

        public async Task<PagedList<HuyenDto>> GetData(HuyenSearch search)
        {
            var query = from q in GetQueryable()
                        join t in _tinhRepository.GetQueryable()
                            on q.MaTinh equals t.MaTinh
                        select new HuyenDto()
                        {
                            LoaiHuyen = q.LoaiHuyen,
                            TenHuyen = q.TenHuyen,
                            Ma = q.Ma,
                            MaTinh = q.MaTinh,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            TenTinh = t.TenTinh,
                            Id = q.Id,
                        };
            if (search != null)
            {
                if (search.LoaiHuyen.HasValue)
                {
                    query = query.Where(x => x.LoaiHuyen == search.LoaiHuyen);
                }
                if (!string.IsNullOrEmpty(search.TenHuyen))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenHuyen, $"%{search.TenHuyen}%"));
                }
                if (!string.IsNullOrEmpty(search.Ma))
                {
                    query = query.Where(x => EF.Functions.Like(x.Ma, $"%{search.Ma}%"));
                }
                if (!string.IsNullOrEmpty(search.MaTinh))
                {
                    var maTinh = int.Parse(search.MaTinh).ToString("00");

                    query = query.Where(x => x.MaTinh == maTinh);
                }

                if (!string.IsNullOrEmpty(search.TenTinh))
                {
                    query = query.Where(x => EF.Functions.Like(x.MaTinh, $"%{search.TenTinh}%"));
                }
            }
            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<HuyenDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<HuyenDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)

                              select new HuyenDto()
                              {
                                  LoaiHuyen = q.LoaiHuyen,
                                  TenHuyen = q.TenHuyen,
                                  Ma = q.Ma,
                                  MaTinh = q.MaTinh,
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
