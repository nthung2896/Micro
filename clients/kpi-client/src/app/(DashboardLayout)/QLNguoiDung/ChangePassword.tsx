import { Modal, Form, Input, message } from "antd";
import authService from "@/services/auth/auth.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ChangePassword = ({
  isOpen,
  onClose,
  userId,
}: Props) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const values = await form.validateFields();

    try {
      const response = await authService.adminChangePassword({
        userId: userId,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      if (response.status) {
        message.success("Đổi mật khẩu thành công");
        form.resetFields();
        onClose();
      } else {
        message.error(response.message);
      }
    } catch {
      message.error("Đổi mật khẩu thất bại");
    }
  };

  return (
    <Modal
      title="Đổi mật khẩu"
      open={isOpen}
      onCancel={onClose}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            {
              required: true,
              message: "Nhập mật khẩu mới",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            {
              required: true,
              message: "Nhập xác nhận mật khẩu",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (
                  !value ||
                  getFieldValue("newPassword") === value
                ) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePassword;