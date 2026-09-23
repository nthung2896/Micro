"use client";

import React, { useState } from "react";
import { Card, Tabs, Button, Alert, Tag, Divider } from "antd";
import { CalendarOutlined, ArrowLeftOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PlatformManageType } from "@/types/platformManage/dto";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { useRouter, useSearchParams } from "next/navigation";

// Sub-components
import DetailInfoTab from "../../components/DetailInfoTab";
import HistoryTab from "../../components/HistoryTab";
import TaiLieuDinhKemTab from "../../NenTangTrucTuyen/detail/TaiLieuDinhKemTab";
import LichSuThayDoiTab from "../../NenTangTrucTuyen/detail/LichSuThayDoiTab";
import YeuCauDoanhNghiepTab from "../../NenTangTrucTuyen/detail/YeuCauDoanhNghiepTab";
import EnterpriseAction from "./EnterpriseAction";
import ThongTinKySo from "../../../hop-dong/components/ThongTinKySo";
import platformManageService from "@/services/platformManage/platformManage.service";
import EnterprisePlatformItemTab from "../../components/EnterprisePlatformItemTab";

interface EnterpriseDetailProps {
  item: PlatformManageType;
  roles: any;
  onRefresh: () => void;
  onTransitionClick: (config: any) => void;
  getFormattedDate: () => string;
  ispOptions: any[];
}

const EnterpriseDetail: React.FC<EnterpriseDetailProps> = ({
  item,
  roles,
  onRefresh,
  onTransitionClick,
  getFormattedDate,
  ispOptions,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "1");

  const getListPageLabel = () => {
    switch (item.platformManageTypeId) {
      case "NTThongBaoKD":
        return "Nền tảng trực tuyến";
      case "NTDangKyKDNuocNgoai":
        return "Đặt hàng nước ngoài";
      case "NTTichHop":
        return "Trung gian trong nước";
      case "NTTichHopNuocNgoai":
        return "Trung gian nước ngoài";
      default:
        return "Danh sách hồ sơ";
    }
  };

  const goBackToList = () => {
    switch (item.platformManageTypeId) {
      case "NTThongBaoKD":
        router.push("/QLPlatform/NenTangTrucTuyen");
        break;
      case "NTDangKyKDNuocNgoai":
        router.push("/QLPlatform/DoanhNghiep/DatHangNuocNgoai");
        break;
      case "NTTichHop":
        router.push("/QLPlatform/DoanhNghiep/TrungGianTrongNuoc");
        break;
      case "NTTichHopNuocNgoai":
        router.push("/QLPlatform/DoanhNghiep/TrungGianNuocNgoai");
        break;
      default:
        router.back();
    }
  };

  const statusColor = PlatformStatusConstant.getColor(item.status);
  const statusName = PlatformStatusConstant.getDisplayName(item.status);
  const deadline = (roles?.isDN && item.status !== PlatformStatusConstant.CanBoSungThongTin) ? null : (roles?.isDN ? item.dateLineEnterprise : item.dateLine);

  const hasRequest =
    item.status === PlatformStatusConstant.DeNghiChinhSua ||
    item.status === PlatformStatusConstant.CanBoSungThongTin;

  const items = [
    {
      key: "1",
      label: "Thông tin hồ sơ",
      children: <DetailInfoTab item={item} ispOptions={ispOptions} />,
    },
    /*
    ...(hasRequest
      ? [
          {
            key: "request",
            label: (
              <span style={{ color: "#f97316", fontWeight: 600 }}>
                ⚠️ Yêu cầu bổ sung hồ sơ
              </span>
            ),
            children: <YeuCauDoanhNghiepTab item={item} />,
          },
        ]
      : []),
    */    {
      key: "2",
      label: "Tài liệu đính kèm",
      children: <TaiLieuDinhKemTab itemId={item.id} active={activeTab === "2"} />,
    },
    {
      key: "ky-so",
      label: "Thông tin ký số",
      children: <ThongTinKySo hoSoId={item.id} signerService={platformManageService} />,
    },
    {
      key: "3",
      label: "Lịch sử xử lý",
      children: <HistoryTab platformId={item.id} companyTaxCode={item.companyTaxCode} />,
    },
    {
      key: "tich-hop",
      label: "Nền tảng TMĐT tích hợp",
      children: <EnterprisePlatformItemTab platformManageId={item.id} />,
    },
    /*
    {
      key: "4",
      label: "Lịch sử thay đổi",
      children: <LichSuThayDoiTab item={item} />,
    },
    */
  ];

  return (
    <div className="enterprise-detail-view">
      <style jsx global>{`
        .enterprise-detail-view .custom-tabs .ant-tabs-nav {
          margin-bottom: 20px !important;
        }
        .enterprise-detail-view .custom-tabs .ant-tabs-tab {
          font-size: 15px !important;
          font-weight: 500 !important;
          padding: 12px 16px !important;
        }
        .enterprise-detail-view .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          font-weight: 600 !important;
        }
        .sticky-header-toolbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          padding: 16px 24px;
          margin: -24px -24px 20px -24px;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .breadcrumb-link {
          color: #64748b;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .breadcrumb-link:hover {
          color: #0f172a;
        }
      `}</style>

      {/* TOP STICKY HEADER TOOLBAR */}
      <div className="sticky-header-toolbar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <a href="/dashboard" className="breadcrumb-link">Trang chủ</a>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span className="breadcrumb-link" style={{ cursor: "pointer" }} onClick={() => goBackToList()}>
                {getListPageLabel()}
              </span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>{item.name}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#475569", fontSize: "13px", fontWeight: 500 }}>
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px" }} />
            <span>{getFormattedDate()}</span>
          </div>
        </div>

        <div style={{ borderBottom: "1px solid #e2e8f0", marginTop: "4px", marginBottom: "16px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "5.5fr 4.5fr", gap: "12px", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => goBackToList()}
              style={{ paddingLeft: 0, color: "#64748b", fontWeight: 600 }}
            >
              Quay lại danh sách
            </Button>
            <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Trạng thái</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Tag color={statusColor} style={{ fontWeight: 600, borderRadius: 4, margin: 0 }}>{statusName}</Tag>
                {item.isNenTangLon && <Tag color="red" style={{ fontWeight: 600, borderRadius: 4, border: "1px solid #ef4444", margin: 0 }}>🔥 NỀN TẢNG SỐ LỚN</Tag>}
              </div>
            </div>
            {item.reviewName && (
              <>
                <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Chuyên viên</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {roles?.isDN ? (item.reviewMaCanBo || "—") : item.reviewName}
                  </span>
                </div>
              </>
            )}
            {deadline && (
              <>
                <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Hạn xử lý</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#c2272d" }}>
                    {dayjs(deadline).format("DD/MM/YYYY")}
                  </span>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <EnterpriseAction
              item={item}
              onTransitionClick={onTransitionClick}
              onlyButtons={true}
              onRefresh={onRefresh}
            />
          </div>
        </div>
      </div>

      {/* 
      {hasRequest && (
        <Alert
          message="Hồ sơ cần được chỉnh sửa hoặc bổ sung thông tin theo yêu cầu của cơ quan quản lý. Vui lòng kiểm tra tab 'Yêu cầu bổ sung hồ sơ' để biết chi tiết."
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )}
      */}

      <Card
        style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          className="custom-tabs"
        />
      </Card>
    </div>
  );
};

export default EnterpriseDetail;
