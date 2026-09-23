"use client";
import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Button,
  Alert,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  UsergroupAddOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import userService from "@/services/user/user.service";

const { Text } = Typography;

interface BulkCreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BULK_ROLE_OPTIONS = [
  {
    label: "1. Quản lý nhân sự đơn vị (QLNS_DonVi)",
    value: "qlns",
    description:
      "Tạo tự động tài khoản Quản lý nhân sự cho tất cả các phòng ban/đơn vị trong hệ thống.",
    accountFormat: "qlns_[mã_đơn_vị]",
    defaultPass: "12345678",
    target: "Tất cả các phòng ban/đơn vị",
  },
  {
    label: "2. Cục trưởng / Lãnh đạo đơn vị (CucTruong)",
    value: "cuctruong",
    description:
      "Tạo tự động tài khoản Cục trưởng / Vụ trưởng / Lãnh đạo cho tất cả các phòng ban/đơn vị trong hệ thống.",
    accountFormat: "cuctruong_[mã_đơn_vị]",
    defaultPass: "12345678",
    target: "Tất cả các phòng ban/đơn vị",
  },
  {
    label: "3. Gán vai trò mặc định 'Cá nhân' cho tài khoản chưa có vai trò",
    value: "default_canhan",
    description:
      "Tự động rà soát và gán vai trò 'Cá nhân' (CaNhan) cho tất cả tài khoản trong hệ thống chưa được gán vai trò nào.",
    accountFormat: "N/A",
    defaultPass: "N/A",
    target: "Tất cả người dùng chưa có vai trò",
  },
];

const BulkCreateAccountModal: React.FC<BulkCreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("qlns");
  const [result, setResult] = useState<{
    successCount?: number;
    skipCount?: number;
    errors?: string[];
    message?: string;
  } | null>(null);

  const currentOption = BULK_ROLE_OPTIONS.find(
    (opt) => opt.value === selectedRole
  );

  const handleClose = () => {
    if (submitting) return;
    setResult(null);
    form.resetFields();
    setSelectedRole("qlns");
    onClose();
  };

  const handleExecute = async () => {
    try {
      const values = await form.validateFields();
      const roleType = values.roleType;
      setSubmitting(true);
      setResult(null);

      let res: any = null;

      if (roleType === "qlns") {
        res = await userService.createQuickAccountForDepartments();
      } else if (roleType === "cuctruong") {
        res = await userService.createCucTruongAccountForDepartments();
      } else if (roleType === "default_canhan") {
        // res = await userService.setDefaultRoleCaNhanForUsersWithoutRole();
      }

      if (res?.status || res?.data) {
        const data = res.data ?? res;
        if (roleType === "default_canhan") {
          const count = typeof data === "number" ? data : data?.data ?? 0;
          setResult({
            successCount: count,
            message:
              res.message ||
              `Đã gán thành công vai trò 'Cá nhân' cho ${count} tài khoản.`,
          });
          toast.success(
            res.message || `Đã gán vai trò cho ${count} tài khoản.`
          );
        } else {
          setResult({
            successCount: data.successCount ?? data.SuccessCount ?? 0,
            skipCount: data.skipCount ?? data.SkipCount ?? 0,
            errors: data.errors ?? data.Errors ?? [],
          });
          toast.success(
            `Tạo tài khoản hoàn tất: ${data.successCount ?? data.SuccessCount ?? 0
            } thành công, ${data.skipCount ?? data.SkipCount ?? 0} đã tồn tại.`
          );
        }
        onSuccess();
      } else {
        toast.error(res?.message || "Thực hiện tạo tài khoản thất bại");
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo tài khoản hàng loạt:", error);
      toast.error(
        typeof error === "string" ? error : "Đã xảy ra lỗi khi tạo tài khoản"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UsergroupAddOutlined style={{ color: "#1890ff", fontSize: 20 }} />
          <span>Tạo tài khoản hàng loạt theo vai trò (Bulk Account Creation)</span>
        </div>
      }
      open={isOpen}
      onCancel={handleClose}
      width={680}
      destroyOnClose
      footer={[
        <Button key="close" onClick={handleClose} disabled={submitting}>
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={submitting}
          onClick={handleExecute}
        >
          Thực hiện tạo
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ roleType: "qlns" }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="Chọn loại tài khoản / vai trò cần tạo hàng loạt:"
          name="roleType"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select
            size="large"
            options={BULK_ROLE_OPTIONS.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
            onChange={(val) => {
              setSelectedRole(val);
              setResult(null);
            }}
          />
        </Form.Item>

        {currentOption && (
          <div
            style={{
              backgroundColor: "#f0f5ff",
              border: "1px solid #adc6ff",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <InfoCircleOutlined
                style={{ color: "#2f54eb", marginTop: 4, fontSize: 16 }}
              />
              <div style={{ flex: 1 }}>
                <Text strong style={{ color: "#1d39c4", fontSize: 14 }}>
                  Thông tin quy tắc tạo tự động:
                </Text>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <p style={{ margin: "4px 0" }}>
                    <b>Mô tả:</b> {currentOption.description}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <b>Đối tượng áp dụng:</b> {currentOption.target}
                  </p>
                  {currentOption.accountFormat !== "N/A" && (
                    <>
                      <p style={{ margin: "4px 0" }}>
                        <b>Quy tắc tên tài khoản:</b>{" "}
                        <code>{currentOption.accountFormat}</code>
                      </p>
                      <p style={{ margin: "4px 0" }}>
                        <b>Mật khẩu mặc định:</b>{" "}
                        <code>{currentOption.defaultPass}</code>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16 }}>
            <Divider style={{ margin: "12px 0" }} />
            {result.message ? (
              <Alert message={result.message} type="success" showIcon />
            ) : (
              <Alert
                message="Kết quả thực hiện"
                description={
                  <div>
                    <p style={{ margin: "4px 0" }}>
                      ✅ <b>Tạo mới thành công:</b>{" "}
                      <Text type="success" strong>
                        {result.successCount}
                      </Text>{" "}
                      tài khoản
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      ℹ️ <b>Đã tồn tại (đã cập nhật/bỏ qua):</b>{" "}
                      <Text type="warning" strong>
                        {result.skipCount}
                      </Text>{" "}
                      tài khoản
                    </p>
                    {result.errors && result.errors.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="danger" strong>
                          ⚠️ Danh sách lỗi ({result.errors.length}):
                        </Text>
                        <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                          {result.errors.map((err, idx) => (
                            <li key={idx} style={{ color: "#ff4d4f" }}>
                              {err}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                }
                type={
                  result.errors && result.errors.length > 0
                    ? "warning"
                    : "success"
                }
                showIcon
              />
            )}
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default BulkCreateAccountModal;
