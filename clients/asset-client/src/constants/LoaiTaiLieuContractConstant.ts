import { createConstant } from "./Constant";

// Mã loại tài liệu đính kèm áp dụng cho Hợp đồng Chứng thực (AuthenticationContract).
// Tham chiếu spec: Documents/Hệ thống online.docx — section "Chứng thực hợp đồng điện tử".
const LoaiTaiLieuContractConstant = createConstant(
  {
    ChungMinhTenMien: "ChungMinhTenMien",
    DangKyChungThuc: "DangKyChungThuc",
    HuongDanDichVu: "HuongDanDichVu",
  } as const,
  {
    ChungMinhTenMien: { displayName: "Tài liệu chứng minh sở hữu tên miền" },
    DangKyChungThuc: { displayName: "Tài liệu đăng ký chứng thực" },
    HuongDanDichVu: { displayName: "Tài liệu hướng dẫn dịch vụ" },
  }
);

export default LoaiTaiLieuContractConstant;
