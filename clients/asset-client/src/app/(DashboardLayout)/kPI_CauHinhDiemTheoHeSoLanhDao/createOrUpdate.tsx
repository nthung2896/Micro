import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal, InputNumber } from "antd";
import { toast } from "react-toastify";
import {
  KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType,
  KPI_CauHinhDiemTheoHeSoLanhDaoType,
} from "@/types/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDao";
import * as extensions from "@/utils/extensions";
import { apiService } from "@/services";
import kPI_CauHinhDiemTheoHeSoLanhDaoService from "@/services/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDaoService";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";

interface Props {
  item?: KPI_CauHinhDiemTheoHeSoLanhDaoType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType>();
  const [chucVuOptions, setChucVuOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [boTieuChiOptions, setBoTieuChiOptions] = React.useState<{ value: string; label: string }[]>([]);

  React.useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const [resChucVu, resBoTieuChi, resBoTieuChiDonVi] = await Promise.all([
          apiService.get<any>("/DM_DuLieuDanhMuc/GetDropdownCode/CHUCVUVNU"),
          kPI_BoTieuChiChungService.getDropdown(),
          kPI_BoTieuChiDonViService.getDropdown()
        ]);
        if (resChucVu?.data) {
          setChucVuOptions(resChucVu.data);
        }
        let mergedBoTieuChi: {value: string, label: string}[] = [];
        if (resBoTieuChi?.data) {
          mergedBoTieuChi = [...mergedBoTieuChi, ...resBoTieuChi.data];
        }
        if (resBoTieuChiDonVi?.data) {
          mergedBoTieuChi = [...mergedBoTieuChi, ...resBoTieuChiDonVi.data];
        }
        setBoTieuChiOptions(mergedBoTieuChi);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchDropdown();
  }, []);

  const handleOnFinish: FormProps<KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType) => {
      try {
        if (props.item) {
          const response = await kPI_CauHinhDiemTheoHeSoLanhDaoService.update(formData);
          if (response?.status) {
            toast.success("Chỉnh sửa thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            toast.error(response?.message || "Có lỗi xảy ra");
          }
        } else {
          const response = await kPI_CauHinhDiemTheoHeSoLanhDaoService.create(formData);
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
        toast.error("Lỗi: " + (error?.response?.data?.message || error.message));
        console.error(error);
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
          ? "Chỉnh sửa Cấu hình điểm hệ số lãnh đạo"
          : "Thêm mới Cấu hình điểm hệ số lãnh đạo"
      }
      open={true}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width={600}
      destroyOnClose
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
          <Form.Item<KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        <>
          <Form.Item<KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType>
            label="Chức vụ"
            name="chucVu"
            rules={[
              { required: true, message: "Vui lòng nhập thông tin này!" },
            ]}
          >
            <Select
              placeholder="Chọn chức vụ"
              options={chucVuOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item<KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType>
            label="Hệ số"
            name="heSo"
            rules={[
              { required: true, message: "Vui lòng nhập thông tin này!" },
            ]}
          >
            <InputNumber 
              placeholder="Hệ số" 
              style={{ width: "100%" }} 
              step={0.1}
            />
          </Form.Item>
          <Form.Item<KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType>
            label="Bộ tiêu chí"
            name="idBoTieuChi"
            rules={[
              { required: true, message: "Vui lòng nhập thông tin này!" },
            ]}
          >
            <Select
              placeholder="Chọn bộ tiêu chí"
              options={boTieuChiOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </>
      </Form>
    </Modal>
  );
};
export default KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdate;
