"use client";
import { EmailConfigsDto } from "@/types/emailConfigs";
import { Descriptions, Drawer, Tag, Progress, Divider } from "antd";

interface Props {
  isOpen: boolean;
  data?: EmailConfigsDto;
  onClose: () => void;
}

const DEFAULT_DAILY_LIMIT = 500;

const Detail: React.FC<Props> = ({ isOpen, data, onClose }) => {
  if (!data) return null;

  const sent = data.sentToday ?? 0;
  const limit = data.dailyLimit ?? DEFAULT_DAILY_LIMIT;
  const percent = limit > 0 ? Math.round((sent / limit) * 100) : 0;
  const failures = data.consecutiveFailures ?? 0;

  return (
    <Drawer
      title="Thông tin cấu hình email"
      width={520}
      placement="right"
      onClose={onClose}
      open={isOpen}
    >
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Email gửi">{data.from || "-"}</Descriptions.Item>
        <Descriptions.Item label="Tên hiển thị">{data.alias || "-"}</Descriptions.Item>
        <Descriptions.Item label="Máy chủ SMTP">{data.host || "-"}</Descriptions.Item>
        <Descriptions.Item label="Cổng SMTP">{data.port || "-"}</Descriptions.Item>
        <Descriptions.Item label="Tài khoản SMTP">{data.userName || "-"}</Descriptions.Item>
        <Descriptions.Item label="Mật khẩu SMTP">********</Descriptions.Item>
        <Descriptions.Item label="Bật SSL">
          <Tag color={data.enableSsl ? "green" : "default"}>
            {data.enableSsl ? "Bật" : "Tắt"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Cho phép gửi email">
          <Tag color={data.allowSendMail ? "green" : "red"}>
            {data.allowSendMail ? "Cho phép" : "Không"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ marginTop: 24 }}>Theo dõi quota</Divider>

      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Quota hôm nay">
          <div>
            <span style={{ fontSize: 13 }}>
              Đã gửi <strong>{sent}</strong> / {limit} — còn lại {Math.max(limit - sent, 0)}
            </span>
            <Progress
              percent={Math.min(percent, 100)}
              size="small"
              strokeColor={percent >= 100 ? "#dc2626" : percent >= 80 ? "#f59e0b" : "#16a34a"}
              style={{ marginTop: 4 }}
            />
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Hạn mức / ngày">{limit}</Descriptions.Item>
        <Descriptions.Item label="Gửi mail gần nhất">
          {data.lastUsedAt
            ? new Date(data.lastUsedAt).toLocaleString("vi-VN")
            : "Chưa từng gửi"}
        </Descriptions.Item>
      </Descriptions>

      {failures > 0 && (
        <>
          <Divider style={{ marginTop: 24 }}>Lỗi gần nhất</Divider>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Số lần fail liên tiếp">
              <Tag color={failures >= 3 ? "volcano" : "gold"}>
                {failures} / 3 {failures >= 3 ? "— đã tự tắt" : ""}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời điểm fail">
              {data.lastFailedAt
                ? new Date(data.lastFailedAt).toLocaleString("vi-VN")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do fail">
              <span style={{ color: "#dc2626" }}>{data.lastFailReason || "-"}</span>
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  );
};

export default Detail;
