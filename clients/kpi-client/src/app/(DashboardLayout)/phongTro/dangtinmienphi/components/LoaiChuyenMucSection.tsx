import React from "react";
import { Form, Row, Col, Select, Input } from "antd";
import { DangTinFormValues } from "../types";

export const LoaiChuyenMucSection: React.FC = () => {
  return (
    <Row gutter={16}>
      <Col xs={24} sm={16}>
        <Form.Item<DangTinFormValues>
          label="Loại chuyên mục"
          name="loaiPhong"
          rules={[{ required: true, message: "Vui lòng chọn loại chuyên mục!" }]}
        >
          <Select
            placeholder="-- Chọn loại chuyên mục --"
            size="large"
            options={[
              { label: "Cho thuê phòng trọ, nhà trọ", value: "Cho thuê phòng trọ" },
              { label: "Cho thuê căn hộ mini (chung cư mini)", value: "Chung cư mini" },
              { label: "Cho thuê căn hộ dịch vụ", value: "Căn hộ dịch vụ" },
              { label: "Cho thuê nhà nguyên căn", value: "Nhà nguyên căn" },
              { label: "Cho thuê căn hộ chung cư", value: "Căn hộ chung cư" },
              { label: "Cho thuê mặt bằng kinh doanh", value: "Mặt bằng kinh doanh" },
              { label: "Tìm người ở ghép / Ký túc xá", value: "Ở ghép / Ký túc xá" },
            ]}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={8}>
        <Form.Item<DangTinFormValues>
          label="Mã phòng / Tên phòng (nếu có)"
          name="maPhong"
        >
          <Input size="large" placeholder="VD: P.302 hoặc Phòng Studio" />
        </Form.Item>
      </Col>
    </Row>
  );
};
