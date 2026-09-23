import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal } from "antd";
import { toast } from "react-toastify";
import {
  KPI_BoTieuChiDonViCreateOrUpdateType,
  KPI_BoTieuChiDonViType,
} from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";
import * as extensions from "@/utils/extensions";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import dayjs from "dayjs";

interface Props {
  item?: KPI_BoTieuChiDonViType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_BoTieuChiDonViCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_BoTieuChiDonViCreateOrUpdateType>();
  const [donViList, setDonViList] = React.useState<any[]>([]);
  const [dotDanhGiaList, setDotDanhGiaList] = React.useState<any[]>([]);

  const handleOnFinish: FormProps<KPI_BoTieuChiDonViCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_BoTieuChiDonViCreateOrUpdateType) => {
      try {
        // Format dates before sending
        const submitData = { ...formData };
        if (submitData.apDungTuNgay) {
          submitData.apDungTuNgay = dayjs(submitData.apDungTuNgay).format("YYYY-MM-DDTHH:mm:ss") as any;
        }
        if (submitData.apDungToiNgay) {
          submitData.apDungToiNgay = dayjs(submitData.apDungToiNgay).format("YYYY-MM-DDTHH:mm:ss") as any;
        }

        if (props.item) {
          console.log(props);
          const response = await kPI_BoTieuChiDonViService.update(submitData);
          if (response?.status) {
            toast.success("Chỉnh sửa thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            toast.error(response?.message || "Có lỗi xảy ra");
          }
        } else {
          const response = await kPI_BoTieuChiDonViService.create(submitData);
          if (response?.status) {
            toast.success("Thêm mới thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            toast.error(response?.message || "Có lỗi xảy ra");
          }
        }
      } catch (error: any) {
        toast.error("Có lỗi xảy ra: " + error.message);
        console.error(error);
      }
    };

  const handleCancel = () => {
    form.resetFields();
    props.onClose();
  };

  React.useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const donViRes = await departmentService.getDropdownTrucThuocBTC();
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
        apDungTuNgay: props.item.apDungTuNgay ? (dayjs(props.item.apDungTuNgay) as any) : undefined,
        apDungToiNgay: props.item.apDungToiNgay ? (dayjs(props.item.apDungToiNgay) as any) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [form, props.item]);

  return (
    <Modal
      title={
        props.item != null
          ? "Chỉnh sửa bộ tiêu chí đơn vị"
          : "Thêm mới bộ tiêu chí đơn vị"
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
          <Form.Item<KPI_BoTieuChiDonViCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<KPI_BoTieuChiDonViCreateOrUpdateType>
              label="Số quyết định"
              name="soQuyetDinh"
              rules={[
                { required: true, message: "Vui lòng nhập số quyết định!" },
              ]}
            >
              <Input placeholder="Nhập số quyết định" />
            </Form.Item>
            <Form.Item<KPI_BoTieuChiDonViCreateOrUpdateType>
              label="Tên bộ tiêu chí"
              name="tenBoTieuChiDonVi"
              rules={[
                { required: true, message: "Vui lòng nhập tên bộ tiêu chí!" },
              ]}
            >
              <Input placeholder="Nhập tên bộ tiêu chí" />
            </Form.Item>
            <Form.Item<KPI_BoTieuChiDonViCreateOrUpdateType>
              label="Đơn vị áp dụng"
              name="idDonVi"
              rules={[
                { required: true, message: "Vui lòng chọn đơn vị áp dụng!" },
              ]}
            >
              <Select
                options={donViList}
                placeholder="Chọn đơn vị áp dụng"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item<KPI_BoTieuChiDonViCreateOrUpdateType>
              label="Đợt áp dụng"
              name="idDot"
            >
              <Select
                options={dotDanhGiaList}
                placeholder="Chọn đợt áp dụng"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item<KPI_BoTieuChiDonViCreateOrUpdateType>
              label="Áp dụng từ ngày"
              name="apDungTuNgay"
            >
              <DatePicker format="DD/MM/YYYY" className="w-100" placeholder="Chọn ngày bắt đầu" />
            </Form.Item>
            <Form.Item<KPI_BoTieuChiDonViCreateOrUpdateType>
              label="Áp dụng tới ngày"
              name="apDungToiNgay"
            >
              <DatePicker format="DD/MM/YYYY" className="w-100" placeholder="Chọn ngày kết thúc" />
            </Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default KPI_BoTieuChiDonViCreateOrUpdate;
