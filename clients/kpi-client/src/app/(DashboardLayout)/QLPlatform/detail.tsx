"use client";

import React, { useState, useEffect } from "react";
import { Tag, Tabs, Modal, message, Form } from "antd";
import { PlatformManageType } from "@/types/platformManage/dto";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import platformManageService from "@/services/platformManage/platformManage.service";
import { useSelector } from "@/store/hooks";

import TaiLieuDinhKemTab from "./NenTangTrucTuyen/detail/TaiLieuDinhKemTab";
import YeuCauDoanhNghiepTab from "./NenTangTrucTuyen/detail/YeuCauDoanhNghiepTab";

// Sub-components
import DetailInfoTab from "./components/DetailInfoTab";
import PlatformTransitionModal from "./components/PlatformTransitionModal";
import HistoryTab from "./components/HistoryTab";
import ThongTinKySo from "../hop-dong/components/ThongTinKySo";
import TransitionModal from "@/components/shared-components/TransitionModal";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";

// Specialized Views
import EnterpriseAction from "./views/Enterprise/EnterpriseAction";
import SpecialistAction from "./views/Specialist/SpecialistAction";
import CucSpecialistAction from "./views/Specialist/CucSpecialistAction";

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

interface Props {
  item: PlatformManageType | null;
  onClose: () => void;
  onRefresh: () => void;
}

const PlatformDetail: React.FC<Props> = ({ item, onClose, onRefresh }) => {
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles = currentUser?.listRole || authState?.ListRole || [];

  const [activeTab, setActiveTab] = useState("1");
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

  if (!item) return null;

  const hasRole = (roleCodes: string[]) => {
    return userRoles.some((r: string) => roleCodes.includes(r));
  };

  const roles = {
    isCV: hasRole(["ChuyenVienSo", "ChuyenVienCuc", "Admin"]),
    isTP: hasRole(["TruongPhongSo", "TruongPhongCuc", "Admin"]),
    isLD: hasRole(["LanhDaoSo", "LanhDaoCuc", "Admin"]),
    isDN: hasRole(["DoanhNghiep", "Admin"]),
  };

  const statusColor = PlatformStatusConstant.getColor(item.status);
  const statusName = PlatformStatusConstant.getDisplayName(item.status);

  // Xử lý chuyển trạng thái
  const handleTransitionSubmit = async (values: { note: string }) => {
    if (!transitionModal) return;
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
          onRefresh();
          onClose();
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
        onRefresh();
        onClose();
      } else {
        message.error(response.message ?? "Thao tác thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTabContent = (content: React.ReactNode) => (
    <div
      style={{
        height: "560px",
        overflowY: "auto",
        paddingRight: "10px",
        paddingLeft: "4px",
        paddingTop: "8px",
        paddingBottom: "8px",
      }}
    >
      {content}
    </div>
  );

  const isOnlyEnterprise = roles.isDN && !roles.isCV && !roles.isTP && !roles.isLD;

  const getEnterpriseItems = () => [
    {
      key: "1",
      label: "Thông tin hồ sơ",
      children: renderTabContent(<DetailInfoTab item={item} ispOptions={ISP_OPTIONS} />),
    },
    /*
    ...(item.status === PlatformStatusConstant.DeNghiChinhSua ||
    item.status === PlatformStatusConstant.CanBoSungThongTin
      ? [
          {
            key: "request",
            label: <span style={{ color: "#f97316", fontWeight: 600 }}>⚠️ Yêu cầu bổ sung hồ sơ</span>,
            children: renderTabContent(<YeuCauDoanhNghiepTab item={item} />),
          },
        ]
      : []),
    */
    {
      key: "2",
      label: "Tài liệu đính kèm",
      children: renderTabContent(
        <TaiLieuDinhKemTab itemId={item.id} active={activeTab === "2"} />,
      ),
    },
    {
      key: "4",
      label: "Lịch sử thay đổi",
      children: renderTabContent(<HistoryTab platformId={item.id} companyTaxCode={item.companyTaxCode} />),
    },
    {
      key: "signature",
      label: "Thông tin ký số",
      children: renderTabContent(<ThongTinKySo hoSoId={item.id} signerService={platformManageService} />),
    },
    /*
    {
      key: "4",
      label: "Lịch sử thay đổi",
      children: renderTabContent(<LichSuThayDoiTab item={item} />),
    },
    */
  ];

  const getSpecialistItems = () => [
    {
      key: "1",
      label: "Thông tin hồ sơ",
      children: renderTabContent(<DetailInfoTab item={item} ispOptions={ISP_OPTIONS} />),
    },
    {
      key: "2",
      label: "Tài liệu đính kèm",
      children: renderTabContent(
        <TaiLieuDinhKemTab itemId={item.id} active={activeTab === "2"} />,
      ),
    },
    {
      key: "3",
      label: "Phê duyệt & Tác vụ",
      children: renderTabContent(
        item.platformManageTypeId === "NTThongBaoKD" ? (
          <SpecialistAction
            item={item}
            roles={roles}
            onTransitionClick={(config) => setTransitionModal({ ...config, recordId: item.id })}
            onRefresh={onRefresh}
          />
        ) : (
          <CucSpecialistAction
            item={item}
            roles={roles}
            onTransitionClick={(config) => setTransitionModal({ ...config, recordId: item.id })}
            onRefresh={onRefresh}
          />
        ),
      ),
    },
    {
      key: "4",
      label: "Lịch sử thay đổi",
      children: renderTabContent(<HistoryTab platformId={item.id} companyTaxCode={item.companyTaxCode} />),
    },
    {
      key: "signature",
      label: "Thông tin ký số",
      children: renderTabContent(<ThongTinKySo hoSoId={item.id} signerService={platformManageService} />),
    },
    /*
    {
      key: "5",
      label: "Lịch sử thay đổi",
      children: renderTabContent(<LichSuThayDoiTab item={item} />),
    },
    */
  ];

  const items = isOnlyEnterprise ? getEnterpriseItems() : getSpecialistItems();

  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
              Chi tiết hồ sơ nền tảng: {item.name}
            </span>
            <Tag color={statusColor}>{statusName}</Tag>
            {item.isNenTangLon && <Tag color="red" style={{ fontWeight: 600, border: "1px solid #ef4444" }}>🔥 NỀN TẢNG SỐ LỚN</Tag>}
          </div>
        }
        width={1100}
        centered
        onCancel={onClose}
        open={true}
        footer={null}
        styles={{
          body: {
            padding: "8px 24px 16px 24px",
            height: "640px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          style={{ height: "100%" }}
        />
      </Modal>

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
    </>
  );
};

export default PlatformDetail;
