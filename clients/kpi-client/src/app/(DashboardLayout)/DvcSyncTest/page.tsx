"use client";
import { useState, useRef } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Row,
  Space,
  Steps,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ApiOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  CopyOutlined,
  FileAddOutlined,
  KeyOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  RightCircleOutlined,
  StepForwardOutlined,
  SyncOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import withAuthorization from "@/libs/authentication";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { apiService } from "@/services/index";
import { CSharpCode } from "@/constants/DvcSyncSnippets";

const API_BASE = process.env.NEXT_PUBLIC_API_URL + "/api" || "http://localhost:5111/api";
const { Title, Text, Paragraph } = Typography;
const PAGE_MAX_WIDTH = 1200;

const codeStyle: React.CSSProperties = {
  background: "#1e1e1e",
  color: "#d4d4d4",
  padding: 16,
  borderRadius: 8,
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "Consolas, 'Courier New', monospace",
  maxHeight: 400,
  overflow: "auto",
  whiteSpace: "pre",
  margin: 0,
};

const CopyableSnippet: React.FC<{ code: string; label?: string }> = ({ code, label }) => {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      message.success(label ? `Đã copy: ${label}` : "Đã copy");
    } catch {
      message.error("Trình duyệt không cho phép copy");
    }
  };
  return (
    <div style={{ marginTop: 8, background: "#1e1e1e", borderRadius: 8, overflow: "hidden" }}>
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 12px", background: "#2d2d2d", borderBottom: "1px solid #3a3a3a",
        }}
      >
        <Space size={6}>
          <CodeOutlined style={{ color: "#9ca3af" }} />
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>{label ?? "snippet"}</Text>
        </Space>
        <Button  type="primary" icon={<CopyOutlined />} onClick={onCopy}>Copy</Button>
      </div>
      <pre style={{ ...codeStyle, borderRadius: 0, background: "transparent" }}>{code}</pre>
    </div>
  );
};

const DEFAULTS = {
  adapterUrl: "https://apitest.vnptigate.vn",
  clientId: "online.gov",
  clientSecret: "90639989-0a40-45c2-9498-53906ca40805",
  code: "000.00.04.G18",
};

const STEPS = [
  { title: "B1", description: "Lấy Token", icon: <LoginOutlined /> },
  { title: "B2", description: "Sinh mã hồ sơ", icon: <KeyOutlined /> },
  { title: "B3", description: "Upload File", icon: <CloudUploadOutlined /> },
  { title: "B4", description: "Tạo hồ sơ", icon: <FileAddOutlined /> },
  { title: "B5", description: "Cập nhật tiến trình", icon: <StepForwardOutlined /> },
  { title: "B6", description: "Cập nhật trạng thái", icon: <SyncOutlined /> },
];

/** Build dossier JSON template with placeholders for dynamic values */
const buildDossierTemplate = (maHoSo: string, maTTHC: string, maDichVuCong: string, idGiayTo: string, hashTepTin: string, tenFile: string) => `{
  "MaHoSo": "${maHoSo}",
  "MaTTHC": "${maTTHC}",
  "MaDichVuCong": "${maDichVuCong}",
  "ChuHoSo": "Nguyễn Văn A @test",
  "LoaiDoiTuong": 1,
  "MaDonViTiepNhan": "G09.20",
  "NgayNop": "2026-06-08 14:07:53",
  "NgayTiepNhan": "2026-06-08 14:07:53",
  "ThanhPhanHoSo": [
    {
      "MaThanhPhanHoSo": "000.00.00.G09-KQ002269",
      "TenThanhPhanHoSo": "Tài liệu chứng minh",
      "SoLuong": 1,
      "LoaiBan": 2,
      "GiayToDinhKem": [
        {
          "IdGiayTo": "${idGiayTo}",
          "MaKetQua": "KQ.G07.000122",
          "TenGiayTo": "${tenFile}",
          "HashTepTin": "${hashTepTin}"
        }
      ]
    }
  ],
  "ThongTinNguoiNop": {
    "LoaiDoiTuong": 1,
    "IdDoiTuong": "88a4fab0-d682-41ad-b3db-817903863710",
    "ThongTinChiTiet": {
      "TenNguoiNop": "Nguyễn Văn A @test",
      "SoDinhDanh": "0200136872",
      "NgayCapDinhDanh": "20241231000000",
      "NgaySinh": "20241231000000",
      "SoDienThoai": "0123456789",
      "Email": "nguyenvana@gmail.com",
      "Fax": "0123456789",
      "MaTinh": "79",
      "MaHuyen": "775",
      "MaXa": "27358",
      "DiaChiChiTiet": "628/30 Hậu Giang",
      "TenChuHs": "Nguyễn Văn A @test",
      "SoDinhDanhChuHs": "123456789",
      "MaTinhChuHs": "79",
      "MaXaChuHs": "27358",
      "DiaChiChiTietChuHs": "628/30 Hậu Giang"
    }
  }
}`;
const SAMPLE_TIEN_TRINH = `[
  {
    "IDHoSo": "",
    "MaHoSo": "G09.20-20260609-0092637",
    "NguoiXuLy": "Người xử lý",
    "ThoiDiemXuLy": "2026-06-08T07:47:28.329",
    "PhongBanXuLy": "Đơn vị đang xử lý",
    "NoiDungXuLy": "Nội dung xử lý",
    "TrangThai": 2,
    "NgayBatDau": "2026-06-08T07:47:28.329",
    "NgayKetThucTheoQuyDinh": "2026-06-08T07:47:28.329"
  }
]`;
const SAMPLE_TRANG_THAI = `[
  {
    "IdHoSo": "",
    "MaHoSo": "G09.20-20260609-0092637",
    "TrangThai": 5
  }
]`;

// =====================================================================
// Playground Card
// =====================================================================
const PlaygroundCard: React.FC = () => {
  const [adapterUrl, setAdapterUrl] = useState(DEFAULTS.adapterUrl);
  const [clientId, setClientId] = useState(DEFAULTS.clientId);
  const [clientSecret, setClientSecret] = useState(DEFAULTS.clientSecret);

  const [token, setToken] = useState<string>("");
  const [maHoSo, setMaHoSo] = useState<string>("");
  const [idGiayTo, setIdGiayTo] = useState<string>("");
  const [hashTepTin, setHashTepTin] = useState<string>("");
  const [idHoSo, setIdHoSo] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<number>(-1);

  const [responses, setResponses] = useState<Record<number, { status: number; body: any; request?: string }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [dossierJson, setDossierJson] = useState(
    buildDossierTemplate(maHoSo || DEFAULTS.code, "1.005129", "1.005129", idGiayTo || "", hashTepTin || "", selectedFile?.name || "document.pdf")
  );
  const [tienTrinhJson, setTienTrinhJson] = useState(SAMPLE_TIEN_TRINH);
  const [trangThaiJson, setTrangThaiJson] = useState(SAMPLE_TRANG_THAI);

  const addResponse = (step: number, status: number, body: any, request?: string) => {
    setResponses((prev) => ({ ...prev, [step]: { status, body, request } }));
  };

  const handleGetToken = async () => {
    setLoading(1);
    try {
      const r = await apiService.post<any>("/DvcSync/GetToken", {
        client_id: clientId,
        client_secret: clientSecret,
      });
      addResponse(1, r.data?.access_token ? 200 : 400, r);
      if (r?.data?.access_token) {
        setToken(r.data.access_token);
        setCurrentStep(1);
        message.success("Đã lấy token thành công!");
      } else {
        message.warning("Token không có trong response");
      }
    } catch (e: any) {
      addResponse(1, 500, { error: e?.toString() || "Lỗi kết nối" });
      message.error("Lỗi kết nối tới server proxy");
    } finally {
      setLoading(-1);
    }
  };

  const handleGetNextValue = async () => {
    if (!token) {
      message.warning("Chưa có token — hãy thực hiện Bước 1 trước.");
      return;
    }
    setLoading(2);
    try {
      const r = await fetch(
        `${API_BASE}/DvcSync/GetNextValue?code=${encodeURIComponent(DEFAULTS.code)}&token=${encodeURIComponent(token)}`
      );
      const responseData = await r.json();
      addResponse(2, r.status, responseData, `GET /DvcSync/GetNextValue?code=${DEFAULTS.code}`);
      if (responseData?.value) {
        setMaHoSo(responseData.value);
        setDossierJson(buildDossierTemplate(
          responseData.value, "1.005129", "1.005129",
          idGiayTo, hashTepTin, selectedFile?.name || "document.pdf"
        ));
        setCurrentStep(2);
        message.success(`Mã hồ sơ: ${responseData.value}`);
      } else {
        message.warning("Không nhận được mã hồ sơ");
      }
    } catch (e: any) {
      addResponse(2, 500, { error: e?.toString() || "Lỗi kết nối" });
      message.error("Lỗi gọi API GetNextValue");
    } finally {
      setLoading(-1);
    }
  };

  const handleUploadFile = async () => {
    if (!token) {
      message.warning("Chưa có token — hãy thực hiện Bước 1 trước.");
      return;
    }
    if (!selectedFile) {
      message.warning("Chưa chọn file để upload.");
      return;
    }
    setLoading(3);
    try {
      const formData = new FormData();
      formData.append("files", selectedFile);

      const r = await fetch(`${API_BASE}/DvcSync/UploadFile?token=${encodeURIComponent(token)}`, {
        method: "POST",
        body: formData,
      });
      const textResponse = await r.text();
      let responseData: any;
      try {
        responseData = JSON.parse(textResponse);
      } catch {
        responseData = { raw: textResponse.substring(0, 1000) };
        addResponse(3, r.status, { error: "Response không phải JSON", status: r.status, body: textResponse.substring(0, 500) });
        message.error(`Upload thất bại (HTTP ${r.status}): ${textResponse.substring(0, 150)}`);
        setLoading(-1);
        return;
      }
      addResponse(3, r.status, responseData);

      const fileData = responseData?.data?.[0]?.response?.data?.[0];
      if (fileData) {
        const newIdGiayTo = fileData.IdTepTin || "";
        const newHashTepTin = fileData.HashTepTin || "";
        setIdGiayTo(newIdGiayTo);
        setHashTepTin(newHashTepTin);
        setDossierJson(buildDossierTemplate(
          maHoSo, "1.005129", "1.005129",
          newIdGiayTo, newHashTepTin, selectedFile?.name || "file"
        ));
        setCurrentStep(3);
        message.success(`Upload thành công! IdGiayTo: ${fileData.IdTepTin}`);
      } else {
        message.warning("Upload hoàn tất nhưng không parse được IdGiayTo");
      }
    } catch (e: any) {
      addResponse(3, 500, { error: e?.toString() || "Lỗi upload" });
      message.error(`Lỗi upload file: ${e?.toString() || "Không rõ lỗi"}`);
    } finally {
      setLoading(-1);
    }
  };

  const handleCreateDossier = async () => {
    if (!token) {
      message.warning("Chưa có token — hãy thực hiện Bước 1 trước.");
      return;
    }
    setLoading(4);
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(dossierJson);
      } catch {
        message.error("JSON không hợp lệ. Kiểm tra syntax.");
        setLoading(-1);
        return;
      }

      const r = await fetch(`${API_BASE}/DvcSync/CreateDossier?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const textResponse = await r.text();
      let responseData: any;
      try {
        responseData = JSON.parse(textResponse);
      } catch {
        responseData = { raw: textResponse.substring(0, 1000) };
        addResponse(4, r.status, { error: "Response không phải JSON", status: r.status, body: textResponse.substring(0, 500) });
        message.error(`Tạo hồ sơ thất bại (HTTP ${r.status}): ${textResponse.substring(0, 150)}`);
        setLoading(-1);
        return;
      }
      addResponse(4, r.status, responseData, "POST /DvcSync/CreateDossier");

      if (responseData?.data?.idHoSo) {
        setIdHoSo(responseData.data.idHoSo);
        if (responseData.data.maHoSo) setMaHoSo(responseData.data.maHoSo);
        setCurrentStep(4);
        message.success("Đã tạo hồ sơ!");
      } else {
        message.warning("Tạo hồ sơ hoàn tất nhưng không có idHoSo trong response");
      }
    } catch (e: any) {
      addResponse(4, 500, { error: e?.toString() || "Lỗi tạo hồ sơ" });
      message.error("Lỗi tạo hồ sơ");
    } finally {
      setLoading(-1);
    }
  };

  const handleCapNhatTienTrinh = async () => {
    if (!token) {
      message.warning("Chưa có token.");
      return;
    }
    setLoading(5);
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(tienTrinhJson);
      } catch {
        message.error("JSON không hợp lệ");
        setLoading(-1);
        return;
      }

      const r = await fetch(`${API_BASE}/DvcSync/CapNhatTienTrinh?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const responseData = await r.json();
      addResponse(5, r.status, responseData, "POST /DvcSync/CapNhatTienTrinh");
      setCurrentStep(5);
      message.success("Đã cập nhật tiến trình!");
    } catch (e: any) {
      addResponse(5, 500, { error: e?.toString() || "Lỗi" });
      message.error("Lỗi cập nhật tiến trình");
    } finally {
      setLoading(-1);
    }
  };

  const handleCapNhatTrangThai = async () => {
    if (!token) {
      message.warning("Chưa có token.");
      return;
    }
    setLoading(6);
    try {
      let parsed: any;
      try {
        parsed = JSON.parse(trangThaiJson);
      } catch {
        message.error("JSON không hợp lệ");
        setLoading(-1);
        return;
      }

      const r = await fetch(`${API_BASE}/DvcSync/CapNhatTrangThai?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const responseData = await r.json();
      addResponse(6, r.status, responseData, "POST /DvcSync/CapNhatTrangThai");
      setCurrentStep(6);
      message.success("Đã cập nhật trạng thái!");
    } catch (e: any) {
      addResponse(6, 500, { error: e?.toString() || "Lỗi" });
      message.error("Lỗi cập nhật trạng thái");
    } finally {
      setLoading(-1);
    }
  };

  return (
    <Card
      className="customCardShadow"
      title={
        <Space>
          <ApiOutlined />
          <span>Playground — Kiểm thử 6 bước đồng bộ hồ sơ DVC</span>
        </Space>
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Cấu hình thông tin kết nối Cổng DVC Bộ"
        description="Adapter URL mặc định trỏ tới Cổng DVC Bộ Nội vụ (MOHA). Thay đổi nếu dùng môi trường test hoặc Bộ khác."
      />

      <Collapse
        size="small"
        style={{ marginBottom: 16 }}
        items={[
          {
            key: "config",
            label: "Cấu hình kết nối",
            children: (
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Adapter URL" style={{ marginBottom: 8 }}>
                    <Input value={adapterUrl} onChange={(e) => setAdapterUrl(e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Client ID" style={{ marginBottom: 8 }}>
                    <Input value={clientId} onChange={(e) => setClientId(e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Client Secret" style={{ marginBottom: 8 }}>
                    <Input.Password value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
                  </Form.Item>
                </Col>
              </Row>
            ),
          },
        ]}
      />

      <Steps
        style={{ marginBottom: 24 }}
        current={currentStep}
        size="small"
        items={STEPS.map((s, i) => ({
          title: s.title,
          description: s.description,
          status: i < currentStep ? "finish" : i === currentStep && loading === i + 1 ? "process" : "wait",
          icon: i < currentStep ? <CheckCircleOutlined /> : s.icon,
        }))}
      />

      <Descriptions size="small" column={4} style={{ marginBottom: 16 }} bordered>
        <Descriptions.Item label="Token">{token ? <Tag color="green">Đã có</Tag> : <Tag>Chưa có</Tag>}</Descriptions.Item>
        <Descriptions.Item label="Mã hồ sơ">{maHoSo || "-"}</Descriptions.Item>
        <Descriptions.Item label="IdGiayTo">{idGiayTo || "-"}</Descriptions.Item>
        <Descriptions.Item label="IdHoSo">{idHoSo || "-"}</Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: "12px 0" }} />

      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Space><LoginOutlined />Bước 1: Lấy Token</Space>}>
            <Button
              type="primary"
              block
              icon={<PlayCircleOutlined />}
              loading={loading === 1}
              onClick={handleGetToken}
            >
              Get Token
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Space><KeyOutlined />Bước 2: Sinh mã hồ sơ</Space>}>
            <Form.Item label="Mã TTHC/Đơn vị" style={{ marginBottom: 8 }}>
              <Input value={DEFAULTS.code} disabled size="small" />
            </Form.Item>
            <Button
              type="primary"
              block
              icon={<PlayCircleOutlined />}
              loading={loading === 2}
              onClick={handleGetNextValue}
              disabled={!token}
            >
              Get Next Value
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Space><CloudUploadOutlined />Bước 3: Upload File</Space>}>
            <input
              ref={fileInputRef}
              type="file"
              style={{ marginBottom: 8, fontSize: 12, width: "100%" }}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Button
              type="primary"
              block
              icon={<CloudUploadOutlined />}
              loading={loading === 3}
              onClick={handleUploadFile}
              disabled={!token || !selectedFile}
            >
              Upload File
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Space><FileAddOutlined />Bước 4: Tạo hồ sơ</Space>}>
            <Tooltip title="Dán JSON tạo hồ sơ (tham khảo mẫu)">
              <Input.TextArea
                rows={3}
                value={dossierJson}
                onChange={(e) => setDossierJson(e.target.value)}
                style={{ fontSize: 11, marginBottom: 8 }}
              />
            </Tooltip>
            <Button
              type="primary"
              block
              icon={<FileAddOutlined />}
              loading={loading === 4}
              onClick={handleCreateDossier}
              disabled={!token}
            >
              Tạo hồ sơ (NoiHoSo)
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Space><StepForwardOutlined />Bước 5: Cập nhật tiến trình</Space>}>
            <Input.TextArea
              rows={3}
              value={tienTrinhJson}
              onChange={(e) => setTienTrinhJson(e.target.value)}
              style={{ fontSize: 11, marginBottom: 8 }}
            />
            <Button
              type="primary"
              block
              icon={<StepForwardOutlined />}
              loading={loading === 5}
              onClick={handleCapNhatTienTrinh}
              disabled={!token}
            >
              Cập nhật tiến trình
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title={<Space><SyncOutlined />Bước 6: Cập nhật trạng thái</Space>}>
            <Input.TextArea
              rows={3}
              value={trangThaiJson}
              onChange={(e) => setTrangThaiJson(e.target.value)}
              style={{ fontSize: 11, marginBottom: 8 }}
            />
            <Button
              type="primary"
              block
              icon={<SyncOutlined />}
              loading={loading === 6}
              onClick={handleCapNhatTrangThai}
              disabled={!token}
            >
              Cập nhật trạng thái
            </Button>
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0" }}>Response log</Divider>
      {Object.keys(responses).length === 0 && (
        <Text type="secondary">Chưa có request nào. Chạy từng bước phía trên để xem kết quả.</Text>
      )}
      {Object.entries(responses).map(([step, resp]) => (
        <Card
          key={step}
          size="small"
          style={{ marginBottom: 8 }}
          title={
            <Space>
              <Tag color={resp.status >= 200 && resp.status < 300 ? "green" : "red"}>
                Bước {step} — HTTP {resp.status}
              </Tag>
              {resp.request && <code style={{ fontSize: 11 }}>{resp.request}</code>}
            </Space>
          }
          extra={
            <Button
              
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(resp.body, null, 2));
                message.success("Đã copy response");
              }}
            >
              Copy
            </Button>
          }
        >
          <pre style={codeStyle}>{JSON.stringify(resp.body, null, 2)}</pre>
        </Card>
      ))}
    </Card>
  );
};

// =====================================================================
// Docs Card
// =====================================================================
const DocsCard: React.FC = () => (
  <Card
    className="customCardShadow"
    style={{ marginTop: 16 }}
    title={
      <Space>
        <BookOutlined />
        <span>Tài liệu tích hợp DVC Bộ Chuyên Ngành</span>
      </Space>
    }
  >
    <Tabs
      defaultActiveKey="overview"
      items={[
        {
          key: "overview",
          label: (
            <Space size={6}>
              <ApiOutlined /> Tổng quan
            </Space>
          ),
          children: <TabOverview />,
        },
        {
          key: "backend",
          label: (
            <Space size={6}>
              <CodeOutlined /> Cấu hình Backend
            </Space>
          ),
          children: <TabBackend />,
        },
        {
          key: "service",
          label: (
            <Space size={6}>
              <CodeOutlined /> C# Service mẫu
            </Space>
          ),
          children: <TabService />,
        },
        {
          key: "integration",
          label: (
            <Space size={6}>
              <FileAddOutlined /> Tích hợp thực tế
            </Space>
          ),
          children: <TabIntegration />,
        },
        {
          key: "catalogs",
          label: (
            <Space size={6}>
              <BookOutlined /> Tham số & Danh mục
            </Space>
          ),
          children: <TabCatalogs />,
        },
        {
          key: "errors",
          label: (
            <Space size={6}>
              <WarningOutlined /> Mã lỗi
            </Space>
          ),
          children: <TabErrors />,
        },
      ]}
    />
  </Card>
);

const TabOverview: React.FC = () => (
  <div>
    <Title level={5} style={{ marginTop: 0 }}>1. Mô hình kết nối</Title>
    <Paragraph>Hệ thống chuyên ngành kết nối với Cổng DVC Bộ qua trục LGSP. Luồng xử lý gồm 6 bước:</Paragraph>
    <Steps
      direction="vertical"
      current={-1}
      size="small"
      items={[
        { title: "Bước 1: Lấy Token", description: "Gửi client_id + client_secret → nhận access_token." },
        { title: "Bước 2: Sinh mã hồ sơ", description: "Gửi code (mã TTHC) + token → nhận mã số hồ sơ." },
        { title: "Bước 3: Upload file đính kèm", description: "Upload file + token → nhận IdTepTin + HashTepTin." },
        { title: "Bước 4: Tạo hồ sơ chủ động (NoiHoSo)", description: "Gửi toàn bộ thông tin hồ sơ + token → nhận idHoSo + maHoSo." },
        { title: "Bước 5: Cập nhật tiến trình xử lý", description: "Báo cáo tiến độ luân chuyển xử lý hồ sơ." },
        { title: "Bước 6: Cập nhật trạng thái xử lý", description: "Báo cáo trạng thái hồ sơ (5=bổ sung, 6=phí, 9=hoàn thành)." },
      ]}
    />
  </div>
);

const TabBackend: React.FC = () => (
  <div>
    <Title level={5} style={{ marginTop: 0 }}>1. Cấu hình appsettings.json</Title>
    <CopyableSnippet
      label="appsettings.json — DvcSync"
      code={`"DvcSync": {
  "AdapterUrl": "https://apitest.vnptigate.vn",
  "ClientId": "online.gov",
  "ClientSecret": "90639989-0a40-45c2-9498-53906ca40805",
  "MaDonViTiepNhan": "G09.20",
  "MaTTHC": "1.005129",
  "MaDichVuCong": "1.005129"
}`}
    />
  </div>
);

const TabService: React.FC = () => (
  <div>
    <Title level={5} style={{ marginTop: 0 }}>1. C# Service mẫu</Title>
    <CopyableSnippet label="IDvcSyncService.cs" code={CSharpCode.DTOs} />
  </div>
);

const TabIntegration: React.FC = () => (
  <div>
    <Title level={5}>Các bước đồng bộ DVC</Title>
    <Paragraph>Code mẫu chi tiết trong file <code>constants/DvcSyncSnippets.ts</code></Paragraph>
    <Divider />
    <Title level={5}>B1: Lấy Token</Title>
    <CopyableSnippet label="Code B1" code={CSharpCode.B1_GetToken} />
    <Divider />
    <Title level={5}>B2: Sinh mã hồ sơ</Title>
    <CopyableSnippet label="Code B2" code={CSharpCode.B2_GetNextValue} />
    <Divider />
    <Title level={5}>B3: Upload file</Title>
    <CopyableSnippet label="Code B3" code={CSharpCode.B3_UploadFile} />
    <Divider />
    <Title level={5}>B4: Tạo hồ sơ chủ động</Title>
    <CopyableSnippet label="Code B4" code={CSharpCode.B4_CreateDossier} />
    <Divider />
    <Title level={5}>B5: Cập nhật tiến trình</Title>
    <CopyableSnippet label="Code B5" code={CSharpCode.B5_CapNhatTienTrinh} />
    <Divider />
    <Title level={5}>B6: Cập nhật trạng thái</Title>
    <CopyableSnippet label="Code B6" code={CSharpCode.B6_CapNhatTrangThai} />
    <Divider />
    <Title level={5}>Tự động đồng bộ (Auto Sync)</Title>
    <CopyableSnippet label="Auto Sync Hook" code={CSharpCode.AutoSyncHook} />
  </div>
);

const TabCatalogs: React.FC = () => (
  <div>
    <Title level={5} style={{ marginTop: 0 }}>1. Danh mục Loại đối tượng (LoaiDoiTuong)</Title>
    <Paragraph>Sử dụng trong thông tin người nộp, chủ hồ sơ để phân loại thực thể:</Paragraph>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "0", code: 0, label: "Công dân", desc: "Cá nhân, người nộp là công dân tự thực hiện thủ tục" },
        { key: "1", code: 1, label: "Doanh nghiệp", desc: "Thương nhân, doanh nghiệp sở hữu pháp nhân" },
        { key: "2", code: 2, label: "Hộ kinh doanh", desc: "Cá nhân kinh doanh, hộ kinh doanh gia đình" }
      ]}
      columns={[
        { title: "Mã số", dataIndex: "code", width: 100, render: (v) => <Tag color="blue">{v}</Tag> },
        { title: "Tên loại", dataIndex: "label", width: 200 },
        { title: "Mô tả / Ứng dụng", dataIndex: "desc" }
      ]}
    />

    <Divider />

    <Title level={5}>2. Danh mục Loại bản giấy tờ (LoaiBan)</Title>
    <Paragraph>Sử dụng trong thành phần hồ sơ để xác định tính pháp lý của file đính kèm:</Paragraph>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "0", code: 0, label: "Bản chính", desc: "Tài liệu gốc được scan trực tiếp (PDF ký số/ảnh chụp bản gốc)" },
        { key: "1", code: 1, label: "Bản sao", desc: "Bản photocopy công chứng hoặc bản sao từ sổ gốc" },
        { key: "2", code: 2, label: "Bản điện tử", desc: "Tài liệu được ký số từ các cơ quan có thẩm quyền hoặc sinh tự động từ hệ thống" }
      ]}
      columns={[
        { title: "Mã số", dataIndex: "code", width: 100, render: (v) => <Tag color="green">{v}</Tag> },
        { title: "Tên loại", dataIndex: "label", width: 200 },
        { title: "Mô tả / Yêu cầu", dataIndex: "desc" }
      ]}
    />

    <Divider />

    <Title level={5}>3. Danh mục Trạng thái hồ sơ DVC</Title>
    <Paragraph>Các trạng thái được quy định bởi Cổng DVC Quốc gia. Sử dụng trong trường <code>TrangThai</code> của B6 (CapNhatTrangThai):</Paragraph>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "1", code: 1, desc: "Mới đăng ký", note: "Sau khi công dân/doanh nghiệp nộp hồ sơ thành công trên cổng DVC" },
        { key: "2", code: 2, desc: "Được tiếp nhận", note: "Bộ phận một cửa tiếp nhận để thụ lý" },
        { key: "3", code: 3, desc: "Không được tiếp nhận", note: "Bộ phận một cửa từ chối" },
        { key: "4", code: 4, desc: "Đang xử lý", note: "Chuyển phòng ban chuyên môn thẩm định" },
        { key: "5", code: 5, desc: "Yêu cầu bổ sung giấy tờ", note: "Cán bộ yêu cầu bổ sung thông tin" },
        { key: "6", code: 6, desc: "Yêu cầu thực hiện nghĩa vụ tài chính", note: "Thuế, phí, lệ phí" },
        { key: "7", code: 7, desc: "Công dân yêu cầu rút hồ sơ", note: "Công dân/Doanh nghiệp yêu cầu rút/hủy" },
        { key: "8", code: 8, desc: "Dừng xử lý", note: "Cán bộ dừng xử lý do không đủ điều kiện" },
        { key: "9", code: 9, desc: "Đã xử lý xong", note: "Chuyển trả kết quả cho bộ phận một cửa" },
        { key: "10", code: 10, desc: "Đã trả kết quả", note: "Trả kết quả cho công dân/doanh nghiệp" },
      ]}
      columns={[
        { title: "Mã", dataIndex: "code", width: 60 },
        { title: "Mô tả", dataIndex: "desc", width: 250 },
        { title: "Ghi chú", dataIndex: "note" },
      ]}
    />

    <Divider />

    <Title level={5}>4. Danh mục Loại phí/Lệ phí (LoaiPhiLePhi)</Title>
    <Paragraph>Sử dụng trong mảng <code>DanhSachLePhi</code> của B4 (NoiHoSo) và B6 (CapNhatTrangThai) để xác định loại thuế/phí:</Paragraph>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "1", code: "1", label: "Phí, lệ phí thông thường", desc: "Lấy từ danh mục phí/lệ phí của CSDL TTHC Quốc gia" },
        { key: "2", code: "2", label: "Phí thẩm định cấp phép", desc: "Phí thẩm định hồ sơ đăng ký sàn TMĐT" },
        { key: "3", code: "3", label: "Phí gia hạn", desc: "Phí gia hạn thời gian xử lý hồ sơ" },
      ]}
      columns={[
        { title: "Mã số", dataIndex: "code", width: 100, render: (v) => <Tag color="purple">{v}</Tag> },
        { title: "Tên loại", dataIndex: "label", width: 200 },
        { title: "Mô tả", dataIndex: "desc" },
      ]}
    />

    <Divider />

    <Title level={5}>5. Danh mục Hình thức thu lệ phí (HinhThucThu)</Title>
    <Paragraph>Sử dụng khi cập nhật trạng thái yêu cầu thanh toán tài chính (Trạng thái 6):</Paragraph>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "1", code: "1", label: "Lệ phí thu khi tiếp nhận hồ sơ", desc: "Thu phí ngay khi bộ phận một cửa nhận hồ sơ (phổ biến)" },
        { key: "2", code: "2", label: "Lệ phí thu khi bổ sung hồ sơ", desc: "Thu phí phát sinh thêm trong quá trình xử lý" },
        { key: "4", code: "4", label: "Lệ phí thu khi trả kết quả", desc: "Thu phí tại bước cuối cùng trước khi trao giấy phép điện tử/bản giấy" }
      ]}
      columns={[
        { title: "Mã số", dataIndex: "code", width: 100, render: (v) => <Tag color="orange">{v}</Tag> },
        { title: "Tên loại", dataIndex: "label", width: 250 },
        { title: "Mô tả chi tiết", dataIndex: "desc" }
      ]}
    />

    <Divider />

    <Title level={5}>6. Danh mục Trạng thái thanh toán (TrangThaiThanhToan)</Title>
    <Paragraph>Sử dụng trong thông tin hồ sơ để xác định trạng thái nghĩa vụ tài chính:</Paragraph>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "0", code: 0, label: "Chưa thanh toán", desc: "Hồ sơ chưa phát sinh hoặc chưa yêu cầu thanh toán" },
        { key: "1", code: 1, label: "Đã thanh toán", desc: "Doanh nghiệp/Công dân đã hoàn thành nghĩa vụ tài chính" },
      ]}
      columns={[
        { title: "Mã số", dataIndex: "code", width: 100, render: (v) => <Tag color="geekblue">{v}</Tag> },
        { title: "Tên loại", dataIndex: "label", width: 150 },
        { title: "Mô tả", dataIndex: "desc" },
      ]}
    />

    <Divider />

    <Title level={5}>7. Danh mục Mã kết quả thay thế (MaKetQua)</Title>
    <Paragraph>Sử dụng trong <code>GiayToDinhKem</code> của B4 (NoiHoSo) để phân loại file đính kèm:</Paragraph>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "1", code: "KQ.DVC.THONGTIN", label: "Thông tin đăng ký chung", desc: "File mô tả thông tin nền tảng, giấy tờ đăng ký" },
        { key: "2", code: "KQ.DVC.GIAYTOBOSUNG", label: "Giấy tờ bổ sung", desc: "File bổ sung theo yêu cầu của cán bộ xử lý" },
        { key: "3", code: "KQ.DVC.KETQUA", label: "Kết quả xử lý", desc: "File kết quả phát sinh trong quá trình xử lý (B6)" },
      ]}
      columns={[
        { title: "Mã số", dataIndex: "code", width: 200, render: (v) => <Tag color="cyan">{v}</Tag> },
        { title: "Tên loại", dataIndex: "label", width: 200 },
        { title: "Mô tả", dataIndex: "desc" },
      ]}
    />
  </div>
);

const TabErrors: React.FC = () => (
  <div>
    <Title level={5} style={{ marginTop: 0 }}>1. Bảng mã lỗi HTTP</Title>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "1", code: 200, desc: "Thành công" },
        { key: "2", code: 400, desc: "Truyền thiếu các thông tin yêu cầu ở body API" },
        { key: "3", code: 401, desc: "Chưa có hoặc không đúng token access" },
        { key: "4", code: 403, desc: "Không có quyền gọi API" },
        { key: "5", code: 404, desc: "Không tìm thấy API" },
        { key: "6", code: 502, desc: "Lỗi kết nối tới Cổng DVC Bộ (proxy timeout/refused)" },
      ]}
      columns={[
        { title: "HTTP Code", dataIndex: "code", width: 100, render: (v) => <Tag>{v}</Tag> },
        { title: "Mô tả", dataIndex: "desc" },
      ]}
    />
    <Divider />
    <Title level={5}>2. Danh mục trạng thái hồ sơ</Title>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "1", code: 1, desc: "Mới đăng ký" },
        { key: "2", code: 2, desc: "Được tiếp nhận" },
        { key: "3", code: 3, desc: "Không được tiếp nhận" },
        { key: "4", code: 4, desc: "Đang xử lý" },
        { key: "5", code: 5, desc: "Yêu cầu bổ sung giấy tờ" },
        { key: "6", code: 6, desc: "Yêu cầu thực hiện nghĩa vụ tài chính" },
        { key: "7", code: 7, desc: "Công dân yêu cầu rút hồ sơ" },
        { key: "8", code: 8, desc: "Dừng xử lý" },
        { key: "9", code: 9, desc: "Đã xử lý xong" },
        { key: "10", code: 10, desc: "Đã trả kết quả" },
      ]}
      columns={[
        { title: "Mã", dataIndex: "code", width: 60 },
        { title: "Mô tả", dataIndex: "desc" },
      ]}
    />
  </div>
);

const DvcSyncTestPage: React.FC = () => (
  <div style={{ maxWidth: PAGE_MAX_WIDTH, margin: "0 auto" }}>
    <div style={{ marginBottom: 12 }}><AutoBreadcrumb /></div>
    <PlaygroundCard />
    <DocsCard />
  </div>
);

export default withAuthorization(DvcSyncTestPage, "");
