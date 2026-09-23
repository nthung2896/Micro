import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Select, Row } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import { toast } from "react-toastify";
import { Room_BangGiaSearchType } from "@/types/room_BangGia/room_BangGia";
import room_BangGiaService from "@/services/room_BangGia/room_BangGiaService";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";

interface SearchProps {
  onFinish: ((values: Room_BangGiaSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
  loaiTinOptions?: { value: string; label: string }[];
  thuocTinhOptions?: { value: string; label: string }[];
}

const Search: React.FC<SearchProps> = ({
  onFinish,
  pageIndex,
  pageSize,
  loaiTinOptions: propLoaiTinOptions,
  thuocTinhOptions: propThuocTinhOptions,
}) => {
  const [form] = useForm<Room_BangGiaSearchType>();
  const [loaiTinOptions, setLoaiTinOptions] = useState<{ value: string; label: string }[]>(
    propLoaiTinOptions || []
  );
  const [thuocTinhOptions, setThuocTinhOptions] = useState<{ value: string; label: string }[]>(
    propThuocTinhOptions || []
  );

  useEffect(() => {
    if (propLoaiTinOptions && propLoaiTinOptions.length > 0) {
      setLoaiTinOptions(propLoaiTinOptions);
    }
  }, [propLoaiTinOptions]);

  useEffect(() => {
    if (propThuocTinhOptions && propThuocTinhOptions.length > 0) {
      setThuocTinhOptions(propThuocTinhOptions);
    }
  }, [propThuocTinhOptions]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      if (loaiTinOptions.length > 0 && thuocTinhOptions.length > 0) return;
      try {
        const [loaiTinRes, thuocTinhRes] = await Promise.all([
          duLieuDanhMucService.getDropdownCode("LOAITIN"),
          duLieuDanhMucService.getDropdownCode("THUOCTINHBANGGIATIN"),
        ]);
        if (loaiTinRes?.status && Array.isArray(loaiTinRes.data)) {
          setLoaiTinOptions(loaiTinRes.data);
        }
        if (thuocTinhRes?.status && Array.isArray(thuocTinhRes.data)) {
          setThuocTinhOptions(thuocTinhRes.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục tìm kiếm:", error);
      }
    };
    fetchDropdowns();
  }, []);
   
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await room_BangGiaService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách bảng giá phòng.xlsx");
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
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<Room_BangGiaSearchType>
                label="Loại tin"
                name="loaiTin"
              >
                <Select
                  placeholder="Tất cả loại tin"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={loaiTinOptions}
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<Room_BangGiaSearchType>
                label="Thuộc tính"
                name="thuocTinh"
              >
                <Select
                  placeholder="Tất cả thuộc tính"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={thuocTinhOptions}
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<Room_BangGiaSearchType>
                label="Hiển thị nút gọi"
                name="isHienThiNutGoi"
              >
                <Select
                  placeholder="Tất cả"
                  allowClear
                  options={[
                    { label: "Có", value: true },
                    { label: "Không", value: false },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<Room_BangGiaSearchType>
                label="Tự động duyệt"
                name="isTuDongDuyet"
              >
                <Select
                  placeholder="Tất cả"
                  allowClear
                  options={[
                    { label: "Có", value: true },
                    { label: "Không", value: false },
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
