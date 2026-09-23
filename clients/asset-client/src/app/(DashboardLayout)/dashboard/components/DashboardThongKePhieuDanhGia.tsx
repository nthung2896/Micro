"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Select, Space, Spin, Row, Col } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
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

export default function DashboardThongKePhieuDanhGia({
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
            Thống kê điểm phiếu đánh giá
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
        <Row gutter={[32, 24]}>
          <Col xs={24} xl={14}>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 30, right: 24, left: 8, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    allowDecimals={false}
                    label={{ value: "Điểm", angle: -90, position: "insideLeft" }}
                  />
                  <RechartsTooltip content={renderScoreTooltip} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    dataKey="diemThucHienNhiemVu"
                    name="Điểm tiêu chí kết quả thực hiện nhiệm vụ"
                    stackId="diem"
                    fill="#f97316"
                    radius={[0, 0, 0, 0]}
                    onClick={handleChartClick}
                    style={{ cursor: "pointer" }}
                  />
                  <Bar
                    dataKey="diemTieuChiChung"
                    name="Điểm tiêu chí chung"
                    stackId="diem"
                    fill="#1677ff"
                    radius={[6, 6, 0, 0]}
                    onClick={handleChartClick}
                    style={{ cursor: "pointer" }}
                  >
                    <LabelList
                      dataKey="tongDiem"
                      position="top"
                      formatter={(value: any) => `${formatScore(value)}/100`}
                      fill="#1f2937"
                      fontSize={12}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Col>

          {/* Biểu đồ điểm phạt */}
          <Col xs={24} xl={10}>
            <div>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 16, marginTop: 10, fontSize: '14px', textTransform: 'uppercase', textAlign: 'center' }}>
                Thống kê điểm bị trừ (Chậm muộn, Không đạt)
              </div>
              <div style={{ width: "100%", height: 310 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 24, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis
                      allowDecimals={false}
                      label={{ value: "Điểm trừ", angle: -90, position: "insideLeft" }}
                    />
                    <RechartsTooltip
                      formatter={(value: any, name: any) => [`-${formatScore(value)}`, name]}
                    />
                    
                    {/* Thêm div bọc ngoài cùng có paddingLeft: 44px để bù trừ cho chiều rộng của trục YAxis */}
                    <Legend
                      content={(props: any) => {
                        const { payload } = props;
                        return (
                          <div style={{ paddingLeft: "44px" }}>
                            <ul
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                padding: 0,
                                margin: 0,
                                listStyle: "none",
                                paddingTop: "10px",
                                rowGap: "8px",
                                columnGap: "16px",
                              }}
                            >
                              {payload?.map((entry: any, index: number) => (
                                <li
                                  key={`item-${index}`}
                                  style={{ display: "flex", alignItems: "center" }}
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 32 32"
                                    style={{
                                      display: "inline-block",
                                      verticalAlign: "middle",
                                      marginRight: "6px",
                                    }}
                                  >
                                    <path fill={entry.color} d="M0,4h32v24h-32z"></path>
                                  </svg>
                                  <span style={{ color: "#333", fontSize: "12px" }}>
                                    {entry.value}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }}
                    />

                    <Bar dataKey="soLuongKhongHoanThanh" name="Không hoàn thành khối lượng" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="chatLuongKhongDat" name="Không đạt chất lượng" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={25} />
                    <Bar dataKey="tienDoChamMuon" name="Chậm muộn tiến độ" fill="#b91c1c" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>
      </Spin>
    </Card>
  );
}