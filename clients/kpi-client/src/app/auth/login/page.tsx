"use client";
import LoginForm from "@/components/auth-components/LoginForm";
import { Button, Image } from "antd";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import appConfigurationService from "@/services/appConfiguration/appConfigurationService";
import { AppConfigurationType } from "@/types/appConfiguration/appConfiguration";
import { useDispatch, useSelector } from "@/store/hooks";
import { setAppConfig as setReduxAppConfig } from "@/store/general/GeneralSlice";
import { buildFileUrl } from "@/utils/file";

const SSO_LOGIN_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/SsoKeycloak/InitiateLogin`;
const APP_CONFIG_STORAGE_KEY = "APP_CONFIG_CACHE";

const getCachedAppConfig = (): AppConfigurationType | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(APP_CONFIG_STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.error("Error parsing cached app config", err);
    return null;
  }
};

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const reduxAppConfig = useSelector((state) => state.general.appConfig);
  const [appConfig, setAppConfig] = useState<AppConfigurationType | null>(() => {
    return reduxAppConfig || getCachedAppConfig();
  });

  useEffect(() => {
    const redirectUrl =
      params?.get("redirect_url") || window.localStorage.getItem("redirect_url") || "";

    window.localStorage.setItem("redirect_url", redirectUrl);
  }, [params]);

  useEffect(() => {
    if (reduxAppConfig) {
      setAppConfig(reduxAppConfig);
    }
  }, [reduxAppConfig]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await appConfigurationService.getActiveConfig();
        if (response?.status && response?.data) {
          setAppConfig(response.data);
          dispatch(setReduxAppConfig(response.data));
          localStorage.setItem(APP_CONFIG_STORAGE_KEY, JSON.stringify(response.data));
        }
      } catch (err) {
        console.error("Lỗi khi tải cấu hình ứng dụng:", err);
      }
    };
    loadConfig();
  }, [dispatch]);

  const rawColor = (appConfig?.primaryColor || "#0355a2").trim();
  const primaryColor = rawColor.startsWith("#") || rawColor.startsWith("rgb") || rawColor.startsWith("hsl")
    ? rawColor
    : /^[0-9A-Fa-f]{3,8}$/.test(rawColor)
      ? `#${rawColor}`
      : "#0355a2";

  // Trang login không qua DashboardLayout nên cần tự set CSS variable
  // để global.css dùng đúng màu cho nút (do có !important)
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", primaryColor);
    document.documentElement.style.setProperty("--color-primary-hover", `${primaryColor}e6`);
    document.documentElement.style.setProperty("--color-primary-100", `${primaryColor}1a`);
  }, [primaryColor]);

  const goSso = () => {
    window.location.href = SSO_LOGIN_URL;
  };

  const appName = appConfig?.tenApp || "Hệ thống quản lý phòng trọ";
  const orgName = appConfig?.tenDoanhNghiep || "";
  const logoSrc = appConfig?.logoLink ? buildFileUrl(appConfig.logoLink) : "/logo.png";

  const hasCustomModalImage = Boolean(appConfig?.loginModalImage);
  const modalBgImage = hasCustomModalImage
    ? buildFileUrl(appConfig?.loginModalImage)
    : "/images/bg-login.jpeg";

  const backgroundUrl = appConfig?.loginBackgroundLink
    ? buildFileUrl(appConfig.loginBackgroundLink)
    : null;

  // Encode URL để tránh ký tự đặc biệt (', ), space...) làm hỏng CSS string hoặc gây XSS
  const safeBgUrl = backgroundUrl ? encodeURI(backgroundUrl) : null;

  const primaryGradient = `linear-gradient(135deg, #ffffff 0%, #f1f5f9 40%, ${primaryColor}1a 75%, ${primaryColor}33 100%)`;
  const pageBackground = safeBgUrl
    ? `url('${safeBgUrl}') center/cover no-repeat`
    : primaryGradient;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-4 relative overflow-hidden"
      style={{
        background: pageBackground,
        minHeight: "100vh",
      }}
    >
      {safeBgUrl && <link rel="preload" as="image" href={safeBgUrl} />}
      {modalBgImage && <link rel="preload" as="image" href={modalBgImage} />}

      {/* Background overlay if background image exists */}
      {safeBgUrl && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: primaryColor, opacity: 0.15 }}
        />
      )}

      {/* Dynamic Background Shapes - Colored with primaryColor wave animation when no background image */}
      {!safeBgUrl && (
        <>
          <style>
            {`
              @keyframes waveMotion {
                0% { transform: translateX(-15%) translateY(0) scale(1); opacity: 0.2; }
                50% { transform: translateX(15%) translateY(5%) scale(1.1); opacity: 0.4; }
                100% { transform: translateX(-15%) translateY(0) scale(1); opacity: 0.2; }
              }
              .wave-blob {
                animation: waveMotion 12s ease-in-out infinite;
              }
            `}
          </style>
          <div
            className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] pointer-events-none wave-blob"
            style={{ backgroundColor: primaryColor, opacity: 0.15, animationDelay: "0s" }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px] pointer-events-none wave-blob"
            style={{ backgroundColor: primaryColor, opacity: 0.12, animationDelay: "2s" }}
          />
          <div
            className="absolute top-[25%] left-[30%] w-[35vw] h-[35vw] rounded-full blur-[140px] pointer-events-none wave-blob"
            style={{ backgroundColor: primaryColor, opacity: 0.08, animationDelay: "4s" }}
          />
          <div
            className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full blur-[120px] pointer-events-none wave-blob"
            style={{ backgroundColor: primaryColor, opacity: 0.1, animationDelay: "6s" }}
          />
        </>
      )}

      <div className="w-full max-w-[820px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 border border-white/80">
        {/* ====== LEFT: SSO Cán bộ / Công chức ====== */}
        <div
          className="relative p-6 md:p-7 text-white flex flex-col justify-between min-h-[400px] group overflow-hidden"
        >
          <div
            className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105"
            style={{
              backgroundImage: `url('${modalBgImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Subtle overlay so uploaded custom images stay clear & vivid */}
          <div
            className="absolute inset-0"
            style={{
              background: hasCustomModalImage
                ? `linear-gradient(to bottom, color-mix(in srgb, var(--color-primary) 71%, transparent) 0%, rgba(0, 0, 0, 0.72) 100%)`
                : `linear-gradient(135deg, ${primaryColor}99, ${primaryColor}77)`,
            }}
          />

          <div className="relative z-10 flex flex-col items-start">
            <div className="inline-block px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold tracking-widest mb-3 uppercase">
              {appName}
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold leading-tight drop-shadow-md">
              DÀNH CHO{" "}
              <span className="text-yellow-400 block mt-1">CÁN BỘ / CÔNG CHỨC</span>
            </h2>
            <div className="w-10 h-0.5 bg-yellow-400 mt-3 rounded-full shadow-sm"></div>
            <h3 className="text-sm md:text-base font-semibold mt-3 leading-snug text-white/95">
              Đăng nhập thông qua hệ thống định danh tập trung (SSO)
            </h3>
            <p className="text-[11px] md:text-xs mt-2.5 leading-relaxed text-white/85 font-medium max-w-xs">
              Cán bộ, công chức sử dụng tài khoản định danh đã được cấp để tham gia
              thực hiện đánh giá và quản lý nhiệm vụ KPI trên phần mềm của {orgName}.
            </p>
          </div>

          <div className="relative z-10 mt-5">
            <Button
              onClick={goSso}
              block
              size="middle"
              className="flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-300 border-0"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                color: primaryColor,
                borderRadius: 8,
                height: 42,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              Đăng nhập SSO (Cán bộ)
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Button>
          </div>
        </div>

        {/* ====== RIGHT: Quản trị viên ====== */}
        <div className="p-6 md:p-7 flex flex-col justify-center bg-white/60">
          <div className="text-center mb-4">
            <div className="inline-flex p-2 rounded-lg bg-blue-50/50 shadow-[0_2px_6px_rgba(3,85,162,0.05)] mb-2 border border-blue-100/50">
              <Image
                src={logoSrc}
                alt="Logo"
                preview={false}
                style={{ width: 46, height: 46, objectFit: "contain" }}
                fallback="/logo.png"
              />
            </div>
            {orgName ? (
              <div 
                className="text-lg md:text-xl font-extrabold uppercase tracking-[0.1em] mb-1"
                style={{ color: '#da251d' }}
              >
                {orgName}
              </div>
            ) : null}
            <h1
              className="text-lg md:text-xl font-extrabold uppercase bg-clip-text text-transparent tracking-tight mb-4"
              style={{
                backgroundImage: `linear-gradient(to right, ${primaryColor}, ${primaryColor}cc)`,
              }}
            >
              {appName}
            </h1>
          </div>

          <LoginForm primaryColor={primaryColor} />

          <div className="relative mt-3.5 mb-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2.5 bg-white/80 text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Hoặc</span>
            </div>
          </div>

          <Button
            onClick={goSso}
            block
            size="middle"
            className="flex items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-300"
            style={{
              background: "#ffffff",
              color: primaryColor,
              border: `1.5px solid ${primaryColor}`,
              borderRadius: 8,
              height: 42,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          >
            Đăng nhập SSO (Quản trị viên)
            <svg className="w-3.5 h-3.5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3 3v1" /></svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
