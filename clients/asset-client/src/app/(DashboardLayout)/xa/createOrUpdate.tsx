import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  XaCreateOrUpdateType,
  XaType,
} from "@/types/xa/xa";
import * as extensions from "@/utils/extensions";
import xaService from "@/services/xa/xaService";

interface Props {
  item?: XaType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const XaCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<XaCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<XaCreateOrUpdateType>["onFinish"] =
    async (formData: XaCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await xaService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await xaService.create(formData);
        if (response.status) {
          toast.success("Thêm mới  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      }
    };

  const handleCancel = () => {
    form.resetFields();
    props.onClose();
  };

  React.useEffect(() => {
    
    if (props.item) {
      form.setFieldsValue({
        ...props.item,
      });
    }
  }, [form, props.item]);

  return (
    <Modal
      title={
        props.item != null
          ? "Chỉnh sửa "
          : "Thêm mới "
      }
      open={true}
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
        {props.item && (
          <Form.Item<XaCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            
          </>
        }
      </Form>
    </Modal>
  );
};
export default XaCreateOrUpdate;
