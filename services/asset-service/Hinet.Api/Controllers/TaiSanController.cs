using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Hinet.Api.Dto;
using SharedKernel.Models;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaiSanController : HinetController
    {
        private readonly ILogger<TaiSanController> _logger;

        public TaiSanController(ILogger<TaiSanController> logger)
        {
            _logger = logger;
        }

        [HttpGet("GetData")]
        public IActionResult GetData([FromQuery] string? keyword = null, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            // Danh sách tài sản mẫu chuẩn phục vụ Asset Client
            var mockAssets = new List<object>
            {
                new { Id = Guid.NewGuid(), MaTaiSan = "TS-2026-001", TenTaiSan = "Máy chiếu Panasonic PT-VMZ51", LoaiTaiSan = "Thiết bị văn phòng", PhongBan = "Phòng CNTT", NguoiSuDung = "Nguyễn Văn Hùng", GiaTri = 35000000, TinhTrang = "Đang sử dụng", NgayDuaVaoSuDung = "2024-01-15" },
                new { Id = Guid.NewGuid(), MaTaiSan = "TS-2026-002", TenTaiSan = "Server Dell PowerEdge R750", LoaiTaiSan = "Hạ tầng CNTT", PhongBan = "Trung tâm Dữ liệu", NguoiSuDung = "Quản trị viên", GiaTri = 120000000, TinhTrang = "Đang sử dụng", NgayDuaVaoSuDung = "2023-06-10" },
                new { Id = Guid.NewGuid(), MaTaiSan = "TS-2026-003", TenTaiSan = "Bàn họp gỗ tự nhiên 12 chỗ", LoaiTaiSan = "Bàn ghế - Nội thất", PhongBan = "Phòng Họp A1", NguoiSuDung = "Dùng chung", GiaTri = 18500000, TinhTrang = "Đang sử dụng", NgayDuaVaoSuDung = "2022-09-20" },
                new { Id = Guid.NewGuid(), MaTaiSan = "TS-2026-004", TenTaiSan = "Máy in đa năng HP LaserJet M428fdw", LoaiTaiSan = "Thiết bị văn phòng", PhongBan = "Phòng Kế toán", NguoiSuDung = "Trần Thị Mai", GiaTri = 12500000, TinhTrang = "Cần bảo dưỡng", NgayDuaVaoSuDung = "2024-03-05" },
                new { Id = Guid.NewGuid(), MaTaiSan = "TS-2026-005", TenTaiSan = "Ô tô công tác Toyota Camry 2.5Q", LoaiTaiSan = "Phương tiện vận tải", PhongBan = "Ban Giám đốc", NguoiSuDung = "Đoàn lái xe", GiaTri = 1450000000, TinhTrang = "Đang sử dụng", NgayDuaVaoSuDung = "2021-11-12" }
            };

            if (!string.IsNullOrEmpty(keyword))
            {
                mockAssets = mockAssets.Where(x => x.ToString()!.Contains(keyword, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return Ok(new
            {
                status = true,
                total = mockAssets.Count,
                pageIndex = pageIndex,
                pageSize = pageSize,
                data = mockAssets,
                message = "Lấy danh sách tài sản thành công"
            });
        }

        [HttpGet("GetThongKe")]
        public IActionResult GetThongKe()
        {
            return Ok(new
            {
                status = true,
                data = new
                {
                    tongTaiSan = 128,
                    tongGiaTri = 3450000000,
                    dangSuDung = 115,
                    canBaoDuong = 8,
                    chuaSuDung = 5
                },
                message = "Lấy thống kê tài sản thành công"
            });
        }

        [HttpGet("GetById/{id}")]
        public IActionResult GetById(Guid id)
        {
            return Ok(new
            {
                status = true,
                data = new
                {
                    Id = id,
                    MaTaiSan = "TS-2026-001",
                    TenTaiSan = "Máy chiếu Panasonic PT-VMZ51",
                    LoaiTaiSan = "Thiết bị văn phòng",
                    PhongBan = "Phòng CNTT",
                    NguoiSuDung = "Nguyễn Văn Hùng",
                    GiaTri = 35000000,
                    TinhTrang = "Đang sử dụng",
                    NgayDuaVaoSuDung = "2024-01-15",
                    BaoHanhDenNgay = "2027-01-15",
                    XuatXu = "Japan",
                    GhiChu = "Tài sản dự án Chuyển đổi số"
                },
                message = "Lấy chi tiết tài sản thành công"
            });
        }
    }
}
