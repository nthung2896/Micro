"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import DanhGiaV2Component from "./DanhGia2/DanhGiaV2Component";
import BieuChamDiemV2Component from "../kPI_BieuChamDiem/BieuChamDiemV2Component";
import kPI_TieuChiChung_DiemSo_CapTrenService from "@/services/kPI_TieuChiChung_DiemSo_CapTren/kPI_TieuChiChung_DiemSo_CapTrenService";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import {
  getEvaluationScoreTitle,
  getNextEvaluationRole,
  getOwnerEvaluationRole,
} from "@/constants/KpiEvaluationWorkflow";

interface Props {
  item?: any | null;
  onClose: () => void;
}

const KPI_PhieuDanhGiaDetail: React.FC<Props> = ({ item, onClose }) => {
  const dotId = item?.idDotDanhGia || item?.idDot || item?.id;
  const phieuId = item?.idPhieuDanhGia || item?.idPhieu || (item?.id !== item?.idLyLich ? item?.id : undefined);
  const idLyLich = item?.idLyLich;
  const [showPtpColumn, setShowPtpColumn] = useState(false);
  const [ptpScores, setPtpScores] = useState<Record<string, number | null>>({});
  const [ptpTotal, setPtpTotal] = useState(0);
  const [supervisorScoreTitle, setSupervisorScoreTitle] = useState("Điểm cấp trên đánh giá");

  useEffect(() => {
    let cancelled = false;
    setShowPtpColumn(false);
    setPtpScores({});
    setPtpTotal(0);
    setSupervisorScoreTitle("Điểm cấp trên đánh giá");

    if (!phieuId) {
      return () => {
        cancelled = true;
      };
    }

    const loadPtpScores = async () => {
      try {
        const [response, lyLichResponse] = await Promise.all([
          kPI_TieuChiChung_DiemSo_CapTrenService.getByPhieu(phieuId),
          idLyLich ? kPI_LyLich2CService.getById(idLyLich) : Promise.resolve(null),
        ]);
        if (cancelled || !response?.data) return;

        const scores: Record<string, number | null> = {};
        response.data.items.forEach((score) => {
          scores[score.idTieuChiChung] = score.diemCapTren ?? null;
        });

        const hasPtpData = response.data.items.some(
          (score) => score.diemCapTren !== null && score.diemCapTren !== undefined
        );
        setPtpScores(scores);
        setPtpTotal(response.data.tongDiemCapTren || 0);
        setShowPtpColumn(hasPtpData);
        const ownerRole = getOwnerEvaluationRole(
          lyLichResponse?.data?.chucVuHienTai || item?.chucVuChuPhieu
        );
        setSupervisorScoreTitle(getEvaluationScoreTitle(getNextEvaluationRole(ownerRole)));
      } catch (error) {
        if (!cancelled) {
          console.warn("Không thể tải điểm PTP của phiếu:", error);
        }
      }
    };

    loadPtpScores();
    return () => {
      cancelled = true;
    };
  }, [phieuId, idLyLich, item?.chucVuChuPhieu]);

  return (
    <Modal
      title="THÔNG TIN PHIẾU ĐÁNH GIÁ"
      open={true}
      onCancel={onClose}
      footer={null}
      width="92%"
      style={{ top: 20 }}
      styles={{ body: { maxHeight: "calc(100vh - 100px)", overflowY: "auto", padding: 0 } }}
      className="in-modal-eval-sheet"
    >
      <DanhGiaV2Component
        params={{ id: dotId }}
        idPhieu={phieuId}
        idDot={dotId}
        idLyLich={idLyLich}
        hideSaveButton={true}
        hideHeader={true}
        isModal={true}
        viewOnly={true}
        vaiTroDanhGia={item?.viewMode || "CaNhan"}
        showCollapseAllToggle={true}
        showPtpColumn={showPtpColumn}
        supervisorScoreTitle={supervisorScoreTitle}
        ptpScores={ptpScores}
        ptpTotal={ptpTotal}
        extraSectionIContent={
          <BieuChamDiemV2Component
            params={{ id: dotId }}
            idPhieu={phieuId}
            idDot={dotId}
            idLyLich={idLyLich}
            hideSaveButton={true}
            hideHeader={true}
            isModal={true}
            viewOnly={true}
            enableAttachmentPreview={true}
            hasSection1Header={true}
            vaiTroDanhGia={item?.viewMode || "CaNhan"}
          />
        }
      />
    </Modal>
  );
};

export default KPI_PhieuDanhGiaDetail;
