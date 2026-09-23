"use client";
import { useState } from "react";
import { Alert, Button, Card, Col, Divider, Form, Input, message, Row, Select, Space, Table, Tabs, Tag, Typography } from "antd";
import { CodeOutlined, CopyOutlined, MailOutlined, SendOutlined, BookOutlined } from "@ant-design/icons";
import withAuthorization from "@/libs/authentication";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import emailTemplatesService from "@/services/emailTemplates/emailTemplates.service";
import { EmailTemplatesDto } from "@/types/emailTemplates";
import { apiService } from "@/services/index";

const { Title, Text, Paragraph } = Typography;

// =====================================================================
// Copyable Snippet
// =====================================================================
const CopyableSnippet: React.FC<{ code: string; label?: string }> = ({ code, label }) => {
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(code); message.success("Đã copy"); } catch { message.error("Không thể copy"); }
  };
  return (
    <div style={{ marginTop: 8, background: "#1e1e1e", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#2d2d2d", borderBottom: "1px solid #3a3a3a" }}>
        <Space size={6}><CodeOutlined style={{ color: "#9ca3af" }} /><Text style={{ color: "#9ca3af", fontSize: 12 }}>{label ?? "snippet"}</Text></Space>
        <Button  type="primary" icon={<CopyOutlined />} onClick={onCopy}>Copy</Button>
      </div>
      <pre style={{ background: "transparent", color: "#d4d4d4", padding: 16, fontSize: 13, lineHeight: 1.6, fontFamily: "Consolas, monospace", maxHeight: 400, overflow: "auto", whiteSpace: "pre", margin: 0 }}>{code}</pre>
    </div>
  );
};

// =====================================================================
// Page
// =====================================================================
const EmailTestPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplatesDto[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendForm] = Form.useForm();

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const r = await emailTemplatesService.getData({ pageIndex: 1, pageSize: 100 });
      if (r?.data) setTemplates(r.data.items);
    } finally { setLoadingTemplates(false); }
  };

  const handleSend = async (values: { code: string; toEmail: string; data: string }) => {
    setSending(true);
    try {
      let dataObj: Record<string, any> = {};
      try { dataObj = JSON.parse(values.data || "{}"); } catch { message.error("Data JSON không hợp lệ"); setSending(false); return; }
      const r = await apiService.post<any>("/EmailTemplates/SendByCode", {
        code: values.code,
        toEmail: values.toEmail,
        data: dataObj,
      });
      if (r.status) message.success(`Đã gửi email tới ${values.toEmail}`);
      else message.error(r.message || "Gửi thất bại");
    } catch (e: any) { message.error(e?.toString() || "Lỗi gửi email"); }
    finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}><AutoBreadcrumb /></div>

      {/* Playground */}
      <Card title={<Space><SendOutlined /> Playground — Test gửi email theo template</Space>} style={{ marginBottom: 16 }}>
        <Alert type="info" showIcon style={{ marginBottom: 16 }} message="Chọn template → nhập email người nhận → truyền data JSON → gửi thử. Hệ thống sẽ render template với data rồi gửi qua SMTP config đã cấu hình." />

        <Form form={sendForm} layout="vertical" onFinish={handleSend}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mã template" name="code" rules={[{ required: true, message: "Nhập mã template" }]}>
                <Select
                  placeholder="Chọn mã template"
                  showSearch
                  optionFilterProp="label"
                  onFocus={() => { if (templates.length === 0) loadTemplates(); }}
                  loading={loadingTemplates}
                  options={templates.map((t) => ({ label: `${t.code} — ${t.subject}`, value: t.code }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email người nhận" name="toEmail" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
                <Input placeholder="test@example.com" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Data (JSON)" name="data" initialValue='{"full_name": "Nguyễn Văn A", "otp": "123456", "expired_minutes": "15"}'>
                <Input.TextArea rows={5} placeholder='{"key": "value"}' />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Button type="primary" htmlType="submit" icon={<MailOutlined />} loading={sending} size="large">
                Gửi email test
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Docs */}
      <Card title={<Space><BookOutlined /> Tài liệu sử dụng Email Templates</Space>}>
        <Tabs items={[
          {
            key: "quickstart",
            label: "Quickstart",
            children: (
              <div>
                <Title level={5}>1. Tạo template</Title>
                <Paragraph>Vào <code>/emailTemplates</code> → Thêm mới. Đặt mã code duy nhất (VD: <code>WELCOME_USER</code>), viết nội dung HTML với biến <code>{"{{tên_biến}}"}</code>.</Paragraph>
                <CopyableSnippet label="Ví dụ template" code={`Code: WELCOME_USER
Subject: Chào mừng {{full_name}} đến với hệ thống
Body:
<h2>Xin chào {{full_name}},</h2>
<p>Tài khoản của bạn đã được kích hoạt.</p>
<p>Trân trọng,<br/>Ban quản trị</p>

Variables: ["full_name"]`} />

                <Title level={5} style={{ marginTop: 20 }}>2. Gọi API gửi email</Title>
                <Paragraph>Gọi <code>POST /api/EmailTemplates/SendByCode</code> với body:</Paragraph>
                <CopyableSnippet label="Request body" code={`{
  "code": "WELCOME_USER",
  "toEmail": "user@example.com",
  "data": {
    "full_name": "Nguyễn Văn A",
    "otp": "123456",
    "expired_minutes": "15"
  }
}`} />

                <Title level={5} style={{ marginTop: 20 }}>3. Gọi từ Frontend (TypeScript)</Title>
                <CopyableSnippet label="Frontend service call" code={`import { apiService } from "@/services/index";

const sendEmail = async () => {
  const response = await apiService.post("/EmailTemplates/SendByCode", {
    code: "WELCOME_USER",
    toEmail: "user@example.com",
    data: {
      full_name: "Nguyễn Văn A",
      otp: "123456",
    },
  });
  if (response.status) {
    console.log("Gửi thành công!");
  }
};`} />

                <Title level={5} style={{ marginTop: 20 }}>4. Gọi từ Backend (C#)</Title>
                <CopyableSnippet label="Backend service call" code={`// Inject IEmailTemplatesService
private readonly IEmailTemplatesService _emailTemplatesService;

// Gửi email theo mã template
var request = new SendEmailByCodeRequest
{
    Code = "WELCOME_USER",
    ToEmail = "user@example.com",
    Data = new Dictionary<string, object>
    {
        ["full_name"] = "Nguyễn Văn A",
        ["otp"] = "123456",
        ["expired_minutes"] = "15",
    }
};
var success = await _emailTemplatesService.SendByCodeAsync(request);`} />
              </div>
            ),
          },
          {
            key: "syntax",
            label: "Cú pháp template",
            children: (
              <div>
                <Title level={5}>Biến đơn giản</Title>
                <Paragraph>Dùng <code>{"{{tên_biến}}"}</code> trong cả Subject và Body:</Paragraph>
                <Table size="small" pagination={false} dataSource={[
                  { key: "1", syntax: "{{full_name}}", desc: "Thay bằng giá trị của key 'full_name' trong data" },
                  { key: "2", syntax: "{{otp}}", desc: "Thay bằng giá trị OTP" },
                  { key: "3", syntax: "{{company_name}}", desc: "Tên doanh nghiệp" },
                ]} columns={[
                  { title: "Cú pháp", dataIndex: "syntax", width: 200, render: (v: string) => <code>{v}</code> },
                  { title: "Mô tả", dataIndex: "desc" },
                ]} />

                <Title level={5} style={{ marginTop: 20 }}>Ví dụ đầy đủ</Title>
                <CopyableSnippet label="Template HTML" code={`<div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #005C8C;">Xin chào {{full_name}},</h2>
  <p>Mã OTP của bạn là: <strong>{{otp}}</strong></p>
  <p>Mã có hiệu lực trong {{expired_minutes}} phút.</p>
  <hr/>
  <p style="color: #666; font-size: 12px;">
    Email này được gửi tự động, vui lòng không trả lời.
  </p>
</div>`} />
              </div>
            ),
          },
          {
            key: "templates",
            label: "Templates có sẵn",
            children: (
              <div>
                <Button onClick={loadTemplates} loading={loadingTemplates} style={{ marginBottom: 12 }}>Tải danh sách template</Button>
                <Table size="small" pagination={false} dataSource={templates} rowKey="id" columns={[
                  { title: "Code", dataIndex: "code", width: 180, render: (v: string) => <Tag color="blue">{v}</Tag> },
                  { title: "Tiêu đề", dataIndex: "subject" },
                  { title: "Biến", dataIndex: "variables", width: 200, render: (v: string) => <code style={{ fontSize: 11 }}>{v || "-"}</code> },
                  { title: "Trạng thái", dataIndex: "isActive", width: 100, render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "Bật" : "Tắt"}</Tag> },
                ]} />
              </div>
            ),
          },
          {
            key: "config",
            label: "Cấu hình SMTP",
            children: (
              <div>
                <Alert type="warning" showIcon style={{ marginBottom: 16 }} message="Email template sử dụng cấu hình SMTP từ bảng EmailConfigs. Đảm bảo có ít nhất 1 config với AllowSendMail = true." />
                <Title level={5}>Checklist trước khi gửi</Title>
                <ol style={{ lineHeight: 2.2 }}>
                  <li>Vào <code>/emailConfigs</code> → tạo ít nhất 1 cấu hình SMTP</li>
                  <li>Đảm bảo <Tag color="green">AllowSendMail = true</Tag></li>
                  <li>Nếu dùng Gmail: tạo App Password (không dùng password thường)</li>
                  <li>Port 587 + SSL = StartTLS (Gmail, Outlook)</li>
                  <li>Port 465 + SSL = SSL/TLS</li>
                  <li>Vào <code>/emailTemplates</code> → tạo template với <Tag color="green">IsActive = true</Tag></li>
                  <li>Test gửi ở Playground phía trên</li>
                </ol>

                <Title level={5} style={{ marginTop: 16 }}>Lỗi thường gặp</Title>
                <Table size="small" pagination={false} dataSource={[
                  { key: "1", error: "Gửi email thất bại", cause: "Không có EmailConfig nào AllowSendMail = true, hoặc template IsActive = false" },
                  { key: "2", error: "Authentication failed", cause: "Sai UserName/Password SMTP. Gmail cần App Password" },
                  { key: "3", error: "Connection timeout", cause: "Sai Host/Port hoặc firewall chặn" },
                  { key: "4", error: "Tài khoản bị auto-tắt", cause: "Gửi fail liên tục ≥ 3 lần → AllowSendMail tự chuyển false" },
                ]} columns={[
                  { title: "Lỗi", dataIndex: "error", width: 220 },
                  { title: "Nguyên nhân & cách fix", dataIndex: "cause" },
                ]} />
              </div>
            ),
          },
        ]} />
      </Card>
    </div>
  );
};

export default withAuthorization(EmailTestPage, "");
