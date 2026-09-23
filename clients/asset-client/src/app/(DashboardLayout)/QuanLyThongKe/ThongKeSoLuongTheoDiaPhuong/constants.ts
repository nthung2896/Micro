export type ThongKeStatusKey =
  | "daDuyet"
  | "canBoSung"
  | "tuChoi"
  | "daChamDut"
  | "choDuyet";

export type ThongKePlatformKey =
  | "nenTangTrucTuyen"
  | "datHangNuocNgoai"
  | "trungGianTrongNuoc"
  | "trungGianNuocNgoai"
  | "chungThucHopDongDienTu";

export interface ThongKeNhomTrangThai {
  daDuyet: number;
  canBoSung: number;
  tuChoi: number;
  daChamDut: number;
  choDuyet: number;
}

export interface ThongKeSoLuongTheoDiaPhuongRow {
  departmentId: string;
  departmentName: string;
  departmentCode?: string;
  nenTangTrucTuyen: ThongKeNhomTrangThai;
  datHangNuocNgoai: ThongKeNhomTrangThai;
  trungGianTrongNuoc: ThongKeNhomTrangThai;
  trungGianNuocNgoai: ThongKeNhomTrangThai;
  chungThucHopDongDienTu: ThongKeNhomTrangThai;
}

export const THONG_KE_STATUS_COLUMNS: { key: ThongKeStatusKey; label: string }[] =
  [
    { key: "daDuyet", label: "Đã duyệt" },
    { key: "canBoSung", label: "Cần bổ sung" },
    { key: "tuChoi", label: "Từ chối" },
    { key: "daChamDut", label: "Đã chấm dứt" },
    { key: "choDuyet", label: "Chờ duyệt" },
  ];

export const THONG_KE_PLATFORM_GROUPS: { key: ThongKePlatformKey; label: string;
}[] = [
  { key: "nenTangTrucTuyen", label: "Nền tảng TMĐT kinh doanh trực tiếp có đặt hàng trực tuyến" },
  { key: "datHangNuocNgoai", label: "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có đặt hàng trực tuyến" },
  { key: "trungGianTrongNuoc", label: "Nền tảng TMĐT trung gian, mạng xã hội có hoạt động TMĐT, TMĐT tích hợp" },
  { key: "trungGianNuocNgoai", label: "Nền tảng TMĐT trung gian, mạng xã hội có hoạt động TMĐT, TMĐT tích hợp nước ngoài" },
  { key: "chungThucHopDongDienTu", label: "Chứng thực hợp đồng điện tử",},
];

/** Độ rộng mỗi cột trạng thái trong nhóm nền tảng (px) */
export const THONG_KE_STT_COLUMN_WIDTH = 60;
export const THONG_KE_TINH_COLUMN_WIDTH = 220;
export const THONG_KE_FIXED_LEFT_WIDTH =
  THONG_KE_STT_COLUMN_WIDTH + THONG_KE_TINH_COLUMN_WIDTH;
export const THONG_KE_STATUS_COLUMN_WIDTH = 72;
export const THONG_KE_TABLE_SCROLL_X =
  THONG_KE_STT_COLUMN_WIDTH +
  THONG_KE_TINH_COLUMN_WIDTH +
  THONG_KE_PLATFORM_GROUPS.length * THONG_KE_STATUS_COLUMNS.length * THONG_KE_STATUS_COLUMN_WIDTH;
export const THONG_KE_VUNG_DIA_PHUONG: { name: string; departmentCodes: string[] }[] = [
  {
    name: "Vùng Trung du và miền núi phía Bắc",
    departmentCodes: [
      "SCT_LS",
      "SCT_CB",
      "SCT_TN",
      "SCT_TQ",
      "SCT_PT",
      "SCT_LC",
      "SCT_SL",
      "SCT_LCH",
      "SCT_DB",
    ],
  },
  {
    name: "Vùng Đồng bằng sông Hồng",
    departmentCodes: [
      "SCT_HN",
      "SCT_HP",
      "SCT_QN",
      "SCT_BN",
      "SCT_HY",
      "SCT_NB",
    ],
  },
  {
    name: "Vùng Bắc Trung Bộ",
    departmentCodes: ["SCT_HUE", "SCT_TH", "SCT_NA", "SCT_HT", "SCT_QT"],
  },
  {
    name: "Vùng Duyên hải Nam Trung Bộ và Tây Nguyên",
    departmentCodes: [
      "SCT_DN",
      "SCT_QNG",
      "SCT_GL",
      "SCT_DLK",
      "SCT_KH",
      "SCT_LD",
    ],
  },
  {
    name: "Vùng Đông Nam Bộ",
    departmentCodes: ["SCT_HCM", "SCT_DNI", "SCT_TNI"],
  },
  {
    name: "Vùng Đồng bằng sông Cửu Long",
    departmentCodes: ["SCT_CT", "SCT_DT", "SCT_VL", "SCT_AG", "SCT_CM"],
  },
];

export const EMPTY_THONG_KE_NHOM: ThongKeNhomTrangThai = {
  daDuyet: 0,
  canBoSung: 0,
  tuChoi: 0,
  daChamDut: 0,
  choDuyet: 0,
};

export const TOTAL_DATA_COLUMNS = THONG_KE_PLATFORM_GROUPS.length * THONG_KE_STATUS_COLUMNS.length;
export const TOTAL_TABLE_COLUMNS = 2 + TOTAL_DATA_COLUMNS;

export const THONG_KE_GRAND_TOTAL_LABEL = "TỔNG CỘNG";

export type ThongKeGroupedTableRow =
  | ({ type: "total"; key: string } & ThongKeSoLuongTheoDiaPhuongRow)
  | { type: "region"; key: string; regionName: string }
  | ({ type: "data"; key: string; stt: number } & ThongKeSoLuongTheoDiaPhuongRow);

export function formatDepartmentDisplayName(name?: string): string {
  if (!name) return "";
  return name
    .replace(/^Sở Công Thương\s+/i, "")
    .replace(/^(?:thành phố|tỉnh)\s+/i, "")
    .trim();
}

export function buildGroupedTableRows(
  rows: ThongKeSoLuongTheoDiaPhuongRow[],
  grandTotal?: ThongKeSoLuongTheoDiaPhuongRow | null,
): ThongKeGroupedTableRow[] {
  const codeMap = new Map(rows.map((row) => [row.departmentCode || "", row]));
  const usedIds = new Set<string>();
  const result: ThongKeGroupedTableRow[] = [];

  if (grandTotal && rows.length > 0) {
    result.push({
      type: "total",
      key: "grand-total",
      departmentId: grandTotal.departmentId || "__total__",
      departmentName: grandTotal.departmentName || THONG_KE_GRAND_TOTAL_LABEL,
      departmentCode: grandTotal.departmentCode,
      nenTangTrucTuyen: grandTotal.nenTangTrucTuyen,
      datHangNuocNgoai: grandTotal.datHangNuocNgoai,
      trungGianTrongNuoc: grandTotal.trungGianTrongNuoc,
      trungGianNuocNgoai: grandTotal.trungGianNuocNgoai,
      chungThucHopDongDienTu: grandTotal.chungThucHopDongDienTu,
    });
  }

  let stt = 0;

  THONG_KE_VUNG_DIA_PHUONG.forEach((region) => {
    const regionRows = region.departmentCodes
      .map((code) => codeMap.get(code))
      .filter(Boolean) as ThongKeSoLuongTheoDiaPhuongRow[];

    if (regionRows.length === 0) {
      return;
    }

    result.push({
      type: "region",
      key: `region-${region.name}`,
      regionName: region.name,
    });

    regionRows.forEach((row) => {
      stt += 1;
      usedIds.add(row.departmentId);
      result.push({
        type: "data",
        key: row.departmentId,
        stt,
        ...row,
      });
    });
  });

  const remainingRows = rows
    .filter((row) => !usedIds.has(row.departmentId))
    .sort((a, b) => a.departmentName.localeCompare(b.departmentName, "vi"));

  if (remainingRows.length > 0) {
    result.push({
      type: "region",
      key: "region-khac",
      regionName: "Khác",
    });

    remainingRows.forEach((row) => {
      stt += 1;
      result.push({
        type: "data",
        key: row.departmentId,
        stt,
        ...row,
      });
    });
  }

  return result;
}

export function getStatusValue(row: ThongKeSoLuongTheoDiaPhuongRow, platformKey: ThongKePlatformKey, statusKey: ThongKeStatusKey,
): number {
  return row[platformKey]?.[statusKey] ?? 0;
}

export function getPlatformLabel(platformKey: ThongKePlatformKey): string {
  return (
    THONG_KE_PLATFORM_GROUPS.find((item) => item.key === platformKey)?.label ??
    platformKey
  );
}

export function getStatusLabel(statusKey: ThongKeStatusKey): string {
  return (
    THONG_KE_STATUS_COLUMNS.find((item) => item.key === statusKey)?.label ??
    statusKey
  );
}
