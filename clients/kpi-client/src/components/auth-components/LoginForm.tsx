import authService from "@/services/auth/auth.service";
import { setLogin } from "@/store/auth/AuthSlice";
import { setIsLoading, setShowMessage } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import { LoginViewModelType } from "@/types/appUser/request";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface LoginFormProps {
  primaryColor?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ primaryColor: propPrimaryColor }) => {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRouter();
  const [form] = Form.useForm();
  const loading = useSelector((state) => state.general.isLoading);
  const showMessage = useSelector((state) => state.general.showMessage);
  const reduxAppConfig = useSelector((state) => state.general.appConfig);
  const [message, setMessage] = useState<string>("");

  const rawColor = (propPrimaryColor || reduxAppConfig?.primaryColor || "#0355a2").trim();
  const primaryColor = rawColor && (rawColor.startsWith("#") || rawColor.startsWith("rgb") || rawColor.startsWith("hsl"))
    ? rawColor
    : /^[0-9A-Fa-f]{3,8}$/.test(rawColor)
    ? `#${rawColor}`
    : "#0355a2";

  const hideAuthMessage = () => {
    dispatch(setShowMessage(false));
  };

  const onLogin = async (loginForm: LoginViewModelType) => {
    dispatch(setIsLoading(true));
    try {
      const data = await authService.login(loginForm);
      if (data != null && data.status) {
        dispatch(setLogin(data));
        const redirectUrl = localStorage.getItem("redirect_url");
        if (redirectUrl) {
          route.push(redirectUrl);
          localStorage.removeItem("redirect_url");
        } else {
          route.push("/dashboard");
        }
      } else {
        setMessage(data.message || "Tài khoản hoặc mật khẩu không chính xác");
        dispatch(setShowMessage(true));
      }
      dispatch(setIsLoading(false));
    } catch (err) {
      setMessage("Tài khoản hoặc mật khẩu không chính xác");
      dispatch(setShowMessage(true));
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => hideAuthMessage(), 3000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  return (
    <>
      {showMessage && (
        <div className="mb-2">
          <Alert
            type="error"
            showIcon
            message={message}
            className="rounded-lg text-[11px] py-1"
          />
        </div>
      )}

      <Form<LoginViewModelType>
        layout="vertical"
        name="login-form"
        form={form}
        onFinish={onLogin}
        requiredMark={false}
      >
        <Form.Item
          name="username"
          className="mb-2.5"
          label={
            <span className="text-[11px] font-semibold text-gray-700">
              Tài khoản
            </span>
          }
          rules={[
            { required: true, message: "Vui lòng nhập tài khoản đăng nhập" },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: primaryColor, fontSize: '15px', marginRight: '4px' }} />}
            placeholder="Nhập tên đăng nhập"
            className="rounded-md border-gray-200 hover:border-blue-400 focus:border-blue-500 py-1.5 text-xs shadow-sm hover:shadow transition-all duration-300"
          />
        </Form.Item>

        <Form.Item
          name="password"
          className="mb-2.5"
          label={
            <span className="text-[11px] font-semibold text-gray-700">
              Mật khẩu
            </span>
          }
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: primaryColor, fontSize: '15px', marginRight: '4px' }} />}
            placeholder="Nhập mật khẩu"
            className="rounded-md border-gray-200 hover:border-blue-400 focus:border-blue-500 py-1.5 text-xs shadow-sm hover:shadow transition-all duration-300"
          />
        </Form.Item>

        <Form.Item className="mb-0 mt-4">
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="group hover:scale-[1.01] transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
              border: "none",
              borderRadius: 8,
              height: 42,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.03em",
              boxShadow: `0 6px 16px ${primaryColor}40`,
            }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginForm;
