import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_CauHinhCongThucNhiemVuSearchType } from "@/types/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVu";
import kPI_CauHinhCongThucNhiemVuService from "@/services/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVuService";

import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";

interface SearchProps {
  onFinish: ((values: KPI_CauHinhCongThucNhiemVuSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<KPI_CauHinhCongThucNhiemVuSearchType>();
  const [donViOptions, setDonViOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [dotDanhGiaOptions, setDotDanhGiaOptions] = React.useState<{ label: string; value: string }[]>([]);

  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [donViRes, dotDanhGiaRes] = await Promise.all([
          departmentService.getDropdownTrucThuocBTC(),
          kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown()
        ]);
        
        if (donViRes && donViRes.status) {
          setDonViOptions(donViRes.data || []);
        }
        
        if (dotDanhGiaRes) {
          setDotDanhGiaOptions(dotDanhGiaRes as any);
        }
      } catch (error) {
        console.error("Failed to load options for search", error);
      }
    };
    fetchOptions();
  }, []);
   
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await kPI_CauHinhCongThucNhiemVuService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách kPI_CauHinhCongThucNhiemVu.xlsx");
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
							<Form.Item<KPI_CauHinhCongThucNhiemVuSearchType>
								key="idDonVi"
								label="Đơn vị"
								name="idDonVi">
								<Select placeholder="Đơn vị" options={donViOptions} allowClear showSearch filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())} />
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_CauHinhCongThucNhiemVuSearchType>
								key="idDotDanhGia"
								label="Đợt đánh giá"
								name="idDotDanhGia">
								<Select placeholder="Đợt đánh giá" options={dotDanhGiaOptions} allowClear showSearch filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())} />
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_CauHinhCongThucNhiemVuSearchType>
								key="targetTable"
								label="Bảng đích"
								name="targetTable">
								<Input placeholder="Bảng đích"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_CauHinhCongThucNhiemVuSearchType>
								key="targetColumn"
								label="Cột đích"
								name="targetColumn">
								<Input placeholder="Cột đích"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_CauHinhCongThucNhiemVuSearchType>
								key="fomula"
								label="Công thức"
								name="fomula">
								<Input placeholder="Công thức"/>
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
