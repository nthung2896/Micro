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
  Table,
  Tabs,
  Avatar,
  Tooltip,
  Select,
  Modal,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  PieChartOutlined,
  DownOutlined,
  RightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import platformManageService, {
  DashboardThongKeChuyenVienDto,
  SpecialistStatsDto,
  ThongKeChuyenVienDetailDtoType,
} from "@/services/platformManage/platformManage.service";

const { RangePicker } = DatePicker;

const platformStatusesToShow = [
  { key: 0, label: "Tạm lưu", color: "#8c8c8c" },
  { key: 1, label: "Chờ duyệt", color: "#0355a2" },
  { key: 2, label: "Đề nghị chỉnh sửa", color: "#faad14" },
  { key: 6, label: "Cần bổ sung thông tin", color: "#faad14" },
  { key: 25, label: "Đang xin ý kiến", color: "#722ed1" },
  { key: 28, label: "Cần bản giấy", color: "#faad14" },
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

const platformShortStatusesToShow = [
  { key: 1, label: "Chờ duyệt", color: "#0355a2" },
  { key: 4, label: "Đã duyệt điện tử", color: "#52c41a" },
  { key: 5, label: "Đã xác nhận", color: "#52c41a" },
  { key: 26, label: "Đã review", color: "#52c41a" },
  { key: 6, label: "Cần bổ sung thông tin", color: "#faad14" },
  { key: 3, label: "Bị từ chối", color: "#ff4d4f" },
];

const contractStatusesToShow = [
  { key: 1, label: "Chờ duyệt", color: "#0355a2" },
  { key: 4, label: "Đã duyệt điện tử", color: "#52c41a" },
  { key: 5, label: "Đã xác nhận", color: "#52c41a" },
  { key: 26, label: "Đã review", color: "#52c41a" },
  { key: 6, label: "Cần bổ sung thông tin", color: "#faad14" },
  { key: 3, label: "Bị từ chối", color: "#ff4d4f" },
];

const kyQuyStatusesToShow = [
  { key: 1, label: "Chờ duyệt", color: "#0355a2" },
  { key: 4, label: "Đã duyệt điện tử", color: "#52c41a" },
  { key: 5, label: "Đã xác nhận", color: "#52c41a" },
  { key: 26, label: "Đã review", color: "#52c41a" },
  { key: 6, label: "Cần bổ sung thông tin", color: "#faad14" },
  { key: 3, label: "Bị từ chối", color: "#ff4d4f" },
];

const DashboardThongKeChuyenVien: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.User);
  const roles = user?.listRole || [];

  const isCucOrAdmin =
    roles.includes("Admin") ||
    roles.includes("LanhDaoCuc") ||
    roles.includes("TruongPhongCuc");

  const isSo =
    !isCucOrAdmin &&
    (roles.includes("LanhDaoSo") || roles.includes("TruongPhongSo"));

  const isAllowed = isCucOrAdmin || isSo;

  const [selectedSpecialist, setSelectedSpecialist] = useState<
    string | undefined
  >(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined,
  );
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    dayjs().year(),
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<DashboardThongKeChuyenVienDto | null>(null);
  const [activeTab, setActiveTab] = useState<string>("1");

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalSpecialistId, setModalSpecialistId] = useState<string>("");
  const [modalGroupType, setModalGroupType] = useState<string>("");
  const [modalAppManageTypeId, setModalAppManageTypeId] = useState<number | undefined>(undefined);
  const [modalStatus, setModalStatus] = useState<number | undefined>(undefined);
  const [modalMauSo, setModalMauSo] = useState<string | undefined>(undefined);

  // Modal Data & Pagination State
  const [modalListData, setModalListData] = useState<ThongKeChuyenVienDetailDtoType[]>([]);
  const [modalTotalCount, setModalTotalCount] = useState<number>(0);
  const [modalPageIndex, setModalPageIndex] = useState<number>(1);
  const [modalPageSize, setModalPageSize] = useState<number>(10);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getStatusColor = (groupType: string, statusKey: number | undefined) => {
    if (statusKey === undefined) return "#1890ff";
    let list = platformStatusesToShow;
    if (groupType === "Contract") list = contractStatusesToShow;
    else if (groupType === "KyQuy") list = kyQuyStatusesToShow;
    const found = list.find((s) => s.key === statusKey);
    return found?.color || "#d9d9d9";
  };

  const getStatusColorByName = (groupType: string, statusName: string) => {
    if (!statusName) return "#d9d9d9";
    let list = platformStatusesToShow;
    if (groupType === "Contract") list = contractStatusesToShow;
    else if (groupType === "KyQuy") list = kyQuyStatusesToShow;
    const found = list.find((s) => s.label.toLowerCase() === statusName.toLowerCase());
    return found?.color || "#d9d9d9";
  };

  const handleStatusCellClick = (
    groupType: string,
    statusKey: number,
    appManageTypeId?: number
  ) => {
    if (groupType === "Platform") {
      let route = "";
      if (appManageTypeId === 1) route = "/QLPlatform/NenTangTrucTuyen";
      else if (appManageTypeId === 2) route = "/QLPlatform/CanBo/DatHangNuocNgoai";
      else if (appManageTypeId === 3) route = "/QLPlatform/CanBo/TrungGianTrongNuoc";
      else if (appManageTypeId === 4) route = "/QLPlatform/CanBo/TrungGianNuocNgoai";
      else return;

      const platformParamMap: Record<number, string> = {
        0: "tamluu",
        1: "choduyet",
        2: "denghichinhsua",
        3: "bituchoi",
        4: "daduyetdientu",
        5: "daxacnhan",
        6: "canbosungthongtin",
        7: "dachamdutdangky",
        8: "dahuydangky",
        9: "denghichamdutdangky",
        10: "dakhoa",
        11: "dayeucaugiahan",
        12: "chogiahan",
        25: "dangxinykien",
        26: "dareview",
        27: "khonghople",
        28: "canbangiay",
      };
      const paramVal = platformParamMap[statusKey] || "";
      if (paramVal) {
        window.open(`${route}?TrangThai=${paramVal}`, "_blank");
      }
    } else if (groupType === "Contract") {
      const contractParamMap: Record<number, string> = {
        0: "tam-luu",
        1: "cho-duyet",
        2: "de-nghi-chinh-sua",
        3: "bi-tu-choi",
        4: "da-duyet-dien-tu",
        5: "da-xac-nhan",
        6: "can-bo-sung-thong-tin",
        7: "da-cham-dut-dang-ky",
        8: "da-huy-dang-ky",
        9: "de-nghi-cham-dut-dang-ky",
        11: "da-yeu-cau-gia-han",
        12: "cho-gia-han",
        26: "da-review",
        28: "can-ban-giay",
      };
      const paramVal = contractParamMap[statusKey] || "";
      if (paramVal) {
        window.open(`/hop-dong?status=${paramVal}`, "_blank");
      }
    } else if (groupType === "KyQuy") {
      const kyQuyParamMap: Record<number, string> = {
        0: "tamluu",
        1: "choduyet",
        2: "denghichinhsua",
        3: "bituchoi",
        4: "daduyetdientu",
        5: "daxacnhan",
        6: "canbosungthongtin",
        8: "dahuydangky",
        26: "dareview",
        28: "canbangiay",
      };
      const paramVal = kyQuyParamMap[statusKey] || "";
      if (paramVal) {
        window.open(`/RutTienKyQuy?TrangThai=${paramVal}`, "_blank");
      }
    }
  };

  const loadModalData = async (
    specialistId = modalSpecialistId,
    groupType = modalGroupType,
    status = modalStatus,
    appManageTypeId = modalAppManageTypeId,
    pageIndex = modalPageIndex,
    pageSize = modalPageSize,
    mauSo = modalMauSo,
  ) => {
    if (!specialistId) return;
    setModalLoading(true);
    try {
      const searchParams: any = {
        specialistId,
        groupType,
        pageIndex,
        pageSize,
      };
      if (selectedYear !== undefined && selectedYear !== null) {
        searchParams.year = selectedYear;
      }
      if (selectedMonth) {
        searchParams.month = selectedMonth;
      }
      if (status !== undefined) {
        searchParams.status = status;
      }
      if (appManageTypeId !== undefined) {
        searchParams.appManageTypeId = appManageTypeId;
      }
      if (mauSo !== undefined) {
        searchParams.mauSo = mauSo;
      }

      const res = await platformManageService.getDashboardThongKeChuyenVienDetail(searchParams);
      if (res.status && res.data) {
        setModalListData(res.data.items || []);
        setModalTotalCount(res.data.totalCount || 0);
      } else {
        message.error(res.message || "Lấy danh sách chi tiết thất bại");
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Có lỗi xảy ra khi tải danh sách chi tiết");
    } finally {
      setModalLoading(false);
    }
  };

  const openDetailModal = (
    specialistId: string,
    groupType: string,
    status: number | undefined,
    appManageTypeId: number | undefined,
    title: string,
    mauSo?: string,
  ) => {
    setModalTitle(title);
    setModalSpecialistId(specialistId);
    setModalGroupType(groupType);
    setModalStatus(status);
    setModalAppManageTypeId(appManageTypeId);
    setModalMauSo(mauSo);
    setModalPageIndex(1);
    setModalPageSize(10);
    setIsModalVisible(true);

    loadModalData(specialistId, groupType, status, appManageTypeId, 1, 10, mauSo);
  };

  const handleModalPageChange = (page: number, size: number) => {
    setModalPageIndex(page);
    setModalPageSize(size);
    loadModalData(
      modalSpecialistId,
      modalGroupType,
      modalStatus,
      modalAppManageTypeId,
      page,
      size,
      modalMauSo,
    );
  };

  const modalColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1 + (modalPageIndex - 1) * modalPageSize,
    },
    {
      title: modalGroupType === "KyQuy" ? "Nền tảng & Website" : "Tên ứng dụng",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text || "N/A"}</span>,
    },
    {
      title: "Tên thương nhân / tổ chức",
      dataIndex: "merchantName",
      key: "merchantName",
      width: 250,
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "registrationDate",
      key: "registrationDate",
      width: 140,
      align: "center" as const,
      render: (val: string) => formatDate(val),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedDate",
      key: "updatedDate",
      width: 140,
      align: "center" as const,
      render: (val: string) => formatDate(val),
    },
    {
      title: "Trạng thái",
      dataIndex: "statusName",
      key: "statusName",
      width: 150,
      align: "center" as const,
      render: (text: string) => (
        <Badge
          color={getStatusColorByName(modalGroupType, text)}
          text={text}
        />
      ),
    },
  ];

  const fetchData = async (month = selectedMonth, year = selectedYear) => {
    setLoading(true);
    try {
      const searchParams: any = {};
      if (year !== undefined && year !== null) {
        searchParams.Year = year;
      }
      if (month) {
        searchParams.Month = month;
      }

      const res =
        await platformManageService.getDashboardThongKeChuyenVien(searchParams);
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

  useEffect(() => {
    fetchData();
  }, []);

  const specialistsOptions = (data?.specialists || []).map((sp) => ({
    label: sp.name ? `${sp.name} (${sp.maCanBo})` : sp.maCanBo || "N/A",
    value: sp.id,
  }));

  const filteredSpecialists = (data?.specialists || []).filter((sp) => {
    if (!selectedSpecialist) return true;
    return sp.id === selectedSpecialist;
  });

  const getPlatformTableData = (specialists: SpecialistStatsDto[] = []) => {
    return (specialists || []).map((sp) => ({
      key: sp.id,
      name: sp.name,
      maCanBo: sp.maCanBo,
      nenTangDatHangTrucTuyen: sp.nenTangDatHangTrucTuyen || {},
      nenTangWebTbbh: sp.nenTangWebTbbh || {},
      nenTangAppTbbh: sp.nenTangAppTbbh || {},
      nenTangWebCcdv: sp.nenTangWebCcdv || {},
      nenTangAppCcdv: sp.nenTangAppCcdv || {},
      nenTangKinhDoanhTrucTiepNuocNgoai:
        sp.nenTangKinhDoanhTrucTiepNuocNgoai || {},
      nenTangTrungGianTrongNuoc: sp.nenTangTrungGianTrongNuoc || {},
      nenTangTrungGianNuocNgoai: sp.nenTangTrungGianNuocNgoai || {},
    }));
  };

  const getTableData = (
    specialists: SpecialistStatsDto[] = [],
    getStatusesMap: (sp: SpecialistStatsDto) => Record<number, number>,
  ) => {
    return (specialists || []).map((sp) => {
      const statuses = getStatusesMap(sp) || {};
      const total = Object.values(statuses).reduce(
        (a, b) => a + (Number(b) || 0),
        0,
      );
      return {
        key: sp.id,
        name: sp.name,
        maCanBo: sp.maCanBo,
        statuses,
        total,
      };
    });
  };

  const getSoPlatformColumns = () => {
    const statuses = [
      { key: 1, label: "Chờ duyệt" },
      { key: 4, label: "Đã duyệt điện tử" },
      { key: 5, label: "Đã xác nhận" },
      { key: 26, label: "Đã review" },
      { key: 6, label: "Cần bổ sung thông tin" },
      { key: 3, label: "Bị từ chối" },
    ];

    return [
      {
        title: "STT",
        key: "stt",
        align: "center",
        width: 50,
        fixed: "left",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Tên chuyên viên",
        key: "specialist",
        width: 170,
        fixed: "left",
        onCell: (record: any) => ({
          onClick: () => {
            openDetailModal(
              record.key,
              "Platform",
              undefined,
              1,
              `${record.name || record.maCanBo} - Tất cả hồ sơ Nền tăng đặt hàng trực tuyến`
            );
          },
          style: { cursor: "pointer" },
        }),
        render: (_: any, record: any) => {
          const displayText = record.name ? `${record.name} (${record.maCanBo})` : record.maCanBo || "N/A";
          return <span style={{ fontWeight: 600 }}>{displayText}</span>;
        },
      },
      ...statuses.map((status) => ({
        title: status.label,
        key: `dhtt_${status.key}`,
        align: "center",
        width: 85,
        onHeaderCell: () => ({
          onClick: () => {
            handleStatusCellClick("Platform", status.key, 1);
          },
          style: { cursor: "pointer" },
        }),
        onCell: (record: any) => {
          const count = record.nenTangDatHangTrucTuyen?.[status.key] || 0;
          return {
            onClick: () => {
              if (count > 0) {
                openDetailModal(
                  record.key,
                  "Platform",
                  status.key,
                  1,
                  `${record.name || record.maCanBo} - ${status.label} (Nền tảng đặt hàng trực tuyến)`
                );
              }
            },
            style: count > 0 ? { cursor: "pointer" } : {},
          };
        },
        render: (_: any, record: any) => {
          const count = record.nenTangDatHangTrucTuyen?.[status.key] || 0;
          if (count > 0) {
            return <span style={{ fontWeight: 600 }}>{count}</span>;
          }
          return 0;
        },
      })),
    ];
  };

  const getPlatformColumns = () => {
    return [
      {
        title: "STT",
        key: "stt",
        align: "center",
        width: 60,
        fixed: "left",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Tên chuyên viên",
        key: "specialist",
        width: 180,
        fixed: "left",
        onCell: (record: any) => ({
          onClick: () => {
            openDetailModal(
              record.key,
              "Platform",
              undefined,
              undefined,
              `${record.name || record.maCanBo} - Tất cả hồ sơ Nền tảng`
            );
          },
          style: { cursor: "pointer" },
        }),
        render: (_: any, record: any) => {
          const displayText = record.name ? `${record.name} (${record.maCanBo})` : record.maCanBo || "N/A";
          return (
            <span style={{ fontWeight: 600 }}>
              {displayText}
            </span>
          );
        },
      },
      {
        title: "Kinh doanh trực tiếp nước ngoài",
        key: "group_kd",
        align: "center",
        onHeaderCell: () => ({
          style: {
            background: "#f5f3ff",
            color: "#5b21b6",
            borderTop: "3px solid #7c3aed",
          },
        }),
        children: platformShortStatusesToShow.map((status) => ({
          title: status.label,
          dataIndex: ["nenTangKinhDoanhTrucTiepNuocNgoai", status.key],
          key: `kd_${status.key}`,
          align: "center",
          width: 85,
          onHeaderCell: () => ({
            onClick: () => {
              handleStatusCellClick("Platform", status.key, 2);
            },
            style: { cursor: "pointer" },
          }),
          onCell: (record: any) => {
            const count = record.nenTangKinhDoanhTrucTiepNuocNgoai?.[status.key] || 0;
            return {
              onClick: () => {
                if (count > 0) {
                  openDetailModal(
                    record.key,
                    "Platform",
                    status.key,
                    2,
                    `${record.name || record.maCanBo} - ${status.label} (Kinh doanh trực tiếp nước ngoài)`
                  );
                }
              },
              style: count > 0 ? { cursor: "pointer" } : {},
            };
          },
          render: (count: number) => {
            if (count > 0) {
              return (
                <span style={{ fontWeight: 600 }}>
                  {count}
                </span>
              );
            }
            return 0;
          },
        })),
      },
      {
        title: "Trung gian trong nước",
        key: "group_tg",
        align: "center",
        onHeaderCell: () => ({
          style: {
            background: "#f0f9ff",
            color: "#075985",
            borderTop: "3px solid #0284c7",
          },
        }),
        children: platformShortStatusesToShow.map((status) => ({
          title: status.label,
          dataIndex: ["nenTangTrungGianTrongNuoc", status.key],
          key: `tg_${status.key}`,
          align: "center",
          width: 85,
          onHeaderCell: () => ({
            onClick: () => {
              handleStatusCellClick("Platform", status.key, 3);
            },
            style: { cursor: "pointer" },
          }),
          onCell: (record: any) => {
            const count = record.nenTangTrungGianTrongNuoc?.[status.key] || 0;
            return {
              onClick: () => {
                if (count > 0) {
                  openDetailModal(
                    record.key,
                    "Platform",
                    status.key,
                    3,
                    `${record.name || record.maCanBo} - ${status.label} (Trung gian trong nước)`
                  );
                }
              },
              style: count > 0 ? { cursor: "pointer" } : {},
            };
          },
          render: (count: number) => {
            if (count > 0) {
              return (
                <span style={{ fontWeight: 600 }}>
                  {count}
                </span>
              );
            }
            return 0;
          },
        })),
      },
      {
        title: "Trung gian nước ngoài",
        key: "group_tg_nn",
        align: "center",
        onHeaderCell: () => ({
          style: {
            background: "#f0fdf4",
            color: "#166534",
            borderTop: "3px solid #16a34a",
          },
        }),
        children: platformShortStatusesToShow.map((status) => ({
          title: status.label,
          dataIndex: ["nenTangTrungGianNuocNgoai", status.key],
          key: `tg_nn_${status.key}`,
          align: "center",
          width: 85,
          onHeaderCell: () => ({
            onClick: () => {
              handleStatusCellClick("Platform", status.key, 4);
            },
            style: { cursor: "pointer" },
          }),
          onCell: (record: any) => {
            const count = record.nenTangTrungGianNuocNgoai?.[status.key] || 0;
            return {
              onClick: () => {
                if (count > 0) {
                  openDetailModal(
                    record.key,
                    "Platform",
                    status.key,
                    4,
                    `${record.name || record.maCanBo} - ${status.label} (Trung gian nước ngoài)`
                  );
                }
              },
              style: count > 0 ? { cursor: "pointer" } : {},
            };
          },
          render: (count: number) => {
            if (count > 0) {
              return (
                <span style={{ fontWeight: 600 }}>
                  {count}
                </span>
              );
            }
            return 0;
          },
        })),
      },
    ];
  };

  const getContractColumns = () => {
    const cols: any[] = [
      {
        title: "STT",
        key: "stt",
        align: "center",
        width: 60,
        fixed: "left",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Tên chuyên viên",
        key: "specialist",
        width: 180,
        fixed: "left",
        onCell: (record: any) => ({
          onClick: () => {
            openDetailModal(
              record.key,
              "Contract",
              undefined,
              undefined,
              `${record.name || record.maCanBo} - Tất cả hồ sơ Hợp đồng`
            );
          },
          style: { cursor: "pointer" },
        }),
        render: (_: any, record: any) => {
          const displayText = record.name ? `${record.name} (${record.maCanBo})` : record.maCanBo || "N/A";
          return (
            <span style={{ fontWeight: 600 }}>
              {displayText}
            </span>
          );
        },
      },
    ];

    contractStatusesToShow.forEach((status) => {
      cols.push({
        title: status.label,
        dataIndex: ["statuses", status.key],
        key: `status_${status.key}`,
        align: "center",
        width: 85,
        onHeaderCell: () => ({
          onClick: () => {
            handleStatusCellClick("Contract", status.key);
          },
          style: { cursor: "pointer" },
        }),
        onCell: (record: any) => {
          const count = record.statuses?.[status.key] || 0;
          return {
            onClick: () => {
              if (count > 0) {
                openDetailModal(
                  record.key,
                  "Contract",
                  status.key,
                  undefined,
                  `${record.name || record.maCanBo} - ${status.label} (Chứng thực hợp đồng điện tử)`
                );
              }
            },
            style: count > 0 ? { cursor: "pointer" } : {},
          };
        },
        render: (count: number) => {
          if (count > 0) {
            return (
              <span style={{ fontWeight: 600 }}>
                {count}
              </span>
            );
          }
          return 0;
        },
      });
    });

    return cols;
  };

  const getKyQuyColumns = () => {
    const cols: any[] = [
      {
        title: "STT",
        key: "stt",
        align: "center",
        width: 60,
        fixed: "left",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Tên chuyên viên",
        key: "specialist",
        width: 180,
        fixed: "left",
        onCell: (record: any) => ({
          onClick: () => {
            openDetailModal(
              record.key,
              "KyQuy",
              undefined,
              undefined,
              `${record.name || record.maCanBo} - Tất cả hồ sơ Rút tiền ký quỹ`
            );
          },
          style: { cursor: "pointer" },
        }),
        render: (_: any, record: any) => {
          const displayText = record.name ? `${record.name} (${record.maCanBo})` : record.maCanBo || "N/A";
          return (
            <span style={{ fontWeight: 600 }}>
              {displayText}
            </span>
          );
        },
      },
    ];

    kyQuyStatusesToShow.forEach((status) => {
      cols.push({
        title: status.label,
        dataIndex: ["statuses", status.key],
        key: `status_${status.key}`,
        align: "center",
        width: 85,
        onHeaderCell: () => ({
          onClick: () => {
            handleStatusCellClick("KyQuy", status.key);
          },
          style: { cursor: "pointer" },
        }),
        onCell: (record: any) => {
          const count = record.statuses?.[status.key] || 0;
          return {
            onClick: () => {
              if (count > 0) {
                openDetailModal(
                  record.key,
                  "KyQuy",
                  status.key,
                  undefined,
                  `${record.name || record.maCanBo} - ${status.label} (Rút tiền ký quỹ)`
                );
              }
            },
            style: count > 0 ? { cursor: "pointer" } : {},
          };
        },
        render: (count: number) => {
          if (count > 0) {
            return (
              <span style={{ fontWeight: 600 }}>
                {count}
              </span>
            );
          }
          return 0;
        },
      });
    });

    return cols;
  };

  if (!isAllowed) {
    return null;
  }

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
              Thống kê chuyên viên
            </h2>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
              Thống kê hồ sơ nền tảng, hợp đồng điện tử và rút tiền ký quỹ theo
              cán bộ xử lý
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563" }}
            >
              Chuyên viên:
            </span>
            <Select
              showSearch
              placeholder="-- Tất cả --"
              value={selectedSpecialist}
              onChange={(val) => setSelectedSpecialist(val)}
              allowClear
              optionFilterProp="label"
              style={{ width: "200px" }}
              options={[
                { label: "Tất cả chuyên viên", value: "" },
                ...specialistsOptions,
              ]}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563" }}
            >
              Tháng:
            </span>
            <Select
              placeholder="-- Tất cả --"
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val)}
              allowClear
              style={{ width: "120px" }}
              options={[
                { label: "Tất cả", value: "" },
                ...Array.from({ length: 12 }, (_, i) => ({
                  label: `Tháng ${i + 1}`,
                  value: i + 1,
                })),
              ]}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563" }}
            >
              Năm:
            </span>
            <Select
              placeholder="-- Tất cả --"
              value={selectedYear}
              onChange={(val) => setSelectedYear(val)}
              allowClear
              style={{ width: "120px" }}
              options={Array.from({ length: 7 }, (_, i) => {
                const year = dayjs().year() - 3 + i;
                return { label: `Năm ${year}`, value: year };
              })}
            />
          </div>

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
        </div>
      </div>

      {/* Content Area with Tabs */}
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        {isSo ? (
          <Tabs
            type="card"
            items={[
              {
                key: "1",
                label: "Nền tảng",
                children: (
                  <div style={{ marginTop: "16px", overflowX: "auto" }}>
                    <Table
                      dataSource={getPlatformTableData(filteredSpecialists)}
                      columns={getSoPlatformColumns() as any}
                      pagination={false}
                      bordered
                      size="small"
                      scroll={{ x: "max-content" }}
                    />
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            type="card"
            items={[
              {
                key: "1",
                label: "Nền tảng",
                children: (
                  <div style={{ marginTop: "16px", overflowX: "auto" }}>
                    <Table
                      dataSource={getPlatformTableData(filteredSpecialists)}
                      columns={getPlatformColumns() as any}
                      pagination={false}
                      bordered
                      size="small"
                      scroll={{ x: "max-content" }}
                    />
                  </div>
                ),
              },
              {
                key: "2",
                label: "Chứng thực hợp đồng điện tử",
                children: (
                  <div style={{ marginTop: "16px", overflowX: "auto" }}>
                    <Table
                      dataSource={getTableData(
                        filteredSpecialists,
                        (sp) => sp.chungThucHopDongDienTu,
                      )}
                      columns={getContractColumns() as any}
                      pagination={false}
                      bordered
                      size="small"
                      scroll={{ x: "max-content" }}
                    />
                  </div>
                ),
              },
              {
                key: "3",
                label: "Rút tiền ký quỹ",
                children: (
                  <div style={{ marginTop: "16px", overflowX: "auto" }}>
                    <Table
                      dataSource={getTableData(
                        filteredSpecialists,
                        (sp) => sp.rutTienKyQuy,
                      )}
                      columns={getKyQuyColumns() as any}
                      pagination={false}
                      bordered
                      size="small"
                      scroll={{ x: "max-content" }}
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </Spin>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f0f0f0", paddingBottom: "12px", width: "100%" }}>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937" }}>
              Danh sách chi tiết hồ sơ
            </span>
            <span style={{
              fontSize: "13px",
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: "6px",
              background: "#f3f4f6",
              color: "#4b5563"
            }}>
              {modalTitle}
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1300}
        style={{ top: 50 }}
        bodyStyle={{ padding: "24px 0 0 0" }}
      >
        <Spin spinning={modalLoading}>
          <div style={{ padding: "0 24px" }}>
            <Table
              dataSource={modalListData}
              columns={modalColumns}
              pagination={false}
              bordered
              size="middle"
              rowKey="id"
              scroll={{ x: "max-content" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid #f0f0f0", marginTop: "24px" }}>
            <Pagination
              total={modalTotalCount}
              showTotal={(total, range) => `${range[0]}-${range[1]} trong tổng số ${total} hồ sơ`}
              pageSize={modalPageSize}
              current={modalPageIndex}
              onChange={handleModalPageChange}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
            />
          </div>
        </Spin>
      </Modal>
    </Card>
  );
};

export default DashboardThongKeChuyenVien;

