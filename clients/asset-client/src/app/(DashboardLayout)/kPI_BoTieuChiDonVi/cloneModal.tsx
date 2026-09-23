import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { toast } from "react-toastify";
import { KPI_BoTieuChiDonViType } from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";

interface CloneModalProps {
  item: KPI_BoTieuChiDonViType | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CloneModal: React.FC<CloneModalProps> = ({ item, open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [donViList, setDonViList] = useState<any[]>([]);
  const [dotList, setDotList] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;

    const fetchDropdowns = async () => {
      try {
        const donViRes = await departmentService.getDropdownTrucThuocBTC();
        if (donViRes?.status) {
          setDonViList(donViRes.data || []);
        }

        const dotRes = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
        setDotList(dotRes || []);
      } catch (err) {
        console.error("Lỗi khi tải danh mục cho modal nhân bản:", err);
      }
    };

    fetchDropdowns();

    if (item) {
      form.setFieldsValue({
        tenBoTieuChiDonVi: item.tenBoTieuChiDonVi ? `${item.tenBoTieuChiDonVi} (Bản sao)` : "",
        idDonVi: item.idDonVi || undefined,
        idDot: item.idDot || undefined,
      });
    }
  }, [open, item, form]);

  const handleFinish = async (values: any) => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const response = await kPI_BoTieuChiDonViService.clone(item.id, {
        tenBoTieuChiDonVi: values.tenBoTieuChiDonVi,
        idDonVi: values.idDonVi,
        idDot: values.idDot,
      });

      if (response?.status) {
        toast.success("Nhân bản bộ tiêu chí thành công");
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        toast.error(response?.message || "Nhân bản thất bại");
      }
    } catch (error: any) {
      toast.error("Lỗi khi nhân bản bộ tiêu chí: " + (error?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Nhân bản bộ tiêu chí"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Nhân bản"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Tên bộ tiêu chí"
          name="tenBoTieuChiDonVi"
          rules={[{ required: true, message: "Vui lòng nhập tên bộ tiêu chí!" }]}
        >
          <Input placeholder="Nhập tên bộ tiêu chí" />
        </Form.Item>

        <Form.Item
          label="Đơn vị áp dụng"
          name="idDonVi"
          rules={[{ required: true, message: "Vui lòng chọn đơn vị áp dụng!" }]}
        >
          <Select
            placeholder="Chọn đơn vị áp dụng"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              ((option?.label ?? "") as string).toLowerCase().includes(input.toLowerCase())
            }
            options={donViList}
          />
        </Form.Item>

        <Form.Item
          label="Đợt áp dụng"
          name="idDot"
          rules={[{ required: true, message: "Vui lòng chọn đợt áp dụng!" }]}
        >
          <Select
            placeholder="Chọn đợt áp dụng"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              ((option?.label ?? "") as string).toLowerCase().includes(input.toLowerCase())
            }
            options={dotList}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CloneModal;
