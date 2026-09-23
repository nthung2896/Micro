import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal, Switch } from "antd";
import { toast } from "react-toastify";
import {
  KPI_BoTieuChiChungCreateOrUpdateType,
  KPI_BoTieuChiChungType,
} from "@/types/kPI_BoTieuChiChung/kPI_BoTieuChiChung";
import KPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import dayjs from "dayjs";
import KPI_BoTieuChiChungTypeConstant from "@/constants/KPI_BoTieuChiChungTypeConstant";

interface Props {
  item?: KPI_BoTieuChiChungType | null;
  isClone?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_BoTieuChiChungCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_BoTieuChiChungCreateOrUpdateType>();
  const [donViList, setDonViList] = React.useState<any[]>([]);
  const [dotDanhGiaList, setDotDanhGiaList] = React.useState<any[]>([]);

  const handleOnFinish: FormProps<KPI_BoTieuChiChungCreateOrUpdateType>["onFinish"] = async (formData: KPI_BoTieuChiChungCreateOrUpdateType) => {
    try {
      const submitData = { ...formData, isActive: !!formData.isActive };
      if (submitData.ngayQuyetDinh) {
        submitData.ngayQuyetDinh = dayjs(submitData.ngayQuyetDinh).format("YYYY-MM-DDTHH:mm:ss") as any;
      }
      if (submitData.apDungTuNgay) {
        submitData.apDungTuNgay = dayjs(submitData.apDungTuNgay).format("YYYY-MM-DDTHH:mm:ss") as any;
      }
      if (submitData.apDungToiNgay) {
        submitData.apDungToiNgay = dayjs(submitData.apDungToiNgay).format("YYYY-MM-DDTHH:mm:ss") as any;
      }

      if (props.isClone && props.item) {
        const response = await KPI_BoTieuChiChungService.clone(props.item.id, submitData);
        if (response.status) {
          toast.success("Sao chép bộ tiêu chí thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message || "Có lỗi xảy ra");
        }
      } else if (props.item) {
        const response = await KPI_BoTieuChiChungService.update({ ...submitData, id: props.item.id });
        if (response.status) {
          toast.success("Chỉnh sửa thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message || "Có lỗi xảy ra");
        }
      } else {
        const response = await KPI_BoTieuChiChungService.create(submitData);
        if (response.status) {
          toast.success("Thêm mới thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message || "Có lỗi xảy ra");
        }
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra: " + error.message);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    props.onClose();
  };

  React.useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const donViRes = await departmentService.getDropdownDonVi();
        if (donViRes.status) setDonViList(donViRes.data || []);

        const dotRes = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
        setDotDanhGiaList(dotRes || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();

    if (props.item) {
      form.setFieldsValue({
        ...props.item,
        tenBoTieuChiDonVi: props.isClone ? `${props.item.tenBoTieuChiDonVi} (Bản sao)` : props.item.tenBoTieuChiDonVi,
        ngayQuyetDinh: props.item.ngayQuyetDinh ? dayjs(props.item.ngayQuyetDinh) as any : undefined,
        apDungTuNgay: props.item.apDungTuNgay ? dayjs(props.item.apDungTuNgay) as any : undefined,
        apDungToiNgay: props.item.apDungToiNgay ? dayjs(props.item.apDungToiNgay) as any : undefined,
        type: props.item.type ?? null,
        isActive: props.item.isActive ?? true,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: null,
        isActive: true,
      });
    }
  }, [form, props.item, props.isClone]);

  return (
    <Modal
      title={props.isClone ? "Sao chép bộ tiêu chí chung" : props.item != null ? "Chỉnh sửa" : "Thêm mới"}
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
        onFinish={handleOnFinish}
        initialValues={{ isActive: true }}
        autoComplete="off"
      >
        <Form.Item<KPI_BoTieuChiChungCreateOrUpdateType>
          label="Số quyết định"
          name="soQuyetDinh"
          rules={[{ required: true, message: "Vui lòng nhập số quyết định!" }]}
        >
          <Input placeholder="Nhập số quyết định" />
        </Form.Item>
        <Form.Item<KPI_BoTieuChiChungCreateOrUpdateType>
          label="Ngày quyết định"
          name="ngayQuyetDinh"
        >
          <DatePicker format="DD/MM/YYYY" className="w-100" placeholder="Chọn ngày quyết định" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item<KPI_BoTieuChiChungCreateOrUpdateType>
          label="Tên bộ tiêu chí"
          name="tenBoTieuChiDonVi"
          rules={[{ required: true, message: "Vui lòng nhập tên bộ tiêu chí!" }]}
        >
          <Input placeholder="Nhập tên bộ tiêu chí" />
        </Form.Item>
        <Form.Item<KPI_BoTieuChiChungCreateOrUpdateType>
          label="Loại bộ tiêu chí"
          name="type"
          rules={[{ required: true, message: "Vui lòng chọn loại bộ tiêu chí!" }]}
        >
          <Select
            allowClear
            placeholder="Chọn loại bộ tiêu chí"
            options={KPI_BoTieuChiChungTypeConstant.getDropdownList()}
          />
        </Form.Item>
        <Form.Item<KPI_BoTieuChiChungCreateOrUpdateType>
          label="Đơn vị áp dụng"
          name="idDonVi"
          rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
        >
          <Select
            options={donViList}
            placeholder="Chọn đơn vị"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item<KPI_BoTieuChiChungCreateOrUpdateType>
          label="Trạng thái kích hoạt"
          name="isActive"
          valuePropName="checked"
        >
          <Switch checkedChildren="Kích hoạt" unCheckedChildren="Tắt" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default KPI_BoTieuChiChungCreateOrUpdate;

