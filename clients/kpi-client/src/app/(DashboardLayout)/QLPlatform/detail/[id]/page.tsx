"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Tabs, Button, Spin, message, Form, Modal } from "antd";
import { ArrowLeftOutlined, CalendarOutlined } from "@ant-design/icons";
import { useSelector } from "@/store/hooks";
import { PlatformManageType } from "@/types/platformManage/dto";
import platformManageService from "@/services/platformManage/platformManage.service";

// Sub-components with relative paths adapted for deep nesting
import TaiLieuDinhKemTab from "../../NenTangTrucTuyen/detail/TaiLieuDinhKemTab";
import YeuCauDoanhNghiepTab from "../../NenTangTrucTuyen/detail/YeuCauDoanhNghiepTab";
import HistoryTab from "../../components/HistoryTab";
import DetailInfoTab from "../../components/DetailInfoTab";
import TransitionModal from "@/components/shared-components/TransitionModal";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";

// Specialized Role-based Views
import EnterpriseDetail from "../../views/Enterprise/EnterpriseDetail";
import SpecialistDetail from "../../views/Specialist/SpecialistDetail";

const ISP_OPTIONS = [
  { value: "ViettelIDC", label: "Viettel IDC" },
  { value: "VNPT", label: "VNPT Data Center" },
  { value: "FPT", label: "FPT Telecom" },
  { value: "NhanHoa", label: "Nhân Hòa" },
  { value: "MatBao", label: "Mắt Bão" },
  { value: "CMC", label: "CMC Telecom" },
  { value: "VNGCloud", label: "VNG Cloud" },
  { value: "AWS", label: "Amazon Web Services (AWS)" },
  { value: "Azure", label: "Microsoft Azure" },
  { value: "Khac", label: "Đơn vị hosting khác" },
];

const PlatformDetailPageContent: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<PlatformManageType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Transition form and state matching RutTienKyQuy
  const [actionForm] = Form.useForm<{ note: string }>();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionTargetStatus, setActionTargetStatus] = useState<number | null>(null);
  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);
  const [isBanNenTang, setIsBanNenTang] = useState<boolean>(false);

  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.includes("Admin");

  const hasRole = (roleCodes: string[]) => {
    return userRoles.some((r: string) => roleCodes.includes(r));
  };

  const userOperationCodes: string[] = (currentUser?.menuData ?? [])
    .flatMap((module: any) => module.listMenu ?? [])
    .map((op: any) => op.code as string);
  const hasPermission = (code: string) => isAdmin || userOperationCodes.includes(code);

  const roles = {
    isCV: hasRole(["ChuyenVienSo", "ChuyenVienCuc", "Admin"]),
    isTP: hasRole(["TruongPhongSo", "TruongPhongCuc", "Admin"]),
    isLD: hasRole(["LanhDaoSo", "LanhDaoCuc", "Admin"]),
    isDN: hasRole(["DoanhNghiep", "Admin"]),
    canViewTichHop: hasPermission("PLATFORM_MANAGE_DETAIL_TAB_TICHHOP"),
    canEditTichHop: hasPermission("PLATFORM_MANAGE_ACTION_TICHHOP_EDIT"),
  };

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await platformManageService.get(id);
      if (response.status && response.data) {
        setItem(response.data);
      } else {
        message.error(response.message ?? "Không thể tải thông tin chi tiết hồ sơ");
        router.back();
      }
    } catch (error: any) {
      message.error(error.message ?? "Đã xảy ra lỗi khi tải hồ sơ");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadGroupedTemplates = async () => {
    try {
      const res = await mauTraLoiService.getGroupedTemplates();
      if (res.status && res.data) {
        setGroupedTemplates(res.data);
      }
    } catch (e) {
      console.error("Lỗi khi tải mẫu trả lời:", e);
    }
  };

  useEffect(() => {
    fetchDetail();
    loadGroupedTemplates();
  }, [id]);

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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải thông tin chi tiết hồ sơ...</span>
      </div>
    );
  }

  if (!item) return null;

  const handleCloseActionModal = () => {
    setIsActionModalOpen(false);
    setActionTargetStatus(null);
    setIsBanNenTang(false);
    actionForm.resetFields();
  };

  // Xử lý lưu chuyển trạng thái cho Yêu cầu bổ sung & Từ chối
  const handleActionSubmit = async (values: { note: string }) => {
    if (!item?.id || actionTargetStatus === null) return;
    setSubmitting(true);
    try {
      const isBanNenTangVal = isBanNenTang || item.platformManageTypeId !== "NTThongBaoKD";
      const response = isBanNenTangVal
        ? await platformManageService.platformTransition({
          id: item.id,
          targetStatus: actionTargetStatus,
          note: values.note,
        })
        : await platformManageService.transition({
          id: item.id,
          targetStatus: actionTargetStatus,
          note: values.note,
        });

      if (response.status) {
        message.success("Chuyển trạng thái hồ sơ thành công");
        handleCloseActionModal();
        fetchDetail();
      } else {
        message.error(response.message ?? "Thao tác thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  // Kích hoạt transition modal hoặc confirm nhanh tùy trạng thái
  const handleTransitionClick = (config: {
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
    isBanNenTang?: boolean;
  }) => {
    const status = config.targetStatus;
    const isBanNenTangVal = !!(config.isBanNenTang || item?.platformManageTypeId !== "NTThongBaoKD");
    setIsBanNenTang(isBanNenTangVal);

    if (status === PlatformStatusConstant.CanBoSungThongTin || status === PlatformStatusConstant.BiTuChoi) {
      setActionTargetStatus(status);
      setIsActionModalOpen(true);
      return;
    }

    // Các trạng thái xác nhận/phê duyệt khác: dùng Modal.confirm nhanh như RutTienKyQuy
    Modal.confirm({
      title: config.title,
      content: "Bạn có chắc chắn muốn thực hiện thao tác này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        setSubmitting(true);
        try {
          const res = isBanNenTangVal
            ? await platformManageService.platformTransition({
              id: item.id,
              targetStatus: status,
              note: "",
            })
            : await platformManageService.transition({
              id: item.id,
              targetStatus: status,
              note: "",
            });
          if (res.status) {
            message.success("Chuyển trạng thái hồ sơ thành công");
            fetchDetail();
          } else {
            message.error(res.message || "Thao tác thất bại");
          }
        } catch {
          message.error("Có lỗi xảy ra khi chuyển trạng thái");
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const isOnlyEnterprise = roles.isDN && !roles.isCV && !roles.isTP && !roles.isLD;

  return (
    <>
      {isOnlyEnterprise ? (
        <EnterpriseDetail
          item={item}
          roles={roles}
          onRefresh={fetchDetail}
          onTransitionClick={handleTransitionClick}
          getFormattedDate={getFormattedDate}
          ispOptions={ISP_OPTIONS}
        />
      ) : (
        <SpecialistDetail
          item={item}
          roles={roles}
          onRefresh={fetchDetail}
          onTransitionClick={handleTransitionClick}
          getFormattedDate={getFormattedDate}
          ispOptions={ISP_OPTIONS}
        />
      )}

      <TransitionModal
        open={isActionModalOpen}
        title={actionTargetStatus === PlatformStatusConstant.CanBoSungThongTin ? "Yêu cầu bổ sung thông tin" : "Từ chối hồ sơ đăng ký"}
        form={actionForm}
        onCancel={handleCloseActionModal}
        onFinish={handleActionSubmit}
        groupedTemplates={groupedTemplates}
      />
    </>
  );
};

const PlatformDetailPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
        <Spin size="large" />
      </div>
    }>
      <PlatformDetailPageContent />
    </Suspense>
  );
};

export default PlatformDetailPage;
