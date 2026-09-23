import React from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  message,
} from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
import * as extensions from "@/utils/extensions";

import { HuyenSearchType } from "@/types/huyen/request";
import huyenService from "@/services/huyen/huyen.service";
import tinhService from "@/services/tinh/tinh.service";
import { TinhOption } from "@/types/tinh/TinhOption";

interface SearchProps {
  onFinish: ((values: HuyenSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm<HuyenSearchType>();
  const [tinhOptions, setTinhOptions] = React.useState<TinhOption[]>([]);
  const [loadingTinh, setLoadingTinh] = React.useState(false);

  React.useEffect(() => {
    const fetchTinh = async () => {
      setLoadingTinh(true);
      try {
        const res = await tinhService.getData({ pageIndex: 1, pageSize: 200 });
        const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];

        setTinhOptions(
          items.map((x: any) => ({
            label: x.tenDv ?? x.tenTinh ?? x.name,
            value: x.maTinh ?? x.code,
          })),
        );
      } catch (e) {
        message.error("Không tải được danh sách tỉnh/thành");
      } finally {
        setLoadingTinh(false);
      }
    };
    fetchTinh();
  }, []);
  const Export = async () => {
    const formValues = form.getFieldsValue();

    const exportData = {
      ...formValues,
      pageIndex,
      pageSize,
    };

    const response = await huyenService.exportExcel(exportData);
    if (response.status) {
      downloadFileFromBase64(response.data, "Danh sách .xlsx");
    } else {
      message.error(response.message);
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
              <Form.Item<HuyenSearchType>
                key="loaiHuyen"
                label="Loại huyện"
                name="loaiHuyen"
              >
                <Input placeholder="Loại huyện" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<HuyenSearchType>
                key="tenHuyen"
                label="Tên huyện"
                name="tenHuyen"
              >
                <Input placeholder="Tên huyện" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<HuyenSearchType> key="ma" label="Mã" name="ma">
                <Input placeholder="Mã" />
              </Form.Item>
            </Col>
            <Col xl={6} lg={8} md={12} xs={24}>
              <Form.Item<HuyenSearchType>
                label="Mã tỉnh"
                name="maTinh"
                rules={[{ required: true, message: "Vui lòng chọn tỉnh!" }]}
              >
                <Select
                  placeholder="Chọn tỉnh/thành phố"
                  loading={loadingTinh}
                  showSearch
                  optionFilterProp="label"
                  options={tinhOptions}
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase()) ||
                    ((option?.value as string) ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
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
              onClick={Export}
              type="primary"
              icon={<DownloadOutlined />}
              className="colorKetXuat"
              size="middle"
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
