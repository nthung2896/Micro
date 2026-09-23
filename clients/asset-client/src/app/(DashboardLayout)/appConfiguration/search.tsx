import React from "react";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import { DownloadOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";

import { AppConfigurationSearchType } from "@/types/appConfiguration/appConfiguration";
import appConfigurationService from "@/services/appConfiguration/appConfigurationService";

interface SearchProps {
  onFinish: ((values: AppConfigurationSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<AppConfigurationSearchType>();

  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await appConfigurationService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách cấu hình ứng dụng.xlsx");
    } else {
      toast.error(response.message || "Xuất file thất bại");
    }
  };

  const handleReset = () => {
    form.resetFields();
    if (onFinish) {
      onFinish({} as AppConfigurationSearchType);
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
          <Row gutter={16}>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<AppConfigurationSearchType>
                key="tenApp"
                label="Tên ứng dụng"
                name="tenApp"
              >
                <Input placeholder="Tìm theo tên ứng dụng" allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<AppConfigurationSearchType>
                key="tenDoanhNghiep"
                label="Tên doanh nghiệp / Đơn vị"
                name="tenDoanhNghiep"
              >
                <Input placeholder="Tìm theo tên doanh nghiệp" allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<AppConfigurationSearchType>
                key="diaChi"
                label="Địa chỉ"
                name="diaChi"
              >
                <Input placeholder="Tìm theo địa chỉ" allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<AppConfigurationSearchType>
                key="soDienThoai"
                label="Số điện thoại"
                name="soDienThoai"
              >
                <Input placeholder="Tìm theo số điện thoại" allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<AppConfigurationSearchType>
                key="email"
                label="Email"
                name="email"
              >
                <Input placeholder="Tìm theo email" allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<AppConfigurationSearchType>
                key="primaryColor"
                label="Màu chủ đạo"
                name="primaryColor"
              >
                <Input placeholder="Tìm theo màu chủ đạo" allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<AppConfigurationSearchType>
                key="isActive"
                label="Trạng thái áp dụng"
                name="isActive"
              >
                <Select
                  placeholder="-- Tất cả --"
                  allowClear
                  options={[
                    { value: true, label: "Đang áp dụng" },
                    { value: false, label: "Chưa áp dụng" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Flex
            alignItems="center"
            justifyContent="center"
            className="btn-group"
            style={{ gap: 8 }}
          >
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={handleReset}
              icon={<ReloadOutlined />}
            >
              Đặt lại
            </Button>
            <Button
              onClick={Export}
              type="primary"
              icon={<DownloadOutlined />}
              className="colorKetXuat"
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
