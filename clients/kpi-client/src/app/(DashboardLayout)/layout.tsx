"use client";
import { HeaderNav } from "@/components/layout-components/HeaderNav";
import { SideNav } from "@/components/layout-components/SideNav";
import Footer from "@/components/layout-components/Footer";
import Loading from "@/components/shared-components/Loading";
import { MEDIA_QUERIES, TEMPLATE } from "@/constants/ThemeConstant";
import authService from "@/services/auth/auth.service";
import appConfigurationService from "@/services/appConfiguration/appConfigurationService";
import { setUserInfo } from "@/store/auth/AuthSlice";
import { setAppConfig } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { setMenuData } from "@/store/menu/MenuSlice";
import { AppDispatch } from "@/store/store";
import { setIsMobile } from "@/store/customizer/CustomizerSlice";
import { AppUserType } from "@/types/appUser/dto";
import { MenuDataType } from "@/types/operation/dto";
import utils from "@/utils";
import styled from "@emotion/styled";
import { ConfigProvider, Grid, Layout } from "antd";
import locale from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import NProgress from "nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import "@/app/assets/css/global.css";
import "nprogress/nprogress.css";
import "./layout.css";

import { lightTheme } from "@/constants/ThemeConstant";

dayjs.locale("vi");

NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.15 });

const { useBreakpoint } = Grid;
const { Content } = Layout;

const AppContent = styled("div")`
  padding: ${TEMPLATE.LAYOUT_CONTENT_GUTTER}px;
  margin-top: ${TEMPLATE.HEADER_HEIGHT}px;
  min-height: calc(100vh - 126px);
  position: relative;
  @media ${MEDIA_QUERIES.MOBILE} {
    padding: ${TEMPLATE.LAYOUT_CONTENT_GUTTER_SM}px;
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const navCollapsed = useSelector((state) => state.customizer.isCollapse);
  const isMobile = useSelector((state: any) => state.customizer.isMobile);
  const userInfo: AppUserType | null = useSelector(
    (state: any) => state.auth.User,
  );
  const menuData: MenuDataType[] | null = useSelector(
    (state) => state.menu.menuData,
  );
  useEffect(() => {
    // Revert CSS variables to fixed original blue color (#0355a2) for Dashboard Layout
    document.documentElement.style.setProperty("--color-primary", "#0355a2");
    document.documentElement.style.setProperty("--color-primary-hover", "#4096ff");
    document.documentElement.style.setProperty("--color-primary-100", "rgba(27, 61, 228, 0.1)");
    document.documentElement.style.setProperty("--color-primary-active", "rgba(3, 85, 162, 0.05)");
  }, []);

  const getLayoutGutter = () => {
    if (isMobile) return 0;
    return navCollapsed
      ? TEMPLATE.SIDE_NAV_COLLAPSED_WIDTH
      : TEMPLATE.SIDE_NAV_WIDTH;
  };

  const [accessDenied, setAccessDenied] = useState<boolean | null>(null);

  const handleGetUserInfo = async () => {
    try {
      const response = await authService.getInfo();
      if (response) {
        const resData = (response as any).data || response;
        const userRoles: string[] = [
          ...(resData.listRole || []),
          ...(resData.roles || []),
          ...(resData.vaiTro || []),
          resData.type || ''
        ].filter(Boolean);
        
        const hasKpiRole = userRoles.some(r => {
          const u = String(r).toUpperCase();
          return u === "ROLE_KPI" || u === "ADMIN" || u === "MANAGER";
        });

        if (!hasKpiRole) {
          setAccessDenied(true);
        } else {
          setAccessDenied(false);
          dispatch(setUserInfo(response));
          dispatch(setMenuData(response));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetAppConfig = async () => {
    try {
      const response = await appConfigurationService.getActiveConfig();
      if (response?.status && response?.data) {
        dispatch(setAppConfig(response.data));
      }
    } catch (error) {
      console.log("Lỗi tải cấu hình ứng dụng:", error);
    }
  };

  useEffect(() => {
    handleGetUserInfo();
    handleGetAppConfig();
  }, []);

  // NProgress bar khi đổi route (pathname / query).
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 250);
    return () => {
      clearTimeout(t);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  if (accessDenied === true) {
    return (
      <ConfigProvider theme={lightTheme} locale={locale}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
          <div style={{ background: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '520px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              403 - Chưa Được Phân Quyền Phân Hệ
            </h2>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Tài khoản <strong>@{userInfo?.userName || 'người dùng'}</strong> chưa có vai trò <strong>Quản lý Đánh giá KPI & Thi đua (ROLE_KPI)</strong>. Vui lòng liên hệ Quản trị viên tại Cổng SSO Portal để được cấp quyền.
            </p>
            <a
              href="http://localhost:3000"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#0355a2',
                color: '#ffffff',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              <span>Quay Lại Cổng SSO Portal</span>
            </a>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={lightTheme} locale={locale}>
      <Layout>
        <HeaderNav />
        <SideNav />
        <Layout style={{ paddingLeft: getLayoutGutter() }}>
          <AppContent>
            <Content className="h-min-100">
              <Suspense fallback={<Loading content="content" />}>
                {children}
              </Suspense>
            </Content>
          </AppContent>
          <Footer />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
