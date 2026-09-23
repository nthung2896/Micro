"use client";

import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import quanLyThongKeService from "@/services/quanLyThongKe/quanLyThongKe.service";
import { ThongKeTheoThoiGianDto } from "@/types/quanLyThongKe/dto";
import {
  SearchOutlined,
  SyncOutlined,
} from "@ant-design/icons";
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
import "dayjs/locale/vi";
import React, { useCallback, useMemo, useState } from "react";
import {
  THONG_KE_THEO_THOI_GIAN_ITEMS,
} from "./constants";
import "./page.css";

dayjs.locale("vi");

const { Text } = Typography;

const DATETIME_FORMAT = "DD/MM/YYYY HH:mm";

interface TableRow {
  key: string;
  stt: number;
  label: string;
  count: number;
}

const headerCellStyle: React.CSSProperties = {
  background: "#4472C4",
  color: "#fff",
  fontWeight: 600,
  textAlign: "center",
  borderColor: "#fff",
  whiteSpace: "normal",
  lineHeight: 1.3,
  padding: "8px 12px",
};

function formatDateTimeShort(value: Dayjs): string {
  const hours = value.hour();
  const minutes = value.minute().toString().padStart(2, "0");
  const hour12 = hours % 12 || 12;
  const ampm = hours < 12 ? "SA" : "CH";
  return `${hour12}:${minutes} ${ampm} ${value.format("DD/MM/YYYY")}`;
}

const ThongKeTheoThoiGianPage: React.FC = () => {
  const now = dayjs();

  const [dateFrom, setDateFrom] = useState<Dayjs>(now.startOf("day"));
  const [dateTo, setDateTo] = useState<Dayjs>(now.hour(23).minute(59).second(59),);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<ThongKeTheoThoiGianDto | null>(null);
  const [searchedRange, setSearchedRange] = useState<{
    from: Dayjs;
    to: Dayjs;
  } | null>(null);

  const handleSearch = useCallback(async () => {
    if (dateFrom.isAfter(dateTo)) {
      message.warning("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setLoading(true);
    try {
      const res = await quanLyThongKeService.getThongKeTheoThoiGian({
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
      });

      if (res.status) {
        setResult(res.data ?? null);
        setSearchedRange({ from: dateFrom, to: dateTo });
        setSearched(true);
      } else {
        message.error(res.message || "Không thể lấy dữ liệu thống kê");
      }
    } catch {
      message.error("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  const handleReset = useCallback(() => {
    const current = dayjs();
    setDateFrom(current.startOf("day"));
    setDateTo(current.hour(23).minute(59).second(59));
    setSearched(false);
    setResult(null);
    setSearchedRange(null);
  }, []);

  const totalCount = useMemo(() => {
    if (!result) return 0;
    return THONG_KE_THEO_THOI_GIAN_ITEMS.reduce(
      (sum, item) => sum + (result[item.key] ?? 0),
      0,
    );
  }, [result]);

  const rangeText = useMemo(() => {
    if (!searchedRange) return "";
    return `Từ ${formatDateTimeShort(searchedRange.from)} đến ${formatDateTimeShort(searchedRange.to)}`;
  }, [searchedRange]);

  const tableData = useMemo<TableRow[]>(() => {
    if (!result) return [];
    return THONG_KE_THEO_THOI_GIAN_ITEMS.map((item, index) => ({
      key: item.key,
      stt: index + 1,
      label: item.label,
      count: result[item.key] ?? 0,
    }));
  }, [result]);

  const columns: ColumnsType<TableRow> = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 72,
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
    {
      title: "Loại hồ sơ",
      dataIndex: "label",
      key: "label",
      onHeaderCell: () => ({ style: { ...headerCellStyle, textAlign: "left" } }),
      onCell: () => ({ style: { fontWeight: 500 } }),
    },
    {
      title: "Số lượng",
      dataIndex: "count",
      key: "count",
      width: 140,
      align: "center",
      onHeaderCell: () => ({ style: headerCellStyle }),
    },
  ];

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: 16 }}>
        <AutoBreadcrumb />
      </Flex>

      <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Flex alignItems="center" gap={12} style={{ flexWrap: "wrap" }}>
          <Flex alignItems="center" gap={8}>
            <Text strong>Ngày bắt đầu:</Text>
            <DatePicker
              showTime={{ format: "HH:mm" }}
              value={dateFrom}
              onChange={(value) => value && setDateFrom(value)}
              format={DATETIME_FORMAT}
              allowClear={false}
              placeholder="Chọn ngày giờ bắt đầu"
            />
          </Flex>

          <Flex alignItems="center" gap={8}>
            <Text strong>Ngày kết thúc:</Text>
            <DatePicker
              showTime={{ format: "HH:mm" }}
              value={dateTo}
              onChange={(value) => value && setDateTo(value)}
              format={DATETIME_FORMAT}
              allowClear={false}
              placeholder="Chọn ngày giờ kết thúc"
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

          <Button icon={<SyncOutlined />} onClick={handleReset} disabled={loading}>
            Làm mới
          </Button>
        </Flex>
      </Card>

      {searched && result && searchedRange && (
        <Card
          className="thong-ke-theo-thoi-gian-results"
          size="small"
          style={{ borderRadius: 12 }}
          styles={{ body: { padding: 0 } }}
        >
          <div className="thong-ke-theo-thoi-gian-table-header">
            <Text className="thong-ke-theo-thoi-gian-table-title">
              THỐNG KÊ SỐ LƯỢNG HỒ SƠ THEO THỜI GIAN
            </Text>
            <Text className="thong-ke-theo-thoi-gian-table-range">{rangeText}</Text>
          </div>

          <Table<TableRow>
            className="thong-ke-theo-thoi-gian-table"
            columns={columns}
            dataSource={tableData}
            rowKey="key"
            loading={loading}
            bordered
            pagination={false}
            size="middle"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2} align="center">
                    TỔNG HỒ SƠ
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    <span className="thong-ke-theo-thoi-gian-total-value">{totalCount}</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>
      )}
    </>
  );
};

export default withAuthorization(
  ThongKeTheoThoiGianPage,
  "ThongKeTheoThoiGian",
);
