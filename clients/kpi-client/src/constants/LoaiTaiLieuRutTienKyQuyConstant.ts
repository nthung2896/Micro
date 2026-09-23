import { createConstant } from "./Constant";

// Mã loại tài liệu đính kèm cho hồ sơ Rút tiền ký quỹ (RutTienKyQuy).
// Tham chiếu spec: Documents/Hệ thống online_2.docx — section 5.
// Spec liệt kê 2 loại:
//   - Đơn đề nghị
//   - Văn bản, tài liệu kèm theo
const LoaiTaiLieuRutTienKyQuyConstant = createConstant(
  {
    DonDeNghi:     "DonDeNghi",
    VanBanKemTheo: "VanBanKemTheo",
  } as const,
  {
    DonDeNghi:     { displayName: "Đơn đề nghị" },
    VanBanKemTheo: { displayName: "Văn bản, tài liệu kèm theo" },
  }
);

export default LoaiTaiLieuRutTienKyQuyConstant;
