"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Tabs, Button, Spin, Alert, Tag, Space, Divider, message, Form } from "antd";
import { CalendarOutlined, ArrowLeftOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector } from "@/store/hooks";
import platformManageService from "@/services/platformManage/platformManage.service";
import { PlatformManageType } from "@/types/platformManage/dto";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";

// Sub-components
import HoSoInfoTab from "./HoSoInfoTab";
import TaiLieuDinhKemTab from "./TaiLieuDinhKemTab";
import YeuCauDoanhNghiepTab from "./YeuCauDoanhNghiepTab";
import EmptyTabPanel from "./EmptyTabPanel";
import HistoryTab from "../../components/HistoryTab";
import ThongTinKySo from "../../../hop-dong/components/ThongTinKySo";
import DvcSyncLogTab from "../../components/DvcSyncLogTab";

// Actions & Modal
import EnterpriseAction from "../../views/Enterprise/EnterpriseAction";
import SpecialistAction from "../../views/Specialist/SpecialistAction";
import CucSpecialistAction from "../../views/Specialist/CucSpecialistAction";
import PlatformTransitionModal from "../../components/PlatformTransitionModal";
import TransitionModal from "@/components/shared-components/TransitionModal";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import Link from "next/link";
import ButtonPlatformDetail from "../../components/ButtonPlatformDetail";

const DetailPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles = currentUser?.listRole || authState?.ListRole || [];
  const roles = {
    isCV: userRoles.some((r: string) => ["ChuyenVienSo", "ChuyenVienCuc", "Admin"].includes(r)),
    isTP: userRoles.some((r: string) => ["TruongPhongSo", "TruongPhongCuc", "Admin"].includes(r)),
    isLD: userRoles.some((r: string) => ["LanhDaoSo", "LanhDaoCuc", "Admin"].includes(r)),
    isDN: userRoles.some((r: string) => ["DoanhNghiep", "Admin"].includes(r)),
  };

  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<PlatformManageType | null>(null);
  const [activeTab, setActiveTab] = useState("ho-so");
  const [submitting, setSubmitting] = useState(false);
  const [transitionModal, setTransitionModal] = useState<{
    recordId: string;
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
    isBanNenTang?: boolean;
  } | null>(null);
  const [actionForm] = Form.useForm<{ note: string }>();
  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);

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
    loadGroupedTemplates();
  }, []);

  const loadDetail = async (targetId: string, showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await platformManageService.get(targetId);
      if (response?.data) {
        setItem(response.data);
      } else {
        message.error(response.message ?? "Không tải được chi tiết hồ sơ");
        router.push("/QLPlatform/NenTangTrucTuyen");
      }
    } catch {
      message.error("Không tải được chi tiết hồ sơ nền tảng");
      router.push("/QLPlatform/NenTangTrucTuyen");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      message.error("Không tìm thấy mã hồ sơ");
      router.push("/QLPlatform/NenTangTrucTuyen");
      return;
    }
    loadDetail(id, true);
  }, [id, router]);

  const handleRefresh = async () => {
    if (id) {
      await loadDetail(id, false);
    }
  };

  const handleTransitionSubmit = async (values: { note: string }) => {
    if (!transitionModal || !item) return;
    setSubmitting(true);
    try {
      if (transitionModal.targetStatus === -1) {
        const isBig = !item.isNenTangLon;
        const response = await platformManageService.markBigPlatform({
          id: item.id,
          isBig: isBig,
          note: values.note || "",
        });
        if (response.status) {
          message.success(isBig ? "Đánh dấu nền tảng lớn thành công" : "Hủy đánh dấu nền tảng lớn thành công");
          setTransitionModal(null);
          actionForm.resetFields();
          await handleRefresh();
        } else {
          message.error(response.message ?? "Thao tác thất bại");
        }
        return;
      }

      const isBanNenTang = transitionModal.isBanNenTang || item.platformManageTypeId !== "NTThongBaoKD";
      const response = isBanNenTang
        ? await platformManageService.platformTransition({
          id: item.id,
          targetStatus: transitionModal.targetStatus,
          note: values.note,
        })
        : await platformManageService.transition({
          id: item.id,
          targetStatus: transitionModal.targetStatus,
          note: values.note,
        });

      if (response.status) {
        message.success("Chuyển trạng thái hồ sơ thành công");
        setTransitionModal(null);
        actionForm.resetFields();
        await handleRefresh();
      } else {
        message.error(response.message ?? "Thao tác thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !item) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "350px", flexDirection: "column", gap: "16px" }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải dữ liệu hồ sơ...</span>
      </div>
    );
  }

  const isOnlyEnterprise = roles.isDN && !roles.isCV && !roles.isTP && !roles.isLD;
  const hasRequest =
    item.status === PlatformStatusConstant.DeNghiChinhSua ||
    item.status === PlatformStatusConstant.CanBoSungThongTin;

  const statusColor = PlatformStatusConstant.getColor(item.status);
  const statusName = PlatformStatusConstant.getDisplayName(item.status);
  const deadline = (roles.isDN && item.status !== PlatformStatusConstant.CanBoSungThongTin) ? null : (roles.isDN ? item.dateLineEnterprise : item.dateLine);

  const tabItems = [
    {
      key: "ho-so",
      label: "Thông tin hồ sơ",
      children: <HoSoInfoTab item={item} />,
    },
    {
      key: "tai-lieu",
      label: "Tài liệu đính kèm",
      children: (
        <TaiLieuDinhKemTab
          itemId={item.id}
          active={activeTab === "tai-lieu"}
        />
      ),
    },
    {
      key: "ky-so",
      label: "Thông tin ký số",
      children: (
        <ThongTinKySo
          hoSoId={item.id}
          signerService={platformManageService}
        />
      ),
    },
    ...(isOnlyEnterprise ? [] : [
      {
        key: "phan-anh",
        label: "Phản ánh",
        children: <EmptyTabPanel description="Chưa có phản ánh" />,
      },
      {
        key: "canh-bao",
        label: "Cảnh báo và vi phạm",
        children: <EmptyTabPanel description="Chưa có cảnh báo hoặc vi phạm" />,
      },
      {
        key: "sync-log",
        label: "Lịch sử đồng bộ",
        children: <DvcSyncLogTab maHoSo={item.dvcMaHoSo} />,
      },
    ]),
    {
      key: "lich-su",
      label: "Lịch sử xử lý",
      children: <HistoryTab platformId={item.id} companyTaxCode={item.companyTaxCode} />,
    },
  ];

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="platform-detail-view" style={{ padding: "0" }}>
      <style jsx global>{`
        .platform-detail-view .custom-tabs .ant-tabs-nav {
          margin-bottom: 20px !important;
        }
        .platform-detail-view .custom-tabs .ant-tabs-tab {
          font-size: 15px !important;
          font-weight: 500 !important;
          padding: 12px 16px !important;
        }
        .platform-detail-view .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          font-weight: 600 !important;
        }
        .sticky-header-toolbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          padding: 16px 24px;
          margin: -24px -24px 20px -24px;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .breadcrumb-link {
          color: #64748b;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .breadcrumb-link:hover {
          color: #0f172a;
        }
      `}</style>

      {/* TOP STICKY HEADER TOOLBAR */}
      <div className="sticky-header-toolbar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <Link href="/dashboard" className="breadcrumb-link">Trang chủ</Link>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span className="breadcrumb-link" style={{ cursor: "pointer" }} onClick={() => router.push("/QLPlatform/NenTangTrucTuyen")}>
                Nền tảng trực tuyến
              </span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>{item.name}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#475569", fontSize: "13px", fontWeight: 500 }}>
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px" }} />
            <span style={{ textTransform: "capitalize" }}>{getFormattedDate()}</span>
          </div>
        </div>

        <div style={{ borderBottom: "1px solid #e2e8f0", marginTop: "4px", marginBottom: "16px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "5.5fr 4.5fr", gap: "12px", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/QLPlatform/NenTangTrucTuyen")}
              style={{ paddingLeft: 0, color: "#64748b", fontWeight: 600 }}
            >
              Quay lại danh sách
            </Button>
            <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Trạng thái</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Tag color={statusColor} style={{ fontWeight: 600, borderRadius: 4, margin: 0 }}>{statusName}</Tag>
                {item.isNenTangLon && <Tag color="red" style={{ fontWeight: 600, borderRadius: 4, border: "1px solid #ef4444", margin: 0 }}>🔥 NỀN TẢNG SỐ LỚN</Tag>}
              </div>
            </div>
            {item.reviewName && (
              <>
                <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Chuyên viên</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {roles.isDN ? (item.reviewMaCanBo || "—") : item.reviewName}
                  </span>
                </div>
              </>
            )}
            {deadline && (
              <>
                <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Hạn xử lý</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#c2272d" }}>
                    {dayjs(deadline).format("DD/MM/YYYY")}
                  </span>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
            {isOnlyEnterprise ? (
              <EnterpriseAction
                item={item}
                onTransitionClick={(config) => setTransitionModal({ ...config, recordId: item.id })}
                onlyButtons={true}
                onRefresh={handleRefresh}
              />
            ) : (
              item.platformManageTypeId === "NTThongBaoKD" ? (
                <SpecialistAction
                  item={item}
                  roles={roles}
                  onTransitionClick={(config) => setTransitionModal({ ...config, recordId: item.id })}
                  onlyButtons={true}
                  onRefresh={handleRefresh}
                />
              ) : (
                <CucSpecialistAction
                  item={item}
                  roles={roles}
                  onTransitionClick={(config) => setTransitionModal({ ...config, recordId: item.id })}
                  onlyButtons={true}
                  onRefresh={handleRefresh}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* {hasRequest && (
        <Alert
          message="Hồ sơ cần được chỉnh sửa hoặc bổ sung thông tin theo yêu cầu của cơ quan quản lý. Vui lòng kiểm tra tab 'Yêu cầu từ cơ quan' để biết chi tiết."
          type="warning"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />
      )} */}

      <Card
        style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="custom-tabs"
          destroyInactiveTabPane={false}
        />
      </Card>

      {transitionModal && (
        (transitionModal.targetStatus === PlatformStatusConstant.BiTuChoi ||
          transitionModal.targetStatus === PlatformStatusConstant.CanBoSungThongTin ||
          transitionModal.targetStatus === -1) ? (
          <TransitionModal
            open={transitionModal !== null}
            title={transitionModal.title || (transitionModal.targetStatus === PlatformStatusConstant.CanBoSungThongTin ? "Yêu cầu bổ sung thông tin" : "Từ chối hồ sơ đăng ký")}
            form={actionForm}
            onCancel={() => {
              setTransitionModal(null);
              actionForm.resetFields();
            }}
            onFinish={handleTransitionSubmit}
            groupedTemplates={groupedTemplates}
          />
        ) : (
          <PlatformTransitionModal
            modalState={transitionModal}
            submitting={submitting}
            onSubmit={handleTransitionSubmit}
            onCancel={() => setTransitionModal(null)}
          />
        )
      )}
    </div>
  );
};

const PlatformDetailPage: React.FC = () => {
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

export default PlatformDetailPage;
