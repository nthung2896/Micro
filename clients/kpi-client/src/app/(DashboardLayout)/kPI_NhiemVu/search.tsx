import React from "react";
import { Button, Card, Col, Form, Input, Select, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import * as extensions from "@/utils/extensions";

import { KPI_NhiemVuSearchType } from "@/types/kPI_NhiemVu/kPI_NhiemVu";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";

interface SearchProps {
  onFinish: ((values: KPI_NhiemVuSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<KPI_NhiemVuSearchType>();
   
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await kPI_NhiemVuService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách kPI_NhiemVu.xlsx");
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
							<Form.Item<KPI_NhiemVuSearchType>
								key="idNhiemVuTraVe"
								label="IdNhiemVuTraVe"
								name="idNhiemVuTraVe">
								<Input placeholder="IdNhiemVuTraVe"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="tenNhiemVuDayDu"
								label="TenNhiemVuDayDu"
								name="tenNhiemVuDayDu">
								<Input placeholder="TenNhiemVuDayDu"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="tenNhiemVuRutGon"
								label="TenNhiemVuRutGon"
								name="tenNhiemVuRutGon">
								<Input placeholder="TenNhiemVuRutGon"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="maLoaiNhiemVu"
								label="MaLoaiNhiemVu"
								name="maLoaiNhiemVu">
								<Input placeholder="MaLoaiNhiemVu"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="tenLoaiNhiemVu"
								label="TenLoaiNhiemVu"
								name="tenLoaiNhiemVu">
								<Input placeholder="TenLoaiNhiemVu"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="nhiemVuTrongTam"
								label="NhiemVuTrongTam"
								name="nhiemVuTrongTam">
								<Input placeholder="NhiemVuTrongTam"/>
							</Form.Item>
						</Col>
						<Form.Item<KPI_NhiemVuSearchType>
							label="ThoiHan"
						>
							<Row gutter={8}>
								<Col span={12}>
									<Form.Item<KPI_NhiemVuSearchType>
										name="thoiHanFrom"
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
									<Form.Item<KPI_NhiemVuSearchType>										name="thoiHanTo"
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
						<Form.Item<KPI_NhiemVuSearchType>
							label="NgayHoanThanh"
						>
							<Row gutter={8}>
								<Col span={12}>
									<Form.Item<KPI_NhiemVuSearchType>
										name="ngayHoanThanhFrom"
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
									<Form.Item<KPI_NhiemVuSearchType>										name="ngayHoanThanhTo"
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
						<Form.Item<KPI_NhiemVuSearchType>
							label="NgayVanBan"
						>
							<Row gutter={8}>
								<Col span={12}>
									<Form.Item<KPI_NhiemVuSearchType>
										name="ngayVanBanFrom"
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
									<Form.Item<KPI_NhiemVuSearchType>										name="ngayVanBanTo"
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
							<Form.Item<KPI_NhiemVuSearchType>
								key="maNhiemVuCha"
								label="MaNhiemVuCha"
								name="maNhiemVuCha">
								<Input placeholder="MaNhiemVuCha"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="loaiHanXuLy"
								label="LoaiHanXuLy"
								name="loaiHanXuLy">
								<Input placeholder="LoaiHanXuLy"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="email"
								label="Email"
								name="email">
								<Input placeholder="Email"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="idDotTheoDoiDanhGia"
								label="IdDotTheoDoiDanhGia"
								name="idDotTheoDoiDanhGia">
								<Input placeholder="IdDotTheoDoiDanhGia"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="idLyLich"
								label="IdLyLich"
								name="idLyLich">
								<Input placeholder="IdLyLich"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="idPhongBan"
								label="IdPhongBan"
								name="idPhongBan">
								<Input placeholder="IdPhongBan"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="tenPhongBan"
								label="TenPhongBan"
								name="tenPhongBan">
								<Input placeholder="TenPhongBan"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="idNguoiXuLy"
								label="IdNguoiXuLy"
								name="idNguoiXuLy">
								<Input placeholder="IdNguoiXuLy"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="tenNguoiXuLy"
								label="TenNguoiXuLy"
								name="tenNguoiXuLy">
								<Input placeholder="TenNguoiXuLy"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="idLinhVuc"
								label="IdLinhVuc"
								name="idLinhVuc">
								<Input placeholder="IdLinhVuc"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="tenLinhVuc"
								label="TenLinhVuc"
								name="tenLinhVuc">
								<Input placeholder="TenLinhVuc"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="soLanCapNhatTienDo"
								label="SoLanCapNhatTienDo"
								name="soLanCapNhatTienDo">
								<Input placeholder="SoLanCapNhatTienDo"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="isHoanThanh"
								label="IsHoanThanh"
								name="isHoanThanh">
								<Input placeholder="IsHoanThanh"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="isDaDuyet"
								label="IsDaDuyet"
								name="isDaDuyet">
								<Input placeholder="IsDaDuyet"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="status"
								label="Status"
								name="status">
								<Input placeholder="Status"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="ketQuaXuLyMoiNhat"
								label="KetQuaXuLyMoiNhat"
								name="ketQuaXuLyMoiNhat">
								<Input placeholder="KetQuaXuLyMoiNhat"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="ketQuaTuXepLoai"
								label="KetQuaTuXepLoai"
								name="ketQuaTuXepLoai">
								<Input placeholder="KetQuaTuXepLoai"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="ketQuaPhoPhongXepLoai"
								label="KetQuaPhoPhongXepLoai"
								name="ketQuaPhoPhongXepLoai">
								<Input placeholder="KetQuaPhoPhongXepLoai"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="ketQuaLanhDaoXepLoai"
								label="KetQuaLanhDaoXepLoai"
								name="ketQuaLanhDaoXepLoai">
								<Input placeholder="KetQuaLanhDaoXepLoai"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="type"
								label="Type"
								name="type">
								<Input placeholder="Type"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="typeCaNhanTruongBan"
								label="TypeCaNhanTruongBan"
								name="typeCaNhanTruongBan">
								<Input placeholder="TypeCaNhanTruongBan"/>
							</Form.Item>
						</Col>
						<Col xl={6} lg={8} md={12} xs={24}>
							<Form.Item<KPI_NhiemVuSearchType>
								key="emailsNguoiThucHien"
								label="EmailsNguoiThucHien"
								name="emailsNguoiThucHien">
								<Input placeholder="EmailsNguoiThucHien"/>
							</Form.Item>
						</Col>
						<Form.Item<KPI_NhiemVuSearchType>
							label="TimeDongBo"
						>
							<Row gutter={8}>
								<Col span={12}>
									<Form.Item<KPI_NhiemVuSearchType>
										name="timeDongBoFrom"
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
									<Form.Item<KPI_NhiemVuSearchType>										name="timeDongBoTo"
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
