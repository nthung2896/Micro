"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Radio,
  DatePicker,
  message,
  Spin,
  Avatar,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  CameraOutlined,
  KeyOutlined,
  SaveOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import authService from "@/services/auth/auth.service";
import { AppUserType } from "@/types/appUser/dto";
import { ProfileUserEditRequestType } from "@/types/appUser/request";
import withAuthorization from "@/libs/authentication";
import Link from "next/link";
import { buildFileUrl } from "@/utils/file";

const TaiKhoanNguoiDungPage = () => {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "PHONE" | "PASSWORD">("PROFILE");
  const [userInfo, setUserInfo] = useState<AppUserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPhone, setSavingPhone] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);

  const [formProfile] = Form.useForm();
  const [formPhone] = Form.useForm();
  const [formPassword] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const staticFileUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9966";

  // Tải thông tin tài khoản người dùng hiện tại
  const loadUserInfo = async () => {
    try {
      setLoading(true);
      const res = await authService.getInfo();
      if (res && res.status && res.data) {
        setUserInfo(res.data);
        formProfile.setFieldsValue({
          name: res.data.name || "",
          email: res.data.email || "",
          phoneNumber: res.data.phoneNumber || "",
          gender: res.data.gender ?? 1,
          ngaySinh: res.data.ngaySinh ? dayjs(res.data.ngaySinh) : null,
          diaChi: res.data.diaChi || "",
          userName: res.data.userName || "",
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      message.error("Không thể tải thông tin tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  // Xử lý đổi ảnh đại diện
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng ảnh
    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn file hình ảnh (JPG, PNG, WEBP,...)");
      return;
    }

    // Kiểm tra kích thước (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error("Dung lượng ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await authService.updateAvatar(formData);
      if (res && res.status) {
        message.success("Cập nhật ảnh đại diện thành công!");
        await loadUserInfo();
      } else {
        message.error(res?.message || "Cập nhật ảnh đại diện thất bại.");
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật ảnh đại diện:", error);
      message.error(error?.response?.data?.message || "Lỗi khi tải ảnh đại diện lên.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Xử lý lưu thông tin cá nhân (Tab 1)
  const handleSubmitProfile = async (values: any) => {
    if (!userInfo?.id) return;
    try {
      setSavingProfile(true);
      const payload: ProfileUserEditRequestType = {
        id: userInfo.id,
        name: values.name?.trim(),
        email: values.email?.trim(),
        phoneNumber: values.phoneNumber?.trim() || userInfo.phoneNumber,
        gender: Number(values.gender ?? 1),
        ngaySinh: values.ngaySinh ? values.ngaySinh.toDate() : undefined,
        diaChi: values.diaChi?.trim(),
      };

      const res = await authService.updateInfo(payload);
      if (res && res.status) {
        message.success("Cập nhật thông tin cá nhân thành công!");
        await loadUserInfo();
      } else {
        message.error(res?.message || "Cập nhật thông tin thất bại.");
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật thông tin cá nhân:", error);
      message.error(error?.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Xử lý đổi số điện thoại (Tab 2)
  const handleSubmitPhone = async (values: any) => {
    if (!userInfo?.id) return;
    const { newPhone, confirmPhone } = values;

    if (newPhone !== confirmPhone) {
      message.error("Số điện thoại xác nhận không khớp!");
      return;
    }

    try {
      setSavingPhone(true);
      const payload: ProfileUserEditRequestType = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        phoneNumber: newPhone.trim(),
        gender: userInfo.gender ?? 1,
        ngaySinh: userInfo.ngaySinh ? new Date(userInfo.ngaySinh) : undefined,
        diaChi: userInfo.diaChi,
      };

      const res = await authService.updateInfo(payload);
      if (res && res.status) {
        message.success("Đổi số điện thoại thành công!");
        formPhone.resetFields();
        await loadUserInfo();
        setActiveTab("PROFILE");
      } else {
        message.error(res?.message || "Đổi số điện thoại thất bại.");
      }
    } catch (error: any) {
      console.error("Lỗi đổi số điện thoại:", error);
      message.error(error?.response?.data?.message || "Có lỗi xảy ra khi đổi số điện thoại.");
    } finally {
      setSavingPhone(false);
    }
  };

  // Xử lý đổi mật khẩu (Tab 3)
  const handleSubmitPassword = async (values: any) => {
    const { oldPassword, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await authService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (res && res.status) {
        message.success("Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.");
        formPassword.resetFields();
        setActiveTab("PROFILE");
      } else {
        message.error(res?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
      }
    } catch (error: any) {
      console.error("Lỗi đổi mật khẩu:", error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Mật khẩu cũ không chính xác hoặc không hợp lệ."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // Lấy đường dẫn ảnh đại diện đầy đủ (hỗ trợ MinIO và static file)
  const getAvatarUrl = () => {
    if (!userInfo?.picture) return "";
    return buildFileUrl(userInfo.picture);
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <Spin size="large" tip="Đang tải thông tin tài khoản..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-2 px-3 sm:px-6 space-y-5">
      {/* Breadcrumb & Tiêu đề trang */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/dashboard" className="hover:text-[#0355a2] flex items-center gap-1">
            <HomeOutlined /> Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Quản lý tài khoản</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Quản lý tài khoản</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Cập nhật thông tin cá nhân, số điện thoại và mật khẩu tài khoản của bạn
        </p>
      </div>

      {/* Tabs Switcher - Chuẩn phong cách Phongtro123 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs px-6 pt-3 flex items-center gap-8 overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveTab("PROFILE")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none flex items-center gap-2 ${
            activeTab === "PROFILE"
              ? "border-[#0355a2] text-[#0355a2]"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <UserOutlined /> Thông tin cá nhân
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PHONE")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none flex items-center gap-2 ${
            activeTab === "PHONE"
              ? "border-[#0355a2] text-[#0355a2]"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <PhoneOutlined /> Đổi số điện thoại
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PASSWORD")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none flex items-center gap-2 ${
            activeTab === "PASSWORD"
              ? "border-[#0355a2] text-[#0355a2]"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <KeyOutlined /> Đổi mật khẩu
        </button>
      </div>

      {/* ======================= TAB 1: THÔNG TIN CÁ NHÂN ======================= */}
      {activeTab === "PROFILE" && (
        <div className="space-y-5">
          {/* Card Khung Avatar & Header Người Dùng (Mô phỏng chuẩn Ảnh 2 Phongtro123) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 flex flex-col items-center justify-center text-center">
            {/* Input file ẩn cho đổi ảnh */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Avatar tròn lớn */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-blue-50 border-2 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {userInfo?.picture ? (
                  <img
                    src={getAvatarUrl()}
                    alt={userInfo.name || "Avatar"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/default-avatar.svg";
                    }}
                  />
                ) : (
                  <img
                    src="/images/default-avatar.svg"
                    alt="Default Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Spin size="small" />
                </div>
              )}
            </div>

            {/* Tên & Số điện thoại / Mã tài khoản */}
            <h2 className="text-lg font-bold text-gray-800 mt-3 mb-0.5">
              {userInfo?.name || userInfo?.userName || "Chưa cập nhật tên"}
            </h2>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <PhoneOutlined className="text-emerald-600" /> {userInfo?.phoneNumber || "Chưa có SĐT"}
              </span>
              <span>•</span>
              <span className="text-gray-400">Mã TK: #{userInfo?.userName || userInfo?.id?.slice(0, 8)}</span>
            </div>

            {/* Nút Đổi ảnh đại diện */}
            <div className="mt-3.5 w-full max-w-sm">
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-9 px-4 border border-gray-300 hover:border-[#0355a2] hover:text-[#0355a2] bg-white text-gray-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50"
              >
                <CameraOutlined className="text-sm" />
                {uploadingAvatar ? "Đang tải ảnh lên..." : "Đổi ảnh đại diện"}
              </button>
            </div>
          </div>

          {/* Form Thông Tin Chi Tiết (AspNetUsers Mapping) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 sm:p-8">
            <Form
              form={formProfile}
              layout="vertical"
              onFinish={handleSubmitProfile}
              requiredMark={false}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                {/* Số điện thoại (kèm nút đổi số nhanh) */}
                <div className="md:col-span-2">
                  <Form.Item
                    label={
                      <span className="text-xs font-bold text-gray-700">
                        Số điện thoại
                      </span>
                    }
                    name="phoneNumber"
                  >
                    <Input
                      disabled
                      size="large"
                      prefix={<PhoneOutlined className="text-gray-400 mr-1" />}
                      className="bg-gray-50/70 border-gray-200 text-gray-700 font-medium"
                      addonAfter={
                        <button
                          type="button"
                          onClick={() => setActiveTab("PHONE")}
                          className="text-xs text-[#0066cc] hover:text-[#0052a3] font-semibold cursor-pointer border-none bg-transparent"
                        >
                          Đổi số điện thoại
                        </button>
                      }
                    />
                  </Form.Item>
                </div>

                {/* Tên liên hệ (Họ và tên) */}
                <div className="md:col-span-2">
                  <Form.Item
                    label={
                      <span className="text-xs font-bold text-gray-700">
                        Tên liên hệ (Họ và tên) <span className="text-red-500">*</span>
                      </span>
                    }
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên liên hệ" }]}
                  >
                    <Input
                      size="large"
                      placeholder="Ví dụ: Nguyễn Văn Hưng"
                      prefix={<UserOutlined className="text-gray-400 mr-1" />}
                      className="rounded-lg border-gray-300 hover:border-[#0355a2] focus:border-[#0355a2]"
                    />
                  </Form.Item>
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <Form.Item
                    label={
                      <span className="text-xs font-bold text-gray-700">
                        Email liên hệ
                      </span>
                    }
                    name="email"
                    rules={[
                      { type: "email", message: "Email không đúng định dạng" },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="example@gmail.com"
                      prefix={<MailOutlined className="text-gray-400 mr-1" />}
                      className="rounded-lg border-gray-300 hover:border-[#0355a2] focus:border-[#0355a2]"
                    />
                  </Form.Item>
                </div>

                {/* Giới tính */}
                <div>
                  <Form.Item
                    label={
                      <span className="text-xs font-bold text-gray-700">
                        Giới tính
                      </span>
                    }
                    name="gender"
                  >
                    <Radio.Group className="w-full flex items-center gap-4 pt-1">
                      <Radio value={1}>Nam</Radio>
                      <Radio value={2}>Nữ</Radio>
                      <Radio value={0}>Khác</Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>

                {/* Ngày sinh */}
                <div>
                  <Form.Item
                    label={
                      <span className="text-xs font-bold text-gray-700">
                        Ngày sinh
                      </span>
                    }
                    name="ngaySinh"
                  >
                    <DatePicker
                      size="large"
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày sinh"
                      className="w-full rounded-lg border-gray-300"
                    />
                  </Form.Item>
                </div>

                {/* Địa chỉ */}
                <div className="md:col-span-2">
                  <Form.Item
                    label={
                      <span className="text-xs font-bold text-gray-700">
                        Địa chỉ
                      </span>
                    }
                    name="diaChi"
                  >
                    <Input
                      size="large"
                      placeholder="Số nhà, đường phố, phường/xã, quận/huyện..."
                      prefix={<EnvironmentOutlined className="text-gray-400 mr-1" />}
                      className="rounded-lg border-gray-300 hover:border-[#0355a2] focus:border-[#0355a2]"
                    />
                  </Form.Item>
                </div>

                {/* Tên đăng nhập (Chỉ đọc) */}
                <div className="md:col-span-2">
                  <Form.Item
                    label={
                      <span className="text-xs font-bold text-gray-700">
                        Tên đăng nhập hệ thống
                      </span>
                    }
                    name="userName"
                  >
                    <Input
                      disabled
                      size="large"
                      prefix={<LockOutlined className="text-gray-400 mr-1" />}
                      className="bg-gray-50 border-gray-200 text-gray-500 font-mono"
                    />
                  </Form.Item>
                </div>

                {/* Mật khẩu (Dạng giả lập + nút Đổi mật khẩu) */}
                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">
                      Mật khẩu
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("PASSWORD")}
                      className="text-xs text-[#0355a2] hover:underline font-semibold cursor-pointer border-none bg-transparent"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                  <Input
                    disabled
                    size="large"
                    type="password"
                    value="••••••••••••"
                    prefix={<LockOutlined className="text-gray-400 mr-1" />}
                    className="bg-gray-50 border-gray-200 text-gray-500 tracking-widest font-mono"
                  />
                </div>
              </div>

              {/* Nút lưu thay đổi */}
              <div className="pt-4 border-t border-gray-100 mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={savingProfile}
                  icon={<SaveOutlined />}
                  className="w-full sm:w-auto px-8 bg-[#0355a2] hover:bg-[#02478a] border-none font-semibold rounded-lg shadow-sm"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: ĐỔI SỐ ĐIỆN THOẠI ======================= */}
      {activeTab === "PHONE" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 sm:p-8 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0355a2] flex items-center justify-center mx-auto mb-2 text-xl">
              <PhoneOutlined />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Thay đổi số điện thoại</h2>
            <p className="text-xs text-gray-500 mt-1">
              Số điện thoại này sẽ dùng để người thuê phòng trọ liên hệ với bạn.
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 mb-5 text-xs text-blue-900 flex items-start gap-2">
            <InfoCircleOutlined className="text-[#0355a2] mt-0.5 shrink-0" />
            <span>
              Số điện thoại hiện tại của bạn:{" "}
              <strong className="text-gray-900 font-bold">{userInfo?.phoneNumber || "Chưa thiết lập"}</strong>
            </span>
          </div>

          <Form
            form={formPhone}
            layout="vertical"
            onFinish={handleSubmitPhone}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-xs font-bold text-gray-700">Số điện thoại mới</span>}
              name="newPhone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại mới" },
                {
                  pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                  message: "Số điện thoại không hợp lệ (gồm 10 số bắt đầu bằng 03, 05, 07, 08, 09)",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Ví dụ: 0987654321"
                prefix={<PhoneOutlined className="text-gray-400 mr-1" />}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-gray-700">Xác nhận số điện thoại mới</span>}
              name="confirmPhone"
              rules={[
                { required: true, message: "Vui lòng nhập lại số điện thoại mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPhone") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Số điện thoại nhập lại không khớp!"));
                  },
                }),
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập lại số điện thoại mới"
                prefix={<PhoneOutlined className="text-gray-400 mr-1" />}
                className="rounded-lg"
              />
            </Form.Item>

            <div className="pt-2 flex gap-3">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={savingPhone}
                className="flex-1 bg-[#0355a2] hover:bg-[#02478a] border-none font-semibold rounded-lg"
              >
                Cập nhật số điện thoại
              </Button>
              <Button
                size="large"
                onClick={() => setActiveTab("PROFILE")}
                className="rounded-lg"
              >
                Hủy
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* ======================= TAB 3: ĐỔI MẬT KHẨU ======================= */}
      {activeTab === "PASSWORD" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 sm:p-8 max-w-xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0066cc] flex items-center justify-center mx-auto mb-2 text-xl">
              <SafetyOutlined />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Đổi mật khẩu tài khoản</h2>
            <p className="text-xs text-gray-500 mt-1">
              Định kỳ đổi mật khẩu giúp bảo mật an toàn cho tài khoản và tin đăng của bạn.
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 mb-5 text-xs text-blue-900 flex items-start gap-2">
            <InfoCircleOutlined className="text-blue-600 mt-0.5 shrink-0" />
            <span>Mật khẩu mới phải có ít nhất 6 ký tự để đảm bảo tính an toàn.</span>
          </div>

          <Form
            form={formPassword}
            layout="vertical"
            onFinish={handleSubmitPassword}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-xs font-bold text-gray-700">Mật khẩu hiện tại (Cũ)</span>}
              name="oldPassword"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu hiện tại"
                prefix={<LockOutlined className="text-gray-400 mr-1" />}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-gray-700">Mật khẩu mới</span>}
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu mới phải từ 6 ký tự trở lên" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập mật khẩu mới"
                prefix={<KeyOutlined className="text-gray-400 mr-1" />}
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-gray-700">Xác nhận mật khẩu mới</span>}
              name="confirmPassword"
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không trùng khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Nhập lại mật khẩu mới"
                prefix={<KeyOutlined className="text-gray-400 mr-1" />}
                className="rounded-lg"
              />
            </Form.Item>

            <div className="pt-2 flex gap-3">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={savingPassword}
                className="flex-1 bg-[#0355a2] hover:bg-[#02478a] border-none font-semibold rounded-lg"
              >
                Cập nhật mật khẩu
              </Button>
              <Button
                size="large"
                onClick={() => setActiveTab("PROFILE")}
                className="rounded-lg"
              >
                Hủy
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
};

export default withAuthorization(TaiKhoanNguoiDungPage, "");
