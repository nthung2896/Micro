import {
  THONG_KE_STT_COLUMN_WIDTH,
  THONG_KE_VUNG_DIA_PHUONG,
  formatDepartmentDisplayName,
} from "../ThongKeSoLuongTheoDiaPhuong/constants";

export { THONG_KE_STT_COLUMN_WIDTH, THONG_KE_VUNG_DIA_PHUONG, formatDepartmentDisplayName };

export type ThongKeXuLyPlatformKey =
  | "nenTangTrucTuyen"
  | "chungThucHopDongDienTu";

export type ThongKeXuLyMetricKey =
  | "tatCa"
  | "choDuyet"
  | "daDuyetDienTu"
  | "daXacNhan"
  | "deNghiChinhSua"
  | "biTuChoi"
  | "canBoSungThongTin"
  | "daChamDutDangKy"
  | "daHuyDangKy"
  | "deNghiChamDutDangKy"
  | "daKhoa"
  | "daYeuCauGiaHan"
  | "choGiaHan"
  | "dangXinYKien"
  | "daReview"
  | "khongHopLe"
  | "canBanGiay"
  | "quaHanDonVi";

export interface ThongKeNhomXuLyHoSo {
  tatCa: number;
  choDuyet: number;
  daDuyetDienTu: number;
  daXacNhan: number;
  deNghiChinhSua: number;
  biTuChoi: number;
  canBoSungThongTin: number;
  daChamDutDangKy: number;
  daHuyDangKy: number;
  deNghiChamDutDangKy: number;
  daKhoa: number;
  daYeuCauGiaHan: number;
  choGiaHan: number;
  dangXinYKien: number;
  daReview: number;
  khongHopLe: number;
  canBanGiay: number;
  quaHanDonVi: number;
}

export interface ThongKeXuLyHoSoTheoDiaPhuongRow {
  departmentId: string;
  departmentName: string;
  departmentCode?: string;
  nenTangTrucTuyen: ThongKeNhomXuLyHoSo;
  chungThucHopDongDienTu: ThongKeNhomXuLyHoSo;
}

export const THONG_KE_XULY_PLATFORM_GROUPS: {
  key: ThongKeXuLyPlatformKey;
  label: string;
}[] = [
  {
    key: "nenTangTrucTuyen",
    label: "Nền tảng TMĐT kinh doanh trực tiếp có đặt hàng trực tuyến",
  },
  {
    key: "chungThucHopDongDienTu",
    label: "Chứng thực hợp đồng điện tử",
  },
];

export const THONG_KE_XULY_METRIC_COLUMNS: {
  key: ThongKeXuLyMetricKey;
  label: string;
}[] = [
  { key: "tatCa", label: "Tất cả" },
  { key: "choDuyet", label: "Chờ duyệt" },
  { key: "daDuyetDienTu", label: "Đã duyệt điện tử" },
  { key: "daXacNhan", label: "Đã xác nhận" },
  { key: "deNghiChinhSua", label: "Đề nghị chỉnh sửa" },
  { key: "biTuChoi", label: "Bị từ chối" },
  { key: "canBoSungThongTin", label: "Cần bổ sung thông tin" },
  { key: "daChamDutDangKy", label: "Đã chấm dứt đăng ký" },
  { key: "daHuyDangKy", label: "Đã huỷ đăng ký" },
  { key: "deNghiChamDutDangKy", label: "Đề nghị chấm dứt đăng ký" },
  { key: "daKhoa", label: "Đã khoá" },
  { key: "daYeuCauGiaHan", label: "Đã yêu cầu gia hạn" },
  { key: "choGiaHan", label: "Chờ gia hạn" },
  { key: "dangXinYKien", label: "Đang xin ý kiến" },
  { key: "daReview", label: "Đã review" },
  { key: "khongHopLe", label: "Không hợp lệ" },
  { key: "canBanGiay", label: "Cần bản giấy" },
  { key: "quaHanDonVi", label: "Quá hạn xử lý của đơn vị" },
];

const EXCLUDED_METRICS_BY_PLATFORM: Record<
  ThongKeXuLyPlatformKey,
  ThongKeXuLyMetricKey[]
> = {
  nenTangTrucTuyen: ["daKhoa", "daYeuCauGiaHan", "choGiaHan"],
  chungThucHopDongDienTu: ["daYeuCauGiaHan", "choGiaHan"],
};

export function getMetricColumnsForPlatform(platformKey: ThongKeXuLyPlatformKey) {
  const excluded = new Set(EXCLUDED_METRICS_BY_PLATFORM[platformKey]);
  return THONG_KE_XULY_METRIC_COLUMNS.filter((column) => !excluded.has(column.key));
}

export const THONG_KE_XULY_TINH_COLUMN_WIDTH = 220;
export const THONG_KE_XULY_FIXED_LEFT_WIDTH =
  THONG_KE_STT_COLUMN_WIDTH + THONG_KE_XULY_TINH_COLUMN_WIDTH;
export const THONG_KE_XULY_METRIC_COLUMN_WIDTH = 72;
export const THONG_KE_XULY_TABLE_SCROLL_X =
  THONG_KE_XULY_FIXED_LEFT_WIDTH +
  THONG_KE_XULY_PLATFORM_GROUPS.reduce(
    (total, platform) =>
      total +
      getMetricColumnsForPlatform(platform.key).length *
        THONG_KE_XULY_METRIC_COLUMN_WIDTH,
    0,
  );

export const THONG_KE_XULY_GRAND_TOTAL_LABEL = "TỔNG CỘNG";

export type ThongKeXuLyGroupedTableRow =
  | ({ type: "total"; key: string } & ThongKeXuLyHoSoTheoDiaPhuongRow)
  | { type: "region"; key: string; regionName: string }
  | ({ type: "data"; key: string; stt: number } & ThongKeXuLyHoSoTheoDiaPhuongRow);

export function getMetricValue(
  row: ThongKeXuLyHoSoTheoDiaPhuongRow,
  platformKey: ThongKeXuLyPlatformKey,
  metricKey: ThongKeXuLyMetricKey,
): number {
  return row[platformKey]?.[metricKey] ?? 0;
}

export function getPlatformLabel(platformKey: ThongKeXuLyPlatformKey): string {
  return (
    THONG_KE_XULY_PLATFORM_GROUPS.find((item) => item.key === platformKey)?.label ??
    platformKey
  );
}

export function getMetricLabel(metricKey: ThongKeXuLyMetricKey): string {
  return (
    THONG_KE_XULY_METRIC_COLUMNS.find((item) => item.key === metricKey)?.label ??
    metricKey
  );
}

export function buildGroupedTableRows(
  rows: ThongKeXuLyHoSoTheoDiaPhuongRow[],
  grandTotal?: ThongKeXuLyHoSoTheoDiaPhuongRow | null,
): ThongKeXuLyGroupedTableRow[] {
  const codeMap = new Map(rows.map((row) => [row.departmentCode || "", row]));
  const usedIds = new Set<string>();
  const result: ThongKeXuLyGroupedTableRow[] = [];

  if (grandTotal && rows.length > 0) {
    result.push({
      type: "total",
      key: "grand-total",
      departmentId: grandTotal.departmentId || "__total__",
      departmentName: grandTotal.departmentName || THONG_KE_XULY_GRAND_TOTAL_LABEL,
      departmentCode: grandTotal.departmentCode,
      nenTangTrucTuyen: grandTotal.nenTangTrucTuyen,
      chungThucHopDongDienTu: grandTotal.chungThucHopDongDienTu,
    });
  }

  let stt = 0;

  THONG_KE_VUNG_DIA_PHUONG.forEach((region) => {
    const regionRows = region.departmentCodes
      .map((code) => codeMap.get(code))
      .filter(Boolean) as ThongKeXuLyHoSoTheoDiaPhuongRow[];

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
