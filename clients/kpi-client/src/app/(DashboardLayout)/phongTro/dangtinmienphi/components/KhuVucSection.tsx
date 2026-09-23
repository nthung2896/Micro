import React, { useState } from "react";
import { Form, Row, Col, Select, Input, Button, Tag, Tooltip, message } from "antd";
import {
  CompassOutlined,
  AimOutlined,
  ExportOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { DangTinFormValues } from "../types";

interface KhuVucSectionProps {
  tinhOptions: { label: string; value: string }[];
  xaOptions: { label: string; value: string }[];
  onTinhChange: (maTinh: string, option?: any) => void;
  onXaChange: (maXa: string, option?: any) => void;
  onAddressFieldChange: (field: "soNha" | "duongPho", value: string) => void;
  hasTinh: boolean;
  loadingXa?: boolean;
}

export const KhuVucSection: React.FC<KhuVucSectionProps> = ({
  tinhOptions,
  xaOptions,
  onTinhChange,
  onXaChange,
  onAddressFieldChange,
  hasTinh,
  loadingXa = false,
}) => {
  const form = Form.useFormInstance<DangTinFormValues>();
  const diaChi = Form.useWatch("diaChi", form);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Lấy vị trí GPS hiện tại của người dùng
  const handleGetGpsLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      message.error("Trình duyệt không hỗ trợ định vị GPS");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGettingLocation(false);
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const coordString = `${lat}, ${lng}`;
        form.setFieldsValue({ toaDo: coordString });
        message.success(`Đã lấy tọa độ GPS: ${coordString}`);
      },
      (error) => {
        setGettingLocation(false);
        message.warning("Không thể lấy vị trí hiện tại. Vui lòng bật quyền truy cập vị trí trên trình duyệt.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Tạo URL bản đồ Google Maps động theo địa chỉ người dùng
  const mapAddress = diaChi && diaChi.trim().length > 3 ? diaChi.trim() : "Thành phố Hà Nội";
  const mapEmbedUrl = `https://maps.google.com/maps?width=100%25&height=360&hl=vi&q=${encodeURIComponent(
    mapAddress
  )}&ie=UTF8&t=&z=15&iwloc=B&output=embed`;

  return (
    <Row gutter={16}>
      {/* 1. Tỉnh / Thành phố */}
      <Col xs={24} sm={12}>
        <Form.Item<DangTinFormValues>
          label="Tỉnh / Thành phố"
          name="maTinh"
          rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" }]}
        >
          <Select
            size="large"
            placeholder="-- Chọn Tỉnh/TP --"
            options={tinhOptions}
            onChange={onTinhChange}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item<DangTinFormValues> name="tenTinh" hidden>
          <Input />
        </Form.Item>
      </Col>

      {/* 2. Phường / Xã (Load trực tiếp từ Tỉnh/TP) */}
      <Col xs={24} sm={12}>
        <Form.Item<DangTinFormValues>
          label="Phường / Xã"
          name="maXa"
          rules={[{ required: true, message: "Vui lòng chọn Phường/Xã!" }]}
        >
          <Select
            size="large"
            placeholder={loadingXa ? "Đang tải danh sách phường xã..." : "-- Chọn phường xã --"}
            options={xaOptions}
            onChange={onXaChange}
            loading={loadingXa}
            showSearch
            disabled={!hasTinh && xaOptions.length === 0}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item<DangTinFormValues> name="tenXa" hidden>
          <Input />
        </Form.Item>
      </Col>

      {/* 3. Đường / Phố */}
      <Col xs={24} sm={12}>
        <Form.Item label="Đường / Phố" name="duongPho">
          <Input
            size="large"
            placeholder="-- Nhập tên đường phố --"
            onChange={(e) => onAddressFieldChange("duongPho", e.target.value)}
          />
        </Form.Item>
      </Col>

      {/* 4. Số nhà / Ngõ ngách */}
      <Col xs={24} sm={12}>
        <Form.Item label="Số nhà / Ngõ ngách" name="soNha">
          <Input
            size="large"
            placeholder="Nhập số nhà, số ngõ..."
            onChange={(e) => onAddressFieldChange("soNha", e.target.value)}
          />
        </Form.Item>
      </Col>

      {/* 5. Địa chỉ chính xác */}
      <Col xs={24}>
        <Form.Item<DangTinFormValues>
          label="Địa chỉ chính xác"
          name="diaChi"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          tooltip="Địa chỉ được ghép tự động từ số nhà, đường, phường/xã, tỉnh/thành phố"
        >
          <Input
            size="large"
            placeholder="Địa chỉ hiển thị trên tin đăng"
            className="bg-gray-50 font-medium text-gray-800"
          />
        </Form.Item>
      </Col>

      {/* 6. Bản đồ nhúng trực quan (Interactive Google Maps) */}
      <Col xs={24}>
        <div className="mt-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-[#0355a2]">
                <CompassOutlined className="text-lg" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 m-0 flex items-center gap-2">
                  Bản đồ vị trí phòng trọ
                  <Tag color="success" className="text-[11px] font-semibold border-none m-0">
                    Tự động đồng bộ theo địa chỉ
                  </Tag>
                </h4>
                <p className="text-[11px] text-gray-500 m-0 mt-0.5">
                  Hiển thị vị trí thực tế trên Google Maps giúp khách thuê dễ dàng định vị và tìm đường đến xem phòng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip title="Lấy tọa độ GPS thiết bị hiện tại">
                <Button
                  size="small"
                  icon={<AimOutlined />}
                  onClick={handleGetGpsLocation}
                  loading={gettingLocation}
                  className="text-xs"
                >
                  Định vị GPS
                </Button>
              </Tooltip>
              {diaChi && (
                <Button
                  size="small"
                  type="primary"
                  icon={<ExportOutlined className="!text-white" />}
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        diaChi
                      )}`,
                      "_blank"
                    )
                  }
                  className="text-xs bg-[#0355a2] hover:bg-[#024380] !text-white font-medium shadow-xs"
                >
                  <span className="!text-white font-medium">Mở Google Maps</span>
                </Button>
              )}
            </div>
          </div>

          {/* Khung bản đồ Iframe */}
          <div className="relative w-full h-[320px] sm:h-[360px] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xs">
            <iframe
              key={mapAddress}
              title="Bản đồ phòng trọ"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl}
            />
          </div>

          {/* Hàng nhập tọa độ GPS (Tùy chọn nâng cao) */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-8">
              <Form.Item<DangTinFormValues>
                label={<span className="text-xs text-gray-600 font-semibold">Tọa độ GPS (Vĩ độ, Kinh độ)</span>}
                name="toaDo"
                className="mb-0"
                tooltip="Tọa độ giúp xác định vị trí chính xác trên bản đồ tìm kiếm và tính khoảng cách"
              >
                <Input
                  size="middle"
                  placeholder="Ví dụ: 21.028511, 105.789123"
                  className="font-mono text-xs"
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </div>
            <div className="sm:col-span-4 text-[11px] text-gray-400 italic pt-2 sm:pt-4">
              * Tọa độ sẽ được lưu cùng bài đăng phòng trọ.
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};
