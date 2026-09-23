"use client";
import { Form, Select, Button, Row, Col, FormInstance } from "antd";
import { WeeklyConfigType } from "@/types/weeklyConfig/dto";

const { Option } = Select;

interface Props {
  form: FormInstance;
  onFinish: (values: any) => void;
  initialValues: WeeklyConfigType | null;
}

export default function UpsertForm({ form, onFinish, initialValues }: Props) {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues || {}}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="dayOfWeek" label="Thứ" rules={[{ required: true, message: "Vui lòng chọn thứ" }]}>
            <Select placeholder="Chọn thứ">
              <Option value={1}>Thứ hai</Option>
              <Option value={2}>Thứ ba</Option>
              <Option value={3}>Thứ tư</Option>
              <Option value={4}>Thứ năm</Option>
              <Option value={5}>Thứ sáu</Option>
              <Option value={6}>Thứ bảy</Option>
              <Option value={0}>Chủ nhật</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="isWorking" label="Ngày làm việc" rules={[{ required: true, message: "Vui lòng chọn" }]}>
            <Select placeholder="Chọn">
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row justify="end" style={{ marginTop: 16 }}>
        <Button color="green" variant="solid" htmlType="submit">
          {initialValues ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Row>
    </Form>
  );
}
