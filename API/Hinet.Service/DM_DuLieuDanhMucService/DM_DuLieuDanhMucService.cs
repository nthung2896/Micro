using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Hinet.Extensions;
using Hinet.Model.Entities;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Constant;
using Hinet.Service.DM_DuLieuDanhMucService.Dto;
using Hinet.Service.DM_DuLieuDanhMucService.Request;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Hinet.Service.DM_DuLieuDanhMucService
{
    public class DM_DuLieuDanhMucService : Service<DM_DuLieuDanhMuc>, IDM_DuLieuDanhMucService
    {
        private readonly IDM_NhomDanhMucRepository _dM_NhomDanhMucRepository;
        private readonly IDepartmentRepository _departmentRepository;

        private readonly IDM_DuLieuDanhMucRepository _dM_DuLieuDanhMuc;


        public DM_DuLieuDanhMucService(
            IDM_NhomDanhMucRepository dM_NhomDanhMucRepository,
            IDepartmentRepository departmentRepository,
            IDM_DuLieuDanhMucRepository dM_DuLieuDanhMucRepository,
            IDM_DuLieuDanhMucRepository dM_DuLieuDanhMuc) : base(dM_DuLieuDanhMucRepository)
        {
            this._dM_NhomDanhMucRepository = dM_NhomDanhMucRepository;
            this._departmentRepository = departmentRepository;
            _dM_DuLieuDanhMuc = dM_DuLieuDanhMuc;
        }


        public async Task<Hinet.Service.Dto.FileSetting> GetObjectSettting()
        {
            var query = await (from dmtbl in _dM_NhomDanhMucRepository.GetQueryable()
                               where dmtbl.GroupCode == FileSettingConstant.FileSetting

                               join dltbl in _dM_DuLieuDanhMuc.GetQueryable() on dmtbl.Id equals dltbl.Id

                               select new
                               {
                                   code = dltbl.Code,
                                   value = dltbl.Note
                               }).ToListAsync();


            var cfgSetting = new Hinet.Service.Dto.FileSetting { };


            cfgSetting.MaxSize = query.FirstOrDefault(t => t.code == FileSettingConstant.MaxSize)?.value != null
                ? (int.TryParse(query.FirstOrDefault(t => t.code == FileSettingConstant.MaxSize)?.value, out int vl) ? vl : AppSettings.FileSetting.MaxSize) : AppSettings.FileSetting.MaxSize;

            cfgSetting.AllowExtensions = query.FirstOrDefault(t => t.code == FileSettingConstant.AllowExtensions) != null ?
                query.FirstOrDefault(t => t.code == FileSettingConstant.AllowExtensions).value : string.Join(",", AppSettings.FileSetting.AllowExtensions);

            return cfgSetting;


        }


        public async Task<List<DM_DuLieuDanhMucDto>> GetByGroupCode(string groupCode)
        {
            var query = await (from dltbl in _dM_NhomDanhMucRepository.GetQueryable().Where(x => x.GroupCode == groupCode)

                               join dmdl in _dM_DuLieuDanhMuc.GetQueryable() on dltbl.Id equals dmdl.GroupId

                               select new DM_DuLieuDanhMucDto
                               {
                                   Priority = dmdl.Priority,
                                   Name = dmdl.Name,
                                   Code = dmdl.Code,
                               }).ToListAsync();
            return query;
        }


        public async Task<PagedList<DM_DuLieuDanhMucDto>> GetData(DM_DuLieuDanhMucSearch search)
        {
            try
            {
                var query = from q in GetQueryable()
                            join donvi in _departmentRepository.GetQueryable()
                            on q.DonViId equals donvi.Id into jDonVi
                            from dv in jDonVi.DefaultIfEmpty()
                            select new DM_DuLieuDanhMucDto
                            {
                                CreatedId = q.CreatedId,
                                UpdatedId = q.UpdatedId,
                                GroupId = q.GroupId,
                                Name = q.Name,
                                Code = q.Code,
                                Note = q.Note,
                                Priority = q.Priority,
                                DonViId = q.DonViId,
                                DuongDanFile = q.DuongDanFile,
                                NoiDung = q.NoiDung,
                                IsDeleted = q.IsDeleted,
                                Id = q.Id,
                                CreatedBy = q.CreatedBy,
                                UpdatedBy = q.UpdatedBy,
                                DeletedId = q.DeletedId,
                                CreatedDate = q.CreatedDate,
                                UpdatedDate = q.UpdatedDate,
                                DeletedDate = q.DeletedDate,
                                TenDonVi = dv.Name
                            };

                if (search != null)
                {
                    if (!string.IsNullOrEmpty(search.GroupId) && Guid.TryParse(search.GroupId, out var groupIdValue))
                        query = query.Where(x => x.GroupId == groupIdValue);

                    if (!string.IsNullOrEmpty(search.Name))
                        query = query.Where(x => x.Name.ToLower().Contains(search.Name.Trim().ToLower()));

                    if (!string.IsNullOrEmpty(search.Code))
                        query = query.Where(x => x.Code.ToLower().Contains(search.Code.Trim().ToLower()));
                }

                query = query.OrderBy(x => x.Priority);
                return await PagedList<DM_DuLieuDanhMucDto>.CreateAsync(query, search);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve data: " + ex.Message);
            }
        }

        public async Task<DM_DuLieuDanhMucDto> GetDto(Guid id)
        {
            try
            {
                var item = await (from q in GetQueryable().Where(x => x.Id == id)
                                  select new DM_DuLieuDanhMucDto
                                  {
                                      CreatedId = q.CreatedId,
                                      UpdatedId = q.UpdatedId,
                                      GroupId = q.GroupId,
                                      Name = q.Name,
                                      Code = q.Code,
                                      Note = q.Note,
                                      Priority = q.Priority,
                                      DonViId = q.DonViId,
                                      DuongDanFile = q.DuongDanFile,
                                      NoiDung = q.NoiDung,
                                      IsDeleted = q.IsDeleted,
                                      Id = q.Id,
                                      CreatedBy = q.CreatedBy,
                                      UpdatedBy = q.UpdatedBy,
                                      DeletedId = q.DeletedId,
                                      CreatedDate = q.CreatedDate,
                                      UpdatedDate = q.UpdatedDate,
                                      DeletedDate = q.DeletedDate,
                                  }).FirstOrDefaultAsync();

                return item ?? throw new Exception("Data not found for ID: " + id);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve DTO: " + ex.Message);
            }
        }

        public async Task<List<DropdownOption>> GetDropdownByGroupCode(string groupCode)
        {
            return await (from dulieu in GetQueryable()
                          join nhom in _dM_NhomDanhMucRepository.GetQueryable()
                          on dulieu.GroupId equals nhom.Id
                          where nhom.GroupCode == groupCode
                          select new DropdownOption
                          {
                              Value = dulieu.Id.ToString().ToLower(),
                              Label = dulieu.Name,

                          }).ToListAsync();
        }

        public async Task<List<DropdownOption>> GetDropdownCodeByGroupCode(string groupCode)
        {
            return await (from dulieu in GetQueryable()
                          join nhom in _dM_NhomDanhMucRepository.GetQueryable()
                          on dulieu.GroupId equals nhom.Id
                          where nhom.GroupCode == groupCode
                          orderby dulieu.Priority, dulieu.Name
                          select new DropdownOption
                          {
                              Value = dulieu.Code,
                              Label = dulieu.Name
                          }).ToListAsync();
        }
        public async Task<List<DM_DuLieuDanhMucDto>> GetListDataByGroupCode(string groupCode)
        {
            try
            {
                var query = from q in GetQueryable()
                            join nhom in _dM_NhomDanhMucRepository.GetQueryable()
                            on q.GroupId equals nhom.Id
                            where nhom.GroupCode == groupCode
                            select new DM_DuLieuDanhMucDto
                            {
                                GroupId = q.GroupId,
                                Name = q.Name,
                                Code = q.Code,
                                Note = q.Note,
                                Priority = q.Priority,
                                DonViId = q.DonViId,
                                DuongDanFile = q.DuongDanFile,
                                NoiDung = q.NoiDung,
                                Id = q.Id,
                            };
                var data = await query.OrderBy(x => x.Priority).ToListAsync();
                return new List<DM_DuLieuDanhMucDto>(data);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve data: " + ex.Message);
            }
        }

        public async Task<List<ChucVuThuTuDto>> GetChucVuThuTu()
        {
            return await (from dulieu in GetQueryable()
                          join nhom in _dM_NhomDanhMucRepository.GetQueryable()
                          on dulieu.GroupId equals nhom.Id
                          where nhom.GroupCode == DanhMucConstantBase.CHUCVUVNU
                          orderby dulieu.Priority ?? int.MaxValue, dulieu.Code
                          select new ChucVuThuTuDto
                          {
                              ThuTu = dulieu.Priority,
                              MaChucVu = dulieu.Code
                          }).ToListAsync();
        }

        public List<DropdownOption> ListColumnName(string TableName)
        {
            var assembly = Assembly.GetExecutingAssembly();
            var type = assembly.GetTypes().FirstOrDefault(t => t.Name == TableName);

            if (type == null)
                return new List<DropdownOption>();
            var listColumn = GetAllPropsName(type).ToList();

            return listColumn.Select(x => new DropdownOption
            {
                Value = x,
                Label = x
            }).ToList();
        }

        private IEnumerable<string> GetAllPropsName(Type type)
        {
            var props = type.GetProperties();
            foreach (var prop in props)
            {
                if (prop.PropertyType.GetInterface("IEntity`1") != null)
                {
                    var propsChild = GetAllPropsName(prop.PropertyType);
                    foreach (var propChild in propsChild)
                    {
                        yield return prop.Name + "." + propChild;
                    }
                }
                yield return prop.Name;
            }
        }
        public async Task<PagedList<DropdownOption>> GetDataSelectLazyByGroupCode(SelectDM_DuLieuLazyRequest searchModel)
        {
            var group = await _dM_NhomDanhMucRepository.GetQueryable().FirstOrDefaultAsync(x => x.GroupCode == searchModel.GroupCode);
            if (group == null)
            {
                return new PagedList<DropdownOption>(new List<DropdownOption>(), 1, 0, 0);
            }
            var query = GetQueryable().Where(x => x.GroupId == group.Id);
            if (!string.IsNullOrEmpty(searchModel.FilterName))
            {
                query = query.Where(x => x.Name.Contains(searchModel.FilterName));
            }
            var countTotal = await query.CountAsync();
            var data = await query
                .OrderBy(x => x.Name)
                .Skip((searchModel.pageIndex - 1) * searchModel.pageSize)
                .Take(searchModel.pageSize)
                .Select(x => new DropdownOption
                {
                    Value = x.Code.ToString(),
                    Label = x.Name
                })
                .ToListAsync();
            DropdownOption selectedItem = null;

            if (!string.IsNullOrEmpty(searchModel.Selected) && searchModel.pageIndex == 1)
            {
                selectedItem = await query.Where(x => x.Code == searchModel.Selected)
                    .Select(x => new DropdownOption
                    {
                        Value = x.Code,
                        Label = x.Name,
                    })
                    .FirstOrDefaultAsync();

                if (selectedItem != null && !data.Any(i => i.Value == selectedItem.Value))
                {
                    if (data.Count > 20)
                    {
                        data.RemoveAt(20);
                    }
                }
            }
            return new PagedList<DropdownOption>(
                data,
                searchModel.pageIndex,
                searchModel.pageSize,
                countTotal
            );
        }

    }
}
