// Danh mục tài liệu đính kèm yêu cầu khi đăng ký hồ sơ Nền tảng TMĐT.
// Tham chiếu: Documents/Hệ thống online.docx — section "Tài liệu đính kèm".
//
// Theo spec: cả 4 PlatformManageType (NTThongBaoKD / NTDangKyKDNuocNgoai /
// NTTichHop / NTTichHopNuocNgoai) dùng cùng 6 tài liệu chuẩn.
// Khi nghiệp vụ mở rộng → tách catalog riêng cho từng loại + thêm code vào
// LoaiTaiLieuPlatformConstant.

import LoaiTaiLieuPlatformConstant from "./LoaiTaiLieuPlatformConstant";
import LoaiTaiLieuContractConstant from "./LoaiTaiLieuContractConstant";
import PlatformManageTypeConstant from "./PlatformManageTypeConstant";

export interface PlatformDocument {
  code: string;        // → TaiLieuDinhKem.LoaiTaiLieu
  label: string;
  required: boolean;
  order: number;
  accept?: string;
  maxMB?: number;
}

// Helper: build entry từ code, tự lấy label từ Constant.
const platDoc = (code: string, order: number, required = true): PlatformDocument => ({
  code,
  label: LoaiTaiLieuPlatformConstant.getDisplayName(code) as string,
  required,
  order,
});

const contractDoc = (code: string, order: number, required = true): PlatformDocument => ({
  code,
  label: LoaiTaiLieuContractConstant.getDisplayName(code) as string,
  required,
  order,
});

// Danh mục tài liệu cụ thể của từng loại hình nền tảng.
const NTThongBaoKD_DOCS: PlatformDocument[] = [
  platDoc(LoaiTaiLieuPlatformConstant.ChinhSachBaoMat, 1, false),
  platDoc(LoaiTaiLieuPlatformConstant.PhuongThucTiepNhan, 2, false),
  platDoc(LoaiTaiLieuPlatformConstant.ChinhSachGia, 3, false),
  platDoc(LoaiTaiLieuPlatformConstant.ChinhSachThanhToan, 4, false),
  platDoc(LoaiTaiLieuPlatformConstant.DieuKienCungCapHangHoaDichVu, 5, false),
  platDoc(LoaiTaiLieuPlatformConstant.ChinhSachGiaoHang, 6, false),
  platDoc(LoaiTaiLieuPlatformConstant.HinhThucHoTroTrucTuyen, 7, false),
];

const NTDangKyKDNuocNgoai_DOCS: PlatformDocument[] = [
  platDoc(LoaiTaiLieuPlatformConstant.ChinhSachBaoMat, 1, true),
  platDoc(LoaiTaiLieuPlatformConstant.PhuongThucTiepNhan, 2, true),
  platDoc(LoaiTaiLieuPlatformConstant.ChinhSachGia, 3, true),
  platDoc(LoaiTaiLieuPlatformConstant.ChinhSachThanhToan, 4, true),
  platDoc(LoaiTaiLieuPlatformConstant.DieuKienCungCapHangHoaDichVu, 5, false),
  platDoc(LoaiTaiLieuPlatformConstant.ChinhSachGiaoHang, 6, true),
  platDoc(LoaiTaiLieuPlatformConstant.HinhThucHoTroTrucTuyen, 7, true),
];

const NTTichHop_DOCS: PlatformDocument[] = [
  platDoc(LoaiTaiLieuPlatformConstant.ToKhaiThongTinMauSo02, 1, true),
  platDoc(LoaiTaiLieuPlatformConstant.BanChupGiayPhep, 2, true),
  platDoc(LoaiTaiLieuPlatformConstant.DeAnHoatDongTMDT, 3, true),
  platDoc(LoaiTaiLieuPlatformConstant.QuyCheHoatDongLivestream, 4, true),
  platDoc(LoaiTaiLieuPlatformConstant.MauHopDongThoaThuan, 5, false),
  platDoc(LoaiTaiLieuPlatformConstant.Khac, 6, false),
];

const NTTichHopNuocNgoai_DOCS: PlatformDocument[] = [
  platDoc(LoaiTaiLieuPlatformConstant.ToKhaiThongTinMauSo02, 1, true),
  platDoc(LoaiTaiLieuPlatformConstant.BanChupGiayPhep, 2, true),
  platDoc(LoaiTaiLieuPlatformConstant.DeAnHoatDongTMDT, 3, true),
  platDoc(LoaiTaiLieuPlatformConstant.QuyCheHoatDongLivestream, 4, true),
  platDoc(LoaiTaiLieuPlatformConstant.MauHopDongThoaThuan, 5, false),
  platDoc(LoaiTaiLieuPlatformConstant.Khac, 6, false),
];

export const PLATFORM_DOC_CATALOG: Record<string, PlatformDocument[]> = {
  [PlatformManageTypeConstant.NTThongBaoKD]: NTThongBaoKD_DOCS,
  [PlatformManageTypeConstant.NTDangKyKDNuocNgoai]: NTDangKyKDNuocNgoai_DOCS,
  [PlatformManageTypeConstant.NTTichHop]: NTTichHop_DOCS,
  [PlatformManageTypeConstant.NTTichHopNuocNgoai]: NTTichHopNuocNgoai_DOCS,
};

// Danh mục cho Hợp đồng chứng thực (AuthenticationContract).
export const CONTRACT_DOC_CATALOG: PlatformDocument[] = [
  contractDoc(LoaiTaiLieuContractConstant.ChungMinhTenMien, 1),
];

export const getPlatformDocs = (platformType?: string): PlatformDocument[] => {
  if (!platformType) return [];
  const list = PLATFORM_DOC_CATALOG[platformType] ?? [];
  return [...list].sort((a, b) => a.order - b.order);
};
