"use client";
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Button, message, Card, Tag, Space, Modal, Select, Input } from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  UndoOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import DanhGiaV2Component, {
  SupervisorColumnConfig,
  MultiCapSummaryRole,
} from "@/app/(DashboardLayout)/kPI_PhieuDanhGia/DanhGia2/DanhGiaV2Component";
import BieuChamDiemV2Component from "@/app/(DashboardLayout)/kPI_BieuChamDiem/BieuChamDiemV2Component";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";
import kPI_TieuChiChung_DiemSo_CapTrenService from "@/services/kPI_TieuChiChung_DiemSo_CapTren/kPI_TieuChiChung_DiemSo_CapTrenService";
import {
  KPI_TieuChiChung_DiemSo_CapTrenByPhieuItem,
  KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse,
} from "@/types/kPI_TieuChiChung_DiemSo_CapTren/kPI_TieuChiChung_DiemSo_CapTren";
import kPI_QuaTrinhXuLyPhieuDanhGiaService from "@/services/kPI_QuaTrinhXuLyPhieuDanhGia/kPI_QuaTrinhXuLyPhieuDanhGiaService";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getEvaluationRoleLabel,
  getEvaluationRoleShortLabel,
  getEvaluationScoreTitle,
  getNextEvaluationRole,
  getOwnerEvaluationRole,
  isVuDepartment,
} from "@/constants/KpiEvaluationWorkflow";

const EVALUATION_ROLE_CODES = ["CaNhan", "PhoTruongPhong", "PhoVuTruong", "VuTruong", "TruongPhong", "PhoCucTruong", "CucTruong", "PhoGiamDocTT", "GiamDocTT", "PhoGDTT", "GD", "PhoChanhVanPhong", "ChanhVanPhong", "PHOCHANHVANPHONG"];

const TRANG_THAI = {
  KHOI_TAO: "KhoiTao",
  GUI_PHO_TRUONG_PHONG: "GuiPhoTruongPhong",
  GUI_TRUONG_PHONG: "GuiTruongPhong",
  GUI_PHO_CUC_TRUONG: "GuiPhoCucTruong",
  GUI_CUC_TRUONG: "GuiCucTruong",
  GUI_PHO_VU_TRUONG: "GuiPhoVuTruong",
  GUI_VU_TRUONG: "GuiVuTruong",
  GUI_PHO_GIAM_DOC_TT: "GuiPhoGiamDocTT",
  GUI_GIAM_DOC_TT: "GuiGiamDocTT",
  GUI_PHO_CHANH_VAN_PHONG: "GuiPhoChanhVanPhong",
  GUI_CHANH_VAN_PHONG: "GuiChanhVanPhong",
  DA_DUYET: "DaDuyet",
  TRA_VE: "TraVe",
};

const MapTrangThaiToVaiTro: Record<string, string> = {
  [TRANG_THAI.KHOI_TAO]: "CaNhan",
  [TRANG_THAI.TRA_VE]: "CaNhan",
  [TRANG_THAI.GUI_PHO_TRUONG_PHONG]: "PhoTruongPhong",
  [TRANG_THAI.GUI_TRUONG_PHONG]: "TruongPhong",
  [TRANG_THAI.GUI_PHO_CUC_TRUONG]: "PhoCucTruong",
  [TRANG_THAI.GUI_CUC_TRUONG]: "CucTruong",
  [TRANG_THAI.GUI_PHO_VU_TRUONG]: "PhoVuTruong",
  [TRANG_THAI.GUI_VU_TRUONG]: "VuTruong",
  [TRANG_THAI.GUI_PHO_GIAM_DOC_TT]: "PhoGDTT",
  [TRANG_THAI.GUI_GIAM_DOC_TT]: "GD",
  [TRANG_THAI.GUI_PHO_CHANH_VAN_PHONG]: "PhoChanhVanPhong",
  [TRANG_THAI.GUI_CHANH_VAN_PHONG]: "ChanhVanPhong",
  [TRANG_THAI.DA_DUYET]: "DaDuyet",
};

const PREVIOUS_EVALUATOR_ROLE: Record<string, string | undefined> = {
  TruongPhong: "PhoTruongPhong",
  PhoCucTruong: "TruongPhong",
  CucTruong: "PhoCucTruong",
  VuTruong: "PhoVuTruong",
  GiamDocTT: "PhoGiamDocTT",
  GD: "PhoGDTT",
  ChanhVanPhong: "PhoChanhVanPhong",
};

const MapNextStepInfo: Record<string, { nextStatus: string; buttonText: string; chucVuNhan?: string; isFinal?: boolean }> = {
  [TRANG_THAI.KHOI_TAO]: { nextStatus: TRANG_THAI.GUI_PHO_TRUONG_PHONG, buttonText: "Lưu và Gửi Phó Trưởng phòng", chucVuNhan: "PhoTruongPhong" },
  [TRANG_THAI.TRA_VE]: { nextStatus: TRANG_THAI.GUI_PHO_TRUONG_PHONG, buttonText: "Lưu và Gửi Phó Trưởng phòng", chucVuNhan: "PhoTruongPhong" },
  [TRANG_THAI.GUI_PHO_TRUONG_PHONG]: { nextStatus: TRANG_THAI.DA_DUYET, buttonText: "Lưu và Phê duyệt hoàn tất", isFinal: true },
};

function normalizeRoleValue(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const ROLE_DETAILS: Record<string, { label: string; scoreTitle: string; nextRole?: string }> = {
  PhoTruongPhong: { label: "Phó Trưởng phòng", scoreTitle: "Điểm Phó Trưởng phòng đánh giá", nextRole: "TruongPhong" },
  TruongPhong: { label: "Trưởng phòng", scoreTitle: "Điểm Trưởng phòng đánh giá", nextRole: "PhoCucTruong" },
  PhoCucTruong: { label: "Phó Cục trưởng", scoreTitle: "Điểm Phó Cục trưởng đánh giá", nextRole: "CucTruong" },
  CucTruong: { label: "Cục trưởng", scoreTitle: "Điểm Cục trưởng đánh giá" },
  PhoVuTruong: { label: "Phó Vụ trưởng", scoreTitle: "Điểm Phó Vụ trưởng đánh giá", nextRole: "VuTruong" },
  VuTruong: { label: "Vụ trưởng", scoreTitle: "Điểm Vụ trưởng đánh giá" },
  PhoGiamDocTT: { label: "Phó Giám đốc TT", scoreTitle: "Điểm Phó Giám đốc TT đánh giá", nextRole: "GiamDocTT" },
  GiamDocTT: { label: "Giám đốc TT", scoreTitle: "Điểm Giám đốc TT đánh giá" },
  PhoGDTT: { label: "Phó Giám đốc TT", scoreTitle: "Điểm Phó Giám đốc TT đánh giá", nextRole: "GD" },
  GD: { label: "Giám đốc TT", scoreTitle: "Điểm Giám đốc TT đánh giá" },
  PhoChanhVanPhong: { label: "Phó Chánh Văn phòng", scoreTitle: "Điểm Phó Chánh Văn phòng đánh giá", nextRole: "ChanhVanPhong" },
  PHOCHANHVANPHONG: { label: "Phó Chánh Văn phòng", scoreTitle: "Điểm Phó Chánh Văn phòng đánh giá", nextRole: "ChanhVanPhong" },
  ChanhVanPhong: { label: "Chánh Văn phòng", scoreTitle: "Điểm Chánh Văn phòng đánh giá" },
};

function getRoleFromFlags(source: any): string | null {
  if (source?.isCT === true) return "CucTruong";
  if (source?.isPCT === true) return "PhoCucTruong";
  if (source?.isTP === true) return "TruongPhong";
  if (source?.isPTP === true) return "PhoTruongPhong";
  return null;
}

function getRoleFromCurrentUser(user: any): string | null {
  const fromFlags = getRoleFromFlags(user);
  if (fromFlags) return fromFlags;

  const values = [user?.chucVuCode, user?.tenChucVu, ...(Array.isArray(user?.listRole) ? user.listRole : [])]
    .map(normalizeRoleValue);
  if (values.some((value) => value === "cuctruong" || (value.includes("cuctruong") && !value.includes("pho")))) return "CucTruong";
  if (values.some((value) => value.includes("phocuctruong") || value === "pct")) return "PhoCucTruong";
  if (values.some((value) => (value === "tp" || value.includes("truongphong")) && !value.includes("pho") && !value.includes("ptp"))) return "TruongPhong";
  if (values.some((value) => value === "ptp" || value === "photp" || value.includes("photruongphong") || value.includes("phophong"))) return "PhoTruongPhong";
  if (values.some((value) => value === "gd" || value === "giamdoctt" || value.includes("giamdoctrungtam"))) return "GD";
  if (values.some((value) => value === "phogdtt" || value === "phogiamdoctt" || value.includes("phogiamdoctrungtam"))) return "PhoGDTT";
  if (values.some((value) => value === "phochanhvanphong" || value === "phocvp" || value.includes("phochanhvanphong"))) return "PhoChanhVanPhong";
  if (values.some((value) => value === "chanhvanphong" || value === "cvp" || value.includes("chanhvanphong"))) return "ChanhVanPhong";
  return null;
}

const trangThaiConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  [TRANG_THAI.KHOI_TAO]: { color: "blue", label: "Khởi tạo", icon: <ClockCircleOutlined /> },
  [TRANG_THAI.GUI_PHO_TRUONG_PHONG]: { color: "cyan", label: "Chờ Phó Trưởng phòng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_TRUONG_PHONG]: { color: "cyan", label: "Chờ Trưởng phòng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_PHO_CUC_TRUONG]: { color: "cyan", label: "Chờ Phó Cục trưởng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_CUC_TRUONG]: { color: "cyan", label: "Chờ Cục trưởng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_PHO_VU_TRUONG]: { color: "cyan", label: "Chờ Phó Vụ trưởng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_VU_TRUONG]: { color: "cyan", label: "Chờ Vụ trưởng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_PHO_GIAM_DOC_TT]: { color: "cyan", label: "Chờ Phó Giám đốc TT đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_GIAM_DOC_TT]: { color: "cyan", label: "Chờ Giám đốc TT đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_PHO_CHANH_VAN_PHONG]: { color: "cyan", label: "Chờ Phó Chánh Văn phòng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_CHANH_VAN_PHONG]: { color: "cyan", label: "Chờ Chánh Văn phòng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.DA_DUYET]: { color: "green", label: "Đã phê duyệt hoàn tất", icon: <CheckCircleOutlined /> },
  [TRANG_THAI.TRA_VE]: { color: "red", label: "Trả về chỉnh sửa", icon: <RollbackOutlined /> },
};

type SaveError = {
  error: true;
  message: string;
  section: string;
  taskId?: string;
};

function isSaveError(result: any): result is SaveError {
  return result && typeof result === "object" && result.error === true;
}

const normalizeCriterionId = (value: unknown) => String(value || "").trim().toLowerCase();

const collectLeafCriterionIds = (nodes: any[], ids = new Set<string>()) => {
  nodes.forEach((node) => {
    if (node.children?.length) {
      collectLeafCriterionIds(node.children, ids);
      return;
    }

    const id = normalizeCriterionId(node.id || node.idTieuChiChung);
    if (id) ids.add(id);
  });

  return ids;
};

// API cũ có thể trả cả dòng tiêu chí cha, dòng thừa hoặc nhiều dòng cùng tiêu
// chí. Mỗi tiêu chí lá chỉ được giữ một dòng (dòng xuất hiện sau cùng).
const getLeafReviewItems = (
  items: KPI_TieuChiChung_DiemSo_CapTrenByPhieuItem[],
  leafCriterionIds: ReadonlySet<string>,
) => {
  const itemsByCriterionId = new Map<string, KPI_TieuChiChung_DiemSo_CapTrenByPhieuItem>();

  items.forEach((item) => {
    const criterionId = normalizeCriterionId(item.idTieuChiChung);
    if (criterionId && leafCriterionIds.has(criterionId)) {
      itemsByCriterionId.set(criterionId, item);
    }
  });

  return Array.from(itemsByCriterionId.values());
};

export default function DanhGiaMultiCapComponent({
  idPhieu: idPhieuProp,
  idDot: idDotProp,
  idLyLich: idLyLichProp,
}: {
  idPhieu?: string;
  idDot?: string;
  idLyLich?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: any) => state.auth.User);

  const queryDot = idDotProp || searchParams.get("idDot") || searchParams.get("idDotDanhGia") || "";
  const queryLyLich = idLyLichProp || searchParams.get("idLyLich") || "";
  const queryPhieu = (idPhieuProp && idPhieuProp !== queryDot) ? idPhieuProp : (searchParams.get("idPhieu") || searchParams.get("idPhieuDanhGia") || "");

  const [phieuInfo, setPhieuInfo] = useState<any>(null);
  const [lyLichInfo, setLyLichInfo] = useState<any>(null);
  const [dotDanhGiaInfo, setDotDanhGiaInfo] = useState<any>(null);
  const [activeProcess, setActiveProcess] = useState<any>(null);

  const [currentIdPhieu, setCurrentIdPhieu] = useState<string | undefined>(
    (queryPhieu && queryPhieu.trim() !== "") ? queryPhieu : (idPhieuProp && idPhieuProp !== queryDot ? idPhieuProp : undefined)
  );

  const effectiveIdDot = queryDot || phieuInfo?.idDotDanhGia || "";
  const effectiveIdPhieu = currentIdPhieu || ((queryPhieu && queryPhieu.trim() !== "") ? queryPhieu : undefined) || phieuInfo?.id || (phieuInfo as any)?.idPhieuDanhGia || undefined;
  const effectiveIdLyLich = queryLyLich || phieuInfo?.idLyLich || user?.idLyLich || user?.lyLichId || user?.id;

  const [saving, setSaving] = useState(false);
  const [transitionSaving, setTransitionSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const saveOperationRef = useRef(false);
  // Không để request tải phiếu cũ ghi đè trạng thái mới sau khi chuyển bước.
  const fetchInfoRequestRef = useRef(0);
  const [errorSection, setErrorSection] = useState<string | null>(null);
  const danhGiaSaveRef = useRef<any>(null);
  const bieuChamDiemSaveRef = useRef<any>(null);
  const roleSaveRefs = useRef<Record<string, any>>({});
  const roleScoresRef = useRef<Record<string, number>>({});

  const [ptpReview, setPtpReview] = useState<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse>({
    items: [],
    canEdit: false,
    tongDiemCapTren: 0,
    isComplete: false,
  });
  const [ptpScores, setPtpScores] = useState<Record<string, number | null>>({});
  const [multiRoleScores, setMultiRoleScores] = useState<Record<string, Record<string, number | null>>>({});
  const [, setPtpScoreIds] = useState<Record<string, string>>({});
  const [ptpNotes, setPtpNotes] = useState<Record<string, string | null>>({});
  const ptpDraftScoresRef = useRef<Record<string, number | null>>({});
  const [leafCriterionIds, setLeafCriterionIds] = useState<string[]>([]);
  const leafCriterionIdsRef = useRef<Set<string>>(new Set());

  const [roleScoresState, setRoleScoresState] = useState<Record<string, number>>({});
  const handleRoleScoreChange = useCallback((roleCode: string, sc: number) => {
    roleScoresRef.current[roleCode] = sc;
    setRoleScoresState((prev) => (prev[roleCode] === sc ? prev : { ...prev, [roleCode]: sc }));
  }, []);

  const handleRoleTaskScoresChange = useCallback((scores: Record<string, number>) => {
    setRoleScoresState((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.entries(scores).forEach(([role, sc]) => {
        roleScoresRef.current[role] = sc;
        if (next[role] !== sc) {
          next[role] = sc;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, []);

  const totalPtpScore = useMemo(() => {
    const currentLeafCriterionIds = new Set(leafCriterionIds);
    return Object.entries(ptpScores).reduce<number>((sum, [criterionId, value]) => {
      return currentLeafCriterionIds.has(normalizeCriterionId(criterionId))
        ? sum + (Number(value) || 0)
        : sum;
    }, 0);
  }, [leafCriterionIds, ptpScores]);

  const [chuyenBuocModal, setChuyenBuocModal] = useState<{
    visible: boolean;
    type: "send" | "return" | "approve";
    title: string;
    content: string;
    listNguoiXuLy: any[];
    selectedNguoiXuLyId?: string;
    ghiChu: string;
  }>({
    visible: false,
    type: "send",
    title: "",
    content: "",
    listNguoiXuLy: [],
    selectedNguoiXuLyId: undefined,
    ghiChu: "",
  });

  const [thuHoiModalVisible, setThuHoiModalVisible] = useState(false);
  const [thuHoiGhiChu, setThuHoiGhiChu] = useState("");
  const [thuHoiLoading, setThuHoiLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const fetchInfo = useCallback(async () => {
    const requestId = ++fetchInfoRequestRef.current;
    const isLatestRequest = () => requestId === fetchInfoRequestRef.current;
    let targetPhieuId = effectiveIdPhieu;
    let targetLyLichId = effectiveIdLyLich;
    let targetDotId = effectiveIdDot;

    setIsInitialLoading(true);
    try {
      if (targetPhieuId) {
        const resPhieu = await kPI_PhieuDanhGiaService.getById(targetPhieuId);
        if (resPhieu?.data && isLatestRequest()) {
          setPhieuInfo(resPhieu.data);
          if (resPhieu.data.idLyLich) targetLyLichId = resPhieu.data.idLyLich;
          if (resPhieu.data.idDotDanhGia) targetDotId = resPhieu.data.idDotDanhGia;
        }

        const resQuaTrinh = await kPI_QuaTrinhXuLyPhieuDanhGiaService.getData({
          idPhieuDanhGia: targetPhieuId,
          pageSize: 50,
          pageIndex: 1,
        });
        if (resQuaTrinh?.data?.items && resQuaTrinh.data.items.length > 0 && isLatestRequest()) {
          const items = resQuaTrinh.data.items;
          const pending = items.find((x: any) => x.isXuLy === false);
          setActiveProcess(pending || items[0]);
        }
      } else if (targetDotId && targetLyLichId) {
        const resSearch = await kPI_PhieuDanhGiaService.getData({
          pageIndex: 1,
          pageSize: 1,
          idLyLich: targetLyLichId,
          idDotDanhGia: targetDotId,
        });
        if (resSearch?.data?.items?.length > 0 && isLatestRequest()) {
          const phieu = resSearch.data.items[0];
          const foundPhieuId = phieu.id || (phieu as any).idPhieuDanhGia;
          setCurrentIdPhieu(foundPhieuId);

          if (foundPhieuId) {
            const resPhieu = await kPI_PhieuDanhGiaService.getById(foundPhieuId);
            if (resPhieu?.data && isLatestRequest()) {
              setPhieuInfo(resPhieu.data);
            } else {
              setPhieuInfo(phieu);
            }

            const resQuaTrinh = await kPI_QuaTrinhXuLyPhieuDanhGiaService.getData({
              idPhieuDanhGia: foundPhieuId,
              pageSize: 50,
              pageIndex: 1,
            });
            if (resQuaTrinh?.data?.items && resQuaTrinh.data.items.length > 0 && isLatestRequest()) {
              const items = resQuaTrinh.data.items;
              const pending = items.find((x: any) => x.isXuLy === false);
              setActiveProcess(pending || items[0]);
            }
          } else {
            setPhieuInfo(phieu);
          }
        }
      }

      if (targetDotId) {
        const resDot = await kPI_DotTheoDoiDanhGiaService.getById(targetDotId);
        if (resDot?.data && isLatestRequest()) setDotDanhGiaInfo(resDot.data);
      }

      if (targetLyLichId) {
        const resLL = await kPI_LyLich2CService.getById(targetLyLichId);
        if (resLL?.data && isLatestRequest()) setLyLichInfo(resLL.data);
      }
    } catch (e) {
      console.warn("Lỗi khi tải thông tin phiếu:", e);
    } finally {
      if (isLatestRequest()) {
        setIsInitialLoading(false);
      }
    }
  }, [effectiveIdPhieu, effectiveIdDot, effectiveIdLyLich]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const trangThai = phieuInfo?.trangThai || TRANG_THAI.KHOI_TAO;
  const isDaDuyet = trangThai === TRANG_THAI.DA_DUYET;

  // Xác định đơn vị và chức vụ của chủ phiếu để chọn luồng đánh giá phù hợp
  const donViName = useMemo(() => {
    return (
      lyLichInfo?.tenDonVi ||
      lyLichInfo?.tenDonVi_txt ||
      phieuInfo?.tenDonVi ||
      phieuInfo?.donVi ||
      user?.tenDonVi_txt ||
      ""
    );
  }, [lyLichInfo, phieuInfo, user]);

  const ownerEvaluationRole = useMemo(
    () => getOwnerEvaluationRole(lyLichInfo?.chucVuHienTai, donViName),
    [lyLichInfo, donViName]
  );

  const receivingRole = useMemo(() => {
    // 1. Ưu tiên cao nhất: buttonLuong từ Backend API
    if (phieuInfo?.buttonLuong?.chucVuNguoiXuLy) {
      return phieuInfo.buttonLuong.chucVuNguoiXuLy;
    }
    // 2. Nếu phiếu đã gửi, lấy vai trò từ trạng thái hiện tại
    const roleFromTrangThai = MapTrangThaiToVaiTro[trangThai];
    if (roleFromTrangThai && roleFromTrangThai !== "CaNhan" && roleFromTrangThai !== "DaDuyet") {
      return roleFromTrangThai;
    }
    // 3. Fallback: tính từ chức vụ chủ phiếu
    return getNextEvaluationRole(ownerEvaluationRole, donViName);
  }, [phieuInfo, ownerEvaluationRole, donViName, trangThai]);

  const currentRole = useMemo(() => {
    if (!phieuInfo) return "CaNhan";
    if (trangThai === TRANG_THAI.DA_DUYET) return receivingRole || "CaNhan";
    const targetVaiTro = MapTrangThaiToVaiTro[trangThai];
    return targetVaiTro || "CaNhan";
  }, [phieuInfo, trangThai, receivingRole]);

  const fetchLeafCriterionIds = useCallback(async (
    phieuId?: string | null,
    targetIdLyLich?: string | null,
    targetIdDot?: string | null,
  ) => {
    const idDotDanhGia = targetIdDot || effectiveIdDot;
    const idLyLich = targetIdLyLich || queryLyLich || phieuInfo?.idLyLich || effectiveIdLyLich;
    const emptyLeafIds = new Set<string>();

    // Khi đã có phiếu, để API resolver tự lấy lý lịch trên phiếu. Nếu dùng
    // lý lịch của người đang đánh giá trong lúc màn hình chưa tải xong phiếu,
    // có thể chọn nhầm bộ tiêu chí của PTP thay vì của người được đánh giá.
    if (!idDotDanhGia || (!idLyLich && !phieuId && !effectiveIdPhieu)) {
      leafCriterionIdsRef.current = emptyLeafIds;
      setLeafCriterionIds([]);
      return emptyLeafIds;
    }

    try {
      const response = await kPI_TieuChiChungService.getTreeDataForDot(
        idDotDanhGia,
        phieuId || effectiveIdPhieu ? undefined : idLyLich,
        phieuId || effectiveIdPhieu,
      );
      const currentLeafIds = collectLeafCriterionIds(response?.data || []);
      leafCriterionIdsRef.current = currentLeafIds;
      setLeafCriterionIds(Array.from(currentLeafIds));
      return currentLeafIds;
    } catch (error) {
      console.warn("Không tải được tiêu chí lá hiện hành của phiếu:", error);
      leafCriterionIdsRef.current = emptyLeafIds;
      setLeafCriterionIds([]);
      return emptyLeafIds;
    }
  }, [effectiveIdDot, effectiveIdLyLich, effectiveIdPhieu, phieuInfo?.idLyLich, queryLyLich]);

  const isOwner = useMemo(() => {
    const myUserId = String(user?.id || user?.userId || "").toLowerCase();
    const myLyLichId = String(user?.idLyLich || user?.lyLichId || "").toLowerCase();
    const targetLyLichId = String(queryLyLich || phieuInfo?.idLyLich || lyLichInfo?.id || "").toLowerCase();
    const sheetUserId = String(lyLichInfo?.userId || phieuInfo?.userId || "").toLowerCase();

    if (targetLyLichId && myLyLichId && targetLyLichId === myLyLichId) return true;
    if (sheetUserId && myUserId && sheetUserId === myUserId) return true;
    if (targetLyLichId && myUserId && targetLyLichId === myUserId) return true;
    if (!phieuInfo && !lyLichInfo && !queryLyLich) return true;

    return false;
  }, [phieuInfo, lyLichInfo, user, queryLyLich]);

  const isAssignedReceiver = useMemo(() => {
    if (!user || !activeProcess) return false;
    const myUserId = String(user?.id || user?.userId || "").toLowerCase();
    const procNguoiXuLy = String(activeProcess?.idNguoiXuLy || "").toLowerCase();

    return !!(
      procNguoiXuLy &&
      procNguoiXuLy !== "00000000-0000-0000-0000-000000000000" &&
      procNguoiXuLy === myUserId
    );
  }, [user, activeProcess]);

  const isSupervisorEvaluationStage = useMemo(() => (
    [
      TRANG_THAI.GUI_PHO_TRUONG_PHONG,
      TRANG_THAI.GUI_TRUONG_PHONG,
      TRANG_THAI.GUI_PHO_CUC_TRUONG,
      TRANG_THAI.GUI_CUC_TRUONG,
      TRANG_THAI.GUI_PHO_VU_TRUONG,
      TRANG_THAI.GUI_VU_TRUONG,
      TRANG_THAI.GUI_PHO_GIAM_DOC_TT,
      TRANG_THAI.GUI_GIAM_DOC_TT,
      TRANG_THAI.GUI_PHO_CHANH_VAN_PHONG,
      TRANG_THAI.GUI_CHANH_VAN_PHONG,
    ].includes(trangThai)
  ), [trangThai]);

  // Phân quyền thực hiện thao tác:
  const canOwnerAction = useMemo(() => {
    if (!isOwner || isDaDuyet) return false;
    return trangThai === TRANG_THAI.KHOI_TAO || trangThai === TRANG_THAI.TRA_VE;
  }, [isOwner, isDaDuyet, trangThai]);

  const canSupervisorAction = useMemo(() => {
    return !isOwner && isSupervisorEvaluationStage && isAssignedReceiver;
  }, [isOwner, isSupervisorEvaluationStage, isAssignedReceiver]);

  const canThuHoi = useMemo(() => {
    if (!effectiveIdPhieu || isDaDuyet) return false;
    const isSubmitted = trangThai !== TRANG_THAI.KHOI_TAO && trangThai !== TRANG_THAI.TRA_VE;
    if (!isSubmitted) return false;

    const myUserId = String(user?.id || user?.userId || "").toLowerCase();
    const myLyLichId = String(user?.idLyLich || user?.lyLichId || "").toLowerCase();
    const procNguoiGui = String(activeProcess?.idNguoiGui || "").toLowerCase();

    const isPrevSender = !!(
      procNguoiGui &&
      (procNguoiGui === myUserId || procNguoiGui === myLyLichId)
    );

    const isEligibleUser = isOwner || isPrevSender;
    const isNotProcessedYet = activeProcess ? activeProcess.isXuLy === false : true;

    return isEligibleUser && isNotProcessedYet;
  }, [effectiveIdPhieu, isDaDuyet, trangThai, isOwner, user, activeProcess]);

  const canEditAny = canOwnerAction || canSupervisorAction;
  const canSaveSection1 = trangThai === TRANG_THAI.KHOI_TAO || trangThai === TRANG_THAI.TRA_VE;
  const canSavePtp = canSupervisorAction;
  const isTCCReadOnly = !canOwnerAction;

  const selfScoreTitle = "Điểm do cá nhân tự chấm";
  const evaluatorRole = useMemo(() => {
    return canSupervisorAction ? (currentRole || MapTrangThaiToVaiTro[trangThai]) : "CaNhan";
  }, [canSupervisorAction, currentRole, trangThai]);

  const fetchPtpReview = useCallback(async (phieuId?: string | null) => {
    if (!phieuId) {
      setPtpReview({ items: [], canEdit: false, tongDiemCapTren: 0, isComplete: false });
      setPtpScores({});
      setPtpScoreIds({});
      setPtpNotes({});
      ptpDraftScoresRef.current = {};
      leafCriterionIdsRef.current = new Set();
      setLeafCriterionIds([]);
      return;
    }

    try {
      const response = await kPI_TieuChiChung_DiemSo_CapTrenService.getByPhieu(phieuId);
      if (response?.status === false) {
        return { error: true, message: response.message || "Không thể tải các dòng tiêu chí chung của phiếu.", section: "section1" };
      }
      const data = response?.data;
      if (!data) {
        return { error: true, message: "Không nhận được dữ liệu tiêu chí chung của phiếu.", section: "section1" };
      }

      const firstReviewItem = data.items?.[0];
      const currentLeafIds = await fetchLeafCriterionIds(
        phieuId,
        queryLyLich || phieuInfo?.idLyLich || firstReviewItem?.idLyLich,
        effectiveIdDot || firstReviewItem?.idDotDanhGia,
      );
      if (currentLeafIds.size === 0) {
        return { error: true, message: "Không xác định được các tiêu chí lá hiện hành của phiếu.", section: "section1" };
      }

      const reviewItems = getLeafReviewItems(data.items || [], currentLeafIds);
      const previousRole = PREVIOUS_EVALUATOR_ROLE[currentRole];
      const itemsWithoutCurrentScore = reviewItems.filter(
        (item) => item.diemCapTren === null || item.diemCapTren === undefined,
      );
      const inheritedScores = new Map<string, number | null>();

      // Với TP trở lên, lấy điểm đã có của cấp liền trước để tiền điền input khi cấp trên đang đánh giá
      if (canSupervisorAction && previousRole && itemsWithoutCurrentScore.length > 0) {
        const inheritedResults = await Promise.all(itemsWithoutCurrentScore.map(async (item) => {
          try {
            const response = await kPI_TieuChiChung_DiemSo_CapTrenService.getData({
              pageIndex: 1,
              pageSize: 1,
              id_TieuChiChung_DiemSo: item.idTieuChiChungDiemSo,
              vaiTroDanhGia: previousRole,
            });
            const inheritedScore = response?.data?.items?.[0]?.diemCapTren;
            return [item.idTieuChiChung, inheritedScore ?? null] as const;
          } catch {
            return [item.idTieuChiChung, null] as const;
          }
        }));

        inheritedResults.forEach(([criterionId, score]) => inheritedScores.set(criterionId, score));
      }
      const nextScores: Record<string, number | null> = {};
      const nextScoreIds: Record<string, string> = {};
      const nextNotes: Record<string, string | null> = {};
      const nextMultiRoleScores: Record<string, Record<string, number | null>> = {};

      reviewItems.forEach((item) => {
        // Gán điểm của từng vai trò đã đánh giá từ backend
        if (item.diemTheoVaiTro) {
          Object.entries(item.diemTheoVaiTro).forEach(([r, score]) => {
            if (!nextMultiRoleScores[r]) nextMultiRoleScores[r] = {};
            nextMultiRoleScores[r][item.idTieuChiChung] = score;
          });
        }

        nextScoreIds[item.idTieuChiChung] = item.idTieuChiChungDiemSo;
        nextNotes[item.idTieuChiChung] = item.ghiChu ?? null;

        // Chỉ điền điểm khởi tạo cho cấp trên nếu người dùng hiện tại thực sự là cấp trên đang đánh giá
        if (canSupervisorAction && evaluatorRole && evaluatorRole !== "CaNhan") {
          const currentRoleScore = item.diemCapTren
            ?? inheritedScores.get(item.idTieuChiChung)
            ?? item.diemTuCham
            ?? 0;

          nextScores[item.idTieuChiChung] = currentRoleScore;
          if (!nextMultiRoleScores[evaluatorRole]) nextMultiRoleScores[evaluatorRole] = {};
          if (nextMultiRoleScores[evaluatorRole][item.idTieuChiChung] === undefined) {
            nextMultiRoleScores[evaluatorRole][item.idTieuChiChung] = currentRoleScore;
          }
        } else {
          nextScores[item.idTieuChiChung] = item.diemCapTren ?? null;
        }
      });

      const filteredData: KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse = {
        ...data,
        items: reviewItems,
        tongDiemCapTren: reviewItems.reduce((sum, item) => sum + (Number(item.diemCapTren) || 0), 0),
      };

      setPtpReview(filteredData);
      setPtpScores(nextScores);
      setPtpScoreIds(nextScoreIds);
      setPtpNotes(nextNotes);
      setMultiRoleScores(nextMultiRoleScores);
      ptpDraftScoresRef.current = {};
      return filteredData;
    } catch (error) {
      console.warn("Lỗi khi tải điểm PTP:", error);
      return undefined;
    }
  }, [canSupervisorAction, evaluatorRole, currentRole, effectiveIdDot, fetchLeafCriterionIds, phieuInfo?.idLyLich, queryLyLich]);

  useEffect(() => {
    fetchPtpReview(effectiveIdPhieu);
  }, [effectiveIdPhieu, fetchPtpReview]);

  const handlePtpScoreInput = useCallback((id: string, value: number | null) => {
    ptpDraftScoresRef.current[id] = value;
    // Cập nhật state ngay khi gõ để tổng điểm PTP render lại tức thì.
    // PtpScoreInput vẫn giữ draft nội bộ nên không làm mất vị trí con trỏ.
    setPtpScores((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
    const targetRole = evaluatorRole || currentRole;
    if (targetRole && targetRole !== "CaNhan") {
      setMultiRoleScores((prev) => ({
        ...prev,
        [targetRole]: { ...(prev[targetRole] || {}), [id]: value },
      }));
    }
  }, [evaluatorRole, currentRole]);

  const handlePtpScoreChange = useCallback((id: string, value: number | null) => {
    ptpDraftScoresRef.current[id] = value;
    setPtpScores((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
    const targetRole = evaluatorRole || currentRole;
    if (targetRole && targetRole !== "CaNhan") {
      setMultiRoleScores((prev) => ({
        ...prev,
        [targetRole]: { ...(prev[targetRole] || {}), [id]: value },
      }));
    }
  }, [evaluatorRole, currentRole]);

  const nextStepInfo = useMemo(() => {
    // 1. Ưu tiên cao nhất: Dữ liệu buttonLuong từ Backend API
    if (phieuInfo?.buttonLuong) {
      const button = phieuInfo.buttonLuong;
      const isFinal = button.trangThaiTiepTheo === TRANG_THAI.DA_DUYET || !button.chucVuNguoiXuLy;
      const chucVuNhan = button.chucVuNguoiXuLy || undefined;
      const roleLabel = chucVuNhan ? getEvaluationRoleLabel(chucVuNhan) : "Cấp trên";
      return {
        nextStatus: button.trangThaiTiepTheo,
        buttonText: isFinal
          ? "Lưu và Phê duyệt"
          : `Lưu và ${button.tenButton ? button.tenButton : `Gửi ${roleLabel}`}`,
        chucVuNhan,
        isFinal,
        isLoading: false,
      };
    }

    // Đang tải dữ liệu ban đầu
    if (isInitialLoading) {
      return {
        nextStatus: "",
        buttonText: "Đang tải luồng...",
        chucVuNhan: undefined,
        isFinal: false,
        isLoading: true,
      };
    }

    // 2. Fallback nếu phiếu chưa nạp được buttonLuong
    const nextRole = getNextEvaluationRole(ownerEvaluationRole, donViName);
    if (!nextRole) {
      return {
        nextStatus: TRANG_THAI.DA_DUYET,
        buttonText: "Lưu và Phê duyệt",
        isFinal: true,
        isLoading: false,
      };
    }

    const label = getEvaluationRoleLabel(nextRole);
    const statusMap: Record<string, string> = {
      PhoVuTruong: TRANG_THAI.GUI_PHO_VU_TRUONG,
      VuTruong: TRANG_THAI.GUI_VU_TRUONG,
      PhoTruongPhong: TRANG_THAI.GUI_PHO_TRUONG_PHONG,
      TruongPhong: TRANG_THAI.GUI_TRUONG_PHONG,
      PhoCucTruong: TRANG_THAI.GUI_PHO_CUC_TRUONG,
      CucTruong: TRANG_THAI.GUI_CUC_TRUONG,
      PhoGiamDocTT: TRANG_THAI.GUI_PHO_GIAM_DOC_TT,
      GiamDocTT: TRANG_THAI.GUI_GIAM_DOC_TT,
      PhoGDTT: TRANG_THAI.GUI_PHO_GIAM_DOC_TT,
      GD: TRANG_THAI.GUI_GIAM_DOC_TT,
      PhoChanhVanPhong: TRANG_THAI.GUI_PHO_CHANH_VAN_PHONG,
      PHOCHANHVANPHONG: TRANG_THAI.GUI_PHO_CHANH_VAN_PHONG,
      ChanhVanPhong: TRANG_THAI.GUI_CHANH_VAN_PHONG,
    };

    return {
      nextStatus: statusMap[nextRole] || (isVuDepartment(donViName) ? TRANG_THAI.GUI_PHO_VU_TRUONG : TRANG_THAI.GUI_PHO_TRUONG_PHONG),
      buttonText: `Lưu và Gửi ${label}`,
      chucVuNhan: nextRole,
      isFinal: false,
      isLoading: false,
    };
  }, [phieuInfo, ownerEvaluationRole, donViName, isInitialLoading]);

  const scrollToErrorSection = useCallback((section: string) => {
    setErrorSection(section);
    setTimeout(() => {
      const targetId = section === "section1" ? "danhgia-section1" : "danhgia-section2";
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    setTimeout(() => setErrorSection(null), 4000);
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.scrollingElement?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const savePtpScores = async (phieuId: string, isHoanTat = false) => {
    let currentLeafIds = leafCriterionIdsRef.current;
    if (currentLeafIds.size === 0) {
      const firstReviewItem = ptpReview.items?.[0];
      currentLeafIds = await fetchLeafCriterionIds(
        phieuId,
        queryLyLich || phieuInfo?.idLyLich || firstReviewItem?.idLyLich,
        effectiveIdDot || firstReviewItem?.idDotDanhGia,
      );
    }

    if (currentLeafIds.size === 0) {
      return { error: true, message: "Không xác định được các tiêu chí lá hiện hành của phiếu.", section: "section1" };
    }

    let currentReviewItems = getLeafReviewItems(ptpReview.items || [], currentLeafIds);
    if (!currentReviewItems || currentReviewItems.length === 0) {
      const refreshedReview = await fetchPtpReview(phieuId);
      if (!refreshedReview || !("items" in refreshedReview)) {
        return isSaveError(refreshedReview)
          ? refreshedReview
          : { error: true, message: "Không tải được các dòng tiêu chí chung để lưu điểm PTP.", section: "section1" };
      }
      currentReviewItems = getLeafReviewItems(refreshedReview.items || [], leafCriterionIdsRef.current);
    }

    if (!currentReviewItems || currentReviewItems.length === 0) {
      return { error: true, message: "Không tìm thấy các dòng tiêu chí chung để lưu điểm PTP.", section: "section1" };
    }
    try {
      const items = currentReviewItems.map((item) => {
        const hasDraftScore = Object.prototype.hasOwnProperty.call(ptpDraftScoresRef.current, item.idTieuChiChung);
        const inputScore = hasDraftScore
          ? ptpDraftScoresRef.current[item.idTieuChiChung]
          : ptpScores[item.idTieuChiChung];
        const scoreVal = hasDraftScore || (inputScore !== undefined && inputScore !== null)
          ? inputScore
          : item.diemCapTren;
        const finalDiem = scoreVal ?? 0;

        return {
          idTieuChiChungDiemSo: item.idTieuChiChungDiemSo,
          diem: finalDiem,
          ghiChu: ptpNotes[item.idTieuChiChung] ?? item.ghiChu ?? null,
        };
      });

      const res = await kPI_TieuChiChung_DiemSo_CapTrenService.saveBatch({
        idPhieuDanhGia: phieuId,
        isHoanTat,
        items,
      });

      if (res?.status === false) {
        return { error: true, message: res?.message || "Lưu điểm cấp trên thất bại", section: "section1" };
      }
      return true;
    } catch (e: any) {
      console.error("Lỗi khi lưu điểm cấp trên:", e);
      return { error: true, message: e?.message || "Lỗi khi lưu điểm cấp trên", section: "section1" };
    }
  };

  const handleSaveAll = async (isHoanTat = false, operation: "save" | "transition" = "save") => {
    if (!canOwnerAction && !canSupervisorAction) {
      message.warning({ content: "Bạn không có quyền chỉnh sửa phiếu ở trạng thái này!", key: "save_full_phieu" });
      return null;
    }

    if (saveOperationRef.current) return null;
    saveOperationRef.current = true;

    setErrorSection(null);
    try {
      if (operation === "transition") {
        setTransitionSaving(true);
      } else {
        setSaving(true);
      }
      let phieuId: string | null = effectiveIdPhieu || currentIdPhieu || null;

      if (canSaveSection1 && danhGiaSaveRef.current) {
        const generalSaved = await danhGiaSaveRef.current();
        if (isSaveError(generalSaved)) {
          message.error({ content: generalSaved.message, key: "save_full_phieu", duration: 5 });
          scrollToErrorSection(generalSaved.section);
          return null;
        }
        if (generalSaved === false) {
          message.error({ content: "Lưu phiếu đánh giá thất bại!", key: "save_full_phieu" });
          scrollToErrorSection("section1");
          return null;
        }
        const savedId = typeof generalSaved === "string" ? generalSaved : generalSaved?.data || null;
        if (savedId) {
          phieuId = savedId;
          setCurrentIdPhieu(savedId);
        }
      }

      if (!phieuId) {
        message.error({ content: "Không tìm thấy phiếu đánh giá!", key: "save_full_phieu" });
        scrollToErrorSection("section1");
        return null;
      }

      if (canSavePtp) {
        const ptpSaved = await savePtpScores(phieuId, isHoanTat);
        if (isSaveError(ptpSaved)) {
          message.error({ content: ptpSaved.message, key: "save_full_phieu", duration: 5 });
          scrollToErrorSection(ptpSaved.section);
          return null;
        }
      }

      // Lưu bảng đánh giá Section 2 (tránh gọi trùng lặp cùng 1 saveRef nhiều lần)
      const executedSaveRefs = new Set<any>();
      if (bieuChamDiemSaveRef.current) {
        const tasksSaved = await bieuChamDiemSaveRef.current(phieuId);
        if (isSaveError(tasksSaved)) {
          message.error({ content: tasksSaved.message, key: "save_full_phieu", duration: 5 });
          scrollToErrorSection(tasksSaved.section);
          return null;
        }
        executedSaveRefs.add(bieuChamDiemSaveRef.current);
      }

      for (const roleCode of EVALUATION_ROLE_CODES) {
        const roleSave = roleSaveRefs.current[roleCode];
        if (roleSave && !executedSaveRefs.has(roleSave)) {
          executedSaveRefs.add(roleSave);
          try {
            const tasksSaved = await roleSave(phieuId);
            if (isSaveError(tasksSaved)) {
              message.error({ content: tasksSaved.message, key: "save_full_phieu", duration: 5 });
              scrollToErrorSection(tasksSaved.section);
              return null;
            }
          } catch (e) {
            console.warn(`Lỗi khi lưu bảng của role ${roleCode}:`, e);
          }
        }
      }

      message.success({ content: "Lưu phiếu đánh giá thành công!", key: "save_full_phieu" });
      await fetchInfo();
      await fetchPtpReview(phieuId);
      scrollToTop();
      return phieuId;
    } catch (error) {
      console.error("Lỗi khi lưu toàn bộ phiếu đánh giá:", error);
      message.error({ content: "Lưu phiếu đánh giá thất bại!", key: "save_full_phieu" });
      return null;
    } finally {
      if (operation === "transition") {
        setTransitionSaving(false);
      } else {
        setSaving(false);
      }
      saveOperationRef.current = false;
    }
  };

  const handleOpenChuyenBuocModal = async (action: "send" | "return" | "approve") => {
    if (action === "return") {
      const phieuId = effectiveIdPhieu || currentIdPhieu;
      if (!phieuId) {
        toast.error("Vui lòng lưu phiếu trước khi trả về!");
        return;
      }
      setChuyenBuocModal({
        visible: true,
        type: "return",
        title: "Xác nhận trả về cấp dưới",
        content: "Phiếu đánh giá sẽ được trả về cho cấp dưới điều chỉnh lại kết quả.",
        listNguoiXuLy: [],
        selectedNguoiXuLyId: undefined,
        ghiChu: "",
      });
      return;
    }

    if (isInitialLoading || nextStepInfo.isLoading) {
      toast.info("Đang tải dữ liệu luồng xử lý, vui lòng chờ trong giây lát...");
      return;
    }

    // Tự động lưu toàn bộ phiếu trước khi chuyển bước / gửi
    const savedPhieuId = await handleSaveAll(action === "approve", "transition");
    if (!savedPhieuId) {
      return;
    }

    const phieuId = savedPhieuId;

    const nextInfo = nextStepInfo;

    if (nextInfo?.isFinal) {
      setChuyenBuocModal({
        visible: true,
        type: "approve",
        title: "Xác nhận phê duyệt",
        content: "Phê duyệt kết quả đánh giá cho phiếu này? Sau khi phê duyệt sẽ không thể chỉnh sửa.",
        listNguoiXuLy: [],
        selectedNguoiXuLyId: undefined,
        ghiChu: "",
      });
      return;
    }

    let listNguoiXuLy: any[] = [];
    if (nextInfo?.chucVuNhan) {
      try {
        const resNguoi = await kPI_PhieuDanhGiaService.getNguoiXuLy(phieuId, nextInfo.chucVuNhan);
        if (resNguoi?.data && Array.isArray(resNguoi.data)) {
          listNguoiXuLy = resNguoi.data;
        }
      } catch (e) {
        console.warn("Could not load nguoi xu ly:", e);
      }
    }

    if (nextInfo?.chucVuNhan && listNguoiXuLy.length === 0) {
      toast.warning(`Không tìm thấy ${getEvaluationRoleLabel(nextInfo.chucVuNhan)} để nhận phiếu. Vui lòng kiểm tra dữ liệu chức vụ/đơn vị.`);
      return;
    }

    setChuyenBuocModal({
      visible: true,
      type: "send",
      title: nextInfo?.buttonText || "Lưu và Chuyển bước",
      content: `Lưu và chuyển phiếu đánh giá lên bước tiếp theo (${nextInfo?.buttonText})?`,
      listNguoiXuLy,
      selectedNguoiXuLyId: listNguoiXuLy.length > 0 ? listNguoiXuLy[0].id : undefined,
      ghiChu: "",
    });
  };

  const handleConfirmChuyenBuoc = async () => {
    const phieuId = effectiveIdPhieu || currentIdPhieu;
    if (!phieuId) return;

    const isReturn = chuyenBuocModal.type === "return";
    if (!isReturn && !nextStepInfo.isFinal && !chuyenBuocModal.selectedNguoiXuLyId) {
      toast.warning("Vui lòng chọn người xử lý tiếp theo.");
      return;
    }

    // Gửi/phê duyệt đã được lưu trước khi mở modal. Chỉ nút trả về mới
    // cần lưu tại bước xác nhận để tránh gọi lưu hai lần.
    if (chuyenBuocModal.type === "return") {
      const saveOk = await handleSaveAll(false, "transition");
      if (!saveOk) return;
    }

    setLoading(true);
    try {
      const response = await kPI_PhieuDanhGiaService.chuyenBuocLuong({
        idPhieuDanhGia: phieuId,
        idNguoiGui: user?.id || user?.userId || "",
        idNguoiXuLy: chuyenBuocModal.selectedNguoiXuLyId,
        ghiChu: chuyenBuocModal.ghiChu || (isReturn ? "Trả về cấp dưới" : "Chuyển bước luồng"),
        isTuChoi: isReturn,
      });

      if (!response?.status) {
        toast.error(response?.message || "Không thể chuyển bước luồng đánh giá.");
        return;
      }

      setChuyenBuocModal((prev) => ({ ...prev, visible: false }));
      toast.success(isReturn ? "Đã trả phiếu về cấp dưới!" : "Chuyển bước đánh giá thành công!");
      // Trạng thái cuối cùng luôn lấy lại từ API: bước thực tế phụ thuộc Luong của phiếu.
      await fetchInfo();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Lỗi khi chuyển bước luồng!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmThuHoi = async () => {
    const phieuId = effectiveIdPhieu || currentIdPhieu;
    if (!phieuId) {
      toast.error("Không tìm thấy phiếu đánh giá để thu hồi!");
      return;
    }

    setThuHoiLoading(true);
    try {
      const res = await kPI_PhieuDanhGiaService.thuHoiPhieu({
        idPhieuDanhGia: phieuId,
        idNguoiThuHoi: user?.id || user?.userId || "",
        ghiChu: thuHoiGhiChu || "Cá nhân thu hồi phiếu đánh giá",
      });

      if (res && res.status !== false) {
        toast.success("Thu hồi phiếu đánh giá thành công!");
        setThuHoiModalVisible(false);
        setThuHoiGhiChu("");
        setPhieuInfo((prev: any) => (prev ? { ...prev, trangThai: TRANG_THAI.KHOI_TAO } : prev));
        await fetchInfo();
        await fetchPtpReview(phieuId);
      } else {
        toast.error(res?.message || "Thu hồi phiếu đánh giá thất bại!");
      }
    } catch (err: any) {
      console.error("Lỗi khi thu hồi phiếu:", err);
      toast.error(err?.message || "Lỗi khi thu hồi phiếu đánh giá!");
    } finally {
      setThuHoiLoading(false);
    }
  };

  const tt = trangThaiConfig[trangThai] || { color: "default", label: trangThai, icon: null };
  const statusLabel = isSupervisorEvaluationStage && receivingRole
    ? `Chờ ${getEvaluationRoleLabel(receivingRole)} đánh giá`
    : tt.label;
  const childParams = useMemo(() => ({ id: effectiveIdDot }), [effectiveIdDot]);
  const isSentToReceiver = trangThai !== TRANG_THAI.KHOI_TAO && trangThai !== TRANG_THAI.TRA_VE;
  const creatorRole = ownerEvaluationRole;
  const receiverRole = receivingRole || "CaNhan";
  const creatorLabel = getEvaluationRoleShortLabel(creatorRole as any);
  const receiverLabel = receivingRole ? getEvaluationRoleShortLabel(receivingRole as any) : "Hoàn tất";
  const showWorkflowProgressCard = Boolean(receivingRole);
  const showSupervisorColumn = useMemo(() => {
    return (
      canSupervisorAction ||
      isDaDuyet ||
      Boolean(ptpReview?.danhSachVaiTroDaDanhGia && ptpReview.danhSachVaiTroDaDanhGia.length > 0) ||
      Boolean(ptpReview?.items?.some((i) => i.diemCapTren !== null && i.diemCapTren !== undefined))
    );
  }, [canSupervisorAction, isDaDuyet, ptpReview]);

  const ROLE_HIERARCHY = useMemo(() => [
    "PhoTruongPhong",
    "PhoChanhVanPhong",
    "PhoGDTT",
    "PhoGiamDocTT",
    "TruongPhong",
    "ChanhVanPhong",
    "GD",
    "GiamDocTT",
    "PhoCucTruong",
    "PhoVuTruong",
    "CucTruong",
    "VuTruong",
  ], []);

  const displayRoles = useMemo(() => {
    const rolesSet = new Set<string>();

    // 1. Các vai trò đã có điểm từ backend
    if (ptpReview?.danhSachVaiTroDaDanhGia) {
      ptpReview.danhSachVaiTroDaDanhGia.forEach((r) => {
        if (r && r !== "CaNhan") rolesSet.add(r);
      });
    }

    Object.keys(multiRoleScores).forEach((r) => {
      if (r && r !== "CaNhan") {
        const scores = multiRoleScores[r];
        if (scores && Object.values(scores).some((v) => v !== null && v !== undefined)) {
          rolesSet.add(r);
        }
      }
    });

    // 2. Vai trò của người đang chấm nếu là cấp trên đang trực tiếp đánh giá
    if (canSupervisorAction && evaluatorRole && evaluatorRole !== "CaNhan") {
      rolesSet.add(evaluatorRole);
    }
    if (canSupervisorAction && currentRole && currentRole !== "CaNhan") {
      rolesSet.add(currentRole);
    }

    return Array.from(rolesSet).sort((a, b) => {
      const idxA = ROLE_HIERARCHY.indexOf(a);
      const idxB = ROLE_HIERARCHY.indexOf(b);
      const orderA = idxA >= 0 ? idxA : 999;
      const orderB = idxB >= 0 ? idxB : 999;
      return orderA - orderB;
    });
  }, [
    ptpReview,
    multiRoleScores,
    canSupervisorAction,
    evaluatorRole,
    currentRole,
    ROLE_HIERARCHY,
  ]);

  const supervisorColumns = useMemo<SupervisorColumnConfig[]>(() => {
    if (displayRoles.length === 0) return [];
    return displayRoles.map((role) => {
      const isCurrentEditing = canSupervisorAction && (role === evaluatorRole || role === currentRole);
      const title = ROLE_DETAILS[role]?.scoreTitle || `${getEvaluationRoleLabel(role as any)} đánh giá`;
      const currentScores = multiRoleScores[role] || (role === currentRole ? ptpScores : {});

      return {
        role,
        title,
        scores: currentScores,
        canEdit: isCurrentEditing,
        onScoreInput: (id: string, val: number | null) => {
          if (isCurrentEditing) {
            handlePtpScoreInput(id, val);
            setMultiRoleScores((prev) => ({
              ...prev,
              [role]: { ...(prev[role] || {}), [id]: val },
            }));
          }
        },
        onScoreChange: (id: string, val: number | null) => {
          if (isCurrentEditing) {
            handlePtpScoreChange(id, val);
            setMultiRoleScores((prev) => ({
              ...prev,
              [role]: { ...(prev[role] || {}), [id]: val },
            }));
          }
        },
      };
    });
  }, [
    displayRoles,
    canSupervisorAction,
    evaluatorRole,
    currentRole,
    ROLE_DETAILS,
    multiRoleScores,
    ptpScores,
    handlePtpScoreInput,
    handlePtpScoreChange,
  ]);

  const multiCapSummaryRoles = useMemo<MultiCapSummaryRole[]>(() => {
    const roles: MultiCapSummaryRole[] = [];
    const currentLeafIds = new Set(leafCriterionIds);

    // 1. Cá nhân
    const personalTCC = Number(phieuInfo?.diemTieuChiChung || 0);
    const rawCaNhanTask = roleScoresState["CaNhan"];
    const personalTask = (rawCaNhanTask != null && rawCaNhanTask > 0)
      ? rawCaNhanTask
      : (Number(phieuInfo?.diemThucHienNhiemVu || 0) || rawCaNhanTask || 0);
    roles.push({
      role: "CaNhan",
      title: "Cá nhân tự chấm",
      diemTieuChiChung: personalTCC,
      diemThucHienNhiemVu: personalTask,
      tongDiem: personalTCC + personalTask,
      hasEvaluated: true,
    });

    // 2. Các vai trò cấp trên cần hiển thị ở bảng tổng hợp
    const summaryRoleSet = new Set<string>();
    displayRoles.forEach((r) => summaryRoleSet.add(r));
    if (isSentToReceiver && receivingRole && receivingRole !== "CaNhan") {
      summaryRoleSet.add(receivingRole);
    }

    const sortedSummaryRoles = Array.from(summaryRoleSet).sort((a, b) => {
      const idxA = ROLE_HIERARCHY.indexOf(a);
      const idxB = ROLE_HIERARCHY.indexOf(b);
      return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
    });

    sortedSummaryRoles.forEach((r) => {
      const isEditing = canSupervisorAction && (r === evaluatorRole || r === currentRole);
      const hasTccScores = Boolean(
        ptpReview?.danhSachVaiTroDaDanhGia?.includes(r) ||
        (multiRoleScores[r] && Object.values(multiRoleScores[r]).some((v) => v !== null && v !== undefined))
      );
      const hasTaskScores = Boolean(roleScoresState[r] !== undefined && roleScoresState[r] !== null);

      if (!hasTccScores && !hasTaskScores && !isEditing) {
        roles.push({
          role: r,
          title: ROLE_DETAILS[r]?.label || getEvaluationRoleLabel(r as any),
          diemTieuChiChung: null,
          diemThucHienNhiemVu: null,
          tongDiem: null,
          isEditing: false,
          hasEvaluated: false,
        });
        return;
      }

      const scoresMap = multiRoleScores[r] || (isEditing ? ptpScores : {});
      const tccTotal = Object.entries(scoresMap).reduce((sum, [cId, val]) => {
        return currentLeafIds.has(normalizeCriterionId(cId)) ? sum + (Number(val) || 0) : sum;
      }, 0);
      const taskScore = roleScoresState[r] ?? roleScoresRef.current[r] ?? (isEditing ? personalTask : 0);

      roles.push({
        role: r,
        title: ROLE_DETAILS[r]?.label || getEvaluationRoleLabel(r as any),
        diemTieuChiChung: tccTotal,
        diemThucHienNhiemVu: taskScore,
        tongDiem: tccTotal + taskScore,
        isEditing,
        hasEvaluated: hasTccScores || hasTaskScores,
      });
    });

    return roles;
  }, [
    phieuInfo,
    displayRoles,
    isSentToReceiver,
    receivingRole,
    ROLE_HIERARCHY,
    ROLE_DETAILS,
    ptpReview,
    multiRoleScores,
    ptpScores,
    leafCriterionIds,
    canSupervisorAction,
    evaluatorRole,
    currentRole,
    roleScoresState,
  ]);

  const handleBieuChamDiemSaveRef = useCallback((ref: any) => {
    bieuChamDiemSaveRef.current = ref;
    if (currentRole) {
      roleSaveRefs.current[currentRole] = ref;
    }
    roleSaveRefs.current[ownerEvaluationRole] = ref;
    roleSaveRefs.current["CaNhan"] = ref;
  }, [currentRole, ownerEvaluationRole]);

  const handleTaskScoreChange = useCallback((sc: number, allScores?: Record<string, number>) => {
    if (allScores && Object.keys(allScores).length > 0) {
      handleRoleTaskScoresChange(allScores);
    } else {
      handleRoleScoreChange(evaluatorRole, sc);
    }
  }, [evaluatorRole, handleRoleScoreChange, handleRoleTaskScoresChange]);

  console.log("Nextstep", nextStepInfo);

  const extraSectionIContent = useMemo(() => (
    <div id="danhgia-section2" className={errorSection === "section2" ? "save-error-section" : ""} style={{ marginTop: "16px", marginBottom: "16px" }}>
      <Card
        className="kpi-allow-sticky"
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Space size={10}>
              <TeamOutlined style={{ color: "#0355a2", fontSize: 18 }} />
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
                II. KẾT QUẢ THỰC HIỆN NHIỆM VỤ
              </span>
            </Space>
          </div>
        }
        style={{ borderRadius: "12px", border: "1px solid #cbd5e1" }}
        styles={{ body: { padding: "8px" } }}
      >
        <BieuChamDiemV2Component
          params={childParams}
          idDot={effectiveIdDot}
          idPhieu={effectiveIdPhieu}
          idLyLich={effectiveIdLyLich}
          hideSaveButton={true}
          hideHeader={true}
          saveRef={handleBieuChamDiemSaveRef}
          silentSave={true}
          hasSection1Header={false}
          enableAttachmentPreview={true}
          viewOnly={!canEditAny}
          isMultiCap={true}
          isMergedRoleView={true}
          currentTrangThai={trangThai}
          vaiTroDanhGia={evaluatorRole}
          onTaskScoreChange={handleTaskScoreChange}
          onRoleTaskScoresChange={handleRoleTaskScoresChange}
        />
      </Card>
    </div>
  ), [
    errorSection,
    childParams,
    effectiveIdDot,
    effectiveIdPhieu,
    effectiveIdLyLich,
    handleBieuChamDiemSaveRef,
    canEditAny,
    trangThai,
    evaluatorRole,
    handleTaskScoreChange,
    handleRoleTaskScoresChange,
  ]);

  return (
    <>
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
        .btn-custom-back {
          background-color: #ff4d4f !important;
          border-color: #ff4d4f !important;
          color: #fff !important;
        }
        .btn-custom-back:hover, .btn-custom-back:focus {
          background-color: #f5222d !important;
          border-color: #f5222d !important;
          color: #fff !important;
          opacity: 0.9;
        }
      `}</style>

      <div className="mb-2">
        <AutoBreadcrumb />
      </div>

      <div style={{ background: "#fff", padding: 0, minHeight: "80vh" }}>
        {/* Thanh công cụ Sticky */}
        <div
          className="ios-glass-header"
          style={{
            position: "sticky",
            top: "56px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            height: "50px",
            padding: "0 16px",
            marginBottom: "16px",
          }}
        >
          <Button
            type="primary"
            className="btn-custom-back"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/kPI_PhieuDanhGia/CaNhan2");
              }
            }}
            style={{
              fontWeight: 500,
              boxShadow: "0 4px 14px rgba(255, 77, 79, 0.35)",
              borderRadius: "6px",
            }}
          >
            Quay lại
          </Button>
        </div>

        {/* Thanh trạng thái */}
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: 12 }}>
          <Tag icon={tt.icon} color={tt.color} style={{ fontSize: 13, padding: "4px 12px", borderRadius: 20 }}>
            {statusLabel}
          </Tag>
        </div>

        {/* Chỉ hiển thị khi chức vụ chủ phiếu có cấp nhận kế tiếp trong bảng ánh xạ. */}
        {showWorkflowProgressCard && (
          <Card style={{ marginBottom: 16, borderRadius: 8, border: "1px solid #e5e7eb" }} styles={{ body: { padding: "18px 28px" } }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 145, color: "#0355a2" }}>
                {creatorRole === "CaNhan" ? <UserOutlined style={{ fontSize: 34 }} /> : <TeamOutlined style={{ fontSize: 34 }} />}
                <span style={{ fontWeight: 700, fontSize: 15, textAlign: "center" }}>{creatorLabel}</span>
              </div>
              <div style={{ flex: 1, height: 3, background: isSentToReceiver ? "#1677ff" : "#d9d9d9", borderRadius: 99, position: "relative" }}>
                <span style={{ position: "absolute", top: -7, left: isSentToReceiver ? "calc(100% - 10px)" : "-1px", width: 16, height: 16, borderRadius: "50%", background: isSentToReceiver ? "#1677ff" : "#bfbfbf", border: "3px solid #fff", boxShadow: "0 0 0 1px rgba(0,0,0,.08)", transition: "left .25s ease" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 145, color: isSentToReceiver ? "#0355a2" : "#8c8c8c" }}>
                {receiverRole === "CaNhan" ? <UserOutlined style={{ fontSize: 34 }} /> : <TeamOutlined style={{ fontSize: 34 }} />}
                <span style={{ fontWeight: 700, fontSize: 15, textAlign: "center" }}>{receiverLabel}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Giao diện V2 chuẩn: DanhGiaV2Component (Phần I & III) + Collapse 5 Cấp thẩm quyền (Phần II Mục A & B) */}
        <div id="danhgia-section1" className={errorSection === "section1" ? "save-error-section" : ""}>
          <DanhGiaV2Component
            params={childParams}
            idDot={effectiveIdDot}
            idPhieu={effectiveIdPhieu}
            idLyLich={effectiveIdLyLich}
            hideSaveButton={true}
            hideHeader={true}
            saveRef={danhGiaSaveRef}
            silentSave={true}
            viewOnly={isTCCReadOnly}
            canInheritScores={canOwnerAction}
            selfScoreTitle={selfScoreTitle}
            supervisorColumns={supervisorColumns}
            multiCapSummaryRoles={multiCapSummaryRoles}
            showPtpColumn={showSupervisorColumn}
            supervisorScoreTitle={getEvaluationScoreTitle(receivingRole)}
            ptpScores={ptpScores}
            ptpCanEdit={canSavePtp}
            ptpTotal={totalPtpScore}
            onPtpScoreInput={handlePtpScoreInput}
            onPtpScoreChange={handlePtpScoreChange}
            scorePrecision={1}
            scoreStep={1}
            showCollapseAllToggle={true}
            extraSectionIContent={extraSectionIContent}
          />
        </div>

        {/* Master Workflow Action Bar */}
        {!isDaDuyet && (canEditAny || canThuHoi) && (
          <>
            <style>{`
              .btn-custom-draft {
                background: #10b981 !important;
                border-color: #10b981 !important;
                color: #fff !important;
              }
              .btn-custom-draft:hover, .btn-custom-draft:focus {
                background: #059669 !important;
                border-color: #059669 !important;
                color: #fff !important;
                opacity: 0.9;
              }
              .btn-custom-submit {
                background: #ea580c !important;
                border-color: #ea580c !important;
                color: #fff !important;
              }
              .btn-custom-submit:hover, .btn-custom-submit:focus {
                background: #c2410c !important;
                border-color: #c2410c !important;
                color: #fff !important;
                opacity: 0.9;
              }
              .btn-custom-approve {
                background: #059669 !important;
                border-color: #059669 !important;
                color: #fff !important;
              }
              .btn-custom-approve:hover, .btn-custom-approve:focus {
                background: #047857 !important;
                border-color: #047857 !important;
                color: #fff !important;
                opacity: 0.9;
              }
              .btn-custom-recall {
                background: #dc2626 !important;
                border-color: #dc2626 !important;
                color: #fff !important;
              }
              .btn-custom-recall:hover, .btn-custom-recall:focus {
                background: #b91c1c !important;
                border-color: #b91c1c !important;
                color: #fff !important;
                opacity: 0.9;
              }
            `}</style>
            <div
              style={{
                position: "fixed",
                bottom: "24px",
                right: "30px",
                zIndex: 999,
                display: "flex",
                gap: 12,
                alignItems: "center",
                background: "rgba(255, 255, 255, 0.45)",
                backdropFilter: "saturate(180%) blur(20px)",
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                padding: "12px 18px",
                borderRadius: "14px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)"
              }}
            >
              {/* Nút Thu hồi - Hiển thị cho chủ phiếu hoặc người gửi trước khi phiếu đã gửi và cấp trên chưa xử lý */}
              {canThuHoi && (
                <Button
                  type="primary"
                  className="btn-custom-recall"
                  icon={<UndoOutlined />}
                  onClick={() => setThuHoiModalVisible(true)}
                  loading={thuHoiLoading}
                  style={{
                    fontWeight: "600",
                    borderRadius: "6px",
                    textTransform: "uppercase",
                    boxShadow: "0 4px 10px rgba(220, 38, 38, 0.3)"
                  }}
                >
                  THU HỒI PHIẾU
                </Button>
              )}

              {canEditAny && (
                <>
                  <Button
                    type="primary"
                    className="btn-custom-draft"
                    icon={<SaveOutlined />}
                    onClick={() => handleSaveAll(false)}
                    loading={saving}
                    disabled={transitionSaving}
                    style={{
                      fontWeight: "600",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    LƯU
                  </Button>

                  {/* Nút Trả về chỉ hiển thị cho người đang được giao xử lý ở bước cấp trên. */}
                  {canSupervisorAction && currentRole !== "CaNhan" && (
                    <Button
                      danger
                      icon={<RollbackOutlined />}
                      onClick={() => handleOpenChuyenBuocModal("return")}
                      style={{ borderRadius: "6px", fontWeight: "600" }}
                    >
                      TRẢ VỀ
                    </Button>
                  )}

                  {/* Nút Lưu và Gửi / Lưu và Phê duyệt */}
                  <Button
                    type="primary"
                    className={nextStepInfo.isFinal ? "btn-custom-approve" : "btn-custom-submit"}
                    icon={isInitialLoading || nextStepInfo.isLoading ? <LoadingOutlined /> : (nextStepInfo.isFinal ? <CheckCircleOutlined /> : <SendOutlined />)}
                    onClick={() => handleOpenChuyenBuocModal(nextStepInfo.isFinal ? "approve" : "send")}
                    loading={transitionSaving || isInitialLoading || nextStepInfo.isLoading}
                    disabled={saving || isInitialLoading || nextStepInfo.isLoading}
                    style={{
                      fontWeight: "600",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      boxShadow: nextStepInfo.isFinal
                        ? "0 4px 10px rgba(5, 150, 105, 0.3)"
                        : "0 4px 10px rgba(234, 88, 12, 0.3)"
                    }}
                  >
                    {isInitialLoading || nextStepInfo.isLoading
                      ? "ĐANG TẢI LUỒNG..."
                      : (nextStepInfo.buttonText || (nextStepInfo.isFinal ? "LƯU VÀ PHÊ DUYỆT" : "LƯU VÀ TRÌNH"))}
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* Modal chuyển bước / chọn người nhận */}
        <Modal
          open={chuyenBuocModal.visible}
          title={
            <span
              style={{
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              {chuyenBuocModal.title}
            </span>
          }
          closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
          onOk={handleConfirmChuyenBuoc}
          onCancel={() => setChuyenBuocModal((p) => ({ ...p, visible: false }))}
          okText={<span style={{ color: "#ffffff", fontWeight: 600 }}>Xác nhận</span>}
          cancelText="Hủy"
          confirmLoading={loading}
          styles={{
            header: {
              background: chuyenBuocModal.type === "return" ? "#dc2626" : chuyenBuocModal.type === "approve" ? "#059669" : "#0355a2",
              padding: "12px 16px",
              margin: 0,
              borderRadius: "8px 8px 0 0",
            },
          }}
          okButtonProps={{
            danger: chuyenBuocModal.type === "return",
            type: "primary",
            style: {
              color: "#ffffff",
              backgroundColor: chuyenBuocModal.type === "return"
                ? "#dc2626"
                : chuyenBuocModal.type === "approve"
                  ? "#059669"
                  : "#0355a2",
              borderColor: chuyenBuocModal.type === "return"
                ? "#dc2626"
                : chuyenBuocModal.type === "approve"
                  ? "#059669"
                  : "#0355a2",
            },
          }}
        >
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontSize: 14, marginBottom: 12 }}>{chuyenBuocModal.content}</p>

            {chuyenBuocModal.listNguoiXuLy.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Chọn người nhận đánh giá / duyệt:</div>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Chọn người xử lý..."
                  value={chuyenBuocModal.selectedNguoiXuLyId}
                  onChange={(v) => setChuyenBuocModal((prev) => ({ ...prev, selectedNguoiXuLyId: v }))}
                  options={chuyenBuocModal.listNguoiXuLy.map((item) => ({
                    label: `${item.hoTen || item.fullName} (${item.tenChucVu || item.chucVu || ""})`,
                    value: item.id || item.userId,
                  }))}
                />
              </div>
            )}

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Ý kiến / Ghi chú gửi kèm:</div>
              <Input.TextArea
                rows={3}
                placeholder="Nhập ý kiến xử lý..."
                value={chuyenBuocModal.ghiChu}
                onChange={(e) => setChuyenBuocModal((prev) => ({ ...prev, ghiChu: e.target.value }))}
              />
            </div>
          </div>
        </Modal>

        {/* Modal xác nhận thu hồi phiếu */}
        <Modal
          open={thuHoiModalVisible}
          title={
            <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "16px" }}>
              Xác nhận thu hồi phiếu đánh giá
            </span>
          }
          closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
          onOk={handleConfirmThuHoi}
          onCancel={() => {
            setThuHoiModalVisible(false);
            setThuHoiGhiChu("");
          }}
          okText={<span style={{ color: "#ffffff", fontWeight: 600 }}>Xác nhận thu hồi</span>}
          cancelText="Hủy"
          confirmLoading={thuHoiLoading}
          styles={{
            header: {
              background: "#d97706",
              padding: "12px 16px",
              margin: 0,
              borderRadius: "8px 8px 0 0",
            },
            body: { padding: 0 },
          }}
          okButtonProps={{
            type: "primary",
            style: {
              color: "#ffffff",
              backgroundColor: "#d97706",
              borderColor: "#d97706",
            },
          }}
        >
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              Bạn có chắc chắn muốn thu hồi lại phiếu đánh giá này không? Sau khi thu hồi, phiếu sẽ quay về trạng thái <b>Khởi tạo</b> và bạn có thể chỉnh sửa lại dữ liệu để gửi lại sau.
            </p>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Lý do thu hồi (không bắt buộc):</div>
              <Input.TextArea
                rows={3}
                placeholder="Nhập lý do thu hồi..."
                value={thuHoiGhiChu}
                onChange={(e) => setThuHoiGhiChu(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
