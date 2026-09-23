import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Switch, Button, message, Select } from "antd";
import processingDeadlineConfigService from "@/services/processingDeadlineConfig/processingDeadlineConfig.service";
import PlatformManageTypeConstant from "@/constants/PlatformManageTypeConstant";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { ProcessingDeadlineConfigCreateRequest } from "@/types/processingDeadlineConfig";
import { removeAccents } from "@/libs/CommonFunction";

const generateCodeFromName = (name: string): string => {
  if (!name) return "";
  return removeAccents(name).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

interface CreateOrUpdateProps {
  isOpen: boolean;
  id: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrUpdateModal: React.FC<CreateOrUpdateProps> = ({ isOpen, id, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState<boolean>(false);
  const isNenTang = Form.useWatch("isNenTang", form);

  useEffect(() => {
    if (isOpen) {
      if (id) {
        setLoading(true);
        processingDeadlineConfigService
          .getById(id)
          .then((res) => {
            if (res.status && res.data) {
              form.setFieldsValue(res.data);
              setIsCodeManuallyEdited(true);
            } else {
              message.error(res.message || "Không thể tải thông tin cấu hình");
              onClose();
            }
          })
          .catch(() => {
            message.error("Lỗi khi tải thông tin cấu hình");
            onClose();
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        form.resetFields();
        setIsCodeManuallyEdited(false);
        form.setFieldsValue({
          isCheckHoliday: false,
          isNenTang: false,
          limitDays: 0,
        });
      }
    }
  }, [isOpen, id, form, onClose]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload: ProcessingDeadlineConfigCreateRequest = {
        ...values,
        id: id || undefined,
      };

      const res = id
        ? await processingDeadlineConfigService.update(payload)
        : await processingDeadlineConfigService.create(payload);

      if (res.status) {
        message.success(id ? "Cập nhật cấu hình thành công" : "Thêm mới cấu hình thành công");
        onSuccess();
        onClose();
      } else {
        message.error(res.message || "Lưu cấu hình thất bại");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={id ? "Cập nhật cấu hình hạn xử lý" : "Thêm mới cấu hình hạn xử lý"}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={loading}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Lưu lại
        </Button>,
      ]}
      width={650}
    >
      <Form form={form} layout="vertical" disabled={loading} style={{ marginTop: 20 }}>
        <Form.Item
          name="name"
          label="Tên cấu hình"
          rules={[{ required: true, message: "Vui lòng nhập tên cấu hình!" }]}
        >
          <Input
            placeholder="Nhập tên cấu hình..."
            allowClear
            onChange={(e) => {
              const nameVal = e.target.value;
              if (!id && !isCodeManuallyEdited) {
                form.setFieldsValue({
                  code: generateCodeFromName(nameVal),
                });
              }
            }}
          />
        </Form.Item>

        <Form.Item
          name="code"
          label="Mã module"
          rules={[{ required: true, message: "Vui lòng nhập mã module!" }]}
        >
          <Input
            placeholder="Nhập mã module (ví dụ: PlatformManage, RutTienKyQuy)..."
            allowClear
            onChange={(e) => {
              setIsCodeManuallyEdited(e.target.value !== "");
            }}
          />
        </Form.Item>

        <div style={{ display: "flex", gap: 32, marginBottom: 24 }}>
          <Form.Item name="isNenTang" label="Cấu hình nền tảng" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <Form.Item name="isCheckHoliday" label="Bỏ qua ngày lễ/Tết" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
        </div>

        {isNenTang ? (
          <Form.Item name="type" label="Loại hình nền tảng">
            <Select
              placeholder="Chọn loại hình nền tảng..."
              options={PlatformManageTypeConstant.getDropdownList()}
              allowClear
            />
          </Form.Item>
        ) : (
          <Form.Item name="type" label="Loại hình (không bắt buộc)">
            <Input placeholder="Nhập loại hình..." allowClear />
          </Form.Item>
        )}

        <div style={{ display: "flex", gap: 16 }}>
          {isNenTang ? (
            <Form.Item name="statusBefore" label="Trạng thái trước" style={{ flex: 1 }}>
              <Select
                placeholder="Chọn trạng thái trước..."
                options={PlatformStatusConstant.getDropdownList()}
                allowClear
              />
            </Form.Item>
          ) : (
            <Form.Item name="statusBefore" label="Trạng thái trước" style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} placeholder="Nhập trạng thái..." min={0} />
            </Form.Item>
          )}

          {isNenTang ? (
            <Form.Item name="statusAfter" label="Trạng thái sau" style={{ flex: 1 }}>
              <Select
                placeholder="Chọn trạng thái sau..."
                options={PlatformStatusConstant.getDropdownList()}
                allowClear
              />
            </Form.Item>
          ) : (
            <Form.Item name="statusAfter" label="Trạng thái sau" style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} placeholder="Nhập trạng thái..." min={0} />
            </Form.Item>
          )}
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            name="limitDays"
            label="Số ngày hạn xử lý"
            rules={[{ required: true, message: "Vui lòng nhập số ngày hạn xử lý!" }]}
            style={{ flex: 1 }}
          >
            <InputNumber style={{ width: "100%" }} placeholder="Nhập số ngày..." min={0} />
          </Form.Item>

          <Form.Item name="stt" label="Số thứ tự (STT)" style={{ flex: 1 }}>
            <InputNumber style={{ width: "100%" }} placeholder="Nhập số thứ tự..." min={0} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateOrUpdateModal;
