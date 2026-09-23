"use client";
import { Card, Form, Input, Select, Button, Row, Col, Space } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { EmailConfigsSearch } from "@/types/emailConfigs";

interface Props {
  handleSearch: (values: EmailConfigsSearch) => void;
}

const Search: React.FC<Props> = ({ handleSearch }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const search: EmailConfigsSearch = {
      from: values.from?.trim() || undefined,
      host: values.host?.trim() || undefined,
      userName: values.userName?.trim() || undefined,
      enableSsl: values.enableSsl === "" ? undefined : values.enableSsl === "true",
      allowSendMail: values.allowSendMail === "" ? undefined : values.allowSendMail === "true",
      pageIndex: 1,
      pageSize: 20,
    };
    handleSearch(search);
  };

  const onReset = () => {
    form.resetFields();
    handleSearch({ pageIndex: 1, pageSize: 20 });
  };

  return (
    <Card bodyStyle={{ padding: 16 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Email gửi" name="from">
              <Input placeholder="Nhập email gửi..." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Máy chủ SMTP" name="host">
              <Input placeholder="smtp.gmail.com..." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Tài khoản SMTP" name="userName">
              <Input placeholder="Nhập username..." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Bật SSL" name="enableSsl" initialValue="">
              <Select>
                <Select.Option value="">Tất cả</Select.Option>
                <Select.Option value="true">Bật</Select.Option>
                <Select.Option value="false">Tắt</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Cho phép gửi" name="allowSendMail" initialValue="">
              <Select>
                <Select.Option value="">Tất cả</Select.Option>
                <Select.Option value="true">Cho phép</Select.Option>
                <Select.Option value="false">Không</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} style={{ display: "flex", alignItems: "end" }}>
            <Form.Item>
              <Space>
                <Button color="cyan" variant="solid" htmlType="submit" icon={<SearchOutlined />}>
                  Tìm kiếm
                </Button>
                <Button onClick={onReset} icon={<ReloadOutlined />}>
                  Xóa lọc
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default Search;
