"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "@/store/hooks";
import { setAppConfig } from "@/store/general/GeneralSlice";
import appConfigurationService from "@/services/appConfiguration/appConfigurationService";
import { APP_NAME } from "@/configs/AppConfig";
import { buildFileUrl } from "@/utils/file";
import { AppConfigurationType } from "@/types/appConfiguration/appConfiguration";

const APP_CONFIG_STORAGE_KEY = "APP_CONFIG_CACHE";

export const getAppTitle = (config?: AppConfigurationType | null): string => {
  const tenApp = config?.tenApp?.trim();
  return tenApp || APP_NAME;
};

export const updatePageMetadata = (config?: AppConfigurationType | null) => {
  if (typeof document === "undefined") return;

  const title = getAppTitle(config);
  if (title && document.title !== title) {
    document.title = title;
  }

  if (config?.logoLink) {
    const iconUrl = buildFileUrl(config.logoLink);
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "shortcut icon";
      document.head.appendChild(link);
    }
    if (link.href !== iconUrl) {
      link.href = iconUrl;
    }
  }
};

export function AppConfigSync() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const appConfig = useSelector((state) => state.general.appConfig);

  // 1. Initial hydration from cache if Redux is not yet set
  useEffect(() => {
    if (!appConfig) {
      try {
        const cached = localStorage.getItem(APP_CONFIG_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          dispatch(setAppConfig(parsed));
          updatePageMetadata(parsed);
        }
      } catch (err) {
        console.error("Lỗi đọc cache cấu hình ứng dụng:", err);
      }
    } else {
      updatePageMetadata(appConfig);
    }

    // Always fetch latest active configuration from server to keep in sync
    const fetchLatestConfig = async () => {
      try {
        const res = await appConfigurationService.getActiveConfig();
        if (res?.status && res?.data) {
          dispatch(setAppConfig(res.data));
          localStorage.setItem(APP_CONFIG_STORAGE_KEY, JSON.stringify(res.data));
          updatePageMetadata(res.data);
        }
      } catch (error) {
        console.error("Lỗi đồng bộ cấu hình ứng dụng:", error);
      }
    };

    fetchLatestConfig();
  }, [dispatch]);

  // 2. React to any Redux state changes or route changes
  useEffect(() => {
    if (appConfig) {
      updatePageMetadata(appConfig);
    } else {
      try {
        const cached = localStorage.getItem(APP_CONFIG_STORAGE_KEY);
        if (cached) {
          updatePageMetadata(JSON.parse(cached));
        }
      } catch (e) {}
    }
  }, [appConfig, pathname]);

  return null;
}

export default AppConfigSync;
