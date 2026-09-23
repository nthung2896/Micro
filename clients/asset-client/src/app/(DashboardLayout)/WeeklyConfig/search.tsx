"use client";
import { Form, Select, Button, Row, Col, FormInstance, Card } from "antd";

const { Option } = Select;

interface Props {
  onFinish: (values: any) => void;
  form: FormInstance;
}

export default function SearchForm({ onFinish, form }: Props) {
  return (
    <Card variant="outlined">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="dayOfWeek" label="Thứ">
              <Select placeholder="Chọn thứ" allowClear>
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
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="isWorking" label="Ngày làm việc">
              <Select placeholder="Chọn" allowClear>
                <Option value={true}>Có</Option>
                <Option value={false}>Không</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Button color="cyan" variant="solid" htmlType="submit">
            Tìm kiếm
          </Button>
        </Row>
      </Form>
    </Card>
  );
}
