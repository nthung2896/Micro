using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoomService.Data;
using RoomService.Entities;
using SharedKernel.Models;

namespace RoomService.Controllers
{
    [ApiController]
    [Route("api/rooms")]
    public class RoomController : ControllerBase
    {
        private readonly RoomContext _context;

        public RoomController(RoomContext context)
        {
            _context = context;
        }

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(ApiResponse<object>.Ok(new
            {
                service = "Room Service",
                status = "Healthy",
                time = DateTime.UtcNow
            }, "Room Service is running"));
        }

        [HttpGet("bang-gia")]
        public async Task<IActionResult> GetBangGia()
        {
            var data = await _context.Room_BangGias
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            return Ok(ApiResponse<List<Room_BangGia>>.Ok(data));
        }

        [HttpGet("khuyen-mai-nap")]
        public async Task<IActionResult> GetKhuyenMaiNap()
        {
            var data = await _context.Room_CauHinhKhuyenMaiNaps
                .Where(x => x.IsActive && !x.IsDeleted)
                .OrderBy(x => x.ThuTu)
                .ToListAsync();

            return Ok(ApiResponse<List<Room_CauHinhKhuyenMaiNap>>.Ok(data));
        }
    }
}
