import { createConstant } from "./Constant";

/**
 * Constants trạng thái phiếu cho Luồng đánh giá v1 (Đơn cấp / Truyền thống: Cấp dưới gửi lên cấp trên 1 cấp -> Cấp trên duyệt là Đã duyệt)
 */
const TrangThaiPhieuConstant = createConstant(
  {
    KHOI_TAO: "KhoiTao",
    GUI_PHO_TRUONG_PHONG: "GuiPhoTruongPhong",
    GUI_TRUONG_PHONG: "GuiTruongPhong",
    GUI_PHO_CUC_TRUONG: "GuiPhoCucTruong",
    GUI_CUC_TRUONG: "GuiCucTruong",
    GUI_PHO_VU_TRUONG: "GuiPhoVuTruong",
    GUI_VU_TRUONG: "GuiVuTruong",
    GUI_PHO_GIAM_DOC_TT: "GuiPhoGiamDocTT",
    GUI_GIAM_DOC_TT: "GuiGiamDocTT",
    GUI_PHO_CHANH_VAN_PHONG: "GuiPhoChanhVanPhong",
    GUI_CHANH_VAN_PHONG: "GuiChanhVanPhong",
    DA_DUYET: "DaDuyet",
    TRA_VE: "TraVe",
    TU_CHOI: "TuChoi",
    THU_HOI: "ThuHoi",
  } as const,
  {
    KhoiTao: { displayName: "Khởi tạo", color: "default" },
    GuiPhoTruongPhong: { displayName: "Chờ Phó Trưởng phòng duyệt", color: "cyan" },
    GuiTruongPhong: { displayName: "Chờ Trưởng phòng duyệt", color: "processing" },
    GuiPhoCucTruong: { displayName: "Chờ Phó Cục trưởng duyệt", color: "purple" },
    GuiCucTruong: { displayName: "Chờ Cục trưởng duyệt", color: "magenta" },
    GuiPhoVuTruong: { displayName: "Chờ Phó Vụ trưởng duyệt", color: "cyan" },
    GuiVuTruong: { displayName: "Chờ Vụ trưởng duyệt", color: "purple" },
    GuiPhoGiamDocTT: { displayName: "Chờ Phó Giám đốc TT duyệt", color: "cyan" },
    GuiGiamDocTT: { displayName: "Chờ Giám đốc TT duyệt", color: "purple" },
    GuiPhoChanhVanPhong: { displayName: "Chờ Phó Chánh Văn phòng duyệt", color: "cyan" },
    GuiChanhVanPhong: { displayName: "Chờ Chánh Văn phòng duyệt", color: "purple" },
    DaDuyet: { displayName: "Đã duyệt", color: "success" },
    TraVe: { displayName: "Trả về yêu cầu chỉnh sửa", color: "warning" },
    TuChoi: { displayName: "Từ chối", color: "error" },
    ThuHoi: { displayName: "Thu hồi", color: "error" },
  }
);

/**
 * Cấu hình bước duyệt 1 cấp của Luồng v1
 */
export const LUONG_DUYET_V1 = {
  LuongChuyenVien: [
    TrangThaiPhieuConstant.KHOI_TAO,
    TrangThaiPhieuConstant.GUI_PHO_TRUONG_PHONG,
    TrangThaiPhieuConstant.DA_DUYET,
  ],
  LuongPhoTruongPhong: [
    TrangThaiPhieuConstant.KHOI_TAO,
    TrangThaiPhieuConstant.GUI_TRUONG_PHONG,
    TrangThaiPhieuConstant.DA_DUYET,
  ],
  LuongTruongPhong: [
    TrangThaiPhieuConstant.KHOI_TAO,
    TrangThaiPhieuConstant.GUI_PHO_CUC_TRUONG,
    TrangThaiPhieuConstant.DA_DUYET,
  ],
  LuongPhoCucTruong: [
    TrangThaiPhieuConstant.KHOI_TAO,
    TrangThaiPhieuConstant.GUI_CUC_TRUONG,
    TrangThaiPhieuConstant.DA_DUYET,
  ],
};

export default TrangThaiPhieuConstant;
