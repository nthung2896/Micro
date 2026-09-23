import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_VanBanDenSearchType } from "@/types/kPI_VanBanDen/kPI_VanBanDen";
import kPI_VanBanDenService from "@/services/kPI_VanBanDen/kPI_VanBanDenService";

interface SearchProps {
  onFinish: ((values: KPI_VanBanDenSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<KPI_VanBanDenSearchType>();
   
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await kPI_VanBanDenService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách văn bản đến.xlsx");
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
							<Form.Item<KPI_VanBanDenSearchType>
								key="idVanBanDongBo"
								label="ID Đồng bộ"
								name="idVanBanDongBo">
								<Input placeholder="Nhập ID Đồng bộ"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_VanBanDenSearchType>
								key="soVanBan"
								label="Số văn bản"
								name="soVanBan">
								<Input placeholder="Nhập Số văn bản"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_VanBanDenSearchType>
								label="Ngày văn bản"
							>
								<Flex gap={8}>
									<Form.Item<KPI_VanBanDenSearchType>
										name="ngayVanBanFrom"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
											className="w-100"
											style={{ flex: 1 }}
											placeholder="Từ"
										/>
									</Form.Item>
									<Form.Item<KPI_VanBanDenSearchType>
										name="ngayVanBanTo"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
											className="w-100"
											style={{ flex: 1 }}
											placeholder="Đến"
										/>
									</Form.Item>
								</Flex>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_VanBanDenSearchType>
								key="trichYeu"
								label="Trích yếu"
								name="trichYeu">
								<Input placeholder="Nhập Trích yếu"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_VanBanDenSearchType>
								key="trangThai"
								label="Trạng thái"
								name="trangThai">
								<Input placeholder="Nhập Trạng thái"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_VanBanDenSearchType>
								label="Ngày hoàn thành"
							>
								<Flex gap={8}>
									<Form.Item<KPI_VanBanDenSearchType>
										name="ngayHoanThanhFrom"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
											className="w-100"
											style={{ flex: 1 }}
											placeholder="Từ"
										/>
									</Form.Item>
									<Form.Item<KPI_VanBanDenSearchType>
										name="ngayHoanThanhTo"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
											className="w-100"
											style={{ flex: 1 }}
											placeholder="Đến"
										/>
									</Form.Item>
								</Flex>
							</Form.Item>
						</Col>
          </Row>

          <Flex
            alignItems="center"
            justifyContent="center"
            className="btn-group" style={{ gap: "10px" }}>
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
