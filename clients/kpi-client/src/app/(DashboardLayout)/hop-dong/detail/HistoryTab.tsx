import ContractActionConstant from "@/constants/ContractActionConstant";
import historyChangedAuthencationContractService from "@/services/historyChangedAuthencationContract/historyChangedAuthencationContract.service";
import { AuthenticationContractType } from "@/types/authenticationContract/dto";
import { DropdownOption } from "@/types/general";
import { Empty, message, Space, Spin, Tag, Timeline, Typography } from "antd";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ContractHistoryRow,
  emptyText,
  getDropdownLabel,
  getHistoryRows,
  renderStatusLabel,
  renderText,
  toHistoryRows,
} from "./detailUtils";

const { Text } = Typography;

interface HistoryTabProps {
  item?: AuthenticationContractType | null;
  statusOptions?: DropdownOption[];
  actionOptions?: DropdownOption[];
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
        <Typography.Link
          onClick={() => setExpanded(!expanded)}
          style={{ alignSelf: "flex-start", fontSize: "13px", fontWeight: 600, marginTop: 4 }}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </Typography.Link>
      )}
    </div>
  );
};

const HistoryTab: React.FC<HistoryTabProps> = ({
  item,
  statusOptions = [],
  actionOptions = [],
}) => {
  const [historyData, setHistoryData] = useState<ContractHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const getActionValue = (record: ContractHistoryRow) =>
    record.actionType ?? (record as any).action;

  const renderActionLabel = (record: ContractHistoryRow) => {
    const actionValue = getActionValue(record);
    if (actionValue === undefined || actionValue === null || actionValue === "") {
      return emptyText;
    }

    return (
      ContractActionConstant.getDisplayName(actionValue) ||
      getDropdownLabel(actionOptions, actionValue) ||
      String(actionValue)
    );
  };

  const getTimeParts = (value?: string | Date | null) => {
    if (!value) {
      return { date: emptyText, time: "" };
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return { date: String(value), time: "" };
    }

    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  useEffect(() => {
    if (!item?.id) {
      setHistoryData([]);
      return;
    }

    const loadHistory = async () => {
      setLoading(true);
      try {
        const response =
          await historyChangedAuthencationContractService.getData({
            authenticationConstractId: item.id,
            pageIndex: 1,
            pageSize: 1000,
          });
        const responseData = response?.data as any;
        const items = Array.isArray(responseData)
          ? responseData
          : responseData?.items || [];
        const rows = toHistoryRows(items);
        setHistoryData(rows.length ? rows : getHistoryRows(item));
      } catch (error: any) {
        setHistoryData(getHistoryRows(item));
        message.error(error?.message || "Không tải được lịch sử hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [item?.id]);

  useEffect(() => {
    setExpandedRows({});
  }, [item?.id]);

  const renderLongContent = (record: ContractHistoryRow, content: ReactNode) => {
    const expanded = !!expandedRows[record.rowKey];
    const isHtml = typeof content === "string" && content.includes("<") && content.includes(">");

    return (
      <div style={{ marginTop: 10 }}>
        <div
          style={{
            maxHeight: expanded ? 240 : 72,
            overflow: expanded ? "auto" : "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.6,
          }}
        >
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: content as string }} />
          ) : (
            <Text>{content}</Text>
          )}
        </div>
        <Typography.Link
          onClick={() =>
            setExpandedRows((prev) => ({
              ...prev,
              [record.rowKey]: !expanded,
            }))
          }
          style={{ display: "inline-block", marginTop: 6 }}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </Typography.Link>
      </div>
    );
  };

  const timelineItems = historyData.map((record) => {
    const actionValue = getActionValue(record);
    const hasActionValue =
      actionValue !== undefined && actionValue !== null && actionValue !== "";
    const actionColor = hasActionValue
      ? ContractActionConstant.getColor(actionValue)
      : "#0355a2";
    const descContent = record.title || record.content || "";
    const timeParts = getTimeParts(record.createdDate);
    const hasStatusTransition =
      (record.fromStatus !== undefined && record.fromStatus !== null) ||
      (record.toStatus !== undefined && record.toStatus !== null);

    return {
      key: record.rowKey,
      color: actionColor,
      children: (
        <div
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            padding: 12,
            background: "#fff",
          }}
        >
          <Space
            align="start"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <Space direction="vertical" size={4}>
              <Space wrap>
                <Tag color={actionColor}>{renderActionLabel(record)}</Tag>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: "#f5f5f5",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Text strong>{timeParts.date}</Text>
                  {timeParts.time && (
                    <Text type="secondary">{timeParts.time}</Text>
                  )}
                </div>
              </Space>
              <Text strong>{renderText(record.userCode || record.userName)}</Text>
              <Text type="secondary">{renderText(record.roleThaoTac)}</Text>
            </Space>
            {hasStatusTransition && (
              <Space wrap>
                {renderStatusLabel(statusOptions, record.fromStatus)}
                <Text type="secondary">-&gt;</Text>
                {renderStatusLabel(statusOptions, record.toStatus)}
              </Space>
            )}
          </Space>

          {descContent && renderLongContent(record, renderText(descContent))}

          {record.note && <ExpandableNote note={record.note} />}
        </div>
      ),
    };
  });

  return (
    <Spin spinning={loading}>
      {historyData.length ? (
        <Timeline items={timelineItems} style={{ marginTop: 8 }} />
      ) : (
        <Empty description="Chưa có dữ liệu lịch sử" />
      )}
    </Spin>
  );
};

export default HistoryTab;
