import React from "react";
import { Form, Row, Col, InputNumber, Divider } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { DangTinFormValues } from "../types";
import { AMENITY_CONFIG } from "../constants";

interface TienIchChiPhiSectionProps {
  amenities: Record<string, boolean>;
  toggleAmenity: (key: string) => void;
}

export const TienIchChiPhiSection: React.FC<TienIchChiPhiSectionProps> = ({
  amenities,
  toggleAmenity,
}) => {
  return (
    <>
      {/* Tiện nghi phòng trọ (Pills) */}
      <div className="mb-5">
        <label className="font-semibold text-gray-800 text-sm block mb-2">
          Đặc điểm & Tiện nghi phòng (Bấm để bật/tắt):
        </label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_CONFIG.map((item) => {
            const isActive = amenities[item.key];
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => toggleAmenity(item.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-xs"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <CheckOutlined className="text-blue-600 text-xs ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <Divider className="my-4" />

      {/* Chi phí dịch vụ */}
      <label className="font-semibold text-gray-800 text-sm block mb-3">
        Chi phí dịch vụ & tiện ích:
      </label>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={12}>
            <Form.Item<DangTinFormValues>
              label="Tiền điện"
              name="giaDien"
              className="mb-0"
            >
              <InputNumber
                size="large"
                className="w-full"
                min={0}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
                addonAfter="đ / số (kWh)"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item<DangTinFormValues>
              label="Tiền nước"
              name="giaNuoc"
              className="mb-0"
            >
              <InputNumber
                size="large"
                className="w-full"
                min={0}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
                addonAfter="đ / khối"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item<DangTinFormValues>
              label="Tiền mạng / Internet"
              name="giaInternet"
              className="mb-0"
            >
              <InputNumber
                size="large"
                className="w-full"
                min={0}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
                addonAfter="đ / phòng"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item<DangTinFormValues>
              label="Phí dịch vụ chung / vệ sinh"
              name="giaDichVuChung"
              className="mb-0"
            >
              <InputNumber
                size="large"
                className="w-full"
                min={0}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
                addonAfter="đ / người"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item<DangTinFormValues>
              label="Phí gửi xe"
              name="giaGuiXe"
              className="mb-0"
            >
              <InputNumber
                size="large"
                className="w-full"
                min={0}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
                addonAfter="đ / xe"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </>
  );
};
