import React from "react";
import { Modal, Descriptions, Typography, Tag, Space, Divider } from "antd";
import { InfoCircleOutlined, NumberOutlined } from "@ant-design/icons";
import { KPI_TieuChiChungType } from "@/types/kPI_TieuChiChung/kPI_TieuChiChung";

const { Title, Text } = Typography;

interface Props {
  item?: KPI_TieuChiChungType | null;
  onClose: () => void;
}

const KPI_TieuChiChungDetail: React.FC<Props> = ({ item, onClose }) => {
  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết Tiêu chí chung</span>
        </Space>
      }
      width={700}
      onCancel={onClose}
      footer={null}
      closable={true}
      open={true}
      styles={{
        header: { background: "#f0f2f5", borderBottom: "1px solid #e8e8e8", padding: "16px 24px", margin: 0, borderRadius: "8px 8px 0 0" },
        body: { padding: "24px" }
      }}
    >
      {item ? (
        <>
          <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ color: "#002766", margin: 0, lineHeight: 1.5 }}>
              {item.ten || "Chưa có tên tiêu chí"}
            </Title>
            {item.priority != null && (
              <Tag color="purple" style={{ marginTop: 8 }}>
                <NumberOutlined /> Mức độ ưu tiên / Sắp xếp: {item.priority}
              </Tag>
            )}
          </div>

          <Divider dashed />

          <Descriptions
            bordered
            column={1}
            labelStyle={{ fontWeight: "bold", width: "180px", background: "#fafafa" }}
            size="middle"
          >
            <Descriptions.Item label="Tiêu chí cha">
              {item.parentId ? (
                <Text>{item.tenParent || "-"}</Text>
              ) : (
                <Text type="secondary">Không có</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Điểm / Trọng số">
              {item.myProperty != null ? (
                <Tag color="volcano" style={{ fontSize: 14, padding: "2px 8px" }}>
                  {item.myProperty}
                </Tag>
              ) : (
                <Text type="secondary">N/A</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Mã bộ tiêu chí">
              {item.idBoTieuChiChung ? (
                <Text type="secondary">{item.idBoTieuChiChung}</Text>
              ) : (
                <Text type="secondary">N/A</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Tên bộ tiêu chí">
              {item.tenBoTieuChiChung ? (
                <Text>{item.tenBoTieuChiChung}</Text>
              ) : (
                <Text type="secondary">N/A</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">Không có dữ liệu</Text>
        </div>
      )}
    </Modal>
  );
};

export default KPI_TieuChiChungDetail;
