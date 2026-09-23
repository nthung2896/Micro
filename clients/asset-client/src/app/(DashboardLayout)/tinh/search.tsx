import React from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  message,
} from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import * as extensions from "@/utils/extensions";

import { TinhSearchType } from "@/types/tinh/request";
import tinhService from "@/services/tinh/tinh.service";

interface SearchProps {
  onFinish: ((values: TinhSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<TinhSearchType>();

  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await tinhService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách .xlsx");
    } else {
      message.error(response.message);
    }
  };

  return (
    <>
      <Card className="customCardShadow mb-3">
        <Form
          form={form}
          layout="vertical"
          name="basic"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={24}>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<TinhSearchType>
                key="maTinh"
                label="Mã Tỉnh"
                name="maTinh"
              >
                <Input placeholder="Mã Tỉnh" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<TinhSearchType> key="sTT" label="Số thứ tự" name="sTT">
                <Input placeholder="Số thứ tự" />
              </Form.Item>
            </Col>

            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<TinhSearchType>
                key="tenDv"
                label="Tên Tỉnh"
                name="tenTinh"
              >
                <Input placeholder="Tên tỉnh" />
              </Form.Item>
            </Col>
          </Row>

          <Flex
            alignItems="center"
            justifyContent="center"
            className="btn-group"
            style={{ gap: 12 }}
          >
            <Button
              color="cyan" variant="solid"
              htmlType="submit"
              icon={<SearchOutlined />}
              size="middle"
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={Export}
              type="primary"
              icon={<DownloadOutlined />}
              className="colorKetXuat"
              size="middle"
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
