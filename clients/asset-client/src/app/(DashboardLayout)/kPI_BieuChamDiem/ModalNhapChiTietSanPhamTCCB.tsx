"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, Card, Row, Col, Divider, Space, Tag } from "antd";
import { SearchOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import ModalChonTieuChi from "./ModalChonTieuChi";

interface ModalNhapChiTietSanPhamTCCBProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (productData: any) => void;
  initialData?: any;
  chucVuHeSo?: number | null;
  idDotDanhGia?: string | null;
  tenNhiemVu?: string;
  idLyLich?: string | null;
  donViId?: string | null;
}

const round2 = (val: any) => {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  if (!Number.isFinite(num)) return val;
  return Number(num.toFixed(2));
};

// Số lượng hoàn thành là số đếm nên luôn lưu và hiển thị dưới dạng số nguyên.
const roundQuantity = (val: any) => {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  if (!Number.isFinite(num)) return val;
  return Math.round(num);
};

const formatScore = (val: any) => {
  if (val === null || val === undefined || val === "") return "";
  const num = Number(val);
  if (!Number.isFinite(num)) return String(val);
  return Number(num.toFixed(2)).toString();
};

const formatPercent = (val: any) => {
  if (val === null || val === undefined || val === "") return "";
  const num = Number(val);
  if (!Number.isFinite(num)) return `${val}%`;
  return `${Number(num.toFixed(2))}%`;
};

const ModalNhapChiTietSanPhamTCCB: React.FC<ModalNhapChiTietSanPhamTCCBProps> = ({
  visible,
  onCancel,
  onSave,
  initialData,
  chucVuHeSo = null,
  idDotDanhGia,
  tenNhiemVu = "",
  idLyLich,
  donViId,
}) => {
  const [form] = Form.useForm();
  const [chonTieuChiVisible, setChonTieuChiVisible] = useState(false);
  const [selectedTieuChiName, setSelectedTieuChiName] = useState<string>("");

  useEffect(() => {
    if (visible) {
      const initValues = {
        tenSanPhamDauRa: initialData?.tenSanPhamDauRa || "",
        moTaCongViec: initialData?.moTaCongViec || "",
        tieuChiId: initialData?.tieuChiId || null,
        tenTieuChi: initialData?.tenTieuChi || "",
        diemTheoBoTieuChi: round2(initialData?.diemTheoBoTieuChi) ?? 0,
        chamDiemSoLuong_HoanThanh: roundQuantity(initialData?.chamDiemSoLuong_HoanThanh),
        chamDiemSoLuong_KhongHoanThanh: round2(initialData?.chamDiemSoLuong_KhongHoanThanh),
        chamDiemSoLuong_Diem: round2(initialData?.chamDiemSoLuong_Diem),
        chamDiemChatLuong_KhongDat: round2(initialData?.chamDiemChatLuong_KhongDat),
        chamDiemChatLuong_SoDiemConLai: round2(initialData?.chamDiemChatLuong_SoDiemConLai),
        chamDiemChatLuong_Diem: round2(initialData?.chamDiemChatLuong_Diem),
        chamDiemTienDo_KhongDat: round2(initialData?.chamDiemTienDo_KhongDat),
        chamDiemTienDo_SoDiemConLai: round2(initialData?.chamDiemTienDo_SoDiemConLai),
        chamDiemTienDo_Diem: round2(initialData?.chamDiemTienDo_Diem),
        ghiChuGiaTrinh: initialData?.ghiChuGiaTrinh || "",
      };
      setSelectedTieuChiName(initialData?.tenTieuChi || initialData?.tieuChiId || "");
      form.setFieldsValue(initValues);
    } else {
      form.resetFields();
      setSelectedTieuChiName("");
    }
  }, [visible, initialData, form]);

  const handleClearTieuChi = () => {
    setSelectedTieuChiName("");
    form.setFieldsValue({
      tieuChiId: null,
      tenTieuChi: "",
      diemTheoBoTieuChi: 0,
      chamDiemSoLuong_HoanThanh: 0,
      chamDiemSoLuong_KhongHoanThanh: 0,
      chamDiemSoLuong_Diem: 0,
      chamDiemChatLuong_SoDiemConLai: 0,
      chamDiemChatLuong_Diem: 0,
      chamDiemTienDo_SoDiemConLai: 0,
      chamDiemTienDo_Diem: 0,
    });
  };

  const calculateScores = (changedValues: any, allValues: any) => {
    const baseScore = Number(allValues.diemTheoBoTieuChi || 0);
    const maxScore = (chucVuHeSo !== null && chucVuHeSo !== undefined) ? baseScore * chucVuHeSo : baseScore;

    const updates: any = {};

    // 1. So luong
    if ("chamDiemSoLuong_HoanThanh" in changedValues || "diemTheoBoTieuChi" in changedValues) {
      const ht = Number(allValues.chamDiemSoLuong_HoanThanh || 0);
      const kht = Math.max(0, maxScore - ht);
      const diemPct = maxScore > 0 ? (ht / maxScore) * 100 : 0;
      updates.chamDiemSoLuong_KhongHoanThanh = Number(kht.toFixed(2));
      updates.chamDiemSoLuong_Diem = Number(Math.max(0, Math.min(100, diemPct)).toFixed(2));
    } else if ("chamDiemSoLuong_KhongHoanThanh" in changedValues) {
      const kht = Number(allValues.chamDiemSoLuong_KhongHoanThanh || 0);
      const ht = Math.max(0, maxScore - kht);
      const completedQuantity = Math.round(ht);
      updates.chamDiemSoLuong_HoanThanh = completedQuantity;
      updates.chamDiemSoLuong_Diem = Number(Math.max(0, Math.min(100, (completedQuantity / maxScore) * 100)).toFixed(2));
    }

    // 2. Chat luong
    if ("chamDiemChatLuong_KhongDat" in changedValues || "diemTheoBoTieuChi" in changedValues) {
      const kd = Number(allValues.chamDiemChatLuong_KhongDat || 0);
      const conLai = Math.max(0, maxScore - (kd * 0.25 * maxScore));
      const diemPct = maxScore > 0 ? (conLai / maxScore) * 100 : 0;
      updates.chamDiemChatLuong_SoDiemConLai = Number(conLai.toFixed(2));
      updates.chamDiemChatLuong_Diem = Number(Math.max(0, Math.min(100, diemPct)).toFixed(2));
    }

    // 3. Tien do
    if ("chamDiemTienDo_KhongDat" in changedValues || "diemTheoBoTieuChi" in changedValues) {
      const cm = Number(allValues.chamDiemTienDo_KhongDat || 0);
      const conLai = Math.max(0, maxScore - (cm * 0.25 * maxScore));
      const diemPct = maxScore > 0 ? (conLai / maxScore) * 100 : 0;
      updates.chamDiemTienDo_SoDiemConLai = Number(conLai.toFixed(2));
      updates.chamDiemTienDo_Diem = Number(Math.max(0, Math.min(100, diemPct)).toFixed(2));
    }

    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
  };

  const handleFinish = (values: any) => {
    const rawValues = { ...form.getFieldsValue(true), ...values };
    const allValues = {
      ...rawValues,
      moTaCongViec: rawValues.moTaCongViec || "",
      diemTheoBoTieuChi: round2(rawValues.diemTheoBoTieuChi) ?? 0,
      chamDiemSoLuong_HoanThanh: roundQuantity(rawValues.chamDiemSoLuong_HoanThanh),
      chamDiemSoLuong_KhongHoanThanh: round2(rawValues.chamDiemSoLuong_KhongHoanThanh),
      chamDiemSoLuong_Diem: round2(rawValues.chamDiemSoLuong_Diem),
      chamDiemChatLuong_KhongDat: round2(rawValues.chamDiemChatLuong_KhongDat),
      chamDiemChatLuong_SoDiemConLai: round2(rawValues.chamDiemChatLuong_SoDiemConLai),
      chamDiemChatLuong_Diem: round2(rawValues.chamDiemChatLuong_Diem),
      chamDiemTienDo_KhongDat: round2(rawValues.chamDiemTienDo_KhongDat),
      chamDiemTienDo_SoDiemConLai: round2(rawValues.chamDiemTienDo_SoDiemConLai),
      chamDiemTienDo_Diem: round2(rawValues.chamDiemTienDo_Diem),
    };
    onSave(allValues);
    onCancel();
  };

  const handleSelectTieuChi = (records: any[]) => {
    if (records && records.length > 0) {
      const selected = records[0];

      let pathParts: string[] = [];
      if (selected.rootName) {
        pathParts.push(selected.rootName);
      }
      for (let i = 1; i <= 5; i++) {
        const levelVal = selected[`level${i}Name`];
        if (levelVal) {
          pathParts.push(levelVal);
        }
      }
      const tieuChiName = pathParts.length > 0
        ? pathParts.join(' / ')
        : (selected.congViecChiTiet || selected.tenNhomTieuChi || selected.id);

      const productName = selected.sanPhamDauRa || selected.congViecChiTiet || selected.tenNhomTieuChi;
      const diem = Number(selected.diem || selected.diemBoTieuChi || 0);
      const diemCoSo = (chucVuHeSo !== null && chucVuHeSo !== undefined) ? diem * chucVuHeSo : diem;
      const allValues = form.getFieldsValue(true);
      const soLanKhongDat = Number(allValues.chamDiemChatLuong_KhongDat || 0);
      const soLanCham = Number(allValues.chamDiemTienDo_KhongDat || 0);

      setSelectedTieuChiName(tieuChiName);

      const updates: any = {
        tieuChiId: selected.id,
        tenTieuChi: tieuChiName,
        diemTheoBoTieuChi: Number(diem.toFixed(2)),
        // Khi chọn tiêu chí mới, mặc định hoàn thành toàn bộ điểm được giao.
        chamDiemSoLuong_HoanThanh: Math.round(diemCoSo),
        chamDiemSoLuong_KhongHoanThanh: 0,
        chamDiemSoLuong_Diem: diemCoSo > 0 ? 100 : 0,
        chamDiemChatLuong_SoDiemConLai: Number(Math.max(0, diemCoSo - soLanKhongDat * 0.25 * diemCoSo).toFixed(2)),
        chamDiemChatLuong_Diem: diemCoSo > 0
          ? Number(Math.max(0, Math.min(100, 100 - soLanKhongDat * 25)).toFixed(2))
          : 0,
        chamDiemTienDo_SoDiemConLai: Number(Math.max(0, diemCoSo - soLanCham * 0.25 * diemCoSo).toFixed(2)),
        chamDiemTienDo_Diem: diemCoSo > 0
          ? Number(Math.max(0, Math.min(100, 100 - soLanCham * 25)).toFixed(2))
          : 0,
      };

      if (productName) {
        updates.tenSanPhamDauRa = productName;
      }

      form.setFieldsValue(updates);
    }
    setChonTieuChiVisible(false);
  };

  return (
    <>
      <Modal
        title={
          <div style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff" }}>
            Chi tiết thông tin sản phẩm đầu ra & chấm điểm tiêu chí
          </div>
        }
        closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
        open={visible}
        onCancel={onCancel}
        width={800}
        style={{ top: 15 }}
        styles={{
          header: { background: '#0355a2', padding: '12px 16px', marginBottom: 0, borderRadius: '8px 8px 0 0' },
          body: { maxHeight: 'calc(85vh - 100px)', overflowY: 'auto', overflowX: 'hidden', padding: 0 },
          footer: { borderTop: '1px solid #f0f0f0', padding: '6px 10px', margin: 0 }
        }}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" icon={<CheckOutlined />} onClick={() => form.submit()}>
            Lưu sản phẩm
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onValuesChange={(changed, all) => calculateScores(changed, all)}
          style={{ paddingTop: "2px" }}
        >
          <Form.Item name="tieuChiId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="tenTieuChi" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="moTaCongViec"
            label={<span style={{ fontWeight: 600 }}>Mô tả công việc</span>}
            style={{ marginBottom: "10px" }}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả công việc" />
          </Form.Item>

          <Form.Item
            name="tenSanPhamDauRa"
            label={<span style={{ fontWeight: 600 }}>Tên sản phẩm đầu ra</span>}
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm đầu ra" }]}
            style={{ marginBottom: "10px" }}
          >
            <Input placeholder="Nhập tên sản phẩm đầu ra" />
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 600 }}>Căn cứ chấm theo Bộ tiêu chí</span>} style={{ marginBottom: "10px" }}>
            <Space style={{ width: "100%", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontStyle: selectedTieuChiName ? "normal" : "italic", color: selectedTieuChiName ? "#333" : "#888", display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {selectedTieuChiName ? (
                  <>
                    <Tag
                      color="blue"
                      closable
                      onClose={(e) => {
                        e.preventDefault();
                        handleClearTieuChi();
                      }}
                      style={{ whiteSpace: 'normal', height: 'auto', padding: '4px 8px', fontSize: '13px', display: 'flex', alignItems: 'center', margin: 0 }}
                    >
                      {selectedTieuChiName}
                    </Tag>
                    <Button
                      size="small"
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={handleClearTieuChi}
                      title="Xóa tiêu chí đã chọn"
                    >
                      Xóa tiêu chí
                    </Button>
                  </>
                ) : (
                  "Chưa chọn tiêu chí"
                )}
              </div>
              <Button
                type="dashed"
                icon={<SearchOutlined />}
                onClick={() => setChonTieuChiVisible(true)}
              >
                {selectedTieuChiName ? "Thay đổi tiêu chí" : "Chọn tiêu chí từ bộ"}
              </Button>
            </Space>
          </Form.Item>

          <Form.Item
            name="diemTheoBoTieuChi"
            label={<span style={{ fontWeight: 600 }}>Điểm tối đa theo Bộ tiêu chí</span>}
            style={{ marginBottom: "15px" }}
          >
            <InputNumber
              style={{ width: "200px" }}
              min={0}
              placeholder="0"
              addonAfter="điểm"
              formatter={formatScore}
              disabled
            />
          </Form.Item>

          <Card size="small" style={{ backgroundColor: "#f9fafb", marginBottom: "10px", borderRadius: "8px" }} styles={{ body: { padding: '8px 8px' } }}>
            <Row gutter={8}>
              <Col span={8}>
                <div style={{ fontWeight: 600, color: "#1890ff", marginBottom: "8px", fontSize: "13px" }}>
                  Chấm điểm Số lượng
                </div>
                <Form.Item name="chamDiemSoLuong_HoanThanh" label={<span style={{ fontWeight: 600 }}>SL Hoàn thành</span>} style={{ marginBottom: "8px" }}>
                  <InputNumber style={{ width: "100%" }} min={0} step={1} precision={0} placeholder="HT" />
                </Form.Item>
                <Form.Item name="chamDiemSoLuong_KhongHoanThanh" label={<span style={{ fontWeight: 600 }}>Không hoàn thành</span>} style={{ marginBottom: "8px" }}>
                  <InputNumber style={{ width: "100%" }} min={0} step={0.01} formatter={formatScore} placeholder="0" />
                </Form.Item>
                <Form.Item name="chamDiemSoLuong_Diem" label={<span style={{ fontWeight: 600 }}>Điểm (%) Số lượng</span>} style={{ marginBottom: "4px" }}>
                  <InputNumber style={{ width: "100%" }} disabled placeholder="0%" formatter={formatPercent} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <div style={{ fontWeight: 600, color: "#fa8c16", marginBottom: "8px", fontSize: "13px" }}>
                  Chất lượng (Trừ 25%/lần)
                </div>
                <Form.Item name="chamDiemChatLuong_KhongDat" label={<span style={{ fontWeight: 600 }}>Số lần không đạt</span>} style={{ marginBottom: "8px" }}>
                  <InputNumber style={{ width: "100%" }} min={0} step={1} placeholder="Số lần" />
                </Form.Item>
                <Form.Item name="chamDiemChatLuong_SoDiemConLai" label={<span style={{ fontWeight: 600 }}>Số điểm còn lại</span>} style={{ marginBottom: "8px" }}>
                  <InputNumber style={{ width: "100%" }} min={0} placeholder="0" formatter={formatScore} disabled />
                </Form.Item>
                <Form.Item name="chamDiemChatLuong_Diem" label={<span style={{ fontWeight: 600 }}>Điểm (%) Chất lượng</span>} style={{ marginBottom: "4px" }}>
                  <InputNumber style={{ width: "100%" }} disabled placeholder="0%" formatter={formatPercent} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <div style={{ fontWeight: 600, color: "#722ed1", marginBottom: "8px", fontSize: "13px" }}>
                  Tiến độ (Trừ 25%/lần)
                </div>
                <Form.Item name="chamDiemTienDo_KhongDat" label={<span style={{ fontWeight: 600 }}>Số lần chậm muộn</span>} style={{ marginBottom: "8px" }}>
                  <InputNumber style={{ width: "100%" }} min={0} step={1} placeholder="Số lần" />
                </Form.Item>
                <Form.Item name="chamDiemTienDo_SoDiemConLai" label={<span style={{ fontWeight: 600 }}>Số điểm còn lại</span>} style={{ marginBottom: "8px" }}>
                  <InputNumber style={{ width: "100%" }} min={0} placeholder="0" formatter={formatScore} disabled />
                </Form.Item>
                <Form.Item name="chamDiemTienDo_Diem" label={<span style={{ fontWeight: 600 }}>Điểm (%) Tiến độ</span>} style={{ marginBottom: "4px" }}>
                  <InputNumber style={{ width: "100%" }} disabled placeholder="0%" formatter={formatPercent} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item name="ghiChuGiaTrinh" label={<span style={{ fontWeight: 600 }}>Ghi chú / Nội dung giải trình</span>} style={{ marginBottom: "0px" }}>
            <Input.TextArea rows={2} placeholder="Nhập ghi chú hoặc nội dung giải trình (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>

      <ModalChonTieuChi
        visible={chonTieuChiVisible}
        onCancel={() => setChonTieuChiVisible(false)}
        onSelectMultiple={handleSelectTieuChi}
        idDotDanhGia={idDotDanhGia}
        tenNhiemVu={tenNhiemVu}
        tenSanPham={form.getFieldValue("tenSanPhamDauRa")}
        idLyLich={idLyLich}
        donViId={donViId}
      />
    </>
  );
};

export default ModalNhapChiTietSanPhamTCCB;
