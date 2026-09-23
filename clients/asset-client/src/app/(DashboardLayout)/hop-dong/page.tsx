"use client";

import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import withAuthorization from "@/libs/authentication";
import authenticationContractService from "@/services/authenticationContract/authenticationContract.service";
import userService from "@/services/user/user.service";
import { useSelector } from "@/store/hooks";
import { AuthenticationContractType } from "@/types/authenticationContract/dto";
import { AuthenticationContractSearchType } from "@/types/authenticationContract/request";
import { DropdownOption, PagedList } from "@/types/general";
import {
  Button,
  Card,
  Dropdown,
  Form,
  FormInstance,
  MenuProps,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  message,
  Tabs,
  Badge,
  Checkbox,
  Row,
  Col,
} from "antd";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusCircleOutlined,
  SendOutlined,
  StopOutlined,
  UserAddOutlined,
  CloseOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  SyncOutlined,
  FileDoneOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { normalizeDropdownOptions } from "./detail/detailUtils";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { CertificateInfo } from "@/libs/moit-sign";
import { SignResultItem } from "@/libs/moit-sign/types";
import ContractSearch, {
  ContractSearchValues,
} from "./components/ContractSearch";
import RoleConstant from "@/constants/RoleConstant";
import ConstractStatusConstant from "@/constants/ConstractStatusConstant";
import ContractActionConstant from "@/constants/ContractActionConstant";
import formatDate from "@/utils/formatDate";
import TransitionModal from "@/components/shared-components/TransitionModal";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Tạm lưu", color: "default" },
  1: { text: "Chờ duyệt", color: "processing" },
  2: { text: "Đề nghị chỉnh sửa", color: "warning" },
  3: { text: "Đã duyệt", color: "success" },
  4: { text: "Từ chối", color: "error" },
};

const contractStatusMap: Record<number, { text: string; color: string }> = {
  ...statusMap,
  0: { text: "Tạm lưu", color: "default" },
  1: { text: "Chờ duyệt", color: "processing" },
  2: { text: "Đề nghị chỉnh sửa", color: "warning" },
  3: { text: "Bị từ chối", color: "error" },
  4: { text: "Đã duyệt điện tử", color: "cyan" },
  5: { text: "Đã xác nhận", color: "success" },
  6: { text: "Cần bổ sung thông tin", color: "warning" },
  7: { text: "Đã chấm dứt đăng ký", color: "default" },
  8: { text: "Đã huỷ đăng ký", color: "default" },
  9: { text: "Đề nghị chấm dứt đăng ký", color: "warning" },
  11: { text: "Đã yêu cầu gia hạn", color: "cyan" },
  12: { text: "Chờ gia hạn", color: "processing" },
  26: { text: "Đã review", color: "blue" },
  28: { text: "Cần bản giấy", color: "warning" },
};

const TABS_CONFIG = [
  {
    key: String(ConstractStatusConstant.ChoDuyet),
    label: "Chờ duyệt",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.TruongPhongSo,
      RoleConstant.Admin,
      RoleConstant.LanhDaoSo,
    ],
    statusValue: ConstractStatusConstant.ChoDuyet,
    color: "#fa8c16",
    icon: <ClockCircleOutlined />
  },
  {
    key: String(ConstractStatusConstant.DeNghiChinhSua),
    label: "Đề nghị chỉnh sửa",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.Admin,
      RoleConstant.TruongPhongSo,
      RoleConstant.LanhDaoSo,
    ],
    statusValue: ConstractStatusConstant.DeNghiChinhSua,
    color: "#faad14",
    icon: <ExclamationCircleOutlined />
  },
  {
    key: String(ConstractStatusConstant.BiTuChoi),
    label: "Bị từ chối",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.TruongPhongSo,
      RoleConstant.LanhDaoSo,
      RoleConstant.Admin,
    ],
    statusValue: ConstractStatusConstant.BiTuChoi,
    color: "#f5222d",
    icon: <CloseCircleOutlined />
  },
  {
    key: String(ConstractStatusConstant.DaDuyetDienTu),
    label: "Đã duyệt điện tử",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.TruongPhongSo,
      RoleConstant.Admin,
      RoleConstant.ChuyenVienSo,
      RoleConstant.LanhDaoSo,
    ],
    statusValue: ConstractStatusConstant.DaDuyetDienTu,
    color: "#13c2c2",
    icon: <CheckCircleOutlined />
  },
  {
    key: String(ConstractStatusConstant.DaXacNhan),
    label: "Đã xác nhận",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.TruongPhongSo,
      RoleConstant.LanhDaoSo,
      RoleConstant.Admin,
    ],
    statusValue: ConstractStatusConstant.DaXacNhan,
    color: "#52c41a",
    icon: <CheckCircleOutlined />
  },
  {
    key: String(ConstractStatusConstant.CanBoSungThongTin),
    label: "Cần bổ sung thông tin",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.Admin,
      RoleConstant.LanhDaoSo,
    ],
    statusValue: ConstractStatusConstant.CanBoSungThongTin,
    color: "#fa8c16",
    icon: <ExclamationCircleOutlined />
  },
  {
    key: String(ConstractStatusConstant.DaChamDutDangKy),
    label: "Đã chấm dứt đăng ký",
    roles: [],
    statusValue: ConstractStatusConstant.DaChamDutDangKy,
    color: "#f5222d",
    icon: <StopOutlined />
  },
  {
    key: String(ConstractStatusConstant.DaHuyDangKy),
    label: "Đã huỷ đăng ký",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.Admin,
    ],
    statusValue: ConstractStatusConstant.DaHuyDangKy,
    color: "#bfbfbf",
    icon: <DeleteOutlined />
  },
  {
    key: String(ConstractStatusConstant.DeNghiChamDutDangKy),
    label: "Đề nghị chấm dứt đăng ký",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.Admin,
      RoleConstant.TruongPhongSo,
      RoleConstant.LanhDaoSo,
    ],
    statusValue: ConstractStatusConstant.DeNghiChamDutDangKy,
    color: "#faad14",
    icon: <StopOutlined />
  },
  {
    key: String(ConstractStatusConstant.DaYeuCauGiaHan),
    label: "Đã yêu cầu gia hạn",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.Admin,
    ],
    statusValue: ConstractStatusConstant.DaYeuCauGiaHan,
    color: "#1890ff",
    icon: <SyncOutlined />
  },
  {
    key: String(ConstractStatusConstant.ChoGiaHan),
    label: "Chờ gia hạn",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.ChuyenVienSo,
      RoleConstant.Admin,
    ],
    statusValue: ConstractStatusConstant.ChoGiaHan,
    color: "#f5222d",
    icon: <ClockCircleOutlined />
  },
  {
    key: String(ConstractStatusConstant.DaReview),
    label: "Đã review",
    roles: [
      RoleConstant.DoanhNghiep,
      RoleConstant.TruongPhongSo,
      RoleConstant.LanhDaoSo,
      RoleConstant.Admin,
      RoleConstant.ChuyenVienSo,
    ],
    statusValue: ConstractStatusConstant.DaReview,
    color: "#2f54eb",
    icon: <FileDoneOutlined />
  },
  // {
  //   key: String(ConstractStatusConstant.CanBanGiay),
  //   label: "Cần bản giấy",
  //   roles: [
  //     RoleConstant.DoanhNghiep,
  //     RoleConstant.TruongPhongSo,
  //     RoleConstant.Admin,
  //     RoleConstant.ChuyenVienSo,
  //     RoleConstant.LanhDaoSo,
  //   ],
  //   statusValue: ConstractStatusConstant.CanBanGiay,
  //   color: "#fa8c16",
  //   icon: <FilePdfOutlined />
  // },
];

const editableStatuses: number[] = [
  ConstractStatusConstant.TamLuu,
  ConstractStatusConstant.DeNghiChinhSua,
  ConstractStatusConstant.CanBoSungThongTin,
];

const canEditContract = (status?: number) =>
  status !== undefined && editableStatuses.includes(status);

interface DynamicActionRule {
  action: number;
  code?: string;
  isEnterprise?: boolean;
  checkVisible: (
    record: AuthenticationContractType,
    isAssigned: boolean,
    isDoanhNghiep: boolean,
    isTruongPhong: boolean
  ) => boolean;
  fallbackLabel: string;
  danger?: boolean;
}

const dynamicActionRules: DynamicActionRule[] = [
  // 1. Gửi đăng ký (Doanh nghiệp)
  {
    action: ContractActionConstant.GuiDangKy,
    isEnterprise: true,
    checkVisible: (record, isAssigned, isDoanhNghiep) => isDoanhNghiep && record.status === ConstractStatusConstant.TamLuu,
    fallbackLabel: "Gửi đăng ký",
  },
  // 2. Nhận xử lý (Cán bộ)
  {
    action: ContractActionConstant.NhanXuLy,
    code: "ACTION_NHANXULY",
    checkVisible: (record, isAssigned) => record.status === ConstractStatusConstant.ChoDuyet && !isAssigned,
    fallbackLabel: "Nhận xử lý",
  },
  // 3. Phân công xử lý (Cán bộ)
  {
    action: ContractActionConstant.PhanCongXuLy,
    code: "ACTION_PHANCONGXULY",
    checkVisible: (record) => record.status === ConstractStatusConstant.ChoDuyet,
    fallbackLabel: "Phân công xử lý",
  },
  // 4. Gửi bổ sung thông tin (Doanh nghiệp)
  {
    action: ContractActionConstant.GuiBoSungThongTin,
    isEnterprise: true,
    checkVisible: (record, isAssigned, isDoanhNghiep) => isDoanhNghiep && record.status === ConstractStatusConstant.CanBoSungThongTin,
    fallbackLabel: "Gửi bổ sung thông tin",
  },
  // 6. Đề nghị chấm dứt đăng ký (Doanh nghiệp)
  {
    action: ContractActionConstant.DeNghiChamDutDangKy,
    isEnterprise: true,
    checkVisible: (record, isAssigned, isDoanhNghiep) => isDoanhNghiep && record.status === ConstractStatusConstant.DaXacNhan,
    fallbackLabel: "Đề nghị chấm dứt đăng ký",
    danger: true,
  },
  // 7. Đề nghị chỉnh sửa (Doanh nghiệp hoặc Trưởng phòng)
  {
    action: ContractActionConstant.DeNghiChinhSua,
    isEnterprise: true,
    checkVisible: (record, isAssigned, isDoanhNghiep, isTruongPhong) => (isDoanhNghiep || isTruongPhong) && record.status === ConstractStatusConstant.DaXacNhan,
    fallbackLabel: "Đề nghị chỉnh sửa",
  },
  // 8. Hủy đăng ký (Doanh nghiệp)
  {
    action: ContractActionConstant.HuyDangKy,
    isEnterprise: true,
    checkVisible: (record, isAssigned, isDoanhNghiep) => isDoanhNghiep && record.status === ConstractStatusConstant.ChoDuyet,
    fallbackLabel: "Hủy đăng ký",
    danger: true,
  },
  // 9. Yêu cầu bổ sung thông tin (Cán bộ)
  {
    action: ContractActionConstant.YeuCauBoSungThongTin,
    code: "ACTION_YEUCAUBOSUNGTHONGTIN_CV",
    checkVisible: (record, isAssigned) => isAssigned && ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.DeNghiChinhSua] as number[]).includes(record.status as number),
    fallbackLabel: "Yêu cầu bổ sung thông tin",
  },
  {
    action: ContractActionConstant.YeuCauBoSungThongTin,
    code: "ACTION_YEUCAUBOSUNGTHONGTIN_TP",
    checkVisible: (record) => record.status === ConstractStatusConstant.DaDuyetDienTu,
    fallbackLabel: "Yêu cầu bổ sung thông tin",
  },
  {
    action: ContractActionConstant.YeuCauBoSungThongTin,
    code: "ACTION_YEUCAUBOSUNGTHONGTIN_LD",
    checkVisible: (record) => record.status === ConstractStatusConstant.DaReview,
    fallbackLabel: "Yêu cầu bổ sung thông tin",
  },
  // 10. Từ chối (Cán bộ)
  {
    action: ContractActionConstant.TuChoi,
    code: "ACTION_TUCHOI_CV",
    checkVisible: (record, isAssigned) => isAssigned && ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.DeNghiChinhSua] as number[]).includes(record.status as number),
    fallbackLabel: "Từ chối",
    danger: true,
  },
  {
    action: ContractActionConstant.TuChoi,
    code: "ACTION_TUCHOI_TP",
    checkVisible: (record) => record.status === ConstractStatusConstant.DaDuyetDienTu,
    fallbackLabel: "Từ chối",
    danger: true,
  },
  {
    action: ContractActionConstant.TuChoi,
    code: "ACTION_TUCHOI_LD",
    checkVisible: (record) => record.status === ConstractStatusConstant.DaReview,
    fallbackLabel: "Từ chối",
    danger: true,
  },
  // 11. Duyệt điện tử (Cán bộ)
  {
    action: ContractActionConstant.DuyetDienTu,
    code: "ACTION_DUYETDIENTU",
    checkVisible: (record, isAssigned) => isAssigned && ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.DeNghiChinhSua] as number[]).includes(record.status as number),
    fallbackLabel: "Duyệt điện tử",
  },
  // 12. Chấm dứt đăng ký (Cán bộ)
  {
    action: ContractActionConstant.ChamDutDangKy,
    code: "ACTION_CHAMDUTDANGKY_CV",
    checkVisible: (record, isAssigned) => isAssigned && ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.CanBoSungThongTin] as number[]).includes(record.status as number),
    fallbackLabel: "Chấm dứt đăng ký",
    danger: true,
  },
  {
    action: ContractActionConstant.ChamDutDangKy,
    code: "ACTION_CHAMDUTDANGKY_TP",
    checkVisible: (record) => record.status === ConstractStatusConstant.DaDuyetDienTu,
    fallbackLabel: "Chấm dứt đăng ký",
    danger: true,
  },
  {
    action: ContractActionConstant.ChamDutDangKy,
    code: "ACTION_CHAMDUTDANGKY_LD",
    checkVisible: (record) => record.status === ConstractStatusConstant.DaReview,
    fallbackLabel: "Chấm dứt đăng ký",
    danger: true,
  },
  // 13. Xác nhận chấm dứt đăng ký (Cán bộ)
  {
    action: ContractActionConstant.XacNhanChamDut,
    code: "ACTION_XACNHANCHAMDUT",
    checkVisible: (record) => record.status === ConstractStatusConstant.DeNghiChamDutDangKy,
    fallbackLabel: "Xác nhận chấm dứt đăng ký",
    danger: true,
  },
  // 14. Đã review (Cán bộ)
  {
    action: ContractActionConstant.Review,
    code: "ACTION_REVIEW",
    checkVisible: (record) => record.status === ConstractStatusConstant.DaDuyetDienTu,
    fallbackLabel: "Đã review",
  },
  // 15. Xác nhận phê duyệt (Cán bộ)
  {
    action: ContractActionConstant.XacNhan,
    code: "ACTION_XACNHAN",
    checkVisible: (record) => record.status === ConstractStatusConstant.DaReview,
    fallbackLabel: "Xác nhận",
  },
];

const getDropdownLabel = (
  options: DropdownOption[],
  value: string | number,
  fallback: string,
) =>
  options.find((item) => String(item.value) === String(value))?.label ||
  fallback;

const STATUS_ALIAS_MAP: Record<string, string> = {
  "tam-luu": String(ConstractStatusConstant.TamLuu),
  "cho-duyet": String(ConstractStatusConstant.ChoDuyet),
  "de-nghi-chinh-sua": String(ConstractStatusConstant.DeNghiChinhSua),
  "bi-tu-choi": String(ConstractStatusConstant.BiTuChoi),
  "da-duyet-dien-tu": String(ConstractStatusConstant.DaDuyetDienTu),
  "da-xac-nhan": String(ConstractStatusConstant.DaXacNhan),
  "can-bo-sung-thong-tin": String(ConstractStatusConstant.CanBoSungThongTin),
  "da-cham-dut-dang-ky": String(ConstractStatusConstant.DaChamDutDangKy),
  "da-huy-dang-ky": String(ConstractStatusConstant.DaHuyDangKy),
  "de-nghi-cham-dut-dang-ky": String(ConstractStatusConstant.DeNghiChamDutDangKy),
  "da-yeu-cau-gia-han": String(ConstractStatusConstant.DaYeuCauGiaHan),
  "cho-gia-han": String(ConstractStatusConstant.ChoGiaHan),
  "da-review": String(ConstractStatusConstant.DaReview),
  // "can-ban-giay": String(ConstractStatusConstant.CanBanGiay),
};

const EXPORT_FIELDS_OPTIONS = [
  { value: "name", label: "Tên nền tảng" },
  { value: "domain", label: "Tên miền / Website" },
  { value: "chuSoHuu", label: "Chủ sở hữu" },
  { value: "companyTaxCode", label: "Mã số thuế" },
  { value: "representerNameOnline", label: "Người đại diện" },
  { value: "representerMobileOnline", label: "SĐT đại diện" },
  { value: "representerEmailOnline", label: "Email đại diện" },
  { value: "statusName", label: "Trạng thái" },
  { value: "dauMoiXuLi", label: "Chuyên viên xử lý" },
  { value: "createdDate", label: "Ngày tạo" },
  { value: "updatedDate", label: "Ngày cập nhật" },
];

const calculateDaysDiff = (startDateStr: Date | string | undefined, isWorkingDays: boolean) => {
  if (!startDateStr) return 0;
  const startDate = new Date(startDateStr);
  const endDate = new Date();

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (startDate > endDate) return 0;

  if (!isWorkingDays) {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    let count = 0;
    const curDate = new Date(startDate);
    while (curDate < endDate) {
      curDate.setDate(curDate.getDate() + 1);
      const day = curDate.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
    }
    return count;
  }
};

// Danh sách trạng thái kết thúc — khi đạt các trạng thái này thì ngừng đếm quá hạn
const FINAL_STATUSES: number[] = [
  ConstractStatusConstant.DaXacNhan,
  ConstractStatusConstant.BiTuChoi,
  ConstractStatusConstant.CanBoSungThongTin,
  ConstractStatusConstant.DaChamDutDangKy,
  ConstractStatusConstant.DaHuyDangKy,
];

const QLChungThucHopDongDienTuPage: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<PagedList<AuthenticationContractType>>();
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportFields, setExportFields] = useState<string[]>([
    "name",
    "domain",
    "chuSoHuu",
    "companyTaxCode",
    "representerNameOnline",
    "statusName",
    "createdDate",
  ]);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [isOpenForm, setIsOpenForm] = useState<boolean>(false);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [currentItem, setCurrentItem] =
    useState<AuthenticationContractType | null>(null);
  const [detailItem, setDetailItem] =
    useState<AuthenticationContractType | null>(null);
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
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([]);
  const [actionOptions, setActionOptions] = useState<DropdownOption[]>([]);
  const [specialistOptions, setSpecialistOptions] = useState<DropdownOption[]>(
    [],
  );
  const [specialistLoading, setSpecialistLoading] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isBulkAssign, setIsBulkAssign] = useState<boolean>(false);
  const [assignRecord, setAssignRecord] =
    useState<AuthenticationContractType | null>(null);
  const [assignSubmitting, setAssignSubmitting] = useState<boolean>(false);
  const [assignForm] = Form.useForm();
  const [searchValues, setSearchValues] = useState<ContractSearchValues>({});
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [transitionModal, setTransitionModal] = useState<{
    recordId: string;
    action: number;
    title: string;
  } | null>(null);
  const [transitionForm] = Form.useForm<{ note: string }>();
  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);


  const loadGroupedTemplates = useCallback(async () => {
    try {
      const res = await mauTraLoiService.getGroupedTemplates();
      if (res.status && res.data) {
        setGroupedTemplates(res.data);
        console.log("Grouped templates:", res.data);
      }
    } catch (e) {
      console.error("Lỗi khi tải mẫu trả lời:", e);
    }
  }, []);

  useEffect(() => {
    loadGroupedTemplates();
  }, [loadGroupedTemplates]);

  const filteredTemplates = useMemo(() => {
    // return groupedTemplates.filter(group => {
    //   const name = (group.typeName || group.type || "").toLowerCase();
    //   return (
    //     name.includes("chứng thực") ||
    //     name.includes("chung thuc") ||
    //     name.includes("dùng chung") ||
    //     name.includes("dung chung")
    //   );
    // });

    return groupedTemplates.filter(x => x.type == 'CCDVCHUNGTHUCHDDIENTU' || x.type == 'DUNGCHUNG');
  }, [groupedTemplates]);

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
        refreshData();
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
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState.User;
  const userRoles: string[] = currentUser?.listRole || authState.ListRole || [];
  const isAdmin = userRoles.includes(RoleConstant.Admin);
  const isDoanhNghiep = userRoles.includes(RoleConstant.DoanhNghiep);
  const isChuyenVien = userRoles.includes(RoleConstant.ChuyenVienSo);
  const isTruongPhong = userRoles.includes(RoleConstant.TruongPhongSo);
  const isLanhDao = userRoles.includes(RoleConstant.LanhDaoSo);

  const userOperations = useMemo(() => {
    return currentUser?.menuData?.find(
      (item: any) => item.code === "HOPDONG"
    )?.listMenu || [];
  }, [currentUser]);

  const operationMap = useMemo(() => {
    return Object.fromEntries(
      userOperations.map((op: any) => [op.code, op])
    );
  }, [userOperations]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get("status");

  useEffect(() => {
    setPageIndex(1);
    setSelectedRowKeys([]);
  }, [statusFromUrl]);

  const selectedContracts = useMemo(() => {
    return data?.items?.filter((item) => selectedRowKeys.includes(item.id)) || [];
  }, [data?.items, selectedRowKeys]);

  const canBulkSignChuyenVien = useMemo(() => {
    return selectedContracts.length > 0 && selectedContracts.every(
      item => item.status === ConstractStatusConstant.ChoDuyet || item.status === ConstractStatusConstant.DeNghiChinhSua
    );
  }, [selectedContracts]);

  const canBulkSignTruongPhong = useMemo(() => {
    // return selectedContracts.length > 0 && selectedContracts.every(
    //   item => item.status === ConstractStatusConstant.DaDuyetDienTu || item.status === ConstractStatusConstant.CanBanGiay
    // );
    return selectedContracts.length > 0 && selectedContracts.every(
      item => item.status === ConstractStatusConstant.DaDuyetDienTu
    );
  }, [selectedContracts]);

  const canBulkSignLanhDao = useMemo(() => {
    return selectedContracts.length > 0 && selectedContracts.every(
      item => item.status === ConstractStatusConstant.DaReview
    );
  }, [selectedContracts]);

  const canBulkAssignTruongPhong = useMemo(() => {
    return selectedContracts.length > 0 && selectedContracts.every(
      item => item.status === ConstractStatusConstant.ChoDuyet
    );
  }, [selectedContracts]);

  const canBulkTakeChuyenVien = useMemo(() => {
    return selectedContracts.length > 0 && selectedContracts.every(
      item => item.status === ConstractStatusConstant.ChoDuyet
    );
  }, [selectedContracts]);

  const handleBulkSign = (action: number) => {
    setSignIds(selectedRowKeys as string[]);
    setCurrentSignAction(action);
    setIsSignModalOpen(true);
  };

  const rowSelectionConfig = (isChuyenVien || isTruongPhong || isLanhDao || isAdmin)
    ? {
      selectedRowKeys,
      onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
      fixed: true as const,
    }
    : undefined;

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const response = await authenticationContractService.getDropdowns();
        const dropdowns = response.data as any;
        setStatusOptions(normalizeDropdownOptions(dropdowns?.status));
        setActionOptions(normalizeDropdownOptions(dropdowns?.action));
      } catch (error) {
        setStatusOptions([]);
        setActionOptions([]);
      }
    };

    loadDropdowns();
  }, []);

  const handleLoadData = useCallback(async () => {
    setLoading(true);
    try {
      const search: AuthenticationContractSearchType = {
        pageIndex,
        pageSize,
        ...(!isAdmin && isDoanhNghiep && currentUser?.userName
          ? { companyTaxCode: currentUser.userName }
          : {}),
        ...(statusFromUrl ? { status: Number(STATUS_ALIAS_MAP[statusFromUrl] || statusFromUrl) } : {}),
        ...(searchValues.name ? { name: searchValues.name } : {}),
        ...(searchValues.domain ? { domain: searchValues.domain } : {}),
        ...(searchValues.chuSoHuu ? { chuSoHuu: searchValues.chuSoHuu } : {}),
        ...(searchValues.companyTaxCode ? { companyTaxCode: searchValues.companyTaxCode } : {}),
        ...(searchValues.representerNameOnline
          ? { representerNameOnline: searchValues.representerNameOnline }
          : {}),
        ...(searchValues.representerMobileOnline
          ? { representerMobileOnline: searchValues.representerMobileOnline }
          : {}),
        ...(searchValues.representerEmailOnline
          ? { representerEmailOnline: searchValues.representerEmailOnline }
          : {}),
        ...(searchValues.chuyenVienXuLyId
          ? { chuyenVienXuLyId: searchValues.chuyenVienXuLyId }
          : {}),
        ...(searchValues.createdDateFrom ? { createdDateFrom: searchValues.createdDateFrom } : {}),
        ...(searchValues.createdDateTo ? { createdDateTo: searchValues.createdDateTo } : {}),
        ...(searchValues.status !== undefined ? { status: searchValues.status } : {}),
      };
      const response = await authenticationContractService.getData(search);
      if (response?.data) {
        setData(response.data);
      }


    } catch (error: any) {
      message.error(error?.message || "Lỗi tải danh sách hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [
    currentUser?.id,
    currentUser?.userName,
    isAdmin,
    isChuyenVien,
    isDoanhNghiep,
    pageIndex,
    pageSize,
    statusFromUrl,
    searchValues,
  ]);

  const refreshData = useCallback(() => {
    handleLoadData();
  }, [handleLoadData]);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  const handleCreate = () => {
    router.push("/hop-dong/createOrUpdate");
  };

  const getDetailData = async (record: AuthenticationContractType) => {
    const response = await authenticationContractService.get(record.id);
    return response?.data || record;
  };

  const handleShowDetail = (record: AuthenticationContractType) => {
    router.push(`/hop-dong/detail?id=${record.id}`);
  };



  const handleEdit = async (record: AuthenticationContractType) => {
    if (!canEditContract(record.status)) {
      message.warning(
        "Hồ sơ đang chờ duyệt hoặc đã chuyển xử lý, không được chỉnh sửa trực tiếp. Cần được duyệt về trạng thái đề nghị chỉnh sửa/bổ sung trước khi chỉnh sửa.",
      );
      return;
    }
    router.push(`/hop-dong/createOrUpdate?id=${record.id}`);
  };

  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      setLoading(true);
      // 1. Submit signatures to the backend
      const responseSign = await authenticationContractService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      // 2. Perform the workflow status update
      const promises = result.map((item) =>
        authenticationContractService.updateStatus(
          {},
          item.id,
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
        setSelectedRowKeys([]);
        refreshData();
      } else if (failedCount < result.length) {
        message.warning(`Đã xử lý xong, nhưng có ${failedCount} hồ sơ cập nhật trạng thái thất bại`);
        setSelectedRowKeys([]);
        refreshData();
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

  const handleOpenAssignModal = async (record: AuthenticationContractType) => {
    setIsBulkAssign(false);
    setAssignRecord(record);
    setIsAssignModalOpen(true);
    assignForm.resetFields();
    if (!specialistOptions.length) {
      await loadSpecialists();
    }
  };

  const handleOpenBulkAssignModal = async () => {
    setIsBulkAssign(true);
    setAssignRecord(null);
    setIsAssignModalOpen(true);
    assignForm.resetFields();
    if (!specialistOptions.length) {
      await loadSpecialists();
    }
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setAssignRecord(null);
    setIsBulkAssign(false);
    assignForm.resetFields();
  };

  const handleAssignTask = async (values: { chuyenVienId: string }) => {
    if (!isBulkAssign && !assignRecord?.id) return;
    if (isBulkAssign && selectedRowKeys.length === 0) return;

    setAssignSubmitting(true);
    try {
      const response = isBulkAssign
        ? await authenticationContractService.asignTasksMultiple({
          ids: selectedRowKeys as string[],
          chuyenVienId: values.chuyenVienId,
        })
        : await authenticationContractService.asignTaskForChuyenVien(
          assignRecord!.id,
          values.chuyenVienId,
        );

      if (response.status) {
        message.success(
          !response.message || response.message === "Success"
            ? "Phân công xử lý thành công"
            : response.message,
        );
        setSelectedRowKeys([]);
        handleCloseAssignModal();
        refreshData();
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

  const handleExportExcel = async () => {
    if (exportFields.length === 0) {
      message.error("Vui lòng chọn ít nhất một trường để xuất!");
      return;
    }
    setExportLoading(true);
    try {
      const search: AuthenticationContractSearchType = {
        pageIndex: 1,
        pageSize: 1000000,
        ...(!isAdmin && isDoanhNghiep && currentUser?.userName
          ? { companyTaxCode: currentUser.userName }
          : {}),
        ...(statusFromUrl ? { status: Number(STATUS_ALIAS_MAP[statusFromUrl] || statusFromUrl) } : {}),
        ...(searchValues.name ? { name: searchValues.name } : {}),
        ...(searchValues.domain ? { domain: searchValues.domain } : {}),
        ...(searchValues.chuSoHuu ? { chuSoHuu: searchValues.chuSoHuu } : {}),
        ...(searchValues.companyTaxCode ? { companyTaxCode: searchValues.companyTaxCode } : {}),
        ...(searchValues.representerNameOnline
          ? { representerNameOnline: searchValues.representerNameOnline }
          : {}),
        ...(searchValues.representerMobileOnline
          ? { representerMobileOnline: searchValues.representerMobileOnline }
          : {}),
        ...(searchValues.representerEmailOnline
          ? { representerEmailOnline: searchValues.representerEmailOnline }
          : {}),
        ...(searchValues.chuyenVienXuLyId
          ? { chuyenVienXuLyId: searchValues.chuyenVienXuLyId }
          : {}),
        ...(searchValues.createdDateFrom ? { createdDateFrom: searchValues.createdDateFrom } : {}),
        ...(searchValues.createdDateTo ? { createdDateTo: searchValues.createdDateTo } : {}),
        ...(searchValues.status !== undefined ? { status: searchValues.status } : {}),
      };

      const res = await authenticationContractService.exportExcel({
        search,
        selectedFields: exportFields,
      });

      if (res?.status && res.data) {
        const byteCharacters = atob(res.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `DanhSachHopDong_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success("Xuất dữ liệu Excel thành công!");
        setIsExportModalOpen(false);
      } else {
        message.error(res?.message || "Lỗi khi xuất file Excel!");
      }
    } catch (error: any) {
      message.error(error?.message || "Lỗi hệ thống khi xuất Excel!");
    } finally {
      setExportLoading(false);
    }
  };

  const handleChangeStatus = (
    record: AuthenticationContractType,
    action: number,
    title: string,
  ) => {
    Modal.confirm({
      title,
      content: "Bạn có chắc chắn muốn thực hiện thao tác này?",
      okText: "Xác nhận",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          const response = await authenticationContractService.updateStatus(
            {},
            record.id,
            action,
          );

          if (response.status) {
            message.success(
              !response.message || response.message === "Success"
                ? "Cập nhật trạng thái thành công"
                : response.message,
            );
            refreshData();
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

  const handleDelete = (record: AuthenticationContractType) => {
    Modal.confirm({
      title: "Xóa hồ sơ",
      content: "Bạn có chắc chắn muốn xóa hồ sơ này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          const response = await authenticationContractService.delete(
            record.id,
          );

          if (response.status) {
            message.success(
              !response.message || response.message === "Success"
                ? "Xóa hồ sơ thành công"
                : response.message,
            );
            refreshData();
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

  const handleTakeTask = (record: AuthenticationContractType) => {
    Modal.confirm({
      title: "Nhận xử lý",
      content: "Bạn có chắc chắn muốn nhận xử lý hồ sơ này?",
      okText: "Xác nhận",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          const response = await authenticationContractService.takeTask(
            record.id,
          );

          if (response.status) {
            message.success(
              !response.message || response.message === "Success"
                ? "Nhận xử lý thành công"
                : response.message,
            );
            refreshData();
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

  const handleBulkTake = () => {
    Modal.confirm({
      title: "Nhận xử lý",
      content: `Bạn có chắc chắn muốn nhận xử lý ${selectedRowKeys.length} hồ sơ đã chọn?`,
      okText: "Xác nhận",
      cancelText: "Đóng",
      onOk: async () => {
        setLoading(true);
        try {
          const response = await authenticationContractService.takeTasksMultiple({
            ids: selectedRowKeys as string[],
          });
          if (response.status) {
            message.success("Nhận xử lý thành công");
            setSelectedRowKeys([]);
            refreshData();
          } else {
            message.error(response.message || "Nhận xử lý thất bại");
          }
        } catch (error: any) {
          message.error(error?.message || "Nhận xử lý thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const buildWorkflowMenuItems = (
    record: AuthenticationContractType,
  ): NonNullable<MenuProps["items"]> => {
    const isAssigned = !!record.chuyenVienXuLyId || !!record.dauMoiXuLi;

    return dynamicActionRules
      .filter((rule) => {
        if (!rule.isEnterprise && (!rule.code || !operationMap[rule.code])) return false;
        return rule.checkVisible(record, isAssigned, isDoanhNghiep, isTruongPhong);
      })
      .map((rule) => ({
        key: `wf_${record.status}_${rule.action}`,
        label: getDropdownLabel(actionOptions, rule.action, rule.fallbackLabel),
        danger: rule.danger,
        icon:
          rule.action === ContractActionConstant.PhanCongXuLy ? (
            <UserAddOutlined />
          ) : rule.danger ? (
            <StopOutlined />
          ) : (
            <SendOutlined />
          ),
        onClick: (info: any) => {
          if (info?.domEvent) {
            info.domEvent.stopPropagation();
          }
          const title = getDropdownLabel(
            actionOptions,
            rule.action,
            rule.fallbackLabel,
          );

          const isRequireSign = isDoanhNghiep ? isSignDoanhNghiep : !!currentUser?.isKySo;
          if (
            isRequireSign && (
              rule.action === ContractActionConstant.DuyetDienTu ||
              rule.action === ContractActionConstant.GuiDangKy ||
              rule.action === ContractActionConstant.GuiBoSungThongTin ||
              rule.action === ContractActionConstant.Review ||
              rule.action === ContractActionConstant.XacNhan
            )
          ) {
            setSignIds([record.id]);
            setCurrentSignAction(rule.action);
            setIsSignModalOpen(true);
            return;
          }

          if (rule.action === ContractActionConstant.PhanCongXuLy) {
            handleOpenAssignModal(record);
            return;
          }

          if (rule.action === ContractActionConstant.NhanXuLy) {
            handleTakeTask(record);
            return;
          }

          if (
            rule.action === ContractActionConstant.YeuCauBoSungThongTin ||
            rule.action === ContractActionConstant.TuChoi ||
            rule.action === ContractActionConstant.ChamDutDangKy
          ) {
            setTransitionModal({
              recordId: record.id,
              action: rule.action,
              title: title,
            });
            return;
          }

          handleChangeStatus(record, rule.action, title);
        },
      }));
  };

  const columns: TableProps<AuthenticationContractType>["columns"] = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_: any, __: AuthenticationContractType, index: number) =>
        (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: "Thông tin nền tảng",
      key: "name_info",
      width: 220,
      render: (_: any, record: AuthenticationContractType) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            onClick={() => handleShowDetail(record)}
            style={{
              fontWeight: 700,
              color: "#1890ff",
              fontSize: "14px",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#40a9ff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#1890ff")}
          >
            {record.name || "—"}
          </div>
          <div>
            {record.domain ? (
              <a
                href={record.domain.startsWith("http") ? record.domain : `https://${record.domain}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "12px", fontWeight: 500, color: "#2563eb", textDecoration: "underline" }}
              >
                🔗 {record.domain}
              </a>
            ) : (
              <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>Không có website</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin doanh nghiệp chủ quản",
      key: "details",
      className: "company-info-cell",
      render: (_: any, record: AuthenticationContractType) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "12px", color: "#64748b" }}>
          <div
            onClick={() => router.push(`/QLDoanhNghiep/detail?taxCode=${record.companyTaxCode}`)}
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1890ff",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#40a9ff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#1890ff")}
          >
            {record.chuSoHuu || "—"}
          </div>
          {record.companyTaxCode && (
            <div style={{ fontSize: "11px" }}>
              MST: <span style={{ fontWeight: 500, color: "#0f172a" }}>{record.companyTaxCode}</span>
            </div>
          )}
          {record.representerEmailOnline && (
            <div style={{ fontSize: "11px" }}>
              Email: <a href={`mailto:${record.representerEmailOnline}`} style={{ color: "#2563eb" }}>{record.representerEmailOnline}</a>
            </div>
          )}
          {record.representerMobileOnline && (
            <div style={{ fontSize: "11px" }}>
              SĐT: <span style={{ fontWeight: 500, color: "#0f172a" }}>{record.representerMobileOnline}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Đại diện pháp luật",
      key: "representer",
      render: (_: any, record: AuthenticationContractType) => (
        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "12px" }}>
          {record.representerNameOnline || "Chưa cập nhật"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      align: "center",
      render: (status: number, record: AuthenticationContractType) => {
        const item = contractStatusMap[status] || {
          text: "Không xác định",
          color: "default",
        };

        const isThuHoi = status === ConstractStatusConstant.DeNghiChamDutDangKy || status === ConstractStatusConstant.DaChamDutDangKy;
        const isSuaDoi = !isThuHoi && (!!record.lyDoDeNghiCapNhat || status === ConstractStatusConstant.DaYeuCauGiaHan || status === ConstractStatusConstant.ChoGiaHan);

        let overdueText = null;
        // Chỉ tính quá hạn cho trạng thái chờ, không tính cho trạng thái kết thúc
        if (!FINAL_STATUSES.includes(status)) {
          const startDate = record.submitDate || record.createdDate;
          if (startDate) {
            const isWorkingDays = true;
            const elapsedDays = calculateDaysDiff(startDate, isWorkingDays);
            const limitDays = 30;
            if (elapsedDays > limitDays) {
              overdueText = (
                <span style={{ color: "#ff4d4f", fontSize: "11px", display: "block", marginTop: 4, fontWeight: "bold" }}>
                  Quá hạn {elapsedDays - limitDays} ngày
                </span>
              );
            }
          }
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Tag color={item.color} style={{ borderRadius: 12, padding: "2px 10px", fontWeight: 700, margin: 0 }}>
              {getDropdownLabel(statusOptions, status, item.text)}
            </Tag>
            {overdueText}
          </div>
        );
      },
    },
    {
      title: "Thời gian xử lý",
      key: "progress",
      width: 180,
      render: (_: any, record: AuthenticationContractType) => {
        const createdStr = record.createdDate ? formatDate(record.createdDate, true) : "—";
        const updatedStr = record.updatedDate ? formatDate(record.updatedDate, true) : "—";
        return (
          <div style={{ fontSize: "12px", color: "#475569" }}>
            <div>
              <span style={{ color: "#6b7280" }}>Ngày tạo:</span> <span style={{ fontWeight: 500 }}>{createdStr}</span>
            </div>
            <div style={{ marginTop: 2 }}>
              <span style={{ color: "#6b7280" }}>Cập nhật:</span> <span style={{ fontWeight: 500 }}>{updatedStr}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Người xử lý",
      width: 150,
      align: "center",
      render: (_: any, record: AuthenticationContractType) => {
        if (record.dauMoiXuLi) {
          return <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500 }}>{record.dauMoiXuLi}</Tag>;
        }
        return <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa phân công</span>;
      },
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      width: 120,
      align: "center",
      className: "actions-cell",
      render: (_: any, record: AuthenticationContractType) => {
        const items: NonNullable<MenuProps["items"]> = [
          {
            key: "detail",
            label: "Chi tiết",
            icon: <EyeOutlined />,
            onClick: (info: any) => {
              info.domEvent?.stopPropagation();
              handleShowDetail(record);
            },
          },
        ];

        if (canEditContract(record.status) && (isDoanhNghiep || isAdmin)) {
          items.push({
            key: "edit",
            label: "Chỉnh sửa",
            icon: <EditOutlined />,
            onClick: (info: any) => {
              info.domEvent?.stopPropagation();
              handleEdit(record);
            },
          });
        }

        const workflowItems = buildWorkflowMenuItems(record);
        if (workflowItems.length) {
          items.push({ type: "divider" }, ...workflowItems);
        }

        if (
          (isDoanhNghiep || isAdmin) &&
          (record.status === ConstractStatusConstant.TamLuu ||
            record.status === ConstractStatusConstant.DaHuyDangKy)
        ) {
          items.push({
            key: "delete",
            label: "Xóa",
            danger: true,
            icon: <DeleteOutlined />,
            onClick: (info: any) => {
              info.domEvent?.stopPropagation();
              handleDelete(record);
            },
          });
        }

        return (
          <Dropdown
            menu={{
              items,
              onClick: (info) => {
                info.domEvent?.stopPropagation();
              }
            }}
            trigger={["click"]}
          >
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
      <div
        className="mb-2 flex-wrap justify-content-end"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <AutoBreadcrumb
          items={[
            { title: "Hợp đồng điện tử" },
            { title: "Chứng thực hợp đồng điện tử" },
          ]}
        />

        <div className="flex flex-row gap-x-2" style={{ alignItems: "center", gap: 12 }}>
          <Button
            onClick={() => setShowSearch(!showSearch)}
            type="primary"
            size="middle"
            icon={showSearch ? <CloseOutlined /> : <SearchOutlined />}
          >
            {showSearch ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
          {isDoanhNghiep && (!statusFromUrl || statusFromUrl === "tam-luu") && (
            <Button
              color="green" variant="solid"
              size="middle"
              icon={<PlusCircleOutlined />}
              onClick={handleCreate}
            >
              Thêm mới hồ sơ
            </Button>
          )}
        </div>
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
        title={isBulkAssign ? `Phân công xử lý (${selectedRowKeys.length} hồ sơ)` : "Phân công xử lý"}
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

      <Modal
        title="Cấu hình xuất dữ liệu Excel"
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        onOk={handleExportExcel}
        okText="Xuất Excel"
        cancelText="Hủy"
        confirmLoading={exportLoading}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <strong>Chọn các trường thông tin muốn xuất Excel:</strong>
        </div>
        <Checkbox.Group
          style={{ width: "100%" }}
          value={exportFields}
          onChange={(checkedValues) => setExportFields(checkedValues as string[])}
        >
          <Row gutter={[16, 12]}>
            {EXPORT_FIELDS_OPTIONS.map((opt) => (
              <Col span={12} key={opt.value}>
                <Checkbox value={opt.value}>{opt.label}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Modal>

      <Card>
        {showSearch && (
          <ContractSearch
            isDoanhNghiep={isDoanhNghiep}
            onSearch={(values) => {
              setSearchValues(values);
              setPageIndex(1);
            }}
            onReset={() => {
              setSearchValues({});
              setPageIndex(1);
            }}
            onExport={() => setIsExportModalOpen(true)}
          />
        )}
        {selectedRowKeys.length > 0 && isChuyenVien && (
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <span>Đang chọn <strong>{selectedRowKeys.length}</strong> hồ sơ</span>
            </div>
            <div>
              {canBulkTakeChuyenVien ? (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={handleBulkTake}
                >
                  Nhận xử lý
                </Button>
              ) : (
                <span style={{ color: "#ef4444", fontSize: "13px" }}>
                  * Tất cả hồ sơ được chọn phải ở trạng thái Chờ duyệt để nhận xử lý
                </span>
              )}
            </div>
          </div>
        )}
        {selectedRowKeys.length > 0 && isTruongPhong && (
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <span>Đang chọn <strong>{selectedRowKeys.length}</strong> hồ sơ</span>
            </div>
            <div>
              {canBulkAssignTruongPhong ? (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={handleOpenBulkAssignModal}
                >
                  Phân công xử lý
                </Button>
              ) : (
                <span style={{ color: "#ef4444", fontSize: "13px" }}>
                  * Tất cả hồ sơ được chọn phải ở trạng thái Chờ duyệt để phân công xử lý
                </span>
              )}
            </div>
          </div>
        )}
        <div className="table-responsive">
          <Table
            rowSelection={rowSelectionConfig}
            columns={columns}
            bordered
            dataSource={data?.items || []}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
            onRow={(record) => {
              return {
                onClick: (event: any) => {
                  const target = event.target as HTMLElement;
                  if (
                    target.tagName === "A" ||
                    target.closest("a") ||
                    target.closest(".ant-dropdown-trigger") ||
                    target.closest(".ant-checkbox-wrapper") ||
                    target.closest(".ant-table-selection-column") ||
                    target.closest(".company-info-cell") ||
                    target.closest(".actions-cell") ||
                    target.closest(".ant-table-cell-fix-right")
                  ) {
                    return;
                  }
                  handleShowDetail(record);
                },
              };
            }}
          />
        </div>
        <div
          style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}
        >
          <Pagination
            total={data?.totalCount || 0}
            current={pageIndex}
            pageSize={pageSize}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} trong ${total} dữ liệu`
            }
            onChange={(page) => setPageIndex(page)}
            onShowSizeChange={(_, size) => {
              setPageIndex(1);
              setPageSize(size);
            }}
          />
        </div>
      </Card>
    </>
  );
};

export default withAuthorization(QLChungThucHopDongDienTuPage, "");
