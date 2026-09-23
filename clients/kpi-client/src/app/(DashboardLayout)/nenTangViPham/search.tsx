import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Select,
  Row,
} from "antd";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { useForm } from "antd/es/form/Form";
import { NenTangViPhamSearchType } from "@/types/nen-tang-vi-pham/request";
import nenTangViPhamService from "@/services/nenTangViPham/nenTangViPham.service";
import { DropdownOption } from "@/types/general";

interface SearchProps {
  onFinish: ((values: NenTangViPhamSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}

const Search: React.FC<SearchProps> = ({ onFinish }) => {
  const [form] = useForm<NenTangViPhamSearchType>();
  const [nguonOptions, setNguonOptions] = useState<DropdownOption[]>([]);
  const [loaiOptions, setLoaiOptions] = useState<DropdownOption[]>([]);
  const [loadingDropdown, setLoadingDropdown] = useState<boolean>(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdown(true);
      try {
        const res = await nenTangViPhamService.getDropdowns();
        if (res.status && res.data) {
          setNguonOptions(res.data["NguonViPham"] || []);
          setLoaiOptions(res.data["LoaiViPham"] || []);
        }
      } catch (e) {
        console.error("Lỗi khi tải danh mục tìm kiếm:", e);
      } finally {
        setLoadingDropdown(false);
      }
    };
    fetchDropdowns();
  }, []);

  return (
    <Card className="customCardShadow mb-3">
      <Form
        form={form}
        layout="vertical"
        name="nenTangViPhamSearchForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={24}>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<NenTangViPhamSearchType>
              key="query"
              label="Tìm kiếm nhanh"
              name="query"
            >
              <Input placeholder="Tên nền tảng, ứng dụng..." allowClear />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<NenTangViPhamSearchType>
              key="nguonId"
              label="Nguồn vi phạm"
              name="nguonId"
            >
              <Select
                placeholder="Chọn nguồn vi phạm"
                allowClear
                loading={loadingDropdown}
                options={nguonOptions.map(x => ({ label: x.label, value: x.value }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<NenTangViPhamSearchType>
              key="loaiViPhamId"
              label="Loại vi phạm"
              name="loaiViPhamId"
            >
              <Select
                placeholder="Chọn loại vi phạm"
                allowClear
                loading={loadingDropdown}
                options={loaiOptions.map(x => ({ label: x.label, value: x.value }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<NenTangViPhamSearchType>
              key="isHienThi"
              label="Trạng thái hiển thị"
              name="isHienThi"
            >
              <Select
                placeholder="Tất cả trạng thái"
                allowClear
                options={[
                  { label: "Hiển thị", value: true },
                  { label: "Ẩn", value: false },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex
          alignItems="center"
          justifyContent="center"
          className="btn-group"
          style={{ gap: 12 }}
        >
          <Button
            color="cyan" variant="solid"
            htmlType="submit"
            icon={<SearchOutlined />}
            size="middle"
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
              if (onFinish) {
                onFinish({});
              }
            }}
            icon={<UndoOutlined />}
            size="middle"
          >
            Làm mới
          </Button>
        </Flex>
      </Form>
    </Card>
  );
};

export default Search;
