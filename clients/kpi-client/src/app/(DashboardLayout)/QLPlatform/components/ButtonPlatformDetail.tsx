"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Modal, Form, Select, Spin, message } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
  EditOutlined,
  SendOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PlatformManageType } from "@/types/platformManage/dto";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { useSelector } from "@/store/hooks";
import userService from "@/services/user/user.service";
import platformManageService from "@/services/platformManage/platformManage.service";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import { CertificateInfo, SignResultItem } from "@/libs/moit-sign/types";
import TransitionModal from "@/components/shared-components/TransitionModal";
import PlatformTransitionModal from "./PlatformTransitionModal";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";

interface ButtonPlatformDetailProps {
  item: PlatformManageType;
  loadDetail: () => void;
}

export default function ButtonPlatformDetail({ item, loadDetail }: ButtonPlatformDetailProps) {
  const router = useRouter();

  // State quản lý chuyển trạng thái giống NenTangTrucTuyen/detail/page.tsx
  const [transitionModal, setTransitionModal] = useState<{
    recordId: string;
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
    isBanNenTang?: boolean;
  } | null>(null);
  const [actionForm] = Form.useForm<{ note: string }>();
  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Phân công chuyên viên
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [specialistOptions, setSpecialistOptions] = useState<{ value: string; label: string }[]>([]);
  const [specialistLoading, setSpecialistLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignForm] = Form.useForm<{ chuyenVienId: string }>();

  // Ký số
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [pendingTransition, setPendingTransition] = useState<{
    targetStatus: number;
    title: string;
  } | null>(null);

  // Auth và Roles
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.includes("Admin");

  // Xây dựng operationMap động từ menuData của Cán bộ
  const operationMap = useMemo(() => {
    const codes = (currentUser?.menuData.filter((x: any) => x.code === "NENTANGTRUCTUYEN") ?? [])
      .flatMap((module: any) => module.listMenu ?? [])
      .map((op: any) => op.code as string);

    // Chuẩn hóa loại bỏ các prefix để code check ngắn gọn hơn
    const normalizedCodes = codes.map((code: string) => {
      if (!code) return "";
      return code;
    });

    return Object.fromEntries(normalizedCodes.map((code: string) => [code, true]));
  }, [currentUser]);
  console.log("operationMap", operationMap)
  const hasRole = (roleCodes: string[]) => {
    return userRoles.some((r: string) => roleCodes.includes(r));
  };

  const roles = useMemo(() => ({
    isCV: hasRole(["ChuyenVienSo", "ChuyenVienCuc", "Admin"]),
    isTP: hasRole(["TruongPhongSo", "TruongPhongCuc", "Admin"]),
    isLD: hasRole(["LanhDaoSo", "LanhDaoCuc", "Admin"]),
    isDN: hasRole(["DoanhNghiep", "Admin"]),
  }), [userRoles]);

  // Load mẫu câu trả lời
  useEffect(() => {
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
    loadGroupedTemplates();
  }, []);

  const isAssigned = !!(item.reviewId && item.reviewId !== "00000000-0000-0000-0000-000000000000");
  const isCurrentAssignedSpecialist = currentUser && item.reviewId === currentUser.id;
  const canProcess = isCurrentAssignedSpecialist || isAdmin;
  const isOwnSpecialist = isCurrentAssignedSpecialist && !isAdmin;

  // Gọi API chuyển trạng thái
  const handleTransitionSubmit = async (values: { note: string }) => {
    if (!transitionModal) return;
    setSubmitting(true);
    try {
      if (transitionModal.targetStatus === -1) {
        // Đánh dấu nền tảng lớn
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
          loadDetail();
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
        loadDetail();
      } else {
        message.error(response.message ?? "Thao tác thất bại");
      }
    } catch (error: any) {
      message.error(error.message ?? "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionClick = (config: {
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
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
      });
      setSignIds([item.id]);
      setIsSignModalOpen(true);
    } else {
      setTransitionModal({ ...config, recordId: item.id });
    }
  };

  // Ký số thành công
  const handleSignSuccess = async (result: SignResultItem[], certificate: CertificateInfo) => {
    try {
      const responseSign = await platformManageService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      const targetStatus = pendingTransition ? pendingTransition.targetStatus : PlatformStatusConstant.DaDuyetDienTu;
      const note = "Ký số phê duyệt hồ sơ";
      const isBanNenTangVal = item.platformManageTypeId !== "NTThongBaoKD";

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
        loadDetail();
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

  // Load chuyên viên để phân công
  const loadSpecialists = useCallback(async () => {
    setSpecialistLoading(true);
    try {
      let permCode = "PLATFORM_MANAGE_ACTION_DUYETDIENTU";
      if (item.platformManageTypeId !== "NTThongBaoKD" && operationMap["ACTION_PHANCONG"]) {
        permCode = "PLATFORMBANENTANG_MANAGE_ACTION_DUYETDIENTU";
      }

      const response = await userService.getUserByRole({
        pageIndex: 1,
        pageSize: 1000,
        permissionCode: permCode,
      });
      const itemsList = response?.data?.items || [];
      setSpecialistOptions(
        itemsList
          .filter((u: any) => u?.id)
          .map((u: any) => ({
            value: u.id,
            label: u.maCanBo ? `[${u.maCanBo}] ${u.name}` : (u.name || u.userName || u.email || u.id),
          }))
      );
    } catch {
      message.error("Không tải được danh sách chuyên viên xử lý");
    } finally {
      setSpecialistLoading(false);
    }
  }, [item.platformManageTypeId, operationMap]);

  // Tự nhận xử lý
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
          const response = await platformManageService.assignProcessing(
            [item.id],
            currentUser.id,
            currentUser.name || ""
          );
          if (response.status) {
            message.success("Nhận xử lý hồ sơ thành công");
            loadDetail();
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

  // Gửi phân công
  const handleAssignTask = async (values: { chuyenVienId: string }) => {
    setAssignSubmitting(true);
    try {
      const selectedSpecialist = specialistOptions.find((o) => o.value === values.chuyenVienId);
      const specialistName = selectedSpecialist ? selectedSpecialist.label.split(" (")[0] : "";
      const response = await platformManageService.assignProcessing(
        [item.id],
        values.chuyenVienId,
        specialistName
      );

      if (response.status) {
        message.success("Phân công xử lý thành công");
        setIsAssignModalOpen(false);
        loadDetail();
      } else {
        message.error(response.message || "Phân công xử lý thất bại");
      }
    } catch {
      message.error("Phân công xử lý thất bại");
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Đánh dấu nền tảng lớn/nhỏ
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
              id="big-platform-note-detail"
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
        const noteEl = document.getElementById("big-platform-note-detail") as HTMLTextAreaElement;
        const note = noteEl?.value || "";
        try {
          const response = await platformManageService.markBigPlatform({
            id: item.id,
            isBig: isBig,
            note: note,
          });
          if (response.status) {
            message.success(isBig ? "Đánh dấu nền tảng lớn thành công" : "Hủy đánh dấu nền tảng lớn thành công");
            loadDetail();
          } else {
            message.error(response.message || "Thao tác thất bại");
          }
        } catch {
          message.error("Có lỗi xảy ra khi thực hiện thao tác");
        }
      },
    });
  };

  // Styles cho nút bấm
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

  // Xây dựng danh sách các hành động
  const getActionButtons = () => {
    const buttons: React.ReactNode[] = [];

    // --- A. Dành cho Doanh Nghiệp (Không qua operationMap) ---
    if (roles.isDN && !roles.isCV && !roles.isTP && !roles.isLD) {
      if (item.status === PlatformStatusConstant.TamLuu || item.status === PlatformStatusConstant.CanBoSungThongTin) {
        buttons.push(
          <Button
            key="dn-edit"
            type="primary"
            icon={<EditOutlined />}
            style={infoButtonStyle}
            onClick={() =>
              router.push(
                item.platformManageTypeId === "NTThongBaoKD"
                  ? `/QLPlatform/NenTangTrucTuyen/createOrUpdate?id=${item.id}`
                  : `/QLPlatform/create?id=${item.id}&type=${item.platformManageTypeId}`
              )
            }
          >
            Chỉnh sửa hồ sơ (Mới)
          </Button>,
          <Button
            key="dn-submit"
            type="primary"
            icon={<SendOutlined />}
            style={successButtonStyle}
            onClick={() =>
              setTransitionModal({
                recordId: item.id,
                targetStatus: PlatformStatusConstant.ChoDuyet,
                title: "Gửi hồ sơ đăng ký lên hệ thống",
                buttonColor: "primary",
              })
            }
          >
            Gửi duyệt hồ sơ (Mới)
          </Button>
        );
      }

      if (item.status === PlatformStatusConstant.DaXacNhan) {
        buttons.push(
          <Button
            key="dn-edit-confirmed"
            type="primary"
            icon={<EditOutlined />}
            style={infoButtonStyle}
            onClick={() =>
              router.push(
                item.platformManageTypeId === "NTThongBaoKD"
                  ? `/QLPlatform/NenTangTrucTuyen/createOrUpdate?id=${item.id}`
                  : `/QLPlatform/create?id=${item.id}&type=${item.platformManageTypeId}`
              )
            }
          >
            Chỉnh sửa hồ sơ (Mới)
          </Button>,
          <Button
            key="dn-termination"
            type="primary"
            icon={<StopOutlined />}
            style={dangerButtonStyle}
            onClick={() =>
              setTransitionModal({
                recordId: item.id,
                targetStatus: PlatformStatusConstant.DeNghiChamDutDangKy,
                title: "Gửi đề nghị chấm dứt hoạt động nền tảng",
                buttonColor: "danger",
              })
            }
          >
            Đề nghị chấm dứt (Mới)
          </Button>
        );
      }

      return buttons;
    }

    // --- B. Dành cho Cán Bộ (Kiểm tra qua operationMap động) ---
    if (!roles.isDN) {
      // 1. Đánh dấu nền tảng lớn
      if (item.isNenTangLon) {
        buttons.push(
          <Button
            key="unmark-big"
            type="default"
            danger
            style={{ ...baseButtonStyle, color: "#ef4444", borderColor: "#ef4444", backgroundColor: "transparent" }}
            onClick={handleToggleBigPlatform}
          >
            Hủy nền tảng lớn (Mới)
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
            Đánh dấu nền tảng lớn (Mới)
          </Button>
        );
      }
    }

    // 2. Nhận xử lý / Phân công
    if (item.status === PlatformStatusConstant.ChoDuyet || item.status === PlatformStatusConstant.DeNghiChinhSua) {
      if (!isAssigned) {
        if (operationMap["ACTION_PHANCONG"]) {
          buttons.push(
            <Button key="assign" type="primary" icon={<UserAddOutlined />} style={infoButtonStyle} onClick={handleOpenAssignModal}>
              Phân công (Mới)
            </Button>
          );
        }
        if (operationMap["ACTION_NHANTUXULY"]) {
          buttons.push(
            <Button key="self-assign" type="primary" icon={<CheckCircleOutlined />} style={successButtonStyle} onClick={handleSelfAssign}>
              Nhận tự xử lý (Mới)
            </Button>
          );
        }
      } else {
        if (canProcess) {
          if (operationMap["ACTION_DUYETDIENTU"]) {
            buttons.push(
              <Button
                key="duyet"
                type="primary"
                icon={<CheckCircleOutlined />}
                style={successButtonStyle}
                onClick={() =>
                  handleActionClick({
                    targetStatus: PlatformStatusConstant.DaDuyetDienTu,
                    title: "Duyệt điện tử hồ sơ",
                    buttonColor: "primary",
                  })
                }
              >
                {item.platformManageTypeId === "NTThongBaoKD" ? "Trình trưởng phòng (Mới)" : "Duyệt điện tử hồ sơ (Mới)"}
              </Button>
            );
          }
          if (operationMap["ACTION_BOSUNG_CV"]) {
            buttons.push(
              <Button
                key="bosung"
                type="primary"
                icon={<ExclamationCircleOutlined />}
                style={warningButtonStyle}
                onClick={() =>
                  handleActionClick({
                    targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                    title: "Yêu cầu bổ sung thông tin",
                    buttonColor: "warning",
                  })
                }
              >
                Yêu cầu bổ sung (Mới)
              </Button>
            );
          }
        }
        if (operationMap["ACTION_PHANCONG"]) {
          buttons.push(
            <Button key="re-assign" type="primary" icon={<UserAddOutlined />} style={warningButtonStyle} onClick={handleOpenAssignModal}>
              Phân công lại (Mới)
            </Button>
          );
        }
      }
    }

    // 3. Đang xin ý kiến
    if (item.status === PlatformStatusConstant.DangXinYKien && (!isAssigned || canProcess)) {
      if (operationMap["ACTION_DUYETDIENTU"]) {
        buttons.push(
          <Button
            key="duyet-opinion"
            type="primary"
            icon={<CheckCircleOutlined />}
            style={successButtonStyle}
            onClick={() =>
              handleActionClick({
                targetStatus: PlatformStatusConstant.DaDuyetDienTu,
                title: "Duyệt điện tử hồ sơ",
                buttonColor: "primary",
              })
            }
          >
            Duyệt điện tử (Mới)
          </Button>
        );
      }
      if (operationMap["ACTION_BOSUNG_CV"]) {
        buttons.push(
          <Button
            key="bosung-opinion"
            type="primary"
            icon={<ExclamationCircleOutlined />}
            style={warningButtonStyle}
            onClick={() =>
              handleActionClick({
                targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                title: "Yêu cầu bổ sung thông tin",
                buttonColor: "warning",
              })
            }
          >
            Yêu cầu bổ sung (Mới)
          </Button>
        );
      }
    }

    // 4. Đã duyệt điện tử
    const canActionReviewThongQua = operationMap["ACTION_REVIEWTHONGQUA"];
    const canActionDuyetDienTu = operationMap["ACTION_DUYETDIENTU"];
    const canActionPheDuyet = operationMap["ACTION_PHEDUYET"];
    const canActionBoSungTP = operationMap["ACTION_BOSUNG_TP"];

    if (
      item.status === PlatformStatusConstant.DaDuyetDienTu ||
      (item.platformManageTypeId === "NTThongBaoKD" &&
        ((canActionReviewThongQua && item.status === PlatformStatusConstant.DaDuyetDienTu) ||
          (canActionDuyetDienTu &&
            (canActionReviewThongQua || canActionPheDuyet) &&
            (item.status === PlatformStatusConstant.ChoDuyet || item.status === PlatformStatusConstant.DeNghiChinhSua))))
    ) {
      if (!isOwnSpecialist) {
        if (canActionReviewThongQua && item.reviewId) {
          buttons.push(
            <Button
              key="review-tp"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={successButtonStyle}
              onClick={() =>
                handleActionClick({
                  targetStatus: PlatformStatusConstant.DaReview,
                  title: "Xác nhận Review (Trình Lãnh đạo Sở phê duyệt)",
                  buttonColor: "primary",
                })
              }
            >
              Trình lãnh đạo sở (Mới)
            </Button>
          );
          if (canActionPheDuyet) {
            buttons.push(
              <Button
                key="pheduyet-tp"
                type="primary"
                icon={<CheckCircleOutlined />}
                style={successButtonStyle}
                onClick={() =>
                  handleActionClick({
                    targetStatus: PlatformStatusConstant.DaXacNhan,
                    title: "PHÊ DUYỆT CHÍNH THỨC & CẤP MÃ NỀN TẢNG TMĐT",
                    buttonColor: "primary",
                  })
                }
              >
                Duyệt kết thúc (Mới)
              </Button>
            );
          }
        }
        if (canActionBoSungTP) {
          buttons.push(
            <Button
              key="bosung-tp"
              type="primary"
              icon={<ExclamationCircleOutlined />}
              style={warningButtonStyle}
              onClick={() =>
                handleActionClick({
                  targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                  title: "Yêu cầu bổ sung thông tin",
                  buttonColor: "warning",
                })
              }
            >
              Yêu cầu bổ sung (Mới)
            </Button>
          );
        }
      } else {
        if (canActionPheDuyet && (item.status === PlatformStatusConstant.ChoDuyet || item.status === PlatformStatusConstant.DeNghiChinhSua)) {
          buttons.push(
            <Button
              key="review-cv-own"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={successButtonStyle}
              onClick={() =>
                handleActionClick({
                  targetStatus: PlatformStatusConstant.DaReview,
                  title: "Xác nhận Review (Trình Lãnh đạo sở phê duyệt)",
                  buttonColor: "primary",
                })
              }
            >
              Trình lãnh đạo sở (Mới)
            </Button>
          );
        }
      }
    }

    // 5. Đã review
    const canActionBoSungLD = operationMap["ACTION_BOSUNG_LD"];

    if (
      item.status === PlatformStatusConstant.DaReview ||
      (item.platformManageTypeId === "NTThongBaoKD" &&
        ((canActionPheDuyet && item.status === PlatformStatusConstant.DaReview) ||
          (canActionDuyetDienTu &&
            canActionPheDuyet &&
            (item.status === PlatformStatusConstant.ChoDuyet || item.status === PlatformStatusConstant.DeNghiChinhSua))))
    ) {
      if (!isOwnSpecialist) {
        if (
          canActionPheDuyet &&
          item.reviewId &&
          ((item.status === PlatformStatusConstant.DaReview && !canActionReviewThongQua) ||
            ((item.status === PlatformStatusConstant.ChoDuyet || item.status === PlatformStatusConstant.DeNghiChinhSua) &&
              canActionDuyetDienTu))
        ) {
          buttons.push(
            <Button
              key="pheduyet-ld"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={successButtonStyle}
              onClick={() =>
                handleActionClick({
                  targetStatus: PlatformStatusConstant.DaXacNhan,
                  title: "PHÊ DUYỆT CHÍNH THỨC & CẤP MÃ NỀN TẢNG TMĐT",
                  buttonColor: "primary",
                })
              }
            >
              Duyệt kết thúc (Mới)
            </Button>
          );
        }
        if (canActionBoSungLD) {
          buttons.push(
            <Button
              key="bosung-ld"
              type="primary"
              icon={<ExclamationCircleOutlined />}
              style={warningButtonStyle}
              onClick={() =>
                handleActionClick({
                  targetStatus: PlatformStatusConstant.CanBoSungThongTin,
                  title: "Yêu cầu bổ sung thông tin",
                  buttonColor: "warning",
                })
              }
            >
              Yêu cầu bổ sung (Mới)
            </Button>
          );
        }
      } else {
        if (
          item.platformManageTypeId === "NTThongBaoKD" &&
          canActionPheDuyet &&
          (item.status === PlatformStatusConstant.ChoDuyet || item.status === PlatformStatusConstant.DeNghiChinhSua)
        ) {
          buttons.push(
            <Button
              key="pheduyet-cv-own"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={successButtonStyle}
              onClick={() =>
                handleActionClick({
                  targetStatus: PlatformStatusConstant.DaXacNhan,
                  title: "PHÊ DUYỆT CHÍNH THỨC & CẤP MÃ NỀN TẢNG TMĐT",
                  buttonColor: "primary",
                })
              }
            >
              Duyệt kết thúc (Mới)
            </Button>
          );
        }
      }
    }

    // 6. Từ chối
    const canActionTuChoiCV = operationMap["ACTION_TUCHOI_CV"];
    const canActionTuChoiTP = operationMap["ACTION_TUCHOI_TP"];
    const canActionTuChoiLD = operationMap["ACTION_TUCHOI_LD"];
    const canRejectAny = canActionTuChoiCV || canActionTuChoiTP || canActionTuChoiLD;
    const isNotTerminal =
      item.status !== PlatformStatusConstant.DaXacNhan &&
      item.status !== PlatformStatusConstant.BiTuChoi &&
      item.status !== PlatformStatusConstant.TamLuu &&
      item.status !== PlatformStatusConstant.DeNghiChamDutDangKy &&
      item.status !== PlatformStatusConstant.DaChamDutDangKy;

    if (canRejectAny && isNotTerminal) {
      buttons.push(
        <Button
          key="tuchoi"
          type="primary"
          icon={<CloseCircleOutlined />}
          style={dangerButtonStyle}
          onClick={() =>
            handleActionClick({
              targetStatus: PlatformStatusConstant.BiTuChoi,
              title: item.status === PlatformStatusConstant.DeNghiChinhSua ? "Từ chối đề nghị chỉnh sửa" : "Từ chối hồ sơ đăng ký",
              buttonColor: "danger",
            })
          }
        >
          {item.status === PlatformStatusConstant.DeNghiChinhSua ? "Từ chối đề nghị chỉnh sửa (Mới)" : "Từ chối (Mới)"}
        </Button>
      );
    }

    // 7. Đề nghị chấm dứt đăng ký
    if (item.status === PlatformStatusConstant.DeNghiChamDutDangKy) {
      if (operationMap["ACTION_CHAMDUT"]) {
        buttons.push(
          <Button
            key="confirm-termination"
            type="primary"
            icon={<CheckCircleOutlined />}
            style={successButtonStyle}
            onClick={() =>
              handleActionClick({
                targetStatus: PlatformStatusConstant.DaChamDutDangKy,
                title: "Xác nhận chấm dứt hoạt động nền tảng",
                buttonColor: "primary",
              })
            }
          >
            Xác nhận chấm dứt (Mới)
          </Button>
        );
      }
      const canRejectTermination =
        operationMap["ACTION_TUCHOI_CV"] ||
        operationMap["ACTION_TUCHOI_TP"] ||
        operationMap["ACTION_TUCHOI_LD"];
      if (canRejectTermination) {
        buttons.push(
          <Button
            key="reject-termination"
            type="primary"
            icon={<CloseCircleOutlined />}
            style={dangerButtonStyle}
            onClick={() =>
              handleActionClick({
                targetStatus: PlatformStatusConstant.BiTuChoi,
                title: "Từ chối đề nghị chấm dứt",
                buttonColor: "danger",
              })
            }
          >
            Từ chối đề nghị (Mới)
          </Button>
        );
      }
    }

    return buttons;
  };

  const btns = getActionButtons();

  return (
    <>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        {btns.length > 0 ? (
          btns
        ) : (
          <span style={{ color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>Không có tác vụ khả dụng (Mới).</span>
        )}
      </div>

      {/* Modal Phân công */}
      <Modal
        title="Phân công chuyên viên (Mới)"
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={() => assignForm.submit()}
        confirmLoading={assignSubmitting}
        destroyOnClose
        centered
      >
        <Spin spinning={specialistLoading}>
          <Form form={assignForm} onFinish={handleAssignTask} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="chuyenVienId" label="Chọn chuyên viên xử lý" rules={[{ required: true, message: "Vui lòng chọn chuyên viên" }]}>
              <Select placeholder="-- Chọn chuyên viên --" options={specialistOptions} showSearch optionFilterProp="label" style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Modal Ký số */}
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

      {/* Modal Chuyển Trạng Thái phản hồi (Từ chối, Bổ sung...) */}
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
}
