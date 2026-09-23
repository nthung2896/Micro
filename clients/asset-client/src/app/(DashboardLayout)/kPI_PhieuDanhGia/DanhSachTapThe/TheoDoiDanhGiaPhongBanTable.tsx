"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BankOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { Button, Card, Pagination, Space, Table, TableProps, Tag, Tooltip } from "antd";
import { ResponsePageList } from "@/types/general";
import { DotDanhGiaWithPhieuTapTheType } from "@/types/kPI_PhieuDanhGiaTapThe/kPI_PhieuDanhGiaTapThe";

export interface TheoDoiDanhGiaPhongBanTableProps {
  data?: ResponsePageList<DotDanhGiaWithPhieuTapTheType[]>;
  pageIndex: number;
  pageSize: number;
  loading?: boolean;
  searchDotId?: string;
  userId?: string;
  onViewLichSu?: (idPhieu: string) => void;
  onViewTieuChi?: (idDot: string, idDonVi?: string) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

const renderStatus = (trangThai?: string | null) => {
  const tagStyle = { borderRadius: "12px", padding: "2px 10px", fontSize: "13px" };
  if (!trangThai) return <Tag color="default" style={tagStyle}>Chưa tạo phiếu</Tag>;

  switch (trangThai) {
    case "KhoiTao":
      return <Tag color="processing" style={tagStyle}>Khởi tạo</Tag>;
    case "GuiTruongPhong":
      return <Tag color="warning" style={tagStyle}>Chờ Trưởng phòng duyệt</Tag>;
    case "GuiPhoCucTruong":
      return <Tag color="purple" style={tagStyle}>Chờ P.Cục trưởng duyệt</Tag>;
    case "GuiCucTruong":
      return <Tag color="purple" style={tagStyle}>Chờ Cục/Vụ trưởng duyệt</Tag>;
    case "GuiVuTCCB":
      return <Tag color="orange" style={tagStyle}>Chờ Vụ TCCB thẩm định</Tag>;
    case "DaDuyet":
      return <Tag color="success" style={tagStyle} icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
    case "TuChoi":
      return <Tag color="error" style={tagStyle} icon={<CloseCircleOutlined />}>Từ chối</Tag>;
    case "TraVe":
      return <Tag color="error" style={tagStyle} icon={<RollbackOutlined />}>Trả về</Tag>;
    case "ThuHoi":
      return <Tag color="error" style={tagStyle}>Thu hồi</Tag>;
    default:
      return <Tag color="default" style={tagStyle}>{trangThai}</Tag>;
  }
};

const getEvaluationUrl = (record: DotDanhGiaWithPhieuTapTheType, searchDotId?: string) => {
  const targetPhieu = record.idPhieuDanhGia || record.idDotDanhGia || searchDotId || "";
  const dotId = record.idDotDanhGia || searchDotId || "";
  const donViId = record.idDonVi || "";
  const phongBan = record.phongBan || "";
  return `/kPI_PhieuDanhGia/TapTheChiTiet/${targetPhieu}?idDotDanhGia=${dotId}&idPhieu=${record.idPhieuDanhGia || ''}&donViId=${donViId}&phongBan=${phongBan}`;
};

export const TheoDoiDanhGiaPhongBanTable: React.FC<TheoDoiDanhGiaPhongBanTableProps> = ({
  data,
  pageIndex,
  pageSize,
  loading = false,
  searchDotId,
  onViewLichSu,
  onViewTieuChi,
  onPageChange,
}) => {
  const router = useRouter();

  const columns: TableProps<DotDanhGiaWithPhieuTapTheType>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 55,
      onHeaderCell: () => ({
        style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
      }),
      render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Tập thể / Đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      width: 260,
      onHeaderCell: () => ({
        style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
      }),
      render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => (
        <div style={{ padding: "4px 0" }}>
          <div
            style={{
              fontWeight: 700,
              color: "#0355a2",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
            onClick={() => router.push(getEvaluationUrl(record, searchDotId))}
          >
            <BankOutlined style={{ color: "#0284c7" }} />
            <span>{record.tenDonVi || "Chưa xác định"}</span>
          </div>
          {record.tenPhongBan && (
            <div
              style={{
                fontSize: "12px",
                color: "#475569",
                marginTop: "4px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ApartmentOutlined style={{ color: "#10b981" }} />
              <span>{record.tenPhongBan}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Bộ tiêu chí",
      dataIndex: "boTieuChi",
      key: "boTieuChi",
      width: 250,
      onHeaderCell: () => ({
        style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
      }),
      render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => (
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          {record.tenBoTieuChiChung ? (
            <div
              style={{
                backgroundColor: "#dcfce7",
                color: "#15803d",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "12px",
                lineHeight: "1.4",
                cursor: onViewTieuChi ? "pointer" : "default",
                border: "1px solid #bbf7d0",
              }}
              onClick={() => onViewTieuChi && onViewTieuChi(record.idDotDanhGia as string, record.idDonVi as string)}
            >
              <strong>Chung:</strong> {record.tenBoTieuChiChung}
            </div>
          ) : null}
          {record.tenBoTieuChiNhiemVu ? (
            <div
              style={{
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                borderRadius: "4px",
                padding: "3px 8px",
                fontSize: "12px",
                lineHeight: "1.4",
                cursor: onViewTieuChi ? "pointer" : "default",
                border: "1px solid #bfdbfe",
              }}
              onClick={() => onViewTieuChi && onViewTieuChi(record.idDotDanhGia as string, record.idDonVi as string)}
            >
              <strong>Nhiệm vụ:</strong> {record.tenBoTieuChiNhiemVu}
            </div>
          ) : null}
          {!record.tenBoTieuChiChung && !record.tenBoTieuChiNhiemVu && (
            <span style={{ color: "#9ca3af" }}>-</span>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái duyệt",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 160,
      onHeaderCell: () => ({
        style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
      }),
      render: (trangThai: string) => renderStatus(trangThai),
    },
    {
      title: "Điểm đơn vị tự chấm",
      key: "diemTuChamGroup",
      onHeaderCell: () => ({
        style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
      }),
      children: [
        {
          title: "TC Chung (30đ)",
          dataIndex: "diemTieuChiChung",
          key: "diemTieuChiChung",
          align: "center",
          width: 110,
          onHeaderCell: () => ({
            style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
          }),
          render: (val: any) =>
            val != null ? (
              <span style={{ fontWeight: 600, color: "#0284c7" }}>
                {Number(val).toFixed(2).replace(/\.00$/, "")}
              </span>
            ) : (
              <span style={{ color: "#9ca3af" }}>-</span>
            ),
        },
        {
          title: "Nhiệm vụ (70đ)",
          dataIndex: "diemThucHienNhiemVu",
          key: "diemThucHienNhiemVu",
          align: "center",
          width: 115,
          onHeaderCell: () => ({
            style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
          }),
          render: (val: any) =>
            val != null ? (
              <span style={{ fontWeight: 600, color: "#0d9488" }}>
                {Number(val).toFixed(2).replace(/\.00$/, "")}
              </span>
            ) : (
              <span style={{ color: "#9ca3af" }}>-</span>
            ),
        },
        {
          title: "Tổng điểm (100đ)",
          dataIndex: "tongDiem",
          key: "tongDiem",
          align: "center",
          width: 125,
          onHeaderCell: () => ({
            style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
          }),
          render: (val: any) =>
            val != null ? (
              <Tag color="purple" style={{ fontWeight: 700, fontSize: "13px", padding: "2px 8px" }}>
                {Number(val).toFixed(2).replace(/\.00$/, "")}
              </Tag>
            ) : (
              <span style={{ color: "#9ca3af" }}>-</span>
            ),
        },
      ],
    },
    {
      title: "Vụ TCCB đánh giá",
      key: "diemVuTCCBGroup",
      onHeaderCell: () => ({
        style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
      }),
      children: [
        {
          title: "TC Chung (30đ)",
          dataIndex: "diemCapTrenTieuChiChung",
          key: "diemCapTrenTieuChiChung",
          align: "center",
          width: 110,
          onHeaderCell: () => ({
            style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
          }),
          render: (val: any) =>
            val != null ? (
              <span style={{ fontWeight: 600, color: "#0284c7" }}>
                {Number(val).toFixed(2).replace(/\.00$/, "")}
              </span>
            ) : (
              <span style={{ color: "#9ca3af" }}>-</span>
            ),
        },
        {
          title: "Nhiệm vụ (70đ)",
          dataIndex: "diemCapTrenThucHienNhiemVu",
          key: "diemCapTrenThucHienNhiemVu",
          align: "center",
          width: 115,
          onHeaderCell: () => ({
            style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
          }),
          render: (val: any) =>
            val != null ? (
              <span style={{ fontWeight: 600, color: "#0d9488" }}>
                {Number(val).toFixed(2).replace(/\.00$/, "")}
              </span>
            ) : (
              <span style={{ color: "#9ca3af" }}>-</span>
            ),
        },
        {
          title: "Tổng điểm (100đ)",
          dataIndex: "diemCapTrenTongDiem",
          key: "diemCapTrenTongDiem",
          align: "center",
          width: 125,
          onHeaderCell: () => ({
            style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
          }),
          render: (val: any) =>
            val != null ? (
              <Tag color="volcano" style={{ fontWeight: 700, fontSize: "13px", padding: "2px 8px" }}>
                {Number(val).toFixed(2).replace(/\.00$/, "")}
              </Tag>
            ) : (
              <span style={{ color: "#9ca3af" }}>-</span>
            ),
        },
      ],
    },
    {
      title: "Xếp loại chất lượng",
      dataIndex: "xepLoai",
      key: "xepLoai",
      align: "center",
      width: 180,
      onHeaderCell: () => ({
        style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
      }),
      render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => (
        <Space direction="vertical" size={3} style={{ width: "100%", alignItems: "center" }}>
          {record.tenChatLuongTuDanhGia && (
            <Tooltip title="Đơn vị tự xếp loại">
              <Tag color="cyan" style={{ borderRadius: "10px", fontSize: "11.5px", margin: 0 }}>
                Tự ĐG: {record.tenChatLuongTuDanhGia}
              </Tag>
            </Tooltip>
          )}
          {record.tenChatLuongCapTrenDanhGia && (
            <Tooltip title="Cấp trên xếp loại">
              <Tag color="blue" style={{ borderRadius: "10px", fontSize: "11.5px", margin: 0 }}>
                Cấp trên: {record.tenChatLuongCapTrenDanhGia}
              </Tag>
            </Tooltip>
          )}
          {!record.tenChatLuongTuDanhGia && !record.tenChatLuongCapTrenDanhGia && (
            <span style={{ color: "#9ca3af" }}>-</span>
          )}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 140,
      onHeaderCell: () => ({
        style: { backgroundColor: "#0355a2", color: "#ffffff", fontWeight: 600, textAlign: "center" },
      }),
      render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => {
        const targetUrl = getEvaluationUrl(record, searchDotId);
        const hasPhieu = Boolean(record.idPhieuDanhGia);

        return (
          <Space size={6} wrap style={{ justifyContent: "center" }}>
            <Button
              type="primary"
              size="small"
              icon={hasPhieu ? <EyeOutlined /> : <EditOutlined />}
              onClick={() => router.push(targetUrl)}
              style={{
                borderRadius: "4px",
                backgroundColor: hasPhieu ? "#0284c7" : "#16a34a",
                borderColor: hasPhieu ? "#0284c7" : "#16a34a",
                fontSize: "12px",
              }}
            >
              {hasPhieu ? "Xem phiếu" : "Đánh giá"}
            </Button>
            {hasPhieu && onViewLichSu && (
              <Tooltip title="Lịch sử xử lý">
                <Button
                  size="small"
                  icon={<HistoryOutlined />}
                  onClick={() => onViewLichSu(record.idPhieuDanhGia as string)}
                  style={{ borderRadius: "4px" }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card className="customCardShadow" styles={{ body: { padding: "0" } }}>
      <Table<DotDanhGiaWithPhieuTapTheType>
        columns={columns}
        dataSource={data?.items || []}
        rowKey={(record) => record.idPhieuDanhGia || record.idDonVi || `${record.idDotDanhGia}-${record.tenDonVi}`}
        loading={loading}
        pagination={false}
        bordered
        scroll={{ x: 1150 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px" }}>
        <Pagination
          current={pageIndex}
          pageSize={pageSize}
          total={data?.totalCount || 0}
          showSizeChanger
          showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đơn vị`}
          onChange={onPageChange}
          pageSizeOptions={["10", "20", "50", "100"]}
        />
      </div>
    </Card>
  );
};

export default TheoDoiDanhGiaPhongBanTable;
