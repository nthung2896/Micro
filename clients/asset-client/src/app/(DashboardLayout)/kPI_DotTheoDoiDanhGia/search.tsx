import React from "react";
import { Button, Card, Col, Form, Input, InputNumber, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_DotTheoDoiDanhGiaSearchType } from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";

interface SearchProps {
  onFinish: ((values: KPI_DotTheoDoiDanhGiaSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<KPI_DotTheoDoiDanhGiaSearchType>();
  const searchType = Form.useWatch("type", form);
  const isSearchTapThe = searchType === "TapThe";
   
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await kPI_DotTheoDoiDanhGiaService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách kPI_DotTheoDoiDanhGia.xlsx");
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
							<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
								key="tenDotTheoDoiDanhGia"
								label="Tên đợt theo dõi đánh giá"
								name="tenDotTheoDoiDanhGia">
								<Input placeholder="Nhập tên đợt theo dõi đánh giá"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
								key="thang"
								label="Tháng"
								name="thang">
								<InputNumber className="w-100" min={1} max={12} placeholder={isSearchTapThe ? "Không áp dụng" : "Nhập tháng (1-12)"} disabled={isSearchTapThe}/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
								key="quy"
								label="Quý"
								name="quy">
								<InputNumber className="w-100" min={1} max={4} placeholder={isSearchTapThe ? "Không áp dụng" : "Nhập quý (1-4)"} disabled={isSearchTapThe}/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
								key="nam"
								label="Năm"
								name="nam">
								<InputNumber className="w-100" min={1900} max={2100} placeholder="Nhập năm (VD: 2026)"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
								label="Thời gian bắt đầu"
							>
								<Flex gap={8}>
									<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
										name="thoiGianBatDauFrom"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
											className="w-100"
											style={{ flex: 1, minWidth: 0 }}
											placeholder="Từ"
										/>
									</Form.Item>
									<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
										name="thoiGianBatDauTo"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
											className="w-100"
											style={{ flex: 1, minWidth: 0 }}
											placeholder="Đến"
										/>
									</Form.Item>
								</Flex>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
								label="Thời gian kết thúc"
							>
								<Flex gap={8}>
									<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
										name="thoiGianKetThucFrom"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
											className="w-100"
											style={{ flex: 1, minWidth: 0 }}
											placeholder="Từ"
										/>
									</Form.Item>
									<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
										name="thoiGianKetThucTo"
										noStyle
									>
										<DatePicker
											format="DD/MM/YYYY"
											className="w-100"
											style={{ flex: 1, minWidth: 0 }}
											placeholder="Đến"
										/>
									</Form.Item>
								</Flex>
							</Form.Item>
						</Col>

						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
								key="type"
								label="Loại đợt đánh giá"
								name="type">
								<Select placeholder="Chọn loại đợt đánh giá" allowClear>
									<Select.Option value="CaNhan">Cá nhân</Select.Option>
									<Select.Option value="TapThe">Tập thể</Select.Option>
								</Select>
							</Form.Item>
						</Col>

						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_DotTheoDoiDanhGiaSearchType>
								key="trangThai"
								label="Trạng thái"
								name="trangThai">
								<Select placeholder="Chọn trạng thái" allowClear>
                                    <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
                                    <Select.Option value="CLOSED">Đã đóng/Kết thúc</Select.Option>
                                </Select>
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
