using CommonHelper.String;
using Hinet.Model.Entities;
using Hinet.Repository.AppUserRepository;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.RoleRepository;
using Hinet.Repository.UserRoleRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Constant;
using Hinet.Service.DepartmentService.Dto;
using Hinet.Service.DepartmentService.Request;
using Hinet.Service.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OfficeOpenXml;
using System.IO;
using System.Net.WebSockets;
using ZstdSharp.Unsafe;

namespace Hinet.Service.DepartmentService
{
    public class DepartmentService : Service<Department>, IDepartmentService
    {
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IAppUserRepository _appUserRepository;
        private readonly IRoleRepository _roleRepository;

        public DepartmentService(
            IDepartmentRepository departmentRepository,
            IUserRoleRepository userRoleRepository,
            IAppUserRepository appUserRepository,
            IRoleRepository roleRepository) : base(departmentRepository)
        {
            _userRoleRepository = userRoleRepository;
            _appUserRepository = appUserRepository;
            _roleRepository = roleRepository;
        }

        public async Task<PagedList<DepartmentDto>> GetData(DepartmentSearch search)
        {
            var query = from q in GetQueryable()
                        select new DepartmentDto
                        {
                            CreatedId = q.CreatedId,
                            UpdatedId = q.UpdatedId,
                            ParentId = q.ParentId,
                            Priority = q.Priority,
                            Name = q.Name,
                            Code = q.Code,
                            ShortName = q.ShortName,
                            DiaDanh = q.DiaDanh,
                            Loai = q.Loai,
                            Level = q.Level,
                            IsActive = q.IsActive,
                            IsDeleted = q.IsDeleted,
                            MaTinh = q.MaTinh,
                            Address = q.Address,
                            Hotline = q.Hotline,
                            Email = q.Email,
                            Id = q.Id,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                        };

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.Name))
                    query = query.Where(x => x.Name.ToUpper().Contains(search.Name.Trim().ToUpper()));

                if (!string.IsNullOrEmpty(search.Code))
                    query = query.Where(x => x.Code.ToUpper().Contains(search.Code.Trim().ToUpper()));

                if (search.IsActive != null)
                    query = query.Where(x => x.IsActive == search.IsActive);

                if (search.Level != null)
                    query = query.Where(x => x.Level == search.Level);

                if (!string.IsNullOrEmpty(search.Loai))
                    query = query.Where(x => x.Loai.Equals(search.Loai));
            }

            query = query.OrderByDescending(x => x.CreatedDate);
            return await PagedList<DepartmentDto>.CreateAsync(query, search);
        }

        public async Task<DepartmentDto> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)
                              select new DepartmentDto
                              {
                                  CreatedId = q.CreatedId,
                                  UpdatedId = q.UpdatedId,
                                  ParentId = q.ParentId,
                                  Priority = q.Priority,
                                  Name = q.Name,
                                  Code = q.Code,
                                  Loai = q.Loai,
                                  Level = q.Level,
                                  IsActive = q.IsActive,
                                  IsDeleted = q.IsDeleted,
                                  MaTinh = q.MaTinh,
                                  Address = q.Address,
                                  Hotline = q.Hotline,
                                  Email = q.Email,
                                  Id = q.Id,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  DeletedId = q.DeletedId,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  DeletedDate = q.DeletedDate,
                              }).FirstOrDefaultAsync();

            return item ?? throw new Exception("Department not found");
        }

        public async Task<DepartmentDto> GetDetail(Guid id)
        {
            var currentDept = await GetByIdAsync(id) ?? throw new Exception("Department not found");

            var deptUser = new List<DepartmentUser>();
            if (currentDept.Loai.Equals(DepartmentTypeConstant.Phong))
            {
                var userIds = _userRoleRepository.GetQueryable().Where(x => x.DepartmentId.Equals(id)).Select(x => x.UserId);
                deptUser = _appUserRepository
                    .GetQueryable()
                    .Where(x => userIds.Contains(x.Id))
                    .Select(x => new DepartmentUser
                    {
                        Id = x.Id,
                        Name = x.Name
                    }).ToList();
            }

            return new DepartmentDto
            {
                CreatedId = currentDept.CreatedId,
                UpdatedId = currentDept.UpdatedId,
                ParentId = currentDept.ParentId,
                Priority = currentDept.Priority,
                Name = currentDept.Name,
                Code = currentDept.Code,
                Loai = currentDept.Loai,
                Level = currentDept.Level,
                IsActive = currentDept.IsActive,
                IsDeleted = currentDept.IsDeleted,
                MaTinh = currentDept.MaTinh,
                Address = currentDept.Address,
                Hotline = currentDept.Hotline,
                Email = currentDept.Email,
                Id = currentDept.Id,
                CreatedBy = currentDept.CreatedBy,
                UpdatedBy = currentDept.UpdatedBy,
                DeletedId = currentDept.DeletedId,
                CreatedDate = currentDept.CreatedDate,
                UpdatedDate = currentDept.UpdatedDate,
                DeletedDate = currentDept.DeletedDate,
                Users = deptUser,
            };
        }

        public List<DepartmentHierarchy> GetDepartmentHierarchy()
        {
            var departments = GetQueryable()
                .Select(d => new DepartmentHierarchy
                {
                    Id = d.Id,
                    Title = d.Name,
                    Code = d.Code,
                    ShortName = d.ShortName,
                    DiaDanh = d.DiaDanh,
                    ParentId = d.ParentId,
                    Priority = d.Priority,
                    Level = d.Level,
                    Loai = d.Loai,
                    IsActive = d.IsActive,
                    MaTinh = d.MaTinh,
                })
                .OrderBy(d => d.Priority ?? 999999).ThenBy(d => d.Title).ToList();

            var departmentHierarchy = departments
                .Where(d => d.ParentId == null)
                .Select(d => new DepartmentHierarchy
                {
                    Id = d.Id,
                    Title = d.Title,
                    Code = d.Code,
                    ParentId = d.ParentId,
                    Priority = d.Priority,
                    Level = d.Level,
                    Loai = d.Loai,
                    ShortName = d.ShortName,
                    DiaDanh = d.DiaDanh,
                    IsActive = d.IsActive,
                    MaTinh = d.MaTinh,
                    Children = GetChildren(d.Id, departments)
                });

            return departmentHierarchy.ToList();
        }

        private List<DepartmentHierarchy>? GetChildren(Guid parentId, List<DepartmentHierarchy> departments)
        {
            var children = departments
                .Where(d => d.ParentId == parentId)
                .Select(d => new DepartmentHierarchy
                {
                    Id = d.Id,
                    Title = d.Title,
                    Code = d.Code,
                    ParentId = d.ParentId,
                    ShortName = d.ShortName,
                    Priority = d.Priority,
                    Level = d.Level,
                    Loai = d.Loai,
                    IsActive = d.IsActive,
                    MaTinh = d.MaTinh,
                    Children = GetChildren(d.Id, departments)
                })
                .ToList();
            return children.Any() ? children : null;
        }

        public async Task<List<DropdownOption>> GetDropDown(string? selected)
        {
            try
            {
                return await (from departmentTbl in GetQueryable()
                              select new DropdownOption
                              {
                                  Label = departmentTbl.Name,
                                  Value = departmentTbl.Id.ToString(),
                                  Selected = selected != null ? selected == departmentTbl.Id.ToString() : false
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve dropdown options: " + ex.Message);
            }
        }


        #region Hàm lấy dropdown phòng ban dưới dạng cây dùng trong TreeSelect của antd

        public async Task<List<DropdownOptionTree>> GetDropdownTreeOption(bool disabledParent = true)
        {
            var departments = await GetQueryable()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Priority ?? 999999).ThenBy(x => x.Name)
                .ToListAsync();

            var rootDepartments = departments.Where(d => d.ParentId == null).ToList();
            var result = new List<DropdownOptionTree>();

            foreach (var dept in rootDepartments)
            {
                result.Add(BuildTree(dept, departments, disabledParent));
            }

            return result;
        }

        public async Task<List<DropdownOptionTree>> GetDropdownTreeUnderMinistryRoot()
        {
            var departments = await GetQueryable()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Priority ?? 999999)
                .ThenBy(x => x.Name)
                .ToListAsync();

            var root = departments.FirstOrDefault(x => x.Code == "BTC")
                ?? departments.FirstOrDefault(x => x.Code == "BDT-TG")
                ?? departments.FirstOrDefault(x => x.ParentId == null || x.Level == 0);

            if (root == null)
            {
                return new List<DropdownOptionTree>();
            }

            var childNodes = departments
                .Where(x => x.ParentId == root.Id)
                .Select(x => new DropdownOptionTree
                {
                    Value = x.Id.ToString().ToLower(),
                    Title = x.Name,
                    Disabled = false,
                    Children = new List<DropdownOptionTree>()
                })
                .ToList();

            return new List<DropdownOptionTree>
            {
                new DropdownOptionTree
                {
                    Value = root.Id.ToString().ToLower(),
                    Title = root.Name,
                    Disabled = true,
                    Children = childNodes
                }
            };
        }

        public async Task<List<DropdownOptionTree>> GetDropdownTreeOptionByUserDepartment(bool disabledParent = true, Guid? donViId = null)
        {
            var result = new List<DropdownOptionTree>();

            var departments = await GetQueryable()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Priority ?? 999999).ThenBy(x => x.Name)
                .ToListAsync() ?? new List<Department>();

            List<Department>? rootDepartments;

            // nếu là admin thì lấy hết phòng ban
            if (donViId != null)
            {
                var dpName = departments.FirstOrDefault(x => x.Id == donViId)?.Name;
                result.Add(new DropdownOptionTree()
                {
                    Children = null,
                    Disabled = false,
                    Title = dpName,
                    Value = donViId.ToString(),
                });
            }
            // chỉ lấy chính phòng đó
            else
            {
                rootDepartments = departments.Where(x => x.ParentId == donViId).ToList();
                foreach (var dept in rootDepartments)
                {
                    result.Add(BuildTree(dept, departments, disabledParent));
                }

            }

            return result;
        }

        public async Task<List<DropdownOptionTree>> GetSubAndCurrentUnitDropdownTreeByUserDepartment(bool disabledParent = true, Guid? donViId = null)
        {
            var result = new List<DropdownOptionTree>();
            var departments = await GetQueryable()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Priority ?? 999999).ThenBy(x => x.Name)
                .ToListAsync() ?? new List<Department>();
            var department = departments.Where(x => x.Id == donViId).FirstOrDefault();
            result.Add(BuildTree(department, departments, disabledParent));
            return result;
        }


        private DropdownOptionTree BuildTree(Department department, List<Department> allDepartments, bool disabledParent)
        {
            var children = allDepartments.Where(d => d.ParentId == department.Id).ToList();

            return new DropdownOptionTree
            {
                Value = department.Id.ToString().ToLower(),
                Title = department.Name,
                Disabled = disabledParent && department.ParentId == null,
                Children = children.Any()
                    ? children.Select(child => BuildTree(child, allDepartments, disabledParent)).ToList()
                    : new List<DropdownOptionTree>()
            };
        }

        #endregion Hàm lấy dropdown phòng ban dưới dạng cây dùng trong TreeSelect của antd

        public List<DepartmentVM> BuildDepartmentHierarchy()
        {
            var departments = GetQueryable().ToList();
            return GetDepartmentHierarchy(departments, null);
        }

        public async Task<List<DropdownOption>> GetDropdownListKCQCN()
        {
            return GetQueryable().Where(x => x.Loai == DepartmentTypeConstant.KhoiCoQuanChiNhanh).Select(x => new DropdownOption
            {
                Value = x.Code,
                Label = x.Name

            }).ToList();

        }
        public async Task<List<DropdownOption>> GropdownDownPhongByKCQCN(List<string> codes)
        {
            if (codes == null || !codes.Any())
            {
                return new List<DropdownOption>();
            }

            var allItems = GetQueryable().Where(x => x.Loai == DepartmentTypeConstant.Phong).ToList();
            var lookup = allItems.ToLookup(x => x.ParentId);
            var result = new List<DropdownOption>();

            foreach (var code in codes)
            {
                var kcqcn = FindBy(x => x.Code == code).Select(x => x.Id).FirstOrDefault();
                if (kcqcn != Guid.Empty)
                {
                    BuildDropdown(kcqcn, lookup, result);
                }
            }

            return result;
        }


        private void BuildDropdown(
            Guid parentId,
            ILookup<Guid?, Department> lookup,
            List<DropdownOption> result
        )
        {
            foreach (var item in lookup[parentId])
            {
                result.Add(new DropdownOption
                {
                    Value = item.Id.ToString(),
                    Label = item.Name
                });

                BuildDropdown(item.Id, lookup, result);
            }
        }
        private List<DepartmentVM> GetDepartmentHierarchy(List<Department> departments, Guid? parentId = null)
        {
            return departments
                .Where(d => d.ParentId == parentId)
                .Select(d => new DepartmentVM
                {
                    Id = d.Id,
                    Name = d.Name,
                    Code = d.Code,
                    ParentId = d.ParentId,
                    Priority = d.Priority,
                    Level = d.Level,
                    IsActive = d.IsActive,
                    MaTinh = d.MaTinh,
                    DepartmentChilds = GetDepartmentHierarchy(departments, d.Id)
                })
                .ToList();
        }

        public async Task<List<DepartmentExport>> GetDepartmentExportData(string type)
        {
            var query = (from q in GetQueryable().Where(x => x.Loai.Equals(type))
                         join d in GetQueryable()
                         on q.ParentId equals d.Id into departmentGroup
                         from dept in departmentGroup.DefaultIfEmpty()
                         select new
                         {
                             Parent = dept != null ? dept.Name : "",
                             Name = q.Name,
                             Code = q.Code,
                             IsActive = q.IsActive,
                             CreatedDate = q.CreatedDate,
                         }).OrderByDescending(x => x.CreatedDate);

            var departments = await query.AsNoTracking().ToListAsync();
            return departments
                .Select((item, index) => new DepartmentExport
                {
                    STT = index + 1,
                    Name = item.Name,
                    Code = item.Code,
                    Status = item.IsActive ? "Hoạt động" : "Khoá",
                    Parent = item.Parent,
                    CreatedDate = item.CreatedDate.ToString("dd/MM/yyyy"),
                }).ToList();
        }

        // Lấy id các đơn vị con  
        public List<Guid> GetChildIds(List<Guid> ids)
        {
            var result = new List<Guid>();
            if (ids == null || !ids.Any()) return result;
            var childIds = FindBy(x => x.ParentId != null && ids.Contains(x.ParentId.Value))
            .Select(x => x.Id)
            .ToList();

            if (childIds != null && childIds.Any())
            {
                result.AddRange(childIds);
                result.AddRange(GetChildIds(childIds));
            }
            return result;
        }

        public async Task<List<DropdownOption>> GetDropdownDonViId(Guid? IdDepartment)
        {
            var query = await (from q in GetQueryable().Where(x => x.Id == IdDepartment)
                               select new DropdownOption
                               {
                                   Label = q.Name,
                                   Value = q.Id.ToString()
                               }).ToListAsync();
            return query;
        }


        //Lấy dropdown đơn vị
        public async Task<List<DropdownOptionTree>?> GetDropdownDonVi(bool disabledParent = true,
            Guid? donViId = null)
        {
            var result = new List<DropdownOptionTree>();

            var departments = await GetQueryable()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Priority ?? 999999).ThenBy(x => x.Name)
                .ToListAsync() ?? new List<Department>();

            List<Department>? rootDepartments;

            // nếu là admin thì lấy hết phòng ban
            if (donViId != null)
            {
                var dpName = departments.FirstOrDefault(x => x.Id == donViId)?.Name;
                result.Add(new DropdownOptionTree()
                {
                    Children = null,
                    Disabled = false,
                    Title = dpName,
                    Value = donViId.ToString(),
                });
            }
            // chỉ lấy chính phòng đó
            else
            {
                rootDepartments = departments.Where(x => x.ParentId == donViId).ToList();
                foreach (var dept in rootDepartments)
                {
                    result.Add(BuildTree(dept, departments, true));
                }
            }

            return result;
        }

        public async Task<List<DropdownOption>> GetDropdownDonVi()
        {
            var query = await (from q in GetQueryable()
                               orderby q.Priority ?? 999999, q.Name
                               select new DropdownOption
                               {
                                   Label = q.Name,
                                   Value = q.Id.ToString()
                               }).ToListAsync();
            return query;
        }

        public async Task<List<DropdownOption>> GetDropdownNhomNhanSu(bool? parent = true)
        {

            var query = await (from q in GetQueryable()
                               where parent == true && q.Level == 0 || parent == false && q.Level == 1
                               select new DropdownOption
                               {
                                   Label = q.Name,
                                   Value = q.Id.ToString()
                               }).ToListAsync();
            return query;
        }

        public async Task<object> ImportExcelDirectAsync(IFormFile file, int startRow = 2)
        {
            if (file == null || file.Length == 0)
            {
                return new
                {
                    status = false,
                    message = "Vui lòng chọn file Excel để import",
                    listTrue = new List<Department>(),
                    lstFalse = new List<object>(),
                    totalSuccess = 0,
                    totalFailed = 0
                };
            }

            var listTrue = new List<Department>();
            var lstFalse = new List<object>();
            var allDepts = await GetQueryable().AsNoTracking().ToListAsync();
            var mapMaDonViToId = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                    {
                        return new
                        {
                            status = false,
                            message = "File Excel không có dữ liệu hoặc không có worksheet",
                            listTrue = new List<Department>(),
                            lstFalse = new List<object>(),
                            totalSuccess = 0,
                            totalFailed = 0
                        };
                    }

                    int rowCount = worksheet.Dimension.Rows;

                    for (int row = startRow; row <= rowCount; row++)
                    {
                        // Đọc theo đúng template: Cột 1: Mã Đơn Vị (1, 1.1, 1.2,...), Cột 2: Tên Đơn Vị, Cột 3: Tên Viết Tắt
                        string maDonViTxt = worksheet.Cells[row, 1].Text?.Trim() ?? "";
                        string tenDonVi = worksheet.Cells[row, 2].Text?.Trim() ?? "";
                        string tenVietTat = worksheet.Cells[row, 3].Text?.Trim() ?? "";

                        if (string.IsNullOrWhiteSpace(maDonViTxt) && string.IsNullOrWhiteSpace(tenDonVi) && string.IsNullOrWhiteSpace(tenVietTat))
                        {
                            continue;
                        }

                        if (string.IsNullOrWhiteSpace(tenDonVi))
                        {
                            lstFalse.Add(new
                            {
                                row = row,
                                reason = "Thiếu thông tin bắt buộc: Tên đơn vị",
                                maDonVi = maDonViTxt,
                                tenDonVi = tenDonVi
                            });
                            continue;
                        }

                        string code = !string.IsNullOrWhiteSpace(tenVietTat) ? tenVietTat : StringUtilities.GenerateCode(tenDonVi);

                        int level = 0;
                        Guid? parentId = null;

                        if (!string.IsNullOrWhiteSpace(maDonViTxt))
                        {
                            if (maDonViTxt.Contains('.'))
                            {
                                var segments = maDonViTxt.Split(new[] { '.' }, StringSplitOptions.RemoveEmptyEntries);
                                level = segments.Length - 1;

                                int lastDotIdx = maDonViTxt.LastIndexOf('.');
                                string parentKey = maDonViTxt.Substring(0, lastDotIdx).Trim();

                                if (mapMaDonViToId.ContainsKey(parentKey))
                                {
                                    parentId = mapMaDonViToId[parentKey];
                                }
                                else
                                {
                                    var parentDept = allDepts.FirstOrDefault(x => x.Code.Equals(parentKey, StringComparison.OrdinalIgnoreCase) || x.Name.Equals(parentKey, StringComparison.OrdinalIgnoreCase));
                                    if (parentDept != null)
                                    {
                                        parentId = parentDept.Id;
                                    }
                                }
                            }
                        }

                        string loai = level == 0 ? DepartmentTypeConstant.KhoiCoQuanChiNhanh : DepartmentTypeConstant.Phong;

                        long priority = row - startRow + 1;
                        if (!string.IsNullOrWhiteSpace(maDonViTxt))
                        {
                            string lastSegment = maDonViTxt.Contains('.') ? maDonViTxt.Substring(maDonViTxt.LastIndexOf('.') + 1) : maDonViTxt;
                            if (long.TryParse(lastSegment, out long pVal))
                            {
                                priority = pVal;
                            }
                        }

                        Guid newId = Guid.NewGuid();
                        if (!string.IsNullOrWhiteSpace(maDonViTxt))
                        {
                            mapMaDonViToId[maDonViTxt] = newId;
                        }

                        var entity = new Department
                        {
                            Id = newId,
                            Priority = priority,
                            Name = tenDonVi,
                            ShortName = tenVietTat,
                            Code = code,
                            Loai = loai,
                            ParentId = parentId,
                            Level = level,
                            IsActive = true,
                            CreatedDate = DateTime.Now
                        };

                        listTrue.Add(entity);
                    }
                }
            }

            if (listTrue.Any())
            {
                await CreateAsync(listTrue);
            }

            return new
            {
                status = true,
                message = $"Import hoàn tất: Thành công {listTrue.Count} đơn vị, lỗi {lstFalse.Count} dòng.",
                listTrue = listTrue,
                lstFalse = lstFalse,
                totalSuccess = listTrue.Count,
                totalFailed = lstFalse.Count
            };
        }
    }
}
