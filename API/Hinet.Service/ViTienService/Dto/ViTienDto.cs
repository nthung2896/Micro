using System;
using Hinet.Model.Entities;

namespace Hinet.Service.ViTienService.Dto
{
    public class ViTienDto : Room_ViTien
    {
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string TenHangThanhVien => HangThanhVien switch
        {
            2 => "Thành viên Bạc",
            3 => "Thành viên Vàng",
            4 => "Thành viên Kim Cương",
            _ => "Thành viên Mới"
        };
    }

    public class TaoYeuCauNapRequest
    {
        public decimal SoTienNap { get; set; }
        public string PhuongThuc { get; set; } = "VIETQR"; // VIETQR, MOMO, VNPAY, BANK_TRANSFER
        public string? GhiChu { get; set; }
    }

    public class GiaoDichNapTienDto : Room_GiaoDichNapTien
    {
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? QrCodeUrl { get; set; }
        public string TenTrangThai => TrangThai switch
        {
            1 => "Thành công",
            2 => "Thất bại",
            3 => "Đã hủy",
            _ => "Chờ thanh toán"
        };
        public string TenPhuongThuc => PhuongThuc switch
        {
            "MOMO" => "Ví MoMo",
            "VNPAY" => "Cổng VNPAY / Thẻ ATM",
            "BANK_TRANSFER" => "Chuyển khoản trực tiếp",
            _ => "Quét mã VietQR"
        };
    }

    public class LichSuThanhToanDto : Room_LichSuThanhToan
    {
        public string? UserName { get; set; }
        public decimal SoDuSauTong => SoDuChinhSau + SoDuKmSau;
        public string TenLoaiGiaoDich => LoaiGiaoDich switch
        {
            1 => "Nạp tiền",
            2 => "Thưởng khuyến mãi",
            3 => "Thanh toán dịch vụ",
            4 => "Hoàn tiền",
            5 => "Điều chỉnh số dư",
            _ => "Giao dịch khác"
        };
        public string? TenLoaiDichVu => LoaiDichVu switch
        {
            1 => "Nâng cấp tin VIP",
            2 => "Đẩy tin lên Top",
            3 => "Gia hạn thời hạn tin",
            4 => "Đăng tin mới",
            5 => "Gắn nhãn nổi bật",
            _ => null
        };
    }

    public class ThanhToanDichVuRequest
    {
        public Guid PhongTroId { get; set; }
        /// <summary>
        /// 1: Nâng VIP, 2: Đẩy tin, 3: Gia hạn ngày, 4: Đăng tin
        /// </summary>
        public int LoaiDichVu { get; set; }
        public decimal SoTien { get; set; }
        public int? SoNgay { get; set; }
        public int? GoiTin { get; set; }
        public string? MoTa { get; set; }
    }

    public class KetQuaThanhToanDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal SoDuConLai { get; set; }
        public string? MaGiaoDich { get; set; }
    }
}
