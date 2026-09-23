"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Image, Pagination, Table, TableProps, Tooltip, message, Button, Space, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { PlatformManageListType } from "@/types/platformManage/dto";
import dangKyXemService from "@/services/dangKyXem/dangKyXem.service";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { useDispatch, useSelector } from "@/store/hooks";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { buildFileUrl } from "@/utils/file";
import PlatformManageDetail from "../QLPlatform/NenTangTrucTuyen/detail";
import NenTangDuocXemSearch from "./search";
import { PlatformManageSearchType } from "@/types/platformManage/request";
import { FormProps } from "antd";

export default function NenTangDuocXemPage() {
  const dispatch = useDispatch();
  const [data, setData] = useState<{ items: PlatformManageListType[], totalCount: number }>({ items: [], totalCount: 0 });
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const loading = useSelector((s) => s.general.isLoading);
  const [searchValues, setSearchValues] = useState<PlatformManageSearchType | null>(null);

  const router = useRouter();

  const handleLoadData = useCallback(async () => {
    dispatch(setIsLoading(true));
    try {
      const searchParams = { ...searchValues, pageIndex, pageSize };
      const response = await dangKyXemService.getAllowedPlatforms(searchParams);
      if (response?.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải danh sách nền tảng được xem.");
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [dispatch, pageIndex, pageSize, searchValues]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  const onFinishSearch: FormProps<PlatformManageSearchType>["onFinish"] =
    async (values) => {
      const queryValues = { ...values };
      setSearchValues(queryValues);
      setPageIndex(1);
    };

  const handleShowDetail = (record: PlatformManageListType) => {
    const tabs = (record as any).allowedTabs || "";
    router.push(`/nenTangDuocXem/detail/${record.id}?allowedTabs=${encodeURIComponent(tabs)}`);
  };

  const columns: TableProps<PlatformManageListType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_: unknown, __: unknown, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Thông tin nền tảng",
      key: "platform_info",
      width: 350,
      align: "left" as const,
      render: (_: any, record: PlatformManageListType) => {
        const src = record.imagePath ? `/api/file/get?path=${record.imagePath}` : "";
        const href = record.domain ? (record.domain.startsWith("http") ? record.domain : `https://${record.domain}`) : "";
        return (
          <div style={{ display: "flex", gap: 12 }}>
            <Image
              src={src || ""}
              alt={record.name ?? "Logo"}
              width={40}
              height={40}
              style={{ objectFit: "contain", borderRadius: 8, border: "1px solid #e2e8f0", flexShrink: 0 }}
              fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect fill='%23f1f5f9' width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='10'%3ENo img%3C/text%3E%3C/svg%3E"
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <div
                onClick={() => handleShowDetail(record)}
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

              {record.isNenTangLon === true && (
                <div style={{ marginTop: 2 }}>
                  <Tag color="red" style={{ fontSize: "10px", lineHeight: "14px", padding: "0 6px", borderRadius: 4, margin: 0 }}>
                    Nền tảng số lớn
                  </Tag>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Thông tin doanh nghiệp chủ quản",
      key: "company_info",
      width: 280,
      onCell: (record: PlatformManageListType) => ({
        onClick: (e: any) => {
          e.stopPropagation();
          if (record.organizationId) {
            router.push(`/QLDoanhNghiep/detail/${record.organizationId}`);
          }
        },
        style: {
          cursor: record.organizationId ? "pointer" : "default"
        }
      }),
      render: (_: any, record: PlatformManageListType) => {
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div
              style={{
                fontWeight: 600,
                color: record.organizationId ? "#2563eb" : "#1e293b",
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
                Email: <a href={`mailto:${record.companyEmail}`} style={{ fontWeight: 500, color: "#2563eb" }}>{record.companyEmail}</a>
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
      render: (_: any, record: PlatformManageListType) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "12px" }}>
          <div style={{ fontWeight: 600, color: "#1e293b" }}>{record.representerName || "Chưa cập nhật"}</div>
          {record.representerMobile && (
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              SĐT: <span style={{ fontWeight: 500 }}>{record.representerMobile}</span>
            </div>
          )}
          {record.representerEmail && (
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Email: <a href={`mailto:${record.representerEmail}`} style={{ color: "#2563eb" }}>{record.representerEmail}</a>
            </div>
          )}
        </div>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      align: "center",
      render: (status: number, record: any) => {
        let color = PlatformStatusConstant.getColor(status);
        let text = record.statusName || PlatformStatusConstant.getDisplayName(status) || "Tạm lưu";

        return (
          <Tag color={color} style={{ borderRadius: 4, padding: "2px 8px", fontWeight: 500, margin: 0 }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Người xử lý",
      dataIndex: "reviewName",
      width: 160,
      align: "center" as const,
      ellipsis: true,
      render: (name: string | null) => {
        const trimmedName = name?.trim();
        return trimmedName || "—";
      },
    },
    {
      title: "Thời gian hiển thị",
      key: "display_time",
      width: 160,
      align: "center",
      render: (_: any, record: PlatformManageListType) => {
        const from = record.allowedFromDate ? new Date(record.allowedFromDate).toLocaleDateString("vi-VN") : "---";
        const to = record.allowedToDate ? new Date(record.allowedToDate).toLocaleDateString("vi-VN") : "---";
        return (
          <div style={{ fontSize: "12px", color: "#475569" }}>
            <div style={{ fontWeight: 500 }}>{from}</div>
            <div>{"->"}</div>
            <div style={{ fontWeight: 500 }}>{to}</div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_: any, record: PlatformManageListType) => (
        <Button
          type="primary"
          
          icon={<EyeOutlined />}
          onClick={() => handleShowDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const breadcrumbItems = [
    { title: "Trang chủ", href: "/" },
    { title: "Nền tảng được xem" },
  ];

  return (
    <>
      <AutoBreadcrumb items={breadcrumbItems} />

      <NenTangDuocXemSearch
        onFinish={onFinishSearch}
        isStaff={true}
      />

      <Card className={"customCardShadow"}>
        <div className="table-responsive">
          <Table
            columns={columns}
            bordered
            dataSource={data?.items}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
          />
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            total={data?.totalCount}
            showTotal={(total, range) => `${range[0]}-${range[1]} trong ${total} dữ liệu`}
            pageSize={pageSize}
            current={pageIndex}
            onChange={(page, size) => {
              setPageIndex(page);
              setPageSize(size);
            }}
            showSizeChanger
            align="end"
          />
        </div>
      </Card>
    </>
  );
}
