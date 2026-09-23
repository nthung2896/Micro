"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { ConfigProvider } from "antd";

import { Card, Typography, Row, Col, Statistic, Button, List, Spin, Table, Pagination, Tag, Progress, Modal, Tooltip, Space, Empty } from "antd";
import {
  UserOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  GlobalOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  CloudOutlined,
  FileDoneOutlined,
  DollarCircleOutlined,
  WalletOutlined,
  ArrowRightOutlined,
  EditOutlined,
  CheckCircleFilled,
  WarningFilled,
  InfoCircleFilled,
  EyeOutlined,
  ApartmentOutlined,
  BellOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  UpOutlined,
  DownOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import DashboardThongKeTabs from "./components/DashboardThongKeTabs";
import DashboardThongKeChuyenVien from "./components/DashboardThongKeChuyenVien";
import DashboardKpiCharts from "./components/DashboardKpiCharts";
import DashboardQuarterlyChart from "./components/DashboardQuarterlyChart";
import DashboardCaNhan from "./components/DashboardCaNhan";
import DashboardThongKeDiemNhanSuTheoChucVu from "./components/DashboardThongKeDiemNhanSuTheoChucVu";
import PersonnelEvaluationScoreModal from "./components/PersonnelEvaluationScoreModal";
import TheoDoiDanhGiaPhongBanComponent from "../kPI_PhieuDanhGia/TheoDoiDanhGiaPhongBan/TheoDoiDanhGiaPhongBanComponent";
import ModalXemToanBoTieuChi from "../kPI_BieuChamDiem/ModalXemToanBoTieuChi";
import ModalThemNhiemVuNhanh from "./components/ModalThemNhiemVuNhanh";
import platformManageService, {
  DashboardThongKeHoSoNenTangDto,
} from "@/services/platformManage/platformManage.service";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import departmentService from "@/services/department/department.service";
import kPI_DashboardService from "@/services/kPI_Dashboard/kPI_DashboardService";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import notificationService from "@/services/notification/notification.service";
import { useSelector } from "@/store/hooks";
import Flex from "@/components/shared-components/Flex";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Paragraph, Text } = Typography;

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircleFilled style={{ color: "#22c55e", fontSize: 18 }} />;
    case "warning":
      return <WarningFilled style={{ color: "#f59e0b", fontSize: 18 }} />;
    case "error":
      return <WarningFilled style={{ color: "#ef4444", fontSize: 18 }} />;
    default:
      return <InfoCircleFilled style={{ color: "#0355a2", fontSize: 18 }} />;
  }
};

const getNotificationTagColor = (type: string) => {
  switch (type) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
      return "error";
    default:
      return "processing";
  }
};

export default function Dashboard() {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.User);
  const roles = user?.listRole || [];
  const isDoanhNghiep = roles.includes("DoanhNghiep");
  const isCaNhan = roles.some((r: string) => r.toLowerCase().includes("cá nhân") || r.toLowerCase().includes("canhan"));
  const chucVuCode = user?.chucVuCode || "";
  const isCapCuc = Boolean(
    user?.isCT || 
    user?.isPCT || 
    roles.includes("CucTruong") || 
    roles.includes("PhoCucTruong") || 
    roles.includes("LanhDaoCuc") ||
    roles.includes("Admin") ||
    chucVuCode === "CucTruong" ||
    chucVuCode === "PhoCucTruong"
  );
  const isCapPhong = Boolean(
    !isCapCuc && (
      user?.isTP || 
      user?.isPTP || 
      roles.includes("TruongPhong") || 
      roles.includes("PhoTruongPhong") || 
      roles.includes("TruongPhongCuc") ||
      roles.includes("TruongPhongSo") ||
      chucVuCode === "TruongPhong" || 
      chucVuCode === "PhoTruongPhong" ||
      chucVuCode === "TP" ||
      chucVuCode === "PhoTP"
    )
  );

  // Admin/Staff states
  const [data, setData] = useState<DashboardThongKeHoSoNenTangDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Common states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(true);
  const [pendingTaskCount, setPendingTaskCount] = useState<number>(0);
  const [firstPendingEval, setFirstPendingEval] = useState<any>(null);
  const [showTheoDoiPhongBan, setShowTheoDoiPhongBan] = useState<boolean>(false);
  const [quickTaskModalVisible, setQuickTaskModalVisible] = useState<boolean>(false);
  const [selectedDotQuickTask, setSelectedDotQuickTask] = useState<any>(null);

  const isPhoPhongTroLen = Boolean(firstPendingEval?.isPhoPhongTroLen || firstPendingEval?.isCT_PCT || firstPendingEval?.isTP_PTP);

  // Enterprise states
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(true);
  const [reportsTotal, setReportsTotal] = useState<number>(0);
  const [reportsPage, setReportsPage] = useState<number>(1);
  const [reportsPageSize, setReportsPageSize] = useState<number>(5);

  const [personnelStats, setPersonnelStats] = useState<[string, number][]>([]);
  const [personnelStatsData, setPersonnelStatsData] = useState<Record<string, any[]>>({});
  const [loadingPersonnelStats, setLoadingPersonnelStats] = useState<boolean>(true);

  // Personnel detail modal states
  const [isPersonnelModalVisible, setIsPersonnelModalVisible] = useState(false);
  const [selectedDeptPersonnel, setSelectedDeptPersonnel] = useState<{ name: string, data: any[] }>({ name: "", data: [] });
  const [selectedEvaluationPersonnel, setSelectedEvaluationPersonnel] = useState<{
    idLyLich: string;
    userId?: string | null;
    hoTen?: string | null;
  } | null>(null);
  const [toanBoTieuChiVisible, setToanBoTieuChiVisible] = useState(false);
  const [selectedDotDanhGiaTieuChi, setSelectedDotDanhGiaTieuChi] = useState<string | null>(null);
  const [isNavigatingPhieu, setIsNavigatingPhieu] = useState<boolean>(false);

  const handleGoToEvaluation = async (evalItem: any) => {
    if (!evalItem || isNavigatingPhieu) return;
    const targetIdDot = evalItem.idDotDanhGia;
    const targetIdLyLich = user?.idLyLich || evalItem.idLyLich || user?.lyLichId;
    let targetIdPhieu = evalItem.idPhieuDanhGia;

    setIsNavigatingPhieu(true);
    try {
      if (!targetIdPhieu && targetIdDot && targetIdLyLich) {
        const initRes = await kPI_PhieuDanhGiaService.initPhieuDanhGia(targetIdDot, targetIdLyLich);
        if (initRes?.status && initRes.data) {
          targetIdPhieu = initRes.data;
        }
      }

      const phieuTarget = targetIdPhieu || targetIdDot;
      const queryParams = new URLSearchParams();
      if (targetIdDot) queryParams.append("idDotDanhGia", targetIdDot);
      if (targetIdPhieu) queryParams.append("idPhieu", targetIdPhieu);
      if (targetIdLyLich) queryParams.append("idLyLich", targetIdLyLich);

      router.push(`/kPI_PhieuDanhGia/DanhGiaMultiCap/${phieuTarget}?${queryParams.toString()}`);
    } catch (err) {
      console.error("Lỗi khi khởi tạo/điều hướng phiếu đánh giá:", err);
      const phieuTarget = targetIdPhieu || targetIdDot;
      const queryParams = new URLSearchParams();
      if (targetIdDot) queryParams.append("idDotDanhGia", targetIdDot);
      if (targetIdPhieu) queryParams.append("idPhieu", targetIdPhieu);
      if (targetIdLyLich) queryParams.append("idLyLich", targetIdLyLich);
      router.push(`/kPI_PhieuDanhGia/DanhGiaMultiCap/${phieuTarget}?${queryParams.toString()}`);
    } finally {
      setIsNavigatingPhieu(false);
    }
  };


  const fetchReports = async (page: number = 1, size: number = 5) => {
    setLoadingReports(true);
    try {
      const searchParams = {
        pageIndex: page,
        pageSize: size,
        loaiKyBaoCao: "NAM",
        IdDoiTuong: user?.id,
      };
      const response = await bcSubmissionService.getDotBaoCaoData(searchParams);
      if (response?.data) {
        setReports(response.data.items || []);
        setReportsTotal(response.data.totalCount || 0);
        setReportsPage(page);
        setReportsPageSize(size);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu báo cáo:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotificationUser();
        if (res.status && res.data && Array.isArray(res.data.items)) {
          setNotifications(res.data.items);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();

    if (isDoanhNghiep) {
      if (user?.id) {
        fetchReports(1, reportsPageSize);
      }
    } else {
      const fetchPendingStats = async () => {
        try {
          const res = await platformManageService.getDashboardThongKeHoSoNenTang({});
          if (res.status && res.data) {
            setData(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch dashboard stats", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPendingStats();

      const fetchPendingKpiTasks = async () => {
        try {
          const res = await kPI_PhieuDanhGiaService.getTabCounts(user.id, {} as any);
          if (res?.data) {
            setPendingTaskCount(res.data.choXuLy || 0);
          }
        } catch (err) {
          console.error("Failed to fetch pending KPI tasks", err);
        }
      };

      const fetchPersonalPending = async () => {
        if (!user?.idLyLich) return;
        try {
          const searchData = {
            idLyLich: user.idLyLich,
            pageIndex: 1,
            pageSize: -1,
          };
          const response = await kPI_PhieuDanhGiaService.getDotDanhGiaWithPhieu(user.id, searchData);
          if (response && response.data) {
            const items = response.data.items || [];
            const pending = items.find((item: any) => !item.daDanhGia || item.trangThai === "KhoiTao" || item.trangThai === "TraVe");
            setFirstPendingEval(pending);
          }
        } catch (err) {
          console.error("Failed to fetch personal pending evaluations", err);
        }
      };

      let intervalId: NodeJS.Timeout;
      if (user?.id) {
        fetchPendingKpiTasks();
        fetchPersonalPending();

        intervalId = setInterval(() => {
          fetchPendingKpiTasks();
          fetchPersonalPending();
        }, 30000); // Poll every 30 seconds
      }

      const fetchPersonnelStats = async () => {
        try {
          const userDonVi = user?.donViSuDungId || user?.donViId || user?.idDonVi;
          const userPhongBan = user?.phongBanId;

          // Gọi API lấy dữ liệu nhân sự của đơn vị / phòng ban
          let resLyLich: any = null;
          try {
            resLyLich = await kPI_DashboardService.getThongKeNhanSuPhongBan();
          } catch (e) {
            const searchParams: any = { pageIndex: 1, pageSize: 1000 };
            if (userDonVi) searchParams.donViSuDungId = userDonVi;
            if (!isCapCuc && userPhongBan) searchParams.phongBanId = userPhongBan;
            resLyLich = await kPI_LyLich2CService.getData(searchParams);
          }

          if (isCapCuc) {
            // Cục trưởng, Cục phó, Admin: xem tất cả các phòng ban trực thuộc
            const resPbs = await (userDonVi ? departmentService.getDropdownLevel1(userDonVi) : departmentService.getDropDownPhong());

            const pbsList: Array<{ value: string; label: string }> = [];
            if (resPbs?.data && Array.isArray(resPbs.data)) {
              resPbs.data.forEach((p: any) => {
                const val = (p.value || p.id || "").toString();
                const lbl = (p.label || p.name || "").toString().trim();
                if (lbl) {
                  pbsList.push({ value: val, label: lbl });
                }
              });
            }

            const items = resLyLich?.data?.items || [];
            const statsCount: Record<string, number> = {};
            const statsData: Record<string, any[]> = {};

            // Khởi tạo các phòng ban trực thuộc từ danh mục
            pbsList.forEach(pb => {
              statsCount[pb.label] = 0;
              statsData[pb.label] = [];
            });

            // Phân bổ nhân sự vào các phòng ban trực thuộc
            items.forEach((item: any) => {
              const pbName = item.phongBanName?.trim();
              const pbId = item.phongBanId ? item.phongBanId.toString().toLowerCase() : "";

              // Tìm phòng ban khớp theo Id hoặc tên
              const matchedPb = pbsList.find(p =>
                (pbId && p.value.toLowerCase() === pbId) ||
                (pbName && p.label.toLowerCase() === pbName.toLowerCase())
              );

              if (matchedPb) {
                statsCount[matchedPb.label] = (statsCount[matchedPb.label] || 0) + 1;
                if (!statsData[matchedPb.label]) statsData[matchedPb.label] = [];
                statsData[matchedPb.label].push(item);
              } else if (pbName && !pbName.toLowerCase().startsWith("cục ")) {
                statsCount[pbName] = (statsCount[pbName] || 0) + 1;
                if (!statsData[pbName]) statsData[pbName] = [];
                statsData[pbName].push(item);
              }
            });

            // Sắp xếp các phòng ban theo số lượng nhân sự giảm dần
            const sortedStats = Object.entries(statsCount).sort((a, b) => b[1] - a[1]);

            setPersonnelStats(sortedStats);
            setPersonnelStatsData(statsData);
          } else if (isCapPhong || userPhongBan) {
            // Trưởng phòng, Phó phòng: xem nhân sự trong phòng ban của mình
            const items = resLyLich?.data?.items || [];
            const currentPbName = items[0]?.phongBanName?.trim() || user?.tenPhongBan || "Phòng ban của bạn";
            const statsCount: Record<string, number> = { [currentPbName]: items.length };
            const statsData: Record<string, any[]> = { [currentPbName]: items };

            setPersonnelStats(Object.entries(statsCount));
            setPersonnelStatsData(statsData);
          } else {
            // Cá nhân
            const items = resLyLich?.data?.items || [];
            if (items.length > 0) {
              const pbName = items[0]?.phongBanName?.trim() || "Phòng ban";
              setPersonnelStats([[pbName, items.length]]);
              setPersonnelStatsData({ [pbName]: items });
            } else {
              setPersonnelStats([]);
              setPersonnelStatsData({});
            }
          }
        } catch (err) {
          console.error("Failed to fetch personnel stats", err);
        } finally {
          setLoadingPersonnelStats(false);
        }
      };
      fetchPersonnelStats();

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [isDoanhNghiep, user?.id, user?.userName, user?.idLyLich, isCapCuc, isCapPhong, user?.phongBanId, user?.donViId]);

  const handleNotificationClick = async (id: string, link: string) => {
    try {
      await notificationService.maskAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    } finally {
      if (link) {
        window.open(link, "_self");
      }
    }
  };

  const pendingItems = [
    {
      title: "Nền tảng trực tuyến",
      value: data?.nenTangTrucTuyen?.statuses?.[1] || 0,
      icon: <GlobalOutlined />,
      color: "#1890ff",
      path: "/QLPlatform/NenTangTrucTuyen?TrangThai=choduyet",
    },
    {
      title: "Đặt hàng nước ngoài",
      value: data?.datHangNuocNgoai?.statuses?.[1] || 0,
      icon: <ShoppingCartOutlined />,
      color: "#722ed1",
      path: "/QLPlatform/CanBo/DatHangNuocNgoai?TrangThai=choduyet",
    },
    {
      title: "Trung gian trong nước",
      value: data?.trungGianTrongNuoc?.statuses?.[1] || 0,
      icon: <HomeOutlined />,
      color: "#2f54eb",
      path: "/QLPlatform/CanBo/TrungGianTrongNuoc?TrangThai=choduyet",
    },
    {
      title: "Trung gian nước ngoài",
      value: data?.trungGianNuocNgoai?.statuses?.[1] || 0,
      icon: <CloudOutlined />,
      color: "#eb2f96",
      path: "/QLPlatform/CanBo/TrungGianNuocNgoai?TrangThai=choduyet",
    },
    {
      title: "Hợp đồng điện tử",
      value: data?.hopDongDienTu?.statuses?.[1] || 0,
      icon: <FileDoneOutlined />,
      color: "#fa8c16",
      path: "/hop-dong?status=cho-duyet",
    },
    {
      title: "Rút tiền ký quỹ",
      value: data?.rutTienKyQuy?.statuses?.[1] || 0,
      icon: <DollarCircleOutlined />,
      color: "#faad14",
      path: "/RutTienKyQuy?TrangThai=choduyet",
    },
  ];

  const quickOps = [
    {
      title: "Nền tảng TMĐT kinh doanh trực tiếp có đặt hàng trực tuyến",
      icon: <ShoppingCartOutlined style={{ fontSize: 22, color: "#1890ff" }} />,
      bgColor: "#e6f4ff",
      path: "/QLPlatform/create?type=NTThongBaoKD"
    },
    {
      title: "Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có đặt hàng trực tuyến",
      icon: <GlobalOutlined style={{ fontSize: 22, color: "#52c41a" }} />,
      bgColor: "#f6ffed",
      path: "/QLPlatform/create?type=NTDangKyKDNuocNgoai"
    },
    {
      title: "Nền tảng TMĐT trung gian, mạng xã hội có hoạt động TMĐT, TMĐT tích hợp",
      icon: <UserOutlined style={{ fontSize: 22, color: "#fa8c16" }} />,
      bgColor: "#fff7e6",
      path: "/QLPlatform/create?type=NTTichHop"
    },
    {
      title: "Nền tảng TMĐT trung gian nước ngoài, mạng xã hội có hoạt động TMĐT nước ngoài, TMĐT tích hợp nước ngoài",
      icon: <GlobalOutlined style={{ fontSize: 22, color: "#722ed1" }} />,
      bgColor: "#f9f0ff",
      path: "/QLPlatform/create?type=NTTichHopNuocNgoai"
    },
    {
      title: "Khai báo cung cấp dịch vụ chứng thực hợp đồng điện tử trong thương mại",
      icon: <FileTextOutlined style={{ fontSize: 22, color: "#13c2c2" }} />,
      bgColor: "#e6fffb",
      path: "/hop-dong/createOrUpdate"
    },
    {
      title: "Rút tiền ký quỹ",
      icon: <WalletOutlined style={{ fontSize: 22, color: "#faad14" }} />,
      bgColor: "#fffbe6",
      path: "/RutTienKyQuy/createOrUpdate"
    }
  ];

  if (isDoanhNghiep) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 174px)" }}>
          <div style={{ marginBottom: "8px" }}>
            <AutoBreadcrumb items={[{ title: "Trang chủ" }]} />
          </div>


        </div>

        <style jsx global>{`
          .quick-op-item {
            transition: all 0.3s;
          }
          .quick-op-item:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border-color: #d9d9d9 !important;
            transform: translateY(-2px);
          }
          .dashboard-notification-item:hover {
            background-color: #f0f5ff !important;
          }
          .dashboard-table-wrapper {
            width: 100%;
            overflow-x: auto;
          }
          .shadow-sm {
            box-shadow:
              0 1px 2px 0 rgba(0, 0, 0, 0.03),
              0 1px 6px -1px rgba(0, 0, 0, 0.02),
              0 2px 4px 0 rgba(0, 0, 0, 0.02);
          }
        `}</style>
      </>
    );
  }

  if (isCaNhan && !roles.includes("Admin") && !roles.some((r: string) => r.includes("CucTruong") || r.includes("TruongPhong") || r.includes("LanhDaoCuc"))) {
    return (
      <>
        <div style={{ marginBottom: "20px" }}>
          <AutoBreadcrumb items={[{ title: "Trang chủ" }]} />
        </div>
        <DashboardCaNhan />
      </>
    );
  }

  // Staff / Admin Dashboard Layout
  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <AutoBreadcrumb items={[{ title: "Trang chủ" }]} />
      </div>

      {/* Top Banner Định Danh Phân Hệ KPI & Chuyển Đổi Nhanh */}
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 12,
          border: "1px solid #bfdbfe",
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #ffffff 100%)",
          boxShadow: "0 2px 10px rgba(37, 99, 235, 0.08)",
        }}
        bodyStyle={{ padding: "16px 20px" }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space align="center" size={12}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                }}
              >
                <BookOutlined style={{ fontSize: 22, color: "#fff" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Title level={4} style={{ margin: 0, color: "#1e3a8a", fontWeight: 800 }}>
                    HỆ THỐNG ĐÁNH GIÁ & THEO DÕI TIẾN ĐỘ KPI
                  </Title>
                  <Tag color="blue" style={{ fontWeight: 700 }}>
                    kpi-service:5003
                  </Tag>
                  <Tag color="cyan" style={{ fontWeight: 700 }}>
                    Database: Base_DB
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Theo dõi tiến độ nhiệm vụ công tác, tổ chức hội đồng chấm điểm thi đua và phân loại cán bộ.
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space size={10} wrap>
              <Tooltip title="Nhấn để chuyển tức thời sang Phân Hệ Quản Lý Tài Sản (Port 9797 - Database Base_TaiSan)">
                <Button
                  type="primary"
                  icon={<SwapOutlined />}
                  onClick={() => {
                    const token = typeof window !== "undefined" ? localStorage.getItem("AccessToken") || "" : "";
                    window.location.href = `http://localhost:9797/auth/sso-callback?token=${encodeURIComponent(token)}`;
                  }}
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    borderColor: "#d97706",
                    color: "#0f172a",
                    fontWeight: 700,
                    borderRadius: 8,
                    height: 36,
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.35)",
                  }}
                >
                  <span>Chuyển Sang Tài Sản (:9797)</span>
                </Button>
              </Tooltip>

              <Button
                icon={<HomeOutlined />}
                onClick={() => {
                  window.location.href = "http://localhost:3000";
                }}
                style={{ borderRadius: 8, height: 36 }}
              >
                Portal SSO
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {pendingTaskCount > 0 && (
        <div
          className="urgent-eval-card"
          onClick={() => {
            router.push(`/kPI_PhieuDanhGia/ChoXuLyTheoDot`);
          }}
          style={{
            marginBottom: "20px",
            background: "linear-gradient(to right, #fee2e2, #fecaca)",
            border: "1px solid #fca5a5",
            borderLeft: "6px solid #e11d48",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 8px 25px rgba(225, 29, 72, 0.25)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            animation: "pulse-card 2.5s infinite"
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 320px', minWidth: 0, gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <WarningFilled style={{ fontSize: 24, color: '#e11d48' }} className="bell-shake" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#be123c', textTransform: 'uppercase', wordBreak: 'break-word' }}>
                  CẦN XỬ LÝ: {pendingTaskCount} PHIẾU ĐÁNH GIÁ
                </span>
                <Tag style={{ borderRadius: 16, padding: '2px 12px', fontWeight: 700, fontSize: 12, border: 'none', background: '#e11d48', color: '#fff' }} className="blinking-tag">
                  PHÊ DUYỆT
                </Tag>
              </div>
              <div style={{ color: '#6b7280', fontSize: 13, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px' }}>
                <span style={{ fontWeight: 600, color: '#4b5563' }}>Bạn có các phiếu đánh giá đang chờ phê duyệt</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <strong style={{ color: '#e11d48', fontSize: 14 }}>Nhấn vào đây để xem chi tiết và xử lý kịp thời</strong>
              </div>
            </div>
          </div>

          <Space size={12} wrap style={{ flexWrap: 'wrap' }}>
            <Button
              size="middle"
              icon={<FileTextOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/kPI_TieuChiChung`);
              }}
              style={{ color: "#e11d48", borderColor: "#fda4af", borderRadius: 8, fontWeight: 600, backgroundColor: "#fff", padding: "0 24px" }}
              className="urgent-eval-btn-outline"
            >
              Bộ tiêu chí
            </Button>
            <Button
              size="middle"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/kPI_PhieuDanhGia/ChoXuLyTheoDot`);
              }}
              style={{ backgroundColor: "#e11d48", color: "#fff", borderColor: "#e11d48", borderRadius: 8, fontWeight: 700, boxShadow: '0 4px 10px rgba(225, 29, 72, 0.3)', padding: "0 24px" }}
              className="pulse-button"
            >
              Xử lý ngay <ArrowRightOutlined />
            </Button>
          </Space>
        </div>
      )}

      {firstPendingEval && (
        <div style={{ marginBottom: "20px" }}>
          <div
            className="urgent-eval-card"
            onClick={() => handleGoToEvaluation(firstPendingEval)}
            style={{
              marginBottom: showTheoDoiPhongBan ? "12px" : "0px",
              background: "linear-gradient(to right, #fee2e2, #fecaca)",
              border: "1px solid #fca5a5",
              borderLeft: "6px solid #e11d48",
              borderRadius: "16px",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: "16px",
              boxShadow: "0 8px 25px rgba(225, 29, 72, 0.25)",
              cursor: isNavigatingPhieu ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              animation: "pulse-card 2.5s infinite"
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', width: "100%", flex: '0 1 auto', minWidth: 0, gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                minWidth: 48,
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <BellOutlined style={{ fontSize: 24, color: '#e11d48' }} className="bell-shake" />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#be123c', textTransform: 'uppercase', wordBreak: 'break-word' }}>{firstPendingEval.tenDotDanhGia}</span>
                  <Tag style={{ borderRadius: 16, padding: '2px 12px', fontWeight: 700, fontSize: 12, border: 'none', background: '#e11d48', color: '#fff' }} className="blinking-tag">
                    CÁ NHÂN TỰ ĐÁNH GIÁ
                  </Tag>
                </div>
                <div style={{ color: '#6b7280', fontSize: 13, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px' }}>
                  <span>
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    Cập nhật: <span style={{ fontWeight: 600, color: '#4b5563' }}>{firstPendingEval.thoiGianTao ? dayjs(firstPendingEval.thoiGianTao).format('DD/MM/YYYY') : 'Chưa có'}</span>
                  </span>
                  <span style={{ color: '#d1d5db' }}>|</span>
                  <strong style={{ color: '#e11d48', fontSize: 14 }}>Vui lòng hoàn thành tự đánh giá của bạn</strong>
                </div>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <Button
                size="middle"
                icon={<FileTextOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDotDanhGiaTieuChi(firstPendingEval.idDotDanhGia);
                  setToanBoTieuChiVisible(true);
                }}
                style={{ color: "#e11d48", borderColor: "#fda4af", borderRadius: 8, fontWeight: 600, backgroundColor: "#fff", padding: "0 20px" }}
              >
                Bộ tiêu chí
              </Button>
              <Button
                size="middle"
                icon={<PlusCircleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDotQuickTask(firstPendingEval);
                  setQuickTaskModalVisible(true);
                }}
                style={{ color: "#0284c7", borderColor: "#bae6fd", borderRadius: 8, fontWeight: 600, backgroundColor: "#fff", padding: "0 16px" }}
                className="quick-task-btn-outline"
              >
                Thêm nhiệm vụ nhanh
              </Button>
              {isPhoPhongTroLen && (
                <Button
                  size="middle"
                  icon={showTheoDoiPhongBan ? <UpOutlined /> : <DownOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTheoDoiPhongBan(!showTheoDoiPhongBan);
                  }}
                  style={{
                    color: "#0355a2",
                    borderColor: "#91caff",
                    borderRadius: 8,
                    fontWeight: 600,
                    backgroundColor: showTheoDoiPhongBan ? "#e6f4ff" : "#fff",
                    padding: "0 16px"
                  }}
                >
                  {showTheoDoiPhongBan ? "Ẩn theo dõi" : "Theo dõi đánh giá"}
                </Button>
              )}
              <Button
                size="middle"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  const queryParams = new URLSearchParams();
                  queryParams.append("idDotDanhGia", firstPendingEval.idDotDanhGia || "");
                  queryParams.append("idPhieu", firstPendingEval.idPhieuDanhGia || "");
                  queryParams.append("idLyLich", user?.idLyLich || "");
                  const phieuTarget = firstPendingEval.idPhieuDanhGia || firstPendingEval.idDotDanhGia;
                  router.push(`/kPI_PhieuDanhGia/DanhGiaTCCB/${phieuTarget}?${queryParams.toString()}`);
                }}
                style={{
                  backgroundColor: "#dcfce7",
                  color: "#15803d",
                  borderColor: "#86efac",
                  borderRadius: 8,
                  fontWeight: 700,
                  boxShadow: "0 4px 10px rgba(22, 163, 74, 0.12)",
                  padding: "0 20px",
                }}
                className="personal-eval-criteria-btn"
              >
                Đánh giá bộ tiêu chí chung
              </Button>
              <Button
                size="middle"
                icon={<EditOutlined />}
                loading={isNavigatingPhieu}
                disabled={isNavigatingPhieu}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToEvaluation(firstPendingEval);
                }}
                style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", borderColor: "#93c5fd", borderRadius: 8, fontWeight: 700, boxShadow: "0 4px 10px rgba(37, 99, 235, 0.12)", padding: "0 24px" }}
                className="pulse-button personal-eval-now-btn"
              >
                Đánh giá theo nhiệm vụ kê khai
              </Button>
            </div>
          </div>

          {isPhoPhongTroLen && showTheoDoiPhongBan && (
            <div style={{ marginBottom: "20px" }}>
              <TheoDoiDanhGiaPhongBanComponent
                isDashboard={true}
                hideBreadcrumb={true}
                defaultDotId={firstPendingEval.idDotDanhGia}
                defaultDashboardMode={false}
              />
            </div>
          )}
        </div>
      )}

      <DashboardKpiCharts />

      {(roles.some((r: string) => r.includes("CucTruong") || r === "LanhDaoCuc" || r === "Admin")) && (
        <DashboardQuarterlyChart />
      )}

      {isCapCuc && <DashboardThongKeDiemNhanSuTheoChucVu />}
      <Card
        className="customCardShadow kpi-dashboard-card mb-4"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 4, height: 18, borderRadius: 4, background: '#0355a2', display: 'inline-block', flexShrink: 0 }} />
            <ApartmentOutlined style={{ color: "#0355a2", fontSize: 18 }} />
            <span style={{ color: "#1e3a8a", fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
              {isCapCuc
                ? "THỐNG KÊ SỐ LƯỢNG NHÂN SỰ TRONG CÁC PHÒNG BAN TRỰC THUỘC"
                : "THỐNG KÊ SỐ LƯỢNG NHÂN SỰ TRONG PHÒNG BAN"}
            </span>
          </div>
        }
        loading={loadingPersonnelStats}
        headStyle={{ background: "linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%)", borderBottom: "1px solid #bfdbfe", padding: "14px 20px" }}
        style={{ marginTop: 32, marginBottom: 32, border: "1px solid #bfdbfe", background: "#ffffff", boxShadow: "0 4px 16px rgba(3, 85, 162, 0.06)" }}
      >
        {personnelStats.length > 0 ? (
          <Row gutter={[24, 24]}>
            {personnelStats.map(([name, count]) => {
              const totalCount = personnelStats.reduce((sum, s) => sum + s[1], 0);
              const displayPercent = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <Col span={24} md={12} lg={8} xl={6} key={name}>
                  <div
                    style={{ cursor: "pointer", transition: "all 0.3s" }}
                    onClick={() => {
                      setSelectedDeptPersonnel({ name, data: personnelStatsData[name] || [] });
                      setIsPersonnelModalVisible(true);
                    }}
                    className="dept-stat-item"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 500, fontSize: "14px", color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: "8px" }} title={name}>{name}</span>
                      <span style={{ fontWeight: 700, color: "#0355a2" }}>{count}</span>
                    </div>
                    <Progress
                      percent={displayPercent}
                      showInfo={false}
                      strokeColor="#0355a2"
                      size="small"
                      trailColor="#f3f4f6"
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty description="Không có dữ liệu phòng ban trực thuộc" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Modal
        title={`Danh sách nhân sự: ${selectedDeptPersonnel.name}`}
        open={isPersonnelModalVisible}
        onCancel={() => {
          setIsPersonnelModalVisible(false);
          setSelectedEvaluationPersonnel(null);
        }}
        footer={null}
        width={"90vw"}
        destroyOnClose
      >
        <ConfigProvider theme={{ components: { Table: { headerBg: "#0355a2", headerColor: "#ffffff" } } }}>
          <Table
            dataSource={selectedDeptPersonnel.data}
            rowKey={(record) => record.id || Math.random().toString()}
            pagination={{ pageSize: 10 }}
            bordered
            scroll={{ x: 1000 }}
            size="middle"
            columns={[
              {
                title: "STT",
                key: "stt",
                width: 60,
                render: (_: any, record: any) => selectedDeptPersonnel.data.indexOf(record) + 1
              },
              {
                title: "Họ và tên",
                dataIndex: "hoTen",
                key: "hoTen",
                render: (val: string) => <Text strong>{val || "-"}</Text>
              },
              {
                title: "Ngày sinh",
                dataIndex: "ngaysinh",
                key: "ngaysinh",
                render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY') : "-"
              },
              {
                title: "Số điện thoại",
                dataIndex: "phone",
                key: "phone",
                render: (val: string) => val || "-"
              },
              {
                title: "Email",
                dataIndex: "email",
                key: "email",
                render: (val: string) => val || "-"
              },
              {
                title: "Chức vụ",
                dataIndex: "chucVuHienTaiName",
                key: "chucVuHienTaiName",
                render: (val: string, record: any) => val || record.chucVuHienTai || "-"
              },
              {
                title: "Lý luận chính trị",
                dataIndex: "lyLuanChinhTriName",
                key: "lyLuanChinhTriName",
                render: (val: string, record: any) => val || record.lyLuanChinhTri || "-"
              },
              {
                title: "Loại hợp đồng",
                dataIndex: "loaiHopDongName",
                key: "loaiHopDongName",
                render: (val: string, record: any) => val || record.loaiHopDong || "-"
              },
              {
                title: "Tài khoản",
                dataIndex: "userName",
                key: "userName",
                width: 210,
                render: (val: string) => val ? (
                  <Tag
                    color="blue"
                    title={val}
                    style={{
                      display: "inline-block",
                      maxWidth: "calc(100% - 8px)",
                      marginRight: 8,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                    }}
                  >
                    {val}
                  </Tag>
                ) : "-"
              },
              {
                title: "Thao tác",
                key: "actions",
                width: 80,
                fixed: "right" as const,
                align: "center" as const,
                render: (_: any, record: any) => (
                  <Tooltip title="Xem chi tiết điểm đánh giá">
                    <Button
                      type="text"
                      aria-label="Xem chi tiết điểm đánh giá"
                      icon={<EyeOutlined style={{ color: "#1677ff" }} />}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedEvaluationPersonnel({
                          idLyLich: String(record.id || ""),
                          userId: record.userId || null,
                          hoTen: record.hoTen || null,
                        });
                      }}
                    />
                  </Tooltip>
                )
              }
            ]}
          />
        </ConfigProvider>
      </Modal>

      <PersonnelEvaluationScoreModal
        open={Boolean(selectedEvaluationPersonnel)}
        idLyLich={selectedEvaluationPersonnel?.idLyLich || ""}
        userId={selectedEvaluationPersonnel?.userId}
        hoTen={selectedEvaluationPersonnel?.hoTen}
        onClose={() => setSelectedEvaluationPersonnel(null)}
      />

      <ModalXemToanBoTieuChi
        visible={toanBoTieuChiVisible}
        onClose={() => setToanBoTieuChiVisible(false)}
        idDotDanhGia={selectedDotDanhGiaTieuChi}
        idLyLich={user?.idLyLich || firstPendingEval?.idLyLich}
        donViId={user?.donViSuDungId}
      />

      <ModalThemNhiemVuNhanh
        visible={quickTaskModalVisible}
        onClose={() => {
          setQuickTaskModalVisible(false);
          setSelectedDotQuickTask(null);
        }}
        dotDanhGia={selectedDotQuickTask}
        idLyLich={user?.idLyLich}
      />

      <style jsx global>{`
        .quick-task-btn-outline:hover {
          background-color: #f0f9ff !important;
          border-color: #0284c7 !important;
          color: #0369a1 !important;
        }
        .personal-eval-criteria-btn:hover {
          background-color: #dcfce7 !important;
          border-color: #16a34a !important;
          color: #15803d !important;
        }
        .personal-eval-now-btn:hover {
          background-color: #dbeafe !important;
          border-color: #2563eb !important;
          color: #1d4ed8 !important;
        }
        .pending-stat-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #d9d9d9 !important;
          transform: translateY(-2px);
          background-color: #fafafa !important;
        }
        .dept-stat-item {
          padding: 8px;
          border-radius: 8px;
        }
        .dept-stat-item:hover {
          background-color: #f0f5ff;
        }
        .dashboard-notification-item:hover {
          background-color: #f0f5ff !important;
        }
        .dashboard-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }
        .shadow-sm {
          box-shadow:
            0 1px 2px 0 rgba(0, 0, 0, 0.03),
            0 1px 6px -1px rgba(0, 0, 0, 0.02),
            0 2px 4px 0 rgba(0, 0, 0, 0.02);
        }
        @keyframes bell-shake {
          0%, 100% { transform: rotate(0deg); }
          15%, 45%, 75% { transform: rotate(15deg); }
          30%, 60% { transform: rotate(-15deg); }
        }
        .bell-shake {
          animation: bell-shake 1.2s infinite ease-in-out;
          transform-origin: top center;
        }
        @keyframes pulse-card {
          0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(225, 29, 72, 0); }
          100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
        }
        @keyframes blinking-tag {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .blinking-tag {
          animation: blinking-tag 1s infinite;
        }
      `}</style>
    </>
  );
}
