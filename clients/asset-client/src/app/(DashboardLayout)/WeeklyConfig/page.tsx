"use client";

import { 
  Table, 
  Pagination, 
  Modal, 
  message, 
  Form, 
  Tooltip, 
  Button, 
  Space, 
  Tag, 
  Typography,
  Breadcrumb,
  Card
} from "antd";
import { useEffect, useState, useCallback } from "react";

// --- Hooks & Services của dự án ---
import { useDispatch } from "@/store/hooks";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { WeeklyConfigType } from "@/types/weeklyConfig/dto";
import { WeeklyConfigSearchType } from "@/types/weeklyConfig/request";
import weeklyConfigService from "@/services/weeklyConfig/weeklyConfig.service";

// --- Child Components ---
import SearchForm from "./search";
import UpsertForm from "./upsertForm";
import { DeleteOutlined, EditOutlined, PlusOutlined, SyncOutlined, SearchOutlined, CloseOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "Chủ nhật",
  1: "Thứ hai",
  2: "Thứ ba",
  3: "Thứ tư",
  4: "Thứ năm",
  5: "Thứ sáu",
  6: "Thứ bảy",
};

export default function WeeklyConfigPage() {
  const dispatch = useDispatch();
  const [data, setData] = useState<WeeklyConfigType[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<WeeklyConfigSearchType>({
    pageIndex: 1,
    pageSize: 20,
  } as WeeklyConfigSearchType);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<WeeklyConfigType | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  
  const [form] = Form.useForm();
  const [upsertForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      const res = await weeklyConfigService.getData(searchParams);
      if (res?.data) {
        setData(res.data.items || []);
        setTotal(res.data.totalCount || 0);
      }
    } catch (err) {
      message.error("Lỗi tải dữ liệu");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (values: any) => {
    setSearchParams((prev) => ({ ...prev, ...values, pageIndex: 1 }));
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setSearchParams((prev) => ({ ...prev, pageIndex: page, pageSize }));
  };

  const handleOpenCreate = () => {
    setEditRecord(null);
    upsertForm.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = async (record: WeeklyConfigType) => {
    dispatch(setIsLoading(true));
    try {
      const res = await weeklyConfigService.get(record.id);
      if (res?.data) {
        setEditRecord(res.data);
        upsertForm.setFieldsValue(res.data);
        setModalOpen(true);
      }
    } catch {
      message.error("Lỗi lấy dữ liệu");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleDelete = (record: WeeklyConfigType) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: `Bạn có chắc chắn muốn xoá cấu hình "${DAY_OF_WEEK_LABELS[record.dayOfWeek] || record.dayOfWeek}"?`,
      okText: "Xoá",
      cancelText: "Huỷ",
      okButtonProps: { danger: true },
      onOk: async () => {
        dispatch(setIsLoading(true));
        try {
          await weeklyConfigService.delete(record.id);
          message.success("Xoá thành công");
          fetchData();
        } catch {
          message.error("Xoá thất bại");
        } finally {
          dispatch(setIsLoading(false));
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    dispatch(setIsLoading(true));
    try {
      if (editRecord) {
        await weeklyConfigService.update({ ...values, id: editRecord.id });
        message.success("Cập nhật thành công");
      } else {
        await weeklyConfigService.create(values);
        message.success("Thêm mới thành công");
      }
      setModalOpen(false);
      upsertForm.resetFields();
      fetchData();
    } catch {
      message.error(editRecord ? "Cập nhật thất bại" : "Thêm mới thất bại");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) =>
        ((searchParams.pageIndex || 1) - 1) * (searchParams.pageSize || 20) + index + 1,
    },
    {
      title: "Thứ",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      width: 150,
      render: (val: number) => DAY_OF_WEEK_LABELS[val] || `Ngày ${val}`,
    },
    {
      title: "Ngày làm việc",
      dataIndex: "isWorking",
      key: "isWorking",
      width: 140,
      align: "center" as const,
      render: (val: boolean) => (
        <Tag color={val ? "success" : "default"}>
          {val ? "Có" : "Không"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center" as const,
      render: (_: any, record: WeeklyConfigType) => (
        <Space size="small">
          <Tooltip title="Sửa">
            <Button 
              type="text" 
               
              icon={<EditOutlined size={18} style={{ color: '#0355a2' }} />} 
              onClick={() => handleOpenEdit(record)} 
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <Button 
              type="text" 
               
              danger
              icon={<DeleteOutlined size={18} />} 
              onClick={() => handleDelete(record)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Breadcrumb chuẩn của Ant Design */}
      <Breadcrumb 
        style={{ marginBottom: 16 }}
        items={[
          { title: "Trang chủ", href: "/" },
          { title: "Cấu hình lịch tuần" }
        ]}
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Cấu hình lịch tuần</Title>
          <Text type="secondary">Quản lý cấu hình ngày làm việc trong tuần</Text>
        </div>

        {isPanelVisible && <SearchForm onFinish={handleSearch} form={form} />}
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0" }}>
          <Text strong>Tổng số: {total} bản ghi</Text>
          
          <Space>
            <Button
              type={isPanelVisible ? "primary" : "default"}
              icon={isPanelVisible ? <CloseOutlined size={18} /> : <SearchOutlined size={18} />}
              onClick={() => setIsPanelVisible(!isPanelVisible)}
            >
              {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
            </Button>
            <Tooltip title="Làm mới">
              <Button 
                type="default" 
                icon={<SyncOutlined size={18} />} 
                onClick={() => { 
                  form.resetFields(); 
                  setSearchParams({ pageIndex: 1, pageSize: 20 } as WeeklyConfigSearchType); 
                }} 
              />
            </Tooltip>
            <Button 
              color="green" variant="solid" 
              icon={<PlusOutlined size={18} />} 
              onClick={handleOpenCreate}
            >
              Thêm mới
            </Button>
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          pagination={false} 
          size="small" 
          bordered 
          scroll={{ x: 500 }} 
        />
        
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Pagination 
            current={searchParams.pageIndex} 
            pageSize={searchParams.pageSize} 
            total={total} 
            onChange={handlePageChange} 
            showSizeChanger 
            showTotal={(t) => `Tổng ${t} bản ghi`} 
          />
        </div>
      </Card>

      <Modal 
        title={editRecord ? "Cập nhật cấu hình" : "Thêm mới cấu hình"} 
        open={modalOpen} 
        onCancel={() => setModalOpen(false)} 
        footer={null} 
        destroyOnClose
      >
        <UpsertForm form={upsertForm} onFinish={handleSubmit} initialValues={editRecord} />
      </Modal>
    </div>
  );
}