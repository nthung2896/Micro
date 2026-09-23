import Flex from "@/components/shared-components/Flex";
import { RoleSearchType } from "@/types/role/request";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row } from "antd";
import classes from "./page.module.css";

interface SearchProps {
  onFinish: ((values: RoleSearchType) => void) | undefined;
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
              <Form.Item<RoleSearchType> label="Mã nhóm quyền" name="code">
                <Input placeholder="Mã nhóm quyền" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<RoleSearchType> label="Tên nhóm quyền" name="name">
                <Input placeholder="Tên nhóm quyền" />
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
            <Button
              onClick={() => {}}
              type="primary"
              icon={<DownloadOutlined />}
              className={`${classes.mgright5} ${classes.colorKetXuat}`}
            >
              Kết xuất
            </Button>
          </Flex>
        </Form>
      </Card>
    </>
  );
};

export default Search;
