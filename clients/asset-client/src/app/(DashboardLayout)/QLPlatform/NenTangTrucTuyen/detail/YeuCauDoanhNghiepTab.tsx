"use client";

import React from "react";
import { Descriptions, Empty } from "antd";
import { PlatformManageType } from "@/types/platformManage/dto";
import CompanyInfoStatusConstant from "@/constants/CompanyInfoStatusConstant";
import formatDate from "@/utils/formatDate";

interface Props {
  item: PlatformManageType;
}

/** Trạng thái: Đề nghị chỉnh sửa (2), Cần bổ sung thông tin (6) */
const YEU_CAU_STATUSES = [2, 6];

const YeuCauDoanhNghiepTab: React.FC<Props> = ({ item }) => {
  const hasRequest =
    YEU_CAU_STATUSES.includes(item.status) ||
    item.requestChangeDate ||
    item.requestChangeName;

  if (!hasRequest) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Chưa có yêu cầu bổ sung hoặc chỉnh sửa từ cơ quan quản lý"
      />
    );
  }

  return (
    <Descriptions bordered column={1} size="small">
      <Descriptions.Item label="Trạng thái hiện tại">
        {item.statusName ||
          CompanyInfoStatusConstant.getDisplayName(item.status)}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày yêu cầu">
        {item.requestChangeDate
          ? formatDate(item.requestChangeDate, true)
          : "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Người yêu cầu">
        {item.requestChangeName || item.submitName || "—"}
      </Descriptions.Item>
      <Descriptions.Item label="Nội dung yêu cầu">
        <div
          style={{
            color: "#c2272d",
            fontWeight: 600,
            whiteSpace: "pre-wrap",
            padding: "8px",
            background: "#fff1f0",
            borderRadius: "4px",
            border: "1px solid #ffa39e"
          }}
          dangerouslySetInnerHTML={{ __html: item.detail || "Chưa có nội dung chi tiết" }}
        />
      </Descriptions.Item>
    </Descriptions>
  );
};

export default YeuCauDoanhNghiepTab;
