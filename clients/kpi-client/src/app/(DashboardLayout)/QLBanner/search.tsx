import Flex from "@/components/shared-components/Flex";
import { BannerSearch } from "@/types/banner";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import classes from "./page.module.css";

interface SearchProps {
  onFinish: ((values: BannerSearch) => void) | undefined;
  onReset: () => void;
}

const Search: React.FC<SearchProps> = ({ onFinish, onReset }) => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card className={`${classes.customCardShadow} ${classes.mgButton10}`}>
      <Form
        form={form}
        layout="vertical"
        name="searchBanner"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={24} justify={"center"}>
          <Col xs={24} sm={8} md={8}>
            <Form.Item<BannerSearch> label="Từ khóa (Tên banner, đường dẫn...)" name="keyword">
              <Input placeholder="Nhập tên hoặc link..." allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Form.Item<BannerSearch> label="Vị trí hiển thị" name="position">
              <Select placeholder="Chọn vị trí" allowClear>
                <Select.Option value="SLIDE">Slide chính (Banner chính)</Select.Option>
                <Select.Option value="SIDEBAR">Cột bên (Sidebar)</Select.Option>
                <Select.Option value="FOOTER">Chân trang (Footer)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <Form.Item<BannerSearch> label="Trạng thái" name="isActive">
              <Select placeholder="Chọn trạng thái" allowClear>
                <Select.Option value={true}>Hoạt động</Select.Option>
                <Select.Option value={false}>Tạm ngưng</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Flex alignItems="center" justifyContent="center" style={{ marginTop: 10 }}>
          <Button
            color="cyan" variant="solid"
            htmlType="submit"
            icon={<SearchOutlined />}
            className={classes.mgright5}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={handleReset}
            icon={<UndoOutlined />}
          >
            Làm mới
          </Button>
        </Flex>
      </Form>
    </Card>
  );
};

export default Search;
