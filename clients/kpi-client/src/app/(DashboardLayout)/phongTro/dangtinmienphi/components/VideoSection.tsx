import React from "react";
import { Form, Input } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { DangTinFormValues } from "../types";

export const VideoSection: React.FC = () => {
  return (
    <Form.Item<DangTinFormValues>
      label="Đường dẫn Video (Youtube hoặc TikTok)"
      name="videoLink"
      tooltip="Nhập link xem video review phòng để người thuê dễ hình dung"
    >
      <Input
        size="large"
        prefix={<LinkOutlined className="text-gray-400" />}
        placeholder="VD: https://www.youtube.com/watch?v=..."
      />
    </Form.Item>
  );
};
