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
import { Suspense, useEffect } from "react";
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

  const handleGetUserInfo = async () => {
    try {
      const response = await authService.getInfo();
      if (response) {
        dispatch(setUserInfo(response));
        dispatch(setMenuData(response));
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
    if (userInfo == null || menuData == null) {
      handleGetUserInfo();
    }
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
