"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Avatar, Tag, Space, Button } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  FileTextOutlined,
  CalendarOutlined,
  BankOutlined,
  BellOutlined,
  EditOutlined,
  PlusCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined
} from "@ant-design/icons";
import { useSelector } from "@/store/hooks";
import dayjs from "dayjs";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import { useRouter } from "next/navigation";
import DashboardThongKePhieuDanhGia from "./DashboardThongKePhieuDanhGia";
import DashboardThongKeThanhPhan from "./DashboardThongKeThanhPhan";
import KPI_PhieuDanhGiaDetail from "../../kPI_PhieuDanhGia/detail";
import ModalXemToanBoTieuChi from "../../kPI_BieuChamDiem/ModalXemToanBoTieuChi";
import ModalThemNhiemVuNhanh from "./ModalThemNhiemVuNhanh";

const { Title, Paragraph } = Typography;

const isPendingEvaluation = (item: any) =>
  !item.daDanhGia || item.trangThai === "KhoiTao" || item.trangThai === "TraVe";

export default function DashboardCaNhan() {
  const router = useRouter();

  const currentUser = useSelector((state: any) => state.auth.User);
  const [loading, setLoading] = useState(false);
  const [dotOptions, setDotOptions] = useState<any[]>([]);
  const [hasCheckedPendingEvaluations, setHasCheckedPendingEvaluations] = useState(false);

  const [filterQuy, setFilterQuy] = useState<number | null>(null);
  const [filterNam, setFilterNam] = useState<number | null>(dayjs().year());
  const [phieuData, setPhieuData] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEvaluationDetailVisible, setIsEvaluationDetailVisible] = useState(false);
  const [evaluationDetailItem, setEvaluationDetailItem] = useState<any>(null);

  const [toanBoTieuChiVisible, setToanBoTieuChiVisible] = useState(false);
  const [selectedDotDanhGiaTieuChi, setSelectedDotDanhGiaTieuChi] = useState<string | null>(null);
  const [quickTaskModalVisible, setQuickTaskModalVisible] = useState(false);
  const [selectedDotQuickTask, setSelectedDotQuickTask] = useState<any>(null);
  const [isNavigatingPhieu, setIsNavigatingPhieu] = useState<boolean>(false);

  const handleGoToEvaluation = async (evalItem: any) => {
    if (!evalItem || isNavigatingPhieu) return;
    const targetIdDot = evalItem.idDotDanhGia;
    const targetIdLyLich = currentUser?.idLyLich || userProfile?.id || evalItem.idLyLich || currentUser?.lyLichId;
    let targetIdPhieu = evalItem.idPhieuDanhGia;

    setIsNavigatingPhieu(true);
    try {
      if (!targetIdPhieu && targetIdDot && targetIdLyLich) {
        const initRes = await kPI_PhieuDanhGiaService.initPhieuDanhGia(targetIdDot, targetIdLyLich);
        if (initRes?.status && initRes.data) {
          targetIdPhieu = initRes.data;
        }
      }

      const phieuTarget = targetIdPhieu || targetIdDot;
      const queryParams = new URLSearchParams();
      if (targetIdDot) queryParams.append("idDotDanhGia", targetIdDot);
      if (targetIdPhieu) queryParams.append("idPhieu", targetIdPhieu);
      if (targetIdLyLich) queryParams.append("idLyLich", targetIdLyLich);

      router.push(`/kPI_PhieuDanhGia/DanhGiaMultiCap/${phieuTarget}?${queryParams.toString()}`);
    } catch (err) {
      console.error("Lỗi khi khởi tạo/điều hướng phiếu đánh giá:", err);
      const phieuTarget = targetIdPhieu || targetIdDot;
      const queryParams = new URLSearchParams();
      if (targetIdDot) queryParams.append("idDotDanhGia", targetIdDot);
      if (targetIdPhieu) queryParams.append("idPhieu", targetIdPhieu);
      if (targetIdLyLich) queryParams.append("idLyLich", targetIdLyLich);
      router.push(`/kPI_PhieuDanhGia/DanhGiaMultiCap/${phieuTarget}?${queryParams.toString()}`);
    } finally {
      setIsNavigatingPhieu(false);
    }
  };

  useEffect(() => {
    const fetchInit = async () => {
      try {
        setLoading(true);
        await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
        if (currentUser?.id) {
          const profileResponse = await kPI_LyLich2CService.getByUserId(currentUser.id);
          if (profileResponse?.data) {
            setUserProfile(profileResponse.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, [currentUser?.id]);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchPhieu = async () => {
      setHasCheckedPendingEvaluations(false);
      setPhieuData([]);

      const idLyLich = currentUser?.idLyLich || userProfile?.id;
      // Không gọi API khi chưa xác định được hồ sơ, tránh nhận dữ liệu phiếu của nhân sự khác.
      if (!currentUser?.id || !idLyLich) return;

      try {
        setLoading(true);
        const searchData = {
          idLyLich,
          quy: filterQuy || undefined,
          nam: filterNam || undefined,
          pageIndex: 1,
          // Dashboard cần kiểm tra toàn bộ các đợt để không bỏ sót đợt chưa đánh giá
          // nằm ngoài 10 bản ghi mới nhất.
          pageSize: -1,
        };
        const response = await kPI_PhieuDanhGiaService.getDotDanhGiaWithPhieu(currentUser.id, searchData);
        if (isCurrentRequest && response && response.data) {
          const items = response.data.items || [];
          items.sort((a: any, b: any) => {
            const aIsPending = isPendingEvaluation(a);
            const bIsPending = isPendingEvaluation(b);
            if (aIsPending === bIsPending) return 0;
            return aIsPending ? -1 : 1;
          });
          setPhieuData(items);
          setHasCheckedPendingEvaluations(true);
        }
      } catch (err) {
        console.error("Lỗi khi load phiếu đánh giá: ", err);
      } finally {
        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    };
    fetchPhieu();

    return () => {
      isCurrentRequest = false;
    };
  }, [currentUser, userProfile?.id, filterQuy, filterNam]);

  const handleOpenEvaluationDetail = (item: any) => {
    if (!item?.idPhieuDanhGia || !item?.idDotDanhGia) return;
    setEvaluationDetailItem({
      idPhieuDanhGia: item.idPhieuDanhGia,
      idDotDanhGia: item.idDotDanhGia,
      idLyLich: currentUser?.idLyLich || userProfile?.id,
      tenChuPhieu: userProfile?.hoTen || currentUser?.hoTen || currentUser?.fullName || currentUser?.userName,
      tenDotDanhGia: item.tenDotDanhGia,
    });
    setIsEvaluationDetailVisible(true);
  };

  const firstPendingEval = phieuData.find(isPendingEvaluation);
  const totalEvaluations = phieuData.length;
  const approvedCount = phieuData.filter((p: any) => p.trangThai === "DaDuyet" || p.trangThai === "Duyet").length;
  const inReviewCount = phieuData.filter((p: any) => p.daDanhGia && p.trangThai !== "KhoiTao" && p.trangThai !== "TraVe" && p.trangThai !== "DaDuyet" && p.trangThai !== "Duyet").length;
  const latestEval = phieuData[0];

  return (
    <div className="dashboard-canhan">
      <Card
        className="mb-4 welcome-banner"
        style={{
          background: "linear-gradient(135deg, #0355a2 0%, #0096ff 100%)",
          borderRadius: "16px",
          border: "none",
          boxShadow: "0 10px 25px rgba(3, 85, 162, 0.2)"
        }}
        bodyStyle={{ padding: '12px 24px' }}
      >
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)' }} />
          </Col>
          <Col flex="auto">
            <Title level={5} style={{ color: "white", margin: 0, fontWeight: 600, fontSize: "16px" }}>
              <BankOutlined style={{ marginRight: 8 }} />
              {userProfile?.hoTen || currentUser?.hoTen || currentUser?.fullName || currentUser?.userName ? `${userProfile?.hoTen || currentUser?.hoTen || currentUser?.fullName || currentUser?.userName} - ` : ""}
              {userProfile?.chucVuHienTaiName || userProfile?.chucVuHienTai || currentUser?.chucVu || "Chưa có chức vụ"}
            </Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", margin: "4px 0 0 0" }}>
              Chào mừng bạn đến với Hệ thống đánh giá KPI cá nhân.
            </Paragraph>
          </Col>
        </Row>
      </Card>



      {hasCheckedPendingEvaluations && (firstPendingEval ? (
        <div
          className="urgent-eval-card"
          onClick={() => handleGoToEvaluation(firstPendingEval)}
          style={{
            marginTop: 16,
            marginBottom: 24,
            background: "linear-gradient(to right, #fee2e2, #fecaca)",
            border: "1px solid #fca5a5",
            borderLeft: "6px solid #e11d48",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 8px 25px rgba(225, 29, 72, 0.25)",
            cursor: isNavigatingPhieu ? "not-allowed" : "pointer",
            transition: "all 0.3s ease"
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 320px', minWidth: 0, gap: 16 }}>
            <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BellOutlined style={{ fontSize: 24, color: '#e11d48' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#be123c', textTransform: 'uppercase', wordBreak: 'break-word' }}>{firstPendingEval.tenDotDanhGia}</span>
                <Tag style={{ borderRadius: 16, padding: '2px 12px', fontWeight: 700, fontSize: 12, border: 'none', background: '#e11d48', color: '#fff' }}>⚠️ YÊU CẦU XỬ LÝ GẤP</Tag>
              </div>
              <div style={{ color: '#6b7280', fontSize: 13, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px' }}>
                <span>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  Cập nhật: <span style={{ fontWeight: 600, color: '#4b5563' }}>{firstPendingEval.thoiGianTao ? dayjs(firstPendingEval.thoiGianTao).format('DD/MM/YYYY') : 'Chưa có'}</span>
                </span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <strong style={{ color: '#e11d48', fontSize: 14 }}>Vui lòng hoàn thành tự đánh giá của bạn</strong>
              </div>
            </div>
          </div>

          <Space size={12} wrap style={{ flexWrap: 'wrap' }}>
            <Button size="middle" icon={<PlusCircleOutlined />} onClick={(e) => { e.stopPropagation(); setSelectedDotQuickTask(firstPendingEval); setQuickTaskModalVisible(true); }}>Thêm nhiệm vụ</Button>
            <Button size="middle" icon={<FileTextOutlined />} onClick={(e) => { e.stopPropagation(); setSelectedDotDanhGiaTieuChi(firstPendingEval.idDotDanhGia); setToanBoTieuChiVisible(true); }}>Bộ tiêu chí</Button>
            <Button
              size="middle"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                const queryParams = new URLSearchParams();
                queryParams.append("idDotDanhGia", firstPendingEval.idDotDanhGia || "");
                queryParams.append("idPhieu", firstPendingEval.idPhieuDanhGia || "");
                queryParams.append("idLyLich", currentUser?.idLyLich || userProfile?.id || "");
                const phieuTarget = firstPendingEval.idPhieuDanhGia || firstPendingEval.idDotDanhGia;
                router.push(`/kPI_PhieuDanhGia/DanhGiaTCCB/${phieuTarget}?${queryParams.toString()}`);
              }}
              style={{
                backgroundColor: "#dcfce7",
                color: "#15803d",
                borderColor: "#86efac",
                borderRadius: 8,
                fontWeight: 700,
                boxShadow: "0 4px 10px rgba(22, 163, 74, 0.12)",
              }}
              className="personal-eval-criteria-btn"
            >
              Đánh giá bộ tiêu chí chung
            </Button>
            <Button
              size="middle"
              icon={<EditOutlined />}
              loading={isNavigatingPhieu}
              disabled={isNavigatingPhieu}
              onClick={(e) => {
                e.stopPropagation();
                handleGoToEvaluation(firstPendingEval);
              }}
              style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", borderColor: "#93c5fd", borderRadius: 8, fontWeight: 700, boxShadow: "0 4px 10px rgba(37, 99, 235, 0.12)" }}
              className="personal-eval-now-btn"
            >
              Đánh giá theo nhiệm vụ kê khai
            </Button>
          </Space>
        </div>
      ) : (
        <Card
          style={{
            marginTop: 16,
            marginBottom: 24,
            borderRadius: "16px",
            border: "1px solid #bbf7d0",
            borderLeft: "6px solid #10b981",
            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.08)",
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)"
          }}
          bodyStyle={{ padding: "18px 24px" }}
        >
          <Row gutter={[20, 16]} align="middle" justify="space-between">
            <Col xs={24} lg={11}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    borderRadius: "12px",
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircleFilled style={{ fontSize: 22, color: "#059669" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#065f46" }}>
                      Tình trạng đánh giá KPI cá nhân
                    </span>
                    <Tag style={{ borderRadius: 12, padding: "1px 8px", fontWeight: 600, fontSize: 11, border: "none", background: "#dcfce7", color: "#047857" }}>
                      ✓ ĐÃ HOÀN TẤT TỰ ĐÁNH GIÁ
                    </Tag>
                  </div>
                  <div style={{ color: "#374151", fontSize: 13, lineHeight: 1.4 }}>
                    Hiện tại bạn không có đợt đánh giá nào cần thực hiện. Dưới đây là tóm tắt tiến độ các đợt trong năm:
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={9}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: 10 }}>
                <div style={{ background: "rgba(255, 255, 255, 0.85)", border: "1px solid #d1fae5", borderRadius: "10px", padding: "8px 12px", textAlign: "center", boxShadow: "0 2px 6px rgba(16, 185, 129, 0.04)" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
                    <ClockCircleOutlined style={{ color: "#0284c7" }} /> Đang chờ duyệt
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0284c7" }}>
                    {inReviewCount} <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>đợt</span>
                  </div>
                </div>

                <div style={{ background: "rgba(255, 255, 255, 0.85)", border: "1px solid #d1fae5", borderRadius: "10px", padding: "8px 12px", textAlign: "center", boxShadow: "0 2px 6px rgba(16, 185, 129, 0.04)" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
                    <FileDoneOutlined style={{ color: "#059669" }} /> Đã duyệt
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#059669" }}>
                    {approvedCount} <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>/ {totalEvaluations}</span>
                  </div>
                </div>

                {latestEval && (
                  <div style={{ background: "rgba(255, 255, 255, 0.85)", border: "1px solid #d1fae5", borderRadius: "10px", padding: "8px 12px", textAlign: "center", boxShadow: "0 2px 6px rgba(16, 185, 129, 0.04)" }}>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
                      <CalendarOutlined style={{ color: "#d97706" }} /> Đợt gần nhất
                    </div>
                    <div
                      style={{ fontSize: 12, fontWeight: 700, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={latestEval.tenDotDanhGia}
                    >
                      {latestEval.tenDotDanhGia || "—"}
                    </div>
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} lg={4} style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                size="middle"
                icon={<FileTextOutlined />}
                style={{ borderRadius: 8, borderColor: "#6ee7b7", color: "#047857", fontWeight: 600, background: "#ffffff", width: "100%", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)" }}
                onClick={() => {
                  setSelectedDotDanhGiaTieuChi(phieuData[0]?.idDotDanhGia || null);
                  setToanBoTieuChiVisible(true);
                }}
              >
                Bộ tiêu chí
              </Button>
            </Col>
          </Row>
        </Card>
      ))}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={24}>
          <DashboardThongKePhieuDanhGia userId={currentUser?.id} idLyLich={currentUser?.idLyLich || userProfile?.id} onOpenDetail={handleOpenEvaluationDetail} />
        </Col>
        <Col xs={24}>
          <DashboardThongKeThanhPhan userId={currentUser?.id} idLyLich={currentUser?.idLyLich || userProfile?.id} onOpenDetail={handleOpenEvaluationDetail} />
        </Col>
      </Row>

      {isEvaluationDetailVisible && (
        <KPI_PhieuDanhGiaDetail item={evaluationDetailItem} onClose={() => setIsEvaluationDetailVisible(false)} />
      )}

      <ModalXemToanBoTieuChi visible={toanBoTieuChiVisible} onClose={() => setToanBoTieuChiVisible(false)} idDotDanhGia={selectedDotDanhGiaTieuChi} idLyLich={currentUser?.idLyLich || userProfile?.id} />
      <ModalThemNhiemVuNhanh visible={quickTaskModalVisible} onClose={() => { setQuickTaskModalVisible(false); setSelectedDotQuickTask(null); }} dotDanhGia={selectedDotQuickTask} idLyLich={currentUser?.idLyLich || userProfile?.id} />

      <style jsx global>{`
        .urgent-eval-card:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(225, 29, 72, 0.3) !important; }
        .personal-eval-criteria-btn:hover {
          background-color: #dcfce7 !important;
          border-color: #16a34a !important;
          color: #15803d !important;
        }
        .personal-eval-now-btn:hover {
          background-color: #dbeafe !important;
          border-color: #2563eb !important;
          color: #1d4ed8 !important;
        }
      `}</style>
    </div>
  );
}
