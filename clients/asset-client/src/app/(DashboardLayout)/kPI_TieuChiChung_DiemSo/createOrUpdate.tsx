import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_TieuChiChung_DiemSoCreateOrUpdateType,
  KPI_TieuChiChung_DiemSoType,
} from "@/types/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSo";
import * as extensions from "@/utils/extensions";
import kPI_TieuChiChung_DiemSoService from "@/services/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSoService";

interface Props {
  item?: KPI_TieuChiChung_DiemSoType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_TieuChiChung_DiemSoCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_TieuChiChung_DiemSoCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_TieuChiChung_DiemSoCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_TieuChiChung_DiemSoCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await kPI_TieuChiChung_DiemSoService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_TieuChiChung_DiemSoService.create(formData);
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
          <Form.Item<KPI_TieuChiChung_DiemSoCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_TieuChiChung_DiemSoCreateOrUpdateType>
							label=""
							name="idTieuChiChung"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_TieuChiChung_DiemSoCreateOrUpdateType>
							label=""
							name="idLyLich"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_TieuChiChung_DiemSoCreateOrUpdateType>
							label=""
							name="idDotDanhGia"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder=""/>
						</Form.Item>
						<Form.Item<KPI_TieuChiChung_DiemSoCreateOrUpdateType>
							label=""
							name="diemTuCham"
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
export default KPI_TieuChiChung_DiemSoCreateOrUpdate;
