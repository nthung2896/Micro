"use client";

import React, { useState } from "react";
import { Card, Col, Descriptions, Image as AntImage, Row, Tag, Typography } from "antd";
import {
  BankOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  LockOutlined,
  MessageOutlined,
  DollarCircleOutlined,
  CreditCardOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { PlatformManageType } from "@/types/platformManage/dto";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import CompanyInfoStatusConstant from "@/constants/CompanyInfoStatusConstant";
import PlatformTypeConstant from "@/constants/PlatformTypeConstant";
import PlatformFunctionConstant from "@/constants/PlatformFunctionConstant";
import formatDate from "@/utils/formatDate";
import { buildFileUrl } from "@/utils/file";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const { Text, Title } = Typography;

/* ─── Shared styles ─────────────────────────────────── */
const LABEL_STYLE: React.CSSProperties = {
  width: 210,
  fontWeight: 500,
  background: "#fafafa",
};

const CONTENT_STYLE: React.CSSProperties = {
  background: "#fff",
};

/* ─── Render helpers ─────────────────────────────────── */
const renderText = (value?: string | null) => value?.trim() || "—";

const renderDomain = (domain?: string | null) => {
  if (!domain?.trim()) return "—";
  const href = domain.startsWith("http") ? domain : `https://${domain}`;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {domain}
    </a>
  );
};

const renderMultiline = (value?: string | null) => (
  <span style={{ whiteSpace: "pre-wrap" }}>{renderText(value)}</span>
);

const renderEmail = (value?: string | null) =>
  value?.trim() ? <a href={`mailto:${value}`}>{value}</a> : "—";

const renderLogo = (path?: string | null, alt = "Logo") =>
  path ? (
    <AntImage
      src={buildFileUrl(path)}
      alt={alt}
      width={72}
      height={72}
      style={{
        objectFit: "contain",
        borderRadius: 8,
        border: "1px solid #f0f0f0",
        background: "#fff",
        padding: 4,
      }}
      preview
    />
  ) : (
    "—"
  );

/* ─── Grid styles (bảng so sánh đại diện) ─────────── */
const comparisonGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "64px minmax(170px, 1fr) minmax(220px, 1.35fr) minmax(220px, 1.35fr)",
  minWidth: 820,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  overflow: "hidden",
};

const comparisonHeaderCellStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontWeight: 600,
  color: "#334155",
  background: "#f8fafc",
  borderRight: "1px solid #e2e8f0",
  borderBottom: "1px solid #e2e8f0",
};

const comparisonCellStyle: React.CSSProperties = {
  padding: 12,
  borderRight: "1px solid #e2e8f0",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "pre-wrap",
};

const comparisonIndexCellStyle: React.CSSProperties = {
  ...comparisonCellStyle,
  textAlign: "center",
  fontWeight: 600,
  color: "#475569",
};

const comparisonContentCellStyle: React.CSSProperties = {
  ...comparisonCellStyle,
  fontWeight: 500,
  color: "#334155",
};

/* ─── Section theming ────────────────────────────────── */
type SectionTheme = {
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const SECTION_THEMES = {
  hoSo: {
    title: "Thông tin xử lý hồ sơ",
    icon: <FileTextOutlined />,
    color: "#0355a2",
    bg: "#e6f4ff",
  },
  chuQuan: {
    title: "1. Thông tin chủ quản nền tảng thương mại điện tử",
    icon: <BankOutlined />,
    color: "#722ed1",
    bg: "#f9f0ff",
  },
  nenTang: {
    title: "3. Thông tin nền tảng / Ứng dụng TMĐT",
    icon: <GlobalOutlined />,
    color: "#08979c",
    bg: "#e6fffb",
  },
  daiDien: {
    title: "2. Thông tin người đại diện pháp luật và người chịu trách nhiệm quản lý và vận hành nền tảng",
    icon: <IdcardOutlined />,
    color: "#389e0d",
    bg: "#f6ffed",
  },
  daiDienUyQuyen: {
    title: "2.1. Thông tin đại diện được chỉ định theo uỷ quyền tại Việt Nam",
    icon: <IdcardOutlined />,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  phapNhanUyQuyen: {
    title: "2.2. Thông tin pháp nhân được chỉ định theo ủy quyền tại Việt Nam",
    icon: <BankOutlined />,
    color: "#722ed1",
    bg: "#f9f0ff",
  },
  dauMoiUyQuyen: {
    title: "2.3. Đầu mối liên hệ ủy quyền",
    icon: <IdcardOutlined />,
    color: "#389e0d",
    bg: "#f6ffed",
  },
  vanHanh: {
    title: "2.4. Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại trực tuyến",
    icon: <IdcardOutlined />,
    color: "#08979c",
    bg: "#e6fffb",
  },
  chinhSach: {
    title: "4. Quy chế và các chính sách hoạt động của nền tảng số",
    icon: <FileTextOutlined />,
    color: "#d97706",
    bg: "#fef3c7",
  },
} satisfies Record<string, SectionTheme>;

const SectionTitle: React.FC<SectionTheme> = ({ title, icon, color, bg }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 6,
        background: bg,
        color,
        fontSize: 15,
      }}
    >
      {icon}
    </span>
    <span style={{ color, fontWeight: 600, fontSize: 14 }}>{title}</span>
  </span>
);

interface SectionCardProps {
  theme: SectionTheme;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ theme, children }) => (
  <Card
    size="small"
    title={<SectionTitle {...theme} />}
    styles={{
      header: {
        minHeight: 44,
        background: "#fafafa",
        borderBottom: `1px solid ${theme.bg}`,
      },
      body: { padding: "12px 16px" },
    }}
    style={{ marginBottom: 16 }}
  >
    {children}
  </Card>
);

/* ─── Props ──────────────────────────────────────────── */
interface DetailInfoTabProps {
  item: PlatformManageType;
  ispOptions: { label: string; value: string }[];
}

/* ─── Component ──────────────────────────────────────── */
const DetailInfoTab: React.FC<DetailInfoTabProps> = ({ item }) => {
  const [valueDKKD, setValueDKKD] = useState<TaiLieuDinhKemType | null>(null);
  const [valueDangKyUyQuyen, setValueDangKyUyQuyen] = useState<TaiLieuDinhKemType | null>(null);
  const platformManageTypeId = item.platformManageTypeId;
  const isNuocNgoaiUyQuyen = platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai";
  const isTichHop = platformManageTypeId === "NTTichHop" || platformManageTypeId === "NTTichHopNuocNgoai";
  const isTichHopNuocNgoai = platformManageTypeId === "NTTichHopNuocNgoai";

  let chuQuanTitle = "1. Thông tin chủ quản nền tảng thương mại điện tử";
  let phapNhanUyQuyenTitle = "2.2. Thông tin pháp nhân được chỉ định theo ủy quyền tại Việt Nam";
  let daiDienUyQuyenTitle = "2.1. Thông tin đại diện được chỉ định theo uỷ quyền tại Việt Nam";
  let dauMoiUyQuyenTitle = "2.3. Đầu mối liên hệ ủy quyền";
  let vanHanhTitle = "2.4. Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại trực tuyến";
  let nenTangTitle = "3. Thông tin nền tảng / Ứng dụng TMĐT";
  let chinhSachTitle = "4. Quy chế và các chính sách hoạt động của nền tảng số";

  if (platformManageTypeId === "NTDangKyKDNuocNgoai") {
    phapNhanUyQuyenTitle = "1. Thông tin pháp nhân được chỉ định theo ủy quyền tại Việt Nam";
    chuQuanTitle = "2. Thông tin chủ quản nền tảng thương mại điện tử";
    dauMoiUyQuyenTitle = "3. Đầu mối liên hệ ủy quyền";
    nenTangTitle = "4. Thông tin nền tảng / Ứng dụng TMĐT";
    chinhSachTitle = "5. Quy chế và các chính sách hoạt động của nền tảng số";
  } else if (platformManageTypeId === "NTTichHop") {
    vanHanhTitle = "3. Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại trực tuyến";
    nenTangTitle = "4. Thông tin nền tảng / Ứng dụng TMĐT";
    chinhSachTitle = "5. Quy chế và các chính sách hoạt động của nền tảng số";
  }

  const themes = {
    ...SECTION_THEMES,
    chuQuan: {
      ...SECTION_THEMES.chuQuan,
      title: chuQuanTitle,
    },
    phapNhanUyQuyen: {
      ...SECTION_THEMES.phapNhanUyQuyen,
      title: phapNhanUyQuyenTitle,
    },
    daiDienUyQuyen: {
      ...SECTION_THEMES.daiDienUyQuyen,
      title: daiDienUyQuyenTitle,
    },
    dauMoiUyQuyen: {
      ...SECTION_THEMES.dauMoiUyQuyen,
      title: dauMoiUyQuyenTitle,
    },
    vanHanh: {
      ...SECTION_THEMES.vanHanh,
      title: vanHanhTitle,
    },
    nenTang: {
      ...SECTION_THEMES.nenTang,
      title: nenTangTitle,
    },
    chinhSach: {
      ...SECTION_THEMES.chinhSach,
      title: chinhSachTitle,
    },
  };

  const policies = [
    {
      title: "Chính sách bảo mật",
      content: item.chinhSachBaoMat,
      icon: <LockOutlined style={{ color: "#2563eb" }} />,
      bgIcon: "#dbeafe",
    },
    {
      title: "Tiếp nhận phản ánh/khiếu nại",
      content: item.phuongThucGiaiQuyetPhanAnh ?? item.tiepNhanKhieuNai,
      icon: <MessageOutlined style={{ color: "#7c3aed" }} />,
      bgIcon: "#f3e8ff",
    },
    {
      title: "Chính sách giá",
      content: item.chinhSachGia,
      icon: <DollarCircleOutlined style={{ color: "#059669" }} />,
      bgIcon: "#d1fae5",
    },
    {
      title: "Chính sách thanh toán",
      content: item.chinhSachThanhToan,
      icon: <CreditCardOutlined style={{ color: "#d97706" }} />,
      bgIcon: "#fef3c7",
    },
    {
      title: "Điều kiện/hạn chế cung cấp",
      content: item.dieuKienOrHanCheCungCapHHDV ?? item.dieuKienCungCap,
      icon: <ExclamationCircleOutlined style={{ color: "#dc2626" }} />,
      bgIcon: "#fee2e2",
    },
    {
      title: "Giao hàng/đổi trả/hoàn tiền",
      content: item.chinhSachApDungHHDV ?? item.chinhSachGiaoHang,
      icon: <CarOutlined style={{ color: "#0891b2" }} />,
      bgIcon: "#ecfeff",
    },
    {
      title: "Phương thức giao dịch/hỗ trợ trực tuyến",
      content: item.hinhThucHoTroTrucTuyen ?? item.phuongThucLienHe ?? item.phuongThucLienHeOnline,
      icon: <CustomerServiceOutlined style={{ color: "#db2777" }} />,
      bgIcon: "#fce7f3",
    },
  ];

  const renderPhapNhanUyQuyen = () => (
    <SectionCard theme={themes.phapNhanUyQuyen}>
      <Descriptions
        bordered
        size="small"
        column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
        styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
      >
        <Descriptions.Item label="Tên tổ chức">
          {renderText(item.organizationNameUyQuyen)}
        </Descriptions.Item>
        <Descriptions.Item label="Mã Doanh nghiệp">
          {renderText(item.organizationCodeUyQuyen)}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ trụ sở chính">
          {renderText(item.organizationDiaChiUyQuyen)}
        </Descriptions.Item>
        <Descriptions.Item label="Email tiếp nhận thông tin">
          {renderEmail(item.organizationEmailUyQuyen)}
        </Descriptions.Item>
        <Descriptions.Item label="File ảnh đăng ký doanh nghiệp" span={2}>
          <SingleFileUploader
            readOnly
            value={valueDangKyUyQuyen}
            onChange={setValueDangKyUyQuyen}
            category={FileCategoryConstant.Platform}
            subCategory={platformManageTypeId}
            itemId={item.id}
            loaiTaiLieu="OrganizationFileDangKyUyQuyen"
          />
        </Descriptions.Item>
      </Descriptions>
    </SectionCard>
  );

  return (
    <div style={{ paddingBottom: 8 }}>
      <style>{`
      @media (min-width: 768px) {
        .detail-info-right {
          border-left: 1px solid #e2e8f0;
          padding-left: 24px !important;
        }
      }
    `}</style>

      {/* ── Hero card: logo + tên + trạng thái ── */}
      <Card
        size="small"
        style={{ marginBottom: 16, background: "linear-gradient(135deg, #f6f9fc 0%, #fafafa 100%)" }}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Row gutter={[24, 16]} align="top">
          <Col xs={24} md={10} lg={9}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              {item.imagePath ? (
                <AntImage
                  src={buildFileUrl(item.imagePath)}
                  alt="Logo"
                  width={80}
                  height={80}
                  style={{
                    objectFit: "contain",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#fff",
                    padding: 4,
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    flexShrink: 0,
                  }}
                  preview
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    border: "1px dashed #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    fontSize: 12,
                    background: "#fff",
                    flexShrink: 0,
                  }}
                >
                  Chưa có logo
                </div>
              )}
              <div style={{ flex: "1 1 200px" }}>
                <Title level={4} style={{ margin: "0 0 6px", color: "#0f172a", fontWeight: 600 }}>
                  {renderText(item.name)}
                </Title>
                <div style={{ marginBottom: 8 }}>
                  {renderDomain(item.domain)}
                </div>
                <Tag color={CompanyInfoStatusConstant.getColor(item.status)} style={{ borderRadius: 4 }}>
                  {item.statusName || CompanyInfoStatusConstant.getDisplayName(item.status)}
                </Tag>
              </div>
            </div>
          </Col>

          <Col xs={24} md={14} lg={15} className="detail-info-right">
            <Descriptions
              column={1}
              size="small"
              colon={false}
              styles={{
                label: { color: "#64748b", fontWeight: 500, width: 120, minWidth: 120 },
                content: { color: "#334155" },
              }}
            >
              <Descriptions.Item label="Loại nền tảng">
                {renderText(item.platformManageTypeName)}
              </Descriptions.Item>
              <Descriptions.Item label="MST/Số GCN/QĐ">
                {renderText(item.companyTaxCode)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* ── 2.2. Thông tin pháp nhân được chỉ định theo ủy quyền tại Việt Nam (Đưa lên đầu đối với NTDangKyKDNuocNgoai) ── */}
      {platformManageTypeId === "NTDangKyKDNuocNgoai" && renderPhapNhanUyQuyen()}

      {/* ── 1. Chủ quản ── */}
      <SectionCard theme={themes.chuQuan}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
          styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
        >
          <Descriptions.Item label="Tên tổ chức/chủ quản nền tảng">
            {renderText(item.companyName)}
          </Descriptions.Item>
          <Descriptions.Item label="Email tiếp nhận thông tin">
            {renderEmail(item.companyEmail)}
          </Descriptions.Item>
          <Descriptions.Item label="Mã số thuế/Số GCN/QĐ" span={2}>
            {renderMultiline(item.companyTaxCode)}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ trụ sở chính" span={2}>
            {renderMultiline(item.companyAddress)}
          </Descriptions.Item>
          <Descriptions.Item label="File ảnh đăng ký doanh nghiệp (DKKD)" span={2}>
            <SingleFileUploader
              readOnly
              value={valueDKKD}
              onChange={setValueDKKD}
              category={FileCategoryConstant.Platform}
              subCategory={platformManageTypeId}
              itemId={item.id}
              loaiTaiLieu="CompanyDKKD"
            />
          </Descriptions.Item>
        </Descriptions>
      </SectionCard>

      {/* ── 2. Người đại diện (bảng so sánh) ── */}
      {platformManageTypeId !== "NTDangKyKDNuocNgoai" && (
        <SectionCard theme={themes.daiDien}>
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isTichHop
                  ? "64px minmax(150px, 1fr) minmax(180px, 1.2fr) minmax(180px, 1.2fr) minmax(240px, 1.5fr)"
                  : "64px minmax(170px, 1fr) minmax(220px, 1.35fr) minmax(220px, 1.35fr)",
                minWidth: isTichHop ? 1000 : 820,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div style={comparisonHeaderCellStyle}>STT</div>
              <div style={comparisonHeaderCellStyle}>Nội dung</div>
              <div style={comparisonHeaderCellStyle}>Người đại diện pháp luật</div>
              <div style={comparisonHeaderCellStyle}>
                Nhân sự chịu trách nhiệm quản lý hoạt động thương mại điện tử
              </div>
              {isTichHop && (
                <div style={comparisonHeaderCellStyle}>
                  Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại trực tuyến (áp dụng đối với nền tảng số lớn)
                </div>
              )}

              <div style={comparisonIndexCellStyle}>1</div>
              <div style={comparisonContentCellStyle}>Họ và tên</div>
              <div style={comparisonCellStyle}>{renderText(item.representerName)}</div>
              <div style={comparisonCellStyle}>{renderText(item.representerNameOnline)}</div>
              {isTichHop && <div style={comparisonCellStyle}>{renderText(item.representerNameVanHanh)}</div>}

              <div style={comparisonIndexCellStyle}>2</div>
              <div style={comparisonContentCellStyle}>Chức danh</div>
              <div style={comparisonCellStyle}>{renderText(item.representerJob)}</div>
              <div style={comparisonCellStyle}>{renderText(item.representerJobOnline)}</div>
              {isTichHop && <div style={comparisonCellStyle}>{renderText(item.representerJobVanHanh)}</div>}

              <div style={comparisonIndexCellStyle}>3</div>
              <div style={comparisonContentCellStyle}>Số CCCD / số hộ chiếu</div>
              <div style={comparisonCellStyle}>{renderText(item.representerCCCD)}</div>
              <div style={comparisonCellStyle}>{renderText(item.representerCCCDOnline)}</div>
              {isTichHop && <div style={comparisonCellStyle}>{renderText(item.representerCCCDVanHanh)}</div>}

              <div style={comparisonIndexCellStyle}>4</div>
              <div style={comparisonContentCellStyle}>Địa chỉ</div>
              <div style={comparisonCellStyle}>{renderText(item.representerDiaChi ?? item.addressDaiDien)}</div>
              <div style={comparisonCellStyle}>{renderText(item.representerDiaChiOnline ?? item.addressOnline)}</div>
              {isTichHop && <div style={comparisonCellStyle}>{renderText(item.representerDiaChiVanHanh)}</div>}

              <div style={comparisonIndexCellStyle}>5</div>
              <div style={comparisonContentCellStyle}>Số điện thoại</div>
              <div style={comparisonCellStyle}>{renderText(item.representerMobile)}</div>
              <div style={comparisonCellStyle}>{renderText(item.representerMobileOnline)}</div>
              {isTichHop && <div style={comparisonCellStyle}>{renderText(item.representerMobileVanHanh)}</div>}

              <div style={comparisonIndexCellStyle}>6</div>
              <div style={comparisonContentCellStyle}>Email</div>
              <div style={comparisonCellStyle}>{renderEmail(item.representerEmail)}</div>
              <div style={comparisonCellStyle}>{renderEmail(item.representerEmailOnline)}</div>
              {isTichHop && <div style={comparisonCellStyle}>{renderEmail(item.representerEmailVanHanh)}</div>}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── 2.1. Thông tin đại diện được chỉ định theo uỷ quyền tại Việt Nam (Mẫu 04) ── */}
      {isTichHopNuocNgoai && (
        <SectionCard theme={themes.daiDienUyQuyen}>
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
            styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
          >
            <Descriptions.Item label="Họ và tên">
              {renderText(item.representerNameUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Chức danh">
              {renderText(item.representerJobUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Số CCCD / số hộ chiếu">
              {renderText(item.representerCCCDUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {renderText(item.representerMobileUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {renderEmail(item.representerEmailUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {renderText(item.representerDiaChiUyQuyen)}
            </Descriptions.Item>
          </Descriptions>
        </SectionCard>
      )}

      {/* ── 2.2. Thông tin pháp nhân được chỉ định theo ủy quyền tại Việt Nam (Mẫu 04 NTTichHopNuocNgoai) ── */}
      {platformManageTypeId === "NTTichHopNuocNgoai" && renderPhapNhanUyQuyen()}

      {/* ── 2.3. Đầu mối liên hệ ủy quyền (Mẫu 02 & 04) ── */}
      {isNuocNgoaiUyQuyen && (
        <SectionCard theme={themes.dauMoiUyQuyen}>
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
            styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
          >
            <Descriptions.Item label="Họ và tên">
              {renderText(item.representerNameDauMoiUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Chức danh">
              {renderText(item.representerJobDauMoiUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Số CCCD / số hộ chiếu">
              {renderText(item.representerCCCDDauMoiUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {renderText(item.representerMobileDauMoiUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {renderEmail(item.representerEmailDauMoiUyQuyen)}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {renderText(item.representerDiaChiDauMoiUyQuyen)}
            </Descriptions.Item>
          </Descriptions>
        </SectionCard>
      )}



      {/* ── 3. Thông tin nền tảng / Ứng dụng TMĐT ── */}
      <SectionCard theme={themes.nenTang}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
          styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
        >
          <Descriptions.Item label="Tên nền tảng/ứng dụng" span={2}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{renderText(item.name)}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ website">
            {renderDomain(item.domain)}
          </Descriptions.Item>
          <Descriptions.Item label="Chủ sở hữu tên miền">
            {renderText(item.chuSoHuu)}
          </Descriptions.Item>
          <Descriptions.Item label="Đơn vị hosting">
            {renderText(item.ispName ?? item.ispId)}
          </Descriptions.Item>
          {(platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTThongBaoKD") && (
            <Descriptions.Item label="Ngôn ngữ">
              {renderText(item.ngonNguTxt ?? item.ngonNgu)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Logo website" span={2}>
            {renderLogo(item.logo, "Logo website")}
          </Descriptions.Item>
          <Descriptions.Item label="Loại hàng hóa/dịch vụ giao dịch" span={2}>
            {renderMultiline(item.loaiHangHoaKhacName ?? item.loaiHangHoaKhac)}
          </Descriptions.Item>
          {isTichHop && (
            <>
              <Descriptions.Item label="Loại hình nền tảng" span={2}>
                {item.platformType ? PlatformTypeConstant.getDisplayName(item.platformType) : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Chức năng của nền tảng" span={2}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {item.chucNangNenTang
                    ? PlatformFunctionConstant.getDisplayNames(item.chucNangNenTang).map((name, i) => (
                        <div key={i} style={{ color: "#334155" }}>• {name}</div>
                      ))
                    : "—"}
                </div>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>

        {/* Ứng dụng di động liên kết */}
        {item.appInfoItems && item.appInfoItems.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#08979c" }}></span>
              Ứng dụng di động liên kết ({item.appInfoItems.length})
            </div>
            <Row gutter={[16, 16]}>
              {item.appInfoItems.map((app, index) => (
                <Col xs={24} sm={12} key={index}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 12,
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#f8fafc",
                      height: "100%",
                    }}
                  >
                    {app.appLogo ? (
                      <AntImage
                        src={buildFileUrl(app.appLogo)}
                        alt={app.appName || "Logo app"}
                        width={48}
                        height={48}
                        style={{
                          objectFit: "contain",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          background: "#fff",
                          padding: 2,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          border: "1px dashed #cbd5e1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontSize: 10,
                          background: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        No Logo
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1e293b",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 13,
                        }}
                      >
                        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {app.appName}
                        </span>
                        {app.osCode && <Tag color="blue" style={{ margin: 0 }}>{app.osName || app.osCode}</Tag>}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        <a
                          href={app.appLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: "underline", color: "#0284c7" }}
                        >
                          {app.appLink}
                        </a>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </SectionCard>

      {/* ── 4. Quy chế và các chính sách hoạt động của nền tảng số ── */}
      {policies.some(p => p.content?.trim()) && (
        <SectionCard theme={themes.chinhSach}>
          <Row gutter={[16, 16]}>
            {policies.map((p, idx) => {
              if (!p.content?.trim()) return null;
              return (
                <Col xs={24} md={12} key={idx}>
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      background: "#fff",
                      padding: 16,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: p.bgIcon,
                          fontSize: 16,
                        }}
                      >
                        {p.icon}
                      </div>
                      <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13.5 }}>
                        {p.title}
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 12.5,
                        color: "#475569",
                        flex: 1,
                        maxHeight: 180,
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.6",
                      }}
                    >
                      {p.content}
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </SectionCard>
      )}

      {/* ── Thông tin xử lý hồ sơ ── */}
      <SectionCard theme={SECTION_THEMES.hoSo}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
          styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
        >
          <Descriptions.Item label="Ngày tạo">
            {item.createdDate ? formatDate(item.createdDate, true) : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày gửi duyệt">
            {item.submitDate ? formatDate(item.submitDate, true) : "Chưa"}
          </Descriptions.Item>
          <Descriptions.Item label="Chuyên viên xử lý">
            {item.reviewMaCanBo || item.reviewName || "Chưa phân công"}
          </Descriptions.Item>
        </Descriptions>
      </SectionCard>
    </div>
  );
};

export default DetailInfoTab;
