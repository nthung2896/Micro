import React from "react";
import { Modal, Descriptions, Typography, Tag, Space, Divider } from "antd";
import { InfoCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { KPI_NhomTieuChiType } from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";

const { Title, Text } = Typography;

interface Props {
  item?: KPI_NhomTieuChiType | null;
  onClose: () => void;
}

const KPI_NhomTieuChiDetail: React.FC<Props> = ({ item, onClose }) => {
  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết nhóm tiêu chí</span>
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
            <Title level={4} style={{ color: "#002766", margin: 0 }}>
              {item.tenNhomTieuChi || "Chưa có tên"}
            </Title>
            {item.phanNhom && (
              <Tag color="blue" style={{ marginTop: 8 }}>
                Phân nhóm: {item.phanNhom}
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
            <Descriptions.Item label="Công việc chi tiết">
              {item.congViecChiTiet || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>
            
            <Descriptions.Item label="Sản phẩm đầu ra">
              {item.sanPhamDauRa || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Khung điểm tối đa">
              {item.khungDiemToiDa != null ? (
                <Tag color="volcano">{item.khungDiemToiDa}</Tag>
              ) : (
                <Text type="secondary">N/A</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Điểm">
              {item.diem != null ? (
                <Tag color="green">{item.diem}</Tag>
              ) : (
                <Text type="secondary">N/A</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Hệ số quy đổi">
              {item.heSoQuyDoi != null ? (
                <Text strong>{item.heSoQuyDoi}</Text>
              ) : (
                <Text type="secondary">N/A</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Ghi chú">
              {item.ghiChu ? (
                <Space align="start">
                  <FileTextOutlined style={{ color: "#8c8c8c", marginTop: 4 }} />
                  <Text>{item.ghiChu}</Text>
                </Space>
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

export default KPI_NhomTieuChiDetail;
