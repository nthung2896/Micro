"use client";

import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import { apiService } from "@/services/index";
import quanLyThongKeService from "@/services/quanLyThongKe/quanLyThongKe.service";
import {
  ThongKePhanAnhVaViPhamDetailItem,
  ThongKePhanAnhVaViPhamDto,
} from "@/types/quanLyThongKe/dto";
import { SearchOutlined, SyncOutlined, FileExcelOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TableWithTopScroll from "../TableWithTopScroll";
import ThongKePhanAnhVaViPhamDetailModal from "./ThongKePhanAnhVaViPhamDetailModal";
import {
  FIXED_LEFT_WIDTH,
  METRIC_COLUMN_WIDTH,
  TABLE_BODY_HEIGHT,
  TABLE_SCROLL_X,
  THONG_KE_GRAND_TOTAL_LABEL,
  THONG_KE_PHAN_ANH_METRIC_COLUMNS,
  THONG_KE_STT_COLUMN_WIDTH,
  THONG_KE_VI_PHAM_METRIC_COLUMNS,
  ThongKePhanAnhVaViPhamGroupedRow,
  ThongKePhanAnhVaViPhamMetricKey,
  buildGroupedTableRows,
  formatDepartmentDisplayName,
  getMetricLabel,
  getMetricValue,
  isViPhamMetric,
} from "./constants";
import "./page.css";

const { Text } = Typography;

interface SctDepartmentOption {
  id: string;
  name: string;
  shortName?: string;
  code: string;
}

type BodyTableRecord = Exclude<ThongKePhanAnhVaViPhamGroupedRow, { type: "total" }>;
type DataTableRecord = Extract<BodyTableRecord, { type: "data" }>;

interface DetailModalContext {
  departmentId: string;
  departmentIds?: string[];
  departmentName: string;
  metricKey: ThongKePhanAnhVaViPhamMetricKey;
  year?: number;
}

const headerCellStyle: React.CSSProperties = {
  background: "#4472C4",
  color: "#fff",
  fontWeight: 600,
  textAlign: "center",
  borderColor: "#fff",
  whiteSpace: "normal",
  lineHeight: 1.3,
  padding: "8px 6px",
};

const regionCellStyle: React.CSSProperties = {
  background: "#E9EDF5",
  fontWeight: 700,
  fontSize: 13,
  padding: "8px 12px",
  textAlign: "left",
};

const ThongKePhanAnhVaViPhamPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(dayjs().year());
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SctDepartmentOption[]>([]);
  const [data, setData] = useState<ThongKePhanAnhVaViPhamDto[]>([]);
  const [grandTotal, setGrandTotal] = useState<ThongKePhanAnhVaViPhamDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [detailModalTitle, setDetailModalTitle] = useState("");
  const [detailModalSubtitle, setDetailModalSubtitle] = useState("");
  const [detailModalData, setDetailModalData] = useState<ThongKePhanAnhVaViPhamDetailItem[]>([]);
  const [detailModalTotal, setDetailModalTotal] = useState(0);
  const [detailModalPageIndex, setDetailModalPageIndex] = useState(1);
  const [detailModalPageSize, setDetailModalPageSize] = useState(10);
  const [detailModalContext, setDetailModalContext] = useState<DetailModalContext | null>(null);

  const initialLoadStartedRef = useRef(false);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await apiService.get<SctDepartmentOption[]>("/HomeBlock/SctDepartments");
      if (res?.data) {
        setDepartmentOptions(res.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách Sở");
    }
  }, []);

  const fetchData = useCallback(
    async (year: number | null, departmentIds: string[]) => {
      setLoading(true);
      try {
        const res = await quanLyThongKeService.getThongKePhanAnhVaViPham({
          year: year ?? undefined,
          departmentIds: departmentIds.length > 0 ? departmentIds : undefined,
        });

        if (res?.status && res.data) {
          setData(res.data.items ?? []);
          setGrandTotal(res.data.total ?? null);
        } else {
          message.error(res?.message || "Lấy dữ liệu thống kê thất bại");
          setData([]);
          setGrandTotal(null);
        }
      } catch {
        message.error("Có lỗi xảy ra khi tải dữ liệu thống kê");
        setData([]);
        setGrandTotal(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadDetailModalData = useCallback(
    async (context: DetailModalContext, pageIndex: number, pageSize: number) => {
      setDetailModalLoading(true);
      try {
        const res = await quanLyThongKeService.getThongKePhanAnhVaViPhamDetail({
          departmentId: context.departmentId,
          departmentIds: context.departmentIds,
          metricKey: context.metricKey,
          year: context.year,
          pageIndex,
          pageSize,
        });

        if (res?.status && res.data) {
          setDetailModalData(res.data.items || []);
          setDetailModalTotal(res.data.totalCount || 0);
        } else {
          message.error(res?.message || "Lấy danh sách chi tiết thất bại");
          setDetailModalData([]);
          setDetailModalTotal(0);
        }
      } catch {
        message.error("Có lỗi xảy ra khi tải danh sách chi tiết");
        setDetailModalData([]);
        setDetailModalTotal(0);
      } finally {
        setDetailModalLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    if (initialLoadStartedRef.current) return;
    initialLoadStartedRef.current = true;
    fetchData(selectedYear, []);
  }, [fetchData, selectedYear]);

  const handleSearch = () => {
    fetchData(selectedYear, selectedDepartmentIds);
  };

  const handleReset = () => {
    const currentYear = dayjs().year();
    setSelectedYear(currentYear);
    setSelectedDepartmentIds([]);
    fetchData(currentYear, []);
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await quanLyThongKeService.exportThongKePhanAnhVaViPham({
        year: selectedYear ?? undefined,
        departmentIds: selectedDepartmentIds.length > 0 ? selectedDepartmentIds : undefined,
      });

      if (res?.status && res.data) {
        const fileYearPart = selectedYear ? String(selectedYear) : "TatCa";
        downloadFileFromBase64(
          res.data,
          `ThongKePhanAnhVaViPham_${fileYearPart}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
        );
        message.success(res.message || "Xuất file Excel thành công");
      } else {
        message.error(res?.message || "Xuất Excel thất bại");
      }
    } catch {
      message.error("Có lỗi xảy ra khi xuất Excel");
    } finally {
      setExporting(false);
    }
  };

  const openDetailModalWithContext = useCallback(
    (context: DetailModalContext) => {
      const metricLabel = getMetricLabel(context.metricKey);
      const groupLabel = isViPhamMetric(context.metricKey) ? "Vi phạm" : "Phản ánh";

      setDetailModalTitle("Danh sách chi tiết");
      setDetailModalSubtitle(`${context.departmentName} - ${metricLabel} (${groupLabel})`);
      setDetailModalContext(context);
      setDetailModalPageIndex(1);
      setDetailModalPageSize(10);
      setDetailModalOpen(true);
      loadDetailModalData(context, 1, 10);
    },
    [loadDetailModalData],
  );

  const openDetailModal = useCallback(
    (record: DataTableRecord, metricKey: ThongKePhanAnhVaViPhamMetricKey) => {
      openDetailModalWithContext({
        departmentId: record.departmentId,
        departmentName: formatDepartmentDisplayName(record.departmentName),
        metricKey,
        year: selectedYear ?? undefined,
      });
    },
    [openDetailModalWithContext, selectedYear],
  );

  const openGrandTotalDetailModal = useCallback(
    (metricKey: ThongKePhanAnhVaViPhamMetricKey) => {
      openDetailModalWithContext({
        departmentId: "00000000-0000-0000-0000-000000000000",
        departmentIds: data.map((item) => item.departmentId),
        departmentName: THONG_KE_GRAND_TOTAL_LABEL,
        metricKey,
        year: selectedYear ?? undefined,
      });
    },
    [data, openDetailModalWithContext, selectedYear],
  );

  const handleDetailModalPageChange = (page: number, size: number) => {
    if (!detailModalContext) return;
    setDetailModalPageIndex(page);
    setDetailModalPageSize(size);
    loadDetailModalData(detailModalContext, page, size);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setDetailModalContext(null);
    setDetailModalData([]);
    setDetailModalTotal(0);
  };

  const tableData = useMemo(
    () =>
      buildGroupedTableRows(data, grandTotal).filter(
        (row): row is BodyTableRecord => row.type !== "total",
      ),
    [data, grandTotal],
  );

  const renderMetricCell = (
    record: BodyTableRecord,
    metricKey: ThongKePhanAnhVaViPhamMetricKey,
  ) => {
    if (record.type === "region") {
      return null;
    }

    const value = getMetricValue(record, metricKey);
    return (
      <span
        className={value > 0 ? "thong-ke-cell-value" : undefined}
        style={{ fontWeight: value > 0 ? 700 : 400 }}
      >
        {value || 0}
      </span>
    );
  };

  const buildMetricColumn = (metric: { key: ThongKePhanAnhVaViPhamMetricKey; label: string }) => ({
    title: metric.label,
    key: metric.key,
    width: METRIC_COLUMN_WIDTH,
    align: "center" as const,
    onHeaderCell: () => ({ style: headerCellStyle }),
    onCell: (record: BodyTableRecord) => {
      if (record.type === "region") {
        return {
          className: "thong-ke-region-fill-cell",
          style: { background: "#E9EDF5", padding: 0 },
        };
      }

      const value = getMetricValue(record, metric.key);
      const isClickable = value > 0;

      return {
        className: isClickable ? "thong-ke-clickable-cell" : undefined,
        style: { textAlign: "center" as const, background: "#fff" },
        onClick: isClickable
          ? () => openDetailModal(record, metric.key)
          : undefined,
      };
    },
    render: (_: unknown, record: BodyTableRecord) => renderMetricCell(record, metric.key),
  });

  const columns: ColumnsType<BodyTableRecord> = [
    {
      title: "STT",
      key: "stt",
      width: THONG_KE_STT_COLUMN_WIDTH,
      fixed: "left",
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
      onCell: (record) => {
        if (record.type === "region") {
          return {
            colSpan: 2,
            className: "thong-ke-region-label-cell",
            style: regionCellStyle,
          };
        }
        return { style: { textAlign: "center" as const } };
      },
      render: (_, record) => {
        if (record.type === "region") {
          return record.regionName;
        }
        return record.stt;
      },
    },
    {
      title: "Tỉnh",
      key: "tinh",
      width: FIXED_LEFT_WIDTH - THONG_KE_STT_COLUMN_WIDTH,
      fixed: "left",
      onHeaderCell: () => ({ style: headerCellStyle }),
      onCell: (record) => {
        if (record.type === "region") {
          return { colSpan: 0 };
        }
        return { style: { fontWeight: 500 } };
      },
      render: (_, record) => {
        if (record.type === "region") {
          return null;
        }
        return formatDepartmentDisplayName(record.departmentName);
      },
    },
    {
      title: "Phản ánh",
      onHeaderCell: () => ({ style: headerCellStyle }),
      children: THONG_KE_PHAN_ANH_METRIC_COLUMNS.map(buildMetricColumn),
    },
    {
      title: "Vi phạm",
      onHeaderCell: () => ({ style: headerCellStyle }),
      children: THONG_KE_VI_PHAM_METRIC_COLUMNS.map(buildMetricColumn),
    },
  ];

  const renderGrandTotalSummary = () => {
    if (!grandTotal || data.length === 0) {
      return null;
    }

    const metrics: ThongKePhanAnhVaViPhamMetricKey[] = [
      "xacMinhDung",
      "xacMinhSai",
      "taoThanhVuViec",
      "vuViecDung",
      "vuViecSai",
      "daDangKy",
      "chuaDangKy",
    ];

    return (
      <Table.Summary fixed="top">
        <Table.Summary.Row className="thong-ke-total-row">
          <Table.Summary.Cell index={0} colSpan={2} align="center" className="thong-ke-total-label-cell">
            {grandTotal.departmentName || THONG_KE_GRAND_TOTAL_LABEL}
          </Table.Summary.Cell>
          {metrics.map((metricKey, index) => {
            const value = getMetricValue(grandTotal, metricKey);
            const isClickable = value > 0;

            return (
              <Table.Summary.Cell
                key={metricKey}
                index={index + 2}
                align="center"
                className={isClickable ? "thong-ke-clickable-cell" : undefined}
              >
                <span
                  className={
                    isClickable
                      ? "thong-ke-cell-value thong-ke-phan-anh-va-vi-pham-total-value"
                      : undefined
                  }
                  style={{
                    fontWeight: isClickable ? 700 : 400,
                    cursor: isClickable ? "pointer" : undefined,
                  }}
                  onClick={
                    isClickable ? () => openGrandTotalDetailModal(metricKey) : undefined
                  }
                >
                  {value || 0}
                </span>
              </Table.Summary.Cell>
            );
          })}
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 16 }}>
        <AutoBreadcrumb />
      </Flex>

      <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Flex alignItems="center" gap={12} style={{ flexWrap: "wrap" }}>
          <Flex alignItems="center" gap={8}>
            <Text strong>Sở:</Text>
            <Select
              mode="multiple"
              allowClear
              showSearch={{ optionFilterProp: "label" }}
              placeholder="Chọn một hoặc nhiều Sở"
              style={{ minWidth: 320, maxWidth: 520 }}
              value={selectedDepartmentIds}
              onChange={setSelectedDepartmentIds}
              maxTagCount="responsive"
              options={departmentOptions.map((item) => ({
                label: item.shortName || item.name,
                value: item.id,
              }))}
            />
          </Flex>

          <Flex alignItems="center" gap={8}>
            <Text strong>Năm:</Text>
            <DatePicker
              picker="year"
              value={selectedYear ? dayjs(`${selectedYear}-01-01`) : null}
              onChange={(value) => {
                setSelectedYear(value ? value.year() : null);
              }}
              allowClear
              placeholder="Tất cả các năm"
            />
          </Flex>

          <Button color="cyan" variant="solid" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
            Tìm kiếm
          </Button>

          <Button icon={<SyncOutlined />} onClick={handleReset} disabled={loading}>
            Làm mới
          </Button>

          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            loading={exporting}
            disabled={loading || exporting}
          >
            Kết xuất
          </Button>
        </Flex>
      </Card>

      <Card
        className="thong-ke-phan-anh-va-vi-pham-results"
        size="small"
        style={{ borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
      >
        <TableWithTopScroll
          fixedLeftWidth={FIXED_LEFT_WIDTH}
          refreshDeps={[loading, tableData]}
        >
          <Table<BodyTableRecord>
            className="thong-ke-phan-anh-va-vi-pham-table"
            columns={columns}
            dataSource={tableData}
            rowKey="key"
            loading={loading}
            bordered
            pagination={false}
            size="middle"
            scroll={{ x: TABLE_SCROLL_X, y: TABLE_BODY_HEIGHT }}
            rowClassName={(record) => (record.type === "region" ? "thong-ke-region-row" : "")}
            summary={renderGrandTotalSummary}
          />
        </TableWithTopScroll>
      </Card>

      <ThongKePhanAnhVaViPhamDetailModal
        open={detailModalOpen}
        title={detailModalTitle}
        subtitle={detailModalSubtitle}
        loading={detailModalLoading}
        data={detailModalData}
        total={detailModalTotal}
        pageIndex={detailModalPageIndex}
        pageSize={detailModalPageSize}
        isViPham={detailModalContext ? isViPhamMetric(detailModalContext.metricKey) : false}
        onClose={handleCloseDetailModal}
        onPageChange={handleDetailModalPageChange}
      />
    </>
  );
};

export default withAuthorization(
  ThongKePhanAnhVaViPhamPage,
  "ThongKePhanAnhVaViPham",
);
