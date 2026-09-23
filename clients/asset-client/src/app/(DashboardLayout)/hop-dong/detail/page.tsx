"use client";

import React, { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Tabs, Button, Spin, message, Modal, Form, Select } from "antd";
import {
  CalendarOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  StopOutlined,
  UserAddOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import authenticationContractService from "@/services/authenticationContract/authenticationContract.service";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import userService from "@/services/user/user.service";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { AuthenticationContractType, CreateDataType } from "@/types/authenticationContract/dto";
import { DropdownOption } from "@/types/general";
import { useSelector } from "@/store/hooks";

import RoleConstant from "@/constants/RoleConstant";
import ConstractStatusConstant from "@/constants/ConstractStatusConstant";
import ContractActionConstant from "@/constants/ContractActionConstant";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { CertificateInfo } from "@/libs/moit-sign";
import { SignResultItem } from "@/libs/moit-sign/types";
import TransitionModal from "@/components/shared-components/TransitionModal";

import HoSoInfoTab from "./HoSoInfoTab";
import DocumentsTab from "./DocumentsTab";
import HistoryTab from "./HistoryTab";
import { normalizeDropdownOptions } from "./detailUtils";
import ThongTinKySo from "../components/ThongTinKySo";
import DvcSyncLogTab from "../../QLPlatform/components/DvcSyncLogTab";
import ButtonDetail from "./ButtonDetail";

type WorkflowMenuRule = {
  currentStatus: number;
  action: number;
  roles: string[];
  fallbackLabel: string;
  danger?: boolean;
};

const editableStatuses: number[] = [
  ConstractStatusConstant.TamLuu,
  ConstractStatusConstant.DeNghiChinhSua,
  ConstractStatusConstant.CanBoSungThongTin,
];

const canEditContract = (status?: number) =>
  status !== undefined && editableStatuses.includes(status);

const workflowRules: WorkflowMenuRule[] = [
  {
    currentStatus: ConstractStatusConstant.TamLuu,
    action: ContractActionConstant.GuiDangKy,
    roles: [RoleConstant.DoanhNghiep],
    fallbackLabel: "Gửi đăng ký",
  },
  {
    currentStatus: ConstractStatusConstant.CanBoSungThongTin,
    action: ContractActionConstant.GuiBoSungThongTin,
    roles: [RoleConstant.DoanhNghiep],
    fallbackLabel: "Gửi bổ sung thông tin",
  },

  {
    currentStatus: ConstractStatusConstant.DaXacNhan,
    action: ContractActionConstant.DeNghiChamDutDangKy,
    roles: [RoleConstant.DoanhNghiep],
    fallbackLabel: "Đề nghị chấm dứt đăng ký",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.DaXacNhan,
    action: ContractActionConstant.DeNghiChinhSua,
    roles: [RoleConstant.DoanhNghiep, RoleConstant.TruongPhongSo],
    fallbackLabel: "Đề nghị chỉnh sửa",
  },
  {
    currentStatus: ConstractStatusConstant.ChoDuyet,
    action: ContractActionConstant.HuyDangKy,
    roles: [RoleConstant.DoanhNghiep],
    fallbackLabel: "Hủy đăng ký",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.ChoDuyet,
    action: ContractActionConstant.PhanCongXuLy,
    roles: [RoleConstant.TruongPhongSo],
    fallbackLabel: "Phân công xử lý",
  },
  {
    currentStatus: ConstractStatusConstant.ChoDuyet,
    action: ContractActionConstant.NhanXuLy,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Nhận xử lý",
  },
  {
    currentStatus: ConstractStatusConstant.ChoDuyet,
    action: ContractActionConstant.YeuCauBoSungThongTin,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Yêu cầu bổ sung thông tin",
  },
  {
    currentStatus: ConstractStatusConstant.ChoDuyet,
    action: ContractActionConstant.TuChoi,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Từ chối",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.ChoDuyet,
    action: ContractActionConstant.DuyetDienTu,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Duyệt điện tử",
  },
  {
    currentStatus: ConstractStatusConstant.ChoDuyet,
    action: ContractActionConstant.ChamDutDangKy,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Chấm dứt đăng ký",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.CanBoSungThongTin,
    action: ContractActionConstant.ChamDutDangKy,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Chấm dứt đăng ký",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.DeNghiChinhSua,
    action: ContractActionConstant.YeuCauBoSungThongTin,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Yêu cầu bổ sung thông tin",
  },
  {
    currentStatus: ConstractStatusConstant.DeNghiChinhSua,
    action: ContractActionConstant.TuChoi,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Từ chối",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.DeNghiChinhSua,
    action: ContractActionConstant.DuyetDienTu,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Duyệt điện tử",
  },
  {
    currentStatus: ConstractStatusConstant.DeNghiChamDutDangKy,
    action: ContractActionConstant.XacNhanChamDut,
    roles: [RoleConstant.ChuyenVienSo],
    fallbackLabel: "Xác nhận chấm dứt đăng ký",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.DaDuyetDienTu,
    action: ContractActionConstant.YeuCauBoSungThongTin,
    roles: [RoleConstant.TruongPhongSo],
    fallbackLabel: "Yêu cầu bổ sung thông tin",
  },
  // {
  //   currentStatus: ConstractStatusConstant.DaDuyetDienTu,
  //   action: ContractActionConstant.YeuCauBanGiay,
  //   roles: [RoleConstant.TruongPhongSo],
  //   fallbackLabel: "Yêu cầu bản giấy",
  // },
  {
    currentStatus: ConstractStatusConstant.DaDuyetDienTu,
    action: ContractActionConstant.TuChoi,
    roles: [RoleConstant.TruongPhongSo],
    fallbackLabel: "Từ chối",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.DaDuyetDienTu,
    action: ContractActionConstant.Review,
    roles: [RoleConstant.TruongPhongSo],
    fallbackLabel: "Đã review",
  },
  {
    currentStatus: ConstractStatusConstant.DaDuyetDienTu,
    action: ContractActionConstant.ChamDutDangKy,
    roles: [RoleConstant.TruongPhongSo],
    fallbackLabel: "Chấm dứt đăng ký",
    danger: true,
  },
  // {
  //   currentStatus: ConstractStatusConstant.CanBanGiay,
  //   action: ContractActionConstant.Review,
  //   roles: [RoleConstant.TruongPhongSo],
  //   fallbackLabel: "Đã review",
  // },
  // {
  //   currentStatus: ConstractStatusConstant.CanBanGiay,
  //   action: ContractActionConstant.ChamDutDangKy,
  //   roles: [RoleConstant.TruongPhongSo],
  //   fallbackLabel: "Chấm dứt đăng ký",
  //   danger: true,
  // },
  {
    currentStatus: ConstractStatusConstant.DaReview,
    action: ContractActionConstant.XacNhan,
    roles: [RoleConstant.LanhDaoSo],
    fallbackLabel: "Xác nhận",
  },
  {
    currentStatus: ConstractStatusConstant.DaReview,
    action: ContractActionConstant.YeuCauBoSungThongTin,
    roles: [RoleConstant.LanhDaoSo],
    fallbackLabel: "Yêu cầu bổ sung thông tin",
  },
  {
    currentStatus: ConstractStatusConstant.DaReview,
    action: ContractActionConstant.TuChoi,
    roles: [RoleConstant.LanhDaoSo],
    fallbackLabel: "Từ chối",
    danger: true,
  },
  {
    currentStatus: ConstractStatusConstant.DaReview,
    action: ContractActionConstant.ChamDutDangKy,
    roles: [RoleConstant.LanhDaoSo],
    fallbackLabel: "Chấm dứt đăng ký",
    danger: true,
  },
];

const getDropdownLabel = (
  options: DropdownOption[],
  value: string | number,
  fallback: string,
) =>
  options.find((item) => String(item.value) === String(value))?.label ||
  fallback;

const DetailPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.includes(RoleConstant.Admin);
  const isDoanhNghiep = userRoles.includes(RoleConstant.DoanhNghiep);
  const userOperationCodes: string[] = (currentUser?.menuData ?? [])
    .flatMap((module: any) => module.listMenu ?? [])
    .map((op: any) => op.code as string);
  const showSyncLog = userOperationCodes.includes("HIENTHILICHSUDONGBO");
  const showSyncButton = userOperationCodes.includes("HIENTHIBUTTONDONGBODVC");


  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<AuthenticationContractType | null>(null);
  const [createData, setCreateData] = useState<CreateDataType>({});
  const [companyDkkd, setCompanyDkkd] = useState("");
  const [activeTab, setActiveTab] = useState("ho-so");

  const [iSPOptions, setISPOptions] = useState<DropdownOption[]>([]);
  const [linhVucOptions, setLinhVucOptions] = useState<DropdownOption[]>([]);
  const [ngonNguOptions, setNgonNguOptions] = useState<DropdownOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([]);
  const [actionOptions, setActionOptions] = useState<DropdownOption[]>([]);
  const [osOptions, setOsOptions] = useState<DropdownOption[]>([]);

  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [currentSignAction, setCurrentSignAction] = useState<number | null>(null);
  const [isSignDoanhNghiep, setIsSignDoanhNghiep] = useState<boolean>(false);

  const getIsSignDoanhNghiep = useCallback(async () => {
    try {
      const res = await duLieuDanhMucService.getAllByGroupCode("CAUHINH_SIGN_NENTANG");
      if (res.status && res.data?.length) {
        const signConfig = res.data.find(
          (item: any) => item.code === "SIGN_CHUNGTHUCHOPDONGDIENTU"
        );
        setIsSignDoanhNghiep(signConfig?.priority === 1);
      }
    } catch (error) {
      console.error("Lỗi khi tải cấu hình ký số:", error);
    }
  }, []);

  useEffect(() => {
    getIsSignDoanhNghiep();
  }, [getIsSignDoanhNghiep]);

  const [specialistOptions, setSpecialistOptions] = useState<DropdownOption[]>([]);
  const [specialistLoading, setSpecialistLoading] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assignSubmitting, setAssignSubmitting] = useState<boolean>(false);
  const [assignForm] = Form.useForm();

  const [transitionModal, setTransitionModal] = useState<{
    recordId: string;
    action: number;
    title: string;
  } | null>(null);
  const [transitionForm] = Form.useForm<{ note: string }>();
  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);

  const getDropdownByKeys = (dropdowns: any, keys: string[]) => {
    for (const key of keys) {
      if (Array.isArray(dropdowns?.[key])) {
        return dropdowns[key];
      }
      const actualKey = Object.keys(dropdowns || {}).find(
        (k) => k.toLowerCase() === key.toLowerCase()
      );
      if (actualKey && Array.isArray(dropdowns?.[actualKey])) {
        return dropdowns[actualKey];
      }
    }
    return [];
  };

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await authenticationContractService.get(id);
      if (response?.data) {
        setItem(response.data);
      } else {
        message.error(response.message ?? "Không tải được chi tiết hồ sơ");
        router.push("/hop-dong");
      }
    } catch {
      message.error("Không tải được chi tiết hồ sơ");
      router.push("/hop-dong");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // 1. Load detail data
  useEffect(() => {
    if (!id) {
      message.error("Không tìm thấy mã hồ sơ");
      router.push("/hop-dong");
      return;
    }
    loadDetail();
  }, [id, loadDetail, router]);

  // 2. Load dropdowns
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const response = await authenticationContractService.getDropdowns();
        const dropdowns = response.data as any;

        setISPOptions(
          normalizeDropdownOptions(
            getDropdownByKeys(dropdowns, ["donViCungCapHosting", "DVCCHOSTING", "dvcchosting"])
          )
        );
        setLinhVucOptions(normalizeDropdownOptions(dropdowns?.authContractCategoryCode));
        setNgonNguOptions(normalizeDropdownOptions(dropdowns?.ngonNgu));
        setStatusOptions(normalizeDropdownOptions(dropdowns?.status));
        setActionOptions(normalizeDropdownOptions(dropdowns?.action));
        setOsOptions(normalizeDropdownOptions(dropdowns?.oscode));
      } catch {
        setISPOptions([]);
        setLinhVucOptions([]);
        setNgonNguOptions([]);
        setStatusOptions([]);
        setActionOptions([]);
        setOsOptions([]);
      }
    };

    loadDropdowns();
  }, []);

  // 3. Load company & legal info
  useEffect(() => {
    if (!item?.companyTaxCode) return;

    const loadCompanyData = async () => {
      try {
        const response = await authenticationContractService.getCreateContractData(
          item.companyTaxCode
        );
        setCreateData(response?.data || {});
      } catch {
        setCreateData({});
      }

      try {
        const response = await companyInfoService.getData({
          keyword: item.companyTaxCode,
          pageIndex: 1,
          pageSize: 1,
        });
        setCompanyDkkd(response?.data?.items?.[0]?.dKKD || "");
      } catch {
        setCompanyDkkd("");
      }
    };

    loadCompanyData();
  }, [item?.companyTaxCode]);

  // 4. Load Templates
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

  useEffect(() => {
    loadGroupedTemplates();
  }, [loadGroupedTemplates]);

  const filteredTemplates = useMemo(() => {
    return groupedTemplates.filter(x => x.type == 'CCDVCHUNGTHUCHDDIENTU' || x.type == 'DUNGCHUNG');
  }, [groupedTemplates]);

  // Specialists for assigning
  const loadSpecialists = useCallback(async () => {
    setSpecialistLoading(true);
    try {
      const response = await userService.getUserByRole({
        pageIndex: 1,
        pageSize: 1000,
        vaiTro: [RoleConstant.ChuyenVienSo],
      });
      const items = response?.data?.items || [];
      setSpecialistOptions(
        items
          .filter((item: any) => item?.id)
          .map((item: any) => ({
            value: item.id,
            label:
              item.name && item.userName
                ? `${item.name} (${item.userName})`
                : item.name || item.userName || item.email || item.id,
          })),
      );
    } catch (error: any) {
      setSpecialistOptions([]);
      message.error(
        error?.message || "Không tải được danh sách chuyên viên xử lý",
      );
    } finally {
      setSpecialistLoading(false);
    }
  }, []);

  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    assignForm.resetFields();
    if (!specialistOptions.length) {
      await loadSpecialists();
    }
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    assignForm.resetFields();
  };

  const handleAssignTask = async (values: { chuyenVienId: string }) => {
    if (!item?.id) return;

    setAssignSubmitting(true);
    try {
      const response =
        await authenticationContractService.asignTaskForChuyenVien(
          item.id,
          values.chuyenVienId,
        );

      if (response.status) {
        message.success(
          !response.message || response.message === "Success"
            ? "Phân công xử lý thành công"
            : response.message,
        );
        handleCloseAssignModal();
        loadDetail();
      } else {
        message.error(
          !response.message || response.message === "Success"
            ? "Phân công xử lý thất bại"
            : response.message,
        );
      }
    } catch (error: any) {
      message.error(error?.message || "Phân công xử lý thất bại");
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Sign handles
  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      setLoading(true);
      const responseSign = await authenticationContractService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      const promises = result.map((i) =>
        authenticationContractService.updateStatus(
          {},
          i.id,
          currentSignAction || ContractActionConstant.DuyetDienTu,
        )
      );
      const results = await Promise.all(promises);
      const failedCount = results.filter((r) => !r.status).length;

      if (failedCount === 0) {
        let successMsg = "Ký số và cập nhật trạng thái hồ sơ thành công";
        if (currentSignAction === ContractActionConstant.GuiDangKy) {
          successMsg = "Ký số và gửi hồ sơ đăng ký thành công";
        } else if (currentSignAction === ContractActionConstant.GuiBoSungThongTin) {
          successMsg = "Ký số và gửi bổ sung thông tin thành công";
        } else if (currentSignAction === ContractActionConstant.DuyetDienTu) {
          successMsg = "Ký số và duyệt điện tử hồ sơ thành công";
        } else if (currentSignAction === ContractActionConstant.Review) {
          successMsg = "Ký số và review hồ sơ thành công";
        } else if (currentSignAction === ContractActionConstant.XacNhan) {
          successMsg = "Ký số và xác nhận phê duyệt hồ sơ thành công";
        }
        message.success(successMsg);
        loadDetail();
      } else if (failedCount < result.length) {
        message.warning(`Đã xử lý xong, nhưng có ${failedCount} hồ sơ cập nhật trạng thái thất bại`);
        loadDetail();
      } else {
        message.error("Ký số thành công nhưng cập nhật trạng thái thất bại");
      }
    } catch (error: any) {
      message.error(error?.message || "Lỗi trong quá trình ký số và duyệt hồ sơ");
    } finally {
      setLoading(false);
      setIsSignModalOpen(false);
      setCurrentSignAction(null);
    }
  };

  // Status transitions
  const handleTransitionSubmit = async (values: { note: string }) => {
    if (!transitionModal) return;
    setLoading(true);
    try {
      const response = await authenticationContractService.updateStatus(
        { note: values.note },
        transitionModal.recordId,
        transitionModal.action,
      );

      if (response.status) {
        message.success(
          !response.message || response.message === "Success"
            ? "Cập nhật trạng thái thành công"
            : response.message,
        );
        setTransitionModal(null);
        transitionForm.resetFields();
        loadDetail();
      } else {
        message.error(
          !response.message || response.message === "Success"
            ? "Cập nhật trạng thái thất bại"
            : response.message,
        );
      }
    } catch (error: any) {
      message.error(error?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = (
    action: number,
    title: string,
  ) => {
    if (!item) return;
    Modal.confirm({
      title,
      content: "Bạn có chắc chắn muốn thực hiện thao tác này?",
      okText: "Xác nhận",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          const response = await authenticationContractService.updateStatus(
            {},
            item.id,
            action,
          );

          if (response.status) {
            message.success(
              !response.message || response.message === "Success"
                ? "Cập nhật trạng thái thành công"
                : response.message,
            );
            loadDetail();
          } else {
            message.error(
              !response.message || response.message === "Success"
                ? "Cập nhật trạng thái thất bại"
                : response.message,
            );
          }
        } catch (error: any) {
          message.error(error?.message || "Cập nhật trạng thái thất bại");
        }
      },
    });
  };

  const handleDelete = () => {
    if (!item) return;
    Modal.confirm({
      title: "Xóa hồ sơ",
      content: "Bạn có chắc chắn muốn xóa hồ sơ này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          const response = await authenticationContractService.delete(
            item.id,
          );

          if (response.status) {
            message.success(
              !response.message || response.message === "Success"
                ? "Xóa hồ sơ thành công"
                : response.message,
            );
            router.push("/hop-dong");
          } else {
            message.error(
              !response.message || response.message === "Success"
                ? "Xóa hồ sơ thất bại"
                : response.message,
            );
          }
        } catch (error: any) {
          message.error(error?.message || "Xóa hồ sơ thất bại");
        }
      },
    });
  };

  const handleTakeTask = () => {
    if (!item) return;
    Modal.confirm({
      title: "Nhận xử lý",
      content: "Bạn có chắc chắn muốn nhận xử lý hồ sơ này?",
      okText: "Xác nhận",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          const response = await authenticationContractService.takeTask(
            item.id,
          );

          if (response.status) {
            message.success(
              !response.message || response.message === "Success"
                ? "Nhận xử lý thành công"
                : response.message,
            );
            loadDetail();
          } else {
            message.error(
              !response.message || response.message === "Success"
                ? "Nhận xử lý thất bại"
                : response.message,
            );
          }
        } catch (error: any) {
          message.error(error?.message || "Nhận xử lý thất bại");
        }
      },
    });
  };

  const handleEdit = () => {
    if (!item) return;
    if (!canEditContract(item.status)) {
      message.warning(
        "Hồ sơ đang chờ duyệt hoặc đã chuyển xử lý, không được chỉnh sửa trực tiếp. Cần được duyệt về trạng thái đề nghị chỉnh sửa/bổ sung trước khi chỉnh sửa.",
      );
      return;
    }
    router.push(`/hop-dong/createOrUpdate?id=${item.id}`);
  };

  const canUseWorkflowRole = useCallback((roles: string[]) =>
    isAdmin || roles.some((role) => userRoles.includes(role)),
    [isAdmin, userRoles]
  );

  const workflowActions = useMemo(() => {
    if (!item) return [];
    const isAssigned = !!item.chuyenVienXuLyId || !!item.dauMoiXuLi;

    return workflowRules.filter((rule) => {
      if (rule.currentStatus !== item.status) return false;
      if (!canUseWorkflowRole(rule.roles)) return false;

      const isChuyenVienRule = rule.roles.includes(RoleConstant.ChuyenVienSo);
      if (isChuyenVienRule) {
        if (rule.action === ContractActionConstant.NhanXuLy) {
          return !isAssigned;
        } else {
          return isAssigned;
        }
      }

      return true;
    });
  }, [item, canUseWorkflowRole]);

  const getFormattedDate = () => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const today = new Date();
    const dayName = days[today.getDay()];
    const dateStr = dayjs(today).format("DD/MM/YYYY");
    return `${dayName}, ${dateStr}`;
  };

  if (loading || !item) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "350px", flexDirection: "column", gap: "16px" }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải dữ liệu hồ sơ...</span>
      </div>
    );
  }

  const tabItems = [
    {
      key: "ho-so",
      label: "Thông tin hồ sơ",
      children: (
        <HoSoInfoTab
          item={item}
          createData={createData}
          companyDkkd={companyDkkd}
          statusOptions={statusOptions}
          osOptions={osOptions}
          ngonNguOptions={ngonNguOptions}
          iSPOptions={iSPOptions}
          linhVucOptions={linhVucOptions}
        />
      ),
    },
    {
      key: "documents",
      label: "Tài liệu đính kèm",
      children: <DocumentsTab item={item} />,
    },
    {
      key: "signature",
      label: "Thông tin ký số",
      children: <ThongTinKySo hoSoId={item.id} signerService={authenticationContractService} />,
    },
    {
      key: "history",
      label: "Lịch sử xử lý",
      children: (
        <HistoryTab
          item={item}
          statusOptions={statusOptions}
          actionOptions={actionOptions}
        />
      ),
    },
    {
      key: "sync-log",
      label: "Lịch sử đồng bộ",
      children: <DvcSyncLogTab maHoSo={item.dvcMaHoSo} />,
    },
  ].filter(tab => tab.key !== "sync-log" || showSyncLog);

  return (
    <div className="contract-detail-view" style={{ padding: "0" }}>
      {/* TOP STICKY HEADER TOOLBAR */}
      <div className="sticky-header-toolbar" style={{ background: "#fff", padding: "12px 24px", borderBottom: "1px solid #e2e8f0", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <span style={{ cursor: "pointer" }} onClick={() => router.push("/")}>Trang chủ</span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ cursor: "pointer" }} onClick={() => router.push("/hop-dong")}>
                Chứng thực hợp đồng điện tử
              </span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>{item.name || "Chi tiết hồ sơ"}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#475569", fontSize: "13px", fontWeight: 500 }}>
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px" }} />
            <span>{getFormattedDate()}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px 24px" }}>
        <Card
          style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
          bodyStyle={{ padding: "24px" }}
        >
          <div className="flex flex-row justify-between items-center mb-3 flex-wrap gap-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/hop-dong")}
              style={{ paddingLeft: 0, color: "#64748b", fontWeight: 600 }}
            >
              Quay lại danh sách
            </Button>

            <div className="flex flex-row gap-2" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {/* Edit button */}
              {canEditContract(item.status) && (isDoanhNghiep || isAdmin) && (
                <Button
                  type="primary"
                  ghost
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Chỉnh sửa
                </Button>
              )}
              {/* Đồng bộ DVC button */}
              {item.status === ConstractStatusConstant.DaXacNhan && !isDoanhNghiep && showSyncButton && (
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: "Đồng bộ Cổng DVC",
                      content: `Bạn có chắc chắn muốn đồng bộ hồ sơ "${item.name}" lên Cổng DVC không?`,
                      okText: "Đồng bộ",
                      cancelText: "Hủy",
                      onOk: async () => {
                        try {
                          setLoading(true);
                          message.loading({ content: "Đang đồng bộ...", key: "dvc_sync_key" });
                          const res = await authenticationContractService.dvcSync(item.id);
                          if (res.status) {
                            message.success({ content: "Đồng bộ DVC thành công!", key: "dvc_sync_key" });
                            loadDetail();
                          } else {
                            message.error({ content: res.message || "Đồng bộ thất bại", key: "dvc_sync_key" });
                          }
                        } catch (err: any) {
                          message.error({ content: err.message || "Lỗi khi đồng bộ", key: "dvc_sync_key" });
                        } finally {
                          setLoading(false);
                        }
                      }
                    });
                  }}
                >
                  Đồng bộ DVC
                </Button>
              )}

              {/* Gửi đăng ký (Doanh nghiệp) */}
              {isDoanhNghiep && item.status === ConstractStatusConstant.TamLuu && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    if (isSignDoanhNghiep) {
                      setSignIds([item.id]);
                      setCurrentSignAction(ContractActionConstant.GuiDangKy);
                      setIsSignModalOpen(true);
                      return;
                    }
                    handleChangeStatus(ContractActionConstant.GuiDangKy, "Gửi đăng ký");
                  }}
                >
                  Gửi đăng ký
                </Button>
              )}

              {/* Gửi bổ sung thông tin (Doanh nghiệp) */}
              {isDoanhNghiep && item.status === ConstractStatusConstant.CanBoSungThongTin && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    if (isSignDoanhNghiep) {
                      setSignIds([item.id]);
                      setCurrentSignAction(ContractActionConstant.GuiBoSungThongTin);
                      setIsSignModalOpen(true);
                      return;
                    }
                    handleChangeStatus(ContractActionConstant.GuiBoSungThongTin, "Gửi bổ sung thông tin");
                  }}
                >
                  Gửi bổ sung thông tin
                </Button>
              )}

              {/* Delete button */}
              {(isDoanhNghiep || isAdmin) &&
                (item.status === ConstractStatusConstant.TamLuu ||
                  item.status === ConstractStatusConstant.DaHuyDangKy) && (
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                  >
                    Xóa hồ sơ
                  </Button>
                )}
              <ButtonDetail item={item} loadDetail={loadDetail} />

            </div>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="custom-tabs"
            destroyInactiveTabPane={false}
          />
        </Card>
      </div>

      <DigitalSignatureModal
        ids={signIds}
        open={isSignModalOpen}
        onCancel={() => setIsSignModalOpen(false)}
        onSignSuccess={handleSignSuccess}
        signerService={authenticationContractService}
      />

      <TransitionModal
        open={!!transitionModal}
        title={transitionModal?.title || ""}
        form={transitionForm}
        onCancel={() => {
          setTransitionModal(null);
          transitionForm.resetFields();
        }}
        onFinish={handleTransitionSubmit}
        groupedTemplates={filteredTemplates}
      />

      <Modal
        title="Phân công xử lý"
        open={isAssignModalOpen}
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
            rules={[
              { required: true, message: "Vui lòng chọn chuyên viên xử lý" },
            ]}
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
    </div>
  );
};

const ContractDetailPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "350px", flexDirection: "column", gap: "16px" }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải trang chi tiết...</span>
      </div>
    }>
      <DetailPageContent />
    </Suspense>
  );
};

export default ContractDetailPage;
