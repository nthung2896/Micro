import React, { useEffect, useState } from "react";
import { Form, Modal, TreeSelect, Input } from "antd";
import { toast } from "react-toastify";
import kPI_DotDanhGia_DonViService from "@/services/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonViService";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import { DropdownOption } from "@/types/general";

interface Props {
  record: any | null;
  dotType?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalSuaCauHinhDonVi: React.FC<Props> = ({ record, dotType, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [btcDonViOptions, setBtcDonViOptions] = useState<DropdownOption[]>([]);
  const [btcChungOptions, setBtcChungOptions] = useState<DropdownOption[]>([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        // Không truyền idDonVi để lấy toàn bộ danh sách Bộ tiêu chí trong hệ thống
        const [resDonVi, resChung] = await Promise.all([
          kPI_BoTieuChiDonViService.getDropdown(),
          kPI_BoTieuChiChungService.getDropdown(undefined, undefined, dotType),
        ]);
        if (resDonVi?.data) setBtcDonViOptions(resDonVi.data);
        if (resChung?.data) setBtcChungOptions(resChung.data);
      } catch (err) {
        console.error("Lỗi nạp danh mục bộ tiêu chí:", err);
      }
    };

    loadDropdowns();
  }, []);

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        tenDonVi: record.tenDonVi || "—",
        idBoChiSoNhiemVu: record.idBoChiSoNhiemVu || undefined,
        idBoTieuChiChung: record.idBoTieuChiChung || undefined,
      });
    }
  }, [record, form]);

  const handleFinish = async (values: any) => {
    if (!record?.id) return;
    setLoading(true);
    try {
      const payload = {
        id: record.id,
        idDotDanhGia: record.idDotDanhGia,
        idDonVi: record.idDonVi,
        idBoChiSoNhiemVu: values.idBoChiSoNhiemVu || null,
        idBoTieuChiChung: values.idBoTieuChiChung || null,
      };

      const res = await kPI_DotDanhGia_DonViService.update(payload);
      if (res?.status) {
        toast.success("Cập nhật cấu hình đơn vị thành công");
        onSuccess();
        onClose();
      } else {
        toast.error(res?.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật cấu hình đơn vị:", err);
      toast.error("Đã xảy ra lỗi khi cập nhật cấu hình đơn vị");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div
          style={{
            backgroundColor: "#0355a2",
            color: "#ffffff",
            padding: "14px 20px",
            fontSize: "16px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            textAlign: "center",
            width: "100%",
          }}
        >
          Chỉnh sửa cấu hình đợt đánh giá
        </div>
      }
      closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", fontWeight: "bold" }}>✕</span>}
      styles={{
        header: {
          padding: 0,
          margin: 0,
          backgroundColor: "#0355a2",
          borderRadius: "8px 8px 0 0",
          overflow: "hidden",
        },
        // content: {
        //   padding: 0,
        //   borderRadius: "8px",
        //   overflow: "hidden",
        // },
        body: {
          padding: "20px 24px",
        },
      }}
      open={!!record}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Lưu thay đổi"
      cancelText="Đóng"
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 8 }}>
        <Form.Item label={<span style={{ fontWeight: 600 }}>Đơn vị / Phòng ban</span>} name="tenDonVi">
          <Input disabled style={{ fontWeight: 600, color: "#1f2937", backgroundColor: "#f5f5f5" }} />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Bộ tiêu chí đơn vị (Nhiệm vụ)</span>}
          name="idBoChiSoNhiemVu"
        >
          <TreeSelect
            showSearch
            allowClear
            style={{ width: "100%" }}
            placeholder="Chọn bộ tiêu chí đơn vị"
            treeData={btcDonViOptions.map((opt) => ({
              value: opt.value,
              title: opt.label,
              label: opt.label,
            }))}
            treeNodeFilterProp="title"
          />
        </Form.Item>

        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Bộ tiêu chí chung (Phần I)</span>}
          name="idBoTieuChiChung"
        >
          <TreeSelect
            showSearch
            allowClear
            style={{ width: "100%" }}
            placeholder="Chọn bộ tiêu chí chung"
            treeData={btcChungOptions.map((opt) => ({
              value: opt.value,
              title: opt.label,
              label: opt.label,
            }))}
            treeNodeFilterProp="title"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalSuaCauHinhDonVi;
