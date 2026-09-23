import Flex from "@/components/shared-components/Flex";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, message } from "antd";
import classes from "./page.module.css";

import nhomDanhMucService from "@/services/nhomDanhMuc/nhomDanhMuc.service";
import { DM_NhomDanhMucSearchType } from "@/types/dM_NhomDanhMuc/request";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
interface SearchProps {
  onFinish: ((values: DM_NhomDanhMucSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
}
const Search: React.FC<SearchProps> = ({ onFinish, pageIndex, pageSize }) => {
  const [form] = useForm();

  const Export = async () => {
    const formValues = form.getFieldsValue();
    try {
      const exportData = {
        ...formValues,
        pageIndex,
        pageSize,
      };

      const excelBase64 = await nhomDanhMucService.exportExcel(exportData);
      downloadFileFromBase64(excelBase64.data, "Danh sách nhóm danh mục.xlsx");
    } catch (error) {
      message.error("Lỗi khi xuất file");
    }
  };

  return (
    <>
      <Card className={`${classes.customCardShadow} ${classes.mgButton10}`}>
        <Form
          form={form}
          layout="vertical"
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item<DM_NhomDanhMucSearchType>
                label="Mã nhóm danh mục"
                name="groupCode"
              >
                <Input placeholder="Mã nhóm danh mục" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<DM_NhomDanhMucSearchType>
                label="Tên nhóm danh mục"
                name="groupName"
              >
                <Input placeholder="Tên nhóm danh mục" />
              </Form.Item>
            </Col>
          </Row>

          <Flex alignItems="center" justifyContent="center">
            <Button
              color="cyan" variant="solid"
              htmlType="submit"
              icon={<SearchOutlined />}
              className={classes.mgright5}
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={Export}
              type="primary"
              icon={<DownloadOutlined />}
              className={`${classes.mgright5} ${classes.colorKetXuat}`}
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
