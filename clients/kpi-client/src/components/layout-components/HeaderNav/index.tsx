"use client";
import {
  NAV_TYPE_TOP,
  SIDE_NAV_COLLAPSED_WIDTH,
  SIDE_NAV_WIDTH,
} from "@/constants/ThemeConstant";
import {
  toggleMobileSidebar,
  toggleSidebar,
} from "@/store/customizer/CustomizerSlice";
import { useSelector } from "@/store/hooks";
import RoleConstant from "@/constants/RoleConstant";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import Logo from "../Logo";
import NavNotification from "../NavNotification";
import NavProfile from "../NavProfile";
import NavSearch from "../NavSearch";
import SystemSwitcher from "../SystemSwitcher";
import Header from "./Header";
import HeaderWrapper from "./HeaderWrapper";
import { MenuOutlined } from "@ant-design/icons";

export const HeaderNav = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navCollapsed = useSelector((state) => state.customizer.isCollapse);
  const isMobile = useSelector((state) => state.customizer.isMobile);
  const headerNavColor = useSelector((state) => state.customizer.topNavColor);
  const navType = useSelector((state) => state.customizer.navType);
  const isNavTop = navType === NAV_TYPE_TOP;
  const navBgColor = useSelector((state) => state.customizer.topNavColor);
  const navMode = "light";
  const currentUser = useSelector((state) => state.auth.User);
  const isDoanhNghiep = currentUser?.listRole?.includes(RoleConstant.DoanhNghiep) ?? false;
  const getNavWidth = () => {
    if (isNavTop || isMobile) {
      return "0px";
    }
    if (navCollapsed) {
      return `${SIDE_NAV_COLLAPSED_WIDTH}px`;
    } else {
      return `${SIDE_NAV_WIDTH}px`;
    }
  };
  const onToggle = () => {
    if (!isMobile) {
      dispatch(toggleSidebar());
    } else {
      dispatch(toggleMobileSidebar());
    }
  };
  return (
    <Header headerNavColor="#fff">
      <HeaderWrapper>
        <div className="flex items-center overflow-hidden" style={{ flex: 1, minWidth: 0 }}>
          {isMobile && (
            <MenuOutlined
              className="text-xl ml-4 mr-2 cursor-pointer text-gray-800 shrink-0"
              onClick={onToggle}
            />
          )}
          <Logo logoType={navMode} />
        </div>
        <div
          className="shrink-0"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "flex-end",
            marginLeft: "auto",
            marginRight: isMobile ? "1rem" : "0",
          }}
        >
          {isMobile ? (
            <>
              <SystemSwitcher currentSystem="kpi" />
              <NavNotification />
              <NavProfile />
            </>
          ) : (
            <>
              <SystemSwitcher currentSystem="kpi" />
              {!isDoanhNghiep && <NavSearch />}
              <NavNotification />
              <NavProfile />
            </>
          )}
        </div>
      </HeaderWrapper>
    </Header>
  );
};
