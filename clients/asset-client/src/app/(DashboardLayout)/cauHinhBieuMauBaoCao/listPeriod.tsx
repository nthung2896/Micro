"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  message,
  Card,
  Tag,
  Popconfirm,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Flex,
  Pagination,
  TableColumnsType,
} from "antd";
import {
  CalendarOutlined,
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import dayjs from "dayjs";
import { apiService } from "@/services";
import RichTextEditor from "@/components/shared-components/RichTextEditor";

const { Text } = Typography;

interface ListPeriodProps {
  refreshTrigger?: number;
}

const ListPeriod: React.FC<ListPeriodProps> = ({ refreshTrigger }) => {
  const [loading, setLoading] = useState(false);
  const [periods, setPeriods] = useState<any[]>([]);

  // States cho Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // States cho danh sách Doanh nghiệp được phân bổ
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformPage, setPlatformPage] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
  });
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<React.Key[]>(
    [],
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<any[]>([]);
  const [addingTargets, setAddingTargets] = useState(false);
  const [idDotBaoCao, setIdDotBaoCao] = useState<string>("");

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const res = await bcSubmissionService.getPeriods();
      if (res?.status && res?.data) {
        setPeriods(res.data);
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách đợt báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await bcSubmissionService.getAllTemplates();
      if (res?.status && res?.data) {
        setTemplates(res.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadPeriods();
    loadTemplates();
  }, [refreshTrigger]);

  // const handleAssign = async (id: string) => {
  //   try {
  //     const res = await bcSubmissionService.assignSubjects(id);
  //     if (res?.status) {
  //       message.success(res.message || "Đã phân bổ đối tượng thành công!");
  //       loadPeriods();
  //     } else {
  //       message.error(res?.message || "Không thể phân bổ thêm đối tượng.");
  //     }
  //   } catch (err) {
  //     message.error("Lỗi kết nối khi phân bổ đối tượng.");
  //   }
  // };

  const handleAssign = async (pageIndex = 1, pageSize = 10, id?: string) => {
    try {
      setIsAddModalOpen(true);
      const searchParams = {
        pageIndex,
        pageSize,
        IdDotBaoCao: id,
      };
      // Fetch platforms not in the reporting period
      setIdDotBaoCao(id || "");
      const response = await apiService.post<any>(
        "/BCBaoCaoDoiTuong/GetNenTang",
        searchParams,
      );
      if (response?.data) {
        setPlatforms(response.data.items || []);
        setPlatformPage({
          pageIndex: response.data.pageIndex,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount,
        });
      }
    } catch (err) {
      message.error("Lỗi kết nối khi phân bổ đối tượng.");
    }
  };

  const handleViewSubjects = async (record: any) => {
    setSelectedPeriod(record);
    setIsSubjectModalOpen(true);
    setSubjectLoading(true);
    try {
      const res = await bcSubmissionService.getMyReports();
      if (res?.status && res?.data) {
        const filtered = res.data.filter(
          (item: any) => item.idDotBaoCao === record.id,
        );
        setSubjects(filtered);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách doanh nghiệp báo cáo.");
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await bcSubmissionService.deletePeriod(id);
      if (res?.status) {
        message.success("Đã xóa đợt báo cáo thành công!");
        loadPeriods();
      } else {
        message.error(res?.message || "Lỗi khi xóa đợt báo cáo.");
      }
    } catch (err) {
      message.error("Lỗi kết nối khi xóa dữ liệu.");
    }
  };

  const handleEdit = (record: any) => {
    setCurrentPeriod(record);
    editForm.setFieldsValue({
      name: record.name,
      mongoFormTemplateId: record.mongoFormTemplateId,
      timeRange: [
        record.timeStart ? dayjs(record.timeStart) : null,
        record.timeEnd ? dayjs(record.timeEnd) : null,
      ],
      description: record.description,
      scheduledSendDate: record.scheduledSendDate
        ? dayjs(record.scheduledSendDate)
        : null,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...currentPeriod,
        name: values.name,
        mongoFormTemplateId: values.mongoFormTemplateId,
        timeStart: values.timeRange?.[0]?.toISOString(),
        timeEnd: values.timeRange?.[1]?.toISOString(),
        description: values.description,
        scheduledSendDate: values.scheduledSendDate
          ? values.scheduledSendDate.toISOString()
          : null,
      };
      const res = await bcSubmissionService.updatePeriod(payload);
      if (res?.status) {
        message.success("Cập nhật đợt báo cáo thành công!");
        setIsEditModalOpen(false);
        loadPeriods();
      } else {
        message.error(res?.message || "Lỗi khi cập nhật.");
      }
    } catch (err) {
      message.error("Lỗi kết nối.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Tên đợt báo cáo",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Text strong style={{ color: "#1e3a8a" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "timeStart",
      key: "timeStart",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Hạn nộp",
      dataIndex: "timeEnd",
      key: "timeEnd",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Ngày gửi tự động",
      dataIndex: "scheduledSendDate",
      key: "scheduledSendDate",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : (
          <Tag color="default">Chưa cài</Tag>
        ),
    },
    {
      title: "Trạng thái Gửi",
      dataIndex: "isSend",
      key: "isSend",
      render: (isSend: boolean) =>
        isSend ? (
          <Tag color="green">Đã kích hoạt</Tag>
        ) : (
          <Tag color="default">Chưa kích hoạt</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            
            icon={<UserAddOutlined />}
            style={{ background: "#8b5cf6", borderColor: "#8b5cf6" }}
            onClick={() => handleAssign(1, 10, record.id)}
          >
            Phân bổ đối tượng
          </Button>
          <Button
            type="dashed"
            
            icon={<TeamOutlined />}
            onClick={() => handleViewSubjects(record)}
          >
            Danh sách DN
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa đợt báo cáo?"
            description="Lưu ý: Hành động này sẽ xóa cả các nhiệm vụ báo cáo đã giao cho doanh nghiệp trong đợt này."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const platformColumns: TableColumnsType<any> = [
    {
      title: "Tên nền tảng/doanh nghiệp",
      dataIndex: "name",
      render: (text: string, record: any) => (
        <strong>{text || record?.companyName || "-"}</strong>
      ),
    },
    {
      title: "Loại nền tảng",
      dataIndex: "platformManageTypeName",
      width: 150,
      render: (val: string, record: any) => val || record?.typeDoiTuong || "-",
    },
    {
      title: "Mã số thuế",
      dataIndex: "companyTaxCode",
      width: 150,
      render: (val: string) => val || "-",
    },
    {
      title: "Tên miền",
      dataIndex: "domain",
      width: 200,
      render: (val: string) => val || "-",
    },
  ];

  const subjectColumns = [
    {
      title: "Tên doanh nghiệp",
      dataIndex: "companyName",
      key: "companyName",
      render: (text: string) => <Text strong>{text || "---"}</Text>,
    },
    {
      title: "Mã số thuế",
      dataIndex: "companyTaxcode",
      key: "companyTaxcode",
      width: 150,
    },
    {
      title: "Trạng thái nộp",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => {
        if (status === "SUBMITTED") {
          return <Tag color="success">Đã nộp báo cáo</Tag>;
        }
        return <Tag color="warning">Chưa nộp (Nháp)</Tag>;
      },
    },
  ];

  const handleAddSubmit = async (id: string) => {
    if (selectedPlatforms.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đối tượng");
      return;
    }
    setAddingTargets(true);
    try {
      // Map to BCDotBaoCaoDoiTuongRequest
      const requests = selectedPlatforms.map((p) => ({
        idDoiTuong: p.id,
        idDotBaoCao: id,
        typeDoiTuong: p.typeDoiTuong || "DOANH_NGHIEP", // Default or map if exist
        typeOrganization: p.typeOrganization || "N/A", // Required field
        idOrganization: p.idOrganization || null,
        status: "DRAFT",
        isSend: false,
        companyName: p.companyName || p.name,
        companyTaxcode: p.companyTaxCode,
      }));

      await apiService.post<any>(`/BCDotBaoCao/SendRequireReport`, requests);
      message.success("Thêm đối tượng báo cáo thành công");
      setSelectedPlatformIds([]);
      setSelectedPlatforms([]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm đối tượng:", error);
      message.error("Thêm đối tượng thất bại");
    } finally {
      setAddingTargets(false);
    }
  };

  return (
    <>
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: "#8b5cf6" }} />
            <span>Danh Sách Các Đợt Báo Cáo Đã Tạo</span>
          </Space>
        }
        style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
      >
        <Table
          columns={columns}
          dataSource={periods}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <EditOutlined style={{ color: "#3b82f6" }} />
            <span>Chỉnh sửa đợt báo cáo</span>
          </Space>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={() => editForm.submit()}
        confirmLoading={submitting}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Tên đợt báo cáo"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên đợt nộp" }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Mẫu cấu hình biểu mẫu (MongoDB)"
            name="mongoFormTemplateId"
            rules={[{ required: true, message: "Vui lòng chọn mẫu biểu mẫu" }]}
          >
            <Select size="large" allowClear suffixIcon={<FileTextOutlined />}>
              {templates.map((tpl) => (
                <Select.Option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Kỳ hạn nộp"
            name="timeRange"
            rules={[{ required: true, message: "Vui lòng chọn hạn nộp" }]}
          >
            <DatePicker.RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              size="large"
            />
          </Form.Item>

          <Form.Item label="Mô tả hướng dẫn" name="description">
            <RichTextEditor
              value={editForm.getFieldValue("description") || ""}
              onChange={(value) => editForm.setFieldValue("description", value)}
            />
          </Form.Item>

          <Form.Item
            label="Ngày gửi mail/thông báo tự động"
            name="scheduledSendDate"
            tooltip="Hệ thống sẽ tự động gửi mail và thông báo nhắc nhở vào thời điểm này"
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              size="large"
              placeholder="Chọn ngày gửi tự động"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm đối tượng báo cáo (Nền tảng)"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        width={800}
        onOk={() => handleAddSubmit(idDotBaoCao)}
        confirmLoading={addingTargets}
        okText="Thêm đối tượng đã chọn"
        cancelText="Đóng"
        destroyOnClose
      >
        <Table
          rowSelection={{
            selectedRowKeys: selectedPlatformIds,
            onChange: (newSelectedRowKeys, newSelectedRows) => {
              setSelectedPlatformIds(newSelectedRowKeys);
              setSelectedPlatforms(newSelectedRows);
            },
          }}
          columns={platformColumns}
          dataSource={platforms}
          rowKey="id"
          pagination={false}
          loading={platformLoading}
          scroll={{ y: 400 }}
          bordered
          size="small"
        />
        <Flex justify="flex-end" style={{ marginTop: 16 }}>
          <Pagination
            size="small"
            total={platformPage.totalCount || 0}
            current={platformPage.pageIndex || 1}
            pageSize={platformPage.pageSize || 10}
            showSizeChanger
            onChange={(page, size) => {
              handleAssign(page, size);
            }}
          />
        </Flex>
      </Modal>

      {/* Modal hiển thị danh sách Doanh nghiệp yêu cầu làm báo cáo */}
      <Modal
        title={
          <Space>
            <TeamOutlined style={{ color: "#8b5cf6" }} />
            <span>
              Danh sách doanh nghiệp yêu cầu báo cáo - {selectedPeriod?.name}
            </span>
          </Space>
        }
        open={isSubjectModalOpen}
        onCancel={() => setIsSubjectModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsSubjectModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <div style={{ marginTop: 16 }}>
          <Table
            columns={subjectColumns}
            dataSource={subjects}
            loading={subjectLoading}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            locale={{
              emptyText: "Chưa có doanh nghiệp nào được phân bổ trong đợt này.",
            }}
            bordered
          />
        </div>
      </Modal>
    </>
  );
};

export default ListPeriod;
