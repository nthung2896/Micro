import React from "react";
import { Drawer, Divider, Descriptions, Badge, Image } from "antd";
import { PhanAnhNenTangType } from "@/types/phan-anh-nen-tang/dto";
import dayjs from "dayjs";

interface Props {
  item?: PhanAnhNenTangType | null;
  anhCCCDUrl?: string;
  onClose: () => void;
}

const PhanAnhNenTangDetail: React.FC<Props> = ({ item, anhCCCDUrl, onClose }) => {
  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 0:
        return <Badge status="default" text="Mới tiếp nhận" />;
      case 1:
        return <Badge status="processing" text="Đang xử lý" />;
      case 2:
        return <Badge status="success" text="Đã xử lý" />;
      case 3:
        return <Badge status="error" text="Từ chối" />;
      default:
        return <Badge status="default" text="Không xác định" />;
    }
  };

  return (
    <Drawer
      title="Chi tiết phản ánh nền tảng"
      width={700}
      placement="right"
      onClose={onClose}
      closable={true}
      open={true}
    >
      <Descriptions title="Thông tin người phản ánh" bordered column={2}>
        <Descriptions.Item label="Họ và tên" span={2}>
          <strong>{item?.hoTen}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{item?.soDienThoai}</Descriptions.Item>
        <Descriptions.Item label="Email">{item?.email}</Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {item?.ngaySinh ? dayjs(item.ngaySinh).format("DD/MM/YYYY") : ""}
        </Descriptions.Item>
        <Descriptions.Item label="Số CCCD">{item?.soCCCD}</Descriptions.Item>
        <Descriptions.Item label="Ngày cấp">
          {item?.ngayCap ? dayjs(item.ngayCap).format("DD/MM/YYYY") : ""}
        </Descriptions.Item>
        <Descriptions.Item label="Nơi cấp">{item?.noiCap}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ thường trú" span={2}>
          {item?.diaChiThuongTru}
        </Descriptions.Item>
        {anhCCCDUrl && (
          <Descriptions.Item label="Ảnh CCCD" span={2}>
            <Image
              src={anhCCCDUrl}
              alt="Ảnh CCCD"
              style={{ maxHeight: 200, objectFit: "contain" }}
            />
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider dashed />

      <Descriptions title="Nội dung phản ánh" bordered column={2}>
        <Descriptions.Item label="Trạng thái" span={2}>
          {getStatusBadge(item?.trangThai)}
        </Descriptions.Item>
        <Descriptions.Item label="Tên nền tảng" span={2}>
          {item?.tenNenTang}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ nền tảng" span={2}>
          {item?.diaChiNenTang}
        </Descriptions.Item>
        <Descriptions.Item label="Tên ứng dụng">{item?.tenUngDung}</Descriptions.Item>
        <Descriptions.Item label="Liên kết tải">{item?.lienKetTaiUngDung}</Descriptions.Item>
        <Descriptions.Item label="Loại phản ánh">{item?.tenLoaiPhanAnh}</Descriptions.Item>
        <Descriptions.Item label="Tỉnh/Thành phố">{item?.tenTinh}</Descriptions.Item>
        <Descriptions.Item label="Nội dung phản ánh" span={2}>
          <div style={{ whiteSpace: "pre-wrap" }}>{item?.noiDungPhanAnh}</div>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày gửi" span={2}>
          {item?.createdDate ? dayjs(item.createdDate).format("DD/MM/YYYY HH:mm") : ""}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default PhanAnhNenTangDetail;
