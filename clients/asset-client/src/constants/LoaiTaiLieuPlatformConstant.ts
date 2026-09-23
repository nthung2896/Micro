import { createConstant } from "./Constant";

// Mã loại tài liệu đính kèm áp dụng cho Nền tảng TMĐT (PlatformManageType).
// Tham chiếu spec: Documents/Hệ thống online.docx — section "Tài liệu đính kèm".
//
// Code dùng PascalCase tiếng Việt unaccented (folder/URL safe) — đồng nhất
// với style của PlatformManageTypeConstant (NTThongBaoKD, ...).
// Giá trị code được lưu vào TaiLieuDinhKem.LoaiTaiLieu.
const LoaiTaiLieuPlatformConstant = createConstant(
  {
    ChuSoHuuWebsite: "ChuSoHuuWebsite",
    HangHoaDichVu: "HangHoaDichVu",
    ThongTinGia: "ThongTinGia",
    DieuKienGiaoDichChung: "DieuKienGiaoDichChung",
    ChinhSachBaoMat: "ChinhSachBaoMat",
    SoHuuTenMien: "SoHuuTenMien",
    PlatformLogo: "PlatformLogo",
    PlatformImagePath: "PlatformImagePath",
    PlatformSeal: "PlatformSeal",
    OrganizationFileDangKyUyQuyen: "OrganizationFileDangKyUyQuyen",
    PhuongThucTiepNhan: "PhuongThucTiepNhan",
    ChinhSachGia: "ChinhSachGia",
    ChinhSachThanhToan: "ChinhSachThanhToan",
    ChinhSachGiaoHang: "ChinhSachGiaoHang",
    HinhThucHoTroTrucTuyen: "HinhThucHoTroTrucTuyen",
    DieuKienCungCapHangHoaDichVu: "DieuKienCungCapHangHoaDichVu",
    ToKhaiThongTinMauSo02: "ToKhaiThongTinMauSo02",
    BanChupGiayPhep: "BanChupGiayPhep",
    DeAnHoatDongTMDT: "DeAnHoatDongTMDT",
    QuyCheHoatDongLivestream: "QuyCheHoatDongLivestream",
    MauHopDongThoaThuan: "MauHopDongThoaThuan",
    Khac: "Khac",
  } as const,
  {
    ChuSoHuuWebsite: { displayName: "Bản chụp thông tin về người sở hữu website" },
    HangHoaDichVu: { displayName: "Bản chụp thông tin về hàng hoá, dịch vụ" },
    ThongTinGia: { displayName: "Bản chụp thông tin về giá" },
    DieuKienGiaoDichChung: { displayName: "Bản chụp thông tin về điều kiện giao dịch chung" },
    ChinhSachBaoMat: { displayName: "Chính sách bảo mật" },
    SoHuuTenMien: { displayName: "Tài liệu chứng minh sở hữu tên miền" },
    PlatformLogo: { displayName: "Logo website" },
    PlatformImagePath: { displayName: "Logo nền tảng" },
    PlatformSeal: { displayName: "Biểu tượng ứng dụng" },
    OrganizationFileDangKyUyQuyen: { displayName: "Ảnh đăng ký doanh nghiệp" },
    PhuongThucTiepNhan: { displayName: "Phương thức tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại" },
    ChinhSachGia: { displayName: "Chính sách giá" },
    ChinhSachThanhToan: { displayName: "Chính sách về thanh toán" },
    ChinhSachGiaoHang: { displayName: "Chính sách giao hàng, đổi trả và hoàn tiền (áp dụng cho hàng hóa) hoặc phương thức cung cấp dịch vụ, chính sách chấm dứt dịch vụ và hoàn tiền (áp dụng cho dịch vụ)" },
    HinhThucHoTroTrucTuyen: { displayName: "Hình thức hỗ trợ trực tuyến" },
    DieuKienCungCapHangHoaDichVu: { displayName: "Các điều kiện hoặc hạn chế trong việc cung cấp hàng hóa hoặc dịch vụ trên nền tảng" },
    ToKhaiThongTinMauSo02: { displayName: "Tờ khai thông tin theo Mẫu số 02 tại Phụ lục II của Nghị định này" },
    BanChupGiayPhep: { displayName: "Bản chụp giấy phép, giấy chứng nhận, chứng chỉ, văn bản xác nhận, chấp thuận của cơ quan có thẩm quyền hoặc các văn bản tương tự khác khi kinh doanh hàng hóa, dịch vụ thuộc Danh mục ngành, nghề đầu tư kinh doanh có điều kiện theo quy định của pháp luật về đầu tư. Trường hợp các giấy tờ, tài liệu nêu trên đã có dữ liệu điện tử bảo đảm giá trị pháp lý và có thể khai thác thông qua kết nối, chia sẻ giữa Hệ thống thông tin giải quyết thủ tục hành chính với các cơ sở dữ liệu quốc gia, cơ sở dữ liệu chuyên ngành, hệ thống thông tin dùng chung, Cổng dịch vụ công quốc gia thì không phải cung cấp lại" },
    DeAnHoatDongTMDT: { displayName: "Đề án hoạt động thương mại điện tử theo nội dung quy định tại Điều 30 của Nghị định này. Mẫu Đề án theo Mẫu số 05 tại Phụ lục II của Nghị định này" },
    QuyCheHoatDongLivestream: { displayName: "Quy chế hoạt động livestream bán hàng trong trường hợp nền tảng có hoạt động livestream bán hàng" },
    MauHopDongThoaThuan: { displayName: "Mẫu hợp đồng, thỏa thuận giữa người bán với chủ quản nền tảng" },
    Khac: { displayName: "Tài liệu khác" },
  }
);

export default LoaiTaiLieuPlatformConstant;
