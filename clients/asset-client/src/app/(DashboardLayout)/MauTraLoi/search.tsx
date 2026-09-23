import React, { useState, useEffect } from "react";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { MauTraLoiSearchType } from "@/types/mauTraLoi/request";
import { DropdownOption } from "@/types/general";
import Flex from "@/components/shared-components/Flex";

interface SearchProps {
  onFinish: (values: MauTraLoiSearchType) => void;
}

const Search: React.FC<SearchProps> = ({ onFinish }) => {
  const [form] = useForm<MauTraLoiSearchType>();
  const [typeDropdown, setTypeDropdown] = useState<DropdownOption[]>([]);
  const [nhomDropdown, setNhomDropdown] = useState<DropdownOption[]>([]);

  const loadDropdowns = async () => {
    try {
      const [typeRes, nhomRes] = await Promise.all([
        duLieuDanhMucService.getDropdownCode("LOAITAILIEUTRALOI"),
        duLieuDanhMucService.getDropdownCode("NHOMTAILIEUMAUTRALOI"),
      ]);

      if (typeRes?.status && typeRes.data) {
        setTypeDropdown(typeRes.data);
      }
      if (nhomRes?.status && nhomRes.data) {
        setNhomDropdown(nhomRes.data);
      }
    } catch (err) {
      console.error("Lỗi khi load danh mục tìm kiếm:", err);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  return (
    <Card className="customCardShadow mb-4">
      <Form
        form={form}
        layout="vertical"
        name="mau-tra-loi-search"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item<MauTraLoiSearchType> label="Từ khóa chung" name="keyword">
              <Input placeholder="Nhập tiêu đề hoặc nội dung cần tìm" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item<MauTraLoiSearchType> label="Loại hồ sơ" name="type">
              <Select
                placeholder="Chọn loại hồ sơ"
                allowClear
                options={typeDropdown.map(item => ({
                  value: item.value,
                  label: item.label
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item<MauTraLoiSearchType> label="Nhóm tài liệu" name="nhomTaiLieu">
              <Select
                placeholder="Chọn nhóm tài liệu"
                allowClear
                options={nhomDropdown.map(item => ({
                  value: item.value,
                  label: item.label
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: "right" }}>
            <Flex justifyContent="end" style={{ gap: 12 }}>
              <Button
                color="cyan" variant="solid"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                Tìm kiếm
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  form.submit();
                }}
              >
                Làm mới
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default Search;
