"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Form,
  FormProps,
  Image,
  Input,
  MenuProps,
  Modal,
  Pagination,
  Space,
  Table,
  TableProps,
  Tabs,
  Tag,
  message,
  Select,
  Switch,
  Checkbox,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  AppstoreOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  FileDoneOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  SaveOutlined,
  SearchOutlined,
  SendOutlined,
  StopOutlined,
  UserAddOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  StarOutlined,
  StarFilled,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "@/store/hooks";
import Flex from "@/components/shared-components/Flex";
import { AppDispatch } from "@/store/store";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { PagedList } from "@/types/general";
import { PlatformManageListType } from "@/types/platformManage/dto";
import { PlatformManageSearchType } from "@/types/platformManage/request";
import platformManageService from "@/services/platformManage/platformManage.service";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import RoleConstant from "@/constants/RoleConstant";
import formatDate from "@/utils/formatDate";
import { buildFileServerUrl } from "@/utils/file";
import Search from "./search";
import withAuthorization from "@/libs/authentication";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import TransitionModal from "@/components/shared-components/TransitionModal";
import dayjs from "dayjs";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { CertificateInfo, SignResultItem } from "@/libs/moit-sign/types";
import userService from "@/services/user/user.service";

const getStatusFromParam = (paramValue: string | null): number | null => {
  if (!paramValue) return null;
  const key = paramValue.toLowerCase().replace(/[-_]/g, "");
  const map: Record<string, number> = {
    tamluu: PlatformStatusConstant.TamLuu,
    choduyet: PlatformStatusConstant.ChoDuyet,
    denghichinhsua: PlatformStatusConstant.DeNghiChinhSua,
    bituchoi: PlatformStatusConstant.BiTuChoi,
    daduyetdientu: PlatformStatusConstant.DaDuyetDienTu,
    daxacnhan: PlatformStatusConstant.DaXacNhan,
    canbosungthongtin: PlatformStatusConstant.CanBoSungThongTin,
    dachamdutdangky: PlatformStatusConstant.DaChamDutDangKy,
    dahuydangky: PlatformStatusConstant.DaHuyDangKy,
    denghichamdutdangky: PlatformStatusConstant.DeNghiChamDutDangKy,
    dakhoa: PlatformStatusConstant.DaKhoa,
    dayeucaugiahan: PlatformStatusConstant.DaYeuCauGiaHan,
    chogiahan: PlatformStatusConstant.ChoGiaHan,
    dangxinykien: PlatformStatusConstant.DangXinYKien,
    dareview: PlatformStatusConstant.DaReview,
    khonghople: PlatformStatusConstant.KhongHopLe,
    // canbangiay: PlatformStatusConstant.CanBanGiay,
  };
  return map[key] !== undefined ? map[key] : null;
};

const EXPORT_FIELDS = [
  { key: "name", label: "Tên nền tảng" },
  { key: "domain", label: "Địa chỉ tên miền / Website" },
  { key: "statusName", label: "Trạng thái" },
  { key: "platformManageTypeName", label: "Loại hình nền tảng" },
  { key: "loaiHangHoaKhacName", label: "Loại hàng hóa/dịch vụ" },
  { key: "appCount", label: "Số lượng ứng dụng" },
  { key: "companyName", label: "Tên doanh nghiệp chủ quản" },
  { key: "companyTaxCode", label: "Mã số thuế" },
  { key: "companyEmail", label: "Email doanh nghiệp" },
  { key: "isNenTangLon", label: "Quy mô" },
  { key: "createdDate", label: "Ngày tạo hồ sơ" },
  { key: "submitDate", label: "Ngày gửi duyệt" },
  { key: "reviewDate", label: "Ngày duyệt/xử lý" },
  { key: "reviewName", label: "Cán bộ xử lý" },
  { key: "reviewMaCanBo", label: "Mã cán bộ xử lý" },
  { key: "detail", label: "Ghi chú" },
];



const NenTangTrucTuyenPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trangThaiParam = searchParams.get("TrangThai");
  const mappedStatus = getStatusFromParam(trangThaiParam);
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.includes(RoleConstant.Admin);
  const loading = useSelector((s: any) => s.general.isLoading);
  const isDoanhNghiep = userRoles.includes(RoleConstant.DoanhNghiep);

  const userOperationCodes: string[] = (currentUser?.menuData ?? [])
    .flatMap((module: any) => module.listMenu ?? [])
    .map((op: any) => op.code as string);
  const hasPermission = (code: string) => isAdmin || userOperationCodes.includes(code);

  const canSeeAllList = hasPermission("PLATFORM_MANAGE_LIST_ALL");
  const canSeeChoDuyetList = hasPermission("PLATFORM_MANAGE_LIST_CHODUYET");
  const canSeeBiTuChoiList = hasPermission("PLATFORM_MANAGE_LIST_BITUCHOI");
  const canSeeDaDuyetDienTuList = hasPermission("PLATFORM_MANAGE_LIST_DADUYETDIENTU");
  const canSeeDaReviewList = hasPermission("PLATFORM_MANAGE_LIST_DAREVIEW");
  const canSeeDaXacNhanList = hasPermission("PLATFORM_MANAGE_LIST_DAXACNHAN");

  // Chuyên viên
  const canActionNhanTuXuLy = hasPermission("PLATFORM_MANAGE_ACTION_NHANTUXULY");
  const canActionDuyetDienTu = hasPermission("PLATFORM_MANAGE_ACTION_DUYETDIENTU");
  const canActionBoSungCV = hasPermission("PLATFORM_MANAGE_ACTION_BOSUNG_CV");
  const canActionXinYKien = hasPermission("PLATFORM_MANAGE_ACTION_XINYKIEN");
  const canActionTuChoiCV = hasPermission("PLATFORM_MANAGE_ACTION_TUCHOI_CV");
  const canActionChamDut = hasPermission("PLATFORM_MANAGE_ACTION_CHAMDUT");
  const canActionChoDuyetCV = hasPermission("PLATFORM_MANAGE_ACTION_CHODUYET_CV");

  // Trưởng phòng
  const canActionPhanCong = hasPermission("PLATFORM_MANAGE_ACTION_PHANCONG");
  const canActionReviewThongQua = hasPermission("PLATFORM_MANAGE_ACTION_REVIEWTHONGQUA");
  const canActionYeuCauBanGiay = hasPermission("PLATFORM_MANAGE_ACTION_YEUCAUBANGIAY");
  const canActionBoSungTP = hasPermission("PLATFORM_MANAGE_ACTION_BOSUNG_TP");
  const canActionTuChoiTP = hasPermission("PLATFORM_MANAGE_ACTION_TUCHOI_TP");

  // Lãnh đạo
  const canActionPheDuyet = hasPermission("PLATFORM_MANAGE_ACTION_PHEDUYET");
  const canActionBoSungLD = hasPermission("PLATFORM_MANAGE_ACTION_BOSUNG_LD");
  const canActionTuChoiLD = hasPermission("PLATFORM_MANAGE_ACTION_TUCHOI_LD");

  const isChuyenVien = canActionNhanTuXuLy || canActionDuyetDienTu || canActionBoSungCV || canActionXinYKien || canActionTuChoiCV || canActionChamDut || canActionChoDuyetCV;
  const isTruongPhongSo = canActionPhanCong || canActionReviewThongQua || canActionYeuCauBanGiay || canActionBoSungTP || canActionTuChoiTP;
  const isLanhDaoSo = canActionPheDuyet || canActionBoSungLD || canActionTuChoiLD;
  const canMarkBigPlatform = canActionPheDuyet || canActionDuyetDienTu || canActionReviewThongQua;

  const isLocalHost = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const isDevEnv = process.env.NODE_ENV === "development" || isLocalHost;

  const [data, setData] = useState<PagedList<PlatformManageListType>>();
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [searchValues, setSearchValues] =
    useState<PlatformManageSearchType | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFields, setExportFields] = useState<string[]>(
    EXPORT_FIELDS.map(f => f.key)
  );
  const [specialistOptions, setSpecialistOptions] = useState<{ value: string; label: string }[]>([]);
  const [specialistLoading, setSpecialistLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignRecord, setAssignRecord] = useState<PlatformManageListType | null>(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignForm] = Form.useForm<{ chuyenVienId: string }>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isReassignMode, setIsReassignMode] = useState(false);
  const [bulkAssignForm] = Form.useForm<{ chuyenVienId: string }>();
  const [bulkAssignSubmitting, setBulkAssignSubmitting] = useState(false);
  const [isSignNenTang, setIsSignNenTang] = useState<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [currentSignAction, setCurrentSignAction] = useState<number | null>(null);
  const [pendingTransition, setPendingTransition] = useState<{
    id?: string;
    ids?: string[];
    targetStatus: number;
    note: string;
    successMessage: string;
  } | null>(null);

  const getIsSignNenTang = async () => {
    const res = await duLieuDanhMucService.getAllByGroupCode(
      "CAUHINH_SIGN_NENTANG"
    );

    if (res.status && res.data?.length) {
      const signNenTang = res.data.find(
        (item: any) => item.code === "SIGN_DATHANGTRUCTUYEN"
      );

      setIsSignNenTang(signNenTang?.priority === 1);
    }
  };

  useEffect(() => {
    getIsSignNenTang();
  }, []);

  const getInitialTabKey = () => {
    if (mappedStatus !== null) {
      return mappedStatus.toString();
    }
    return "All";
  };
  const [activeTabKey, setActiveTabKey] = useState<string>(getInitialTabKey);

  useEffect(() => {
    if (mappedStatus !== null) {
      setActiveTabKey(mappedStatus.toString());
      setPageIndex(1);
    } else {
      setActiveTabKey("All");
      setPageIndex(1);
    }
  }, [mappedStatus]);
  const [statusCounts, setStatusCounts] = useState<{ [key: number]: number }>({});
  const [onlyPending, setOnlyPending] = useState<boolean>(false);

  const latestRequestKeyRef = useRef({ activeTabKey, onlyPending });
  useEffect(() => {
    latestRequestKeyRef.current = { activeTabKey, onlyPending };
  }, [activeTabKey, onlyPending]);

  /* ─── Status Tabs ─── */
  const statusTabs: {
    key: string;
    statusValue?: number;
    label: string;
    color: string;
    icon: React.ReactNode;
  }[] = [
      { key: "All", label: "Tất cả", color: "#1890ff", icon: <AppstoreOutlined /> },
      {
        key: String(PlatformStatusConstant.TamLuu),
        statusValue: PlatformStatusConstant.TamLuu,
        label: "Tạm lưu",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.TamLuu),
        icon: <SaveOutlined />,
      },
      {
        key: String(PlatformStatusConstant.ChoDuyet),
        statusValue: PlatformStatusConstant.ChoDuyet,
        label: "Chờ duyệt",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.ChoDuyet),
        icon: <ClockCircleOutlined />,
      },
      {
        key: String(PlatformStatusConstant.DeNghiChinhSua),
        statusValue: PlatformStatusConstant.DeNghiChinhSua,
        label: "Đề nghị chỉnh sửa",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.DeNghiChinhSua),
        icon: <EditOutlined />,
      },
      {
        key: String(PlatformStatusConstant.BiTuChoi),
        statusValue: PlatformStatusConstant.BiTuChoi,
        label: "Bị từ chối",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.BiTuChoi),
        icon: <StopOutlined />,
      },
      {
        key: String(PlatformStatusConstant.DaDuyetDienTu),
        statusValue: PlatformStatusConstant.DaDuyetDienTu,
        label: "Đã duyệt điện tử",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.DaDuyetDienTu),
        icon: <CheckCircleOutlined />,
      },
      {
        key: String(PlatformStatusConstant.DaReview),
        statusValue: PlatformStatusConstant.DaReview,
        label: "Đã review",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.DaReview),
        icon: <FileDoneOutlined />,
      },
      {
        key: String(PlatformStatusConstant.DaXacNhan),
        statusValue: PlatformStatusConstant.DaXacNhan,
        label: "Đã xác nhận",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.DaXacNhan),
        icon: <AuditOutlined />,
      },
      {
        key: String(PlatformStatusConstant.CanBoSungThongTin),
        statusValue: PlatformStatusConstant.CanBoSungThongTin,
        label: "Cần bổ sung thông tin",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.CanBoSungThongTin),
        icon: <ExclamationCircleOutlined />,
      },
      {
        key: String(PlatformStatusConstant.KhongHopLe),
        statusValue: PlatformStatusConstant.KhongHopLe,
        label: "Không hợp lệ",
        color: PlatformStatusConstant.getColor(PlatformStatusConstant.KhongHopLe),
        icon: <CloseCircleOutlined />,
      },
      // {
      //   key: String(PlatformStatusConstant.CanBanGiay),
      //   statusValue: PlatformStatusConstant.CanBanGiay,
      //   label: "Cần bản giấy",
      //   color: PlatformStatusConstant.getColor(PlatformStatusConstant.CanBanGiay),
      //   icon: <FileTextOutlined />,
      // },
    ];

  const allowedStatusTabs = statusTabs.filter(tab => {
    if (onlyPending) {
      if (isAdmin) {
        return [
          String(PlatformStatusConstant.ChoDuyet),
          String(PlatformStatusConstant.DaDuyetDienTu),
          String(PlatformStatusConstant.DaReview),
        ].includes(tab.key);
      }
      if (isDoanhNghiep) {
        return [
          String(PlatformStatusConstant.TamLuu),
          String(PlatformStatusConstant.DeNghiChinhSua),
          String(PlatformStatusConstant.CanBoSungThongTin),
          String(PlatformStatusConstant.BiTuChoi),
          String(PlatformStatusConstant.KhongHopLe),
        ].includes(tab.key);
      }
      const allowedKeys: string[] = [];
      const isCv = isChuyenVien || canActionNhanTuXuLy || canActionDuyetDienTu || canActionBoSungCV || canActionXinYKien || canActionTuChoiCV || canActionChamDut || canActionChoDuyetCV;
      const isTp = isTruongPhongSo || canActionPhanCong || canActionReviewThongQua || canActionYeuCauBanGiay || canActionBoSungTP || canActionTuChoiTP;
      const isLd = isLanhDaoSo || canActionPheDuyet || canActionBoSungLD || canActionTuChoiLD;
      if (isCv) {
        allowedKeys.push(String(PlatformStatusConstant.ChoDuyet));
      }
      if (isTp) {
        allowedKeys.push(String(PlatformStatusConstant.DaDuyetDienTu));
      }
      if (isLd) {
        allowedKeys.push(String(PlatformStatusConstant.DaReview));
      }
      return allowedKeys.includes(tab.key);
    }

    if (isAdmin) return true;
    if (isDoanhNghiep) {
      return [
        "All",
        String(PlatformStatusConstant.TamLuu),
        String(PlatformStatusConstant.ChoDuyet),
        String(PlatformStatusConstant.DeNghiChinhSua),
        String(PlatformStatusConstant.BiTuChoi),
        String(PlatformStatusConstant.DaDuyetDienTu),
        String(PlatformStatusConstant.DaReview),
        String(PlatformStatusConstant.DaXacNhan),
        String(PlatformStatusConstant.CanBoSungThongTin),
        String(PlatformStatusConstant.KhongHopLe),
        // String(PlatformStatusConstant.CanBanGiay),
      ].includes(tab.key);
    }
    switch (tab.key) {
      case "All":
        return canSeeAllList;
      case String(PlatformStatusConstant.ChoDuyet):
        return canSeeChoDuyetList;
      case String(PlatformStatusConstant.BiTuChoi):
        return canSeeBiTuChoiList;
      case String(PlatformStatusConstant.DaDuyetDienTu):
        return canSeeDaDuyetDienTuList;
      case String(PlatformStatusConstant.DaReview):
        return canSeeDaReviewList;
      case String(PlatformStatusConstant.DaXacNhan):
        return canSeeDaXacNhanList;
      default:
        return false;
    }
  });

  const [transitionModal, setTransitionModal] = useState<{
    recordId: string;
    targetStatus: number;
    title: string;
    buttonColor?: "primary" | "danger" | "warning";
  } | null>(null);
  const [transitionSubmitting, setTransitionSubmitting] = useState(false);
  const [transitionForm] = Form.useForm<{ note: string }>();

  const [devStatusModal, setDevStatusModal] = useState<{
    recordIds: string[];
    currentStatus?: number;
  } | null>(null);
  const [devStatusSubmitting, setDevStatusSubmitting] = useState(false);
  const [devStatusForm] = Form.useForm<{ targetStatus: number; note: string }>();

  const [bulkTransitionModal, setBulkTransitionModal] = useState<{
    visible: boolean;
    targetStatus: number;
    targetStatusName: string;
  }>({
    visible: false,
    targetStatus: 0,
    targetStatusName: "",
  });
  const [bulkTransitionForm] = Form.useForm<{ note: string }>();

  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);

  const loadGroupedTemplates = async () => {
    try {
      const res = await mauTraLoiService.getGroupedTemplates();
      if (res?.status && res.data) {
        setGroupedTemplates(res.data);
      }
    } catch (e) {
      console.error("Lỗi khi load mẫu trả lời sẵn theo nhóm:", e);
    }
  };

  useEffect(() => {
    if (transitionModal || bulkTransitionModal.visible) {
      loadGroupedTemplates();
    }
  }, [transitionModal, bulkTransitionModal.visible]);

  const handleLoadData = useCallback(
    async (override?: PlatformManageSearchType) => {
      dispatch(setIsLoading(true));
      const cleaned = Object.fromEntries(
        Object.entries(searchValues || {}).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined,
        ),
      );
      const search: PlatformManageSearchType = {
        platformManageTypeId: "NTThongBaoKD",
        ...(override ?? { pageIndex, pageSize, onlyPending, ...cleaned }),
      };
      if (!override) {
        if (mappedStatus !== null) {
          search.status = mappedStatus;
        } else if (activeTabKey !== "All") {
          if (activeTabKey === String(PlatformStatusConstant.ChoDuyet)) {
            search.FilterPermission = "PLATFORM_MANAGE_LIST_CHODUYET";
          } else if (activeTabKey === String(PlatformStatusConstant.BiTuChoi)) {
            search.FilterPermission = "PLATFORM_MANAGE_LIST_BITUCHOI";
          } else if (activeTabKey === String(PlatformStatusConstant.DaDuyetDienTu)) {
            search.FilterPermission = "PLATFORM_MANAGE_LIST_DADUYETDIENTU";
          } else if (activeTabKey === String(PlatformStatusConstant.DaReview)) {
            search.FilterPermission = "PLATFORM_MANAGE_LIST_DAREVIEW";
          } else if (activeTabKey === String(PlatformStatusConstant.DaXacNhan)) {
            search.FilterPermission = "PLATFORM_MANAGE_LIST_DAXACNHAN";
          } else {
            search.status = parseInt(activeTabKey, 10);
          }
        }
      }
      const response = await platformManageService.getOnlinePlatformData(search);
      if (
        latestRequestKeyRef.current.activeTabKey === activeTabKey &&
        latestRequestKeyRef.current.onlyPending === onlyPending
      ) {
        if (response?.data) setData(response.data);
      }

      // Fetch status counts (tạm comment)
      // try {
      //   const countRes = await platformManageService.getOnlinePlatformStatusCounts({
      //     onlyPending,
      //     platformManageTypeId: "NTThongBaoKD",
      //     ...(cleaned as PlatformManageSearchType),
      //   });
      //   if (
      //     latestRequestKeyRef.current.activeTabKey === activeTabKey &&
      //     latestRequestKeyRef.current.onlyPending === onlyPending
      //   ) {
      //     if (countRes?.data) {
      //       setStatusCounts(countRes.data);
      //     }
      //   }
      // } catch {
      //   // silently ignore if endpoint not available yet
      // }

      if (
        latestRequestKeyRef.current.activeTabKey === activeTabKey &&
        latestRequestKeyRef.current.onlyPending === onlyPending
      ) {
        dispatch(setIsLoading(false));
      }
    },
    [dispatch, pageIndex, pageSize, searchValues, activeTabKey, onlyPending, mappedStatus],
  );

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [pageIndex, pageSize]);

  useEffect(() => {
    if (mappedStatus === null && allowedStatusTabs.length > 0 && !allowedStatusTabs.some(t => t.key === activeTabKey)) {
      setActiveTabKey(allowedStatusTabs[0].key);
    }
  }, [allowedStatusTabs, activeTabKey, mappedStatus]);

  const onFinishSearch: FormProps<PlatformManageSearchType>["onFinish"] =
    async (values) => {
      // PlatformSearch đã format submitDateFrom/To và createdDateFrom/To nội bộ trước khi gọi callback
      const queryValues = { ...values };
      delete queryValues.submitDateRange;
      delete queryValues.createdDateRange;

      setSearchValues(queryValues);
      const searchData: PlatformManageSearchType = { ...queryValues, pageIndex: 1, pageSize, onlyPending };
      if (mappedStatus !== null) {
        searchData.status = mappedStatus;
      } else if (activeTabKey !== "All") {
        if (activeTabKey === String(PlatformStatusConstant.ChoDuyet)) {
          searchData.FilterPermission = "PLATFORM_MANAGE_LIST_CHODUYET";
        } else if (activeTabKey === String(PlatformStatusConstant.BiTuChoi)) {
          searchData.FilterPermission = "PLATFORM_MANAGE_LIST_BITUCHOI";
        } else if (activeTabKey === String(PlatformStatusConstant.DaDuyetDienTu)) {
          searchData.FilterPermission = "PLATFORM_MANAGE_LIST_DADUYETDIENTU";
        } else if (activeTabKey === String(PlatformStatusConstant.DaReview)) {
          searchData.FilterPermission = "PLATFORM_MANAGE_LIST_DAREVIEW";
        } else if (activeTabKey === String(PlatformStatusConstant.DaXacNhan)) {
          searchData.FilterPermission = "PLATFORM_MANAGE_LIST_DAXACNHAN";
        } else {
          searchData.status = parseInt(activeTabKey, 10);
        }
      }
      await handleLoadData(searchData);
    };


  const handleShowModal = () => {
    router.push("/QLPlatform/NenTangTrucTuyen/createOrUpdate");
  };

  const handleShowEdit = (record: PlatformManageListType) => {
    router.push(`/QLPlatform/NenTangTrucTuyen/createOrUpdate?id=${record.id}`);
  };

  const handleShowDetail = (record: PlatformManageListType) => {
    router.push(`/QLPlatform/NenTangTrucTuyen/detail?id=${record.id}`);
  };

  const handleExportExcel = async () => {
    if (exportFields.length === 0) {
      message.error("Vui lòng chọn ít nhất một trường để xuất!");
      return;
    }

    dispatch(setIsLoading(true));
    try {
      const searchParamsForExport: PlatformManageSearchType = {
        ...searchValues,
        pageIndex: 1,
        pageSize: 100000,
        onlyPending,
      };

      if (mappedStatus !== null) {
        searchParamsForExport.status = mappedStatus;
      } else if (activeTabKey !== "All") {
        if (activeTabKey === String(PlatformStatusConstant.ChoDuyet)) {
          searchParamsForExport.FilterPermission = "PLATFORM_MANAGE_LIST_CHODUYET";
        } else if (activeTabKey === String(PlatformStatusConstant.BiTuChoi)) {
          searchParamsForExport.FilterPermission = "PLATFORM_MANAGE_LIST_BITUCHOI";
        } else if (activeTabKey === String(PlatformStatusConstant.DaDuyetDienTu)) {
          searchParamsForExport.FilterPermission = "PLATFORM_MANAGE_LIST_DADUYETDIENTU";
        } else if (activeTabKey === String(PlatformStatusConstant.DaReview)) {
          searchParamsForExport.FilterPermission = "PLATFORM_MANAGE_LIST_DAREVIEW";
        } else if (activeTabKey === String(PlatformStatusConstant.DaXacNhan)) {
          searchParamsForExport.FilterPermission = "PLATFORM_MANAGE_LIST_DAXACNHAN";
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
      dispatch(setIsLoading(false));
    }
  };



  const loadSpecialists = useCallback(async () => {
    setSpecialistLoading(true);
    try {
      const response = await userService.getUserByRole({
        pageIndex: 1,
        pageSize: 1000,
        permissionCode: "PLATFORM_MANAGE_ACTION_DUYETDIENTU",
      });
      const itemsList = response?.data?.items || [];
      setSpecialistOptions(
        itemsList
          .filter((u: any) => u?.id)
          .map((u: any) => ({
            value: u.id,
            label: u.maCanBo ? `[${u.maCanBo}] ${u.name}` : (u.name || u.userName || u.email || u.id),
          }))
      );
    } catch {
      setSpecialistOptions([]);
      message.error("Không tải được danh sách chuyên viên xử lý");
    } finally {
      setSpecialistLoading(false);
    }
  }, []);

  const handleOpenAssignModal = async (record: PlatformManageListType) => {
    setAssignRecord(record);
    setIsAssignModalOpen(true);
    assignForm.resetFields();
    await loadSpecialists();
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssignRecord(null);
    assignForm.resetFields();
  };

  const handleAssignTask = async (values: { chuyenVienId: string }) => {
    if (!assignRecord?.id) return;
    setAssignSubmitting(true);
    try {
      const selectedSpecialist = specialistOptions.find(o => o.value === values.chuyenVienId);
      const specialistName = selectedSpecialist ? selectedSpecialist.label.split(" (")[0] : "";
      const response = await platformManageService.assignProcessing(
        [assignRecord.id],
        values.chuyenVienId,
        specialistName
      );

      if (response.status) {
        message.success("Phân công xử lý thành công");
        handleCloseAssignModal();
        await handleLoadData();
      } else {
        message.error(response.message || "Phân công xử lý thất bại");
      }
    } catch {
      message.error("Phân công xử lý thất bại");
    } finally {
      setAssignSubmitting(false);
    }
  };

  const canReceiveRecord = (record: PlatformManageListType) =>
    record.status === PlatformStatusConstant.ChoDuyet &&
    !record.reviewName?.trim();

  const canSubmitRecord = (record: PlatformManageListType) =>
    record.status === PlatformStatusConstant.TamLuu ||
    record.status === PlatformStatusConstant.DeNghiChinhSua ||
    record.status === PlatformStatusConstant.CanBoSungThongTin;

  const handleBulkSubmit = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một hồ sơ");
      return;
    }

    const selectedRecords = data?.items?.filter((item) => selectedRowKeys.includes(item.id)) ?? [];
    const invalid = selectedRecords.filter((item) => !canSubmitRecord(item));

    if (invalid.length > 0) {
      message.error(
        "Chỉ có thể gửi duyệt các hồ sơ ở trạng thái Tạm lưu hoặc Yêu cầu bổ sung/chỉnh sửa.",
      );
      return;
    }

    Modal.confirm({
      title: "Xác nhận gửi duyệt nhiều hồ sơ cùng lúc",
      content: `Bạn có chắc chắn muốn gửi duyệt ${selectedRowKeys.length} hồ sơ đã chọn? Trạng thái các hồ sơ này sẽ được chuyển thành Chờ duyệt.`,
      okText: "Gửi duyệt",
      cancelText: "Huỷ",
      onOk: async () => {
        dispatch(setIsLoading(true));
        try {
          const promises = selectedRowKeys.map((id) =>
            platformManageService.transition({
              id: id as string,
              targetStatus: PlatformStatusConstant.ChoDuyet,
              note: "Gửi duyệt hàng loạt từ danh sách",
            })
          );

          const results = await Promise.all(promises);
          const failures = results.filter((r) => !r.status);

          if (failures.length === 0) {
            message.success(`Gửi duyệt thành công ${selectedRowKeys.length} hồ sơ`);
            setSelectedRowKeys([]);
            await handleLoadData();
          } else {
            message.error(
              `Có ${failures.length} hồ sơ gửi duyệt thất bại. Vui lòng kiểm tra lại.`
            );
            setSelectedRowKeys([]);
            await handleLoadData();
          }
        } catch {
          message.error("Có lỗi xảy ra khi thực hiện gửi duyệt hàng loạt");
        } finally {
          dispatch(setIsLoading(false));
        }
      },
    });
  };

  const handleTransitionSubmit = async (values: { note: string }) => {
    if (!transitionModal) return;
    setTransitionSubmitting(true);
    try {
      const response = await platformManageService.transition({
        id: transitionModal.recordId,
        targetStatus: transitionModal.targetStatus,
        note: values.note,
      });
      if (response.status) {
        message.success("Chuyển trạng thái hồ sơ thành công");
        setTransitionModal(null);
        transitionForm.resetFields();
        await handleLoadData();
      } else {
        message.error(response.message ?? "Thao tác thất bại");
      }
    } catch {
      message.error("Có lỗi khi chuyển trạng thái hồ sơ");
    } finally {
      setTransitionSubmitting(false);
    }
  };

  const handleDevStatusSubmit = async (values: { targetStatus: number; note: string }) => {
    if (!devStatusModal?.recordIds || devStatusModal.recordIds.length === 0) return;
    setDevStatusSubmitting(true);
    try {
      let response;
      if (devStatusModal.recordIds.length === 1) {
        response = await platformManageService.devUpdateStatus({
          id: devStatusModal.recordIds[0],
          targetStatus: values.targetStatus,
          note: values.note,
        });
      } else {
        response = await platformManageService.devBulkUpdateStatus({
          ids: devStatusModal.recordIds,
          targetStatus: values.targetStatus,
          note: values.note,
        });
      }

      if (response.status) {
        message.success(
          devStatusModal.recordIds.length === 1
            ? "Cập nhật trạng thái (DEV) thành công!"
            : `Cập nhật trạng thái hàng loạt (DEV) thành công cho ${devStatusModal.recordIds.length} hồ sơ!`
        );
        setDevStatusModal(null);
        devStatusForm.resetFields();
        setSelectedRowKeys([]);
        await handleLoadData();
      } else {
        message.error(response.message || "Cập nhật thất bại");
      }
    } catch (err: any) {
      message.error(err.message || "Đã xảy ra lỗi");
    } finally {
      setDevStatusSubmitting(false);
    }
  };

  const handleSelfAssign = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một hồ sơ");
      return;
    }

    const selectedRecords = data?.items?.filter((item) => selectedRowKeys.includes(item.id)) ?? [];
    const invalid = selectedRecords.filter((item) => !canReceiveRecord(item));

    if (invalid.length > 0) {
      message.error(
        "Chỉ có thể nhận xử lý các hồ sơ ở trạng thái Chờ duyệt và chưa được phân công.",
      );
      return;
    }

    Modal.confirm({
      title: "Xác nhận nhận xử lý",
      content: `Bạn có chắc muốn nhận xử lý ${selectedRowKeys.length} hồ sơ đã chọn?`,
      okText: "Nhận xử lý",
      cancelText: "Huỷ",
      onOk: async () => {
        dispatch(setIsLoading(true));
        try {
          const response = await platformManageService.assignProcessing(
            selectedRowKeys as string[],
            currentUser.id,
            currentUser.name || ""
          );
          if (response.status) {
            message.success(
              response.message ?? "Nhận xử lý hồ sơ thành công",
            );
            setSelectedRowKeys([]);
            await handleLoadData();
          } else {
            message.error(response.message ?? "Nhận xử lý thất bại");
          }
        } catch {
          message.error("Có lỗi khi nhận xử lý hồ sơ");
        } finally {
          dispatch(setIsLoading(false));
        }
      },
    });
  };

  const handleBulkMarkBigPlatform = async (isBig: boolean) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một hồ sơ");
      return;
    }

    const selectedRecords = data?.items?.filter((item) => selectedRowKeys.includes(item.id)) ?? [];
    const terminatedRecords = selectedRecords.filter(
      (item) => item.status === PlatformStatusConstant.DaChamDutDangKy
    );

    if (terminatedRecords.length > 0) {
      const names = terminatedRecords.map((r) => `"${r.name}"`).join(", ");
      message.error(
        `Không thể thực hiện tác vụ. Một số hồ sơ đã chấm dứt đăng ký, không thể thao tác nền tảng số lớn: ${names}`
      );
      return;
    }

    Modal.confirm({
      title: isBig ? "Xác nhận đánh dấu nền tảng lớn" : "Xác nhận hủy đánh dấu nền tảng lớn",
      content: `Bạn có chắc muốn ${isBig ? "đánh dấu" : "hủy đánh dấu"} ${selectedRowKeys.length} hồ sơ đã chọn làm nền tảng số lớn?`,
      okText: "Xác nhận",
      cancelText: "Huỷ",
      onOk: async () => {
        dispatch(setIsLoading(true));
        try {
          const results = await Promise.all(
            selectedRowKeys.map((id) =>
              platformManageService.markBigPlatform({
                id: String(id),
                isBig,
                note: isBig ? "Đánh dấu nền tảng số lớn hàng loạt" : "Hủy đánh dấu nền tảng số lớn hàng loạt",
              })
            )
          );

          const failed = results.filter((res) => !res.status);
          if (failed.length === 0) {
            message.success(
              `${isBig ? "Đánh dấu" : "Hủy đánh dấu"} nền tảng lớn thành công cho ${selectedRowKeys.length} hồ sơ`
            );
            setSelectedRowKeys([]);
            await handleLoadData();
          } else {
            message.error(`Có ${failed.length} hồ sơ cập nhật thất bại`);
            await handleLoadData();
          }
        } catch {
          message.error("Có lỗi xảy ra khi cập nhật trạng thái");
        } finally {
          dispatch(setIsLoading(false));
        }
      },
    });
  };

  const handleBulkAssign = async (isReassign: boolean) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một hồ sơ");
      return;
    }
    const selectedRecords = data?.items?.filter((item) => selectedRowKeys.includes(item.id)) ?? [];
    const invalid = selectedRecords.filter((item) => item.status !== PlatformStatusConstant.ChoDuyet);
    if (invalid.length > 0) {
      message.error(`Chỉ có thể ${isReassign ? "phân công lại" : "phân công"} các hồ sơ ở trạng thái Chờ duyệt.`);
      return;
    }

    if (isReassign) {
      const notAssignedYet = selectedRecords.filter((item) => !item.reviewId);
      if (notAssignedYet.length > 0) {
        message.error("Vui lòng chỉ chọn các hồ sơ đã được phân công trước đó để phân công lại.");
        return;
      }
    } else {
      const alreadyAssigned = selectedRecords.filter((item) => item.reviewId);
      if (alreadyAssigned.length > 0) {
        message.error("Có hồ sơ đã được phân công. Vui lòng sử dụng tính năng 'Phân công lại' nếu muốn đổi chuyên viên.");
        return;
      }
    }

    setIsReassignMode(isReassign);
    bulkAssignForm.resetFields();
    if (specialistOptions.length === 0) {
      setSpecialistLoading(true);
      try {
        const response = await userService.getUserByRole({
          pageIndex: 1,
          pageSize: 1000,
          permissionCode: "PLATFORM_MANAGE_ACTION_DUYETDIENTU",
        });
        const itemsList = response?.data?.items || [];
        setSpecialistOptions(
          itemsList
            .filter((u: any) => u?.id)
            .map((u: any) => ({
              value: u.id,
              label: u.maCanBo ? `[${u.maCanBo}] ${u.name}` : (u.name || u.userName || u.email || u.id),
            }))
        );
      } catch {
        setSpecialistOptions([]);
      } finally {
        setSpecialistLoading(false);
      }
    }
    setIsBulkAssignModalOpen(true);
  };

  const handleBulkAssignSubmit = async (values: { chuyenVienId: string }) => {
    setBulkAssignSubmitting(true);
    try {
      const selectedSpecialist = specialistOptions.find((o) => o.value === values.chuyenVienId);
      const specialistName = selectedSpecialist ? selectedSpecialist.label.split(" (")[0] : "";
      const response = await platformManageService.assignProcessing(
        selectedRowKeys as string[],
        values.chuyenVienId,
        specialistName
      );
      if (response.status) {
        message.success(`${isReassignMode ? "Phân công lại" : "Phân công"} thành công cho ${selectedRowKeys.length} hồ sơ`);
        setIsBulkAssignModalOpen(false);
        bulkAssignForm.resetFields();
        setSelectedRowKeys([]);
        await handleLoadData();
      } else {
        message.error(response.message || `${isReassignMode ? "Phân công lại" : "Phân công"} thất bại`);
      }
    } catch {
      message.error(`Có lỗi khi ${isReassignMode ? "phân công lại" : "phân công"}`);
    } finally {
      setBulkAssignSubmitting(false);
    }
  };

  const handleSingleSelfAssign = async (record: PlatformManageListType) => {
    if (!currentUser?.id) {
      message.warning("Vui lòng đăng nhập để thực hiện tác vụ");
      return;
    }
    Modal.confirm({
      title: "Xác nhận nhận xử lý",
      content: `Bạn có chắc muốn nhận tự xử lý hồ sơ: "${record.name}"?`,
      okText: "Nhận xử lý",
      cancelText: "Huỷ",
      onOk: async () => {
        dispatch(setIsLoading(true));
        try {
          const response = await platformManageService.assignProcessing(
            [record.id],
            currentUser.id,
            currentUser.name || ""
          );
          if (response.status) {
            message.success("Nhận xử lý hồ sơ thành công");
            await handleLoadData();
          } else {
            message.error(response.message || "Nhận xử lý thất bại");
          }
        } catch {
          message.error("Có lỗi khi nhận xử lý hồ sơ");
        } finally {
          dispatch(setIsLoading(false));
        }
      },
    });
  };

  const isValidTransitionFlow = (currentStatus: number, targetStatus: number): boolean => {
    switch (targetStatus) {
      case PlatformStatusConstant.ChoDuyet:
        return ([
          PlatformStatusConstant.TamLuu,
          PlatformStatusConstant.DeNghiChinhSua,
          PlatformStatusConstant.CanBoSungThongTin,
        ] as number[]).includes(currentStatus);
      case PlatformStatusConstant.DaDuyetDienTu:
        return ([
          PlatformStatusConstant.ChoDuyet,
          PlatformStatusConstant.DangXinYKien,
        ] as number[]).includes(currentStatus);
      case PlatformStatusConstant.CanBoSungThongTin:
        return ([
          PlatformStatusConstant.ChoDuyet,
          PlatformStatusConstant.DangXinYKien,
          PlatformStatusConstant.DaDuyetDienTu,
          PlatformStatusConstant.CanBanGiay,
          PlatformStatusConstant.DaReview,
        ] as number[]).includes(currentStatus);
      case PlatformStatusConstant.BiTuChoi:
        return ([
          PlatformStatusConstant.ChoDuyet,
          PlatformStatusConstant.DangXinYKien,
          PlatformStatusConstant.DaDuyetDienTu,
          PlatformStatusConstant.CanBanGiay,
          PlatformStatusConstant.DaReview,
        ] as number[]).includes(currentStatus);
      case PlatformStatusConstant.DaReview:
        return ([
          PlatformStatusConstant.ChoDuyet,
          PlatformStatusConstant.DaDuyetDienTu,
          PlatformStatusConstant.CanBanGiay,
        ] as number[]).includes(currentStatus);
      case PlatformStatusConstant.DaXacNhan:
        return ([
          PlatformStatusConstant.ChoDuyet,
          PlatformStatusConstant.DaDuyetDienTu,
          PlatformStatusConstant.DaReview,
        ] as number[]).includes(currentStatus);
      default:
        return false;
    }
  };

  const handleBulkTransition = async (targetStatus: number, targetStatusName: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một hồ sơ");
      return;
    }

    const selectedRecords = data?.items?.filter((item) => selectedRowKeys.includes(item.id)) ?? [];

    const unassignedRecords = selectedRecords.filter(
      (item) => item.status === PlatformStatusConstant.ChoDuyet && !item.reviewName?.trim()
    );

    if (unassignedRecords.length > 0) {
      const unassignedNames = unassignedRecords.map((r) => `"${r.name}"`).join(", ");
      message.error(
        `Không thể thực hiện tác vụ. Một số hồ sơ chưa được tiếp nhận rà soát. Vui lòng nhận rà soát hoặc phân công chuyên viên trước khi xử lý: ${unassignedNames}`
      );
      return;
    }

    const invalidRecords = selectedRecords.filter(
      (item) => !isValidTransitionFlow(item.status, targetStatus) ||
        (targetStatus === PlatformStatusConstant.BiTuChoi && item.status === PlatformStatusConstant.DeNghiChamDutDangKy)
    );

    if (invalidRecords.length > 0) {
      const invalidNames = invalidRecords.map((r) => `"${r.name}" (${PlatformStatusConstant.getDisplayName(r.status)})`).join(", ");
      message.error(
        `Không thể thực hiện tác vụ. Một số hồ sơ có trạng thái hiện tại không được phép chuyển sang [${targetStatusName}]: ${invalidNames}`
      );
      return;
    }

    const needsNote =
      targetStatus === PlatformStatusConstant.BiTuChoi ||
      targetStatus === PlatformStatusConstant.CanBoSungThongTin;

    if (needsNote) {
      setBulkTransitionModal({
        visible: true,
        targetStatus,
        targetStatusName,
      });
    } else {
      Modal.confirm({
        title: `Xác nhận chuyển trạng thái hàng loạt sang [${targetStatusName}]`,
        content: `Bạn có chắc muốn chuyển đổi trạng thái của ${selectedRowKeys.length} hồ sơ đã chọn sang [${targetStatusName}]?`,
        okText: "Xác nhận",
        cancelText: "Hủy",
        onOk: async () => {
          const isRequireSign = isDoanhNghiep ? isSignNenTang : !!currentUser?.isKySo;
          if (isRequireSign) {
            setPendingTransition({
              ids: selectedRowKeys as string[],
              targetStatus,
              note: "",
              successMessage: "Ký số và chuyển trạng thái hàng loạt thành công",
            });
            setSignIds(selectedRowKeys as string[]);
            setIsSignModalOpen(true);
          } else {
            dispatch(setIsLoading(true));
            try {
              const response = await platformManageService.bulkTransition({
                ids: selectedRowKeys as string[],
                targetStatus,
                note: "",
              });

              if (response.status) {
                message.success(response.message || "Chuyển trạng thái hàng loạt thành công");
                setSelectedRowKeys([]);
                await handleLoadData();
              } else {
                if (response.data && response.data.length > 0) {
                  Modal.error({
                    title: "Chi tiết lỗi chuyển trạng thái hàng loạt",
                    content: (
                      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {response.data.map((err, idx) => (
                          <div key={idx} style={{ color: "#ef4444", marginBottom: 6 }}>
                            • {err}
                          </div>
                        ))}
                      </div>
                    ),
                  });
                } else {
                  message.error(response.message || "Tác vụ hàng loạt thất bại");
                }
              }
            } catch {
              message.error("Đã xảy ra lỗi hệ thống khi chuyển trạng thái hàng loạt");
            } finally {
              dispatch(setIsLoading(false));
            }
          }
        },
      });
    }
  };

  const handleBulkTransitionSubmit = async (values: { note: string }) => {
    dispatch(setIsLoading(true));
    try {
      const response = await platformManageService.bulkTransition({
        ids: selectedRowKeys as string[],
        targetStatus: bulkTransitionModal.targetStatus,
        note: values.note,
      });

      if (response.status) {
        message.success(response.message || "Chuyển trạng thái hàng loạt thành công");
        setSelectedRowKeys([]);
        setBulkTransitionModal({ visible: false, targetStatus: 0, targetStatusName: "" });
        bulkTransitionForm.resetFields();
        await handleLoadData();
      } else {
        if (response.data && response.data.length > 0) {
          Modal.error({
            title: "Chi tiết lỗi chuyển trạng thái hàng loạt",
            content: (
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {response.data.map((err, idx) => (
                  <div key={idx} style={{ color: "#ef4444", marginBottom: 6 }}>
                    • {err}
                  </div>
                ))}
              </div>
            ),
          });
        } else {
          message.error(response.message || "Tác vụ hàng loạt thất bại");
        }
      }
    } catch {
      message.error("Đã xảy ra lỗi hệ thống khi chuyển trạng thái hàng loạt");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const response = await platformManageService.delete(confirmDeleteId);
    if (response.status) {
      message.success("Xoá thành công");
      handleLoadData();
    } else {
      message.error(response.message ?? "Xoá thất bại");
    }
    setConfirmDeleteId(null);
  };

  const handleApprovalAction = async (
    recordId: string,
    targetStatus: number,
    note: string,
    successMessage: string
  ) => {
    const isRequireSign = isDoanhNghiep ? isSignNenTang : !!currentUser?.isKySo;
    console.log("currentUser", currentUser);
    if (isRequireSign) {
      setPendingTransition({
        id: recordId,
        targetStatus,
        note,
        successMessage,
      });
      setSignIds([recordId]);
      setIsSignModalOpen(true);
    } else {
      dispatch(setIsLoading(true));
      try {
        const res = await platformManageService.transition({
          id: recordId,
          targetStatus,
          note,
        });
        if (res.status) {
          message.success(successMessage);
          handleLoadData();
        } else {
          message.error(res.message ?? "Thao tác thất bại");
        }
      } catch (error: any) {
        message.error(error?.message || "Lỗi khi xử lý hồ sơ");
      } finally {
        dispatch(setIsLoading(false));
      }
    }
  };

  const renderText = (value?: string | null) => value || "";

  const renderPlatformName = (_: unknown, record: PlatformManageListType) => {
    const src = buildFileServerUrl(record.imagePath);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {src ? (
          <Image
            src={src}
            alt={record.name ?? "Logo nền tảng"}
            width={36}
            height={36}
            style={{ objectFit: "contain", borderRadius: 6, flexShrink: 0 }}
            preview={{ mask: "Xem" }}
            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect fill='%23f5f5f5' width='36' height='36'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23bfbfbf' font-size='9'%3ENo img%3C/text%3E%3C/svg%3E"
          />
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: "#f1f5f9",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            —
          </div>
        )}
        <span>{renderText(record.name)}</span>
      </div>
    );
  };

  const renderDomain = (domain?: string | null) => {
    if (!domain) return "";
    const href = domain.startsWith("http") ? domain : `https://${domain}`;
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {domain}
      </a>
    );
  };


  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      // 1. Submit signatures to the backend
      const responseSign = await platformManageService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      // 2. Perform the workflow status update
      const targetStatus = pendingTransition ? pendingTransition.targetStatus : PlatformStatusConstant.ChoDuyet;
      const note = pendingTransition ? pendingTransition.note : "Gửi duyệt từ danh sách";
      const successMsg = pendingTransition ? pendingTransition.successMessage : "Ký số và gửi duyệt hồ sơ thành công";

      let res;
      if (pendingTransition?.ids && pendingTransition.ids.length > 0) {
        res = await platformManageService.bulkTransition({
          ids: pendingTransition.ids,
          targetStatus: targetStatus,
          note: note,
        });
      } else {
        res = await platformManageService.transition({
          id: result[0].id,
          targetStatus: targetStatus,
          note: note,
        });
      }

      if (res.status) {
        message.success(successMsg);
        setSelectedRowKeys([]);
        handleLoadData();
      } else {
        message.error(res.message ?? "Thao tác thất bại");
      }

    } catch (error: any) {
      message.error(error?.message || "Lỗi trong quá trình ký số và duyệt hồ sơ");
    } finally {
      setIsSignModalOpen(false);
      setCurrentSignAction(null);
      setPendingTransition(null);
    }
  };

  let columns: TableProps<PlatformManageListType>["columns"] = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_: any, __: any, index: number) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Tên nền tảng",
      key: "platform_name",
      width: 320,
      align: "left" as const,
      render: (_: any, record: PlatformManageListType) => {
        const src = buildFileServerUrl(record.imagePath);
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

              {!isDoanhNghiep && record.isNenTangLon === true && (
                <div style={{ marginTop: 2 }}>
                  <Tag color="red" style={{ fontSize: "10px", lineHeight: "14px", padding: "0 6px", borderRadius: 4, margin: 0 }}>
                    Nền tảng số lớn
                  </Tag>
                </div>
              )}
              {(() => {
                if (isDoanhNghiep && record.status !== PlatformStatusConstant.CanBoSungThongTin) return null;
                const deadline = isDoanhNghiep ? record.dateLineEnterprise : record.dateLine;
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
    ...(!isDoanhNghiep ? [{
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
    }] : []),
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      align: "center",
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
          <Tag color={color} style={{ borderRadius: 4, padding: "2px 8px", fontWeight: 500, margin: 0 }}>
            {text}
          </Tag>
        );
      },
    },
    ...(!isDoanhNghiep ? [
      {
        title: "Người xử lý",
        dataIndex: "reviewName",
        width: 160,
        align: "center" as const,
        ellipsis: true,
        render: (name: string | null, record: PlatformManageListType) => {
          const trimmedName = name?.trim();
          if (trimmedName) {
            return trimmedName;
          }

          const canClaim = !isDoanhNghiep && canReceiveRecord(record) && canActionNhanTuXuLy;
          if (canClaim) {
            return (
              <Button
                type="primary"
                
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a", fontSize: "12px", fontWeight: 600, borderRadius: "4px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSingleSelfAssign(record);
                }}
              >
                Nhận rà soát
              </Button>
            );
          }

          return "";
        },
      }
    ] : []),
    {
      title: "Thời gian xử lý",
      key: "progress",
      width: 220,
      align: "left" as const,
      render: (_: any, record: PlatformManageListType) => {
        const createdStr = record.createdDate ? formatDate(record.createdDate) : "—";
        const submitStr = record.submitDate ? formatDate(record.submitDate) : null;
        const reviewStr = record.reviewDate ? formatDate(record.reviewDate) : null;
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

    // {
    //   title: "Đồng bộ DVC",
    //   key: "dvc_sync",
    //   width: 140,
    //   align: "center" as const,
    //   render: (_: any, record: PlatformManageListType) => {
    //     if (record.status !== PlatformStatusConstant.DaXacNhan) return null;
    //     let color = "default";
    //     let text = "Chưa đồng bộ";
    //     switch (record.dvcSyncStatus) {
    //       case 1:
    //         color = "blue";
    //         text = "Đang đồng bộ";
    //         break;
    //       case 2:
    //         color = "green";
    //         text = "Đã đồng bộ";
    //         break;
    //       case 3:
    //         color = "red";
    //         text = "Lỗi đồng bộ";
    //         break;
    //     }
    //     return (
    //       <Tooltip title={record.dvcErrorMessage || (record.dvcMaHoSo ? `Mã hồ sơ: ${record.dvcMaHoSo}` : "")}>
    //         <Tag color={color} style={{ borderRadius: 4, margin: 0 }}>
    //           {text}
    //         </Tag>
    //       </Tooltip>
    //     );
    //   },
    // },

    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
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

        if (canMarkBigPlatform && record.status !== PlatformStatusConstant.DaChamDutDangKy) {
          items.push(
            { type: "divider" },
            {
              label: record.isNenTangLon ? "Hủy đánh dấu nền tảng lớn" : "Đánh dấu nền tảng lớn",
              key: "mark_big_platform",
              icon: record.isNenTangLon ? <StarFilled style={{ color: "#d97706" }} /> : <StarOutlined style={{ color: "#d97706" }} />,
              onClick: () => {
                Modal.confirm({
                  title: record.isNenTangLon ? "Xác nhận hủy đánh dấu" : "Xác nhận đánh dấu nền tảng lớn",
                  content: record.isNenTangLon
                    ? `Bạn có chắc chắn muốn hủy đánh dấu hồ sơ "${record.name}" là nền tảng số lớn không?`
                    : `Bạn có chắc chắn muốn đánh dấu hồ sơ "${record.name}" là nền tảng số lớn không?`,
                  okText: "Xác nhận",
                  cancelText: "Huỷ",
                  onOk: async () => {
                    dispatch(setIsLoading(true));
                    try {
                      const res = await platformManageService.markBigPlatform({
                        id: record.id,
                        isBig: !record.isNenTangLon,
                        note: record.isNenTangLon ? "Hủy đánh dấu nền tảng số lớn" : "Đánh dấu nền tảng số lớn",
                      });
                      if (res.status) {
                        message.success("Cập nhật trạng thái nền tảng thành công");
                        handleLoadData();
                      } else {
                        message.error(res.message ?? "Thao tác thất bại");
                      }
                    } catch {
                      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
                    } finally {
                      dispatch(setIsLoading(false));
                    }
                  }
                });
              }
            }
          );
        }

        // Doanh nghiệp được sửa/gửi duyệt khi hồ sơ ở trạng thái nháp/cần chỉnh sửa
        const canEdit =
          isDoanhNghiep &&
          (record.status === PlatformStatusConstant.TamLuu ||
            record.status === PlatformStatusConstant.CanBoSungThongTin ||
            record.status === PlatformStatusConstant.DaXacNhan);

        const canSubmit =
          isDoanhNghiep &&
          (record.status === PlatformStatusConstant.TamLuu ||
            record.status === PlatformStatusConstant.CanBoSungThongTin);

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
              onClick: () => {
                if (isSignNenTang) {
                  setSignIds([record.id]);
                  setIsSignModalOpen(true);
                  return;
                }

                Modal.confirm({
                  title: "Xác nhận gửi duyệt",
                  content:
                    "Bạn có chắc chắn muốn gửi hồ sơ này lên hệ thống với trạng thái Chờ duyệt?",
                  okText: "Gửi duyệt",
                  cancelText: "Huỷ",
                  onOk: async () => {
                    const res = await platformManageService.transition({
                      id: record.id,
                      targetStatus: PlatformStatusConstant.ChoDuyet,
                      note: "Gửi duyệt từ danh sách",
                    });

                    if (res.status) {
                      message.success("Gửi duyệt hồ sơ thành công");
                      handleLoadData();
                    } else {
                      message.error(res.message ?? "Thao tác thất bại");
                    }
                  },
                });
              },
            }
          );
        }

        //rebuild
        // Doanh nghiệp đã được xác nhận: có thể đề nghị chỉnh sửa hoặc chấm dứt
        if (isDoanhNghiep && record.status === PlatformStatusConstant.DaXacNhan) {
          items.push(
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
                  }
                });
              }
            }
          );
        }

        // Administrative Transitions
        const isRecordAssigned = !!record.reviewName?.trim();
        const isAssignedToMe = !!currentUser?.id && record.reviewId === currentUser.id;
        const canCvProcess = isRecordAssigned && (isAssignedToMe || isAdmin);

        if (record.status === PlatformStatusConstant.ChoDuyet || record.status === PlatformStatusConstant.DeNghiChinhSua) {
          if (canActionPhanCong) {
            items.push(
              { type: "divider" },
              {
                label: isRecordAssigned ? "Phân công lại" : "Phân công xử lý",
                key: "assign",
                icon: <UserAddOutlined style={{ color: "#0355a2" }} />,
                onClick: () => handleOpenAssignModal(record),
              },
            );
          }

          if (canCvProcess) {
            if (canActionPheDuyet) {
              items.push(
                { type: "divider" },
                {
                  label: "Duyệt kết thúc",
                  key: "cv_approve_end",
                  icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Duyệt kết thúc",
                      content: "Xác nhận duyệt kết thúc hồ sơ tại bước chuyên viên?",
                      onOk: async () => {
                        await handleApprovalAction(
                          record.id,
                          PlatformStatusConstant.DaXacNhan,
                          "Chuyên viên duyệt kết thúc hồ sơ",
                          "Duyệt kết thúc hồ sơ thành công"
                        );
                      },
                    });
                  },
                }
              );
            }

            if (canActionDuyetDienTu) {
              items.push(
                { type: "divider" },
                {
                  label: "Trình Trưởng phòng",
                  key: "cv_submit_tp",
                  icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Trình Trưởng phòng",
                      content: "Xác nhận chuyển hồ sơ lên Trưởng phòng xử lý?",
                      onOk: async () => {
                        await handleApprovalAction(
                          record.id,
                          PlatformStatusConstant.DaDuyetDienTu,
                          "Chuyên viên trình Trưởng phòng xử lý",
                          "Trình Trưởng phòng thành công"
                        );
                      },
                    });
                  },
                },
                {
                  label: "Trình Lãnh đạo sở",
                  key: "cv_submit_ld",
                  icon: <FileDoneOutlined style={{ color: "#3b82f6" }} />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Trình Lãnh đạo sở",
                      content: "Xác nhận chuyển hồ sơ lên Lãnh đạo sở xử lý?",
                      onOk: async () => {
                        await handleApprovalAction(
                          record.id,
                          PlatformStatusConstant.DaDuyetDienTu,
                          "Chuyên viên trình Lãnh đạo sở xử lý",
                          "Trình Lãnh đạo sở thành công"
                        );
                      },
                    });
                  },
                }
              );
            }

            if (canActionBoSungCV) {
              items.push(
                { type: "divider" },
                {
                  label: "Yêu cầu bổ sung",
                  key: "cv_request_more",
                  icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
                  onClick: () => {
                    setTransitionModal({
                      recordId: record.id,
                      targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                      title: "Yêu cầu bổ sung thông tin chỉnh sửa",
                      buttonColor: "warning",
                    });
                  }
                }
              );
            }
          }
        }

        if (record.status === PlatformStatusConstant.DaDuyetDienTu) {
          const isOwnSpecialist = isAssignedToMe && !isAdmin;
          if (canActionReviewThongQua && !isOwnSpecialist) {
            items.push(
              { type: "divider" },
              {
                label: "Đã review (Trình Lãnh đạo)",
                key: "tp_submit_ld",
                icon: <FileDoneOutlined style={{ color: "#3b82f6" }} />,
                onClick: () => {
                  Modal.confirm({
                    title: "Đã review (Trình Lãnh đạo)",
                    content: "Bạn có chắc muốn trình hồ sơ này lên Lãnh đạo phê duyệt?",
                    onOk: async () => {
                      await handleApprovalAction(
                        record.id,
                        PlatformStatusConstant.DaReview,
                        "Trưởng phòng trình Lãnh đạo",
                        "Trình Lãnh đạo sở thành công"
                      );
                    },
                  });
                },
              }
            );
          }

          if (canActionPheDuyet && !isOwnSpecialist) {
            items.push(
              { type: "divider" },
              {
                label: "Duyệt kết thúc",
                key: "tp_approve_publish",
                icon: <AuditOutlined style={{ color: "#854d0e" }} />,
                onClick: () => {
                  Modal.confirm({
                    title: "Duyệt kết thúc",
                    content: "Bạn có chắc muốn duyệt kết thúc hồ sơ tại bước Trưởng phòng?",
                    onOk: async () => {
                      await handleApprovalAction(
                        record.id,
                        PlatformStatusConstant.DaXacNhan,
                        "Trưởng phòng duyệt kết thúc hồ sơ",
                        "Duyệt kết thúc hồ sơ thành công"
                      );
                    },
                  });
                },
              }
            );
          }

          if (canActionBoSungTP && !isOwnSpecialist) {
            items.push(
              { type: "divider" },
              {
                label: "Yêu cầu bổ sung",
                key: "tp_request_more",
                icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
                onClick: () => {
                  setTransitionModal({
                    recordId: record.id,
                    targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                    title: "Yêu cầu bổ sung thông tin chỉnh sửa",
                    buttonColor: "warning",
                  });
                }
              }
            );
          }
        }

        if (record.status === PlatformStatusConstant.DaReview) {
          const isOwnSpecialist = isAssignedToMe && !isAdmin;
          if (canActionPheDuyet && !isOwnSpecialist) {
            items.push(
              { type: "divider" },
              {
                label: "Duyệt hồ sơ",
                key: "ld_approve_publish",
                icon: <AuditOutlined style={{ color: "#854d0e" }} />,
                onClick: () => {
                  Modal.confirm({
                    title: "Duyệt hồ sơ",
                    content: "Bạn có chắc muốn duyệt hồ sơ tại bước Lãnh đạo sở?",
                    onOk: async () => {
                      await handleApprovalAction(
                        record.id,
                        PlatformStatusConstant.DaXacNhan,
                        "Lãnh đạo sở duyệt hồ sơ",
                        "Duyệt hồ sơ thành công"
                      );
                    },
                  });
                },
              }
            );
          }

          if (canActionBoSungLD && !isOwnSpecialist) {
            items.push(
              { type: "divider" },
              {
                label: "Yêu cầu bổ sung",
                key: "ld_request_more",
                icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
                onClick: () => {
                  setTransitionModal({
                    recordId: record.id,
                    targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                    title: "Yêu cầu bổ sung thông tin chỉnh sửa",
                    buttonColor: "warning",
                  });
                }
              }
            );
          }
        }

        if (record.status === PlatformStatusConstant.DeNghiChamDutDangKy) {
          if (canActionChamDut) {
            items.push(
              { type: "divider" },
              {
                label: "Xác nhận chấm dứt",
                key: "confirm_termination",
                icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
                onClick: () => {
                  Modal.confirm({
                    title: "Xác nhận chấm dứt",
                    content: "Bạn có chắc muốn xác nhận chấm dứt hoạt động nền tảng này?",
                    onOk: async () => {
                      await handleApprovalAction(
                        record.id,
                        PlatformStatusConstant.DaChamDutDangKy,
                        "Cán bộ xác nhận chấm dứt",
                        "Đã xác nhận chấm dứt thành công"
                      );
                    }
                  });
                }
              }
            );
          }
        }

        if (record.status === PlatformStatusConstant.DangXinYKien) {
          const cvCanProcess = isAssignedToMe || isAdmin;
          if (cvCanProcess) {
            if (canActionDuyetDienTu) {
              items.push(
                { type: "divider" },
                {
                  label: "Duyệt điện tử",
                  key: "approve_opinion",
                  icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Duyệt điện tử",
                      content: "Bạn có chắc muốn duyệt điện tử hồ sơ này?",
                      onOk: async () => {
                        await handleApprovalAction(
                          record.id,
                          PlatformStatusConstant.DaDuyetDienTu,
                          "Duyệt điện tử từ trạng thái Đang xin ý kiến",
                          "Duyệt điện tử thành công"
                        );
                      }
                    });
                  },
                }
              );
            }
            if (canActionBoSungCV) {
              items.push(
                { type: "divider" },
                {
                  label: "Yêu cầu bổ sung thông tin",
                  key: "bosung_opinion",
                  icon: <ExclamationCircleOutlined style={{ color: "#d97706" }} />,
                  onClick: () => {
                    setTransitionModal({
                      recordId: record.id,
                      targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                      title: "Yêu cầu bổ sung thông tin",
                      buttonColor: "warning",
                    });
                  },
                }
              );
            }
          }
        }



        if (record.status === PlatformStatusConstant.CanBanGiay) {
          const isOwnSpecialist = isAssignedToMe && !isAdmin;
          if (!isOwnSpecialist) {
            if (canActionReviewThongQua) {
              items.push(
                { type: "divider" },
                {
                  label: "Đã review",
                  key: "nhangiay_tp",
                  icon: <FileDoneOutlined style={{ color: "#3b82f6" }} />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Xác nhận đã nhận bản giấy đối chiếu",
                      content: "Xác nhận đã nhận bản giấy đối chiếu và trình lên Lãnh đạo?",
                      onOk: async () => {
                        await handleApprovalAction(
                          record.id,
                          PlatformStatusConstant.DaReview,
                          "Trưởng phòng xác nhận đã nhận bản giấy, trình Lãnh đạo",
                          "Trình Lãnh đạo sở thành công"
                        );
                      }
                    });
                  },
                }
              );
            }
          }
        }

        const canRejectAny = canActionTuChoiCV || canActionTuChoiTP || canActionTuChoiLD;
        const isNotTerminal = record.status !== PlatformStatusConstant.DaXacNhan &&
          record.status !== PlatformStatusConstant.BiTuChoi &&
          record.status !== PlatformStatusConstant.TamLuu &&
          record.status !== PlatformStatusConstant.CanBoSungThongTin;

        if (canRejectAny && isNotTerminal && record.status != PlatformStatusConstant.DeNghiChamDutDangKy && record.status != PlatformStatusConstant.DaChamDutDangKy) {
          items.push(
            { type: "divider" },
            {
              label: record.status === PlatformStatusConstant.DeNghiChinhSua ? "Từ chối đề nghị chỉnh sửa" : "Từ chối",
              key: "reject_any",
              danger: true,
              icon: <CloseCircleOutlined />,
              onClick: () => {
                setTransitionModal({
                  recordId: record.id,
                  targetStatus: PlatformStatusConstant.BiTuChoi,
                  title: record.status === PlatformStatusConstant.DeNghiChinhSua ? "Từ chối đề nghị chỉnh sửa" : "Từ chối hồ sơ",
                });
              },
            }
          );
        }

        // Delete action
        const canDelete = record.status === PlatformStatusConstant.TamLuu || (isAdmin);
        if (canDelete) {
          items.push(
            { type: "divider" },
            {
              label: "Xoá hồ sơ",
              key: "delete",
              danger: true,
              icon: <DeleteOutlined />,
              onClick: () => setConfirmDeleteId(record.id),
            }
          );
        }

        // Development status update action
        if (isDevEnv) {
          items.push(
            { type: "divider" },
            {
              label: "Cập nhật trạng thái (DEV)",
              key: "dev_update_status",
              icon: <ToolOutlined style={{ color: "#8b5cf6" }} />,
              onClick: () => {
                setDevStatusModal({
                  recordIds: [record.id],
                  currentStatus: record.status,
                });
                devStatusForm.setFieldsValue({
                  targetStatus: record.status,
                  note: "Cập nhật trạng thái trực tiếp phục vụ mục đích test (Dev Mode)",
                });
              },
            }
          );
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

  if (mappedStatus !== null && columns) {
    columns = columns.filter((col) => !(col && "dataIndex" in col && col.dataIndex === "status"));
  }

  // if (isDoanhNghiep) {
  //   columns = columns.filter((col) => col.key !== "company_info");
  // }



  const totalRecords = Object.values(statusCounts).reduce((sum, c) => sum + c, 0);

  const tabItems = allowedStatusTabs.map((tab) => {
    const count =
      tab.key === "All"
        ? totalRecords
        : statusCounts[tab.statusValue!] ?? 0;
    const isActive = activeTabKey === tab.key;
    return {
      key: tab.key,
      label: (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            color: isActive ? tab.color : undefined,
            transition: "color 0.2s",
          }}
        >
          <span style={{ fontSize: 15, color: isActive ? tab.color : "#8c8c8c" }}>
            {tab.icon}
          </span>
          <span style={{ fontWeight: isActive ? 600 : 500 }}>{tab.label}</span>
          <Badge
            count={count}
            overflowCount={9999}
            showZero
            style={{
              backgroundColor: isActive ? tab.color : "#e8e8e8",
              color: isActive ? "#fff" : "#8c8c8c",
              fontWeight: 600,
              fontSize: 11,
              boxShadow: isActive ? `0 2px 6px ${tab.color}40` : "none",
              transition: "all 0.2s",
            }}
          />
        </span>
      ),
    };
  });

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    setPageIndex(1);
    setSelectedRowKeys([]);
  };

  // if (isOpenModal) {
  //   return (
  //     <>
  //       <div className="mb-4">
  //         <AutoBreadcrumb
  //           items={[
  //             { title: "Nền tảng", href: "/QLPlatform" },
  //             { title: "Nền tảng trực tuyến", href: "/QLPlatform/NenTangTrucTuyen" },
  //             { title: editId ? "Chỉnh sửa" : "Đăng ký" },
  //           ]}
  //         />
  //       </div>
  //       <CreateOrUpdate
  //         isOpen={isOpenModal}
  //         item={editId ? { id: editId } : null}
  //         onClose={handleClose}
  //         onSuccess={handleSuccess}
  //       />
  //     </>
  //   );
  // }

  return (
    <>
      <div
        className="mb-2 flex-wrap justify-content-end"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <AutoBreadcrumb
          items={[
            { title: "Nền tảng" },
            { title: "Nền tảng trực tuyến" },
          ]}
        />

        <div className="flex flex-row gap-x-2" style={{ alignItems: "center", gap: 12 }}>

          <Button
            onClick={() => setIsPanelVisible(!isPanelVisible)}
            type="primary"
            size="middle"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          {userRoles.includes(RoleConstant.DoanhNghiep) && (
            <Button
              type="primary"
              size="middle"
              icon={<PlusCircleOutlined />}
              onClick={handleShowModal}
            >
              Kê khai hồ sơ mới
            </Button>
          )}
        </div>
      </div >

      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          isDoanhNghiep={isDoanhNghiep}
          activeTabKey={activeTabKey}
          onExport={() => setIsExportModalOpen(true)}
        />
      )}

      {/* Tạm comment tabs trạng thái
      {trangThaiParam === null && (
        <Tabs
          activeKey={activeTabKey}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          className="mb-3"
        />
      )}
      */}

      {
        selectedRowKeys.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              border: "1px solid #bae6fd",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: "#0369a1",
                fontWeight: 600,
                marginRight: 4,
                whiteSpace: "nowrap",
              }}
            >
              Đã chọn <strong>{selectedRowKeys.length}</strong> hồ sơ
            </span>
            {isDoanhNghiep && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleBulkSubmit}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                Gửi duyệt hàng loạt
              </Button>
            )}
            {!isDoanhNghiep && canActionNhanTuXuLy && (
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleSelfAssign}
              >
                Nhận xử lý
              </Button>
            )}
            {!isDoanhNghiep && canActionPhanCong && (
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => handleBulkAssign(false)}
                style={{ backgroundColor: "#7c3aed", borderColor: "#7c3aed" }}
              >
                Phân công
              </Button>
            )}
            {!isDoanhNghiep && canActionPhanCong && (
              <Button
                type="default"
                icon={<UserAddOutlined />}
                onClick={() => handleBulkAssign(true)}
                style={{ borderColor: "#7c3aed", color: "#7c3aed" }}
              >
                Phân công lại
              </Button>
            )}
            {!isDoanhNghiep && canActionDuyetDienTu && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleBulkTransition(PlatformStatusConstant.DaDuyetDienTu, "Đã duyệt điện tử")}
                style={{ backgroundColor: "#22c55e", borderColor: "#22c55e" }}
              >
                Duyệt điện tử
              </Button>
            )}
            {!isDoanhNghiep && canActionReviewThongQua && (
              <Button
                type="primary"
                icon={<FileDoneOutlined />}
                onClick={() => handleBulkTransition(PlatformStatusConstant.DaReview, "Đã review")}
                style={{ backgroundColor: "#0284c7", borderColor: "#0284c7" }}
              >
                Đã review (Trình Lãnh đạo)
              </Button>
            )}
            {!isDoanhNghiep && canActionPheDuyet && (
              <Button
                type="primary"
                icon={<AuditOutlined />}
                onClick={() => handleBulkTransition(PlatformStatusConstant.DaXacNhan, "Đã xác nhận")}
                style={{ backgroundColor: "#16a34a", borderColor: "#16a34a" }}
              >
                Duyệt kết thúc
              </Button>
            )}
            {!isDoanhNghiep && (canActionTuChoiCV || canActionTuChoiTP || canActionTuChoiLD) && (
              <Button
                danger
                type="primary"
                icon={<StopOutlined />}
                onClick={() => handleBulkTransition(PlatformStatusConstant.BiTuChoi, "Từ chối")}
              >
                Từ chối
              </Button>
            )}
            {!isDoanhNghiep && (canActionBoSungCV || canActionBoSungTP || canActionBoSungLD) && (
              <Button
                type="primary"
                icon={<ExclamationCircleOutlined />}
                onClick={() => handleBulkTransition(PlatformStatusConstant.CanBoSungThongTin, "Yêu cầu bổ sung")}
                style={{ backgroundColor: "#eab308", borderColor: "#eab308" }}
              >
                Yêu cầu bổ sung
              </Button>
            )}
            {!isDoanhNghiep && canMarkBigPlatform && (
              <>
                <Button
                  type="primary"
                  icon={<StarFilled />}
                  onClick={() => handleBulkMarkBigPlatform(true)}
                  style={{ backgroundColor: "#d97706", borderColor: "#d97706" }}
                >
                  Đánh dấu nền tảng lớn
                </Button>
                <Button
                  type="default"
                  icon={<StarOutlined />}
                  onClick={() => handleBulkMarkBigPlatform(false)}
                  style={{ borderColor: "#d97706", color: "#d97706" }}
                >
                  Hủy đánh dấu nền tảng lớn
                </Button>
              </>
            )}
            {isDevEnv && (
              <Button
                type="default"
                icon={<ToolOutlined style={{ color: "#8b5cf6" }} />}
                onClick={() => {
                  setDevStatusModal({
                    recordIds: selectedRowKeys.map((k) => String(k)),
                  });
                  devStatusForm.setFieldsValue({
                    targetStatus: PlatformStatusConstant.ChoDuyet,
                    note: "Cập nhật trạng thái hàng loạt trực tiếp phục vụ mục đích test (Dev Mode)",
                  });
                }}
                style={{ borderColor: "#8b5cf6", color: "#8b5cf6" }}
              >
                Cập nhật trạng thái (DEV)
              </Button>
            )}
            <Button type="link" onClick={() => setSelectedRowKeys([])}>
              Bỏ chọn
            </Button>
          </div>
        )
      }



      {
        confirmDeleteId && (
          <Modal
            title="Xác nhận xoá"
            open
            onOk={handleDelete}
            onCancel={() => setConfirmDeleteId(null)}
            okText="Xoá"
            okButtonProps={{ danger: true }}
            cancelText="Huỷ"
          >
            <p>Bạn có chắc chắn muốn xoá nền tảng này?</p>
          </Modal>
        )
      }

      <TransitionModal
        open={transitionModal !== null}
        title={transitionModal?.title || ""}
        form={transitionForm}
        onCancel={() => {
          setTransitionModal(null);
          transitionForm.resetFields();
        }}
        onFinish={handleTransitionSubmit}
        groupedTemplates={groupedTemplates}
      />

      {
        devStatusModal && (
          <Modal
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6" }}>
                <ToolOutlined />
                <span>Cập nhật trạng thái {devStatusModal.recordIds.length > 1 ? `cho ${devStatusModal.recordIds.length} hồ sơ ` : ""} (DEV MODE)</span>
              </div>
            }
            open
            onOk={() => devStatusForm.submit()}
            onCancel={() => {
              setDevStatusModal(null);
              devStatusForm.resetFields();
            }}
            confirmLoading={devStatusSubmitting}
            okText="Xác nhận cập nhật"
            cancelText="Huỷ"
            okButtonProps={{
              style: { backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" }
            }}
          >
            <Form
              form={devStatusForm}
              onFinish={handleDevStatusSubmit}
              layout="vertical"
              style={{ marginTop: 16 }}
            >
              <Form.Item
                name="targetStatus"
                label="Trạng thái đích"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
              >
                <Select
                  placeholder="Chọn trạng thái mới"
                  options={PlatformStatusConstant.getDropdownListKey().map(item => ({
                    value: item.value,
                    label: (
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Badge color={PlatformStatusConstant.getColor(item.value)} />
                        {item.label}
                      </span>
                    )
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="note"
                label="Ý kiến xử lý / Ghi chú"
                rules={[{ required: true, message: "Vui lòng nhập lý do/ghi chú cập nhật!" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập lý do hoặc ghi chú phục vụ cho mục đích kiểm thử..."
                />
              </Form.Item>
            </Form>
          </Modal>
        )
      }

      {
        isAssignModalOpen && (
          <Modal
            title="Phân công xử lý"
            open
            onCancel={handleCloseAssignModal}
            onOk={() => assignForm.submit()}
            okText="Phân công"
            cancelText="Đóng"
            confirmLoading={assignSubmitting}
            destroyOnClose
          >
            <Form form={assignForm} layout="vertical" onFinish={handleAssignTask}>
              <Form.Item
                name="chuyenVienId"
                label="Chuyên viên xử lý"
                rules={[{ required: true, message: "Vui lòng chọn chuyên viên xử lý" }]}
              >
                <Select
                  placeholder="Chọn chuyên viên xử lý"
                  showSearch
                  allowClear
                  loading={specialistLoading}
                  options={specialistOptions}
                  notFoundContent={
                    specialistLoading ? "Đang tải..." : "Không có chuyên viên"
                  }
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Form>
          </Modal>
        )
      }


      {isBulkAssignModalOpen && (
        <Modal
          title={`${isReassignMode ? "Phân công lại" : "Phân công"} (${selectedRowKeys.length} hồ sơ)`}
          open
          onCancel={() => {
            setIsBulkAssignModalOpen(false);
            bulkAssignForm.resetFields();
          }}
          onOk={() => bulkAssignForm.submit()}
          okText="Phân công"
          cancelText="Đóng"
          confirmLoading={bulkAssignSubmitting}
          destroyOnClose
        >
          <p style={{ color: "#64748b", marginBottom: 12 }}>
            Chỉ các hồ sơ ở trạng thái <strong>Chờ duyệt</strong> mới có thể được {isReassignMode ? "phân công lại" : "phân công"}.
          </p>
          <Form form={bulkAssignForm} layout="vertical" onFinish={handleBulkAssignSubmit}>
            <Form.Item
              name="chuyenVienId"
              label="Chuyên viên xử lý"
              rules={[{ required: true, message: "Vui lòng chọn chuyên viên xử lý" }]}
            >
              <Select
                placeholder="Chọn chuyên viên xử lý"
                showSearch
                allowClear
                loading={specialistLoading}
                options={specialistOptions}
                notFoundContent={
                  specialistLoading ? "Đang tải..." : "Không có chuyên viên"
                }
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      )}

      <TransitionModal
        open={bulkTransitionModal.visible}
        title={`Xác nhận chuyển trạng thái hàng loạt sang [${bulkTransitionModal.targetStatusName}] (${selectedRowKeys.length} hồ sơ)`}
        form={bulkTransitionForm}
        onCancel={() => {
          setBulkTransitionModal({ visible: false, targetStatus: 0, targetStatusName: "" });
          bulkTransitionForm.resetFields();
        }}
        onFinish={handleBulkTransitionSubmit}
        groupedTemplates={groupedTemplates}
      />

      <Modal
        title="Chọn các trường thông tin cần kết xuất"
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        onOk={handleExportExcel}
        okText="Xuất file"
        cancelText="Đóng"
        width={650}
      >
        <div style={{ marginBottom: 16 }}>
          <Checkbox
            checked={exportFields.length === EXPORT_FIELDS.length}
            indeterminate={exportFields.length > 0 && exportFields.length < EXPORT_FIELDS.length}
            onChange={(e) => {
              if (e.target.checked) {
                setExportFields(EXPORT_FIELDS.map(f => f.key));
              } else {
                setExportFields([]);
              }
            }}
          >
            Chọn tất cả
          </Checkbox>
        </div>
        <Row gutter={[16, 12]}>
          {EXPORT_FIELDS.map((field) => (
            <Col span={12} key={field.key}>
              <Checkbox
                checked={exportFields.includes(field.key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setExportFields([...exportFields, field.key]);
                  } else {
                    setExportFields(exportFields.filter((k) => k !== field.key));
                  }
                }}
              >
                {field.label}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Modal>

      <Card className="customCardShadow">
        <div className="table-responsive">
          <Table
            size="middle"
            columns={columns}
            bordered
            dataSource={data?.items}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              fixed: true,
              // getCheckboxProps: (record) => {
              //   const isDN = isDoanhNghiep || (!isChuyenVien && !isTruongPhongSo && !isLanhDaoSo);
              //   const disabled = isDN ? !canSubmitRecord(record) : !canReceiveRecord(record);
              //   return { disabled };
              // },
            }}
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
        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
        >
          <Pagination
            total={data?.totalCount}
            current={pageIndex}
            pageSize={pageSize}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} dữ liệu`
            }
            onChange={(p) => setPageIndex(p)}
            onShowSizeChange={(c, s) => {
              setPageIndex(c);
              setPageSize(s);
            }}
            align="end"
          />
        </div>
      </Card>

      {/* ký số */}
      <DigitalSignatureModal
        ids={signIds}
        open={isSignModalOpen}
        onCancel={() => {
          setIsSignModalOpen(false);
          setPendingTransition(null);
        }}
        onSignSuccess={handleSignSuccess}
        signerService={platformManageService}
      />
    </>
  );
};

export default withAuthorization(NenTangTrucTuyenPage, "");