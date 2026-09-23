import React from "react";
import { Card, Tag, Row, Col, Typography, Divider, Space } from "antd";
import {
  InfoCircleOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  ContainerOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface InformationTabProps {
  data: any;
}

const InformationTab: React.FC<InformationTabProps> = ({ data }) => {
  if (!data) return <Card loading={true} />;

  return (
    <Card bordered={false} className="mb-4" bodyStyle={{ padding: 0 }}>
      {/* Header Section */}
      <div
        style={{
          padding: "24px",
          background: "linear-gradient(90deg, #fafafa 0%, #ffffff 100%)",
          borderBottom: "1px solid #f0f0f0",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ContainerOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            </div>
          </Col>
          <Col flex="auto">
            <Space size={4} direction="vertical">
              <Tag color="processing">Đợt báo cáo định kỳ</Tag>
              <Title level={4} style={{ margin: 0 }}>
                {data.name}
              </Title>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Content Section */}
      <div style={{ padding: "24px" }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={5} style={{ marginBottom: 16 }}>
              <FileTextOutlined /> Cấu hình báo cáo
            </Title>
            <Row gutter={[0, 12]}>
              <Col span={24}>
                <Text type="secondary" style={{ display: "block" }}>
                  Biểu mẫu áp dụng:
                </Text>
                <Text strong>{data.bieuMauBaoCao || "Chưa xác định"}</Text>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                  Gửi email nhắc nhở:
                </Text>
                {data.isGuiMail ? (
                  <Tag color="cyan" icon={<CheckCircleOutlined />}>
                    Đang bật
                  </Tag>
                ) : (
                  <Tag color="default" icon={<CloseCircleOutlined />}>
                    Đang tắt
                  </Tag>
                )}
              </Col>
            </Row>
          </Col>

          <Col xs={24} md={12}>
            <Title level={5} style={{ marginBottom: 16 }}>
              <TeamOutlined /> Hội đồng duyệt báo cáo
            </Title>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.nameNguoiDuyetBaoCaos && data.nameNguoiDuyetBaoCaos.length > 0 ? (
                data.nameNguoiDuyetBaoCaos.map((name: string, idx: number) => (
                  <Tag color="blue" key={idx} style={{ margin: 0 }}>
                    {name}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">Chưa cấu hình người duyệt</Text>
              )}
            </div>
          </Col>

          {data.description && (
            <Col span={24}>
              <Divider style={{ margin: "8px 0 24px" }} />
              <Title level={5} style={{ marginBottom: 16 }}>
                <InfoCircleOutlined /> Mô tả chi tiết
              </Title>
              <Card
                size="small"
                bodyStyle={{ background: "#fafafa", borderRadius: 4 }}
                bordered={false}
              >
                <div
                  style={{ lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: data.description }}
                />
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </Card>
  );
};

export default InformationTab;
