import { Button, Card, Col, Form, Input, Row, DatePicker, Select } from "antd";
import classes from "./page.module.css";
import { SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";

import { DropdownOption } from "@/types/general";
import { NotificationSearchType } from "@/types/notification/request";
import notificationService from "@/services/notification/notification.service";

interface SearchProps {
  handleSearch: (values: NotificationSearchType) => void;
  dropdownUser?: DropdownOption[];
}
const Search: React.FC<SearchProps> = ({ handleSearch, dropdownUser }) => {
  const [form] = Form.useForm();
  const handleExport = async () => {
    // const excelBase64 = await notificationService.exportExcel();
    // downloadFileFromBase64(excelBase64.data, 'Danh sách thông báo.xlsx');
  };
  const onSearch = () => {
    form.validateFields().then((values) => {
      handleSearch(values);
    });
  };
  return (
    <>
      <Card className={`${classes.customCardShadow} ${classes.mgButton10}`}>
        <Form
          form={form}
          layout="vertical"
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 24 }}
          //onFinish={onSearch}
          autoComplete="off"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                key={1}
                label={<strong>Từ ngày</strong>}
                name="fromDate"
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                key={1}
                label={<strong>Đến ngày</strong>}
                name="toDate"
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                key={1}
                label={<strong>Nội dung tin nhắn</strong>}
                name="message"
              >
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>

          <Flex alignItems="center" justifyContent="center">
            <Button
              color="cyan" variant="solid"
              htmlType="button"
              icon={<SearchOutlined />}
              className={classes.mgright5}
              onClick={onSearch}
            >
              Tìm kiếm
            </Button>
          </Flex>
        </Form>
      </Card>
    </>
  );
};

export default Search;
