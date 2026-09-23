"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Empty, Modal, Progress, Select, Spin, Typography, message } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import { ThongKePhieuDanhGiaTheoThangType } from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const CURRENT_YEAR = new Date().getFullYear();

interface PersonnelEvaluationScoreModalProps {
  open: boolean;
  idLyLich: string;
  userId?: string | null;
  hoTen?: string | null;
  onClose: () => void;
}

const formatScore = (value: number | null | undefined) => {
  const score = Number(value ?? 0);
  return score.toFixed(2).replace(/\.?0+$/, "");
};

const hasEvaluation = (item: ThongKePhieuDanhGiaTheoThangType) =>
  Boolean(item.idPhieuDanhGia);

const getEvaluationMonth = (
  items: ThongKePhieuDanhGiaTheoThangType[],
): number | null => {
  const latest = items
    .filter(hasEvaluation)
    .sort((first, second) => second.thang - first.thang)[0];

  return latest?.thang ?? null;
};

const getMetadata = (items: ThongKePhieuDanhGiaTheoThangType[]) => {
  const metadata = items.find(
    (item) => item.tenTieuChiChung || item.tenTieuChiKetQua,
  );

  return {
    tenTieuChiChung: metadata?.tenTieuChiChung || "",
    diemToiDaTieuChiChung: Number(metadata?.diemToiDaTieuChiChung ?? 0),
    tenTieuChiKetQua: metadata?.tenTieuChiKetQua || "",
    diemToiDaTieuChiKetQua: Number(metadata?.diemToiDaTieuChiKetQua ?? 0),
  };
};

export default function PersonnelEvaluationScoreModal({
  open,
  idLyLich,
  userId,
  hoTen,
  onClose,
}: PersonnelEvaluationScoreModalProps) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<
    ThongKePhieuDanhGiaTheoThangType[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const optionYear = CURRENT_YEAR - index;
        return { label: String(optionYear), value: optionYear };
      }),
    [],
  );

  const metadata = useMemo(() => getMetadata(evaluations), [evaluations]);

  const chartData = useMemo(() => {
    const dataByMonth = new Map(
      evaluations.map((item) => [item.thang, item]),
    );
    const metadataSource = evaluations[0];

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return (
        dataByMonth.get(month) || {
          thang: month,
          idPhieuDanhGia: null,
          idDotDanhGia: null,
          tenDotDanhGia: null,
          diemTieuChiChung: null,
          diemThucHienNhiemVu: null,
          tongDiem: null,
          thoiGianTao: null,
          tenTieuChiChung: metadataSource?.tenTieuChiChung || "",
          diemToiDaTieuChiChung:
            metadataSource?.diemToiDaTieuChiChung ?? 0,
          tenTieuChiKetQua: metadataSource?.tenTieuChiKetQua || "",
          diemToiDaTieuChiKetQua:
            metadataSource?.diemToiDaTieuChiKetQua ?? 0,
        }
      );
    });
  }, [evaluations]);

  const selectedEvaluation = useMemo(
    () =>
      selectedMonth === null
        ? null
        : chartData.find((item) => item.thang === selectedMonth) || null,
    [chartData, selectedMonth],
  );

  useEffect(() => {
    if (open) {
      setYear(CURRENT_YEAR);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !idLyLich) return;

    let cancelled = false;
    const routeUserId = userId || EMPTY_GUID;

    const loadEvaluations = async () => {
      setLoading(true);
      setSelectedMonth(null);

      try {
        const response = await kPI_PhieuDanhGiaService.getThongKePhieuDanhGiaTheoThang(
          routeUserId,
          { idLyLich, nam: year },
        );

        if (cancelled) return;

        if (response?.status === false) {
          setEvaluations([]);
          message.error(
            response.message || "Không thể tải lịch sử điểm đánh giá.",
          );
          return;
        }

        const data = Array.isArray(response?.data) ? response.data : [];
        setEvaluations(data);
        setSelectedMonth(getEvaluationMonth(data));
      } catch (error: any) {
        if (!cancelled) {
          setEvaluations([]);
          message.error(
            error?.message || "Không thể tải lịch sử điểm đánh giá.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEvaluations();

    return () => {
      cancelled = true;
    };
  }, [open, idLyLich, userId, year]);

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const item = payload[0]?.payload as ThongKePhieuDanhGiaTheoThangType;
    if (!item) return null;

    if (!hasEvaluation(item)) {
      return (
        <div className="score-history-tooltip">
          <Typography.Text strong>T{item.thang}</Typography.Text>
          <Typography.Text type="secondary" className="score-history-tooltip-empty">
            Chưa có dữ liệu đánh giá
          </Typography.Text>
        </div>
      );
    }

    return (
      <div className="score-history-tooltip">
        <Typography.Text strong>
          Tên đợt đánh giá: {item.tenDotDanhGia || "-"}
        </Typography.Text>
        <Typography.Text type="secondary">T{item.thang}/{year}</Typography.Text>
        <Typography.Text style={{ color: "#1677ff" }}>
          {metadata.tenTieuChiChung}: {formatScore(item.diemTieuChiChung)}/
          {formatScore(metadata.diemToiDaTieuChiChung)}
        </Typography.Text>
        <Typography.Text style={{ color: "#f97316" }}>
          {metadata.tenTieuChiKetQua}: {formatScore(item.diemThucHienNhiemVu)}/
          {formatScore(metadata.diemToiDaTieuChiKetQua)}
        </Typography.Text>
        <Typography.Text strong>
          Tổng điểm: {formatScore(item.tongDiem)}/100
        </Typography.Text>
      </div>
    );
  };

  const renderCriterion = (
    name: string,
    value: number | null | undefined,
    max: number,
    color: string,
  ) => {
    const score = Number(value ?? 0);
    const percent = max > 0 ? Math.min(100, Math.max(0, (score / max) * 100)) : 0;

    return (
      <div className="score-history-criterion">
        <div className="score-history-criterion-header">
          <Typography.Text strong>{name}</Typography.Text>
          <Typography.Text>
            {formatScore(score)}/{formatScore(max)}
          </Typography.Text>
        </div>
        <Progress
          percent={percent}
          showInfo={false}
          strokeColor={color}
          trailColor="#f0f0f0"
        />
      </div>
    );
  };

  const selectMonth = (entry: any, index?: number) => {
    const month =
      entry?.payload?.thang ??
      entry?.thang ??
      (typeof index === "number" ? chartData[index]?.thang : undefined);
    if (typeof month === "number") setSelectedMonth(month);
  };

  const handleChartClick = (state: any) => {
    const activePayload = state?.activePayload?.[0]?.payload;
    const month =
      activePayload?.thang ??
      (typeof state?.activeTooltipIndex === "number"
        ? chartData[state.activeTooltipIndex]?.thang
        : undefined);

    if (typeof month === "number") setSelectedMonth(month);
  };

  return (
    <Modal
      className="score-history-modal"
      open={open}
      onCancel={onClose}
      footer={null}
      width="90vw"
      zIndex={1100}
      destroyOnClose
      title={
        <div className="score-history-modal-title">
          <div>
            <Typography.Title level={4}>{hoTen || "Nhân sự"}</Typography.Title>
            <Typography.Text type="secondary">
              Chi tiết điểm đánh giá năm {year}
            </Typography.Text>
          </div>
          <Select
            value={year}
            options={yearOptions}
            onChange={setYear}
            aria-label="Năm đánh giá"
            style={{ width: 130 }}
          />
        </div>
      }
    >
      <Spin spinning={loading}>
        {!loading && !chartData.some(hasEvaluation) ? (
          <Empty description="Không có dữ liệu đánh giá trong năm đã chọn." />
        ) : (
          <div className="score-history-grid">
            <section className="score-history-chart-panel">
              <div className="score-history-chart-scroll">
                <ResponsiveContainer width="100%" height={390}>
                  <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 18, left: 12, bottom: 44 }}
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="thang"
                    interval={0}
                    tickFormatter={(value) => `T${value}`}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    allowDecimals={false}
                    label={{ value: "Điểm", angle: -90, position: "insideLeft" }}
                  />
                  <RechartsTooltip content={renderTooltip} />
                  <Legend />
                  <Bar
                    dataKey="diemTieuChiChung"
                    name={metadata.tenTieuChiChung}
                    stackId="score"
                    fill="#1677ff"
                    radius={[0, 0, 0, 0]}
                    onClick={selectMonth}
                  >
                    {chartData.map((item) => (
                      <Cell
                        key={`common-${item.thang}`}
                        fill="#1677ff"
                        fillOpacity={selectedMonth === item.thang ? 1 : 0.58}
                        stroke={selectedMonth === item.thang ? "#0958d9" : undefined}
                        strokeWidth={selectedMonth === item.thang ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="diemThucHienNhiemVu"
                    name={metadata.tenTieuChiKetQua}
                    stackId="score"
                    fill="#f97316"
                    radius={[6, 6, 0, 0]}
                    onClick={selectMonth}
                  >
                    {chartData.map((item) => (
                      <Cell
                        key={`result-${item.thang}`}
                        fill="#f97316"
                        fillOpacity={selectedMonth === item.thang ? 1 : 0.58}
                        stroke={selectedMonth === item.thang ? "#c2410c" : undefined}
                        strokeWidth={selectedMonth === item.thang ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="score-history-detail-panel">
              {!selectedEvaluation || !hasEvaluation(selectedEvaluation) ? (
                <Empty description="Chưa có dữ liệu đánh giá cho tháng đã chọn." />
              ) : (
                <>
                  <Typography.Title level={4}>
                    Tên đợt đánh giá: {selectedEvaluation.tenDotDanhGia || "-"}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Cập nhật: {selectedEvaluation.thoiGianTao
                      ? new Date(selectedEvaluation.thoiGianTao).toLocaleDateString("vi-VN")
                      : "-"}
                  </Typography.Text>
                  <div className="score-history-total">
                    <Typography.Text type="secondary">Tổng điểm</Typography.Text>
                    <Typography.Title level={2}>
                      {formatScore(selectedEvaluation.tongDiem)}/100
                    </Typography.Title>
                  </div>
                  {renderCriterion(
                    metadata.tenTieuChiChung,
                    selectedEvaluation.diemTieuChiChung,
                    metadata.diemToiDaTieuChiChung,
                    "#1677ff",
                  )}
                  {renderCriterion(
                    metadata.tenTieuChiKetQua,
                    selectedEvaluation.diemThucHienNhiemVu,
                    metadata.diemToiDaTieuChiKetQua,
                    "#f97316",
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </Spin>

      <style jsx global>{`
        .score-history-modal,
        .score-history-modal .ant-modal {
          max-width: 1400px;
          margin: 0 auto;
        }
        .score-history-modal-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-right: 48px;
        }
        .score-history-modal-title > .ant-select {
          margin-right: 24px;
        }
        .score-history-modal-title .ant-typography {
          margin: 0;
          color: #fff !important;
        }
        .score-history-modal .ant-modal-close {
          color: #fff;
        }
        .score-history-grid {
          display: grid;
          grid-template-columns: minmax(0, 55fr) minmax(320px, 45fr);
          gap: 24px;
          align-items: stretch;
        }
        .score-history-chart-panel,
        .score-history-detail-panel {
          min-width: 0;
          border: 1px solid #f0f0f0;
          border-radius: 10px;
          padding: 16px;
        }
        .score-history-chart-scroll {
          width: 100%;
          overflow-x: hidden;
        }
        .score-history-chart {
          width: 100%;
        }
        .score-history-detail-panel {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .score-history-total {
          margin: 24px 0;
          padding: 16px;
          border-radius: 10px;
          background: #f5f7fa;
        }
        .score-history-criterion {
          margin-top: 22px;
        }
        .score-history-criterion-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }
        .score-history-tooltip {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 250px;
          padding: 10px 12px;
          background: #fff;
          border: 1px solid #d9d9d9;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
        .score-history-tooltip-empty {
          margin-top: 4px;
        }
        @media (max-width: 991px) {
          .score-history-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 575px) {
          .score-history-modal-title {
            align-items: flex-start;
            flex-direction: column;
            padding-right: 0;
          }
          .score-history-modal-title > .ant-select {
            margin-right: 0;
          }
        }
      `}</style>
    </Modal>
  );
}
