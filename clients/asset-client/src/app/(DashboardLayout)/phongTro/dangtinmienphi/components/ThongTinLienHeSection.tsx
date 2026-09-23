import React from "react";
import { Form, Row, Col, Input } from "antd";
import { DangTinFormValues } from "../types";

export const ThongTinLienHeSection: React.FC = () => {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={8}>
        <Form.Item<DangTinFormValues>
          label="Họ và tên người liên hệ"
          name="tenLienHe"
          rules={[{ required: true, message: "Vui lòng nhập tên người liên hệ!" }]}
        >
          <Input size="large" placeholder="VD: Anh Hùng (Chủ nhà)" />
        </Form.Item>
      </Col>

      <Col xs={24} sm={8}>
        <Form.Item<DangTinFormValues>
          label="Số điện thoại liên hệ"
          name="soDienThoaiLienHe"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input size="large" placeholder="VD: 0869590916" />
        </Form.Item>
      </Col>

      <Col xs={24} sm={8}>
        <Form.Item<DangTinFormValues>
          label="Số Zalo"
          name="zaloLienHe"
        >
          <Input size="large" placeholder="VD: 0869590916" />
        </Form.Item>
      </Col>
    </Row>
  );
};
