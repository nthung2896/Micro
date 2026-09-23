"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Empty, Spin } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PlatformManageType } from "@/types/platformManage/dto";
import platformManageService from "@/services/platformManage/platformManage.service";

interface Props {
  item: PlatformManageType;
}

type HistoryApiItem = {
  id: string;
  platformManageId: string;
  senderName?: string | null;
  action?: string | null;
  createdDate?: string | null;
};

type HistoryEntry = {
  key: string;
  date: Date | string;
  actor: string;
  actionText: string;
};

const HistoryItem: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
  const d = dayjs(entry.date);
  const dateStr = d.isValid() ? d.format("DD/MM/YYYY") : "—";
  const timeStr = d.isValid() ? d.format("HH:mm:ss") : "—";

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "16px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Avatar
        size={40}
        icon={<UserOutlined />}
        style={{ flexShrink: 0, backgroundColor: "#e8e8e8", color: "#8c8c8c" }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ lineHeight: 1.5, marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>{entry.actor}</span>{" "}
          <span style={{ color: "rgba(0,0,0,0.85)" }}>
            « {entry.actionText} »
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            color: "rgba(0,0,0,0.45)",
            fontSize: 13,
          }}
        >
          <span>
            <CalendarOutlined style={{ marginRight: 6 }} />
            Ngày {dateStr}
          </span>
          <span>
            <ClockCircleOutlined style={{ marginRight: 6 }} />
            Lúc {timeStr}
          </span>
        </div>
      </div>
    </div>
  );
};

const LichSuThayDoiTab: React.FC<Props> = ({ item }) => {
  const [history, setHistory] = useState<HistoryApiItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item.id) {
      setHistory([]);
      return;
    }

    let active = true;
    const loadHistory = async () => {
      setLoading(true);
      try {
        const response = await platformManageService.getHistory(item.id);
        if (active && response?.status) {
          const rows = Array.isArray(response.data) ? response.data : [];
          setHistory(rows);
        } else if (active) {
          setHistory([]);
        }
      } catch {
        if (active) {
          setHistory([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();
    return () => {
      active = false;
    };
  }, [item.id]);

  const entries = useMemo(
    () =>
      history
        .map((entry) => ({
          key: entry.id,
          date: entry.createdDate ?? "",
          actor: entry.senderName?.trim() || "Hệ thống",
          actionText: entry.action?.trim() || "Thực hiện thao tác trên hồ sơ",
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [history],
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <Spin tip="Đang tải lịch sử thay đổi..." />
      </div>
    );
  }

  if (!entries.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Chưa có lịch sử thay đổi"
      />
    );
  }

  return (
    <div>
      {entries.map((entry) => (
        <HistoryItem key={entry.key} entry={entry} />
      ))}
    </div>
  );
};

export default LichSuThayDoiTab;
