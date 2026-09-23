"use client";
import { Form, Input, InputNumber, Select, Button, Row, Col, FormInstance } from "antd";
import { HolidayConfigsType } from "@/types/holidayConfigs/dto";
import { DropdownOption } from "@/types/general";

const { Option } = Select;
const { TextArea } = Input;

interface Props {
  form: FormInstance;
  onFinish: (values: any) => void;
  initialValues: HolidayConfigsType | null;
  typeOptions: DropdownOption[];
}

export default function UpsertForm({ form, onFinish, initialValues, typeOptions }: Props) {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues || {}}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="day" label="Ngày" rules={[{ required: true, message: "Vui lòng nhập ngày" }]}>
            <InputNumber min={1} max={31} placeholder="Ngày" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="month" label="Tháng" rules={[{ required: true, message: "Vui lòng nhập tháng" }]}>
            <InputNumber min={1} max={12} placeholder="Tháng" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="year" label="Năm">
            <InputNumber min={2000} max={2100} placeholder="Năm" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="type" label="Loại" rules={[{ required: true, message: "Vui lòng chọn loại" }]}>
            <Select
              placeholder="Chọn loại"
              allowClear
              options={typeOptions}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="isAnnualYear" label="Hàng năm" rules={[{ required: true, message: "Vui lòng chọn" }]}>
            <Select placeholder="Chọn">
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}>
            <TextArea rows={3} placeholder="Nhập mô tả" />
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
