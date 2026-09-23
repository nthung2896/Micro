using Hinet.Model.Entities;
using Hinet.Service.DepartmentService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.DepartmentService.Request;
using Hinet.Service.Dto;

namespace Hinet.Service.DepartmentService
{
    public interface IDepartmentService : IService<Department>
    {
        Task<PagedList<DepartmentDto>> GetData(DepartmentSearch search);

        Task<DepartmentDto> GetDto(Guid id);

        List<DepartmentHierarchy> GetDepartmentHierarchy();

        Task<DepartmentDto> GetDetail(Guid id);

        Task<List<DropdownOption>> GetDropDown(string? selected);


        Task<List<DropdownOptionTree>> GetDropdownTreeOption(bool disabledParent = true);
        Task<List<DropdownOptionTree>> GetDropdownTreeUnderMinistryRoot();

        List<DepartmentVM> BuildDepartmentHierarchy();

        Task<List<DepartmentExport>> GetDepartmentExportData(string type);
        List<Guid> GetChildIds(List<Guid> ids);
        Task<List<DropdownOptionTree>> GetDropdownTreeOptionByUserDepartment(bool disabledParent = true, Guid? donViId = null);
        Task<List<DropdownOptionTree>> GetSubAndCurrentUnitDropdownTreeByUserDepartment(bool disabledParent = true, Guid? donViId = null);

        Task<List<DropdownOption>> GetDropdownDonViId(Guid? IdDepartment);
        Task<List<DropdownOption>> GetDropdownListKCQCN();
        Task<List<DropdownOption>> GropdownDownPhongByKCQCN(List<string> codes);
        Task<List<DropdownOptionTree>?> GetDropdownDonVi(bool disabledParent = true, Guid? donViId = null);
        Task<List<DropdownOption>> GetDropdownDonVi();

        Task<List<DropdownOption>> GetDropdownNhomNhanSu(bool? parent = true);
        Task<object> ImportExcelDirectAsync(Microsoft.AspNetCore.Http.IFormFile file, int startRow = 2);
    }
}
