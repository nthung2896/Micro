"use client";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import TransitionModal from "@/components/shared-components/TransitionModal";
import { DropdownOption } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import rutTienKyQuyService from "@/services/rutTienKyQuy/rutTienKyQuy.service";
import { KyQuyConstant, KyQuyStatusColors, KyQuyStatusNames } from "@/services/rutTienKyQuy/KyQuyConstant";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { SignResultItem } from "@/libs/moit-sign/types";
import { CertificateInfo } from "@/libs/moit-sign";
import { RutTienKyQuyType, RutTienKyQuySearchType, SpecialistDto } from "@/types/rutTienKyQuy/dto";
import { ResponsePageInfo } from "@/types/general";
import formatDate from "@/utils/formatDate";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
  FileTextOutlined,
  UserAddOutlined,
  FileDoneOutlined,
  SendOutlined,
  PaperClipOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  MenuProps,
  Pagination,
  Popconfirm,
  Space,
  Table,
  TableProps,
  Tag,
  Tooltip,
  message,
  Modal,
  Tabs,
  Badge,
  Form,
  Row,
  Col,
  Select,
  Collapse,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import classes from "./page.module.css";
import Search from "./search";

const formatVND = (value: any) => {
  if (!value) return "";
  const cleanVal = value.toString().replace(/[^0-9]/g, "");
  const num = Number(cleanVal);
  if (isNaN(num) || cleanVal === "") return value;
  return num.toLocaleString("vi-VN") + " VNĐ";
};

const getStatusFromParam = (paramValue: string | null): number | null => {
  if (!paramValue) return null;
  const key = paramValue.toLowerCase().replace(/[-_]/g, "");
  const map: Record<string, number> = {
    tamluu: KyQuyConstant.TamLuu,
    choduyet: KyQuyConstant.ChoDuyet,
    denghichinhsua: KyQuyConstant.DeNghiChinhSua,
    bituchoi: KyQuyConstant.BiTuChoi,
    daduyetdientu: KyQuyConstant.DaDuyetDienTu,
    daxacnhan: KyQuyConstant.DaXacNhan,
    canbosungthongtin: KyQuyConstant.CanBoSungThongTin,
    dahuydangky: KyQuyConstant.DaHuyDangKy,
    dareview: KyQuyConstant.DaReview,
    canbangiay: KyQuyConstant.CanBanGiay,
  };
  return map[key] !== undefined ? map[key] : null;
};

const RutTienKyQuy: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trangThaiParam = searchParams.get("TrangThai");
  const mappedStatus = getStatusFromParam(trangThaiParam);

  const dispatch = useDispatch<AppDispatch>();
  const [listData, setListData] = useState<RutTienKyQuyType[]>([]);
  const [openPopconfirmId, setOpenPopconfirmId] = useState<string | null>(null);
  const [dataPage, setDataPage] = useState<ResponsePageInfo>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(true);
  const [searchValues, setSearchValues] = useState<RutTienKyQuySearchType | null>(null);
  const loading = useSelector((state: any) => state.general.isLoading);
  const currentUser = useSelector((state: any) => state.auth.User);
  const userRoles = currentUser?.listRole || [];

  const isDoanhNghiep = userRoles.includes("DoanhNghiep");
  const isAdmin = userRoles.includes("Admin");

  // Lấy danh sách operation codes từ menuData (hệ thống phân quyền theo thao tác)
  const userOperationCodes: string[] = (currentUser?.menuData ?? [])
    .flatMap((module: any) => module.listMenu ?? [])
    .map((op: any) => op.code as string);
  const hasPermission = (code: string) => isAdmin || userOperationCodes.includes(code);
  const isChuyenVien = hasPermission("THAOTACCHUYENVIEN");
  const isTruongPhong = hasPermission("THAOTACTRUONGPHONG");
  const isLanhDao = hasPermission("THAOTACLANHDAO");

  // Lấy số lượng permission thao tác để check điều kiện focus
  const permissionsCount = [isChuyenVien, isTruongPhong, isLanhDao].filter(Boolean).length;
  const shouldDefaultToAll = isAdmin || permissionsCount >= 2;

  // Khởi tạo tab active đồng bộ từ đầu để tránh lỗi race condition khi load trang
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

  const [specialists, setSpecialists] = useState<SpecialistDto[]>([]);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [bulkAssignForm] = Form.useForm();

  useEffect(() => {
    if (currentUser && (isTruongPhong || isAdmin)) {
      rutTienKyQuyService.getSpecialists().then(res => {
        if (res.status && res.data) {
          setSpecialists(res.data);
        }
      });
    }
  }, [currentUser, isTruongPhong, isAdmin]);

  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [transitionTargetStatus, setTransitionTargetStatus] = useState<number | null>(null);
  const [transitionTargetIds, setTransitionTargetIds] = useState<string[]>([]);
  const [transitionForm] = Form.useForm();

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [pendingTransition, setPendingTransition] = useState<{
    id?: string;
    ids?: string[];
    targetStatus: number;
    note: string;
    successMessage: string;
  } | null>(null);

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
    if (isTransitionModalOpen) {
      loadGroupedTemplates();
    }
  }, [isTransitionModalOpen]);

  const getActionTitle = (status: number) => {
    switch (status) {
      case KyQuyConstant.CanBoSungThongTin:
        return "Yêu cầu bổ sung thông tin hồ sơ";
      case KyQuyConstant.BiTuChoi:
        return "Từ chối hồ sơ rút tiền ký quỹ";
      default:
        return "Xử lý chuyển trạng thái hồ sơ";
    }
  };

  const handleOpenTransitionModal = (ids: string[], status: number) => {
    setTransitionTargetIds(ids);
    setTransitionTargetStatus(status);
    setIsTransitionModalOpen(true);
  };

  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      dispatch(setIsLoading(true));
      // 1. Submit signatures to the backend
      const responseSign = await rutTienKyQuyService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      // 2. Perform the workflow status update
      const targetStatus = pendingTransition ? pendingTransition.targetStatus : KyQuyConstant.ChoDuyet;
      const note = pendingTransition ? pendingTransition.note : "Cán bộ ký duyệt";
      const successMsg = pendingTransition ? pendingTransition.successMessage : "Ký duyệt thành công";

      let res;
      if (pendingTransition?.ids && pendingTransition.ids.length > 0) {
        res = await rutTienKyQuyService.transition(
          pendingTransition.ids,
          targetStatus,
          note,
        );
      } else {
        res = await rutTienKyQuyService.transition(
          [result[0].id],
          targetStatus,
          note,
        );
      }

      if (res.status) {
        message.success(successMsg);
        setSelectedRowKeys([]);
        handleGetData();
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

  const handleTransitionSubmit = async (values: { note: string }) => {
    if (transitionTargetIds.length === 0 || transitionTargetStatus === null) return;
    const isRequireSign = isDoanhNghiep
      ? (transitionTargetStatus === KyQuyConstant.ChoDuyet)
      : currentUser?.isKySo;
    if (isRequireSign) {
      setPendingTransition({
        ids: transitionTargetIds,
        targetStatus: transitionTargetStatus,
        note: values.note,
        successMessage: "Ký số và thực hiện thao tác thành công",
      });
      setSignIds(transitionTargetIds);
      setIsTransitionModalOpen(false);
      setIsSignModalOpen(true);
      return;
    }

    try {
      dispatch(setIsLoading(true));
      const response = await rutTienKyQuyService.transition(
        transitionTargetIds,
        transitionTargetStatus,
        values.note
      );

      if (response.status) {
        message.success("Xử lý chuyển trạng thái thành công!");
        setIsTransitionModalOpen(false);
        setTransitionTargetIds([]);
        setTransitionTargetStatus(null);
        transitionForm.resetFields();
        setSelectedRowKeys([]);
        handleGetData();
      } else {
        message.error("Lỗi xử lý: " + response.message);
      }
    } catch (err: any) {
      message.error("Lỗi khi xử lý chuyển trạng thái.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleCloseTransitionModal = () => {
    setIsTransitionModalOpen(false);
    setTransitionTargetIds([]);
    setTransitionTargetStatus(null);
    transitionForm.resetFields();
  };

  // Checkbox selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const validateProfileForSubmission = (profile: any): string | null => {
    if (!profile) return "Không tìm thấy dữ liệu hồ sơ!";
    if (!profile.tenChuQuanToChuc?.trim()) return "Thiếu thông tin bắt buộc: Tên chủ quan tổ chức";
    if (!profile.maSoThue?.trim()) return "Thiếu thông tin bắt buộc: Mã số thuế";
    if (!profile.sdtToChuc?.trim()) return "Thiếu thông tin bắt buộc: Số điện thoại tổ chức";
    if (!profile.appTenUngDung?.trim()) return "Thiếu thông tin bắt buộc: Tên nền tảng";
    if (!profile.ddplHoVaTen?.trim()) return "Thiếu thông tin bắt buộc: Họ tên đại diện pháp luật (ĐDPL)";
    if (!profile.ddplSoCccdHoChieu?.trim()) return "Thiếu thông tin bắt buộc: Số CCCD/Hộ chiếu ĐDPL";
    if (!profile.ddplSdt?.trim()) return "Thiếu thông tin bắt buộc: Số điện thoại ĐDPL";
    if (!profile.nganHang?.trim()) return "Thiếu thông tin bắt buộc: Ngân hàng giao dịch";
    if (!profile.quySo?.trim()) return "Thiếu thông tin bắt buộc: Quỹ số";
    if (!profile.lyDo?.trim()) return "Thiếu thông tin bắt buộc: Lý do đề nghị rút tiền ký quỹ";

    const donDeNghiFiles = profile.files?.filter(
      (f: any) => f.loaiTaiLieu === "DonDeNghi"
    ) || [];
    if (donDeNghiFiles.length === 0) {
      return "Thiếu tài liệu đính kèm bắt buộc: 'Đơn đề nghị'";
    }

    return null;
  };

  const handleBulkTransition = async (values: { targetStatus: number; note: string }) => {
    if (values.targetStatus === KyQuyConstant.ChoDuyet) {
      for (const key of selectedRowKeys) {
        const record = listData.find((x) => x.id === key);
        const errorMsg = validateProfileForSubmission(record);
        if (errorMsg) {
          message.error(`Hồ sơ có MST "${record?.maSoThue || "N/A"}": ${errorMsg}`);
          return;
        }
      }
    }

    const isRequireSign = isDoanhNghiep
      ? (values.targetStatus === KyQuyConstant.ChoDuyet)
      : currentUser?.isKySo;
    if (isRequireSign) {
      setPendingTransition({
        ids: selectedRowKeys as string[],
        targetStatus: values.targetStatus,
        note: values.note,
        successMessage: "Ký số và thực hiện thao tác thành công",
      });
      setSignIds(selectedRowKeys as string[]);
      setIsSignModalOpen(true);
      return;
    }

    try {
      dispatch(setIsLoading(true));
      const response = await rutTienKyQuyService.transition(
        selectedRowKeys as string[],
        values.targetStatus,
        values.note
      );

      if (response.status) {
        message.success("Xử lý chuyển trạng thái hàng loạt thành công!");
        setSelectedRowKeys([]);
        handleGetData();
      } else {
        message.error("Lỗi xử lý: " + response.message);
      }
    } catch (err: any) {
      message.error("Lỗi khi xử lý chuyển trạng thái.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: "Xác nhận xóa hàng loạt",
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} hồ sơ đã chọn? Thao tác này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          dispatch(setIsLoading(true));
          const deletePromises = selectedRowKeys.map((id) =>
            rutTienKyQuyService.delete(id.toString())
          );
          const results = await Promise.all(deletePromises);

          const failedCount = results.filter((res) => !res.status).length;
          if (failedCount === 0) {
            message.success(`Đã xóa thành công ${selectedRowKeys.length} hồ sơ!`);
            setSelectedRowKeys([]);
            handleGetData();
          } else if (failedCount < selectedRowKeys.length) {
            message.warning(`Đã xóa thành công một số hồ sơ, nhưng có ${failedCount} hồ sơ thất bại.`);
            setSelectedRowKeys([]);
            handleGetData();
          } else {
            message.error("Xóa các hồ sơ thất bại. Vui lòng kiểm tra lại quyền hạn.");
          }
        } catch (e) {
          message.error("Có lỗi xảy ra khi thực hiện xóa hàng loạt.");
          console.error(e);
        } finally {
          dispatch(setIsLoading(false));
        }
      }
    });
  };

  const handleBulkSelfAssign = async () => {
    if (selectedRowKeys.length === 0) return;

    // Lọc hồ sơ ở trạng thái Chờ duyệt và chưa được phân công
    const targetRecords = selectedRowKeys.map(key => listData.find(x => x.id === key)).filter(r => r && r.status === KyQuyConstant.ChoDuyet && !r.chuyenVienId) as RutTienKyQuyType[];

    if (targetRecords.length === 0) {
      message.warning("Không có hồ sơ hợp lệ ở trạng thái 'Chờ duyệt' và 'Chưa phân công' trong các bản ghi đã chọn!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận tự nhận rà soát hàng loạt",
      content: `Bạn có chắc chắn muốn tự nhận rà soát cho ${targetRecords.length} hồ sơ đã chọn?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          dispatch(setIsLoading(true));
          const promises = targetRecords.map(r => rutTienKyQuyService.selfAssign(r.id));
          const results = await Promise.all(promises);

          const failedCount = results.filter(res => !res.status).length;
          if (failedCount === 0) {
            message.success(`Đã nhận rà soát thành công ${targetRecords.length} hồ sơ!`);
            setSelectedRowKeys([]);
            handleGetData();
          } else {
            message.warning(`Đã nhận rà soát thành công, nhưng có ${failedCount} hồ sơ thất bại.`);
            setSelectedRowKeys([]);
            handleGetData();
          }
        } catch (e) {
          message.error("Có lỗi xảy ra khi thực hiện tự nhận rà soát hàng loạt.");
        } finally {
          dispatch(setIsLoading(false));
        }
      }
    });
  };

  const handleSelfAssign = async (id: string) => {
    try {
      dispatch(setIsLoading(true));
      const res = await rutTienKyQuyService.selfAssign(id);
      if (res.status) {
        message.success("Nhận rà soát hồ sơ thành công!");
        handleGetData();
      } else {
        message.error("Lỗi nhận rà soát: " + res.message);
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi thực hiện nhận rà soát.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleBulkAssignSubmit = async (values: { specialistId: string }) => {
    if (selectedRowKeys.length === 0) return;
    const spec = specialists.find(s => s.id === values.specialistId);
    if (!spec) return;

    // Lọc các hồ sơ chưa được phân công chuyên viên
    const targetRecords = selectedRowKeys.map(key => listData.find(x => x.id === key)).filter(r => r && !r.chuyenVienId) as RutTienKyQuyType[];

    if (targetRecords.length === 0) {
      message.warning("Tất cả hồ sơ đã chọn đều đã được phân công chuyên viên từ trước!");
      setIsBulkAssignModalOpen(false);
      return;
    }

    try {
      dispatch(setIsLoading(true));
      const promises = targetRecords.map(r =>
        rutTienKyQuyService.assign(r.id, spec.id, spec.name || spec.userName || "")
      );
      const results = await Promise.all(promises);

      const failedCount = results.filter(res => !res.status).length;
      if (failedCount === 0) {
        message.success(`Đã phân công chuyên viên cho ${targetRecords.length} hồ sơ thành công!`);
        setIsBulkAssignModalOpen(false);
        bulkAssignForm.resetFields();
        setSelectedRowKeys([]);
        handleGetData();
      } else {
        message.warning(`Đã phân công chuyên viên, nhưng có ${failedCount} hồ sơ thất bại.`);
        setIsBulkAssignModalOpen(false);
        bulkAssignForm.resetFields();
        setSelectedRowKeys([]);
        handleGetData();
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi thực hiện phân công chuyên viên hàng loạt.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleTransitionSingle = async (id: string, targetStatus: number) => {
    const record = listData.find((x) => x.id === id);
    const isSpecialistAction =
      record &&
      record.status === KyQuyConstant.ChoDuyet &&
      (targetStatus === KyQuyConstant.DaDuyetDienTu ||
        targetStatus === KyQuyConstant.CanBoSungThongTin ||
        targetStatus === KyQuyConstant.BiTuChoi);

    if (isChuyenVien && !isAdmin && isSpecialistAction) {
      if (!record || record.chuyenVienId !== currentUser?.id) {
        message.error("Hồ sơ chưa được phân công cho bạn rà soát!");
        return;
      }
    }

    if (targetStatus === KyQuyConstant.ChoDuyet) {
      const errorMsg = validateProfileForSubmission(record);
      if (errorMsg) {
        message.error(errorMsg);
        return;
      }
    }

    if (targetStatus === KyQuyConstant.CanBoSungThongTin || targetStatus === KyQuyConstant.BiTuChoi) {
      handleOpenTransitionModal([id], targetStatus);
      return;
    }

    const isRequireSign = isDoanhNghiep
      ? (targetStatus === KyQuyConstant.ChoDuyet)
      : currentUser?.isKySo;
    if (isRequireSign) {
      setPendingTransition({
        id: id,
        targetStatus: targetStatus,
        note: "",
        successMessage: "Ký số và thực hiện thao tác thành công",
      });
      setSignIds([id]);
      setIsSignModalOpen(true);
      return;
    }

    try {
      dispatch(setIsLoading(true));
      const response = await rutTienKyQuyService.transition(
        [id],
        targetStatus,
        ""
      );

      if (response.status) {
        message.success("Xử lý chuyển trạng thái thành công!");
        handleGetData();
      } else {
        message.error("Lỗi xử lý: " + response.message);
      }
    } catch (err: any) {
      message.error("Lỗi khi xử lý chuyển trạng thái.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  let tableColumns: TableProps<RutTienKyQuyType>["columns"] = [
    {
      title: "STT",
      width: 50,
      align: "center",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1 + (pageIndex - 1) * pageSize,
    },
    isDoanhNghiep ? {
      title: "Nền tảng & Website",
      width: 250,
      render: (_: any, record: RutTienKyQuyType) => (
        <div className="flex flex-col gap-1 text-sm text-gray-700">
          <span className="font-semibold text-gray-900">{record.appTenUngDung || "N/A"}</span>
        </div>
      ),
    } : {
      title: "Thông tin tổ chức & Nền tảng",
      width: 320,
      render: (_: any, record: RutTienKyQuyType) => (
        <div className="flex flex-col gap-1 text-sm text-gray-700">
          <span className="font-semibold text-gray-900">{record.tenChuQuanToChuc}</span>
          {record.maSoThue && (
            <span className="text-gray-500 text-xs">
              MST: <strong className="text-gray-800">{record.maSoThue}</strong>
            </span>
          )}
          {record.diaChiTruSoChinh && (
            <span className="text-gray-500 text-xs truncate max-w-[300px] block" title={record.diaChiTruSoChinh}>
              Đ/c: {record.diaChiTruSoChinh}
            </span>
          )}
          {(record.sdtToChuc || record.emailTiepNhan) && (
            <span className="text-gray-500 text-xs">
              {record.sdtToChuc && <span>SĐT: <strong className="text-gray-800">{record.sdtToChuc}</strong></span>}
              {record.emailTiepNhan && <span> - Email: <strong className="text-gray-800">{record.emailTiepNhan}</strong></span>}
            </span>
          )}
          {record.soNgayNoiCapGCN && (
            <span className="text-gray-500 text-xs italic">
              GCN: {record.soNgayNoiCapGCN}
            </span>
          )}
          {record.appTenUngDung && (
            <span className="text-gray-600 text-xs border-t pt-1 mt-1">
              Nền tảng: <strong className="text-gray-800">{record.appTenUngDung}</strong>
            </span>
          )}
          <span className="text-gray-500 text-xs">
            ĐDPL: {record.ddplHoVaTen || "N/A"} - {record.ddplSdt || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Thông tin giao dịch đề nghị",
      width: 300,
      render: (_: any, record: RutTienKyQuyType) => (
        <div className="flex flex-col gap-1 text-sm text-gray-700">
          <span className="font-semibold text-gray-900">Ngân hàng: {record.nganHang || "N/A"}</span>
          <div className="flex flex-col items-start gap-2 text-xs text-gray-500">
            {record.quySo && (
              <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200">
                Quỹ số: {record.quySo}
              </span>
            )}
            {record.ngay && (
              <span>
                Ngày: {formatDate(new Date(record.ngay), false)}
              </span>
            )}
          </div>
          {record.lyDo && (
            <Tooltip title={record.lyDo}>
              <span className="text-gray-500 text-xs italic truncate max-w-[280px] block">
                Lý do: {record.lyDo}
              </span>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Chuyên viên rà soát",
      dataIndex: "chuyenVienName",
      width: 180,
      align: "center" as const,
      render: (_: any, record: RutTienKyQuyType) => {
        if (isDoanhNghiep) {
          return record.chuyenVienMaCanBo || (
            <span className="text-gray-400 italic font-light">Chưa phân công</span>
          );
        }
        if (record.chuyenVienMaCanBo && record.chuyenVienName) {
          return `${record.chuyenVienMaCanBo} - ${record.chuyenVienName}`;
        }

        // Cán bộ rà soát (Chuyên viên hoặc Admin) có thể tự nhận rà soát ngay tại đây
        const canSelfAssign = (isChuyenVien || isAdmin) && !record.chuyenVienId && record.status === KyQuyConstant.ChoDuyet;
        if (canSelfAssign) {
          return (
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 italic font-light text-xs">Chưa phân công</span>
              <Button
                type="primary"
                
                icon={<UserAddOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelfAssign(record.id);
                }}
                className="text-xs"
              >
                Nhận rà soát
              </Button>
            </div>
          );
        }

        return record.chuyenVienMaCanBo || record.chuyenVienName || (
          <span className="text-gray-400 italic font-light">Chưa phân công</span>
        );
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      align: "center",
      render: (status: number, record: RutTienKyQuyType) => (
        <Tag color={KyQuyStatusColors[status] || "default"} className="px-2 py-0.5 rounded font-medium">
          {record.statusName || KyQuyStatusNames[status] || "Tạm lưu"}
        </Tag>
      ),
    },
    {
      title: "Căn cứ pháp lý & Văn bản",
      width: 300,
      render: (_: any, record: RutTienKyQuyType) => {
        const coCanCu = record.dieu || record.khoan || record.nghiDinh;
        return (
          <div className="flex flex-col gap-1 text-sm text-gray-700">
            {record.soVanBan && (
              <span className="font-semibold text-gray-900">
                Số VB: {record.soVanBan}
              </span>
            )}
            {coCanCu && (
              <span className="text-gray-600 text-xs">
                Căn cứ: {record.dieu ? `Điều ${record.dieu} ` : ""}
                {record.khoan ? `Khoản ${record.khoan} ` : ""}
                {record.nghiDinh ? `Nghị định ${record.nghiDinh}` : ""}
              </span>
            )}
            {record.vanBanTaiLieuKemTheo && (
              <Tooltip title={record.vanBanTaiLieuKemTheo}>
                <span className="text-gray-500 text-xs truncate max-w-[280px] block">
                  Kèm theo: {record.vanBanTaiLieuKemTheo}
                </span>
              </Tooltip>
            )}
            {record.diaChiNgayThangNam && (
              <span className="text-gray-400 text-xs italic">
                {record.diaChiNgayThangNam}
              </span>
            )}
          </div>
        );
      },
    },

    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 120,
      render: (_: any, record: RutTienKyQuyType) => {
        const items: MenuProps["items"] = [
          {
            label: "Chi tiết",
            key: "1",
            icon: <EyeOutlined />,
            onClick: () => {
              router.push(`/RutTienKyQuy/detail?id=${record.id}`);
            },
          },
        ];

        // Edit allowed only for DoanhNghiep if status is Draft (0) or Needs Correction (6/2)
        const isEditable = isDoanhNghiep && (record.status === 0 || record.status === 6 || record.status === 2);
        if (isEditable) {
          items.push({
            label: "Chỉnh sửa",
            key: "2",
            icon: <EditOutlined />,
            onClick: () => {
              handleShowModal(true, record);
            },
          });
        }

        // Delete allowed only for DoanhNghiep if status is Draft (0) or Needs Correction (6/2)
        const isDeletable = isDoanhNghiep && (record.status === 0 || record.status === 6 || record.status === 2);
        if (isDeletable) {
          items.push(
            {
              type: "divider",
            },
            {
              label: "Xóa",
              key: "4",
              danger: true,
              icon: <DeleteOutlined />,
              onClick: () => setOpenPopconfirmId(record.id ?? ""),
            }
          );
        }

        // Thao tác nghiệp vụ theo permission trên 1 bản ghi
        const workflowItems: MenuProps["items"] = [];

        // 1. DOANH NGHIỆP
        if (isDoanhNghiep) {
          if (record.status === KyQuyConstant.TamLuu || record.status === KyQuyConstant.CanBoSungThongTin || record.status === KyQuyConstant.DeNghiChinhSua) {
            workflowItems.push({
              label: "Nộp hồ sơ (Gửi duyệt)",
              key: "wf_nop",
              icon: <SendOutlined />,
              onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.ChoDuyet),
            });
          }
          if (record.status === KyQuyConstant.ChoDuyet) {
            workflowItems.push({
              label: "Hủy gửi hồ sơ",
              key: "wf_huy",
              danger: true,
              icon: <StopOutlined />,
              onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.DaHuyDangKy),
            });
          }
        }

        // 2. CHUYÊN VIÊN
        if (isChuyenVien && record.chuyenVienId === currentUser?.id) {
          if (record.status === KyQuyConstant.ChoDuyet) {
            workflowItems.push(
              {
                label: "Duyệt điện tử",
                key: "wf_cv_duyet",
                icon: <CheckCircleOutlined style={{ color: "#10b981" }} />,
                onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.DaDuyetDienTu),
              },
              {
                label: "Yêu cầu bổ sung",
                key: "wf_cv_bosung",
                icon: <ExclamationCircleOutlined style={{ color: "#f59e0b" }} />,
                onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.CanBoSungThongTin),
              },
              {
                label: "Từ chối",
                key: "wf_cv_tuchoi",
                danger: true,
                icon: <StopOutlined />,
                onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.BiTuChoi),
              }
            );
          }
        }

        // 3. TRƯỞNG PHÒNG
        if (isTruongPhong) {
          if (record.status === KyQuyConstant.DaDuyetDienTu) {
            workflowItems.push({
              label: "Đề nghị nộp bản cứng",
              key: "wf_tp_bancung",
              icon: <PaperClipOutlined style={{ color: "#6366f1" }} />,
              onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.CanBanGiay),
            });
          }
          if (record.status === KyQuyConstant.DaDuyetDienTu || record.status === KyQuyConstant.CanBanGiay) {
            workflowItems.push({
              label: "Đã review (Trình Lãnh đạo)",
              key: "wf_tp_review",
              icon: <FileDoneOutlined style={{ color: "#10b981" }} />,
              onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.DaReview),
            });
          }
          if (record.status === KyQuyConstant.ChoDuyet || record.status === KyQuyConstant.DaDuyetDienTu || record.status === KyQuyConstant.CanBanGiay) {
            workflowItems.push(
              {
                label: "Yêu cầu bổ sung",
                key: "wf_tp_bosung",
                icon: <ExclamationCircleOutlined style={{ color: "#f59e0b" }} />,
                onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.CanBoSungThongTin),
              },
              {
                label: "Từ chối",
                key: "wf_tp_tuchoi",
                danger: true,
                icon: <StopOutlined />,
                onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.BiTuChoi),
              }
            );
          }
        }

        // 4. LÃNH ĐẠO
        if (isLanhDao) {
          if (record.status === KyQuyConstant.DaReview) {
            workflowItems.push(
              {
                label: "Lãnh đạo phê duyệt",
                key: "wf_ld_duyet",
                icon: <CheckCircleOutlined style={{ color: "#22c55e" }} />,
                onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.DaXacNhan),
              },
              {
                label: "Yêu cầu bổ sung",
                key: "wf_ld_bosung",
                icon: <ExclamationCircleOutlined style={{ color: "#f59e0b" }} />,
                onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.CanBoSungThongTin),
              },
              {
                label: "Từ chối",
                key: "wf_ld_tuchoi",
                danger: true,
                icon: <StopOutlined />,
                onClick: () => handleTransitionSingle(record.id || "", KyQuyConstant.BiTuChoi),
              }
            );
          }
        }

        if (workflowItems.length > 0) {
          items.push(
            { type: "divider" },
            ...workflowItems
          );
        }

        return (
          <>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button onClick={(e) => e.preventDefault()} color="primary">
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa bản ghi này?"
              okText="Xóa"
              cancelText="Hủy"
              open={openPopconfirmId === record.id}
              onConfirm={() => {
                handleDelete(record.id || "");
                setOpenPopconfirmId(null);
              }}
              onCancel={() => setOpenPopconfirmId(null)}
            ></Popconfirm>
          </>
        );
      },
    },
  ];

  if (mappedStatus !== null) {
    tableColumns = tableColumns.filter((col) => !(col && "dataIndex" in col && col.dataIndex === "status"));
  }

  const handleCreateEditSuccess = () => {
    handleGetData();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await rutTienKyQuyService.delete(id);
      if (response.status) {
        message.success("Xóa thành công");
        handleGetData();
      } else {
        message.error("Xóa thất bại: " + response.message);
      }
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch = (values: RutTienKyQuySearchType) => {
    setSearchValues(values);
    setPageIndex(1);
  };

  const handleGetData = useCallback(
    async () => {
      dispatch(setIsLoading(true));
      try {
        const searchData: RutTienKyQuySearchType = {
          pageIndex,
          pageSize,
          ...(searchValues || {}),
        };
        if (mappedStatus !== null) {
          searchData.status = mappedStatus;
        } else if (activeTabKey !== "All") {
          searchData.status = parseInt(activeTabKey, 10);
        }
        const response = await rutTienKyQuyService.getData(searchData);
        if (response != null && response.data != null) {
          const data = response.data;
          setListData(data.items);
          setDataPage({
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
            totalCount: data.totalCount,
            totalPage: data.totalPage,
          });
        }

        // const countRes = await rutTienKyQuyService.getStatusCounts({ // tạm comment
        //   ...(searchValues || {}),
        // });
        // if (countRes != null && countRes.data != null) {
        //   setStatusCounts(countRes.data);
        // }

        dispatch(setIsLoading(false));
      } catch (error) {
        dispatch(setIsLoading(false));
      }
    },
    [pageIndex, pageSize, searchValues, activeTabKey, dispatch, mappedStatus],
  );

  const handleShowModal = (isEdit?: boolean, record?: RutTienKyQuyType) => {
    if (isEdit && record) {
      router.push(`/RutTienKyQuy/createOrUpdate?id=${record.id}`);
    } else {
      router.push("/RutTienKyQuy/createOrUpdate");
    }
  };


  useEffect(() => {
    handleGetData();
  }, [handleGetData]);

  const getAllowedStatuses = () => {
    if (isAdmin || isDoanhNghiep) {
      return [
        KyQuyConstant.TamLuu,
        KyQuyConstant.ChoDuyet,
        KyQuyConstant.DeNghiChinhSua,
        KyQuyConstant.BiTuChoi,
        KyQuyConstant.DaDuyetDienTu,
        KyQuyConstant.DaXacNhan,
        KyQuyConstant.CanBoSungThongTin,
        KyQuyConstant.DaHuyDangKy,
        KyQuyConstant.DaReview,
        KyQuyConstant.CanBanGiay,
      ];
    }

    if (isLanhDao) {
      // Lãnh đạo primarily cares about: DaReview, DaXacNhan, CanBoSungThongTin, BiTuChoi
      return [
        KyQuyConstant.DaReview,
        KyQuyConstant.DaXacNhan,
        KyQuyConstant.CanBoSungThongTin,
        KyQuyConstant.BiTuChoi,
      ];
    }

    if (isTruongPhong) {
      // Trưởng phòng primarily cares about: DaDuyetDienTu, CanBanGiay, DaReview, ChoDuyet, CanBoSungThongTin, BiTuChoi
      return [
        KyQuyConstant.DaDuyetDienTu,
        KyQuyConstant.CanBanGiay,
        KyQuyConstant.DaReview,
        KyQuyConstant.ChoDuyet,
        KyQuyConstant.CanBoSungThongTin,
        KyQuyConstant.BiTuChoi,
      ];
    }

    if (isChuyenVien) {
      // Chuyên viên primarily cares about: ChoDuyet, DaDuyetDienTu, CanBoSungThongTin, BiTuChoi
      return [
        KyQuyConstant.ChoDuyet,
        KyQuyConstant.DaDuyetDienTu,
        KyQuyConstant.CanBoSungThongTin,
        KyQuyConstant.BiTuChoi,
      ];
    }

    return [];
  };

  const allowedStatuses = getAllowedStatuses();

  const totalRecords = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  const tabItems = [
    {
      key: "All",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>Tất cả</span>
          <Badge
            count={totalRecords}
            overflowCount={9999}
            style={{ backgroundColor: "#1890ff" }}
          />
        </span>
      ),
    },
    ...allowedStatuses.map((status) => {
      const count = statusCounts[status] || 0;
      const color = KyQuyStatusColors[status] || "default";
      const name = KyQuyStatusNames[status] || `Trạng thái ${status}`;
      return {
        key: status.toString(),
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 500 }}>{name}</span>
            <Badge
              count={count}
              overflowCount={999}
              style={{
                backgroundColor:
                  color === "processing" ? "#1890ff" :
                    color === "warning" ? "#faad14" :
                      color === "error" ? "#ff4d4f" :
                        color === "success" ? "#52c41a" :
                          color === "cyan" ? "#13c2c2" :
                            color === "orange" ? "#fa8c16" :
                              color === "purple" ? "#722ed1" :
                                color === "blue" ? "#2f54eb" :
                                  color === "geekblue" ? "#2f54eb" :
                                    "#bfbfbf",
              }}
            />
          </span>
        ),
      };
    }),
  ];

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    setPageIndex(1);
  };

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-3 flex-wrap justify-end"
      >
        <AutoBreadcrumb />
        <Space size="middle" style={{ marginLeft: "auto" }}>
          <Button
            onClick={() => toggleSearch()}
            type="default"
            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>

          {isDoanhNghiep && (
            <Button
              onClick={() => handleShowModal()}
              type="primary"
              icon={<PlusCircleOutlined />}
            >
              Thêm mới hồ sơ
            </Button>
          )}
        </Space>
      </Flex>

      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          showSpecialistSearch={isTruongPhong || isLanhDao}
          allowedStatuses={allowedStatuses}
          activeTabKey={activeTabKey}
          isDoanhNghiep={isDoanhNghiep}
        />
      )}

      {/* Tạm comment tabs trạng thái
      {trangThaiParam === null && tabItems.length > 1 && (
        <Tabs
          activeKey={activeTabKey}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          className="mb-3"
        />
      )}
      */}

      {/* === KHỐI THAO TÁC NGHIỆP VỤ THEO PERMISSION === */}
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
          <span style={{ color: "#0369a1", fontWeight: 600, marginRight: 4, whiteSpace: "nowrap" }}>
            Đã chọn <strong>{selectedRowKeys.length}</strong> hồ sơ:
          </span>

          {/* ===== DOANH NGHIỆP ===== */}
          {isDoanhNghiep && (
            <>
              <Button size="medium" type="primary" icon={<SendOutlined />}
                onClick={() => handleBulkTransition({ targetStatus: KyQuyConstant.ChoDuyet, note: "" })}
              >Nộp hồ sơ (Gửi duyệt)</Button>
              <Button size="medium" danger icon={<StopOutlined />}
                onClick={() => handleBulkTransition({ targetStatus: KyQuyConstant.DaHuyDangKy, note: "" })}
              >Hủy đăng ký</Button>
            </>
          )}

          {/* ===== CHUYÊN VIÊN ===== */}
          {isChuyenVien && (
            <>
              <Button size="medium" type="default" icon={<UserAddOutlined />}
                style={{ color: "#2563eb", borderColor: "#2563eb" }}
                onClick={handleBulkSelfAssign}
              >Tự nhận rà soát</Button>
              <Button size="medium" type="primary" icon={<CheckCircleOutlined />}
                style={{ background: "#10b981", borderColor: "#10b981" }}
                onClick={() => handleBulkTransition({ targetStatus: KyQuyConstant.DaDuyetDienTu, note: "" })}
              >Duyệt điện tử</Button>
              <Button size="medium" icon={<ExclamationCircleOutlined />}
                style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "#fff" }}
                onClick={() => handleOpenTransitionModal(selectedRowKeys.map(k => k.toString()), KyQuyConstant.CanBoSungThongTin)}
              >Yêu cầu bổ sung</Button>
              <Button size="medium" danger icon={<StopOutlined />}
                onClick={() => handleOpenTransitionModal(selectedRowKeys.map(k => k.toString()), KyQuyConstant.BiTuChoi)}
              >Từ chối</Button>
            </>
          )}

          {/* ===== TRƯỞNG PHÒNG ===== */}
          {isTruongPhong && (
            <>
              <Button size="medium" type="default" icon={<UserAddOutlined />}
                style={{ color: "#2563eb", borderColor: "#2563eb" }}
                onClick={() => setIsBulkAssignModalOpen(true)}
              >Phân công chuyên viên</Button>
              <Button size="medium" icon={<PaperClipOutlined />}
                style={{ background: "#6366f1", borderColor: "#6366f1", color: "#fff" }}
                onClick={() => handleBulkTransition({ targetStatus: KyQuyConstant.CanBanGiay, note: "" })}
              >Đề nghị nộp bản cứng</Button>
              <Button size="medium" type="primary" icon={<FileDoneOutlined />}
                onClick={() => handleBulkTransition({ targetStatus: KyQuyConstant.DaReview, note: "" })}
              >Đã review (Trình Lãnh đạo)</Button>
              <Button size="medium" icon={<ExclamationCircleOutlined />}
                style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "#fff" }}
                onClick={() => handleOpenTransitionModal(selectedRowKeys.map(k => k.toString()), KyQuyConstant.CanBoSungThongTin)}
              >Yêu cầu bổ sung</Button>
              <Button size="medium" danger icon={<StopOutlined />}
                onClick={() => handleOpenTransitionModal(selectedRowKeys.map(k => k.toString()), KyQuyConstant.BiTuChoi)}
              >Từ chối</Button>
            </>
          )}

          {/* ===== LÃNH ĐẠO ===== */}
          {isLanhDao && (
            <>
              <Button size="medium" type="primary" icon={<CheckCircleOutlined />}
                style={{ background: "#22c55e", borderColor: "#22c55e" }}
                onClick={() => handleBulkTransition({ targetStatus: KyQuyConstant.DaXacNhan, note: "" })}
              >Lãnh đạo phê duyệt</Button>
              <Button size="medium" icon={<ExclamationCircleOutlined />}
                style={{ background: "#f59e0b", borderColor: "#f59e0b", color: "#fff" }}
                onClick={() => handleOpenTransitionModal(selectedRowKeys.map(k => k.toString()), KyQuyConstant.CanBoSungThongTin)}
              >Yêu cầu bổ sung</Button>
              <Button size="medium" danger icon={<StopOutlined />}
                onClick={() => handleOpenTransitionModal(selectedRowKeys.map(k => k.toString()), KyQuyConstant.BiTuChoi)}
              >Từ chối</Button>
            </>
          )}

          {/* ===== DEV ENVIRONMENT ADMIN UTILITY ===== */}
          {isAdmin && process.env.NODE_ENV === "development" && (
            <Button
              size="medium"
              danger
              type="primary"
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
            >
              [DEV] Xóa hàng loạt
            </Button>
          )}

          <Button type="link" size="medium" style={{ marginLeft: "auto", color: "#64748b" }}
            onClick={() => setSelectedRowKeys([])}
          >✕ Bỏ chọn</Button>
        </div>
      )}




      {/* STATE TRANSITION POPUP MODAL */}
      <TransitionModal
        open={isTransitionModalOpen}
        title={getActionTitle(transitionTargetStatus || 0)}
        form={transitionForm}
        onCancel={handleCloseTransitionModal}
        onFinish={handleTransitionSubmit}
        groupedTemplates={groupedTemplates}
      />

      {/* SPECIALIST ASSIGNMENT POPUP MODAL */}
      <Modal
        title="Phân công chuyên viên rà soát hàng loạt"
        open={isBulkAssignModalOpen}
        onCancel={() => {
          setIsBulkAssignModalOpen(false);
          bulkAssignForm.resetFields();
        }}
        onOk={() => bulkAssignForm.submit()}
        okText="Phân công"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={bulkAssignForm}
          layout="vertical"
          onFinish={handleBulkAssignSubmit}
        >
          <Form.Item
            name="specialistId"
            label="Chuyên viên xử lý"
            rules={[{ required: true, message: "Vui lòng chọn chuyên viên." }]}
          >
            <Select
              placeholder="Chọn cán bộ rà soát..."
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={specialists.map(s => ({ value: s.id, label: s.name ? `${s.name} (${s.userName})` : s.userName }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Card style={{ padding: "0px" }} className={classes.customCardShadow}>
        <div className="table-responsive">
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            onRow={(record) => {
              return {
                onClick: (event) => {
                  const target = event.target as HTMLElement;
                  if (
                    target.closest(".ant-table-selection-column") ||
                    target.closest(".ant-btn") ||
                    target.closest(".ant-dropdown") ||
                    target.closest(".ant-popover") ||
                    target.closest(".ant-popconfirm") ||
                    target.closest(".ant-dropdown-menu")
                  ) {
                    return;
                  }
                  router.push(`/RutTienKyQuy/detail?id=${record.id}`);
                },
                style: { cursor: "pointer" }
              };
            }}
            columns={tableColumns}
            bordered
            dataSource={listData}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
          />
        </div>
        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
        >
          <Pagination
            total={dataPage?.totalCount || 0}
            showTotal={(total, range) =>
              range[0] + "-" + range[1] + " trong " + total + " dữ liệu"
            }
            pageSize={pageSize}
            current={pageIndex}
            onChange={(e) => setPageIndex(e)}
            onShowSizeChange={(current, pageSize) => {
              setPageIndex(1);
              setPageSize(pageSize);
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
        signerService={rutTienKyQuyService}
      />
    </>
  );
};

export default withAuthorization(RutTienKyQuy, "RUTTIENKYQUY");
