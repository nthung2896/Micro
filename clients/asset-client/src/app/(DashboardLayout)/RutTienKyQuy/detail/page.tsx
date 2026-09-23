"use client";

import {
  Card,
  Spin,
  Button,
  Tabs,
  Row,
  Col,
  Tag,
  Timeline,
  Space,
  Form,
  Input,
  Select,
  Collapse,
  Modal,
  Divider,
  message
} from "antd";
import React, { useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  UserOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import rutTienKyQuyService from "@/services/rutTienKyQuy/rutTienKyQuy.service";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { SignResultItem } from "@/libs/moit-sign/types";
import { CertificateInfo } from "@/libs/moit-sign";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import { RutTienKyQuyType, RutTienKyQuyHistoryType } from "@/types/rutTienKyQuy/dto";
import { KyQuyConstant, KyQuyStatusColors, KyQuyStatusNames } from "@/services/rutTienKyQuy/KyQuyConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { useSelector } from "@/store/hooks";
import dayjs from "dayjs";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import TransitionModal from "@/components/shared-components/TransitionModal";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { DM_DuLieuDanhMucType } from "@/types/dM_DuLieuDanhMuc/dto";

const formatVND = (value: any) => {
  if (!value) return "";
  const cleanVal = value.toString().replace(/[^0-9]/g, "");
  const num = Number(cleanVal);
  if (isNaN(num) || cleanVal === "") return value;
  return num.toLocaleString("vi-VN") + " VNĐ";
};

// Helper component for label-value alignment
const InfoItem: React.FC<{
  label: string;
  value: React.ReactNode;
  span?: number;
}> = ({ label, value, span = 8 }) => {
  return (
    <Col xs={24} sm={span} className="mb-2">
      <div className="text-gray-500 text-xs font-semibold mb-0.5">{label}:</div>
      <div className="text-gray-900 text-sm font-semibold word-break-all">
        {value !== undefined && value !== null && value !== "" ? (
          value
        ) : (
          <span className="text-gray-400 font-normal italic">Không có</span>
        )}
      </div>
    </Col>
  );
};

const RutTienKyQuyDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [data, setData] = useState<RutTienKyQuyType | null>(null);
  const [files, setFiles] = useState<TaiLieuDinhKemType[]>([]);
  const [histories, setHistories] = useState<RutTienKyQuyHistoryType[]>([]);
  const [specialists, setSpecialists] = useState<Array<{ id: string; name: string; userName: string }>>([]);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionTargetStatus, setActionTargetStatus] = useState<number | null>(null);
  const [actionForm] = Form.useForm();

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [pendingTransition, setPendingTransition] = useState<{
    id?: string;
    ids?: string[];
    targetStatus: number;
    note: string;
    successMessage: string;
  } | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm] = Form.useForm();

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
    if (isActionModalOpen) {
      loadGroupedTemplates();
    }
  }, [isActionModalOpen]);

  // Auth User Context
  const currentUser = useSelector((state: any) => state.auth.User);
  const userRoles = currentUser?.listRole || [];
  const [configFiles, setConfigFiles] = useState<DM_DuLieuDanhMucType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, TaiLieuDinhKemType | null>>({});

  const isDoanhNghiep = userRoles.includes("DoanhNghiep");
  const isAdmin = userRoles.includes("Admin");

  const userOperationCodes: string[] = (currentUser?.menuData ?? [])
    .flatMap((module: any) => module.listMenu ?? [])
    .map((op: any) => op.code as string);
  const hasPermission = (code: string) => isAdmin || userOperationCodes.includes(code);
  const isChuyenVien = hasPermission("THAOTACCHUYENVIEN");
  const isTruongPhong = hasPermission("THAOTACTRUONGPHONG");
  const isLanhDao = hasPermission("THAOTACLANHDAO");

  const fetchFullDetails = async () => {
    if (!id) return;
    try {
      setPageLoading(true);
      const res = await rutTienKyQuyService.get(id);
      if (res && res.data) {
        setData(res.data);
        setHistories(res.data.histories || []);

        const filesMap: Record<string, TaiLieuDinhKemType | null> = {};
        if (res.data.files) {
          res.data.files.forEach((f: any) => {
            if (f.loaiTaiLieu) {
              filesMap[f.loaiTaiLieu] = f;
            }
          });
        }
        // setUploadedFiles(filesMap);
      }
    } catch (e) {
      message.error("Không thể tải thông tin hồ sơ chi tiết.");
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFullDetails();
    }
  }, [id]);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const configRes = await duLieuDanhMucService.getListDataByGroupCode("CAUHINHTAILIEURUTTIENKYQUY");
        if (configRes?.status && Array.isArray(configRes.data)) {
          const sortedConfigs = [...configRes.data].sort((a, b) => (a.priority || 0) - (b.priority || 0));
          setConfigFiles(sortedConfigs);
        }
      } catch (err) {
        console.error("Lỗi khi tải cấu hình tài liệu ký quỹ:", err);
      }
    };
    loadConfigs();
  }, []);

  useEffect(() => {
    if (id && currentUser && (isTruongPhong || isAdmin)) {
      rutTienKyQuyService.getSpecialists().then(res => {
        if (res.status && res.data) {
          setSpecialists(res.data);
        }
      });
    }
  }, [id, currentUser, isTruongPhong, isAdmin]);

  const handleSelfAssign = async () => {
    if (!data?.id) return;
    try {
      const res = await rutTienKyQuyService.selfAssign(data.id);
      if (res.status) {
        message.success("Nhận rà soát hồ sơ thành công!");
        fetchFullDetails();
      } else {
        message.error("Lỗi: " + res.message);
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi nhận hồ sơ.");
    }
  };

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

    // Validate dynamic required files
    const missingRequired = configFiles.filter(config => {
      const isRequired = config.note?.trim() === "true";
      if (!isRequired) return false;
      const uploadedFile = uploadedFiles[config.code];
      return !uploadedFile;
    });

    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map(c => `'${c.name}'`).join(", ");
      return `Thiếu tài liệu đính kèm bắt buộc: ${missingNames}`;
    }

    return null;
  };

  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      setPageLoading(true);
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

      const res = await rutTienKyQuyService.transition(
        [result[0].id],
        targetStatus,
        note,
      );

      if (res.status) {
        message.success(successMsg);
        fetchFullDetails();
      } else {
        message.error(res.message ?? "Thao tác thất bại");
      }

    } catch (error: any) {
      message.error(error?.message || "Lỗi trong quá trình ký số và duyệt hồ sơ");
    } finally {
      setIsSignModalOpen(false);
      setPendingTransition(null);
      setPageLoading(false);
    }
  };

  const openTransitionModal = (status: number) => {
    if (status === KyQuyConstant.ChoDuyet) {
      const errorMsg = validateProfileForSubmission(data);
      if (errorMsg) {
        message.error(errorMsg);
        return;
      }
    }

    // Chỉ có Cần bổ sung thông tin và Bị từ chối mới yêu cầu mở Modal nhập ý kiến phản hồi
    if (status === KyQuyConstant.CanBoSungThongTin || status === KyQuyConstant.BiTuChoi) {
      setActionTargetStatus(status);
      setIsActionModalOpen(true);
      return;
    }

    const isRequireSign = isDoanhNghiep
      ? (status === KyQuyConstant.ChoDuyet)
      : currentUser?.isKySo;
    if (isRequireSign) {
      if (!data?.id) return;
      setPendingTransition({
        id: data.id,
        targetStatus: status,
        note: "",
        successMessage: "Ký số và thực hiện thao tác thành công",
      });
      setSignIds([data.id]);
      setIsSignModalOpen(true);
      return;
    }

    // Các trạng thái xác nhận/phê duyệt khác: chỉ cần một hộp thoại xác nhận nhanh Modal.confirm
    let title = "Xác nhận";
    let content = "Bạn có chắc chắn muốn thực hiện thao tác này?";

    if (status === KyQuyConstant.ChoDuyet) {
      title = "Xác nhận gửi hồ sơ";
      content = "Bạn có chắc chắn muốn gửi hồ sơ đăng ký duyệt không?";
    } else if (status === KyQuyConstant.DaHuyDangKy) {
      title = "Xác nhận hủy gửi hồ sơ";
      content = "Bạn có chắc chắn muốn hủy gửi hồ sơ này không?";
    } else {
      const actionName = getActionTitle(status);
      title = `Xác nhận: ${actionName}`;
      content = `Bạn có chắc chắn muốn thực hiện thao tác "${actionName}" không?`;
    }

    Modal.confirm({
      title: title,
      content: content,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        if (!data?.id) return;
        try {
          const res = await rutTienKyQuyService.transition([data.id], status, "");
          if (res.status) {
            message.success("Thực hiện thao tác thành công!");
            fetchFullDetails();
          } else {
            message.error("Lỗi: " + res.message);
          }
        } catch (e) {
          message.error("Có lỗi xảy ra.");
        }
      }
    });
  };

  const handleCloseTransitionModal = () => {
    setIsActionModalOpen(false);
    setActionTargetStatus(null);
    actionForm.resetFields();
  };

  const handleTransitionSubmit = async (values: { note: string }) => {
    if (!data?.id || actionTargetStatus === null) return;
    const isRequireSign = isDoanhNghiep
      ? (actionTargetStatus === KyQuyConstant.ChoDuyet)
      : currentUser?.isKySo;
    if (isRequireSign) {
      setPendingTransition({
        id: data.id,
        targetStatus: actionTargetStatus,
        note: values.note,
        successMessage: "Ký số và thực hiện thao tác thành công",
      });
      setSignIds([data.id]);
      setIsActionModalOpen(false);
      setIsSignModalOpen(true);
      return;
    }

    try {
      const res = await rutTienKyQuyService.transition(
        [data.id],
        actionTargetStatus,
        values.note
      );

      if (res.status) {
        message.success("Chuyển trạng thái thành công!");
        handleCloseTransitionModal();
        fetchFullDetails();
      } else {
        message.error("Lỗi: " + res.message);
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi chuyển trạng thái.");
    }
  };

  const handleAssignSubmit = async (values: { specialistId: string }) => {
    if (!data?.id) return;
    const spec = specialists.find(s => s.id === values.specialistId);
    if (!spec) return;

    try {
      const res = await rutTienKyQuyService.assign(data.id, spec.id, spec.name || spec.userName || "");
      if (res.status) {
        message.success("Phân công chuyên viên thành công!");
        setIsAssignModalOpen(false);
        assignForm.resetFields();
        fetchFullDetails();
      } else {
        message.error("Lỗi: " + res.message);
      }
    } catch (e) {
      message.error("Có lỗi xảy ra khi phân công.");
    }
  };

  const getActionTitle = (status: number) => {
    switch (status) {
      case KyQuyConstant.DaDuyetDienTu:
        return "Chuyên viên duyệt điện tử";
      case KyQuyConstant.CanBoSungThongTin:
        return "Yêu cầu bổ sung thông tin";
      case KyQuyConstant.BiTuChoi:
        return "Từ chối duyệt hồ sơ";
      case KyQuyConstant.CanBanGiay:
        return "Yêu cầu nộp hồ sơ bản giấy";
      case KyQuyConstant.DaReview:
        return "Đã review hồ sơ bản giấy (Trình Lãnh đạo)";
      case KyQuyConstant.DaXacNhan:
        return "Lãnh đạo xác nhận thành công";
      default:
        return "Chuyển trạng thái hồ sơ";
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center p-10 min-h-[400px]">
        <Spin size="large" tip="Đang tải thông tin chi tiết..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <Card>
          <div className="text-center py-6 text-gray-500">Không tìm thấy thông tin hồ sơ đề nghị rút tiền ký quỹ.</div>
        </Card>
      </div>
    );
  }

  // Two Tab Items Configuration
  const tabItems = [
    {
      key: "general-info",
      label: <span className="font-semibold text-sm">🏢 Thông tin chung & Xử lý</span>,
      children: (
        <Row gutter={24}>
          {/* LEFT SIDE (2/3 width): Condended High-Density details grid */}
          <Col xs={24} lg={16}>
            {/* PHẦN 1: THÔNG TIN ĐƠN ĐỀ NGHỊ */}
            <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
              <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
                📄 Phần 1. Thông tin đơn đề nghị
              </span>
            </Divider>
            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
              <Row gutter={[16, 8]}>
                <InfoItem label="Số đơn đề nghị" value={data?.soVanBan} span={12} />
                <InfoItem label="Địa điểm, ngày tháng năm đơn đề nghị" value={data?.diaChiNgayThangNam} span={12} />
              </Row>
            </div>

            {/* PHẦN 2: THÔNG TIN TỔ CHỨC */}
            <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
              <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
                🏢 Phần 2. Thông tin tổ chức
              </span>
            </Divider>
            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
              <Row gutter={[16, 8]}>
                <InfoItem label="Tên chủ quan tổ chức" value={<span className="text-blue-600 font-bold text-sm">{data?.tenChuQuanToChuc}</span>} span={8} />
                <InfoItem label="Mã số thuế" value={data?.maSoThue && <Tag color="blue" className="m-0">{data?.maSoThue}</Tag>} span={8} />
                <InfoItem label="Số, ngày, nơi cấp GCN" value={data?.soNgayNoiCapGCN} span={8} />

                <InfoItem label="Địa chỉ trụ sở chính" value={data?.diaChiTruSoChinh} span={8} />
                <InfoItem label="Email tiếp nhận" value={data?.emailTiepNhan} span={8} />
                <InfoItem label="SĐT Tổ chức" value={data?.sdtToChuc && <Tag color="green" className="m-0">{data?.sdtToChuc}</Tag>} span={8} />


                <InfoItem label="Tên nền tảng" value={data?.appTenUngDung} span={12} />
              </Row>
            </div>

            {/* PHẦN 3: NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT */}
            <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
              <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
                ⚖️ Phần 3. Người đại diện theo pháp luật
              </span>
            </Divider>
            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
              <Row gutter={[16, 8]}>
                <InfoItem label="Họ và tên" value={data?.ddplHoVaTen} span={8} />
                <InfoItem label="Số CCCD/Hộ chiếu" value={data?.ddplSoCccdHoChieu} span={8} />
                <InfoItem label="Chức danh" value={data?.ddplChucDanh} span={8} />
                <InfoItem label="Địa chỉ liên hệ" value={data?.ddplDiaChi} span={16} />
                <InfoItem label="Số điện thoại" value={data?.ddplSdt && <Tag color="green" className="m-0">{data?.ddplSdt}</Tag>} span={8} />
              </Row>
            </div>

            {/* PHẦN 4: ĐỀ NGHỊ GIẢI TỎA KÝ QUỸ & CAM KẾT */}
            <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
              <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
                💰 Phần 4. Đề nghị giải tỏa ký quỹ & Cam kết
              </span>
            </Divider>
            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
              <Row gutter={[16, 8]}>
                <InfoItem label="Tại ngân hàng" value={data?.nganHang} span={8} />
                <InfoItem label="Theo xác nhận ký quỹ số (Số tài khoản)" value={data?.quySo && <Tag color="orange" className="font-bold text-xs px-1.5 py-0.5 m-0">{data?.quySo}</Tag>} span={8} />
                <InfoItem label="Ngày xác nhận ký quỹ" value={data?.ngay ? dayjs(data.ngay).format('DD/MM/YYYY') : ""} span={8} />

                <InfoItem
                  label="1. Lý do giải tỏa"
                  value={
                    data?.lyDo ? (
                      <div className="bg-white p-2.5 rounded border border-gray-200 text-gray-700 italic text-xs w-full">
                        "{data?.lyDo}"
                      </div>
                    ) : null
                  }
                  span={24}
                />

                <InfoItem label="2. Văn bản, tài liệu kèm theo" value={data?.vanBanTaiLieuKemTheo} span={24} />

                <InfoItem label="Người liên hệ" value={data?.dmlhHoVaTen} span={12} />
                <InfoItem label="Điện thoại người liên hệ" value={data?.dmlhSdt && <Tag color="green" className="m-0">{data?.dmlhSdt}</Tag>} span={12} />

                <Col span={24}>
                  <div style={{ fontWeight: 500, fontSize: "12px", color: "#64748b", margin: "4px 0 2px 0" }}>
                    ✍️ Doanh nghiệp cam kết đã hoàn thành đầy đủ các nghĩa vụ quy định:
                  </div>
                </Col>
                <InfoItem label="Tại khoản" value={data?.khoan} span={8} />
                <InfoItem label="Điều" value={data?.dieu} span={8} />
                <InfoItem label="Nghị định số" value={data?.nghiDinh} span={8} />
              </Row>
            </div>

            {/* PHẦN 5: DANH MỤC TÀI LIỆU ĐÍNH KÈM */}
            <Divider plain style={{ marginTop: 4, marginBottom: 8 }}>
              <span className="font-semibold text-blue-600" style={{ fontSize: "15px", fontWeight: 700, color: "#2563eb" }}>
                📂 Phần 5. Danh mục tài liệu đính kèm
              </span>
            </Divider>
            <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 12 }}>
              <Row gutter={[16, 8]}>
                {configFiles.map((config) => (
                  <InfoItem
                    key={config.code}
                    label={config.name}
                    value={
                      <SingleFileUploader
                        readOnly
                        value={uploadedFiles[config.code] || null}
                        onChange={(val) => {
                          setUploadedFiles(prev => ({
                            ...prev,
                            [config.code]: val
                          }));
                        }}
                        category={FileCategoryConstant.RutTienKyQuy}
                        itemId={id || undefined}
                        loaiTaiLieu={config.code}
                        taxCode={data?.maSoThue}
                        requiredKySo={true}
                        accept=".pdf"
                      />
                    }
                    span={24}
                  />
                ))}
              </Row>
            </div>
          </Col>

          {/* RIGHT SIDE (1/3 width): Persistent Sticky Action Box (never leaves blank gaps!) */}
          <Col xs={24} lg={8}>
            <div style={{ position: "sticky", top: 120 }}>
              <Card
                title={<span className="text-emerald-700 font-bold uppercase text-xs">⚙️ Thao tác nghiệp vụ</span>}
                className="shadow-xs border border-emerald-100"
                styles={{ header: { backgroundColor: '#f0fdf4' } }}
              >
                <div className="mb-3.5">
                  <span className="text-gray-400 block text-xs font-semibold">Chuyên viên phụ trách:</span>
                  {data?.chuyenVienId ? (
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mt-1">
                      <UserOutlined /> {
                        isDoanhNghiep
                          ? data.chuyenVienMaCanBo
                          : (data.chuyenVienMaCanBo && data.chuyenVienName
                            ? `${data.chuyenVienMaCanBo} - ${data.chuyenVienName}`
                            : data.chuyenVienMaCanBo || data.chuyenVienName)
                      }
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium italic block text-xs mt-1">Chưa phân công cán bộ rà soát</span>
                  )}
                </div>

                <div className="mb-3.5">
                  <span className="text-gray-400 block text-xs font-semibold">Trạng thái hiện tại:</span>
                  <Tag color={KyQuyStatusColors[data.status ?? 0] || "default"} className="px-2 py-0.5 mt-1 text-xs font-semibold rounded">
                    {data.statusName || KyQuyStatusNames[data.status ?? 0] || "Tạm lưu"}
                  </Tag>
                </div>

                <Divider className="my-2.5" />

                <Space direction="vertical" className="w-full" size="small">
                  {/* Specialists Self Assignment for ChuyenVien */}
                  {isChuyenVien && data?.status === KyQuyConstant.ChoDuyet && data?.chuyenVienId !== currentUser?.id && (
                    <Button
                      onClick={handleSelfAssign}
                      type="primary"
                      className="w-full py-1.5 h-auto text-xs"
                      icon={<UserAddOutlined />}
                      style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    >
                      {data?.chuyenVienId ? "Tự nhận rà soát (Nhận thay chuyên viên khác)" : "Tự nhận rà soát hồ sơ"}
                    </Button>
                  )}

                  {/* Leader/TP assigns specialist */}
                  {(isTruongPhong || isAdmin) && (data?.status === KyQuyConstant.ChoDuyet || !data?.chuyenVienId) && (
                    <Button
                      onClick={() => setIsAssignModalOpen(true)}
                      type="default"
                      className="w-full py-1.5 h-auto text-xs"
                      icon={<UserAddOutlined />}
                    >
                      {data?.chuyenVienId ? "Phân công lại chuyên viên rà soát" : "Phân công chuyên viên rà soát"}
                    </Button>
                  )}

                  {/* Specialist Action Flow Buttons */}
                  {((isChuyenVien && data?.chuyenVienId === currentUser?.id) || isAdmin) && data?.status === KyQuyConstant.ChoDuyet && (
                    <>
                      <Button
                        onClick={() => openTransitionModal(KyQuyConstant.DaDuyetDienTu)}
                        type="primary"
                        className="w-full py-1.5 h-auto text-xs"
                        icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                      >
                        Duyệt điện tử (Trình TP)
                      </Button>
                      <Button
                        onClick={() => openTransitionModal(KyQuyConstant.CanBoSungThongTin)}
                        type="default"
                        className="w-full py-1.5 h-auto text-xs"
                        style={{ color: '#f97316', borderColor: '#f97316' }}
                      >
                        Yêu cầu bổ sung thông tin
                      </Button>
                      <Button
                        onClick={() => openTransitionModal(KyQuyConstant.BiTuChoi)}
                        danger
                        className="w-full py-1.5 h-auto text-xs"
                        icon={<CloseCircleOutlined />}
                      >
                        Từ chối phê duyệt
                      </Button>
                    </>
                  )}

                  {/* Department Head (TruongPhong) Action Flow Buttons */}
                  {(isTruongPhong || isAdmin) && (data?.status === KyQuyConstant.ChoDuyet || data?.status === KyQuyConstant.DaDuyetDienTu || data?.status === KyQuyConstant.CanBanGiay) && (
                    <>
                      {data?.status === KyQuyConstant.DaDuyetDienTu && (
                        <Button
                          onClick={() => openTransitionModal(KyQuyConstant.CanBanGiay)}
                          type="primary"
                          className="w-full py-1.5 h-auto text-xs"
                          style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
                          icon={<FileSearchOutlined />}
                        >
                          Đề nghị nộp hồ sơ bản giấy
                        </Button>
                      )}
                      {(data?.status === KyQuyConstant.DaDuyetDienTu || data?.status === KyQuyConstant.CanBanGiay) && (
                        <Button
                          onClick={() => openTransitionModal(KyQuyConstant.DaReview)}
                          type="primary"
                          className="w-full py-1.5 h-auto text-xs"
                          style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                          icon={<CheckCircleOutlined />}
                        >
                          Xác nhận bản giấy (Trình LĐ)
                        </Button>
                      )}
                      <Button
                        onClick={() => openTransitionModal(KyQuyConstant.CanBoSungThongTin)}
                        type="default"
                        className="w-full py-1.5 h-auto text-xs"
                        style={{ color: '#f97316', borderColor: '#f97316' }}
                      >
                        Yêu cầu bổ sung thông tin
                      </Button>
                      <Button
                        onClick={() => openTransitionModal(KyQuyConstant.BiTuChoi)}
                        danger
                        className="w-full py-1.5 h-auto text-xs"
                        icon={<CloseCircleOutlined />}
                      >
                        Từ chối phê duyệt
                      </Button>
                    </>
                  )}

                  {/* Leader (LanhDao) Action Flow Buttons */}
                  {(isLanhDao || isAdmin) && data?.status === KyQuyConstant.DaReview && (
                    <>
                      <Button
                        onClick={() => openTransitionModal(KyQuyConstant.DaXacNhan)}
                        type="primary"
                        className="w-full py-1.5 h-auto text-xs"
                        icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                      >
                        Xác nhận rút tiền thành công
                      </Button>
                      <Button
                        onClick={() => openTransitionModal(KyQuyConstant.CanBoSungThongTin)}
                        type="default"
                        className="w-full py-1.5 h-auto text-xs"
                        style={{ color: '#f97316', borderColor: '#f97316' }}
                      >
                        Yêu cầu bổ sung thông tin
                      </Button>
                      <Button
                        onClick={() => openTransitionModal(KyQuyConstant.BiTuChoi)}
                        danger
                        className="w-full py-1.5 h-auto text-xs"
                        icon={<CloseCircleOutlined />}
                      >
                        Từ chối phê duyệt
                      </Button>
                    </>
                  )}

                  {/* Enterprise sending/cancelling draft */}
                  {isDoanhNghiep && (data?.status === KyQuyConstant.TamLuu || data?.status === KyQuyConstant.CanBoSungThongTin || data?.status === KyQuyConstant.DeNghiChinhSua) && (
                    <Button
                      onClick={() => openTransitionModal(KyQuyConstant.ChoDuyet)}
                      type="primary"
                      className="w-full py-1.5 h-auto text-xs"
                      icon={<CheckCircleOutlined />}
                    >
                      Gửi hồ sơ đăng ký duyệt
                    </Button>
                  )}
                  {isDoanhNghiep && data?.status === KyQuyConstant.ChoDuyet && (
                    <Button
                      onClick={() => openTransitionModal(KyQuyConstant.DaHuyDangKy)}
                      danger
                      className="w-full py-1.5 h-auto text-xs"
                      icon={<CloseCircleOutlined />}
                    >
                      Hủy gửi hồ sơ
                    </Button>
                  )}

                  {/* Non actions permitted note */}
                  {!isChuyenVien && !isTruongPhong && !isLanhDao && !isDoanhNghiep && (
                    <div className="text-gray-400 italic text-xs text-center">Bạn không có quyền thao tác nghiệp vụ.</div>
                  )}
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      )
    },
    {
      key: "history-timeline",
      label: <span className="font-semibold text-sm">📜 Lịch sử xử lý</span>,
      children: (
        <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-xs">
          <h4 className="text-slate-800 font-bold border-b pb-2 mb-4 text-sm uppercase">
            Nhật ký tiến trình xử lý hồ sơ
          </h4>
          {histories.length === 0 ? (
            <div className="text-gray-400 italic text-center py-6">Chưa có tiến trình xử lý được ghi nhận.</div>
          ) : (
            <div className="max-w-3xl pt-2">
              <Timeline
                mode="left"
                reverse
                items={histories.map((h, i) => ({
                  dot: h.statusAfter === KyQuyConstant.DaXacNhan ? (
                    <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                  ) : h.statusAfter === KyQuyConstant.BiTuChoi ? (
                    <CloseCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />
                  ) : (
                    <ClockCircleOutlined style={{ fontSize: '14px', color: '#1890ff' }} />
                  ),
                  children: (
                    <div className="text-sm bg-slate-50 p-3 rounded border border-gray-200 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{h.action || "Chuyển trạng thái"}</span>
                        <span className="text-gray-400 text-xs">{dayjs(h.createdDate).format("DD/MM/YYYY HH:mm")}</span>
                      </div>
                      {!(
                        h.action &&
                        [
                          "doanh nghiệp",
                          "gửi đăng ký",
                          "gửi hồ sơ",
                          "gửi duyệt",
                          "bổ sung hồ sơ",
                          "bổ sung thông tin",
                          "hủy hồ sơ",
                          "hủy đăng ký",
                          "hủy đề nghị",
                          "tạm lưu",
                          "lưu nháp",
                          "tạo mới",
                          "cập nhật",
                          "sửa đổi"
                        ].some(k => h.action!.toLowerCase().includes(k))
                      ) && (
                          <div className="text-gray-600 text-xs mb-1">
                            Cán bộ thực hiện: <span className="font-semibold text-slate-700">
                              {isDoanhNghiep
                                ? (h.senderMaCanBo || h.createdBy)
                                : (h.senderMaCanBo && h.senderName
                                  ? `${h.senderMaCanBo} - ${h.senderName}`
                                  : h.senderMaCanBo || h.senderName || h.createdBy)
                              }
                            </span>
                          </div>
                        )}
                      <div className="flex items-center gap-1.5 my-2">
                        <Tag color={KyQuyStatusColors[h.statusBefore] || "default"}>
                          {h.statusBeforeName || KyQuyStatusNames[h.statusBefore] || "Tạm lưu"}
                        </Tag>
                        <span className="text-gray-400">➔</span>
                        <Tag color={KyQuyStatusColors[h.statusAfter] || "default"}>
                          {h.statusAfterName || KyQuyStatusNames[h.statusAfter]}
                        </Tag>
                      </div>
                      {h.note && (
                        <div
                          className="bg-white p-2.5 rounded border border-gray-200 text-slate-700 mt-2 text-xs"
                          dangerouslySetInnerHTML={{ __html: h.note }}
                        />
                      )}
                    </div>
                  )
                }))}
              />
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className=" w-full">
      <AutoBreadcrumb />
      <Card
        className="shadow-md border border-gray-200 mt-4"
        title={
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/RutTienKyQuy")}
              className="text-slate-600 hover:text-slate-800"
            />
            <span className="text-base font-bold text-slate-800">
              Chi tiết hồ sơ rút tiền ký quỹ
            </span>
          </div>
        }
      // extra={
      //   data?.status !== undefined && (
      //     <Tag color={KyQuyStatusColors[data.status ?? 0] || "default"} className="px-3 py-1 rounded text-sm font-semibold">
      //       {data.statusName || KyQuyStatusNames[data.status ?? 0] || "Tạm lưu"}
      //     </Tag>
      //   )
      // }
      >
        <Tabs
          defaultActiveKey="general-info"
          items={tabItems}
          type="card"
          className="rut-tien-tabs"
        />
      </Card>

      {/* STATE TRANSITION POPUP MODAL */}
      <TransitionModal
        open={isActionModalOpen}
        title={getActionTitle(actionTargetStatus || 0)}
        form={actionForm}
        onCancel={handleCloseTransitionModal}
        onFinish={handleTransitionSubmit}
        groupedTemplates={groupedTemplates}
      />

      {/* SPECIALIST ASSIGNMENT SUB-MODAL */}
      <Modal
        title="Phân công chuyên viên rà soát"
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={() => assignForm.submit()}
        okText="Phân công"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignSubmit}
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
    </div>
  );
};

export default RutTienKyQuyDetailPage;
