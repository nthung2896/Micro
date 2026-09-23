export type ThongKeTheoThoiGianItemKey =
  | "nenTangTrucTuyen"
  | "datHangNuocNgoai"
  | "trungGianTrongNuoc"
  | "trungGianNuocNgoai"
  | "chungThucHopDongDienTu"
  | "rutTienKyQuy";

export type ThongKeTheoThoiGianIconKey =
  | "global"
  | "shopping"
  | "bank"
  | "cloud"
  | "fileProtect"
  | "wallet";

export interface ThongKeTheoThoiGianItemConfig {
  key: ThongKeTheoThoiGianItemKey;
  label: string;
  color: string;
  iconBg: string;
  iconKey: ThongKeTheoThoiGianIconKey;
}

export const THONG_KE_THEO_THOI_GIAN_ITEMS: ThongKeTheoThoiGianItemConfig[] = [
  {
    key: "nenTangTrucTuyen",
    label: "Nền tảng TMĐT kinh doanh trực tiếp có đặt hàng trực tuyến",
    color: "#0355a2",
    iconBg: "#e6f4ff",
    iconKey: "global",
  },
  {
    key: "datHangNuocNgoai",
    label: "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có đặt hàng trực tuyến",
    color: "#fa8c16",
    iconBg: "#fff7e6",
    iconKey: "shopping",
  },
  {
    key: "trungGianTrongNuoc",
    label: "Nền tảng TMĐT trung gian, mạng xã hội có hoạt động TMĐT, TMĐT tích hợp",
    color: "#722ed1",
    iconBg: "#f9f0ff",
    iconKey: "bank",
  },
  {
    key: "trungGianNuocNgoai",
    label: "Nền tảng TMĐT trung gian, mạng xã hội có hoạt động TMĐT, TMĐT tích hợp nước ngoài",
    color: "#f5222d",
    iconBg: "#fff1f0",
    iconKey: "cloud",
  },
  {
    key: "chungThucHopDongDienTu",
    label: "Chứng thực hợp đồng điện tử",
    color: "#faad14",
    iconBg: "#fffbe6",
    iconKey: "fileProtect",
  },
  {
    key: "rutTienKyQuy",
    label: "Rút tiền ký quỹ",
    color: "#52c41a",
    iconBg: "#f6ffed",
    iconKey: "wallet",
  },
];
