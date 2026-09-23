import React from "react";
import { Form, Input, Button } from "antd";

interface UpdatePasswordFormProps {
  onClose: () => void;
  onSubmit: (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
}

const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
    >
      <Form.Item
        label="Mật khẩu"
        name="oldPassword"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="Mật khẩu mới"
        name="newPassword"
        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="Xác nhận mật khẩu mới"
        name="confirmPassword"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default UpdatePasswordForm;
