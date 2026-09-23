import React from "react";
import { Button, Card, Col, Form, InputNumber, Select, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { useForm } from "antd/es/form/Form";
import { exportExcelMultiPage } from "@/utils/exportExcelUtils";

import { KPI_CauHinhDiemTheoHeSoLanhDaoSearchType } from "@/types/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDao";
import kPI_CauHinhDiemTheoHeSoLanhDaoService from "@/services/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDaoService";

interface SearchProps {
  onFinish: ((values: KPI_CauHinhDiemTheoHeSoLanhDaoSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
  chucVuOptions?: { value: string; label: string }[];
  columns?: any[];
}

const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize, chucVuOptions = [], columns = [] }) => {
  const [form] = useForm<KPI_CauHinhDiemTheoHeSoLanhDaoSearchType>();

  const Export = async () => {
    const formValues = form.getFieldsValue();
    await exportExcelMultiPage({
      fetchDataFn: kPI_CauHinhDiemTheoHeSoLanhDaoService.getData,
      formValues,
      fileName: "Danh_sach_CauHinhDiemTheoHeSoLanhDao",
      sheetName: "Cấu hình điểm theo hệ số lãnh đạo",
      columns: columns,
    });
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
              <Form.Item<KPI_CauHinhDiemTheoHeSoLanhDaoSearchType>
                key="chucVu"
                label="Chức vụ"
                name="chucVu"
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn chức vụ"
                  options={chucVuOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_CauHinhDiemTheoHeSoLanhDaoSearchType>
                key="heSo"
                label="Hệ số"
                name="heSo"
              >
                <InputNumber style={{ width: "100%" }} placeholder="Nhập hệ số" />
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
              type="primary"
              style={{ backgroundColor: "#13c2c2", borderColor: "#13c2c2" }}
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
