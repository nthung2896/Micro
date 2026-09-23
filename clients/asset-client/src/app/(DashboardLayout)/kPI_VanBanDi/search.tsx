import React from "react";
import { Button, Card, Col, Form, Input, DatePicker, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import { exportExcelMultiPage } from "@/utils/exportExcelUtils";

import { KPI_VanBanDiSearchType } from "@/types/kPI_VanBanDi/kPI_VanBanDi";
import kPI_VanBanDiService from "@/services/kPI_VanBanDi/kPI_VanBanDiService";

interface SearchProps {
  onFinish: ((values: KPI_VanBanDiSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
  columns?: any[];
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize, columns = [] }) => {
  const [form] = useForm<KPI_VanBanDiSearchType>();
   
  const Export = async () => {
    if (!columns || columns.length === 0) {
      toast.warning("Không tìm thấy cấu hình cột để xuất file!");
      return;
    }

    const formValues = form.getFieldsValue();

    await exportExcelMultiPage({
      fetchDataFn: kPI_VanBanDiService.getData,
      formValues,
      fileName: "Danh_sach_Van_Ban_Di",
      sheetName: "Văn bản đi",
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
              <Form.Item<KPI_VanBanDiSearchType>
                key="doMat"
                label="Độ mật"
                name="doMat">
                <Input placeholder="Nhập độ mật"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="departmentId"
                label="Phòng ban"
                name="departmentId">
                <Input placeholder="Nhập phòng ban"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="loaiVanBan"
                label="Loại văn bản"
                name="loaiVanBan">
                <Input placeholder="Nhập loại văn bản"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="soHieu"
                label="Số hiệu"
                name="soHieu">
                <Input placeholder="Nhập số hiệu"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="doKhan"
                label="Độ khẩn"
                name="doKhan">
                <Input placeholder="Nhập độ khẩn"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="trichYeu"
                label="Trích yếu"
                name="trichYeu">
                <Input placeholder="Nhập trích yếu"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                label="Hạn xử lý"
              >
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item<KPI_VanBanDiSearchType>
                      name="hanXuLyFrom"
                      noStyle
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full"
                        placeholder="Từ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item<KPI_VanBanDiSearchType>
                      name="hanXuLyTo"
                      noStyle
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full"
                        placeholder="Đến"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="soBan"
                label="Số bản"
                name="soBan">
                <Input placeholder="Nhập số bản"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="soDi"
                label="Số đi"
                name="soDi">
                <Input placeholder="Nhập số đi"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="soVanBanId"
                label="Sổ văn bản"
                name="soVanBanId">
                <Input placeholder="Nhập sổ văn bản"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                label="Ngày ban hành"
              >
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item<KPI_VanBanDiSearchType>
                      name="ngayBanHanhFrom"
                      noStyle
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full"
                        placeholder="Từ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item<KPI_VanBanDiSearchType>
                      name="ngayBanHanhTo"
                      noStyle
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full"
                        placeholder="Đến"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="isCapSo"
                label="Cấp số"
                name="isCapSo">
                <Input placeholder="Nhập cấp số"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                label="Ngày văn bản"
              >
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item<KPI_VanBanDiSearchType>
                      name="ngayVanBanFrom"
                      noStyle
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full"
                        placeholder="Từ"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item<KPI_VanBanDiSearchType>
                      name="ngayVanBanTo"
                      noStyle
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="w-full"
                        placeholder="Đến"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="nguoiSoanThao"
                label="Người soạn thảo"
                name="nguoiSoanThao">
                <Input placeholder="Nhập người soạn thảo"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="trichYeuNormalized"
                label="Trích yếu chuẩn hóa"
                name="trichYeuNormalized">
                <Input placeholder="Nhập trích yếu chuẩn hóa"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="trangThai"
                label="Trạng thái"
                name="trangThai">
                <Input placeholder="Nhập trạng thái"/>
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<KPI_VanBanDiSearchType>
                key="ghiChu"
                label="Ghi chú"
                name="ghiChu">
                <Input placeholder="Nhập ghi chú"/>
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
