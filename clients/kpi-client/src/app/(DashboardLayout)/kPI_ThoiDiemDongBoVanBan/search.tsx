import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_ThoiDiemDongBoVanBanSearchType } from "@/types/kPI_ThoiDiemDongBoVanBan/kPI_ThoiDiemDongBoVanBan";
import kPI_ThoiDiemDongBoVanBanService from "@/services/kPI_ThoiDiemDongBoVanBan/kPI_ThoiDiemDongBoVanBanService";

interface SearchProps {
  onFinish: ((values: KPI_ThoiDiemDongBoVanBanSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<KPI_ThoiDiemDongBoVanBanSearchType>();
   
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await kPI_ThoiDiemDongBoVanBanService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách kPI_ThoiDiemDongBoVanBan.xlsx");
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
							<Form.Item<KPI_ThoiDiemDongBoVanBanSearchType>
								key="idVanBan"
								label="IdVanBan"
								name="idVanBan">
								<Input placeholder="IdVanBan"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_ThoiDiemDongBoVanBanSearchType>
								key="typeVanBan"
								label="TypeVanBan"
								name="typeVanBan">
								<Input placeholder="TypeVanBan"/>
							</Form.Item>
						</Col>
						<Form.Item<KPI_ThoiDiemDongBoVanBanSearchType>
							label="ThoiGianDongBoVanBan"
						>
							<Row gutter={8}>
								<Col span={12}>
									<Form.Item<KPI_ThoiDiemDongBoVanBanSearchType>
										name="thoiGianDongBoVanBanFrom"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
												className="w-100" style={{ width: "100%" }}
												placeholder="Từ"
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item<KPI_ThoiDiemDongBoVanBanSearchType>										name="thoiGianDongBoVanBanTo"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
												className="w-100" style={{ width: "100%" }}
												placeholder="Đến"
										/>
									</Form.Item>
								</Col>
							</Row>
						</Form.Item>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_ThoiDiemDongBoVanBanSearchType>
								key="isTuNhap"
								label="IsTuNhap"
								name="isTuNhap">
								<Input placeholder="IsTuNhap"/>
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
