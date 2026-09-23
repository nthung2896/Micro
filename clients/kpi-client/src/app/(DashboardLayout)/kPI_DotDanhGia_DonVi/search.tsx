import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_DotDanhGia_DonViSearchType } from "@/types/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonVi";
import kPI_DotDanhGia_DonViService from "@/services/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonViService";

interface SearchProps {
  onFinish: ((values: KPI_DotDanhGia_DonViSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<KPI_DotDanhGia_DonViSearchType>();
   
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await kPI_DotDanhGia_DonViService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách đợt đánh giá đơn vị.xlsx");
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
							<Form.Item<KPI_DotDanhGia_DonViSearchType>
								key="idDotDanhGia"
								label=""
								name="idDotDanhGia">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotDanhGia_DonViSearchType>
								key="idDonVi"
								label=""
								name="idDonVi">
								<Input placeholder=""/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotDanhGia_DonViSearchType>
								key="idBoChiSoNhiemVu"
								label=""
								name="idBoChiSoNhiemVu">
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
