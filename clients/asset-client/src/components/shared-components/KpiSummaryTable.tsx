"use client";

import React from "react";
import { Table, Tag, Typography, Button, Space, Card, ConfigProvider } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { KPI_TongHopTieuChiChungNhanSuDto } from "@/types/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSo";

const { Text } = Typography;

export interface KpiSummaryTableProps {
  dataSource: KPI_TongHopTieuChiChungNhanSuDto[] | any[];
  summaryDataSource?: KPI_TongHopTieuChiChungNhanSuDto[] | any[];
  type?: "Thang" | "Quy";
  title?: React.ReactNode;
  currentUserLyLichId?: string;
  onViewDetail?: (record: any) => void;
  showFullReportLink?: boolean;
  scrollX?: number;
  loading?: boolean;
  cardStyle?: React.CSSProperties;
  defaultExpandAllRows?: boolean;
  missingTaskRoleLabel?: string;
}

export default function KpiSummaryTable({
  dataSource,
  summaryDataSource,
  type = "Thang",
  title,
  currentUserLyLichId,
  onViewDetail,
  showFullReportLink = false,
  scrollX = 1200,
  loading = false,
  cardStyle,
  defaultExpandAllRows = false,
  missingTaskRoleLabel,
}: KpiSummaryTableProps) {
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 75,
      align: "center" as const,
      render: (_: any, record: any, index: number) => {
        if (record.isDepartment) {
          return (
            <span
              style={{
                display: "inline-flex",
                justifyContent: "flex-end",
                width: "calc(100% - 24px)",
                verticalAlign: "middle",
              }}
            >
              <Tag
                color="blue"
                style={{
                  width: 36,
                  marginInlineEnd: 0,
                  paddingInline: 0,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                {record.sttRom || (index + 1)}
              </Tag>
            </span>
          );
        }
        return <Text strong>{record.stt || index + 1}</Text>;
      },
    },
    {
      title: "Họ và tên / Phòng ban",
      dataIndex: "tenNhanSu",
      key: "tenNhanSu",
      width: 190,
      align: "center" as const,

      render: (val: string, record: any) => {
        if (record.isDepartment) {
          return (
            <Text strong style={{ color: "#0355a2", fontSize: "15px" }} className="uppercase tracking-wide">
              {val || "-"}
            </Text>
          );
        }
        return (
          <Space>
            <Text strong style={{ color: "#1f1f1f", fontSize: "14px" }}>
              {val || "-"}
            </Text>
            {currentUserLyLichId && record.lyLichId === currentUserLyLichId && (
              <Tag color="volcano" style={{ borderRadius: "10px" }}>Bạn</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Chức vụ / Số lượng",
      dataIndex: "chucVu_txt",
      key: "chucVu_txt",
      width: 140,
      align: "center" as const,

      render: (val: string, record: any) => {
        if (record.isDepartment) {
          return <Tag color="cyan" style={{ fontWeight: 600 }}>{val || "-"}</Tag>;
        }
        if (record.chucVuColor) {
          return (
            <Tag style={{ backgroundColor: record.chucVuColor, borderColor: record.chucVuColor, borderRadius: "10px", color: "#fff" }}>
              {val || "-"}
            </Tag>
          );
        }
        return <Text type="secondary">{val || "-"}</Text>;
      },
    },
    {
      title: "Điểm nhiệm vụ theo Bộ tiêu chí",
      key: "boTieuChi",
      children: [
        {
          title: "Trong kế hoạch",
          dataIndex: "diemTheoBTC_TrongKeHoach",
          key: "diemTheoBTC_TrongKeHoach",
          width: 130,
          align: "center" as const,
          render: (val: number) => val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0,
        },
        {
          title: "Phát sinh / đột xuất",
          dataIndex: "diemTheoBTC_DamNhanDotXuat",
          key: "diemTheoBTC_DamNhanDotXuat",
          width: 130,
          align: "center" as const,
          render: (val: number) => val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0,
        },
        {
          title: "Tổng thực tế",
          dataIndex: "diemTheoBTC_TongThucTe",
          key: "diemTheoBTC_TongThucTe",
          width: 120,
          align: "center" as const,
          render: (val: number) => (
            <Tag color="blue" style={{ fontWeight: 600, fontSize: "13px" }}>
              {val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0}
            </Tag>
          ),
        },
      ],
    },
    {
      title: "Kết quả thực hiện nhiệm vụ",
      key: "ketQuaNV",
      children: [
        {
          title: "Tỷ lệ hoàn thành (%)",
          dataIndex: "diemTieuChiKetQuaNV_TheoDiem",
          key: "diemTieuChiKetQuaNV_TheoDiem",
          width: 140,
          align: "center" as const,
          render: (val: number) =>
            val != null ? (
              <Tag color="cyan" style={{ fontWeight: 600, fontSize: "13px" }}>
                {Number(val).toFixed(2).replace(/\.00$/, '')}%
              </Tag>
            ) : (
              "-"
            ),
        },
        {
          title: "Điểm quy đổi (Thang 70)",
          dataIndex: "diemTieuChiKetQuaNV_TheoThang",
          key: "diemTieuChiKetQuaNV_TheoThang",
          width: 150,
          align: "center" as const,
          render: (val: number) =>
            val != null ? (
              <Tag color="green" style={{ fontWeight: 700, fontSize: "14px" }}>
                {Number(val).toFixed(2).replace(/\.00$/, '')}
              </Tag>
            ) : (
              "-"
            ),
        },
      ],
    },
    {
      title: "Điểm tiêu chí chung",
      dataIndex: "diemTieuChiChung",
      key: "diemTieuChiChung",
      width: 140,
      align: "center" as const,
      render: (val: number) =>
        val != null ? (
          <Tag color="purple" style={{ fontWeight: 600, fontSize: "13px" }}>
            {Number(val).toFixed(2).replace(/\.00$/, '')}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Ghi chú / Giải trình",
      dataIndex: "ghiChu",
      key: "ghiChu",
      align: "center" as const,

      width: 180,
      render: (val: string, record: any) => {
        const isMissingTaskScore = record.duDiemNhiemVuTheoVaiTro === false;
        return (
          <Space direction="vertical" size={2}>
            <Text type="secondary">{val || "-"}</Text>
            {isMissingTaskScore && (
              <Tag color="warning" style={{ whiteSpace: "normal", marginInlineEnd: 0 }}>
                {record.isDepartment && Number(record.soNhanSuThieuDiem || 0) > 0
                  ? `${record.soNhanSuThieuDiem} nhân sự thiếu điểm nhiệm vụ`
                  : "Thiếu điểm nhiệm vụ"}
                {missingTaskRoleLabel ? ` của ${missingTaskRoleLabel}` : ""}
                {Number(record.soDauRaThieuDiem || 0) > 0 ? ` (${record.soDauRaThieuDiem} đầu ra)` : ""}
              </Tag>
            )}
          </Space>
        );
      },
    },
    ...(onViewDetail
      ? [
        {
          title: "Thao tác",
          key: "action",
          align: "center" as const,
          width: 110,
          render: (_: any, record: any) => record.isDepartment ? null : (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              title="Xem chi tiết phiếu đánh giá"
              onClick={() => onViewDetail(record)}
            >
              Chi tiết
            </Button>
          ),
        },
      ]
      : []),
  ];

  const tableHeaderTitle = title || (
    <div className="flex items-center justify-between">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 4, height: 18, borderRadius: 4, background: '#0355a2', display: 'inline-block', flexShrink: 0 }} />
        <span className="font-bold text-sm uppercase" style={{ color: "#1e3a8a" }}>
          BẢNG TỔNG HỢP KẾT QUẢ THEO DÕI, ĐÁNH GIÁ CẤP PHÒNG BAN
        </span>
      </div>
      {showFullReportLink && (
        <Link href="/kPI_TongHopKetQuaTheoDoi">
          <Button type="link" style={{ color: "#0355a2", padding: 0 }} className="font-semibold underline">
            Xem chi tiết báo cáo đầy đủ &rarr;
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <Card
      title={tableHeaderTitle}
      size="small"
      bordered={false}
      className="kpi-dashboard-card shadow-sm"
      headStyle={{ background: "linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%)", borderBottom: "1px solid #bfdbfe", padding: "14px 20px" }}
      style={{ border: "1px solid #bfdbfe", background: "#ffffff", boxShadow: "0 4px 16px rgba(3, 85, 162, 0.06)", ...cardStyle }}
    >
      <ConfigProvider theme={{ components: { Table: { headerBg: "#f8fafc", headerColor: "#334155" } } }}>
        <Table
          bordered
          columns={columns}
          dataSource={dataSource}
          rowKey={(record) => record.lyLichId || record.id || Math.random().toString()}
          rowClassName={(record: any) =>
            currentUserLyLichId && record.lyLichId === currentUserLyLichId ? "bg-blue-50/70 font-semibold" : ""
          }
          pagination={false}
          expandable={dataSource.some((item: any) => Array.isArray(item.children)) ? { defaultExpandAllRows } : undefined}
          scroll={{ x: scrollX }}
          loading={loading}
          summary={(pageData) => {
            if (!pageData || pageData.length === 0) return null;
            let sumKH = 0, sumDX = 0, sumTT = 0;
            let sumDiem = 0, countDiem = 0;
            let sumThang70 = 0, countThang70 = 0;
            let sumChung = 0, countChung = 0;

            const itemsForSummary = (summaryDataSource || pageData).filter((item: any) => !item.isFormulaRow && !item.isDepartment);

            itemsForSummary.forEach((item: any) => {
              sumKH += item.diemTheoBTC_TrongKeHoach || 0;
              sumDX += item.diemTheoBTC_DamNhanDotXuat || 0;
              sumTT += item.diemTheoBTC_TongThucTe || 0;
              if (item.diemTieuChiKetQuaNV_TheoDiem != null) {
                sumDiem += item.diemTieuChiKetQuaNV_TheoDiem;
                countDiem += 1;
              }
              if (item.diemTieuChiKetQuaNV_TheoThang != null) {
                sumThang70 += item.diemTieuChiKetQuaNV_TheoThang;
                countThang70 += 1;
              }
              if (item.diemTieuChiChung != null) {
                sumChung += item.diemTieuChiChung;
                countChung += 1;
              }
            });

            const count = itemsForSummary.length;
            const avgKH = count > 0 ? (sumKH / count).toFixed(2).replace(/\.00$/, "") : "-";
            const avgDX = count > 0 ? (sumDX / count).toFixed(2).replace(/\.00$/, "") : "-";
            const avgTT = count > 0 ? (sumTT / count).toFixed(2).replace(/\.00$/, "") : "-";
            const avgDiem = countDiem > 0 ? (sumDiem / countDiem).toFixed(2).replace(/\.00$/, "") : "-";
            const avgThang70 = countThang70 > 0 ? (sumThang70 / countThang70).toFixed(2).replace(/\.00$/, "") : "-";
            const avgChung = countChung > 0 ? (sumChung / countChung).toFixed(2).replace(/\.00$/, "") : "-";

            return (
              <Table.Summary.Row className="bg-slate-50 font-semibold">
                <Table.Summary.Cell index={0} align="center">
                  <Text strong>TB / TỔNG</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <Text strong className="text-slate-700 text-center">
                    {`Tổng hợp (${itemsForSummary.length} nhân sự)`}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  <Text strong className="text-slate-700">{avgKH}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  <Text strong className="text-slate-700">{avgDX}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="center">
                  <Tag color="blue" style={{ fontWeight: 600, fontSize: "13px" }}>
                    {avgTT}
                  </Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="center">
                  <Tag color="cyan" style={{ fontWeight: 600, fontSize: "13px" }}>
                    {avgDiem !== "-" ? `${avgDiem}%` : "-"}
                  </Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  <Tag color="green" style={{ fontWeight: 700, fontSize: "14px" }}>
                    {avgThang70}
                  </Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="center">
                  {avgChung !== "-" ? (
                    <Tag color="purple" style={{ fontWeight: 700, fontSize: "13px" }}>
                      {avgChung}
                    </Tag>
                  ) : (
                    "-"
                  )}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9} colSpan={onViewDetail ? 2 : 1} />
              </Table.Summary.Row>
            );
          }}
        />
      </ConfigProvider>
    </Card>
  );
}
