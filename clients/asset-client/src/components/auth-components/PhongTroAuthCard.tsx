"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GiftOutlined,
  QuestionCircleOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Form, Input, Radio, Button, message, Alert } from "antd";
import { useDispatch, useSelector } from "@/store/hooks";
import { setLogin } from "@/store/auth/AuthSlice";
import authService from "@/services/auth/auth.service";
import { LoginViewModelType } from "@/types/appUser/request";

interface PhongTroAuthCardProps {
  initialTab?: "login" | "register";
}

export default function PhongTroAuthCard({
  initialTab = "register",
}: PhongTroAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [registerForm] = Form.useForm();
  const [loginForm] = Form.useForm();

  const appConfig = useSelector((state: any) => state.general.appConfig);
  const appName = appConfig?.tenApp || "Hệ thống quản lý phòng trọ";

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "login" || tabParam === "register") {
      setActiveTab(tabParam);
    } else {
      setActiveTab(initialTab);
    }
  }, [searchParams, initialTab]);

  // Xử lý Đăng ký
  const handleRegister = async (values: any) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const registerPayload = {
        fullName: values.fullName?.trim(),
        phoneNumber: values.phone?.trim(),
        password: values.password,
        accountType: values.accountType || "tim-kiem",
        referralPhone: values.referralPhone?.trim(),
      };

      const res = await authService.register(registerPayload);
      if (res && res.status) {
        message.success(
          "Đăng ký tài khoản thành công! Bạn đã nhận được 1 tin đăng miễn phí (thời hạn 60 ngày).",
          4
        );

        // Tự động đăng nhập luôn với token trả về hoặc chuyển sang tab login
        if (res.data?.token) {
          dispatch(setLogin(res));
          const redirectUrl = localStorage.getItem("redirect_url");
          if (redirectUrl) {
            localStorage.removeItem("redirect_url");
            router.push(redirectUrl);
          } else {
            router.push("/");
          }
          return;
        }

        // Fallback: Chuyển sang tab đăng nhập với số điện thoại điền sẵn
        loginForm.setFieldsValue({
          username: values.phone?.trim() || values.fullName,
        });
        setActiveTab("login");
      } else {
        setErrorMessage(
          res?.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!"
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          (typeof err === "string" ? err : err?.message) ||
          "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Đăng nhập
  const handleLogin = async (values: any) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const loginPayload: LoginViewModelType = {
        userName: values.username?.trim(),
        password: values.password,
      };

      try {
        const data = await authService.login(loginPayload);
        if (data != null && data.status) {
          dispatch(setLogin(data));
          message.success("Đăng nhập thành công!");
          const redirectUrl = localStorage.getItem("redirect_url");
          if (redirectUrl) {
            localStorage.removeItem("redirect_url");
            router.push(redirectUrl);
          } else {
            router.push("/");
          }
          return;
        } else {
          setErrorMessage(data?.message || "Tài khoản hoặc mật khẩu không chính xác.");
        }
      } catch (apiErr: any) {
        // Mock fallback nếu backend chưa cấu hình người dùng này
        setErrorMessage(
          apiErr?.response?.data?.message ||
            "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."
        );
      }
    } catch (err: any) {
      setErrorMessage("Đã có lỗi xảy ra trong quá trình đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full py-8 sm:py-12 px-4 flex justify-center items-center bg-[#fbf9f6] flex-1 min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8">
        {/* Tabs: Đăng nhập | Tạo tài khoản mới */}
        <div className="flex border-b border-gray-100 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("login");
              setErrorMessage("");
            }}
            className={`flex-1 pb-3 text-center text-lg sm:text-xl font-bold transition-all relative cursor-pointer ${
              activeTab === "login"
                ? "text-gray-900 border-b-2 border-[#ff5722]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setErrorMessage("");
            }}
            className={`flex-1 pb-3 text-center text-lg sm:text-xl font-bold transition-all relative cursor-pointer ${
              activeTab === "register"
                ? "text-gray-900 border-b-2 border-[#ff5722]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Tạo tài khoản mới
          </button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="mb-4">
            <Alert
              type="error"
              message={errorMessage}
              showIcon
              closable
              onClose={() => setErrorMessage("")}
              className="rounded-lg text-xs"
            />
          </div>
        )}

        {/* ===================== TAB: TẠO TÀI KHOẢN MỚI ===================== */}
        {activeTab === "register" && (
          <div>
            {/* Dòng tặng tin miễn phí theo đúng mẫu */}
            <div className="bg-[#fff8e1] border border-[#ffe082] text-[#b45309] rounded-xl px-3.5 py-2.5 mb-5 flex items-center gap-2.5 text-xs sm:text-[13px] font-medium leading-snug">
              <span className="text-lg shrink-0">🎁</span>
              <span>
                Thành viên mới được tặng <strong>1 tin miễn phí</strong>. Thời hạn sử
                dụng <strong>60 ngày</strong>
              </span>
            </div>

            <Form
              form={registerForm}
              layout="vertical"
              onFinish={handleRegister}
              requiredMark={false}
              initialValues={{ accountType: "tim-kiem" }}
            >
              {/* Họ tên */}
              <Form.Item
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                className="mb-3.5"
              >
                <Input
                  placeholder="Họ tên"
                  className="h-11 sm:h-12 rounded-xl text-sm px-4 border-gray-300 hover:border-[#ff5722] focus:border-[#ff5722]"
                />
              </Form.Item>

              {/* Số điện thoại */}
              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9]{9,11}$/,
                    message: "Số điện thoại không hợp lệ (9 - 11 chữ số)",
                  },
                ]}
                className="mb-3.5"
              >
                <Input
                  placeholder="Số điện thoại"
                  className="h-11 sm:h-12 rounded-xl text-sm px-4 border-gray-300 hover:border-[#ff5722] focus:border-[#ff5722]"
                />
              </Form.Item>

              {/* Mật khẩu */}
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                ]}
                className="mb-3.5"
              >
                <Input.Password
                  placeholder="Mật khẩu"
                  className="h-11 sm:h-12 rounded-xl text-sm px-4 border-gray-300 hover:border-[#ff5722] focus:border-[#ff5722]"
                />
              </Form.Item>

              {/* Số điện thoại người giới thiệu */}
              <Form.Item name="referralPhone" className="mb-1.5">
                <Input
                  placeholder="Số điện thoại người giới thiệu (Nếu có)"
                  className="h-11 sm:h-12 rounded-xl text-sm px-4 border-gray-300 hover:border-[#ff5722] focus:border-[#ff5722]"
                />
              </Form.Item>

              {/* Link tìm hiểu thêm */}
              <div className="mb-4">
                <a
                  href="#tim-hieu-them"
                  onClick={(e) => {
                    e.preventDefault();
                    message.info(
                      "Chương trình giới thiệu: Nhận thêm ưu đãi tin đăng khi người bạn giới thiệu đăng tin thành công!"
                    );
                  }}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <QuestionCircleOutlined className="text-xs" />
                  <span>Tìm hiểu thêm</span>
                </a>
              </div>

              {/* Loại tài khoản: Tìm kiếm | Chính chủ | Môi giới */}
              <Form.Item
                name="accountType"
                label={
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    Loại tài khoản
                  </span>
                }
                className="mb-6"
              >
                <Radio.Group className="flex flex-wrap gap-4 text-xs sm:text-sm">
                  <Radio value="tim-kiem">Tìm kiếm</Radio>
                  <Radio value="chinh-chu">Chính chủ</Radio>
                  <Radio value="moi-gioi">Môi giới</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Nút Tạo tài khoản cam to nổi bật */}
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 rounded-xl font-bold text-base bg-[#ff5722] hover:bg-[#f4511e] border-none text-white shadow-[0_3px_12px_rgba(255,87,34,0.3)] transition-all cursor-pointer"
              >
                Tạo tài khoản
              </Button>

              {/* Đã có tài khoản? Đăng nhập tại đây */}
              <div className="text-center mt-4 text-xs sm:text-sm text-gray-600">
                Bạn đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setErrorMessage("");
                  }}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* ===================== TAB: ĐĂNG NHẬP ===================== */}
        {activeTab === "login" && (
          <div>
            <Form
              form={loginForm}
              layout="vertical"
              onFinish={handleLogin}
              requiredMark={false}
            >
              {/* Số điện thoại / Tên đăng nhập */}
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại hoặc tên đăng nhập",
                  },
                ]}
                className="mb-3.5"
              >
                <Input
                  placeholder="Số điện thoại hoặc Tên đăng nhập"
                  className="h-11 sm:h-12 rounded-xl text-sm px-4 border-gray-300 hover:border-[#ff5722] focus:border-[#ff5722]"
                />
              </Form.Item>

              {/* Mật khẩu */}
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                className="mb-2"
              >
                <Input.Password
                  placeholder="Mật khẩu"
                  className="h-11 sm:h-12 rounded-xl text-sm px-4 border-gray-300 hover:border-[#ff5722] focus:border-[#ff5722]"
                />
              </Form.Item>

              {/* Quên mật khẩu */}
              <div className="text-right mb-5">
                <a
                  href="#quen-mat-khau"
                  onClick={(e) => {
                    e.preventDefault();
                    message.info(
                      "Vui lòng liên hệ bộ phận CSKH để hỗ trợ khôi phục mật khẩu."
                    );
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              {/* Nút Đăng nhập cam to nổi bật */}
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 rounded-xl font-bold text-base bg-[#ff5722] hover:bg-[#f4511e] border-none text-white shadow-[0_3px_12px_rgba(255,87,34,0.3)] transition-all cursor-pointer"
              >
                Đăng nhập
              </Button>

              {/* Chưa có tài khoản? Tạo tài khoản mới tại đây */}
              <div className="text-center mt-4 text-xs sm:text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setErrorMessage("");
                  }}
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Tạo tài khoản mới tại đây
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* Điều khoản & Bản quyền ở chân card */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-500 leading-relaxed">
          <p>
            Qua việc đăng nhập hoặc tạo tài khoản, bạn đồng ý với các{" "}
            <Link href="/van-ban-phap-luat" className="text-blue-600 hover:underline">
              quy định sử dụng
            </Link>{" "}
            cũng như{" "}
            <Link href="/van-ban-phap-luat" className="text-blue-600 hover:underline">
              chính sách bảo mật
            </Link>{" "}
            của chúng tôi
          </p>
          <p className="mt-2 text-gray-400">
            Bản quyền © 2015 - 2026 {appName}
          </p>
        </div>
      </div>
    </div>
  );
}
