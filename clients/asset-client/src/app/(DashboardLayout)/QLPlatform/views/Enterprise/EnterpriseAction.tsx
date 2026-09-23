"use client";

import React from "react";
import { Button } from "antd";
import {
  EditOutlined,
  SendOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { PlatformManageType } from "@/types/platformManage/dto";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { useRouter } from "next/navigation";

interface EnterpriseActionProps {
  item: PlatformManageType;
  onTransitionClick: (config: {
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
  }) => void;
  onlyButtons?: boolean;
  onRefresh?: () => void;
}

const EnterpriseAction: React.FC<EnterpriseActionProps> = ({
  item,
  onTransitionClick,
  onlyButtons = false,
}) => {
  const router = useRouter();

  const baseButtonStyle = {
    fontWeight: 600,
    borderRadius: "4px",
    height: "38px",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "none",
    color: "#ffffff",
  };

  const successButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  };

  const dangerButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: "#c2272d",
    borderColor: "#c2272d",
  };

  const infoButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  };

  const getActionButtons = () => {
    const buttons = [];

    // Tạm lưu (0), Đề nghị chỉnh sửa (2), Cần bổ sung thông tin (6)
    if (
      item.status === PlatformStatusConstant.TamLuu ||
      item.status === PlatformStatusConstant.CanBoSungThongTin
    ) {
      buttons.push(
        <Button
          key="edit"
          type="primary"
          icon={<EditOutlined />}
          style={infoButtonStyle}
          className="hover-opacity-btn"
          onClick={() =>
            router.push(
              item.platformManageTypeId === "NTThongBaoKD"
                ? `/QLPlatform/NenTangTrucTuyen/createOrUpdate?id=${item.id}`
                : `/QLPlatform/create?id=${item.id}&type=${item.platformManageTypeId}`
            )
          }
        >
          Chỉnh sửa hồ sơ
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SendOutlined />}
          style={successButtonStyle}
          className="hover-opacity-btn"
          onClick={() =>
            onTransitionClick({
              targetStatus: PlatformStatusConstant.ChoDuyet,
              title: "Gửi hồ sơ đăng ký lên hệ thống",
              buttonColor: "primary",
            })
          }
        >
          Gửi duyệt hồ sơ
        </Button>
      );
    }

    // Đã xác nhận (5)
    if (item.status === PlatformStatusConstant.DaXacNhan) {
      buttons.push(
        <Button
          key="edit"
          type="primary"
          icon={<EditOutlined />}
          style={infoButtonStyle}
          className="hover-opacity-btn"
          onClick={() =>
            router.push(
              item.platformManageTypeId === "NTThongBaoKD"
                ? `/QLPlatform/NenTangTrucTuyen/createOrUpdate?id=${item.id}`
                : `/QLPlatform/create?id=${item.id}&type=${item.platformManageTypeId}`
            )
          }
        >
          Chỉnh sửa hồ sơ
        </Button>,
        // <Button
        //   key="request_edit"
        //   type="primary"
        //   icon={<EditOutlined />}
        //   style={infoButtonStyle}
        //   className="hover-opacity-btn"
        //   onClick={() =>
        //     onTransitionClick({
        //       targetStatus: PlatformStatusConstant.DeNghiChinhSua,
        //       title: "Gửi đề nghị chỉnh sửa hồ sơ",
        //       buttonColor: "primary",
        //     })
        //   }
        // >
        //   Đề nghị chỉnh sửa
        // </Button>,
        <Button
          key="request_termination"
          type="primary"
          icon={<StopOutlined />}
          style={dangerButtonStyle}
          className="hover-opacity-btn"
          onClick={() =>
            onTransitionClick({
              targetStatus: PlatformStatusConstant.DeNghiChamDutDangKy,
              title: "Gửi đề nghị chấm dứt hoạt động nền tảng",
              buttonColor: "danger",
            })
          }
        >
          Đề nghị chấm dứt
        </Button>
      );
    }

    return buttons;
  };

  const btns = getActionButtons();
  if (btns.length === 0 && onlyButtons) {
    return <span style={{ color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>Không có hành động xử lý khả dụng.</span>;
  }

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
      {btns}
      <style>{`
        .hover-opacity-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hover-opacity-btn:hover {
          opacity: 0.9 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default EnterpriseAction;
