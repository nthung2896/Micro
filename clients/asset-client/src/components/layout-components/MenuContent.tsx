import { useDispatch, useSelector } from "@/store/hooks";
import { Grid, Image, Menu } from "antd";
import utils from "@/utils";
import { setIsMobileSidebar } from "@/store/customizer/CustomizerSlice";
import Link from "next/link";
import { buildFileUrl } from "@/utils/file";
import React, { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { MenuItemType } from "antd/es/menu/interface";
import * as Icons from "@ant-design/icons";
import styles from "./menuItem.module.css";
import { debug } from "console";
import { MenuDataType } from "@/types/operation/dto";
import { usePathname, useSearchParams } from "next/navigation";
const { useBreakpoint } = Grid;

const setDefaultOpen = (key?: string): string[] => {
  if (!key) return [];
  const arr = key.split("-");
  const keyList: string[] = [];
  let keyString = "";
  arr.forEach((elm, index) => {
    keyString = index === 0 ? elm : `${keyString}-${elm}`;
    keyList.push(keyString);
  });
  return keyList;
};

type MenuItemProps = {
  title: string;
  icon?: ReactNode;
  path?: string;
  isSubMenu?: boolean;
};

const getAntdIconByName = (iconString: string) => {
  if (!iconString) return <Icons.SettingOutlined />;
  let iconName = iconString.trim();
  const match = iconString.match(/<(\w+)\s*\/>/);
  if (match) {
    iconName = match[1];
  }
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent /> : <Icons.SettingOutlined />;
};

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  icon,
  path,
  isSubMenu,
}) => {
  const dispatch = useDispatch();
  const isMobile = !utils.getBreakPoint(useBreakpoint()).includes("lg");
  // const navCollapsed = useSelector((state) => state.customizer.isCollapse);

  const closeMobileNav = () => {
    if (isMobile) {
      dispatch(setIsMobileSidebar(false));
    }
  };

  return (
    <>
      {/* {icon && icon} */}
      <span>
        {isSubMenu ? (
          <span style={{ fontWeight: "400", fontSize: "12px" }}>{title}</span>
        ) : (
          <span style={{ fontWeight: "600", fontSize: "12px" }}>{title}</span>
        )}
      </span>

      {path && <Link onClick={closeMobileNav} href={path} />}
    </>
  );
};

const hasValidUrl = (url?: string) => {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed !== "" && trimmed !== "#" && trimmed !== "javascript:void(0)";
};

const getSideNavMenuItem = (
  navItem: MenuDataType[],
  isSubMenu: boolean = false,
  navCollapsed?: boolean,
): MenuItemType[] => {
  const result: MenuItemType[] = [];

  const activeItems = navItem.filter(
    (x) => x.isAccess && x.isAccess === true && x.isShow === true
  );

  for (let i = 0; i < activeItems.length; i++) {
    const nav = activeItems[i];

    const childItems = nav.listMenu && nav.listMenu.length > 0
      ? getSideNavMenuItem(nav.listMenu, true, navCollapsed)
      : undefined;

    const hasChildren = childItems && childItems.length > 0;
    const hasUrl = hasValidUrl(nav.url);

    // Hide menus that have no children and no valid URL
    if (!hasChildren && !hasUrl) {
      continue;
    }

    const isImageFile = (path?: string) => path && /\.(png|jpg|jpeg|svg|webp|gif)/i.test(path);

    const item: any = {
      key: nav.id,
      icon: !isSubMenu ? (
        isImageFile(nav.icon) ? (
          <img src={buildFileUrl(nav.icon)} alt="icon" style={{ width: 16, height: 16, objectFit: 'contain' }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = ''; e.currentTarget.style.display = 'none'; }} />
        ) : nav.classCss ? (
          getAntdIconByName(nav.classCss)
        ) : (
          <Icons.SettingOutlined />
        )
      ) : (
        <></>
      ),
      label: (
        <MenuItem
          title={isSubMenu ? `${result.length + 1}. ${nav.name || ""}` : (nav.name || "")}
          {...(!nav.listMenu || nav.listMenu.length === 0
            ? { icon: nav.icon }
            : {})}
          {...(!nav.listMenu || nav.listMenu.length === 0
            ? { path: nav.url }
            : {})}
          isSubMenu={isSubMenu}
        />
      ),
    };

    if (childItems && childItems.length > 0) {
      item.children = childItems;
    }

    result.push(item);
  }

  return result;
};

const parseUrlAndQuery = (url: string) => {
  const parts = url.trim().split("?");
  let path = parts[0];
  if (!path.startsWith("/") && path.length > 0) {
    path = "/" + path;
  }
  if (path.endsWith("/") && path.length > 1) {
    path = path.slice(0, -1);
  }
  const queryParams: Record<string, string> = {};
  if (parts[1]) {
    const searchParams = new URLSearchParams(parts[1]);
    searchParams.forEach((value, key) => {
      queryParams[key.toLowerCase()] = value.toLowerCase();
    });
  }
  return { path, queryParams };
};

const findActiveMenu = (
  menuList: MenuDataType[],
  fullPath: string,
  parentKeys: string[] = []
): { activeId: string; openKeys: string[]; score: number } | null => {
  let bestMatch: { activeId: string; openKeys: string[]; score: number } | null = null;
  const currentParsed = parseUrlAndQuery(fullPath);

  for (const item of menuList) {
    const currentPath = parentKeys.concat(item.id.toString());

    if (item.listMenu && item.listMenu.length > 0) {
      const childMatch = findActiveMenu(item.listMenu, fullPath, currentPath);
      if (childMatch) {
        if (!bestMatch || childMatch.score > bestMatch.score) {
          bestMatch = childMatch;
        }
      }
    }

    if (item.url) {
      const itemParsed = parseUrlAndQuery(item.url);
      const isPathEqual = currentParsed.path.toLowerCase() === itemParsed.path.toLowerCase();

      if (isPathEqual) {
        const itemKeys = Object.keys(itemParsed.queryParams);
        let queryScore = 0;
        let queryMatch = true;

        if (itemKeys.length > 0) {
          for (const key of itemKeys) {
            if (currentParsed.queryParams[key] !== itemParsed.queryParams[key]) {
              queryMatch = false;
              break;
            }
          }
          if (queryMatch) {
            queryScore = 100 + itemKeys.length * 10;
          }
        } else {
          if (Object.keys(currentParsed.queryParams).length === 0) {
            queryScore = 50;
          } else {
            queryScore = 10;
          }
        }

        if (queryMatch) {
          const score = queryScore + itemParsed.path.length;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { activeId: item.id.toString(), openKeys: parentKeys, score };
          }
        }
      } else {
        if (itemParsed.path !== "/" && currentParsed.path.toLowerCase().startsWith(itemParsed.path.toLowerCase() + "/")) {
          const itemKeys = Object.keys(itemParsed.queryParams);
          if (itemKeys.length === 0) {
            const score = itemParsed.path.length;
            if (!bestMatch || score > bestMatch.score) {
              bestMatch = { activeId: item.id.toString(), openKeys: parentKeys, score };
            }
          }
        }
      }
    }
  }

  return bestMatch;
};

type SideNavContentProps = {
  routeInfo?: MenuDataType;
  hideGroupTitle?: boolean;
};

const SideNavContent: React.FC<SideNavContentProps> = ({
  routeInfo,
  hideGroupTitle,
}) => {
  const menuData: MenuDataType[] | null = useSelector(
    (state) => state.menu.menuData,
  );
  const navCollapsed = useSelector((state: any) => state.customizer.isCollapse);
  const isMobile = useSelector((state: any) => state.customizer.isMobile);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullPath = useMemo(() => {
    const queryString = searchParams?.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);

  const menuItems = useMemo(
    () => getSideNavMenuItem(menuData || [], false, navCollapsed),
    [menuData, navCollapsed],
  );

  const activeMenu = useMemo(() => {
    if (!menuData || !fullPath) return null;
    return findActiveMenu(menuData, fullPath);
  }, [menuData, fullPath]);

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const lastSyncedPathname = useRef<string>("");

  useEffect(() => {
    if (activeMenu) {
      if (fullPath !== lastSyncedPathname.current) {
        setSelectedKeys([activeMenu.activeId]);
        if (!navCollapsed) {
          setOpenKeys(activeMenu.openKeys);
        }
        lastSyncedPathname.current = fullPath;
      } else {
        setSelectedKeys([activeMenu.activeId]);
      }
    }
  }, [activeMenu, fullPath, navCollapsed]);

  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Menu
      mode="inline"
      theme="light"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      className={`left-menu ${hideGroupTitle ? "hide-group-title" : ""}`}
      items={menuItems}
      inlineCollapsed={isMobile ? false : navCollapsed}
    />
  );
};

const MenuContent: React.FC = () => {
  return <SideNavContent />;
};

export default MenuContent;
