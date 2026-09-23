import React from 'react';
import { Descriptions, Tag } from 'antd';
import { ApartmentOutlined, BankOutlined } from '@ant-design/icons';
import { KPI_DotTheoDoiDanhGiaType } from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";

interface Props {
  dot?: KPI_DotTheoDoiDanhGiaType;
  donVi?: string;
  phongBan?: string;
  onViewTieuChiDonVi?: (id?: string) => void;
  onViewTieuChiChung?: (id?: string) => void;
}

const DotDetailInfo: React.FC<Props> = ({ dot, donVi, phongBan, onViewTieuChiDonVi, onViewTieuChiChung }) => {
  if (!dot) return null;

  return (
    <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
       <Descriptions title={<span style={{ color: '#0355a2', fontSize: 16 }}>Thông tin chi tiết Đợt đánh giá</span>} size="small" column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
         <Descriptions.Item label={<span><BankOutlined style={{ color: '#1890ff', marginRight: 6 }} />Đơn vị</span>}>
           {donVi || "---"}
         </Descriptions.Item>
         <Descriptions.Item label={<span><ApartmentOutlined style={{ color: '#52c41a', marginRight: 6 }} />Phòng ban</span>} span={2}>
           {phongBan || "---"}
         </Descriptions.Item>
         <Descriptions.Item label="Thời gian bắt đầu">
           {dot.thoiGianBatDau ? new Date(dot.thoiGianBatDau).toLocaleDateString("vi-VN") : "---"}
         </Descriptions.Item>
         <Descriptions.Item label="Thời gian kết thúc">
           {dot.thoiGianKetThuc ? new Date(dot.thoiGianKetThuc).toLocaleDateString("vi-VN") : "---"}
         </Descriptions.Item>
         <Descriptions.Item label="Trạng thái">
            {(dot.trangThai === "ACTIVE" || dot.trangThai === "Đang hoạt động") ? <Tag color="success">Đang hoạt động</Tag> : <Tag color="default">Đã đóng</Tag>}
         </Descriptions.Item>
         <Descriptions.Item label="Bộ tiêu chí chung" span={3}>
           <span 
             style={{ color: '#0355a2', cursor: 'pointer', textDecoration: 'underline' }}
             onClick={() => onViewTieuChiChung && onViewTieuChiChung(dot.defaultTieuChiChung)}
           >
             {dot.defaultTieuChiChungName || "---"}
           </span>
         </Descriptions.Item>
         <Descriptions.Item label="Bộ tiêu chí nhiệm vụ" span={3}>
           <span 
             style={{ color: '#0355a2', cursor: 'pointer', textDecoration: 'underline' }}
             onClick={() => onViewTieuChiDonVi && onViewTieuChiDonVi(dot.defaultTieuChiDonVi)}
           >
             {dot.defaultTieuChiDonViName || "---"}
           </span>
         </Descriptions.Item>
       </Descriptions>
    </div>
  );
};

export default DotDetailInfo;
