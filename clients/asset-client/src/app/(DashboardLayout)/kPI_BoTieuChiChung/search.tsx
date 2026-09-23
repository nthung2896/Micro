import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_BoTieuChiChungSearchType } from "@/types/kPI_BoTieuChiChung/kPI_BoTieuChiChung";
import KPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import KPI_BoTieuChiChungTypeConstant from "@/constants/KPI_BoTieuChiChungTypeConstant";

interface SearchProps {
  onFinish: ((values: KPI_BoTieuChiChungSearchType) => void) | undefined;
}
const Search: React.FC<SearchProps> = ({ onFinish }) => {
  const [form] = useForm<KPI_BoTieuChiChungSearchType>();
  const [donViList, setDonViList] = React.useState<any[]>([]);
  const [dotDanhGiaList, setDotDanhGiaList] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const donViRes = await departmentService.getDropdownDonVi();
        if (donViRes.status) setDonViList(donViRes.data || []);

        const dotRes = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
        setDotDanhGiaList(dotRes || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();
  }, []);

  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex: 1,
      pageSize: 1000000,
    };

    const response = await KPI_BoTieuChiChungService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách .xlsx");
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
              <Form.Item<KPI_BoTieuChiChungSearchType>
                key="soQuyetDinh"
                label="Số quyết định"
                name="soQuyetDinh">
                <Input placeholder="Nhập số quyết định" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_BoTieuChiChungSearchType>
                key="tenBoTieuChiDonVi"
                label="Tên bộ tiêu chí"
                name="tenBoTieuChiDonVi">
                <Input placeholder="Nhập tên bộ tiêu chí" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_BoTieuChiChungSearchType>
                key="idDonVi"
                label="Đơn vị áp dụng"
                name="idDonVi">
                <Select
                  options={donViList}
                  placeholder="Chọn đơn vị"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_BoTieuChiChungSearchType>
                key="type"
                label="Loại bộ tiêu chí"
                name="type">
                <Select
                  allowClear
                  placeholder="Tất cả loại"
                  options={KPI_BoTieuChiChungTypeConstant.getDropdownList()}
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_BoTieuChiChungSearchType>
                key="isActive"
                label="Trạng thái"
                name="isActive">
                <Select
                  placeholder="Tất cả trạng thái"
                  allowClear
                  options={[
                    { label: "Đang kích hoạt", value: true as any },
                    { label: "Chưa kích hoạt", value: false as any },
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

