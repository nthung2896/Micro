import { createConstant } from "./Constant";

/**
 * Constants các vai trò đánh giá chi tiết trong Luồng v2 (Multi-Role / Multi-Cap)
 */
const VaiTroDanhGiaV2Constant = createConstant(
  {
    CA_NHAN: "CaNhan",
    PHO_TRUONG_PHONG: "PhoTruongPhong",
    TRUONG_PHONG: "TruongPhong",
    PHO_CUC_TRUONG: "PhoCucTruong",
    CUC_TRUONG: "CucTruong",
    PHO_VU_TRUONG: "PhoVuTruong",
    VU_TRUONG: "VuTruong",
  } as const,
  {
    CaNhan: { displayName: "Cá nhân tự đánh giá", color: "#2563eb" },
    PhoTruongPhong: { displayName: "Phó Trưởng phòng đánh giá", color: "#0891b2" },
    TruongPhong: { displayName: "Trưởng phòng đánh giá", color: "#059669" },
    PhoCucTruong: { displayName: "Phó Cục trưởng đánh giá", color: "#7c3aed" },
    CucTruong: { displayName: "Cục trưởng đánh giá", color: "#c026d3" },
    PhoVuTruong: { displayName: "Phó Vụ trưởng đánh giá", color: "#0891b2" },
    VuTruong: { displayName: "Vụ trưởng đánh giá", color: "#0f766e" },
  }
);

export const VAI_TRO_ORDER_V2 = [
  { code: VaiTroDanhGiaV2Constant.CA_NHAN, label: "Cá nhân tự đánh giá", shortLabel: "Cá nhân", color: "#2563eb", index: 1 },
  { code: VaiTroDanhGiaV2Constant.PHO_TRUONG_PHONG, label: "Phó Trưởng phòng đánh giá", shortLabel: "Phó phòng", color: "#0891b2", index: 2 },
  { code: VaiTroDanhGiaV2Constant.TRUONG_PHONG, label: "Trưởng phòng đánh giá", shortLabel: "Trưởng phòng", color: "#059669", index: 3 },
  { code: VaiTroDanhGiaV2Constant.PHO_CUC_TRUONG, label: "Phó Cục trưởng đánh giá", shortLabel: "Phó Cục trưởng", color: "#7c3aed", index: 4 },
  { code: VaiTroDanhGiaV2Constant.CUC_TRUONG, label: "Cục trưởng đánh giá", shortLabel: "Cục trưởng", color: "#c026d3", index: 5 },
  { code: VaiTroDanhGiaV2Constant.PHO_VU_TRUONG, label: "Phó Vụ trưởng đánh giá", shortLabel: "Phó Vụ trưởng", color: "#0891b2", index: 2 },
  { code: VaiTroDanhGiaV2Constant.VU_TRUONG, label: "Vụ trưởng đánh giá", shortLabel: "Vụ trưởng", color: "#0f766e", index: 3 },
];

export default VaiTroDanhGiaV2Constant;
