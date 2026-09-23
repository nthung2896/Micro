"use client";

import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import PlatformDocumentList, {
  PlatformDocumentMap,
  validatePlatformDocs,
} from "@/components/upload-file/PlatformDocumentList";
import { getPlatformDocs } from "@/constants/PlatformDocumentCatalog";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformFunctionConstant from "@/constants/PlatformFunctionConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import platformManageService from "@/services/platformManage/platformManage.service";
import { CompanyInfoType } from "@/types/companyInfo/dto";
import { DropdownOption } from "@/types/general";
import { PlatformManageType } from "@/types/platformManage/dto";
import { PlatformManageOnlineBookingCreateType } from "@/types/platformManage/request";
import {
  BankOutlined,
  CloudOutlined,
  TeamOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  UndoOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  FormProps,
  Input,
  Row,
  Divider,
  Select,
  Spin,
  message,
  Card,
  Checkbox,
  Space,
  Affix,
  Radio,
  Flex,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { CertificateInfo } from "@/libs/moit-sign";
import { SignResultItem } from "@/libs/moit-sign/types";

const { TextArea } = Input;

/** Helper: render label text với dấu (*) màu đỏ để đánh dấu trường bắt buộc */
const reqLabel = (text: string) => (
  <span>
    {text}
  </span>
);

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
  padding: "8px 12px 0px 12px",
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

type PlatformManageFormType = Omit<PlatformManageOnlineBookingCreateType, "loaiHangHoaKhac" | "appInfoItems" | "chucNangNenTang" | "ngonNgu"> & {
  loaiHangHoaKhac?: string | string[];
  chucNangNenTang?: string | string[];
  appInfoItems?: any[];
  availabilityType?: number;
  domainAdd?: string;
  ispIdKhac?: string;
  ngonNgu?: string | string[];
  platformManageTypeId?: string;
};

const parseLoaiHangHoaKhac = (value?: string | null): string[] | undefined => {
  if (!value?.trim()) return undefined;
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseChucNangNenTang = (value?: string | null): string[] | undefined => {
  if (!value?.trim()) return undefined;
  return value
    .split("@")
    .map((s) => s.trim())
    .filter(Boolean);
};

const serializeLoaiHangHoaKhac = (
  value?: string | string[],
): string | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.length ? value.join(",") : undefined;
  return value.trim() || undefined;
};

const serializeChucNangNenTang = (
  value?: string | string[],
): string | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.length ? value.join("@") : undefined;
  return value.trim() || undefined;
};

const createClientUuid = (): string => {
  const cryptoApi = globalThis?.crypto as Crypto | undefined;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }
  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
      16,
      20,
    )}-${hex.slice(20)}`;
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const SECTION_THEME = {
  owner: {
    border: "rgba(16, 185, 129, 0.1)",
    accent: "#10b981",
    icon: <BankOutlined />,
  },
  platform: {
    border: "rgba(59, 130, 246, 0.1)",
    accent: "#3b82f6",
    icon: <CloudOutlined />,
  },
  legal: {
    border: "rgba(245, 158, 11, 0.1)",
    accent: "#f59e0b",
    icon: <UserOutlined />,
  },
  operation: {
    border: "rgba(139, 92, 246, 0.1)",
    accent: "#8b5cf6",
    icon: <TeamOutlined />,
  },
} as const;

type SectionKey = keyof typeof SECTION_THEME;

const FormSection: React.FC<{
  sectionKey: SectionKey;
  title: string;
  subtitle?: string;
  order?: number;
  extra?: React.ReactNode;
  children: React.ReactNode;
}> = ({ sectionKey, title, subtitle, order, extra, children }) => {
  return (
    <div
      id={`section-${sectionKey}`}
      style={{
        order,
        marginBottom: 24,
      }}
    >
      <Divider plain style={{ marginTop: 12, marginBottom: 16 }}>
        <span className="font-semibold text-blue-600" style={{ fontSize: "16px", fontWeight: 700, color: "#2563eb" }}>
          {title}
        </span>
      </Divider>
      {children}
    </div>
  );
};

const mapCompanyInfoRepresenterToForm = (
  company: CompanyInfoType,
): Partial<PlatformManageFormType> => ({
  companyName: company.name,
  companyTaxCode: company.taxCode,
  companyAddress: company.address,
  companyPhone: company.phone,
  companyEmail: company.email,
  representerName: company.representerName,
  representerJob: "Người đại diện theo pháp luật",
  representerCCCD: company.representerCCCD,
  representerMobile: company.representerMobile ?? company.representerPhone,
  representerEmail: company.representerEmail,
  addressDaiDien: company.address,
});

const mapDetailToForm = (
  data: PlatformManageType,
): PlatformManageFormType => {
  const appInfoItems = (data.appInfoItems ?? []).map((x) => ({
    appName: x.appName,
    osCode: x.osCode,
    appLink: x.appLink,
    appLogo: x.appLogo ? {
      id: x.id ?? createClientUuid(),
      tenTaiLieu: x.appLogo.split('/').pop() || "Logo ứng dụng",
      duongDanFile: x.appLogo,
      extension: x.appLogo.split('.').pop() || "png",
    } : null
  }));

  // Automatically determine availabilityType if not set in DB
  let resolvedAvailabilityType = data.availabilityType;
  if (!resolvedAvailabilityType) {
    const hasWebsite = !!data.domain || !!data.name;
    const hasApp = appInfoItems.length > 0;
    if (hasWebsite && hasApp) {
      resolvedAvailabilityType = 3; // Có cả ứng dụng và website
    } else if (hasApp) {
      resolvedAvailabilityType = 2; // Chỉ có ứng dụng
    } else if (hasWebsite) {
      resolvedAvailabilityType = 1; // Chỉ có website
    } else {
      resolvedAvailabilityType = 1; // Mặc định là website
    }
  }

  return {
    platformManageTypeId: data.platformManageTypeId,
    companyName: data.companyName,
    companyTaxCode: data.companyTaxCode,
    status: data.status,
    websiteNumber: data.websiteNumber,
    companyAddress: data.companyAddress,
    companyPhone: data.companyPhone,
    companyEmail: data.companyEmail,
    name: data.name,
    domain: data.domain,
    domainOwner: data.domainOwner,
    imagePath: data.imagePath,
    appIconPath: data.appIconPath,
    ispId: data.ispId,
    ispIdKhac: data.ispIdKhac,
    availabilityType: resolvedAvailabilityType,
    domainAdd: data.domainAdd,
    appInfoItems,
    loaiHangHoaKhac: parseLoaiHangHoaKhac(data.loaiHangHoaKhac),
    chucNangNenTang: parseChucNangNenTang(data.chucNangNenTang),
    phuongThucLienHe: data.phuongThucLienHe ?? data.phuongThucLienHeOnline,
    phuongThucLienHeOnline: data.phuongThucLienHeOnline,
    ngonNgu: data.ngonNgu ? data.ngonNgu.split("@@") : [],
    chinhSachBaoMat: data.chinhSachBaoMat,
    tiepNhanKhieuNai: data.tiepNhanKhieuNai,
    chinhSachGia: data.chinhSachGia,
    chinhSachThanhToan: data.chinhSachThanhToan,
    dieuKienCungCap: data.dieuKienCungCap,
    chinhSachGiaoHang: data.chinhSachGiaoHang,
    representerName: data.representerName,
    representerJob: data.representerJob ?? (data as any).representerJobDaiDien,
    representerCCCD: data.representerCCCD,
    representerMobile: data.representerMobile ?? "",
    representerEmail: data.representerEmail,
    addressDaiDien: data.addressDaiDien ?? data.representerDiaChi,
    representerNameOnline: data.representerNameOnline,
    representerJobOnline: data.representerJobOnline,
    representerCCCDOnline: data.representerCCCDOnline,
    representerMobileOnline: data.representerMobileOnline,
    representerEmailOnline: data.representerEmailOnline,
    addressOnline: data.addressOnline ?? data.representerDiaChiOnline,
  };
};

interface Props {
  isOpen: boolean;
  item?: Pick<PlatformManageType, "id"> | null;
  onClose: (type?: string) => void;
  onSuccess: (type?: string) => void;
}

const CreateOrUpdate: React.FC<Props> = (props) => {
  const router = useRouter();
  const [form] = Form.useForm<PlatformManageFormType>();
  const [currentStatus, setCurrentStatus] = useState<number | undefined>();
  const isDraft = currentStatus === PlatformStatusConstant.TamLuu;
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isSignDoanhNghiep, setIsSignDoanhNghiep] = useState<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [hostingOptions, setHostingOptions] = useState<DropdownOption[]>([]);
  const [loaiHangHoaOptions, setLoaiHangHoaOptions] = useState<DropdownOption[]>(
    [],
  );
  const [osOptions, setOsOptions] = useState<DropdownOption[]>([]);
  const [languageOptions, setLanguageOptions] = useState<DropdownOption[]>([]);
  const [ngonNguOptions, setNgonNguOptions] = useState<DropdownOption[]>([]);

  // === State cho File Upload mới ===
  const [platformId, setPlatformId] = useState<string>(createClientUuid());
  const [logoFile, setLogoFile] = useState<TaiLieuDinhKemType | null>(null);
  const [mainLogoFile, setMainLogoFile] = useState<TaiLieuDinhKemType | null>(null);
  const [appIconFile, setAppIconFile] = useState<TaiLieuDinhKemType | null>(null);
  const [docsMap, setDocsMap] = useState<PlatformDocumentMap>({});
  const [companyTaxCode, setCompanyTaxCode] = useState<string>("");

  // === State bổ sung từ yêu cầu doanh nghiệp ===
  const [companyId, setCompanyId] = useState<string>("");
  const [typeOrganization, setTypeOrganization] = useState<string>("");
  const [dkkdFile, setDkkdFile] = useState<TaiLieuDinhKemType | null>(null);
  const [isSameAsLegal, setIsSameAsLegal] = useState(false);

  const isEdit = props.item != null;
  const platformManageTypeId = Form.useWatch("platformManageTypeId", form);
  const platformType = platformManageTypeId || PlatformManageTypeConstant.NTThongBaoKD;
  /** Id hồ sơ PlatformManage — dùng làm ItemId khi upload tài liệu */
  const platformManageId =
    isEdit && props.item?.id ? props.item.id : platformId;

  const syncOperationFromLegal = () => {
    const values = form.getFieldsValue();
    form.setFieldsValue({
      representerNameOnline: values.representerName,
      representerJobOnline: values.representerJob,
      representerCCCDOnline: values.representerCCCD,
      representerMobileOnline: values.representerMobile,
      representerEmailOnline: values.representerEmail,
      addressOnline: values.addressDaiDien,
    });
    message.success("Đã đồng bộ thông tin quản lý vận hành");
  };

  const handleSameAsLegalChange = (checked: boolean) => {
    setIsSameAsLegal(checked);
    if (checked) {
      syncOperationFromLegal();
    }
  };

  const handleFakeData = () => {
    const defaultHosting = hostingOptions.length > 0 ? hostingOptions[0].value : "ViettelIDC";
    const defaultLoaiHangHoa = loaiHangHoaOptions.length > 0 ? [loaiHangHoaOptions[0].value] : ["HangTieuDung"];
    const defaultLanguage = languageOptions.length > 0 ? [languageOptions[0].value] : ["VI"];
    const defaultOS = osOptions.length > 0 ? osOptions[0].value : "Android";

    form.setFieldsValue({
      availabilityType: 3,
      name: "Nền tảng mua sắm Antigravity",
      domain: "antigravity.gov.vn",
      domainAdd: "sub.antigravity.gov.vn",
      domainOwner: "Công ty Cổ phần Công nghệ Antigravity",
      ispId: defaultHosting,
      loaiHangHoaKhac: defaultLoaiHangHoa,
      ngonNgu: defaultLanguage,
      chinhSachBaoMat: "Chính sách bảo mật của Antigravity cam kết bảo vệ thông tin cá nhân của người tiêu dùng, tuân thủ theo Nghị định 13/2023/NĐ-CP của Chính phủ về bảo vệ dữ liệu cá nhân. Mọi dữ liệu giao dịch đều được mã hóa bằng chuẩn SSL 256-bit.",
      tiepNhanKhieuNai: "Đầu mối tiếp nhận khiếu nại: Phòng Chăm sóc khách hàng. Hotline: 1900 8888. Email: support@antigravity.gov.vn. Thời gian giải quyết khiếu nại tối đa là 07 ngày làm việc kể từ ngày tiếp nhận phản ánh.",
      chinhSachGia: "Tất cả các sản phẩm hiển thị trên nền tảng Antigravity đều được niêm yết giá rõ ràng bằng Việt Nam Đồng (VND), đã bao gồm thuế Giá trị gia tăng (VAT). Phí vận chuyển được tính toán tự động dựa trên địa chỉ giao hàng và công bố trước khi thanh toán.",
      chinhSachThanhToan: "Nền tảng hỗ trợ các phương thức thanh toán linh hoạt: 1. Thanh toán khi nhận hàng (COD); 2. Chuyển khoản ngân hàng qua cổng Napas; 3. Thanh toán qua ví điện tử VNPay, Momo.",
      dieuKienCungCap: "Dịch vụ được cung cấp trên toàn lãnh thổ Việt Nam. Đối với một số mặt hàng hạn chế kinh doanh, người mua phải đạt độ tuổi tối thiểu theo quy định của pháp luật (Ví dụ: từ 18 tuổi trở lên đối với đồ uống có cồn).",
      chinhSachGiaoHang: "Sản phẩm được giao qua các đơn vị vận chuyển uy tín (Giao Hàng Nhanh, Viettel Post). Khách hàng có quyền đồng kiểm khi nhận hàng. Chính sách đổi trả 1-đổi-1 trong vòng 7 ngày nếu phát hiện lỗi từ nhà sản xuất.",
      phuongThucLienHe: "Tổng đài Hotline: 1900 8888 (Hoạt động từ 8:00 - 22:00 hàng ngày). Chat trực tuyến 24/7 trên Website và Ứng dụng di động. Email hỗ trợ: hotro@antigravity.gov.vn.",
      representerNameOnline: "Nguyễn Văn Trưởng",
      representerJobOnline: "Giám đốc vận hành",
      representerCCCDOnline: "001095001234",
      representerMobileOnline: "0987654321",
      representerEmailOnline: "truong.nv@antigravity.gov.vn",
      addressOnline: "Tòa nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội",
      appInfoItems: [
        {
          osCode: defaultOS,
          appName: "Antigravity Shopping App",
          appUrl: "https://play.google.com/store/apps/details?id=vn.antigravity.shopping",
        }
      ]
    });
    message.success("Đã điền dữ liệu giả lập chất lượng cao thành công!");
  };

  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      setSubmitting(true);
      const responseSign = await platformManageService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      const targetStatus = form.getFieldValue("status") || PlatformStatusConstant.ChoDuyet;
      const res = await platformManageService.transition({
        id: result[0].id,
        targetStatus: targetStatus,
        note: targetStatus === PlatformStatusConstant.DeNghiChinhSua ? "Lưu & đề nghị chỉnh sửa sau khi cập nhật" : "Gửi duyệt sau khi tạo/cập nhật",
      });

      if (res.status) {
        message.success("Ký số và gửi duyệt hồ sơ thành công");
        form.resetFields();
        props.onSuccess(platformType);
        props.onClose(platformType);
      } else {
        message.error(res.message ?? "Thao tác thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Đã xảy ra lỗi khi ký số");
    } finally {
      setSubmitting(false);
      setIsSignModalOpen(false);
    }
  };

  const handleOnFinish: FormProps<PlatformManageFormType>["onFinish"] =
    async (formData) => {
      if (formData.status !== PlatformStatusConstant.TamLuu && formData.status !== PlatformStatusConstant.CanBoSungThongTin) {
        const missing = validatePlatformDocs(platformType, docsMap);
        if (missing.length) {
          message.error(`Vui lòng tải lên các tài liệu bắt buộc: ${missing.join(", ")}`);
          const docsEl = document.getElementById("section-operation");
          if (docsEl) {
            docsEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          return;
        }
      }

      const payload: PlatformManageOnlineBookingCreateType & {
        organizationId?: string;
        typeOrganization?: string;
        representerNameVanHanh?: string;
        representerJobVanHanh?: string;
        representerCCCDVanHanh?: string;
        representerDiaChiVanHanh?: string;
        representerMobileVanHanh?: string;
        representerEmailVanHanh?: string;
      } = {
        ...formData,
        id: platformManageId,
        imagePath: mainLogoFile?.duongDanFile,
        logo: logoFile?.duongDanFile,
        appIconPath: appIconFile?.duongDanFile,
        ngonNgu: Array.isArray(formData.ngonNgu) ? formData.ngonNgu.join("@@") : formData.ngonNgu,
        loaiHangHoaKhac: serializeLoaiHangHoaKhac(formData.loaiHangHoaKhac),
        chucNangNenTang: serializeChucNangNenTang(formData.chucNangNenTang),
        productCategoryCodes: Array.isArray(formData.loaiHangHoaKhac) ? formData.loaiHangHoaKhac : parseLoaiHangHoaKhac(formData.loaiHangHoaKhac as string),
        appInfoItems: (formData.appInfoItems ?? []).map((x: any) => ({
          appName: x.appName,
          osCode: x.osCode,
          appLink: x.appLink,
          appLogo: x.appLogo?.duongDanFile || (typeof x.appLogo === 'string' ? x.appLogo : undefined)
        })),
        organizationId: companyId,
        typeOrganization: typeOrganization,
        representerDiaChi: formData.addressDaiDien,
        representerDiaChiOnline: formData.addressOnline,
        mauSo: "Mẫu 01",
      };

      // 3. Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận... (áp dụng đối với nền tảng số lớn)
      payload.representerNameVanHanh = formData.representerNameOnline;
      payload.representerJobVanHanh = formData.representerJobOnline;
      payload.representerCCCDVanHanh = formData.representerCCCDOnline;
      payload.representerDiaChiVanHanh = formData.addressOnline;
      payload.representerMobileVanHanh = formData.representerMobileOnline;
      payload.representerEmailVanHanh = formData.representerEmailOnline;

      // Xoá các trường không lưu trong CSDL
      delete (payload as any).companyName;
      delete (payload as any).companyAddress;
      delete (payload as any).companyEmail;
      delete (payload as any).representerName;
      delete (payload as any).representerCCCD;
      delete (payload as any).representerMobile;
      delete (payload as any).representerEmail;

      const isSubmitAction = formData.status === PlatformStatusConstant.ChoDuyet || formData.status === PlatformStatusConstant.DeNghiChinhSua;
      const shouldSign = isSubmitAction && isSignDoanhNghiep;

      if (shouldSign) {
        payload.status = PlatformStatusConstant.TamLuu;
      }

      setSubmitting(true);
      try {
        const attachmentIds = [
          ...Object.values(docsMap).map((x) => x?.id).filter(Boolean),
        ] as string[];

        if (props.item?.id) {
          const response = await platformManageService.updateOnlineBooking({
            ...payload,
            id: props.item.id,
            listFileIds: attachmentIds,
          });
          if (response.status) {
            if (shouldSign) {
              setSignIds([props.item.id]);
              setIsSignModalOpen(true);
            } else {
              message.success("Cập nhật nền tảng thành công");
              form.resetFields();
              props.onSuccess(platformType);
              props.onClose(platformType);
            }
          } else {
            message.error(response.message ?? "Cập nhật nền tảng thất bại");
          }
          return;
        }
        const response = await platformManageService.createOnlineBooking({
          ...payload,
          listFileIds: attachmentIds,
        });
        if (response.status) {
          const savedId = response.data?.id || platformManageId;
          if (shouldSign) {
            setSignIds([savedId]);
            setIsSignModalOpen(true);
          } else {
            message.success("Đăng ký nền tảng thành công");
            form.resetFields();
            props.onSuccess(platformType);
            props.onClose(platformType);
          }
        } else {
          message.error(response.message ?? "Đăng ký nền tảng thất bại");
        }
      } catch (error) {
        message.error("Có lỗi xảy ra: " + error);
      } finally {
        setSubmitting(false);
      }
    };

  const handleCancel = () => {
    form.resetFields();
    props.onClose(platformType);
  };

  const getFormattedDate = () => {
    const now = new Date();
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7"
    ];
    const dayName = days[now.getDay()];
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dayName} ngày ${dd}/${mm}/${yyyy}`;
  };

  const getPageTitle = () => {
    return isEdit ? "Chỉnh sửa hồ sơ Nền tảng Đặt hàng trực tuyến" : "Đăng ký hồ sơ Nền tảng Đặt hàng trực tuyến";
  };

  const loadDetail = useCallback(async () => {
    if (!props.item?.id) return;
    setLoadingDetail(true);
    setPlatformId(props.item.id);
    try {
      const detailResponse = await platformManageService.get(props.item.id);

      let companyResponse: any = null;
      if (detailResponse?.data?.organizationId) {
        companyResponse = await companyInfoService.get(String(detailResponse.data.organizationId)).catch(() => null);
      } else {
        companyResponse = await companyInfoService.getByCurrentUser().catch(() => null);
      }

      let companyFormData: Partial<PlatformManageFormType> = {};
      if (companyResponse?.data) {
        setCompanyTaxCode(companyResponse.data.taxCode ?? "");
        setCompanyId(companyResponse.data.id);
        setTypeOrganization(companyResponse.data.typeOrganization ?? "");
        companyFormData = mapCompanyInfoRepresenterToForm(companyResponse.data);
        if (companyResponse.data.dkkd) {
          setDkkdFile({
            id: "dkkd",
            tenTaiLieu: companyResponse.data.dkkd.split('/').pop() || "Đăng ký kinh doanh",
            duongDanFile: companyResponse.data.dkkd,
            duongDanFilePDF: "",
            extension: companyResponse.data.dkkd.split('.').pop() || "pdf",
            tenTaiLieuText: companyResponse.data.dkkd.split('/').pop() || "Đăng ký kinh doanh",
            isXoaFile: false,
          });
        }
      }

      if (detailResponse?.data) {
        setCurrentStatus(detailResponse.data.status);
        const detailFormData = mapDetailToForm(detailResponse.data);
        // Merge detail values with company prefilled fields (detail values win)
        form.setFieldsValue({
          ...companyFormData,
          ...detailFormData,
          companyName: detailFormData.companyName || companyFormData.companyName,
          companyAddress: detailFormData.companyAddress || companyFormData.companyAddress,
          companyEmail: detailFormData.companyEmail || companyFormData.companyEmail,
          representerName: detailFormData.representerName || companyFormData.representerName,
          representerCCCD: detailFormData.representerCCCD || companyFormData.representerCCCD,
          representerMobile: detailFormData.representerMobile || companyFormData.representerMobile,
          representerEmail: detailFormData.representerEmail || companyFormData.representerEmail,
          representerJob: detailFormData.representerJob || companyFormData.representerJob,
          addressDaiDien: detailFormData.addressDaiDien || companyFormData.addressDaiDien,
        });

        setCompanyTaxCode(detailResponse.data.companyTaxCode ?? companyTaxCode);
        if (detailResponse.data.imagePath) {
          setMainLogoFile({
            id: detailResponse.data.id,
            tenTaiLieu: detailResponse.data.imagePath.split('/').pop() || "Logo nền tảng",
            duongDanFile: detailResponse.data.imagePath,
            duongDanFilePDF: "",
            extension: detailResponse.data.imagePath.split('.').pop() || "png",
            tenTaiLieuText: detailResponse.data.imagePath.split('/').pop() || "Logo nền tảng",
            isXoaFile: false,
          });
        }

        try {
          const fileResponse = await fileServerService.getByItemId(props.item.id);
          const existingDocsMap: PlatformDocumentMap = {};
          (fileResponse?.data ?? []).forEach((f) => {
            if (f?.loaiTaiLieu) {
              existingDocsMap[f.loaiTaiLieu] = f;
            }
          });
          setDocsMap(existingDocsMap);
        } catch {
          setDocsMap({});
        }
      } else if (companyResponse?.data) {
        form.setFieldsValue(companyFormData);
      }
    } catch {
      message.error("Không tải được dữ liệu để chỉnh sửa");
    } finally {
      setLoadingDetail(false);
    }
  }, [form, props.item?.id]);

  const loadCompanyInfoForCreate = useCallback(async () => {
    try {
      const response = await companyInfoService.getByCurrentUser();
      if (response?.data) {
        form.setFieldsValue(mapCompanyInfoRepresenterToForm(response.data));
        setCompanyTaxCode(response.data.taxCode ?? "");
        setCompanyId(response.data.id);
        setTypeOrganization(response.data.typeOrganization ?? "");
        if (response.data.dkkd) {
          setDkkdFile({
            id: "dkkd",
            tenTaiLieu: response.data.dkkd.split('/').pop() || "Đăng ký kinh doanh",
            duongDanFile: response.data.dkkd,
            duongDanFilePDF: "",
            extension: response.data.dkkd.split('.').pop() || "pdf",
            tenTaiLieuText: response.data.dkkd.split('/').pop() || "Đăng ký kinh doanh",
            isXoaFile: false,
          });
        }
      }
    } catch {
      // Không chặn thao tác thêm mới nếu chưa có CompanyInfo
    }
  }, [form]);

  const loadDropdownByGroupCode = useCallback(
    async (groupCode: string): Promise<DropdownOption[]> => {
      const response = await duLieuDanhMucService.getDropdownCode(groupCode);
      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((item: DropdownOption) => ({
          label: item.label ?? "",
          value: item.value ?? "",
        }));
      }
      return [];
    },
    [],
  );

  const loadCatalogOptions = useCallback(async () => {
    try {
      const [hosting, loaiHangHoa, os, languages] = await Promise.all([
        loadDropdownByGroupCode("DVCCHOSTING"),
        loadDropdownByGroupCode("LOAIHANGHOA"),
        duLieuDanhMucService.getDropdownCode("OSCODE"),
        loadDropdownByGroupCode("NgonNgu"),
      ]);
      setHostingOptions(hosting);
      setLoaiHangHoaOptions(loaiHangHoa);
      setOsOptions(os?.data ?? []);
      setLanguageOptions(languages);
    } catch {
      message.error("Không tải được danh mục dữ liệu");
    }
  }, [loadDropdownByGroupCode]);

  useEffect(() => {
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
    loadCatalogOptions();
    if (props.item?.id) {
      setPlatformId(props.item.id);
      setDocsMap({});
      loadDetail();
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: PlatformStatusConstant.ChoDuyet,
        availabilityType: 1,
      });
      setCurrentStatus(PlatformStatusConstant.ChoDuyet);
      setLogoFile(null);
      setMainLogoFile(null);
      setDocsMap({});
      setPlatformId(createClientUuid());
      loadCompanyInfoForCreate();
    }
  }, [
    props.item?.id,
    form,
    loadDetail,
    loadCatalogOptions,
    loadCompanyInfoForCreate,
  ]);

  return (
    <>
      <style>{`
        .ant-form-item {
          margin-bottom: 12px !important;
        }
      `}</style>

      {/* TOP STICKY HEADER TOOLBAR */}
      <div className="sticky-header-toolbar">
        {/* Row 1: Breadcrumb on the left, Date on the right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            paddingBottom: "8px",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1, minWidth: "250px" }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <span className="breadcrumb-link" style={{ cursor: "pointer" }} onClick={() => router.push("/dashboard")}>Trang chủ</span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span
                className="breadcrumb-link"
                style={{ cursor: "pointer" }}
                onClick={() => props.onClose(platformType)}
              >
                Nền tảng trực tuyến
              </span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>{getPageTitle()}</span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px", fontSize: "14px" }} />
            <span>{getFormattedDate()}</span>
          </div>
        </div>

        {/* Separator line */}
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            marginTop: "4px",
            marginBottom: "16px",
            width: "100%",
          }}
        />

        {/* Row 2: Back button on the left, Save/Cancel buttons on the right */}

      </div>

      <div className="create-page-container">

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
          .create-page-container .ant-form-item-label > label .ant-form-item-required::before,
          .create-page-container .ant-form-item-label > label.ant-form-item-required::before {
            color: #e53935 !important;
          }
          .create-page-container .ant-form-item-label > label > .required-star,
          .create-page-container .required-star {
            color: #e53935 !important;
            font-weight: 700 !important;
          }
          .create-page-container div[style*="padding: 24"] {
            padding: 16px 20px !important;
          }
          .create-page-container div[style*="padding: 24px"] {
            padding: 16px 20px !important;
          }
          .create-page-container div[style*="marginBottom: 24"] {
            margin-bottom: 16px !important;
          }
          .create-page-container div[style*="marginBottom: 24px"] {
            margin-bottom: 16px !important;
          }
          .create-page-container div[style*="marginTop: 24"] {
            margin-top: 16px !important;
          }
          .create-page-container div[style*="marginTop: 24px"] {
            margin-top: 16px !important;
          }
        `}} />
        <Card
          title={
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
              📂 {isEdit ? "Cập nhật hồ sơ Nền tảng trực tuyến" : "Đăng ký Nền tảng trực tuyến"}
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
                <Button
                  size="large"
                  type="default"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => props.onClose(platformType)}
                >
                  Quay lại danh sách
                </Button>
                <Button
                  size="large"
                  icon={<UndoOutlined />}
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Hủy bỏ
                </Button>
                {(!props.item?.id || currentStatus === PlatformStatusConstant.TamLuu) && (
                  <Button
                    size="large"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={async () => {
                      form.setFieldsValue({ status: PlatformStatusConstant.TamLuu });
                      setCurrentStatus(PlatformStatusConstant.TamLuu);
                      const values = form.getFieldsValue();
                      await handleOnFinish(values);
                    }}
                    loading={submitting}
                  >
                    Lưu nháp
                  </Button>
                )}
                {currentStatus === PlatformStatusConstant.CanBoSungThongTin && (
                  <Button
                    size="large"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={async () => {
                      form.setFieldsValue({ status: PlatformStatusConstant.CanBoSungThongTin });
                      setCurrentStatus(PlatformStatusConstant.CanBoSungThongTin);
                      const values = form.getFieldsValue();
                      await handleOnFinish(values);
                    }}
                    loading={submitting}
                  >
                    Lưu
                  </Button>
                )}
                {currentStatus === PlatformStatusConstant.DaXacNhan ? (
                  <Button
                    size="large"
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => {
                      form.setFieldsValue({ status: PlatformStatusConstant.DeNghiChinhSua });
                      setCurrentStatus(PlatformStatusConstant.DeNghiChinhSua);
                      setTimeout(() => form.submit(), 0);
                    }}
                    loading={submitting}
                    style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                  >
                    Lưu & Đề nghị chỉnh sửa
                  </Button>
                ) : (
                  <Button
                    size="large"
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => {
                      form.setFieldsValue({ status: PlatformStatusConstant.ChoDuyet });
                      setCurrentStatus(PlatformStatusConstant.ChoDuyet);
                      setTimeout(() => form.submit(), 0);
                    }}
                    loading={submitting}
                    style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                  >
                    Lưu & Gửi duyệt
                  </Button>
                )}
              </Flex>
            </Affix>
          }
          style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
          bodyStyle={{ padding: "24px 32px" }}
        >
          <Spin spinning={loadingDetail}>
            <Form
              layout="vertical"
              form={form}
              name="platformManageCreateUpdate"
              onFinish={handleOnFinish}
              initialValues={{
                status: PlatformStatusConstant.ChoDuyet,
                availabilityType: 1,
              }}
              autoComplete="off"
              size="middle"
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              scrollToFirstError={{ behavior: "smooth", block: "center" }}
            >
              {isEdit && (
                <div style={{ marginBottom: "24px", background: "#f8fafc", padding: 24, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <Form.Item<PlatformManageFormType>
                    label={<strong style={{ fontSize: "15px", color: "#1e293b" }}>Chọn loại hình nền tảng (*)</strong>}
                    name="platformManageTypeId"
                    rules={[{ required: true, message: "Vui lòng chọn loại hình nền tảng!" }]}
                  >
                    <Select
                      placeholder="Chọn loại hình nền tảng..."
                      options={PlatformManageTypeConstant.getDropdownList()}
                      style={{ borderRadius: 6, height: 40 }}
                    />
                  </Form.Item>
                </div>
              )}

              <FormSection
                sectionKey="owner"
                title="🏢 Phần 1. Thông tin chủ quản nền tảng"
                order={1}
              >
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                    Thông tin mặc định (Lấy từ tài khoản đăng nhập, không được phép sửa)
                  </div>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label="Tên tổ chức/chủ quản nền tảng"
                        name="companyName"
                        rules={[
                          {
                            required: !isDraft,
                            message: "Vui lòng nhập tên tổ chức/chủ quản nền tảng",
                          },
                        ]}
                      >
                        <Input
                          disabled
                          placeholder="Nhập tên tổ chức/chủ quản nền tảng"
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label="Email tiếp nhận thông tin"
                        name="companyEmail"
                        rules={[
                          { type: "email", message: "Email không đúng định dạng" },
                        ]}
                      >
                        <Input
                          disabled
                          type="email"
                          placeholder="Nhập email tiếp nhận thông tin"
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label="Mã số thuế/Số GCN/QĐ"
                        name="companyTaxCode"
                        rules={[
                          {
                            required: !isDraft,
                            message: "Vui lòng nhập mã số thuế hoặc số GCN/QĐ",
                          },
                        ]}
                      >
                        <Input
                          disabled
                          placeholder="Nhập mã số thuế hoặc số GCN/QĐ"
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label="Địa chỉ trụ sở chính"
                        name="companyAddress"
                      >
                        <Input
                          disabled
                          placeholder="Nhập địa chỉ trụ sở chính"
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={24}>
                      <Form.Item label="File ảnh đăng ký doanh nghiệp (ĐKKD)">
                        <SingleFileUploader
                          value={dkkdFile}
                          readOnly={true}
                          category={FileCategoryConstant.Platform}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
                      Thông tin Người đại diện pháp luật và người chịu trách nhiệm quản lý, vận hành
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
                      <div style={comparisonHeaderCellStyle}>
                        Người chịu trách nhiệm quản lý và vận hành nền tảng
                      </div>

                      <div style={comparisonIndexCellStyle}>1</div>
                      <div style={comparisonContentCellStyle}>Họ và tên</div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerName"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập họ và tên" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input disabled placeholder="Nhập họ và tên" style={inputStyle} />
                        </Form.Item>
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerNameOnline"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập họ và tên" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Nhập họ và tên" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>2</div>
                      <div style={comparisonContentCellStyle}>Chức danh</div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerJob"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập chức danh" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Nhập chức danh" style={inputStyle} />
                        </Form.Item>
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerJobOnline"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập chức danh" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Nhập chức danh" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>3</div>
                      <div style={comparisonContentCellStyle}>Số CCCD / số hộ chiếu</div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerCCCD"
                          style={{ marginBottom: 0 }}
                        >
                          <Input disabled placeholder="Nhập số CCCD hoặc hộ chiếu" style={inputStyle} />
                        </Form.Item>
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerCCCDOnline"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập số CCCD hoặc hộ chiếu" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Nhập số CCCD hoặc hộ chiếu" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>4</div>
                      <div style={comparisonContentCellStyle}>Địa chỉ liên hệ</div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="addressDaiDien"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập địa chỉ liên hệ" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea
                            disabled
                            rows={2}
                            placeholder="Nhập địa chỉ liên hệ"
                            style={inputStyle}
                          />
                        </Form.Item>
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="addressOnline"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập địa chỉ liên hệ" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea
                            rows={2}
                            placeholder="Nhập địa chỉ liên hệ"
                            style={inputStyle}
                          />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>5</div>
                      <div style={comparisonContentCellStyle}>Số điện thoại</div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerMobile"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập số điện thoại" },
                            {
                              pattern: /^[0-9]{10,11}$/,
                              message: "Số điện thoại không hợp lệ (10-11 số)",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input disabled placeholder="Nhập số điện thoại" style={inputStyle} />
                        </Form.Item>
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerMobileOnline"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập số điện thoại" },
                            {
                              pattern: /^[0-9]{10,11}$/,
                              message: "Số điện thoại không hợp lệ (10-11 số)",
                            },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Nhập số điện thoại" style={inputStyle} />
                        </Form.Item>
                      </div>

                      <div style={comparisonIndexCellStyle}>6</div>
                      <div style={comparisonContentCellStyle}>Email</div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerEmail"
                          rules={[
                            { type: "email", message: "Email không đúng định dạng" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            disabled
                            type="email"
                            placeholder="Nhập email"
                            style={inputStyle}
                          />
                        </Form.Item>
                      </div>
                      <div style={comparisonCellStyle}>
                        <Form.Item<PlatformManageFormType>
                          name="representerEmailOnline"
                          rules={[
                            { required: !isDraft, message: "Vui lòng nhập email" },
                            { type: "email", message: "Email không đúng định dạng" },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            type="email"
                            placeholder="Nhập email"
                            style={inputStyle}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection
                sectionKey="platform"
                title="🌐 Phần 2. Thông tin nền tảng / Ứng dụng TMĐT"
                order={2}
              >
                <Col span={24}>
                  <Form.Item<PlatformManageFormType>
                    label="Hình thức hoạt động"
                    name="availabilityType"
                    rules={[{ required: true, message: "Vui lòng chọn hình thức hoạt động!" }]}
                  >
                    <Radio.Group>
                      <Radio value={1}>Chỉ có website</Radio>
                      <Radio value={2}>Chỉ có ứng dụng</Radio>
                      <Radio value={3}>Có cả ứng dụng và website</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.availabilityType !== curr.availabilityType}>
                  {({ getFieldValue }) => {
                    const availability = getFieldValue("availabilityType");
                    const showWebsite = availability === 1 || availability === 3;
                    const showApp = availability === 2 || availability === 3;

                    return (
                      <>
                        {showWebsite && (
                          <Col span={24}>
                            <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: 12, marginBottom: 24, border: "1px dashed #cbd5e1" }}>
                              <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>Nếu nền tảng là Website</div>
                              <Row gutter={[16, 0]}>
                                <Col xs={24} md={12}>
                                  <Form.Item<PlatformManageFormType>
                                    label={reqLabel("Tên nền tảng")}
                                    name="name"
                                    rules={[{ required: !isDraft, message: "Vui lòng nhập tên nền tảng!" }]}
                                  >
                                    <Input placeholder="Tên nền tảng (Ví dụ: Hệ thống quản lý hoạt động thương mại điện tử )" style={inputStyle} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item<PlatformManageFormType>
                                    label={reqLabel("Địa chỉ website")}
                                    name="domain"
                                    rules={[{ required: !isDraft, message: "Vui lòng nhập địa chỉ website!" }]}
                                  >
                                    <Input placeholder="Địa chỉ tên miền (ví dụ: online.gov.vn)" style={inputStyle} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item<PlatformManageFormType>
                                    label="Địa chỉ phụ website"
                                    name="domainAdd"
                                  >
                                    <Input placeholder="Các tên miền phụ khác..." style={inputStyle} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item<PlatformManageFormType>
                                    label={reqLabel("Chủ sở hữu tên miền")}
                                    name="domainOwner"
                                    rules={[{ required: !isDraft, message: "Vui lòng nhập chủ sở hữu tên miền!" }]}
                                  >
                                    <Input placeholder="Nhập tên cá nhân/tổ chức sở hữu..." style={inputStyle} />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item label={reqLabel("Logo website")}>
                                    <SingleFileUploader
                                      value={logoFile}
                                      onChange={setLogoFile}
                                      accept=".jpg,.jpeg,.png"
                                      category={FileCategoryConstant.Platform}
                                      subCategory={platformType}
                                      taxCode={companyTaxCode}
                                      itemId={platformManageId}
                                      loaiTaiLieu="PlatformLogo"
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                  <Form.Item<PlatformManageFormType>
                                    label={reqLabel("Đơn vị cung cấp hosting")}
                                    name="ispId"
                                    rules={[{ required: !isDraft, message: "Vui lòng chọn đơn vị hosting!" }]}
                                  >
                                    <Select
                                      placeholder="Chọn đơn vị hosting"
                                      options={hostingOptions}
                                      style={inputStyle}
                                      showSearch
                                      optionFilterProp="label"
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev.ispId !== curr.ispId}>
                                    {({ getFieldValue }) => getFieldValue("ispId") === "Khac" && (
                                      <Form.Item<PlatformManageFormType>
                                        label={reqLabel("Đơn vị cung cấp hosting khác")}
                                        name="ispIdKhac"
                                        rules={[{ required: !isDraft, message: "Vui lòng nhập đơn vị hosting!" }]}
                                      >
                                        <Input placeholder="Nhập tên đơn vị cung cấp..." style={inputStyle} />
                                      </Form.Item>
                                    )}
                                  </Form.Item>
                                </Col>
                              </Row >
                            </div >
                          </Col >
                        )}

                        {
                          showApp && (
                            <Col span={24}>
                              <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: 12, marginBottom: 24, border: "1px dashed #cbd5e1" }}>
                                <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>Nếu nền tảng là Ứng dụng</div>
                                <Form.List name="appInfoItems">
                                  {(fields, { add, remove }) => (
                                    <>
                                      <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff" }}>
                                          <thead>
                                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                              <th style={{ padding: "10px 12px", textAlign: "center", width: 50, color: "#475569", fontWeight: 600 }}>#</th>
                                              <th style={{ padding: "10px 12px", textAlign: "left", width: 180, color: "#475569", fontWeight: 600 }}>Hệ điều hành <span style={{ color: "#e53935", fontWeight: 700 }}>(*)</span></th>
                                              <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 600 }}>Tên ứng dụng <span style={{ color: "#e53935", fontWeight: 700 }}>(*)</span></th>
                                              <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 600 }}>Địa chỉ lưu trữ hoặc tải ứng dụng <span style={{ color: "#e53935", fontWeight: 700 }}>(*)</span></th>
                                              <th style={{ padding: "10px 12px", textAlign: "left", width: 260, color: "#475569", fontWeight: 600 }}>Logo <span style={{ color: "#e53935", fontWeight: 700 }}>(*)</span></th>
                                              <th style={{ padding: "10px 12px", textAlign: "center", width: 85, color: "#475569", fontWeight: 600 }}>Thao tác</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {fields.map(({ key, name, ...restField }, index) => (
                                              <tr key={key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                <td style={{ padding: 12, textAlign: "center", fontWeight: 500, color: "#64748b" }}>{index + 1}</td>
                                                <td style={{ padding: 12 }}>
                                                  <Form.Item
                                                    {...restField}
                                                    name={[name, "osCode"]}
                                                    rules={[{ required: !isDraft, message: "Chọn HĐH" }]}
                                                    style={{ marginBottom: 0 }}
                                                  >
                                                    <Select
                                                      placeholder="Chọn HĐH"
                                                      options={osOptions}
                                                      style={{ borderRadius: 6, width: "100%" }}
                                                    />
                                                  </Form.Item>
                                                </td>
                                                <td style={{ padding: 12 }}>
                                                  <Form.Item
                                                    {...restField}
                                                    name={[name, "appName"]}
                                                    rules={[{ required: !isDraft, message: "Nhập tên" }]}
                                                    style={{ marginBottom: 0 }}
                                                  >
                                                    <Input placeholder="Tên ứng dụng" style={{ borderRadius: 6 }} />
                                                  </Form.Item>
                                                </td>
                                                <td style={{ padding: 12 }}>
                                                  <Form.Item
                                                    {...restField}
                                                    name={[name, "appLink"]}
                                                    rules={[{ required: !isDraft, message: "Nhập link" }]}
                                                    style={{ marginBottom: 0 }}
                                                  >
                                                    <Input placeholder="Link tải..." style={{ borderRadius: 6 }} />
                                                  </Form.Item>
                                                </td>
                                                <td style={{ padding: 12 }}>
                                                  <Form.Item
                                                    {...restField}
                                                    name={[name, "appLogo"]}
                                                    style={{ marginBottom: 0 }}
                                                  >
                                                    <SingleFileUploader
                                                      category={FileCategoryConstant.Platform}
                                                      subCategory={platformType}
                                                      taxCode={companyTaxCode}
                                                      itemId={platformManageId}
                                                      loaiTaiLieu={`AppLogo_${name}`}
                                                      uploadLabel="Tải Logo"
                                                      size="small"
                                                    />
                                                  </Form.Item>
                                                </td>
                                                <td style={{ padding: 12, textAlign: "center" }}>
                                                  <Button type="text" danger onClick={() => remove(name)}>Xóa</Button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                        <Button type="dashed" onClick={() => add()} block style={{ marginTop: 12, borderRadius: 8, height: 38, fontWeight: 500 }}>
                                          + Thêm thông tin ứng dụng di động
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </Form.List>
                              </div>
                            </Col>
                          )
                        }
                      </>
                    );
                  }}
                </Form.Item >

                <div style={{ ...platformGroupStyle, marginBottom: 0 }}>
                  <div style={platformGroupTitleStyle}>Các thông tin bắt buộc khác cho nền tảng</div>
                  <Row gutter={[16, 0]}>

                    <Col xs={24} md={24}>
                      <Form.Item<PlatformManageFormType>
                        label={reqLabel("Logo nền tảng")}
                        name="imagePath"
                        rules={[{ required: !isDraft, message: "Vui lòng tải logo nền tảng!" }]}
                      >
                        <div>
                          <SingleFileUploader
                            value={mainLogoFile}
                            onChange={(file) => {
                              setMainLogoFile(file);
                              form.setFieldsValue({ imagePath: file?.duongDanFile || "" });
                            }}
                            accept=".jpg,.jpeg,.png"
                            category={FileCategoryConstant.Platform}
                            subCategory={platformType}
                            taxCode={companyTaxCode}
                            itemId={platformManageId}
                            loaiTaiLieu="PlatformLogoMain"
                            uploadLabel="Upload ảnh"
                          />
                        </div>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label="Loại hàng hóa/dịch vụ giao dịch"
                        name="loaiHangHoaKhac"
                      >
                        <Select
                          mode="multiple"
                          allowClear
                          showSearch
                          maxTagCount="responsive"
                          optionFilterProp="label"
                          options={loaiHangHoaOptions}
                          fieldNames={{ label: "label", value: "value" }}
                          placeholder="Chọn một hoặc nhiều loại hàng hóa, dịch vụ"
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label={reqLabel("Ngôn ngữ")}
                        name="ngonNgu"
                        rules={[{ required: !isDraft, message: "Vui lòng chọn ít nhất một ngôn ngữ!" }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Chọn ngôn ngữ sử dụng..."
                          options={languageOptions}
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Form.Item<PlatformManageFormType>
                      name="status"
                      hidden
                    />
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label={reqLabel("Chính sách bảo mật")}
                        name="chinhSachBaoMat"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Nội dung hoặc liên kết đến chính sách bảo mật..."
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label={reqLabel("Phương thức tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại")}
                        name="tiepNhanKhieuNai"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Mô tả quy trình và đầu mối tiếp nhận..."
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label={reqLabel("Chính sách giá")}
                        name="chinhSachGia"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Quy định về giá, thuế, phí công bố trên nền tảng..."
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label={reqLabel("Chính sách về thanh toán")}
                        name="chinhSachThanhToan"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Các phương thức thanh toán hỗ trợ..."
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label="Các điều kiện hoặc hạn chế trong việc cung cấp hàng hóa hoặc dịch vụ trên nền tảng (nếu có)"
                        name="dieuKienCungCap"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Giới hạn về địa lý, độ tuổi cung cấp..."
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        name="phuongThucLienHeOnline"
                        hidden
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item<PlatformManageFormType>
                        label={reqLabel("Hình thức hỗ trợ trực tuyến")}
                        name="phuongThucLienHe"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Ví dụ: Chat trực tuyến, Hotline, Email..."
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item<PlatformManageFormType>
                        label={reqLabel("Chính sách giao hàng, đổi trả và hoàn tiền (áp dụng cho hàng hóa) hoặc phương thức cung cấp dịch vụ, chính sách chấm dứt dịch vụ và hoàn tiền (áp dụng cho dịch vụ)")}
                        name="chinhSachGiaoHang"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Quy trình giao nhận, đổi trả, hoàn tiền..."
                          style={inputStyle}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </FormSection >

              {getPlatformDocs(platformType).length > 0 && (
                <FormSection
                  sectionKey="operation"
                  title="📂 Phần 3. Dữ liệu hệ thống & Tài liệu đính kèm"
                  order={3}
                >
                  <PlatformDocumentList
                    platformId={platformManageId}
                    platformType={platformType}
                    taxCode={companyTaxCode}
                    value={docsMap}
                    onChange={setDocsMap}
                  />
                </FormSection>
              )}
            </Form >
          </Spin >
        </Card >
      </div >

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

export default CreateOrUpdate;
