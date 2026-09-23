"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Input, Card, Select, Row, Col, message, InputNumber, DatePicker, Button, Spin, Divider, Checkbox, Radio, Affix, Flex } from "antd";
import { useForm } from "antd/es/form/Form";
import { ArrowLeftOutlined, CalendarOutlined, UndoOutlined, SaveOutlined, SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import platformManageService from "@/services/platformManage/platformManage.service";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformTypeConstant from "@/constants/PlatformTypeConstant";
import PlatformFunctionConstant from "@/constants/PlatformFunctionConstant";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import PlatformDocumentList, {
  PlatformDocumentMap,
  validatePlatformDocs,
} from "@/components/upload-file/PlatformDocumentList";
import { getPlatformDocs } from "@/constants/PlatformDocumentCatalog";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import { DropdownOption } from "@/types/general";
import { PlatformManageCreateRequestType } from "@/types/platformManage/request";
import fileServerService from "@/libs/file-uploader/fileServer.service";

import { buildFileUrl } from "@/utils/file";
import { generateUUID } from "@/utils/string";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { CertificateInfo, SignResultItem } from "@/libs/moit-sign/types";
import Link from "next/link";

const { TextArea } = Input;

const CreatePlatformForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") || "NTThongBaoKD";
  const id = searchParams.get("id");
  const isEdit = !!id;

  const [form] = useForm<PlatformManageCreateRequestType>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isCompanyLoading, setIsCompanyLoading] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [isSignDoanhNghiep, setIsSignDoanhNghiep] = useState<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);

  // === State cho File Upload mới ===
  const [platformId, setPlatformId] = useState<string>(id || generateUUID());
  const [logoFile, setLogoFile] = useState<TaiLieuDinhKemType | null>(null);
  const [appIconFile, setAppIconFile] = useState<TaiLieuDinhKemType | null>(null);
  const [organizationFileDangKyUyQuyenFile, setOrganizationFileDangKyUyQuyenFile] = useState<TaiLieuDinhKemType | null>(null);
  const [dkkdFile, setDkkdFile] = useState<TaiLieuDinhKemType | null>(null);
  const [docsMap, setDocsMap] = useState<PlatformDocumentMap>({});
  const [companyTaxCode, setCompanyTaxCode] = useState<string>("");
  const [mainLogoFile, setMainLogoFile] = useState<TaiLieuDinhKemType | null>(null);

  const [hostingOptions, setHostingOptions] = useState<DropdownOption[]>([]);
  const [osOptions, setOsOptions] = useState<DropdownOption[]>([]);
  const [languageOptions, setLanguageOptions] = useState<DropdownOption[]>([]);
  const [functionOptions, setFunctionOptions] = useState<DropdownOption[]>([]);
  const [productOptions, setProductOptions] = useState<DropdownOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([]);

  const platformManageTypeId = Form.useWatch("platformManageTypeId", form);
  const [currentStatus, setCurrentStatus] = useState<number | undefined>();
  const isNuocNgoai =
    platformManageTypeId === "NTDangKyKDNuocNgoai" ||
    platformManageTypeId === "NTTichHopNuocNgoai";
  const isMau04 = platformManageTypeId === "NTTichHopNuocNgoai";
  const isTichHop = platformManageTypeId === "NTTichHop" || platformManageTypeId === "NTTichHopNuocNgoai";
  const isNuocNgoaiUyQuyen = platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai";
  const isShowPolicy = platformManageTypeId === "NTThongBaoKD" || platformManageTypeId === "NTDangKyKDNuocNgoai";
  const isShowSupport = platformManageTypeId === "NTThongBaoKD" || platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai";

  const goBackToList = () => {
    const type = form.getFieldValue("platformManageTypeId") || defaultType || "NTThongBaoKD";
    switch (type) {
      case "NTThongBaoKD":
        router.push("/QLPlatform/NenTangTrucTuyen");
        break;
      case "NTDangKyKDNuocNgoai":
        router.push("/QLPlatform/DoanhNghiep/DatHangNuocNgoai");
        break;
      case "NTTichHop":
        router.push("/QLPlatform/DoanhNghiep/TrungGianTrongNuoc");
        break;
      case "NTTichHopNuocNgoai":
        router.push("/QLPlatform/DoanhNghiep/TrungGianNuocNgoai");
        break;
      default:
        router.push("/QLPlatform/NenTangTrucTuyen");
        break;
    }
  };

  const getListPageLabel = () => {
    switch (defaultType) {
      case "NTThongBaoKD":
        return "Nền tảng trực tuyến";
      case "NTDangKyKDNuocNgoai":
        return "Đặt hàng nước ngoài";
      case "NTTichHop":
        return "Trung gian trong nước";
      case "NTTichHopNuocNgoai":
      case "NTNuocNgoai":
        return "Trung gian nước ngoài";
      default:
        return "Danh sách hồ sơ";
    }
  };

  const loadCompanyInfo = useCallback(async () => {
    setIsCompanyLoading(true);
    try {
      const response = await companyInfoService.getByCurrentUser();
      if (response?.data) {
        setCompanyTaxCode(response.data.taxCode ?? "");
        const currentType = form.getFieldValue("platformManageTypeId") || defaultType;
        const isNuocNgoaiKD = currentType === "NTDangKyKDNuocNgoai" || currentType === "NTTichHopNuocNgoai";
        if (isNuocNgoaiKD) {
          form.setFieldsValue({
            organizationId: response.data.id,
            typeOrganization: response.data.typeOrganization,
            organizationNameUyQuyen: response.data.name,
            organizationCodeUyQuyen: response.data.taxCode,
            organizationDiaChiUyQuyen: response.data.address,
            organizationEmailUyQuyen: response.data.email,
            representerNameDauMoiUyQuyen: response.data.representerName,
            representerJobDauMoiUyQuyen: "Người đại diện theo pháp luật",
            representerCCCDDauMoiUyQuyen: response.data.representerCCCD,
            representerDiaChiDauMoiUyQuyen: response.data.address,
            representerMobileDauMoiUyQuyen: response.data.representerMobile ?? response.data.phone,
            representerEmailDauMoiUyQuyen: response.data.representerEmail,
          });
          if (currentType === "NTTichHopNuocNgoai") {
            form.setFieldsValue({
              representerName: response.data.representerName,
              representerJob: "Người đại diện theo pháp luật",
              representerCCCD: response.data.representerCCCD,
              representerDiaChi: response.data.address,
              representerMobile: response.data.representerMobile ?? response.data.phone,
              representerEmail: response.data.representerEmail,
              representerNameUyQuyen: response.data.representerName,
              representerJobUyQuyen: "Người đại diện theo pháp luật",
              representerCCCDUyQuyen: response.data.representerCCCD,
              representerDiaChiUyQuyen: response.data.address,
              representerMobileUyQuyen: response.data.representerMobile ?? response.data.phone,
              representerEmailUyQuyen: response.data.representerEmail,
            });
          }
        } else {
          form.setFieldsValue({
            organizationId: response.data.id,
            typeOrganization: response.data.typeOrganization,
            companyName: response.data.name,
            companyTaxCode: response.data.taxCode,
            companyAddress: response.data.address,
            companyPhone: response.data.phone,
            companyEmail: response.data.email,

            representerName: response.data.representerName,
            representerJob: "Người đại diện theo pháp luật",
            representerCCCD: response.data.representerCCCD,
            representerDiaChi: response.data.address,
            representerMobile: response.data.representerMobile ?? response.data.phone,
            representerEmail: response.data.representerEmail,
          });
        }
        if (response.data.dkkd) {
          if (isNuocNgoaiKD) {
            setOrganizationFileDangKyUyQuyenFile({
              id: "dkkd",
              tenTaiLieu: response.data.dkkd.split('/').pop() || "Đăng ký kinh doanh",
              duongDanFile: response.data.dkkd,
              duongDanFilePDF: "",
              extension: response.data.dkkd.split('.').pop() || "pdf",
              tenTaiLieuText: response.data.dkkd.split('/').pop() || "Đăng ký kinh doanh",
              isXoaFile: false,
            } as any);
          } else {
            setDkkdFile({
              id: "dkkd",
              tenTaiLieu: response.data.dkkd.split('/').pop() || "Đăng ký kinh doanh",
              duongDanFile: response.data.dkkd,
              duongDanFilePDF: "",
              extension: response.data.dkkd.split('.').pop() || "pdf",
              tenTaiLieuText: response.data.dkkd.split('/').pop() || "Đăng ký kinh doanh",
              isXoaFile: false,
            } as any);
          }
        }
      }
    } catch (error) {
      console.error("Không thể pre-fill thông tin doanh nghiệp từ SSO:", error);
    } finally {
      setIsCompanyLoading(false);
    }
  }, [form, defaultType]);

  const renderOrganizationUyQuyen = () => {
    const isNuocNgoaiKD = platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai";
    return (
      <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px dashed #cbd5e1" }}>
        <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
          Thông tin pháp nhân được chỉ định theo ủy quyền tại Việt Nam
        </div>
        <Row gutter={[24, 0]}>
          <Col span={12}>
            <Form.Item<PlatformManageCreateRequestType>
              label="Tên tổ chức"
              name="organizationNameUyQuyen"
              rules={[{ required: true, message: "Vui lòng nhập tên tổ chức!" }]}
            >
              <Input disabled={isNuocNgoaiKD} placeholder="Nhập tên tổ chức..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<PlatformManageCreateRequestType>
              label="Mã Doanh nghiệp"
              name="organizationCodeUyQuyen"
              rules={[{ required: true, message: "Vui lòng nhập mã doanh nghiệp!" }]}
            >
              <Input disabled={isNuocNgoaiKD} placeholder="Nhập mã doanh nghiệp..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<PlatformManageCreateRequestType>
              label="Địa chỉ trụ sở chính"
              name="organizationDiaChiUyQuyen"
            >
              <Input disabled={isNuocNgoaiKD} placeholder="Nhập địa chỉ trụ sở..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<PlatformManageCreateRequestType>
              label="Email tiếp nhận thông tin"
              name="organizationEmailUyQuyen"
              rules={[
                { type: "email", message: "Email không đúng định dạng!" }
              ]}
            >
              <Input disabled={isNuocNgoaiKD} placeholder="Nhập email..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<PlatformManageCreateRequestType>
              label="File ảnh đăng ký doanh nghiệp"
              name="organizationFileDangKyUyQuyen"
            >
              <div>
                <SingleFileUploader
                  value={organizationFileDangKyUyQuyenFile}
                  onChange={(file) => {
                    setOrganizationFileDangKyUyQuyenFile(file);
                    form.setFieldsValue({ organizationFileDangKyUyQuyen: file?.duongDanFile || "" });
                  }}
                  accept=".jpg,.jpeg,.png"
                  category={FileCategoryConstant.Platform}
                  subCategory={platformManageTypeId || defaultType}
                  taxCode={companyTaxCode}
                  itemId={platformId}
                  loaiTaiLieu="OrganizationFileDangKyUyQuyen"
                  uploadLabel="Tải ảnh đăng ký doanh nghiệp"
                  readOnly={isNuocNgoaiKD}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  };

  const loadCatalogOptions = useCallback(async () => {
    try {
      const [hosting, os, languages, functions, products, status] = await Promise.all([
        duLieuDanhMucService.getDropdownCode("DVCCHOSTING"),
        duLieuDanhMucService.getDropdownCode("OSCODE"),
        duLieuDanhMucService.getDropdownCode("NgonNgu"),
        duLieuDanhMucService.getDropdownCode("PLATFORM_FUNCTION"),
        duLieuDanhMucService.getDropdownCode("LOAIHANGHOA"),
        duLieuDanhMucService.getDropdownCode("PLATFORM_STATUS"),
      ]);
      setHostingOptions(hosting?.data || []);
      setOsOptions(os?.data || []);
      setLanguageOptions(languages?.data || []);
      setFunctionOptions(functions?.data || []);
      setProductOptions(products?.data || []);
      setStatusOptions(status?.data || []);
    } catch {
      message.error("Không tải được danh mục dữ liệu");
    }
  }, []);

  const handleAutoFill = () => {
    const testData: any = {
      name: `Nền tảng Test ${dayjs().format("HH:mm:ss")}`,
      domain: `test-platform-${dayjs().valueOf()}.vn`,
      ispId: hostingOptions[0]?.value || "ViettelIDC",
      ngonNgu: [languageOptions[0]?.value || "Tiếng Việt", languageOptions[1]?.value || "Tiếng Anh"],
      loaiHangHoaKhac: [productOptions[0]?.value || "Thời trang", productOptions[1]?.value || "Điện tử"],
      detail: [functionOptions[0]?.value || "Bán hàng", functionOptions[1]?.value || "Thanh toán"],
      phuongThucLienHe: "Chat trực tuyến, Hotline 1900xxxx",
      tiepNhanKhieuNai: "Tiếp nhận qua hotline 24/7 và giải quyết trong vòng 48 giờ làm việc.",
      dieuKienCungCap: "Cung cấp cho người dùng trên 18 tuổi tại lãnh thổ Việt Nam.",
      chinhSachGiaoHang: "Giao hàng toàn quốc từ 2-5 ngày, miễn phí đổi trả trong 7 ngày.",
      domainAdd: "Công ty Cổ phần Công nghệ Thử nghiệm",
      representerNameVanHanh: "Nguyễn Văn Vận Hành",
      representerJobVanHanh: "Trưởng bộ phận vận hành hệ thống",
      representerCCCDVanHanh: "001090123456",
      representerDiaChiVanHanh: "Số 456, Đường Giải Quyết, Quận Ba Đình, Hà Nội",
      representerMobileVanHanh: "0912345678",
      representerEmailVanHanh: "vanhanh@test-tech.vn",
      organizationNameUyQuyen: "Công ty Luật TNHH Một Thành Viên Việt Nam",
      organizationCodeUyQuyen: "0109876543",
      organizationEmailUyQuyen: "legal@vietnam-law.vn",
      organizationDiaChiUyQuyen: "Số 789, Đường Ủy Quyền, Quận Hoàn Kiếm, Hà Nội",
      representerNameDauMoiUyQuyen: "Trần Thị Đại Diện",
      representerJobDauMoiUyQuyen: "Luật sư điều hành",
      representerCCCDDauMoiUyQuyen: "001085001234",
      representerDiaChiDauMoiUyQuyen: "Số 10, Ngõ 20, Phố Tư Vấn, Hà Nội",
      representerMobileDauMoiUyQuyen: "0901122334",
      representerEmailDauMoiUyQuyen: "tran.dai.dien@vietnam-law.vn",
      representerNameUyQuyen: "Nguyễn Văn Đại Diện Chỉ Định",
      representerJobUyQuyen: "Đại diện pháp lý ủy quyền",
      representerCCCDUyQuyen: "001095004321",
      representerDiaChiUyQuyen: "Số 88, Phố Đại Diện, Hà Nội",
      representerMobileUyQuyen: "0909887766",
      representerEmailUyQuyen: "vietnam.rep@foreign-platform.com",
      representerNameOnline: "Phạm Văn Quản Lý",
      representerJobOnline: "Trưởng phòng TMĐT",
      representerCCCDOnline: "001096001234",
      AddressOnline: "Số 99, Phố TMĐT, Cầu Giấy, Hà Nội",
      representerDiaChiOnline: "Số 99, Phố TMĐT, Cầu Giấy, Hà Nội",
      representerMobileOnline: "0911223344",
      representerEmailOnline: "ecommerce.manager@test-tech.vn",
      phuongThucGiaiQuyetPhanAnh: "Tiếp nhận qua hotline 1900xxxx và email support@test-tech.vn. Giải quyết trong vòng 72 giờ.",
      dieuKienOrHanCheCungCapHHDV: "Không cung cấp cho người dùng dưới 15 tuổi. Hạn chế giao hàng tại các vùng sâu vùng xa.",
      chinhSachApDungHHDV: "Hàng hóa: Đổi trả trong 7 ngày nếu lỗi NSX. Dịch vụ: Hoàn tiền 100% nếu không kích hoạt được trong 24h.",
      chinhSachBaoMat: "Thông tin cá nhân được bảo vệ theo tiêu chuẩn ISO 27001 và Nghị định 13/2023/NĐ-CP.",
      chinhSachGia: "Giá niêm yết là giá cuối cùng, đã bao gồm thuế GTGT và các loại thuế liên quan khác.",
      chinhSachThanhToan: "Hỗ trợ nhiều phương thức: Chuyển khoản, Ví điện tử (Momo, ZaloPay), Thẻ tín dụng.",
      hinhThucHoTroTrucTuyen: "Chat trực tuyến 24/7, Email support@test-tech.vn, Tổng đài CSKH 1900xxxx.",
    };

    form.setFieldsValue(testData);
    message.success("Đã tự động điền dữ liệu test!");
  };

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoadingDetail(true);
    setPlatformId(id);
    try {
      const response = await platformManageService.get(id);
      if (response?.status && response.data) {
        const data = response.data;
        setCompanyTaxCode(data.companyTaxCode ?? "");
        // Parse multi-select fields properly
        const ngonNgu = data.ngonNgu ? data.ngonNgu.split("@@") : [];
        const detail = data.detail ? data.detail.split("@@") : [];
        const chucNangNenTang = data.chucNangNenTang ? data.chucNangNenTang.split("@") : [];
        const loaiHangHoaKhac = data.loaiHangHoaKhac ? data.loaiHangHoaKhac.split(",") : [];
        // Extract decoupled App Info list if available
        const appInfoItems = (data.appInfoItems ?? []).map((x: any) => ({
          appName: x.appName,
          osCode: x.osCode,
          appLink: x.appLink,
          appLogo: x.appLogo ? {
            id: x.id ?? generateUUID(),
            tenTaiLieu: x.appLogo.split('/').pop() || "Logo ứng dụng",
            duongDanFile: x.appLogo,
            extension: x.appLogo.split('.').pop() || "png",
          } : null
        }));

        setCurrentStatus(data.status);
        form.setFieldsValue({
          ...data,
          ngonNgu,
          detail,
          chucNangNenTang,
          loaiHangHoaKhac,
          appInfoItems,
          imagePath: data.imagePath,
          websiteNumberNgay: data.websiteNumberNgay ? dayjs(data.websiteNumberNgay) : undefined,
          representerJobDaiDienNgay: data.representerJobDaiDienNgay ? dayjs(data.representerJobDaiDienNgay) : undefined,
        } as any);

        // --- Fetch tài liệu đính kèm cũ ---
        try {
          const filesRes = await fileServerService.getByItemId(id);
          if (filesRes?.data) {
            const grouped: PlatformDocumentMap = {};
            filesRes.data.forEach((f) => {
              if (f.loaiTaiLieu) {
                grouped[f.loaiTaiLieu] = f;
              }
            });
            setDocsMap(grouped);

            // Gán file ảnh đăng ký doanh nghiệp ủy quyền nếu có
            if (grouped["OrganizationFileDangKyUyQuyen"]) {
              setOrganizationFileDangKyUyQuyenFile(grouped["OrganizationFileDangKyUyQuyen"]);
            } else if (data.organizationFileDangKyUyQuyen) {
              setOrganizationFileDangKyUyQuyenFile({
                id: "",
                duongDanFile: data.organizationFileDangKyUyQuyen,
                tenTaiLieu: data.organizationFileDangKyUyQuyen.split('/').pop() || "Ảnh đăng ký doanh nghiệp",
                extension: data.organizationFileDangKyUyQuyen.split('.').pop() || "png",
              } as any);
            }

            // Gán file ảnh đăng ký doanh nghiệp (DKKD) của chủ quản nếu có
            if (grouped["CompanyDKKD"]) {
              setDkkdFile(grouped["CompanyDKKD"]);
            }

            // Gán file logo chính nếu có
            if (grouped["PlatformLogoMain"]) {
              setMainLogoFile(grouped["PlatformLogoMain"]);
            } else if (data.imagePath) {
              setMainLogoFile({
                id: "",
                duongDanFile: data.imagePath,
                tenTaiLieu: data.imagePath.split('/').pop() || "Logo nền tảng",
                extension: data.imagePath.split('.').pop() || "png",
              } as any);
            }

            // Gán file logo website nếu có
            if (grouped["PlatformLogo"]) {
              setLogoFile(grouped["PlatformLogo"]);
            } else if (data.logo) {
              setLogoFile({
                id: "",
                duongDanFile: data.logo,
                tenTaiLieu: data.logo.split('/').pop() || "Logo website",
                extension: data.logo.split('.').pop() || "png",
              } as any);
            }
          }
        } catch (err) {
          console.error("Không tải được danh sách tài liệu cũ:", err);
        }

      } else {
        message.error(response?.message ?? "Không tải được thông tin chi tiết hồ sơ");
      }
    } catch (error: any) {
      message.error(error.message ?? "Lỗi tải thông tin chi tiết");
    } finally {
      setLoadingDetail(false);
    }
  }, [id, form]);

  useEffect(() => {
    form.resetFields();
    loadCatalogOptions();
    if (isEdit) {
      loadDetail();
    } else {
      if (defaultType && defaultType !== "NTNuocNgoai") {
        form.setFieldsValue({
          platformManageTypeId: defaultType,
          status: 1, // Mặc định: Chờ duyệt
          availabilityType: 1,
        });
      } else if (defaultType === "NTNuocNgoai") {
        form.setFieldsValue({
          platformManageTypeId: "NTDangKyKDNuocNgoai",
          status: 1,
          availabilityType: 1,
        });
      }
      loadCompanyInfo();
    }

    const getIsSignDoanhNghiep = async () => {
      const res = await duLieuDanhMucService.getAllByGroupCode(
        "CAUHINH_SIGN_NENTANG"
      );

      if (res.status && res.data?.length) {
        let configCode = "";
        const type = platformManageTypeId || defaultType;
        if (type === PlatformManageTypeConstant.NTThongBaoKD) {
          configCode = "SIGN_DATHANGTRUCTUYEN";
        } else if (type === PlatformManageTypeConstant.NTDangKyKDNuocNgoai) {
          configCode = "SIGN_DATHANGNUOCNGOAI";
        } else if (type === PlatformManageTypeConstant.NTTichHop) {
          configCode = "SIGN_TRUNGGIANTRONGNUOC";
        } else if (type === PlatformManageTypeConstant.NTTichHopNuocNgoai) {
          configCode = "SIGN_TRUNGGIANNUOCNGOAI";
        }

        const signConfig = configCode ? res.data.find(
          (item: any) => item.code === configCode
        ) : null;
        setIsSignDoanhNghiep(signConfig?.priority === 1);
      }
    };

    getIsSignDoanhNghiep();
  }, [defaultType, form, isEdit, loadCompanyInfo, loadCatalogOptions, loadDetail]);

  const savePlatform = async (values: any, targetStatus?: number) => {
    // Validate tài liệu bắt buộc
    const missing = validatePlatformDocs(values.platformManageTypeId || defaultType, docsMap);
    if (missing.length && targetStatus !== 0 && targetStatus !== PlatformStatusConstant.CanBoSungThongTin) {
      message.error(`Vui lòng tải lên các tài liệu bắt buộc: ${missing.join(", ")}`);
      const docsEl = document.getElementById("documents-section");
      if (docsEl) {
        docsEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    const statusValue = targetStatus ?? form.getFieldValue("status") ?? values.status ?? 1;
    const isSubmitAction =
      statusValue === PlatformStatusConstant.ChoDuyet ||
      statusValue === PlatformStatusConstant.DeNghiChinhSua;
    const shouldSign = isSubmitAction && isSignDoanhNghiep;

    setSubmitting(true);
    try {
      const isNuocNgoai =
        values.platformManageTypeId === "NTDangKyKDNuocNgoai" ||
        values.platformManageTypeId === "NTTichHopNuocNgoai";

      // Xử lý các trường chọn nhiều (Serializable multi-select)
      const ngonNguStr = Array.isArray(values.ngonNgu) ? values.ngonNgu.join("@@") : values.ngonNgu;
      const functionStr = Array.isArray(values.detail) ? values.detail.join("@@") : values.detail;
      const chucNangStr = Array.isArray(values.chucNangNenTang) ? values.chucNangNenTang.join("@") : values.chucNangNenTang;
      const productsStr = Array.isArray(values.loaiHangHoaKhac) ? values.loaiHangHoaKhac.join(",") : values.loaiHangHoaKhac;

      const payload: any = {
        ...values,
        id: isEdit ? id : platformId,
        status: shouldSign ? PlatformStatusConstant.TamLuu : statusValue,
        ngonNgu: ngonNguStr,
        detail: functionStr,
        chucNangNenTang: chucNangStr,
        loaiHangHoaKhac: productsStr,
        organizationFileDangKyUyQuyen: organizationFileDangKyUyQuyenFile?.duongDanFile || values.organizationFileDangKyUyQuyen,
        mauSo: defaultType === "NTThongBaoKD" ? "Mẫu 01" :
          values.platformManageTypeId === "NTDangKyKDNuocNgoai" ? "Mẫu 02" :
            values.platformManageTypeId === "NTTichHop" ? "Mẫu 03" :
              values.platformManageTypeId === "NTTichHopNuocNgoai" ? "Mẫu 04" : undefined,
        isNuocNgoai,
        websiteNumberNgay: values.websiteNumberNgay && (values.websiteNumberNgay as any).toDate ? (values.websiteNumberNgay as any).toDate() : (values.websiteNumberNgay || undefined),
        representerJobDaiDienNgay: values.representerJobDaiDienNgay && (values.representerJobDaiDienNgay as any).toDate ? (values.representerJobDaiDienNgay as any).toDate() : (values.representerJobDaiDienNgay || undefined),

        imagePath: mainLogoFile?.duongDanFile || (typeof values.imagePath === 'object' ? values.imagePath?.duongDanFile : values.imagePath),
        logo: logoFile?.duongDanFile || (typeof values.imagePath === 'object' ? values.imagePath?.duongDanFile : values.imagePath),
        representerDiaChiOnline: values.AddressOnline || values.representerDiaChiOnline,
      };

      // Cập nhật appInfoItems cho đúng cấu trúc payload
      if (values.availabilityType === 2 || values.availabilityType === 3) {
        payload.appInfoItems = (values.appInfoItems ?? []).map((x: any) => ({
          appName: x.appName,
          osCode: x.osCode,
          appLink: x.appLink,
          appLogo: typeof x.appLogo === 'object' ? x.appLogo?.duongDanFile : x.appLogo
        }));
      } else {
        payload.appInfoItems = [];
      }

      // Rules for specific platform types: NTThongBaoKD, NTTichHop, NTTichHopNuocNgoai
      const specialTypes = ["NTThongBaoKD", "NTTichHop", "NTTichHopNuocNgoai"];
      if (specialTypes.includes(values.platformManageTypeId || defaultType)) {
        // "không lưu trong cơ sở dữ liệu" for these fields
        delete payload.representerName;
        delete payload.representerCCCD;
        delete payload.representerMobile;
        delete payload.representerEmail;
        // payload.representerJob and payload.representerDiaChi ARE kept and saved.
      }

      const fileIds: string[] = [];

      // 1. Files from docsMap (PlatformDocumentList)
      Object.values(docsMap).forEach(f => { if (f?.id) fileIds.push(f.id); });

      // 2. Individual file fields from states & values
      const individualFiles = [
        logoFile,
        mainLogoFile,
        dkkdFile,
        values.seal,
        organizationFileDangKyUyQuyenFile,
      ];
      individualFiles.forEach(f => { if (f?.id && f.id !== "dkkd") fileIds.push(f.id); });

      // 3. App logos from appInfoItems
      (values.appInfoItems ?? []).forEach((x: any) => {
        if (x.appLogo?.id) fileIds.push(x.appLogo.id);
      });

      payload.listFileIds = fileIds;

      let response;

      if (isEdit && id) {
        response = await platformManageService.update({ ...payload, id });
      } else {
        response = await platformManageService.create(payload);
      }

      if (response?.status) {
        const finalItemId = response.data?.id || (isEdit ? id : platformId);

        if (shouldSign) {
          setSignIds([finalItemId]);
          setIsSignModalOpen(true);
        } else {
          message.success(response.message ?? (targetStatus === 0 ? "Đã lưu nháp hồ sơ" : "Gửi hồ sơ thành công"));
          goBackToList();
        }
      } else {
        message.error(response?.message ?? "Thao tác thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
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
        note: targetStatus === PlatformStatusConstant.DeNghiChinhSua ? "Lưu & đề nghị chỉnh sửa sau khi cập nhật" : "Gửi duyệt từ màn hình thêm mới/cập nhật",
      });

      if (res.status) {
        message.success(targetStatus === PlatformStatusConstant.DeNghiChinhSua ? "Gửi đề nghị chỉnh sửa hồ sơ thành công" : "Ký số và gửi duyệt hồ sơ thành công");
        goBackToList();
      } else {
        message.error(res.message ?? "Thao tác gửi duyệt thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Có lỗi xảy ra khi ký số");
    } finally {
      setSubmitting(false);
      setIsSignModalOpen(false);
    }
  };

  const handleFinish = async (values: any) => {
    await savePlatform(values);
  };

  const getPageTitle = () => {
    const prefix = isEdit ? "Chỉnh sửa" : "Đăng ký";
    switch (defaultType) {
      case "NTThongBaoKD":
        return `${prefix} hồ sơ Nền tảng Đặt hàng trực tuyến`;
      case "NTTichHop":
        return `${prefix} hồ sơ Nền tảng trung gian TMĐT`;
      case "NTNuocNgoai":
        return `${prefix} hồ sơ Nền tảng nước ngoài`;
      default:
        return `${prefix} hồ sơ Nền tảng TMĐT`;
    }
  };

  const getPlatformOptions = () => {
    if (defaultType === "NTNuocNgoai") {
      return [
        {
          value: "NTDangKyKDNuocNgoai",
          label: "Nền tảng Đặt hàng nước ngoài hoạt động tại Việt Nam",
        },
        {
          value: "NTTichHopNuocNgoai",
          label: "Nền tảng Trung gian / MXH hoạt động tại Việt Nam",
        },
      ];
    }
    return PlatformManageTypeConstant.getDropdownList();
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

  if (loadingDetail) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải thông tin hồ sơ...</span>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .create-page-container {
          padding: 0;
          min-height: auto;
          background-color: transparent;
        }

        .ant-form-item {
          margin-bottom: 12px !important;
        }

        .breadcrumb-link {
          color: #64748b;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .breadcrumb-link:hover {
          color: #0f172a;
        }

        .hover-red-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hover-red-btn:hover {
          background-color: #a31d22 !important;
          border-color: #a31d22 !important;
          color: #ffffff !important;
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(194, 39, 45, 0.15) !important;
        }
        .hover-red-btn:active {
          transform: translateY(0);
        }

        .hover-blue-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hover-blue-btn:hover {
          background-color: #1d4ed8 !important;
          border-color: #1d4ed8 !important;
          color: #ffffff !important;
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.15) !important;
        }
        .hover-blue-btn:active {
          transform: translateY(0);
        }

        .hover-gray-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hover-gray-btn:hover {
          background-color: #334155 !important;
          border-color: #334155 !important;
          color: #ffffff !important;
          transform: translateY(-1px);
        }
        .hover-gray-btn:active {
          transform: translateY(0);
        }

        .section-title {
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 24px;
          font-size: 16px;
          border-left: 4px solid #c2272d;
          padding-left: 12px;
          line-height: 1.2;
        }

        .sticky-header-toolbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 16px 24px;
          margin: -24px -24px 20px -24px;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
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
              <Link href="/dashboard" className="breadcrumb-link">Trang chủ</Link>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span
                className="breadcrumb-link"
                style={{ cursor: "pointer" }}
                onClick={() => goBackToList()}
              >
                {getListPageLabel()}
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

        {/* Row 2: Action buttons */}
        <Flex style={{ gap: 12, paddingBottom: "8px", justifyContent: "end", alignItems: "end" }}>
          <Button
            size="large"
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => goBackToList()}
          >
            Quay lại danh sách
          </Button>
          <Button
            size="large"
            icon={<UndoOutlined />}
            onClick={() => goBackToList()}
            disabled={submitting}
          >
            Hủy bỏ
          </Button>
          {process.env.NODE_ENV === "development" && (
            <Button
              size="large"
              type="dashed"
              onClick={handleAutoFill}
              style={{ color: "#d97706", borderColor: "#f59e0b", fontWeight: 600 }}
            >
              ⚡ Tự điền dữ liệu (Test)
            </Button>
          )}
          {(!isEdit || currentStatus === PlatformStatusConstant.TamLuu) && (
            <Button
              size="large"
              type="primary"
              icon={<SaveOutlined />}
              onClick={async () => {
                setCurrentStatus(0);
                const currentValues = form.getFieldsValue();
                await savePlatform(currentValues, 0); // 0 là trạng thái TamLuu
              }}
              loading={submitting || isCompanyLoading}
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
                setCurrentStatus(PlatformStatusConstant.CanBoSungThongTin);
                const currentValues = form.getFieldsValue();
                await savePlatform(currentValues, PlatformStatusConstant.CanBoSungThongTin);
              }}
              loading={submitting || isCompanyLoading}
            >
              Lưu
            </Button>
          )}
          {(currentStatus === PlatformStatusConstant.DaXacNhan) ? (
            <Button
              size="large"
              type="primary"
              icon={<SendOutlined />}
              onClick={async () => {
                const values = form.getFieldsValue();
                if (!values.companyName?.trim() || !values.companyTaxCode?.trim()) {
                  message.error("Tài khoản của bạn chưa được liên kết thông tin doanh nghiệp (Tên doanh nghiệp, MST). Không thể đề nghị chỉnh sửa!");
                  return;
                }
                form.setFieldsValue({ status: PlatformStatusConstant.DeNghiChinhSua });
                setCurrentStatus(PlatformStatusConstant.DeNghiChinhSua);
                setTimeout(() => form.submit(), 0);
              }}
              loading={submitting || isCompanyLoading}
              style={{ backgroundColor: "#eab308", borderColor: "#eab308" }}
            >
              Lưu & Đề nghị chỉnh sửa
            </Button>
          ) : (
            <Button
              size="large"
              type="primary"
              icon={<SendOutlined />}
              onClick={async () => {
                const values = form.getFieldsValue();
                if (!values.companyName?.trim() || !values.companyTaxCode?.trim()) {
                  message.error("Tài khoản của bạn chưa được liên kết thông tin doanh nghiệp (Tên doanh nghiệp, MST). Không thể gửi duyệt, chỉ có thể lưu nháp!");
                  return;
                }
                form.setFieldsValue({ status: PlatformStatusConstant.ChoDuyet });
                setCurrentStatus(PlatformStatusConstant.ChoDuyet);
                setTimeout(() => form.submit(), 0);
              }}
              loading={submitting || isCompanyLoading}
              style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
            >
              Lưu & Gửi duyệt
            </Button>
          )}
        </Flex>
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
        {/* SINGLE FLAT CARD CONTAINER */}
        <Card
          style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
          bodyStyle={{ padding: "24px 32px" }}
        >
          <Form
            form={form}
            layout="vertical"
            name="create-platform-form"
            onFinish={handleFinish}
            initialValues={{
              status: 1,
              availabilityType: 1,
            }}
            autoComplete="off"
            scrollToFirstError={{ behavior: "smooth", block: "center" }}
          >
            <div style={{
              marginBottom: "32px",
              background: "#f8fafc",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              display: (isEdit) ? "block" : "none"
            }}>
              <Form.Item<PlatformManageCreateRequestType>
                label={<strong style={{ fontSize: "15px", color: "#1e293b" }}>Chọn loại hình nền tảng</strong>}
                name="platformManageTypeId"
                rules={[{ required: true, message: "Vui lòng chọn loại hình nền tảng!" }]}
              >
                <Select
                  placeholder="Chọn loại hình nền tảng..."
                  options={getPlatformOptions()}
                  style={{ borderRadius: 6, height: 40 }}
                />
              </Form.Item>
            </div>

            {/* PHẦN 1. THÔNG TIN CHỦ QUẢN NỀN TẢNG */}
            <div style={{ marginBottom: "32px" }}>
              <Divider plain style={{ marginTop: 0, marginBottom: 16 }}>
                <span className="font-semibold text-blue-600" style={{ fontSize: "16px", fontWeight: 700 }}>
                  🏢 Phần 1. Thông tin chủ quản nền tảng
                </span>
              </Divider>

              {/* Đưa khối ủy quyền lên trên cùng nếu type = NTDangKyKDNuocNgoai */}
              {platformManageTypeId === "NTDangKyKDNuocNgoai" && renderOrganizationUyQuyen()}

              <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                  {platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai"
                    ? "Thông tin chủ quản nền tảng thương mại điện tử"
                    : "Thông tin mặc định (Lấy từ tài khoản đăng nhập, không được phép sửa)"}
                </div>
                <Row gutter={[24, 0]}>
                  <Col span={12}>
                    <Form.Item
                      label="Tên chủ quản nền tảng"
                      name="companyName"
                      rules={platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai" ? [{ required: true, message: "Vui lòng nhập tên chủ quản nền tảng!" }] : []}
                    >
                      <Input disabled={platformManageTypeId !== "NTDangKyKDNuocNgoai" && platformManageTypeId !== "NTTichHopNuocNgoai"} placeholder="Nhập tên chủ quản..." style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Mã số thuế Doanh nghiệp"
                      name="companyTaxCode"
                      rules={platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai" ? [{ required: true, message: "Vui lòng nhập mã số thuế!" }] : []}
                    >
                      <Input disabled={platformManageTypeId !== "NTDangKyKDNuocNgoai" && platformManageTypeId !== "NTTichHopNuocNgoai"} placeholder="Nhập mã số thuế..." style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Form.Item name="organizationId" noStyle>
                    <Input type="hidden" />
                  </Form.Item>
                  <Col hidden span={12}>
                    <Form.Item label="Loại Doanh nghiệp" name="typeOrganization">
                      <Input disabled style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Địa chỉ trụ sở chính"
                      name="companyAddress"
                      rules={platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai" ? [{ required: true, message: "Vui lòng nhập địa chỉ trụ sở!" }] : []}
                    >
                      <Input disabled={platformManageTypeId !== "NTDangKyKDNuocNgoai" && platformManageTypeId !== "NTTichHopNuocNgoai"} placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Email tiếp nhận thông tin"
                      name="companyEmail"
                      rules={platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai" ? [
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không đúng định dạng!" }
                      ] : []}
                    >
                      <Input disabled={platformManageTypeId !== "NTDangKyKDNuocNgoai" && platformManageTypeId !== "NTTichHopNuocNgoai"} placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="File ảnh đăng ký doanh nghiệp (DKKD)"
                    >
                      <div>
                        <SingleFileUploader
                          value={dkkdFile}
                          onChange={setDkkdFile}
                          readOnly={platformManageTypeId !== "NTDangKyKDNuocNgoai" && platformManageTypeId !== "NTTichHopNuocNgoai"}
                          category={FileCategoryConstant.Platform}
                          subCategory={platformManageTypeId || defaultType}
                          taxCode={companyTaxCode}
                          itemId={platformId}
                          loaiTaiLieu="CompanyDKKD"
                        />
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Dành cho các nền tảng trong nước và Nền tảng trung gian nước ngoài (Mẫu 04) */}
              {platformManageTypeId !== "NTDangKyKDNuocNgoai" && (
                <>
                  {/* Thông tin Người đại diện pháp luật */}
                  <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                      Thông tin Người đại diện pháp luật (Theo dữ liệu SSO)
                    </div>
                    <Row gutter={[24, 0]}>
                      <Col span={12}>
                        <Form.Item label="Họ và tên" name="representerName">
                          <Input disabled style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Chức danh người đại diện pháp luật"
                          name="representerJob"
                          rules={[{ required: true, message: "Vui lòng nhập chức danh người đại diện!" }]}
                        >
                          <Input placeholder="Nhập chức danh..." style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Số CCCD/Số hộ chiếu" name="representerCCCD">
                          <Input disabled style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Địa chỉ"
                          name="representerDiaChi"
                          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                        >
                          <Input placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Số điện thoại" name="representerMobile">
                          <Input disabled style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Email" name="representerEmail">
                          <Input disabled style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* Người chịu trách nhiệm quản lý hoạt động thương mại điện tử */}
                  <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                      <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
                        Người chịu trách nhiệm quản lý hoạt động thương mại điện tử
                      </div>
                      <Checkbox
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            const vals = form.getFieldsValue();
                            form.setFieldsValue({
                              representerNameOnline: vals.representerName,
                              representerJobOnline: vals.representerJob,
                              representerCCCDOnline: vals.representerCCCD,
                              representerDiaChiOnline: vals.representerDiaChi,
                              representerMobileOnline: vals.representerMobile,
                              representerEmailOnline: vals.representerEmail,
                            });
                          }
                        }}
                      >
                        Trùng thông tin người đại diện pháp luật
                      </Checkbox>
                    </div>
                    <Row gutter={[24, 0]}>
                      <Col span={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Họ và tên"
                          name="representerNameOnline"
                          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                        >
                          <Input placeholder="Nhập họ và tên..." style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Chức danh"
                          name="representerJobOnline"
                          rules={[{ required: true, message: "Vui lòng nhập chức danh!" }]}
                        >
                          <Input placeholder="Nhập chức danh..." style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Số CCCD/ Số hộ chiếu"
                          name="representerCCCDOnline"
                          rules={[{ required: true, message: "Vui lòng nhập số định danh!" }]}
                        >
                          <Input placeholder="Nhập số CCCD/Hộ chiếu..." style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Địa chỉ"
                          name="representerDiaChiOnline"
                          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                        >
                          <Input placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Số điện thoại"
                          name="representerMobileOnline"
                          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                        >
                          <Input placeholder="Nhập số điện thoại..." style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Email"
                          name="representerEmailOnline"
                          rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không đúng định dạng!" }
                          ]}
                        >
                          <Input placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </>
              )}

              {/* Nhân sự vận hành — áp dụng cho NTTichHop (Mẫu 03) */}
              {isTichHop && (
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px dashed #cbd5e1" }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                    Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại trực tuyến (áp dụng đối với nền tảng số lớn)
                  </div>
                  <Row gutter={[24, 0]}>
                    <Col span={8}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Họ và tên"
                        name="representerNameVanHanh"
                      >
                        <Input placeholder="Nhập họ và tên..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Chức danh"
                        name="representerJobVanHanh"
                      >
                        <Input placeholder="Ví dụ: Trưởng bộ phận vận hành..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Số CCCD/ Số hộ chiếu"
                        name="representerCCCDVanHanh"
                      >
                        <Input placeholder="Nhập số định danh..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Số điện thoại"
                        name="representerMobileVanHanh"
                      >
                        <Input placeholder="Nhập số điện thoại..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Email"
                        name="representerEmailVanHanh"
                        rules={[
                          { type: "email", message: "Email không đúng định dạng!" }
                        ]}
                      >
                        <Input placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Địa chỉ"
                        name="representerDiaChiVanHanh"
                      >
                        <Input placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Thông tin đại diện được chỉ định theo uỷ quyền tại Việt Nam (Chỉ dành cho NTTichHopNuocNgoai / Mẫu 04) */}
              {platformManageTypeId === "NTTichHopNuocNgoai" && (
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px dashed #2563eb" }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                    Thông tin đại diện được chỉ định theo uỷ quyền tại Việt Nam
                  </div>
                  <Row gutter={[24, 0]}>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Họ và tên"
                        name="representerNameUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                      >
                        <Input placeholder="Nhập họ và tên..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Chức danh"
                        name="representerJobUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập chức danh!" }]}
                      >
                        <Input placeholder="Nhập chức danh..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Số CCCD/ Số hộ chiếu"
                        name="representerCCCDUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập số định danh!" }]}
                      >
                        <Input placeholder="Nhập số định danh..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Địa chỉ"
                        name="representerDiaChiUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                      >
                        <Input placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Số điện thoại"
                        name="representerMobileUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                      >
                        <Input placeholder="Nhập số điện thoại..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Email"
                        name="representerEmailUyQuyen"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không đúng định dạng!" }
                        ]}
                      >
                        <Input placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Thông tin pháp nhân được chỉ định theo ủy quyền tại Việt Nam (Mẫu 02 & 04) */}
              {platformManageTypeId === "NTTichHopNuocNgoai" && renderOrganizationUyQuyen()}

              {/* Đầu mối liên hệ ủy quyền (Mẫu 02 NTDangKyKDNuocNgoai & Mẫu 04 NTTichHopNuocNgoai) */}
              {isNuocNgoaiUyQuyen && (
                <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px dashed #cbd5e1" }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                    Đầu mối liên hệ ủy quyền
                  </div>
                  <Row gutter={[24, 0]}>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Họ và tên"
                        name="representerNameDauMoiUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                      >
                        <Input placeholder="Nhập họ và tên..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Chức danh"
                        name="representerJobDauMoiUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập chức danh!" }]}
                      >
                        <Input placeholder="Nhập chức danh..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Số CCCD/ Số hộ chiếu"
                        name="representerCCCDDauMoiUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập số CCCD/Số hộ chiếu!" }]}
                      >
                        <Input placeholder="Nhập số định danh..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Địa chỉ"
                        name="representerDiaChiDauMoiUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                      >
                        <Input placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Số điện thoại"
                        name="representerMobileDauMoiUyQuyen"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                      >
                        <Input placeholder="Nhập số điện thoại..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Email"
                        name="representerEmailDauMoiUyQuyen"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không đúng định dạng!" }
                        ]}
                      >
                        <Input placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}
            </div>

            {/* PHẦN 2. THÔNG TIN NỀN TẢNG */}
            <div style={{ marginBottom: "16px" }}>
              <Divider plain style={{ marginTop: 12, marginBottom: 12 }}>
                <span className="font-semibold text-blue-600" style={{ fontSize: "16px", fontWeight: 700 }}>
                  🌐 Phần 2. Thông tin nền tảng
                </span>
              </Divider>
              <div style={{ color: "#475569", marginBottom: 20, fontStyle: "italic", fontSize: "14px" }}>
                Bạn cần tích chọn 1 trong 3 định dạng: Chỉ có website, chỉ có ứng dụng, hoặc có cả ứng dụng và website
              </div>

              <Row gutter={[24, 0]}>
                {isTichHop && (
                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Loại hình nền tảng"
                      name="platformType"
                      rules={[{ required: true, message: "Vui lòng chọn loại hình nền tảng!" }]}
                    >
                      <Select
                        placeholder="Chọn loại hình nền tảng"
                        options={PlatformTypeConstant.getDropdownList()}
                        style={{ borderRadius: 6 }}
                      />
                    </Form.Item>
                  </Col>
                )}

                {isTichHop && (
                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Chức năng của nền tảng"
                      name="chucNangNenTang"
                      rules={[{ required: true, message: "Vui lòng chọn ít nhất một chức năng!" }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn chức năng của nền tảng..."
                        options={PlatformFunctionConstant.getOptions()}
                        style={{ borderRadius: 6, width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                )}
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Logo nền tảng"
                    name="imagePath"
                    rules={[{ required: true, message: "Vui lòng tải logo nền tảng!" }]}
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
                        subCategory={platformManageTypeId || defaultType}
                        taxCode={companyTaxCode}
                        itemId={platformId}
                        loaiTaiLieu="PlatformLogoMain"
                        uploadLabel="Upload ảnh"
                      />
                    </div>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
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
                    const onlyShowApp = availability === 2;
                    return (
                      <>
                        {showWebsite && (
                          <Col span={24}>
                            <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px dashed #cbd5e1" }}>
                              <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>Nếu nền tảng là Website</div>
                              <Row gutter={[24, 0]}>
                                <Col span={12}>
                                  <Form.Item<PlatformManageCreateRequestType>
                                    label="Tên nền tảng"
                                    name="name"
                                    rules={[{ required: true, message: "Vui lòng nhập tên nền tảng!" }]}
                                  >
                                    <Input placeholder="Tên nền tảng (Ví dụ: Hệ thống quản lý hoạt động thương mại điện tử )" style={{ borderRadius: 6 }} />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item<PlatformManageCreateRequestType>
                                    label="Địa chỉ website"
                                    name="domain"
                                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ website!" }]}
                                  >
                                    <Input placeholder="Địa chỉ tên miền (ví dụ: online.gov.vn)" style={{ borderRadius: 6 }} />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item<PlatformManageCreateRequestType>
                                    label="Địa chỉ phụ website"
                                    name="domainAdd"
                                  >
                                    <Input placeholder="Các tên miền phụ khác..." style={{ borderRadius: 6 }} />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item<PlatformManageCreateRequestType>
                                    label="Chủ sở hữu tên miền"
                                    name="chuSoHuu"
                                    rules={[{ required: true, message: "Vui lòng nhập chủ sở hữu tên miền!" }]}
                                  >
                                    <Input placeholder="Nhập tên cá nhân/tổ chức sở hữu..." style={{ borderRadius: 6 }} />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item<PlatformManageCreateRequestType>
                                    label="Logo website"
                                    name="logo"
                                    rules={[{ required: true, message: "Vui lòng tải logo website!" }]}
                                  >
                                    <div>
                                      <SingleFileUploader
                                        value={logoFile}
                                        onChange={(file) => {
                                          setLogoFile(file);
                                          form.setFieldsValue({ logo: file?.duongDanFile || "" });
                                        }}
                                        accept=".jpg,.jpeg,.png"
                                        category={FileCategoryConstant.Platform}
                                        subCategory={platformManageTypeId || defaultType}
                                        taxCode={companyTaxCode}
                                        itemId={platformId}
                                        loaiTaiLieu="PlatformLogo"
                                        uploadLabel="Logo"
                                      />
                                    </div>
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item<PlatformManageCreateRequestType>
                                    label="Đơn vị cung cấp hosting"
                                    name="ispId"
                                    rules={[{ required: true, message: "Vui lòng chọn đơn vị hosting!" }]}
                                  >
                                    <Select
                                      placeholder="Chọn đơn vị hosting"
                                      options={hostingOptions}
                                      style={{ borderRadius: 6 }}
                                      showSearch
                                      optionFilterProp="label"
                                    />
                                  </Form.Item>
                                </Col>
                                <Col span={24}>
                                  <Form.Item noStyle shouldUpdate={(prev, curr) => prev.ispId !== curr.ispId}>
                                    {({ getFieldValue }) => getFieldValue("ispId") === "Khac" && (
                                      <Form.Item<PlatformManageCreateRequestType>
                                        label="Đơn vị cung cấp hosting khác"
                                        name="ispIdKhac"
                                        rules={[{ required: true, message: "Vui lòng nhập đơn vị hosting!" }]}
                                      >
                                        <Input placeholder="Nhập tên đơn vị cung cấp..." style={{ borderRadius: 6 }} />
                                      </Form.Item>
                                    )}
                                  </Form.Item>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        )}

                        {showApp && (
                          <Col span={24}>
                            <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 24, border: "1px dashed #cbd5e1" }}>
                              <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>Nếu nền tảng là Ứng dụng</div>
                              <Form.List name="appInfoItems">
                                {(fields, { add, remove }) => (
                                  <>
                                    <div style={{ overflowX: "auto" }}>
                                      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff" }}>
                                        <thead>
                                          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                            <th style={{ padding: "10px 12px", textAlign: "center", width: 50, color: "#475569", fontWeight: 600 }}>#</th>
                                            <th style={{ padding: "10px 12px", textAlign: "left", width: 180, color: "#475569", fontWeight: 600 }}>Hệ điều hành</th>
                                            <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 600 }}>Tên ứng dụng</th>
                                            <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontWeight: 600 }}>Địa chỉ lưu trữ hoặc tải ứng dụng</th>
                                            <th style={{ padding: "10px 12px", textAlign: "left", width: 260, color: "#475569", fontWeight: 600 }}>Logo</th>
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
                                                  rules={[{ required: true, message: "Chọn HĐH" }]}
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
                                                  rules={[{ required: true, message: "Nhập tên" }]}
                                                  style={{ marginBottom: 0 }}
                                                >
                                                  <Input placeholder="Tên ứng dụng" style={{ borderRadius: 6 }} />
                                                </Form.Item>
                                              </td>
                                              <td style={{ padding: 12 }}>
                                                <Form.Item
                                                  {...restField}
                                                  name={[name, "appLink"]}
                                                  rules={[{ required: true, message: "Nhập link" }]}
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
                                                    subCategory={platformManageTypeId || defaultType}
                                                    taxCode={companyTaxCode}
                                                    itemId={platformId}
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
                        )}
                      </>
                    );
                  }}
                </Form.Item>
              </Row>

              <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>Các thông tin bắt buộc khác cho nền tảng</div>
                <Row gutter={[24, 0]}>
                  <Col span={isShowPolicy ? 12 : 24}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Loại hàng hóa hoặc dịch vụ được giao dịch trên nền tảng"
                      name="loaiHangHoaKhac"
                      rules={[{ required: true, message: "Vui lòng chọn loại hàng hóa hoặc dịch vụ!" }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn loại hàng hóa / dịch vụ kinh doanh (nhập loại khác nếu có...)"
                        options={productOptions}
                        style={{ borderRadius: 6 }}
                        showSearch
                        optionFilterProp="label"
                      />
                    </Form.Item>
                  </Col>

                  {isShowPolicy && (
                    <Col span={12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Ngôn ngữ"
                        name="ngonNgu"
                        rules={[{ required: true, message: "Vui lòng chọn ít nhất một ngôn ngữ!" }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Chọn ngôn ngữ sử dụng..."
                          options={languageOptions}
                          style={{ borderRadius: 6, width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  )}

                  {isShowPolicy && (
                    <>

                      <Col xs={24} md={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Chính sách bảo mật"
                          name="chinhSachBaoMat"
                          rules={[{ required: true, message: "Vui lòng nhập chính sách bảo mật!" }]}
                        >
                          <TextArea placeholder="Nội dung hoặc liên kết đến chính sách bảo mật..." rows={3} style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Phương thức tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại"
                          name="phuongThucGiaiQuyetPhanAnh"
                          rules={[{ required: true, message: "Vui lòng nhập phương thức giải quyết phản ánh!" }]}
                        >
                          <TextArea placeholder="Mô tả quy trình và đầu mối tiếp nhận..." rows={3} style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Chính sách giá"
                          name="chinhSachGia"
                          rules={[{ required: true, message: "Vui lòng nhập chính sách giá!" }]}
                        >
                          <TextArea placeholder="Quy định về giá, thuế, phí công bố trên nền tảng..." rows={3} style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Chính sách về thanh toán"
                          name="chinhSachThanhToan"
                          rules={[{ required: true, message: "Vui lòng nhập chính sách thanh toán!" }]}
                        >
                          <TextArea placeholder="Các phương thức thanh toán hỗ trợ..." rows={3} style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Các điều kiện hoặc hạn chế trong việc cung cấp hàng hóa hoặc dịch vụ trên nền tảng (nếu có)"
                          name="dieuKienOrHanCheCungCapHHDV"
                        >
                          <TextArea placeholder="Giới hạn về địa lý, độ tuổi cung cấp..." rows={3} style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item<PlatformManageCreateRequestType>
                          label="Chính sách giao hàng, đổi trả và hoàn tiền (áp dụng cho hàng hóa) hoặc phương thức cung cấp dịch vụ, chính sách chấm dứt dịch vụ và hoàn tiền (áp dụng cho dịch vụ)"
                          name="chinhSachApDungHHDV"
                          rules={[{ required: true, message: "Vui lòng nhập chính sách!" }]}
                        >
                          <TextArea placeholder="Quy trình giao nhận, đổi trả, hoàn tiền..." rows={3} style={{ borderRadius: 6 }} />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  {isShowSupport && (
                    <Col xs={24} md={platformManageTypeId === "NTTichHopNuocNgoai" ? 24 : 12}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Hình thức hỗ trợ trực tuyến"
                        name="hinhThucHoTroTrucTuyen"
                        rules={[{ required: true, message: "Vui lòng nhập hình thức hỗ trợ trực tuyến!" }]}
                      >
                        <TextArea placeholder="Ví dụ: Chat trực tuyến, Hotline, Email..." rows={3} style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </div>
            </div>

            {/* PHẦN 3. DỮ LIỆU HỆ THỐNG & TÀI LIỆU ĐÍNH KÈM */}
            {getPlatformDocs(platformManageTypeId || defaultType || "").length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <Divider plain style={{ marginTop: 12, marginBottom: 12 }}>
                  <span className="font-semibold text-blue-600" style={{ fontSize: "16px", fontWeight: 700 }}>
                    📂 Phần 3. Dữ liệu hệ thống & Tài liệu đính kèm
                  </span>
                </Divider>

                <div id="documents-section" style={{ marginTop: 24 }}>
                  <div style={{ fontWeight: 700, marginBottom: 16, color: "#1e293b", fontSize: 15 }}>
                    Tài liệu đính kèm
                  </div>
                  <div style={{ color: "#64748b", marginBottom: 16, fontSize: "13px", fontStyle: "italic" }}>
                    Vui lòng tải lên các tài liệu đính kèm theo yêu cầu của loại hình nền tảng đã chọn dưới đây.
                  </div>
                  <PlatformDocumentList
                    platformId={platformId}
                    platformType={platformManageTypeId || defaultType || ""}
                    taxCode={companyTaxCode}
                    value={docsMap}
                    onChange={setDocsMap}
                  />
                </div>
              </div>
            )}
          </Form>
        </Card>
      </div>

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

const PlatformCreatePage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải trang đăng ký hồ sơ...</span>
      </div>
    }>
      <CreatePlatformForm />
    </Suspense>
  );
};

export default PlatformCreatePage;
