"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  message,
  Divider,
  Checkbox,
  Flex,
  Affix,
} from "antd";
import {
  CalendarOutlined,
  ArrowLeftOutlined,
  UndoOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

import FileCategoryConstant from "@/constants/FileCategoryConstant";
import ConstractStatusConstant from "@/constants/ConstractStatusConstant";
import ContractActionConstant from "@/constants/ContractActionConstant";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
import LoaiTaiLieuContractConstant from "@/constants/LoaiTaiLieuContractConstant";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import ContractDocumentList, {
  ContractDocumentMap,
  validateContractDocs,
} from "@/components/upload-file/ContractDocumentList";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import authenticationContractService, {
  type AuthenticationContractDropdowns,
} from "@/services/authenticationContract/authenticationContract.service";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { useSelector } from "@/store/hooks";
import { AuthenticationContractType } from "@/types/authenticationContract/dto";
import { AuthenticationContractRequestType } from "@/types/authenticationContract/request";
import { DropdownOption } from "@/types/general";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const { TextArea } = Input;

interface CreateOrUpdateProps {
  isOpen?: boolean;
  item?: Pick<AuthenticationContractType, "id"> | null;
  onClose: () => void;
  onSuccess: () => void;
  username?: string;
}

const editableContractStatuses = [0, 2, 6];

const canEditContract = (status?: number) =>
  status === undefined || editableContractStatuses.includes(status);

const isValidGuid = (val?: string) => {
  if (!val) return false;
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(val);
};


const inputStyle = { borderRadius: 6 };

const comparisonGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "64px minmax(170px, 1fr) minmax(220px, 1.35fr) minmax(220px, 1.35fr)",
  minWidth: 820,
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  overflow: "hidden",
};

const comparisonHeaderCellStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontWeight: 600,
  color: "#334155",
  background: "#f8fafc",
  borderRight: "1px solid #e2e8f0",
  borderBottom: "1px solid #e2e8f0",
};

const comparisonCellStyle: React.CSSProperties = {
  padding: 12,
  borderRight: "1px solid #e2e8f0",
  borderBottom: "1px solid #e2e8f0",
};

const comparisonIndexCellStyle: React.CSSProperties = {
  ...comparisonCellStyle,
  textAlign: "center",
  fontWeight: 600,
  color: "#475569",
};

const comparisonContentCellStyle: React.CSSProperties = {
  ...comparisonCellStyle,
  fontWeight: 500,
  color: "#334155",
};

const platformGroupStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: 14,
  marginBottom: 12,
};

const platformGroupTitleStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "#334155",
  marginBottom: 12,
  fontSize: 13.5,
};

interface LogoUploaderProps {
  value?: string;
  onChange?: (value: string | null) => void;
  category: string;
  itemId: string;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({
  value,
  onChange,
  category,
  itemId,
}) => {
  const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);

  const handleFileChange = (f: TaiLieuDinhKemType | null) => {
    setFile(f);
    if (f && !value) {
      onChange?.(f.duongDanFile);
    }
  };

  const handleUploadSuccess = (uploaded: TaiLieuDinhKemType) => {
    setFile(uploaded);
    onChange?.(uploaded.duongDanFile);
  };

  const handleDeleteSuccess = () => {
    setFile(null);
    onChange?.(null);
  };

  useEffect(() => {
    if (!value) {
      setFile(null);
    }
  }, [value]);

  return (
    <SingleFileUploader
      value={file}
      onChange={handleFileChange}
      category={category}
      itemId={itemId}
      onUploadSuccess={handleUploadSuccess}
      onDeleteSuccess={handleDeleteSuccess}
      accept="image/*"
    />
  );
};

const FormSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <Divider plain style={{ marginTop: 12, marginBottom: 16 }}>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#1e3a8a" }}>
          {title}
        </span>
      </Divider>
      {children}
    </div>
  );
};

const CreateOrUpdate: React.FC<CreateOrUpdateProps> = ({
  isOpen = true,
  item,
  onClose,
  onSuccess,
  username,
}) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [createDataLoading, setCreateDataLoading] = useState(false);
  const [createData, setCreateData] = useState<Record<string, string>>({});
  const [companyDkkd, setCompanyDkkd] = useState<string>("");
  const [recordId, setRecordId] = useState<string>(uuidv4());
  const [currentStatus, setCurrentStatus] = useState<number | undefined>(undefined);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [currentSignAction, setCurrentSignAction] = useState<number | null>(null);
  const [isSignDoanhNghiep, setIsSignDoanhNghiep] = useState<boolean>(false);
  const [docsMap, setDocsMap] = useState<ContractDocumentMap>({});

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

  const [iSPOptions, setISPOptions] = useState<DropdownOption[]>([]);
  const [linhVucOptions, setLinhVucOptions] = useState<DropdownOption[]>([]);
  const [ngonNguOptions, setNgonNguOptions] = useState<DropdownOption[]>([]);
  const [osOptions, setOsOptions] = useState<DropdownOption[]>([]);
  const [isSameAsLegal, setIsSameAsLegal] = useState(false);

  const currentUser = useSelector((state: any) => state.auth.User);
  const submitUsername = username || currentUser?.userName || "";
  const taxCode = createData.companyTaxCode || submitUsername;

  const isEdit = item != null;
  const currentRecordId = isEdit && item?.id ? item.id : recordId;

  const selectedPlatformType = Form.useWatch("platformType", form) || "website";
  const selectedHosting = Form.useWatch("iSPId", form);
  const selectedLinhVuc = Form.useWatch("linhVucCungCapDichVuCodes", form) || [];

  const isOtherOption = (value?: string) => {
    if (!value) return false;
    const option = [...iSPOptions, ...linhVucOptions].find(
      (item) => item.value === value,
    );
    const normalizedValue = value.toLowerCase();
    const normalizedLabel = (option?.label || "").toLowerCase();

    return (
      normalizedValue.includes("other") ||
      normalizedValue.includes("khac") ||
      normalizedValue.includes("khác") ||
      normalizedLabel.includes("other") ||
      normalizedLabel.includes("khac") ||
      normalizedLabel.includes("khác")
    );
  };

  const showHostingOther = isOtherOption(selectedHosting);
  const showLinhVucOther = selectedLinhVuc.some((value: string) =>
    isOtherOption(value),
  );

  const showWebsite =
    selectedPlatformType === "website" || selectedPlatformType === "both";
  const showApp =
    selectedPlatformType === "app" || selectedPlatformType === "both";

  const getFormattedDate = () => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const today = new Date();
    const dayName = days[today.getDay()];
    const dateStr = dayjs(today).format("DD/MM/YYYY");
    return `${dayName}, ${dateStr}`;
  };

  const syncOperationFromLegal = () => {
    form.setFieldsValue({
      representerNameOnline: createData.representerName || "",
      representerJobOnline: form.getFieldValue("representerJob") || "",
      representerCCCDOnline: createData.representerCCCD || "",
      representerDiaChiOnline: createData.representerDiaChi || createData.address || "",
      representerMobileOnline: createData.representerMobile || "",
      representerEmailOnline: createData.representerEmail || "",
    });
    message.success("Đã đồng bộ thông tin quản lý vận hành");
  };

  const handleSameAsLegalChange = (checked: boolean) => {
    setIsSameAsLegal(checked);
    if (checked) {
      syncOperationFromLegal();
    }
  };

  const loadCompanyDkkd = async (keyword?: string) => {
    const searchKeyword = keyword || submitUsername;
    if (!searchKeyword) return;
    try {
      const response = await companyInfoService.getData({
        keyword: searchKeyword,
        pageIndex: 1,
        pageSize: 1,
      });
      const company = response?.data?.items?.[0];
      setCompanyDkkd(company?.dKKD || "");
    } catch {
      setCompanyDkkd("");
    }
  };

  const loadCreateData = async (keyword?: string) => {
    const lookupUsername = keyword || submitUsername;
    if (!lookupUsername) return;

    setCreateDataLoading(true);
    try {
      const response = await authenticationContractService.getCreateContractData(
        lookupUsername,
      );
      if (response.status && response.data) {
        const info = response.data as Record<string, string>;
        setCreateData(info);
        const currentValues = form.getFieldsValue();
        form.setFieldsValue({
          chuSoHuu: currentValues.chuSoHuu || info.name,
        });
      }
    } catch {
      message.error("Không tải được thông tin doanh nghiệp");
    } finally {
      setCreateDataLoading(false);
    }
  };

  const normalizeDropdownOptions = (options?: any[]): DropdownOption[] => {
    if (!Array.isArray(options)) return [];
    return options
      .map((item) => ({
        label: item.label ?? item.Label ?? item.name ?? item.Name ?? "",
        value: item.value ?? item.Value ?? item.code ?? item.Code ?? "",
      }))
      .filter((item) => item.label && item.value);
  };

  const loadDropdowns = async () => {
    try {
      const response = await authenticationContractService.getDropdowns();
      const dropdowns = response.data as AuthenticationContractDropdowns;

      const hosting = normalizeDropdownOptions(dropdowns?.donViCungCapHosting);
      const categories = normalizeDropdownOptions(dropdowns?.authContractCategoryCode);
      const languages = normalizeDropdownOptions(dropdowns?.ngonNgu);
      const os = normalizeDropdownOptions(dropdowns?.oscode);

      setISPOptions(hosting);
      setLinhVucOptions(categories);
      setNgonNguOptions(languages);
      setOsOptions(os);
    } catch {
      message.error("Không tải được danh mục");
    }
  };

  const mapEditData = (editData: AuthenticationContractType, currentId: string) => {
    const appExtends = (editData as any)?.appExtends || (editData as any)?.appContractRequests || [];
    const categories = (editData as any)?.listCategories || (editData as any)?.authConstractCategories || [];

    form.setFieldsValue({
      ...editData,
      ngonNgu: editData?.ngonNgu ? editData.ngonNgu.split("@@").filter(Boolean) : [],
      iSPId: (editData as any)?.iSPId || (editData as any)?.ispId || (editData as any)?.isPId || (editData as any)?.IspId || "",
      iSPidKhac: (editData as any)?.iSPidKhac || (editData as any)?.ispIdKhac || (editData as any)?.isPidKhac || (editData as any)?.IspidKhac || (editData as any)?.isPIdKhac || "",
      representerJob: editData?.representerJob || "",
      platformType:
        appExtends.length > 0 && editData?.domain
          ? "both"
          : appExtends.length > 0
            ? "app"
            : "website",
      linhVucCungCapDichVuCodes:
        categories.map((item: any) => item.linhVucCungCapDichVuCode) || [],
      appContractRequests:
        appExtends.length > 0
          ? appExtends.map((app: any) => ({
            ...app,
            id: app.id || uuidv4(),
            contractId: app.contractId || currentId,
          }))
          : [{ id: uuidv4(), contractId: currentId, appName: "", osCode: "", appLink: "", logo: "" }],
    });
  };

  const loadDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const response = await authenticationContractService.get(id);
      if (response.status && response.data) {
        const detail = response.data as AuthenticationContractType;
        setCurrentStatus(detail.status);

        mapEditData(detail, id);
        if (detail.companyTaxCode) {
          loadCreateData(detail.companyTaxCode);
          loadCompanyDkkd(detail.companyTaxCode);
        }

        try {
          const filesRes = await fileServerService.getByItemId(id);
          if (filesRes?.data) {
            const grouped: ContractDocumentMap = {};
            filesRes.data.forEach((f) => {
              if (f.loaiTaiLieu) {
                grouped[f.loaiTaiLieu] = f;
              }
            });
            setDocsMap(grouped);
          }
        } catch (err) {
          console.error("Không tải được danh sách tài liệu cũ:", err);
        }
      } else {
        message.error("Không tải được chi tiết hồ sơ");
      }
    } catch {
      message.error("Lỗi tải thông tin chi tiết");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleFakeData = () => {
    const defaultHosting = iSPOptions.length > 0 ? iSPOptions[0].value : "";
    const defaultLinhVuc = linhVucOptions.length > 0 ? [linhVucOptions[0].value] : [];
    const defaultLanguage = ngonNguOptions.length > 0 ? [ngonNguOptions[0].value] : [];
    const defaultOS = osOptions.length > 0 ? osOptions[0].value : "";

    form.setFieldsValue({
      platformType: "both",
      name: "Cổng Chứng thực Hợp đồng Điện tử Antigravity",
      domain: "https://contract.antigravity.gov.vn",
      domainAdd: "https://sub-contract.antigravity.gov.vn",
      chuSoHuu: "Công ty Cổ phần Công nghệ Antigravity",
      ngonNgu: defaultLanguage,
      iSPId: defaultHosting,
      staffNumber: 15,
      linhVucCungCapDichVuCodes: defaultLinhVuc,
      representerJob: "Tổng Giám đốc",
      representerNameOnline: "Nguyễn Văn Trưởng",
      representerJobOnline: "Giám đốc vận hành",
      representerCCCDOnline: "001095001234",
      representerDiaChiOnline: "Tòa nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội",
      representerMobileOnline: "0987654321",
      representerEmailOnline: "truong.nv@antigravity.gov.vn",
      appContractRequests: [
        {
          id: uuidv4(),
          contractId: currentRecordId,
          appName: "Antigravity E-Contract",
          osCode: defaultOS,
          appLink: "https://play.google.com/store/apps/details?id=vn.antigravity.econtract",
        }
      ]
    });
    message.success("Đã fake dữ liệu thành công!");
  };

  useEffect(() => {
    loadDropdowns();
    if (isEdit && item?.id) {
      setRecordId(item.id);
      loadDetail(item.id);
    } else {
      const newId = uuidv4();
      setRecordId(newId);
      setCurrentStatus(undefined);
      form.resetFields();
      form.setFieldsValue({
        platformType: "website",
        appContractRequests: [{ id: uuidv4(), contractId: newId, appName: "", osCode: "", appLink: "", logo: "" }],
      });
      setDocsMap({});
      loadCreateData();
      loadCompanyDkkd();
    }
  }, [item?.id]);

  const handleCancel = () => {
    onClose();
  };

  const handleSignSuccess = async (
    result: any[],
    certificate: any,
  ) => {
    setLoading(true);
    try {
      const responseSign = await authenticationContractService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      const action = currentSignAction || ContractActionConstant.GuiDangKy;
      const statusResponse = await authenticationContractService.updateStatus({}, currentRecordId, action);
      if (statusResponse.status) {
        let successMsg = "Ký số và gửi hồ sơ đăng ký thành công";
        if (action === ContractActionConstant.GuiBoSungThongTin) {
          successMsg = "Ký số và gửi bổ sung thông tin thành công";
        }
        message.success(successMsg);
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(statusResponse.message || "Ký số thành công nhưng cập nhật trạng thái thất bại");
      }
    } catch (err: any) {
      console.error("Lỗi trong quá trình ký số:", err);
      message.error(err?.message || "Lỗi trong quá trình ký số và duyệt hồ sơ");
    } finally {
      setLoading(false);
      setIsSignModalOpen(false);
      setCurrentSignAction(null);
    }
  };

  const handleCancelSign = () => {
    setIsSignModalOpen(false);
    setCurrentSignAction(null);
    message.info("Hồ sơ đã được lưu tạm thành công.");
    form.resetFields();
    onSuccess();
    onClose();
    router.push(`/hop-dong/detail?id=${currentRecordId}`);
  };

  const submitForm = async (values: any, statusType = 0) => {
    if (isEdit && !canEditContract(currentStatus)) {
      message.warning("Hồ sơ đang xử lý, không thể cập nhật.");
      return;
    }

    // Validate tài liệu bắt buộc khi gửi duyệt
    if (statusType === 1) {
      const missing = validateContractDocs(docsMap);
      if (missing.length > 0) {
        message.error(`Vui lòng tải lên các tài liệu bắt buộc: ${missing.join(", ")}`);
        return;
      }
    }

    const {
      platformType,
      linhVucCungCapDichVuCodes = [],
      appContractRequests = [],
    } = values;

    const shouldSendApps = platformType === "app" || platformType === "both";

    // Thu thập fileIds từ docsMap
    const fileIds: string[] = [];
    Object.values(docsMap).forEach((f) => {
      if (f?.id) fileIds.push(f.id);
    });

    const payload: AuthenticationContractRequestType = {
      id: currentRecordId,
      representerJob: values.representerJob || "",
      representerNameOnline: values.representerNameOnline || "",
      representerJobOnline: values.representerJobOnline || "",
      representerCCCDOnline: values.representerCCCDOnline || "",
      representerDiaChiOnline: values.representerDiaChiOnline || "",
      representerMobileOnline: values.representerMobileOnline || "",
      representerEmailOnline: values.representerEmailOnline || "",
      name: values.name || appContractRequests[0]?.appName || "",
      domain: values.domain || "",
      domainAdd: values.domainAdd || "",
      chuSoHuu: values.chuSoHuu || "",
      logo: values.logo || appContractRequests[0]?.logo || "",
      iSPId: isValidGuid(values.iSPId) ? values.iSPId : "00000000-0000-0000-0000-000000000000",
      iSPidKhac: values.iSPidKhac,
      linhVucCungCapKhac: values.linhVucCungCapKhac,
      ngonNgu: Array.isArray(values.ngonNgu) ? values.ngonNgu.join("@@") : (values.ngonNgu || ""),
      staffNumber: Number(values.staffNumber || 0),
      lyDoDeNghiCapNhat: values.lyDoDeNghiCapNhat,
      note: values.note,
      authConstractCategories: linhVucCungCapDichVuCodes.map((code: string) => ({
        linhVucCungCapDichVuCode: code,
      })),
      listFileIds: fileIds,
      appContractRequests: shouldSendApps
        ? appContractRequests.map((app: any) => ({
          id: app.id,
          contractId: app.contractId,
          appName: app.appName,
          osCode: app.osCode,
          appLink: app.appLink,
          logo: app.logo,
        }))
        : [],
    };

    setLoading(true);
    try {
      const syncDvc = statusType === 1 && !isSignDoanhNghiep; // Gửi duyệt thì đồng bộ DVC (chỉ đồng bộ nếu không ký số doanh nghiệp)
      const response = isEdit
        ? await authenticationContractService.updateAuthenticationConstract(payload, currentRecordId)
        : await authenticationContractService.createAuthenticationConstract(payload, submitUsername, syncDvc);

      if (response.status) {
        // Nếu chọn Lưu & Gửi duyệt
        if (statusType === 1) {
          if (
            currentStatus === undefined ||
            currentStatus === ConstractStatusConstant.TamLuu ||
            currentStatus === ConstractStatusConstant.CanBoSungThongTin
          ) {
            const actionStatus =
              currentStatus === ConstractStatusConstant.CanBoSungThongTin
                ? ContractActionConstant.GuiBoSungThongTin
                : ContractActionConstant.GuiDangKy;

            if (isSignDoanhNghiep) {
              setLoading(false);
              setSignIds([currentRecordId]);
              setCurrentSignAction(actionStatus);
              setIsSignModalOpen(true);
              return;
            } else {
              // Nếu là tạo mới + gửi duyệt: Create đã gọi sync DVC rồi, không cần updateStatus
              // Nếu là cập nhật + gửi duyệt: cần gọi updateStatus
              if (isEdit) {
                const statusResponse = await authenticationContractService.updateStatus({}, currentRecordId, actionStatus);
                if (statusResponse.status) {
                  message.success(
                    actionStatus === ContractActionConstant.GuiBoSungThongTin
                      ? "Gửi bổ sung thông tin thành công"
                      : "Gửi hồ sơ đăng ký thành công"
                  );
                  form.resetFields();
                  onSuccess();
                  onClose();
                  return;
                } else {
                  message.error(statusResponse.message || "Gửi duyệt thất bại");
                }
              } else {
                // Tạo mới + gửi duyệt
                message.success("Gửi hồ sơ đăng ký thành công");
                form.resetFields();
                onSuccess();
                onClose();
                return;
              }
            }
          }
        }
        message.success(isEdit ? "Cập nhật hồ sơ thành công" : "Tạo hồ sơ thành công");
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(response.message || "Có lỗi xảy ra khi lưu hồ sơ");
      }
    } catch {
      message.error("Lỗi khi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishFailed = (errorInfo: any) => {
    const firstErrorField = errorInfo.errorFields?.[0];
    if (firstErrorField) {
      form.scrollToField(firstErrorField.name, {
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <>
      <div className="sticky-header-toolbar" style={{ background: "#fff", padding: "12px 24px", borderBottom: "1px solid #e2e8f0", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <span style={{ cursor: "pointer" }} onClick={onClose}>Trang chủ</span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ cursor: "pointer" }} onClick={onClose}>Hợp đồng điện tử</span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>
                {isEdit ? "Cập nhật hồ sơ" : "Đăng ký hồ sơ"}
              </span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#475569", fontSize: "13px", fontWeight: 500 }}>
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px", fontSize: "14px" }} />
            <span>{getFormattedDate()}</span>
          </div>
        </div>
      </div>

      <div className="create-page-container" style={{ padding: "0 24px 24px" }}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .create-page-container .ant-form-item {
            margin-bottom: 12px !important;
          }
          .create-page-container .ant-form-item-label {
            padding-bottom: 4px !important;
          }
          .create-page-container .ant-form-item-label > label {
            font-size: 13px !important;
            font-weight: 500 !important;
            color: #475569 !important;
          }
        `}} />

        <Card
          title={
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
              📂 {isEdit ? "Cập nhật hồ sơ Chứng thực Hợp đồng điện tử" : "Đăng ký hồ sơ Chứng thực Hợp đồng điện tử"}
            </span>
          }
          extra={
            <Affix offsetTop={80}>
              <Flex style={{ gap: 12 }}>
                {process.env.NODE_ENV === "development" && (
                  <Button
                    size="large"
                    type="dashed"
                    onClick={handleFakeData}
                    style={{ color: "#d97706", borderColor: "#f59e0b", fontWeight: 600 }}
                  >
                    ⚡ Fake dữ liệu
                  </Button>
                )}
                <Button size="large" type="default" icon={<ArrowLeftOutlined />} onClick={onClose}>
                  Quay lại danh sách
                </Button>
                <Button size="large" icon={<UndoOutlined />} onClick={handleCancel} disabled={loading}>
                  Hủy bỏ
                </Button>
                <Button
                  size="large"
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={async () => {
                    const values = form.getFieldsValue();
                    submitForm(values, 0); // 0: Lưu nháp (Bypass validate)
                  }}
                  loading={loading}
                >
                  Lưu nháp
                </Button>
                <Button
                  size="large"
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    form.submit(); // Trigger validate và onFinish -> submitForm(values, 1)
                  }}
                  loading={loading}
                  style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                >
                  Lưu & Gửi duyệt
                </Button>
              </Flex>
            </Affix>
          }
          style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
        >
          <Spin spinning={loadingDetail || createDataLoading}>
            <Form
              layout="vertical"
              form={form}
              name="contractCreateUpdateForm"
              onFinish={(values) => submitForm(values, 1)}
              onFinishFailed={handleFinishFailed}
              autoComplete="off"
              preserve
            >


              {/* PHẦN 1. THÔNG TIN CHỦ QUẢN NỀN TẢNG */}
              <FormSection title="🏢 Phần 1. Thông tin chủ quản nền tảng">
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                    Thông tin mặc định (Lấy từ tài khoản đăng nhập, không được phép sửa)
                  </div>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Tên tổ chức/chủ quản nền tảng">
                        <Input disabled value={createData.name || ""} style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Mã số thuế doanh nghiệp">
                        <Input disabled value={createData.companyTaxCode || submitUsername || ""} style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Địa chỉ trụ sở chính">
                        <TextArea disabled rows={2} value={createData.address || ""} style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Email tiếp nhận thông tin">
                        <Input disabled value={createData.email || ""} style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={24}>
                      <Form.Item label="File ảnh đăng ký doanh nghiệp (ĐKKD)">
                        {companyDkkd ? (
                          <a href={companyDkkd} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: "#2563eb", textDecoration: "underline" }}>
                            📄 Xem file đăng ký doanh nghiệp
                          </a>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Chưa có file</span>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
                      Thông tin Người đại diện pháp luật và Người chịu trách nhiệm quản lý, vận hành
                    </div>
                    <Checkbox
                      checked={isSameAsLegal}
                      onChange={(e) => handleSameAsLegalChange(e.target.checked)}
                      style={{ fontWeight: 500 }}
                    >
                      Trùng với thông tin người đại diện pháp luật
                    </Checkbox>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <div style={comparisonGridStyle}>
                      <div style={comparisonHeaderCellStyle}>STT</div>
                      <div style={comparisonHeaderCellStyle}>Nội dung</div>
                      <div style={comparisonHeaderCellStyle}>Người đại diện pháp luật</div>
                      <div style={comparisonHeaderCellStyle}>Người liên hệ chịu trách nhiệm vận hành</div>

                      <div style={comparisonIndexCellStyle}>1</div>
                      <div style={comparisonContentCellStyle}>Họ và tên</div>
                      <div style={comparisonCellStyle}>
                        <Input disabled value={createData.representerName || ""} style={inputStyle} />
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item name="representerNameOnline" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]} style={{ marginBottom: 0 }}>
                          <Input placeholder="Nhập họ và tên" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>2</div>
                      <div style={comparisonContentCellStyle}>Chức danh</div>
                      <div style={comparisonCellStyle}>
                        <Form.Item name="representerJob" rules={[{ required: true, message: "Vui lòng nhập chức danh đại diện" }]} style={{ marginBottom: 0 }}>
                          <Input placeholder="Chức danh đại diện" style={inputStyle} />
                        </Form.Item>
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item name="representerJobOnline" rules={[{ required: true, message: "Vui lòng nhập chức danh người liên hệ" }]} style={{ marginBottom: 0 }}>
                          <Input placeholder="Chức danh người liên hệ" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>3</div>
                      <div style={comparisonContentCellStyle}>Số CCCD / số hộ chiếu</div>
                      <div style={comparisonCellStyle}>
                        <Input disabled value={createData.representerCCCD || ""} style={inputStyle} />
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item name="representerCCCDOnline" rules={[{ required: true, message: "Vui lòng nhập CCCD" }]} style={{ marginBottom: 0 }}>
                          <Input placeholder="CCCD người liên hệ" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>4</div>
                      <div style={comparisonContentCellStyle}>Địa chỉ liên hệ</div>
                      <div style={comparisonCellStyle}>
                        <TextArea disabled rows={2} value={createData.representerDiaChi || createData.address || ""} style={inputStyle} />
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item name="representerDiaChiOnline" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]} style={{ marginBottom: 0 }}>
                          <TextArea rows={2} placeholder="Địa chỉ người liên hệ" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>5</div>
                      <div style={comparisonContentCellStyle}>Số điện thoại</div>
                      <div style={comparisonCellStyle}>
                        <Input disabled value={createData.representerMobile || ""} style={inputStyle} />
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item
                          name="representerMobileOnline"
                          rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại" },
                            { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ (10-11 số)" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="SĐT người liên hệ" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>6</div>
                      <div style={comparisonContentCellStyle}>Email</div>
                      <div style={comparisonCellStyle}>
                        <Input disabled value={createData.representerEmail || ""} style={inputStyle} />
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item
                          name="representerEmailOnline"
                          rules={[
                            { required: true, message: "Vui lòng nhập email" },
                            { type: "email", message: "Email không đúng định dạng" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Email người liên hệ" style={inputStyle} />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              {/* PHẦN 2. THÔNG TIN NỀN TẢNG CHỨNG THỰC */}
              <FormSection title="🌐 Phần 2. Thông tin nền tảng chứng thực hợp đồng điện tử">
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px solid #e2e8f0" }}>
                  <Form.Item name="platformType" label={"Loại hình nền tảng"} rules={[{ required: true, message: "Vui lòng chọn loại nền tảng" }]}>
                    <Radio.Group>
                      <Radio value="website">Website</Radio>
                      <Radio value="app">Ứng dụng di động</Radio>
                      <Radio value="both">Cả hai</Radio>
                    </Radio.Group>
                  </Form.Item>

                  {showWebsite && (
                    <div style={{ ...platformGroupStyle, marginTop: 16 }}>
                      <div style={platformGroupTitleStyle}>Thông tin Website</div>
                      <Row gutter={[16, 8]}>
                        <Col xs={24} md={12}>
                          <Form.Item name="name" label="Tên website" rules={[{ required: true, message: "Nhập tên website" }]}>
                            <Input placeholder="Tên nền tảng / website" style={inputStyle} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="domain"
                            label="Tên miền chính"
                            rules={[
                              { required: true, message: "Nhập tên miền chính" },
                              {
                                pattern: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/,
                                message: "Tên miền chính phải là tên miền hoặc URL hợp lệ",
                              },
                            ]}
                          >
                            <Input placeholder="example.com hoặc https://example.com" style={inputStyle} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="domainAdd"
                            label="Tên miền bổ sung"
                            rules={[
                              {
                                pattern: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/,
                                message: "Tên miền bổ sung phải là tên miền hoặc URL hợp lệ",
                              },
                            ]}
                          >
                            <Input placeholder="sub.example.com hoặc https://sub.example.com" style={inputStyle} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="logo" label="Logo website" rules={[{ required: true, message: "Vui lòng upload logo website" }]}>
                            <LogoUploader category={FileCategoryConstant.Avatar} itemId={currentRecordId} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {showApp && (
                    <div style={{ ...platformGroupStyle, marginTop: 16 }}>
                      <div style={platformGroupTitleStyle}>Thông tin Ứng dụng di động</div>
                      {!showWebsite && (
                        <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
                          <Col xs={24} md={12}>
                            <Form.Item name="name" label="Tên nền tảng / ứng dụng" rules={[{ required: true, message: "Nhập tên nền tảng" }]}>
                              <Input placeholder="Tên nền tảng / ứng dụng" style={inputStyle} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item name="logo" label="Logo ứng dụng" rules={[{ required: true, message: "Vui lòng upload logo" }]}>
                              <LogoUploader category={FileCategoryConstant.Avatar} itemId={currentRecordId} />
                            </Form.Item>
                          </Col>
                        </Row>
                      )}

                      <Form.List name="appContractRequests">
                        {(fields, { add, remove }) => (
                          <div>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                                  <th style={{ padding: "8px 12px", textAlign: "left", width: "25%", fontSize: "12px", color: "#475569" }}>Tên HĐH</th>
                                  <th style={{ padding: "8px 12px", textAlign: "left", width: "30%", fontSize: "12px", color: "#475569" }}>Tên ứng dụng</th>
                                  <th style={{ padding: "8px 12px", textAlign: "left", width: "30%", fontSize: "12px", color: "#475569" }}>Link tải ứng dụng</th>
                                  <th style={{ padding: "8px 12px", textAlign: "left", width: "15%", fontSize: "12px", color: "#475569" }}>Logo</th>
                                  <th style={{ padding: "8px 12px", width: "70px" }}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {fields.map((field) => (
                                  <tr key={field.key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: 12 }}>
                                      <Form.Item
                                        {...field}
                                        name={[field.name, "osCode"]}
                                        rules={[{ required: true, message: "Chọn HĐH" }]}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <Select placeholder="Chọn HĐH" options={osOptions} style={{ borderRadius: 6, width: "100%" }} />
                                      </Form.Item>
                                    </td>
                                    <td style={{ padding: 12 }}>
                                      <Form.Item
                                        {...field}
                                        name={[field.name, "appName"]}
                                        rules={[{ required: true, message: "Nhập tên" }]}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <Input placeholder="Tên ứng dụng" style={{ borderRadius: 6 }} />
                                      </Form.Item>
                                    </td>
                                    <td style={{ padding: 12 }}>
                                      <Form.Item
                                        {...field}
                                        name={[field.name, "appLink"]}
                                        rules={[
                                          { required: true, message: "Nhập link" },
                                          { type: "url", message: "Phải là URL hợp lệ" },
                                        ]}
                                        style={{ marginBottom: 0 }}
                                      >
                                        <Input placeholder="Link tải..." style={{ borderRadius: 6 }} />
                                      </Form.Item>
                                    </td>
                                    <td style={{ padding: 12 }}>
                                      <Form.Item {...field} name={[field.name, "logo"]} style={{ marginBottom: 0 }} rules={[{ required: true, message: "Tải Logo" }]}>
                                        <LogoUploader
                                          category={FileCategoryConstant.Avatar}
                                          itemId={form.getFieldValue(["appContractRequests", field.name, "id"])}
                                        />
                                      </Form.Item>
                                    </td>
                                    <td style={{ padding: 12, textAlign: "center" }}>
                                      <Button type="text" danger onClick={() => remove(field.name)}>Xóa</Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <Button
                              type="dashed"
                              onClick={() => add({ id: uuidv4(), contractId: currentRecordId, appName: "", osCode: "", appLink: "", logo: "" })}
                              block
                              style={{ marginTop: 12, borderRadius: 8, height: 38, fontWeight: 500 }}
                            >
                              + Thêm thông tin ứng dụng di động
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </div>
                  )}
                </div>

                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                    Các thông tin chung & Lĩnh vực cung cấp
                  </div>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="chuSoHuu" label="Chủ sở hữu tên miền" rules={[{ required: true, message: "Nhập chủ sở hữu" }]}>
                        <Input placeholder="Nhập chủ sở hữu tên miền" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="ngonNgu" label="Ngôn ngữ sử dụng" rules={[{ required: true, message: "Chọn ngôn ngữ" }]}>
                        <Select mode="multiple" placeholder="Chọn ngôn ngữ" options={ngonNguOptions} style={inputStyle} optionFilterProp="label" showSearch />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="iSPId" label="Đơn vị cung cấp hosting" rules={[{ required: true, message: "Chọn đơn vị hosting" }]}>
                        <Select placeholder="Chọn hosting" options={iSPOptions} style={inputStyle} optionFilterProp="label" showSearch />
                      </Form.Item>
                    </Col>
                    {showHostingOther && (
                      <Col xs={24} md={12}>
                        <Form.Item name="iSPidKhac" label="Nhà cung cấp hosting khác" rules={[{ required: true, message: "Nhập nhà cung cấp khác" }]}>
                          <Input placeholder="Tên nhà cung cấp hosting khác" style={inputStyle} />
                        </Form.Item>
                      </Col>
                    )}
                    <Col xs={24} md={12}>
                      <Form.Item name="staffNumber" label="Số lượng nhân sự vận hành" rules={[{ required: true, message: "Nhập số lượng nhân sự" }]}>
                        <InputNumber min={1} precision={0} style={{ width: "100%", borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="linhVucCungCapDichVuCodes" label="Lĩnh vực cung cấp dịch vụ" rules={[{ required: true, message: "Vui lòng chọn lĩnh vực" }]}>
                        <Select mode="multiple" placeholder="Chọn lĩnh vực" options={linhVucOptions} style={inputStyle} optionFilterProp="label" showSearch />
                      </Form.Item>
                    </Col>
                    {showLinhVucOther && (
                      <Col xs={24} md={24}>
                        <Form.Item name="linhVucCungCapKhac" label="Lĩnh vực cung cấp khác" rules={[{ required: true, message: "Mô tả lĩnh vực khác" }]}>
                          <TextArea rows={2} placeholder="Mô tả chi tiết lĩnh vực cung cấp khác..." style={inputStyle} />
                        </Form.Item>
                      </Col>
                    )}
                    {isEdit && (
                      <Col xs={24} md={24}>
                        <Form.Item name="lyDoDeNghiCapNhat" label="Lý do đề nghị cập nhật">
                          <TextArea rows={2} placeholder="Lý do cập nhật hồ sơ..." style={inputStyle} />
                        </Form.Item>
                      </Col>
                    )}
                    <Col xs={24} md={24}>
                      <Form.Item name="note" label="Ghi chú">
                        <TextArea rows={3} placeholder="Nhập ghi chú thêm nếu có..." style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </FormSection>

              {/* PHẦN 3. TÀI LIỆU ĐÍNH KÈM */}
              <FormSection title="📂 Phần 3. Tài liệu hồ sơ chứng thực">
                <div style={{ marginTop: 12 }}>
                  <ContractDocumentList
                    contractId={currentRecordId}
                    taxCode={taxCode}
                    value={docsMap}
                    onChange={setDocsMap}
                  />

                </div>
              </FormSection>

            </Form>
          </Spin>
        </Card>
      </div>
      <DigitalSignatureModal
        ids={signIds}
        open={isSignModalOpen}
        onCancel={handleCancelSign}
        onSignSuccess={handleSignSuccess}
        signerService={authenticationContractService}
      />
    </>
  );
};

export default CreateOrUpdate;
