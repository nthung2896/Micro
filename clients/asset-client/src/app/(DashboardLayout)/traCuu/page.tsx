"use client";
import React, { useState, useEffect } from "react";
import { Card, Table, Tag, Input, Button, Space, Badge, TableProps, Spin, Empty, Tooltip, Image } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  BankOutlined,
} from "@ant-design/icons";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { useSearchParams, useRouter } from "next/navigation";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import dayjs from "dayjs";
import { buildFileServerUrl } from "@/utils/file";

const TraCuuPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keywordFromUrl = searchParams.get("keyword") || "";

  const [keyword, setKeyword] = useState<string>(keywordFromUrl);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  // Hàm gọi API lấy dữ liệu thật
  const handleFetchData = async (searchKeyword: string) => {
    setLoading(true);
    console.log(">>> Đang gọi API lấy dữ liệu tra cứu cho mã số thuế:", searchKeyword);
    try {
      const res = await companyInfoService.getTraCuu(searchKeyword);
      if (res.status) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Lỗi gọi API tra cứu:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Tự động chạy và gọi API mỗi khi keyword trên URL thay đổi
  useEffect(() => {
    setKeyword(keywordFromUrl);
    if (keywordFromUrl.trim()) {
      handleFetchData(keywordFromUrl.trim());
    } else {
      setData(null);
    }
  }, [keywordFromUrl]);

  const breadcrumbItems = [
    { title: "Trang chủ", href: "/dashboard" },
    { title: "Tra cứu", href: "/traCuu" },
  ];

  const handleSearch = () => {
    console.log("Từ khóa tìm kiếm:", keyword);
    router.push(`/traCuu?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  // Định nghĩa các cột cho bảng Tài khoản thương nhân
  const columnsTaiKhoan: TableProps<any>["columns"] = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Doanh nghiệp",
      key: "nameInfo",
      render: (_, record) => (
        <div>
          <div
            className="font-semibold text-blue-600 cursor-pointer hover:underline"
            onClick={() => {
              if (record.id) {
                router.push(`/QLDoanhNghiep/detail/${record.id}`);
              }
            }}
          >
            {record.name || "-"}
          </div>
          {record.taxCode && (
            <div className="mt-1">
              <Tag color="blue">MST: {record.taxCode}</Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Người đại diện",
      key: "representer",
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-800">{record.representerName || "-"}</div>
          {record.representerCCCD && (
            <div className="text-gray-400 text-xs">CCCD: {record.representerCCCD}</div>
          )}
        </div>
      ),
    },
    {
      title: "Liên hệ người đại diện",
      key: "representerContact",
      render: (_, record) => (
        <div style={{ fontSize: "13px" }}>
          {record.representerMobile && <div>SĐT: {record.representerMobile}</div>}
          {record.representerPhone && <div>Điện thoại: {record.representerPhone}</div>}
          {record.representerEmail && <div>Email: {record.representerEmail}</div>}
          {!record.representerMobile && !record.representerPhone && !record.representerEmail && "-"}
        </div>
      ),
    },
    {
      title: "Thông tin đăng nhập",
      key: "loginInfo",
      render: (_, record) => (
        <div>
          <div>Tên đăng nhập: <strong className="text-gray-700">{record.userName || "-"}</strong></div>
          {record.tenNguoiDung && (
            <div className="text-gray-600 text-xs mt-1">Tên người dùng: {record.tenNguoiDung}</div>
          )}
          <div className="text-gray-500 text-xs mt-1">Email nhận tin: {record.email || "-"}</div>
        </div>
      ),
    },
  ];

  // Định nghĩa các cột chung cho các bảng Nền tảng (Giống hệt /QLPlatform/NenTangTrucTuyen)
  const columnsNenTang: TableProps<any>["columns"] = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên nền tảng",
      key: "platform_name",
      width: 320,
      align: "left",
      render: (_, record) => {
        const href = record.domain ? (record.domain.startsWith("http") ? record.domain : `https://${record.domain}`) : "";
        return (
          <div style={{ display: "flex", gap: 12 }}>
            <Image
              src={buildFileServerUrl(record.imagePath) || ""}
              alt={record.name ?? "Logo"}
              width={40}
              height={40}
              style={{ objectFit: "contain", borderRadius: 8, border: "1px solid #e2e8f0", flexShrink: 0 }}
              fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23f1f5f9' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='10'%3ENo img%3C/text%3E%3C/svg%3E"
              preview={false}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <div
                onClick={() => {
                  if (record.id) {
                    router.push(`/QLPlatform/detail/${record.id}`);
                  }
                }}
                style={{
                  fontWeight: 700,
                  color: "#1890ff",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "color 0.2s",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#40a9ff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#1890ff")}
              >
                {record.name || "—"}
              </div>

              {/* Tên miền */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px" }}>
                <span style={{ color: "#6b7280" }}>Tên miền:</span>
                {record.domain ? (
                  <Tooltip title={record.domain}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontWeight: 500,
                        color: "#2563eb",
                        textDecoration: "underline",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "inline-block",
                        maxWidth: "180px",
                      }}
                    >
                      {record.domain}
                    </a>
                  </Tooltip>
                ) : (
                  <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Không có</span>
                )}
              </div>

              {/* Loại nền tảng */}
              {record.platformManageTypeName && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "12px", color: "#64748b" }}>
                  <span style={{ color: "#6b7280" }}>Loại:</span>
                  <Tooltip title={record.platformManageTypeName}>
                    <span
                      style={{
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "inline-block",
                        maxWidth: "180px",
                        color: "#334155",
                      }}
                    >
                      {record.platformManageTypeName}
                    </span>
                  </Tooltip>
                </div>
              )}

              {/* Nền tảng số lớn */}
              {record.isNenTangLon === true && (
                <div style={{ marginTop: 2 }}>
                  <Tag color="red" style={{ fontSize: "10px", lineHeight: "14px", padding: "0 6px", borderRadius: 4, margin: 0 }}>
                    Nền tảng số lớn
                  </Tag>
                </div>
              )}

              {/* Hạn xử lý */}
              {(() => {
                const deadline = record.dateLineEnterprise || record.dateLine;
                if (!deadline) return null;
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const target = new Date(deadline);
                target.setHours(0, 0, 0, 0);
                const diffTime = target.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0) {
                  return (
                    <div style={{ marginTop: 2 }}>
                      <Tag color="warning" style={{ fontSize: "11px", lineHeight: "16px", padding: "0 8px", borderRadius: 4, margin: 0 }}>
                        Hạn xử lý: Còn {diffDays} ngày
                      </Tag>
                    </div>
                  );
                } else {
                  return (
                    <div style={{ marginTop: 2 }}>
                      <Tag color="error" style={{ fontSize: "11px", lineHeight: "16px", padding: "0 8px", borderRadius: 4, margin: 0 }}>
                        Hạn xử lý: Quá hạn {Math.abs(diffDays)} ngày
                      </Tag>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thông tin doanh nghiệp chủ quản",
      key: "company_info",
      width: 280,
      onCell: (record) => ({
        onClick: (e) => {
          e.stopPropagation();
          if (record.companyId) {
            router.push(`/QLDoanhNghiep/detail/${record.companyId}`);
          }
        },
        style: {
          cursor: record.companyId ? "pointer" : "default"
        }
      }),
      render: (_, record) => {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div
              style={{
                fontWeight: 600,
                color: record.companyId ? "#2563eb" : "#1e293b",
                fontSize: "13px",
              }}
            >
              {record.companyName || "Chưa cập nhật"}
            </div>
            {record.companyTaxCode && (
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                MST/Mã số DN: <span style={{ fontWeight: 500 }}>{record.companyTaxCode}</span>
              </div>
            )}
            {record.companyEmail && (
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Email: <a href={`mailto:${record.companyEmail}`} style={{ fontWeight: 500, color: "#2563eb" }} onClick={(e) => e.stopPropagation()}>{record.companyEmail}</a>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Người đại diện",
      key: "representer_info",
      width: 180,
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "12px" }}>
          <div style={{ fontWeight: 600, color: "#1e293b" }}>{record.representerName || "Chưa cập nhật"}</div>
          {record.representerMobile && (
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              SĐT: <span style={{ fontWeight: 500 }}>{record.representerMobile}</span>
            </div>
          )}
          {record.representerEmail && (
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Email: <a href={`mailto:${record.representerEmail}`} style={{ color: "#2563eb" }} onClick={(e) => e.stopPropagation()}>{record.representerEmail}</a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "statusName",
      width: 140,
      align: "center",
      render: (statusName) => {
        let color = "#64748b";
        if (statusName?.includes("Đã duyệt") || statusName?.includes("Đã xác nhận")) color = "success";
        else if (statusName?.includes("Chờ") || statusName?.includes("Review")) color = "processing";
        else if (statusName?.includes("Yêu cầu") || statusName?.includes("chỉnh sửa") || statusName?.includes("bổ sung")) color = "orange";
        else if (statusName?.includes("Từ chối") || statusName?.includes("Huỷ") || statusName?.includes("Không hợp lệ")) color = "error";
        else if (statusName?.includes("Tạm lưu")) color = "default";

        return (
          <Tag color={color} style={{ borderRadius: 4, padding: "2px 8px", fontWeight: 500, margin: 0 }}>
            {statusName || "Tạm lưu"}
          </Tag>
        );
      },
    },
    {
      title: "Người xử lý",
      dataIndex: "reviewName",
      width: 160,
      align: "center",
      render: (reviewName) => {
        const trimmedName = reviewName?.trim();
        if (trimmedName) {
          return <span>{trimmedName}</span>;
        }
        return <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa phân công</span>;
      },
    },
    {
      title: "Thời gian xử lý",
      key: "progress",
      width: 220,
      align: "left",
      render: (_, record) => {
        const createdStr = record.createdDate ? dayjs(record.createdDate).format("DD/MM/YYYY HH:mm") : "—";
        const submitStr = record.submitDate ? dayjs(record.submitDate).format("DD/MM/YYYY HH:mm") : null;
        const reviewStr = record.reviewDate ? dayjs(record.reviewDate).format("DD/MM/YYYY HH:mm") : null;
        return (
          <div style={{ fontSize: "12px", color: "#475569" }}>
            <div>
              <span style={{ color: "#6b7280" }}>Ngày tạo:</span> <span style={{ fontWeight: 500 }}>{createdStr}</span>
            </div>
            {submitStr && (
              <div style={{ marginTop: 2 }}>
                <span style={{ color: "#6b7280" }}>Gửi duyệt:</span> <span style={{ fontWeight: 500 }}>{submitStr}</span>
              </div>
            )}
            {reviewStr && (
              <div style={{ marginTop: 2 }}>
                <span style={{ color: "#6b7280" }}>Ngày duyệt:</span> <span style={{ fontWeight: 500 }}>{reviewStr}</span>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-2">
        <AutoBreadcrumb items={breadcrumbItems} />
      </div>

      {/* Bộ lọc tìm kiếm nhanh đầu trang */}
      <Card className="customCardShadow mb-4" style={{ borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Input
            placeholder="Nhập mã số thuế để tra cứu thông tin..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            style={{ flex: 1, borderRadius: 6 }}
            allowClear
          />
          <Button
            color="cyan" variant="solid"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            Tìm kiếm
          </Button>
        </div>
      </Card>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <Spin size="large" tip="Đang tìm kiếm..." />
        </div>
      ) : keywordFromUrl.trim() ? (
        data && (data.thongTinTaiKhoan || data.ntThongBaoKD || data.ntDangKyKDNuocNgoai || data.ntTichHop || data.ntTichHopNuocNgoai) ? (
          <Space direction="vertical" size="large" style={{ width: "100%", display: "flex" }}>
            {/* 1. Thông tin tài khoản thương nhân */}
            <Card
              title={
                <Space>
                  <BankOutlined className="text-blue-600" />
                  <span className="font-bold text-gray-800">Thông tin tài khoản thương nhân</span>
                </Space>
              }
              className="customCardShadow"
              styles={{ header: { borderLeft: "4px solid #1890ff", paddingLeft: 12 } }}
            >
              <Table
                dataSource={data?.thongTinTaiKhoan ? [data.thongTinTaiKhoan] : []}
                columns={columnsTaiKhoan}
                pagination={false}
                bordered
                size="middle"
                rowClassName={() => "hover:bg-blue-50/20 transition-colors"}
                loading={loading}
                locale={{ emptyText: "Không có dữ liệu tài khoản thương nhân" }}
              />
            </Card>

            {/* 2. Nền tảng TMĐT kinh doanh trực tiếp */}
            <Card
              title={
                <Space>
                  <GlobalOutlined className="text-blue-600" />
                  <span className="font-bold text-gray-800">Nền tảng TMĐT kinh doanh trực tiếp có chức năng đặt hàng trực tuyến</span>
                </Space>
              }
              className="customCardShadow"
              styles={{ header: { borderLeft: "4px solid #1890ff", paddingLeft: 12 } }}
            >
              <Table
                dataSource={data?.ntThongBaoKD ? [data.ntThongBaoKD] : []}
                columns={columnsNenTang}
                pagination={false}
                bordered
                size="middle"
                rowClassName={() => "hover:bg-blue-50/20 transition-colors"}
                loading={loading}
                locale={{ emptyText: "Không có dữ liệu nền tảng thông báo kinh doanh" }}
              />
            </Card>

            {/* 3. Nền tảng TMĐT nước ngoài có hoạt động tại VN */}
            <Card
              title={
                <Space>
                  <GlobalOutlined className="text-blue-600" />
                  <span className="font-bold text-gray-800">Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có hoạt động tại Việt Nam</span>
                </Space>
              }
              className="customCardShadow"
              styles={{ header: { borderLeft: "4px solid #1890ff", paddingLeft: 12 } }}
            >
              <Table
                dataSource={data?.ntDangKyKDNuocNgoai ? [data.ntDangKyKDNuocNgoai] : []}
                columns={columnsNenTang}
                pagination={false}
                bordered
                size="middle"
                rowClassName={() => "hover:bg-blue-50/20 transition-colors"}
                loading={loading}
                locale={{ emptyText: "Không có dữ liệu nền tảng đăng ký nước ngoài" }}
              />
            </Card>

            {/* 4. Nền tảng TMĐT trung gian, MXH, tích hợp */}
            <Card
              title={
                <Space>
                  <AppstoreOutlined className="text-blue-600" />
                  <span className="font-bold text-gray-800">Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, nền tảng tích hợp</span>
                </Space>
              }
              className="customCardShadow"
              styles={{ header: { borderLeft: "4px solid #1890ff", paddingLeft: 12 } }}
            >
              <Table
                dataSource={data?.ntTichHop ? [data.ntTichHop] : []}
                columns={columnsNenTang}
                pagination={false}
                bordered
                size="middle"
                rowClassName={() => "hover:bg-blue-50/20 transition-colors"}
                loading={loading}
                locale={{ emptyText: "Không có dữ liệu nền tảng tích hợp trong nước" }}
              />
            </Card>

            {/* 5. Nền tảng TMĐT trung gian nước ngoài, MXH nước ngoài */}
            <Card
              title={
                <Space>
                  <AppstoreOutlined className="text-blue-600" />
                  <span className="font-bold text-gray-800">Nền tảng TMĐT trung gian nước ngoài, mạng xã hội hoạt động TMĐT nước ngoài</span>
                </Space>
              }
              className="customCardShadow"
              styles={{ header: { borderLeft: "4px solid #1890ff", paddingLeft: 12 } }}
            >
              <Table
                dataSource={data?.ntTichHopNuocNgoai ? [data.ntTichHopNuocNgoai] : []}
                columns={columnsNenTang}
                pagination={false}
                bordered
                size="middle"
                rowClassName={() => "hover:bg-blue-50/20 transition-colors"}
                loading={loading}
                locale={{ emptyText: "Không có dữ liệu nền tảng tích hợp nước ngoài" }}
              />
            </Card>
          </Space>
        ) : (
          <Card className="customCardShadow" style={{ borderRadius: 8, padding: "50px 0", textAlign: "center" }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <h3 style={{ color: "#ff4d4f", fontWeight: "bold", fontSize: "16px", marginBottom: 8 }}>Không tìm thấy thông tin</h3>
                  <p style={{ color: "#8c8c8c", fontSize: "14px" }}>
                    Không tồn tại tài khoản hoặc nền tảng hoạt động cho doanh nghiệp có mã số thuế <strong className="text-blue-600">"{keywordFromUrl}"</strong>.
                  </p>
                </div>
              }
            />
          </Card>
        )
      ) : (
        <Card className="customCardShadow" style={{ borderRadius: 8, padding: "50px 0", textAlign: "center" }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <p style={{ color: "#8c8c8c", fontSize: "14px" }}>
                  Vui lòng nhập mã số thuế doanh nghiệp để tiến hành tra cứu.
                </p>
              </div>
            }
          />
        </Card>
      )}
    </>
  );
};

export default TraCuuPage;
