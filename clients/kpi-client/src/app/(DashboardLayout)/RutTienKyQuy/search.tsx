import { SearchOutlined, DownOutlined, UpOutlined, RedoOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select } from "antd";
import { RutTienKyQuySearchType } from "@/types/rutTienKyQuy/dto";
import React, { useState, useEffect } from "react";
import rutTienKyQuyService from "@/services/rutTienKyQuy/rutTienKyQuy.service";
import { KyQuyStatusNames } from "@/services/rutTienKyQuy/KyQuyConstant";

interface SearchProps {
  onFinish: (values: RutTienKyQuySearchType) => void;
  showSpecialistSearch?: boolean;
  allowedStatuses?: number[];
  activeTabKey?: string;
  isDoanhNghiep?: boolean;
}

const Search: React.FC<SearchProps> = ({
  onFinish,
  showSpecialistSearch,
  allowedStatuses,
  activeTabKey,
  isDoanhNghiep,
}) => {
  const [form] = Form.useForm();
  const [specialists, setSpecialists] = useState<Array<{ id: string; name: string; userName: string }>>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (showSpecialistSearch) {
      rutTienKyQuyService.getSpecialists().then((res) => {
        if (res.status && res.data) {
          setSpecialists(res.data);
        }
      });
    }
  }, [showSpecialistSearch]);

  // Đồng bộ hóa trường Trạng thái trong form tìm kiếm theo Tab đang active
  useEffect(() => {
    if (activeTabKey && activeTabKey !== "All") {
      form.setFieldsValue({ status: parseInt(activeTabKey, 10) });
    } else if (activeTabKey === "All") {
      form.setFieldsValue({ status: undefined });
    }
  }, [activeTabKey, form]);

  // Xây dựng danh sách tùy chọn trạng thái theo quyền (allowedStatuses)
  const statusOptions =
    allowedStatuses && allowedStatuses.length > 0
      ? allowedStatuses.map((status) => ({
        value: status,
        label: KyQuyStatusNames[status] || `Trạng thái ${status}`,
      }))
      : Object.keys(KyQuyStatusNames).map((key) => {
        const status = Number(key);
        return {
          value: status,
          label: KyQuyStatusNames[status],
        };
      });

  const handleReset = () => {
    form.resetFields();
    if (activeTabKey && activeTabKey !== "All") {
      form.setFieldsValue({ status: parseInt(activeTabKey, 10) });
    } else {
      form.setFieldsValue({ status: undefined });
    }
    onFinish(form.getFieldsValue());
  };

  return (
    <Card className="mb-4" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", borderRadius: "8px" }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Hàng tìm kiếm mặc định (Mục chính yếu) */}
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Từ khóa chung" name="keyword">
              <Input
                placeholder={
                  isDoanhNghiep
                    ? "Nhập tên ứng dụng, số văn bản..."
                    : "Nhập MST, tên tổ chức, người đại diện..."
                }
                allowClear
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Tên ứng dụng / Website" name="appTenUngDung">
              <Input placeholder="Nhập tên ứng dụng hoặc website" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Trạng thái hồ sơ" name="status">
              <Select
                placeholder="Chọn trạng thái"
                allowClear
                disabled={activeTabKey !== "All"}
                options={statusOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Khối tìm kiếm mở rộng (Ẩn/Hiện) */}
        {isExpanded && (
          <>
            {isDoanhNghiep ? (
              // Đối với Doanh nghiệp: Chỉ hiện số văn bản và ngân hàng đề nghị nhận tiền
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Số văn bản đề nghị" name="soVanBan">
                    <Input placeholder="Nhập số văn bản đề nghị" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Ngân hàng giao dịch" name="nganHang">
                    <Input placeholder="Nhập ngân hàng nhận tiền" allowClear />
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              // Đối với Cán bộ rà soát / Admin: Hiện đầy đủ tất cả các trường
              <>
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Tên chủ quan tổ chức" name="tenChuQuanToChuc">
                      <Input placeholder="Nhập tên tổ chức cụ thể" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Mã số thuế" name="maSoThue">
                      <Input placeholder="Nhập mã số thuế cụ thể" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Người đại diện pháp luật (ĐDPL)" name="ddplHoVaTen">
                      <Input placeholder="Nhập họ tên người đại diện" allowClear />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Số điện thoại tổ chức" name="sdtToChuc">
                      <Input placeholder="Nhập số điện thoại tổ chức" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Số văn bản đề nghị" name="soVanBan">
                      <Input placeholder="Nhập số văn bản đề nghị" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Ngân hàng giao dịch" name="nganHang">
                      <Input placeholder="Nhập ngân hàng nhận tiền" allowClear />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item label="Email tiếp nhận" name="emailTiepNhan">
                      <Input placeholder="Nhập email tiếp nhận" allowClear />
                    </Form.Item>
                  </Col>
                  {showSpecialistSearch && (
                    <Col xs={24} md={8}>
                      <Form.Item label="Chuyên viên rà soát" name="chuyenVienId">
                        <Select
                          placeholder="Chọn chuyên viên rà soát"
                          allowClear
                          options={specialists.map((sp) => ({
                            value: sp.id,
                            label: `${sp.name} (${sp.userName})`,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </>
            )}
          </>
        )}

        {/* Nút hành động */}
        <Row>
          <Col span={24} style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
            <Button
              color="cyan" variant="solid"
              htmlType="submit"
              icon={<SearchOutlined />}
            >
              Tìm kiếm
            </Button>
            <Button
              type="default"
              icon={<RedoOutlined />}
              onClick={handleReset}
            >
              Đặt lại
            </Button>

            <Button
              type="default"
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
              size="middle"
              style={{ borderRadius: 8, height: 38 }}
            >
              {isExpanded ? "Thu gọn bộ lọc" : "Mở rộng bộ lọc"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default Search;
