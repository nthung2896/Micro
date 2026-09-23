import Flex from "@/components/shared-components/Flex";
import { ModuleSearchType } from "@/types/module/request";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import classes from "./page.module.css";

interface SearchProps {
  onFinish: ((values: ModuleSearchType) => void) | undefined;
}
const Search: React.FC<SearchProps> = ({ onFinish }) => {
  return (
    <>
      <Card className={`${classes.customCardShadow} ${classes.mgButton10}`}>
        <Form
          layout="vertical"
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={24} justify={"center"}>
            <Col span={8}>
              <Form.Item<ModuleSearchType> label="Mã chức năng" name="code">
                <Input placeholder="Mã chức năng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<ModuleSearchType> label="Tên chức năng" name="name">
                <Input placeholder="Tên chức năng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<ModuleSearchType> label="Trạng thái" name="isShow">
                <Select defaultValue={null}>
                  <Select.Option value={null}>
                    -- Chọn trạng thái --
                  </Select.Option>
                  <Select.Option value={true}>Hiển thị</Select.Option>
                  <Select.Option value={false}>Không hiển thị</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Flex alignItems="center" justifyContent="center">
            <Button
              color="cyan" variant="solid"
              htmlType="submit"
              icon={<SearchOutlined />}
              className={classes.mgright5}
            >
              Tìm kiếm
            </Button>
            {/* <Button
              onClick={handleExport}
              type="primary"
              icon={<DownloadOutlined />}
              className={`${classes.mgright5} ${classes.colorKetXuat}`}
              
            >
              Kết xuất
            </Button> */}
          </Flex>
        </Form>
      </Card>
    </>
  );
};

export default Search;
