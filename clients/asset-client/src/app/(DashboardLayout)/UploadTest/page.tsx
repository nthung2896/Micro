"use client";
import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  AppstoreOutlined,
  BookOutlined,
  CloudDownloadOutlined,
  CodeOutlined,
  CopyOutlined,
  FileProtectOutlined,
  KeyOutlined,
  ToolOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import withAuthorization from "@/libs/authentication";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import LoaiTaiLieuPlatformConstant from "@/constants/LoaiTaiLieuPlatformConstant";
import LoaiTaiLieuContractConstant from "@/constants/LoaiTaiLieuContractConstant";
import LoaiTaiLieuRutTienKyQuyConstant from "@/constants/LoaiTaiLieuRutTienKyQuyConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import fileServerService from "@/libs/file-uploader/fileServer.service";

const { Title, Text, Paragraph } = Typography;

const PAGE_MAX_WIDTH = 1100;

const DEFAULT_ACCEPT = ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx";

// Preset đuôi file cho dropdown nhanh trong Playground.
const ACCEPT_PRESETS: { label: string; value: string }[] = [
  { label: "Mặc định (ảnh + office + pdf)", value: DEFAULT_ACCEPT },
  { label: "Chỉ PDF", value: ".pdf" },
  { label: "Ảnh", value: ".jpg,.jpeg,.png,.webp" },
  { label: "Office (doc, xls)", value: ".doc,.docx,.xls,.xlsx" },
  { label: "PDF + Office", value: ".pdf,.doc,.docx,.xls,.xlsx" },
];

const randomGuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

const codeBlockDark: React.CSSProperties = {
  background: "#1e1e1e",
  color: "#d4d4d4",
  padding: 16,
  borderRadius: 8,
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: "Consolas, 'Courier New', monospace",
  maxHeight: 520,
  overflow: "auto",
  whiteSpace: "pre",
};

const cardTitle = (icon: React.ReactNode, title: string) => (
  <Space size={8}>
    {icon}
    <span>{title}</span>
  </Space>
);

// =====================================================================
// ===== Page layout: 2 card — Playground + Docs (Tabs) ================
// =====================================================================

const UploadTestPage: React.FC = () => {
  return (
    <div style={{ maxWidth: PAGE_MAX_WIDTH, margin: "0 auto" }}>
      <div style={{ marginBottom: 12 }}>
        <AutoBreadcrumb items={[{ title: "Test upload file" }]} />
      </div>

      <PlaygroundCard />
      <DocsCard />
    </div>
  );
};

export default withAuthorization(UploadTestPage, "");

// =====================================================================
// ===== Shared: CopyableSnippet ========================================
// =====================================================================

const CopyableSnippet: React.FC<{ code: string; label?: string }> = ({
  code,
  label,
}) => {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      message.success(label ? `Đã copy: ${label}` : "Đã copy");
    } catch {
      message.error("Trình duyệt không cho phép copy");
    }
  };
  return (
    <div
      style={{
        marginTop: 8,
        background: "#1e1e1e",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          background: "#2d2d2d",
          borderBottom: "1px solid #3a3a3a",
        }}
      >
        <Space size={6}>
          <CodeOutlined style={{ color: "#9ca3af" }} />
          <Text style={{ color: "#9ca3af", fontSize: 12 }}>
            {label ?? "snippet"}
          </Text>
        </Space>
        <Tooltip title="Copy vào clipboard">
          <Button
            
            type="primary"
            icon={<CopyOutlined />}
            onClick={onCopy}
          >
            Copy
          </Button>
        </Tooltip>
      </div>
      <pre style={{ ...codeBlockDark, margin: 0, borderRadius: 0, background: "transparent" }}>
        {code}
      </pre>
    </div>
  );
};

// =====================================================================
// ===== PlaygroundCard: form chỉnh params live → snippet copy =========
// =====================================================================

type FieldRule = { show: boolean; required?: boolean; options?: string[] };

const PLATFORM_LOAI_OPTIONS = Object.keys(LoaiTaiLieuPlatformConstant.data);
const CONTRACT_LOAI_OPTIONS = Object.keys(LoaiTaiLieuContractConstant.data);
const KYQUY_LOAI_OPTIONS = Object.keys(LoaiTaiLieuRutTienKyQuyConstant.data);

const CATEGORY_RULES: Record<
  string,
  {
    subCategory: FieldRule;
    taxCode: FieldRule;
    itemId: FieldRule;
    loaiTaiLieu: FieldRule;
    itemIdLabel?: string;
  }
> = {
  platform: {
    subCategory: {
      show: true,
      required: true,
      options: ["NTThongBaoKD", "NTDangKyKDNuocNgoai", "NTTichHop", "NTTichHopNuocNgoai"],
    },
    taxCode: { show: true, required: true },
    itemId: { show: true, required: true },
    loaiTaiLieu: { show: true, required: true, options: PLATFORM_LOAI_OPTIONS },
    itemIdLabel: "itemId (GUID nền tảng)",
  },
  contract: {
    subCategory: { show: false },
    taxCode: { show: true, required: true },
    itemId: { show: true, required: true },
    loaiTaiLieu: { show: true, required: true, options: CONTRACT_LOAI_OPTIONS },
    itemIdLabel: "itemId (GUID hợp đồng)",
  },
  company: {
    subCategory: { show: true, options: ["DKKD", "UyQuyen", "KhacDangKy"] },
    taxCode: { show: true, required: true },
    itemId: { show: false },
    loaiTaiLieu: { show: false },
  },
  avatar: {
    subCategory: { show: false },
    taxCode: { show: false },
    itemId: { show: true, required: true },
    loaiTaiLieu: { show: false },
    itemIdLabel: "itemId (userId)",
  },
  general: {
    subCategory: { show: true },
    taxCode: { show: false },
    itemId: { show: false },
    loaiTaiLieu: { show: false },
  },
  RutTienKyQuy: {
    subCategory: { show: false },
    taxCode: { show: true, required: true },
    itemId: { show: true, required: true },
    loaiTaiLieu: { show: true, required: true, options: KYQUY_LOAI_OPTIONS },
    itemIdLabel: "itemId (GUID hồ sơ rút tiền)",
  },
};

const requiredMark = (label: React.ReactNode, required?: boolean) =>
  required ? (
    <>
      {label} <span style={{ color: "#ff4d4f" }}>*</span>
    </>
  ) : (
    label
  );

const PlaygroundCard: React.FC = () => {
  const [playFile, setPlayFile] = useState<TaiLieuDinhKemType | null>(null);
  const [category, setCategory] = useState<string>(FileCategoryConstant.General);
  const [subCategory, setSubCategory] = useState<string>("");
  const [taxCode, setTaxCode] = useState<string>("");
  const [itemId, setItemId] = useState<string>(randomGuid());
  const [loaiTaiLieu, setLoaiTaiLieu] = useState<string>("");
  const [maxMB, setMaxMB] = useState<number>(50);
  const [accept, setAccept] = useState<string>(DEFAULT_ACCEPT);
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [requiredKySo, setRequiredKySo] = useState<boolean>(false);

  const rule = CATEGORY_RULES[category] ?? CATEGORY_RULES.general;

  const generatedCode = useMemo(() => {
    const lines: string[] = ["<SingleFileUploader", `  value={file}`, `  onChange={setFile}`];
    const constName =
      category === "platform"
        ? "Platform"
        : category === "contract"
          ? "Contract"
          : category === "company"
            ? "Company"
            : category === "avatar"
              ? "Avatar"
              : category === "RutTienKyQuy"
                ? "RutTienKyQuy"
                : "General";
    lines.push(`  category={FileCategoryConstant.${constName}}`);
    if (subCategory) lines.push(`  subCategory="${subCategory}"`);
    if (taxCode) lines.push(`  taxCode="${taxCode}"`);
    if (itemId) lines.push(`  itemId="${itemId}"`);
    if (loaiTaiLieu) lines.push(`  loaiTaiLieu="${loaiTaiLieu}"`);
    if (accept && accept !== DEFAULT_ACCEPT) lines.push(`  accept="${accept}"`);
    if (maxMB !== 50) lines.push(`  maxMB={${maxMB}}`);
    if (readOnly) lines.push(`  readOnly`);
    if (requiredKySo) lines.push(`  requiredKySo`);
    lines.push("/>");

    return `import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);

${lines.join("\n")}`;
  }, [category, subCategory, taxCode, itemId, loaiTaiLieu, accept, maxMB, readOnly, requiredKySo]);

  // Validate đuôi file: tách theo dấu phẩy, mọi entry phải bắt đầu bằng "."
  const acceptInvalid = accept
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .some((s) => !s.startsWith("."));

  return (
    <Card
      className="customCardShadow"
      title={cardTitle(<ToolOutlined />, "Playground — chỉnh params → copy snippet")}
    >
      <Row gutter={[24, 24]}>
        {/* === Cột trái === */}
        <Col xs={24} lg={12}>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={
              <Space size={4} wrap>
                <span>
                  Rule cho <code>{category}</code>:
                </span>
                {rule.subCategory.show && (
                  <Tag color={rule.subCategory.required ? "red" : "default"}>
                    subCategory {rule.subCategory.required ? "required" : "optional"}
                  </Tag>
                )}
                {rule.taxCode.show && (
                  <Tag color={rule.taxCode.required ? "red" : "default"}>
                    taxCode {rule.taxCode.required ? "required" : "optional"}
                  </Tag>
                )}
                {rule.itemId.show && (
                  <Tag color={rule.itemId.required ? "red" : "default"}>
                    itemId {rule.itemId.required ? "required" : "optional"}
                  </Tag>
                )}
                {rule.loaiTaiLieu.show && (
                  <Tag color={rule.loaiTaiLieu.required ? "red" : "default"}>
                    loaiTaiLieu {rule.loaiTaiLieu.required ? "required" : "optional"}
                  </Tag>
                )}
              </Space>
            }
          />

          <Form layout="vertical">
            <Form.Item label={requiredMark("category", true)}>
              <Select
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setSubCategory("");
                  setLoaiTaiLieu("");
                  const next = CATEGORY_RULES[v] ?? CATEGORY_RULES.general;
                  if (!next.taxCode.show) setTaxCode("");
                  if (!next.itemId.show) setItemId("");
                  else if (!itemId || itemId.startsWith("00000000"))
                    setItemId(randomGuid());
                }}
                options={Object.keys(FileCategoryConstant.data).map((k) => ({
                  label: `${k} — ${FileCategoryConstant.getDisplayName(k)}`,
                  value: k,
                }))}
              />
            </Form.Item>

            {rule.subCategory.show && (
              <Form.Item label={requiredMark("subCategory", rule.subCategory.required)}>
                {rule.subCategory.options?.length ? (
                  <Select
                    value={subCategory || undefined}
                    onChange={setSubCategory}
                    allowClear
                    options={rule.subCategory.options.map((s) => ({ label: s, value: s }))}
                    placeholder="Chọn subCategory"
                  />
                ) : (
                  <Input
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="Tuỳ chọn"
                    allowClear
                  />
                )}
              </Form.Item>
            )}

            {(rule.taxCode.show || rule.itemId.show) && (
              <Row gutter={12}>
                {rule.taxCode.show && (
                  <Col span={rule.itemId.show ? 12 : 24}>
                    <Form.Item label={requiredMark("taxCode", rule.taxCode.required)}>
                      <Input
                        value={taxCode}
                        onChange={(e) => setTaxCode(e.target.value)}
                        placeholder="0100123456"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                )}
                {rule.itemId.show && (
                  <Col span={rule.taxCode.show ? 12 : 24}>
                    <Form.Item
                      label={requiredMark(rule.itemIdLabel ?? "itemId (GUID)", rule.itemId.required)}
                      extra="BE reject Guid.Empty — phải là GUID thật."
                    >
                      <Input
                        value={itemId}
                        onChange={(e) => setItemId(e.target.value)}
                        placeholder="xxxxxxxx-xxxx-..."
                        allowClear
                        addonAfter={
                          <Tooltip title="Sinh GUID ngẫu nhiên">
                            <a onClick={() => setItemId(randomGuid())}>↻</a>
                          </Tooltip>
                        }
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            )}

            {rule.loaiTaiLieu.show && (
              <Form.Item
                label={requiredMark(
                  category === "platform"
                    ? "loaiTaiLieu (LoaiTaiLieuPlatformConstant)"
                    : category === "contract"
                      ? "loaiTaiLieu (LoaiTaiLieuContractConstant)"
                      : "loaiTaiLieu (LoaiTaiLieuRutTienKyQuyConstant)",
                  rule.loaiTaiLieu.required,
                )}
              >
                <Select
                  value={loaiTaiLieu || undefined}
                  onChange={(v) => setLoaiTaiLieu(v ?? "")}
                  allowClear
                  placeholder="Chọn loại tài liệu"
                  options={(rule.loaiTaiLieu.options ?? []).map((code) => {
                    const display =
                      category === "platform"
                        ? LoaiTaiLieuPlatformConstant.getDisplayName(code)
                        : category === "contract"
                          ? LoaiTaiLieuContractConstant.getDisplayName(code)
                          : LoaiTaiLieuRutTienKyQuyConstant.getDisplayName(code);
                    return { label: `${code} — ${display}`, value: code };
                  })}
                />
              </Form.Item>
            )}

            <Form.Item
              label="accept (đuôi file cho phép)"
              extra={
                acceptInvalid
                  ? undefined
                  : "Ngăn cách bằng dấu phẩy. BẮT BUỘC có dấu chấm ở đầu (.pdf, .jpg…). Chặn cả drag-drop file sai đuôi."
              }
              validateStatus={acceptInvalid ? "error" : undefined}
              help={
                acceptInvalid
                  ? "Mỗi đuôi phải bắt đầu bằng dấu chấm — ví dụ '.pdf' (không phải 'pdf')."
                  : undefined
              }
            >
              <Space.Compact style={{ width: "100%" }}>
                <Select
                  style={{ width: 240 }}
                  value={
                    ACCEPT_PRESETS.find((p) => p.value === accept)?.value ??
                    "__custom__"
                  }
                  onChange={(v) => {
                    if (v !== "__custom__") setAccept(v);
                  }}
                  options={[
                    ...ACCEPT_PRESETS,
                    { label: "Tuỳ chỉnh…", value: "__custom__" },
                  ]}
                />
                <Input
                  value={accept}
                  onChange={(e) => setAccept(e.target.value)}
                  placeholder=".pdf,.jpg,.png"
                  allowClear
                />
              </Space.Compact>
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="maxMB">
                  <InputNumber
                    value={maxMB}
                    onChange={(v) => setMaxMB(Number(v ?? 50))}
                    min={1}
                    max={500}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tuỳ chọn" style={{ marginBottom: 0 }}>
                  <Space wrap>
                    <Tag
                      color={readOnly ? "blue" : "default"}
                      style={{ cursor: "pointer", padding: "4px 10px" }}
                      onClick={() => setReadOnly(!readOnly)}
                    >
                      readOnly: {String(readOnly)}
                    </Tag>
                    <Tooltip title="BE scan ký số PDF/Office, reject nếu chưa ký hoặc cert không hợp lệ.">
                      <Tag
                        icon={<FileProtectOutlined />}
                        color={requiredKySo ? "purple" : "default"}
                        style={{ cursor: "pointer", padding: "4px 10px" }}
                        onClick={() => setRequiredKySo(!requiredKySo)}
                      >
                        requiredKySo: {String(requiredKySo)}
                      </Tag>
                    </Tooltip>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <Divider>Preview component</Divider>

          <div
            style={{
              padding: 16,
              border: "1px dashed #d9d9d9",
              borderRadius: 8,
              minHeight: 80,
              background: "#fcfcfc",
            }}
          >
            <SingleFileUploader
              value={playFile}
              onChange={setPlayFile}
              category={category}
              subCategory={subCategory || undefined}
              taxCode={taxCode || undefined}
              itemId={itemId || undefined}
              loaiTaiLieu={loaiTaiLieu || undefined}
              accept={accept || undefined}
              maxMB={maxMB}
              readOnly={readOnly}
              requiredKySo={requiredKySo}
            />
          </div>
        </Col>

        {/* === Cột phải: snippet === */}
        <Col xs={24} lg={12}>
          <CopyableSnippet code={generatedCode} label="snippet (live)" />
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
            Chỉ những props khác default mới hiện trong snippet để code gọn.
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

// =====================================================================
// ===== DocsCard: Tabs gom toàn bộ docs ================================
// =====================================================================

const DocsCard: React.FC = () => (
  <Card
    className="customCardShadow"
    style={{ marginTop: 16 }}
    title={cardTitle(<BookOutlined />, "Tài liệu sử dụng")}
  >
    <Tabs
      defaultActiveKey="quickstart"
      items={[
        {
          key: "quickstart",
          label: (
            <Space size={6}>
              <BookOutlined /> Quickstart
            </Space>
          ),
          children: <TabQuickstart />,
        },
        {
          key: "retrieve",
          label: (
            <Space size={6}>
              <CloudDownloadOutlined /> Đọc file
            </Space>
          ),
          children: <TabRetrieve />,
        },
        {
          key: "multidoc",
          label: (
            <Space size={6}>
              <AppstoreOutlined /> Multi-doc Platform
            </Space>
          ),
          children: <TabMultiDoc />,
        },
        {
          key: "reference",
          label: (
            <Space size={6}>
              <KeyOutlined /> Constants & Lỗi
            </Space>
          ),
          children: <TabReference />,
        },
      ]}
    />
  </Card>
);

// =====================================================================
// ===== Tab 1: Quickstart — props + 4 recipe phổ biến =================
// =====================================================================

const RECIPE_AVATAR = `import { useState } from "react";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const [avatar, setAvatar] = useState<TaiLieuDinhKemType | null>(null);

<SingleFileUploader
  value={avatar}
  onChange={setAvatar}
  category={FileCategoryConstant.Avatar}
  itemId={userId}
  accept=".jpg,.jpeg,.png"
  maxMB={5}
  uploadLabel="Đổi avatar"
/>`;

const RECIPE_COMPANY = `import { useState } from "react";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const [dkkd, setDkkd] = useState<TaiLieuDinhKemType | null>(null);

<SingleFileUploader
  value={dkkd}
  onChange={setDkkd}
  category={FileCategoryConstant.Company}
  subCategory="DKKD"
  taxCode={dn.maSoThue}
  accept=".pdf,.jpg,.png"
/>`;

const RECIPE_PLATFORM_SINGLE = `import { useState } from "react";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import LoaiTaiLieuPlatformConstant from "@/constants/LoaiTaiLieuPlatformConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);

<SingleFileUploader
  value={file}
  onChange={setFile}
  category={FileCategoryConstant.Platform}
  subCategory="NTThongBaoKD"
  taxCode={dn.maSoThue}
  itemId={platformId}
  loaiTaiLieu={LoaiTaiLieuPlatformConstant.ChuSoHuuWebsite}
  requiredKySo  // bật scan ký số
/>`;

const RECIPE_CONTRACT = `import { useState } from "react";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import LoaiTaiLieuContractConstant from "@/constants/LoaiTaiLieuContractConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);

<SingleFileUploader
  value={file}
  onChange={setFile}
  category={FileCategoryConstant.Contract}
  taxCode={dn.maSoThue}
  itemId={contractId}
  loaiTaiLieu={LoaiTaiLieuContractConstant.ChungMinhTenMien}
  accept=".pdf"
  requiredKySo
/>`;

const RECIPE_KYQUY = `import { useState } from "react";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import LoaiTaiLieuRutTienKyQuyConstant from "@/constants/LoaiTaiLieuRutTienKyQuyConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);

<SingleFileUploader
  value={file}
  onChange={setFile}
  category={FileCategoryConstant.RutTienKyQuy}
  taxCode={dn.maSoThue}
  itemId={rutTienKyQuyId}
  loaiTaiLieu={LoaiTaiLieuRutTienKyQuyConstant.DonDeNghi}
/>`;

const PROPS_TABLE_DATA: {
  key: string;
  prop: string;
  type: string;
  required: string;
  note: string;
}[] = [
  { key: "1", prop: "value / onChange", type: "TaiLieuDinhKemType | null", required: "Có", note: "Controlled. Phải khai báo useState<TaiLieuDinhKemType | null>(null) — KHÔNG dùng useState(null) (TS infer là null). value=null + có itemId → component tự fetch." },
  { key: "2", prop: "category", type: "string (FileCategoryConstant)", required: "Có", note: "Quyết định path lưu BE + ràng buộc field." },
  { key: "3", prop: "subCategory", type: "string", required: "Tuỳ category", note: "Platform: PlatformManageType. Company: DKKD/UyQuyen/KhacDangKy. Contract: auto." },
  { key: "4", prop: "taxCode", type: "string", required: "Platform/Contract/Company", note: "MST DN chủ quản, regex ^[A-Za-z0-9-]{6,20}$." },
  { key: "5", prop: "itemId", type: "string (GUID)", required: "Platform/Contract/Avatar", note: "Không nhận Guid.Empty. Là FK trỏ hồ sơ — KHÔNG phải Id của TaiLieuDinhKem." },
  { key: "6", prop: "loaiTaiLieu", type: "string", required: "Khuyến nghị Platform/Contract", note: "Phân biệt nhiều file cùng itemId. Code lấy từ LoaiTaiLieuPlatformConstant / LoaiTaiLieuContractConstant." },
  { key: "7", prop: "requiredKySo", type: "boolean", required: "Không", note: "Bật → BE scan PDF/Office, reject nếu chưa ký hoặc cert không hợp lệ." },
  { key: "8", prop: "accept", type: "string", required: "Không", note: "Default: .jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx" },
  { key: "9", prop: "maxMB", type: "number", required: "Không", note: "Default 50. BE cũng enforce qua FileServer:MaxFileSizeMB." },
  { key: "10", prop: "readOnly", type: "boolean", required: "Không", note: "View-only — ẩn nút upload + xoá." },
  { key: "11", prop: "deleteOnConfirm", type: "boolean", required: "Không", note: "Default true. False = chỉ clear state, file vẫn ở server (dọn lúc save form)." },
];

const TabQuickstart: React.FC = () => (
  <div>
    <Title level={5} style={{ marginTop: 0 }}>1. Cách dùng nhanh nhất</Title>
    <Paragraph>
      Component <code>SingleFileUploader</code> là controlled. Mọi case 1
      file/1 itemId đều dùng được — chỉ thay đổi <code>category</code> +
      context theo nghiệp vụ:
    </Paragraph>
    <Alert
      type="warning"
      showIcon
      style={{ marginBottom: 12 }}
      message="Lưu ý useState type"
      description={
        <span>
          Phải khai báo{" "}
          <code>useState&lt;TaiLieuDinhKemType | null&gt;(null)</code> —
          KHÔNG dùng <code>useState(null)</code>. Nếu để TS infer thì state
          chỉ chấp nhận <code>null</code> → <code>setFile(uploadedFile)</code>{" "}
          sẽ báo lỗi <em>"Type 'TaiLieuDinhKemType' is not assignable to
          type 'SetStateAction&lt;null&gt;'"</em>.
        </span>
      }
    />

    <Tabs
      type="card"
      size="small"
      items={[
        {
          key: "avatar",
          label: "Avatar user",
          children: (
            <>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                1 user — 1 file. Component tự load lại khi reload trang.
              </Paragraph>
              <CopyableSnippet code={RECIPE_AVATAR} label="Avatar recipe" />
            </>
          ),
        },
        {
          key: "company",
          label: "ĐKKD doanh nghiệp",
          children: (
            <>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Lưu vào folder của MST + sub category (DKKD / UyQuyen / KhacDangKy).
              </Paragraph>
              <CopyableSnippet code={RECIPE_COMPANY} label="Company DKKD recipe" />
            </>
          ),
        },
        {
          key: "platform",
          label: "Nền tảng TMĐT (single doc)",
          children: (
            <>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                1 loại tài liệu cho 1 platformId. Nếu cần upload đủ 6 loại theo
                spec → dùng <code>PlatformDocumentList</code> (xem tab "Multi-doc").
              </Paragraph>
              <CopyableSnippet code={RECIPE_PLATFORM_SINGLE} label="Platform single recipe" />
            </>
          ),
        },
        {
          key: "contract",
          label: "Hợp đồng chứng thực",
          children: (
            <>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Spec hiện chỉ có 1 loại — <code>ChungMinhTenMien</code>. BE tự
                gắn subCategory="AuthenticationContract".
              </Paragraph>
              <CopyableSnippet code={RECIPE_CONTRACT} label="Contract recipe" />
            </>
          ),
        },
        {
          key: "kyquy",
          label: "Rút tiền ký quỹ",
          children: (
            <>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Spec hiện có 2 loại — <code>DonDeNghi</code> (bắt buộc) +{" "}
                <code>VanBanKemTheo</code>. Mỗi loại dùng 1 ô upload riêng,
                cùng <code>itemId</code> = id hồ sơ rút tiền.
              </Paragraph>
              <CopyableSnippet code={RECIPE_KYQUY} label="RutTienKyQuy recipe" />
            </>
          ),
        },
      ]}
    />

    <Divider />

    <Title level={5}>2. Props chính</Title>
    <Table
      size="small"
      pagination={false}
      dataSource={PROPS_TABLE_DATA}
      columns={[
        { title: "Prop", dataIndex: "prop", width: 170, render: (v) => <code>{v}</code> },
        { title: "Type", dataIndex: "type", width: 200, render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
        { title: "Required", dataIndex: "required", width: 130 },
        { title: "Ghi chú", dataIndex: "note" },
      ]}
    />
  </div>
);

// =====================================================================
// ===== Tab 2: Đọc file (Retrieve + Auto-load demo) ===================
// =====================================================================

const SNIPPET_GET_URL = `import fileServerService from "@/libs/file-uploader/fileServer.service";

// 1 dòng. URL dùng cho <Avatar src> / <img> / <a href>.
const url = await fileServerService.getUrlByItemId(userId);`;

const SNIPPET_AVATAR_HOOK = `import { useEffect, useState } from "react";
import { Avatar } from "antd";
import fileServerService from "@/libs/file-uploader/fileServer.service";

function UserAvatar({ userId, hoTen }: { userId: string; hoTen?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!userId) return;
    fileServerService.getUrlByItemId(userId).then(setUrl);
  }, [userId]);
  return <Avatar src={url ?? undefined}>{hoTen?.[0]}</Avatar>;
}`;

const SNIPPET_LATEST = `// Cần cả metadata (size, ext, ngày tạo) → getLatestByItemId
const tl = await fileServerService.getLatestByItemId(userId, "avatar");
if (tl) {
  console.log(tl.tenTaiLieu, tl.kichThuoc);
  const url = fileServerService.getUrl(tl);
}`;

const SNIPPET_FILTER = `// 1 itemId có nhiều loại tài liệu → truyền loaiTaiLieu để lọc
const avatarUrl = await fileServerService.getUrlByItemId(userId, "avatar");
const ownerUrl  = await fileServerService.getUrlByItemId(platformId, "ChuSoHuuWebsite");`;

const TabRetrieve: React.FC = () => {
  // Auto-load demo state
  const [demoItemId, setDemoItemId] = useState<string>("");
  const [demoLoai, setDemoLoai] = useState<string>("");
  const [reloadKey, setReloadKey] = useState(0);
  const [demoFile, setDemoFile] = useState<TaiLieuDinhKemType | null>(null);
  const [fetchResult, setFetchResult] = useState<"idle" | "loading" | "found" | "notfound">("idle");

  const reload = async () => {
    setDemoFile(null);
    setReloadKey((k) => k + 1);
    if (!demoItemId) {
      setFetchResult("idle");
      return;
    }
    setFetchResult("loading");
    try {
      const tl = await fileServerService.getLatestByItemId(demoItemId, demoLoai || undefined);
      setFetchResult(tl ? "found" : "notfound");
    } catch {
      setFetchResult("notfound");
    }
  };

  return (
    <div>
      <Title level={5} style={{ marginTop: 0 }}>1. Lấy URL nhanh cho Avatar / Image</Title>
      <CopyableSnippet code={SNIPPET_GET_URL} label="getUrlByItemId" />

      <Title level={5} style={{ marginTop: 20 }}>2. Component UserAvatar tái dùng</Title>
      <CopyableSnippet code={SNIPPET_AVATAR_HOOK} label="UserAvatar hook" />

      <Title level={5} style={{ marginTop: 20 }}>3. Cần metadata đầy đủ</Title>
      <CopyableSnippet code={SNIPPET_LATEST} label="getLatestByItemId" />

      <Title level={5} style={{ marginTop: 20 }}>4. Lọc theo loaiTaiLieu</Title>
      <CopyableSnippet code={SNIPPET_FILTER} label="filter by loaiTaiLieu" />

      <Divider />

      <Title level={5}>So sánh 3 API</Title>
      <Table
        size="small"
        pagination={false}
        dataSource={[
          { key: "1", api: "getByItemId(itemId)", returns: "TaiLieuDinhKemType[]", use: "List đầy đủ — hiển thị danh sách file đính kèm." },
          { key: "2", api: "getLatestByItemId(itemId, loaiTaiLieu?)", returns: "TaiLieuDinhKemType | null", use: "1 file mới nhất + metadata." },
          { key: "3", api: "getUrlByItemId(itemId, loaiTaiLieu?)", returns: "string | null", use: "Chỉ URL — render Avatar / img." },
        ]}
        columns={[
          { title: "API", dataIndex: "api", width: 300, render: (v) => <code>{v}</code> },
          { title: "Trả về", dataIndex: "returns", width: 220, render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
          { title: "Khi nào dùng", dataIndex: "use" },
        ]}
      />

      <Divider />

      <Title level={5}>Auto-load: SingleFileUploader tự fetch khi mount</Title>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={
          <span>
            Khi <code>value=null</code> + có <code>itemId</code> → uploader tự
            gọi <code>getLatestByItemId</code> và truyền lên parent qua{" "}
            <code>onChange</code>. Reload trang → file đã upload tự hiện lại.
          </span>
        }
      />

      <Row gutter={12}>
        <Col xs={24} md={14}>
          <Form.Item label="itemId (GUID)" style={{ marginBottom: 12 }}>
            <Input
              value={demoItemId}
              onChange={(e) => setDemoItemId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-..."
              allowClear
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={10}>
          <Form.Item label="loaiTaiLieu (tuỳ chọn)" style={{ marginBottom: 12 }}>
            <Input
              value={demoLoai}
              onChange={(e) => setDemoLoai(e.target.value)}
              placeholder="vd. ChuSoHuuWebsite"
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>

      <Button
        type="primary"
        onClick={reload}
        loading={fetchResult === "loading"}
        style={{ marginBottom: 12 }}
      >
        Thử tải uploader
      </Button>

      {fetchResult === "found" && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 12 }}
          message="Tìm thấy file — uploader sẽ hiển thị file đã upload."
        />
      )}
      {fetchResult === "notfound" && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="Không tìm thấy file nào khớp"
          description={
            <span>
              <code>itemId</code> phải là <strong>FK trỏ hồ sơ</strong> (platformId/contractId/userId),
              KHÔNG phải <code>Id</code> (PK của TaiLieuDinhKem).
            </span>
          }
        />
      )}

      <div
        style={{
          padding: 16,
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          minHeight: 80,
          background: "#fcfcfc",
        }}
      >
        {demoItemId ? (
          <SingleFileUploader
            key={reloadKey}
            value={demoFile}
            onChange={setDemoFile}
            category={FileCategoryConstant.General}
            itemId={demoItemId}
            loaiTaiLieu={demoLoai || undefined}
            uploadLabel="Tải lên (demo)"
          />
        ) : (
          <Text type="secondary">Nhập itemId để xem demo.</Text>
        )}
      </div>
    </div>
  );
};

// =====================================================================
// ===== Tab 3: Multi-doc Platform =====================================
// =====================================================================

const SNIPPET_PDL_BASIC = `import PlatformDocumentList from "@/components/upload-file/PlatformDocumentList";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";

// Uncontrolled: tự fetch theo platformId, group theo loaiTaiLieu.
<PlatformDocumentList
  platformId={platformId}
  platformType={PlatformManageTypeConstant.NTThongBaoKD}
  taxCode={dn.maSoThue}
/>`;

const SNIPPET_PDL_CONTROLLED = `import { useState } from "react";
import PlatformDocumentList, {
  validatePlatformDocs,
  PlatformDocumentMap,
} from "@/components/upload-file/PlatformDocumentList";

const [docs, setDocs] = useState<PlatformDocumentMap>({});

<PlatformDocumentList
  platformId={platformId}
  platformType={platformType}
  taxCode={dn.maSoThue}
  value={docs}
  onChange={setDocs}
  requiredKySo
/>

// Validate khi submit:
const missing = validatePlatformDocs(platformType, docs);
if (missing.length) {
  message.error(\`Thiếu: \${missing.join(", ")}\`);
  return;
}`;

const TabMultiDoc: React.FC = () => (
  <div>
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
      message="Khi nào dùng?"
      description={
        <span>
          Hồ sơ <strong>Nền tảng TMĐT</strong> cần upload nhiều tài liệu khác
          loại (owner, products, price, terms, privacy, domain) cho cùng 1{" "}
          <code>platformId</code>. KHÔNG dùng nhiều <code>SingleFileUploader</code>{" "}
          rời rạc — dùng wrapper <code>PlatformDocumentList</code> để fetch 1 lần,
          group theo <code>loaiTaiLieu</code>, render đúng vị trí.
        </span>
      }
    />

    <Title level={5} style={{ marginTop: 0 }}>1. Uncontrolled (đơn giản)</Title>
    <CopyableSnippet code={SNIPPET_PDL_BASIC} label="PDL uncontrolled" />

    <Title level={5} style={{ marginTop: 20 }}>2. Controlled (tích hợp form)</Title>
    <CopyableSnippet code={SNIPPET_PDL_CONTROLLED} label="PDL controlled" />

    <Divider />

    <Title level={5}>Danh mục 6 tài liệu chuẩn (theo spec)</Title>
    <Paragraph type="secondary" style={{ marginBottom: 8 }}>
      Cả 4 <code>PlatformManageType</code> đều dùng cùng 6 loại. Cấu hình tại{" "}
      <code>constants/PlatformDocumentCatalog.ts</code>. Mã code lấy từ{" "}
      <code>LoaiTaiLieuPlatformConstant</code>.
    </Paragraph>
    <Table
      size="small"
      pagination={false}
      dataSource={PLATFORM_LOAI_OPTIONS.map((code, i) => ({
        key: code,
        order: i + 1,
        code,
        label: LoaiTaiLieuPlatformConstant.getDisplayName(code),
      }))}
      columns={[
        { title: "#", dataIndex: "order", width: 50 },
        { title: "Code", dataIndex: "code", width: 220, render: (v) => <Tag>{v}</Tag> },
        { title: "Tên hiển thị", dataIndex: "label" },
      ]}
    />

    <Divider />

    <Title level={5}>Cấu trúc lưu trên disk</Title>
    <Paragraph type="secondary" style={{ marginBottom: 8 }}>
      Tất cả file của 1 platform nằm cùng folder, phân biệt qua{" "}
      <code>LoaiTaiLieu</code> trong DB:
    </Paragraph>
    <pre style={codeBlockDark}>
      {`wwwroot/uploads/platform/2026/05/25/{MST}/NTThongBaoKD/{platformId}/
  ├── {guid1}_owner.png       → LoaiTaiLieu=ChuSoHuuWebsite
  ├── {guid2}_products.png    → LoaiTaiLieu=HangHoaDichVu
  └── {guid3}_privacy.pdf     → LoaiTaiLieu=ChinhSachBaoMat`}
    </pre>
  </div>
);

// =====================================================================
// ===== Tab 4: Constants & Lỗi BE ======================================
// =====================================================================

const SNIPPET_CONSTANTS = `// FE (Client/src/constants/)
import FileCategoryConstant            from "@/constants/FileCategoryConstant";
import PlatformManageTypeConstant      from "@/constants/PlatformManageTypeConstant";
import LoaiTaiLieuPlatformConstant     from "@/constants/LoaiTaiLieuPlatformConstant";
import LoaiTaiLieuContractConstant     from "@/constants/LoaiTaiLieuContractConstant";
import LoaiTaiLieuRutTienKyQuyConstant from "@/constants/LoaiTaiLieuRutTienKyQuyConstant";

LoaiTaiLieuPlatformConstant.ChuSoHuuWebsite              // "ChuSoHuuWebsite"
LoaiTaiLieuPlatformConstant.getDisplayName("ChuSoHuuWebsite")
LoaiTaiLieuPlatformConstant.getDropdownList()            // [{label, value}, ...]

// BE Hinet.Api (Hinet.Service/Constant/)
using Hinet.Service.Constant;
LoaiTaiLieuPlatformConstant.IsValid(code)                // bool

// BE Hinet.FileServer (Hinet.FileServer/Configuration/) — standalone
using Hinet.FileServer.Configuration;
FileCategoryConstant.Platform
LoaiTaiLieuPlatformConstant.All                          // HashSet<string>`;

const TabReference: React.FC = () => (
  <div>
    <Title level={5} style={{ marginTop: 0 }}>1. Mirror 3 tầng FE ↔ BE</Title>
    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
      Mọi mã code được mirror sang BE để type-safe + validate. Khi spec đổi
      phải sửa đồng bộ 3 nơi.
    </Paragraph>
    <CopyableSnippet code={SNIPPET_CONSTANTS} label="constants" />

    <Divider />

    <Title level={5}>2. Bảng Constants</Title>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "1", name: "FileCategoryConstant", values: "platform, contract, company, avatar, general, RutTienKyQuy", note: "Cấp 1 — quyết định path lưu." },
        { key: "2", name: "PlatformManageTypeConstant", values: "NTThongBaoKD, NTDangKyKDNuocNgoai, NTTichHop, NTTichHopNuocNgoai", note: "subCategory khi category=platform." },
        { key: "3", name: "LoaiTaiLieuPlatformConstant", values: "ChuSoHuuWebsite, HangHoaDichVu, ThongTinGia, DieuKienGiaoDichChung, ChinhSachBaoMat, SoHuuTenMien", note: "loaiTaiLieu cho nền tảng (6 loại)." },
        { key: "4", name: "LoaiTaiLieuContractConstant", values: "ChungMinhTenMien", note: "loaiTaiLieu cho hợp đồng chứng thực (1 loại)." },
        { key: "5", name: "LoaiTaiLieuRutTienKyQuyConstant", values: "DonDeNghi, VanBanKemTheo", note: "loaiTaiLieu cho rút tiền ký quỹ (2 loại)." },
      ]}
      columns={[
        { title: "Constant", dataIndex: "name", width: 240, render: (v) => <code>{v}</code> },
        { title: "Values", dataIndex: "values" },
        { title: "Ghi chú", dataIndex: "note", width: 220 },
      ]}
    />

    <Divider />

    <Title level={5}>
      <Space size={6}>
        <WarningOutlined style={{ color: "#faad14" }} />
        3. Lỗi BE thường gặp
      </Space>
    </Title>
    <Table
      size="small"
      pagination={false}
      dataSource={[
        { key: "1", code: "—", msg: "Category không hợp lệ", cause: "Sai giá trị Category — phải là 1 trong FileCategoryConstant." },
        { key: "2", code: "—", msg: "TaxCode là bắt buộc", cause: "Platform/Contract/Company yêu cầu TaxCode." },
        { key: "3", code: "—", msg: "TaxCode không đúng định dạng", cause: "Regex ^[A-Za-z0-9-]{6,20}$ — không chấp nhận ký tự lạ." },
        { key: "4", code: "—", msg: "ItemId là bắt buộc cho category 'platform'", cause: "Truyền null hoặc Guid.Empty — phải GUID thật." },
        { key: "5", code: "—", msg: "Kích thước file vượt quá giới hạn 50MB", cause: "FileServer:MaxFileSizeMB trong appsettings." },
        { key: "6", code: "100103", msg: "File PDF yêu cầu phải có chữ ký số nhưng chưa được ký", cause: "requiredKySo=true + PDF chưa có cert." },
        { key: "7", code: "100104", msg: "File PDF có chữ ký số nhưng không hợp lệ", cause: "Cert hết hạn / PDF bị sửa sau khi ký." },
        { key: "8", code: "100105", msg: "Chứng thư số không trùng với chứng thư đang được chọn", cause: "serialNumber không match cert trong file." },
      ]}
      columns={[
        { title: "Code", dataIndex: "code", width: 80 },
        { title: "Message", dataIndex: "msg", width: 360 },
        { title: "Nguyên nhân", dataIndex: "cause" },
      ]}
    />
  </div>
);
