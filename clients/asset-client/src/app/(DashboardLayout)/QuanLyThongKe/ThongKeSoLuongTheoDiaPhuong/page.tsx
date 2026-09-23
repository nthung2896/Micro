"use client";

import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import { apiService } from "@/services/index";
import quanLyThongKeService from "@/services/quanLyThongKe/quanLyThongKe.service";
import {
  ThongKeSoLuongTheoDiaPhuongDetailItem,
  ThongKeSoLuongTheoDiaPhuongDto,
} from "@/types/quanLyThongKe/dto";
import { FileExcelOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
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
import {
  THONG_KE_FIXED_LEFT_WIDTH,
  THONG_KE_GRAND_TOTAL_LABEL,
  THONG_KE_PLATFORM_GROUPS,
  THONG_KE_STATUS_COLUMNS,
  THONG_KE_STATUS_COLUMN_WIDTH,
  THONG_KE_STT_COLUMN_WIDTH,
  THONG_KE_TABLE_SCROLL_X,
  THONG_KE_TINH_COLUMN_WIDTH,
  ThongKePlatformKey,
  ThongKeStatusKey,
  buildGroupedTableRows,
  formatDepartmentDisplayName,
  getPlatformLabel,
  getStatusLabel,
  getStatusValue,
} from "./constants";
import "./page.css";
import ThongKeDetailModal from "./ThongKeDetailModal";

const { Text } = Typography;

interface SctDepartmentOption {
  id: string;
  name: string;
  shortName?: string;
  code: string;
}

type TableRecord = ReturnType<typeof buildGroupedTableRows>[number];
type BodyTableRecord = Exclude<TableRecord, { type: "total" }>;
type DataTableRecord = Extract<TableRecord, { type: "data" }>;

interface DetailModalContext {
  departmentId: string;
  departmentIds?: string[];
  departmentName: string;
  platformKey: ThongKePlatformKey;
  statusKey: ThongKeStatusKey;
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

const ThongKeSoLuongTheoDiaPhuongPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(dayjs().year());
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([],);

  const [departmentOptions, setDepartmentOptions] = useState<SctDepartmentOption[]>([]);
  const [data, setData] = useState<ThongKeSoLuongTheoDiaPhuongDto[]>([]);
  const [grandTotal, setGrandTotal] = useState<ThongKeSoLuongTheoDiaPhuongDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const loadDepartments = useCallback(async () => {
    try {
      const res = await apiService.get<SctDepartmentOption[]>("/HomeBlock/SctDepartments",);
      if (res?.data) {
        setDepartmentOptions(res.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách Sở");
    }
  }, []);

  const fetchDataWithParams = useCallback(
    async (year: number | null, departmentIds: string[]) => {
      setLoading(true);
      try {
        const res = await quanLyThongKeService.getThongKeSoLuongTheoDiaPhuong({
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
      } catch (error: any) {
        console.error(error);
        message.error(
          error?.message || "Có lỗi xảy ra khi tải dữ liệu thống kê",
        );
        setData([]);
        setGrandTotal(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialLoadStartedRef.current) return;
    initialLoadStartedRef.current = true;

    loadDepartments();
    fetchDataWithParams(dayjs().year(), []);
  }, [loadDepartments, fetchDataWithParams]);

  const handleSearch = () => {
    fetchDataWithParams(selectedYear, selectedDepartmentIds);
  };

  const handleReset = () => {
    const defaultYear = dayjs().year();
    setSelectedDepartmentIds([]);
    setSelectedYear(defaultYear);
    fetchDataWithParams(defaultYear, []);
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await quanLyThongKeService.exportThongKeSoLuongTheoDiaPhuong({
        year: selectedYear ?? undefined,
        departmentIds: selectedDepartmentIds.length > 0 ? selectedDepartmentIds : undefined,
      });

      if (res?.status && res.data) {
        const fileYearPart = selectedYear ? String(selectedYear) : "TatCa";
        downloadFileFromBase64(
          res.data,
          `ThongKeSoLuongTheoDiaPhuong_${fileYearPart}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
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

  const loadDetailModalData = useCallback(
    async (
      context: DetailModalContext,
      pageIndex: number,
      pageSize: number,
    ) => {
      setDetailModalLoading(true);
      try {
        const res = await quanLyThongKeService.getThongKeSoLuongTheoDiaPhuongDetail(
          {
            departmentId: context.departmentId,
            departmentIds: context.departmentIds,
            platformKey: context.platformKey,
            statusBucket: context.statusKey,
            year: context.year,
            pageIndex,
            pageSize,
          },
        );

        if (res?.status && res.data) {
          setDetailModalData(res.data.items || []);
          setDetailModalTotal(res.data.totalCount || 0);
        } else {
          message.error(res?.message || "Lấy danh sách chi tiết thất bại");
          setDetailModalData([]);
          setDetailModalTotal(0);
        }
      } catch (error: any) {
        console.error(error);
        message.error(
          error?.message || "Có lỗi xảy ra khi tải danh sách chi tiết",
        );
        setDetailModalData([]);
        setDetailModalTotal(0);
      } finally {
        setDetailModalLoading(false);
      }
    },
    [],
  );

  const openDetailModal = (
    record: DataTableRecord,
    platformKey: ThongKePlatformKey,
    statusKey: ThongKeStatusKey,
  ) => {
    const departmentName = formatDepartmentDisplayName(record.departmentName);
    openDetailModalWithContext({
      departmentId: record.departmentId,
      departmentName,
      platformKey,
      statusKey,
      year: selectedYear ?? undefined,
    });
  };

  const openGrandTotalDetailModal = (
    platformKey: ThongKePlatformKey,
    statusKey: ThongKeStatusKey,
  ) => {
    openDetailModalWithContext({
      departmentId: "00000000-0000-0000-0000-000000000000",
      departmentIds: data.map((item) => item.departmentId),
      departmentName: THONG_KE_GRAND_TOTAL_LABEL,
      platformKey,
      statusKey,
      year: selectedYear ?? undefined,
    });
  };

  const openDetailModalWithContext = (context: DetailModalContext) => {
    const platformLabel = getPlatformLabel(context.platformKey);
    const statusLabel = getStatusLabel(context.statusKey);

    setDetailModalTitle("Danh sách chi tiết hồ sơ");
    setDetailModalSubtitle(
      `${context.departmentName} - ${statusLabel} (${platformLabel})`,
    );
    setDetailModalContext(context);
    setDetailModalPageIndex(1);
    setDetailModalPageSize(10);
    setDetailModalOpen(true);
    loadDetailModalData(context, 1, 10);
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
            {THONG_KE_GRAND_TOTAL_LABEL}
          </Table.Summary.Cell>
          {THONG_KE_PLATFORM_GROUPS.flatMap((platform) =>
            THONG_KE_STATUS_COLUMNS.map((status) => {
              const index = cellIndex;
              cellIndex += 1;
              const value = getStatusValue(grandTotal, platform.key, status.key);

              return (
                <Table.Summary.Cell
                  key={`${platform.key}-${status.key}`}
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
                        ? () => openGrandTotalDetailModal(platform.key, status.key)
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

  const renderStatusCell = (
    record: BodyTableRecord,
    platformKey: ThongKePlatformKey,
    statusKey: ThongKeStatusKey,
  ) => {
    if (record.type === "region") {
      return null;
    }

    const value = getStatusValue(record, platformKey, statusKey);
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
      width: THONG_KE_TINH_COLUMN_WIDTH,
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
    ...THONG_KE_PLATFORM_GROUPS.map((platform) => ({
      title: platform.label,
      onHeaderCell: () => ({ style: headerCellStyle }),
      children: THONG_KE_STATUS_COLUMNS.map((status) => ({
        title: status.label,
        key: `${platform.key}-${status.key}`,
        width: THONG_KE_STATUS_COLUMN_WIDTH,
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

          const value = getStatusValue(record, platform.key, status.key);
          const isClickable = value > 0;

          return {
            className: isClickable ? "thong-ke-clickable-cell" : undefined,
            style: {
              textAlign: "center" as const,
              background: "#fff",
            },
            onClick: isClickable
              ? () => openDetailModal(record, platform.key, status.key)
              : undefined,
          };
        },
        render: (_: unknown, record: BodyTableRecord) =>
          renderStatusCell(record, platform.key, status.key),
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

          <Button icon={<SyncOutlined />} onClick={handleReset} loading={loading}>
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
          fixedLeftWidth={THONG_KE_FIXED_LEFT_WIDTH}
          refreshDeps={[loading, tableData]}
        >
          <Table<BodyTableRecord>
          className="thong-ke-dia-phuong-table"
          columns={columns}
          dataSource={tableData}
          rowKey="key"
          loading={loading}
          bordered
          pagination={false}
          scroll={{ x: THONG_KE_TABLE_SCROLL_X, y: 640 }}
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
        onClose={handleCloseDetailModal}
        onPageChange={handleDetailModalPageChange}
      />
    </>
  );
};

export default withAuthorization(
  ThongKeSoLuongTheoDiaPhuongPage,
  "ThongKeSoLuongTheoDiaPhuong",
);
