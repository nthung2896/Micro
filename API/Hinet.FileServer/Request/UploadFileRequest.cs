using Hinet.FileServer.Configuration;

namespace Hinet.FileServer.Request
{
    public class UploadFileRequest
    {
        public IFormFileCollection? Files { get; set; }

        // ===== Cấu trúc lưu file theo spec "Hệ thống online" =====
        // Bắt buộc: 1 trong FileCategoryConstant (platform/contract/company/avatar/general).
        public string Category { get; set; } = FileCategoryConstant.General;

        // Phân loại chi tiết theo Category:
        //  - platform → PlatformManageType (NTThongBaoKD / NTDangKyKDNuocNgoai / NTTichHop / NTTichHopNuocNgoai)
        //  - contract → builder tự gắn "AuthenticationContract"
        //  - company  → DKKD / UyQuyen / KhacDangKy
        public string? SubCategory { get; set; }

        // Mã số thuế DN chủ quản (bắt buộc với platform/contract/company).
        public string? TaxCode { get; set; }

        // Id hồ sơ (platform=platformId, contract=contractId, avatar=userId).
        public Guid? ItemId { get; set; }

        // Mã loại tài liệu cụ thể trong cùng 1 itemId — phân biệt nhiều file cho cùng hồ sơ.
        // Vd: 1 platformId có thể có nhiều file PLATFORM_OWNER, PLATFORM_PRODUCTS, PLATFORM_PRICE...
        // Nếu null thì fallback về SubCategory ?? Category (behavior cũ).
        public string? LoaiTaiLieu { get; set; }

        // ===== Tuỳ chọn xử lý chữ ký số =====
        public string? SerialNumber { get; set; }
        public bool RequiredKySo { get; set; } = false;
        public bool IncludeExportInfo { get; set; } = false;

        // ===== Backward compatibility =====
        // Field cũ — vẫn nhận từ client cũ.
        public string? FileType { get; set; }
    }
}
