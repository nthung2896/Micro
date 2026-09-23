"use client";

import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  message,
  DatePicker,
  Divider,
  Button,
  Card,
  Spin,
  Affix,
  Tag
} from "antd";
import React, { useEffect, useState } from "react";
import { ArrowLeftOutlined, SaveOutlined, UndoOutlined, SendOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import rutTienKyQuyService from "@/services/rutTienKyQuy/rutTienKyQuy.service";
import { KyQuyConstant } from "@/services/rutTienKyQuy/KyQuyConstant";
import { RutTienKyQuyType } from "@/types/rutTienKyQuy/dto";
import { RutTienKyQuySaveRequestType } from "@/types/rutTienKyQuy/request";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import { useSelector } from "@/store/hooks";
import Flex from "@/components/shared-components/Flex";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import companyInfoService from "@/services/companyInfo/companyInfo.service";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { DM_DuLieuDanhMucType } from "@/types/dM_DuLieuDanhMuc/dto";

const generateGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const CreateOrUpdatePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form] = Form.useForm<RutTienKyQuySaveRequestType>();
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [recordId, setRecordId] = useState<string>("");
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [initialData, setInitialData] = useState<RutTienKyQuyType | null>(null);
  const [isSubmitAndSend, setIsSubmitAndSend] = useState<boolean>(false);

  // Retrieve user context from Redux auth store
  const currentUser = useSelector((state: any) => state.auth.User);
  const userRoles = currentUser?.listRole || [];
  const isDoanhNghiep = userRoles.includes("DoanhNghiep");

  const mstValue = Form.useWatch("maSoThue", form) || "";



  useEffect(() => {
    const initForm = async () => {
      setPageLoading(true);
      const currentId = id || generateGuid();
      setRecordId(currentId);
      setCompanyInfo(null);

      // Fetch dynamic document configs
      let loadedConfigs: DM_DuLieuDanhMucType[] = [];
      try {
        const configRes = await duLieuDanhMucService.getListDataByGroupCode("CAUHINHTAILIEURUTTIENKYQUY");
        if (configRes?.status && Array.isArray(configRes.data)) {
          loadedConfigs = [...configRes.data].sort((a, b) => (a.priority || 0) - (b.priority || 0));
          setConfigFiles(loadedConfigs);
        }
      } catch (err) {
        console.error("Lỗi khi tải cấu hình tài liệu ký quỹ:", err);
      }

      let matchedCompany: any = null;
      if (isDoanhNghiep && currentUser) {
        try {
          const currentRes = await companyInfoService.getByCurrentUser().catch(() => null);
          if (currentRes?.data) {
            matchedCompany = currentRes.data;
          } else {
            const resByTaxCode = await companyInfoService.getData({
              taxCode: currentUser.userName,
              pageIndex: 1,
              pageSize: 1
            });
            if (resByTaxCode?.data?.items?.length > 0) {
              matchedCompany = resByTaxCode.data.items[0];
            } else {
              const resByKeyword = await companyInfoService.getData({
                keyword: currentUser.userName,
                pageIndex: 1,
                pageSize: 1
              });
              if (resByKeyword?.data?.items?.length > 0) {
                matchedCompany = resByKeyword.data.items[0];
              }
            }
          }
          if (matchedCompany) {
            setCompanyInfo(matchedCompany);
          }
        } catch (err) {
          console.error("Lỗi khi tải thông tin doanh nghiệp:", err);
        }
      }

      if (id) {
        try {
          const res = await rutTienKyQuyService.get(id);
          if (res?.status && res.data) {
            const fetchedData = res.data;
            setInitialData(fetchedData);
            form.setFieldsValue({
              ...fetchedData,
              ngay: fetchedData.ngay ? dayjs(fetchedData.ngay) : undefined,
              quySo: fetchedData.quySo,
            } as any);

            if (matchedCompany && !fetchedData.dkkdFileLink) {
              fetchedData.dkkdFileLink = matchedCompany.dKKD;
            }

            const filesMap: Record<string, TaiLieuDinhKemType | null> = {};
            if (fetchedData?.files) {
              fetchedData.files.forEach((f: any) => {
                if (f.loaiTaiLieu) {
                  filesMap[f.loaiTaiLieu] = f;
                }
              });
            }
            // setUploadedFiles(filesMap);
          }
        } catch (e) {
          console.error("Lỗi khi tải thông tin hồ sơ:", e);
          message.error("Không thể tải thông tin hồ sơ!");
        }
      } else {
        form.resetFields();
        setUploadedFiles({});

        if (isDoanhNghiep && currentUser) {
          form.setFieldsValue({
            maSoThue: matchedCompany?.taxCode || currentUser.userName || "",
            tenChuQuanToChuc: matchedCompany?.name || currentUser.name || "",
            diaChiTruSoChinh: matchedCompany?.address || currentUser.diaChi || "",
            emailTiepNhan: matchedCompany?.email || currentUser.email || "",
          } as any);
        }
      }
      setPageLoading(false);
    };

    initForm();
  }, [id, currentUser, isDoanhNghiep]);

  const onFinish = async (values: any) => {
    if (isSubmitAndSend) {
      const missingRequired = configFiles.filter(config => {
        const isRequired = config.note?.trim() === "true";
        if (!isRequired) return false;
        const uploadedFile = uploadedFiles[config.code];
        return !uploadedFile;
      });

      if (missingRequired.length > 0) {
        const missingNames = missingRequired.map(c => `'${c.name}'`).join(", ");
        message.error(`Vui lòng đính kèm tài liệu bắt buộc: ${missingNames} trước khi gửi duyệt!`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload: RutTienKyQuySaveRequestType = {
        ...values,
        id: recordId,
        quySo: values.quySo || undefined,
        ngay: values.ngay ? values.ngay.toDate() : undefined,
      };

      let response;
      if (id) {
        response = await rutTienKyQuyService.update(payload);
      } else {
        response = await rutTienKyQuyService.create(payload);
      }

      if (response.status) {
        const finalItemId = (response.data as any)?.id || recordId;
        const fileIds = Object.values(uploadedFiles)
          .filter(Boolean)
          .map((f) => f!.id);
        if (fileIds.length > 0) {
          await taiLieuDinhKemService.updateFileItem({
            itemId: finalItemId,
            fileIds: fileIds,
          });
        }

        if (isSubmitAndSend) {
          const transitionRes = await rutTienKyQuyService.transition([finalItemId], KyQuyConstant.ChoDuyet, "");
          if (transitionRes.status) {
            message.success("Đã lưu và gửi duyệt hồ sơ thành công!");
          } else {
            message.warning(`Đã lưu hồ sơ thành công, nhưng lỗi khi gửi duyệt: ${transitionRes.message}`);
          }
        } else {
          message.success(
            id ? "Cập nhật thành công" : "Tạo mới thành công",
          );
        }
        router.push("/RutTienKyQuy");
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra trong quá trình lưu");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    const firstErrorField = errorInfo.errorFields[0];
    if (firstErrorField) {
      form.scrollToField(firstErrorField.name, {
        behavior: "smooth",
        block: "center",
        scrollMode: "if-needed",
      });
    }
  };
  const [configFiles, setConfigFiles] = useState<DM_DuLieuDanhMucType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, TaiLieuDinhKemType | null>>({});

  const fillFakeData = () => {
    form.setFieldsValue({
      soNgayNoiCapGCN: "0123456789 ngày 01/01/2020 Sở KHĐT Hà Nội",
      emailTiepNhan: "contact@nentangsovn.com",
      sdtToChuc: "0987654321",
      appTenUngDung: "Nền Tảng Số Việt Nam",
      ddplHoVaTen: "Nguyễn Văn A",
      ddplChucDanh: "Giám đốc",
      ddplSoCccdHoChieu: "001099012345",
      ddplDiaChi: "Số 1 Đường Láng, Đống Đa, Hà Nội",
      ddplSdt: "0912345678",
      dmlhHoVaTen: "Trần Thị B",
      dmlhSdt: "0923456789",
      nganHang: "Vietcombank - Chi nhánh Hà Nội",
      quySo: "1234567890",
      lyDo: "Doanh nghiệp đề nghị rút tiền ký quỹ do đã hoàn thành nghĩa vụ theo quy định",
      khoan: "3",
      dieu: "15",
      nghiDinh: "13/2022/NĐ-CP",
      soVanBan: "001/2024/RTKQ",
      diaChiNgayThangNam: "Hà Nội, ngày 21 tháng 05 năm 2025",
    } as any);
    message.success("Đã điền dữ liệu test thành công!");
  };

  const allDocs = [
    ...configFiles.map(config => ({
      code: config.code,
      name: config.name,
      isRequired: config.note?.trim() === "true",
      isDkkd: false,
    })),
    ...(isDoanhNghiep ? [{
      code: "DKKD_FILE",
      name: "Giấy đăng ký doanh nghiệp (ĐKKD)",
      isRequired: false,
      isDkkd: true,
    }] : [])
  ];

  const half = Math.ceil(allDocs.length / 2);
  const leftDocs = allDocs.slice(0, half);
  const rightDocs = allDocs.slice(half);

  const renderTable = (tableDocs: typeof allDocs, startIndex: number) => (
    <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <th style={{ padding: "10px 12px", fontWeight: 600, color: "#475569", width: "60px", textAlign: "center" }}>STT</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, color: "#475569" }}>Tên tài liệu</th>
            <th style={{ padding: "10px 12px", fontWeight: 600, color: "#475569", width: "180px", textAlign: "center" }}>Tệp đính kèm</th>
          </tr>
        </thead>
        <tbody>
          {tableDocs.map((doc, idx) => {
            if (doc.isDkkd) {
              return (
                <tr key={doc.code} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 12px", textAlign: "center", color: "#64748b", fontWeight: 500 }}>{startIndex + idx + 1}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>{doc.name}</span>
                      <div>
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: "11px", lineHeight: "16px" }}>Không bắt buộc</Tag>
                      </div>
                      {(initialData?.dkkdFileLink || companyInfo?.dKKD) && (
                        <div style={{ fontSize: "11px", color: "#2563eb", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <span>📎</span>
                          <a
                            href={initialData?.dkkdFileLink || companyInfo?.dKKD}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: "underline", color: "#2563eb" }}
                          >
                            Tải xuống/Xem file ĐKKD mặc định
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <Input
                      disabled
                      size="small"
                      placeholder={
                        (initialData?.dkkdFileLink || companyInfo?.dKKD)
                          ? "File đã được liên kết từ hồ sơ doanh nghiệp"
                          : "Không tìm thấy file ĐKKD của doanh nghiệp"
                      }
                    />
                  </td>
                </tr>
              );
            }

            return (
              <tr key={doc.code} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px", textAlign: "center", color: "#64748b", fontWeight: 500 }}>{startIndex + idx + 1}</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>{doc.name}</span>
                    <div>
                      {doc.isRequired ? (
                        <Tag color="red" style={{ borderRadius: 4, margin: 0, fontSize: "11px", lineHeight: "16px" }}>Bắt buộc</Tag>
                      ) : (
                        <Tag style={{ borderRadius: 4, margin: 0, fontSize: "11px", lineHeight: "16px" }}>Không bắt buộc</Tag>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <SingleFileUploader
                    value={uploadedFiles[doc.code] || null}
                    onChange={(val) => {
                      setUploadedFiles(prev => ({
                        ...prev,
                        [doc.code]: val
                      }));
                    }}
                    category={FileCategoryConstant.RutTienKyQuy}
                    itemId={recordId}
                    loaiTaiLieu={doc.code}
                    taxCode={mstValue || currentUser?.userName || ""}
                    requiredKySo={true}
                    accept=".pdf"
                    typeBtn="default"
                    uploadLabel="Upload"
                    size="small"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (pageLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải dữ liệu hồ sơ..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 8px" }}>
      <style>{`
        .ant-form-item {
          margin-bottom: 8px !important;
        }
        .ant-form-item-label {
          padding-bottom: 2px !important;
        }
        .ant-form-item-label > label {
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #475569 !important;
        }
      `}</style>
      <AutoBreadcrumb
        items={[
          { title: "Quản lý rút tiền ký quỹ", href: "/RutTienKyQuy" },
          { title: id ? "Cập nhật hồ sơ" : "Đăng ký Rút tiền ký quỹ" }
        ]}
      />

      <Card
        title={
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
            📂 {id ? "Cập nhật hồ sơ Rút tiền ký quỹ" : "Đăng ký Rút tiền ký quỹ"}
          </span>
        }
        extra={
          <Affix offsetTop={100}>

            <Flex justifyContent="end" style={{ gap: 12 }}>
              <Button
                size="large"
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/RutTienKyQuy")}
              >
                Quay lại danh sách
              </Button>
              <Button
                size="large"
                icon={<UndoOutlined />}
                onClick={() => router.push("/RutTienKyQuy")}
                disabled={loading}
              >
                Hủy bỏ
              </Button>
              <Button
                size="large"
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => {
                  setIsSubmitAndSend(false);
                  setTimeout(() => form.submit(), 0);
                }}
                loading={loading && !isSubmitAndSend}
              >
                Lưu hồ sơ
              </Button>
              <Button
                size="large"
                type="primary"
                icon={<SendOutlined />}
                onClick={() => {
                  setIsSubmitAndSend(true);
                  setTimeout(() => form.submit(), 0);
                }}
                loading={loading && isSubmitAndSend}
                style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
              >
                Lưu & Gửi duyệt
              </Button>
            </Flex>
          </Affix>
        }
        style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
        bodyStyle={{ padding: "24px 32px" }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
          {/* NÚT FILL DỮ LIỆU TEST */}
          {process.env.NODE_ENV === "development" && (
            <div style={{ textAlign: "right", marginBottom: 12 }}>
              <Button
                
                type="dashed"
                danger
                onClick={fillFakeData}
                style={{ fontSize: 12 }}
              >
                🧪 Điền dữ liệu test
              </Button>
            </div>
          )}
          {/* THÔNG TIN ĐƠN ĐỀ NGHỊ */}
          <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
            <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
              📄 Phần 1. Thông tin đơn đề nghị
            </span>
          </Divider>
          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="soVanBan" label="Số đơn đề nghị">
                  <Input placeholder="Nhập số đơn đề nghị" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="diaChiNgayThangNam" label="Địa điểm, ngày tháng năm đơn đề nghị ">
                  <Input placeholder="Ví dụ: Hà Nội, ngày ..." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* THÔNG TIN TỔ CHỨC */}
          <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
            <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
              🏢 Phần 2. Thông tin tổ chức
            </span>
          </Divider>
          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  name="tenChuQuanToChuc"
                  label="Tên chủ quan tổ chức"
                  required
                  rules={isSubmitAndSend ? [{ required: true, message: "Vui lòng nhập tên chủ quan tổ chức" }] : []}
                >
                  <Input placeholder="Nhập tên chủ quan tổ chức" disabled={isDoanhNghiep} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="maSoThue" label="Mã số thuế" required rules={isSubmitAndSend ? [
                  { required: true, message: "Vui lòng nhập mã số thuế" },
                  { pattern: /^[0-9\-]{10,14}$/, message: "Mã số thuế không hợp lệ (10-14 số)" }
                ] : []}>
                  <Input placeholder="Nhập mã số thuế" disabled={isDoanhNghiep} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="soNgayNoiCapGCN" label="Số, ngày, nơi cấp GCN">
                  <Input placeholder="Nhập thông tin GCN" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="diaChiTruSoChinh" label="Địa chỉ trụ sở chính">
                  <Input placeholder="Nhập địa chỉ" disabled={isDoanhNghiep} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="emailTiepNhan" label="Email tiếp nhận" rules={isSubmitAndSend ? [
                  { type: "email", message: "Email không đúng định dạng" }
                ] : []}>
                  <Input placeholder="Nhập email" disabled={isDoanhNghiep} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="sdtToChuc" label="SĐT Tổ chức" required rules={isSubmitAndSend ? [
                  { required: true, message: "Vui lòng nhập số điện thoại tổ chức" },
                  { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }
                ] : []}>
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>


              <Col span={12}>
                <Form.Item
                  name="appTenUngDung"
                  label="Tên nền tảng"
                  required
                  rules={isSubmitAndSend ? [{ required: true, message: "Vui lòng nhập tên nền tảng" }] : []}
                >
                  <Input placeholder="Nhập tên nền tảng" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* THÔNG TIN NGƯỜI ĐẠI DIỆN PHÁP LUẬT */}
          <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
            <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
              ⚖️ Phần 3. Người đại diện theo pháp luật
            </span>
          </Divider>
          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name="ddplHoVaTen" label="Họ và tên" required rules={isSubmitAndSend ? [{ required: true, message: "Vui lòng nhập họ tên người đại diện theo pháp luật" }] : []}>
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="ddplSoCccdHoChieu" label="Số CCCD/Hộ chiếu" required rules={isSubmitAndSend ? [
                  { required: true, message: "Vui lòng nhập số CCCD/Hộ chiếu" },
                  { pattern: /^[0-9A-Z]{9,12}$/i, message: "Số CCCD/Hộ chiếu không hợp lệ" }
                ] : []}>
                  <Input placeholder="Nhập số CCCD/Hộ chiếu" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="ddplChucDanh" label="Chức danh">
                  <Input placeholder="Nhập chức danh" />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="ddplDiaChi" label="Địa chỉ liên hệ">
                  <Input placeholder="Nhập địa chỉ liên hệ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="ddplSdt" label="Số điện thoại" required rules={isSubmitAndSend ? [
                  { required: true, message: "Vui lòng nhập số điện thoại người đại diện theo pháp luật" },
                  { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }
                ] : []}>
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ĐỀ NGHỊ GIẢI TỎA KÝ QUỸ & CAM KẾT */}
          <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
            <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
              💰 Phần 4. Đề nghị giải tỏa ký quỹ & Cam kết
            </span>
          </Divider>
          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
            <Row gutter={12}>
              {/* Mục 1: Đề nghị giải tỏa số tiền ký quỹ */}
              <Col span={8}>
                <Form.Item name="nganHang" label="Tại ngân hàng" required rules={isSubmitAndSend ? [{ required: true, message: "Vui lòng nhập tên ngân hàng" }] : []}>
                  <Input placeholder="Nhập tên ngân hàng" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="quySo" label="Theo xác nhận ký quỹ số (Số tài khoản)" required rules={isSubmitAndSend ? [{ required: true, message: "Vui lòng nhập số tài khoản quỹ" }] : []}>
                  <Input placeholder="Nhập số tài khoản quỹ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="ngay" label="Ngày xác nhận ký quỹ">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                </Form.Item>
              </Col>

              {/* Mục 2: Lý do */}
              <Col span={24}>
                <Form.Item name="lyDo" label="1. Lý do giải tỏa" required rules={isSubmitAndSend ? [{ required: true, message: "Vui lòng nhập lý do giải tỏa" }] : []}>
                  <Input.TextArea placeholder="Nhập lý do rút tiền/giải tỏa" rows={2} />
                </Form.Item>
              </Col>

              {/* Mục 3: Văn bản kèm theo */}
              <Col span={24}>
                <Form.Item name="vanBanTaiLieuKemTheo" label="2. Văn bản, tài liệu kèm theo">
                  <Input placeholder="Nhập mô tả văn bản, tài liệu kèm theo" />
                </Form.Item>
              </Col>

              {/* Mục 4: Người liên hệ */}
              <Col span={12}>
                <Form.Item name="dmlhHoVaTen" label="Người liên hệ">
                  <Input placeholder="Nhập họ và tên người liên hệ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dmlhSdt" label="Điện thoại người liên hệ" rules={isSubmitAndSend ? [
                  { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }
                ] : []}>
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>

              {/* Mục 5: Cam kết */}
              <Col span={24}>
                <div style={{ fontWeight: 500, fontSize: "12px", color: "#64748b", margin: "4px 0 8px 0" }}>
                  ✍️ Doanh nghiệp cam kết đã hoàn thành đầy đủ các nghĩa vụ quy định:
                </div>
              </Col>
              <Col span={8}>
                <Form.Item name="khoan" label="Tại khoản">
                  <Input placeholder="Nhập khoản" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dieu" label="Điều">
                  <Input placeholder="Nhập điều" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="nghiDinh" label="Nghị định số">
                  <Input placeholder="Nhập số nghị định" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* TÀI LIỆU ĐÍNH KÈM SPEC */}
          <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
            <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
              📂 Phần 5. Danh mục tài liệu đính kèm
            </span>
          </Divider>
          <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
            {!mstValue && (
              <div className="mb-3 text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 text-xs flex items-center gap-2" style={{ marginBottom: 16 }}>
                <span>⚠️</span>
                <span>
                  Vui lòng nhập <strong>Mã số thuế</strong> ở phần Thông tin tổ chức trước khi tải lên các tài liệu đính kèm.
                </span>
              </div>
            )}

            <Row gutter={[12, 12]}>
              <Col xs={24} lg={12}>
                {renderTable(leftDocs, 0)}
              </Col>
              <Col xs={24} lg={12}>
                {renderTable(rightDocs, half)}
              </Col>
            </Row>
          </div>

        </Form>
      </Card>
    </div>
  );
};

export default CreateOrUpdatePage;
