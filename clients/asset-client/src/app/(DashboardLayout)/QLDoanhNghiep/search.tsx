import React from "react";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import { useForm } from "antd/es/form/Form";
import { CompanyInfoSearchType } from "@/types/companyInfo/request";
import CompanyInfoStatusConstant from "@/constants/CompanyInfoStatusConstant";
import TypeOrganizationConstant from "@/constants/TypeOrganizationConstant";

interface SearchProps {
  onFinish: ((values: CompanyInfoSearchType) => void) | undefined;
}

const Search: React.FC<SearchProps> = ({ onFinish }) => {
  const [form] = useForm<CompanyInfoSearchType>();

  return (
    <Card className="customCardShadow mb-3">
      <Form
        form={form}
        layout="vertical"
        name="company-info-search"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={24}>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<CompanyInfoSearchType>
              label="Từ khoá"
              name="keyword"
            >
              <Input placeholder="Tên / MST / Email / Người đại diện" allowClear />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<CompanyInfoSearchType>
              label="Mã số thuế"
              name="taxCode"
            >
              <Input placeholder="Mã số thuế" allowClear />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<CompanyInfoSearchType>
              label="Trạng thái"
              name="status"
            >
              <Select
                placeholder="Chọn trạng thái"
                allowClear
                options={CompanyInfoStatusConstant.getDropdownListKey()}
              />
            </Form.Item>
          </Col>
          <Col xl={6} lg={8} md={12} xs={24}>
            <Form.Item<CompanyInfoSearchType>
              label="Loại tổ chức"
              name="typeOrganization"
            >
              <Select
                placeholder="Chọn loại"
                allowClear
                options={TypeOrganizationConstant.getDropdownList()}
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
        </Flex>
      </Form>
    </Card>
  );
};

export default Search;
