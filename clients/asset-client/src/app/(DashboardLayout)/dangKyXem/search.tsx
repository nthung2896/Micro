"use client";
import { Button, Form, Input, Row, Col, Select } from "antd";
import { DangKyXemSearchType } from "@/types/dang-ky-xem/request";
import { SearchOutlined } from "@ant-design/icons";
import DangKyXemStatusConstant from "@/constants/DangKyXemStatusConstant";

interface SearchProps {
  onFinish: (values: DangKyXemSearchType) => void;
  pageIndex?: number;
  pageSize?: number;
}

const Search: React.FC<SearchProps> = ({ onFinish }) => {
  const [form] = Form.useForm();

  return (
    <div
      style={{
        padding: "16px",
        background: "#fff",
        marginBottom: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="nenTangMuonXemFilter" label="Nền tảng đăng ký xem">
              <Input placeholder="Nhập tên nền tảng..." allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="typeGuiDeXuatFilter" label="Loại gửi đề xuất">
              <Select
                placeholder="Chọn loại đề xuất"
                allowClear
                options={[
                  { value: 1, label: "Sở công thương" },
                  { value: 2, label: "Cục thương mại điện tử và kinh tế số" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="trangThaiFilter" label="Trạng thái">
              <Select placeholder="Chọn trạng thái" allowClear options={DangKyXemStatusConstant.getDropdownList()} />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="center" style={{ marginTop: 8 }}>
          <Col>
            <Button
              color="cyan" variant="solid"
              htmlType="submit"
              icon={<SearchOutlined />}
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Search;
