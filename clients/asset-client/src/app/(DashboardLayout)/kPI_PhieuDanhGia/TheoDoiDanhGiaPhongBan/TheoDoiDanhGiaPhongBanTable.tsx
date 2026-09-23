"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Card, Pagination, Table, TableProps, Tag } from "antd";
import { ResponsePageList } from "@/types/general";
import { EvaluationColumnDto } from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";

export interface TheoDoiDanhGiaAccessInfo {
  evaluationWorkflowType?: string | null;
  visibleEvaluationColumns?: EvaluationColumnDto[];
}

export interface TheoDoiDanhGiaPhongBanTableProps {
  data?: ResponsePageList<any>;
  pageIndex: number;
  pageSize: number;
  loading?: boolean;
  accessInfo?: TheoDoiDanhGiaAccessInfo | null;
  searchDotId?: string;
  userId?: string;
  onViewDetail: (item: any) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

const formatScore = (value: number | null | undefined) =>
  value != null ? Math.round(value * 100) / 100 : "-";

const getEvaluationUrl = (record: any, searchDotId?: string) => {
  const phieuTarget = record.idPhieuDanhGia || record.idDotDanhGia || searchDotId || "";
  const idDot = record.idDotDanhGia || searchDotId || "";
  const idLyLich = record.idLyLich || "";
  return `/kPI_PhieuDanhGia/DanhGiaMultiCap/${phieuTarget}?idDot=${idDot}&idLyLich=${idLyLich}`;
};

const renderStatus = (trangThai?: string | null) => {
  const tagStyle = { borderRadius: "12px", padding: "2px 10px", fontSize: "13px" };
  if (!trangThai) return null;

  switch (trangThai) {
    case "KhoiTao": return <Tag color="processing" style={tagStyle}>Khởi tạo</Tag>;
    case "GuiPhoTruongPhong": return <Tag color="warning" style={tagStyle}>Chờ PT.phòng duyệt</Tag>;
    case "GuiPhoVuTruong": return <Tag color="warning" style={tagStyle}>Chờ Phó Vụ trưởng duyệt</Tag>;
    case "GuiVuTruong": return <Tag color="purple" style={tagStyle}>Chờ Vụ trưởng duyệt</Tag>;
    case "GuiTruongPhong": return <Tag color="warning" style={tagStyle}>Chờ Trưởng phòng duyệt</Tag>;
    case "GuiPhoCucTruong": return <Tag color="purple" style={tagStyle}>Chờ P.Cục trưởng duyệt</Tag>;
    case "GuiCucTruong": return <Tag color="purple" style={tagStyle}>Chờ Cục trưởng duyệt</Tag>;
    case "GuiPhoGiamDocTT": return <Tag color="warning" style={tagStyle}>Chờ Phó GĐ TT duyệt</Tag>;
    case "GuiGiamDocTT": return <Tag color="purple" style={tagStyle}>Chờ Giám đốc TT duyệt</Tag>;
    case "GuiPhoChanhVanPhong": return <Tag color="warning" style={tagStyle}>Chờ Phó CVP duyệt</Tag>;
    case "GuiChanhVanPhong": return <Tag color="purple" style={tagStyle}>Chờ Chánh VP duyệt</Tag>;
    case "DaDuyet": return <Tag color="success" style={tagStyle} icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
    case "TuChoi": return <Tag color="error" style={tagStyle} icon={<CloseCircleOutlined />}>Từ chối</Tag>;
    case "TraVe": return <Tag color="error" style={tagStyle}>Trả về</Tag>;
    case "ThuHoi": return <Tag color="error" style={tagStyle}>Thu hồi</Tag>;
    default: return <Tag color="default" style={tagStyle}>{trangThai}</Tag>;
  }
};

const renderPersonnel = (record: any) => {
  const chucVu = record.chucVuChuPhieu?.toLowerCase() || "";
  let tagColor = "blue";

  if (chucVu.includes("phó cục trưởng") || chucVu.includes("phó trưởng phòng")) {
    tagColor = "volcano";
  } else if (chucVu.includes("cục trưởng") || chucVu.includes("trưởng phòng")) {
    tagColor = "magenta";
  }

  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
        <span style={{ fontWeight: 600, color: "#0355a2", fontSize: "14px" }}>
          {record.tenChuPhieu || "-"}
        </span>
        {record.chucVuChuPhieu && (
          <Tag color={tagColor} style={{ margin: 0, borderRadius: "4px", fontSize: "11px", fontWeight: 500 }}>
            {record.chucVuChuPhieu}
          </Tag>
        )}
      </div>
    </div>
  );
};

const withHeaderStyle = (columns: any[]): any[] =>
  columns.map((column) => ({
    ...column,
    ...(column.children ? { children: withHeaderStyle(column.children) } : {}),
    onHeaderCell: () => ({
      style: {
        backgroundColor: "#0355a2",
        color: "#ffffff",
        fontWeight: 600,
        textAlign: "center" as const,
      },
    }),
  }));

const createRoleColumn = ({
  roleCode,
  title,
  targetTrangThai,
  roleColor,
  viewRoleCode,
  searchDotId,
  userId,
  onViewDetail,
  onNavigate,
}: {
  roleCode: string;
  title: string;
  targetTrangThai: string;
  roleColor: string;
  viewRoleCode?: string;
  searchDotId?: string;
  userId?: string;
  onViewDetail: (item: any) => void;
  onNavigate: (url: string) => void;
}) => {
  const isApplicable = (record: any) => record.daDanhGia;

  const renderRoleScore = (
    value: number | null | undefined,
    record: any,
    color?: string,
    fontSize?: string,
  ) => {
    if (!isApplicable(record)) {
      return <span style={{ color: "#999" }}>-</span>;
    }

    return (
      <b style={{ color, fontSize }}>
        {formatScore(value)}
      </b>
    );
  };

  const renderRoleAction = (_: any, record: any) => {
    if (!isApplicable(record)) {
      return <span style={{ color: "#999" }}>-</span>;
    }

    const renderNguoiXuLy = () => {
      if (record.trangThaiBuocXuLyHienThi !== targetTrangThai || !record.tenNguoiXuLyHienTai) {
        return null;
      }

      return (
        <span style={{ fontSize: "12px", color: "#555", textAlign: "center", marginTop: "2px" }}>
          <strong style={{ color: "#0355a2" }}>{record.tenNguoiXuLyHienTai}</strong><br />
          {record.trangThai === "DaDuyet" ? "đã xử lý" : "đang xử lý"}
        </span>
      );
    };

    const withNguoiXuLy = (content: React.ReactNode) => {
      const nguoiXuLy = renderNguoiXuLy();
      if (!nguoiXuLy) {
        return content;
      }

      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          {content}
          {nguoiXuLy}
        </div>
      );
    };

    const roleScore = record.evaluationRoleScores?.[roleCode];
    const dTC = roleScore?.diemTieuChiChung;
    const dNV = roleScore?.diemThucHienNhiemVu;
    const dTong = roleScore?.tongDiem;
    const targetUrl = getEvaluationUrl(record, searchDotId);

    if (dNV == null && dTC == null && dTong == null) {
      if (record.trangThai !== targetTrangThai) {
        return withNguoiXuLy(<span style={{ color: "#bbb" }}>-</span>);
      }

      const isMyTurn = record.idNguoiXuLyHienTai === userId || !record.tenNguoiXuLyHienTai;

      return withNguoiXuLy(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          {!record.tenNguoiXuLyHienTai && (
            <span
              onClick={() => onNavigate(targetUrl)}
              style={{ color: "#d97706", fontStyle: "italic", fontSize: "13px", cursor: "pointer", fontWeight: 500, textDecoration: "underline" }}
              title="Nhấn để mở phiếu đánh giá"
            >
              Chưa đánh giá
            </span>
          )}
          {isMyTurn && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              style={{ backgroundColor: roleColor, borderColor: roleColor, fontSize: "11.5px", height: "24px", padding: "0 8px", borderRadius: "4px" }}
              onClick={() => onNavigate(targetUrl)}
            >
              Đánh giá ngay
            </Button>
          )}
        </div>
      );
    }

    const isCurrentlyThisRoleTurn = record.trangThai === targetTrangThai;
    const isMyTurn = isCurrentlyThisRoleTurn && (record.idNguoiXuLyHienTai === userId || !record.tenNguoiXuLyHienTai);

    return withNguoiXuLy(
      <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
        <Button
          type="default"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail({ ...record, viewMode: viewRoleCode || roleCode })}
        >
          Xem chi tiết
        </Button>
        {isMyTurn && (
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ backgroundColor: roleColor, borderColor: roleColor }}
            onClick={() => onNavigate(targetUrl)}
          >
            Đánh giá
          </Button>
        )}
      </div>
    );
  };

  return {
    title,
    key: roleCode,
    align: "center" as const,
    children: [
      {
        title: "Tiêu chí chung",
        dataIndex: ["evaluationRoleScores", roleCode, "diemTieuChiChung"],
        key: `${roleCode}_tieuChiChung`,
        width: 120,
        align: "center" as const,
        render: (value: number | null | undefined, record: any) =>
          renderRoleScore(value, record),
      },
      {
        title: "Nhiệm vụ",
        dataIndex: ["evaluationRoleScores", roleCode, "diemThucHienNhiemVu"],
        key: `${roleCode}_nhiemVu`,
        width: 120,
        align: "center" as const,
        render: (value: number | null | undefined, record: any) =>
          renderRoleScore(value, record, "#0355a2"),
      },
      {
        title: "Tổng điểm",
        dataIndex: ["evaluationRoleScores", roleCode, "tongDiem"],
        key: `${roleCode}_tongDiem`,
        width: 120,
        align: "center" as const,
        render: (value: number | null | undefined, record: any) =>
          renderRoleScore(value, record, "green", "14px"),
      },
      {
        title: "Thao tác",
        key: `${roleCode}_thaoTac`,
        width: 140,
        align: "center" as const,
        render: renderRoleAction,
      },
    ],
  };
};

export const TheoDoiDanhGiaPhongBanTable: React.FC<TheoDoiDanhGiaPhongBanTableProps> = ({
  data,
  pageIndex,
  pageSize,
  loading,
  accessInfo,
  searchDotId,
  userId,
  onViewDetail,
  onPageChange,
}) => {
  const router = useRouter();

  const tableColumns = useMemo<TableProps<any>["columns"]>(() => {
    const columns: TableProps<any>["columns"] = [
      {
        title: "STT",
        dataIndex: "index",
        key: "index",
        align: "center",
        render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
      },
      {
        title: "Nhân sự",
        dataIndex: "tenChuPhieu",
        key: "tenChuPhieu",
        render: (_: any, record: any) => renderPersonnel(record),
      },
      {
        title: "Trạng thái duyệt",
        dataIndex: "trangThai",
        align: "center",
        render: (_: any, record: any) => renderStatus(record.trangThai),
      },
      {
        title: "Điểm cá nhân đánh giá",
        key: "caNhanDanhGia",
        children: [
          {
            title: "Tiêu chí chung",
            dataIndex: "diemTieuChiChung",
            key: "diemTieuChiChung",
            width: 120,
            align: "center",
            render: (value: number | null | undefined, record: any) => (
              <b>{record.daDanhGia && value != null ? formatScore(value) : "-"}</b>
            ),
          },
          {
            title: "Nhiệm vụ",
            dataIndex: "diemThucHienNhiemVu",
            key: "diemThucHienNhiemVu",
            width: 120,
            align: "center",
            render: (value: number | null | undefined, record: any) => (
              <b style={{ color: "#0355a2" }}>
                {record.daDanhGia && value != null ? formatScore(value) : "-"}
              </b>
            ),
          },
          {
            title: "Tổng điểm",
            dataIndex: "tongDiem",
            key: "tongDiem",
            width: 120,
            align: "center",
            render: (value: number | null | undefined, record: any) => (
              <b style={{ color: "green", fontSize: "14px" }}>
                {record.daDanhGia && value != null ? formatScore(value) : "-"}
              </b>
            ),
          },
          {
            title: "Thao tác",
            key: "caNhanThaoTac",
            width: 140,
            align: "center",
            render: (_: any, record: any) => record.daDanhGia ? (
              <Button
                type="default"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onViewDetail({ ...record, viewMode: "CaNhan" })}
              >
                Xem chi tiết
              </Button>
            ) : <span>-</span>,
          },
        ],
      },
    ];

    (accessInfo?.visibleEvaluationColumns || [])
      .slice()
      .sort((left, right) => left.order - right.order)
      .forEach((column) => {
        columns.push(
          createRoleColumn({
            roleCode: column.roleCode,
            title: column.title,
            targetTrangThai: column.targetStatus,
            roleColor: column.color,
            viewRoleCode: column.viewRoleCode,
            searchDotId,
            userId,
            onViewDetail,
            onNavigate: (url) => router.push(url),
          }),
        );
      });

    return withHeaderStyle(columns);
  }, [
    accessInfo?.visibleEvaluationColumns,
    onViewDetail,
    pageIndex,
    pageSize,
    searchDotId,
    userId,
    router,
  ]);

  return (
    <Card className="customCardShadow">
      <Table
        columns={tableColumns}
        bordered
        dataSource={data?.items || []}
        rowKey={(record) => record.idLyLich || Math.random().toString()}
        scroll={{ x: "max-content" }}
        pagination={false}
        loading={loading}
      />
      <Pagination
        className="mt-3"
        total={data?.totalCount || 0}
        showTotal={(total, range) => `${range[0]}-${range[1]} trong ${total} nhân sự`}
        pageSize={pageSize}
        current={pageIndex}
        onChange={onPageChange}
        size="small"
        align="end"
      />
    </Card>
  );
};

export default TheoDoiDanhGiaPhongBanTable;
