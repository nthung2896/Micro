import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Select, InputNumber, Space, ConfigProvider } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import kPI_CauHinhDiemTheoHeSoLanhDaoService from "@/services/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDaoService";
import DM_DuLieuDanhMucServiceGenerated from "@/services/generated/dM_DuLieuDanhMucService.generated";
import { KPI_BoTieuChiDonViType } from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";
import { KPI_CauHinhDiemTheoHeSoLanhDaoType } from "@/types/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDao";

interface Props {
  open: boolean;
  onClose: () => void;
  boTieuChi: KPI_BoTieuChiDonViType | null;
  onSuccess?: () => void;
}

export const CauHinhDiemLanhDaoModal: React.FC<Props> = ({ open, onClose, boTieuChi, onSuccess }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chucVuList, setChucVuList] = useState<any[]>([]);

  const dmService = new DM_DuLieuDanhMucServiceGenerated();

  useEffect(() => {
    if (open) {
      loadChucVu();
    }
  }, [open]);

  useEffect(() => {
    if (open && boTieuChi?.id) {
      loadData();
    }
  }, [open, boTieuChi]);

  const loadChucVu = async () => {
    try {
      const res = await dmService.getAllByGroupCode("CHUCVUVNU");
      if (res?.data) {
        setChucVuList(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await kPI_CauHinhDiemTheoHeSoLanhDaoService.getData({
        pageIndex: 1,
        pageSize: 100,
        idBoTieuChi: boTieuChi!.id
      });
      if (res?.data?.items) {
        setData(res.data.items.map((item: any) => ({ ...item, tempId: item.id || Date.now() + Math.random() })));
      } else {
        setData([]);
      }
    } catch (err) {
      toast.error("Lỗi khi tải cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setData([...data, { tempId: Date.now() + Math.random(), chucVu: null, heSo: 1 }]);
  };

  const handleRemoveRow = (tempId: any) => {
    setData(data.filter((d) => d.tempId !== tempId));
  };

  const handleChange = (tempId: any, field: string, value: any) => {
    setData(
      data.map((d) => {
        if (d.tempId === tempId) {
          return { ...d, [field]: value };
        }
        return d;
      })
    );
  };

  const handleSave = async () => {
    if (!boTieuChi?.id) return;
    
    // validate
    if (data.some(d => !d.chucVu || d.heSo == null)) {
      toast.warning("Vui lòng nhập đầy đủ thông tin chức vụ và hệ số!");
      return;
    }

    const listData = data.map(d => ({
      chucVu: d.chucVu,
      heSo: d.heSo,
    }));

    setLoading(true);
    try {
      const res = await kPI_CauHinhDiemTheoHeSoLanhDaoService.saveList(listData as any, boTieuChi.id);
      if (res?.status) {
        toast.success("Lưu cấu hình thành công!");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res?.message || "Lỗi khi lưu cấu hình!");
      }
    } catch (err: any) {
      toast.error("Lỗi khi lưu cấu hình: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Chức vụ lãnh đạo",
      dataIndex: "chucVu",
      key: "chucVu",
      render: (text: any, record: any) => (
        <Select
          style={{ width: "100%" }}
          value={text}
          onChange={(val) => handleChange(record.tempId, "chucVu", val)}
          placeholder="Chọn chức vụ"
          options={chucVuList.map((c) => ({ label: c.name, value: c.code }))}
          showSearch
          filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
        />
      ),
    },
    {
      title: "Hệ số",
      dataIndex: "heSo",
      key: "heSo",
      width: 150,
      render: (text: any, record: any) => (
        <InputNumber
          style={{ width: "100%" }}
          value={text}
          onChange={(val) => handleChange(record.tempId, "heSo", val)}
          min={0}
          step={0.1}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Button danger icon={<DeleteOutlined />} onClick={() => handleRemoveRow(record.tempId)} />
      ),
    },
  ];

  const styledColumns = columns.map((col) => ({
    ...col,
    onHeaderCell: () => ({
      style: {
        backgroundColor: "#0355a2",
        color: "#ffffff",
        fontWeight: 600,
      },
    }),
  }));

  return (
    <Modal
      title={
        <div style={{ paddingRight: 40, color: "#ffffff", fontWeight: "bold", fontSize: "14px", lineHeight: "1.4", textAlign: "center", textTransform: "uppercase" }}>
          CẤU HÌNH ĐIỂM THEO HỆ SỐ LÃNH ĐẠO - {boTieuChi?.tenBoTieuChiDonVi || ""}
        </div>
      }
      styles={{
        header: { background: "#0355a2", padding: "12px 16px", margin: "-20px -24px 16px -24px", borderRadius: "8px 8px 0 0" }
      }}
      closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", fontWeight: "bold" }}>✕</span>}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      okText="Lưu lại"
      cancelText="Đóng"
      width={800}
      confirmLoading={loading}
    >
      <div style={{ marginBottom: 16 }}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddRow} block style={{ borderColor: "#0355a2", color: "#0355a2", fontWeight: 500 }}>
          + Thêm dòng
        </Button>
      </div>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: "#0355a2",
              headerColor: "#ffffff",
            },
          },
        }}
      >
        <Table
          dataSource={data}
          columns={styledColumns}
          rowKey="tempId"
          pagination={false}
          bordered
          size="small"
          loading={loading}
        />
      </ConfigProvider>
    </Modal>
  );
};
