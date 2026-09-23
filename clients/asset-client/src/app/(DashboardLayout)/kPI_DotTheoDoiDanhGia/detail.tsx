import React from "react";
import { Drawer, Descriptions, Tag } from "antd";
import { KPI_DotTheoDoiDanhGiaType } from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";
import * as extensions from "@/utils/extensions";
import { CheckCircleOutlined, StopOutlined } from "@ant-design/icons";

interface Props {
  item?: KPI_DotTheoDoiDanhGiaType | null;
  onClose: () => void;
}

const KPI_DotTheoDoiDanhGiaDetail: React.FC<Props> = ({ item, onClose }) => {
  if (!item) return null;

  const renderStatus = (status?: string) => {
    if (status === "ACTIVE" || status === "Đang hoạt động") {
      return (
        <Tag color="success" style={{ borderRadius: "12px", padding: "2px 10px" }} icon={<CheckCircleOutlined />}>
          Đang hoạt động
        </Tag>
      );
    }
    if (status === "CLOSED" || status === "Đã đóng/Kết thúc") {
      return (
        <Tag color="default" style={{ borderRadius: "12px", padding: "2px 10px" }} icon={<StopOutlined />}>
          Đã đóng/Kết thúc
        </Tag>
      );
    }
    return <Tag color="default" style={{ borderRadius: "12px", padding: "2px 10px" }}>{status || "Chưa xác định"}</Tag>;
  };

  return (
    <Drawer
      title="Chi tiết đợt theo dõi đánh giá"
      width={640}
      placement="right"
      onClose={onClose}
      open={true}
    >
      <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 600, width: 220 }}>
        <Descriptions.Item label="Tên đợt theo dõi đánh giá">
          <span style={{ fontWeight: 500, color: "#0355a2" }}>{item.tenDotTheoDoiDanhGia}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Tháng">{item.thang}</Descriptions.Item>
        <Descriptions.Item label="Quý">{item.quy}</Descriptions.Item>
        <Descriptions.Item label="Năm">{item.nam}</Descriptions.Item>
        <Descriptions.Item label="Thời gian bắt đầu">
          {extensions.toDateString(item.thoiGianBatDau)}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian kết thúc">
          {extensions.toDateString(item.thoiGianKetThuc)}
        </Descriptions.Item>
        <Descriptions.Item label="Mặc định tiêu chí chung">
          <span style={{ fontWeight: 500, color: "#1890ff" }}>{item.defaultTieuChiChungName || "-"}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Mặc định tiêu chí đơn vị">
          <span style={{ fontWeight: 500, color: "#52c41a" }}>{item.defaultTieuChiDonViName || "-"}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Loại đợt">
          {item.type === "CaNhan" ? (
            <Tag color="blue">Cá nhân</Tag>
          ) : item.type === "TapThe" ? (
            <Tag color="purple">Tập thể</Tag>
          ) : (
            item.type || "-"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {renderStatus(item.trangThai)}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default KPI_DotTheoDoiDanhGiaDetail;
