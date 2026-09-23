"use client";
import React, { useEffect, useState } from "react";
import { Modal, Spin, Button } from "antd";
import { KPI_NhomTieuChiTreeView } from "../kPI_NhomTieuChi/KPI_NhomTieuChiTreeViewComponent";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";

interface ModalXemBoTieuChiProps {
  visible: boolean;
  onClose: () => void;
  idBoTieuChiDonVi?: string | null;
  idDotDanhGia?: string | null;
  donViId?: string | null;
}

const ModalXemBoTieuChi: React.FC<ModalXemBoTieuChiProps> = ({
  visible,
  onClose,
  idBoTieuChiDonVi,
  idDotDanhGia,
  donViId,
}) => {
  const [activeIdBoTieuChiDonVi, setActiveIdBoTieuChiDonVi] = useState<string | undefined>(
    idBoTieuChiDonVi || undefined
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) return;

    if (idBoTieuChiDonVi) {
      setActiveIdBoTieuChiDonVi(idBoTieuChiDonVi);
      return;
    }

    const resolveBoTieuChi = async () => {
      setLoading(true);
      try {
        const res = await kPI_NhomTieuChiService.getTieuChiForCurrentUser(
          donViId || undefined,
          idDotDanhGia || undefined
        );
        if (res && res.status && res.data && res.data.length > 0) {
          const foundId = res.data.find((x) => !!x.idBoTieuChiDonVi)?.idBoTieuChiDonVi;
          if (foundId) {
            setActiveIdBoTieuChiDonVi(foundId);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tìm Bộ tiêu chí đơn vị:", err);
      } finally {
        setLoading(false);
      }
    };

    resolveBoTieuChi();
  }, [visible, idBoTieuChiDonVi, idDotDanhGia, donViId]);

  if (!visible) return null;

  return (
    <Modal
      title={
        <span style={{
          color: "#ffffff",
          fontSize: "16px",
          fontWeight: "bold",
          letterSpacing: "0.5px"
        }}>
          BỘ TIÊU CHÍ ĐANG ÁP DỤNG
        </span>
      }
      closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
      styles={{
        header: { padding: "16px 24px", overflow: "hidden", borderRadius: "8px 8px 0 0", margin: 0, background: "#0355a2" },
        body: { padding: 0, maxHeight: "80vh", overflowY: "auto" }
      }}
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ top: 20 }}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ backgroundColor: "#0355a2", borderColor: "#0355a2" }}>
          Đóng
        </Button>,
      ]}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin tip="Đang tải thông tin bộ tiêu chí..." size="large" />
        </div>
      ) : (
        <KPI_NhomTieuChiTreeView isModal={true} idBoTieuChiDonVi={activeIdBoTieuChiDonVi} />
      )}
    </Modal>
  );
};

export default ModalXemBoTieuChi;
