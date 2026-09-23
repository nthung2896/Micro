import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_PhieuDanhGiaCreateOrUpdateType,
  KPI_PhieuDanhGiaType,
} from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";
import * as extensions from "@/utils/extensions";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import departmentService from "@/services/department/department.service";
import { DropdownOption } from "@/types/general";

interface Props {
  item?: KPI_PhieuDanhGiaType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_PhieuDanhGiaCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_PhieuDanhGiaCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_PhieuDanhGiaCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_PhieuDanhGiaCreateOrUpdateType) => {
      if (props.item) {
        console.log(props);
        const response = await kPI_PhieuDanhGiaService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_PhieuDanhGiaService.create(formData);
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

  const [donViOptions, setDonViOptions] = React.useState<DropdownOption[]>([]);
  const [phongBanOptions, setPhongBanOptions] = React.useState<DropdownOption[]>([]);

  const selectedDonVi = Form.useWatch("donVi", form);

  React.useEffect(() => {
    const fetchDonVi = async () => {
      try {
        const res = await departmentService.getDropdownTrucThuocBTC();
        if (res && res.data) {
          setDonViOptions(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn vị:", error);
      }
    };
    fetchDonVi();
  }, []);

  React.useEffect(() => {
    const fetchPhongBan = async () => {
      try {
        const res = await departmentService.getDropdownLevel1(selectedDonVi);
        if (res && res.data) {
          setPhongBanOptions(res.data);
        } else {
          setPhongBanOptions([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng ban:", error);
      }
    };
    fetchPhongBan();
  }, [selectedDonVi]);

  React.useEffect(() => {
    if (props.item) {
      let donViVal = props.item.donVi && props.item.donVi !== "00000000-0000-0000-0000-000000000000" ? props.item.donVi : undefined;
      
      if (!donViVal && props.item.tenDonVi && donViOptions.length > 0) {
        const matched = donViOptions.find(o => o.label === props.item?.tenDonVi || o.value === props.item?.donVi);
        if (matched) donViVal = matched.value;
      }

      let phongBanVal = props.item.phongBan && props.item.phongBan !== "00000000-0000-0000-0000-000000000000" ? props.item.phongBan : undefined;

      form.setFieldsValue({
        ...props.item,
        donVi: donViVal,
        phongBan: phongBanVal,
      });
    }
  }, [form, props.item, donViOptions]);

  React.useEffect(() => {
    if (props.item && phongBanOptions.length > 0) {
      let currentPb = form.getFieldValue("phongBan");
      if (!currentPb && props.item.tenPhongBan) {
        const matchedPb = phongBanOptions.find(o => o.label === props.item?.tenPhongBan || o.value === props.item?.phongBan);
        if (matchedPb) {
          form.setFieldValue("phongBan", matchedPb.value);
        }
      }
    }
  }, [phongBanOptions, props.item, form]);

  return (
    <Modal
      title={
        props.item != null
          ? "Chỉnh sửa phiếu đánh giá"
          : "Thêm mới phiếu đánh giá"
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
          <Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            {props.item ? (
              <Form.Item label="Họ tên / Cán bộ">
                <Input value={props.item.hoTen || props.item.idLyLich} disabled />
                <Form.Item name="idLyLich" hidden>
                  <Input />
                </Form.Item>
              </Form.Item>
            ) : (
              <Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
                label="Họ tên / Mã lý lịch"
                name="idLyLich"
                rules={[
                  { required: true, message: "Vui lòng nhập thông tin này!" },
                ]}
              >
                <Input placeholder="Nhập họ tên hoặc mã lý lịch"/>
              </Form.Item>
            )}
						<Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
							label="Đơn vị"
							name="donVi"
							rules={[
								{ required: true, message: "Vui lòng chọn đơn vị!" },
							]}
						>
							<Select
								placeholder="Chọn đơn vị"
								options={donViOptions}
								showSearch
								allowClear
								onChange={() => form.setFieldValue("phongBan", undefined)}
								filterOption={(input, option) =>
									(option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
								}
							/>
						</Form.Item>
						<Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
							label="Phòng ban"
							name="phongBan"
							rules={[
								{ required: true, message: "Vui lòng chọn phòng ban!" },
							]}
						>
							<Select
								placeholder="Chọn phòng ban"
								options={phongBanOptions}
								showSearch
								allowClear
								filterOption={(input, option) =>
									(option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
								}
							/>
						</Form.Item>
						<Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
							label="Điểm tiêu chí chung"
							name="diemTieuChiChung"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Điểm tiêu chí chung"/>
						</Form.Item>
						<Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
							label="Điểm thực hiện nhiệm vụ"
							name="diemThucHienNhiemVu"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Điểm thực hiện nhiệm vụ"/>
						</Form.Item>
						<Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
							label="Tổng điểm"
							name="tongDiem"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Tổng điểm"/>
						</Form.Item>
						<Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
							label="Ưu điểm"
							name="uuDiem"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Ưu điểm"/>
						</Form.Item>
						<Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
							label="Hạn chế"
							name="hanChe"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Hạn chế"/>
						</Form.Item>
						<Form.Item<KPI_PhieuDanhGiaCreateOrUpdateType>
							label="Ý kiến nhận xét"
							name="yKienNhanXet"
								rules={[
		{ required: true, message: "Vui lòng nhập thông tin này!" },
	]}
>
							<Input placeholder="Ý kiến nhận xét"/>
						</Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default KPI_PhieuDanhGiaCreateOrUpdate;
