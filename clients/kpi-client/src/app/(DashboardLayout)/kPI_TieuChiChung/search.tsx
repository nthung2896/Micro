import React from "react";
import { Button, Card, Col, Form, Input, Row, InputNumber, TreeSelect } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import { exportExcelMultiPage } from "@/utils/exportExcelUtils";

import { KPI_TieuChiChungSearchType } from "@/types/kPI_TieuChiChung/kPI_TieuChiChung";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";

interface SearchProps {
  onFinish: ((values: KPI_TieuChiChungSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
  columns?: any[];
  treeData?: any[];
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize, columns = [], treeData = [] }) => {
  const [form] = useForm<KPI_TieuChiChungSearchType>();

  const Export = async () => {
    if (!columns || columns.length === 0) {
      toast.warning("Không tìm thấy cấu hình cột để xuất file!");
      return;
    }

    const formValues = form.getFieldsValue();

    await exportExcelMultiPage({
      fetchDataFn: kPI_TieuChiChungService.getData,
      formValues,
      fileName: "Danh_sach_Tieu_Chi_Chung",
      sheetName: "Tiêu chí chung",
      columns: columns,
      excludeKeys: ["actions"],
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
              <Form.Item<KPI_TieuChiChungSearchType>
                key="ten"
                label="Tên tiêu chí chung"
                name="ten">
                <Input placeholder="Nhập tên tiêu chí chung" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_TieuChiChungSearchType>
                key="parentId"
                label="Tiêu chí cha"
                name="parentId">
                <TreeSelect
                  showSearch
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="Chọn tiêu chí cha"
                  allowClear
                  treeDefaultExpandAll
                  treeData={treeData}
                  fieldNames={{ label: 'ten', value: 'id', children: 'children' }}
                  treeNodeFilterProp="ten"
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_TieuChiChungSearchType>
                key="myProperty"
                label="Điểm / Trọng số"
                name="myProperty">
                <InputNumber className="w-full" style={{ width: "100%" }} placeholder="Nhập điểm / trọng số" />
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
