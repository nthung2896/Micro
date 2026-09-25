using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Models;
using Hinet.Service.DepartmentService;

namespace Hinet.Api.Controllers
{
    [ApiController]
    [Route("api/auth/departments")]
    [Route("api/departments")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentsController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDepartments([FromQuery] string? search, [FromQuery] bool? isActive)
        {
            var result = await _departmentService.GetDepartmentsAsync(search, isActive);
            return Ok(ApiResponse<object>.Ok(result, "Lấy danh sách phòng ban thành công"));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDepartmentById(Guid id)
        {
            var result = await _departmentService.GetDepartmentByIdAsync(id);
            if (result == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy đơn vị / phòng ban"));
            }
            return Ok(ApiResponse<object>.Ok(result));
        }

        [HttpPost]
        public async Task<IActionResult> CreateDepartment([FromBody] DepartmentCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(ApiResponse<object>.Fail("Mã và Tên phòng ban không được để trống"));
            }

            var dept = await _departmentService.CreateDepartmentAsync(request);
            return Ok(ApiResponse<object>.Ok(dept, "Tạo mới phòng ban và đồng bộ thành công"));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] DepartmentUpdateRequest request)
        {
            var dept = await _departmentService.UpdateDepartmentAsync(id, request);
            if (dept == null)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy phòng ban"));
            }
            return Ok(ApiResponse<object>.Ok(dept, "Cập nhật phòng ban và đồng bộ thành công"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(Guid id)
        {
            var success = await _departmentService.DeleteDepartmentAsync(id);
            if (!success)
            {
                return NotFound(ApiResponse<object>.Fail("Không tìm thấy phòng ban"));
            }
            return Ok(ApiResponse<object?>.Ok(null, "Xóa phòng ban và đồng bộ thành công"));
        }
    }
}
