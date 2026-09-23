import { ThongKePhanAnhVaViPhamDto } from "@/types/quanLyThongKe/dto";
import {
  THONG_KE_GRAND_TOTAL_LABEL,
  THONG_KE_VUNG_DIA_PHUONG,
} from "../ThongKeSoLuongTheoDiaPhuong/constants";

export {
  THONG_KE_GRAND_TOTAL_LABEL,
  THONG_KE_STT_COLUMN_WIDTH,
  formatDepartmentDisplayName,
} from "../ThongKeSoLuongTheoDiaPhuong/constants";

export const METRIC_COLUMN_WIDTH = 110;
export const FIXED_LEFT_WIDTH = 60 + 220;
export const TABLE_SCROLL_X = FIXED_LEFT_WIDTH + 5 * METRIC_COLUMN_WIDTH + 2 * METRIC_COLUMN_WIDTH;
export const TABLE_BODY_HEIGHT = 640;

export type ThongKePhanAnhVaViPhamMetricKey =
  | "xacMinhDung"
  | "xacMinhSai"
  | "taoThanhVuViec"
  | "vuViecDung"
  | "vuViecSai"
  | "daDangKy"
  | "chuaDangKy";

export const THONG_KE_PHAN_ANH_METRIC_COLUMNS: { key: ThongKePhanAnhVaViPhamMetricKey; label: string }[] = [
  { key: "xacMinhDung", label: "Xác minh đúng" },
  { key: "xacMinhSai", label: "Xác minh sai" },
  { key: "taoThanhVuViec", label: "Tạo thành vụ việc" },
  { key: "vuViecDung", label: "Số vụ việc đúng" },
  { key: "vuViecSai", label: "Số vụ việc sai" },
];

export const THONG_KE_VI_PHAM_METRIC_COLUMNS: { key: ThongKePhanAnhVaViPhamMetricKey; label: string }[] = [
  { key: "daDangKy", label: "Xác định vi phạm đã đăng ký" },
  { key: "chuaDangKy", label: "Xác định vi phạm chưa đăng ký" },
];

export type ThongKePhanAnhVaViPhamGroupedRow =
  | ({ type: "total"; key: string } & ThongKePhanAnhVaViPhamDto)
  | { type: "region"; key: string; regionName: string }
  | ({ type: "data"; key: string; stt: number } & ThongKePhanAnhVaViPhamDto);

export function getMetricValue(
  row: ThongKePhanAnhVaViPhamDto,
  metricKey: ThongKePhanAnhVaViPhamMetricKey,
): number {
  switch (metricKey) {
    case "xacMinhDung":
      return row.phanAnh?.xacMinhDung ?? 0;
    case "xacMinhSai":
      return row.phanAnh?.xacMinhSai ?? 0;
    case "taoThanhVuViec":
      return row.phanAnh?.taoThanhVuViec ?? 0;
    case "vuViecDung":
      return row.phanAnh?.vuViecDung ?? 0;
    case "vuViecSai":
      return row.phanAnh?.vuViecSai ?? 0;
    case "daDangKy":
      return row.viPham?.daDangKy ?? 0;
    case "chuaDangKy":
      return row.viPham?.chuaDangKy ?? 0;
    default:
      return 0;
  }
}

export function getMetricLabel(metricKey: ThongKePhanAnhVaViPhamMetricKey): string {
  const all = [...THONG_KE_PHAN_ANH_METRIC_COLUMNS, ...THONG_KE_VI_PHAM_METRIC_COLUMNS];
  return all.find((item) => item.key === metricKey)?.label ?? metricKey;
}

export function isViPhamMetric(metricKey: ThongKePhanAnhVaViPhamMetricKey): boolean {
  return metricKey === "daDangKy" || metricKey === "chuaDangKy";
}

export function buildGroupedTableRows(
  rows: ThongKePhanAnhVaViPhamDto[],
  grandTotal?: ThongKePhanAnhVaViPhamDto | null,
): ThongKePhanAnhVaViPhamGroupedRow[] {
  const codeMap = new Map(rows.map((row) => [row.departmentCode || "", row]));
  const usedIds = new Set<string>();
  const result: ThongKePhanAnhVaViPhamGroupedRow[] = [];

  if (grandTotal && rows.length > 0) {
    result.push({
      type: "total",
      key: "grand-total",
      departmentId: grandTotal.departmentId || "__total__",
      departmentName: grandTotal.departmentName || THONG_KE_GRAND_TOTAL_LABEL,
      departmentCode: grandTotal.departmentCode,
      phanAnh: grandTotal.phanAnh,
      viPham: grandTotal.viPham,
    });
  }

  let stt = 0;

  THONG_KE_VUNG_DIA_PHUONG.forEach((region) => {
    const regionRows = region.departmentCodes
      .map((code) => codeMap.get(code))
      .filter(Boolean) as ThongKePhanAnhVaViPhamDto[];

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
