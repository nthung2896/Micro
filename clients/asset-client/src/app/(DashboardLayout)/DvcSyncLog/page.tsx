"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Pagination,
  Modal,
  message,
  Button,
  Space,
  Tag,
  Typography,
  Select,
  Form,
  Row,
  Col,
  Card,
  Input,
  DatePicker,
  Tooltip,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  SyncOutlined,
  DeleteOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { useDispatch } from "@/store/hooks";
import { setIsLoading } from "@/store/general/GeneralSlice";
import withAuthorization from "@/libs/authentication";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { apiService } from "@/services/index";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// =====================================================================
// Types
// =====================================================================
interface DvcSyncLogItem {
  id: string;
  actionType: string;
  requestUrl: string;
  requestBody?: string;
  responseBody?: string;
  statusCode: number;
  isSuccess: boolean;
  errorMessage?: string;
  durationMs: number;
  retryCount: number;
  maxRetry: number;
  maHoSo?: string;
  idHoSo?: string;
  createdDate: string;
  createdBy?: string;
}

interface SearchParams {
  actionType?: string;
  isSuccess?: boolean;
  maHoSo?: string;
  fromDate?: string;
  toDate?: string;
  keyword?: string;
  pageIndex: number;
  pageSize: number;
}

// =====================================================================
// Constants
// =====================================================================
const ACTION_TYPES = [
  "GetToken",
  "GetNextValue",
  "UploadFile",
  "CreateDossier",
  "CapNhatTienTrinh",
  "CapNhatTrangThai",
];

const ACTION_COLORS: Record<string, string> = {
  GetToken: "blue",
  GetNextValue: "cyan",
  UploadFile: "orange",
  CreateDossier: "green",
  CapNhatTienTrinh: "purple",
  CapNhatTrangThai: "volcano",
};

// =====================================================================
// Page
// =====================================================================
function DvcSyncLogPage() {
  const dispatch = useDispatch();
  const [data, setData] = useState<DvcSyncLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    pageIndex: 1,
    pageSize: 20,
  });
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [detailModal, setDetailModal] = useState<DvcSyncLogItem | null>(null);
  const [actionTypes, setActionTypes] = useState<string[]>(ACTION_TYPES);
  const [searchForm] = Form.useForm();
  const [retrying, setRetrying] = useState<string | null>(null);

  // Fetch log list
  const fetchData = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      const r = await apiService.post<any>("/DvcSyncLog/GetData", searchParams);
      if (r?.status && r.data) {
        setData(r.data.items || []);
        setTotal(r.data.totalCount || 0);
      }
    } catch {
      message.error("Lỗi tải dữ liệu lịch sử đồng bộ");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch action types for filter
  useEffect(() => {
    const loadActionTypes = async () => {
      try {
        const r = await apiService.get<any>("/DvcSyncLog/GetActionTypes");
        if (r?.status && r.data?.length > 0) {
          setActionTypes(r.data);
        }
      } catch { /* ignore */ }
    };
    loadActionTypes();
  }, []);

  const handleSearch = (values: any) => {
    const params: SearchParams = {
      pageIndex: 1,
      pageSize: searchParams.pageSize,
    };
    if (values.actionType) params.actionType = values.actionType;
    if (values.isSuccess !== undefined && values.isSuccess !== null) {
      params.isSuccess = values.isSuccess;
    }
    if (values.maHoSo) params.maHoSo = values.maHoSo;
    if (values.keyword) params.keyword = values.keyword;
    if (values.dateRange) {
      params.fromDate = values.dateRange[0]?.format("YYYY-MM-DDTHH:mm:ss");
      params.toDate = values.dateRange[1]?.format("YYYY-MM-DDTHH:mm:ss");
    }
    setSearchParams(params);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({ pageIndex: 1, pageSize: 20 });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageIndex: page, pageSize }));
  };

  const handleViewDetail = (item: DvcSyncLogItem) => {
    setDetailModal(item);
  };

  const handleDelete = async (item: DvcSyncLogItem) => {
    Modal.confirm({
      title: "Xoá log đồng bộ?",
      content: `Xoá log ${item.actionType} — ${item.maHoSo || ""}`,
      okText: "Xoá",
      cancelText: "Huỷ",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const r = await apiService.post<any>("/DvcSyncLog/Delete", { id: item.id });
          if (r?.status) {
            message.success("Đã xoá log");
            fetchData();
          } else {
            message.error(r?.message || "Xoá thất bại");
          }
        } catch (e: any) {
          message.error(e?.toString() || "Lỗi xoá");
        }
      },
    });
  };

  const handleRetry = async (item: DvcSyncLogItem) => {
    if (item.actionType === "UploadFile") {
      message.warning("Không thể retry UploadFile — cần file gốc. Vui lòng thực hiện lại từ đầu.");
      return;
    }
    setRetrying(item.id);
    try {
      const r = await apiService.post<any>("/DvcSyncLog/Retry", { id: item.id });
      if (r?.status) {
        message.success("Retry thành công! Log mới đã được tạo.");
        fetchData();
      } else {
        message.error(r?.message || "Retry thất bại");
      }
    } catch (e: any) {
      message.error(e?.toString() || "Lỗi retry");
    } finally {
      setRetrying(null);
    }
  };

  // =====================================================================
  // Columns
  // =====================================================================
  const columns = [
    {
      title: "#",
      width: 40,
      render: (_: any, __: any, index: number) =>
        (searchParams.pageIndex - 1) * searchParams.pageSize + index + 1,
    },
    {
      title: "Action",
      dataIndex: "actionType",
      width: 150,
      render: (v: string) => <Tag color={ACTION_COLORS[v] || "default"}>{v}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "statusCode",
      width: 80,
      render: (code: number, record: DvcSyncLogItem) => (
        <Tooltip title={record.isSuccess ? "Thành công" : "Thất bại"}>
          <Space size={4}>
            {record.isSuccess ? (
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
            ) : (
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            )}
            <Tag>{code}</Tag>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "durationMs",
      width: 90,
      render: (ms: number) => `${ms}ms`,
    },
    {
      title: "Mã hồ sơ",
      dataIndex: "maHoSo",
      width: 180,
      render: (v: string) => (v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : "-"),
    },
    {
      title: "IdHoSo",
      dataIndex: "idHoSo",
      width: 120,
      render: (v: string) => (v ? <Text code style={{ fontSize: 11 }}>{v}</Text> : "-"),
    },
    {
      title: "Lỗi",
      dataIndex: "errorMessage",
      ellipsis: true,
      render: (v: string) =>
        v ? (
          <Tooltip title={v}>
            <Text type="danger" style={{ fontSize: 12 }}>
              {v.length > 50 ? v.substring(0, 50) + "..." : v}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Thời điểm",
      dataIndex: "createdDate",
      width: 160,
      render: (v: string) => {
        if (!v) return "-";
        const d = new Date(v);
        return d.toLocaleString("vi-VN");
      },
    },
    {
      title: "Thao tác",
      width: 160,
      fixed: "right" as const,
      render: (_: any, record: DvcSyncLogItem) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button  icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          </Tooltip>
          <Tooltip title="Retry">
            <Button
              
              type="primary"
              icon={<SyncOutlined />}
              loading={retrying === record.id}
              disabled={!record.isSuccess && record.retryCount >= record.maxRetry}
              onClick={() => handleRetry(record)}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <Button
              
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <AutoBreadcrumb />
      </div>

      {/* Search Panel */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <SearchOutlined />
            <span>Tìm kiếm</span>
          </Space>
        }
        extra={
          <Button
            
            icon={<CloseOutlined />}
            onClick={() => {
              handleReset();
            }}
          >
            Reset
          </Button>
        }
      >
        <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="actionType" label="Action Type">
                <Select
                  placeholder="Tất cả"
                  allowClear
                  options={actionTypes.map((t) => ({ label: t, value: t }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item name="isSuccess" label="Trạng thái">
                <Select
                  placeholder="Tất cả"
                  allowClear
                  options={[
                    { label: "Thành công", value: true },
                    { label: "Thất bại", value: false },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Form.Item name="maHoSo" label="Mã hồ sơ">
                <Input placeholder="Nhập mã hồ sơ" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={9}>
              <Form.Item name="dateRange" label="Khoảng thời gian">
                <RangePicker
                  showTime
                  style={{ width: "100%" }}
                  placeholder={["Từ ngày", "Đến ngày"]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="keyword" label="Từ khoá">
                <Input placeholder="URL / lỗi / mã hồ sơ" allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button htmlType="submit" color="cyan" variant="solid" icon={<SearchOutlined />}>
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm mới
              </Button>
            </Space>
          </Row>
        </Form>
      </Card>

      {/* Table */}
      <Card
        size="small"
        title={
          <Space>
            <SyncOutlined />
            <span>Lịch sử đồng bộ DVC</span>
            <Tag>{total} bản ghi</Tag>
          </Space>
        }
        extra={
          <Button  icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
        }
      >
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1100 }}
          size="small"
          pagination={false}
          locale={{ emptyText: "Chưa có lịch sử đồng bộ" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <Pagination
            current={searchParams.pageIndex}
            pageSize={searchParams.pageSize}
            total={total}
            showSizeChanger
            showTotal={(t) => `Tổng ${t} bản ghi`}
            onChange={handlePageChange}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Chi tiết log đồng bộ
            {detailModal && <Tag color={ACTION_COLORS[detailModal.actionType]}>{detailModal.actionType}</Tag>}
          </Space>
        }
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(null)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {detailModal && (
          <div>
            <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Action Type">
                <Tag color={ACTION_COLORS[detailModal.actionType]}>{detailModal.actionType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status Code">
                <Space>
                  {detailModal.isSuccess ? (
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                  )}
                  <Tag>{detailModal.statusCode}</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian xử lý">{detailModal.durationMs}ms</Descriptions.Item>
              <Descriptions.Item label="Số lần retry">
                {detailModal.retryCount}/{detailModal.maxRetry}
              </Descriptions.Item>
              <Descriptions.Item label="Mã hồ sơ" span={2}>
                {detailModal.maHoSo || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="IdHoSo" span={2}>
                {detailModal.idHoSo || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Lỗi" span={2}>
                {detailModal.errorMessage ? (
                  <Text type="danger">{detailModal.errorMessage}</Text>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Request URL" span={2}>
                <Text code style={{ fontSize: 11, wordBreak: "break-all" }}>
                  {detailModal.requestUrl}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời điểm tạo">
                {detailModal.createdDate
                  ? new Date(detailModal.createdDate).toLocaleString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">{detailModal.createdBy || "-"}</Descriptions.Item>
            </Descriptions>

            <TabsWithCopy label="Request" content={detailModal.requestBody || "Không có request body"} />
            <TabsWithCopy label="Response" content={detailModal.responseBody || "Không có response body"} />
          </div>
        )}
      </Modal>
    </div>
  );
}

// =====================================================================
// TabWithCopy component
// =====================================================================
const TabsWithCopy: React.FC<{ label: string; content: string }> = ({ label, content }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      message.success(`Đã copy ${label.toLowerCase()}`);
    } catch {
      message.error("Không thể copy");
    }
  };

  const formatJson = (text: string) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  return (
    <Card
      size="small"
      title={
        <Space>
          <Text strong>{label}</Text>
        </Space>
      }
      extra={
        <Button  icon={<SyncOutlined />} onClick={handleCopy}>
          Copy
        </Button>
      }
      style={{ marginTop: 8 }}
    >
      <pre
        style={{
          background: "#1e1e1e",
          color: "#d4d4d4",
          padding: 12,
          borderRadius: 6,
          fontSize: 12,
          lineHeight: 1.5,
          fontFamily: "Consolas, monospace",
          maxHeight: 350,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          margin: 0,
        }}
      >
        {formatJson(content)}
      </pre>
    </Card>
  );
};

export default withAuthorization(DvcSyncLogPage, "");
