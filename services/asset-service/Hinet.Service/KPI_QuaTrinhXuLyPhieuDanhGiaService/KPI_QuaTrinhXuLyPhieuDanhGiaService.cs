using Hinet.Model.Entities;
using Hinet.Repository.AspNetUsersRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.KPI_QuaTrinhXuLyPhieuDanhGiaRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Constant;
using Hinet.Service.Dto;
using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService.Dto;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService
{
    public class KPI_QuaTrinhXuLyPhieuDanhGiaService : Service<KPI_QuaTrinhXuLyPhieuDanhGia>, IKPI_QuaTrinhXuLyPhieuDanhGiaService
    {
        private readonly IKPI_LyLich2CRepository _lyLich2CRepository;
        private readonly IDM_NhomDanhMucRepository _nhomDanhMucRepository;
        private readonly IDM_DuLieuDanhMucRepository _duLieuDanhMucRepository;
        private readonly IAspNetUsersRepository _aspNetUsersRepository;

        public KPI_QuaTrinhXuLyPhieuDanhGiaService(
            IKPI_QuaTrinhXuLyPhieuDanhGiaRepository kPI_QuaTrinhXuLyPhieuDanhGiaRepository,
            IKPI_LyLich2CRepository lyLich2CRepository,
            IDM_NhomDanhMucRepository nhomDanhMucRepository,
            IDM_DuLieuDanhMucRepository duLieuDanhMucRepository,
            IAspNetUsersRepository aspNetUsersRepository) : base(kPI_QuaTrinhXuLyPhieuDanhGiaRepository)
        {
            _lyLich2CRepository = lyLich2CRepository;
            _nhomDanhMucRepository = nhomDanhMucRepository;
            _duLieuDanhMucRepository = duLieuDanhMucRepository;
            _aspNetUsersRepository = aspNetUsersRepository;
        }

        public async Task<PagedList<KPI_QuaTrinhXuLyPhieuDanhGiaDto>> GetData(KPI_QuaTrinhXuLyPhieuDanhGiaSearch search)
        {

            var idNhomDm = await _nhomDanhMucRepository
                .GetQueryable()
                .Where(x => x.GroupCode == DanhMucConstantBase.CHUCVUVNU)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

            var query = from q in GetQueryable()
                        join llg in _lyLich2CRepository.GetQueryable()
                        on q.IdNguoiGui equals llg.UserId into guiJoin
                        from llgInfo in guiJoin.DefaultIfEmpty()
                        join chucVuGuiTbl in _duLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == idNhomDm)
                        on llgInfo.ChucVuHienTai equals chucVuGuiTbl.Code into chucVuGuiJoin
                        from chucVuGuiInfo in chucVuGuiJoin.DefaultIfEmpty()

                        join llxl in _lyLich2CRepository.GetQueryable()
                        on q.IdNguoiXuLy equals llxl.UserId into xlJoin
                        from llxlInfo in xlJoin.DefaultIfEmpty()

                        join chucVuXuLyTbl in _duLieuDanhMucRepository.GetQueryable().Where(x => x.GroupId == idNhomDm)
                        on llxlInfo.ChucVuHienTai equals chucVuXuLyTbl.Code into chucVuJoin
                        from chucVuXlInfo in chucVuJoin.DefaultIfEmpty()

                        join userGui in _aspNetUsersRepository.GetQueryable() on q.IdNguoiGui equals userGui.Id into userGuiJoin
                        from userGuiInfo in userGuiJoin.DefaultIfEmpty()

                        join userXl in _aspNetUsersRepository.GetQueryable() on q.IdNguoiXuLy equals userXl.Id into userXlJoin
                        from userXlInfo in userXlJoin.DefaultIfEmpty()

                        select new KPI_QuaTrinhXuLyPhieuDanhGiaDto()
                        {
                            IdPhieuDanhGia = q.IdPhieuDanhGia,
                            IsXuLy = q.IsXuLy,
                            IdNguoiXuLy = q.IdNguoiXuLy,
                            IdNguoiGui = q.IdNguoiGui,
                            TrangThai = q.TrangThai,
                            GhiChu = q.GhiChu,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                            TenNguoiGui = llgInfo != null ? llgInfo.HoTen : q.CreatedBy,
                            ChucVuNguoiGui = chucVuGuiInfo != null ? chucVuGuiInfo.Name : null,
                            NguoiGuiUserName = userGuiInfo != null ? userGuiInfo.UserName : null,
                            TenNguoiXuLy = llxlInfo != null ? llxlInfo.HoTen : (q.IsXuLy && q.TrangThai == TrangThaiPhieuConstant.DaDuyet ? "Đã duyệt" : ""),
                            ChucVuNguoiXuLy = chucVuXlInfo != null ? chucVuXlInfo.Name : null,
                            NguoiXuLyUserName = userXlInfo != null ? userXlInfo.UserName : null,
                            ThoiGianThaoTac = q.CreatedDate
                        };
            if (search != null)
            {
                if (search.IdPhieuDanhGia.HasValue)
                {
                    query = query.Where(x => x.IdPhieuDanhGia == search.IdPhieuDanhGia);
                }
                if (search.IsXuLy.HasValue)
                {
                    query = query.Where(x => x.IsXuLy == search.IsXuLy);
                }
                if (search.IdNguoiXuLy.HasValue)
                {
                    query = query.Where(x => x.IdNguoiXuLy == search.IdNguoiXuLy);
                }
                if (search.IdNguoiGui.HasValue)
                {
                    query = query.Where(x => x.IdNguoiGui == search.IdNguoiGui);
                }
                if (!string.IsNullOrEmpty(search.TrangThai))
                {
                    query = query.Where(x => EF.Functions.Like(x.TrangThai, $"%{search.TrangThai}%"));
                }
                if (!string.IsNullOrEmpty(search.GhiChu))
                {
                    query = query.Where(x => EF.Functions.Like(x.GhiChu, $"%{search.GhiChu}%"));
                }
            }

            if (search != null && search.IdPhieuDanhGia.HasValue)
            {
                query = query.OrderBy(x => x.CreatedDate);
            }
            else
            {
                query = query.OrderByDescending(x => x.CreatedDate);
            }
            var result = await PagedList<KPI_QuaTrinhXuLyPhieuDanhGiaDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_QuaTrinhXuLyPhieuDanhGiaDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)
                              join llg in _lyLich2CRepository.GetQueryable() on q.IdNguoiGui equals llg.UserId into guiJoin
                              from llgInfo in guiJoin.DefaultIfEmpty()
                              join llxl in _lyLich2CRepository.GetQueryable() on q.IdNguoiXuLy equals llxl.UserId into xlJoin
                              from llxlInfo in xlJoin.DefaultIfEmpty()
                              join userGui in _aspNetUsersRepository.GetQueryable() on q.IdNguoiGui equals userGui.Id into userGuiJoin
                              from userGuiInfo in userGuiJoin.DefaultIfEmpty()
                              join userXl in _aspNetUsersRepository.GetQueryable() on q.IdNguoiXuLy equals userXl.Id into userXlJoin
                              from userXlInfo in userXlJoin.DefaultIfEmpty()
                              select new KPI_QuaTrinhXuLyPhieuDanhGiaDto()
                              {
                                  IdPhieuDanhGia = q.IdPhieuDanhGia,
                                  IsXuLy = q.IsXuLy,
                                  IdNguoiXuLy = q.IdNguoiXuLy,
                                  IdNguoiGui = q.IdNguoiGui,
                                  TrangThai = q.TrangThai,
                                  GhiChu = q.GhiChu,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  IsDeleted = q.IsDeleted,
                                  DeletedId = q.DeletedId,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  Id = q.Id,
                                  TenNguoiGui = llgInfo != null ? llgInfo.HoTen : q.CreatedBy,
                                  ChucVuNguoiGui = llgInfo != null ? llgInfo.ChucVuHienTai : null,
                                  NguoiGuiUserName = userGuiInfo != null ? userGuiInfo.UserName : null,
                                  TenNguoiXuLy = llxlInfo != null ? llxlInfo.HoTen : (q.IsXuLy && q.TrangThai == TrangThaiPhieuConstant.DaDuyet ? "Đã duyệt" : ""),
                                  ChucVuNguoiXuLy = llxlInfo != null ? llxlInfo.ChucVuHienTai : null,
                                  NguoiXuLyUserName = userXlInfo != null ? userXlInfo.UserName : null,
                                  ThoiGianThaoTac = q.CreatedDate
                              }).FirstOrDefaultAsync();

            return item;
        }

    }
}
