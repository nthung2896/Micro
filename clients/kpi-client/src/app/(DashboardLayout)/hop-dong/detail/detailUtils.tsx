import { AppContractExtendType } from "@/types/appContractExtend/dto";
import { AuthConstractCategoryType } from "@/types/authConstractCategory/dto";
import { AuthenticationContractType } from "@/types/authenticationContract/dto";
import { DropdownOption } from "@/types/general";
import { buildFileUrl } from "@/utils/file";
import { Image, Tag } from "antd";
import type { ReactNode } from "react";
import fileServerService from "@/libs/file-uploader/fileServer.service";
export const emptyText = "Chưa có dữ liệu";

export type ContractHistoryItem = {
  id?: string;
  createdDate?: string | Date;
  userName?: string;
  userCode?: string;
  roleThaoTac?: string;
  actionType?: string;
  title?: string;
  content?: string;
  note?: string;
  fromStatus?: number;
  toStatus?: number;
};

export type ContractHistoryRow = ContractHistoryItem & {
  rowKey: string;
};

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Tạm lưu", color: "default" },
  1: { text: "Chờ duyệt", color: "processing" },
  2: { text: "Đề nghị chỉnh sửa", color: "warning" },
  3: { text: "Bị từ chối", color: "error" },
  4: { text: "Đã duyệt điện tử", color: "cyan" },
  5: { text: "Đã xác nhận", color: "success" },
  6: { text: "Cần bổ sung thông tin", color: "warning" },
  7: { text: "Đã chấm dứt đăng ký", color: "default" },
  8: { text: "Đã huỷ đăng ký", color: "default" },
  9: { text: "Đề nghị chấm dứt đăng ký", color: "warning" },
  11: { text: "Đã yêu cầu gia hạn", color: "cyan" },
  12: { text: "Chờ gia hạn", color: "processing" },
  26: { text: "Đã review", color: "blue" },
  28: { text: "Cần bản giấy", color: "warning" },
};

export const renderText = (value?: string | number | null): ReactNode =>
  value === undefined || value === null || value === "" ? emptyText : value;

export const normalizeDropdownOptions = (options?: any[]): DropdownOption[] => {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map((item) => ({
      label:
        item.label ??
        item.Label ??
        item.name ??
        item.Name ??
        item.title ??
        item.Title ??
        item.text ??
        item.Text ??
        "",
      value:
        item.value ??
        item.Value ??
        item.code ??
        item.Code ??
        item.id ??
        item.Id ??
        item.key ??
        item.Key ??
        "",
    }))
    .filter(
      (item) =>
        item.label &&
        item.value !== undefined &&
        item.value !== null &&
        item.value !== "",
    );
};

export const getDropdownLabel = (
  options: DropdownOption[] = [],
  value?: string | number | null,
): string => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (typeof value === "string" && value.includes("@@")) {
    return value
      .split("@@")
      .map((v) => {
        const option = options.find((item) => String(item.value) === String(v));
        return option?.label || String(v);
      })
      .join(", ");
  }

  const option = options.find((item) => String(item.value) === String(value));
  return option?.label || String(value);
};

export const renderDropdownLabel = (
  options: DropdownOption[] = [],
  value?: string | number | null,
): ReactNode => {
  const label = getDropdownLabel(options, value);
  return label || emptyText;
};

export const renderLink = (value?: string | null): ReactNode =>
  value ? (
    <a href={value} target="_blank" rel="noreferrer">
      {value}
    </a>
  ) : (
    emptyText
  );

export const renderImage = (value?: string | null): ReactNode => {
  //const imageUrl = buildFileUrl(value);
  if (!value) return emptyText;

  return (
    <Image
      src={value}
      alt="Logo"
      width={64}
      height={64}
      style={{ objectFit: "contain", borderRadius: 6 }}
    />
  );
};

export const renderDateTime = (value?: string | Date | null): ReactNode => {
  if (!value) return emptyText;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("vi-VN");
};

export const renderStatus = (status?: number | null): ReactNode => {
  if (status === undefined || status === null) return emptyText;

  const item = statusMap[status];
  return item ? <Tag color={item.color}>{item.text}</Tag> : status;
};

export const renderStatusLabel = (
  options: DropdownOption[] = [],
  status?: number | null,
): ReactNode => {
  if (status === undefined || status === null) return emptyText;
  if (status === -1) return <Tag color="default">Khởi tạo</Tag>;

  const item = statusMap[status];
  const text = getDropdownLabel(options, status) || item?.text || String(status);
  return <Tag color={item?.color || "default"}>{text}</Tag>;
};

export const getApps = (
  item?: AuthenticationContractType | null,
): AppContractExtendType[] => {
  const source =
    (item as any)?.appExtends || (item as any)?.appContractRequests || [];
  return Array.isArray(source) ? (source as AppContractExtendType[]) : [];
};

export const getCategories = (
  item?: AuthenticationContractType | null,
): AuthConstractCategoryType[] => {
  const source =
    (item as any)?.listCategories ||
    (item as any)?.authConstractCategories ||
    [];
  return Array.isArray(source) ? (source as AuthConstractCategoryType[]) : [];
};

export const getPlatformTypeLabel = (
  item?: AuthenticationContractType | null,
) => {
  const hasWebsite = Boolean(item?.domain);
  const hasApps = getApps(item).length > 0;

  if (hasWebsite && hasApps) return "Website và ứng dụng";
  if (hasApps) return "Ứng dụng";
  return "Website";
};

export const getHistoryRows = (
  item?: AuthenticationContractType | null,
): ContractHistoryRow[] => {
  const historySource =
    ((item as any)?.histories ||
      (item as any)?.historyChangedAuthencationContracts ||
      (item as any)?.historyChangedAuthenticationContracts ||
      (item as any)?.historyChangedAuthencationContractDtos ||
      []) as ContractHistoryItem[];
  const histories = Array.isArray(historySource) ? historySource : [];

  return toHistoryRows(histories);
};

export const toHistoryRows = (
  histories?: ContractHistoryItem[],
): ContractHistoryRow[] =>
  (Array.isArray(histories) ? histories : []).map((history, index) => ({
    ...history,
    rowKey:
      history.id ||
      `${history.createdDate || "time"}-${history.actionType || history.title || "action"}-${history.toStatus ?? "status"}-${index}`,
  }));
