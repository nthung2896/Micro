import notificationService from "@/services/notification/notification.service";
import {
  BellFilled,
  CheckCircleFilled,
  CloseOutlined,
  InfoCircleFilled,
  WarningFilled,
} from "@ant-design/icons";
import { Badge, Button, List, Popover, Spin, Tag } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import NavItem from "./NavItem";
import { NotificationSearchType } from "@/types/notification/request";
import { useRouter } from "next/navigation";
dayjs.extend(relativeTime);
dayjs.locale("vi");

interface NotificationItem {
  img?: string;
  type: string;
  icon: string;
  name: string;
  desc: string;
  time: string;
  rawTime: string;
  link: string;
  id: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircleFilled style={{ color: "#22c55e", fontSize: 18 }} />;
    case "warning":
      return <WarningFilled style={{ color: "#f59e0b", fontSize: 18 }} />;
    case "error":
      return <WarningFilled style={{ color: "#ef4444", fontSize: 18 }} />;
    default:
      return <InfoCircleFilled style={{ color: "#0355a2", fontSize: 18 }} />;
  }
};

const getTagColor = (type: string) => {
  switch (type) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
      return "error";
    default:
      return "processing";
  }
};

export const NavNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotificationUser();
      if (response?.data && Array.isArray(response.data.items)) {
        setNotifications(
          response.data.items.map((item: any) => ({
            img: "",
            type: item.type || "info",
            icon: "",
            name: "",
            desc: item.message,
            rawTime: item.createdDate,
            time: dayjs(item.createdDate).fromNow(),
            link: item.link,
            id: item.id,
          })),
        );
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thông báo:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  const handleOpenNotificationLink = async (id: string, link: string) => {
    try {
      await notificationService.maskAsRead(id);
    } finally {
      router.push(link);
    }
  };
  const handleClearAll = async () => {
    setNotifications([]);
    await notificationService.clearAllNotification();
  };
  const handleViewAll = () => {
    setOpen(false);
    router.push("/notification/user");
  };
  const notificationList = (
    <div style={{ width: 360 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BellFilled style={{ color: "#0355a2", fontSize: 15 }} />
          <span className="font-semibold text-gray-800 text-sm">Thông báo</span>
          {notifications.length > 0 && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ background: "#0355a2", fontSize: 10, lineHeight: 1.5 }}
            >
              {notifications.length >= 100 ? "99+" : notifications.length}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <Button
            type="text"
            icon={<CloseOutlined style={{ fontSize: 11 }} />}
            onClick={handleClearAll}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* Body */}
      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Spin />
          </div>
        ) : notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(item, index) => (
              <List.Item
                key={index}
                className="!px-4 !py-3 hover:bg-blue-50/60 cursor-pointer transition-colors !border-b !border-gray-50"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenNotificationLink(item.id, item.link ?? "");
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug mb-1 line-clamp-2">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag
                        color={getTagColor(item.type)}
                        style={{
                          fontSize: 10,
                          lineHeight: "16px",
                          margin: 0,
                          padding: "0 6px",
                        }}
                      >
                        {item.type || "Thông báo"}
                      </Tag>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(27,61,228,0.07)" }}
            >
              <BellFilled
                style={{ color: "#0355a2", fontSize: 22, opacity: 0.5 }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 mb-0.5">
                Không có thông báo
              </p>
              <p className="text-xs text-gray-400">
                Các thông báo mới sẽ xuất hiện ở đây
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 text-center">
          <Button
            type="link"
            className="text-xs font-medium"
            style={{ color: "#0355a2" }}
            onClick={handleViewAll}
          >
            Xem tất cả thông báo →
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      placement="bottomRight"
      title={null}
      content={notificationList}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      styles={
        { body: { padding: 0, borderRadius: 12, overflow: "hidden" } } as any
      }
      overlayStyle={{ borderRadius: 12 }}
    >
      <NavItem>
        <Badge count={notifications.length} overflowCount={99} style={{ background: "#0355a2" }}>
          <BellFilled
            style={{ fontSize: 18, color: open ? "#0355a2" : "#6b7280" }}
          />
        </Badge>
      </NavItem>
    </Popover>
  );
};

export default NavNotification;

