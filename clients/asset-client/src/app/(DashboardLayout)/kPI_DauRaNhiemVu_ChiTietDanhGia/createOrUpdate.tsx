import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType,
  KPI_DauRaNhiemVu_ChiTietDanhGiaType,
} from "@/types/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGia";
import * as extensions from "@/utils/extensions";
import kPI_DauRaNhiemVu_ChiTietDanhGiaService from "@/services/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGiaService";

interface Props {
  item?: KPI_DauRaNhiemVu_ChiTietDanhGiaType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await kPI_DauRaNhiemVu_ChiTietDanhGiaService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_DauRaNhiemVu_ChiTietDanhGiaService.create(formData);
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
          <Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="idDauRaNhiemVu"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="idPhieuDanhGia"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="vaiTroDanhGia"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="nguoiDanhGiaId"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemSoLuong_HoanThanh"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemSoLuong_KhongHoanThanh"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemSoLuong_Diem"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemChatLuong_KhongDat"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemChatLuong_SoDiemConLai"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemChatLuong_Diem"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemTienDo_KhongDat"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemTienDo_SoDiemConLai"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
							label=""
							name="chamDiemTienDo_Diem"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType>
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
export default KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdate;
