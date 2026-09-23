"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Empty, Select, Space, Spin, Tag, Typography, message } from "antd";
import { FileTextOutlined, WarningFilled, UserOutlined } from "@ant-design/icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSelector } from "@/store/hooks";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import kPI_DashboardService from "@/services/kPI_Dashboard/kPI_DashboardService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import { DropdownOption } from "@/types/general";
import { ThongKeDiemNhanSuType } from "@/types/kPI_Dashboard/dto";

const { Text } = Typography;

const formatScore = (value: number | null | undefined) => {
  if (value == null) return "-";
  const score = Number(value);
  return score.toFixed(2).replace(/\.?(0+)$/, "");
};

const normalizeOptions = (items: any): DropdownOption[] => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      label: String(item?.label ?? item?.Label ?? ""),
      value: String(item?.value ?? item?.Value ?? ""),
    }))
    .filter((item) => item.label && item.value);
};

const shortenName = (name: string) =>
  name.length > 18 ? `${name.slice(0, 16)}…` : name;

const EmptyDropdown = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="Không có dữ liệu"
    style={{ margin: "8px 0" }}
  />
);

export default function DashboardThongKeDiemNhanSuTheoChucVu() {
  const currentUser = useSelector((state: any) => state.auth.User);
  const isAllowed = Boolean(currentUser?.isCT || currentUser?.isPCT);

  const [chucVuCode, setChucVuCode] = useState<string>();
  const [idDotDanhGia, setIdDotDanhGia] = useState<string>();
  const [vaiTroDanhGia, setVaiTroDanhGia] = useState<string>();
  const vaiTroDanhGiaLabel = useMemo(() => ({
    CaNhan: "Cá nhân",
    PhoTruongPhong: "Phó Trưởng phòng",
    TruongPhong: "Trưởng phòng",
    PhoCucTruong: "Phó Cục trưởng",
    CucTruong: "Cục trưởng",
  } as Record<string, string>)[vaiTroDanhGia || ""] || vaiTroDanhGia || "vai trò đã chọn", [vaiTroDanhGia]);
  const [chucVuOptions, setChucVuOptions] = useState<DropdownOption[]>([]);
  const [dotOptions, setDotOptions] = useState<DropdownOption[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statistics, setStatistics] = useState<ThongKeDiemNhanSuType[]>([]);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const [chartViewportWidth, setChartViewportWidth] = useState(0);

  useEffect(() => {
    if (!isAllowed) return;

    let cancelled = false;

    const loadFilters = async () => {
      setFilterLoading(true);
      try {
        const [chucVuResponse, activeDots] = await Promise.all([
          duLieuDanhMucService.getDropdownCode("CHUCVUVNU"),
          kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown(true),
        ]);

        if (cancelled) return;

        setChucVuOptions(normalizeOptions(chucVuResponse?.data));
        setDotOptions(normalizeOptions(activeDots));
      } catch (error: any) {
        if (!cancelled) {
          message.error(error?.message || "Không thể tải dữ liệu bộ lọc.");
        }
      } finally {
        if (!cancelled) setFilterLoading(false);
      }
    };

    loadFilters();

    return () => {
      cancelled = true;
    };
  }, [isAllowed]);

  useEffect(() => {
    let cancelled = false;

    if (!chucVuCode || !idDotDanhGia) {
      setStatistics([]);
      return;
    }

    const loadStatistics = async () => {
      setStatisticsLoading(true);

      try {
        const response = await kPI_DashboardService.getThongKeDiemNhanSu(
          chucVuCode,
          idDotDanhGia,
          vaiTroDanhGia,
        );

        if (cancelled) return;

        if (response?.status === false) {
          setStatistics([]);
          message.error(response.message || "Không thể tải thống kê điểm.");
          return;
        }

        setStatistics(Array.isArray(response?.data) ? response.data : []);
      } catch (error: any) {
        if (!cancelled) {
          setStatistics([]);
          message.error(error?.message || "Không thể tải thống kê điểm.");
        }
      } finally {
        if (!cancelled) setStatisticsLoading(false);
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [chucVuCode, idDotDanhGia, vaiTroDanhGia]);

  useEffect(() => {
    const chartWrapper = chartWrapperRef.current;
    if (!chartWrapper) return;

    const updateChartViewportWidth = () => {
      setChartViewportWidth(chartWrapper.clientWidth);
    };

    updateChartViewportWidth();
    const resizeObserver = new ResizeObserver(updateChartViewportWidth);
    resizeObserver.observe(chartWrapper);

    return () => resizeObserver.disconnect();
  }, [statistics.length]);

  const chartColumnWidth = 110;
  const chartWidth = useMemo(() => {
    return Math.max(
      chartViewportWidth,
      statistics.length * chartColumnWidth,
      900,
    );
  }, [chartViewportWidth, statistics.length]);

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const employee = payload[0]?.payload as ThongKeDiemNhanSuType;
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #d9d9d9",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          padding: "10px 12px",
          minWidth: 230,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          {employee?.hoTen || "Chưa có tên"}
        </div>
        <div style={{ color: "#6b7280", marginBottom: 6 }}>
          {employee?.tenDotDanhGia || "Đợt đánh giá"}
        </div>
        <div style={{ color: "#f97316" }}>
          Điểm tiêu chí kết quả: {formatScore(employee?.diemTieuChiKetQua)}/70
        </div>
        <div style={{ color: "#1677ff" }}>
          Điểm tiêu chí chung: {formatScore(employee?.diemTieuChiChung)}/30
        </div>
        <div style={{ fontWeight: 700, marginTop: 6 }}>
          Tổng điểm: {formatScore(employee?.tongDiem)}/100
        </div>
        {employee?.duDiemNhiemVuTheoVaiTro === false && (
          <div style={{ color: "#d97706", marginTop: 8, fontWeight: 600 }}>
            <WarningFilled /> Thiếu điểm nhiệm vụ của {vaiTroDanhGiaLabel}: {employee.soDauRaThieuDiem || 0} đầu ra.
          </div>
        )}
      </div>
    );
  };

  const selectProps = {
    showSearch: true,
    allowClear: true,
    optionFilterProp: "label",
    notFoundContent: <EmptyDropdown />,
    loading: filterLoading,
  };

  if (!isAllowed) return null;

  return (
    <Card
      className="kpi-dashboard-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 4, height: 18, borderRadius: 4, background: '#1d4ed8', display: 'inline-block', flexShrink: 0 }} />
          <UserOutlined style={{ color: "#1d4ed8", fontSize: 18 }} />
          <span style={{ color: "#1e3a8a", fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
            THỐNG KÊ ĐIỂM ĐÁNH GIÁ NHÂN SỰ THEO CHỨC VỤ
          </span>
        </div>
      }
      headStyle={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderBottom: "1px solid #bfdbfe", padding: "14px 20px" }}
      style={{
        marginTop: 32,
        marginBottom: 32,
        border: "1px solid #bfdbfe",
        background: "#ffffff",
        boxShadow: "0 4px 16px rgba(30, 58, 138, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <Text strong>Chức vụ:</Text>
        <Select
          {...selectProps}
          value={chucVuCode}
          placeholder="Chọn chức vụ"
          options={chucVuOptions}
          onChange={(value) => setChucVuCode(value || undefined)}
          style={{ width: 220 }}
        />

        <Text strong>Đợt đánh giá:</Text>
        <Select
          {...selectProps}
          value={idDotDanhGia}
          placeholder="Chọn đợt đánh giá"
          options={dotOptions}
          onChange={(value) => setIdDotDanhGia(value || undefined)}
          style={{ width: 280 }}
        />

        <Text strong>Vai trò đánh giá:</Text>
        <Select
          allowClear
          value={vaiTroDanhGia}
          placeholder="Tất cả vai trò / Điểm trên phiếu"
          options={[
            { value: "CaNhan", label: "Cá nhân tự đánh giá" },
            { value: "PhoTruongPhong", label: "Phó Trưởng phòng đánh giá" },
            { value: "TruongPhong", label: "Trưởng phòng đánh giá" },
            { value: "PhoCucTruong", label: "Phó Cục trưởng đánh giá" },
            { value: "CucTruong", label: "Cục trưởng đánh giá" },
          ]}
          onChange={(value) => setVaiTroDanhGia(value || undefined)}
          style={{ width: 260 }}
        />
      </div>

      {!chucVuCode || !idDotDanhGia ? (
        <Empty description="Vui lòng chọn chức vụ và đợt đánh giá để xem thống kê." />
      ) : (
        <Spin spinning={statisticsLoading} tip="Đang tải thống kê điểm...">
          {statistics.some((item) => item.duDiemNhiemVuTheoVaiTro === false) && (
            <div style={{ marginBottom: 12 }}>
              <Tag color="warning" icon={<WarningFilled />} style={{ padding: "6px 10px", whiteSpace: "normal" }}>
                Có {statistics.filter((item) => item.duDiemNhiemVuTheoVaiTro === false).length} nhân sự thiếu điểm nhiệm vụ của {vaiTroDanhGiaLabel}. Các điểm thiếu được giữ trống.
              </Tag>
            </div>
          )}
          {!statistics.length ? (
            <Empty description="Không có nhân sự có phiếu trong đợt đánh giá đã chọn." />
          ) : (
            <div
              ref={chartWrapperRef}
              style={{
                position: "relative",
                width: "100%",
                overflowX: "auto",
                paddingBottom: 8,
              }}
            >
              <BarChart
                width={chartWidth}
                // Giữ vùng plot cao tương đương biểu đồ phía trên; domain Y vẫn cố định 0-100
                // để chiều cao cột phản ánh đúng tỷ lệ điểm thực tế.
                height={440}
                data={statistics}
                margin={{ top: 36, right: 24, left: 8, bottom: 72 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="hoTen"
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={80}
                  tickFormatter={(value) => shortenName(String(value || ""))}
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
                  dataKey="diemTieuChiKetQua"
                  name="Điểm tiêu chí kết quả"
                  stackId="score"
                  fill="#f97316"
                  barSize={60}
                />
                <Bar
                  dataKey="diemTieuChiChung"
                  name="Điểm tiêu chí chung"
                  stackId="score"
                  fill="#1677ff"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                >
                  <LabelList
                    dataKey="tongDiem"
                    position="top"
                    formatter={(value: any) => formatScore(value)}
                    fill="#1f2937"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </div>
          )}
        </Spin>
      )}
    </Card>
  );
}
