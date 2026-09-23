"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  DatePicker,
  Button,
  Spin,
  message,
  Badge,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FileExcelOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  FileProtectOutlined,
  DatabaseOutlined,
  PieChartOutlined,
  DownOutlined,
  RightOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import platformManageService, {
  DashboardThongKeHoSoNenTangDto,
  PlatformThongKeDto,
  ContractThongKeDto,
} from "@/services/platformManage/platformManage.service";
import { downloadFileFromBase64 } from "@/utils/fileDownload";

const { RangePicker } = DatePicker;

const platformStatusesToShow = [
  // { key: 0, label: "Tạm lưu", color: "#8c8c8c" },
  { key: 1, label: "Chờ duyệt", color: "#0355a2" },
  { key: 2, label: "Đề nghị chỉnh sửa", color: "#faad14" },
  { key: 6, label: "Cần bổ sung thông tin", color: "#faad14" },
  { key: 25, label: "Đang xin ý kiến", color: "#722ed1" },
  // { key: 28, label: "Cần bản giấy", color: "#faad14" },
  { key: 3, label: "Bị từ chối", color: "#ff4d4f" },
  { key: 4, label: "Đã duyệt điện tử", color: "#52c41a" },
  { key: 26, label: "Đã review", color: "#52c41a" },
  { key: 5, label: "Đã xác nhận", color: "#52c41a" },
  { key: 9, label: "Đề nghị chấm dứt đăng ký", color: "#faad14" },
  { key: 7, label: "Đã chấm dứt đăng ký", color: "#8c8c8c" },
  { key: 8, label: "Đã huỷ đăng ký", color: "#8c8c8c" },
  { key: 10, label: "Đã khoá", color: "#ff4d4f" },
  { key: 11, label: "Đã yêu cầu gia hạn", color: "#13c2c2" },
  { key: 12, label: "Chờ gia hạn", color: "#0355a2" },
  { key: 27, label: "Không hợp lệ", color: "#f5222d" },
];

const contractStatusesToShow = [
  { key: 1, label: "Chờ duyệt", color: "#0355a2" },
  { key: 2, label: "Đề nghị chỉnh sửa", color: "#faad14" },
  { key: 6, label: "Cần bổ sung thông tin", color: "#faad14" },
  // { key: 28, label: "Cần bản giấy", color: "#faad14" },
  { key: 3, label: "Bị từ chối", color: "#ff4d4f" },
  { key: 4, label: "Đã duyệt điện tử", color: "#52c41a" },
  { key: 26, label: "Đã review", color: "#52c41a" },
  { key: 5, label: "Đã xác nhận", color: "#52c41a" },
  { key: 9, label: "Đề nghị chấm dứt đăng ký", color: "#faad14" },
  { key: 7, label: "Đã chấm dứt đăng ký", color: "#8c8c8c" },
  { key: 8, label: "Đã huỷ đăng ký", color: "#8c8c8c" },
];

const DashboardThongKeTabs: React.FC = () => {
  const [dates, setDates] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [data, setData] = useState<DashboardThongKeHoSoNenTangDto | null>(null);
  const [collapsedStates, setCollapsedStates] = useState<
    Record<string, boolean>
  >({
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
  });

  const toggleCollapse = (key: string) => {
    setCollapsedStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchData = async (dateRange = dates) => {
    setLoading(true);
    try {
      const searchParams: any = {};
      if (dateRange && dateRange[0]) {
        searchParams.CreatedDateFrom = dateRange[0].toISOString();
      }
      if (dateRange && dateRange[1]) {
        searchParams.CreatedDateTo = dateRange[1].toISOString();
      }

      const res =
        await platformManageService.getDashboardThongKeHoSoNenTang(
          searchParams,
        );
      if (res.status && res.data) {
        setData(res.data);
      } else {
        message.error(res.message || "Lấy dữ liệu thống kê thất bại");
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Có lỗi xảy ra khi tải số liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const searchParams: any = {};
      if (dates && dates[0]) {
        searchParams.CreatedDateFrom = dates[0].toISOString();
      }
      if (dates && dates[1]) {
        searchParams.CreatedDateTo = dates[1].toISOString();
      }

      const res =
        await platformManageService.exportDashboardThongKeHoSoNenTang(
          searchParams,
        );
      if (res.status && res.data) {
        downloadFileFromBase64(
          res.data,
          `BaoCaoThongKeHoSoNenTang_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
        );
        message.success("Xuất file Excel thành công!");
      } else {
        message.error(res.message || "Xuất Excel thất bại");
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Có lỗi xảy ra khi xuất Excel");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderCategoryCard = (
    key: string,
    title: string,
    platformData?: PlatformThongKeDto | ContractThongKeDto,
    statusesList: any[] = platformStatusesToShow,
    icon = <DatabaseOutlined />,
  ) => {
    if (!platformData) return null;

    const isCollapsed = collapsedStates[key];
    const total = statusesList.reduce(
      (a: number, status: any) => a + (Number(platformData.statuses[status.key]) || 0),
      0,
    );

    return (
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              cursor: "pointer",
            }}
            onClick={() => toggleCollapse(key)}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 700,
                fontSize: "14px",
                color: "#1f2937",
                flex: 1,
                minWidth: 0,
                paddingRight: "8px"
              }}
            >
              {isCollapsed ? (
                <RightOutlined
                  style={{
                    color: "#8c8c8c",
                    fontSize: "11px",
                    marginRight: "2px",
                    flexShrink: 0
                  }}
                />
              ) : (
                <DownOutlined
                  style={{
                    color: "#8c8c8c",
                    fontSize: "11px",
                    marginRight: "2px",
                    flexShrink: 0
                  }}
                />
              )}
              {React.cloneElement(icon as React.ReactElement, {
                style: { color: "#1890ff", fontSize: "16px", flexShrink: 0 },
              })}
              <span
                style={{
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  display: "block",
                  lineHeight: "1.4",
                }}
              >
                {title}
              </span>
            </span>
            <div style={{ flexShrink: 0 }}>
              <Badge
                count={total}
                overflowCount={9999}
                style={{ backgroundColor: "#1890ff", boxShadow: "none" }}
              />
            </div>
          </div>
        }
        bordered={false}
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          border: "1px solid #f0f0f0",
          height: isCollapsed ? "auto" : "100%",
          alignSelf: isCollapsed ? "flex-start" : "stretch",
          background: "#ffffff",
          width: "100%",
        }}
        bodyStyle={{
          padding: isCollapsed ? "0" : "12px 16px",
          maxHeight: isCollapsed ? "0px" : "1000px",
          overflow: "hidden",
          opacity: isCollapsed ? 0 : 1,
          transition: "all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {statusesList.map((status) => {
            const count = platformData.statuses[status.key] || 0;
            const hasData = count > 0;

            return (
              <div
                key={status.key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: hasData ? `${status.color}08` : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Badge color={status.color} />
                  <span
                    style={{
                      fontSize: "12.5px",
                      fontWeight: hasData ? 600 : 400,
                      color: hasData ? "#374151" : "#9ca3af",
                    }}
                  >
                    {status.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: hasData ? status.color : "#d1d5db",
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <Card
      style={{
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(229, 231, 235, 0.5)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        padding: "8px",
      }}
      bodyStyle={{ padding: "20px" }}
    >
      {/* Filters & Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
            }}
          >
            <PieChartOutlined style={{ color: "#fff", fontSize: "20px" }} />
          </div>
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1f2937",
                margin: 0,
              }}
            >
              Thống kê hồ sơ nền tảng
            </h2>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
              Thống kê hồ sơ nền tảng, báo cáo định kỳ và chứng thực hợp đồng
              điện tử
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563" }}>
            Chọn thời gian:
          </span>
          <RangePicker
            value={dates}
            onChange={(val) => setDates(val as any)}
            placeholder={["Từ ngày", "Đến ngày"]}
            style={{ borderRadius: "8px", width: "260px" }}
            format="DD/MM/YYYY"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => fetchData()}
            style={{
              borderRadius: "8px",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              boxShadow: "0 2px 8px rgba(24, 144, 255, 0.25)",
            }}
          >
            Lọc số liệu
          </Button>
          <Button
            type="default"
            icon={<FileExcelOutlined style={{ color: "#52c41a" }} />}
            onClick={handleExportExcel}
            loading={exporting}
            style={{
              borderRadius: "8px",
              border: "1px solid #d9d9d9",
              fontWeight: 500,
            }}
          >
            Kết xuất Excel
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            {renderCategoryCard(
              "1",
              "Nền tảng TMĐT kinh doanh trực tiếp có đặt hàng trực tuyến",
              data?.nenTangTrucTuyen,
              platformStatusesToShow,
              <DatabaseOutlined />,
            )}
          </Col>
          <Col xs={24} sm={12} lg={8}>
            {renderCategoryCard(
              "2",
              "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có đặt hàng trực tuyến",
              data?.datHangNuocNgoai,
              platformStatusesToShow,
              <GlobalOutlined />,
            )}
          </Col>
          <Col xs={24} sm={12} lg={8}>
            {renderCategoryCard(
              "3",
              "Nền tảng TMĐT trung gian, mạng xã hội có hoạt động TMĐT, TMĐT tích hợp",
              data?.trungGianTrongNuoc,
              platformStatusesToShow,
              <AppstoreOutlined />,
            )}
          </Col>
          <Col xs={24} sm={12} lg={8}>
            {renderCategoryCard(
              "4",
              "Nền tảng TMĐT trung gian, mạng xã hội có hoạt động TMĐT, TMĐT tích hợp nước ngoài",
              data?.trungGianNuocNgoai,
              platformStatusesToShow,
              <GlobalOutlined />,
            )}
          </Col>
          <Col xs={24} sm={12} lg={8}>
            {renderCategoryCard(
              "5",
              "Chứng thực hợp đồng điện tử",
              data?.hopDongDienTu,
              contractStatusesToShow,
              <FileProtectOutlined />,
            )}
          </Col>
          <Col xs={24} sm={12} lg={8}>
            {renderCategoryCard(
              "6",
              "Rút tiền ký quỹ",
              data?.rutTienKyQuy,
              platformStatusesToShow,
              <BankOutlined />,
            )}
          </Col>
        </Row>
      </Spin>

      {/* Micro-animations using styled-jsx */}
      <style jsx global>{`
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
          border-radius: 8px 8px 0 0 !important;
          transition: all 0.3s ease !important;
          border: 1px solid #f0f0f0 !important;
          background: #fafafa !important;
        }
        .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
          background: #fff !important;
          border-color: #f0f0f0 #f0f0f0 #fff !important;
          font-weight: 600 !important;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.02) !important;
        }
        .ant-card {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        }
        .ant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
        }
        .status-card-item {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .status-card-item:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
        .matrix-table .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
          border-bottom: 2px solid #f0f0f0 !important;
          font-size: 13px !important;
          padding: 12px 8px !important;
        }
        .matrix-table .ant-table-tbody > tr > td {
          padding: 14px 10px !important;
        }
        .matrix-table .ant-table-tbody > tr:hover > td {
          background: #f9fafb !important;
        }
      `}</style>
    </Card>
  );
};

export default DashboardThongKeTabs;
