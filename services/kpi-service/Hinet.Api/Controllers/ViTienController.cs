using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hinet.Controllers;
using Hinet.Model.Entities;
using Hinet.Service.ViTienService;
using Hinet.Service.ViTienService.Dto;
using Hinet.Service.Common;
using Hinet.Api.Dto;

namespace Hinet.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ViTienController : HinetController
    {
        private readonly IViTienService _viTienService;
        private readonly ILogger<ViTienController> _logger;

        public ViTienController(
            IViTienService viTienService,
            ILogger<ViTienController> logger
        )
        {
            _viTienService = viTienService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy thông tin ví tiền của người dùng hiện tại
        /// </summary>
        [HttpGet("ThongTin")]
        public async Task<DataResponse<ViTienDto>> GetThongTin()
        {
            var response = new DataResponse<ViTienDto>();
            try
            {
                var targetUserId = UserId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
                var result = await _viTienService.GetThongTinVi(targetUserId);
                response.Data = result;
                response.Status = true;
                response.Message = "Lấy thông tin ví thành công";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi lấy thông tin ví");
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        /// <summary>
        /// Tạo yêu cầu nạp tiền và sinh mã VietQR
        /// </summary>
        [HttpPost("TaoYeuCauNap")]
        public async Task<DataResponse<GiaoDichNapTienDto>> TaoYeuCauNap([FromBody] TaoYeuCauNapRequest request)
        {
            var response = new DataResponse<GiaoDichNapTienDto>();
            try
            {
                var targetUserId = UserId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
                var result = await _viTienService.TaoYeuCauNap(request, targetUserId);
                response.Data = result;
                response.Status = true;
                response.Message = "Tạo lệnh nạp tiền thành công";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi tạo yêu cầu nạp tiền");
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        /// <summary>
        /// Xác nhận thanh toán thành công cho đơn nạp tiền (Admin / Webhook / Giả lập)
        /// </summary>
        [HttpPost("XacNhanNap/{maGiaoDich}")]
        public async Task<DataResponse<bool>> XacNhanNap(string maGiaoDich)
        {
            var response = new DataResponse<bool>();
            try
            {
                var success = await _viTienService.XacNhanNapTien(maGiaoDich, UserId, "Hệ thống / Admin");
                response.Data = success;
                response.Status = success;
                response.Message = success ? "Xác nhận nạp tiền thành công, số dư ví đã được cộng!" : "Không tìm thấy giao dịch hoặc đã hoàn tất.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xác nhận nạp tiền");
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        /// <summary>
        /// Thanh toán dịch vụ phòng trọ (Nâng VIP, Đẩy tin, Gia hạn ngày)
        /// </summary>
        [HttpPost("ThanhToanDichVu")]
        public async Task<DataResponse<KetQuaThanhToanDto>> ThanhToanDichVu([FromBody] ThanhToanDichVuRequest request)
        {
            var response = new DataResponse<KetQuaThanhToanDto>();
            try
            {
                var targetUserId = UserId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
                var result = await _viTienService.ThanhToanDichVu(request, targetUserId);
                response.Data = result;
                response.Status = result.Success;
                response.Message = result.Message;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi thanh toán dịch vụ");
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        /// <summary>
        /// Lịch sử nạp tiền
        /// </summary>
        [HttpGet("LichSuNap")]
        public async Task<DataResponse<List<GiaoDichNapTienDto>>> GetLichSuNap([FromQuery] int? trangThai)
        {
            var response = new DataResponse<List<GiaoDichNapTienDto>>();
            try
            {
                var targetUserId = UserId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
                var list = await _viTienService.GetLichSuNapTien(targetUserId, trangThai);
                response.Data = list;
                response.Status = true;
                response.Message = "Lấy lịch sử nạp tiền thành công";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi lấy lịch sử nạp tiền");
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        /// <summary>
        /// Lịch sử thanh toán & biến động số dư
        /// </summary>
        [HttpGet("LichSuThanhToan")]
        public async Task<DataResponse<List<LichSuThanhToanDto>>> GetLichSuThanhToan()
        {
            var response = new DataResponse<List<LichSuThanhToanDto>>();
            try
            {
                var targetUserId = UserId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
                var list = await _viTienService.GetLichSuThanhToan(targetUserId);
                response.Data = list;
                response.Status = true;
                response.Message = "Lấy lịch sử thanh toán thành công";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi lấy lịch sử thanh toán");
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        /// <summary>
        /// Danh sách cấu hình khuyến mãi đang kích hoạt
        /// </summary>
        [HttpGet("KhuyenMai")]
        public async Task<DataResponse<List<Room_CauHinhKhuyenMaiNap>>> GetKhuyenMai()
        {
            var response = new DataResponse<List<Room_CauHinhKhuyenMaiNap>>();
            try
            {
                var list = await _viTienService.GetDanhSachKhuyenMai();
                response.Data = list;
                response.Status = true;
                response.Message = "Lấy danh sách khuyến mãi thành công";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi lấy danh sách khuyến mãi");
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        /// <summary>
        /// Thông tin tài khoản ngân hàng mặc định
        /// </summary>
        [HttpGet("ThongTinNganHang")]
        public async Task<DataResponse<Room_ThongTinNganHang?>> GetThongTinNganHang()
        {
            var response = new DataResponse<Room_ThongTinNganHang?>();
            try
            {
                var bank = await _viTienService.GetThongTinNganHangDefault();
                response.Data = bank;
                response.Status = true;
                response.Message = "Lấy thông tin tài khoản ngân hàng thành công";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi lấy thông tin ngân hàng");
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }
    }
}
