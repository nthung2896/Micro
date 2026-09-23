import Flex from "@/components/shared-components/Flex";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, message } from "antd";
import classes from "./page.module.css";

import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { DM_DuLieuDanhMucSearchType } from "@/types/dM_DuLieuDanhMuc/request";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { useForm } from "antd/es/form/Form";
interface SearchProps {
  onFinish: ((values: DM_DuLieuDanhMucSearchType) => void) | undefined;
  pageIndex: number;
  pageSize: number;
  groupId: string;
}
const Search: React.FC<SearchProps> = ({
  onFinish,
  pageIndex,
  pageSize,
  groupId,
}) => {
  const [form] = useForm();

  const Export = async () => {
    const formValues = form.getFieldsValue();
    try {
      const exportData = {
        ...formValues,
        groupId,
        pageIndex,
        pageSize,
      };

      const excelBase64 = await duLieuDanhMucService.exportExcel(exportData);
      downloadFileFromBase64(excelBase64.data, "Danh sách danh mục.xlsx");
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
          <Form.Item<DM_DuLieuDanhMucSearchType>
            name="groupId"
            hidden
            initialValue={groupId}
          >
            <Input />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item<DM_DuLieuDanhMucSearchType>
                label="Mã danh mục"
                name="code"
              >
                <Input placeholder="Mã danh mục" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<DM_DuLieuDanhMucSearchType>
                label="Tên danh mục"
                name="name"
              >
                <Input placeholder="Tên danh mục" />
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
