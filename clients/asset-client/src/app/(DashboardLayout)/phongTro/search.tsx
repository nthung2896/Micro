import React from "react";
import { Button, Card, Col, Form, Input, Select, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";

import { PhongTroSearchType } from "@/types/phongTro/phongTro";
import phongTroService from "@/services/phongTro/phongTroService";

interface SearchProps {
  onFinish: ((values: PhongTroSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}

const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<PhongTroSearchType>();

  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await phongTroService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách phòng trọ.xlsx");
    } else {
      toast.error(response.message);
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
              <Form.Item<PhongTroSearchType>
                key="tieuDe"
                label="Tiêu đề tin"
                name="tieuDe"
              >
                <Input placeholder="Tìm theo tiêu đề tin..." allowClear />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<PhongTroSearchType>
                key="trangThai"
                label="Trạng thái phòng"
                name="trangThai"
              >
                <Select
                  placeholder="Tất cả trạng thái"
                  allowClear
                  options={[
                    { label: "Còn trống", value: 0 },
                    { label: "Đã thuê", value: 1 },
                    { label: "Tạm ngưng", value: 2 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<PhongTroSearchType>
                key="trangThaiDuyet"
                label="Trạng thái kiểm duyệt"
                name="trangThaiDuyet"
              >
                <Select
                  placeholder="Tất cả kiểm duyệt"
                  allowClear
                  options={[
                    { label: "Chờ duyệt", value: 0 },
                    { label: "Đã duyệt", value: 1 },
                    { label: "Từ chối", value: 2 },
                    { label: "Hết hạn", value: 3 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<PhongTroSearchType>
                key="goiTin"
                label="Gói tin"
                name="goiTin"
              >
                <Select
                  placeholder="Tất cả gói tin"
                  allowClear
                  options={[
                    { label: "Tin thường", value: 0 },
                    { label: "VIP 1", value: 1 },
                    { label: "VIP 2", value: 2 },
                    { label: "VIP Nổi bật", value: 3 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Flex
            alignItems="center"
            justifyContent="center"
            className="btn-group"
          >
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
            >
              Tìm kiếm
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
