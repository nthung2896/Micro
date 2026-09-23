"use client";
import React from "react";
import { Button, Tooltip, Space, Tag } from "antd";
import { SwapOutlined, HomeOutlined, AppstoreOutlined } from "@ant-design/icons";

interface SystemSwitcherProps {
  currentSystem?: "kpi" | "asset";
}

export const SystemSwitcher: React.FC<SystemSwitcherProps> = ({
  currentSystem = "kpi",
}) => {
  const handleSwitch = (target: "kpi" | "asset" | "portal") => {
    const token = typeof window !== "undefined" ? localStorage.getItem("AccessToken") || "" : "";
    if (target === "portal") {
      window.location.href = "http://localhost:3000";
      return;
    }

    if (target === "asset") {
      window.location.href = `http://localhost:9797/auth/sso-callback?token=${encodeURIComponent(token)}`;
      return;
    }

    if (target === "kpi") {
      window.location.href = `http://localhost:9696/auth/sso-callback?token=${encodeURIComponent(token)}`;
      return;
    }
  };

  return (
    <Space size={8} align="center">
      {currentSystem === "kpi" ? (
        <Tooltip title="Chuyển nhanh sang Phân Hệ Quản Lý Tài Sản (Port 9797 - Base_TaiSan)">
          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => handleSwitch("asset")}
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              borderColor: "#d97706",
              color: "#0f172a",
              fontWeight: 700,
              borderRadius: "6px",
              height: "32px",
              boxShadow: "0 2px 6px rgba(245, 158, 11, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              fontSize: "12.5px"
            }}
          >
            <span>Quản Lý Tài Sản (:9797)</span>
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title="Chuyển nhanh sang Phân Hệ Đánh Giá KPI (Port 9696 - Base_DB)">
          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => handleSwitch("kpi")}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              borderColor: "#1d4ed8",
              color: "#ffffff",
              fontWeight: 700,
              borderRadius: "6px",
              height: "32px",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              fontSize: "12.5px"
            }}
          >
            <span>Đánh Giá KPI (:9696)</span>
          </Button>
        </Tooltip>
      )}

      <Tooltip title="Về Cổng Dịch Vụ Tập Trung (Portal SSO :3000)">
        <Button
          icon={<HomeOutlined />}
          onClick={() => handleSwitch("portal")}
          style={{
            borderRadius: "6px",
            height: "32px",
            color: "#64748b",
            fontSize: "12px",
            display: "inline-flex",
            alignItems: "center"
          }}
        >
          <span className="hidden sm:inline">Portal</span>
        </Button>
      </Tooltip>
    </Space>
  );
};

export default SystemSwitcher;
