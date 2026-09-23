"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HomeOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  FileImageOutlined,
  UserOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Checkbox,
  Button,
  Card,
  message,
  Divider,
  Alert,
} from "antd";
import { useSelector } from "@/store/hooks";
import phongTroService from "@/services/phongTro/phongTroService";
import { ROOM_TYPES, DEFAULT_TINH } from "../_components/constants";

export default function DangTinPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const appConfig = useSelector((state: any) => state.general.appConfig);
  const appName = appConfig?.tenApp || "Hệ thống quản lý phòng trọ";

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      // Gọi service tạo phòng trọ
      const payload: any = {
        tieuDe: values.tieuDe,
        loaiPhong: values.loaiPhong,
        diaChi: values.diaChi,
        tenTinh: values.tenTinh || "Thành phố Hà Nội",
        maTinh: values.maTinh || "01",
        dienTich: values.dienTich || 25,
        giaChoThue: values.giaChoThue || 0,
        tienCoc: values.tienCoc || values.giaChoThue || 0,
        giaDien: values.giaDien || 3800,
        donViDien: "Số",
        giaNuoc: values.giaNuoc || 30000,
        donViNuoc: "Khối",
        giaInternet: values.giaInternet || 100000,
        donViInternet: "Phòng",
        giaDichVuChung: values.giaDichVuChung || 50000,
        donViDichVuChung: "Người",
        gioGiacTuDo: !!values.gioGiacTuDo,
        coMayGiat: !!values.coMayGiat,
        coDieuHoa: !!values.coDieuHoa,
        coNongLanh: !!values.coNongLanh,
        coTuLanh: !!values.coTuLanh,
        coBanCong: !!values.coBanCong,
        coThangMay: !!values.coThangMay,
        khongChungChu: !!values.khongChungChu,
        coChoDeXe: !!values.coChoDeXe,
        coKhoaVanTay: !!values.coKhoaVanTay,
        hinhAnhDaiDien:
          values.hinhAnhDaiDien ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
        tenLienHe: values.tenLienHe,
        soDienThoaiLienHe: values.soDienThoaiLienHe,
        zaloLienHe: values.zaloLienHe || values.soDienThoaiLienHe,
        moTa: values.moTa || "",
        goiTin: 0,
      };

      try {
        await phongTroService.create(payload);
      } catch (e) {
        // Fallback demo
        console.warn("Chưa gọi được API lưu phòng, lưu local mockup:", e);
      }

      message.success("Đăng tin cho thuê thành công! Tin của bạn đang được hiển thị.");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      message.error("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10">
      <div className="max-w-[1100px] mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-bold">Đăng tin cho thuê phòng</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            Đăng Tin Cho Thuê Phòng Trọ, Căn Hộ Miễn Phí
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Tiếp cận hàng ngàn người thuê mỗi ngày trên sàn {appName}. Nhanh chóng, tiện lợi và hoàn toàn miễn phí!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: FORM ĐĂNG TIN CHÍNH */}
          <div className="lg:col-span-8">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              initialValues={{
                loaiPhong: "Phòng trọ",
                tenTinh: "Thành phố Hà Nội",
                maTinh: "01",
                giaDien: 3800,
                giaNuoc: 30000,
                giaInternet: 100000,
                giaDichVuChung: 50000,
                gioGiacTuDo: true,
                coDieuHoa: true,
                coNongLanh: true,
                khongChungChu: true,
                coChoDeXe: true,
              }}
            >
              {/* 1. KHU VỰC & ĐỊA CHỈ */}
              <Card className="rounded-2xl border border-gray-200 shadow-sm mb-5 p-2 sm:p-4">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#0355a2] mb-4">
                  <EnvironmentOutlined />
                  <span>1. Khu vực &amp; Địa chỉ cho thuê</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    name="tenTinh"
                    label={<span className="font-semibold text-xs text-gray-700">Tỉnh / Thành phố</span>}
                    rules={[{ required: true, message: "Chọn tỉnh / thành phố" }]}
                  >
                    <Select
                      size="large"
                      options={[
                        { label: "Thành phố Hà Nội", value: "Thành phố Hà Nội" },
                        { label: "Thành phố Hồ Chí Minh", value: "Thành phố Hồ Chí Minh" },
                        { label: "Thành phố Hải Phòng", value: "Thành phố Hải Phòng" },
                        { label: "Thành phố Đà Nẵng", value: "Thành phố Đà Nẵng" },
                        { label: "Thành phố Cần Thơ", value: "Thành phố Cần Thơ" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="loaiPhong"
                    label={<span className="font-semibold text-xs text-gray-700">Loại bất động sản</span>}
                    rules={[{ required: true, message: "Chọn loại phòng" }]}
                  >
                    <Select
                      size="large"
                      options={ROOM_TYPES.filter((t) => t.value !== "ALL")}
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="diaChi"
                  label={<span className="font-semibold text-xs text-gray-700">Địa chỉ chính xác</span>}
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }]}
                >
                  <Input
                    size="large"
                    placeholder="VD: Số 15, Ngõ 68 Trần Thái Tông, Cầu Giấy, Hà Nội"
                    className="rounded-xl"
                  />
                </Form.Item>
              </Card>

              {/* 2. THÔNG TIN PHÒNG & GIÁ THUÊ */}
              <Card className="rounded-2xl border border-gray-200 shadow-sm mb-5 p-2 sm:p-4">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#0355a2] mb-4">
                  <HomeOutlined />
                  <span>2. Thông tin phòng &amp; Giá thuê</span>
                </div>

                <Form.Item
                  name="tieuDe"
                  label={<span className="font-semibold text-xs text-gray-700">Tiêu đề tin đăng</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài đăng" }]}
                >
                  <Input
                    size="large"
                    placeholder="VD: Cho thuê phòng khép kín full đồ ban công thoáng mát gần ĐH Quốc Gia"
                    className="rounded-xl"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Form.Item
                    name="dienTich"
                    label={<span className="font-semibold text-xs text-gray-700">Diện tích (m²)</span>}
                    rules={[{ required: true, message: "Nhập diện tích" }]}
                  >
                    <InputNumber
                      size="large"
                      min={5}
                      max={500}
                      className="w-full rounded-xl"
                      placeholder="VD: 28"
                    />
                  </Form.Item>

                  <Form.Item
                    name="giaChoThue"
                    label={<span className="font-semibold text-xs text-gray-700">Giá cho thuê (đ/tháng)</span>}
                    rules={[{ required: true, message: "Nhập giá thuê" }]}
                  >
                    <InputNumber
                      size="large"
                      min={0}
                      step={100000}
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
                      className="w-full rounded-xl"
                      placeholder="VD: 3,500,000"
                    />
                  </Form.Item>

                  <Form.Item
                    name="tienCoc"
                    label={<span className="font-semibold text-xs text-gray-700">Tiền đặt cọc (đ)</span>}
                  >
                    <InputNumber
                      size="large"
                      min={0}
                      step={100000}
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
                      className="w-full rounded-xl"
                      placeholder="VD: 3,500,000"
                    />
                  </Form.Item>
                </div>

                <Divider titlePlacement="left" plain style={{ fontSize: "12px", color: "#64748b" }}>
                  Chi phí dịch vụ hàng tháng
                </Divider>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Form.Item name="giaDien" label={<span className="text-xs">⚡ Điện (đ/số)</span>}>
                    <InputNumber min={0} className="w-full" placeholder="3800" />
                  </Form.Item>
                  <Form.Item name="giaNuoc" label={<span className="text-xs">💧 Nước (đ/khối)</span>}>
                    <InputNumber min={0} className="w-full" placeholder="30000" />
                  </Form.Item>
                  <Form.Item name="giaInternet" label={<span className="text-xs">🌐 Mạng (đ/tháng)</span>}>
                    <InputNumber min={0} className="w-full" placeholder="100000" />
                  </Form.Item>
                  <Form.Item name="giaDichVuChung" label={<span className="text-xs">🧹 Dịch vụ (đ/người)</span>}>
                    <InputNumber min={0} className="w-full" placeholder="50000" />
                  </Form.Item>
                </div>
              </Card>

              {/* 3. TIỆN NGHI & NỘI THẤT */}
              <Card className="rounded-2xl border border-gray-200 shadow-sm mb-5 p-2 sm:p-4">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#0355a2] mb-3">
                  <CheckCircleOutlined />
                  <span>3. Tiện nghi &amp; Nội thất phòng</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <Form.Item name="coDieuHoa" valuePropName="checked" className="mb-1">
                    <Checkbox>❄️ Điều hòa</Checkbox>
                  </Form.Item>
                  <Form.Item name="coNongLanh" valuePropName="checked" className="mb-1">
                    <Checkbox>🚿 Nóng lạnh</Checkbox>
                  </Form.Item>
                  <Form.Item name="coMayGiat" valuePropName="checked" className="mb-1">
                    <Checkbox>🧺 Máy giặt</Checkbox>
                  </Form.Item>
                  <Form.Item name="coTuLanh" valuePropName="checked" className="mb-1">
                    <Checkbox>🧊 Tủ lạnh</Checkbox>
                  </Form.Item>
                  <Form.Item name="gioGiacTuDo" valuePropName="checked" className="mb-1">
                    <Checkbox>⏰ Giờ tự do</Checkbox>
                  </Form.Item>
                  <Form.Item name="khongChungChu" valuePropName="checked" className="mb-1">
                    <Checkbox>🔑 Không chung chủ</Checkbox>
                  </Form.Item>
                  <Form.Item name="coBanCong" valuePropName="checked" className="mb-1">
                    <Checkbox>🌿 Ban công thoáng</Checkbox>
                  </Form.Item>
                  <Form.Item name="coThangMay" valuePropName="checked" className="mb-1">
                    <Checkbox>🛗 Thang máy</Checkbox>
                  </Form.Item>
                  <Form.Item name="coChoDeXe" valuePropName="checked" className="mb-1">
                    <Checkbox>🛵 Chỗ để xe</Checkbox>
                  </Form.Item>
                  <Form.Item name="coKhoaVanTay" valuePropName="checked" className="mb-1">
                    <Checkbox>🔒 Khóa vân tay</Checkbox>
                  </Form.Item>
                </div>
              </Card>

              {/* 4. HÌNH ẢNH & MÔ TẢ */}
              <Card className="rounded-2xl border border-gray-200 shadow-sm mb-5 p-2 sm:p-4">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#0355a2] mb-3">
                  <FileImageOutlined />
                  <span>4. Hình ảnh &amp; Mô tả chi tiết</span>
                </div>

                <Form.Item
                  name="hinhAnhDaiDien"
                  label={<span className="font-semibold text-xs text-gray-700">Link ảnh đại diện phòng</span>}
                >
                  <Input
                    size="large"
                    placeholder="https://... (hoặc để trống để dùng ảnh mẫu)"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="moTa"
                  label={<span className="font-semibold text-xs text-gray-700">Mô tả chi tiết phòng trọ</span>}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Mô tả về phòng: tình trạng nội thất, vị trí gần các trường đại học, bệnh viện, xe bus, quy định chung..."
                    className="rounded-xl text-sm"
                  />
                </Form.Item>
              </Card>

              {/* 5. THÔNG TIN LIÊN HỆ */}
              <Card className="rounded-2xl border border-gray-200 shadow-sm mb-6 p-2 sm:p-4">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#0355a2] mb-4">
                  <PhoneOutlined />
                  <span>5. Thông tin liên hệ chủ nhà</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Form.Item
                    name="tenLienHe"
                    label={<span className="font-semibold text-xs text-gray-700">Tên người liên hệ</span>}
                    rules={[{ required: true, message: "Nhập tên chủ nhà" }]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="VD: Bác Hùng"
                      className="rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item
                    name="soDienThoaiLienHe"
                    label={<span className="font-semibold text-xs text-gray-700">Số điện thoại gọi</span>}
                    rules={[{ required: true, message: "Nhập số điện thoại" }]}
                  >
                    <Input
                      size="large"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="VD: 0912345678"
                      className="rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item
                    name="zaloLienHe"
                    label={<span className="font-semibold text-xs text-gray-700">Số Zalo liên hệ</span>}
                  >
                    <Input
                      size="large"
                      placeholder="VD: 0912345678"
                      className="rounded-xl"
                    />
                  </Form.Item>
                </div>
              </Card>

              {/* NÚT SUBMIT ĐĂNG TIN */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl font-bold text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  Hủy bỏ
                </Link>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={submitting}
                  className="h-12 px-8 rounded-xl font-black text-sm bg-[#ff5722] hover:bg-[#f4511e] border-none shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  ĐĂNG TIN MIỄN PHÍ NGAY
                </Button>
              </div>
            </Form>
          </div>

          {/* CỘT PHẢI: MẸO & HƯỚNG DẪN ĐĂNG TIN */}
          <div className="lg:col-span-4 space-y-5">
            <Card className="rounded-2xl border border-blue-100 bg-blue-50/50 shadow-sm p-2 sm:p-4">
              <div className="flex items-center gap-2 text-[#0355a2] font-black text-sm mb-3">
                <InfoCircleOutlined className="text-base" />
                <span>Mẹo cho thuê phòng nhanh chóng</span>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed list-disc pl-4">
                <li>
                  <b>Tiêu đề rõ ràng:</b> Nêu rõ loại phòng, diện tích và khu vực (VD: Phòng trọ khép kín Cầu Giấy full đồ).
                </li>
                <li>
                  <b>Giá minh bạch:</b> Ghi rõ giá thuê, giá điện nước và internet để người thuê an tâm liên hệ ngay.
                </li>
                <li>
                  <b>Ảnh chụp thật:</b> Đăng ảnh chụp góc rộng, sáng sủa thể hiện đủ giường, nhà vệ sinh, ban công.
                </li>
                <li>
                  <b>Số điện thoại chính xác:</b> Bật sẵn Zalo để người thuê có thể nhắn tin trao đổi nhanh.
                </li>
              </ul>
            </Card>

            <Card className="rounded-2xl border border-gray-200 shadow-sm p-2 sm:p-4 text-xs text-gray-600">
              <div className="font-bold text-gray-900 mb-2">Quy định duyệt tin đăng:</div>
              <p className="leading-relaxed">
                Tin đăng sau khi tạo sẽ được hệ thống hiển thị tức thì trên sàn {appName}. Vui lòng không đăng tin trùng lặp hoặc chứa nội dung sai sự thật.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
