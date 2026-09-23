"use client";
import { Card, Form, Input, Select, Button, Row, Col, Space } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { TinTucSearch } from "@/types/tinTuc";
import { DANH_MUC_TIN_TUC } from "@/constants/DanhMucTinTucConstant";

interface Props {
  handleSearch: (values: TinTucSearch) => void;
}

const Search: React.FC<Props> = ({ handleSearch }) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const search: TinTucSearch = {
      keyword: values.keyword?.trim() || undefined,
      tenDanhMuc: values.tenDanhMuc === "" ? undefined : values.tenDanhMuc,
      trangThai: values.trangThai === "" ? undefined : Number(values.trangThai),
      isNoiBat: values.isNoiBat === "" ? undefined : values.isNoiBat === "true",
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
            <Form.Item label="Từ khóa" name="keyword">
              <Input placeholder="Tìm theo tiêu đề, mô tả, tags..." />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Danh mục" name="tenDanhMuc" initialValue="">
              <Select allowClear placeholder="Tất cả">
                <Select.Option value="">Tất cả</Select.Option>
                {DANH_MUC_TIN_TUC.map((d) => (
                  <Select.Option key={d.value} value={d.value}>{d.label}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Trạng thái" name="trangThai" initialValue="">
              <Select>
                <Select.Option value="">Tất cả</Select.Option>
                <Select.Option value="0">Nháp</Select.Option>
                <Select.Option value="1">Đã xuất bản</Select.Option>
                <Select.Option value="2">Ẩn</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Nổi bật" name="isNoiBat" initialValue="">
              <Select>
                <Select.Option value="">Tất cả</Select.Option>
                <Select.Option value="true">Nổi bật</Select.Option>
                <Select.Option value="false">Thường</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
            <Space>
              <Button color="cyan" variant="solid" htmlType="submit" icon={<SearchOutlined />}>
                Tìm kiếm
              </Button>
              <Button onClick={onReset} icon={<ReloadOutlined />}>
                Xóa lọc
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default Search;
