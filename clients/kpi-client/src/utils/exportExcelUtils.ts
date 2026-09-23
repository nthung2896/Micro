// `xlsx-js-style` is compatible with SheetJS' API and, unlike `xlsx`, keeps
// cell styles when the workbook is written.
import * as XLSX from "xlsx-js-style";
import { toast } from "react-toastify";

// ============================================
// HELPER: Trích xuất text thuần từ ReactNode
// (Hỗ trợ JSX như <Tag>, <span>, <div>, v.v. từ render() của Antd)
// ============================================
export function extractTextFromReactNode(node: any): string {
  // null, undefined, boolean → bỏ qua
  if (node == null || typeof node === "boolean") return "";

  // String hoặc Number → trả về trực tiếp
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);

  // Array → đệ quy từng phần tử
  if (Array.isArray(node)) {
    return node
      .map(extractTextFromReactNode)
      .filter(Boolean)
      .join(" ");
  }

  // React element (có props.children) → đệ quy children
  if (typeof node === "object" && node !== null) {
    if (node.props) {
      const typeName =
        typeof node.type === "string"
          ? node.type
          : node.type?.displayName || node.type?.name || "";

      // Bỏ qua các component nút bấm, dropdown, tooltip không chứa text dữ liệu
      const skipComponents = ["Button", "Dropdown", "Switch", "Tooltip", "Space"];
      if (skipComponents.includes(typeName)) {
        return "";
      }

      return extractTextFromReactNode(node.props.children);
    }
  }

  return "";
}

function getValueByDataIndex(record: any, dataIndex?: string | string[]): any {
  if (!dataIndex) return undefined;
  if (typeof dataIndex === "string") return record?.[dataIndex];
  if (Array.isArray(dataIndex)) {
    let value = record;
    for (const key of dataIndex) {
      value = value?.[key];
    }
    return value;
  }
  return undefined;
}

function extractCellValue(rendered: any): string | number {
  if (rendered == null) return "";
  if (typeof rendered === "string") return rendered;
  if (typeof rendered === "number") return rendered;
  if (typeof rendered === "boolean") return rendered ? "Có" : "Không";

  const text = extractTextFromReactNode(rendered);
  return text.trim();
}

function formatRawValue(value: any): string | number {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (value instanceof Date) {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// ============================================
// TYPES
// ============================================
export interface ExportExcelProps {
  /** Hàm gọi API để lấy dữ liệu. Ví dụ: kPI_LyLich2CService.getData */
  fetchDataFn: (params: any) => Promise<any>;
  /** Dữ liệu lọc từ form search */
  formValues?: any;
  /** Tên file khi tải về (sẽ tự động thêm ngày tháng phía sau) */
  fileName: string;
  /** Tên Sheet trong file Excel. Mặc định là "Sheet1" */
  sheetName?: string;
  /** Mảng columns từ Table của antd */
  columns: any[];
  /** Danh sách key/dataIndex của cột muốn loại bỏ (VD: ["actions", "index"]) */
  excludeKeys?: string[];
  /** Số lượng bản ghi cần tải mỗi trang để ghép. Mặc định là 100 */
  batchSize?: number;
  /** Có tô màu hàng tiêu đề của file Excel hay không */
  colorHeader?: boolean;
}

// ============================================
// HÀM CHÍNH: Export Excel Multi-Page từ Antd Columns
// ============================================
export const exportExcelMultiPage = async ({
  fetchDataFn,
  formValues = {},
  fileName,
  sheetName = "Sheet1",
  columns,
  excludeKeys = ["actions"],
  batchSize = 100,
  colorHeader = false,
}: ExportExcelProps) => {
  try {
    let currentPage = 1;
    let allData: any[] = [];
    let totalPages = 1;

    // 1. Tải tất cả các trang từ API
    do {
      const response = await fetchDataFn({
        ...formValues,
        pageIndex: currentPage,
        pageSize: batchSize,
      });

      if (response && response.status && response.data) {
        const items = response.data.items || [];
        allData = [...allData, ...items];

        const totalCount = response.data.totalCount || 0;
        totalPages = Math.ceil(totalCount / batchSize) || 1;
      } else {
        break;
      }

      currentPage++;
    } while (currentPage <= totalPages);

    if (allData.length === 0) {
      toast.warning("Không có dữ liệu nào để xuất!");
      return;
    }

    // 2. Lọc bỏ các cột không xuất (VD: actions)
    const exportColumns = columns.filter((col) => {
      const key = String(col.key ?? (typeof col.dataIndex === "string" ? col.dataIndex : ""));
      if (excludeKeys.includes(key)) return false;
      if (!col.title) return false;
      return true;
    });

    if (exportColumns.length === 0) {
      toast.error("Chưa cấu hình cột dữ liệu để kết xuất!");
      return;
    }

    // 3. Chuyển đổi dữ liệu tự động dựa trên render / dataIndex của từng cột
    const exportRows = allData.map((record, rowIndex) => {
      const row: Record<string, any> = {};

      exportColumns.forEach((col) => {
        const title = typeof col.title === "string" ? col.title : extractTextFromReactNode(col.title) || col.key || "Cột";

        // Cột STT
        if (title.toUpperCase() === "STT" || col.dataIndex === "index") {
          row[title] = rowIndex + 1;
          return;
        }

        const dataIndex = col.dataIndex;
        const rawValue = getValueByDataIndex(record, dataIndex);

        let cellValue: any = "";
        // Nếu có hàm exportRender riêng
        if (col.exportRender && typeof col.exportRender === "function") {
          cellValue = col.exportRender(rawValue, record, rowIndex);
        } else if (col.render && typeof col.render === "function") {
          // Tự động gọi render() của Antd và bóc tách chữ từ JSX HTML
          try {
            const rendered = col.render(rawValue, record, rowIndex);
            cellValue = extractCellValue(rendered);
          } catch {
            cellValue = formatRawValue(rawValue);
          }
        } else {
          cellValue = formatRawValue(rawValue);
        }

        row[title] = cellValue;
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    if (colorHeader) {
      exportColumns.forEach((_, columnIndex) => {
        const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: columnIndex })];
        if (headerCell) {
          headerCell.s = {
            fill: { patternType: "solid", fgColor: { rgb: "0355A2" } },
            font: { color: { rgb: "FFFFFF" }, bold: true },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
          };
        }
      });
      worksheet["!rows"] = [{ hpt: 28 }];
      worksheet["!autofilter"] = {
        ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: exportRows.length, c: exportColumns.length - 1 } }),
      };
    }

    // 4. Tự động tính độ rộng cột (Column Width)
    const columnWidthsObj = exportColumns.map((col) => {
      let w = 18;
      if (typeof col.width === "number") {
        w = Math.max(10, Math.ceil(col.width / 8));
      }
      return { wch: w };
    });

    if (columnWidthsObj.length > 0) {
      worksheet["!cols"] = columnWidthsObj;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 5. Xuất file Excel về máy
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Đã kết xuất thành công ${allData.length} phiếu đánh giá!`);
  } catch (err) {
    console.error("Lỗi khi kết xuất Excel:", err);
    toast.error("Đã xảy ra lỗi khi kết xuất dữ liệu");
  }
};
