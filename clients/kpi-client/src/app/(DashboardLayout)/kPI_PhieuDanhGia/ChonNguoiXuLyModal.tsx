"use client";
import React, { useEffect, useState, useRef } from "react";
import { Modal, Select, Input, Space, Spin, Tag } from "antd";
import {
  ExclamationCircleOutlined,
  SendOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import { NguoiXuLyDto } from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";

interface ChonNguoiXuLyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (idNguoiXuLy: string, ghiChu?: string) => void;
  idPhieuDanhGia: string;
  chucVuNguoiXuLy?: string | null;
  tenButton: string;
  canChonNguoiXuLy?: boolean;
  isTuChoi?: boolean;
}

const ChonNguoiXuLyModal: React.FC<ChonNguoiXuLyModalProps> = ({
  visible,
  onClose,
  onSubmit,
  idPhieuDanhGia,
  chucVuNguoiXuLy,
  tenButton,
  canChonNguoiXuLy = true,
  isTuChoi = false,
}) => {
  const [danhSachNguoi, setDanhSachNguoi] = useState<NguoiXuLyDto[]>([]);
  const selectRef = useRef<any>(null);
  const [selectedNguoiXuLy, setSelectedNguoiXuLy] = useState<string | undefined>(undefined);
  const [ghiChu, setGhiChu] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && canChonNguoiXuLy && idPhieuDanhGia && chucVuNguoiXuLy) {
      fetchNguoiXuLy();
    }
    return () => {
      setSelectedNguoiXuLy(undefined);
      setGhiChu("");
      setDanhSachNguoi([]);
    };
  }, [visible, canChonNguoiXuLy, idPhieuDanhGia, chucVuNguoiXuLy]);

  const fetchNguoiXuLy = async () => {
    if (!chucVuNguoiXuLy) return;
    setLoading(true);
    try {
      const response = await kPI_PhieuDanhGiaService.getNguoiXuLy(
        idPhieuDanhGia,
        chucVuNguoiXuLy
      );
      if (response?.data) {
        setDanhSachNguoi(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người xử lý:", error);
      toast.error("Không thể tải danh sách người xử lý.");
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    if (canChonNguoiXuLy && !selectedNguoiXuLy) {
      toast.warning("Vui lòng chọn người xử lý tiếp theo.");
      return;
    }
    if (isTuChoi && !ghiChu.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối trong ô ghi chú.");
      return;
    }
    onSubmit(selectedNguoiXuLy || "", ghiChu || undefined);
  };

  const isDuyet = tenButton.toLowerCase().includes("duyệt") && !isTuChoi;

  const modalTitle = (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "2px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "38px",
          height: "38px",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          flexShrink: 0,
        }}
      >
        {isTuChoi ? (
          <ExclamationCircleOutlined style={{ color: "#ffffff", fontSize: "20px" }} />
        ) : isDuyet ? (
          <CheckCircleOutlined style={{ color: "#ffffff", fontSize: "20px" }} />
        ) : (
          <SendOutlined style={{ color: "#ffffff", fontSize: "20px" }} />
        )}
      </div>
      <div>
        <div style={{ fontSize: "16px", fontWeight: 600, color: "#ffffff", lineHeight: "1.3", textTransform: "uppercase" }}>
          {tenButton}
        </div>
        <div style={{ fontSize: "13px", fontWeight: 400, color: "rgba(255, 255, 255, 0.85)", marginTop: "2px" }}>
          {isTuChoi
            ? "Xác nhận trả lại phiếu để cán bộ chỉnh sửa"
            : "Xác nhận chuyển luồng xử lý phiếu đánh giá"}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText={isTuChoi ? <span style={{ color: "#ffffff", fontWeight: 600 }}>Xác nhận trả về</span> : <span style={{ color: "#ffffff", fontWeight: 600 }}>Xác nhận</span>}
      cancelText="Hủy bỏ"
      width={540}
      destroyOnClose
      okButtonProps={{
        danger: isTuChoi,
        type: "primary",
        size: "large",
        style: {
          borderRadius: "8px",
          fontWeight: 600,
          minWidth: "125px",
          color: "#ffffff",
          backgroundColor: isTuChoi ? undefined : isDuyet ? "#059669" : "#0355a2",
          borderColor: isTuChoi ? undefined : isDuyet ? "#059669" : "#0355a2",
        },
      }}
      cancelButtonProps={{
        size: "large",
        style: { borderRadius: "8px" },
      }}
      styles={{
        header: {
          background: isTuChoi ? "#dc2626" : isDuyet ? "#059669" : "#0355a2",
          padding: "12px 16px",
          margin: 0,
          borderRadius: "8px 8px 0 0",
        },
      }}
    >
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {canChonNguoiXuLy && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  fontWeight: 600,
                  color: "#262626",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <UserOutlined style={{ color: "#1677ff" }} /> Chọn người xử lý tiếp theo{" "}
                <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <Select
                ref={selectRef}
                size="large"
                placeholder="Tìm kiếm hoặc chọn người xử lý..."
                style={{ width: "100%" }}
                value={selectedNguoiXuLy}
                onChange={(value) => {
                  setSelectedNguoiXuLy(value);
                  setTimeout(() => {
                    selectRef.current?.blur();
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }, 0);
                }}
                showSearch
                options={danhSachNguoi.map((nguoi) => ({
                  value: nguoi.id,
                  filterLabel: `${nguoi.hoTen} ${nguoi.chucVu || ""}`,
                  label: (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "4px 0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#1677ff15",
                            color: "#1677ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          {nguoi.hoTen?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span style={{ fontWeight: 500, color: "#262626", fontSize: "14px" }}>
                          {nguoi.hoTen}
                        </span>
                      </div>
                      {nguoi.chucVu && (
                        <Tag
                          color="blue"
                          style={{ margin: 0, borderRadius: "6px", fontSize: "12px", fontWeight: 500 }}
                        >
                          {nguoi.chucVu}
                        </Tag>
                      )}
                    </div>
                  ),
                }))}
                notFoundContent={loading ? "Đang tải danh sách..." : "Không tìm thấy cán bộ phù hợp"}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontWeight: 600,
                color: "#262626",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FileTextOutlined style={{ color: isTuChoi ? "#ff4d4f" : "#1677ff" }} />
              {isTuChoi ? "Lý do trả về / Yêu cầu chỉnh sửa" : "Ghi chú xử lý"}
              {isTuChoi && <span style={{ color: "#ff4d4f" }}>*</span>}
            </label>
            <Input.TextArea
              size="large"
              rows={4}
              style={{ borderRadius: "8px", padding: "10px 14px", fontSize: "14px" }}
              placeholder={
                isTuChoi
                  ? "Nhập cụ thể lý do từ chối hoặc các điểm cần sửa đổi (bắt buộc)..."
                  : "Nhập ý kiến nhận xét hoặc thông tin ghi chú cho người tiếp nhận (tùy chọn)..."
              }
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>
        </Space>
      </Spin>
    </Modal>
  );
};

export default ChonNguoiXuLyModal;
