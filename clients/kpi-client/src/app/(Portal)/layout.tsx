"use client";
import PortalFooter from "@/components/portal-components/PortalFooter";
import PortalHeader from "@/components/portal-components/PortalHeader";
import React from "react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Đánh dấu area = portal để apiService 401 KHÔNG redirect sang /auth/login
  // (mặc định "dashboard" ép logout → vòng lặp với khách truy cập portal).
  // Set ngay trong render (sync) để child effect fetch API đọc được trước khi 401.
  if (typeof window !== "undefined") window.__APP_AREA = "portal";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PortalHeader />
      <div className="flex-1">{children}</div>
      <PortalFooter />
    </div>
  );
}
