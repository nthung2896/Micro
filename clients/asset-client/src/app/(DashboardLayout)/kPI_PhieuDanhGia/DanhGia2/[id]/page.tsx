"use client";
import React, { useRef, useState, useCallback } from "react";
import { Button, message } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import DanhGiaV2Component from "../DanhGiaV2Component";
import BieuChamDiemV2Component from "@/app/(DashboardLayout)/kPI_BieuChamDiem/BieuChamDiemV2Component";
import { useRouter } from "next/navigation";

type SaveError = {
  error: true;
  message: string;
  section: string;
  taskId?: string;
};

function isSaveError(result: any): result is SaveError {
  return result && typeof result === "object" && result.error === true;
}

export default function DanhGia2Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorSection, setErrorSection] = useState<string | null>(null);
  const danhGiaSaveRef = useRef<any>(null);
  const bieuChamDiemSaveRef = useRef<any>(null);

  const scrollToErrorSection = useCallback((section: string) => {
    setErrorSection(section);

    // Dùng setTimeout để đợi DOM render class error trước khi scroll
    setTimeout(() => {
      const targetId = section === "section1" ? "danhgia-section1" : "danhgia-section2";
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    // Xóa highlight sau 4 giây
    setTimeout(() => setErrorSection(null), 4000);
  }, []);

  const handleSaveAll = async () => {
    setErrorSection(null);
    try {
      setSaving(true);
      // 1. Lưu tiêu chí chung trước. API này đồng thời tạo/lấy phiếu
      // và trả về ID phiếu cho các API phía sau.
      let phieuId: string | null = null;
      if (danhGiaSaveRef.current) {
        const generalSaved = await danhGiaSaveRef.current();
        if (isSaveError(generalSaved)) {
          message.error({ content: generalSaved.message, key: "save_full_phieu", duration: 5 });
          scrollToErrorSection(generalSaved.section);
          return;
        }
        if (generalSaved === false) {
          message.error({ content: "Lưu phiếu đánh giá thất bại!", key: "save_full_phieu" });
          scrollToErrorSection("section1");
          return;
        }
        phieuId = typeof generalSaved === "string"
          ? generalSaved
          : generalSaved?.data || null;
      }

      if (!phieuId) {
        message.error({ content: "Lưu phiếu đánh giá thất bại!", key: "save_full_phieu" });
        scrollToErrorSection("section1");
        return;
      }

      // 2. Truyền ID vừa nhận cho lưu nhiệm vụ và kết quả thực hiện.
      if (bieuChamDiemSaveRef.current) {
        const tasksSaved = await bieuChamDiemSaveRef.current(phieuId);
        if (isSaveError(tasksSaved)) {
          message.error({ content: tasksSaved.message, key: "save_full_phieu", duration: 5 });
          scrollToErrorSection(tasksSaved.section);
          return;
        }
        if (tasksSaved === false) {
          message.error({ content: "Lưu kết quả thực hiện nhiệm vụ thất bại!", key: "save_full_phieu" });
          scrollToErrorSection("section2");
          return;
        }
      }

      message.success({ content: "Lưu phiếu đánh giá thành công!", key: "save_full_phieu" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Lỗi khi lưu toàn bộ phiếu đánh giá:", error);
      message.error({ content: "Lưu phiếu đánh giá thất bại!", key: "save_full_phieu" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* CSS cho hiệu ứng highlight lỗi */}
      <style jsx global>{`
        @keyframes errorPulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(255, 77, 79, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
        }
        .save-error-section {
          border: 2px solid #ff4d4f !important;
          border-radius: 4px;
          animation: errorPulse 1s ease-in-out 3;
          transition: border-color 0.3s ease;
        }
        .save-error-section .ant-input-number,
        .save-error-section .ant-input {
          border-color: #ff4d4f !important;
        }
      `}</style>

      <div className="mb-2">
        <AutoBreadcrumb />
      </div>
      <div style={{ background: "#fff", padding: 0, minHeight: "80vh" }}>
        <div
          style={{
            position: "sticky",
            top: "66px",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-end",
            pointerEvents: "none",
            marginBottom: "-38px",
            height: "38px",
          }}
        >
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/kPI_PhieuDanhGia/CaNhan");
              }
            }}
            style={{
              pointerEvents: "auto",
              backgroundColor: "#ff4d4f",
              borderColor: "#ff4d4f",
              color: "#fff",
              fontWeight: 500,
              boxShadow: "0 4px 14px rgba(255, 77, 79, 0.35)",
              borderRadius: "6px",
            }}
          >
            Quay lại phiếu đánh giá cá nhân
          </Button>
        </div>

        <div id="danhgia-section1" className={errorSection === "section1" ? "save-error-section" : ""}>
          <DanhGiaV2Component
            params={params}
            idDot={params?.id}
            hideSaveButton={true}
            hideHeader={true}
            saveRef={danhGiaSaveRef}
            silentSave={true}
            extraSectionIContent={
              <div id="danhgia-section2" className={errorSection === "section2" ? "save-error-section" : ""}>
                <BieuChamDiemV2Component
                  params={params}
                  idDot={params?.id}
                  hideSaveButton={true}
                  hideHeader={true}
                  saveRef={bieuChamDiemSaveRef}
                  silentSave={true}
                  hasSection1Header={true}
                  enableAttachmentPreview
                />
              </div>
            }
          />
        </div>

        {/* Master Single Save Button */}
        <div style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 999
        }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveAll}
            loading={saving}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderColor: "transparent",
              height: "50px",
              padding: "0 30px",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "25px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
            className="transition-all duration-300 hover:opacity-90 hover:-translate-y-1 hover:shadow-lg"
          >
            LƯU PHIẾU ĐÁNH GIÁ
          </Button>
        </div>
      </div>
    </>
  );
}
