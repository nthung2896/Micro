import React from "react";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import { ProcessingDeadlineConfigSearch } from "@/types/processingDeadlineConfig";

interface SearchProps {
  onFinish: (values: ProcessingDeadlineConfigSearch) => void;
}

const Search: React.FC<SearchProps> = ({ onFinish }) => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    const searchValues: ProcessingDeadlineConfigSearch = {
      keyword: values.keyword,
      code: values.code,
      type: values.type,
      isCheckHoliday: values.isCheckHoliday !== undefined ? values.isCheckHoliday : undefined,
      isNenTang: values.isNenTang !== undefined ? values.isNenTang : undefined,
    };
    onFinish(searchValues);
  };

  const handleReset = () => {
    form.resetFields();
    onFinish({});
  };

  return (
    <Card className="customCardShadow mb-3" style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <Form
        form={form}
        layout="vertical"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Row gutter={[24, 0]}>
          <Col xl={8} lg={8} md={12} xs={24}>
            <Form.Item label="Từ khóa" name="keyword">
              <Input placeholder="Tên, mã hoặc loại..." allowClear style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>

          <Col xl={8} lg={8} md={12} xs={24}>
            <Form.Item label="Mã module" name="code">
              <Input placeholder="Nhập mã module..." allowClear style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>

          <Col xl={8} lg={8} md={12} xs={24}>
            <Form.Item label="Loại hình" name="type">
              <Input placeholder="Nhập loại hình..." allowClear style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>

          <Col xl={8} lg={8} md={12} xs={24}>
            <Form.Item label="Bỏ qua ngày lễ" name="isCheckHoliday">
              <Select
                placeholder="Tất cả"
                allowClear
                options={[
                  { value: true, label: "Có" },
                  { value: false, label: "Không" },
                ]}
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Col>

          <Col xl={8} lg={8} md={12} xs={24}>
            <Form.Item label="Cấu hình nền tảng" name="isNenTang">
              <Select
                placeholder="Tất cả"
                allowClear
                options={[
                  { value: true, label: "Có" },
                  { value: false, label: "Không" },
                ]}
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ display: "flex", gap: "12px", marginTop: 8, justifyContent: "center" }}>
          <Button
            color="cyan" variant="solid"
            htmlType="submit"
            icon={<SearchOutlined />}
            size="middle"

          >
            Tìm kiếm
          </Button>

          <Button
            icon={<ReloadOutlined />}
            size="middle"
            onClick={handleReset}
            style={{ borderRadius: 8, fontWeight: 600, padding: "0 24px", height: 38 }}
          >
            Làm mới
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default Search;
