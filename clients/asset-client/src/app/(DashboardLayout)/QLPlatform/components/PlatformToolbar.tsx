"use client";

import React from "react";
import { Button } from "antd";
import {
  CloseOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";

interface PlatformToolbarProps {
  platformType: string;
  isPanelVisible: boolean;
  onTogglePanel: () => void;
  onShowCreate: () => void;
}

const PlatformToolbar: React.FC<PlatformToolbarProps> = ({
  platformType,
  isPanelVisible,
  onTogglePanel,
  onShowCreate,
}) => {
  const getAddBtnLabel = () => {
    switch (platformType) {
      case "NTDangKyKDNuocNgoai":
      case "NTTichHop":
      case "NTTichHopNuocNgoai":
        return "Thêm hồ sơ";
      default:
        return "Thêm mới";
    }
  };

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      className="mb-2 flex-wrap justify-content-end"
    >
      <AutoBreadcrumb />
      <div>
        <Button
          onClick={onTogglePanel}
          type="primary"
          icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          style={{ marginRight: "5px" }}
        >
          {isPanelVisible ? "Ẩn bộ lọc" : "Bộ lọc tìm kiếm"}
        </Button>

        <Button
          onClick={onShowCreate}
          type="primary"
          icon={<PlusCircleOutlined />}
        >
          {getAddBtnLabel()}
        </Button>
      </div>
    </Flex>
  );
};

export default PlatformToolbar;


