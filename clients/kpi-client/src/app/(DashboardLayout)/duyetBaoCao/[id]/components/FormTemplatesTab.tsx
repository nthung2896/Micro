import React, { useCallback, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Typography,
  Empty,
  message,
  Spin,
  Tag,
  Form,
  Flex,
} from "antd";
import { EyeOutlined, SettingOutlined } from "@ant-design/icons";
import { BCFormTemplateType, BCThanhPhanFormType } from "@/types/bcFormTemplate/dto";
import HtmlTemplatePreview from "@/app/(DashboardLayout)/cauHinhBieuMau/components/HtmlTemplatePreview";
import { useRouter } from "next/navigation";
import bcFormTemplateService from "@/services/bcFormTemplate/bcFormTemplate.service";
import HtmlFormRenderer from "@/app/(DashboardLayout)/cauHinhBieuMauBaoCao/components/HtmlFormRenderer";
import Text from "antd/es/typography/Text";
import { useDispatch } from "@/store/hooks";
import { AppDispatch } from "@/store/store";

const { Title } = Typography;

interface FormTemplatesTabProps {
  templates?: BCFormTemplateType[];
}

const FormTemplatesTab: React.FC<FormTemplatesTabProps> = ({ templates }) => {
  const router = useRouter();
  const [previewTemplate, setPreviewTemplate] =
    useState<BCFormTemplateType | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [localForms, setLocalForms] = useState<BCThanhPhanFormType[]>([]);  
  

  const handlePreview = async (record: BCFormTemplateType) => {
    const idToUse = record.id || record.itemId;
    if (!idToUse) {
      message.error("Không tìm thấy ID biểu mẫu.");
      return;
    }

    setLoadingPreview(true);
    try {
      // Fetch full template to get thanhPhanForms
      const res = await bcFormTemplateService.get(idToUse);
      if (res?.data) {
        setPreviewTemplate(res.data);
      } else {
        message.error("Không thể tải thông tin biểu mẫu");
      }
    } catch (error) {
      console.error("Lỗi tải template preview:", error);
      message.error("Đã xảy ra lỗi khi tải cấu hình biểu mẫu");
    } finally {
      setLoadingPreview(false);
    }
  };

  const columns = [
    {
      title: "Tên biểu mẫu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Đối tượng áp dụng",
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
    // {
    //   title: "Thao tác",
    //   key: "action",
    //   render: (_: any, record: BCFormTemplateType) => (
    //     <Space size="middle">
    //       <Button
    //         icon={<SettingOutlined />}
    //         onClick={() => {
    //           const idToUse = record.id || record.itemId;
    //           if (record.idBaoCao && idToUse) {
    //             router.push(
    //               `/cauHinhBieuMau/${record.idBaoCao}/template/${idToUse}`,
    //             );
    //           } else {
    //             message.warning(
    //               "Thiếu ID báo cáo hoặc template để chuyển hướng.",
    //             );
    //           }
    //         }}
    //       >
    //         Cấu hình
    //       </Button>
    //       <Button
    //         type="primary"
    //         icon={<EyeOutlined />}
    //         onClick={() => {
    //           fetchTemplate(record.id || record.itemId || "");
    //           setPreviewModalVisible(true);
    //         }}
    //         loading={loadingPreview}
    //       >
    //         Preview mẫu
    //       </Button>
    //     </Space>
    //   ),
    // },
  ];

    const fetchTemplate = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await bcFormTemplateService.get(id);
      if (res?.data) {
        setLocalForms(
          (res.data.thanhPhanForms || []).map((f) => ({
            ...f,
            inputs: f.inputs || [],
          }))
        );
      }
    } catch (error) {
      console.error("Lỗi tải template:", error);
      message.error("Không thể tải thông tin template");
    } finally {
    }
  }, []);
  

  return (
    <div className="mt-4">
      <Title level={5}>Biểu mẫu áp dụng</Title>
      <Table
        columns={columns}
        dataSource={templates || []}
        rowKey={(record) =>
          (record.id || record.itemId || Math.random()).toString()
        }
        pagination={false}
        locale={{
          emptyText: <Empty description="Không có biểu mẫu báo cáo" />,
        }}
        bordered
      />
       <Modal
        title="Xem thử form (Giao diện người dùng cuối)"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            console.log("Form values:", values);
            message.success("Lưu thành công! (Dữ liệu đã được log ra console)");
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%", marginTop: 16 }}>
            {localForms.map((formPart) => (
              <Card
                key={"preview-" + formPart.idThanhPhan}
                title={<Text strong>{formPart.name || undefined}</Text>}
                size="small"
                headStyle={{ backgroundColor: "#fafafa" }}
              >
                <HtmlFormRenderer
                  htmlContent={formPart.htmlContent || ""}
                  inputs={formPart.inputs || []}
                />
              </Card>
            ))}
            <Flex justify="flex-end">
              <Button onClick={() => setPreviewModalVisible(false)} style={{ marginRight: 8 }}>
                Đóng
              </Button>
              <Button type="primary" htmlType="submit">
                Hoàn thành / Lưu dữ liệu
              </Button>
            </Flex>
          </Space>
        </Form>
      </Modal>

      <Modal
        title={`Preview: ${previewTemplate?.name}`}
        open={!!previewTemplate}
        onCancel={() => setPreviewTemplate(null)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
        destroyOnClose
      >
        {previewTemplate?.thanhPhanForms?.map((thanhPhan, index) => {
          const componentType = (thanhPhan as any).componentType;
          return (
            <div key={index} style={{ marginBottom: 24 }}>
              {thanhPhan.name && <Title level={5}>{thanhPhan.name}</Title>}
              {!componentType || componentType === "FLAT" ? (
                <HtmlTemplatePreview
                  htmlContent={thanhPhan.htmlContent || ""}
                  inputs={thanhPhan.inputs || []}
                />
              ) : (
                <div
                  style={{
                    padding: 16,
                    border: "1px dashed #d9d9d9",
                    textAlign: "center",
                  }}
                >
                  Thành phần GRID: {thanhPhan.name}
                </div>
              )}
            </div>
          );
        })}
        {(!previewTemplate?.thanhPhanForms ||
          previewTemplate.thanhPhanForms.length === 0) && (
          <Empty description="Biểu mẫu này chưa có cấu hình nội dung HTML" />
        )}
      </Modal>
    </div>
  );
};

export default FormTemplatesTab;
