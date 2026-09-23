"use client";

import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import quanLyThongKeService from "@/services/quanLyThongKe/quanLyThongKe.service";
import { ThongKeSoLuongTheoDiaPhuongDetailItem, ThongKeXuLyHoSoTheoDiaPhuongDto } from "@/types/quanLyThongKe/dto";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { FileExcelOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TableWithTopScroll from "../TableWithTopScroll";
import ThongKeDetailModal from "../ThongKeSoLuongTheoDiaPhuong/ThongKeDetailModal";
import {
  THONG_KE_STT_COLUMN_WIDTH,
  THONG_KE_XULY_FIXED_LEFT_WIDTH,
  THONG_KE_XULY_GRAND_TOTAL_LABEL,
  THONG_KE_XULY_METRIC_COLUMN_WIDTH,
  THONG_KE_XULY_PLATFORM_GROUPS,
  THONG_KE_XULY_TABLE_SCROLL_X,
  THONG_KE_XULY_TINH_COLUMN_WIDTH,
  ThongKeXuLyMetricKey,
  ThongKeXuLyPlatformKey,
  buildGroupedTableRows,
  formatDepartmentDisplayName,
  getMetricColumnsForPlatform,
  getMetricLabel,
  getMetricValue,
  getPlatformLabel,
} from "./constants";
import "./page.css";

const { Text } = Typography;
const DATE_FORMAT = "DD/MM/YYYY";

type TableRecord = ReturnType<typeof buildGroupedTableRows>[number];
type BodyTableRecord = Exclude<TableRecord, { type: "total" }>;
type DataTableRecord = Extract<TableRecord, { type: "data" }>;

interface DetailModalContext {
  departmentId: string;
  departmentIds?: string[];
  departmentName: string;
  platformKey: ThongKeXuLyPlatformKey;
  metricKey: ThongKeXuLyMetricKey;
  dateFrom?: string;
  dateTo?: string;
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

const ThongKeXuLyHoSoTheoDiaPhuongPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<ThongKeXuLyHoSoTheoDiaPhuongDto[]>([]);
  const [grandTotal, setGrandTotal] = useState<ThongKeXuLyHoSoTheoDiaPhuongDto | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalLoading, setDetailModalLoading] = useState(false);
  const [detailModalTitle, setDetailModalTitle] = useState("");
  const [detailModalSubtitle, setDetailModalSubtitle] = useState("");
  const [detailModalData, setDetailModalData] = useState<ThongKeSoLuongTheoDiaPhuongDetailItem[]>([]);
  const [detailModalTotal, setDetailModalTotal] = useState(0);
  const [detailModalPageIndex, setDetailModalPageIndex] = useState(1);
  const [detailModalPageSize, setDetailModalPageSize] = useState(10);
  const [detailModalContext, setDetailModalContext] = useState<DetailModalContext | null>(null);

  const initialLoadStartedRef = useRef(false);

  const fetchData = useCallback(async (from: Dayjs | null, to: Dayjs | null) => {
    if ((from && !to) || (!from && to)) {
      message.warning("Vui lòng chọn đủ từ ngày và đến ngày");
      return;
    }

    if (from && to && from.isAfter(to)) {
      message.warning("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setLoading(true);
    try {
      const res = await quanLyThongKeService.getThongKeXuLyHoSoTheoDiaPhuong({
        dateFrom: from ? from.startOf("day").toISOString() : undefined,
        dateTo: to ? to.endOf("day").toISOString() : undefined,
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
  }, []);

  useEffect(() => {
    if (initialLoadStartedRef.current) return;
    initialLoadStartedRef.current = true;
    fetchData(null, null);
  }, [fetchData]);

  const loadDetailModalData = useCallback(
    async (context: DetailModalContext, pageIndex: number, pageSize: number) => {
      setDetailModalLoading(true);
      try {
        const res = await quanLyThongKeService.getThongKeSoLuongTheoDiaPhuongDetail({
          departmentId: context.departmentId,
          departmentIds: context.departmentIds,
          platformKey: context.platformKey,
          metricKey: context.metricKey,
          dateFrom: context.dateFrom,
          dateTo: context.dateTo,
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

  const openDetailModalWithContext = (context: DetailModalContext) => {
    const platformLabel = getPlatformLabel(context.platformKey);
    const metricLabel = getMetricLabel(context.metricKey);

    setDetailModalTitle("Danh sách chi tiết hồ sơ");
    setDetailModalSubtitle(`${context.departmentName} - ${metricLabel} (${platformLabel})`);
    setDetailModalContext(context);
    setDetailModalPageIndex(1);
    setDetailModalPageSize(10);
    setDetailModalOpen(true);
    loadDetailModalData(context, 1, 10);
  };

  const openDetailModal = (
    record: DataTableRecord,
    platformKey: ThongKeXuLyPlatformKey,
    metricKey: ThongKeXuLyMetricKey,
  ) => {
    openDetailModalWithContext({
      departmentId: record.departmentId,
      departmentName: formatDepartmentDisplayName(record.departmentName),
      platformKey,
      metricKey,
      dateFrom: dateFrom ? dateFrom.startOf("day").toISOString() : undefined,
      dateTo: dateTo ? dateTo.endOf("day").toISOString() : undefined,
    });
  };

  const openGrandTotalDetailModal = (
    platformKey: ThongKeXuLyPlatformKey,
    metricKey: ThongKeXuLyMetricKey,
  ) => {
    openDetailModalWithContext({
      departmentId: "00000000-0000-0000-0000-000000000000",
      departmentIds: data.map((item) => item.departmentId),
      departmentName: THONG_KE_XULY_GRAND_TOTAL_LABEL,
      platformKey,
      metricKey,
      dateFrom: dateFrom ? dateFrom.startOf("day").toISOString() : undefined,
      dateTo: dateTo ? dateTo.endOf("day").toISOString() : undefined,
    });
  };

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

  const handleSearch = () => {
    fetchData(dateFrom, dateTo);
  };

  const handleReset = () => {
    setDateFrom(null);
    setDateTo(null);
    fetchData(null, null);
  };

  const handleExportExcel = async () => {
    if (dateFrom && dateTo && dateFrom.isAfter(dateTo)) {
      message.warning("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setExporting(true);
    try {
      const res = await quanLyThongKeService.exportThongKeXuLyHoSoTheoDiaPhuong({
        dateFrom: dateFrom ? dateFrom.startOf("day").toISOString() : undefined,
        dateTo: dateTo ? dateTo.endOf("day").toISOString() : undefined,
      });

      if (res?.status && res.data) {
        downloadFileFromBase64(
          res.data,
          `ThongKeXuLyHoSoTheoDiaPhuong_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
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

  const tableData = useMemo(
    () =>
      buildGroupedTableRows(data, grandTotal).filter(
        (row): row is BodyTableRecord => row.type !== "total",
      ),
    [data, grandTotal],
  );

  const renderGrandTotalSummary = () => {
    if (!grandTotal || data.length === 0) {
      return null;
    }

    let cellIndex = 2;

    return (
      <Table.Summary fixed="top">
        <Table.Summary.Row className="thong-ke-total-row">
          <Table.Summary.Cell
            index={0}
            colSpan={2}
            align="center"
            className="thong-ke-total-label-cell"
          >
            {THONG_KE_XULY_GRAND_TOTAL_LABEL}
          </Table.Summary.Cell>
          {THONG_KE_XULY_PLATFORM_GROUPS.flatMap((platform) =>
            getMetricColumnsForPlatform(platform.key).map((metric) => {
              const index = cellIndex;
              cellIndex += 1;
              const value = getMetricValue(grandTotal, platform.key, metric.key);

              return (
                <Table.Summary.Cell
                  key={`${platform.key}-${metric.key}`}
                  index={index}
                  align="center"
                  className={value > 0 ? "thong-ke-clickable-cell" : undefined}
                >
                  <span
                    className={value > 0 ? "thong-ke-cell-value" : undefined}
                    style={{
                      fontWeight: value > 0 ? 700 : 400,
                      cursor: value > 0 ? "pointer" : undefined,
                    }}
                    onClick={
                      value > 0
                        ? () => openGrandTotalDetailModal(platform.key, metric.key)
                        : undefined
                    }
                  >
                    {value || 0}
                  </span>
                </Table.Summary.Cell>
              );
            }),
          )}
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  const renderMetricCell = (
    record: BodyTableRecord,
    platformKey: ThongKeXuLyPlatformKey,
    metricKey: ThongKeXuLyMetricKey,
  ) => {
    if (record.type === "region") {
      return null;
    }

    const value = getMetricValue(record, platformKey, metricKey);
    return (
      <span
        className={value > 0 ? "thong-ke-cell-value" : undefined}
        style={{ fontWeight: value > 0 ? 700 : 400 }}
      >
        {value || 0}
      </span>
    );
  };

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
            style: {
              background: "#E9EDF5",
              fontWeight: 700,
              fontSize: 13,
              padding: "8px 12px",
              textAlign: "left" as const,
            },
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
      width: THONG_KE_XULY_TINH_COLUMN_WIDTH,
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
    ...THONG_KE_XULY_PLATFORM_GROUPS.map((platform) => ({
      title: platform.label,
      onHeaderCell: () => ({ style: headerCellStyle }),
      children: getMetricColumnsForPlatform(platform.key).map((metric) => ({
        title: metric.label,
        key: `${platform.key}-${metric.key}`,
        width: THONG_KE_XULY_METRIC_COLUMN_WIDTH,
        align: "center" as const,
        onHeaderCell: () => ({ style: headerCellStyle }),
        onCell: (record: BodyTableRecord) => {
          if (record.type === "region") {
            return {
              className: "thong-ke-region-fill-cell",
              style: {
                background: "#E9EDF5",
                padding: 0,
              },
            };
          }

          const value = getMetricValue(record, platform.key, metric.key);
          const isClickable = value > 0;

          return {
            className: isClickable ? "thong-ke-clickable-cell" : undefined,
            style: {
              textAlign: "center" as const,
              background: "#fff",
            },
            onClick: isClickable
              ? () => openDetailModal(record, platform.key, metric.key)
              : undefined,
          };
        },
        render: (_: unknown, record: BodyTableRecord) =>
          renderMetricCell(record, platform.key, metric.key),
      })),
    })),
  ];

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 16 }}>
        <AutoBreadcrumb />
      </Flex>

      <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Flex alignItems="center" gap={12} style={{ flexWrap: "wrap" }}>
          <Flex alignItems="center" gap={8}>
            <Text strong>Ngày tạo hồ sơ từ ngày:</Text>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              format={DATE_FORMAT}
              allowClear
              placeholder="Chọn ngày bắt đầu"
            />
          </Flex>

          <Flex alignItems="center" gap={8}>
            <Text strong>Đến ngày:</Text>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              format={DATE_FORMAT}
              allowClear
              placeholder="Chọn ngày kết thúc"
            />
          </Flex>

          <Button
            color="cyan" variant="solid"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            Tìm kiếm
          </Button>

          <Button
            icon={<SyncOutlined />}
            onClick={handleReset}
            disabled={loading || exporting}
          >
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

      <Card size="small" style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <TableWithTopScroll
          fixedLeftWidth={THONG_KE_XULY_FIXED_LEFT_WIDTH}
          refreshDeps={[loading, tableData]}
        >
          <Table<BodyTableRecord>
          className="thong-ke-xu-ly-dia-phuong-table"
          columns={columns}
          dataSource={tableData}
          rowKey="key"
          loading={loading}
          bordered
          pagination={false}
          scroll={{ x: THONG_KE_XULY_TABLE_SCROLL_X, y: 640 }}
          size="small"
          summary={renderGrandTotalSummary}
          rowClassName={(record) =>
            record.type === "region" ? "thong-ke-region-row" : ""
          }
        />
        </TableWithTopScroll>
      </Card>

      <ThongKeDetailModal
        open={detailModalOpen}
        title={detailModalTitle}
        subtitle={detailModalSubtitle}
        loading={detailModalLoading}
        data={detailModalData}
        total={detailModalTotal}
        pageIndex={detailModalPageIndex}
        pageSize={detailModalPageSize}
        isContract={detailModalContext?.platformKey === "chungThucHopDongDienTu"}
        metricKey={detailModalContext?.metricKey}
        onClose={handleCloseDetailModal}
        onPageChange={handleDetailModalPageChange}
      />
    </>
  );
};

export default withAuthorization(
  ThongKeXuLyHoSoTheoDiaPhuongPage,
  "ThongKeXuLyHoSoTheoDiaPhuong",
);
