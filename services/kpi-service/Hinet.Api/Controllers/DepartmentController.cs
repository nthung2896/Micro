using CommonHelper.Excel;
using CommonHelper.String;
using Hinet.Api.Dto;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.DepartmentService;
using Hinet.Service.DepartmentService.Dto;
using Hinet.Service.DepartmentService.Request;
using Hinet.Service.Dto;
using Hinet.Repository.KPI_LyLich2CRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class DepartmentController : HinetController
    {
        private readonly IDepartmentService _departmentService;
        private readonly IMapper _mapper;
        private readonly ILogger<DepartmentController> _logger;
        private readonly IKPI_LyLich2CRepository _lyLich2CRepository;

        public DepartmentController(
            IDepartmentService departmentService,
            IMapper mapper,
            ILogger<DepartmentController> logger,
            IKPI_LyLich2CRepository lyLich2CRepository
            )
        {
            this._departmentService = departmentService;
            this._mapper = mapper;
            _logger = logger;
            _lyLich2CRepository = lyLich2CRepository;
        }

        [HttpPost("SaveDepartmentChanges")]
        public async Task<DataResponse<List<Department>>> SaveDepartmentChanges([FromBody] List<DepartmentSaveRequest> departments)
        {
            var exitingIds = new List<Guid>();
            try
            {
                if (departments != null && departments.Any())
                {
                    foreach (var dept in departments)
                    {
                        var currentDept = await _departmentService.GetQueryable().Where(x => x.Id == dept.Id).FirstOrDefaultAsync();
                        if (currentDept == null)
                        {
                            var item = _mapper.Map<DepartmentSaveRequest, Department>(dept);
                            item.Id = Guid.NewGuid();
                            await _departmentService.CreateAsync(item);
                            exitingIds.Add(item.Id);
                        }
                        else
                        {
                            currentDept.Name = dept.Name;
                            currentDept.Code = dept.Code;
                            currentDept.ShortName = dept.ShortName;
                            currentDept.DiaDanh = dept.DiaDanh;
                            currentDept.ParentId = dept.ParentId;
                            currentDept.Priority = dept.Priority;
                            currentDept.Level = dept.Level;
                            currentDept.Loai = dept.Loai;
                            currentDept.IsActive = dept.IsActive;
                            currentDept.MaTinh = dept.MaTinh;
                            currentDept.Address = dept.Address;
                            currentDept.Hotline = dept.Hotline;
                            currentDept.Email = dept.Email;
                            await _departmentService.UpdateAsync(currentDept);
                            exitingIds.Add(currentDept.Id);
                        }
                    }
                }

                var idsToDelete = await _departmentService.GetQueryable()
                    .Where(x => !exitingIds.Contains(x.Id))
                    .Select(x => x.Id)
                    .ToListAsync();

                if (idsToDelete.Any())
                {
                    var removeDepts = await _departmentService.GetQueryable()
                        .AsNoTracking()
                        .Where(x => idsToDelete.Contains(x.Id))
                        .ToListAsync();

                    await _departmentService.DeleteAsync(removeDepts);
                }

                var savedDepartments = await _departmentService.GetQueryable()
                    .Where(x => exitingIds.Contains(x.Id))
                    .ToListAsync();

                var response = new DataResponse<List<Department>>
                {
                    Data = savedDepartments,
                    Status = true,
                    Message = "Lưu thành công"
                };
                return response;
            }
            catch (Exception ex)
            {
                var response = new DataResponse<List<Department>> { Data = null, Status = false, Message = ex.Message };
                return response;
            }
        }

        [HttpPost("Create")]
        public async Task<DataResponse<Department>> Create([FromBody] DepartmentRequest model)
        {
            var entity = _mapper.Map<DepartmentRequest, Department>(model);
            await _departmentService.CreateAsync(entity);
            return new DataResponse<Department>() { Data = entity, Status = true };
        }

        [HttpPut("Update")]
        public async Task<DataResponse<Department>> Update([FromBody] DepartmentRequest model)
        {
            var entity = await _departmentService.GetByIdAsync(model.Id);
            if (entity == null)
                return DataResponse<Department>.False("Department not found");

            entity = _mapper.Map(model, entity);
            await _departmentService.UpdateAsync(entity);
            return new DataResponse<Department>() { Data = entity, Status = true };
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<DepartmentDto>> Get(Guid id)
        {
            var data = await _departmentService.GetDto(id);
            return new DataResponse<DepartmentDto> { Data = data, Status = true };
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<DepartmentDto>>> GetData([FromBody] DepartmentSearch search)
        {
            var data = await _departmentService.GetData(search);
            return new DataResponse<PagedList<DepartmentDto>> { Data = data, Status = true };
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            var entity = await _departmentService.GetByIdAsync(id);
            await _departmentService.DeleteAsync(entity);
            return DataResponse.Success(null);
        }

        [HttpPut("deactive/{id}")]
        public async Task<DataResponse> Deactive(Guid id)
        {
            var entity = await _departmentService.GetByIdAsync(id);
            entity.IsActive = !entity.IsActive;
            await _departmentService.UpdateAsync(entity);
            return DataResponse.Success(entity);
        }

        [HttpGet("GetDepartmentsWithHierarchy")]
        public async Task<DataResponse<List<DepartmentHierarchy>>> GetDepartmentsWithHierarchy()
        {
            var data = _departmentService.GetDepartmentHierarchy();
            return new DataResponse<List<DepartmentHierarchy>> { Data = data, Status = true };
        }

        [HttpPost("GetDropDepartment")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropDepartment(string? selected)
        {
            var result = await _departmentService.GetDropDown(selected);

            return new DataResponse<List<DropdownOption>>
            {
                Data = result,
                Message = "GetDropDepartment thành công",
                Status = true
            };
        }

        [HttpGet("GetDropDownPhong")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropDownPhong()
        {
            var result = await _departmentService.GetQueryable().Where(x => x.Loai == DepartmentTypeConstant.Phong).Select(x => new DropdownOption
            {
                Value = x.Id.ToString(),
                Label = x.Name
            }).ToListAsync();

            return new DataResponse<List<DropdownOption>>
            {
                Data = result,
                Message = "GetDropDepartment thành công",
                Status = true
            };
        }

        [HttpGet("export")]
        public async Task<DataResponse> ExportExcel(string type)
        {
            try
            {
                var exportData = await _departmentService.GetDepartmentExportData(type);
                var base64Excel = ExportExcelHelperNetCore.ExportExcel(exportData);
                if (string.IsNullOrEmpty(base64Excel))
                {
                    return DataResponse.False("Kết xuất thất bại hoặc dữ liệu trống");
                }
                return DataResponse.Success(base64Excel);
            }
            catch (Exception ex)
            {
                return DataResponse.False("Kết xuất thất bại");
            }
        }

        [HttpGet("GetHierarchicalDropdownList")]
        public async Task<DataResponse<List<DropdownOptionTree>>> GetHierarchicalDropdownList(bool disabledParent = true)
        {
            var response = await _departmentService.GetDropdownTreeOption(disabledParent);
            return DataResponse<List<DropdownOptionTree>>.Success(response, "Lấy dữ liệu thành công");
        }

        [HttpGet("GetDropdownTreeUnderMinistryRoot")]
        public async Task<DataResponse<List<DropdownOptionTree>>> GetDropdownTreeUnderMinistryRoot()
        {
            var response = await _departmentService.GetDropdownTreeUnderMinistryRoot();
            return DataResponse<List<DropdownOptionTree>>.Success(response, "Lấy dữ liệu thành công");
        }

        [HttpGet("GetDropdownListByUserDepartment")]
        public async Task<DataResponse<List<DropdownOptionTree>>> GetDropdownListByUserDepartment(bool disabledParent = true)
        {
            var response = await _departmentService.GetDropdownTreeOptionByUserDepartment(disabledParent, Guid.Empty);
            return DataResponse<List<DropdownOptionTree>>.Success(response, "Lấy dữ liệu thành công");
        }

        [HttpGet("GetDropdownListKCQCN")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdownListKCQCN()
        {
            try
            {
                var listdata = await _departmentService.GetDropdownListKCQCN();
                return DataResponse<List<DropdownOption>>.Success(listdata);
            }
            catch (Exception e)
            {
                return DataResponse<List<DropdownOption>>.False(e.Message);
            }
        }
        [HttpGet("GropdownDownPhongByKCQCN")]
        public async Task<DataResponse<List<DropdownOption>>> GropdownDownPhongByKCQCN(string ids)
        {
            try
            {
                var codeList = new List<string>();
                if (!string.IsNullOrEmpty(ids))
                {
                    codeList = ids.Split(',')
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .Select(x => x.Trim())
                        .ToList();
                }
                var listdata = await _departmentService.GropdownDownPhongByKCQCN(codeList);
                return DataResponse<List<DropdownOption>>.Success(listdata);
            }
            catch (Exception e)
            {
                return DataResponse<List<DropdownOption>>.False(e.Message);
            }
        }

        [HttpGet("ImportLiveFile")]
        [Authorize(Roles = "Admin")]
        public bool ImportLiveFile()
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/ImportCoCauToChuc.xlsx");
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(new FileInfo(filePath)))
            {
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                if (worksheet == null) return false;

                int rowCount = worksheet.Dimension.Rows;

                // bắt đầu đọc từ dòng 2;
                var lstDepartment = new List<DepartmentRequest>();

                for (int row = 5; row <= rowCount; row++)
                {
                    var item = new DepartmentRequest();
                    item.Priority = long.Parse(worksheet.Cells[row, 1].Text.Trim());
                    item.Name = worksheet.Cells[row, 2].Text.Trim();
                    item.Loai = worksheet.Cells[row, 3].Text.Trim();
                    item.Level = int.Parse(worksheet.Cells[row, 4].Text.Trim());
                    item.idcha = worksheet.Cells[row, 5].Text.Trim();
                    item.idchinhno = worksheet.Cells[row, 6].Text.Trim();
                    item.Code = StringUtilities.GenerateCode(item.Name);
                    lstDepartment.Add(item);
                }

                var lstLevel0 = lstDepartment.Where(x => x.Level == 0).ToList();

                foreach (var item in lstLevel0)
                {
                    // insert vào db
                    var newDepartment = new Department();
                    newDepartment.Priority = item.Priority;
                    newDepartment.Name = item.Name;
                    newDepartment.Code = item.Code;
                    newDepartment.Loai = item.Loai;
                    newDepartment.Level = item.Level;
                    newDepartment.IsActive = true;

                    _departmentService.CreateAsync(newDepartment);

                    // lstcon - level1
                    if (string.IsNullOrWhiteSpace(item.idchinhno)) continue;
                    var lstLevel1 = lstDepartment.Where(x => x.idcha == item.idchinhno);

                    if (lstLevel1 != null && lstLevel1.Any())
                    {
                        foreach (var item1 in lstLevel1)
                        {
                            var newDepartment2 = new Department();
                            newDepartment2.Priority = item1.Priority;
                            newDepartment2.Name = item1.Name;
                            newDepartment2.Code = item1.Code;
                            newDepartment2.Loai = item1.Loai;
                            newDepartment2.Level = item1.Level;
                            newDepartment2.ParentId = newDepartment.Id;
                            newDepartment2.IsActive = true;

                            _departmentService.CreateAsync(newDepartment2);

                            // lstcon - level2
                            if (string.IsNullOrWhiteSpace(item1.idchinhno)) continue;
                            var lstLevel2 = lstDepartment.Where(x => x.idcha == item1.idchinhno);

                            if (lstLevel2 != null && lstLevel2.Any())
                            {
                                foreach (var item2 in lstLevel2)
                                {
                                    var newDepartment3 = new Department();
                                    newDepartment3.Priority = item2.Priority;
                                    newDepartment3.Name = item2.Name;
                                    newDepartment3.Code = item2.Code;
                                    newDepartment3.Loai = item2.Loai;
                                    newDepartment3.Level = item2.Level;
                                    newDepartment3.ParentId = newDepartment2.Id;
                                    newDepartment3.IsActive = true;
                                    _departmentService.CreateAsync(newDepartment3);

                                    // lstcon - level3
                                    if (string.IsNullOrWhiteSpace(item2.idchinhno)) continue;
                                    var lstLevel3 = lstDepartment.Where(x => x.idcha == item2.idchinhno);

                                    if (lstLevel3 != null && lstLevel3.Any())
                                    {
                                        foreach (var item3 in lstLevel3)
                                        {
                                            var newDepartment4 = new Department();
                                            newDepartment4.Priority = item3.Priority;
                                            newDepartment4.Name = item3.Name;
                                            newDepartment4.Code = item3.Code;
                                            newDepartment4.Loai = item3.Loai;
                                            newDepartment4.Level = item3.Level;
                                            newDepartment4.ParentId = newDepartment3.Id;
                                            newDepartment4.IsActive = true;
                                            _departmentService.CreateAsync(newDepartment4);

                                            // lstcon - level4
                                            if (string.IsNullOrWhiteSpace(item3.idchinhno)) continue;
                                            var lstLevel4 = lstDepartment.Where(x => x.idcha == item3.idchinhno);

                                            if (lstLevel4 != null && lstLevel4.Any())
                                            {
                                                foreach (var item4 in lstLevel4)
                                                {
                                                    var newDepartment5 = new Department();
                                                    newDepartment5.Priority = item4.Priority;
                                                    newDepartment5.Name = item4.Name;
                                                    newDepartment5.Code = item4.Code;
                                                    newDepartment5.Loai = item4.Loai;
                                                    newDepartment5.Level = item4.Level;
                                                    newDepartment5.ParentId = newDepartment4.Id;
                                                    newDepartment5.IsActive = true;
                                                    _departmentService.CreateAsync(newDepartment5);
                                                }
                                            }

                                        }
                                    }

                                }
                            }
                        }
                    }
                }
            }
            return true;
        }

        [HttpGet("GetSubAndCurrentUnitDropdown")]
        public async Task<DataResponse<List<DropdownOptionTree>>> GetSubAndCurrentUnitDropdown(bool disabledParent = true)
        {
            var response = await _departmentService.GetSubAndCurrentUnitDropdownTreeByUserDepartment(disabledParent, Guid.Empty);
            return DataResponse<List<DropdownOptionTree>>.Success(response, "Lấy dữ liệu thành công");
        }

        [HttpGet("GetDropdownDonVi")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdownDonVi()
        {
            var result = await _departmentService.GetDropdownDonVi();
            return DataResponse<List<DropdownOption>>.Success(result);
        }

        [HttpGet("GetDropdownTrucThuocBTC")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdownTrucThuocBTC()
        {
            var root = await _departmentService.GetQueryable().FirstOrDefaultAsync(x => x.Code == "BTC" || x.Code == "BDT-TG" || x.ParentId == null || x.Level == 0);

            var query = _departmentService.GetQueryable()
                .Where(x => x.IsActive == true);

            if (root != null)
            {
                query = query.Where(x => x.Id != root.Id);
            }

            var result = await query
                .OrderBy(x => x.Level)
                .ThenBy(x => x.Name)
                .Select(x => new DropdownOption
                {
                    Value = x.Id.ToString(),
                    Label = x.Name
                }).ToListAsync();
            return DataResponse<List<DropdownOption>>.Success(result);
        }

        [HttpGet("GetDropdownLevel1")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdownLevel1([FromQuery] Guid? donViSuDungId)
        {
            if (donViSuDungId == null || donViSuDungId == Guid.Empty)
            {
                if (UserId.HasValue)
                {
                    var lyLich = await _lyLich2CRepository.GetQueryable().FirstOrDefaultAsync(x => x.UserId == UserId.Value);
                    if (lyLich != null)
                    {
                        donViSuDungId = lyLich.DonViSuDungId;
                    }
                }
            }

            if (!donViSuDungId.HasValue || donViSuDungId.Value == Guid.Empty)
            {
                return DataResponse<List<DropdownOption>>.Success(
                    new List<DropdownOption>(),
                    "Không xác định được đơn vị sử dụng hoặc đơn vị không có phòng ban trực thuộc.");
            }

            var result = await _departmentService.GetQueryable()
                .Where(x => x.IsActive
                    && x.ParentId == donViSuDungId.Value)
                .OrderBy(x => x.Priority ?? long.MaxValue)
                .ThenBy(x => x.Name)
                .Select(x => new DropdownOption
                {
                    Value = x.Id.ToString(),
                    Label = x.Name
                }).ToListAsync();

            return DataResponse<List<DropdownOption>>.Success(
                result,
                result.Count == 0
                    ? "Đơn vị không có phòng ban trực thuộc."
                    : "Lấy danh sách phòng ban thành công.");
        }

        /// Lấy danh sách phòng ban có parentId = id truyền vào, trả về danh sách con và cha truyền vào
        [HttpGet("GetCurrentAndChildDropdown/{id}")]
        public async Task<DataResponse<List<DropdownOptionTree>>> GetCurrentAndChildDropdown(
            Guid id,
            [FromQuery] bool disabledParent = false)
        {
            var currentDepartment = await _departmentService.GetQueryable()
                .Where(x => x.Id == id && x.IsActive)
                .Select(x => new { x.Id, x.Name })
                .FirstOrDefaultAsync();

            if (currentDepartment == null)
            {
                return DataResponse<List<DropdownOptionTree>>.False("Không tìm thấy đơn vị/phòng ban.");
            }

            var children = await _departmentService.GetQueryable()
                .Where(x => x.IsActive && x.ParentId == id)
                .OrderBy(x => x.Priority)
                .ThenBy(x => x.Name)
                .Select(x => new DropdownOptionTree
                {
                    Value = x.Id.ToString(),
                    Title = x.Name,
                    Disabled = false,
                    Children = new List<DropdownOptionTree>()
                })
                .ToListAsync();

            var response = new List<DropdownOptionTree>
            {
                new()
                {
                    Value = currentDepartment.Id.ToString(),
                    Title = currentDepartment.Name,
                    Disabled = disabledParent,
                    Children = children
                }
            };

            return DataResponse<List<DropdownOptionTree>>.Success(response, "Lấy dữ liệu thành công");
        }

        [HttpPost("ImportExcelDirect")]
        public async Task<DataResponse> ImportExcelDirect(IFormFile file, [FromQuery] int startRow = 2)
        {
            try
            {
                var result = await _departmentService.ImportExcelDirectAsync(file, startRow);
                return DataResponse.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi import Excel trực tiếp cho Department");
                return DataResponse.False("Đã xảy ra lỗi khi đọc file Excel: " + ex.Message);
            }
        }
    }
}
