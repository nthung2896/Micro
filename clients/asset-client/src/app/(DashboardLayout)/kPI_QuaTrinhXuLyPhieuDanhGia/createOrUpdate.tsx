import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType,
  KPI_QuaTrinhXuLyPhieuDanhGiaType,
} from "@/types/kPI_QuaTrinhXuLyPhieuDanhGia/kPI_QuaTrinhXuLyPhieuDanhGia";
import * as extensions from "@/utils/extensions";
import kPI_QuaTrinhXuLyPhieuDanhGiaService from "@/services/kPI_QuaTrinhXuLyPhieuDanhGia/kPI_QuaTrinhXuLyPhieuDanhGiaService";

interface Props {
  item?: KPI_QuaTrinhXuLyPhieuDanhGiaType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await kPI_QuaTrinhXuLyPhieuDanhGiaService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_QuaTrinhXuLyPhieuDanhGiaService.create(formData);
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
          <Form.Item<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType>
							label=""
							name="idPhieuDanhGia"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType>
							label=""
							name="isXuLy"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType>
							label=""
							name="idNguoiXuLy"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType>
							label=""
							name="idNguoiGui"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType>
							label=""
							name="trangThai"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType>
							label=""
							name="ghiChu"
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
export default KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdate;
