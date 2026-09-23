"use client";

// --- Ant Design Imports ---
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
  Flex,
  Typography,
} from "antd";
import {
  DeleteFilled,
  EditFilled,
  PlusOutlined,
  SyncOutlined,
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "@/store/hooks";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { HolidayConfigsType } from "@/types/holidayConfigs/dto";
import { HolidayConfigsSearchType } from "@/types/holidayConfigs/request";
import holidayConfigsService from "@/services/holidayConfigs/holidayConfigs.service";
import { DropdownOption } from "@/types/general";
import SearchForm from "./search";
import UpsertForm from "./upsertForm";
import withAuthorization from "@/libs/authentication";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";

const { Title, Text } = Typography;

function HolidayConfigPage() {
  const dispatch = useDispatch();
  const [data, setData] = useState<HolidayConfigsType[]>([]);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useState<HolidayConfigsSearchType>({
    pageIndex: 1,
    pageSize: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<HolidayConfigsType | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [typeOptions, setTypeOptions] = useState<DropdownOption[]>([]);

  const [form] = Form.useForm();
  const [upsertForm] = Form.useForm();

  // Tải danh sách ngày lễ
  const fetchData = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      const res = await holidayConfigsService.getData(searchParams);
      if (res?.data) {
        setData(res.data.items || []);
        setTotal(res.data.totalCount || 0);
      }
    } catch (err) {
      message.error("Lỗi tải dữ liệu cấu hình ngày lễ");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const res = await holidayConfigsService.getDropdowns(["type"]);
        if (res?.data) {
          const dropdowns = res.data as any;
          const options = dropdowns.holidayType || [];
          const normalized = options.map((item: any) => ({
            label: item.label ?? "",
            value: item.value ?? "",
          })).filter((item: any) => item.label && item.value !== undefined && item.value !== null && item.value !== "");
          console.log("Loaded type options:", normalized); // Debug giá trị options
          setTypeOptions(normalized);
        }
      } catch (err) {
        console.error("Lỗi tải dropdowns", err);
      }
    };
    loadDropdowns();
  }, []);

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

  const handleOpenEdit = async (record: HolidayConfigsType) => {
    dispatch(setIsLoading(true));
    try {
      const res = await holidayConfigsService.get(record.id);
      if (res?.data) {
        setEditRecord(res.data);
        upsertForm.setFieldsValue(res.data);
        setModalOpen(true);
      }
    } catch {
      message.error("Lỗi lấy thông tin ngày lễ");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleDelete = (record: HolidayConfigsType) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: `Bạn có chắc chắn muốn xoá cấu hình ngày lễ "${record.description || 'này'}"?`,
      okText: "Xoá",
      cancelText: "Huỷ",
      okButtonProps: { danger: true },
      onOk: async () => {
        dispatch(setIsLoading(true));
        try {
          await holidayConfigsService.delete(record.id);
          message.success("Xoá ngày lễ thành công");
          fetchData();
        } catch {
          message.error("Xoá ngày lễ thất bại");
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
        await holidayConfigsService.update({ ...values, id: editRecord.id });
        message.success("Cập nhật ngày lễ thành công");
      } else {
        await holidayConfigsService.create(values);
        message.success("Thêm mới ngày lễ thành công");
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
      title: "Tên ngày lễ",
      dataIndex: "description",
      key: "description",
      width: 200,
    },
    {
      title: "Ngày",
      key: "date",
      width: 120,
      align: "center" as const,
      render: (val: any) => {
        const day = val?.day?.toString().padStart(2, "0") || "??";
        const month = val?.month?.toString().padStart(2, "0") || "??";
        const year = val?.year || "????";
        return `${day}/${month}` + (val?.year ? `/${year}` : ""); // Hiển thị năm nếu có
      }
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (val: string) => {
        const option = typeOptions.find((opt) => String(opt.value) === String(val));
        return option ? option.label : val;
      },
    },
    {
      title: "Đi làm",
      dataIndex: "isWorking",
      key: "isWorking",
      width: 120,
      align: "center" as const,
      render: (val: boolean) => (
        <Tag color={val ? "success" : "default"}>
          {val ? "Có đi làm" : "Nghỉ"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: HolidayConfigsType) => (
        <Space direction="horizontal" size={8}>
          <Tooltip title="Sửa">
            <Button
              
              type="primary"
              onClick={() => handleOpenEdit(record)}
              icon={<EditFilled />}
            />
          </Tooltip>

          <Tooltip title="Xoá">
            <Button
              
              danger
              onClick={() => handleDelete(record)}
              icon={<DeleteFilled />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "8px" }}>
      {/* Header trang cập nhật theo Holiday */}
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Cấu hình ngày lễ</Title>
        <Text type="secondary">Quản lý danh sách và cấu hình các ngày nghỉ lễ trong năm</Text>
      </div>

      <AutoBreadcrumb />

      <div style={{ marginTop: 16 }}>
        {isPanelVisible && <SearchForm onFinish={handleSearch} form={form} typeOptions={typeOptions} />}

        {/* Thanh công cụ */}
        <Flex justify="space-between" align="center" style={{ marginBottom: 16, marginTop: 16 }}>
          <Text type="secondary">Tổng số: {total} bản ghi</Text>

          <Flex gap={8}>
            <Button
              type={isPanelVisible ? "primary" : "default"}
              icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
              onClick={() => setIsPanelVisible(!isPanelVisible)}
            >
              {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
            </Button>

            <Tooltip title="Làm mới">
              <Button
                shape="circle"
                icon={<SyncOutlined />}
                onClick={() => {
                  form.resetFields();
                  setSearchParams({
                    pageIndex: 1,
                    pageSize: 20,
                  });
                }}
              />
            </Tooltip>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
            >
              Thêm mới
            </Button>
          </Flex>
        </Flex>

        {/* Bảng dữ liệu ngày lễ */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
          scroll={{ x: 600 }}
        />

        {/* Phân trang */}
        <Flex justify="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            current={searchParams.pageIndex}
            pageSize={searchParams.pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
            showTotal={(t) => `Tổng ${t} ngày lễ`}
          />
        </Flex>
      </div>

      {/* Modal Thêm mới / Cập nhật ngày lễ */}
      <Modal
        title={editRecord ? "Cập nhật ngày lễ" : "Thêm mới ngày lễ"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <UpsertForm
          form={upsertForm}
          onFinish={handleSubmit}
          initialValues={editRecord}
          typeOptions={typeOptions}
        />
      </Modal>
    </div>
  );
}

export default withAuthorization(HolidayConfigPage, "");