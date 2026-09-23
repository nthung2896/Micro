import React from "react";
import { Form, Row, Col, Input, InputNumber, Button, message } from "antd";
import { DangTinFormValues } from "../types";
import { SAMPLE_DESCRIPTIONS, formatVietnameseCurrencyWords } from "../constants";
import RichTextEditor from "@/components/shared-components/RichTextEditor";
import { FormInstance } from "antd/lib/form";

interface ThongTinMoTaSectionProps {
  tieuDeLength: number;
  setTieuDeLength: (len: number) => void;
  giaText: string;
  setGiaText: (txt: string) => void;
  form: FormInstance<DangTinFormValues>;
}

export const ThongTinMoTaSection: React.FC<ThongTinMoTaSectionProps> = ({
  tieuDeLength,
  setTieuDeLength,
  giaText,
  setGiaText,
  form,
}) => {
  return (
    <>
      {/* Tiêu đề */}
      <Form.Item<DangTinFormValues>
        label={
          <div className="flex items-center justify-between w-full">
            <span>Tiêu đề tin đăng</span>
            <span className="text-xs text-gray-400 font-normal">
              {tieuDeLength}/120 ký tự (Tối thiểu 30 ký tự)
            </span>
          </div>
        }
        name="tieuDe"
        rules={[
          { required: true, message: "Vui lòng nhập tiêu đề tin đăng!" },
          { min: 30, message: "Tiêu đề nên có tối thiểu 30 ký tự để thu hút người thuê!" },
        ]}
      >
        <Input
          size="large"
          placeholder="VD: Cho thuê phòng trọ khép kín full đồ ban công thoáng mát tại Cầu Giấy, Hà Nội..."
          onChange={(e) => setTieuDeLength(e.target.value.length)}
          maxLength={150}
        />
      </Form.Item>

      {/* Nội dung mô tả */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="font-semibold text-gray-700 text-sm">
            Nội dung mô tả <span className="text-red-500 font-bold">(*)</span>
          </label>
          <div className="flex items-center gap-1.5">
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                form.setFieldsValue({ moTa: SAMPLE_DESCRIPTIONS.cauGiay });
                message.success("Đã chèn mẫu mô tả Cầu Giấy!");
              }}
            >
              📝 Mẫu phòng Cầu Giấy
            </Button>
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                form.setFieldsValue({ moTa: SAMPLE_DESCRIPTIONS.studio });
                message.success("Đã chèn mẫu Studio!");
              }}
            >
              🏠 Mẫu Studio cao cấp
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                form.setFieldsValue({ moTa: "" });
              }}
            >
              Xóa
            </Button>
          </div>
        </div>

        <Form.Item<DangTinFormValues>
          name="moTa"
          rules={[{ required: true, message: "Vui lòng nhập nội dung mô tả!" }]}
          noStyle
        >
          <RichTextEditor placeholder="Mô tả chi tiết về vị trí, tiện nghi, nội thất, dịch vụ, giờ giấc..." />
        </Form.Item>
      </div>

      {/* Giá thuê & Diện tích */}
      <Row gutter={16} className="mt-4">
        <Col xs={24} sm={12}>
          <Form.Item<DangTinFormValues>
            label="Giá cho thuê"
            name="giaChoThue"
            rules={[{ required: true, message: "Vui lòng nhập giá cho thuê!" }]}
            help={
              giaText ? (
                <span className="text-blue-600 font-medium text-xs italic">
                  👉 Bằng chữ: {giaText}
                </span>
              ) : undefined
            }
          >
            <InputNumber
              size="large"
              className="w-full"
              min={0}
              step={100000}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
              addonAfter="VNĐ / tháng"
              placeholder="VD: 3,500,000"
              onChange={(val) => setGiaText(formatVietnameseCurrencyWords(val as number))}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item<DangTinFormValues>
            label="Diện tích"
            name="dienTich"
            rules={[{ required: true, message: "Vui lòng nhập diện tích!" }]}
          >
            <InputNumber
              size="large"
              className="w-full"
              min={5}
              max={1000}
              addonAfter="m²"
              placeholder="VD: 25"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item<DangTinFormValues>
            label="Tiền đặt cọc"
            name="tienCoc"
            tooltip="Thường bằng 1 tháng tiền thuê phòng"
          >
            <InputNumber
              size="large"
              className="w-full"
              min={0}
              step={100000}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
              addonAfter="VNĐ"
              placeholder="VD: 3,500,000"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item<DangTinFormValues>
            label="Số người ở tối đa"
            name="soNguoiOToiDa"
          >
            <InputNumber size="large" className="w-full" min={1} max={10} addonAfter="người" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
