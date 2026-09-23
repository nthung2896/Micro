"use client";

import React, { useEffect, useRef, useState } from "react";
import { Drawer, Spin, Tabs, message } from "antd";
import platformManageService from "@/services/platformManage/platformManage.service";
import { PlatformManageType } from "@/types/platformManage/dto";
import HoSoInfoTab from "./detail/HoSoInfoTab";
import TaiLieuDinhKemTab from "./detail/TaiLieuDinhKemTab";
import LichSuThayDoiTab from "./detail/LichSuThayDoiTab";
import YeuCauDoanhNghiepTab from "./detail/YeuCauDoanhNghiepTab";
import EmptyTabPanel from "./detail/EmptyTabPanel";

interface Props {
  id?: string | null;
  open?: boolean;
  onClose: () => void;
  allowedTabs?: string | null;
}

const PlatformManageDetail: React.FC<Props> = ({ id, open, onClose, allowedTabs }) => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<PlatformManageType | null>(null);
  const [activeTab, setActiveTab] = useState("ho-so");
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!id) {
      setItem(null);
      return;
    }
    setActiveTab("ho-so");
    let cancelled = false;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const response = await platformManageService.get(id);
        if (cancelled) return;
        if (response?.data) {
          setItem(response.data);
        } else {
          message.error(response.message ?? "Không tải được chi tiết");
          onCloseRef.current();
        }
      } catch {
        if (!cancelled) {
          message.error("Không tải được chi tiết nền tảng");
          onCloseRef.current();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const allTabItems = item
    ? [
      {
        key: "ho-so",
        label: "Thông tin hồ sơ",
        children: <HoSoInfoTab item={item} />,
      },
      {
        key: "tai-lieu",
        label: "Tài liệu đính kèm",
        children: (
          <TaiLieuDinhKemTab
            itemId={item.id}
            active={activeTab === "tai-lieu"}
          />
        ),
      },
      {
        key: "thong-tin-ky-so",
        label: "Thông tin ký số",
        children: (
          <EmptyTabPanel description="Thông tin ký số" />
        ),
      },
      {
        key: "phan-anh",
        label: "Phản ánh",
        children: (
          <EmptyTabPanel description="Chưa có phản ánh" />
        ),
      },
      {
        key: "canh-bao",
        label: "Cảnh báo và vi phạm",
        children: (
          <EmptyTabPanel description="Chưa có cảnh báo hoặc vi phạm" />
        ),
      },
      {
        key: "lich-su-dong-bo",
        label: "Lịch sử đồng bộ",
        children: <EmptyTabPanel description="Lịch sử đồng bộ" />,
      },
      {
        key: "lich-su",
        label: "Lịch sử xử lý",
        children: <LichSuThayDoiTab item={item} />,
      },
      {
        key: "yeu-cau",
        label: "Yêu cầu doanh nghiệp",
        children: <YeuCauDoanhNghiepTab item={item} />,
      },
    ]
    : [];

  const tabItems = allowedTabs 
    ? allTabItems.filter(t => allowedTabs.includes(t.label))
    : allTabItems;

  return (
    <Drawer
      title={`Chi tiết hồ sơ: ${item?.name ?? ""}`}
      width={'70%'}
      placement="right"
      onClose={onClose}
      open={open ?? !!id}
      styles={{ body: { paddingTop: 8 } }}
    >
      <Spin spinning={loading}>
        {item && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            destroyInactiveTabPane={false}
          />
        )}
      </Spin>
    </Drawer>
  );
};

export default PlatformManageDetail;
