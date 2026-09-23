import React from "react";
import { Modal, Descriptions, Typography, Tag, Space, Divider } from "antd";
import { InfoCircleOutlined, UserOutlined } from "@ant-design/icons";
import { KPI_LyLich2CType } from "@/types/kPI_LyLich2C/kPI_LyLich2C";
import * as extensions from "@/utils/extensions";

const { Title, Text } = Typography;

interface Props {
  item?: KPI_LyLich2CType | null;
  onClose: () => void;
}

const KPI_LyLich2CDetail: React.FC<Props> = ({ item, onClose }) => {
  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết lý lịch</span>
        </Space>
      }
      width={900}
      onCancel={onClose}
      footer={null}
      closable={true}
      open={true}
      styles={{
        header: { background: "#f0f2f5", borderBottom: "1px solid #e8e8e8", padding: "12px 16px", margin: 0, borderRadius: "8px 8px 0 0" },
        body: { padding: "12px 16px" }
      }}
    >
      {item ? (
        <>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32, color: '#1890ff', border: '1px solid #1890ff', borderRadius: '50%', padding: '8px', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserOutlined />
            </div>
            <div>
              <Title level={4} style={{ color: "#002766", margin: 0 }}>
                {item.hoTen || "Chưa có tên"}
              </Title>
              {item.userName && (
                <Tag color="blue" style={{ marginTop: 8 }}>
                  Tài khoản: {item.userName}
                </Tag>
              )}
            </div>
          </div>

          <Divider dashed />

          <Descriptions
            bordered
            column={2}
            labelStyle={{ fontWeight: "bold", width: "20%", background: "#3c7db9ff", color: "#ffffff" }}
            size="middle"
          >
            <Descriptions.Item label="Mã cán bộ">
              {item.maCanBo || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {item.email || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Giới tính">
              {item.gioiTinh === 1 ? "Nam" : item.gioiTinh === 2 ? "Nữ" : <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày sinh">
              {extensions.toDateString(item.ngaysinh) || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Điện thoại">
              {item.phone || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Số CMND/CCCD">
              {item.soCMND || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Đơn vị sử dụng" span={2}>
              {item.donViSuDungName || (item.donViSuDungId && item.donViSuDungId !== "00000000-0000-0000-0000-000000000000" ? item.donViSuDungId : <Text type="secondary">N/A</Text>)}
            </Descriptions.Item>

            <Descriptions.Item label="Phòng ban" span={2}>
              {item.phongBanName || (item.phongBanId && item.phongBanId !== "00000000-0000-0000-0000-000000000000" ? item.phongBanId : <Text type="secondary">N/A</Text>)}
            </Descriptions.Item>

            <Descriptions.Item label="Chức vụ hiện tại">
              {item.chucVuHienTaiName || item.chucVuHienTai || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Trình độ tối đa">
              {item.trinhDoMaxName || item.trinhDoMax || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Lý luận chính trị">
              {item.lyLuanChinhTriName || item.lyLuanChinhTri || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Loại hợp đồng">
              {item.loaiHopDongName || item.loaiHopDong || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Ngày bổ nhiệm">
              {extensions.toDateString(item.ngayBoNhiem) || <Text type="secondary">N/A</Text>}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {item.status || <Text type="secondary">N/A</Text>}
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

export default KPI_LyLich2CDetail;
