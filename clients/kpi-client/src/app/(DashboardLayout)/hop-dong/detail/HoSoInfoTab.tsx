"use client";

import React from "react";
import { Card, Col, Descriptions, Image, Row, Tag, Typography, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  BankOutlined,
  FileTextOutlined,
  GlobalOutlined,
  IdcardOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { AuthenticationContractType, CreateDataType } from "@/types/authenticationContract/dto";
import { DropdownOption } from "@/types/general";
import {
  emptyText,
  renderText,
  renderLink,
  renderImage,
  renderDropdownLabel,
  renderStatusLabel,
  getApps,
  getCategories,
  getPlatformTypeLabel,
} from "./detailUtils";

const { Title } = Typography;

const LABEL_STYLE: React.CSSProperties = {
  width: 210,
  fontWeight: 500,
  background: "#fafafa",
};

const CONTENT_STYLE: React.CSSProperties = {
  background: "#fff",
};

const renderEmail = (value?: string | null) =>
  value?.trim() ? <a href={`mailto:${value}`}>{value}</a> : "—";

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

type SectionTheme = {
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const SECTION_THEMES = {
  chuQuan: {
    title: "1. Thông tin doanh nghiệp chủ quản",
    icon: <BankOutlined />,
    color: "#722ed1",
    bg: "#f9f0ff",
  },
  daiDien: {
    title: "2. Thông tin người đại diện pháp luật và người liên hệ",
    icon: <IdcardOutlined />,
    color: "#389e0d",
    bg: "#f6ffed",
  },
  nenTang: {
    title: "3. Thông tin nền tảng",
    icon: <GlobalOutlined />,
    color: "#08979c",
    bg: "#e6fffb",
  },
  phanChung: {
    title: "4. Thông tin quản trị vận hành và phần chung",
    icon: <FileTextOutlined />,
    color: "#0355a2",
    bg: "#e6f4ff",
  },
  dvc: {
    title: "5. Thông tin đồng bộ DVC",
    icon: <SyncOutlined />,
    color: "#fa8c16",
    bg: "#fff7e6",
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

interface HoSoInfoTabProps {
  item?: AuthenticationContractType | null;
  createData: CreateDataType;
  companyDkkd?: string;
  statusOptions?: DropdownOption[];
  osOptions?: DropdownOption[];
  ngonNguOptions?: DropdownOption[];
  iSPOptions?: DropdownOption[];
  linhVucOptions?: DropdownOption[];
}

const HoSoInfoTab: React.FC<HoSoInfoTabProps> = ({
  item,
  createData,
  companyDkkd,
  statusOptions = [],
  osOptions = [],
  ngonNguOptions = [],
  iSPOptions = [],
  linhVucOptions = [],
}) => {
  const apps = getApps(item);
  const appRows = apps.map((app, index) => ({
    ...app,
    rowKey: app.id || app.appLink || `${app.appName || "app"}-${index}`,
  }));

  const appColumns: ColumnsType<(typeof appRows)[number]> = [
    {
      title: "Tên ứng dụng",
      dataIndex: "appName",
      render: renderText,
    },
    {
      title: "Hệ điều hành",
      dataIndex: "osCode",
      width: 160,
      render: (value) => renderDropdownLabel(osOptions, value),
    },
    {
      title: "Link ứng dụng",
      dataIndex: "appLink",
      render: renderLink,
    },
    {
      title: "Logo",
      dataIndex: "logo",
      render: renderImage,
    },
  ];

  const categories = getCategories(item);
  const hostingValue =
    item?.iSPId ||
    (item as any)?.ispId ||
    (item as any)?.ISPId ||
    (item as any)?.iSPID;
  const hostingName =
    (item as any)?.iSPName ||
    (item as any)?.ispName ||
    (item as any)?.ISPName;

  const representerAddress =
    createData.representerDiaChi || createData.address || "";

  return (
    <div style={{ paddingBottom: 8 }}>
      <style>{`
        @media (min-width: 768px) {
          .hoso-info-right {
            border-left: 1px solid #e2e8f0;
            padding-left: 24px !important;
          }
        }
      `}</style>

      {/* HEADER CARD */}
      <Card
        size="small"
        style={{ marginBottom: 16, background: "linear-gradient(135deg, #f6f9fc 0%, #fafafa 100%)" }}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Row gutter={[24, 16]} align="top">
          <Col xs={24} md={10} lg={9}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              {item?.logo ? (
                <Image
                  src={item.logo}
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
                  {renderText(item?.name)}
                </Title>
                <div style={{ marginBottom: 8 }}>
                  {renderLink(item?.domain)}
                </div>
                {renderStatusLabel(statusOptions, item?.status)}
              </div>
            </div>
          </Col>

          <Col xs={24} md={14} lg={15} className="hoso-info-right">
            <Descriptions
              column={1}
              size="small"
              colon={false}
              styles={{
                label: { color: "#64748b", fontWeight: 500, width: 130, minWidth: 130 },
                content: { color: "#334155" }
              }}
            >
              <Descriptions.Item label="Loại hình nền tảng">
                {getPlatformTypeLabel(item)}
              </Descriptions.Item>
              <Descriptions.Item label="MST doanh nghiệp">
                {renderText(item?.companyTaxCode || createData.companyTaxCode)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* SECTION 1: THÔNG TIN DOANH NGHIỆP */}
      <SectionCard theme={SECTION_THEMES.chuQuan}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
          styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
        >
          <Descriptions.Item label="Tên chủ quản nền tảng">
            {renderText(item?.chuSoHuu || createData.name)}
          </Descriptions.Item>
          <Descriptions.Item label="Email tiếp nhận thông tin">
            {renderEmail(createData.email)}
          </Descriptions.Item>
          <Descriptions.Item label="Mã số thuế doanh nghiệp">
            {renderText(item?.companyTaxCode || createData.companyTaxCode)}
          </Descriptions.Item>
          <Descriptions.Item label="File ảnh đăng ký doanh nghiệp">
            {companyDkkd ? (
              <a href={companyDkkd} target="_blank" rel="noreferrer" style={{ fontWeight: 500, color: "#0355a2" }}>
                Xem file đăng ký doanh nghiệp
              </a>
            ) : (
              emptyText
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ trụ sở chính" span={2}>
            {renderText(createData.address)}
          </Descriptions.Item>
        </Descriptions>
      </SectionCard>

      {/* SECTION 2: COMPARISON GRID ĐẠI DIỆN PHÁP LUẬT & LIÊN HỆ */}
      <SectionCard theme={SECTION_THEMES.daiDien}>
        <div style={{ overflowX: "auto" }}>
          <div style={comparisonGridStyle}>
            <div style={comparisonHeaderCellStyle}>STT</div>
            <div style={comparisonHeaderCellStyle}>Nội dung</div>
            <div style={comparisonHeaderCellStyle}>Người đại diện pháp luật</div>
            <div style={comparisonHeaderCellStyle}>Người liên hệ trực tiếp</div>

            <div style={comparisonIndexCellStyle}>1</div>
            <div style={comparisonContentCellStyle}>Họ và tên</div>
            <div style={comparisonCellStyle}>{renderText(createData.representerName)}</div>
            <div style={comparisonCellStyle}>{renderText(item?.representerNameOnline)}</div>

            <div style={comparisonIndexCellStyle}>2</div>
            <div style={comparisonContentCellStyle}>Chức danh</div>
            <div style={comparisonCellStyle}>{renderText(item?.representerJob)}</div>
            <div style={comparisonCellStyle}>{renderText(item?.representerJobOnline)}</div>

            <div style={comparisonIndexCellStyle}>3</div>
            <div style={comparisonContentCellStyle}>Số CCCD / số hộ chiếu</div>
            <div style={comparisonCellStyle}>{renderText(createData.representerCCCD)}</div>
            <div style={comparisonCellStyle}>{renderText(item?.representerCCCDOnline)}</div>

            <div style={comparisonIndexCellStyle}>4</div>
            <div style={comparisonContentCellStyle}>Địa chỉ liên hệ</div>
            <div style={comparisonCellStyle}>{renderText(representerAddress)}</div>
            <div style={comparisonCellStyle}>{renderText(item?.representerDiaChiOnline)}</div>

            <div style={comparisonIndexCellStyle}>5</div>
            <div style={comparisonContentCellStyle}>Số điện thoại</div>
            <div style={comparisonCellStyle}>{renderText(createData.representerMobile)}</div>
            <div style={comparisonCellStyle}>{renderText(item?.representerMobileOnline)}</div>

            <div style={comparisonIndexCellStyle}>6</div>
            <div style={comparisonContentCellStyle}>Email</div>
            <div style={comparisonCellStyle}>{renderEmail(createData.representerEmail)}</div>
            <div style={comparisonCellStyle}>{renderEmail(item?.representerEmailOnline)}</div>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 3: THÔNG TIN NỀN TẢNG / WEBSITE / APPS */}
      <SectionCard theme={SECTION_THEMES.nenTang}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
          styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="Tên nền tảng">
            {renderText(item?.name)}
          </Descriptions.Item>
          <Descriptions.Item label="Chủ sở hữu tên miền">
            {renderText(item?.chuSoHuu)}
          </Descriptions.Item>
          <Descriptions.Item label="Tên miền chính">
            {renderLink(item?.domain)}
          </Descriptions.Item>
          <Descriptions.Item label="Tên miền bổ sung">
            {renderLink(item?.domainAdd)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngôn ngữ" span={2}>
            {renderDropdownLabel(ngonNguOptions, item?.ngonNgu)}
          </Descriptions.Item>
        </Descriptions>

        {appRows.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, color: "#475569", marginBottom: 8, fontSize: 13 }}>Danh sách ứng dụng di động</div>
            <Table
              bordered
              columns={appColumns}
              dataSource={appRows}
              rowKey="rowKey"
              pagination={false}
              locale={{ emptyText: "Không có ứng dụng" }}
              scroll={{ x: "max-content" }}
            />
          </div>
        )}
      </SectionCard>

      {/* SECTION 4: PHẦN CHUNG / HOSTING / VẬN HÀNH */}
      <SectionCard theme={SECTION_THEMES.phanChung}>
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
          styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
        >
          <Descriptions.Item label="Đơn vị cung cấp hosting">
            {hostingValue
              ? renderDropdownLabel(iSPOptions, hostingValue)
              : renderText(hostingName)}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp khác">
            {renderText(item?.iSPidKhac)}
          </Descriptions.Item>
          <Descriptions.Item label="Số lượng nhân sự vận hành">
            {renderText(item?.staffNumber)}
          </Descriptions.Item>
          <Descriptions.Item label="Lĩnh vực cung cấp dịch vụ">
            {categories.length
              ? categories.map((category) => (
                <Tag
                  key={category.id || category.linhVucCungCapDichVuCode}
                  style={{ borderRadius: 4 }}
                >
                  {renderDropdownLabel(
                    linhVucOptions,
                    category.linhVucCungCapDichVuCode,
                  )}
                </Tag>
              ))
              : emptyText}
          </Descriptions.Item>
          <Descriptions.Item label="Lĩnh vực cung cấp khác" span={2}>
            {renderText(item?.linhVucCungCapKhac)}
          </Descriptions.Item>
          <Descriptions.Item label="Lý do đề nghị cập nhật" span={2}>
            {renderText(item?.lyDoDeNghiCapNhat)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {renderText(item?.note)}
          </Descriptions.Item>
        </Descriptions>
      </SectionCard>

      {/* ── 5. Thông tin đồng bộ DVC ── */}
      {/* {item && (item.dvcMaHoSo || (item.dvcSyncStatus ?? 0) > 0) && (
        <SectionCard theme={SECTION_THEMES.dvc}>
          <Descriptions
            bordered
            size="small"
            column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
            styles={{ label: LABEL_STYLE, content: CONTENT_STYLE }}
          >
            <Descriptions.Item label="Mã hồ sơ DVC">
              {item.dvcMaHoSo ? <Typography.Text code>{item.dvcMaHoSo}</Typography.Text> : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="ID hồ sơ DVC">
              {item.dvcIdHoSo ? <Typography.Text code>{item.dvcIdHoSo}</Typography.Text> : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái đồng bộ DVC">
              {item.dvcSyncStatus === 2 ? (
                <Tag color="green">Đồng bộ thành công</Tag>
              ) : item.dvcSyncStatus === 1 ? (
                <Tag color="blue">Đang đồng bộ</Tag>
              ) : item.dvcSyncStatus === 3 ? (
                <Tag color="red">Lỗi đồng bộ</Tag>
              ) : (
                <Tag color="default">Chưa đồng bộ</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian đồng bộ">
              {item.dvcSyncDate ? (item.dvcSyncDate.includes("T") ? new Date(item.dvcSyncDate).toLocaleString() : item.dvcSyncDate) : "—"}
            </Descriptions.Item>
            {item.dvcErrorMessage && (
              <Descriptions.Item label="Thông báo lỗi" span={2}>
                <Typography.Text type="danger">{item.dvcErrorMessage}</Typography.Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </SectionCard>
      )} */}
    </div>
  );
};

export default HoSoInfoTab;
