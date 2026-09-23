"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, Spin, message, Descriptions, Tag, Space, Row, Col } from "antd";
import { ArrowLeftOutlined, ShopOutlined, UserOutlined, FileTextOutlined } from "@ant-design/icons";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import { CompanyInfoType } from "@/types/companyInfo/dto";
import CompanyInfoStatusConstant from "@/constants/CompanyInfoStatusConstant";
import TypeOrganizationConstant from "@/constants/TypeOrganizationConstant";
import withAuthorization from "@/libs/authentication";

const CompanyDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<CompanyInfoType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await companyInfoService.get(id);
        if (response.status && response.data) {
          setItem(response.data);
        } else {
          message.error(response.message ?? "Không thể tải thông tin chi tiết doanh nghiệp");
          router.back();
        }
      } catch (error: any) {
        message.error(error.message ?? "Đã xảy ra lỗi khi tải thông tin doanh nghiệp");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải thông tin doanh nghiệp...</span>
      </div>
    );
  }

  if (!item) return null;

  const statusColor = CompanyInfoStatusConstant.getColor(item.status);
  const statusName = CompanyInfoStatusConstant.getDisplayName(item.status);

  return (
    <div style={{ padding: "0px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <AutoBreadcrumb />
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>

      <Card
        className="customCardShadow"
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
            <ShopOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
                {item.name}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 400, marginTop: 2 }}>
                MST: <span style={{ fontWeight: 600 }}>{item.taxCode}</span>
              </div>
            </div>
          </div>
        }
        extra={<Tag color={statusColor} style={{ fontSize: "13px", padding: "4px 12px" }}>{statusName}</Tag>}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: "0 0 12px 0" }}>
                  <ShopOutlined /> Thông tin chung
                </h4>
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Tên doanh nghiệp" labelStyle={{ width: "240px", fontWeight: 600 }}>
                    {item.name}
                  </Descriptions.Item>
                  {item.englishName && (
                    <Descriptions.Item label="Tên tiếng Anh" labelStyle={{ fontWeight: 600 }}>
                      {item.englishName}
                    </Descriptions.Item>
                  )}
                  {item.shortName && (
                    <Descriptions.Item label="Tên viết tắt" labelStyle={{ fontWeight: 600 }}>
                      {item.shortName}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Mã số thuế" labelStyle={{ fontWeight: 600 }}>
                    {item.taxCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại tổ chức" labelStyle={{ fontWeight: 600 }}>
                    {TypeOrganizationConstant.getDisplayName(item.typeOrganization ?? "") || item.typeOrganizationName || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ đăng ký" labelStyle={{ fontWeight: 600 }}>
                    {item.address}
                  </Descriptions.Item>
                  {item.cityName && (
                    <Descriptions.Item label="Tỉnh / Thành phố" labelStyle={{ fontWeight: 600 }}>
                      {item.cityName}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>

              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: "0 0 12px 0" }}>
                  <UserOutlined /> Người đại diện pháp luật
                </h4>
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Họ và tên" labelStyle={{ width: "240px", fontWeight: 600 }}>
                    {item.representerName || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số CMND/CCCD/Hộ chiếu" labelStyle={{ fontWeight: 600 }}>
                    {item.representerCCCD || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điện thoại di động" labelStyle={{ fontWeight: 600 }}>
                    {item.representerMobile || item.representerPhone || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email liên hệ" labelStyle={{ fontWeight: 600 }}>
                    {item.representerEmail || "-"}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: "0 0 12px 0" }}>
                  <ShopOutlined /> Liên hệ doanh nghiệp
                </h4>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Số điện thoại" labelStyle={{ fontWeight: 600 }}>
                    {item.phone || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email" labelStyle={{ fontWeight: 600 }}>
                    {item.email || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fax" labelStyle={{ fontWeight: 600 }}>
                    {item.fax || "-"}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <div>
                <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: "0 0 12px 0" }}>
                  <FileTextOutlined /> Tài liệu pháp lý
                </h4>
                <div style={{ padding: "16px", border: "1px solid #f0f0f0", borderRadius: "8px", backgroundColor: "#fafafa", textAlign: "center" }}>
                  {item.dKKD ? (
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <span style={{ fontSize: "13px", color: "#64748b", display: "block" }}>Giấy chứng nhận ĐKKD / Quyết định thành lập</span>
                      <Button type="primary" block href={item.dKKD} target="_blank" rel="noreferrer">
                        Xem tài liệu đính kèm
                      </Button>
                    </Space>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>Chưa cập nhật tài liệu ĐKKD</span>
                  )}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: "0 0 12px 0" }}>
                  Phân loại doanh nghiệp
                </h4>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Yếu tố nước ngoài" labelStyle={{ fontWeight: 600 }}>
                    {item.isNuocNgoai ? <Tag color="blue">Có</Tag> : "Không"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vốn đầu tư nước ngoài" labelStyle={{ fontWeight: 600 }}>
                    {item.isVonDauTuNuocNgoai ? <Tag color="purple">Có</Tag> : "Không"}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default withAuthorization(CompanyDetailPage, "");
