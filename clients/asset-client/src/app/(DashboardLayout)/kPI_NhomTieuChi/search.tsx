import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_NhomTieuChiSearchType } from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";

interface SearchProps {
  onFinish: ((values: KPI_NhomTieuChiSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<KPI_NhomTieuChiSearchType>();

  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await kPI_NhomTieuChiService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách nhóm tiêu chí.xlsx");
    } else {
      toast.error(response.message);
    }
  };

  const handleElasticSearch = () => {
    const values = form.getFieldsValue();
    if (onFinish) {
      onFinish({ ...values, isElastic: true });
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
              <Form.Item<KPI_NhomTieuChiSearchType>
                key="tenNhomTieuChi"
                label="Tên nhóm tiêu chí"
                name="tenNhomTieuChi">
                <Input placeholder="Nhập tên nhóm/nhiệm vụ..." />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_NhomTieuChiSearchType>
                key="congViecChiTiet"
                label="Công việc chi tiết"
                name="congViecChiTiet">
                <Input placeholder="Nhập công việc chi tiết..." />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_NhomTieuChiSearchType>
                key="sanPhamDauRa"
                label="Sản phẩm đầu ra"
                name="sanPhamDauRa">
                <Input placeholder="Nhập sản phẩm đầu ra..." />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_NhomTieuChiSearchType>
                key="phanNhom"
                label="Phân nhóm"
                name="phanNhom">
                <Input placeholder="Nhập phân nhóm..." />
              </Form.Item>
            </Col>
          </Row>

          <Flex
            alignItems="center"
            justifyContent="center"
            className="btn-group"
            style={{ gap: "10px" }}
          >
            <Button
              type="primary" style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
              htmlType="submit"
              icon={<SearchOutlined />}

            >
              Tìm kiếm
            </Button>
            <Button
              type="primary" style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
              icon={<SearchOutlined />}

              onClick={handleElasticSearch}
            >
              Tìm kiếm Elastic
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
