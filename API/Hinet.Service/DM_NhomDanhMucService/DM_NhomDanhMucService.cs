using Hinet.Model.Entities;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.DM_NhomDanhMucService.Dto;
using Hinet.Service.Common;
using Microsoft.EntityFrameworkCore;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Service.DM_DuLieuDanhMucService.Dto;
using Hinet.Service.DM_NhomDanhMucService.Request;

namespace Hinet.Service.DM_NhomDanhMucService
{
    public class DM_NhomDanhMucService : Service<DM_NhomDanhMuc>, IDM_NhomDanhMucService
    {
        private readonly IDM_DuLieuDanhMucRepository _dM_DuLieuDanhMucRepository;

        public DM_NhomDanhMucService(
            IDM_NhomDanhMucRepository dM_NhomDanhMucRepository,
            IDM_DuLieuDanhMucRepository dM_DuLieuDanhMucRepository) : base(dM_NhomDanhMucRepository)
        {
            _dM_DuLieuDanhMucRepository = dM_DuLieuDanhMucRepository;
        }

        public async Task<PagedList<DM_NhomDanhMucDto>> GetData(DM_NhomDanhMucSearch search)
        {
            try
            {
                var query = from q in GetQueryable()
                            select new DM_NhomDanhMucDto
                            {
                                CreatedId = q.CreatedId,
                                UpdatedId = q.UpdatedId,
                                GroupName = q.GroupName,
                                GroupCode = q.GroupCode,
                                CreatedBy = q.CreatedBy,
                                UpdatedBy = q.UpdatedBy,
                                DeletedId = q.DeletedId,
                                CreatedDate = q.CreatedDate,
                                UpdatedDate = q.UpdatedDate,
                                DeletedDate = q.DeletedDate,
                                IsDeleted = q.IsDeleted,
                                Id = q.Id,
                            };

                if (search != null)
                {
                    if (!string.IsNullOrEmpty(search.GroupName))
                        query = query.Where(x => x.GroupName.ToLower().Contains(search.GroupName.Trim().ToLower()));

                    if (!string.IsNullOrEmpty(search.GroupCode))
                        query = query.Where(x => x.GroupCode.ToLower().Contains(search.GroupCode.Trim().ToLower()));
                }

                query = query.OrderByDescending(x => x.CreatedDate);
                return await PagedList<DM_NhomDanhMucDto>.CreateAsync(query, search);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve data: " + ex.Message);
            }
        }

        public async Task<DM_NhomDanhMucDto> GetDto(Guid id)
        {
            try
            {
                var item = await (from q in GetQueryable().Where(x => x.Id == id)
                                  select new DM_NhomDanhMucDto
                                  {
                                      CreatedId = q.CreatedId,
                                      UpdatedId = q.UpdatedId,
                                      GroupName = q.GroupName,
                                      GroupCode = q.GroupCode,
                                      CreatedBy = q.CreatedBy,
                                      UpdatedBy = q.UpdatedBy,
                                      DeletedId = q.DeletedId,
                                      CreatedDate = q.CreatedDate,
                                      UpdatedDate = q.UpdatedDate,
                                      DeletedDate = q.DeletedDate,
                                      IsDeleted = q.IsDeleted,
                                      Id = q.Id,
                                  }).FirstOrDefaultAsync();

                return item ?? throw new Exception("Data not found for ID: " + id);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve DTO: " + ex.Message);
            }
        }

        public async Task<List<DanhMucDto>> GetListDanhMuc()
        {
            try
            {
                var listDmDanhMuc = await _dM_DuLieuDanhMucRepository
                    .GetQueryable()
                    .AsNoTracking()
                    .Select(dm => new { dm.Id, dm.GroupId, dm.Name, dm.Code, dm.Priority })
                    .ToListAsync();

                var query = await GetQueryable()
                    .AsNoTracking()
                    .ToListAsync();

                return query.Select(q => new DanhMucDto
                {
                    GroupName = q.GroupName,
                    GroupCode = q.GroupCode,
                    Id = q.Id,
                    ListDuLieuDanhMuc = listDmDanhMuc
                        .Where(dm => dm.GroupId == q.Id)
                        .Select(dm => new DuLieuDanhMucDto
                        {
                            Id = dm.Id,
                            Name = dm.Name,
                            Code = dm.Code,
                            Priority = dm.Priority
                        })
                        .ToList()
                }).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve list of danh muc: " + ex.Message);
            }
        }
    }
}