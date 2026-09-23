import { APP_NAME } from "@/configs/AppConfig";
import {
  NAV_TYPE_TOP,
  SIDE_NAV_COLLAPSED_WIDTH,
  SIDE_NAV_WIDTH,
  TEMPLATE,
} from "@/constants/ThemeConstant";
import { useSelector } from "@/store/hooks";
import { buildFileUrl } from "@/utils/file";
import utils from "@/utils";
import styled from "@emotion/styled";
import { Grid } from "antd";
import Link from "next/link";
import React from "react";

const LogoWrapper = styled.div(() => ({
  height: TEMPLATE.HEADER_HEIGHT,
  display: "flex",
  alignItems: "center",
  padding: "0 1rem",
  backgroundColor: "transparent",
  transition: "all .2s ease",
  minWidth: 0,
}));

const { useBreakpoint } = Grid;

interface LogoProps {
  mobileLogo?: boolean;
  logoType: "light" | "default";
}

// Component Logo
export const Logo: React.FC<LogoProps> = ({ mobileLogo, logoType }) => {
  const isMobile = !utils.getBreakPoint(useBreakpoint()).includes("lg");
  const navCollapsed = useSelector((state) => state.customizer.isCollapse);
  const navType = useSelector((state) => state.customizer.navType);
  const appConfig = useSelector((state) => state.general.appConfig);

  const appName = appConfig?.tenApp || APP_NAME;
  const doanhNghiep = appConfig?.tenDoanhNghiep || "";
  const logoSrc = appConfig?.logoLink ? buildFileUrl(appConfig.logoLink) : "/logo.png";

  const getLogoWidthGutter = (): string | number => {
    const isNavTop = navType === NAV_TYPE_TOP;

    if (isMobile && !mobileLogo) {
      return 0;
    }
    if (isNavTop) {
      return "auto";
    }
    if (navCollapsed) {
      return `${SIDE_NAV_COLLAPSED_WIDTH}px`;
    } else {
      return `${SIDE_NAV_WIDTH}px`;
    }
  };

  return (
    <LogoWrapper className="logo">
      <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden w-full min-w-0">
        <img
          src={logoSrc}
          alt={`${appName} logo`}
          className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] lg:w-[40px] lg:h-[40px] object-contain shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logo.png";
          }}
        />
        <div className="flex flex-col justify-center min-w-0 flex-1 leading-tight">
          <div className="text-[15px] sm:text-[18px] lg:text-[19px] font-black text-[#d97706] tracking-tight truncate uppercase flex items-center gap-1.5">
            <span>QUẢN LÝ TÀI SẢN</span>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-300 font-bold">:9797</span>
          </div>
          <div className="text-[11px] text-gray-500 truncate">Hệ Thống Cơ Sở Vật Chất & Khấu Hao (Base_TaiSan)</div>
        </div>
      </Link>
    </LogoWrapper>
  );
};

export default Logo;
