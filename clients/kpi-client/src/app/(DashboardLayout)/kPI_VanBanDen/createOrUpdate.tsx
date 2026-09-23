import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_VanBanDenCreateOrUpdateType,
  KPI_VanBanDenType,
} from "@/types/kPI_VanBanDen/kPI_VanBanDen";
import * as extensions from "@/utils/extensions";
import kPI_VanBanDenService from "@/services/kPI_VanBanDen/kPI_VanBanDenService";

interface Props {
  item?: KPI_VanBanDenType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_VanBanDenCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_VanBanDenCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_VanBanDenCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_VanBanDenCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await kPI_VanBanDenService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_VanBanDenService.create(formData);
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
          <Form.Item<KPI_VanBanDenCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_VanBanDenCreateOrUpdateType>
							label="ID Đồng bộ"
							name="idVanBanDongBo"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Nhập ID Đồng bộ"/>
						</Form.Item>
						<Form.Item<KPI_VanBanDenCreateOrUpdateType>
							label="Số văn bản"
							name="soVanBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Nhập số văn bản"/>
						</Form.Item>
						<Form.Item<KPI_VanBanDenCreateOrUpdateType>
							label="Ngày văn bản"
							name="ngayVanBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<DatePicker format="DD/MM/YYYY" className="w-100" style={{ width: "100%" }} placeholder="Chọn ngày văn bản"/>
						</Form.Item>
						<Form.Item<KPI_VanBanDenCreateOrUpdateType>
							label="Trích yếu"
							name="trichYeu"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Nhập trích yếu"/>
						</Form.Item>
						<Form.Item<KPI_VanBanDenCreateOrUpdateType>
							label="Trạng thái"
							name="trangThai"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Nhập trạng thái"/>
						</Form.Item>
						<Form.Item<KPI_VanBanDenCreateOrUpdateType>
							label="Ngày hoàn thành"
							name="ngayHoanThanh"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<DatePicker format="DD/MM/YYYY" className="w-100" style={{ width: "100%" }} placeholder="Chọn ngày hoàn thành"/>
						</Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default KPI_VanBanDenCreateOrUpdate;
