"use client";

import { ThongKePhanAnhVaViPhamDetailItem } from "@/types/quanLyThongKe/dto";
import formatDate from "@/utils/formatDate";
import { LinkOutlined } from "@ant-design/icons";
import { Modal, Pagination, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo } from "react";

interface ThongKePhanAnhVaViPhamDetailModalProps {
  open: boolean;
  title: string;
  subtitle: string;
  loading: boolean;
  data: ThongKePhanAnhVaViPhamDetailItem[];
  total: number;
  pageIndex: number;
  pageSize: number;
  isViPham: boolean;
  onClose: () => void;
  onPageChange: (page: number, size: number) => void;
}

const DETAIL_TABLE_SCROLL_Y = 560;

const ThongKePhanAnhVaViPhamDetailModal: React.FC<ThongKePhanAnhVaViPhamDetailModalProps> = ({
  open,
  title,
  subtitle,
  loading,
  data,
  total,
  pageIndex,
  pageSize,
  isViPham,
  onClose,
  onPageChange,
}) => {
  const router = useRouter();

  const getVisibilityTag = useCallback((isHienThi?: boolean) => {
    return isHienThi ? (
      <Tag color="success">Hiển thị</Tag>
    ) : (
      <Tag color="default">Ẩn</Tag>
    );
  }, []);

  const getStatusTag = useCallback((status: number, text?: string) => {
    switch (status) {
      case 0:
        return <Tag color="default">{text}</Tag>;
      case 1:
        return <Tag color="processing">{text}</Tag>;
      case 2:
        return <Tag color="error">{text}</Tag>;
      case 3:
        return <Tag color="success">{text}</Tag>;
      default:
        return <Tag color="default">{text}</Tag>;
    }
  }, []);

  const phanAnhColumns: ColumnsType<ThongKePhanAnhVaViPhamDetailItem> = useMemo(
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
        key: "tenNenTang",
        width: 240,
        render: (_, record) => {
          const url = record.diaChiNenTang || "";
          const href = url.startsWith("http") ? url : `https://${url}`;
          const downloadUrl = record.lienKetTaiUngDung || "";
          const downloadHref = downloadUrl.startsWith("http")
            ? downloadUrl
            : downloadUrl
              ? `https://${downloadUrl}`
              : "";
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {record.tenNenTang && (
                <span style={{ fontWeight: 600, color: "#262626" }}>{record.tenNenTang}</span>
              )}
              {url ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#1890ff",
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {url}
                  <LinkOutlined style={{ fontSize: "12px" }} />
                </a>
              ) : (
                <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>Chưa có địa chỉ</span>
              )}
              {record.tenUngDung && (
                <span style={{ fontSize: "13px", color: "#595959" }}>
                  Ứng dụng: {record.tenUngDung}
                </span>
              )}
              {downloadUrl ? (
                <a
                  href={downloadHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "13px", color: "#1890ff" }}
                >
                  Liên kết tải: {downloadUrl}
                </a>
              ) : null}
              <span style={{ color: "#ea580c", fontStyle: "italic", fontSize: "13px" }}>
                {record.tenThuongNhan || "Chưa có tên doanh nghiệp"}
              </span>
              <span style={{ color: "#ea580c", fontStyle: "italic", fontSize: "13px" }}>
                ({record.tenTinh ? record.tenTinh : "Chưa có tỉnh/ thành phố"})
              </span>
              {record.hasVuViec && (
                <Tag
                  color="blue"
                  style={{ marginTop: 4, width: "fit-content", fontSize: 11, cursor: "pointer" }}
                  onClick={() => {
                    if (record.vuViecId) {
                      router.push(`/vuViecPhanAnh/detail?id=${record.vuViecId}`);
                    }
                  }}
                >
                  Đã liên kết với vụ việc: #{record.soThuTu ?? 0}
                </Tag>
              )}
            </div>
          );
        },
      },
      {
        title: "Loại phản ánh",
        dataIndex: "tenLoaiPhanAnh",
        key: "tenLoaiPhanAnh",
        width: 120,
        render: (text: string) => text || "",
      },
      {
        title: "Người phản ánh",
        key: "nguoiPhanAnh",
        width: 200,
        render: (_, record) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{ fontWeight: "bold", color: "#262626", cursor: "pointer" }}
              onClick={() => {
                router.push(`/phanAnhNenTang/detail?id=${record.id}`);
              }}
              className="hover:text-blue-600"
            >
              {record.hoTen || "Không có tên"}
            </span>
            <span style={{ fontSize: "13px", color: "#595959" }}>
              Email:{record.email || ""}
            </span>
            <span style={{ fontSize: "13px", color: "#595959" }}>
              CMND:{record.soCCCD || ""}
            </span>
            <span style={{ fontSize: "13px", color: "#595959" }}>
              Điện thoại:{record.soDienThoai || ""}
            </span>
          </div>
        ),
      },
      {
        title: "Nội dung phản ánh",
        dataIndex: "noiDungPhanAnh",
        key: "noiDungPhanAnh",
        width: 220,
        render: (text: string) =>
          text ? (
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5, fontSize: 13 }}>{text}</div>
          ) : (
            ""
          ),
      },
      {
        title: "Ngày gửi",
        dataIndex: "createdDate",
        key: "createdDate",
        width: 110,
        align: "center",
        render: (date: string) => (date ? formatDate(date) : ""),
      },
      {
        title: "Trạng thái",
        dataIndex: "trangThai",
        key: "trangThai",
        width: 140,
        align: "center",
        render: (status: number, record) => (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {status != null ? getStatusTag(status, record.trangThaiText) : ""}
            {status === 2 && record.lyDoTuChoi && (
              <span style={{ fontSize: 12, color: "#ef4444", textAlign: "left" }}>
                {record.lyDoTuChoi}
              </span>
            )}
          </div>
        ),
      },
      {
        title: "Kết luận",
        dataIndex: "ketLuanText",
        key: "ketLuanText",
        width: 110,
        align: "center",
        render: (text: string) => text || "",
      },
    ],
    [pageIndex, pageSize, router, getStatusTag],
  );

  const viPhamColumns: ColumnsType<ThongKePhanAnhVaViPhamDetailItem> = useMemo(
    () => [
      {
        title: "STT",
        key: "stt",
        width: 70,
        align: "center",
        fixed: "left",
        render: (_, __, index) => index + 1 + (pageIndex - 1) * pageSize,
      },
      {
        title: "Tên nền tảng",
        key: "tenNenTang",
        width: 200,
        render: (_, record) => (
          <span
            style={{ fontWeight: "bold", color: "#0143DF", cursor: "pointer" }}
            onClick={() => {
              router.push(`/nenTangViPham/detail?id=${record.id}`);
            }}
            className="hover:text-blue-600"
          >
            {record.tenNenTang || ""}
          </span>
        ),
      },
      {
        title: "Tên ứng dụng",
        dataIndex: "tenUngDung",
        key: "tenUngDung",
        width: 140,
        render: (text: string) => text || "",
      },
      {
        title: "Nguồn vi phạm",
        dataIndex: "tenNguon",
        key: "tenNguon",
        width: 140,
        render: (text: string) => text || "",
      },
      {
        title: "Loại vi phạm",
        dataIndex: "tenLoaiViPham",
        key: "tenLoaiViPham",
        width: 140,
        align: "center",
        render: (text: string) => text || "",
      },
      {
        title: "Thời gian",
        key: "thoiGian",
        width: 140,
        render: (_, record) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: 13 }}>
            <span>
              <span style={{ color: "#64748b" }}>Bắt đầu:</span>{" "}
              {record.ngayBatDau ? dayjs(record.ngayBatDau).format("DD/MM/YYYY") : "—"}
            </span>
            <span>
              <span style={{ color: "#64748b" }}>Kết thúc:</span>{" "}
              {record.ngayKetThuc ? dayjs(record.ngayKetThuc).format("DD/MM/YYYY") : "—"}
            </span>
          </div>
        ),
      },
      {
        title: "Nền tảng liên kết",
        dataIndex: "tenNenTangLienKet",
        key: "tenNenTangLienKet",
        width: 180,
        render: (text: string) => text || "",
      },
      {
        title: "Trạng thái",
        dataIndex: "isHienThi",
        key: "isHienThi",
        width: 110,
        align: "center",
        render: (val: boolean) => getVisibilityTag(val),
      },
    ],
    [pageIndex, pageSize, router, getVisibilityTag],
  );

  return (
    <Modal
      open={open}
      title={
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 400, marginTop: 4 }}>
              {subtitle}
            </div>
          )}
        </div>
      }
      onCancel={onClose}
      footer={null}
      width={1600}
      destroyOnHidden
      styles={{ body: { paddingTop: 24 } }}
    >
      <Spin spinning={loading} style={{ marginTop: 14 }}>
        <Table<ThongKePhanAnhVaViPhamDetailItem>
          columns={isViPham ? viPhamColumns : phanAnhColumns}
          dataSource={data}
          rowKey="id"
          size="small"
          bordered
          pagination={false}
          scroll={{ x: isViPham ? 1080 : 1400, y: DETAIL_TABLE_SCROLL_Y }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Pagination
            current={pageIndex}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showTotal={(t) => `Tổng ${t} bản ghi`}
            onChange={onPageChange}
          />
        </div>
      </Spin>
    </Modal>
  );
};

export default ThongKePhanAnhVaViPhamDetailModal;
