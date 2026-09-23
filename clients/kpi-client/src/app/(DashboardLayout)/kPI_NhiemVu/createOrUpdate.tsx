import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_NhiemVuCreateOrUpdateType,
  KPI_NhiemVuType,
} from "@/types/kPI_NhiemVu/kPI_NhiemVu";
import * as extensions from "@/utils/extensions";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";

interface Props {
  item?: KPI_NhiemVuType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_NhiemVuCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_NhiemVuCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_NhiemVuCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_NhiemVuCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await kPI_NhiemVuService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_NhiemVuService.create(formData);
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
          <Form.Item<KPI_NhiemVuCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="IdNhiemVuTraVe"
							name="idNhiemVuTraVe"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IdNhiemVuTraVe"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="TenNhiemVuDayDu"
							name="tenNhiemVuDayDu"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="TenNhiemVuDayDu"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="TenNhiemVuRutGon"
							name="tenNhiemVuRutGon"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="TenNhiemVuRutGon"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="MaLoaiNhiemVu"
							name="maLoaiNhiemVu"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="MaLoaiNhiemVu"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="TenLoaiNhiemVu"
							name="tenLoaiNhiemVu"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="TenLoaiNhiemVu"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="NhiemVuTrongTam"
							name="nhiemVuTrongTam"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="NhiemVuTrongTam"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="ThoiHan"
							name="thoiHan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<DatePicker format="DD/MM/YYYY" className="w-100" style={{ width: "100%" }} placeholder="ThoiHan"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="NgayHoanThanh"
							name="ngayHoanThanh"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<DatePicker format="DD/MM/YYYY" className="w-100" style={{ width: "100%" }} placeholder="NgayHoanThanh"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="NgayVanBan"
							name="ngayVanBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<DatePicker format="DD/MM/YYYY" className="w-100" style={{ width: "100%" }} placeholder="NgayVanBan"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="MaNhiemVuCha"
							name="maNhiemVuCha"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="MaNhiemVuCha"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="LoaiHanXuLy"
							name="loaiHanXuLy"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="LoaiHanXuLy"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="Email"
							name="email"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Email"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="IdDotTheoDoiDanhGia"
							name="idDotTheoDoiDanhGia"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IdDotTheoDoiDanhGia"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="IdLyLich"
							name="idLyLich"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IdLyLich"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="IdPhongBan"
							name="idPhongBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IdPhongBan"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="TenPhongBan"
							name="tenPhongBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="TenPhongBan"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="IdNguoiXuLy"
							name="idNguoiXuLy"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IdNguoiXuLy"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="TenNguoiXuLy"
							name="tenNguoiXuLy"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="TenNguoiXuLy"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="IdLinhVuc"
							name="idLinhVuc"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IdLinhVuc"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="TenLinhVuc"
							name="tenLinhVuc"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="TenLinhVuc"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="SoLanCapNhatTienDo"
							name="soLanCapNhatTienDo"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="SoLanCapNhatTienDo"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="IsHoanThanh"
							name="isHoanThanh"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IsHoanThanh"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="IsDaDuyet"
							name="isDaDuyet"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="IsDaDuyet"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="Status"
							name="status"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Status"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="KetQuaXuLyMoiNhat"
							name="ketQuaXuLyMoiNhat"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="KetQuaXuLyMoiNhat"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="KetQuaTuXepLoai"
							name="ketQuaTuXepLoai"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="KetQuaTuXepLoai"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="KetQuaPhoPhongXepLoai"
							name="ketQuaPhoPhongXepLoai"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="KetQuaPhoPhongXepLoai"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="KetQuaLanhDaoXepLoai"
							name="ketQuaLanhDaoXepLoai"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="KetQuaLanhDaoXepLoai"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="Type"
							name="type"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Type"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="TypeCaNhanTruongBan"
							name="typeCaNhanTruongBan"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="TypeCaNhanTruongBan"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="EmailsNguoiThucHien"
							name="emailsNguoiThucHien"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="EmailsNguoiThucHien"/>
						</Form.Item>
						<Form.Item<KPI_NhiemVuCreateOrUpdateType>
							label="TimeDongBo"
							name="timeDongBo"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<DatePicker format="DD/MM/YYYY" className="w-100" style={{ width: "100%" }} placeholder="TimeDongBo"/>
						</Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default KPI_NhiemVuCreateOrUpdate;
