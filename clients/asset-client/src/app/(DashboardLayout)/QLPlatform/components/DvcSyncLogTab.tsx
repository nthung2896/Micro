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
  Tooltip,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { apiService } from "@/services/index";

const { Text } = Typography;

// =====================================================================
// Types & Constants
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

const ACTION_TYPE_MAP: Record<string, string> = {
  GetToken: "Lấy token xác thực",
  GetNextValue: "Lấy mã số tiếp theo",
  UploadFile: "Tải lên tài liệu",
  CreateDossier: "Tạo hồ sơ DVC",
  CapNhatTienTrinh: "Cập nhật tiến trình",
  CapNhatTrangThai: "Cập nhật trạng thái",
};

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

interface DvcSyncLogTabProps {
  maHoSo?: string;
}

const DvcSyncLogTab: React.FC<DvcSyncLogTabProps> = ({ maHoSo }) => {
  const [data, setData] = useState<DvcSyncLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    pageIndex: 1,
    pageSize: 10,
    maHoSo: maHoSo || "NONE", // Default to NONE if empty to only load this record's logs
  });
  const [detailModal, setDetailModal] = useState<DvcSyncLogItem | null>(null);
  const [searchForm] = Form.useForm();

  // Sync log fetch
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiService.post<any>("/DvcSyncLog/GetData", searchParams);
      if (r?.status && r.data) {
        setData(r.data.items || []);
        setTotal(r.data.totalCount || 0);
      }
    } catch {
      message.error("Lỗi tải dữ liệu lịch sử đồng bộ");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    // Only perform fetch if we have a valid dossier code
    if (maHoSo) {
      setSearchParams((prev) => ({ ...prev, maHoSo }));
    } else {
      setData([]);
      setTotal(0);
    }
  }, [maHoSo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (values: any) => {
    const params: SearchParams = {
      pageIndex: 1,
      pageSize: searchParams.pageSize,
      maHoSo: maHoSo || "NONE",
    };
    if (values.actionType) params.actionType = values.actionType;
    if (values.isSuccess !== undefined && values.isSuccess !== null) {
      params.isSuccess = values.isSuccess;
    }
    if (values.keyword) params.keyword = values.keyword;
    setSearchParams(params);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      pageIndex: 1,
      pageSize: searchParams.pageSize,
      maHoSo: maHoSo || "NONE",
    });
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) =>
        (searchParams.pageIndex - 1) * searchParams.pageSize + index + 1,
    },
    {
      title: "Hành động (Action)",
      dataIndex: "actionType",
      width: 180,
      render: (v: string) => (
        <Tag color={ACTION_COLORS[v] || "default"}>
          {ACTION_TYPE_MAP[v] || v}
        </Tag>
      ),
    },
    {
      title: "Nội dung xử lý",
      dataIndex: "requestBody",
      ellipsis: true,
      render: (v: string) => {
        if (!v) return "—";
        try {
          const data = JSON.parse(v);
          const text = Array.isArray(data)
            ? (data[0]?.NoiDungXuLy || data[0]?.noiDungXuLy)
            : (data?.NoiDungXuLy || data?.noiDungXuLy);
          return text ? (
            <Tooltip title={text}>
              <span>{text}</span>
            </Tooltip>
          ) : (
            "—"
          );
        } catch {
          return "—";
        }
      },
    },
    {
      title: "Trạng thái (Status)",
      dataIndex: "statusCode",
      width: 100,
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
      title: "Thời gian xử lý",
      dataIndex: "durationMs",
      width: 110,
      render: (ms: number) => `${ms}ms`,
    },
    {
      title: "Lỗi phát sinh",
      dataIndex: "errorMessage",
      ellipsis: true,
      render: (v: string) =>
        v ? (
          <Tooltip title={v}>
            <Text type="danger" style={{ fontSize: 12 }}>
              {v.length > 60 ? v.substring(0, 60) + "..." : v}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Thời điểm thực hiện",
      dataIndex: "createdDate",
      width: 160,
      render: (v: string) => {
        if (!v) return "—";
        const d = new Date(v);
        return d.toLocaleString("vi-VN");
      },
    },
    {
      title: "Thao tác",
      width: 100,
      align: "center" as const,
      render: (_: any, record: DvcSyncLogItem) => (
        <Button
          type="link"
          
          icon={<EyeOutlined />}
          onClick={() => setDetailModal(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Search Bar */}
      <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }}>
        <Form form={searchForm} onFinish={handleSearch} layout="inline">
          <Row gutter={[12, 12]} style={{ width: "100%" }} align="middle">
            <Col>
              <Form.Item name="actionType" label="Loại hành động" style={{ margin: 0, minWidth: 180 }}>
                <Select placeholder="Tất cả" allowClear>
                  {ACTION_TYPES.map((type) => (
                    <Select.Option key={type} value={type}>
                      {ACTION_TYPE_MAP[type] || type}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="isSuccess" label="Trạng thái" style={{ margin: 0, minWidth: 140 }}>
                <Select placeholder="Tất cả" allowClear>
                  <Select.Option value={true}>Thành công</Select.Option>
                  <Select.Option value={false}>Thất bại</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="keyword" style={{ margin: 0, minWidth: 180 }}>
                <Input placeholder="Tìm kiếm lỗi..." allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Space>
                <Button color="cyan" variant="solid" htmlType="submit" icon={<SearchOutlined />}>
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>Reset</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Logs Table */}
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        bordered
        size="small"
      />

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          total={total}
          current={searchParams.pageIndex}
          pageSize={searchParams.pageSize}
          showTotal={(t, range) => `${range[0]}-${range[1]} trong ${t} logs`}
          onChange={(page, size) =>
            setSearchParams((prev) => ({ ...prev, pageIndex: page, pageSize: size }))
          }
          align="end"
        />
      </div>

      {/* Log Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Chi tiết lịch sử đồng bộ
            {detailModal && (
              <Tag color={ACTION_COLORS[detailModal.actionType]}>
                {ACTION_TYPE_MAP[detailModal.actionType] || detailModal.actionType}
              </Tag>
            )}
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
              <Descriptions.Item label="Hành động">
                <Tag color={ACTION_COLORS[detailModal.actionType]}>
                  {ACTION_TYPE_MAP[detailModal.actionType] || detailModal.actionType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
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
                {detailModal.maHoSo || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="IdHoSo" span={2}>
                {detailModal.idHoSo || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Lỗi" span={2}>
                {detailModal.errorMessage ? (
                  <Text type="danger">{detailModal.errorMessage}</Text>
                ) : (
                  "—"
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
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">{detailModal.createdBy || "—"}</Descriptions.Item>
            </Descriptions>

            <TabsWithCopy label="Request" content={detailModal.requestBody || "Không có request body"} />
            <TabsWithCopy label="Response" content={detailModal.responseBody || "Không có response body"} />
          </div>
        )}
      </Modal>
    </div>
  );
};

// =====================================================================
// TabsWithCopy helper component
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

export default DvcSyncLogTab;
