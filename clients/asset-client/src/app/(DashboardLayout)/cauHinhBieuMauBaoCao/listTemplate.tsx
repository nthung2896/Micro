"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Typography, message, Popconfirm, Card, Modal, Input, InputNumber, Form } from "antd";
import { FileTextOutlined, DeleteOutlined, EyeOutlined, BuildOutlined, InfoCircleOutlined } from "@ant-design/icons";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import HtmlFormRenderer from "./components/HtmlFormRenderer";

const { Text } = Typography;

const ListTemplate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await bcSubmissionService.getAllTemplates();
      if (res?.status && res?.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách mẫu biểu mẫu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleView = (record: any) => {
    setSelectedTemplate(record);
    setIsPreviewOpen(true);
  };

  const columns = [
    {
      title: "Tên mẫu biểu mẫu",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: "#3b82f6" }} />
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: "Loại đối tượng",
      dataIndex: "doiTuongTypes",
      key: "doiTuongTypes",
       render: (vals: string[]) => (
              <>
                {vals?.map((val) => {
                  switch (val) {
                    case "DOANH_NGHIEP":
                      return (
                        <Tag key={val} color="geekblue">
                          Doanh nghiệp
                        </Tag>
                      );
      
                    case "NEN_TANG":
                      return (
                        <Tag key={val} color="purple">
                          Nền tảng
                        </Tag>
                      );
      
                    case "HO_KINH_DOANH":
                      return (
                        <Tag key={val} color="cyan">
                          Hộ kinh doanh
                        </Tag>
                      );
      
                    default:
                      return <Tag key={val}>{val}</Tag>;
                  }
                })}
              </>
            ),

    },
    {
      title: "Số thành phần",
      key: "componentCount",
      align: "center" as const,
      render: (_: any, record: any) => record.thanhPhanForms?.length || 0
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date: string) => date ? new Date(date).toLocaleString("vi-VN") : "-"
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="primary"
            ghost
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          >
            Xem mẫu
          </Button>
          <Popconfirm
            title="Xóa mẫu biểu mẫu?"
            description="Bạn có chắc chắn muốn xóa mẫu này không? Dữ liệu đã nộp có thể bị ảnh hưởng."
            onConfirm={() => message.warning("Tính năng xóa đang được bảo trì")}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card 
        title={<Space><BuildOutlined style={{ color: "#10b981" }} /><span>Kho Lưu Trữ Mẫu Biểu Mẫu (MongoDB)</span></Space>}
        style={{ borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
      >
        <Table 
          columns={columns} 
          dataSource={templates} 
          loading={loading} 
          rowKey="id" 
          pagination={{ pageSize: 5 }} 
        />
      </Card>

      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: "#10b981" }} />
            <span>Xem trước mẫu biểu mẫu: {selectedTemplate?.name}</span>
          </Space>
        }
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewOpen(false)}>
            Đóng
          </Button>
        ]}
        width={1000}
        destroyOnClose
        centered
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto", padding: "12px 0" }}>
          <Form layout="vertical" disabled>
            {selectedTemplate?.thanhPhanForms?.map((thanhPhan: any, idx: number) => {
              if (thanhPhan.componentType === "GRID") {
                const columnsSim = [
                  {
                    title: thanhPhan.gridDataSourceCategory === "DM_TINH" ? "Tỉnh/Thành phố" : "Danh mục dòng",
                    dataIndex: "text",
                    key: "text",
                    render: (text: string) => {
                      const isDyn = text === "..." || text?.includes("…") || text?.includes("...") || text?.toLowerCase()?.includes("dynamic") || text?.toLowerCase()?.includes("custom") || text?.includes("[DYNAMIC]") || text?.includes("[CUSTOM]");
                      if (isDyn) {
                        return <Input placeholder="Nhập tên chỉ tiêu..." disabled value={text} style={{ width: "100%" }} />;
                      }
                      return <Text strong>{text || "Giá trị mẫu"}</Text>;
                    }
                  },
                  ...thanhPhan.inputs.map((inp: any) => ({
                    title: inp.displayName || inp.inputKey,
                    key: inp.inputKey,
                    render: () => <InputNumber placeholder="0" disabled style={{ width: "100%" }} />
                  }))
                ];

                return (
                  <Card 
                    key={thanhPhan.idThanhPhan || idx} 
                    title={<Text strong style={{ color: "#1e3a8a" }}>Thành phần {idx + 1}: {thanhPhan.name} (Bảng biểu Excel)</Text>}
                    style={{ marginBottom: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  >
                    <Table 
                      dataSource={thanhPhan.gridRows && thanhPhan.gridRows.length > 0 ? thanhPhan.gridRows : [{ text: "Giá trị mẫu" }]} 
                      columns={columnsSim} 
                      pagination={false} 
                      size="small" 
                      bordered
                    />
                  </Card>
                );
              } else {
                return (
                  <Card 
                    key={thanhPhan.idThanhPhan || idx} 
                    title={<Text strong style={{ color: "#1e3a8a" }}>Thành phần {idx + 1}: {thanhPhan.name} (Form nhập liệu)</Text>}
                    style={{ marginBottom: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                  >
                    {thanhPhan.htmlContent ? (
                      <HtmlFormRenderer 
                        htmlContent={thanhPhan.htmlContent} 
                        inputs={thanhPhan.inputs} 
                      />
                    ) : (
                      <div style={{ padding: "8px" }}>
                        {thanhPhan.inputs?.map((inp: any) => (
                          <div key={inp.inputKey} style={{ marginBottom: 12 }}>
                            <Text>{inp.displayName || inp.inputKey} {inp.required && <span style={{ color: "red" }}>*</span>}</Text>
                            <Input placeholder={inp.placeHolder || ""} disabled style={{ marginTop: 6 }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              }
            })}
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default ListTemplate;