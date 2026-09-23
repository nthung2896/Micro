import React from "react";
import { Modal, Descriptions, Image, Tag } from "antd";
import { AppConfigurationType } from "@/types/appConfiguration/appConfiguration";
import { buildFileUrl } from "@/utils/file";

interface Props {
  item?: AppConfigurationType | null;
  onClose: () => void;
}

const AppConfigurationDetail: React.FC<Props> = ({ item, onClose }) => {
  return (
    <Modal
      title="Chi tiết cấu hình ứng dụng"
      width={700}
      onCancel={onClose}
      closable={true}
      open={true}
      footer={null}
    >
      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: 180, background: "#fafafa" }}
      >
        <Descriptions.Item label="Trạng thái">
          {item?.isActive ? (
            <Tag color="success">Đang áp dụng</Tag>
          ) : (
            <Tag color="default">Chưa áp dụng</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Tên ứng dụng">
          {item?.tenApp || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Tên doanh nghiệp / Đơn vị">
          {item?.tenDoanhNghiep || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Địa chỉ">
          {item?.diaChi || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Số điện thoại">
          {item?.soDienThoai || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Email">
          {item?.email || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Màu chủ đạo">
          {item?.primaryColor ? (() => {
            const raw = item.primaryColor.trim();
            const validColor = raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl")
              ? raw
              : /^[0-9A-Fa-f]{3,8}$/.test(raw)
              ? `#${raw}`
              : raw;
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    backgroundColor: validColor,
                    border: "1px solid rgba(0,0,0,0.2)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                />
                <span style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 13, color: "#374151" }}>
                  {validColor}
                </span>
              </div>
            );
          })() : (
            "-"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Logo">
          {item?.logoLink ? (
            <div>
              <Image
                src={buildFileUrl(item.logoLink)}
                alt="Logo"
                width={80}
                height={80}
                style={{ objectFit: "contain", border: "1px solid #f0f0f0", borderRadius: 4, padding: 4 }}
                fallback="/img/no-image.png"
              />
              <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280", wordBreak: "break-all" }}>
                {item.logoLink}
              </div>
            </div>
          ) : (
            "-"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Ảnh nền đăng nhập">
          {item?.loginBackgroundLink ? (
            <div>
              <Image
                src={buildFileUrl(item.loginBackgroundLink)}
                alt="Background"
                width={160}
                height={90}
                style={{ objectFit: "cover", border: "1px solid #f0f0f0", borderRadius: 4 }}
                fallback="/img/no-image.png"
              />
              <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280", wordBreak: "break-all" }}>
                {item.loginBackgroundLink}
              </div>
            </div>
          ) : (
            "-"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Ảnh modal đăng nhập">
          {item?.loginModalImage ? (
            <div>
              <Image
                src={buildFileUrl(item.loginModalImage)}
                alt="Modal Image"
                width={160}
                height={90}
                style={{ objectFit: "cover", border: "1px solid #f0f0f0", borderRadius: 4 }}
                fallback="/img/no-image.png"
              />
              <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280", wordBreak: "break-all" }}>
                {item.loginModalImage}
              </div>
            </div>
          ) : (
            "-"
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default AppConfigurationDetail;
