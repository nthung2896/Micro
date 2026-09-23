"use client";
import { EmailConfigsDto, EmailConfigsRequest } from "@/types/emailConfigs";
import emailConfigsService from "@/services/emailConfigs/emailConfigs.service";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Row,
  Col,
  message,
} from "antd";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  data?: EmailConfigsDto;
}

const CreateUpdateForm: React.FC<Props> = ({ isOpen, onSuccess, onClose, data }) => {
  const [form] = Form.useForm<EmailConfigsRequest>();
  const isEdit = !!data;

  useEffect(() => {
    if (isOpen) {
      if (data) {
        form.setFieldsValue({
          id: data.id,
          from: data.from || "",
          host: data.host || "",
          alias: data.alias || "",
          port: data.port || "",
          userName: data.userName || "",
          password: "",
          enableSsl: data.enableSsl ?? true,
          allowSendMail: data.allowSendMail ?? true,
          dailyLimit: data.dailyLimit ?? 500,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          enableSsl: true,
          allowSendMail: true,
          dailyLimit: 500,
        });
      }
    }
  }, [isOpen, data, form]);

  const handleSubmit = async (values: EmailConfigsRequest) => {
    try {
      const response = isEdit
        ? await emailConfigsService.update({ ...values, id: data!.id })
        : await emailConfigsService.create(values);

      if (response.status) {
        message.success(isEdit ? "Cập nhật thành công" : "Thêm mới thành công");
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.message || "Lưu dữ liệu thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa cấu hình email" : "Thêm mới cấu hình email"}
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Đóng"
      width={700}
      destroyOnClose
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email người gửi"
              name="from"
              rules={[{ required: true, message: "Vui lòng nhập email" }]}
            >
              <Input placeholder="example@gmail.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tên hiển thị" name="alias">
              <Input placeholder="Tên hiển thị khi gửi mail" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Máy chủ SMTP"
              name="host"
              rules={[{ required: true, message: "Vui lòng nhập host" }]}
            >
              <Input placeholder="smtp.gmail.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Cổng SMTP"
              name="port"
              rules={[{ required: true, message: "Vui lòng nhập port" }]}
            >
              <Input placeholder="587" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tài khoản SMTP"
              name="userName"
              rules={[{ required: true, message: "Vui lòng nhập tài khoản" }]}
            >
              <Input placeholder="username@gmail.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mật khẩu SMTP"
              name="password"
              rules={isEdit ? [] : [{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder={isEdit ? "Để trống nếu giữ nguyên" : "App password"} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Hạn mức / ngày"
              name="dailyLimit"
              tooltip="Gmail free ~ 500/ngày"
            >
              <InputNumber min={1} max={10000} style={{ width: "100%" }} placeholder="500" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Bật SSL" name="enableSsl" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Cho phép gửi" name="allowSendMail" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateUpdateForm;
