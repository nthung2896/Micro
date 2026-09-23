"use client";
import { lightTheme } from "@/constants/ThemeConstant";

import TailwindSafelist from "@/components/portal-components/safelist";
import { Providers } from "@/store/providers";
import { App as AntdApp, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import React from "react";
import "./global.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GlobalResponsive } from "@/components/layout-components/GlobalResponsive";
import AppConfigSync from "@/components/layout-components/AppConfigSync";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>Hệ thống quản lý phòng trọ</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var cached = localStorage.getItem("APP_CONFIG_CACHE");
                if (cached) {
                  var c = JSON.parse(cached);
                  var tApp = c.tenApp ? c.tenApp.trim() : "";
                  var t = tApp || "Hệ thống quản lý phòng trọ";
                  if (t) document.title = t;
                  if (c.logoLink) {
                    var l = document.querySelector("link[rel*='icon']") || document.createElement("link");
                    l.rel = "shortcut icon";
                    var base = "${process.env.NEXT_PUBLIC_API_URL || "http://localhost:9966"}";
                    l.href = c.logoLink.indexOf("http") === 0 ? c.logoLink : (base + "/" + (c.logoLink.indexOf("/") === 0 ? c.logoLink.slice(1) : c.logoLink));
                    document.head.appendChild(l);
                  }
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="dir-ltr">
        <TailwindSafelist />
        <div className="App">
          <Providers>
            <AppConfigSync />
            <GlobalResponsive />
            <ConfigProvider theme={lightTheme} locale={viVN} componentSize="middle">
              <AntdApp>{children}</AntdApp>
            </ConfigProvider>
          </Providers>
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
