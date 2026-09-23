"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Select, Space, Spin, Table, Button } from "antd";
import { FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ModalChiTietNhiemVu from "./ModalChiTietNhiemVu";
import ModalXemBoTieuChi from "@/app/(DashboardLayout)/kPI_BieuChamDiem/ModalXemBoTieuChi";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import { ThongKePhieuDanhGiaTheoThangType } from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";

interface DashboardThongKePhieuDanhGiaProps {
  userId?: string | null;
  idLyLich?: string | null;
  onOpenDetail?: (item: ThongKePhieuDanhGiaTheoThangType) => void;
}

const formatScore = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "0";
  return Number(value)
    .toFixed(2)
    .replace(/\.?(0+)$/, "");
};

export default function DashboardThongKeThanhPhan({
  userId,
  idLyLich,
  onOpenDetail,
}: DashboardThongKePhieuDanhGiaProps) {
  const currentYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [statistics, setStatistics] = useState<
    ThongKePhieuDanhGiaTheoThangType[]
  >([]);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // State cho Modal chi tiết nhiệm vụ
  const [chiTietModalVisible, setChiTietModalVisible] = useState(false);
  const [selectedChiTietData, setSelectedChiTietData] = useState<{ idLyLich: string, idDotDanhGia: string, month: number } | null>(null);

  // State cho Modal xem bộ tiêu chí
  const [boTieuChiModalVisible, setBoTieuChiModalVisible] = useState(false);
  const [selectedDotDanhGiaBoTieuChi, setSelectedDotDanhGiaBoTieuChi] = useState<string | null>(null);

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const year = currentYear - index;
        return { label: String(year), value: year };
      }),
    [currentYear]
  );

  const chartData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const statistic = statistics.find((item) => item.thang === month);
        const metadata = statistics[0];

        return {
          thang: month,
          label: `T${month}`,
          diemTieuChiChung: statistic?.diemTieuChiChung ?? 0,
          diemThucHienNhiemVu: statistic?.diemThucHienNhiemVu ?? 0,
          tongDiem: statistic?.tongDiem ?? 0,
          idPhieuDanhGia: statistic?.idPhieuDanhGia || null,
          idDotDanhGia: statistic?.idDotDanhGia || null,
          tenDotDanhGia: statistic?.tenDotDanhGia || null,
          tenTieuChiChung:
            statistic?.tenTieuChiChung || metadata?.tenTieuChiChung || "Điểm tiêu chí chung",
          diemToiDaTieuChiChung:
            statistic?.diemToiDaTieuChiChung ?? metadata?.diemToiDaTieuChiChung ?? 30,
          tenTieuChiKetQua:
            statistic?.tenTieuChiKetQua || metadata?.tenTieuChiKetQua || "Điểm tiêu chí kết quả thực hiện nhiệm vụ",
          diemToiDaTieuChiKetQua:
            statistic?.diemToiDaTieuChiKetQua ?? metadata?.diemToiDaTieuChiKetQua ?? 70,
          diemTheoBoTieuChi: statistic?.diemTheoBoTieuChi ?? null,
          diemSoLuong: statistic?.diemSoLuong ?? null,
          diemChatLuong: statistic?.diemChatLuong ?? null,
          diemTienDo: statistic?.diemTienDo ?? null,
        };
      }),
    [statistics]
  );

  const tableColumns = useMemo(() => [
    {
      title: 'Thành phần điểm',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 200,
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    ...Array.from({ length: 12 }, (_, i) => {
      const monthData = chartData[i];
      const hasBoTieuChi = monthData?.idDotDanhGia != null;

      return {
        title: (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: 13, color: '#fff' }}>T{i + 1}</span>
            {hasBoTieuChi && (
              <Button
                type="default"
                size="small"
                icon={<EyeOutlined />}
                style={{ 
                  fontSize: 10, 
                  height: 20, 
                  lineHeight: '18px',
                  padding: '0 6px',
                  backgroundColor: '#fff',
                  color: '#00539f',
                  border: 'none',
                  fontWeight: 600,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Xem bộ tiêu chí đang áp dụng"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDotDanhGiaBoTieuChi(monthData.idDotDanhGia);
                  setBoTieuChiModalVisible(true);
                }}
              >
                Bộ tiêu chí
              </Button>
            )}
          </div>
        ),
        dataIndex: `t${i + 1}`,
        key: `t${i + 1}`,
        align: 'center' as const,
        width: 70,
      };
    })
  ], [chartData]);

  const tableData = useMemo(() => {
    const rowBoTieuChi: any = { key: '1', name: 'Điểm theo bộ tiêu chí' };
    const rowSoLuong: any = { key: '2', name: 'Điểm số lượng' };
    const rowChatLuong: any = { key: '3', name: 'Điểm chất lượng' };
    const rowTienDo: any = { key: '4', name: 'Điểm tiến độ' };

    chartData.forEach((item) => {
      const monthKey = `t${item.thang}`;
      const total = item.diemTheoBoTieuChi;
      
      rowBoTieuChi[monthKey] = total != null ? (
        <div 
          style={{ 
            fontWeight: 600, 
            cursor: item.idPhieuDanhGia ? 'pointer' : 'default',
            color: item.idPhieuDanhGia ? '#1677ff' : 'inherit',
          }}
          onClick={() => {
            if (item.idPhieuDanhGia && item.idDotDanhGia && idLyLich) {
              setSelectedChiTietData({
                idLyLich: idLyLich,
                idDotDanhGia: item.idDotDanhGia,
                month: item.thang
              });
              setChiTietModalVisible(true);
            }
          }}
          title={item.idPhieuDanhGia ? "Xem chi tiết nhiệm vụ và điểm map sang" : ""}
        >
          {formatScore(total)}
        </div>
      ) : '-';
      
      const renderScorePercent = (score: number | null) => {
        if (score == null) return '-';
        if (total != null && total > 0) {
          const percent = ((score / total) * 100).toFixed(2);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span>{formatScore(score)}</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>({percent}%)</span>
            </div>
          );
        }
        return formatScore(score);
      };

      rowSoLuong[monthKey] = renderScorePercent(item.diemSoLuong);
      rowChatLuong[monthKey] = renderScorePercent(item.diemChatLuong);
      rowTienDo[monthKey] = renderScorePercent(item.diemTienDo);
    });

    return [rowBoTieuChi, rowSoLuong, rowChatLuong, rowTienDo];
  }, [chartData, idLyLich]);

  useEffect(() => {
    let cancelled = false;

    const fetchStatistics = async () => {
      if (!userId || !idLyLich) {
        setStatistics([]);
        return;
      }

      setStatisticsLoading(true);
      try {
        const response =
          await kPI_PhieuDanhGiaService.getThongKePhieuDanhGiaTheoThang(
            userId,
            {
              idLyLich,
              nam: selectedYear,
            }
          );

        if (!cancelled) {
          setStatistics(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setStatistics([]);
          console.error("Lỗi khi load điểm phiếu đánh giá:", error);
        }
      } finally {
        if (!cancelled) {
          setStatisticsLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      cancelled = true;
    };
  }, [userId, idLyLich, selectedYear]);

  const handleChartClick = (entry: any) => {
    const data = entry?.payload || entry?.activePayload?.[0]?.payload || entry;

    if (!data?.idPhieuDanhGia || !data?.idDotDanhGia) return;
    onOpenDetail?.({ ...data, thang: data.thang } as ThongKePhieuDanhGiaTheoThangType);
  };

  const renderScoreTooltip = (props: any) => {
    const { active, payload } = props;
    if (!active || !payload?.length) return null;

    const data = payload[0]?.payload as ThongKePhieuDanhGiaTheoThangType & {
      label: string;
    };
    const hasEvaluation = Boolean(data?.idPhieuDanhGia);

    if (!hasEvaluation) {
      return (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d9d9d9",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
            padding: "10px 12px",
          }}
        >
          <div style={{ fontWeight: 600 }}>{data?.label} / {selectedYear}</div>
          <div style={{ color: "#8c8c8c", marginTop: 4 }}>
            Chưa có dữ liệu đánh giá
          </div>
        </div>
      );
    }

    const commonName = data?.tenTieuChiChung || "Điểm tiêu chí chung";
    const resultName =
      data?.tenTieuChiKetQua || "Điểm tiêu chí kết quả thực hiện nhiệm vụ";
    const commonMax = data?.diemToiDaTieuChiChung ?? 30;
    const resultMax = data?.diemToiDaTieuChiKetQua ?? 70;

    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #d9d9d9",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          padding: "10px 12px",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          {data?.label} / {selectedYear}
        </div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          Điểm tiêu chí
        </div>
        <div style={{ color: "#1677ff" }}>
          {commonName}: {formatScore(data?.diemTieuChiChung)}/{formatScore(commonMax)}
        </div>
        <div style={{ color: "#f97316" }}>
          {resultName}: {formatScore(data?.diemThucHienNhiemVu)}/{formatScore(resultMax)}
        </div>
        <div style={{ fontWeight: 600, marginTop: 4 }}>
          Tổng điểm: {formatScore(data?.tongDiem)}/100
        </div>
        <div
          style={{
            borderTop: "1px solid #d9d9d9",
            margin: "8px 0",
          }}
        />
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          Kết quả thực hiện nhiệm vụ
        </div>
        <div>Điểm theo Bộ tiêu chí: {formatScore(data?.diemTheoBoTieuChi)}</div>
        <div style={{ paddingLeft: 8, marginTop: 4, color: "#4b5563" }}>
          <span style={{ display: 'inline-block', width: '120px' }}>- Điểm số lượng:</span> <span style={{ fontWeight: 500, color: '#1f2937' }}>{formatScore(data?.diemSoLuong)}</span>
          {Number(data?.soLuongKhongHoanThanh) > 0 && <span style={{ color: "#ef4444", fontSize: "12px", marginLeft: 4 }}>(Không HT: -{formatScore(data?.soLuongKhongHoanThanh)})</span>}
        </div>
        <div style={{ paddingLeft: 8, color: "#4b5563" }}>
          <span style={{ display: 'inline-block', width: '120px' }}>- Điểm chất lượng:</span> <span style={{ fontWeight: 500, color: '#1f2937' }}>{formatScore(data?.diemChatLuong)}</span>
          {Number(data?.chatLuongKhongDat) > 0 && <span style={{ color: "#ef4444", fontSize: "12px", marginLeft: 4 }}>(Không đạt: -{formatScore(data?.chatLuongKhongDat)})</span>}
        </div>
        <div style={{ paddingLeft: 8, color: "#4b5563" }}>
          <span style={{ display: 'inline-block', width: '120px' }}>- Điểm tiến độ:</span> <span style={{ fontWeight: 500, color: '#1f2937' }}>{formatScore(data?.diemTienDo)}</span>
          {Number(data?.tienDoChamMuon) > 0 && <span style={{ color: "#ef4444", fontSize: "12px", marginLeft: 4 }}>(Chậm: -{formatScore(data?.tienDoChamMuon)})</span>}
        </div>
      </div>
    );
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '16px', textTransform: 'uppercase' }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Xu hướng điểm thành phần nhiệm vụ
          </span>
        </div>
      }
      extra={
        <Select
          aria-label="Chọn năm thống kê điểm phiếu đánh giá"
          value={selectedYear}
          options={yearOptions}
          onChange={setSelectedYear}
          style={{ width: 110 }}
        />
      }
      style={{
        height: "100%",
        borderRadius: "16px",
        border: "none",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        overflow: 'hidden'
      }}
      headStyle={{ background: '#1677ff', borderBottom: 'none' }}
    >
      <Spin spinning={statisticsLoading}>

        {/* Biểu đồ điểm thành phần nhiệm vụ */}
        <div style={{ marginTop: 12 }}>
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis
                  allowDecimals={false}
                  label={{ value: "Điểm", angle: -90, position: "insideLeft" }}
                />
                <RechartsTooltip
                  formatter={(value: any, name: any, props: any) => {
                    if (name === "Điểm theo bộ tiêu chí") return [formatScore(value), name];
                    const total = props.payload.diemTheoBoTieuChi;
                    if (total != null && total > 0 && value != null) {
                      const percent = ((Number(value) / Number(total)) * 100).toFixed(2);
                      return [`${formatScore(value)} (${percent}%)`, name];
                    }
                    return [formatScore(value), name];
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="diemTheoBoTieuChi" name="Điểm theo bộ tiêu chí" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="diemSoLuong" name="Điểm số lượng" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="diemChatLuong" name="Điểm chất lượng" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="diemTienDo" name="Điểm tiến độ" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bảng ma trận điểm */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontWeight: 700, color: '#374151', marginBottom: 16, fontSize: '14px', textTransform: 'uppercase' }}>
            Bảng ma trận điểm chi tiết theo tháng
          </div>
          <Table 
            columns={tableColumns} 
            dataSource={tableData} 
            pagination={false} 
            size="small" 
            scroll={{ x: 800 }} 
            bordered
          />
        </div>
      </Spin>

      <ModalChiTietNhiemVu
        visible={chiTietModalVisible}
        onClose={() => setChiTietModalVisible(false)}
        idLyLich={selectedChiTietData?.idLyLich || ''}
        idDotDanhGia={selectedChiTietData?.idDotDanhGia || ''}
        month={selectedChiTietData?.month || 1}
      />

      <ModalXemBoTieuChi
        visible={boTieuChiModalVisible}
        onClose={() => setBoTieuChiModalVisible(false)}
        idDotDanhGia={selectedDotDanhGiaBoTieuChi}
      />
    </Card>
  );
}
