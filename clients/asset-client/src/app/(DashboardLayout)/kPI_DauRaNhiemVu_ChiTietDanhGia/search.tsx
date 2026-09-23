import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType } from "@/types/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGia";
import kPI_DauRaNhiemVu_ChiTietDanhGiaService from "@/services/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGiaService";

interface SearchProps {
  onFinish: ((values: KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>();
   
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await kPI_DauRaNhiemVu_ChiTietDanhGiaService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách đầu ra nhiệm vụ chi tiết đánh giá.xlsx");
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
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="idDauRaNhiemVu"
								label=""
								name="idDauRaNhiemVu">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="idPhieuDanhGia"
								label=""
								name="idPhieuDanhGia">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="vaiTroDanhGia"
								label=""
								name="vaiTroDanhGia">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="nguoiDanhGiaId"
								label=""
								name="nguoiDanhGiaId">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemSoLuong_HoanThanh"
								label=""
								name="chamDiemSoLuong_HoanThanh">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemSoLuong_KhongHoanThanh"
								label=""
								name="chamDiemSoLuong_KhongHoanThanh">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemSoLuong_Diem"
								label=""
								name="chamDiemSoLuong_Diem">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemChatLuong_KhongDat"
								label=""
								name="chamDiemChatLuong_KhongDat">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemChatLuong_SoDiemConLai"
								label=""
								name="chamDiemChatLuong_SoDiemConLai">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemChatLuong_Diem"
								label=""
								name="chamDiemChatLuong_Diem">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemTienDo_KhongDat"
								label=""
								name="chamDiemTienDo_KhongDat">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemTienDo_SoDiemConLai"
								label=""
								name="chamDiemTienDo_SoDiemConLai">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="chamDiemTienDo_Diem"
								label=""
								name="chamDiemTienDo_Diem">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType>
								key="ghiChu"
								label=""
								name="ghiChu">
								<Input placeholder=""/>
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
              size="small"
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={Export}
              type="primary"
              icon={<DownloadOutlined />}
              className="colorKetXuat"
              size="small"
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
