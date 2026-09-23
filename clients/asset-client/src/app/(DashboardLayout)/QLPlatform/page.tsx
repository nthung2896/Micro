"use client";
import React from "react";
import { Card, Col, Row } from "antd";
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  DashboardOutlined,
  GlobalOutlined,
  CloudServerOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";

const QLPlatformPortal: React.FC = () => {
  const router = useRouter();

  const menuItems = [
    {
      title: "ĐẶT HÀNG NƯỚC NGOÀI",
      subtitle: "Đặt hàng trực tuyến nước ngoài",
      description: "Thương nhân, tổ chức nước ngoài sở hữu website/ứng dụng thương mại điện tử có chức năng đặt hàng trực tuyến and hoạt động thương mại điện tử tại Việt Nam.",
      route: "/QLPlatform/DatHangNuocNgoai",
      icon: <GlobalOutlined className="portal-icon" />,
      colorClass: "emerald",
    },
    {
      title: "TRUNG GIAN TRONG NƯỚC",
      subtitle: "Nền tảng trung gian trong nước",
      description: "Sàn giao dịch TMĐT, website khuyến mại, đấu giá trực tuyến, hoặc các dịch vụ hỗ trợ thanh toán tích hợp thương mại điện tử do tổ chức trong nước sở hữu.",
      route: "/QLPlatform/TrungGianTrongNuoc",
      icon: <AppstoreOutlined className="portal-icon" />,
      colorClass: "purple",
    },
    {
      title: "TRUNG GIAN NƯỚC NGOÀI",
      subtitle: "Nền tảng trung gian nước ngoài",
      description: "Sàn giao dịch TMĐT nước ngoài, mạng xã hội hoạt động thương mại điện tử nước ngoài hoặc nền tảng thương mại điện tử tích hợp nước ngoài cung cấp dịch vụ tại VN.",
      route: "/QLPlatform/TrungGianNuocNgoai",
      icon: <CloudServerOutlined className="portal-icon" />,
      colorClass: "blue",
    },
  ];

  return (
    <>
      <style jsx global>{`
        /* Lưới nền tinh tế */
        .portal-grid-bg {
          position: relative;
          background-color: #f8fafc;
          border-radius: 16px;
          padding: 32px;
          min-height: calc(100vh - 180px);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        
        .portal-grid-bg::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(226, 232, 240, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(226, 232, 240, 0.4) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
          z-index: 0;
        }

        .portal-hero {
          position: relative;
          z-index: 1;
          margin-bottom: 40px;
          text-align: center;
        }

        .portal-title-gradient {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #1e293b 0%, #475569 50%, #0f172a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .portal-subtitle {
          font-size: 16px;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Glassmorphism Portal Card */
        .portal-card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 20px !important;
          box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          cursor: pointer;
          height: 100%;
          overflow: hidden;
        }

        .portal-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          transition: all 0.3s ease;
        }

        /* Glow effect on hover */
        .portal-card.emerald::before { background: linear-gradient(90deg, #10b981, #059669); }
        .portal-card.purple::before { background: linear-gradient(90deg, #8b5cf6, #6366f1); }
        .portal-card.blue::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }

        .portal-card:hover {
          transform: translateY(-8px) scale(1.015);
          background: rgba(255, 255, 255, 0.95);
        }

        .portal-card.emerald:hover {
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.15), 0 0 1px 1px rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .portal-card.purple:hover {
          box-shadow: 0 20px 40px -10px rgba(139, 92, 246, 0.15), 0 0 1px 1px rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .portal-card.blue:hover {
          box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.15), 0 0 1px 1px rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .card-inner {
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .card-badge {
          align-self: flex-start;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .emerald .card-badge { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .purple .card-badge { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
        .blue .card-badge { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

        .icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: all 0.3s ease;
        }

        .emerald .icon-wrapper { background: #f0fdf4; color: #10b981; }
        .purple .icon-wrapper { background: #faf5ff; color: #8b5cf6; }
        .blue .icon-wrapper { background: #f0f9ff; color: #3b82f6; }

        .portal-card:hover .icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .emerald:hover .icon-wrapper { background: #10b981; color: white; }
        .purple:hover .icon-wrapper { background: #8b5cf6; color: white; }
        .blue:hover .icon-wrapper { background: #3b82f6; color: white; }

        .portal-icon {
          font-size: 26px;
        }

        .card-title {
          font-size: 14px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .card-subtitle {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          line-height: 1.3;
          transition: color 0.2s ease;
        }

        .portal-card:hover .card-subtitle {
          color: #0f172a;
        }

        .card-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 24px;
          flex-grow: 1;
        }

        .card-action {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .emerald .card-action { color: #10b981; }
        .purple .card-action { color: #8b5cf6; }
        .blue .card-action { color: #3b82f6; }

        .portal-card:hover .card-action {
          gap: 14px;
        }
      `}</style>

      <div className="mb-3">
        <AutoBreadcrumb />
      </div>

      <div className="portal-grid-bg">
        <div className="portal-hero">
          <h1 className="portal-title-gradient">
            <DashboardOutlined style={{ fontSize: "28px" }} />
            CỔNG QUẢN LÝ NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ
          </h1>
          <p className="portal-subtitle">
            Hệ thống tiếp nhận, rà soát và phê duyệt các hồ sơ đăng ký hoạt động thương mại điện tử thuộc thẩm quyền xử lý của Cục Thương mại điện tử và Kinh tế số.
          </p>
        </div>

        <Row gutter={[24, 24]} style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
          {menuItems.map((item, idx) => (
            <Col key={idx} xs={24} md={8}>
              <Card
                className={`portal-card ${item.colorClass}`}
                bodyStyle={{ padding: 0, height: "100%" }}
                onClick={() => router.push(item.route)}
              >
                <div className="card-inner">
                  <div>
                    <div className="icon-wrapper">{item.icon}</div>
                    <div className="card-title">{item.title}</div>
                    <h3 className="card-subtitle">{item.subtitle}</h3>
                    <p className="card-desc">{item.description}</p>
                  </div>
                  <div className="card-action">
                    <span>Quản lý hồ sơ</span>
                    <ArrowRightOutlined />
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default withAuthorization(QLPlatformPortal, "");
