import React from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Select,
  Row,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { useForm } from "antd/es/form/Form";
import { PhanAnhNenTangSearchType } from "@/types/phan-anh-nen-tang/request";
import tinhService from "@/services/tinh/tinh.service";

interface SearchProps {
  onFinish: ((values: PhanAnhNenTangSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}

const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<PhanAnhNenTangSearchType>();
  const [tinhOptions, setTinhOptions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchTinh = async () => {
      try {
        const res = await tinhService.getData({ pageIndex: 1, pageSize: 200 });
        const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
        setTinhOptions(
          items.map((x: any) => ({
            label: x.tenDv ?? x.tenTinh ?? x.name,
            value: x.maTinh ?? x.code,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchTinh();
  }, []);

  return (
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
            <Form.Item<PhanAnhNenTangSearchType>
              key="query"
              label="Tìm kiếm nhanh"
              name="query"
            >
              <Input placeholder="Họ tên, email, số điện thoại..." />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<PhanAnhNenTangSearchType>
              key="tenNenTang"
              label="Tên nền tảng"
              name="tenNenTang"
            >
              <Input placeholder="Tên nền tảng" />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<PhanAnhNenTangSearchType>
              key="maTinh"
              label="Tỉnh/Thành phố"
              name="maTinh"
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                showSearch
                allowClear
                optionFilterProp="label"
                options={tinhOptions}
                filterOption={(input, option) =>
                  ((option?.label as string) ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<PhanAnhNenTangSearchType>
              key="trangThai"
              label="Trạng thái"
              name="trangThai"
            >
              <Select
                placeholder="Chọn trạng thái"
                allowClear
                options={[
                  { label: "Mới tiếp nhận", value: 0 },
                  { label: "Đang xử lý", value: 1 },
                  { label: "Đã xử lý", value: 2 },
                  { label: "Từ chối", value: 3 },
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
