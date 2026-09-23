"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Descriptions, Tag, Divider, Space, Button, Modal, Form, Select, Spin, message } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SolutionOutlined,
  UserAddOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { PlatformManageType } from "@/types/platformManage/dto";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { useSelector } from "@/store/hooks";
import userService from "@/services/user/user.service";
import platformManageService from "@/services/platformManage/platformManage.service";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { CertificateInfo, SignResultItem } from "@/libs/moit-sign/types";

interface CucSpecialistActionProps {
  item: PlatformManageType;
  roles: {
    isCV: boolean;
    isTP: boolean;
    isLD: boolean;
    isDN: boolean;
  };
  onTransitionClick: (config: {
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
    isBanNenTang?: boolean;
  }) => void;
  onlyButtons?: boolean;
  onRefresh?: () => void;
}

const CucSpecialistAction: React.FC<CucSpecialistActionProps> = ({
  item,
  roles,
  onTransitionClick,
  onlyButtons = false,
  onRefresh,
}) => {
  const { isCV, isTP, isLD } = roles;

  // Retrieve current logged in user from Redux store
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.includes("Admin");

  const userOperationCodes: string[] = (currentUser?.menuData ?? [])
    .flatMap((module: any) => module.listMenu ?? [])
    .map((op: any) => op.code as string);
  const hasPermission = (code: string) => isAdmin || userOperationCodes.includes(code);

  // Chuyên viên
  const canActionNhanTuXuLy = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_NHANTUXULY");
  const canActionDuyetDienTu = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_DUYETDIENTU");
  const canActionBoSungCV = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_CV");
  const canActionXinYKien = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_XINYKIEN");
  const canActionTuChoiCV = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_CV");
  const canActionChamDut = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_CHAMDUT");
  const canActionChoDuyetCV = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_CHODUYET_CV");

  // Trưởng phòng
  const canActionPhanCong = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_PHANCONG");
  const canActionReviewThongQua = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_REVIEWTHONGQUA");
  const canActionYeuCauBanGiay = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_YEUCAUBANGIAY");
  const canActionBoSungTP = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_TP");
  const canActionTuChoiTP = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_TP");

  // Lãnh đạo
  const canActionPheDuyet = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_PHEDUYET");
  const canActionBoSungLD = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_BOSUNG_LD");
  const canActionTuChoiLD = hasPermission("PLATFORMBANENTANG_MANAGE_ACTION_TUCHOI_LD");

  const statusColor = PlatformStatusConstant.getColor(item.status);
  const statusName = PlatformStatusConstant.getDisplayName(item.status);

  // States for specialist assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [specialistOptions, setSpecialistOptions] = useState<{ value: string; label: string }[]>([]);
  const [specialistLoading, setSpecialistLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignForm] = Form.useForm<{ chuyenVienId: string }>();

  // States and Handlers for Digital Signature
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [pendingTransition, setPendingTransition] = useState<{
    targetStatus: number;
    title: string;
    isBanNenTang?: boolean;
  } | null>(null);

  const handleActionClick = (config: {
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
    isBanNenTang?: boolean;
  }) => {
    const status = config.targetStatus;
    const isRequireSign = !!currentUser?.isKySo && (
      status === PlatformStatusConstant.DaDuyetDienTu ||
      status === PlatformStatusConstant.DaReview ||
      status === PlatformStatusConstant.DaXacNhan
    );

    if (isRequireSign) {
      setPendingTransition({
        targetStatus: status,
        title: config.title,
        isBanNenTang: config.isBanNenTang,
      });
      setSignIds([item.id]);
      setIsSignModalOpen(true);
    } else {
      onTransitionClick(config);
    }
  };

  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      // 1. Submit signatures to the backend
      const responseSign = await platformManageService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      // 2. Perform the workflow status update
      const targetStatus = pendingTransition ? pendingTransition.targetStatus : PlatformStatusConstant.DaDuyetDienTu;
      const note = "Ký số phê duyệt hồ sơ";
      const isBanNenTangVal = !!(pendingTransition?.isBanNenTang || item.platformManageTypeId !== "NTThongBaoKD");

      const res = isBanNenTangVal
        ? await platformManageService.platformTransition({
          id: item.id,
          targetStatus: targetStatus,
          note: note,
        })
        : await platformManageService.transition({
          id: item.id,
          targetStatus: targetStatus,
          note: note,
        });

      if (res.status) {
        message.success(pendingTransition?.title ? `${pendingTransition.title} thành công` : "Ký số và chuyển trạng thái thành công");
        if (onRefresh) onRefresh();
      } else {
        message.error(res.message ?? "Thao tác thất bại");
      }
    } catch (error: any) {
      message.error(error?.message || "Lỗi trong quá trình ký số và duyệt hồ sơ");
    } finally {
      setIsSignModalOpen(false);
      setPendingTransition(null);
    }
  };

  // Check if dossier is assigned
  const isAssigned = !!(item.reviewId && item.reviewId !== "00000000-0000-0000-0000-000000000000");
  const isCurrentAssignedSpecialist = currentUser && item.reviewId === currentUser.id;
  const canProcess = isCurrentAssignedSpecialist || isAdmin;

  // Load specialists
  const loadSpecialists = useCallback(async () => {
    setSpecialistLoading(true);
    try {
      const response = await userService.getUserByRole({
        pageIndex: 1,
        pageSize: 1000,
        permissionCode: "PLATFORMBANENTANG_MANAGE_ACTION_DUYETDIENTU",
      });
      const itemsList = response?.data?.items || [];
      setSpecialistOptions(
        itemsList
          .filter((u: any) => u?.id)
          .map((u: any) => ({
            value: u.id,
            label: u.maCanBo ? `[${u.maCanBo}] ${u.name}` : (u.name || u.userName || u.email || u.id),
          })),
      );
    } catch {
      message.error("Không tải được danh sách chuyên viên xử lý");
    } finally {
      setSpecialistLoading(false);
    }
  }, [isAdmin, currentUser?.menuData]);

  const handleSelfAssign = async () => {
    if (!currentUser?.id) {
      message.warning("Vui lòng đăng nhập để thực hiện tác vụ");
      return;
    }
    Modal.confirm({
      title: "Xác nhận nhận xử lý",
      content: "Bạn có chắc muốn nhận tự xử lý hồ sơ này?",
      okText: "Nhận xử lý",
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          const response = await platformManageService.platformAssignProcessing(
            [item.id],
            currentUser.id,
            currentUser.name || ""
          );
          if (response.status) {
            message.success("Nhận xử lý hồ sơ thành công");
            if (onRefresh) onRefresh();
          } else {
            message.error(response.message || "Nhận xử lý thất bại");
          }
        } catch {
          message.error("Có lỗi khi nhận xử lý hồ sơ");
        }
      },
    });
  };

  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    assignForm.resetFields();
    await loadSpecialists();
  };

  const handleAssignTask = async (values: { chuyenVienId: string }) => {
    setAssignSubmitting(true);
    try {
      const selectedSpecialist = specialistOptions.find(o => o.value === values.chuyenVienId);
      const specialistName = selectedSpecialist ? selectedSpecialist.label.split(" (")[0] : "";
      const response = await platformManageService.platformAssignProcessing(
        [item.id],
        values.chuyenVienId,
        specialistName
      );

      if (response.status) {
        message.success("Phân công xử lý thành công");
        setIsAssignModalOpen(false);
        if (onRefresh) onRefresh();
      } else {
        message.error(response.message || "Phân công xử lý thất bại");
      }
    } catch {
      message.error("Phân công xử lý thất bại");
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleToggleBigPlatform = () => {
    const isBig = !item.isNenTangLon;
    Modal.confirm({
      title: isBig ? "Xác nhận đánh dấu nền tảng lớn" : "Xác nhận hủy nền tảng lớn",
      content: (
        <div>
          <p>Bạn có chắc muốn {isBig ? "đánh dấu nền tảng này là nền tảng số lớn" : "hủy đánh dấu nền tảng lớn"}?</p>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Nhập lý do/ghi chú (nếu có):</span>
            <textarea
              id="big-platform-note"
              className="ant-input"
              rows={3}
              placeholder="Nhập ghi chú hoặc căn cứ pháp lý..."
              style={{ marginTop: 6, width: "100%", borderRadius: "6px" }}
            />
          </div>
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        const noteEl = document.getElementById("big-platform-note") as HTMLTextAreaElement;
        const note = noteEl?.value || "";
        try {
          const response = await platformManageService.markBigPlatform({
            id: item.id,
            isBig: isBig,
            note: note,
          });
          if (response.status) {
            message.success(isBig ? "Đánh dấu nền tảng lớn thành công" : "Hủy đánh dấu nền tảng lớn thành công");
            if (onRefresh) onRefresh();
          } else {
            message.error(response.message || "Thao tác thất bại");
          }
        } catch {
          message.error("Có lỗi xảy ra khi thực hiện thao tác");
        }
      },
    });
  };

  const baseButtonStyle = {
    fontWeight: 600,
    borderRadius: "4px",
    height: "38px",
    display: "inline-flex",
    alignItems: "center",
    boxShadow: "none",
    color: "#ffffff",
  };

  const successButtonStyle = { ...baseButtonStyle, backgroundColor: "#16a34a", borderColor: "#16a34a" };
  const warningButtonStyle = { ...baseButtonStyle, backgroundColor: "#d97706", borderColor: "#d97706" };
  const dangerButtonStyle = { ...baseButtonStyle, backgroundColor: "#c2272d", borderColor: "#c2272d" };
  const infoButtonStyle = { ...baseButtonStyle, backgroundColor: "#2563eb", borderColor: "#2563eb" };
  const opinionButtonStyle = { ...baseButtonStyle, backgroundColor: "#722ed1", borderColor: "#722ed1" };

  const getActionButtons = () => {
    const buttons = [];

    if (!roles.isDN) {
      if (item.isNenTangLon) {
        buttons.push(
          <Button
            key="unmark-big"
            type="default"
            danger
            style={{ ...baseButtonStyle, color: "#ef4444", borderColor: "#ef4444", backgroundColor: "transparent" }}
            onClick={handleToggleBigPlatform}
          >
            Hủy nền tảng lớn
          </Button>
        );
      } else {
        buttons.push(
          <Button
            key="mark-big"
            type="default"
            style={{ ...baseButtonStyle, color: "#2563eb", borderColor: "#2563eb", backgroundColor: "transparent" }}
            onClick={handleToggleBigPlatform}
          >
            Đánh dấu nền tảng lớn
          </Button>
        );
      }
    }

    // Chờ duyệt (1)
    if (item.status === PlatformStatusConstant.ChoDuyet || item.status === PlatformStatusConstant.DeNghiChinhSua) {
      if (!isAssigned) {
        if (canActionPhanCong) buttons.push(<Button key="assign" type="primary" icon={<UserAddOutlined />} style={infoButtonStyle} onClick={handleOpenAssignModal}>Phân công</Button>);
        if (canActionNhanTuXuLy) buttons.push(<Button key="self-assign" type="primary" icon={<CheckCircleOutlined />} style={successButtonStyle} onClick={handleSelfAssign}>Nhận tự xử lý</Button>);
      } else {
        if (canProcess) {
          if (canActionDuyetDienTu) {
            buttons.push(
              <Button key="duyet" type="primary" icon={<CheckCircleOutlined />} style={successButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.DaDuyetDienTu, title: "Duyệt điện tử hồ sơ", buttonColor: "primary", isBanNenTang: true })}>Duyệt điện tử</Button>
            );
          }
          if (canActionBoSungCV) {
            buttons.push(
              <Button key="bosung" type="primary" icon={<ExclamationCircleOutlined />} style={warningButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.CanBoSungThongTin, title: "Yêu cầu bổ sung thông tin", buttonColor: "warning", isBanNenTang: true })}>Yêu cầu bổ sung</Button>
            );
          }
          if (canActionXinYKien) {
            buttons.push(
              <Button key="xinykien" type="primary" icon={<CommentOutlined />} style={opinionButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.DangXinYKien, title: "Xin ý kiến phối hợp", buttonColor: "primary", isBanNenTang: true })}>Xin ý kiến phối hợp</Button>
            );
          }
        }
        if (canActionPhanCong) buttons.push(<Button key="re-assign" type="primary" icon={<UserAddOutlined />} style={warningButtonStyle} onClick={handleOpenAssignModal}>Phân công lại</Button>);
      }
    }

    // Đang xin ý kiến (25)
    if (item.status === PlatformStatusConstant.DangXinYKien && (!isAssigned || canProcess)) {
      if (canActionDuyetDienTu) {
        buttons.push(
          <Button key="duyet" type="primary" icon={<CheckCircleOutlined />} style={successButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.DaDuyetDienTu, title: "Duyệt điện tử hồ sơ", buttonColor: "primary", isBanNenTang: true })}>Duyệt điện tử</Button>
        );
      }
      if (canActionBoSungCV) {
        buttons.push(
          <Button key="bosung" type="primary" icon={<ExclamationCircleOutlined />} style={warningButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.CanBoSungThongTin, title: "Yêu cầu bổ sung thông tin", buttonColor: "warning", isBanNenTang: true })}>Yêu cầu bổ sung</Button>
        );
      }
    }

    // Đã duyệt điện tử (4)
    if (item.status === PlatformStatusConstant.DaDuyetDienTu || item.status === PlatformStatusConstant.CanBanGiay) {
      const isOwnSpecialist = isCurrentAssignedSpecialist && !isAdmin;
      if (!isOwnSpecialist) {
        if (canActionReviewThongQua && item.reviewId) {
          buttons.push(
            <Button key="review" type="primary" icon={<CheckCircleOutlined />} style={successButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.DaReview, title: "Xác nhận Review (Trình Lãnh đạo Cục phê duyệt)", buttonColor: "primary", isBanNenTang: true })}>Review thông qua</Button>
          );
        }
        // if (canActionYeuCauBanGiay && item.status !== PlatformStatusConstant.CanBanGiay) {
        //   buttons.push(
        //     <Button key="giay" type="primary" icon={<SolutionOutlined />} style={infoButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.CanBanGiay, title: "Yêu cầu nộp bản giấy đối chiếu", buttonColor: "warning", isBanNenTang: true })}>Yêu cầu bản giấy</Button>
        //   );
        // }
        if (canActionBoSungTP) {
          buttons.push(
            <Button key="bosung" type="primary" icon={<ExclamationCircleOutlined />} style={warningButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.CanBoSungThongTin, title: "Yêu cầu bổ sung thông tin", buttonColor: "warning", isBanNenTang: true })}>Yêu cầu bổ sung</Button>
          );
        }
      }
    }

    // Đã review (26)
    if (item.status === PlatformStatusConstant.DaReview) {
      const isOwnSpecialist = isCurrentAssignedSpecialist && !isAdmin;
      if (!isOwnSpecialist) {
        if (canActionPheDuyet && item.reviewId) {
          buttons.push(
            <Button key="pheduyet" type="primary" icon={<CheckCircleOutlined />} style={successButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.DaXacNhan, title: "PHÊ DUYỆT CHÍNH THỨC & CẤP MÃ NỀN TẢNG TMĐT", buttonColor: "primary", isBanNenTang: true })}>Duyệt kết thúc</Button>
          );
        }
        if (canActionBoSungLD) {
          buttons.push(
            <Button key="bosung" type="primary" icon={<ExclamationCircleOutlined />} style={warningButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.CanBoSungThongTin, title: "Yêu cầu bổ sung thông tin", buttonColor: "warning", isBanNenTang: true })}>Yêu cầu bổ sung</Button>
          );
        }
      }
    }

    const canRejectAny = canActionTuChoiCV || canActionTuChoiTP || canActionTuChoiLD;
    const isNotTerminal = item.status !== PlatformStatusConstant.DaXacNhan &&
      item.status !== PlatformStatusConstant.BiTuChoi &&
      item.status !== PlatformStatusConstant.TamLuu;

    if (canRejectAny && isNotTerminal) {
      buttons.push(
        <Button key="tuchoi" type="primary" icon={<CloseCircleOutlined />} style={dangerButtonStyle} onClick={() => handleActionClick({ targetStatus: PlatformStatusConstant.BiTuChoi, title: "Từ chối hồ sơ đăng ký", buttonColor: "danger", isBanNenTang: true })}>Từ chối</Button>
      );
    }

    return buttons;
  };

  if (onlyButtons) {
    const btns = getActionButtons();
    return (
      <>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {btns.length > 0 ? btns : <span style={{ color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>Không có tác vụ khả dụng.</span>}
          <Modal title="Phân công chuyên viên" open={isAssignModalOpen} onCancel={() => setIsAssignModalOpen(false)} onOk={() => assignForm.submit()} confirmLoading={assignSubmitting} destroyOnClose centered>
            <Spin spinning={specialistLoading}>
              <Form form={assignForm} onFinish={handleAssignTask} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item name="chuyenVienId" label="Chọn chuyên viên xử lý" rules={[{ required: true, message: "Vui lòng chọn chuyên viên" }]}>
                  <Select placeholder="-- Chọn chuyên viên --" options={specialistOptions} showSearch optionFilterProp="label" style={{ width: "100%" }} />
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
        </div>
        <DigitalSignatureModal
          ids={signIds}
          open={isSignModalOpen}
          onCancel={() => {
            setIsSignModalOpen(false);
            setPendingTransition(null);
          }}
          onSignSuccess={handleSignSuccess}
          signerService={platformManageService}
        />
      </>
    );
  }

  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ background: "#ffffff", borderRadius: 8, padding: "16px 20px", border: "1px solid #e2e8f0", borderLeft: "4px solid #10b981", marginBottom: 20 }}>
        <Descriptions title={<span style={{ color: "#1e293b", fontWeight: 600, fontSize: "14px" }}>Trạng thái xử lý hiện tại</span>} column={1} size="small" labelStyle={{ fontWeight: 500, color: "#475569", width: "180px" }}>
          <Descriptions.Item label="Trạng thái hiện tại"><Tag color={statusColor} style={{ fontSize: 13, fontWeight: 500 }}>{statusName}</Tag></Descriptions.Item>
          {isAssigned && <Descriptions.Item label="Chuyên viên xử lý"><span style={{ fontWeight: 600, color: "#0f172a" }}>{item.reviewMaCanBo || item.reviewName}</span></Descriptions.Item>}
        </Descriptions>
      </div>
      <Modal title="Phân công chuyên viên" open={isAssignModalOpen} onCancel={() => setIsAssignModalOpen(false)} onOk={() => assignForm.submit()} confirmLoading={assignSubmitting} destroyOnClose centered>
        <Spin spinning={specialistLoading}>
          <Form form={assignForm} onFinish={handleAssignTask} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="chuyenVienId" label="Chọn chuyên viên xử lý" rules={[{ required: true, message: "Vui lòng chọn chuyên viên" }]}>
              <Select placeholder="-- Chọn chuyên viên --" options={specialistOptions} showSearch optionFilterProp="label" style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <DigitalSignatureModal
        ids={signIds}
        open={isSignModalOpen}
        onCancel={() => {
          setIsSignModalOpen(false);
          setPendingTransition(null);
        }}
        onSignSuccess={handleSignSuccess}
        signerService={platformManageService}
      />
    </div>
  );
};

export default CucSpecialistAction;
