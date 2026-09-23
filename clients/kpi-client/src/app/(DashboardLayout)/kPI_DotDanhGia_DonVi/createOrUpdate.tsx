import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_DotDanhGia_DonViCreateOrUpdateType,
  KPI_DotDanhGia_DonViType,
} from "@/types/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonVi";
import * as extensions from "@/utils/extensions";
import kPI_DotDanhGia_DonViService from "@/services/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonViService";

interface Props {
  item?: KPI_DotDanhGia_DonViType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_DotDanhGia_DonViCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_DotDanhGia_DonViCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_DotDanhGia_DonViCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_DotDanhGia_DonViCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await kPI_DotDanhGia_DonViService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_DotDanhGia_DonViService.create(formData);
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
          <Form.Item<KPI_DotDanhGia_DonViCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_DotDanhGia_DonViCreateOrUpdateType>
							label=""
							name="idDotDanhGia"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DotDanhGia_DonViCreateOrUpdateType>
							label=""
							name="idDonVi"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DotDanhGia_DonViCreateOrUpdateType>
							label=""
							name="idBoChiSoNhiemVu"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default KPI_DotDanhGia_DonViCreateOrUpdate;
