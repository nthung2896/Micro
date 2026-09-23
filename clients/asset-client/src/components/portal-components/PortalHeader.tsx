"use client";
import {
  AppstoreOutlined,
  CaretDownOutlined,
  EditOutlined,
  HeartOutlined,
  HomeFilled,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlusCircleOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import authService from "@/services/auth/auth.service";
import { setLogout, setUserInfo } from "@/store/auth/AuthSlice";
import { useSelector } from "@/store/hooks";
import { setMenuData, resetMenuData } from "@/store/menu/MenuSlice";
import { AppDispatch } from "@/store/store";
import { Avatar, Button, Drawer, Dropdown, Menu, MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { NAV_ITEMS } from "./mockData";
import navMenuService from "@/services/navMenu/navMenu.service";
import { NavMenuDto } from "@/types/navMenu";
import homeBlockService, { SctDepartmentDto } from "@/services/homeBlock/homeBlock.service";
import { buildFileUrl } from "@/utils/file";

const StaticFileUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL;

export default function PortalHeader() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const deptCode = params?.deptCode as string | undefined;
  const isHome = !deptCode && (pathname === "/" || pathname === "/portal");

  const appConfig = useSelector((state: any) => state.general.appConfig);
  const appName = appConfig?.tenApp || "HỆ THỐNG QUẢN LÝ PHÒNG TRỌ";
  const doanhNghiep = appConfig?.tenDoanhNghiep || "";
  const logoSrc = "/images/logo-phongtro.svg";

  const user = useSelector((state) => state.auth.User);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<any[]>(NAV_ITEMS);
  const [megaItems, setMegaItems] = useState<any[]>([]);
  const [department, setDepartment] = useState<SctDepartmentDto | null>(null);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target as Node) &&
        megaMenuButtonRef.current &&
        !megaMenuButtonRef.current.contains(event.target as Node)
      ) {
        setMegaMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchMenu = async () => {
      try {
        const res = await navMenuService.getActiveTree("MAIN");
        if (active && res.status && res.data && res.data.length > 0) {
          setNavItems(res.data);
        }
      } catch (err) {
        console.warn("Failed to load active portal menu nav:", err);
      }
    };
    const fetchMegaMenu = async () => {
      try {
        const res = await navMenuService.getActiveTree("MEGA");
        if (active && res.status && res.data) {
          setMegaItems(res.data);
        }
      } catch (err) {
        console.warn("Failed to load active mega menu:", err);
      }
    };
    fetchMenu();
    fetchMegaMenu();
    return () => {
      active = false;
    };
  }, []);

  // Đóng drawer và mega menu mỗi khi đổi route (user vừa click 1 nav item).
  useEffect(() => {
    setDrawerOpen(false);
    setMegaMenuOpen(false);
  }, [pathname]);

  // Trang riêng của 1 Sở (route /SCT_xxx) — tải tên đơn vị để hiển thị thay cho Bộ Công Thương.
  useEffect(() => {
    if (!deptCode) {
      setDepartment(null);
      return;
    }
    let active = true;
    homeBlockService
      .getSctDepartments()
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        const found = list.find((d) => d.code === deptCode) || null;
        setDepartment(found);
      })
      .catch(() => {
        if (active) setDepartment(null);
      });
    return () => {
      active = false;
    };
  }, [deptCode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("AccessToken");
    if (token && !user) {
      authService
        .getInfo()
        .then((r) => {
          if (r) {
            dispatch(setUserInfo(r));
            dispatch(setMenuData(r));
          }
        })
        .catch(() => {
          localStorage.removeItem("AccessToken");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    const idToken = localStorage.getItem("IdTokenHint");
    if (idToken) {
      try {
        const res = await authService.getSsoLogoutUrl(idToken);
        if (res.status && res.data?.url) {
          dispatch(setLogout());
          dispatch(resetMenuData());
          window.location.href = res.data.url;
          return;
        }
      } catch (err) {
        console.error("Failed to get SSO logout URL:", err);
      }
    }

    dispatch(setLogout());
    dispatch(resetMenuData());
    router.push("/");
  };

  const buildHref = (href: string): string => {
    if (!deptCode) return href;
    if (!href || href.startsWith("http") || href.startsWith("//")) return href;
    if (href === "/") return `/${deptCode}`;
    return `/${deptCode}${href}`;
  };

  const mapSubMenuItems = (children: any[]): any[] => {
    return children.map((c: any) => {
      const hasChildren = c.children && c.children.length > 0;
      const href = buildHref(c.href || "#");
      return {
        key: href,
        label: <Link href={href}>{c.label}</Link>,
        children: hasChildren ? mapSubMenuItems(c.children) : undefined,
      };
    });
  };

  const renderMegaMenuItems = (items: any[], depth = 0): React.ReactNode => {
    return (
      <ul
        className={`flex flex-col 
          ${depth === 0 ? "gap-2.5 max-h-[300px] overflow-y-auto pr-1.5 portal-mega-menu-scroll" : "gap-1.5 mt-1.5 pl-3 border-l border-gray-100"}
        `}
      >
        {items.map((item, idx) => {
          const hasChildren = item.children && item.children.length > 0;
          return (
            <li key={idx} className="flex flex-col">
              <Link
                href={buildHref(item.href || "#")}
                className={`text-gray-600 hover:text-[#0143DF] transition-all duration-200 hover:pl-1 flex items-center gap-2
                  ${depth === 0 ? "text-[13px] font-semibold" : "text-[12px] font-medium text-gray-500"}
                `}
              >
                {depth === 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                ) : (
                  <span className="text-[10px] text-gray-400">↳</span>
                )}
                {item.label}
              </Link>
              {hasChildren && renderMegaMenuItems(item.children, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <AppstoreOutlined />,
      label: <Link href="/dashboard">Trang quản trị</Link>,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link href="/profile">Thông tin cá nhân</Link>,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Đăng xuất</span>,
      danger: true,
    },
  ];

  const avatarSrc = user?.picture ? buildFileUrl(user.picture) : undefined;
  const displayName = user?.name || user?.userName || user?.email || "Tài khoản";

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm">
      {/* Top bar — logo + tên cơ quan */}
      <div className="bg-white border-b border-gray-200/80 bg-gradient-to-r from-white via-blue-50/20 to-white">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between py-3">
          <Link href={deptCode ? `/${deptCode}` : "/"} className="relative flex items-center gap-2 lg:gap-3 group min-w-0 px-2 py-1 rounded-lg">
            <img
              src={logoSrc}
              alt="logo"
              className="relative z-10 w-10 h-10 lg:w-11 lg:h-11 object-contain shrink-0 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/logo-phongtro.svg";
              }}
            />
            <div className="relative z-10 leading-tight min-w-0">
              <div className="text-[#0355a2] font-black text-base sm:text-lg lg:text-xl tracking-wide group-hover:underline truncate uppercase">
                {appName}
              </div>
              <div className="hidden sm:block text-[12px] text-gray-500 uppercase tracking-wider font-semibold truncate">
                Sàn kết nối phòng trọ & căn hộ cho thuê uy tín
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            {/* 1. Tin đã lưu */}
            <Link
              href="/tin-da-luu"
              className="flex items-center gap-1.5 text-gray-800 hover:text-red-500 font-medium text-xs sm:text-sm transition-colors"
            >
              <HeartOutlined className="text-base" />
              <span className="hidden sm:inline">Tin đã lưu</span>
            </Link>

            {/* 2. Đăng ký & 3. Đăng nhập (hoặc User Avatar nếu đã đăng nhập) */}
            {user ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <button
                  type="button"
                  className="flex items-center justify-center cursor-pointer sm:justify-start gap-2 h-9 w-9 sm:w-auto p-0 sm:pl-1 sm:pr-3.5 rounded-full border border-gray-200 bg-white hover:border-[#0355a2] hover:shadow-[0_2px_8px_rgba(3,85,162,0.12)] transition duration-200"
                >
                  <Avatar
                    size={28}
                    src={avatarSrc}
                    icon={!avatarSrc ? <UserOutlined /> : undefined}
                    style={{
                      background: avatarSrc ? undefined : "#0355a2",
                    }}
                  />
                  <span className="hidden sm:inline text-sm font-semibold text-gray-800 max-w-[140px] truncate">
                    {displayName}
                  </span>
                  <CaretDownOutlined className="hidden sm:inline text-[10px] text-gray-500" />
                </button>
              </Dropdown>
            ) : (
              <>
                {/* 2. Đăng ký */}
                <Link
                  href="/dang-ky"
                  className="flex items-center gap-1.5 text-gray-800 hover:text-blue-600 font-medium text-xs sm:text-sm transition-colors"
                >
                  <UserAddOutlined className="text-base" />
                  <span className="hidden sm:inline">Đăng ký</span>
                </Link>

                {/* 3. Đăng nhập */}
                <Link
                  href="/dang-nhap"
                  className="flex items-center gap-1.5 text-gray-800 hover:text-blue-600 font-medium text-xs sm:text-sm transition-colors"
                >
                  <LoginOutlined className="text-base" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
              </>
            )}

            {/* 4. Nút Đăng tin miễn phí (Màu cam nổi bật bo góc chuẩn theo ảnh mẫu) */}
            <Link
              href="/dang-tin"
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm text-white bg-[#ff5722] hover:bg-[#f4511e] shadow-[0_3px_10px_rgba(255,87,34,0.35)] hover:shadow-[0_6px_16px_rgba(255,87,34,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
            >
              <EditOutlined className="text-base" />
              <span>Đăng tin miễn phí</span>
            </Link>

            {/* Hamburger mobile — mở drawer nav. Ẩn từ lg trở lên. */}
            <button
              type="button"
              aria-label="Mở menu điều hướng"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 bg-white hover:border-[#0143DF] transition cursor-pointer"
            >
              <MenuOutlined className="text-[#0143DF]!" />
            </button>
          </div>
        </div>
      </div>

      {/* Nav bar — xanh đậm đặc trưng gov. Ẩn dưới lg vì đã thay bằng drawer. */}
      <div className="bg-[#0143DF] hidden lg:block relative">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center">
          <nav className="flex items-center flex-1 overflow-x-auto">
            {navItems.map((item) => {
              const isItemHome = item.href === "/";
              const itemHref = buildHref(item.href);
              const active = isItemHome
                ? isHome || pathname === itemHref
                : pathname === itemHref ||
                (item.href !== "/" && pathname?.startsWith(itemHref));
              const baseCls = `flex items-center gap-1 px-3 xl:px-5 h-11 text-sm font-semibold text-white! whitespace-nowrap transition-colors uppercase tracking-wide ${active
                ? "bg-[#0136B5] border-b-[3px] border-white"
                : "border-b-[3px] border-transparent hover:bg-[#0136B5]"
                }`;

              if (item.children?.length) {
                return (
                  <Dropdown
                    key={item.href}
                    rootClassName="portal-nav-dropdown"
                    menu={{
                      items: mapSubMenuItems(item.children),
                    }}
                    trigger={["hover"]}
                  >
                    <Link href={itemHref} className={baseCls}>
                      {item.label}
                      <CaretDownOutlined className="text-[10px]! opacity-80" />
                    </Link>
                  </Dropdown>
                );
              }

              return (
                <Link key={item.href} href={itemHref} className={baseCls}>
                  {isItemHome ? (
                    <HomeFilled className="text-base!" />
                  ) : (
                    item.label
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Hamburger placeholder — wire action để toggle mega menu */}
          {!deptCode && (
            <button
              ref={megaMenuButtonRef}
              type="button"
              aria-label="Mở menu phụ"
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className={`ml-2 flex items-center justify-center h-11 w-11 text-white! hover:bg-[#0136B5] transition-colors ${megaMenuOpen ? "bg-[#0136B5]" : ""}`}
            >
              <MenuOutlined className="text-lg!" />
            </button>
          )}
        </div>

        {/* Mega Menu */}
        {megaMenuOpen && (
          <div
            ref={megaMenuRef}
            className="absolute left-0 right-0 bg-white border-b border-gray-200 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ top: "100%" }}
          >
            <div className="max-w-[1280px] mx-auto px-6 py-8">
              {megaItems.length > 0 ? (
                <div className="grid grid-cols-5 gap-6">
                  {megaItems.map((root, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <h3 className="text-[#0143DF] font-bold text-xs uppercase tracking-wider border-b pb-1.5 border-gray-100">
                        {root.label}
                      </h3>
                      {renderMegaMenuItems(root.children || [])}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                  Không có dữ liệu menu phụ
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drawer mobile — render NAV_ITEMS dạng inline Menu hỗ trợ touch. */}
      <Drawer
        title="Điều hướng"
        placement="right"
        width={300}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          className="portal-drawer-menu"
          selectedKeys={[pathname ?? ""]}
          defaultOpenKeys={navItems.filter((i) => i.children?.length).map((i) => i.href)}
          items={navItems.map((item) =>
            item.children?.length
              ? {
                key: buildHref(item.href || "#"),
                label: item.label,
                children: mapSubMenuItems(item.children),
              }
              : {
                key: buildHref(item.href || "#"),
                icon: item.href === "/" ? <HomeFilled /> : undefined,
                label: (
                  <Link href={buildHref(item.href || "#")}>
                    {item.label}
                  </Link>
                ),
              },
          )}
        />
      </Drawer>

      {/* Dropdown styling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Style for all menus: main dropdown and sub-popups */
            .portal-nav-dropdown .ant-dropdown-menu,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu {
              background: #ffffff !important;
              border-radius: 8px !important;
              padding: 6px !important;
              min-width: 220px !important;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.05) !important;
              border: 1px solid rgba(0, 0, 0, 0.06) !important;
            }
            
            .portal-nav-dropdown > .ant-dropdown-menu {
              border-top: 3px solid #0143DF !important;
              border-top-left-radius: 4px !important;
              border-top-right-radius: 4px !important;
            }

            /* Styles for menu items and submenu titles */
            .portal-nav-dropdown .ant-dropdown-menu-item,
            .portal-nav-dropdown .ant-dropdown-menu-submenu-title,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-item,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-submenu-title {
              color: #374151 !important;
              font-weight: 500 !important;
              padding: 8px 14px !important;
              border-radius: 6px !important;
              font-size: 13.5px !important;
              transition: all 0.2s ease !important;
            }

            .portal-nav-dropdown .ant-dropdown-menu-item a,
            .portal-nav-dropdown .ant-dropdown-menu-submenu-title a,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-item a,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-submenu-title a {
              color: #374151 !important;
              transition: color 0.2s ease !important;
            }

            /* Hover states */
            .portal-nav-dropdown .ant-dropdown-menu-item:hover,
            .portal-nav-dropdown .ant-dropdown-menu-submenu-title:hover,
            .portal-nav-dropdown .ant-dropdown-menu-submenu-active > .ant-dropdown-menu-submenu-title,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-item:hover,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-submenu-title:hover,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-submenu-active > .ant-dropdown-menu-submenu-title {
              background: #f0f4ff !important;
              color: #0143DF !important;
            }

            .portal-nav-dropdown .ant-dropdown-menu-item:hover a,
            .portal-nav-dropdown .ant-dropdown-menu-submenu-title:hover a,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-item:hover a,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-submenu-title:hover a {
              color: #0143DF !important;
            }

            /* Muted arrow icon in submenu item */
            .portal-nav-dropdown .ant-dropdown-menu-submenu-expand-icon,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-submenu-expand-icon {
              color: #9ca3af !important;
            }
            .portal-nav-dropdown .ant-dropdown-menu-submenu-active > .ant-dropdown-menu-submenu-title .ant-dropdown-menu-submenu-expand-icon,
            .ant-dropdown-menu-submenu-popup .ant-dropdown-menu-submenu-active > .ant-dropdown-menu-submenu-title .ant-dropdown-menu-submenu-expand-icon {
              color: #0143DF !important;
            }

            /* Login button — default outlined xanh, hover filled xanh */
            .portal-login-btn,
            .portal-login-btn:focus {
              border-color: #0143DF !important;
              color: #0143DF !important;
              background: #fff !important;
              font-weight: 600 !important;
              border-radius: 6px !important;
              transition: background 0.2s, color 0.2s, border-color 0.2s !important;
            }
            .portal-login-btn .anticon {
              color: #0143DF !important;
            }
            .portal-login-btn:hover {
              background: #0143DF !important;
              color: #fff !important;
              border-color: #0143DF !important;
            }
            .portal-login-btn:hover .anticon {
              color: #fff !important;
            }

            /* Drawer menu (mobile): active state dùng tone xanh nhạt cùng brand */
            .portal-drawer-menu .ant-menu-item-selected {
              background-color: #E6EEFF !important;
            }
            .portal-drawer-menu .ant-menu-item-selected,
            .portal-drawer-menu .ant-menu-item-selected a {
              color: #0143DF !important;
              font-weight: 600;
            }
            .portal-drawer-menu .ant-menu-item:hover {
              background-color: #F0F5FF !important;
            }
            .portal-drawer-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
              color: #0143DF !important;
            }

            /* Ẩn scrollbar thanh điều hướng khi scroll ngang */
            header nav::-webkit-scrollbar {
              display: none !important;
            }
            header nav {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }

            /* Custom scrollbar siêu mảnh cho cột mega menu */
            .portal-mega-menu-scroll::-webkit-scrollbar {
              width: 4px !important;
            }
            .portal-mega-menu-scroll::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .portal-mega-menu-scroll::-webkit-scrollbar-thumb {
              background: #e5e7eb !important;
              border-radius: 4px !important;
            }
            .portal-mega-menu-scroll::-webkit-scrollbar-thumb:hover {
              background: #d1d5db !important;
            }
          `,
        }}
      />
    </header>
  );
}
