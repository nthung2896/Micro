import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_ThoiDiemDongBoVanBanCreateOrUpdateType,
  KPI_ThoiDiemDongBoVanBanType,
} from "@/types/kPI_ThoiDiemDongBoVanBan/kPI_ThoiDiemDongBoVanBan";
import * as extensions from "@/utils/extensions";
import kPI_ThoiDiemDongBoVanBanService from "@/services/kPI_ThoiDiemDongBoVanBan/kPI_ThoiDiemDongBoVanBanService";

interface Props {
  item?: KPI_ThoiDiemDongBoVanBanType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_ThoiDiemDongBoVanBanCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_ThoiDiemDongBoVanBanCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_ThoiDiemDongBoVanBanCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_ThoiDiemDongBoVanBanCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await kPI_ThoiDiemDongBoVanBanService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_ThoiDiemDongBoVanBanService.create(formData);
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
          <Form.Item<KPI_ThoiDiemDongBoVanBanCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_ThoiDiemDongBoVanBanCreateOrUpdateType>
							label="IdVanBan"
							name="idVanBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IdVanBan"/>
						</Form.Item>
						<Form.Item<KPI_ThoiDiemDongBoVanBanCreateOrUpdateType>
							label="TypeVanBan"
							name="typeVanBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="TypeVanBan"/>
						</Form.Item>
						<Form.Item<KPI_ThoiDiemDongBoVanBanCreateOrUpdateType>
							label="ThoiGianDongBoVanBan"
							name="thoiGianDongBoVanBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<DatePicker format="DD/MM/YYYY" className="w-100" style={{ width: "100%" }} placeholder="ThoiGianDongBoVanBan"/>
						</Form.Item>
						<Form.Item<KPI_ThoiDiemDongBoVanBanCreateOrUpdateType>
							label="IsTuNhap"
							name="isTuNhap"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IsTuNhap"/>
						</Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default KPI_ThoiDiemDongBoVanBanCreateOrUpdate;
