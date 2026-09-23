"use client";

import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { ThongKeSoLuongTheoDiaPhuongDetailItem } from "@/types/quanLyThongKe/dto";
import formatDate from "@/utils/formatDate";
import { buildFileUrl } from "@/utils/file";
import { Image, Modal, Pagination, Spin, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useMemo } from "react";

const CONTRACT_STATUS_MAP: Record<number, { text: string; color: string }> = {
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

interface ThongKeDetailModalProps {
  open: boolean;
  title: string;
  subtitle: string;
  loading: boolean;
  data: ThongKeSoLuongTheoDiaPhuongDetailItem[];
  total: number;
  pageIndex: number;
  pageSize: number;
  isContract: boolean;
  metricKey?: string;
  onClose: () => void;
  onPageChange: (page: number, size: number) => void;
}

const getPlatformStatusTagColor = (status?: number) => {
  switch (status) {
    case PlatformStatusConstant.TamLuu:
      return "default";
    case PlatformStatusConstant.ChoDuyet:
      return "processing";
    case PlatformStatusConstant.DeNghiChinhSua:
    case PlatformStatusConstant.CanBoSungThongTin:
      return "orange";
    case PlatformStatusConstant.DaXacNhan:
      return "success";
    case PlatformStatusConstant.BiTuChoi:
      return "error";
    case PlatformStatusConstant.DaDuyetDienTu:
      return "cyan";
    case PlatformStatusConstant.DaReview:
      return "blue";
    case PlatformStatusConstant.CanBanGiay:
      return "warning";
    default:
      return "default";
  }
};

const renderProcessingDeadline = (
  record: ThongKeSoLuongTheoDiaPhuongDetailItem,
  metricKey?: string,
) => {
  if (metricKey !== "quaHanDonVi") {
    return null;
  }

  if (!record.processingDeadline) return null;

  const deadlineStr = formatDate(record.processingDeadline, true);

  return (
    <div style={{ marginTop: 2, fontSize: 12 }}>
      <span style={{ color: "#6b7280" }}>Hạn xử lý:</span>{" "}
      <span style={{ fontWeight: 600, color: "#ef4444" }}>{deadlineStr}</span>
      {record.overdueDays != null && record.overdueDays > 0 && (
        <span style={{ marginLeft: 4, color: "#ef4444", fontSize: 11 }}>
          (Quá hạn {record.overdueDays} ngày)
        </span>
      )}
    </div>
  );
};

const ThongKeDetailModal: React.FC<ThongKeDetailModalProps> = ({
  open,
  title,
  subtitle,
  loading,
  data,
  total,
  pageIndex,
  pageSize,
  isContract,
  metricKey,
  onClose,
  onPageChange,
}) => {
  const platformColumns: ColumnsType<ThongKeSoLuongTheoDiaPhuongDetailItem> =
    useMemo(
      () => [
        {
          title: "STT",
          
          key: "stt",
          width: 60,
          align: "center",
          fixed: "left",
          render: (_, __, index) => index + 1 + (pageIndex - 1) * pageSize,
        },
        {
          title: "Tên nền tảng",
          key: "platform_name",
          width: 300,
          align: "left",
          onHeaderCell: () => ({ style: { textAlign: "center" } }),
          render: (_, record) => {
            const src = buildFileUrl(record.imagePath);
            const href = record.domain
              ? record.domain.startsWith("http")
                ? record.domain
                : `https://${record.domain}`
              : "";

            return (
              <div style={{ display: "flex", gap: 12 }}>
                <Image
                  src={src || ""}
                  alt={record.name ?? "Logo"}
                  width={40}
                  height={40}
                  style={{
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    flexShrink: 0,
                  }}
                  fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23f1f5f9' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='10'%3ENo img%3C/text%3E%3C/svg%3E"
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: 14,
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {record.name || "—"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "#6b7280" }}>Tên miền:</span>
                    {record.domain ? (
                      <Tooltip title={record.domain}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontWeight: 500,
                            color: "#2563eb",
                            textDecoration: "underline",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "inline-block",
                            maxWidth: 180,
                          }}
                        >
                          {record.domain}
                        </a>
                      </Tooltip>
                    ) : (
                      <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                        Không có
                      </span>
                    )}
                  </div>
                  {record.platformManageTypeName && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      <span style={{ color: "#6b7280" }}>Loại:</span>
                      <span style={{ fontWeight: 500, color: "#334155" }}>
                        {record.platformManageTypeName}
                      </span>
                    </div>
                  )}
                  {renderProcessingDeadline(record, metricKey)}
                </div>
              </div>
            );
          },
        },
        {
          title: "Thông tin doanh nghiệp chủ quản",
          key: "company_info",
          width: 260,
          align: "left",
          onHeaderCell: () => ({ style: { textAlign: "center" } }),
          render: (_, record) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>
                {record.companyName || "Chưa cập nhật"}
              </div>
              {record.companyTaxCode && (
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  MST/Mã số DN:{" "}
                  <span style={{ fontWeight: 500 }}>{record.companyTaxCode}</span>
                </div>
              )}
              {record.companyEmail && (
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  Email:{" "}
                  <a
                    href={`mailto:${record.companyEmail}`}
                    style={{ fontWeight: 500, color: "#2563eb" }}
                  >
                    {record.companyEmail}
                  </a>
                </div>
              )}
            </div>
          ),
        },
        {
          title: "Người đại diện",
          key: "representer_info",
          width: 180,
          render: (_, record) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 600, color: "#1e293b" }}>
                {record.representerName || "Chưa cập nhật"}
              </div>
              {record.representerMobile && (
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  SĐT:{" "}
                  <span style={{ fontWeight: 500 }}>
                    {record.representerMobile}
                  </span>
                </div>
              )}
              {record.representerEmail && (
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  Email:{" "}
                  <a
                    href={`mailto:${record.representerEmail}`}
                    style={{ color: "#2563eb" }}
                  >
                    {record.representerEmail}
                  </a>
                </div>
              )}
            </div>
          ),
        },
        {
          title: "Trạng thái",
          dataIndex: "status",
          width: 140,
          align: "center",
          render: (status: number, record) => (
            <Tag
              color={getPlatformStatusTagColor(status)}
              style={{
                borderRadius: 4,
                padding: "2px 8px",
                fontWeight: 500,
                margin: 0,
              }}
            >
              {record.statusName || "Tạm lưu"}
            </Tag>
          ),
        },
        {
          title: "Thời gian xử lý",
          key: "progress",
          width: 210,
          align: "left",
          onHeaderCell: () => ({ style: { textAlign: "center" } }),
          render: (_, record) => {
            const createdStr = record.createdDate ? formatDate(record.createdDate, false) : "—";
            const submitStr = record.submitDate ? formatDate(record.submitDate, false) : null;
            const reviewStr = record.reviewDate ? formatDate(record.reviewDate, false) : null;

            return (
              <div style={{ fontSize: 12, color: "#475569" }}>
                <div>
                  <span style={{ color: "#6b7280" }}>Ngày tạo:</span>{" "}
                  <span style={{ fontWeight: 500 }}>{createdStr}</span>
                </div>
                {submitStr && (
                  <div style={{ marginTop: 2 }}>
                    <span style={{ color: "#6b7280" }}>Gửi duyệt:</span>{" "}
                    <span style={{ fontWeight: 500 }}>{submitStr}</span>
                  </div>
                )}
                {reviewStr && (
                  <div style={{ marginTop: 2 }}>
                    <span style={{ color: "#6b7280" }}>Ngày duyệt:</span>{" "}
                    <span style={{ fontWeight: 500 }}>{reviewStr}</span>
                  </div>
                )}
              </div>
            );
          },
        },
        {
          title: "Người xử lý",
          dataIndex: "reviewName",
          width: 160,
          align: "left",
          onHeaderCell: () => ({ style: { textAlign: "center" } }),
          render: (name: string | null, record) => {
            const trimmedName = name?.trim();
            if (trimmedName) {
              return trimmedName;
            }
            if (record.reviewMaCanBo) {
              return record.reviewMaCanBo;
            }
            return "";
          },
        },
      ],
      [pageIndex, pageSize, metricKey],
    );

  const contractColumns: ColumnsType<ThongKeSoLuongTheoDiaPhuongDetailItem> =
    useMemo(
      () => [
        {
          title: "STT",
          key: "stt",
          width: 60,
          align: "center",
          fixed: "left",
          render: (_, __, index) => index + 1 + (pageIndex - 1) * pageSize,
        },
        {
          title: "Thông tin nền tảng",
          key: "name_info",
          width: 220,
          render: (_, record) => {
            const href = record.domain
              ? record.domain.startsWith("http")
                ? record.domain
                : `https://${record.domain}`
              : "";

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: 14,
                  }}
                >
                  {record.name || "—"}
                </div>
                <div>
                  {record.domain ? (
                    <a href={href} target="_blank" rel="noreferrer"
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#2563eb",
                        textDecoration: "underline",
                      }}
                    >
                      🔗 {record.domain}
                    </a>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}
                    >
                      Không có website
                    </span>
                  )}
                </div>
              </div>
            );
          },
        },
        {
          title: "Thông tin doanh nghiệp chủ quản",
          key: "company_info",
          width: 260,
          render: (_, record) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                fontSize: 12,
                color: "#64748b",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                {record.companyName || "—"}
              </div>
              {record.companyTaxCode && (
                <div style={{ fontSize: 11 }}>
                  MST:{" "}
                  <span style={{ fontWeight: 500, color: "#0f172a" }}>
                    {record.companyTaxCode}
                  </span>
                </div>
              )}
              {record.representerEmail && (
                <div style={{ fontSize: 11 }}>
                  Email:{" "}
                  <a href={`mailto:${record.representerEmail}`} style={{ color: "#2563eb" }}>
                    {record.representerEmail}
                  </a>
                </div>
              )}
              {record.representerMobile && (
                <div style={{ fontSize: 11 }}>
                  SĐT:{" "}
                  <span style={{ fontWeight: 500, color: "#0f172a" }}>
                    {record.representerMobile}
                  </span>
                </div>
              )}
            </div>
          ),
        },
        {
          title: "Đại diện pháp luật",
          key: "representer",
          width: 180,
          render: (_, record) => (
            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 12 }}>
              {record.representerName || "Chưa cập nhật"}
            </div>
          ),
        },
        {
          title: "Trạng thái",
          dataIndex: "status",
          width: 150,
          align: "center",
          render: (status: number, record) => {
            const item = CONTRACT_STATUS_MAP[status] || {
              text: record.statusName || "Không xác định",
              color: "default",
            };

            return (
              <Tag
                color={item.color}
                style={{
                  borderRadius: 12,
                  padding: "2px 10px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {item.text}
              </Tag>
            );
          },
        },
        {
          title: "Thời gian xử lý",
          key: "progress",
          width: 180,
          render: (_, record) => {
            const createdStr = record.createdDate ? formatDate(record.createdDate, true) : "—";
            const updatedStr = record.updatedDate ? formatDate(record.updatedDate, true) : "—";

            return (
              <div style={{ fontSize: 12, color: "#475569" }}>
                <div>
                  <span style={{ color: "#6b7280" }}>Ngày tạo:</span>{" "}
                  <span style={{ fontWeight: 500 }}>{createdStr}</span>
                </div>
                <div style={{ marginTop: 2 }}>
                  <span style={{ color: "#6b7280" }}>Cập nhật:</span>{" "}
                  <span style={{ fontWeight: 500 }}>{updatedStr}</span>
                </div>
              </div>
            );
          },
        },
        {
          title: "Người xử lý",
          key: "handler",
          width: 150,
          align: "center",
          render: (_, record) => {
            if (record.reviewName?.trim()) {
              return (
                <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500 }}>
                  {record.reviewName}
                </Tag>
              );
            }
            return (
              <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                Chưa phân công
              </span>
            );
          },
        },
      ],
      [pageIndex, pageSize, metricKey],
    );

  const columns = isContract ? contractColumns : platformColumns;

  return (
    <Modal
      className="thong-ke-detail-modal"
      title={
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            textAlign: "center",
            padding: "0 32px 2px",
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: "3px 12px",
                borderRadius: 8,
                background: "#f1f5f9",
                color: "#475569",
                lineHeight: 1.4,
                maxWidth: "100%",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1450}
      style={{ top: 40 }}
      styles={{
        header: {
          marginBottom: 0,
          padding: "14px 24px 12px",
          borderBottom: "1px solid #eef2f7",
        },
        body: { padding: "55px 0 0 0" },
      }}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        <div style={{ padding: "0 24px" }}>
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            bordered
            size="middle"
            rowKey="id"
            scroll={{ x: "max-content" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px 24px",
            borderTop: "1px solid #f0f0f0",
            marginTop: 24,
          }}
        >
          <Pagination
            total={total}
            showTotal={(totalCount, range) =>
              `${range[0]}-${range[1]} trong tổng số ${totalCount} hồ sơ`
            }
            pageSize={pageSize}
            current={pageIndex}
            onChange={onPageChange}
            showSizeChanger
            pageSizeOptions={["5", "10", "20", "50"]}
          />
        </div>
      </Spin>
    </Modal>
  );
};

export default ThongKeDetailModal;
