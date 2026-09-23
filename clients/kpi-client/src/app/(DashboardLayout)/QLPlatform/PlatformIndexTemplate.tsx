"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Tooltip,
} from "antd";
import userService from "@/services/user/user.service";
import {
  AppstoreOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CommentOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileDoneOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  StopOutlined,
  UserAddOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "@/store/hooks";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { PagedList } from "@/types/general";
import { PlatformManageListType } from "@/types/platformManage/dto";
import { PlatformManageSearchType } from "@/types/platformManage/request";
import platformManageService from "@/services/platformManage/platformManage.service";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import RoleConstant from "@/constants/RoleConstant";
import formatDate from "@/utils/formatDate";
import { buildFileUrl } from "@/utils/file";
import Search from "./search";
import PlatformManageDetail from "./NenTangTrucTuyen/detail";
import withAuthorization from "@/libs/authentication";
import TransitionModal from "@/components/shared-components/TransitionModal";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { useRouter, useSearchParams } from "next/navigation";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { CertificateInfo, SignResultItem } from "@/libs/moit-sign/types";

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


interface PlatformIndexTemplateProps {
  platformType: "NTThongBaoKD" | "NTDangKyKDNuocNgoai" | "NTTichHop" | "NTTichHopNuocNgoai";
  title: string;
  specialistRole?: string; // Role chuyên viên phân công: ChuyenVienSo (default) hoặc ChuyenVienCuc
}

const PlatformIndexTemplate: React.FC<PlatformIndexTemplateProps> = ({
  platformType,
  title,
  specialistRole = RoleConstant.ChuyenVienSo,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trangThaiParam = searchParams.get("TrangThai");
  const mappedStatus = getStatusFromParam(trangThaiParam);

  const dispatch = useDispatch();
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.includes(RoleConstant.Admin);
  const isLocalHost = typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const isDevEnv = process.env.NODE_ENV === "development" || isLocalHost;
  const isChuyenVien = userRoles.includes(RoleConstant.ChuyenVienSo) || userRoles.includes(RoleConstant.ChuyenVienCuc);
  const isTruongPhongSo = userRoles.includes(RoleConstant.TruongPhongSo) || userRoles.includes(RoleConstant.TruongPhongCuc);
  const isLanhDaoSo = userRoles.includes(RoleConstant.LanhDaoSo) || userRoles.includes(RoleConstant.LanhDaoCuc);
  const loading = useSelector((s) => s.general.isLoading);

  const isCV = isChuyenVien || isAdmin;
  const isTP = isTruongPhongSo || isAdmin;
  const isLD = isLanhDaoSo || isAdmin;
  const isDN = userRoles.includes("DoanhNghiep") || isAdmin;

  const userOperationCodes: string[] = (currentUser?.menuData ?? [])
    .flatMap((module: any) => module.listMenu ?? [])
    .map((op: any) => op.code as string);
  const hasPermission = (code: string) => isAdmin || userOperationCodes.includes(code);


  // Chuyên viên
  const canActionNhanTuXuLy = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_NHANTUXULY");
  const canActionDuyetDienTu = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_DUYETDIENTU");
  const canActionBoSungCV = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_CV");
  const canActionXinYKien = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_XINYKIEN");
  const canActionTuChoiCV = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_CV");
  const canActionChamDut = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_CHAMDUT");
  const canActionChoDuyetCV = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_CHODUYET_CV");

  // Trưởng phòng
  const canActionPhanCong = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_PHANCONG");
  const canActionReviewThongQua = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_REVIEWTHONGQUA");
  const canActionYeuCauBanGiay = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_YEUCAUBANGIAY");
  const canActionBoSungTP = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_TP");
  const canActionTuChoiTP = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_TP");

  // Lãnh đạo
  const canActionPheDuyet = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_PHEDUYET");
  const canActionBoSungLD = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_LD");
  const canActionTuChoiLD = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_LD");
  const canMarkBigPlatform = canActionPheDuyet || canActionDuyetDienTu || canActionReviewThongQua;
  const [data, setData] = useState<PagedList<PlatformManageListType>>();
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [searchValues, setSearchValues] =
    useState<PlatformManageSearchType | null>(null);
  const [specialistOptions, setSpecialistOptions] = useState<{ value: string; label: string }[]>([]);
  const [specialistLoading, setSpecialistLoading] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignRecord, setAssignRecord] = useState<PlatformManageListType | null>(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignForm] = Form.useForm<{ chuyenVienId: string }>();
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("All");
  const [statusCounts, setStatusCounts] = useState<{ [key: number]: number }>({});

  const [transitionModal, setTransitionModal] = useState<{
    recordId: string;
    targetStatus: number;
    title: string;
    buttonColor?: "primary" | "danger" | "warning";
  } | null>(null);
  const [transitionSubmitting, setTransitionSubmitting] = useState(false);
  const [transitionForm] = Form.useForm<{ note: string }>();
  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);
  const [isSignDoanhNghiep, setIsSignDoanhNghiep] = useState<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [pendingTransition, setPendingTransition] = useState<{
    id?: string;
    ids?: string[];
    targetStatus: number;
    note: string;
    successMessage: string;
  } | null>(null);

  const latestRequestKeyRef = useRef<string>("");

  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [devTargetStatus, setDevTargetStatus] = useState<number | null>(null);
  const [devNote, setDevNote] = useState<string>("Cập nhật hàng loạt (Dev Mode)");
  const [devSubmitting, setDevSubmitting] = useState(false);

  const handleDevBulkUpdate = async () => {
    if (selectedRowKeys.length === 0 || devTargetStatus === null) return;
    setDevSubmitting(true);
    try {
      const response = await platformManageService.platformDevBulkUpdateStatus({
        ids: selectedRowKeys as string[],
        targetStatus: devTargetStatus,
        note: devNote || "Cập nhật hàng loạt (Dev Mode)",
      });
      if (response.status) {
        message.success(`Đã cập nhật trạng thái (Dev) thành công cho ${selectedRowKeys.length} hồ sơ`);
        setIsDevModalOpen(false);
        setDevTargetStatus(null);
        setSelectedRowKeys([]);
        await handleLoadData();
      } else {
        message.error(response.message || "Cập nhật thất bại");
      }
    } catch {
      message.error("Lỗi hệ thống khi cập nhật trạng thái");
    } finally {
      setDevSubmitting(false);
    }
  };

  const handleApprovalAction = async (
    recordId: string,
    targetStatus: number,
    note: string,
    successMessage: string
  ) => {
    const isRequireSign = userRoles.includes("DoanhNghiep") ? isSignDoanhNghiep : !!currentUser?.isKySo;
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
        const res = await platformManageService.platformTransition({
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

  const handleLoadData = useCallback(
    async (override?: PlatformManageSearchType) => {
      const requestKey = Math.random().toString(36).substring(7);
      latestRequestKeyRef.current = requestKey;

      dispatch(setIsLoading(true));
      const cleaned = Object.fromEntries(
        Object.entries(searchValues || {}).filter(
          ([, v]) => v !== "" && v !== null && v !== undefined,
        ),
      );
      const search: PlatformManageSearchType = override ?? {
        pageIndex,
        pageSize,
        platformManageTypeId: platformType,
        ...cleaned
      };
      if (!override) {
        if (mappedStatus !== null) {
          search.status = mappedStatus;
        } else if (activeTabKey !== "All") {
          search.status = parseInt(activeTabKey, 10);
        }
      }

      const response = await platformManageService.getPlatformData(search);
      if (latestRequestKeyRef.current !== requestKey) {
        return;
      }
      if (response?.data) setData(response.data);

      // Fetch status counts
      // try {
      //   const countRes = await platformManageService.getPlatformStatusCounts({
      //     platformManageTypeId: platformType,
      //     ...(cleaned as PlatformManageSearchType),
      //   });
      //   if (latestRequestKeyRef.current !== requestKey) {
      //     return;
      //   }
      //   if (countRes?.data) {
      //     setStatusCounts(countRes.data);
      //   }
      // } catch {
      //   // silently ignore if endpoint not available yet
      // }

      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues, activeTabKey, platformType],
  );

  const loadGroupedTemplates = useCallback(async () => {
    try {
      const res = await mauTraLoiService.getGroupedTemplates();
      if (res.status && res.data) {
        setGroupedTemplates(res.data);
      }
    } catch (e) {
      console.error("Lỗi khi tải mẫu trả lời:", e);
    }
  }, []);

  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      dispatch(setIsLoading(true));
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
      const note = pendingTransition ? pendingTransition.note : "Cán bộ ký duyệt";
      const successMsg = pendingTransition ? pendingTransition.successMessage : "Ký duyệt thành công";

      let res;
      if (pendingTransition?.ids && pendingTransition.ids.length > 0) {
        res = await platformManageService.platformBulkTransition({
          ids: pendingTransition.ids,
          targetStatus: targetStatus,
          note: note,
        });
      } else {
        res = await platformManageService.platformTransition({
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
      setPendingTransition(null);
      dispatch(setIsLoading(false));
    }
  };

  const getIsSignDoanhNghiep = async () => {
    const res = await duLieuDanhMucService.getAllByGroupCode(
      "CAUHINH_SIGN_NENTANG"
    );

    if (res.status && res.data?.length) {
      let configCode = "";
      if (platformType === "NTThongBaoKD") {
        configCode = "SIGN_DATHANGTRUCTUYEN";
      } else if (platformType === "NTDangKyKDNuocNgoai") {
        configCode = "SIGN_DATHANGNUOCNGOAI";
      } else if (platformType === "NTTichHop") {
        configCode = "SIGN_TRUNGGIANTRONGNUOC";
      } else if (platformType === "NTTichHopNuocNgoai") {
        configCode = "SIGN_TRUNGGIANNUOCNGOAI";
      }

      if (configCode) {
        const signConfig = res.data.find(
          (item: any) => item.code === configCode
        );
        setIsSignDoanhNghiep(signConfig?.priority === 1);
      }
    }
  };

  useEffect(() => {
    getIsSignDoanhNghiep();
  }, []);

  useEffect(() => {
    if (trangThaiParam !== null) {
      if (mappedStatus !== null) {
        setActiveTabKey(String(mappedStatus));
      } else {
        setActiveTabKey("All");
      }
    } else {
      setActiveTabKey("All");
    }
  }, [trangThaiParam, mappedStatus]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  useEffect(() => {
    loadGroupedTemplates();
  }, [loadGroupedTemplates]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [pageIndex, pageSize]);

  const onFinishSearch: FormProps<PlatformManageSearchType>["onFinish"] =
    async (values) => {
      setSearchValues(values);
      setPageIndex(1);
      const searchData: PlatformManageSearchType = {
        ...values,
        platformManageTypeId: platformType,
        pageIndex: 1,
        pageSize
      };
      if (mappedStatus !== null) {
        searchData.status = mappedStatus;
      } else if (activeTabKey !== "All") {
        searchData.status = parseInt(activeTabKey, 10);
      }
      await handleLoadData(searchData);
    };

  const handleShowModal = () => {
    router.push(`/QLPlatform/create?type=${platformType}`);
  };

  const handleShowEdit = (record: PlatformManageListType) => {
    router.push(`/QLPlatform/create?id=${record.id}&type=${platformType}`);
  };

  const handleShowDetail = (record: PlatformManageListType) => {
    router.push(`/QLPlatform/detail/${record.id}`);
  };

  const handleCloseDetail = useCallback(() => {
    setIsOpenDetail(false);
    setDetailId(null);
  }, []);

  const loadSpecialists = useCallback(async () => {
    setSpecialistLoading(true);
    try {
      let permCode = "PLATFORM_MANAGE_ACTION_DUYETDIENTU";
      if (hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_PHANCONG")) {
        permCode = "PLATFORMBANENTANG_MANAGE_ACTION_DUYETDIENTU";
      }

      const response = await userService.getUserByRole({
        pageIndex: 1,
        pageSize: 1000,
        permissionCode: permCode,
      });
      const items = response?.data?.items || [];
      setSpecialistOptions(
        items
          .filter((item: any) => item?.id)
          .map((item: any) => ({
            value: item.id,
            label: item.maCanBo ? `[${item.maCanBo}] ${item.name}` : (item.name || item.userName || item.email || item.id),
          })),
      );
    } catch {
      setSpecialistOptions([]);
      message.error("Không tải được danh sách chuyên viên xử lý");
    } finally {
      setSpecialistLoading(false);
    }
  }, [platformType, isAdmin, currentUser?.menuData]);

  const handleOpenAssignModal = async (record: PlatformManageListType) => {
    setAssignRecord(record);
    setIsAssignModalOpen(true);
    assignForm.resetFields();
    if (!specialistOptions.length) {
      await loadSpecialists();
    }
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
      const response = await platformManageService.platformAssignProcessing(
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

  const handleOpenBulkAssignModal = async () => {
    if (selectedRowKeys.length === 0) return;
    setIsAssignModalOpen(true);
    assignForm.resetFields();
    if (!specialistOptions.length) {
      await loadSpecialists();
    }
  };

  const handleBulkAssignTask = async (values: { chuyenVienId: string }) => {
    setAssignSubmitting(true);
    try {
      const selectedSpecialist = specialistOptions.find(o => o.value === values.chuyenVienId);
      const specialistName = selectedSpecialist ? selectedSpecialist.label.split(" (")[0] : "";
      const response = await platformManageService.platformAssignProcessing(
        selectedRowKeys as string[],
        values.chuyenVienId,
        specialistName
      );

      if (response.status) {
        message.success(`Đã phân công ${selectedRowKeys.length} hồ sơ thành công`);
        handleCloseAssignModal();
        setSelectedRowKeys([]);
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

  const handleBulkTransition = async (targetStatus: number, title: string) => {
    if (selectedRowKeys.length === 0) return;

    const isApprove =
      targetStatus === PlatformStatusConstant.DaDuyetDienTu ||
      targetStatus === PlatformStatusConstant.DaReview ||
      targetStatus === PlatformStatusConstant.DaXacNhan;

    if (isApprove) {
      Modal.confirm({
        title: title,
        content: `Bạn có chắc chắn muốn thực hiện thao tác "${title}" cho ${selectedRowKeys.length} hồ sơ đã chọn?`,
        okText: "Xác nhận",
        cancelText: "Huỷ",
        onOk: async () => {
          const isRequireSign = userRoles.includes("DoanhNghiep") ? isSignDoanhNghiep : !!currentUser?.isKySo;
          if (isRequireSign) {
            setPendingTransition({
              ids: selectedRowKeys as string[],
              targetStatus,
              note: title,
              successMessage: "Ký số và thực hiện thao tác thành công",
            });
            setSignIds(selectedRowKeys as string[]);
            setIsSignModalOpen(true);
          } else {
            dispatch(setIsLoading(true));
            try {
              const res = await platformManageService.platformBulkTransition({
                ids: selectedRowKeys as string[],
                targetStatus,
                note: title,
              });
              if (res.status) {
                message.success("Thực hiện thao tác thành công");
                setSelectedRowKeys([]);
                await handleLoadData();
              } else {
                message.error(res.message ?? "Thao tác thất bại");
              }
            } catch {
              message.error("Có lỗi khi xử lý thao tác");
            } finally {
              dispatch(setIsLoading(false));
            }
          }
        }
      });
    } else {
      setTransitionModal({
        recordId: "BULK",
        targetStatus,
        title: `${title} (${selectedRowKeys.length} hồ sơ)`,
      });
    }
  };

  const handleTransitionSubmit = async (values: { note: string }) => {
    if (!transitionModal) return;
    setTransitionSubmitting(true);
    try {
      const ids = transitionModal.recordId === "BULK" ? (selectedRowKeys as string[]) : [transitionModal.recordId];

      const promises = ids.map(id => platformManageService.platformTransition({
        id,
        targetStatus: transitionModal.targetStatus,
        note: values.note,
      }));

      const results = await Promise.all(promises);
      const failedCount = results.filter(r => !r.status).length;

      if (failedCount === 0) {
        message.success("Thực hiện thao tác thành công");
        setTransitionModal(null);
        transitionForm.resetFields();
        setSelectedRowKeys([]);
        await handleLoadData();
      } else if (failedCount < ids.length) {
        message.warning(`Đã xử lý xong, nhưng có ${failedCount} hồ sơ thất bại`);
        setTransitionModal(null);
        transitionForm.resetFields();
        setSelectedRowKeys([]);
        await handleLoadData();
      } else {
        message.error("Thao tác thất bại trên tất cả hồ sơ đã chọn");
      }
    } catch {
      message.error("Có lỗi khi xử lý thao tác");
    } finally {
      setTransitionSubmitting(false);
    }
  };

  const handleSelfAssign = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một hồ sơ");
      return;
    }

    const selectedRecords =
      data?.items?.filter((item) => selectedRowKeys.includes(item.id)) ?? [];
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
          const response = await platformManageService.platformAssignProcessing(
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

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const response = await platformManageService.platformDelete(confirmDeleteId);
    if (response.status) {
      message.success("Xoá thành công");
      handleLoadData();
    } else {
      message.error(response.message ?? "Xoá thất bại");
    }
    setConfirmDeleteId(null);
  };

  const handleSingleSelfAssign = (record: PlatformManageListType) => {
    Modal.confirm({
      title: "Xác nhận nhận rà soát",
      content: `Bạn có chắc muốn tự nhận rà soát hồ sơ: "${record.name}"?`,
      okText: "Nhận rà soát",
      cancelText: "Huỷ",
      onOk: async () => {
        dispatch(setIsLoading(true));
        try {
          const res = await platformManageService.platformAssignProcessing(
            [record.id],
            currentUser.id,
            currentUser.name || ""
          );
          if (res.status) {
            message.success("Nhận rà soát hồ sơ thành công");
            handleLoadData();
          } else {
            message.error(res.message ?? "Nhận rà soát thất bại");
          }
        } catch {
          message.error("Có lỗi khi nhận rà soát hồ sơ");
        } finally {
          dispatch(setIsLoading(false));
        }
      }
    });
  };

  let columns: TableProps<PlatformManageListType>["columns"] = [
    {
      title: "STT",
      width: 60,
      align: "center",
      fixed: "left",
      render: (_: unknown, __: unknown, index: number) =>
        (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Tên nền tảng",
      key: "platform_name",
      width: 320,
      align: "left" as const,
      onHeaderCell: () => ({ style: { textAlign: "center" as const } }),
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



              {record.isNenTangLon === true && (
                <div style={{ marginTop: 2 }}>
                  <Tag color="red" style={{ fontSize: "10px", lineHeight: "14px", padding: "0 6px", borderRadius: 4, margin: 0 }}>
                    Nền tảng số lớn
                  </Tag>
                </div>
              )}
              {(() => {
                const isDoanhNghiep = userRoles.includes(RoleConstant.DoanhNghiep);
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
      align: "left",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
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
    {
      title: "Thời gian xử lý",
      key: "progress",
      width: 220,
      align: "left",
      onHeaderCell: () => ({ style: { textAlign: "center" } }),
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
    ...(!userRoles.includes(RoleConstant.DoanhNghiep) ? [
      {
        title: "Người xử lý",
        dataIndex: "reviewName",
        width: 160,
        align: "left" as const,
        onHeaderCell: () => ({ style: { textAlign: "center" as const } }),
        render: (name: string | null, record: PlatformManageListType) => {
          const trimmedName = name?.trim();
          if (trimmedName) {
            return trimmedName;
          }

          const canClaim = !isDN && canReceiveRecord(record) && canActionNhanTuXuLy;
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
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      width: 130,
      align: "center" as const,
      render: (_: unknown, record: PlatformManageListType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "detail",
            icon: <EyeOutlined />,
            onClick: () => handleShowDetail(record),
          },
        ];

        if (canMarkBigPlatform) {
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

        // 1. DOANH NGHIỆP: Chỉ được Chỉnh sửa và Gửi duyệt khi hồ sơ ở trạng thái nháp/cần chỉnh sửa
        if (isDN && !isCV && !isTP && !isLD) {
          if (
            record.status === PlatformStatusConstant.TamLuu ||
            record.status === PlatformStatusConstant.DeNghiChinhSua ||
            record.status === PlatformStatusConstant.CanBoSungThongTin
          ) {
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

          // ĐỀ NGHỊ CHẤM DỨT / CHỈNH SỬA (Dành cho hồ sơ đã xác nhận)
          if (record.status === PlatformStatusConstant.DaXacNhan) {
            items.push(
              { type: "divider" },
              {
                label: "Đề nghị chỉnh sửa",
                key: "request_edit",
                icon: <EditOutlined style={{ color: "#3b82f6" }} />,
                onClick: () => {
                  Modal.confirm({
                    title: "Xác nhận gửi đề nghị chỉnh sửa",
                    content: "Bạn có chắc muốn gửi đề nghị chỉnh sửa hồ sơ này?",
                    onOk: async () => {
                      const res = await platformManageService.platformTransition({
                        id: record.id,
                        targetStatus: PlatformStatusConstant.DeNghiChinhSua,
                        note: "Gửi đề nghị chỉnh sửa",
                      });
                      if (res.status) {
                        message.success("Thành công");
                        handleLoadData();
                      }
                    }
                  });
                }
              },
              {
                label: "Đề nghị chấm dứt",
                key: "request_termination",
                danger: true,
                icon: <StopOutlined />,
                onClick: () => {
                  Modal.confirm({
                    title: "Xác nhận gửi đề nghị chấm dứt",
                    content: "Bạn có chắc muốn gửi đề nghị chấm dứt hoạt động nền tảng này?",
                    onOk: async () => {
                      const res = await platformManageService.platformTransition({
                        id: record.id,
                        targetStatus: PlatformStatusConstant.DeNghiChamDutDangKy,
                        note: "Gửi đề nghị chấm dứt",
                      });
                      if (res.status) {
                        message.success("Thành công");
                        handleLoadData();
                      }
                    }
                  });
                }
              }
            );
          }
        }

        // 2. CÁN BỘ XỬ LÝ (CHUYÊN VIÊN / TRƯỞNG PHÒNG / LÃNH ĐẠO)
        const isOfficer = canActionNhanTuXuLy || canActionDuyetDienTu || canActionBoSungCV || canActionXinYKien || canActionTuChoiCV || canActionChamDut || canActionChoDuyetCV ||
          canActionPhanCong || canActionReviewThongQua || canActionYeuCauBanGiay || canActionBoSungTP || canActionTuChoiTP ||
          canActionPheDuyet || canActionBoSungLD || canActionTuChoiLD || isCV || isTP || isLD;

        if (isOfficer) {
          // Xử lý đề nghị chấm dứt
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
                      content: "Bạn có chắc chắn muốn xác nhận chấm dứt hoạt động nền tảng này?",
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
            if (canActionTuChoiCV) {
              items.push(
                {
                  label: "Từ chối đề nghị",
                  key: "reject_termination",
                  danger: true,
                  icon: <CloseCircleOutlined />,
                  onClick: () => {
                    setTransitionModal({
                      recordId: record.id,
                      targetStatus: PlatformStatusConstant.BiTuChoi,
                      title: "Từ chối đề nghị chấm dứt",
                      buttonColor: "danger",
                    });
                  }
                }
              );
            }
          }

          // Xử lý đề nghị chỉnh sửa
          if (record.status === PlatformStatusConstant.DeNghiChinhSua) {
            if (canActionDuyetDienTu) {
              items.push(
                { type: "divider" },
                {
                  label: "Duyệt điện tử",
                  key: "approve_edit",
                  icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Duyệt điện tử",
                      content: "Duyệt điện tử nội dung chỉnh sửa?",
                      onOk: async () => {
                        await handleApprovalAction(
                          record.id,
                          PlatformStatusConstant.DaDuyetDienTu,
                          "Duyệt điện tử nội dung chỉnh sửa",
                          "Duyệt điện tử thành công"
                        );
                      }
                    });
                  }
                }
              );
            }
            if (canActionBoSungCV) {
              items.push(
                {
                  label: "Yêu cầu bổ sung",
                  key: "request_more_edit",
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
            if (canActionTuChoiCV) {
              items.push(
                {
                  label: "Từ chối đề nghị",
                  key: "reject_edit",
                  danger: true,
                  icon: <CloseCircleOutlined />,
                  onClick: () => {
                    setTransitionModal({
                      recordId: record.id,
                      targetStatus: PlatformStatusConstant.BiTuChoi,
                      title: "Từ chối đề nghị chỉnh sửa",
                      buttonColor: "danger",
                    });
                  }
                }
              );
            }
          }

          // Xử lý hồ sơ Đang xin ý kiến
          if (record.status === PlatformStatusConstant.DangXinYKien) {
            const isAssignedToMe = currentUser && record.reviewId === currentUser.id;
            const cvCanProcess = isAssignedToMe || isAdmin;
            if (cvCanProcess) {
              if (canActionDuyetDienTu || canActionBoSungCV || canActionChoDuyetCV || canActionTuChoiCV) {
                items.push({ type: "divider" });
              }
              if (canActionDuyetDienTu) {
                items.push({
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
                });
              }
              if (canActionBoSungCV) {
                items.push({
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
                });
              }
              if (canActionChoDuyetCV) {
                items.push({
                  label: "Chờ duyệt",
                  key: "choduyet_opinion",
                  icon: <ClockCircleOutlined style={{ color: "#0355a2" }} />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Chuyển về Chờ duyệt",
                      content: "Bạn có chắc muốn chuyển hồ sơ này về trạng thái Chờ duyệt?",
                      onOk: async () => {
                        const res = await platformManageService.platformTransition({
                          id: record.id,
                          targetStatus: PlatformStatusConstant.ChoDuyet,
                          note: "Chuyên viên chuyển về chờ duyệt từ đang xin ý kiến",
                        });
                        if (res.status) {
                          message.success("Thành công");
                          handleLoadData();
                        } else {
                          message.error(res.message ?? "Thao tác thất bại");
                        }
                      }
                    });
                  },
                });
              }
              if (canActionTuChoiCV) {
                items.push({
                  label: "Từ chối",
                  key: "reject_opinion",
                  danger: true,
                  icon: <CloseCircleOutlined />,
                  onClick: () => {
                    setTransitionModal({
                      recordId: record.id,
                      targetStatus: PlatformStatusConstant.BiTuChoi,
                      title: "Từ chối hồ sơ đăng ký",
                      buttonColor: "danger",
                    });
                  },
                });
              }
            }
          }

          // B2→B3: Hồ sơ ChoDuyet (1)
          if (record.status === PlatformStatusConstant.ChoDuyet) {
            const isRecordAssigned = !!(record.reviewName?.trim());
            const isAssignedToMe = currentUser && record.reviewId === currentUser.id;
            const cvCanProcess = isAssignedToMe || isAdmin;

            items.push({ type: "divider" });

            // Trưởng phòng: Phân công / Phân công lại
            if (canActionPhanCong) {
              items.push({
                label: isRecordAssigned ? "Phân công lại" : "Phân công",
                key: "assign",
                icon: <UserAddOutlined style={{ color: "#0355a2" }} />,
                onClick: () => handleOpenAssignModal(record),
              });
            }

            // Chuyên viên chưa phân công: Nhận tự xử lý
            if (canActionNhanTuXuLy && !isRecordAssigned) {
              items.push({
                label: "Nhận tự xử lý",
                key: "self-assign",
                icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
                onClick: () => {
                  Modal.confirm({
                    title: "Xác nhận nhận xử lý",
                    content: "Bạn có chắc muốn tự nhận xử lý hồ sơ này?",
                    okText: "Nhận xử lý",
                    cancelText: "Huỷ",
                    onOk: async () => {
                      const res = await platformManageService.platformAssignProcessing(
                        [record.id],
                        currentUser.id,
                        currentUser.name || ""
                      );
                      if (res.status) {
                        message.success("Nhận xử lý hồ sơ thành công");
                        handleLoadData();
                      } else {
                        message.error(res.message ?? "Nhận xử lý thất bại");
                      }
                    }
                  });
                }
              });
            }

            // Chuyên viên đúng người được phân công: 4 thao tác xử lý
            if (isRecordAssigned && cvCanProcess) {
              if (canActionDuyetDienTu) {
                items.push({
                  label: "Duyệt điện tử",
                  key: "approve_cv",
                  icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Duyệt điện tử",
                      content: "Bạn có chắc muốn duyệt điện tử hồ sơ này?",
                      onOk: async () => {
                        await handleApprovalAction(
                          record.id,
                          PlatformStatusConstant.DaDuyetDienTu,
                          "Chuyên viên duyệt điện tử",
                          "Duyệt điện tử thành công"
                        );
                      }
                    });
                  },
                });
              }
              if (canActionBoSungCV) {
                items.push({
                  label: "Yêu cầu bổ sung thông tin",
                  key: "bosung_cv",
                  icon: <ExclamationCircleOutlined style={{ color: "#d97706" }} />,
                  onClick: () => {
                    setTransitionModal({
                      recordId: record.id,
                      targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                      title: "Yêu cầu bổ sung thông tin",
                      buttonColor: "warning",
                    });
                  },
                });
              }
              if (canActionXinYKien) {
                items.push({
                  label: "Xin ý kiến phối hợp",
                  key: "opinion_cv",
                  icon: <CommentOutlined style={{ color: "#722ed1" }} />,
                  onClick: () => {
                    setTransitionModal({
                      recordId: record.id,
                      targetStatus: PlatformStatusConstant.DangXinYKien,
                      title: "Xin ý kiến phối hợp",
                      buttonColor: "primary",
                    });
                  },
                });
              }
            }
          }

          // Xử lý hồ sơ Cần bổ sung thông tin (status: CanBoSungThongTin) - Chuyên viên xử lý
          if (record.status === PlatformStatusConstant.CanBoSungThongTin && canActionChamDut) {
            const isAssignedToMe = currentUser && record.reviewId === currentUser.id;
            const cvCanProcess = isAssignedToMe || isAdmin;
            if (cvCanProcess) {
              items.push(
                { type: "divider" },
                {
                  label: "Chấm dứt đăng ký",
                  key: "terminate_cv",
                  danger: true,
                  icon: <StopOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: "Chấm dứt đăng ký",
                      content: "Bạn có chắc chắn muốn chấm dứt đăng ký nền tảng này?",
                      onOk: async () => {
                        await handleApprovalAction(
                          record.id,
                          PlatformStatusConstant.DaChamDutDangKy,
                          "Chuyên viên chấm dứt đăng ký",
                          "Chấm dứt đăng ký thành công"
                        );
                      }
                    });
                  }
                }
              );
            }
          }

          // B4: Hồ sơ DaDuyetDienTu (4) - Trưởng phòng xử lý
          if (record.status === PlatformStatusConstant.DaDuyetDienTu) {
            const isAssignedToMe = currentUser && record.reviewId === currentUser.id;
            const isOwnSpecialist = isAssignedToMe && !isAdmin;

            if (
              (!isOwnSpecialist && (canActionReviewThongQua || canActionYeuCauBanGiay || canActionBoSungTP)) ||
              canActionTuChoiTP
            ) {
              items.push({ type: "divider" });
            }
            if (canActionReviewThongQua && !isOwnSpecialist) {
              items.push({
                label: "Đã review",
                key: "review_tp",
                icon: <FileDoneOutlined style={{ color: "#3b82f6" }} />,
                onClick: () => {
                  Modal.confirm({
                    title: "Xác nhận Review",
                    content: "Trình hồ sơ lên Lãnh đạo Cục phê duyệt?",
                    onOk: async () => {
                      await handleApprovalAction(
                        record.id,
                        PlatformStatusConstant.DaReview,
                        "Trưởng phòng review thông qua",
                        "Trình Lãnh đạo sở thành công"
                      );
                    }
                  });
                },
              });
            }
            // if (canActionYeuCauBanGiay && !isOwnSpecialist) {
            //   items.push({
            //     label: "Đề nghị nộp bản giấy",
            //     key: "bangiay_tp",
            //     icon: <AuditOutlined style={{ color: "#854d0e" }} />,
            //     onClick: () => {
            //       setTransitionModal({
            //         recordId: record.id,
            //         targetStatus: PlatformStatusConstant.CanBanGiay,
            //         title: "Đề nghị nộp bản giấy đối chiếu",
            //         buttonColor: "warning",
            //       });
            //     },
            //   });
            // }
            if (canActionBoSungTP && !isOwnSpecialist) {
              items.push({
                label: "Yêu cầu bổ sung thông tin",
                key: "bosung_tp",
                icon: <ExclamationCircleOutlined style={{ color: "#d97706" }} />,
                onClick: () => {
                  setTransitionModal({
                    recordId: record.id,
                    targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                    title: "Yêu cầu bổ sung thông tin",
                    buttonColor: "warning",
                  });
                },
              });
            }
          }

          // B4 (phụ): Hồ sơ CanBanGiay (28) - Trưởng phòng xác nhận đã nhận bản giấy → DaReview
          // if (record.status === PlatformStatusConstant.CanBanGiay) {
          //   const isAssignedToMe = currentUser && record.reviewId === currentUser.id;
          //   const isOwnSpecialist = isAssignedToMe && !isAdmin;
          //   if (!isOwnSpecialist) {
          //     if (canActionReviewThongQua) {
          //       items.push({ type: "divider" });
          //       items.push({
          //         label: "Đã review",
          //         key: "nhangiay_tp",
          //         icon: <FileDoneOutlined style={{ color: "#3b82f6" }} />,
          //         onClick: () => {
          //           Modal.confirm({
          //             title: "Xác nhận đã nhận bản giấy đối chiếu",
          //             content: "Xác nhận đã nhận bản giấy đối chiếu và trình lên Lãnh đạo?",
          //             onOk: async () => {
          //               await handleApprovalAction(
          //                 record.id,
          //                 PlatformStatusConstant.DaReview,
          //                 "Trưởng phòng xác nhận đã nhận bản giấy, trình Lãnh đạo",
          //                 "Trình Lãnh đạo sở thành công"
          //               );
          //             }
          //           });
          //         },
          //       });
          //     }
          //   }
          // }

          // Lãnh đạo xử lý hồ sơ ở trạng thái Trình Lãnh đạo / Đã review
          if (record.status === PlatformStatusConstant.DaReview) {
            const isAssignedToMe = currentUser && record.reviewId === currentUser.id;
            const isOwnSpecialist = isAssignedToMe && !isAdmin;

            if (
              (!isOwnSpecialist && (canActionPheDuyet || canActionBoSungLD)) ||
              canActionTuChoiLD
            ) {
              items.push({ type: "divider" });
            }
            if (canActionPheDuyet && !isOwnSpecialist) {
              items.push({
                label: "Phê duyệt chính thức",
                key: "confirm_ld",
                icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
                onClick: () => {
                  Modal.confirm({
                    title: "Phê duyệt hồ sơ",
                    content: "Bạn có chắc muốn phê duyệt chính thức hồ sơ này?",
                    onOk: async () => {
                      await handleApprovalAction(
                        record.id,
                        PlatformStatusConstant.DaXacNhan,
                        "Lãnh đạo phê duyệt từ danh sách",
                        "Phê duyệt hồ sơ thành công"
                      );
                    }
                  });
                },
              });
            }
            if (canActionBoSungLD && !isOwnSpecialist) {
              items.push({
                label: "Yêu cầu bổ sung",
                key: "request_more_ld",
                icon: <ExclamationCircleOutlined style={{ color: "#d97706" }} />,
                onClick: () => {
                  setTransitionModal({
                    recordId: record.id,
                    targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                    title: "Yêu cầu bổ sung hồ sơ",
                    buttonColor: "warning",
                  });
                },
              });
            }
          }
        }

        const canRejectAny = canActionTuChoiCV || canActionTuChoiTP || canActionTuChoiLD;
        const isNotTerminal = record.status !== PlatformStatusConstant.DaXacNhan &&
          record.status !== PlatformStatusConstant.BiTuChoi &&
          record.status !== PlatformStatusConstant.TamLuu;

        if (canRejectAny && isNotTerminal) {
          items.push({ type: "divider" });
          items.push({
            label: "Từ chối",
            key: "reject_any",
            danger: true,
            icon: <CloseCircleOutlined />,
            onClick: () => {
              setTransitionModal({
                recordId: record.id,
                targetStatus: PlatformStatusConstant.BiTuChoi,
                title: "Từ chối hồ sơ",
                buttonColor: "danger",
              });
            },
          });
        }

        if (userRoles.includes("DoanhNghiep") || (isAdmin && isDevEnv)) {
          items.push(
            { type: "divider" },
            {
              label: "Xoá",
              key: "delete",
              danger: true,
              icon: <DeleteOutlined />,
              onClick: () => setConfirmDeleteId(record.id),
            },
          );
        }
        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button onClick={(e) => e.preventDefault()}>
              <Space>
                Thao tác
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  /* ─── Status Tabs (phân theo role) ─── */

  const allTabs = [
    { key: "All", label: "Tất cả", color: "#1890ff", icon: <AppstoreOutlined />, roles: ["all"] },
    {
      key: String(PlatformStatusConstant.ChoDuyet),
      statusValue: PlatformStatusConstant.ChoDuyet,
      label: "Chờ duyệt",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.ChoDuyet),
      icon: <ClockCircleOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.DeNghiChinhSua),
      statusValue: PlatformStatusConstant.DeNghiChinhSua,
      label: "Đề nghị chỉnh sửa",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.DeNghiChinhSua),
      icon: <EditOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.CanBoSungThongTin),
      statusValue: PlatformStatusConstant.CanBoSungThongTin,
      label: "Cần bổ sung thông tin",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.CanBoSungThongTin),
      icon: <ExclamationCircleOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.DangXinYKien),
      statusValue: PlatformStatusConstant.DangXinYKien,
      label: "Đang xin ý kiến",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.DangXinYKien) || "#722ed1",
      icon: <CommentOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.CanBanGiay),
      statusValue: PlatformStatusConstant.CanBanGiay,
      label: "Cần bản giấy",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.CanBanGiay),
      icon: <AuditOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.BiTuChoi),
      statusValue: PlatformStatusConstant.BiTuChoi,
      label: "Bị từ chối",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.BiTuChoi),
      icon: <StopOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.DaDuyetDienTu),
      statusValue: PlatformStatusConstant.DaDuyetDienTu,
      label: "Đã duyệt điện tử",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.DaDuyetDienTu),
      icon: <CheckCircleOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.DaReview),
      statusValue: PlatformStatusConstant.DaReview,
      label: "Đã review",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.DaReview),
      icon: <FileDoneOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.DaXacNhan),
      statusValue: PlatformStatusConstant.DaXacNhan,
      label: "Đã xác nhận",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.DaXacNhan),
      icon: <AuditOutlined />,
      roles: ["CV", "TP", "LD", "all"],
    },
    {
      key: String(PlatformStatusConstant.DeNghiChamDutDangKy),
      statusValue: PlatformStatusConstant.DeNghiChamDutDangKy,
      label: "Đề nghị chấm dứt",
      color: "#dc2626",
      icon: <StopOutlined />,
      roles: ["CV", "TP", "LD"],
    },
    {
      key: String(PlatformStatusConstant.DaChamDutDangKy),
      statusValue: PlatformStatusConstant.DaChamDutDangKy,
      label: "Đã chấm dứt",
      color: PlatformStatusConstant.getColor(PlatformStatusConstant.DaChamDutDangKy) || "#4b5563",
      icon: <CheckSquareOutlined />,
      roles: ["CV", "TP", "LD"],
    },
  ];

  const statusTabs = allTabs.filter((tab) => {
    if (tab.key === "All") return true;
    if (isDN && !isCV && !isTP && !isLD) {
      // Doanh nghiệp tabs
      return [
        String(PlatformStatusConstant.ChoDuyet),
        String(PlatformStatusConstant.DeNghiChinhSua),
        String(PlatformStatusConstant.CanBoSungThongTin),
        String(PlatformStatusConstant.BiTuChoi),
        String(PlatformStatusConstant.DaXacNhan),
        String(PlatformStatusConstant.DeNghiChamDutDangKy),
        String(PlatformStatusConstant.DaChamDutDangKy),
      ].includes(tab.key);
    }
    // Cán bộ/Admin: show all tabs
    return true;
  });


  const totalRecords = Object.values(statusCounts).reduce((sum, c) => sum + c, 0);

  const tabItems = statusTabs.map((tab) => {
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

  let displayColumns = (columns || []).filter((col: any) => {
    if (isDN && !isCV && !isTP && !isLD) {
      return col.dataIndex !== "reviewName";
    }
    return true;
  });

  if (trangThaiParam !== null) {
    displayColumns = displayColumns.filter((col: any) => col.dataIndex !== "status");
  }

  const selectedRows = data?.items?.filter((item) => selectedRowKeys.includes(item.id)) ?? [];
  const selectedStatuses = Array.from(new Set(selectedRows.map((row) => row.status)));
  const hasSingleStatus = selectedStatuses.length === 1;
  const currentEffectiveStatus = hasSingleStatus
    ? selectedStatuses[0]
    : (activeTabKey !== "All" ? Number(activeTabKey) : null);

  const isTabOrStatusChoDuyet = activeTabKey === String(PlatformStatusConstant.ChoDuyet) || (activeTabKey === "All" && selectedStatuses.includes(PlatformStatusConstant.ChoDuyet));
  const isTabOrStatusCanBoSung = activeTabKey === String(PlatformStatusConstant.CanBoSungThongTin) || (activeTabKey === "All" && selectedStatuses.includes(PlatformStatusConstant.CanBoSungThongTin));
  const isTabOrStatusDangXinYKien = activeTabKey === String(PlatformStatusConstant.DangXinYKien) || (activeTabKey === "All" && selectedStatuses.includes(PlatformStatusConstant.DangXinYKien));
  const isTabOrStatusDaDuyetDienTu = activeTabKey === String(PlatformStatusConstant.DaDuyetDienTu) || (activeTabKey === "All" && selectedStatuses.includes(PlatformStatusConstant.DaDuyetDienTu));
  const isTabOrStatusCanBanGiay = activeTabKey === String(PlatformStatusConstant.CanBanGiay) || (activeTabKey === "All" && selectedStatuses.includes(PlatformStatusConstant.CanBanGiay));
  const isTabOrStatusDaReview = activeTabKey === String(PlatformStatusConstant.DaReview) || (activeTabKey === "All" && selectedStatuses.includes(PlatformStatusConstant.DaReview));

  const rowSelectionConfig = (isCV || isTP || isLD)
    ? {
      selectedRowKeys,
      onChange: setSelectedRowKeys,
      fixed: true as const,
    }
    : undefined;

  return (
    <>
      <div
        className="mb-2 flex-wrap justify-content-end"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <AutoBreadcrumb
          items={[
            { title: "Nền tảng" },
            { title: title },
          ]}
        />
        <div className="btn-group w-fit flex" style={{ gap: 12 }}>
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
              Thêm mới
            </Button>
          )}
        </div>
      </div>

      {isPanelVisible && <Search activeTab={platformType} activeTabKey={activeTabKey} isStaff={!userRoles.includes("DoanhNghiep") || isCV || isTP || isLD} onFinish={onFinishSearch} />}

      {/*trangThaiParam === null && (
        <Tabs
          activeKey={activeTabKey}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          className="mb-3"
        />
      )*/}

      {selectedRowKeys.length > 0 && (
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
            📋 Đã chọn <strong>{selectedRowKeys.length}</strong> hồ sơ:
          </span>

          {/* ===== CHUYÊN VIÊN / ĐƯỢC DUYỆT ĐIỆN TỬ ===== */}
          {(canActionNhanTuXuLy || canActionDuyetDienTu || canActionBoSungCV || canActionXinYKien || canActionTuChoiCV || canActionChamDut || canActionChoDuyetCV) && (
            <>
              {/* Tab Chờ duyệt */}
              {isTabOrStatusChoDuyet && (
                <>
                  {canActionNhanTuXuLy && (
                    <Button
                      type="default"
                      icon={<UserAddOutlined />}
                      style={{ color: "#2563eb", borderColor: "#2563eb" }}
                      onClick={handleSelfAssign}
                    >
                      Nhận tự rà soát
                    </Button>
                  )}
                  {canActionDuyetDienTu && (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.DaDuyetDienTu, "Duyệt điện tử hàng loạt")}
                    >
                      Duyệt điện tử
                    </Button>
                  )}
                  {canActionBoSungCV && (
                    <Button
                      icon={<ExclamationCircleOutlined />}
                      style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "#fff" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.CanBoSungThongTin, "Yêu cầu bổ sung hàng loạt")}
                    >
                      Yêu cầu bổ sung
                    </Button>
                  )}
                  {canActionXinYKien && (
                    <Button
                      icon={<CommentOutlined />}
                      style={{ background: "#722ed1", borderColor: "#722ed1", color: "#fff" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.DangXinYKien, "Xin ý kiến phối hợp hàng loạt")}
                    >
                      Xin ý kiến phối hợp
                    </Button>
                  )}
                  {canActionTuChoiCV && (
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.BiTuChoi, "Từ chối hàng loạt")}
                    >
                      Từ chối
                    </Button>
                  )}
                </>
              )}

              {/* Tab Cần bổ sung thông tin */}
              {isTabOrStatusCanBoSung && canActionChamDut && (
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={() => handleBulkTransition(PlatformStatusConstant.DaChamDutDangKy, "Chấm dứt đăng ký hàng loạt")}
                >
                  Chấm dứt đăng ký
                </Button>
              )}

              {/* Tab Đang xin ý kiến */}
              {isTabOrStatusDangXinYKien && (
                <>
                  {canActionDuyetDienTu && (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.DaDuyetDienTu, "Duyệt điện tử hàng loạt")}
                    >
                      Duyệt điện tử
                    </Button>
                  )}
                  {canActionBoSungCV && (
                    <Button
                      icon={<ExclamationCircleOutlined />}
                      style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "#fff" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.CanBoSungThongTin, "Yêu cầu bổ sung hàng loạt")}
                    >
                      Yêu cầu bổ sung
                    </Button>
                  )}
                  {canActionChoDuyetCV && (
                    <Button
                      type="default"
                      icon={<ClockCircleOutlined />}
                      style={{ color: "#0355a2", borderColor: "#0355a2" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.ChoDuyet, "Chờ duyệt hàng loạt")}
                    >
                      Chờ duyệt
                    </Button>
                  )}
                  {canActionTuChoiCV && (
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.BiTuChoi, "Từ chối hàng loạt")}
                    >
                      Từ chối
                    </Button>
                  )}
                </>
              )}
            </>
          )}

          {/* ===== QUẢN LÝ (TRƯỞNG PHÒNG / REVIEW) ===== */}
          {(canActionPhanCong || canActionReviewThongQua || canActionBoSungTP || canActionTuChoiTP) && (
            <>
              {isTabOrStatusChoDuyet && canActionPhanCong && (
                <Button type="primary" icon={<UserAddOutlined />}
                  style={{ background: "#6366f1", borderColor: "#6366f1" }}
                  onClick={handleOpenBulkAssignModal}
                >Phân công chuyên viên</Button>
              )}

              {isTabOrStatusDaDuyetDienTu && (
                <>
                  {canActionReviewThongQua && (
                    <Button type="primary" icon={<CheckCircleOutlined />}
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.DaReview, "Đã review hàng loạt")}
                    >Đã review</Button>
                  )}
                  {/* {canActionYeuCauBanGiay && (
                    <Button icon={<AuditOutlined />}
                      style={{ background: "#854d0e", borderColor: "#854d0e", color: "#fff" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.CanBanGiay, "Đề nghị nộp bản giấy hàng loạt")}
                    >Đề nghị nộp bản giấy</Button>
                  )} */}
                  {canActionBoSungTP && (
                    <Button icon={<ExclamationCircleOutlined />}
                      style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "#fff" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.CanBoSungThongTin, "Yêu cầu bổ sung hàng loạt")}
                    >Yêu cầu bổ sung thông tin</Button>
                  )}
                  {canActionTuChoiTP && (
                    <Button danger icon={<CloseCircleOutlined />}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.BiTuChoi, "Từ chối hàng loạt")}
                    >Từ chối</Button>
                  )}
                </>
              )}

              {/* {isTabOrStatusCanBanGiay && (
                <>
                  {canActionReviewThongQua && (
                    <Button type="primary" icon={<FileDoneOutlined />}
                      style={{ background: "#10b981", borderColor: "#10b981" }}
                      onClick={() => handleBulkTransition(PlatformStatusConstant.DaReview, "Đã review hàng loạt")}
                    >Đã review</Button>
                  )}
                </>
              )} */}
            </>
          )}

          {/* ===== LÃNH ĐẠO / PHÊ DUYỆT ===== */}
          {(canActionPheDuyet || canActionBoSungLD || canActionTuChoiLD) && isTabOrStatusDaReview && (
            <>
              {canActionPheDuyet && (
                <Button type="primary" icon={<FileDoneOutlined />}
                  style={{ background: "#16a34a", borderColor: "#16a34a" }}
                  onClick={() => handleBulkTransition(PlatformStatusConstant.DaXacNhan, "Phê duyệt chính thức hàng loạt")}
                >Phê duyệt chính thức</Button>
              )}
              {canActionBoSungLD && (
                <Button icon={<ExclamationCircleOutlined />}
                  style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "#fff" }}
                  onClick={() => handleBulkTransition(PlatformStatusConstant.CanBoSungThongTin, "Yêu cầu bổ sung hàng loạt")}
                >Yêu cầu bổ sung</Button>
              )}
              {canActionTuChoiLD && (
                <Button danger icon={<CloseCircleOutlined />}
                  onClick={() => handleBulkTransition(PlatformStatusConstant.BiTuChoi, "Từ chối hàng loạt")}
                >Từ chối</Button>
              )}
            </>
          )}



          {!isDN && canMarkBigPlatform && (
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

          {/* ===== NÚT DEV UPDATE (CHỈ HIỂN THỊ TRONG ENV DEV/LOCAL CHO CÁN BỘ/ADMIN) ===== */}
          {isDevEnv && (canActionDuyetDienTu || canActionPhanCong || canActionReviewThongQua || canActionPheDuyet || isAdmin) && (
            <Button
              type="primary"
              icon={<SettingOutlined />}
              style={{ background: "#7c3aed", borderColor: "#7c3aed", color: "#fff" }}
              onClick={() => setIsDevModalOpen(true)}
            >
              Đổi trạng thái (Dev)
            </Button>
          )}

          <Button type="link" onClick={() => setSelectedRowKeys([])} style={{ marginLeft: "auto" }}>
            Bỏ chọn tất cả
          </Button>
        </div>
      )}

      <PlatformManageDetail
        id={isOpenDetail ? detailId : null}
        onClose={handleCloseDetail}
      />

      {confirmDeleteId && (
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
      )}

      <TransitionModal
        open={!!transitionModal}
        title={transitionModal?.title || ""}
        form={transitionForm}
        onCancel={() => {
          setTransitionModal(null);
          transitionForm.resetFields();
        }}
        onFinish={handleTransitionSubmit}
        groupedTemplates={groupedTemplates}
      />

      {isAssignModalOpen && (
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
      )}

      {isDevModalOpen && (
        <Modal
          title="Cập nhật trạng thái hàng loạt (Dev Mode)"
          open
          onCancel={() => {
            setIsDevModalOpen(false);
            setDevTargetStatus(null);
            setDevNote("Cập nhật hàng loạt (Dev Mode)");
          }}
          onOk={handleDevBulkUpdate}
          okText="Xác nhận"
          cancelText="Huỷ"
          confirmLoading={devSubmitting}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <div>
              <span style={{ fontWeight: 500, display: "block", marginBottom: 8 }}>
                Chọn trạng thái đích:
              </span>
              <Select
                placeholder="Chọn trạng thái"
                style={{ width: "100%" }}
                value={devTargetStatus}
                onChange={(value) => setDevTargetStatus(value)}
                options={[
                  { value: PlatformStatusConstant.TamLuu, label: "Tạm lưu" },
                  { value: PlatformStatusConstant.ChoDuyet, label: "Chờ duyệt" },
                  { value: PlatformStatusConstant.DeNghiChinhSua, label: "Đề nghị chỉnh sửa" },
                  { value: PlatformStatusConstant.CanBoSungThongTin, label: "Cần bổ sung thông tin" },
                  { value: PlatformStatusConstant.DangXinYKien, label: "Đang xin ý kiến" },
                  // { value: PlatformStatusConstant.CanBanGiay, label: "Cần bản giấy" },
                  { value: PlatformStatusConstant.BiTuChoi, label: "Bị từ chối" },
                  { value: PlatformStatusConstant.DaDuyetDienTu, label: "Đã duyệt điện tử" },
                  { value: PlatformStatusConstant.DaReview, label: "Đã review" },
                  { value: PlatformStatusConstant.DaXacNhan, label: "Đã xác nhận" },
                  { value: PlatformStatusConstant.DeNghiChamDutDangKy, label: "Đề nghị chấm dứt" },
                  { value: PlatformStatusConstant.DaChamDutDangKy, label: "Đã chấm dứt" },
                  { value: PlatformStatusConstant.DaHuyDangKy, label: "Đã huỷ đăng ký" },
                  { value: PlatformStatusConstant.DaKhoa, label: "Đã khoá" },
                  { value: PlatformStatusConstant.DaYeuCauGiaHan, label: "Đã yêu cầu gia hạn" },
                  { value: PlatformStatusConstant.ChoGiaHan, label: "Chờ gia hạn" },
                  { value: PlatformStatusConstant.KhongHopLe, label: "Không hợp lệ" },
                ]}
              />
            </div>
            <div>
              <span style={{ fontWeight: 500, display: "block", marginBottom: 8 }}>Ghi chú:</span>
              <Input.TextArea
                value={devNote}
                onChange={(e) => setDevNote(e.target.value)}
                rows={3}
                placeholder="Nhập ghi chú cập nhật..."
              />
            </div>
          </div>
        </Modal>
      )}

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
            size="middle"
            columns={displayColumns}
            bordered
            dataSource={data?.items}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
            rowSelection={rowSelectionConfig}
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
          style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}
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

export default withAuthorization(PlatformIndexTemplate, "");