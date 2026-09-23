import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Modal, Select, Row, Col, message, InputNumber, Divider, DatePicker, Button, Checkbox, Radio } from "antd";
import { useForm } from "antd/es/form/Form";
import platformManageService from "@/services/platformManage/platformManage.service";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformTypeConstant from "@/constants/PlatformTypeConstant";
import PlatformFunctionConstant from "@/constants/PlatformFunctionConstant";
import { PlatformManageCreateRequestType } from "@/types/platformManage/request";
import UploadImage from "@/components/upload-file/UploadImage";
import { DropdownOption } from "@/types/general";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import PlatformDocumentList, { PlatformDocumentMap, validatePlatformDocs } from "@/components/upload-file/PlatformDocumentList";
import { getPlatformDocs } from "@/constants/PlatformDocumentCatalog";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { generateUUID } from "@/utils/string";

const { TextArea } = Input;

interface CreateProps {
  defaultType?: string;
  onClose: () => void;
  onRefresh: () => void;
}

const CreatePlatformModal: React.FC<CreateProps> = ({ defaultType, onClose, onRefresh }) => {
  const [form] = useForm<PlatformManageCreateRequestType>();
  const [platformId] = useState<string>(generateUUID());
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isCompanyLoading, setIsCompanyLoading] = useState<boolean>(false);
  const [organizationFileDangKyUyQuyenFile, setOrganizationFileDangKyUyQuyenFile] = useState<TaiLieuDinhKemType | null>(null);
  const [companyTaxCode, setCompanyTaxCode] = useState<string>("");
  const [docsMap, setDocsMap] = useState<PlatformDocumentMap>({});

  const [hostingOptions, setHostingOptions] = useState<DropdownOption[]>([]);
  const [osOptions, setOsOptions] = useState<DropdownOption[]>([]);
  const [languageOptions, setLanguageOptions] = useState<DropdownOption[]>([]);
  const [functionOptions, setFunctionOptions] = useState<DropdownOption[]>([]);
  const [productOptions, setProductOptions] = useState<DropdownOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([]);

  const platformManageTypeId = Form.useWatch("platformManageTypeId", form);
  const isNuocNgoai = defaultType === "NTNuocNgoai" ||
    platformManageTypeId === "NTDangKyKDNuocNgoai" ||
    platformManageTypeId === "NTTichHopNuocNgoai";
  const isMau04 = platformManageTypeId === "NTTichHopNuocNgoai";
  const isTichHop = platformManageTypeId === "NTTichHop" || platformManageTypeId === "NTTichHopNuocNgoai";
  const isNuocNgoaiUyQuyen = platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai";
  const isShowPolicy = platformManageTypeId === "NTThongBaoKD" || platformManageTypeId === "NTDangKyKDNuocNgoai";
  const isShowSupport = platformManageTypeId === "NTThongBaoKD" || platformManageTypeId === "NTDangKyKDNuocNgoai" || platformManageTypeId === "NTTichHopNuocNgoai";

  const loadCompanyInfo = useCallback(async () => {
    setIsCompanyLoading(true);
    try {
      const response = await companyInfoService.getByCurrentUser();
      if (response?.data) {
        setCompanyTaxCode(response.data.taxCode ?? "");
        form.setFieldsValue({
          organizationId: response.data.id,
          typeOrganization: response.data.typeOrganization,
          companyName: response.data.name,
          companyTaxCode: response.data.taxCode,
          companyAddress: response.data.address,
          companyPhone: response.data.phone,
          representerName: response.data.representerName,
          representerJob: "Người đại diện theo pháp luật",
          representerCCCD: response.data.representerCCCD,
          representerDiaChi: response.data.address,
          representerMobile: response.data.representerMobile ?? response.data.phone,
          representerEmail: response.data.representerEmail,
        });
      }
    } catch (error) {
      console.error("Không thể pre-fill thông tin doanh nghiệp từ SSO:", error);
    } finally {
      setIsCompanyLoading(false);
    }
  }, [form]);

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

  useEffect(() => {
    form.resetFields();
    loadCatalogOptions();
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
  }, [defaultType, form, loadCompanyInfo]);

  const savePlatform = async (values: any, targetStatus?: number) => {
    // Validate tài liệu bắt buộc
    const platformManageTypeId = values.platformManageTypeId || defaultType;
    const missing = validatePlatformDocs(platformManageTypeId || "", docsMap);
    if (missing.length && targetStatus !== 0) {
      message.error(`Vui lòng tải lên các tài liệu bắt buộc: ${missing.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      const isNuocNgoai = defaultType === "NTNuocNgoai" ||
        values.platformManageTypeId === "NTDangKyKDNuocNgoai" ||
        values.platformManageTypeId === "NTTichHopNuocNgoai";

      // Xử lý các trường chọn nhiều (Serializable multi-select)
      const ngonNguStr = Array.isArray(values.ngonNgu) ? values.ngonNgu.join("@@") : values.ngonNgu;
      const functionStr = Array.isArray(values.detail) ? values.detail.join("@@") : values.detail;
      const chucNangStr = Array.isArray(values.chucNangNenTang) ? values.chucNangNenTang.join("@") : values.chucNangNenTang;
      const productsStr = Array.isArray(values.loaiHangHoaKhac) ? values.loaiHangHoaKhac.join(",") : values.loaiHangHoaKhac;

      const payload: any = {
        ...values,
        id: platformId,
        status: targetStatus ?? values.status ?? 1,
        ngonNgu: ngonNguStr,
        detail: functionStr,
        chucNangNenTang: chucNangStr,
        loaiHangHoaKhac: productsStr,
        organizationFileDangKyUyQuyen: organizationFileDangKyUyQuyenFile?.duongDanFile,
        mauSo: defaultType === "NTThongBaoKD" ? "Mẫu 01" :
          values.platformManageTypeId === "NTDangKyKDNuocNgoai" ? "Mẫu 02" :
            values.platformManageTypeId === "NTTichHop" ? "Mẫu 03" :
              values.platformManageTypeId === "NTTichHopNuocNgoai" ? "Mẫu 04" : undefined,
        isNuocNgoai,
        websiteNumberNgay: values.websiteNumberNgay && (values.websiteNumberNgay as any).toDate ? (values.websiteNumberNgay as any).toDate() : (values.websiteNumberNgay || undefined),
        representerJobDaiDienNgay: values.representerJobDaiDienNgay && (values.representerJobDaiDienNgay as any).toDate ? (values.representerJobDaiDienNgay as any).toDate() : (values.representerJobDaiDienNgay || undefined),

        // Mới: Sử dụng trường logo theo yêu cầu
        logo: typeof values.logo === 'object' ? values.logo?.duongDanFile : values.logo,
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

      // Ensure UyQuyen fields are kept for NTTichHopNuocNgoai
      const response = await platformManageService.create(payload);
      if (response?.status) {
        // Collect all file IDs to associate with the final record ID (Pattern like RutTienKyQuy)
        const finalItemId = response.data?.id || platformId;
        const fileIds: string[] = [];

        // 1. Files from docsMap (PlatformDocumentList)
        Object.values(docsMap).forEach(f => { if (f?.id) fileIds.push(f.id); });

        // 2. Individual file fields from values
        const individualFiles = [
          values.logo,
          values.imagePath,
          values.seal,
          organizationFileDangKyUyQuyenFile,
        ];
        individualFiles.forEach(f => { if (f?.id) fileIds.push(f.id); });

        // 3. App logos from appInfoItems
        (values.appInfoItems ?? []).forEach((x: any) => {
          if (x.appLogo?.id) fileIds.push(x.appLogo.id);
        });

        if (fileIds.length > 0) {
          await taiLieuDinhKemService.updateFileItem({
            itemId: finalItemId,
            fileIds: fileIds,
          });
        }

        message.success(response.message ?? (targetStatus === 0 ? "Đã lưu nháp hồ sơ" : "Thêm mới hồ sơ nền tảng thành công"));
        onRefresh();
        onClose();
      } else {
        message.error(response?.message ?? "Thêm mới thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async (values: any) => {
    await savePlatform(values);
  };

  const getModalTitle = () => {
    switch (defaultType) {
      case "NTThongBaoKD":
        return "Đăng ký hồ sơ Nền tảng Đặt hàng trực tuyến";
      case "NTTichHop":
        return "Đăng ký hồ sơ Nền tảng trung gian TMĐT";
      case "NTNuocNgoai":
        return "Đăng ký hồ sơ Nền tảng nước ngoài";
      default:
        return "Thêm mới Hồ sơ Nền tảng TMĐT";
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

  return (
    <>
      <style>{`
        .ant-form-item {
          margin-bottom: 12px !important;
        }
      `}</style>
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
            {getModalTitle()}
          </div>
        }
        open={true}
        onCancel={onClose}
        footer={[
          <Button key="back" onClick={onClose} style={{ borderRadius: 6 }}>
            Hủy
          </Button>,
          <Button
            key="draft"
            loading={submitting || isCompanyLoading}
            onClick={async () => {
              const currentValues = form.getFieldsValue();
              await savePlatform(currentValues, 0); // 0 là trạng thái TamLuu
            }}
            style={{ borderRadius: 6, backgroundColor: "#2563eb", color: "#fff", borderColor: "#2563eb" }}
          >
            Lưu nháp
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting || isCompanyLoading}
            onClick={() => form.submit()}
            style={{ borderRadius: 6, fontWeight: 600, background: "#0284c7", borderColor: "#0284c7" }}
          >
            Xác nhận gửi hồ sơ
          </Button>,
        ]}
        width={1000}
        centered
        styles={{ body: { paddingTop: 20, maxHeight: "calc(100vh - 200px)", overflowY: "auto" } }}
        okButtonProps={{
          style: {
            borderRadius: 6,
            fontWeight: 600,
            height: 38,
            background: "#0284c7",
            borderColor: "#0284c7",
            border: "none",
          },
        }}
        cancelButtonProps={{
          style: {
            borderRadius: 6,
            height: 38,
          },
        }}
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
        >
          {/* SECTION 1: THÔNG TIN NỀN TẢNG */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 20,
            marginBottom: 20
          }}>
            <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
              1. Thông tin nền tảng & Ứng dụng TMĐT
            </div>

            <Row gutter={[16, 16]}>
              {isTichHop && (
                <Col span={24}>
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
                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Chức năng của nền tảng"
                    name="chucNangNenTang"
                    rules={[{ required: true, message: "Vui lòng chọn ít nhất một chức năng!" }]}
                  >
                    <Checkbox.Group
                      options={PlatformFunctionConstant.getOptions()}
                      style={{ display: "flex", flexDirection: "column", gap: 8 }}
                    />
                  </Form.Item>
                </Col>
              )}

              <Col span={24}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="Nền tảng hoạt động trên"
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
                          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, marginBottom: 16, border: "1px dashed #cbd5e1" }}>
                            <div style={{ fontWeight: 600, marginBottom: 12, color: "#475569" }}>Thông tin Website</div>
                            <Row gutter={[16, 16]}>
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
                                  label="Logo website (*)"
                                  name="logo"
                                  rules={[{ required: true, message: "Vui lòng tải logo website!" }]}
                                >
                                  <SingleFileUploader
                                    category={FileCategoryConstant.Platform}
                                    subCategory={form.getFieldValue("platformManageTypeId") || defaultType}
                                    taxCode={companyTaxCode}
                                    itemId={platformId}
                                    loaiTaiLieu="PlatformLogo"
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item<PlatformManageCreateRequestType>
                                  label="Đơn vị cung cấp Hosting"
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
                          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, marginBottom: 16, border: "1px dashed #cbd5e1" }}>
                            <div style={{ fontWeight: 600, marginBottom: 12, color: "#475569" }}>Thông tin Ứng dụng di động</div>
                            <Form.List name="appInfoItems">
                              {(fields, { add, remove }) => (
                                <>
                                  {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} style={{ background: "#fff", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                                      <Row gutter={16}>
                                        <Col span={12}>
                                          <Form.Item
                                            {...restField}
                                            label="Tên ứng dụng"
                                            name={[name, "appName"]}
                                            rules={[{ required: true, message: "Vui lòng nhập tên ứng dụng!" }]}
                                          >
                                            <Input placeholder="Nhập tên ứng dụng..." style={{ borderRadius: 6 }} />
                                          </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                          <Form.Item
                                            {...restField}
                                            label="Hệ điều hành"
                                            name={[name, "osCode"]}
                                            rules={[{ required: true, message: "Vui lòng chọn hệ điều hành!" }]}
                                          >
                                            <Select placeholder="Chọn OS" options={osOptions} style={{ borderRadius: 6 }} />
                                          </Form.Item>
                                        </Col>
                                        <Col span={24}>
                                          <Form.Item
                                            {...restField}
                                            label="Địa chỉ lưu trữ hoặc tải ứng dụng"
                                            name={[name, "appLink"]}
                                            rules={[{ required: true, message: "Vui lòng nhập link tải!" }]}
                                          >
                                            <Input placeholder="Link Google Play / App Store..." style={{ borderRadius: 6 }} />
                                          </Form.Item>
                                        </Col>
                                        <Col span={18}>
                                          <Form.Item
                                            {...restField}
                                            label="Logo ứng dụng"
                                            name={[name, "appLogo"]}
                                            rules={[{ required: true, message: "Vui lòng tải logo ứng dụng!" }]}
                                          >
                                            <SingleFileUploader
                                              category={FileCategoryConstant.Platform}
                                              subCategory={form.getFieldValue("platformManageTypeId") || defaultType}
                                              taxCode={companyTaxCode}
                                              itemId={platformId}
                                              loaiTaiLieu={`AppLogo_${name}`}
                                            />
                                          </Form.Item>
                                        </Col>
                                        <Col span={6} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                          <Button type="link" danger onClick={() => remove(name)}>Xóa ứng dụng</Button>
                                        </Col>
                                      </Row>
                                    </div>
                                  ))}
                                  <Button type="dashed" onClick={() => add()} block style={{ borderRadius: 6 }}>
                                    + Thêm thông tin ứng dụng di động
                                  </Button>
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

              <Col span={12}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="Nhân sự vận hành"
                  name="staffNumber"
                >
                  <InputNumber
                    placeholder="Số người"
                    min={1}
                    style={{ width: "100%", borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              {defaultType === "NTNuocNgoai" ? (
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Mẫu đăng ký"
                    name="platformManageTypeId"
                    rules={[{ required: true, message: "Vui lòng chọn loại nền tảng" }]}
                  >
                    <Select
                      placeholder="Chọn loại đăng ký"
                      options={getPlatformOptions()}
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>
              ) : (
                <Form.Item<PlatformManageCreateRequestType> name="platformManageTypeId" hidden>
                  <Input />
                </Form.Item>
              )}

              <Col span={defaultType === "NTNuocNgoai" ? 12 : 24}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="Trạng thái khởi tạo hồ sơ"
                  name="status"
                  rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                >
                  <Select
                    placeholder="Chọn trạng thái"
                    options={statusOptions}
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* SECTION 2: THÔNG TIN NGƯỜI ĐẠI DIỆN PHÁP LUẬT SSO */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 20,
            marginBottom: 20
          }}>
            <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
              2. Thông tin người đại diện pháp luật (Đồng bộ SSO)
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#64748b", fontStyle: "italic", marginLeft: 8 }}>
                (Hệ thống tự động đồng bộ và khóa bảo mật)
              </span>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="Họ và tên người đại diện"
                  name="representerName"
                >
                  <Input style={{ borderRadius: 6 }} disabled />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="Chức danh người đại diện pháp luật"
                  name="representerJob"
                  rules={[{ required: true, message: "Vui lòng nhập chức danh!" }]}
                >
                  <Input placeholder="Nhập chức danh..." style={{ borderRadius: 6 }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="Số CCCD / Hộ chiếu đại diện"
                  name="representerCCCD"
                >
                  <Input style={{ borderRadius: 6 }} disabled />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="Địa chỉ người đại diện"
                  name="representerDiaChi"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                >
                  <Input style={{ borderRadius: 6 }} disabled />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="SĐT người đại diện"
                  name="representerMobile"
                >
                  <Input style={{ borderRadius: 6 }} disabled />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item<PlatformManageCreateRequestType>
                  label="Email người đại diện"
                  name="representerEmail"
                >
                  <Input style={{ borderRadius: 6 }} disabled />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* SECTION 2.1: THÔNG TIN ĐẠI DIỆN ĐƯỢC CHỈ ĐỊNH THEO ỦY QUYỀN TẠI VIỆT NAM (Cho NTTichHopNuocNgoai) */}
          {platformManageTypeId === "NTTichHopNuocNgoai" && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                2.1. Thông tin đại diện được chỉ định theo ủy quyền tại Việt Nam
              </div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Họ và tên"
                    name="representerNameUyQuyen"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên đại diện ủy quyền!" }]}
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
                    label="Số CCCD / Hộ chiếu"
                    name="representerCCCDUyQuyen"
                    rules={[{ required: true, message: "Vui lòng nhập số CCCD/Hộ chiếu!" }]}
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
                    <Input placeholder="Nhập địa chỉ tại Việt Nam..." style={{ borderRadius: 6 }} />
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

          {/* SECTION 2.5: NGƯỜI CHỊU TRÁCH NHIỆM QUẢN LÝ HOẠT ĐỘNG TMĐT */}
          {["NTThongBaoKD", "NTTichHop", "NTTichHopNuocNgoai"].includes((platformManageTypeId || defaultType) as string) && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>2.5. Người chịu trách nhiệm quản lý hoạt động TMĐT</span>
                <Button
                  type="link"
                  
                  onClick={() => {
                    const vals = form.getFieldsValue();
                    form.setFieldsValue({
                      representerNameOnline: vals.representerName || "",
                      representerJobOnline: vals.representerJob || "",
                      representerCCCDOnline: vals.representerCCCD || "",
                      representerMobileOnline: vals.representerMobile || "",
                      representerEmailOnline: vals.representerEmail || "",
                      representerDiaChiOnline: vals.representerDiaChi || "",
                    });
                  }}
                >
                  Lấy thông tin từ người đại diện
                </Button>
              </div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Họ và tên"
                    name="representerNameOnline"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên người quản lý!" }]}
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
                    <Input placeholder="Ví dụ: Trưởng đại diện, Giám đốc vận hành..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Số CCCD / Hộ chiếu"
                    name="representerCCCDOnline"
                    rules={[{ required: true, message: "Vui lòng nhập số CCCD/Hộ chiếu!" }]}
                  >
                    <Input placeholder="Nhập số định danh..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Số điện thoại di động"
                    name="representerMobileOnline"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                  >
                    <Input placeholder="Nhập số điện thoại..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Email liên hệ"
                    name="representerEmailOnline"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không đúng định dạng!" }
                    ]}
                  >
                    <Input placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Địa chỉ liên lạc"
                    name="representerDiaChiOnline"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                  >
                    <Input placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* SECTION 2.6: THÔNG TIN PHÁP NHÂN ỦY QUYỀN TẠI VIỆT NAM (Cho Nước Ngoài) */}
          {isNuocNgoaiUyQuyen && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                2.6. Thông tin pháp nhân ủy quyền tại Việt Nam
              </div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Tên tổ chức"
                    name="organizationNameUyQuyen"
                    rules={[{ required: true, message: "Vui lòng nhập tên tổ chức ủy quyền!" }]}
                  >
                    <Input placeholder="Nhập tên tổ chức..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Mã doanh nghiệp"
                    name="organizationCodeUyQuyen"
                    rules={[{ required: true, message: "Vui lòng nhập mã doanh nghiệp!" }]}
                  >
                    <Input placeholder="Nhập mã doanh nghiệp..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Email tiếp nhận thông tin"
                    name="organizationEmailUyQuyen"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không đúng định dạng!" }
                    ]}
                  >
                    <Input placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Địa chỉ trụ sở chính"
                    name="organizationDiaChiUyQuyen"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ trụ sở!" }]}
                  >
                    <Input placeholder="Nhập địa chỉ trụ sở..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Ảnh đăng ký doanh nghiệp"
                    name="organizationFileDangKyUyQuyen"
                  >
                    <SingleFileUploader
                      value={organizationFileDangKyUyQuyenFile}
                      onChange={setOrganizationFileDangKyUyQuyenFile}
                      category={FileCategoryConstant.Platform}
                      subCategory={platformManageTypeId || defaultType}
                      taxCode={companyTaxCode}
                      itemId={platformId}
                      loaiTaiLieu="OrganizationFileDangKyUyQuyen"
                      uploadLabel="Tải ảnh đăng ký doanh nghiệp"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* SECTION 2.7: ĐẦU MỐI LIÊN HỆ ỦY QUYỀN (Cho Nước Ngoài) */}
          {isNuocNgoaiUyQuyen && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                2.7. Đầu mối liên hệ ủy quyền
              </div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Họ và tên"
                    name="representerNameDauMoiUyQuyen"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
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
                    rules={[{ required: true, message: "Vui lòng nhập số CCCD/Hộ chiếu!" }]}
                  >
                    <Input placeholder="Nhập số định danh..." style={{ borderRadius: 6 }} />
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
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Địa chỉ"
                    name="representerDiaChiDauMoiUyQuyen"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                  >
                    <Input placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* SECTION: THÔNG TIN HOẠT ĐỘNG & CHÍNH SÁCH BẮT BUỘC (Mẫu 01 & 02) */}
          {isShowPolicy && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                Hoạt động nghiệp vụ & các chính sách bắt buộc
              </div>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Ngôn ngữ sử dụng trên nền tảng"
                    name="ngonNgu"
                    rules={[{ required: true, message: "Vui lòng chọn ít nhất một ngôn ngữ!" }]}
                  >
                    <Checkbox.Group options={languageOptions} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Chính sách bảo mật"
                    name="chinhSachBaoMat"
                    rules={[{ required: true, message: "Vui lòng nhập chính sách bảo mật!" }]}
                  >
                    <TextArea placeholder="Nội dung hoặc liên kết đến chính sách bảo mật..." rows={3} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Phương thức tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại"
                    name="phuongThucGiaiQuyetPhanAnh"
                    rules={[{ required: true, message: "Vui lòng nhập phương thức giải quyết phản ánh!" }]}
                  >
                    <TextArea placeholder="Mô tả quy trình và đầu mối tiếp nhận..." rows={3} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Chính sách giá"
                    name="chinhSachGia"
                    rules={[{ required: true, message: "Vui lòng nhập chính sách giá!" }]}
                  >
                    <TextArea placeholder="Quy định về giá, thuế, phí..." rows={3} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Chính sách về thanh toán"
                    name="chinhSachThanhToan"
                    rules={[{ required: true, message: "Vui lòng nhập chính sách thanh toán!" }]}
                  >
                    <TextArea placeholder="Các phương thức thanh toán được chấp nhận..." rows={3} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Các điều kiện hoặc hạn chế trong việc cung cấp hàng hóa hoặc dịch vụ trên nền tảng (nếu có)"
                    name="dieuKienOrHanCheCungCapHHDV"
                  >
                    <TextArea placeholder="Giới hạn về địa lý, độ tuổi, mặt hàng..." rows={3} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Chính sách giao hàng, đổi trả và hoàn tiền (áp dụng cho hàng hóa) hoặc phương thức cung cấp dịch vụ, chính sách chấm dứt dịch vụ và hoàn tiền (áp dụng cho dịch vụ)"
                    name="chinhSachApDungHHDV"
                    rules={[{ required: true, message: "Vui lòng nhập chính sách áp dụng!" }]}
                  >
                    <TextArea placeholder="Quy trình giao nhận, đổi trả, hoàn tiền..." rows={3} style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* SECTION: HÌNH THỨC HỖ TRỢ TRỰC TUYẾN (Mẫu 01, 02, 04) */}
          {isShowSupport && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                Hình thức hỗ trợ trực tuyến
              </div>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Hình thức hỗ trợ trực tuyến"
                    name="hinhThucHoTroTrucTuyen"
                    rules={[{ required: true, message: "Vui lòng nhập hình thức hỗ trợ!" }]}
                  >
                    <Input placeholder="Ví dụ: Chat trực tuyến, Email hỗ trợ, Hotline..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* SECTION 3: NHÂN SỰ VẬN HÀNH HỆ THỐNG PHẢN ÁNH (Cho Nền tảng tích hợp/Lớn) */}
          {isTichHop && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 20,
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                3. Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại trực tuyến (áp dụng đối với nền tảng số lớn)
              </div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Họ và tên"
                    name="representerNameVanHanh"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                  >
                    <Input placeholder="Nhập họ và tên..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Chức danh"
                    name="representerJobVanHanh"
                    rules={[{ required: true, message: "Vui lòng nhập chức danh!" }]}
                  >
                    <Input placeholder="Ví dụ: Trưởng bộ phận vận hành..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Số CCCD/ Số hộ chiếu"
                    name="representerCCCDVanHanh"
                    rules={[{ required: true, message: "Vui lòng nhập số CCCD/Hộ chiếu!" }]}
                  >
                    <Input placeholder="Nhập số định danh..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Số điện thoại"
                    name="representerMobileVanHanh"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                  >
                    <Input placeholder="Nhập số điện thoại..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Email"
                    name="representerEmailVanHanh"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không đúng định dạng!" }
                    ]}
                  >
                    <Input placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Địa chỉ"
                    name="representerDiaChiVanHanh"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                  >
                    <Input placeholder="Nhập địa chỉ..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* SECTION 3: THÔNG TIN LIÊN HỆ & NGHIỆP VỤ (Cho trong nước) */}
          {!isNuocNgoai && (
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 20
            }}>
              <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                {isTichHop ? "4" : "3"}. Thông tin liên hệ & Nghiệp vụ TMĐT bổ sung
              </div>

              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Số GCN/QĐ"
                        name="websiteNumberSo"
                        rules={[{ required: true, message: "Vui lòng nhập số GCN/QĐ!" }]}
                      >
                        <Input placeholder="Ví dụ: GP số 12/GP-BTTTT" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Ngày cấp"
                        name="websiteNumberNgay"
                        rules={[{ required: true, message: "Vui lòng chọn ngày cấp!" }]}
                      >
                        <DatePicker style={{ width: "100%", borderRadius: 6 }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item<PlatformManageCreateRequestType>
                        label="Nơi cấp GCN/QĐ"
                        name="websiteNumberNoiCap"
                        rules={[{ required: true, message: "Vui lòng nhập nơi cấp!" }]}
                      >
                        <Input placeholder="Ví dụ: Bộ Thông tin và Truyền thông" style={{ borderRadius: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>

                <Col span={6}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="SĐT Liên hệ (Chịu trách nhiệm)"
                    name="representerMobile"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại liên hệ!" }]}
                  >
                    <Input placeholder="Nhập số điện thoại..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Email tiếp nhận thông tin"
                    name="representerEmail"
                    rules={[
                      { required: true, message: "Vui lòng nhập email tiếp nhận!" },
                      { type: "email", message: "Email không đúng định dạng!" }
                    ]}
                  >
                    <Input placeholder="Nhập email..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Loại hàng hóa / dịch vụ kinh doanh chính"
                    name="loaiHangHoaKhac"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn loại hàng hóa / dịch vụ"
                      options={productOptions}
                      style={{ borderRadius: 6 }}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Phương thức giao dịch / liên hệ hỗ trợ"
                    name="phuongThucLienHe"
                  >
                    <Input placeholder="Ví dụ: Trực tuyến, Hotline, Chat trực tiếp..." style={{ borderRadius: 6 }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<PlatformManageCreateRequestType>
                    label="Chức năng của nền tảng"
                    name="detail"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn các chức năng của nền tảng"
                      options={functionOptions}
                      style={{ borderRadius: 6 }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* CÁC MỤC ĐẶC THÙ CHO NỀN TẢNG NƯỚC NGOÀI */}
          {isNuocNgoai && (
            <>
              {/* ... SECTION 3 & 4 ... (giữ nguyên các trường text) */}

              {/* Cập nhật Section 5 Nước ngoài */}
              <div style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 20
              }}>
                <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 16, fontSize: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                  {isTichHop ? "6" : "5"}. Thông tin hoạt động nghiệp vụ & các chính sách bắt buộc
                </div>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Web: Chủ sở hữu tên miền"
                      name="domainAdd"
                      rules={[{ required: true, message: "Vui lòng nhập chủ sở hữu đăng ký tên miền!" }]}
                    >
                      <Input placeholder="Ví dụ: Công ty TNHH Shopee (Singapore)" style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Ngôn ngữ"
                      name="ngonNgu"
                      rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ sử dụng!" }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn ngôn ngữ"
                        options={languageOptions}
                        style={{ borderRadius: 6 }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="App: Hệ điều hành"
                      name="appOS"
                    >
                      <Select
                        placeholder="Chọn hệ điều hành"
                        options={osOptions}
                        style={{ borderRadius: 6 }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Lĩnh vực cung cấp dịch vụ"
                      name="loaiHangHoaKhac"
                      rules={[{ required: true, message: "Vui lòng chọn lĩnh vực cung cấp dịch vụ!" }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn lĩnh vực dịch vụ"
                        options={productOptions}
                        style={{ borderRadius: 6 }}
                        showSearch
                        optionFilterProp="label"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Web: Logo"
                      name="imagePath"
                    >
                      <SingleFileUploader
                        category={FileCategoryConstant.Platform}
                        subCategory={form.getFieldValue("platformManageTypeId") || defaultType}
                        taxCode={companyTaxCode}
                        itemId={platformId}
                        loaiTaiLieu="PlatformImagePath"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="App: Biểu tượng"
                      name="seal"
                    >
                      <SingleFileUploader
                        category={FileCategoryConstant.Platform}
                        subCategory={form.getFieldValue("platformManageTypeId") || defaultType}
                        taxCode={companyTaxCode}
                        itemId={platformId}
                        loaiTaiLieu="PlatformSeal"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Hình thức hỗ trợ trực tuyến"
                      name="phuongThucLienHe"
                      rules={[{ required: true, message: "Vui lòng nhập hình thức hỗ trợ!" }]}
                    >
                      <Input placeholder="Ví dụ: Chat trực tuyến, Email hỗ trợ, Hotline..." style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Chức năng của nền tảng"
                      name="detail"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn các chức năng"
                        options={functionOptions}
                        style={{ borderRadius: 6 }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Chính sách bảo mật"
                      name="chinhSachBaoMat"
                      rules={[{ required: true, message: "Vui lòng nhập mô tả chính sách bảo mật!" }]}
                    >
                      <TextArea placeholder="Mô tả tóm tắt hoặc chèn liên kết điều khoản bảo mật..." rows={3} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Phương thức tiếp nhận khiếu nại"
                      name="tiepNhanKhieuNai"
                      rules={[{ required: true, message: "Vui lòng nhập quy trình khiếu nại!" }]}
                    >
                      <TextArea placeholder="Quy trình và đầu mối tiếp nhận, xử lý khiếu nại..." rows={3} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Chính sách giá"
                      name="chinhSachGia"
                      rules={[{ required: true, message: "Vui lòng nhập chính sách giá!" }]}
                    >
                      <TextArea placeholder="Quy định về giá bán công khai, thuế VAT, các loại phí dịch vụ..." rows={3} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Chính sách thanh toán"
                      name="chinhSachThanhToan"
                      rules={[{ required: true, message: "Vui lòng nhập quy định thanh toán!" }]}
                    >
                      <TextArea placeholder="Các hình thức thanh toán COD, chuyển khoản, thẻ quốc tế, ví điện tử..." rows={3} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="Điều kiện/hạn chế cung cấp"
                      name="dieuKienCungCap"
                      rules={[{ required: true, message: "Vui lòng nhập điều kiện/hạn chế!" }]}
                    >
                      <TextArea placeholder="Giới hạn địa lý cung cấp, độ tuổi thành viên, các mặt hàng cấm giao dịch..." rows={3} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item<PlatformManageCreateRequestType>
                      label="CS giao hàng/đổi trả/hoàn tiền"
                      name="chinhSachGiaoHang"
                      rules={[{ required: true, message: "Vui lòng nhập chính sách giao hàng và đổi trả!" }]}
                    >
                      <TextArea placeholder="Quy trình hoàn tiền, phí đổi trả hàng, mốc thời gian giải quyết..." rows={3} style={{ borderRadius: 6 }} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </>
          )}

          {getPlatformDocs(platformManageTypeId || defaultType || "").length > 0 && (
            <>
              <Divider plain style={{ marginTop: 24, marginBottom: 24 }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#2563eb" }}>
                  📂 Phần 3. Tài liệu đính kèm
                </span>
              </Divider>

              <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, border: "1px solid #e2e8f0" }}>
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
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default CreatePlatformModal;
