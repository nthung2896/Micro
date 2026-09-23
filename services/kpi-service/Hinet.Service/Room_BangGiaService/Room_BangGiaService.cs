using Hinet.Model.Entities;
using Hinet.Repository.Room_BangGiaRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.Room_BangGiaService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Service.Room_BangGiaService
{
    public class Room_BangGiaService : Service<Room_BangGia>, IRoom_BangGiaService
    {
        public Room_BangGiaService(
            IRoom_BangGiaRepository room_BangGiaRepository
            ) : base(room_BangGiaRepository)
        {
        }

        public async Task<PagedList<Room_BangGiaDto>> GetData(Room_BangGiaSearch search)
        {
            var query = from q in GetQueryable()
                        select new Room_BangGiaDto()
                        {
                            IsTuDongDuyet = q.IsTuDongDuyet,
                            IsDuyTriThem10Ngay = q.IsDuyTriThem10Ngay,
                            IsHienThiNutGoi = q.IsHienThiNutGoi,
                            GiaTin = q.GiaTin,
                            ThuocTinh = q.ThuocTinh,
                            LoaiTin = q.LoaiTin,
                            MaMau = q.MaMau,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                        };
            if (search != null)
            {
                if (search.IsHienThiNutGoi.HasValue)
                {
                    query = query.Where(x => x.IsHienThiNutGoi == search.IsHienThiNutGoi);
                }
                if (search.IsTuDongDuyet.HasValue)
                {
                    query = query.Where(x => x.IsTuDongDuyet == search.IsTuDongDuyet);
                }
                if (search.IsDuyTriThem10Ngay.HasValue)
                {
                    query = query.Where(x => x.IsDuyTriThem10Ngay == search.IsDuyTriThem10Ngay);
                }
                if (!string.IsNullOrEmpty(search.ThuocTinh))
                {
                    query = query.Where(x => EF.Functions.Like(x.ThuocTinh, $"%{search.ThuocTinh}%"));
                }
                if (!string.IsNullOrEmpty(search.LoaiTin))
                {
                    query = query.Where(x => EF.Functions.Like(x.LoaiTin, $"%{search.LoaiTin}%"));
                }
            }
            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<Room_BangGiaDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<Room_BangGiaDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)
                              select new Room_BangGiaDto()
                              {
                                  IsTuDongDuyet = q.IsTuDongDuyet,
                                  IsDuyTriThem10Ngay = q.IsDuyTriThem10Ngay,
                                  IsHienThiNutGoi = q.IsHienThiNutGoi,
                                  GiaTin = q.GiaTin,
                                  ThuocTinh = q.ThuocTinh,
                                  LoaiTin = q.LoaiTin,
                                  MaMau = q.MaMau,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  Id = q.Id,
                              }).FirstOrDefaultAsync();
            return item;
        }
    }
}
