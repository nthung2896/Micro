"use client";
import React, { useEffect, useState } from "react";
import {
  Form,
  FormProps,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Modal,
} from "antd";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileUploader from "@/components/upload-file/FileUploader";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import {
  RedoOutlined,
  CheckCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import tinhService from "@/services/tinh/tinh.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import phanAnhNenTangService from "@/services/phanAnhNenTang/phanAnhNenTang.service";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import dayjs from "dayjs";
import Link from "next/link";
import { Dictionary, DropdownOption } from "@/types/general";

const { TextArea } = Input;

// Hàm sinh GUID ngẫu nhiên cho ItemId liên kết tài liệu đính kèm
const generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function GuiPhanAnhPage() {
  const [form] = Form.useForm();
  const [dropdowns, setDropdowns] = useState<Dictionary<DropdownOption[]>>({});
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Quản lý file upload
  const [formItemId] = useState<string>(() => generateGuid());
  const [cccdFile, setCccdFile] = useState<TaiLieuDinhKemType | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const docUploader = FileUploader.useFileUploader({
    maxCount: 10,
    category: "PhanAnhNenTang",
    itemId: formItemId,
    FileType: "TepDinhKem",
  });

  // Captcha state
  const [captchaId, setCaptchaId] = useState<string>("");
  const [captchaSvg, setCaptchaSvg] = useState<string>("");
  const [captchaInput, setCaptchaInput] = useState<string>("");

  const loadCaptcha = async () => {
    try {
      const res = await phanAnhNenTangService.getCaptcha();
      if (res && res.status) {
        setCaptchaId(res.data.captchaId);
        setCaptchaSvg(res.data.captchaSvg);
        setCaptchaInput("");
        form.setFieldsValue({ captcha: "" });
      }
    } catch (e) {
      console.error("Lỗi khi load captcha", e);
    }
  };

  useEffect(() => {
    loadCaptcha();

    const fetchDropdowns = async () => {
      setLoadingDropdown(true);
      try {
        const res = await phanAnhNenTangService.getDropdowns();
        if (res.status) {
          setDropdowns(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDropdown(false);
      }
    };

    fetchDropdowns();
  }, []);

  const refreshCaptcha = () => {
    loadCaptcha();
  };



  const onFinish: FormProps["onFinish"] = async (values) => {
    if (!uploadedImageUrl) {
      message.error("Vui lòng tải lên ảnh CMND/CCCD/Passport!");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        ...values,
        id: formItemId, // Sử dụng ItemId chung để liên kết các tài liệu đã upload
        isCVTao: false, // Người dân tạo ở Portal
        ngaySinh: values.ngaySinh ? dayjs(values.ngaySinh).format("YYYY-MM-DDTHH:mm:ss") : undefined,
        ngayCap: values.ngayCap ? dayjs(values.ngayCap).format("YYYY-MM-DDTHH:mm:ss") : undefined,
        trangThai: 0, // Mới tiếp nhận
        tepDinhKem: docUploader.files.map((f) => f.tenTaiLieu).join(", "),
        captchaId: captchaId,
        captchaInput: captchaInput,
      };

      const res = await phanAnhNenTangService.create(submitData);
      if (res && res.status) {
        setIsSubmittedSuccess(true);
        form.resetFields();
        setCccdFile(null);
        setUploadedImageUrl("");
        docUploader.resetFiles();
        setCaptchaInput("");
        loadCaptcha();
      } else {
        message.error(res.message || "Gửi phản ánh thất bại, vui lòng kiểm tra lại!");
        loadCaptcha();
      }
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi khi gửi dữ liệu!");
      loadCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className="bg-white min-h-[50vh] py-12 px-4 md:px-8 flex flex-col items-center justify-center">
        <div className="max-w-[550px] w-full text-center border border-gray-200/80 shadow-2xl p-8 md:p-10 rounded-2xl bg-white">
          <div className="bg-green-50 text-green-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100">
            <CheckCircleOutlined className="text-6xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4 uppercase tracking-wide">
            Gửi phản ánh thành công!
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
            Hệ thống đã tiếp nhận thông tin phản ánh của bạn. Chúng tôi sẽ tiến hành kiểm tra, xác minh và xử lý thông tin trong thời gian sớm nhất. Xin chân thành cảm ơn sự cộng tác của bạn!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button
                type="primary"
                size="large"
                style={{ backgroundColor: "#0143DF", borderColor: "#0143DF", color: "#fff" }}
                className="hover:bg-[#0136B5] px-8 rounded font-semibold text-sm h-11 border-0 w-full flex items-center justify-center shadow-md"
              >
                Trở về trang chủ
              </Button>
            </Link>
            <Button
              size="large"
              onClick={() => {
                setIsSubmittedSuccess(false);
                form.resetFields();
                setCccdFile(null);
                setUploadedImageUrl("");
                docUploader.resetFiles();
                setCaptchaInput("");
                loadCaptcha();
              }}
              style={{ color: "#0143DF", borderColor: "#0143DF" }}
              className="hover:bg-[#f0f4ff] hover:text-[#0143DF] px-8 rounded font-semibold text-sm h-11 w-full sm:w-auto shadow-sm"
            >
              Gửi phản ánh khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-[#0143DF] border-b border-gray-200 pb-3 mb-6 uppercase tracking-wide">
          PHẢN ÁNH, KHIẾN NGHỊ, KHIẾU NẠI ỨNG DỤNG
        </h1>

        <Form
          form={form}
          layout="horizontal"
          onFinish={onFinish}
          autoComplete="off"
          labelAlign="left"
          colon={false}
          className="portal-phan-anh-form"
        >
          <Row gutter={48}>
            {/* CỘT 1: THÔNG TIN NGƯỜI PHẢN ÁNH */}
            <Col xs={24} md={12}>
              <h2 className="text-[#0143DF] font-semibold text-base mb-4 tracking-wide">
                1. Thông tin người phản ánh
              </h2>

              <Form.Item
                label="Họ tên"
                name="hoTen"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input placeholder="Họ tên" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không đúng định dạng!" }
                ]}
              >
                <Input placeholder="Địa chỉ email" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Ngày sinh"
                name="ngaySinh"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  format="DD/MM/YYYY"
                  className="rounded border-gray-300 h-9"
                />
              </Form.Item>

              <Form.Item
                label="Số CCCD/Passport"
                name="soCCCD"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[
                  { required: true, message: "Vui lòng nhập số CCCD/Passport!" },
                  { min: 8, message: "Số CCCD/Passport không hợp lệ!" },
                  { max: 12, message: "Số CCCD/Passport không hợp lệ!" }
                ]}
              >
                <Input placeholder="Số CCCD/Passport" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Ảnh CCCD/Passport"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                required
              >
                <SingleFileUploader
                  value={cccdFile}
                  onChange={(f) => {
                    setCccdFile(f);
                    setUploadedImageUrl(f ? f.duongDanFile : "");
                  }}
                  category="PhanAnhNenTang"
                  itemId={formItemId}
                  loaiTaiLieu="AnhCCCD"
                  accept=".png,.jpg,.jpeg"
                  typeBtn="primary"
                  uploadLabel="Tải lên tài liệu"
                  size="middle"
                />
              </Form.Item>

              <Form.Item
                label="Ngày cấp"
                name="ngayCap"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng chọn ngày cấp!" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày cấp"
                  format="DD/MM/YYYY"
                  className="rounded border-gray-300 h-9"
                />
              </Form.Item>

              <Form.Item
                label="Nơi cấp"
                name="noiCap"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng nhập nơi cấp!" }]}
              >
                <Input placeholder="Nơi cấp" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ thường trú"
                name="diaChiThuongTru"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ thường trú!" }]}
              >
                <Input placeholder="Địa chỉ thường trú" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Điện thoại"
                name="soDienThoai"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ!" }
                ]}
              >
                <Input placeholder="Điện thoại" className="rounded border-gray-300 h-9" />
              </Form.Item>
            </Col>

            {/* CỘT 2: THÔNG TIN ỨNG DỤNG PHẢN ÁNH */}
            <Col xs={24} md={12}>
              <h2 className="text-[#0143DF] font-semibold text-base mb-4 tracking-wide">
                2. Thông tin nền tảng phản ánh
              </h2>

              <Form.Item
                label="Loại phản ánh"
                name="loaiPhanAnhId"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
              >
                <Select
                  placeholder="--Chọn loại phản ánh--"
                  loading={loadingDropdown}
                  options={dropdowns['LoaiPhanAnh']}
                  className="rounded h-9"
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label="Tên nền tảng"
                name="tenNenTang"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng nhập tên nền tảng!" }]}
              >
                <Input placeholder="Tên nền tảng" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ nền tảng"
                name="diaChiNenTang"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ nền tảng!" }]}
              >
                <Input placeholder="Địa chỉ nền tảng (URL trang web hoặc tên miền)" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Tên ứng dụng"
                name="tenUngDung"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
              >
                <Input placeholder="Tên ứng dụng" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Liên kết tải ứng dụng"
                name="lienKetTaiUngDung"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
              >
                <Input placeholder="Liên kết tải ứng dụng" className="rounded border-gray-300 h-9" />
              </Form.Item>

              <Form.Item
                label="Tỉnh/Thành phố"
                name="maTinh"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" }]}

              >
                <Select
                  placeholder="--Chọn tỉnh thành--"
                  options={dropdowns['Tinh']}
                  showSearch
                  optionFilterProp="label"
                  className="rounded h-9"
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label="Nội dung phản ánh"
                name="noiDungPhanAnh"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung phản ánh!" },
                  { min: 10, message: "Nội dung phản ánh quá ngắn!" }
                ]}
              >
                <TextArea
                  rows={2}
                  placeholder="Nội dung phản ánh"
                  className="rounded border-gray-300"
                />
              </Form.Item>

              <Form.Item
                label="Tệp đính kèm"
                name="tepDinhKem"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
              >
                <FileUploader
                  controller={docUploader}
                  typeBtn="primary"
                  uploadLabel="Tải lên tài liệu"
                  size="middle"
                />
              </Form.Item>

              {/* CAPTCHA SECTION */}
              <Form.Item
                label="Nhập mã xác nhận"
                name="captcha"
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                rules={[{ required: true, message: "Vui lòng nhập mã xác nhận!" }]}
                extra={
                  <div className="flex items-center gap-3 mt-3">
                    {captchaSvg ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: captchaSvg }}
                        onClick={loadCaptcha}
                        style={{ cursor: "pointer" }}
                        title="Nhấp vào để đổi mã xác nhận"
                      />
                    ) : (
                      <div className="w-[180px] h-[50px] bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded border border-dashed">
                        Đang tải mã...
                      </div>
                    )}
                    <Button
                      icon={<RedoOutlined className="text-gray-600" />}
                      onClick={refreshCaptcha}
                      type="text"
                      className="flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 h-9 w-9"
                      title="Đổi mã xác nhận"
                    />
                  </div>
                }
              >
                <Input
                  placeholder="Mã xác nhận"
                  className="rounded border-gray-300 h-9"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row className="mt-8">
            <Col xs={24} className="text-center">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={submitting}
                icon={<SendOutlined />}
                style={{ backgroundColor: "#0143DF", borderColor: "#0143DF" }}
                className="hover:bg-[#0136B5] px-8 py-2 rounded font-semibold text-sm h-10 border-0"
              >
                Gửi phản ánh
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
