import React from "react";
import { Modal, Typography, Space, Divider, Tag } from "antd";
import {
  ApartmentOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { KPI_BoTieuChiDonViType } from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";
import * as extensions from "@/utils/extensions";
import { KPI_NhomTieuChiTreeView } from "../kPI_NhomTieuChi/KPI_NhomTieuChiTreeViewComponent";

const { Title, Text } = Typography;

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  last?: boolean;
  multiline?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  children,
  last = false,
  multiline = false,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "clamp(170px, 24%, 240px) minmax(0, 1fr)",
      minHeight: 62,
      borderBottom: last ? "none" : "1px solid #e5edf5",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: multiline ? "flex-start" : "center",
        gap: 10,
        padding: "12px 18px",
        background: "linear-gradient(135deg, #f4f9ff 0%, #eaf4ff 100%)",
        color: "#174a7c",
        fontWeight: 600,
        whiteSpace: "nowrap",
        borderRight: "1px solid #d9e7f5",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 30px",
          width: 30,
          height: 30,
          marginTop: multiline ? 1 : 0,
          borderRadius: 9,
          background: "#ffffff",
          color: "#1677ff",
          fontSize: 16,
          boxShadow: "0 2px 6px rgba(22, 119, 255, 0.12)",
        }}
      >
        {icon}
      </span>
      <span>{label}</span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: multiline ? "flex-start" : "center",
        minWidth: 0,
        padding: "13px 20px",
        color: "#334155",
        fontWeight: 500,
        lineHeight: 1.6,
        background: "#ffffff",
        wordBreak: "break-word",
      }}
    >
      {children}
    </div>
  </div>
);

interface Props {
  item?: KPI_BoTieuChiDonViType | null;
  onClose: () => void;
}

const KPI_BoTieuChiDonViDetail: React.FC<Props> = ({ item, onClose }) => {
  return (
    <Modal
      title={
        <Space style={{ color: "#ffffff", fontSize: "16px", fontWeight: "bold" }}>
          <InfoCircleOutlined />
          <span>CHI TIẾT BỘ TIÊU CHÍ ĐƠN VỊ</span>
        </Space>
      }
      closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
      width={"90vw"}
      style={{ top: 20 }}
      onCancel={onClose}
      footer={null}
      closable={true}
      open={true}
      styles={{
        header: { 
          background: "#1890ff", 
          padding: "16px 24px", 
          margin: 0, 
          borderRadius: "8px 8px 0 0",
          borderBottom: "none"
        },
        body: { padding: 0, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }
      }}
    >
      {item ? (
        <>
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
             <div style={{ fontSize: 32, color: '#1890ff', backgroundColor: '#e6f7ff', borderRadius: '50%', padding: '12px', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <BookOutlined />
             </div>
            <div>
              <Title level={4} style={{ color: "#002766", margin: 0 }}>
                {item.tenBoTieuChiDonVi || "Chưa có tên bộ tiêu chí"}
              </Title>
              {item.soQuyetDinh && (
                <Tag color="geekblue" style={{ marginTop: 8 }}>
                  Số QĐ: {item.soQuyetDinh}
                </Tag>
              )}
            </div>
          </div>
          
          <Divider dashed />

          <div
            style={{
              marginTop: 4,
              overflow: "hidden",
              border: "1px solid #d9e7f5",
              borderRadius: 14,
              background: "#ffffff",
              boxShadow: "0 6px 18px rgba(15, 61, 100, 0.07)",
            }}
          >
            <DetailRow icon={<ApartmentOutlined />} label="Đơn vị áp dụng">
              {item.tenDonVi || item.idDonVi || <Text type="secondary">N/A</Text>}
            </DetailRow>
            
            <DetailRow icon={<CalendarOutlined />} label="Đợt đánh giá">
              {item.tenDot || item.idDot || <Text type="secondary">N/A</Text>}
            </DetailRow>

            <DetailRow icon={<ClockCircleOutlined />} label="Ngày quyết định">
              {extensions.toDateString(item.ngayQuyetDinh) || <Text type="secondary">N/A</Text>}
            </DetailRow>

            <DetailRow icon={<FieldTimeOutlined />} label="Áp dụng từ ngày">
              {extensions.toDateString(item.apDungTuNgay) || <Text type="secondary">N/A</Text>}
            </DetailRow>

            <DetailRow
              icon={<FieldTimeOutlined />}
              label="Áp dụng tới ngày"
              last={!item.cauHinhDiemLanhDaoText}
            >
              {extensions.toDateString(item.apDungToiNgay) || <Text type="secondary">N/A</Text>}
            </DetailRow>

            {item.cauHinhDiemLanhDaoText && (
              <DetailRow icon={<SettingOutlined />} label="Cấu hình điểm" last multiline>
                <div dangerouslySetInnerHTML={{ __html: item.cauHinhDiemLanhDaoText }} style={{ whiteSpace: "pre-line", lineHeight: "1.6" }} />
              </DetailRow>
            )}
          </div>

          <div style={{ marginTop: 24, padding: "0 16px 16px 16px" }}>
            <Title level={5} style={{ color: "#002766", marginBottom: 16 }}>Danh sách Nhiệm vụ / Tiêu chí</Title>
            <KPI_NhomTieuChiTreeView isModal={true} idBoTieuChiDonVi={item.id} />
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">Không có dữ liệu</Text>
        </div>
      )}
    </Modal>
  );
};

export default KPI_BoTieuChiDonViDetail;
