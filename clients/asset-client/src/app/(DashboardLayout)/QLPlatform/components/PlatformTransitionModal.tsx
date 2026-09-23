"use client";

import React from "react";
import { Form, Modal, Input } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";

interface PlatformTransitionModalProps {
  modalState: {
    recordId: string;
    targetStatus: number;
    title: string;
    buttonColor: "primary" | "danger" | "warning";
  } | null;
  submitting: boolean;
  onSubmit: (values: { note: string }) => void;
  onCancel: () => void;
}

const PlatformTransitionModal: React.FC<PlatformTransitionModalProps> = ({
  modalState,
  submitting,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<{ note: string }>();

  if (!modalState) return null;

  const handleOk = () => {
    form.submit();
  };

  const handleFinish = (values: { note: string }) => {
    onSubmit({ note: values.note || "" });
    form.resetFields();
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <InfoCircleOutlined style={{ color: "#3b82f6" }} />
          <span>{modalState.title}</span>
        </div>
      }
      open={true}
      onOk={handleOk}
      onCancel={() => {
        onCancel();
        form.resetFields();
      }}
      confirmLoading={submitting}
      okText="Xác nhận"
      cancelText="Huỷ"
      okButtonProps={{
        danger: modalState.buttonColor === "danger",
        style:
          modalState.buttonColor === "primary"
            ? { backgroundColor: "#16a34a", borderColor: "#16a34a" }
            : undefined,
      }}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        {(modalState.targetStatus === PlatformStatusConstant.BiTuChoi ||
          modalState.targetStatus === PlatformStatusConstant.CanBoSungThongTin) ? (
          <Form.Item
            name="note"
            label="Ý kiến xử lý / Ghi chú"
            rules={[
              {
                required: true,
                message: "Bắt buộc nhập nội dung khi Từ chối hoặc Yêu cầu bổ sung!",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ý kiến phê duyệt, ghi chú chuyển tiếp, hoặc nội dung cần bổ sung..."
            />
          </Form.Item>
        ) : (
          <div style={{ fontSize: 14, color: "#475569", margin: "8px 0" }}>
            Bạn có chắc chắn muốn thực hiện thao tác này?
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default PlatformTransitionModal;
