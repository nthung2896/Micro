"use client";
import "@/app/(DashboardLayout)/kPI_BieuChamDiem/BieuChamDiem.css";
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
} from "@ant-design/icons";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import DanhGiaV2Component from "@/app/(DashboardLayout)/kPI_PhieuDanhGia/DanhGia2/DanhGiaV2Component";
import BieuChamDiemTCCBComponent from "@/app/(DashboardLayout)/kPI_BieuChamDiem/BieuChamDiemTCCBComponent";
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
} from "@/constants/KpiEvaluationWorkflow";

const VAI_TRO_ORDER = [
  { code: "CaNhan", label: "Cá nhân tự đánh giá", shortLabel: "Cá nhân", icon: <UserOutlined />, color: "#2563eb", index: 1 },
  { code: "PhoVuTruong", label: "Phó Vụ trưởng đánh giá", shortLabel: "Phó Vụ trưởng", icon: <TeamOutlined />, color: "#0891b2", index: 2 },
  { code: "VuTruong", label: "Vụ trưởng đánh giá", shortLabel: "Vụ trưởng", icon: <TeamOutlined />, color: "#0891b2", index: 3 },
  { code: "PhoTruongPhong", label: "Phó Trưởng phòng đánh giá", shortLabel: "Phó phòng", icon: <TeamOutlined />, color: "#0891b2", index: 2 },
  { code: "TruongPhong", label: "Trưởng phòng đánh giá", shortLabel: "Trưởng phòng", icon: <TeamOutlined />, color: "#0891b2", index: 3 },
  { code: "PhoCucTruong", label: "Phó Cục trưởng đánh giá", shortLabel: "Phó Cục trưởng", icon: <TeamOutlined />, color: "#0891b2", index: 4 },
  { code: "CucTruong", label: "Cục trưởng đánh giá", shortLabel: "Cục trưởng", icon: <TeamOutlined />, color: "#0891b2", index: 5 },
];

const TRANG_THAI = {
  KHOI_TAO: "KhoiTao",
  GUI_PHO_TRUONG_PHONG: "GuiPhoTruongPhong",
  GUI_TRUONG_PHONG: "GuiTruongPhong",
  GUI_PHO_CUC_TRUONG: "GuiPhoCucTruong",
  GUI_CUC_TRUONG: "GuiCucTruong",
  GUI_PHO_VU_TRUONG: "GuiPhoVuTruong",
  GUI_VU_TRUONG: "GuiVuTruong",
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
  [TRANG_THAI.DA_DUYET]: "PhoTruongPhong",
};

const PREVIOUS_EVALUATOR_ROLE: Record<string, string | undefined> = {
  TruongPhong: "PhoTruongPhong",
  PhoCucTruong: "TruongPhong",
  CucTruong: "PhoCucTruong",
  VuTruong: "PhoVuTruong",
};

function normalizeRoleValue(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const ROLE_DETAILS: Record<string, { label: string; scoreTitle: string; nextRole?: string }> = {
  PhoVuTruong: { label: "Phó Vụ trưởng", scoreTitle: "Điểm Phó Vụ trưởng đánh giá", nextRole: "VuTruong" },
  VuTruong: { label: "Vụ trưởng", scoreTitle: "Điểm Vụ trưởng đánh giá" },
  PhoTruongPhong: { label: "Phó Trưởng phòng", scoreTitle: "Điểm Phó Trưởng phòng đánh giá", nextRole: "TruongPhong" },
  TruongPhong: { label: "Trưởng phòng", scoreTitle: "Điểm Trưởng phòng đánh giá", nextRole: "PhoCucTruong" },
  PhoCucTruong: { label: "Phó Cục trưởng", scoreTitle: "Điểm Phó Cục trưởng đánh giá", nextRole: "CucTruong" },
  CucTruong: { label: "Cục trưởng", scoreTitle: "Điểm Cục trưởng đánh giá" },
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
  if (user?.isTP_PTP === true) return "PhoTruongPhong";

  const values = [user?.chucVuCode, user?.tenChucVu, ...(Array.isArray(user?.listRole) ? user.listRole : [])]
    .map(normalizeRoleValue);
  if (values.some((value) => value === "phovutruong" || value === "pvt")) return "PhoVuTruong";
  if (values.some((value) => value === "vutruong" || value === "vt")) return "VuTruong";
  if (values.some((value) => value.includes("phocuctruong"))) return "PhoCucTruong";
  if (values.some((value) => value === "cuctruong")) return "CucTruong";
  if (values.some((value) => value.includes("truongphong") && !value.includes("pho"))) return "TruongPhong";
  if (values.some((value) => value === "ptp" || value.includes("photruongphong"))) return "PhoTruongPhong";
  return null;
}

const trangThaiConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  [TRANG_THAI.KHOI_TAO]: { color: "blue", label: "Khởi tạo", icon: <ClockCircleOutlined /> },
  [TRANG_THAI.GUI_PHO_TRUONG_PHONG]: { color: "cyan", label: "Chờ Phó phòng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_TRUONG_PHONG]: { color: "cyan", label: "Chờ Trưởng phòng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_PHO_CUC_TRUONG]: { color: "cyan", label: "Chờ Phó Cục trưởng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_CUC_TRUONG]: { color: "cyan", label: "Chờ Cục trưởng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_PHO_VU_TRUONG]: { color: "cyan", label: "Chờ Phó Vụ trưởng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_VU_TRUONG]: { color: "cyan", label: "Chờ Vụ trưởng đánh giá", icon: <SendOutlined /> },
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

export default function DanhGiaTCCBComponent({
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
  const [errorSection, setErrorSection] = useState<string | null>(null);
  const danhGiaSaveRef = useRef<any>(null);
  const bieuChamDiemSaveRef = useRef<any>(null);
  const roleSaveRefs = useRef<Record<string, any>>({});
  const [, setRoleScores] = useState<Record<string, number>>({});
  const [taskScore, setTaskScore] = useState<number | undefined>(undefined);

  const [ptpReview, setPtpReview] = useState<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse>({
    items: [],
    canEdit: false,
    tongDiemCapTren: 0,
    isComplete: false,
  });
  const [ptpScores, setPtpScores] = useState<Record<string, number | null>>({});
  const [, setPtpScoreIds] = useState<Record<string, string>>({});
  const [ptpNotes, setPtpNotes] = useState<Record<string, string | null>>({});
  const ptpDraftScoresRef = useRef<Record<string, number | null>>({});
  const [leafCriterionIds, setLeafCriterionIds] = useState<string[]>([]);
  const leafCriterionIdsRef = useRef<Set<string>>(new Set());

  const handleRoleScoreChange = useCallback((roleCode: string, sc: number) => {
    setRoleScores((prev) => {
      if (prev[roleCode] === sc) return prev;
      return { ...prev, [roleCode]: sc };
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

  const handlePtpScoreInput = useCallback((id: string, value: number | null) => {
    ptpDraftScoresRef.current[id] = value;
    // Cập nhật state ngay khi gõ để tổng điểm PTP render lại tức thì.
    // PtpScoreInput vẫn giữ draft nội bộ nên không làm mất vị trí con trỏ.
    setPtpScores((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
  }, []);

  const handlePtpScoreChange = useCallback((id: string, value: number | null) => {
    ptpDraftScoresRef.current[id] = value;
    setPtpScores((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
  }, []);

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

  const fetchInfo = useCallback(async () => {
    let targetPhieuId = effectiveIdPhieu;
    let targetLyLichId = effectiveIdLyLich;
    let targetDotId = effectiveIdDot;

    try {
      if (targetPhieuId) {
        const resPhieu = await kPI_PhieuDanhGiaService.getById(targetPhieuId);
        if (resPhieu?.data) {
          setPhieuInfo(resPhieu.data);
          if (resPhieu.data.idLyLich) targetLyLichId = resPhieu.data.idLyLich;
          if (resPhieu.data.idDotDanhGia) targetDotId = resPhieu.data.idDotDanhGia;
        }

        const resQuaTrinh = await kPI_QuaTrinhXuLyPhieuDanhGiaService.getData({
          idPhieuDanhGia: targetPhieuId,
          pageSize: 50,
          pageIndex: 1,
        });
        if (resQuaTrinh?.data?.items && resQuaTrinh.data.items.length > 0) {
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
        if (resSearch?.data?.items?.length > 0) {
          const phieu = resSearch.data.items[0];
          setPhieuInfo(phieu);
          setCurrentIdPhieu(phieu.id || (phieu as any).idPhieuDanhGia);

          if (phieu.id) {
            const resQuaTrinh = await kPI_QuaTrinhXuLyPhieuDanhGiaService.getData({
              idPhieuDanhGia: phieu.id,
              pageSize: 50,
              pageIndex: 1,
            });
            if (resQuaTrinh?.data?.items && resQuaTrinh.data.items.length > 0) {
              const items = resQuaTrinh.data.items;
              const pending = items.find((x: any) => x.isXuLy === false);
              setActiveProcess(pending || items[0]);
            }
          }
        }
      }

      if (targetDotId) {
        const resDot = await kPI_DotTheoDoiDanhGiaService.getById(targetDotId);
        if (resDot?.data) setDotDanhGiaInfo(resDot.data);
      }

      if (targetLyLichId) {
        const resLL = await kPI_LyLich2CService.getById(targetLyLichId);
        if (resLL?.data) setLyLichInfo(resLL.data);
      }
    } catch (e) {
      console.warn("Lỗi khi tải thông tin phiếu:", e);
    }
  }, [effectiveIdPhieu, effectiveIdDot, effectiveIdLyLich]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const trangThai = phieuInfo?.trangThai || TRANG_THAI.KHOI_TAO;
  const isDaDuyet = trangThai === TRANG_THAI.DA_DUYET;

  // Chức vụ của chủ phiếu phải dùng cùng một mapping với màn Đánh giá nhiều cấp.
  // ChucVuHienTai có thể là mã viết hoa (PHOVUTRUONG/VUTRUONG), vì vậy helper
  // sẽ chuẩn hóa trước khi xác định cấp nhận tiếp theo.
  const donViName = useMemo(() => (
    lyLichInfo?.tenDonVi ||
    lyLichInfo?.tenDonVi_txt ||
    phieuInfo?.tenDonVi ||
    phieuInfo?.donVi ||
    user?.tenDonVi_txt ||
    ""
  ), [lyLichInfo, phieuInfo, user]);

  const supervisorRole = useMemo(
    () => getOwnerEvaluationRole(lyLichInfo?.chucVuHienTai, donViName),
    [lyLichInfo, donViName]
  );
  const supervisorDetail = ROLE_DETAILS[supervisorRole];
  const receivingRole = useMemo(() => {
    // buttonLuong là nguồn chính xác nhất đối với phiếu đã tồn tại.
    if (phieuInfo?.buttonLuong?.chucVuNguoiXuLy) {
      return phieuInfo.buttonLuong.chucVuNguoiXuLy;
    }
    return getNextEvaluationRole(supervisorRole, donViName);
  }, [phieuInfo, supervisorRole, donViName]);
  // Cờ API thuộc tài khoản đang thao tác. Chức vụ người có phiếu chỉ dùng để
  // xác định người nhận của luồng, không dùng để đặt nhãn màn hình.
  const currentUserRole = useMemo(
    () => getRoleFromFlags(phieuInfo) || getRoleFromCurrentUser(user),
    [phieuInfo, user]
  );
  const currentUserDetail = currentUserRole ? ROLE_DETAILS[currentUserRole] : undefined;

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

      // Với TP trở lên, lấy điểm đã có của cấp liền trước để tiền điền input.
      // PTP lấy trực tiếp điểm tự chấm ở phía dưới, nên không cần gọi thêm API.
      if (previousRole && itemsWithoutCurrentScore.length > 0) {
        const inheritedResults = await Promise.all(itemsWithoutCurrentScore.map(async (item) => {
          try {
            const response = await kPI_TieuChiChung_DiemSo_CapTrenService.getData({
              pageIndex: 1,
              pageSize: 1,
              id_TieuChiChung_DiemSo: item.idTieuChiChungDiemSo,
              vaiTroDanhGia: previousRole,
            });
            const inheritedScore = response?.data?.items?.[0]?.diem;
            return [item.idTieuChiChung, inheritedScore ?? null] as const;
          } catch (error) {
            console.warn("Không tải được điểm cấp dưới để tiền điền:", error);
            return [item.idTieuChiChung, null] as const;
          }
        }));

        inheritedResults.forEach(([criterionId, score]) => inheritedScores.set(criterionId, score));
      }
      const nextScores: Record<string, number | null> = {};
      const nextScoreIds: Record<string, string> = {};
      const nextNotes: Record<string, string | null> = {};
      reviewItems.forEach((item) => {
        // Chỉ tiền điền trên giao diện; không có thao tác ghi dữ liệu ở đây.
        // PTP lấy điểm tự chấm, các cấp sau lấy điểm cấp liền trước.
        nextScores[item.idTieuChiChung] = item.diemCapTren
          ?? inheritedScores.get(item.idTieuChiChung)
          ?? item.diemTuCham
          ?? 0;
        nextScoreIds[item.idTieuChiChung] = item.idTieuChiChungDiemSo;
        nextNotes[item.idTieuChiChung] = item.ghiChu ?? null;
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
      ptpDraftScoresRef.current = {};
      return filteredData;
    } catch (error) {
      console.warn("Lỗi khi tải điểm PTP:", error);
      return undefined;
    }
  }, [currentRole, effectiveIdDot, fetchLeafCriterionIds, phieuInfo?.idLyLich, queryLyLich]);

  useEffect(() => {
    fetchPtpReview(effectiveIdPhieu);
  }, [effectiveIdPhieu, fetchPtpReview]);

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
    if (!user || !activeProcess || isOwner) return false;
    const myUserId = String(user?.id || user?.userId || "").toLowerCase();
    const myLyLichId = String(user?.idLyLich || user?.lyLichId || "").toLowerCase();
    const procNguoiXuLy = String(activeProcess?.idNguoiXuLy || "").toLowerCase();

    return !!(
      procNguoiXuLy &&
      procNguoiXuLy !== "00000000-0000-0000-0000-000000000000" &&
      (procNguoiXuLy === myUserId || procNguoiXuLy === myLyLichId)
    );
  }, [user, activeProcess, isOwner]);

  const isLeadershipOrAdmin = useMemo(() => {
    if (!user) return false;
    const userRoles: string[] = (user?.listRole || []).map((r: string) => (r || "").toLowerCase());
    const chucVu = (user?.chucVuCode || user?.tenChucVu || "").toLowerCase();
    return (
      user.isTP_PTP === true ||
      user.isCT === true ||
      user.isPCT === true ||
      chucVu.includes("phovutruong") ||
      chucVu.includes("vutruong") ||
      chucVu.includes("photruongphong") ||
      chucVu.includes("truongphong") ||
      chucVu.includes("cuctruong") ||
      chucVu.includes("phocuctruong") ||
      chucVu.includes("lanhdao") ||
      userRoles.some((r: string) =>
        r.includes("admin") ||
        r.includes("phovutruong") ||
        r.includes("vutruong") ||
        r.includes("photruongphong") ||
        r.includes("truongphong") ||
        r.includes("cuctruong") ||
        r.includes("phocuctruong") ||
        r.includes("lanhdao")
      )
    );
  }, [user]);

  // Phân quyền thực hiện thao tác:
  const canOwnerAction = useMemo(() => {
    if (!isOwner || isDaDuyet) return false;
    return trangThai === TRANG_THAI.KHOI_TAO || trangThai === TRANG_THAI.TRA_VE;
  }, [isOwner, isDaDuyet, trangThai]);

  const canSupervisorAction = useMemo(() => {
    if (isOwner || isDaDuyet) return false;
    if (currentRole === "CaNhan") return false;
    return isAssignedReceiver || isLeadershipOrAdmin;
  }, [isOwner, isDaDuyet, currentRole, isAssignedReceiver, isLeadershipOrAdmin]);

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
  const canSavePtp = canSupervisorAction && currentUserRole !== null;
  const isTCCReadOnly = !canOwnerAction;

  // Khi cấp trên mở phiếu, cột này mô tả người đã tự chấm điểm ban đầu,
  // tức nhân sự sở hữu phiếu, không phải chức vụ của người đang đăng nhập.
  const targetRoleLabel = supervisorDetail?.label || lyLichInfo?.chucVuHienTaiName?.trim();
  const selfScoreTitle = !isOwner && targetRoleLabel
    ? `Điểm do ${targetRoleLabel.toLowerCase()} tự chấm`
    : "Điểm do cá nhân tự chấm";
  const evaluatorRole = useMemo(() => {
    if (canSupervisorAction) return currentRole || supervisorRole || "PhoTruongPhong";
    if (!isOwner) {
      const chucVu = (user?.chucVuCode || user?.tenChucVu || "").toLowerCase();
      const userRoles: string[] = (user?.listRole || []).map((r: string) => (r || "").toLowerCase());

      if (user?.isPCT || chucVu.includes("phocuc") || userRoles.some((r) => r.includes("phocuc"))) return "PhoCucTruong";
      if (user?.isCT || (!chucVu.includes("phocuc") && chucVu.includes("cuctruong")) || userRoles.some((r) => r.includes("cuctruong") && !r.includes("phocuc"))) return "CucTruong";
      if (user?.isTP_PTP || chucVu.includes("pho") || userRoles.some((r) => r.includes("pho"))) return "PhoTruongPhong";
      if ((!chucVu.includes("pho") && chucVu.includes("truongphong")) || userRoles.some((r) => r.includes("truongphong") && !r.includes("pho"))) return "TruongPhong";
      return currentRole || "PhoTruongPhong";
    }
    return "CaNhan";
  }, [canSupervisorAction, isOwner, currentRole, supervisorRole, user]);

  const nextStepInfo = useMemo(() => {
    // Backend đã biết Luồng của phiếu và là nguồn quyết định chính xác nhất.
    if (phieuInfo?.buttonLuong) {
      const button = phieuInfo.buttonLuong;
      const isFinal = button.trangThaiTiepTheo === TRANG_THAI.DA_DUYET || !button.chucVuNguoiXuLy;
      const chucVuNhan = button.chucVuNguoiXuLy || undefined;
      const roleLabel = chucVuNhan ? getEvaluationRoleLabel(chucVuNhan) : "Cấp trên";
      return {
        nextStatus: button.trangThaiTiepTheo,
        buttonText: isFinal
          ? "Lưu và Phê duyệt"
          : `Lưu và ${button.tenButton || `Gửi ${roleLabel}`}`,
        chucVuNhan,
        isFinal,
      };
    }

    // Phiếu cũ có thể chưa có buttonLuong do Luong = 0. Dùng cùng fallback
    // theo chức vụ chủ phiếu để không mặc định nhầm về Phó phòng.
    const nextRole = getNextEvaluationRole(supervisorRole, donViName);
    if (!nextRole) {
      return {
        nextStatus: TRANG_THAI.DA_DUYET,
        buttonText: "Lưu và Phê duyệt",
        isFinal: true,
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
    };

    return {
      nextStatus: statusMap[nextRole] || TRANG_THAI.GUI_PHO_TRUONG_PHONG,
      buttonText: `Lưu và Gửi ${label}`,
      chucVuNhan: nextRole,
      isFinal: false,
    };
  }, [phieuInfo, supervisorRole, donViName]);

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

      for (const role of VAI_TRO_ORDER) {
        const roleSave = roleSaveRefs.current[role.code];
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
            console.warn(`Lỗi khi lưu bảng của role ${role.code}:`, e);
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

    // Gửi/phê duyệt đã được lưu trước khi mở modal. Chỉ nút trả về mới
    // cần lưu tại bước xác nhận để tránh gọi lưu hai lần.
    if (chuyenBuocModal.type === "return") {
      const saveOk = await handleSaveAll(false, "transition");
      if (!saveOk) return;
    }

    setLoading(true);
    try {
      const isReturn = chuyenBuocModal.type === "return";
      await kPI_PhieuDanhGiaService.chuyenBuocLuong({
        idPhieuDanhGia: phieuId,
        idNguoiGui: user?.id || user?.userId || "",
        idNguoiXuLy: chuyenBuocModal.selectedNguoiXuLyId,
        ghiChu: chuyenBuocModal.ghiChu || (isReturn ? "Trả về cấp dưới" : "Chuyển bước luồng"),
        isTuChoi: isReturn,
      });

      setChuyenBuocModal((prev) => ({ ...prev, visible: false }));
      toast.success(isReturn ? "Đã trả phiếu về cấp dưới!" : "Chuyển bước đánh giá thành công!");

      const nextStatus = isReturn ? TRANG_THAI.TRA_VE : (nextStepInfo.nextStatus || TRANG_THAI.GUI_PHO_TRUONG_PHONG);
      setPhieuInfo((prev: any) => prev ? { ...prev, trangThai: nextStatus } : prev);

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
  const statusLabel = tt.label;
  const showWorkflowProgressCard = Boolean(nextStepInfo.chucVuNhan && !nextStepInfo.isFinal);
  const childParams = useMemo(() => ({ id: effectiveIdDot }), [effectiveIdDot]);
  const isSentToReceiver = trangThai !== TRANG_THAI.KHOI_TAO && trangThai !== TRANG_THAI.TRA_VE;
  const creatorRole = supervisorRole || "CaNhan";
  const receiverRole = receivingRole || "CaNhan";
  const creatorLabel = getEvaluationRoleShortLabel(creatorRole);
  const receiverLabel = receivingRole
    ? getEvaluationRoleShortLabel(receivingRole)
    : (nextStepInfo.isFinal ? "Hoàn tất" : "Cấp trên");

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
            idPhieu={effectiveIdPhieu || currentIdPhieu || undefined}
            idLyLich={effectiveIdLyLich}
            hideSaveButton={true}
            hideHeader={true}
            saveRef={danhGiaSaveRef}
            silentSave={true}
            viewOnly={isTCCReadOnly}
            canInheritScores={canOwnerAction}
            selfScoreTitle={selfScoreTitle}
            showPtpColumn={canSupervisorAction && currentUserRole !== null}
            supervisorScoreTitle={currentUserRole ? getEvaluationScoreTitle(currentUserRole) : currentUserDetail?.scoreTitle}
            ptpScores={ptpScores}
            ptpCanEdit={canSavePtp}
            ptpTotal={totalPtpScore}
            onPtpScoreInput={handlePtpScoreInput}
            onPtpScoreChange={handlePtpScoreChange}
            showCollapseAllToggle={true}
            diemThucHienNhiemVuProp={taskScore}
            extraSectionIContent={
              <div id="danhgia-section2" className={errorSection === "section2" ? "save-error-section" : ""} style={{ marginTop: "16px", marginBottom: "16px" }}>
                <Card
                  className="kpi-allow-sticky"
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#ffffff" }}>
                        II. KẾT QUẢ THỰC HIỆN NHIỆM VỤ
                      </span>
                    </div>
                  }
                  style={{ borderRadius: "12px", border: "1px solid #cbd5e1", overflow: "hidden" }}
                  styles={{ header: { backgroundColor: "#db5a1b", borderBottom: "none" }, body: { padding: "8px" } }}
                >
                  <BieuChamDiemTCCBComponent
                    params={childParams}
                    idDot={effectiveIdDot}
                    idPhieu={effectiveIdPhieu || currentIdPhieu || undefined}
                    idLyLich={effectiveIdLyLich}
                    hideSaveButton={true}
                    hideHeader={true}
                    saveRef={(ref: any) => {
                      bieuChamDiemSaveRef.current = ref;
                      if (currentRole) {
                        roleSaveRefs.current[currentRole] = ref;
                      }
                      if (supervisorRole) roleSaveRefs.current[supervisorRole] = ref;
                      roleSaveRefs.current["CaNhan"] = ref;
                    }}
                    silentSave={true}
                    hasSection1Header={false}
                    enableAttachmentPreview={true}
                    viewOnly={!canEditAny}
                    isMultiCap={true}
                    isMergedRoleView={true}
                    currentTrangThai={trangThai}
                    vaiTroDanhGia={evaluatorRole}
                    onTaskScoreChange={(sc: number) => {
                      setTaskScore(sc);
                      handleRoleScoreChange(evaluatorRole, sc);
                    }}
                    onIdPhieuChange={(newId: string) => {
                      setCurrentIdPhieu(newId);
                    }}
                  />
                </Card>
              </div>
            }
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

                  {/* Nút Trả về - CHỈ hiển thị cho Cấp trên/Phó phòng có thẩm quyền khi phiếu đang ở trạng thái gửi lên */}
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
                    className={canSupervisorAction ? "btn-custom-approve" : "btn-custom-submit"}
                    icon={canSupervisorAction ? <CheckCircleOutlined /> : <SendOutlined />}
                    onClick={() => handleOpenChuyenBuocModal(canSupervisorAction ? "approve" : "send")}
                    loading={transitionSaving}
                    disabled={saving}
                    style={{
                      fontWeight: "600",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      boxShadow: canSupervisorAction ? "0 4px 10px rgba(5, 150, 105, 0.3)" : "0 4px 10px rgba(234, 88, 12, 0.3)"
                    }}
                  >
                    {canSupervisorAction
                      ? "LƯU VÀ PHÊ DUYỆT"
                      : (nextStepInfo.buttonText || "LƯU VÀ TRÌNH")}
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
            body: { padding: "16px 20px" },
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
