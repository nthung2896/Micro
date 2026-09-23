"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Typography, message, Card, Tag, Popconfirm, Modal, Form, Input } from "antd";
import { FileTextOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined, InfoCircleOutlined, BuildOutlined } from "@ant-design/icons";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";

const { Text, Paragraph } = Typography;

interface ListBaoCaoProps {
  onBaoCaoListChanged?: () => void;
  onConfigureTemplate?: (record: any) => void;
  refreshTrigger?: number;
}

const ListBaoCao: React.FC<ListBaoCaoProps> = ({ onBaoCaoListChanged, onConfigureTemplate, refreshTrigger }) => {
  const [loading, setLoading] = useState(false);
  const [baoCaos, setBaoCaos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const loadBaoCaos = async () => {
    setLoading(true);
    try {
      const res = await bcSubmissionService.getBaoCaoList();
      if (res?.status && res?.data?.items) {
        setBaoCaos(res.data.items);
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách loại báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaoCaos();
  }, [refreshTrigger]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: any) => {
    setEditingItem(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await bcSubmissionService.deleteBaoCao(id);
      if (res?.status) {
        message.success("Xóa loại báo cáo thành công!");
        loadBaoCaos();
        if (onBaoCaoListChanged) onBaoCaoListChanged();
      } else {
        message.error(res?.message || "Lỗi khi xóa loại báo cáo.");
      }
    } catch (err) {
      message.error("Lỗi kết nối khi xóa loại báo cáo.");
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        // Cập nhật
        const payload = {
          id: editingItem.id,
          name: values.name,
          description: values.description || "",
          mongoFormTemplateId: editingItem.mongoFormTemplateId
        };
        const res = await bcSubmissionService.updateBaoCao(payload);
        if (res?.status) {
          message.success("Cập nhật loại báo cáo thành công!");
          setIsModalOpen(false);
          loadBaoCaos();
          if (onBaoCaoListChanged) onBaoCaoListChanged();
        } else {
          message.error(res?.message || "Cập nhật thất bại.");
        }
      } else {
        // Thêm mới
        const payload = {
          name: values.name,
          description: values.description || ""
        };
        const res = await bcSubmissionService.createBaoCao(payload);
        if (res?.status) {
          message.success("Tạo loại báo cáo gốc thành công!");
          setIsModalOpen(false);
          loadBaoCaos();
          if (onBaoCaoListChanged) onBaoCaoListChanged();
        } else {
          message.error(res?.message || "Tạo thất bại.");
        }
      }
    } catch (err) {
      message.error("Lỗi kết nối.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: "Tên loại báo cáo",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (text: string) => <Text strong style={{ color: "#1e3a8a" }}>{text}</Text>
    },
    {
      title: "Mô tả / Ghi chú",
      dataIndex: "description",
      key: "description",
      width: 500,
      render: (text: string) => <Text type="secondary">{text || "---"}</Text>
    },
    {
      title: "Cấu hình Form",
      dataIndex: "mongoFormTemplateId",
      key: "mongoFormTemplateId",
      width: 200,
      align: "center" as const,
      render: (templateId: string) => templateId ? (
        <Tag color="cyan">Đã liên kết mẫu</Tag>
      ) : (
        <Tag color="orange">Chưa có mẫu</Tag>
      )
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 180,
      render: (date: string) => date ? new Date(date).toLocaleDateString("vi-VN") : "-"
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<BuildOutlined />}
            size="small"
            onClick={() => onConfigureTemplate?.(record)}
          >
            Cấu hình Word
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa loại báo cáo này?"
            description="Lưu ý: Hành động này chỉ nên thực hiện khi loại báo cáo chưa được tạo đợt."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card
        title={
          <Space>
            <FileTextOutlined style={{ color: "#3b82f6" }} />
            <span>Danh Sách Các Loại</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleOpenAdd}
            style={{ borderRadius: 8 }}
          >
            Thêm loại báo cáo
          </Button>
        }
        style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
      >
        <div style={{ marginBottom: 16, padding: 12, background: "#f8fafc", borderRadius: 8, borderLeft: "4px solid #3b82f6" }}>
          <Space align="start">
            <InfoCircleOutlined style={{ color: "#3b82f6", marginTop: 3 }} />
            <Paragraph style={{ margin: 0, color: "#64748b" }}>
              Nơi định nghĩa các loại báo cáo nghiệp vụ chính của hệ thống. Từ các loại báo cáo gốc này, Cán bộ có thể tạo ra các đợt nộp báo cáo cụ thể (theo tháng, quý, năm) và phân bổ cho các doanh nghiệp.
            </Paragraph>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={baoCaos}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: "#3b82f6" }} />
            <span>{editingItem ? "Cập nhật loại báo cáo" : "Thêm loại báo cáo gốc mới"}</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item
            label="Tên loại báo cáo"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại báo cáo gốc" },
              { max: 500, message: "Không quá 500 ký tự" }
            ]}
          >
            <Input size="large" placeholder="Ví dụ: Báo cáo định kỳ hoạt động mạng xã hội đa quốc gia" />
          </Form.Item>

          <Form.Item label="Mô tả / Hướng dẫn nghiệp vụ" name="description">
            <Input.TextArea rows={4} placeholder="Nhập các chú thích pháp lý hoặc mô tả ngắn về loại báo cáo này..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ListBaoCao;
