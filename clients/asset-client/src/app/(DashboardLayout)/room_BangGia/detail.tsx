import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Tag } from "antd";
import { Room_BangGiaType } from "@/types/room_BangGia/room_BangGia";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";

interface Props {
  item?: Room_BangGiaType | null;
  onClose: () => void;
  loaiTinOptions?: { value: string; label: string }[];
  thuocTinhOptions?: { value: string; label: string }[];
}

const Room_BangGiaDetail: React.FC<Props> = ({
  item,
  onClose,
  loaiTinOptions: propLoaiTinOptions,
  thuocTinhOptions: propThuocTinhOptions,
}) => {
  const [loaiTinOptions, setLoaiTinOptions] = useState<{ value: string; label: string }[]>(
    propLoaiTinOptions || []
  );
  const [thuocTinhOptions, setThuocTinhOptions] = useState<{ value: string; label: string }[]>(
    propThuocTinhOptions || []
  );

  useEffect(() => {
    if (propLoaiTinOptions && propLoaiTinOptions.length > 0) {
      setLoaiTinOptions(propLoaiTinOptions);
    }
  }, [propLoaiTinOptions]);

  useEffect(() => {
    if (propThuocTinhOptions && propThuocTinhOptions.length > 0) {
      setThuocTinhOptions(propThuocTinhOptions);
    }
  }, [propThuocTinhOptions]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      if (loaiTinOptions.length > 0 && thuocTinhOptions.length > 0) return;
      try {
        const [loaiTinRes, thuocTinhRes] = await Promise.all([
          duLieuDanhMucService.getDropdownCode("LOAITIN"),
          duLieuDanhMucService.getDropdownCode("THUOCTINHBANGGIATIN"),
        ]);
        if (loaiTinRes?.status && Array.isArray(loaiTinRes.data)) {
          setLoaiTinOptions(loaiTinRes.data);
        }
        if (thuocTinhRes?.status && Array.isArray(thuocTinhRes.data)) {
          setThuocTinhOptions(thuocTinhRes.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục chi tiết:", error);
      }
    };
    fetchDropdowns();
  }, []);

  const loaiTinDisplay =
    loaiTinOptions.find((o) => o.value === item?.loaiTin || o.label === item?.loaiTin)
      ?.label || item?.loaiTin || "--";

  const thuocTinhDisplay =
    thuocTinhOptions.find(
      (o) => o.value === item?.thuocTinh || o.label === item?.thuocTinh
    )?.label || item?.thuocTinh || "--";

  return (
    <Drawer
      title="Chi tiết bảng giá dịch vụ"
      width={500}
      placement="right"
      onClose={onClose}
      closable={true}
      open={true}
    >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Loại tin">
          <span style={{ fontWeight: 600, color: item?.maMau || "inherit" }}>
            {loaiTinDisplay}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Giá tin">
          <span style={{ fontWeight: 600, color: "#1677ff" }}>
            {item?.giaTin != null
              ? `${item.giaTin.toLocaleString("vi-VN")} đ/ngày`
              : "--"}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Mã màu">
          {item?.maMau ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: item.maMau,
                  border: "1px solid #d9d9d9",
                  display: "inline-block",
                }}
              />
              <code>{item.maMau}</code>
            </div>
          ) : (
            "--"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Thuộc tính">
          {thuocTinhDisplay}
        </Descriptions.Item>
        <Descriptions.Item label="Tự động duyệt">
          {item?.isTuDongDuyet ? (
            <Tag color="success">Bật</Tag>
          ) : (
            <Tag color="default">Tắt</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Duy trì thêm 10 ngày">
          {item?.isDuyTriThem10Ngay ? (
            <Tag color="success">Bật</Tag>
          ) : (
            <Tag color="default">Tắt</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Hiển thị nút gọi">
          {item?.isHienThiNutGoi ? (
            <Tag color="success">Bật</Tag>
          ) : (
            <Tag color="default">Tắt</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default Room_BangGiaDetail;
