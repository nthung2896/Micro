import Flex from "@/components/shared-components/Flex";
import { OperationSearchType } from "@/types/operation/request";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import classes from "./page.module.css";

interface SearchProps {
  onFinish: ((values: OperationSearchType) => void) | undefined;
}
const Search: React.FC<SearchProps> = ({ onFinish }) => {
  const handleExport = async () => {
    // const excelBase64 = await userService.exportExcel();
    // downloadFileFromBase64(excelBase64.data, "Danh sách người dùng.xlsx");
  };

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
              <Form.Item<OperationSearchType> label="Mã thao tác" name="code">
                <Input placeholder="Mã thao tác" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<OperationSearchType> label="Tên thao tác" name="name">
                <Input placeholder="Tên thao tác" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<OperationSearchType> label="Trạng thái" name="isShow">
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
            <Button
              onClick={handleExport}
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
