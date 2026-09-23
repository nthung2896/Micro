import { createConstant } from "./Constant";

/**
 * Constants trạng thái phiếu cho Luồng đánh giá v2 (Đa cấp / Multi-Cap 5 cấp duyệt)
 */
const TrangThaiPhieuV2Constant = createConstant(
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
    GuiTruongPhong: { displayName: "Chờ Trưởng phòng duyệt", color: "blue" },
    GuiPhoCucTruong: { displayName: "Chờ Phó Cục trưởng duyệt", color: "purple" },
    GuiCucTruong: { displayName: "Chờ Cục trưởng duyệt", color: "magenta" },
    GuiPhoVuTruong: { displayName: "Chờ Phó Vụ trưởng duyệt", color: "cyan" },
    GuiVuTruong: { displayName: "Chờ Vụ trưởng duyệt", color: "purple" },
    GuiPhoGiamDocTT: { displayName: "Chờ Phó Giám đốc TT duyệt", color: "cyan" },
    GuiGiamDocTT: { displayName: "Chờ Giám đốc TT duyệt", color: "purple" },
    GuiPhoChanhVanPhong: { displayName: "Chờ Phó Chánh Văn phòng duyệt", color: "cyan" },
    GuiChanhVanPhong: { displayName: "Chờ Chánh Văn phòng duyệt", color: "purple" },
    DaDuyet: { displayName: "Đã duyệt hoàn thành", color: "success" },
    TraVe: { displayName: "Trả về yêu cầu chỉnh sửa", color: "warning" },
    TuChoi: { displayName: "Bị từ chối", color: "error" },
    ThuHoi: { displayName: "Thu hồi", color: "error" },
  }
);

export const LUONG_DUYET_V2 = {
  LuongChuyenVien: [
    TrangThaiPhieuV2Constant.KHOI_TAO,
    TrangThaiPhieuV2Constant.GUI_PHO_TRUONG_PHONG,
    TrangThaiPhieuV2Constant.GUI_TRUONG_PHONG,
    TrangThaiPhieuV2Constant.GUI_PHO_CUC_TRUONG,
    TrangThaiPhieuV2Constant.GUI_CUC_TRUONG,
    TrangThaiPhieuV2Constant.DA_DUYET,
  ],
  LuongPhoTruongPhong: [
    TrangThaiPhieuV2Constant.KHOI_TAO,
    TrangThaiPhieuV2Constant.GUI_TRUONG_PHONG,
    TrangThaiPhieuV2Constant.GUI_PHO_CUC_TRUONG,
    TrangThaiPhieuV2Constant.GUI_CUC_TRUONG,
    TrangThaiPhieuV2Constant.DA_DUYET,
  ],
  LuongTruongPhong: [
    TrangThaiPhieuV2Constant.KHOI_TAO,
    TrangThaiPhieuV2Constant.GUI_PHO_CUC_TRUONG,
    TrangThaiPhieuV2Constant.GUI_CUC_TRUONG,
    TrangThaiPhieuV2Constant.DA_DUYET,
  ],
  LuongPhoCucTruong: [
    TrangThaiPhieuV2Constant.KHOI_TAO,
    TrangThaiPhieuV2Constant.GUI_CUC_TRUONG,
    TrangThaiPhieuV2Constant.DA_DUYET,
  ],
};

export default TrangThaiPhieuV2Constant;
