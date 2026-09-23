import ConstractStatusConstant from '@/constants/ConstractStatusConstant';
import ContractActionConstant from '@/constants/ContractActionConstant';
import { useSelector } from '@/store/hooks';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Button, Form, message, Modal, Select } from 'antd';
import * as Icons from '@ant-design/icons';
import userService from '@/services/user/user.service';
import RoleConstant from '@/constants/RoleConstant';
import { DropdownOption } from '@/types/general';
import { AuthenticationContractType } from '@/types/authenticationContract/dto';
import authenticationContractService from '@/services/authenticationContract/authenticationContract.service';
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import TransitionModal from "@/components/shared-components/TransitionModal";
import { CertificateInfo } from "@/libs/moit-sign";
import { SignResultItem } from "@/libs/moit-sign/types";

const getAntdIconByName = (iconString?: string) => {
  if (!iconString) return <Icons.SettingOutlined />;
  const match = iconString.match(/<(\w+)\s*\/>/);
  const iconName = match ? match[1] : null;
  if (!iconName) return <Icons.SettingOutlined />;
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent /> : <Icons.QuestionOutlined />;
};

const ButtonDetail = ({ item, loadDetail }: { item: AuthenticationContractType | null, loadDetail: () => void }) => {
  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userOperations =
    currentUser?.menuData?.find(
      (item: any) => item.code === "HOPDONG"
    )?.listMenu || [];

  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isDoanhNghiep = userRoles.includes(RoleConstant.DoanhNghiep);

  const operationMap = Object.fromEntries(
    userOperations.map((op: any) => [op.code, op])
  );

  // States cho modal Phân công chuyên viên
  const [assignForm] = Form.useForm();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [specialistOptions, setSpecialistOptions] = useState<DropdownOption[]>([]);
  const [specialistLoading, setSpecialistLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState<boolean>(false);

  // States cho Ký Số
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [currentSignAction, setCurrentSignAction] = useState<number | null>(null);
  const [isSignDoanhNghiep, setIsSignDoanhNghiep] = useState<boolean>(false);

  // States cho Chuyển Trạng Thái (Lý do / Mẫu trả lời)
  const [transitionModal, setTransitionModal] = useState<{
    recordId: string;
    action: number;
    title: string;
  } | null>(null);
  const [transitionForm] = Form.useForm<{ note: string }>();
  const [groupedTemplates, setGroupedTemplates] = useState<any[]>([]);

  // Tải cấu hình ký số Doanh nghiệp
  const getIsSignDoanhNghiep = useCallback(async () => {
    try {
      const res = await duLieuDanhMucService.getAllByGroupCode("CAUHINH_SIGN_NENTANG");
      if (res.status && res.data?.length) {
        const signConfig = res.data.find(
          (item: any) => item.code === "SIGN_CHUNGTHUCHOPDONGDIENTU"
        );
        setIsSignDoanhNghiep(signConfig?.priority === 1);
      }
    } catch (error) {
      console.error("Lỗi khi tải cấu hình ký số:", error);
    }
  }, []);

  // Tải mẫu trả lời văn bản
  const loadGroupedTemplates = useCallback(async () => {
    try {
      const res = await mauTraLoiService.getGroupedTemplates();
      if (res.status && res.data) {
        setGroupedTemplates(res.data);
      }
    } catch (e) {
      console.error("Lỗi khi tải mẫu trả lời:", e);
    }
  }, []);

  useEffect(() => {
    getIsSignDoanhNghiep();
    loadGroupedTemplates();
  }, [getIsSignDoanhNghiep, loadGroupedTemplates]);

  const filteredTemplates = useMemo(() => {
    return groupedTemplates.filter(x => x.type == 'CCDVCHUNGTHUCHDDIENTU' || x.type == 'DUNGCHUNG');
  }, [groupedTemplates]);

  // Phân công xử lý chuyên viên
  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    assignForm.resetFields();
    if (!specialistOptions.length) {
      await loadSpecialists();
    }
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    assignForm.resetFields();
  };

  const loadSpecialists = useCallback(async () => {
    setSpecialistLoading(true);
    try {
      const isCuc = userRoles?.some((role: string) => role.toLowerCase().includes("cuc"));
      const targetRole = isCuc ? RoleConstant.ChuyenVienCuc : RoleConstant.ChuyenVienSo;

      const response = await userService.getUserByRole({
        pageIndex: 1,
        pageSize: 1000,
        vaiTro: [targetRole],
      });
      const items = response?.data?.items || [];
      setSpecialistOptions(
        items
          .filter((item: any) => item?.id)
          .map((item: any) => ({
            value: item.id,
            label:
              item.name && item.userName
                ? `${item.name} (${item.userName})`
                : item.name || item.userName || item.email || item.id,
          })),
      );
    } catch (error: any) {
      setSpecialistOptions([]);
      message.error(
        error?.message || "Không tải được danh sách chuyên viên xử lý",
      );
    } finally {
      setSpecialistLoading(false);
    }
  }, [userRoles]);

  const handleAssignTask = async (values: { chuyenVienId: string }) => {
    if (!item?.id) return;

    setAssignSubmitting(true);
    try {
      const response =
        await authenticationContractService.asignTaskForChuyenVien(
          item.id,
          values.chuyenVienId,
        );

      if (response.status) {
        message.success(
          !response.message || response.message === "Success"
            ? "Phân công xử lý thành công"
            : response.message,
        );
        handleCloseAssignModal();
        loadDetail();
      } else {
        message.error(
          !response.message || response.message === "Success"
            ? "Phân công xử lý thất bại"
            : response.message,
        );
      }
    } catch (error: any) {
      message.error(error?.message || "Phân công xử lý thất bại");
    } finally {
      setAssignSubmitting(false);
    }
  };

  // Nhận xử lý
  const handleTakeTask = () => {
    if (!item) return;
    Modal.confirm({
      title: "Nhận xử lý",
      content: "Bạn có chắc chắn muốn nhận xử lý hồ sơ này?",
      okText: "Xác nhận",
      cancelText: "Đóng",
      onOk: async () => {
        try {
          const response = await authenticationContractService.takeTask(
            item.id,
          );

          if (response.status) {
            message.success(
              !response.message || response.message === "Success"
                ? "Nhận xử lý thành công"
                : response.message,
            );
            loadDetail();
          } else {
            message.error(
              !response.message || response.message === "Success"
                ? "Nhận xử lý thất bại"
                : response.message,
            );
          }
        } catch (error: any) {
          message.error(error?.message || "Nhận xử lý thất bại");
        }
      },
    });
  };

  // Xác nhận ký số thành công
  const handleSignSuccess = async (
    result: SignResultItem[],
    certificate: CertificateInfo,
  ) => {
    try {
      const responseSign = await authenticationContractService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      const promises = result.map((i) =>
        authenticationContractService.updateStatus(
          {},
          i.id,
          currentSignAction || ContractActionConstant.DuyetDienTu,
        )
      );
      const results = await Promise.all(promises);
      const failedCount = results.filter((r) => !r.status).length;

      if (failedCount === 0) {
        let successMsg = "Ký số và cập nhật trạng thái hồ sơ thành công";
        if (currentSignAction === ContractActionConstant.GuiDangKy) {
          successMsg = "Ký số và gửi hồ sơ đăng ký thành công";
        } else if (currentSignAction === ContractActionConstant.GuiBoSungThongTin) {
          successMsg = "Ký số và gửi bổ sung thông tin thành công";
        } else if (currentSignAction === ContractActionConstant.DuyetDienTu) {
          successMsg = "Ký số và duyệt điện tử hồ sơ thành công";
        } else if (currentSignAction === ContractActionConstant.Review) {
          successMsg = "Ký số và review hồ sơ thành công";
        } else if (currentSignAction === ContractActionConstant.XacNhan) {
          successMsg = "Ký số và xác nhận phê duyệt hồ sơ thành công";
        }
        message.success(successMsg);
        loadDetail();
      } else if (failedCount < result.length) {
        message.warning(`Đã xử lý xong, nhưng có ${failedCount} hồ sơ cập nhật trạng thái thất bại`);
        loadDetail();
      } else {
        message.error("Ký số thành công nhưng cập nhật trạng thái thất bại");
      }
    } catch (error: any) {
      message.error(error?.message || "Lỗi trong quá trình ký số và duyệt hồ sơ");
    } finally {
      setIsSignModalOpen(false);
      setCurrentSignAction(null);
    }
  };

  // Nút cần ký số
  const handleSign = (action: number) => {
    const isRequireSign = isDoanhNghiep ? isSignDoanhNghiep : !!currentUser?.isKySo;
    if (isRequireSign) {
      if (item?.id) {
        setSignIds([item.id]);
        setCurrentSignAction(action);
        setIsSignModalOpen(true);
      }
    } else {
      const label = getActionLabel(action);
      handleChangeStatus(action, label);
    }
  };

  const getActionLabel = (action: number) => {
    if (action === ContractActionConstant.GuiDangKy) return "Gửi đăng ký";
    if (action === ContractActionConstant.GuiBoSungThongTin) return "Gửi bổ sung thông tin";
    if (action === ContractActionConstant.DuyetDienTu) return "Duyệt điện tử";
    if (action === ContractActionConstant.Review) return "Đã review";
    if (action === ContractActionConstant.XacNhan) return "Xác nhận";
    return "Xác nhận thực hiện";
  };

  // Chuyển trạng thái đơn giản
  const handleChangeStatus = (
    action: number,
    title: string,
    danger = false
  ) => {
    if (!item) return;
    Modal.confirm({
      title,
      content: "Bạn có chắc chắn muốn thực hiện thao tác này?",
      okText: "Xác nhận",
      cancelText: "Đóng",
      okType: danger ? "danger" : "primary",
      onOk: async () => {
        try {
          const response = await authenticationContractService.updateStatus(
            {},
            item.id,
            action,
          );

          if (response.status) {
            message.success(
              !response.message || response.message === "Success"
                ? "Cập nhật trạng thái thành công"
                : response.message,
            );
            loadDetail();
          } else {
            message.error(
              !response.message || response.message === "Success"
                ? "Cập nhật trạng thái thất bại"
                : response.message,
            );
          }
        } catch (error: any) {
          message.error(error?.message || "Cập nhật trạng thái thất bại");
        }
      },
    });
  };

  // Mở TransitionModal nhập lý do
  const handleOpenTransition = (action: number, title: string) => {
    if (!item) return;
    setTransitionModal({
      recordId: item.id,
      action: action,
      title: title,
    });
  };

  // Lưu TransitionModal nhập lý do
  const handleTransitionSubmit = async (values: { note: string }) => {
    if (!transitionModal) return;
    try {
      const response = await authenticationContractService.updateStatus(
        { note: values.note },
        transitionModal.recordId,
        transitionModal.action,
      );

      if (response.status) {
        message.success(
          !response.message || response.message === "Success"
            ? "Cập nhật trạng thái thành công"
            : response.message,
        );
        setTransitionModal(null);
        transitionForm.resetFields();
        loadDetail();
      } else {
        message.error(
          !response.message || response.message === "Success"
            ? "Cập nhật trạng thái thất bại"
            : response.message,
        );
      }
    } catch (error: any) {
      message.error(error?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const isAssigned = !!item?.chuyenVienXuLyId || !!item?.dauMoiXuLi;

  // Điều kiện phụ trợ để check gán việc Chuyên viên khi ở trạng thái Chuyên viên xử lý
  const isSpecialistStatus = ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.DeNghiChinhSua] as number[]).includes(item?.status as number);
  const isAssignmentValid = !isSpecialistStatus || isAssigned;

  const isSpecialistStatusForTermination = ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.CanBoSungThongTin] as number[]).includes(item?.status as number);
  const isAssignmentValidForTermination = !isSpecialistStatusForTermination || isAssigned;

  return (
    <>
      {/* 2. Nhận xử lý */}
      {operationMap["ACTION_NHANXULY"] && item?.status === ConstractStatusConstant.ChoDuyet && !isAssigned && (
        <Button
          type="primary"
          icon={getAntdIconByName(operationMap["ACTION_NHANXULY"]?.url)}
          onClick={handleTakeTask}
        >
          Nhận xử lý
        </Button>
      )}

      {/* 3. Phân công xử lý */}
      {operationMap["ACTION_PHANCONGXULY"] && item?.status === ConstractStatusConstant.ChoDuyet && (
        <Button
          type="primary"
          icon={getAntdIconByName(operationMap["ACTION_PHANCONGXULY"]?.url)}
          onClick={handleOpenAssignModal}
        >
          Phân công xử lý
        </Button>
      )}

      {/* 4. Gửi bổ sung thông tin */}
      {operationMap["ACTION_GUIBOSUNGTHONGTIN"] && item?.status === ConstractStatusConstant.CanBoSungThongTin && (
        <Button
          type="primary"
          icon={getAntdIconByName(operationMap["ACTION_GUIBOSUNGTHONGTIN"]?.url)}
          onClick={() => handleSign(ContractActionConstant.GuiBoSungThongTin)}
        >
          Gửi bổ sung thông tin
        </Button>
      )}


      {/* 6. Đề nghị chấm dứt đăng ký */}
      {operationMap["ACTION_DENGHICHAMDUTDANGKY"] && item?.status === ConstractStatusConstant.DaXacNhan && (
        <Button
          type="primary"
          danger
          icon={getAntdIconByName(operationMap["ACTION_DENGHICHAMDUTDANGKY"]?.url)}
          onClick={() => handleChangeStatus(ContractActionConstant.DeNghiChamDutDangKy, "Đề nghị chấm dứt đăng ký", true)}
        >
          Đề nghị chấm dứt đăng ký
        </Button>
      )}

      {/* 7. Đề nghị chỉnh sửa */}
      {operationMap["ACTION_DENGHICHINHSUA"] && item?.status === ConstractStatusConstant.DaXacNhan && (
        <Button
          type="primary"
          icon={getAntdIconByName(operationMap["ACTION_DENGHICHINHSUA"]?.url)}
          onClick={() => handleChangeStatus(ContractActionConstant.DeNghiChinhSua, "Đề nghị chỉnh sửa")}
        >
          Đề nghị chỉnh sửa
        </Button>
      )}

      {/* 8. Hủy đăng ký */}
      {operationMap["ACTION_HUYDANGKY"] && item?.status === ConstractStatusConstant.ChoDuyet && (
        <Button
          type="primary"
          danger
          icon={getAntdIconByName(operationMap["ACTION_HUYDANGKY"]?.url)}
          onClick={() => handleChangeStatus(ContractActionConstant.HuyDangKy, "Hủy đăng ký", true)}
        >
          Hủy đăng ký
        </Button>
      )}

      {/* 9. Yêu cầu bổ sung thông tin */}
      {operationMap["ACTION_YEUCAUBOSUNGTHONGTIN_CV"] && isAssigned &&
        ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.DeNghiChinhSua] as number[]).includes(item?.status as number) && (
          <Button
            type="primary"
            icon={getAntdIconByName(operationMap["ACTION_YEUCAUBOSUNGTHONGTIN_CV"]?.url)}
            onClick={() => handleOpenTransition(ContractActionConstant.YeuCauBoSungThongTin, "Yêu cầu bổ sung thông tin")}
          >
            Yêu cầu bổ sung thông tin
          </Button>
        )}
      {operationMap["ACTION_YEUCAUBOSUNGTHONGTIN_TP"] && item?.status === ConstractStatusConstant.DaDuyetDienTu && (
        <Button
          type="primary"
          icon={getAntdIconByName(operationMap["ACTION_YEUCAUBOSUNGTHONGTIN_TP"]?.url)}
          onClick={() => handleOpenTransition(ContractActionConstant.YeuCauBoSungThongTin, "Yêu cầu bổ sung thông tin")}
        >
          Yêu cầu bổ sung thông tin
        </Button>
      )}
      {operationMap["ACTION_YEUCAUBOSUNGTHONGTIN_LD"] && item?.status === ConstractStatusConstant.DaReview && (
        <Button
          type="primary"
          icon={getAntdIconByName(operationMap["ACTION_YEUCAUBOSUNGTHONGTIN_LD"]?.url)}
          onClick={() => handleOpenTransition(ContractActionConstant.YeuCauBoSungThongTin, "Yêu cầu bổ sung thông tin")}
        >
          Yêu cầu bổ sung thông tin
        </Button>
      )}

      {/* 10. Từ chối */}
      {operationMap["ACTION_TUCHOI_CV"] && isAssigned &&
        ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.DeNghiChinhSua] as number[]).includes(item?.status as number) && (
          <Button
            type="primary"
            danger
            icon={getAntdIconByName(operationMap["ACTION_TUCHOI_CV"]?.url)}
            onClick={() => handleOpenTransition(ContractActionConstant.TuChoi, "Từ chối")}
          >
            Từ chối
          </Button>
        )}
      {operationMap["ACTION_TUCHOI_TP"] && item?.status === ConstractStatusConstant.DaDuyetDienTu && (
        <Button
          type="primary"
          danger
          icon={getAntdIconByName(operationMap["ACTION_TUCHOI_TP"]?.url)}
          onClick={() => handleOpenTransition(ContractActionConstant.TuChoi, "Từ chối")}
        >
          Từ chối
        </Button>
      )}
      {operationMap["ACTION_TUCHOI_LD"] && item?.status === ConstractStatusConstant.DaReview && (
        <Button
          type="primary"
          danger
          icon={getAntdIconByName(operationMap["ACTION_TUCHOI_LD"]?.url)}
          onClick={() => handleOpenTransition(ContractActionConstant.TuChoi, "Từ chối")}
        >
          Từ chối
        </Button>
      )}

      {/* 11. Duyệt điện tử */}
      {operationMap["ACTION_DUYETDIENTU"] && isAssigned &&
        ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.DeNghiChinhSua] as number[]).includes(item?.status as number) && (
          <Button
            type="primary"
            icon={getAntdIconByName(operationMap["ACTION_DUYETDIENTU"]?.url)}
            onClick={() => handleSign(ContractActionConstant.DuyetDienTu)}
          >
            Duyệt điện tử
          </Button>
        )}

      {/* 12. Chấm dứt đăng ký */}
      {operationMap["ACTION_CHAMDUTDANGKY_CV"] && isAssigned &&
        ([ConstractStatusConstant.ChoDuyet, ConstractStatusConstant.CanBoSungThongTin] as number[]).includes(item?.status as number) && (
          <Button
            type="primary"
            danger
            icon={getAntdIconByName(operationMap["ACTION_CHAMDUTDANGKY_CV"]?.url)}
            onClick={() => handleOpenTransition(ContractActionConstant.ChamDutDangKy, "Chấm dứt đăng ký")}
          >
            Chấm dứt đăng ký
          </Button>
        )}
      {operationMap["ACTION_CHAMDUTDANGKY_TP"] && item?.status === ConstractStatusConstant.DaDuyetDienTu && (
        <Button
          type="primary"
          danger
          icon={getAntdIconByName(operationMap["ACTION_CHAMDUTDANGKY_TP"]?.url)}
          onClick={() => handleOpenTransition(ContractActionConstant.ChamDutDangKy, "Chấm dứt đăng ký")}
        >
          Chấm dứt đăng ký
        </Button>
      )}
      {operationMap["ACTION_CHAMDUTDANGKY_LD"] && item?.status === ConstractStatusConstant.DaReview && (
        <Button
          type="primary"
          danger
          icon={getAntdIconByName(operationMap["ACTION_CHAMDUTDANGKY_LD"]?.url)}
          onClick={() => handleOpenTransition(ContractActionConstant.ChamDutDangKy, "Chấm dứt đăng ký")}
        >
          Chấm dứt đăng ký
        </Button>
      )}

      {/* 13. Xác nhận chấm dứt đăng ký */}
      {operationMap["ACTION_XACNHANCHAMDUT"] && item?.status === ConstractStatusConstant.DeNghiChamDutDangKy && (
        <Button
          type="primary"
          danger
          icon={getAntdIconByName(operationMap["ACTION_XACNHANCHAMDUT"]?.url)}
          onClick={() => handleChangeStatus(ContractActionConstant.XacNhanChamDut, "Xác nhận chấm dứt đăng ký", true)}
        >
          Xác nhận chấm dứt đăng ký
        </Button>
      )}

      {/* 14. Đã review */}
      {operationMap["ACTION_REVIEW"] && item?.status === ConstractStatusConstant.DaDuyetDienTu && (
        <Button
          type="primary"
          icon={getAntdIconByName(operationMap["ACTION_REVIEW"]?.url)}
          onClick={() => handleSign(ContractActionConstant.Review)}
        >
          Đã review
        </Button>
      )}

      {/* 15. Xác nhận phê duyệt */}
      {operationMap["ACTION_XACNHAN"] && item?.status === ConstractStatusConstant.DaReview && (
        <Button
          type="primary"
          icon={getAntdIconByName(operationMap["ACTION_XACNHAN"]?.url)}
          onClick={() => handleSign(ContractActionConstant.XacNhan)}
        >
          Xác nhận
        </Button>
      )}


      {/* Modal Phân công xử lý */}
      <Modal
        title="Phân công xử lý"
        open={isAssignModalOpen}
        onCancel={handleCloseAssignModal}
        onOk={() => assignForm.submit()}
        okText="Phân công"
        cancelText="Đóng"
        confirmLoading={assignSubmitting}
        destroyOnClose
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssignTask}>
          <Form.Item
            name="chuyenVienId"
            label="Chuyên viên xử lý"
            rules={[
              { required: true, message: "Vui lòng chọn chuyên viên xử lý" },
            ]}
          >
            <Select
              placeholder="Chọn chuyên viên xử lý"
              showSearch
              allowClear
              loading={specialistLoading}
              options={specialistOptions}
              notFoundContent={
                specialistLoading ? "Đang tải..." : "Không có chuyên viên"
              }
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Ký Số */}
      <DigitalSignatureModal
        ids={signIds}
        open={isSignModalOpen}
        onCancel={() => {
          setIsSignModalOpen(false);
          setCurrentSignAction(null);
        }}
        onSignSuccess={handleSignSuccess}
        signerService={authenticationContractService}
      />

      {/* Modal Lý do / Mẫu trả lời (TransitionModal) */}
      <TransitionModal
        open={!!transitionModal}
        title={transitionModal?.title || ""}
        form={transitionForm}
        onCancel={() => {
          setTransitionModal(null);
          transitionForm.resetFields();
        }}
        onFinish={handleTransitionSubmit}
        groupedTemplates={filteredTemplates}
      />
    </>
  );
};

export default ButtonDetail;