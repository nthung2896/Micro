"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Button, Spin, Descriptions, Tag, message } from "antd";
import { ArrowLeftOutlined, CalendarOutlined } from "@ant-design/icons";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import { CompanyInfoType } from "@/types/companyInfo/dto";
import CompanyInfoStatusConstant from "@/constants/CompanyInfoStatusConstant";
import TypeOrganizationConstant from "@/constants/TypeOrganizationConstant";

const CompanyDetailPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const taxCode = searchParams.get("taxCode");

  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<CompanyInfoType | null>(null);

  useEffect(() => {
    if (!id && !taxCode) {
      message.error("Không tìm thấy mã hoặc mã số thuế doanh nghiệp");
      router.push("/QLDoanhNghiep");
      return;
    }

    const loadDetail = async () => {
      setLoading(true);
      try {
        if (id) {
          const response = await companyInfoService.get(id);
          if (response?.data) {
            setItem(response.data);
          } else {
            message.error(response.message ?? "Không tải được chi tiết doanh nghiệp");
            router.push("/QLDoanhNghiep");
          }
        } else if (taxCode) {
          const response = await companyInfoService.getData({
            keyword: taxCode,
            pageIndex: 1,
            pageSize: 1,
          });
          const company = response?.data?.items?.[0];
          if (company) {
            setItem(company);
          } else {
            message.error("Không tìm thấy doanh nghiệp có mã số thuế này");
            router.push("/QLDoanhNghiep");
          }
        }
      } catch {
        message.error("Không tải được thông tin doanh nghiệp");
        router.push("/QLDoanhNghiep");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id, taxCode, router]);

  if (loading || !item) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "350px", flexDirection: "column", gap: "16px" }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải dữ liệu doanh nghiệp...</span>
      </div>
    );
  }

  const statusColor = CompanyInfoStatusConstant.getColor(item.status);
  const statusName = CompanyInfoStatusConstant.getDisplayName(item.status);

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="company-detail-view" style={{ padding: "0" }}>
      {/* TOP STICKY HEADER TOOLBAR */}
      <div className="sticky-header-toolbar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <a href="/" className="breadcrumb-link">Trang chủ</a>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span className="breadcrumb-link" style={{ cursor: "pointer" }} onClick={() => router.push("/QLDoanhNghiep")}>
                Danh sách doanh nghiệp
              </span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>{item.name}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#475569", fontSize: "13px", fontWeight: 500 }}>
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px" }} />
            <span style={{ textTransform: "capitalize" }}>{getFormattedDate()}</span>
          </div>
        </div>
        <div style={{ borderBottom: "1px solid #e2e8f0", marginTop: "4px", marginBottom: "16px" }} />
      </div>

      <Card
        style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
        bodyStyle={{ padding: "24px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ paddingLeft: 0, color: "#64748b", fontWeight: 600 }}
          >
            Quay lại
          </Button>
          <Tag color={statusColor} style={{ fontSize: "13px", padding: "4px 8px" }}>{statusName}</Tag>
        </div>

        <Descriptions title="Thông tin chi tiết doanh nghiệp" bordered column={1} size="middle">
          <Descriptions.Item label="Tên doanh nghiệp" labelStyle={{ fontWeight: 600 }}>{item.name}</Descriptions.Item>
          <Descriptions.Item label="Tên tiếng Anh">{item.englishName || "-"}</Descriptions.Item>
          <Descriptions.Item label="Tên viết tắt">{item.shortName || "-"}</Descriptions.Item>
          <Descriptions.Item label="Mã số thuế" labelStyle={{ fontWeight: 600 }}>
            <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 600 }}>{item.taxCode}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Loại tổ chức">
            {TypeOrganizationConstant.getDisplayName(item.typeOrganization ?? "")}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{item.address || "-"}</Descriptions.Item>
          <Descriptions.Item label="Tỉnh/TP (cổng DVC)">
            {item.cityName} ({item.cityId})
          </Descriptions.Item>
          <Descriptions.Item label="Điện thoại">{item.phone || "-"}</Descriptions.Item>
          <Descriptions.Item label="Email">{item.email || "-"}</Descriptions.Item>
          <Descriptions.Item label="Fax">{item.fax || "-"}</Descriptions.Item>
          <Descriptions.Item label="Người đại diện" labelStyle={{ fontWeight: 600 }}>{item.representerName || "-"}</Descriptions.Item>
          <Descriptions.Item label="CCCD/Hộ chiếu">{item.representerCCCD || "-"}</Descriptions.Item>
          <Descriptions.Item label="SĐT người đại diện">{item.representerMobile || "-"}</Descriptions.Item>
          <Descriptions.Item label="Email người đại diện">{item.representerEmail || "-"}</Descriptions.Item>
          <Descriptions.Item label="Yếu tố nước ngoài">
            {item.isNuocNgoai ? "Có" : "Không"}
          </Descriptions.Item>
          <Descriptions.Item label="Vốn đầu tư nước ngoài">
            {item.isVonDauTuNuocNgoai ? "Có" : "Không"}
          </Descriptions.Item>
          <Descriptions.Item label="File ĐKKD">
            {item.dKKD ? (
              <a href={item.dKKD} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>
                Xem file đăng ký kinh doanh
              </a>
            ) : (
              "-"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

const CompanyDetailPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "350px", flexDirection: "column", gap: "16px" }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải trang chi tiết...</span>
      </div>
    }>
      <CompanyDetailPageContent />
    </Suspense>
  );
};

export default CompanyDetailPage;
