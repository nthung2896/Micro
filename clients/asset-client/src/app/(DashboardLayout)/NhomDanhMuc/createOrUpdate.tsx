import nhomDanhMucService from "@/services/nhomDanhMuc/nhomDanhMuc.service";
import { DM_NhomDanhMucType } from "@/types/dM_NhomDanhMuc/dto";
import { DM_NhomDanhMucRequestType } from "@/types/dM_NhomDanhMuc/request";
import { Form, FormProps, Input, Modal, message } from "antd";
import React, { useEffect, useState } from "react";
interface Props {
  isOpen: boolean;
  NhomDanhMuc?: DM_NhomDanhMucType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);
  const handleOnFinish: FormProps<DM_NhomDanhMucRequestType>["onFinish"] =
    async (formData: DM_NhomDanhMucRequestType) => {
      try {
        if (props.NhomDanhMuc) {
          const response = await nhomDanhMucService.update(formData);
          if (response.status) {
            message.success("Chỉnh sửa nhóm danh mục thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            message.error(response.message);
          }
        } else {
          const response = await nhomDanhMucService.create(formData);
          if (response.status) {
            message.success("Thêm mới nhóm danh mục thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            message.error(response.message);
          }
        }
      } catch (error) {
        message.error("Có lỗi xảy ra: " + error);
      }
    };

  const handleMapEdit = () => {
    form.setFieldsValue({
      id: props.NhomDanhMuc?.id,
      groupCode: props.NhomDanhMuc?.groupCode,
      groupName: props.NhomDanhMuc?.groupName,
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
    form.resetFields();
    props.onClose();
  };

  useEffect(() => {
    setIsOpen(props.isOpen);
    if (props.NhomDanhMuc) {
      handleMapEdit();
    }
  }, [props.isOpen]);

  return (
    <Modal
      title={
        props.NhomDanhMuc != null
          ? "Chỉnh sửa nhóm danh mục"
          : "Thêm mới nhóm danh mục"
      }
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width={600}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        style={{ maxWidth: 1000 }}
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.NhomDanhMuc && (
          <Form.Item<DM_NhomDanhMucRequestType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<DM_NhomDanhMucRequestType>
              label="Mã nhóm danh mục"
              name="groupCode"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item<DM_NhomDanhMucRequestType>
              label="Tên nhóm danh mục"
              name="groupName"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default CreateOrUpdate;
