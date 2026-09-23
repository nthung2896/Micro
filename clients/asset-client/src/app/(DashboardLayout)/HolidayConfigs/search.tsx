"use client";
import { Form, InputNumber, Select, Button, Row, Col, FormInstance, Card } from "antd";
import { DropdownOption } from "@/types/general";

interface Props {
  onFinish: (values: any) => void;
  form: FormInstance;
  typeOptions: DropdownOption[];
}

export default function SearchForm({ onFinish, form, typeOptions }: Props) {
  return (
    <Card variant="outlined" size="small" style={{ marginBottom: 16 }}>
  <Form form={form} layout="vertical" onFinish={onFinish}>
    <Row gutter={16}>
      <Col xs={24} sm={12} md={6}>
        <Form.Item name="month" label="Tháng">
          <InputNumber min={1} max={12} placeholder="Tháng" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Form.Item name="year" label="Năm">
          <InputNumber min={2000} max={2100} placeholder="Năm" style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Form.Item name="type" label="Loại">
          <Select
            placeholder="Chọn loại"
            allowClear
            options={typeOptions}
          />
        </Form.Item>
      </Col>
      
      <Col xs={24} sm={12} md={6}>
        <Form.Item name="isAnnualYear" label="Hàng năm">
          {/* Thay thế cặp thẻ Option thành prop options chuẩn Antd v5 */}
          <Select 
            placeholder="Chọn" 
            allowClear
            options={[
              { value: true, label: 'Có' },
              { value: false, label: 'Không' }
            ]}
          />
        </Form.Item>
      </Col>
    </Row>
    
    <Row justify="end">
      <Button color="cyan" variant="solid" htmlType="submit">Tìm kiếm</Button>
    </Row>
  </Form>
</Card>
  );
}
