"use client";

import React, { useEffect, useState } from "react";
import { Timeline, Tag, Typography, Spin, Empty, Card, Button } from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  EditOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import platformManageService from "@/services/platformManage/platformManage.service";
import dayjs from "dayjs";

const { Text, Paragraph } = Typography;

interface HistoryTabProps {
  platformId: string;
  companyTaxCode?: string;
}

const isBusinessAction = (action?: string) => {
  if (!action) return false;
  const actLower = action.toLowerCase();
  return (
    actLower.includes("khởi tạo") ||
    actLower.includes("tạo") ||
    actLower.includes("cập nhật") ||
    actLower.includes("sửa") ||
    actLower.includes("gửi duyệt") ||
    actLower.includes("gửi bổ sung") ||
    actLower.includes("thêm mới") ||
    actLower.includes("gửi chỉnh sửa") ||
    actLower.includes("nộp hồ sơ")
  );
};

interface HistoryItem {
  id: string;
  senderName?: string;
  action?: string;
  statusBefore: number;
  statusAfter: number;
  statusBeforeName?: string;
  statusAfterName?: string;
  note?: string;
  createdDate: string;
}

const ExpandableNote: React.FC<{ note: string }> = ({ note }) => {
  const [expanded, setExpanded] = useState(false);
  const plainText = note.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  const isLong = plainText.length > 180;

  return (
    <div
      style={{
        marginTop: 10,
        padding: "12px 16px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        color: "#334155",
        fontSize: "13.5px",
        lineHeight: 1.6,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <Text strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Ý kiến phản hồi / Hướng dẫn:
      </Text>
      <div
        style={
          expanded
            ? { margin: 0, color: "#1e293b", fontWeight: 500 }
            : {
              margin: 0,
              color: "#1e293b",
              fontWeight: 500,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }
        }
        dangerouslySetInnerHTML={{ __html: note }}
      />
      {isLong && (
        <Button
          type="link"
          onClick={() => setExpanded(!expanded)}
          style={{ padding: 0, height: "auto", alignSelf: "flex-start", fontSize: "13px", fontWeight: 600, marginTop: 4 }}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </Button>
      )}
    </div>
  );
};
13695601
const HistoryTab: React.FC<HistoryTabProps> = ({ platformId, companyTaxCode }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [taxCode, setTaxCode] = useState<string | undefined>(companyTaxCode);

  useEffect(() => {
    if (companyTaxCode) {
      setTaxCode(companyTaxCode);
      return;
    }
    if (!platformId) return;
    (async () => {
      try {
        const detailRes = await platformManageService.get(platformId);
        if (detailRes?.data?.companyTaxCode) {
          setTaxCode(detailRes.data.companyTaxCode);
        }
      } catch (err) {
        console.error("Lỗi lấy mã số thuế doanh nghiệp:", err);
      }
    })();
  }, [platformId, companyTaxCode]);

  useEffect(() => {
    if (!platformId) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await platformManageService.getHistory(platformId);
        if (active && res?.status && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử xử lý:", err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [platformId]);

  const getTimelineColor = (action?: string) => {
    if (!action) return "gray";
    const actLower = action.toLowerCase();
    if (actLower.includes("duyệt") || actLower.includes("phê duyệt") || actLower.includes("xác nhận")) {
      return "green";
    }
    if (actLower.includes("từ chối") || actLower.includes("hủy")) {
      return "red";
    }
    if (actLower.includes("bổ sung") || actLower.includes("yêu cầu")) {
      return "orange";
    }
    if (actLower.includes("khởi tạo") || actLower.includes("tạo")) {
      return "blue";
    }
    return "blue";
  };

  const getTimelineIcon = (action?: string) => {
    if (!action) return <ClockCircleOutlined />;
    const actLower = action.toLowerCase();
    if (actLower.includes("duyệt") || actLower.includes("phê duyệt") || actLower.includes("xác nhận")) {
      return <CheckCircleOutlined style={{ fontSize: 16 }} />;
    }
    if (actLower.includes("từ chối") || actLower.includes("hủy")) {
      return <CloseCircleOutlined style={{ fontSize: 16 }} />;
    }
    if (actLower.includes("bổ sung") || actLower.includes("yêu cầu")) {
      return <ExclamationCircleOutlined style={{ fontSize: 16 }} />;
    }
    if (actLower.includes("khởi tạo") || actLower.includes("tạo")) {
      return <PlusCircleOutlined style={{ fontSize: 16 }} />;
    }
    if (actLower.includes("cập nhật") || actLower.includes("sửa")) {
      return <EditOutlined style={{ fontSize: 16 }} />;
    }
    return <ClockCircleOutlined style={{ fontSize: 16 }} />;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Spin size="large" tip="Đang tải lịch sử xử lý..." />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card style={{ border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "none" }}>
        <Empty description="Hồ sơ chưa có lịch sử xử lý" />
      </Card>
    );
  }

  return (
    <div style={{ padding: "8px 0" }}>
      <Card
        title={
          <span style={{ color: "#1e293b", fontWeight: 700, fontSize: "16px" }}>
            Lịch sử luân chuyển & Xét duyệt hồ sơ
          </span>
        }
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          background: "#ffffff",
        }}
      >
        <div style={{ padding: "12px 8px 0 8px" }}>
          <Timeline mode="left">
            {history.map((item) => (
              <Timeline.Item
                key={item.id}
                color={getTimelineColor(item.action)}
                dot={getTimelineIcon(item.action)}
              >
                <div style={{ marginBottom: 20 }}>
                  {/* Dòng 1: Thời gian + Tên hành động */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <Text strong style={{ fontSize: "15px", color: "#1e293b" }}>
                      {item.action || "Thực hiện tác vụ"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "13px" }}>
                      {dayjs(item.createdDate).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </div>

                  {/* Dòng 2: Người thực hiện */}
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <UserOutlined style={{ color: "#64748b", fontSize: "13px" }} />
                    <Text style={{ fontSize: "13.5px", color: "#475569", fontWeight: 500 }}>
                      Người thực hiện: <span style={{ color: "#0f172a", fontWeight: 600 }}>
                        {isBusinessAction(item.action)
                          ? (taxCode || item.senderName || "Doanh nghiệp")
                          : (item.senderName || "Hệ thống")}
                      </span>
                    </Text>
                  </div>

                  {/* Dòng 3: Sự thay đổi trạng thái */}
                  {item.statusBefore !== item.statusAfter && (
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Tag color="default" style={{ margin: 0 }}>{item.statusBeforeName || `Trạng thái ${item.statusBefore}`}</Tag>
                      <SwapOutlined style={{ color: "#64748b", fontSize: "12px" }} />
                      <Tag color="blue" style={{ margin: 0, fontWeight: 500 }}>{item.statusAfterName || `Trạng thái ${item.statusAfter}`}</Tag>
                    </div>
                  )}

                  {/* Dòng 4: Ý kiến phản hồi / Lý do (nếu có) */}
                  {item.note && <ExpandableNote note={item.note} />}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </Card>
    </div>
  );
};

export default HistoryTab;
