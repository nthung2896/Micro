"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Dropdown,
  MenuProps,
  Pagination,
  Card,
  Tabs,
  Badge,
  Modal,
  message,
  Image,
  Input,
  Tooltip,
  Checkbox,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  DownOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  FileExcelOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import platformManageService from "@/services/platformManage/platformManage.service";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import formatDate from "@/utils/formatDate";
import { buildFileUrl } from "@/utils/file";
import { PlatformManageListType } from "@/types/platformManage/dto";
import { PlatformManageSearchType } from "@/types/platformManage/request";
import { PagedList } from "@/types/general";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { useRouter } from "next/navigation";
import Search from "../search";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { useSelector } from "@/store/hooks";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { CertificateInfo, SignResultItem } from "@/libs/moit-sign/types";
import dayjs from "dayjs";

const EXPORT_FIELDS = [
  { key: "name", label: "Tên nền tảng" },
  { key: "domain", label: "Địa chỉ tên miền / Website" },
  { key: "statusName", label: "Trạng thái" },
  { key: "platformManageTypeName", label: "Loại hình nền tảng" },
  { key: "companyName", label: "Tên doanh nghiệp chủ quản" },
  { key: "companyTaxCode", label: "Mã số thuế" },
  { key: "companyEmail", label: "Email doanh nghiệp" },
  { key: "createdDate", label: "Ngày tạo hồ sơ" },
  { key: "submitDate", label: "Ngày gửi duyệt" },
  { key: "reviewDate", label: "Ngày duyệt/xử lý" },
  { key: "reviewName", label: "Cán bộ xử lý" },
];


interface PlatformIndexEnterpriseProps {
  platformType?: string; // Ví dụ: "NTThongBaoKD", "NTTichHop", "NTNuocNgoai"
  title: string;
}

const PlatformIndexEnterprise: React.FC<PlatformIndexEnterpriseProps> = ({
  platformType = "All",
  title,
}) => {
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isDN = userRoles.includes("DoanhNghiep");

  const [data, setData] = useState<PagedList<PlatformManageListType>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [activeTabKey, setActiveTabKey] = useState<string>("All");
  const [statusCounts, setStatusCounts] = useState<{ [key: number]: number }>({});
  const [isSignDoanhNghiep, setIsSignDoanhNghiep] = useState<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFields, setExportFields] = useState<string[]>(EXPORT_FIELDS.map(f => f.key));

  // Search
  const [searchValues, setSearchValues] = useState<PlatformManageSearchType>({});

  // Modal / UI Control
  const router = useRouter();
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load Data
  const handleLoadData = useCallback(async (overrideSearch?: PlatformManageSearchType) => {
    setLoading(true);
    try {
      const cleaned = Object.fromEntries(
        Object.entries(searchValues || {}).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined,
        ),
      );

      const searchParams: PlatformManageSearchType = overrideSearch ?? {
        pageIndex,
        pageSize,
        platformManageTypeId: platformType !== "All" ? platformType : undefined,
        ...cleaned,
      };

      // Chỉ áp dụng lọc status/listStatus theo activeTabKey nếu searchParams chưa có status và activeTabKey khác All
      if (searchParams.status === undefined && (searchParams as any).listStatus === undefined && activeTabKey !== "All") {
        if (activeTabKey === "NeedsAttention") {
          (searchParams as any).listStatus = [
            PlatformStatusConstant.DeNghiChinhSua,
            PlatformStatusConstant.CanBoSungThongTin,
          ];
        } else {
          searchParams.status = parseInt(activeTabKey, 10);
        }
      }

      const response = await platformManageService.getOnlinePlatformData(searchParams);
      if (response?.status && response.data) {
        setData(response.data);
      }

      // Load counts (tạm comment)
      // const countResponse = await platformManageService.getOnlinePlatformStatusCounts({
      //   platformManageTypeId: platformType !== "All" ? platformType : undefined,
      //   ...(cleaned as PlatformManageSearchType),
      // });
      // if (countResponse?.data) {
      //   setStatusCounts(countResponse.data);
      // }
    } catch {
      message.error("Không tải được danh sách hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, activeTabKey, searchValues, platformType]);

  useEffect(() => {
    handleLoadData();
    const getIsSignDoanhNghiep = async () => {
      const res = await duLieuDanhMucService.getAllByGroupCode(
        "CAUHINH_SIGN_NENTANG"
      );

      if (res.status && res.data?.length) {
        let configCode = "";
        if (platformType === PlatformManageTypeConstant.NTThongBaoKD) {
          configCode = "SIGN_DATHANGTRUCTUYEN";
        } else if (platformType === PlatformManageTypeConstant.NTDangKyKDNuocNgoai) {
          configCode = "SIGN_DATHANGNUOCNGOAI";
        } else if (platformType === PlatformManageTypeConstant.NTTichHop) {
          configCode = "SIGN_TRUNGGIANTRONGNUOC";
        } else if (platformType === PlatformManageTypeConstant.NTTichHopNuocNgoai) {
          configCode = "SIGN_TRUNGGIANNUOCNGOAI";
        }

        const signConfig = configCode ? res.data.find(
          (item: any) => item.code === configCode
        ) : null;
        setIsSignDoanhNghiep(signConfig?.priority === 1);
      }
    };

    getIsSignDoanhNghiep();
  }, [handleLoadData]);

  // Search Handler
  const onFinishSearch = async (values: PlatformManageSearchType) => {
    setSearchValues(values);
    setPageIndex(1);
    const searchData: PlatformManageSearchType = {
      ...values,
      platformManageTypeId: platformType !== "All" ? platformType : undefined,
      pageIndex: 1,
      pageSize,
    };
    if (activeTabKey !== "All") {
      if (activeTabKey === "NeedsAttention") {
        (searchData as any).listStatus = [
          PlatformStatusConstant.DeNghiChinhSua,
          PlatformStatusConstant.CanBoSungThongTin,
        ];
      } else {
        searchData.status = parseInt(activeTabKey, 10);
      }
    }
    await handleLoadData(searchData);
  };

  // Actions
  const handleShowDetail = (record: PlatformManageListType) => {
    router.push(`/QLPlatform/detail/${record.id}`);
  };

  const handleShowEdit = (record: PlatformManageListType) => {
    const type = record.platformManageTypeId || platformType;
    router.push(
      type === "NTThongBaoKD"
        ? `/QLPlatform/NenTangTrucTuyen/createOrUpdate?id=${record.id}`
        : `/QLPlatform/create?id=${record.id}&type=${type}`
    );
  };

  const handleShowCreate = () => {
    router.push(`/QLPlatform/create?type=${platformType}`);
  };

  const handleExportExcel = async () => {
    if (exportFields.length === 0) {
      message.error("Vui lòng chọn ít nhất một trường để xuất!");
      return;
    }
    setLoading(true);
    try {
      const cleaned = Object.fromEntries(
        Object.entries(searchValues || {}).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined,
        ),
      );
      const searchParamsForExport: PlatformManageSearchType = {
        ...cleaned,
        pageIndex: 1,
        pageSize: 100000,
        platformManageTypeId: platformType !== "All" ? platformType : undefined,
      };
      if (activeTabKey !== "All") {
        if (activeTabKey === "NeedsAttention") {
          (searchParamsForExport as any).listStatus = [
            PlatformStatusConstant.DeNghiChinhSua,
            PlatformStatusConstant.CanBoSungThongTin,
          ];
        } else {
          searchParamsForExport.status = parseInt(activeTabKey, 10);
        }
      }
      const res = await platformManageService.exportOnlinePlatformData(searchParamsForExport, exportFields);
      if (res?.status && res.data) {
        const byteCharacters = atob(res.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `DanhSachNenTang_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success("Xuất dữ liệu Excel thành công!");
        setIsExportModalOpen(false);
      } else {
        message.error(res?.message || "Lỗi khi xuất file Excel!");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi xuất file Excel!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setLoading(true);
    try {
      const response = await platformManageService.delete(confirmDeleteId);
      if (response.status) {
        message.success("Xoá hồ sơ nháp thành công");
        handleLoadData();
      } else {
        message.error(response.message ?? "Xoá hồ sơ thất bại");
      }
    } catch {
      message.error("Có lỗi khi xoá hồ sơ");
    } finally {
      setLoading(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      setLoading(true);
      const responseSign = await platformManageService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      const res = await platformManageService.transition({
        id: result[0].id,
        targetStatus: PlatformStatusConstant.ChoDuyet,
        note: "Doanh nghiệp tự gửi duyệt từ màn hình danh sách",
      });

      if (res.status) {
        message.success("Ký số và gửi duyệt hồ sơ thành công");
        handleLoadData();
      } else {
        message.error(res.message ?? "Thao tác gửi thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Có lỗi xảy ra khi ký số");
    } finally {
      setLoading(false);
      setIsSignModalOpen(false);
    }
  };

  const handleSubmitDossier = (record: PlatformManageListType) => {
    if (isSignDoanhNghiep) {
      setSignIds([record.id]);
      setIsSignModalOpen(true);
      return;
    }

    Modal.confirm({
      title: "Xác nhận gửi hồ sơ đăng ký",
      content: `Bạn có chắc chắn muốn gửi hồ sơ "${record.name}" lên hệ thống của Bộ/Sở để phê duyệt?`,
      okText: "Gửi duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const res = await platformManageService.transition({
            id: record.id,
            targetStatus: PlatformStatusConstant.ChoDuyet,
            note: "Doanh nghiệp tự gửi duyệt từ màn hình danh sách",
          });
          if (res.status) {
            message.success("Gửi hồ sơ duyệt thành công");
            handleLoadData();
          } else {
            message.error(res.message ?? "Thao tác gửi thất bại");
          }
        } catch {
          message.error("Có lỗi xảy ra khi chuyển trạng thái");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // ─── Status Tabs ───
  const enterpriseTabs = [
    { key: "All", label: "Tất cả hồ sơ", color: "#2563eb", icon: <AppstoreOutlined /> },
    {
      key: String(PlatformStatusConstant.TamLuu),
      statusValue: PlatformStatusConstant.TamLuu,
      label: "Hồ sơ Nháp",
      color: "#64748b",
      icon: <ClockCircleOutlined />,
    },
    {
      key: String(PlatformStatusConstant.ChoDuyet),
      statusValue: PlatformStatusConstant.ChoDuyet,
      label: "Chờ duyệt",
      color: "#eab308",
      icon: <ClockCircleOutlined />,
    },
    {
      key: "NeedsAttention", // Gộp 2 trạng thái cần chỉnh sửa bổ sung
      label: "Cần chỉnh sửa / Bổ sung",
      color: "#f97316",
      icon: <ExclamationCircleOutlined />,
    },
    {
      key: String(PlatformStatusConstant.DaXacNhan),
      statusValue: PlatformStatusConstant.DaXacNhan,
      label: "Đã duyệt / Xác nhận",
      color: "#16a34a",
      icon: <CheckCircleOutlined />,
    },
    {
      key: String(PlatformStatusConstant.BiTuChoi),
      statusValue: PlatformStatusConstant.BiTuChoi,
      label: "Bị từ chối",
      color: "#dc2626",
      icon: <CloseCircleOutlined />,
    },
  ];


  const totalRecords = Object.values(statusCounts).reduce((sum, c) => sum + c, 0);

  const tabItems = enterpriseTabs.map((tab) => {
    let count = 0;
    if (tab.key === "All") {
      count = totalRecords;
    } else if (tab.key === "NeedsAttention") {
      count = (statusCounts[PlatformStatusConstant.DeNghiChinhSua] ?? 0) +
        (statusCounts[PlatformStatusConstant.CanBoSungThongTin] ?? 0);
    } else {
      count = statusCounts[tab.statusValue!] ?? 0;
    }

    const isActive = activeTabKey === tab.key;
    return {
      key: tab.key,
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, color: isActive ? tab.color : "#94a3b8" }}>{tab.icon}</span>
          <span style={{ fontWeight: isActive ? 600 : 500, color: isActive ? tab.color : "#475569" }}>{tab.label}</span>
          <Badge
            count={count}
            showZero
            style={{
              backgroundColor: isActive ? tab.color : "#f1f5f9",
              color: isActive ? "#fff" : "#64748b",
              fontWeight: 600,
              boxShadow: isActive ? `0 2px 6px ${tab.color}33` : "none",
            }}
          />
        </span>
      ),
    };
  });

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    setPageIndex(1);
  };

  // Columns Definition
  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Tên nền tảng",
      key: "platform_info",
      width: 320,
      align: "left" as const,
      render: (_: any, record: PlatformManageListType) => {
        const src = buildFileUrl(record.imagePath);
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

              {/* {record.isNenTangLon === true && (
                <div style={{ marginTop: 2 }}>
                  <Tag color="red" style={{ fontSize: "10px", lineHeight: "14px", padding: "0 6px", borderRadius: 4, margin: 0 }}>
                    Nền tảng số lớn
                  </Tag>
                </div>
              )} */}
              {(() => {
                if (isDN && record.status !== PlatformStatusConstant.CanBoSungThongTin) return null;
                const deadline = isDN ? record.dateLineEnterprise : record.dateLine;
                if (record.status === PlatformStatusConstant.DaXacNhan || !deadline) return null;
                const formattedDeadline = formatDate(deadline, true);
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
    // {
    //   title: "Người đại diện",
    //   key: "representer_info",
    //   width: 180,
    //   render: (_: any, record: PlatformManageListType) => (
    //     <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "12px" }}>
    //       <div style={{ fontWeight: 600, color: "#1e293b" }}>{record.representerName || "Chưa cập nhật"}</div>
    //       {record.representerMobile && (
    //         <div style={{ fontSize: "11px", color: "#64748b" }}>
    //           SĐT: <span style={{ fontWeight: 500 }}>{record.representerMobile}</span>
    //         </div>
    //       )}
    //       {record.representerEmail && (
    //         <div style={{ fontSize: "11px", color: "#64748b" }}>
    //           Email: <a href={`mailto:${record.representerEmail}`} style={{ color: "#2563eb" }}>{record.representerEmail}</a>
    //         </div>
    //       )}
    //     </div>
    //   ),
    // },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      align: "center" as const,
      render: (status: number, record: any) => {
        let color = "#64748b";
        let text = record.statusName || "Tạm lưu";

        switch (status) {
          case PlatformStatusConstant.TamLuu:
            color = "default";
            break;
          case PlatformStatusConstant.ChoDuyet:
            color = "processing";
            break;
          case PlatformStatusConstant.DeNghiChinhSua:
          case PlatformStatusConstant.CanBoSungThongTin:
            color = "orange";
            break;
          case PlatformStatusConstant.DaXacNhan:
            color = "success";
            break;
          case PlatformStatusConstant.BiTuChoi:
            color = "error";
            break;
          case PlatformStatusConstant.DaDuyetDienTu:
            color = "cyan";
            break;
          case PlatformStatusConstant.DaReview:
            color = "blue";
            break;
          case PlatformStatusConstant.CanBanGiay:
            color = "warning";
            break;
          default:
            color = "default";
            break;
        }

        return (
          <Tag color={color} style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 700, margin: 0 }}>
            {text}
          </Tag>
        );
      },
    },

    ...(!isDN ? [
      {
        title: "Người xử lý",
        dataIndex: "reviewName",
        width: 160,
        align: "center" as const,
        ellipsis: true,
        render: (name: string | null, record: PlatformManageListType) => {
          return name?.trim() || "";
        },
      }
    ] : []),

    {
      title: "Thời gian xử lý",
      key: "progress",
      width: 220,
      align: "left" as const,
      render: (_: any, record: PlatformManageListType) => {
        const createdStr = record.createdDate ? formatDate(record.createdDate, false) : "—";
        const submitStr = record.submitDate ? formatDate(record.submitDate, false) : null;
        const reviewStr = record.reviewDate ? formatDate(record.reviewDate, false) : null;
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

    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      width: 120,
      align: "center" as const,
      render: (_: any, record: PlatformManageListType) => {
        const items: MenuProps["items"] = [
          {
            label: "Xem chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => handleShowDetail(record),
          },
        ];

        // Doanh nghiệp được sửa/gửi duyệt khi hồ sơ ở trạng thái nháp/cần chỉnh sửa
        const canEdit =
          record.status === PlatformStatusConstant.TamLuu ||
          record.status === PlatformStatusConstant.CanBoSungThongTin ||
          record.status === PlatformStatusConstant.DaXacNhan;

        const canSubmit =
          record.status === PlatformStatusConstant.TamLuu ||
          record.status === PlatformStatusConstant.CanBoSungThongTin;

        if (canEdit) {
          items.push(
            { type: "divider" },
            {
              label: "Chỉnh sửa",
              key: "edit",
              icon: <EditOutlined style={{ color: "#2563eb" }} />,
              onClick: () => handleShowEdit(record),
            }
          );
        }

        if (canSubmit) {
          items.push(
            { type: "divider" },
            {
              label: "Gửi duyệt hồ sơ",
              key: "submit",
              icon: <SendOutlined style={{ color: "#16a34a" }} />,
              onClick: () => handleSubmitDossier(record),
            }
          );
        }

        // Nền tảng trung gian (trong nước/nước ngoài) đã xác nhận: cho phép quản lý nền tảng TMĐT tích hợp
        const canManagePlatformItems =
          record.status === PlatformStatusConstant.DaXacNhan &&
          (platformType === PlatformManageTypeConstant.NTTichHop ||
            platformType === PlatformManageTypeConstant.NTTichHopNuocNgoai);

        if (canManagePlatformItems) {
          items.push(
            { type: "divider" },
            {
              label: "Nền tảng TMĐT tích hợp",
              key: "platform_items",
              icon: <AppstoreAddOutlined style={{ color: "#2563eb" }} />,
              onClick: () => router.push(`/QLPlatform/detail/${record.id}?tab=tich-hop`),
            }
          );
        }

        // Doanh nghiệp đã được xác nhận: có thể đề nghị chỉnh sửa hoặc chấm dứt
        if (record.status === PlatformStatusConstant.DaXacNhan) {
          items.push(
            { type: "divider" },
            {
              label: "Đề nghị chấm dứt",
              key: "request_termination",
              danger: true,
              icon: <CloseCircleOutlined />,
              onClick: () => {
                Modal.confirm({
                  title: "Xác nhận gửi đề nghị chấm dứt",
                  content: "Bạn có chắc muốn gửi đề nghị chấm dứt hoạt động nền tảng này? Hành động này sẽ cần được cán bộ xác nhận.",
                  okText: "Đề nghị chấm dứt",
                  okButtonProps: { danger: true },
                  cancelText: "Huỷ",
                  onOk: async () => {
                    setLoading(true);
                    try {
                      const res = await platformManageService.transition({
                        id: record.id,
                        targetStatus: PlatformStatusConstant.DeNghiChamDutDangKy,
                        note: "Doanh nghiệp gửi đề nghị chấm dứt",
                      });
                      if (res.status) {
                        message.success("Gửi đề nghị chấm dứt thành công");
                        handleLoadData();
                      } else {
                        message.error(res.message ?? "Thao tác thất bại");
                      }
                    } finally {
                      setLoading(false);
                    }
                  }
                });
              }
            }
          );
        }

        // Chỉ được xoá khi hồ sơ còn ở trạng thái nháp
        if (record.status === PlatformStatusConstant.TamLuu) {
          items.push({
            label: "Xoá hồ sơ",
            key: "delete",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => setConfirmDeleteId(record.id),
          });
        }

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button size="middle">
              <Space>
                Tùy chọn
                <DownOutlined style={{ fontSize: 10 }} />
              </Space>
            </Button>
          </Dropdown>
        );
      },

    },
  ];

  return (
    <>
      {/* HEADER & ACTION BUTTONS */}
      <div
        className="mb-2 flex-wrap justify-content-end"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <AutoBreadcrumb items={[{ title: "Nền tảng" }, { title: title }]} />
        <div className="btn-group w-fit flex" style={{ gap: 12 }}>
          <Button
            onClick={() => setIsPanelVisible(!isPanelVisible)}
            type="primary"
            size="middle"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          <Button
            type="primary"
            size="middle"
            icon={<PlusCircleOutlined />}
            onClick={handleShowCreate}
          >
            Kê khai hồ sơ mới
          </Button>
        </div>
      </div>

      {/* SEARCH BAR PANEL (toggle) */}
      {isPanelVisible && (
        <Search
          activeTab={platformType}
          isStaff={false}
          onFinish={onFinishSearch}
          // onExport={() => setIsExportModalOpen(true)}
        />
      )}

      {/* FILTER TABS - tạm comment
      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        items={tabItems}
        type="card"
        className="mb-3"
      />
      */}

      {/* MAIN DATA TABLE */}
      <Card
        style={{
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
        }}
        styles={{ body: { padding: "20px" } }}
      >
        <div className="table-responsive">
          <Table
            columns={columns}
            bordered
            dataSource={data?.items}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
            onRow={(record) => ({
              onClick: (event) => {
                const target = event.target as HTMLElement;
                if (
                  target.tagName === "A" ||
                  target.tagName === "BUTTON" ||
                  target.closest("button") ||
                  target.closest("a") ||
                  target.closest(".ant-dropdown") ||
                  target.closest(".ant-table-selection-column") ||
                  target.closest(".ant-checkbox-wrapper")
                ) {
                  return;
                }
                handleShowDetail(record);
              },
              style: { cursor: "pointer" }
            })}
          />
        </div>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            total={data?.totalCount}
            current={pageIndex}
            pageSize={pageSize}
            showTotal={(total, range) => `${range[0]}-${range[1]} trong ${total} dữ liệu`}
            onChange={(p) => setPageIndex(p)}
            onShowSizeChange={(c, s) => {
              setPageIndex(c);
              setPageSize(s);
            }}
            align="end"
          />
        </div>
      </Card>

      {/* XUẤT EXCEL MODAL */}
      {/* <Modal
        title="Chọn các trường xuất Excel"
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        onOk={handleExportExcel}
        okText="Xuất Excel"
        cancelText="Hủy"
        okButtonProps={{ loading, style: { background: "#16a34a", borderColor: "#16a34a" } }}
        width={560}
      >
        <div style={{ marginBottom: 12 }}>
          <Button
            
            onClick={() => setExportFields(EXPORT_FIELDS.map(f => f.key))}
            style={{ marginRight: 8 }}
          >
            Chọn tất cả
          </Button>
          <Button  onClick={() => setExportFields([])}>
            Bỏ chọn tất cả
          </Button>
        </div>
        <Checkbox.Group
          value={exportFields}
          onChange={(vals) => setExportFields(vals as string[])}
          style={{ width: "100%" }}
        >
          <Row gutter={[8, 8]}>
            {EXPORT_FIELDS.map(f => (
              <Col span={12} key={f.key}>
                <Checkbox value={f.key}>{f.label}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Modal> */}

      {/* DELETE CONFIRM */}
      {confirmDeleteId && (
        <Modal
          title="Xác nhận xóa hồ sơ"
          open
          onOk={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          okText="Xóa hồ sơ"
          okButtonProps={{ danger: true, loading }}
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa hồ sơ nháp này? Hành động này không thể hoàn tác.</p>
        </Modal>
      )}

      {/* ký số */}
      <DigitalSignatureModal
        ids={signIds}
        open={isSignModalOpen}
        onCancel={() => setIsSignModalOpen(false)}
        onSignSuccess={handleSignSuccess}
        signerService={platformManageService}
      />
    </>
  );
};

export default PlatformIndexEnterprise;
