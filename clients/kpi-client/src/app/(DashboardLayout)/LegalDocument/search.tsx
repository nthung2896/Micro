import React, { useState, useEffect } from "react";
import { SearchOutlined, RedoOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select, DatePicker } from "antd";
import { LegalDocumentSearch } from "@/types/legalDocument";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { DropdownOption } from "@/types/general";

interface SearchProps {
  onFinish: (values: any) => void;
}

const Search: React.FC<SearchProps> = ({ onFinish }) => {
  const [form] = Form.useForm();
  const [loaiHeThongDropdown, setLoaiHeThongDropdown] = useState<DropdownOption[]>([]);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    duLieuDanhMucService.getDropdownCode("LOAIHETHONGVANBAN").then((res) => {
      if (res?.status && res.data) {
        setLoaiHeThongDropdown(res.data);
      }
    });
  }, []);

  const handleFinish = (values: any) => {
    const searchValues: LegalDocumentSearch = {
      keyword: values.keyword,
      loaiVanBan: values.loaiVanBan,
      code: values.code,
      publicBy: values.publicBy,
      signedBy: values.signedBy,
      status: values.status,
      loaiHeThong: values.loaiHeThong,
      description: values.description,
      tuNgay: values.tuNgay ? values.tuNgay.startOf('day').toISOString() : undefined,
      denNgay: values.denNgay ? values.denNgay.endOf('day').toISOString() : undefined,
      activedDateFrom: values.activedDateFrom ? values.activedDateFrom.startOf('day').toISOString() : undefined,
      activedDateTo: values.activedDateTo ? values.activedDateTo.endOf('day').toISOString() : undefined,
      expiredDateFrom: values.expiredDateFrom ? values.expiredDateFrom.startOf('day').toISOString() : undefined,
      expiredDateTo: values.expiredDateTo ? values.expiredDateTo.endOf('day').toISOString() : undefined,
    };
    onFinish(searchValues);
  };

  const handleReset = () => {
    form.resetFields();
    onFinish({});
  };

  const statusOptions = [
    { value: "Draft", label: "Bản nháp" },
    { value: "Approved", label: "Đã duyệt" },
    { value: "Removed", label: "Gỡ bỏ" },
  ];

  return (
    <Card className="mb-4" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", borderRadius: "8px" }}>
      <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={handleFinish}>
        <Row gutter={24}>
          {/* Row 1 (Initially visible) */}
          <Col span={12}>
            <Form.Item label="Tên văn bản" name="keyword">
              <Input placeholder="Nhập tên văn bản..." allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Loại văn bản" name="loaiVanBan">
              <Input placeholder="Nhập loại văn bản..." allowClear />
            </Form.Item>
          </Col>

          {/* Row 2 (Initially visible) */}
          <Col span={12}>
            <Form.Item label="Số hiệu văn bản" name="code">
              <Input placeholder="Nhập số hiệu văn bản..." allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ban hành bởi" name="publicBy">
              <Input placeholder="Nhập cơ quan ban hành..." allowClear />
            </Form.Item>
          </Col>

          {/* Collapsible search options */}
          {expanded && (
            <>
              {/* Row 3 */}
              <Col span={12}>
                <Form.Item label="Người ký" name="signedBy">
                  <Input placeholder="Nhập người ký..." allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày ban hành">
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="tuNgay" noStyle>
                        <DatePicker placeholder="Từ ngày" style={{ width: "100%" }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="denNgay" noStyle>
                        <DatePicker placeholder="Đến ngày" style={{ width: "100%" }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>

              {/* Row 4 */}
              <Col span={12}>
                <Form.Item label="Ngày có hiệu lực">
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="activedDateFrom" noStyle>
                        <DatePicker placeholder="Từ ngày" style={{ width: "100%" }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="activedDateTo" noStyle>
                        <DatePicker placeholder="Đến ngày" style={{ width: "100%" }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ngày hết hạn">
                  <Row gutter={8}>
                    <Col span={12}>
                      <Form.Item name="expiredDateFrom" noStyle>
                        <DatePicker placeholder="Từ ngày" style={{ width: "100%" }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="expiredDateTo" noStyle>
                        <DatePicker placeholder="Đến ngày" style={{ width: "100%" }} format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              </Col>

              {/* Row 5 */}
              <Col span={12}>
                <Form.Item label="Trích dẫn" name="description">
                  <Input placeholder="Nhập trích dẫn văn bản..." allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Trạng thái" name="status">
                  <Select
                    placeholder="Chọn trạng thái"
                    allowClear
                    options={statusOptions}
                  />
                </Form.Item>
              </Col>

              {/* Row 6 */}
              <Col span={12}>
                <Form.Item label="Loại hệ thống" name="loaiHeThong">
                  <Select
                    placeholder="Chọn loại hệ thống"
                    allowClear
                    options={loaiHeThongDropdown.map(item => ({
                      value: item.value,
                      label: item.label
                    }))}
                  />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>

        <Row>
          <Col span={24} style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
            <Button color="cyan" variant="solid" htmlType="submit" icon={<SearchOutlined />}>
              Tìm kiếm
            </Button>
            <Button type="default" icon={<RedoOutlined />} onClick={handleReset}>
              Đặt lại
            </Button>
            <Button type="link" onClick={() => setExpanded(!expanded)} icon={expanded ? <UpOutlined /> : <DownOutlined />}>
              {expanded ? "Thu gọn" : "Mở rộng"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default Search;
