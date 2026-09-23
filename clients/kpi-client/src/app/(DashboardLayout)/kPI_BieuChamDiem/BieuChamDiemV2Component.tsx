"use client";
import "./BieuChamDiem.css";
import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Row, Col, Select, Button, InputNumber, Input, message, Popconfirm, Alert, Spin, Modal, Tag, Tooltip, Space, Segmented } from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined, ArrowLeftOutlined, EditOutlined, ExclamationCircleFilled, EyeOutlined, TeamOutlined, UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import departmentService from "@/services/department/department.service";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import TypeNhiemVuConstant from "@/constants/TypeNhiemVuConstant";
import ModalTaoNhiemVuPhatSinh from "./ModalTaoNhiemVuPhatSinh";
import ModalChonTieuChi from "./ModalChonTieuChi";
import ModalNhapChiTietSanPham from "./ModalNhapChiTietSanPham";
import ModalXemBoTieuChi from "./ModalXemBoTieuChi";
import kPI_CauHinhCongThucNhiemVuService from "@/services/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVuService";
import kPI_DauRaNhiemVu_ChiTietDanhGiaService from "@/services/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGiaService";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import { useSearchParams, useRouter } from "next/navigation";
import ChiTietBieuChamDiemPage from "./ChiTiet/page";
import KpiAttachmentCell from "./KpiAttachmentCell";
import { isVuDepartment } from "@/constants/KpiEvaluationWorkflow";

import { InlineInput, InlineInputNumber, TieuChiSuggestor } from "./InlineComponents";
const { Title, Text } = Typography;

const TABLE_COMPONENTS = {
  header: {
    cell: (props: any) => (
      <th {...props} style={{ ...props.style, textAlign: 'center', background: '#2256c0', color: '#fff', border: '1px solid #3b82f6', borderBottom: 'none', padding: '6px 4px', fontSize: '12px' }}>
        {props.children}
      </th>
    ),
  },
  body: {
    cell: (props: any) => (
      <td {...props} style={{ ...props.style, border: '1px solid #e2e8f0', padding: '6px 4px', fontSize: '12px' }}>
        {props.children}
      </td>
    ),
  },
};

const EVALUATOR_MODAL_TABLE_COMPONENTS = {
  header: {
    cell: (props: any) => (
      <th {...props} style={{ ...props.style, textAlign: 'center', background: '#0f766e', color: '#ffffff', border: '1px solid #14b8a6', padding: '6px 4px', fontSize: '12px', fontWeight: 600 }}>
        {props.children}
      </th>
    ),
  },
};

const formatDisplayScore = (value: any) => {
  if (value === null || value === undefined || value === "") return "";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value);
  return Number(numberValue.toFixed(2)).toString();
};

export interface EvaluatorRoleInfo {
  code: string;
  name: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  order: number;
}

export const ALL_ROLES_CONFIG: Record<string, EvaluatorRoleInfo> = {
  CaNhan: { code: "CaNhan", name: "Cá nhân", shortLabel: "Cá nhân", color: "#1d4ed8", bgColor: "#dbeafe", order: 1 },
  PhoTruongPhong: { code: "PhoTruongPhong", name: "Phó phòng", shortLabel: "Phó phòng", color: "#0891b2", bgColor: "#cffafe", order: 2 },
  TruongPhong: { code: "TruongPhong", name: "Trưởng phòng", shortLabel: "Trưởng phòng", color: "#7c3aed", bgColor: "#ede9fe", order: 3 },
  PhoCucTruong: { code: "PhoCucTruong", name: "Phó Cục trưởng", shortLabel: "Phó Cục trưởng", color: "#c026d3", bgColor: "#fae8ff", order: 4 },
  CucTruong: { code: "CucTruong", name: "Cục trưởng", shortLabel: "Cục trưởng", color: "#d97706", bgColor: "#fef3c7", order: 5 },
  PhoVuTruong: { code: "PhoVuTruong", name: "Phó Vụ trưởng", shortLabel: "Phó Vụ trưởng", color: "#0891b2", bgColor: "#cffafe", order: 2 },
  VuTruong: { code: "VuTruong", name: "Vụ trưởng", shortLabel: "Vụ trưởng", color: "#7c3aed", bgColor: "#ede9fe", order: 3 },
  PhoGiamDocTT: { code: "PhoGiamDocTT", name: "Phó Giám đốc TT", shortLabel: "Phó GĐ TT", color: "#0891b2", bgColor: "#cffafe", order: 2 },
  GiamDocTT: { code: "GiamDocTT", name: "Giám đốc TT", shortLabel: "Giám đốc TT", color: "#7c3aed", bgColor: "#ede9fe", order: 3 },
  PhoGDTT: { code: "PhoGDTT", name: "Phó Giám đốc TT", shortLabel: "Phó GĐ TT", color: "#0891b2", bgColor: "#cffafe", order: 2 },
  GD: { code: "GD", name: "Giám đốc TT", shortLabel: "Giám đốc TT", color: "#7c3aed", bgColor: "#ede9fe", order: 3 },
  PhoChanhVanPhong: { code: "PhoChanhVanPhong", name: "Phó Chánh VP", shortLabel: "Phó CVP", color: "#0891b2", bgColor: "#cffafe", order: 2 },
  PHOCHANHVANPHONG: { code: "PHOCHANHVANPHONG", name: "Phó Chánh VP", shortLabel: "Phó CVP", color: "#0891b2", bgColor: "#cffafe", order: 2 },
  ChanhVanPhong: { code: "ChanhVanPhong", name: "Chánh VP", shortLabel: "Chánh VP", color: "#7c3aed", bgColor: "#ede9fe", order: 3 },
};

export const ORDERED_ROLE_CODES_CUC = ["CaNhan", "PhoTruongPhong", "TruongPhong", "PhoCucTruong", "CucTruong"];
export const ORDERED_ROLE_CODES_VU = ["CaNhan", "PhoVuTruong", "VuTruong"];
export const ORDERED_ROLE_CODES_TT = ["CaNhan", "PhoGiamDocTT", "GiamDocTT"];
export const ORDERED_ROLE_CODES_TT_ALT = ["CaNhan", "PhoGDTT", "GD"];
export const ORDERED_ROLE_CODES_VP = ["CaNhan", "PhoChanhVanPhong", "ChanhVanPhong"];
export const ORDERED_ROLE_CODES = ["CaNhan", "PhoTruongPhong", "PhoVuTruong", "VuTruong", "TruongPhong", "PhoCucTruong", "CucTruong", "PhoGiamDocTT", "GiamDocTT", "PhoGDTT", "GD", "PhoChanhVanPhong", "PHOCHANHVANPHONG", "ChanhVanPhong"];

export const MAP_TRANG_THAI_TO_VAI_TRO: Record<string, string> = {
  khoitao: "CaNhan",
  trave: "CaNhan",
  guiphovutruong: "PhoVuTruong",
  guivutruong: "VuTruong",
  guiphotruongphong: "PhoTruongPhong",
  guitruongphong: "TruongPhong",
  guiphocuctruong: "PhoCucTruong",
  guicuctruong: "CucTruong",
  guiphogiamdoctt: "PhoGiamDocTT",
  guigiamdoctt: "GiamDocTT",
  guiphochanhvanphong: "PhoChanhVanPhong",
  guichanhvanphong: "ChanhVanPhong",
};

export const normalizeRoleKey = (raw: string) => {
  const s = (raw || "").trim().toLowerCase();
  if (s === "canhan") return "CaNhan";
  if (s === "phovutruong" || s === "phovutrong" || s === "phovu" || s === "pvt") return "PhoVuTruong";
  if (s === "vutruong" || s === "vutrong" || s === "vt") return "VuTruong";
  if (s === "photruongphong" || s === "phophong" || s === "ptp") return "PhoTruongPhong";
  if (s === "truongphong" || s === "tp") return "TruongPhong";
  if (s === "phocuctruong" || s === "lanhdaocuc" || s === "pho_cuc_truong" || s === "pct") return "PhoCucTruong";
  if (s === "cuctruong" || s === "cuc_truong" || s === "ct") return "CucTruong";
  if (s === "phogiamdoctt" || s === "phogdtt" || s === "pgdtt") return "PhoGiamDocTT";
  if (s === "giamdoctt" || s === "gdtt" || s === "gd" || s === "giamdoc") return "GiamDocTT";
  if (s === "phochanhvanphong" || s === "phocvp" || s === "pcvp") return "PhoChanhVanPhong";
  if (s === "chanhvanphong" || s === "cvp") return "ChanhVanPhong";
  return ORDERED_ROLE_CODES.find(k => k.toLowerCase() === s) || raw;
};

export type BieuChamDiemPageProps = {
  params?: any;
  searchParams?: any;
  hideSaveButton?: boolean;
  saveRef?: React.MutableRefObject<any> | ((ref: any) => void) | any;
  hideHeader?: boolean;
  idPhieu?: string;
  idDot?: string;
  idLyLich?: string;
  isModal?: boolean;
  viewOnly?: boolean;
  hasSection1Header?: boolean;
  enableAttachmentPreview?: boolean;
  onTaskScoreChange?: (scoreOutOf70: number, roleScores?: Record<string, number>) => void;
  onRoleTaskScoresChange?: (roleScores: Record<string, number>) => void;
  silentSave?: boolean;
  vaiTroDanhGia?: string;
  isMultiCap?: boolean;
  isMergedRoleView?: boolean;
  currentTrangThai?: string;
};

type KpiNoteModalProps = {
  visible: boolean;
  value: string;
  readOnly: boolean;
  viewOnly: boolean;
  onCancel: () => void;
  onSave: (value: string) => void;
};

const KpiNoteModal = React.memo(function KpiNoteModal({
  visible,
  value,
  readOnly,
  viewOnly,
  onCancel,
  onSave,
}: KpiNoteModalProps) {
  const [draft, setDraft] = useState(value);
  const inputReadOnly = readOnly || viewOnly;

  React.useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  return (
    <Modal
      title={<span style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700, textTransform: "uppercase" }}>Ghi chú / Giải trình</span>}
      closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
      styles={{
        header: { padding: "12px 24px", overflow: "hidden", borderRadius: "8px 8px 0 0", margin: 0, background: "#0355a2" },
      }}
      open={visible}
      onCancel={onCancel}
      width={650}
      destroyOnClose
      footer={readOnly ? [
        <Button key="close" type="primary" onClick={onCancel} style={{ backgroundColor: "#0355a2", borderColor: "#0355a2", color: "#ffffff" }}>
          Đóng
        </Button>,
      ] : [
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="save" type="primary" onClick={() => onSave(draft)} style={{ backgroundColor: "#0355a2", borderColor: "#0355a2", color: "#ffffff" }}>
          Xong
        </Button>,
      ]}
    >
      <div style={{ paddingTop: 8 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Ghi chú</div>
        <Input.TextArea
          rows={8}
          value={draft}
          readOnly={inputReadOnly}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Nhập ghi chú..."
        />
      </div>
    </Modal>
  );
});

export default function BieuChamDiemComponent({
  params,
  searchParams: sp,
  hideSaveButton,
  saveRef,
  hideHeader,
  idPhieu: idPhieuProp,
  idDot: idDotProp,
  idLyLich: idLyLichProp,
  isModal,
  viewOnly = false,
  hasSection1Header,
  enableAttachmentPreview = false,
  onTaskScoreChange,
  onRoleTaskScoresChange,
  silentSave = false,
  vaiTroDanhGia,
  isMultiCap = false,
  isMergedRoleView = false,
  currentTrangThai,
}: BieuChamDiemPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useSelector((state: any) => state.auth.User);
  const effectiveIdDot = idDotProp || params?.id || searchParams?.get("idDotDanhGia") || searchParams?.get("idDot") || null;
  const effectiveIdPhieuProp = idPhieuProp || searchParams?.get("idPhieuDanhGia") || searchParams?.get("idPhieu") || null;
  const effectiveIdLyLich = idLyLichProp || searchParams?.get("idLyLich") || null;
  const [tenDonVi, setTenDonVi] = useState<string>("");
  const [dotDanhGiaOptions, setDotDanhGiaOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedDot, setSelectedDot] = useState<string | null>(effectiveIdDot);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nhiemVuHeThong, setNhiemVuHeThong] = useState<any[]>([]);
  const [nhiemVuPhatSinh, setNhiemVuPhatSinh] = useState<any[]>([]);
  const [chucVuHeSo, setChucVuHeSo] = useState<number | null>(null);
  const [tenChucVuLanhDao, setTenChucVuLanhDao] = useState<string>("");
  const [kqLinhVucPercent, setKqLinhVucPercent] = useState<number>(100);
  const [knToChucPercent, setKnToChucPercent] = useState<number>(100);
  const [nlTapHopPercent, setNlTapHopPercent] = useState<number>(100);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [checkingPermission, setCheckingPermission] = useState<boolean>(false);
  const [canEditView, setCanEditView] = useState<boolean>(true);
  const editEnabled = canEditView && !viewOnly;
  const isEvaluatingUpperRole = Boolean(vaiTroDanhGia && vaiTroDanhGia !== "CaNhan");
  const isOwner = React.useMemo(() => {
    const currentLyLichId = currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id;
    const target = targetUserId || effectiveIdLyLich;
    if (!currentLyLichId || !target) return !isEvaluatingUpperRole;
    return String(currentLyLichId).toLowerCase() === String(target).toLowerCase();
  }, [currentUser, targetUserId, effectiveIdLyLich, isEvaluatingUpperRole]);
  const canEditLeadershipPercentages = editEnabled && !isEvaluatingUpperRole && isOwner;
  const canAddEditTasks = editEnabled && !isEvaluatingUpperRole;

  const [activeRoles, setActiveRoles] = useState<EvaluatorRoleInfo[]>([ALL_ROLES_CONFIG.CaNhan]);
  const [displayMode, setDisplayMode] = useState<"full" | "compact">("full");
  const [selectedCompactRole, setSelectedCompactRole] = useState<string>(vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia) : "CaNhan");
  const effectiveMergedRoleView = displayMode === "full";

  React.useEffect(() => {
    if (vaiTroDanhGia) {
      setSelectedCompactRole(normalizeRoleKey(vaiTroDanhGia));
    }
  }, [vaiTroDanhGia]);

  const effectiveRoleCode = React.useMemo(() => {
    if (selectedCompactRole) return normalizeRoleKey(selectedCompactRole);
    if (vaiTroDanhGia) return normalizeRoleKey(vaiTroDanhGia);
    return "CaNhan";
  }, [selectedCompactRole, vaiTroDanhGia]);

  const [phieuInfo, setPhieuInfo] = useState<any>(null);
  const [evaluatorModalState, setEvaluatorModalState] = useState<{
    visible: boolean;
    record: any | null;
  }>({
    visible: false,
    record: null,
  });

  const handleOpenEvaluatorsModal = React.useCallback((record: any) => {
    setEvaluatorModalState({
      visible: true,
      record,
    });
  }, []);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<React.ReactNode>("");
  const [infoModalTitle, setInfoModalTitle] = useState("");
  const [viewBoTieuChiModalVisible, setViewBoTieuChiModalVisible] = useState(false);

  const [productModalState, setProductModalState] = useState<{
    visible: boolean;
    inlineTaskId: string | null;
    productIndex: number | null;
    initialData: any | null;
    tenNhiemVu?: string;
  }>({
    visible: false,
    inlineTaskId: null,
    productIndex: null,
    initialData: null,
    tenNhiemVu: "",
  });

  const [noteModalState, setNoteModalState] = useState<{
    visible: boolean;
    taskId: string | null;
    productIndex: number | null;
    taskData: any | null;
    value: string;
    readOnly: boolean;
  }>({
    visible: false,
    taskId: null,
    productIndex: null,
    taskData: null,
    value: "",
    readOnly: false,
  });

  const [inlineTasks, setInlineTasks] = useState<any[]>([]);
  const inlineTasksRef = React.useRef<any[]>([]);
  inlineTasksRef.current = inlineTasks;
  const [editingTaskIds, setEditingTaskIds] = useState<Set<string>>(new Set());

  const [chonTieuChiVisible, setChonTieuChiVisible] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeProductIndex, setActiveProductIndex] = useState<number | null>(null);

  const createClientKey = React.useCallback(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `kpi-product-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, []);

  const normalizeProductAttachments = React.useCallback((product: any = {}) => {
    const existingAttachments = product.existingAttachments || product.taiLieuDinhKem || product.dinhKem || [];
    return {
      ...product,
      clientKey: product.clientKey || product.id || createClientKey(),
      newFiles: product.newFiles || [],
      existingAttachments,
      keptAttachmentIds: product.keptAttachmentIds || existingAttachments.map((file: any) => file.id),
      attachmentsTouched: Boolean(product.attachmentsTouched),
    };
  }, [createClientKey]);

  const normalizeTaskAttachments = React.useCallback((task: any) => ({
    ...task,
    danhSachDauRa: (task?.danhSachDauRa && task.danhSachDauRa.length > 0
      ? task.danhSachDauRa
      : [{ tenSanPhamDauRa: "" }]).map(normalizeProductAttachments),
  }), [normalizeProductAttachments]);

  const getNoteValue = React.useCallback((task: any, productIndex: number) => {
    const product = task?.danhSachDauRa?.[productIndex];
    return String(product?.ghiChuGiaTrinh ?? (productIndex === 0 ? task?.ghiChuGiaTrinh : "") ?? "");
  }, []);

  const getNoteSnapshot = React.useCallback((task: any) => (
    (task?.danhSachDauRa || []).map((product: any, index: number) =>
      String(product?.ghiChuGiaTrinh ?? (index === 0 ? task?.ghiChuGiaTrinh : "") ?? "")
    )
  ), []);

  const isNoteDirty = React.useCallback((task: any, productIndex: number) => {
    if (!Array.isArray(task?.__noteSnapshot)) return false;
    return getNoteValue(task, productIndex) !== String(task.__noteSnapshot[productIndex] ?? "");
  }, [getNoteValue]);

  const handleOpenNoteModal = React.useCallback((taskId: string, productIndex: number, taskData: any, readOnly = false) => {
    const task = inlineTasksRef.current.find((item: any) => item.id === taskId) || taskData;
    setNoteModalState({
      visible: true,
      taskId,
      productIndex,
      taskData: task,
      value: getNoteValue(task, productIndex),
      readOnly,
    });
  }, [getNoteValue]);

  const closeNoteModal = React.useCallback(() => {
    setNoteModalState((previous) => ({ ...previous, visible: false }));
  }, []);

  const handleSaveNote = React.useCallback((value: string) => {
    if (viewOnly || noteModalState.readOnly || !noteModalState.taskId || noteModalState.productIndex === null) return;

    const { taskId, productIndex, taskData } = noteModalState;
    setInlineTasks((previous: any[]) => {
      let next = previous;
      if (!next.some((task: any) => task.id === taskId) && taskData) {
        const normalizedTask = normalizeTaskAttachments(taskData);
        next = [...next, {
          ...normalizedTask,
          id: taskId,
          isEditing: true,
          dbId: taskData.id || taskId,
          __noteSnapshot: getNoteSnapshot(normalizedTask),
        }];
      }

      next = next.map((task: any) => {
        if (task.id !== taskId) return task;
        const products = [...(task.danhSachDauRa || [])];
        products[productIndex] = normalizeProductAttachments({
          ...(products[productIndex] || {}),
          ghiChuGiaTrinh: value,
        });
        return { ...task, isEditing: true, danhSachDauRa: products };
      });
      inlineTasksRef.current = next;
      return next;
    });
    setEditingTaskIds((previous) => new Set(previous).add(taskId));
    closeNoteModal();
  }, [closeNoteModal, getNoteSnapshot, normalizeProductAttachments, noteModalState, viewOnly]);

  const handleOpenProductModal = React.useCallback((inlineTaskId: string, productIndex: number, taskData?: any) => {
    if (viewOnly) return;
    const task = inlineTasksRef.current.find((t: any) => t.id === inlineTaskId || t.dbId === inlineTaskId) || taskData;
    const initialProduct = task?.danhSachDauRa?.[productIndex] || {};
    const currentEvalRole = normalizeRoleKey(vaiTroDanhGia || "CaNhan");
    const roleScores = initialProduct?.scoresByRole?.[currentEvalRole] || initialProduct?.scoresByRole?.["CaNhan"] || {};
    const initialData = {
      ...initialProduct,
      ...roleScores,
    };
    if (!initialData.diemTheoBoTieuChi && task?.diemBoTieuChi) {
      initialData.diemTheoBoTieuChi = task.diemBoTieuChi;
    }
    if (!initialData.tenTieuChi && task?.boTieuChiList?.[productIndex]) {
      initialData.tenTieuChi = task.boTieuChiList[productIndex];
    }
    setProductModalState({
      visible: true,
      inlineTaskId,
      productIndex,
      initialData,
      tenNhiemVu: task?.tenNhiemVuDayDu || task?.tenNhiemVuRutGon || "",
    });
  }, [viewOnly, vaiTroDanhGia]);

  const handleSaveProductFromModal = React.useCallback((productData: any) => {
    if (viewOnly) return;
    const { inlineTaskId, productIndex } = productModalState;
    if (!inlineTaskId || productIndex === null) return;

    const currentEvaluatingRoleCode = normalizeRoleKey(vaiTroDanhGia || "CaNhan");

    setInlineTasks((prev: any[]) => {
      let base = [...prev];
      if (!base.some(t => t.id === inlineTaskId || t.dbId === inlineTaskId)) {
        const found = [...nhiemVuHeThong, ...nhiemVuPhatSinh].find(t => t.id === inlineTaskId || t.dbId === inlineTaskId);
        if (found) {
          base.push({
            ...found,
            id: found.id,
            dbId: found.id,
            isEditing: true,
            danhSachDauRa: (found.danhSachDauRa || []).map((p: any) => ({ ...p })),
          });
        }
      }

      const next = base.map(t => {
        if (t.id === inlineTaskId || t.dbId === inlineTaskId) {
          const newDauRa = [...(t.danhSachDauRa || [])];
          const currentSp = (productIndex >= 0 && productIndex < newDauRa.length) ? (newDauRa[productIndex] || {}) : {};

          const roleScoreUpdates: Record<string, any> = {
            chamDiemSoLuong_HoanThanh: productData.chamDiemSoLuong_HoanThanh,
            chamDiemSoLuong_KhongHoanThanh: productData.chamDiemSoLuong_KhongHoanThanh,
            chamDiemSoLuong_Diem: productData.chamDiemSoLuong_Diem,
            chamDiemChatLuong_KhongDat: productData.chamDiemChatLuong_KhongDat,
            chamDiemChatLuong_SoDiemConLai: productData.chamDiemChatLuong_SoDiemConLai,
            chamDiemChatLuong_Diem: productData.chamDiemChatLuong_Diem,
            chamDiemTienDo_KhongDat: productData.chamDiemTienDo_KhongDat,
            chamDiemTienDo_SoDiemConLai: productData.chamDiemTienDo_SoDiemConLai,
            chamDiemTienDo_Diem: productData.chamDiemTienDo_Diem,
            ghiChu: productData.ghiChuGiaTrinh,
            ghiChuGiaTrinh: productData.ghiChuGiaTrinh,
          };

          const existingScoresByRole = { ...(currentSp.scoresByRole || {}) };
          existingScoresByRole[currentEvaluatingRoleCode] = {
            ...(existingScoresByRole[currentEvaluatingRoleCode] || {}),
            ...roleScoreUpdates,
          };

          if (currentEvaluatingRoleCode === "CaNhan") {
            existingScoresByRole["CaNhan"] = {
              ...(existingScoresByRole["CaNhan"] || {}),
              ...roleScoreUpdates,
            };
          }

          const updatedProduct = normalizeProductAttachments({
            ...currentSp,
            ...productData,
            scoresByRole: existingScoresByRole,
            caNhan: existingScoresByRole["CaNhan"] || currentSp.caNhan,
            phoPhong: existingScoresByRole["PhoTruongPhong"] || currentSp.phoPhong,
            truongPhong: existingScoresByRole["TruongPhong"] || currentSp.truongPhong,
            phoCucTruong: existingScoresByRole["PhoCucTruong"] || currentSp.phoCucTruong,
            cucTruong: existingScoresByRole["CucTruong"] || currentSp.cucTruong,
          });

          if (currentEvaluatingRoleCode === "CaNhan") {
            Object.assign(updatedProduct, roleScoreUpdates);
          }

          if (productIndex >= 0 && productIndex < newDauRa.length) {
            newDauRa[productIndex] = updatedProduct;
          } else {
            newDauRa.push(updatedProduct);
          }

          const boTieuChiList = newDauRa.map((sp: any) => sp.tenTieuChi || sp.tieuChiId).filter(Boolean);
          const diemBoTieuChi = newDauRa.reduce((sum: number, sp: any) => sum + (sp.diemTheoBoTieuChi || 0), 0);

          return {
            ...t,
            isEditing: true,
            danhSachDauRa: newDauRa,
            boTieuChiList: boTieuChiList.length > 0 ? boTieuChiList : t.boTieuChiList,
            diemBoTieuChi: diemBoTieuChi > 0 ? diemBoTieuChi : t.diemBoTieuChi,
          };
        }
        return t;
      });

      inlineTasksRef.current = next;
      return next;
    });

    setEditingTaskIds((previous) => new Set(previous).add(inlineTaskId));
    setProductModalState(prev => ({ ...prev, visible: false }));
  }, [normalizeProductAttachments, productModalState, viewOnly, nhiemVuHeThong, nhiemVuPhatSinh, vaiTroDanhGia]);

  const renderInfoIcon = (title: string, content: React.ReactNode) => (
    <ExclamationCircleFilled
      style={{ color: "#1890ff", cursor: "pointer", marginLeft: 4 }}
      onClick={(e) => {
        e.stopPropagation();
        setInfoModalTitle(title);
        setInfoModalContent(content);
        setInfoModalVisible(true);
      }}
    />
  );

  const queryIdPhieu = idPhieuProp || searchParams.get("idPhieuDanhGia") || searchParams.get("idPhieu");
  const queryIdDot = idDotProp || params?.id || searchParams.get("idDotDanhGia");

  useEffect(() => {
    // Khi ở chế độ multi-cap, DanhGiaMultiCapComponent đã quản lý quyền chỉnh sửa
    // qua prop viewOnly theo vai trò và trạng thái phiếu → bỏ qua check backend
    if (isMultiCap) {
      setCanEditView(!viewOnly);
      setCheckingPermission(false);
      return;
    }
    const verifyPermission = async () => {
      const idLyLich = currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id;
      if (queryIdPhieu || (idLyLich && queryIdDot)) {
        setCheckingPermission(true);
        try {
          const res = await kPI_PhieuDanhGiaService.checkQuyenChamDiem(queryIdPhieu, idLyLich, queryIdDot);
          if (res?.status && res?.data) {
            setCanEditView(!viewOnly && Boolean(res.data.canEdit));
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra quyền chấm điểm:", err);
        } finally {
          setCheckingPermission(false);
        }
      } else {
        setCheckingPermission(false);
      }
    };
    verifyPermission();
  }, [queryIdPhieu, queryIdDot, currentUser, viewOnly, isMultiCap]);

  const getInlineTaskWithProduct = React.useCallback((taskId: string, productIndex: number, sourceTask?: any) => {
    const inlineTask = inlineTasksRef.current.find((task: any) => task.id === taskId);
    const task = inlineTask || sourceTask;
    return { task, product: task?.danhSachDauRa?.[productIndex] };
  }, []);

  const updateAttachmentProduct = React.useCallback((
    taskId: string,
    productIndex: number,
    update: (product: any) => any,
    sourceTask?: any,
  ) => {
    if (viewOnly) return;
    setInlineTasks((previous: any[]) => {
      let next = previous;
      if (!next.some((task: any) => task.id === taskId) && sourceTask) {
        const normalizedTask = normalizeTaskAttachments(sourceTask);
        next = [...next, {
          ...normalizedTask,
          id: taskId,
          isEditing: true,
          dbId: sourceTask.id || taskId,
          __noteSnapshot: getNoteSnapshot(normalizedTask),
        }];
      }
      next = next.map((task: any) => {
        if (task.id !== taskId) return task;
        const products = [...(task.danhSachDauRa || [])];
        products[productIndex] = update(normalizeProductAttachments(products[productIndex]));
        return { ...task, danhSachDauRa: products, isEditing: true };
      });
      inlineTasksRef.current = next;
      return next;
    });
    setEditingTaskIds((previous) => new Set(previous).add(taskId));
  }, [getNoteSnapshot, normalizeProductAttachments, normalizeTaskAttachments, viewOnly]);

  const getTotalNewAttachmentBytes = React.useCallback(() => {
    return inlineTasksRef.current.reduce((sum: number, task: any) => sum + (task.danhSachDauRa || []).reduce(
      (productSum: number, product: any) => productSum + (product.newFiles || []).reduce((fileSum: number, file: File) => fileSum + file.size, 0),
      0,
    ), 0);
  }, []);

  const handleAttachmentFiles = React.useCallback((
    taskId: string,
    productIndex: number,
    files: File[],
    sourceTask?: any,
  ) => {
    if (viewOnly) return;
    if (!files.length) return;
    const { product } = getInlineTaskWithProduct(taskId, productIndex, sourceTask);
    const currentProduct = normalizeProductAttachments(product);
    const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg", ".zip", ".rar"];
    const invalid = files.find((file) => {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      return !ALLOWED_EXTENSIONS.includes(extension) || file.size <= 0 || file.size > 50 * 1024 * 1024;
    });
    if (invalid) {
      message.error(`File ${invalid.name} phải có định dạng hợp lệ và không vượt quá 50 MB.`);
      return;
    }
    const currentCount = currentProduct.keptAttachmentIds.length + currentProduct.newFiles.length;
    if (currentCount + files.length > 20) {
      message.error("Mỗi sản phẩm chỉ được đính kèm tối đa 20 file.");
      return;
    }
    if (getTotalNewAttachmentBytes() + files.reduce((sum, file) => sum + file.size, 0) > 200 * 1024 * 1024) {
      message.error("Tổng file mới của toàn phiếu không được vượt quá 200 MB.");
      return;
    }
    updateAttachmentProduct(taskId, productIndex, (nextProduct) => ({
      ...nextProduct,
      newFiles: [...nextProduct.newFiles, ...files],
      attachmentsTouched: true,
    }), sourceTask);
  }, [getInlineTaskWithProduct, getTotalNewAttachmentBytes, normalizeProductAttachments, updateAttachmentProduct, viewOnly]);

  const handleRemoveExistingAttachment = React.useCallback((taskId: string, productIndex: number, attachmentId: string, sourceTask?: any) => {
    updateAttachmentProduct(taskId, productIndex, (product) => ({
      ...product,
      keptAttachmentIds: product.keptAttachmentIds.filter((id: string) => id !== attachmentId),
      attachmentsTouched: true,
    }), sourceTask);
  }, [updateAttachmentProduct]);

  const handleRemoveNewAttachment = React.useCallback((taskId: string, productIndex: number, file: File, sourceTask?: any) => {
    updateAttachmentProduct(taskId, productIndex, (product) => ({
      ...product,
      newFiles: product.newFiles.filter((item: File) => item !== file),
      attachmentsTouched: true,
    }), sourceTask);
  }, [updateAttachmentProduct]);

  const handleAddUploadedAttachments = React.useCallback((taskId: string, productIndex: number, uploadedItems: any[], sourceTask?: any) => {
    if (viewOnly) return;
    updateAttachmentProduct(taskId, productIndex, (product) => ({
      ...product,
      existingAttachments: [...(product.existingAttachments || []), ...uploadedItems],
      keptAttachmentIds: [...(product.keptAttachmentIds || []), ...uploadedItems.map((item: any) => item.id)],
    }), sourceTask);
  }, [updateAttachmentProduct, viewOnly]);

  const handleSelectTieuChi = (records: any[]) => {
    if (viewOnly) return;
    if (activeTaskId !== null && activeProductIndex !== null && records.length > 0) {
      const record = records[0];

      let pathParts: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const levelVal = record[`level${i}Name`];
        if (levelVal) {
          pathParts.push(levelVal);
        }
      }
      const tieuChiName = pathParts.length > 0
        ? pathParts.join(' / ')
        : (record.congViecChiTiet || record.tenNhomTieuChi || record.id);

      const productName = record.sanPhamDauRa || record.congViecChiTiet || record.tenNhomTieuChi;
      const diemBoTieuChi = Number(record.diem || 0);
      const diemCoSo = chucVuHeSo !== null ? diemBoTieuChi * chucVuHeSo : diemBoTieuChi;

      setInlineTasks((prev: any[]) => {
        const next = prev.map((task: any) => {
          if (task.id !== activeTaskId) return task;

          const products = [...(task.danhSachDauRa || [])];
          const currentProduct = normalizeProductAttachments(products[activeProductIndex]);
          const soLanKhongDat = Number(currentProduct.chamDiemChatLuong_KhongDat || 0);
          const soLanCham = Number(currentProduct.chamDiemTienDo_KhongDat || 0);

          products[activeProductIndex] = {
            ...currentProduct,
            tieuChiId: record.id,
            tenTieuChi: tieuChiName,
            diemTheoBoTieuChi: diemBoTieuChi,
            tenSanPhamDauRa: currentProduct.tenSanPhamDauRa?.trim()
              ? currentProduct.tenSanPhamDauRa
              : (productName || ""),
            // Khi chọn tiêu chí mới, mặc định hoàn thành toàn bộ điểm được giao cho cá nhân
            chamDiemSoLuong_HoanThanh: diemCoSo,
            chamDiemSoLuong_KhongHoanThanh: 0,
            chamDiemSoLuong_Diem: diemCoSo > 0 ? 100 : 0,
            chamDiemChatLuong_SoDiemConLai: Math.max(0, diemCoSo - soLanKhongDat * 0.25 * diemCoSo),
            chamDiemChatLuong_Diem: diemCoSo > 0
              ? Math.max(0, Math.min(100, 100 - soLanKhongDat * 25))
              : 0,
            chamDiemTienDo_SoDiemConLai: Math.max(0, diemCoSo - soLanCham * 0.25 * diemCoSo),
            chamDiemTienDo_Diem: diemCoSo > 0
              ? Math.max(0, Math.min(100, 100 - soLanCham * 25))
              : 0,
            caNhan: {
              ...(currentProduct.caNhan || {}),
              chamDiemSoLuong_HoanThanh: diemCoSo,
              chamDiemSoLuong_KhongHoanThanh: 0,
              chamDiemSoLuong_Diem: diemCoSo > 0 ? 100 : 0,
              chamDiemChatLuong_SoDiemConLai: Math.max(0, diemCoSo - soLanKhongDat * 0.25 * diemCoSo),
              chamDiemChatLuong_Diem: diemCoSo > 0 ? Math.max(0, Math.min(100, 100 - soLanKhongDat * 25)) : 0,
              chamDiemTienDo_SoDiemConLai: Math.max(0, diemCoSo - soLanCham * 0.25 * diemCoSo),
              chamDiemTienDo_Diem: diemCoSo > 0 ? Math.max(0, Math.min(100, 100 - soLanCham * 25)) : 0,
            },
            phoPhong: currentProduct.phoPhong,
          };

          const boTieuChiList = products.map((product: any) => product.tenTieuChi || product.tieuChiId).filter(Boolean);
          return {
            ...task,
            danhSachDauRa: products,
            boTieuChiList: boTieuChiList.length > 0 ? boTieuChiList : task.boTieuChiList,
            diemBoTieuChi: products.reduce((sum: number, product: any) => sum + Number(product.diemTheoBoTieuChi || 0), 0),
          };
        });
        inlineTasksRef.current = next;
        return next;
      });
    }
    setChonTieuChiVisible(false);
  };


  const handleInitInlineTask = (type: string) => {
    if (viewOnly) return;
    setInlineTasks(prev => [...prev, {
      id: "inline-" + Date.now() + "-" + Math.random(),
      isEditing: true,
      typeNhiemVu: type,
      tenNhiemVuDayDu: "",
      danhSachDauRa: [normalizeProductAttachments({ tenSanPhamDauRa: "" })],
      boTieuChiList: [],
      __noteSnapshot: [""],
    }]);
  };

  const handleInlineTaskChange = React.useCallback((id: string, field: string, value: any) => {
    if (viewOnly) return;
    setInlineTasks((prev: any[]) => {
      let base = [...prev];
      if (!base.some(t => t.id === id || t.dbId === id)) {
        const found = [...nhiemVuHeThong, ...nhiemVuPhatSinh].find(t => t.id === id || t.dbId === id);
        if (found) {
          base.push({
            ...found,
            id: found.id,
            dbId: found.id,
            isEditing: true,
            danhSachDauRa: (found.danhSachDauRa || []).map((p: any) => ({ ...p })),
          });
        }
      }
      return base.map(t => (t.id === id || t.dbId === id ? { ...t, [field]: value } : t));
    });
  }, [viewOnly, nhiemVuHeThong, nhiemVuPhatSinh]);

  const handleInlineProductChange = React.useCallback((id: string, index: number, field: string | Record<string, any>, value?: any) => {
    if (viewOnly) return;
    const currentEvaluatingRoleCode = normalizeRoleKey(vaiTroDanhGia || "CaNhan");
    const fieldsToUpdate: Record<string, any> = (typeof field === "object" && field !== null) ? field : { [field]: value };

    const updater = (prev: any[]) => {
      let base = [...prev];
      if (!base.some(t => t.id === id || t.dbId === id)) {
        const found = [...nhiemVuHeThong, ...nhiemVuPhatSinh].find(t => t.id === id || t.dbId === id);
        if (found) {
          base.push({
            ...found,
            id: found.id,
            dbId: found.id,
            isEditing: Boolean(found.isEditing),
            danhSachDauRa: (found.danhSachDauRa || []).map((p: any) => ({ ...p })),
          });
        }
      }
      return base.map(t => {
        if (t.id === id || t.dbId === id) {
          const newDauRa = [...(t.danhSachDauRa || [])];
          const currentSp = newDauRa[index] || {};
          const existingScoresByRole = { ...(currentSp.scoresByRole || {}) };
          const existingRoleData = {
            ...(existingScoresByRole[currentEvaluatingRoleCode] || {}),
            ...fieldsToUpdate,
          };
          existingScoresByRole[currentEvaluatingRoleCode] = existingRoleData;

          const updatedProduct: any = {
            ...normalizeProductAttachments(currentSp),
            scoresByRole: existingScoresByRole,
            caNhan: existingScoresByRole["CaNhan"] || currentSp.caNhan,
            phoPhong: existingScoresByRole["PhoTruongPhong"] || currentSp.phoPhong,
            truongPhong: existingScoresByRole["TruongPhong"] || currentSp.truongPhong,
            phoCucTruong: existingScoresByRole["PhoCucTruong"] || currentSp.phoCucTruong,
            cucTruong: existingScoresByRole["CucTruong"] || currentSp.cucTruong,
          };

          if (currentEvaluatingRoleCode === "CaNhan") {
            Object.assign(updatedProduct, fieldsToUpdate);
          }

          newDauRa[index] = updatedProduct;
          return { ...t, isEditing: Boolean(t.isEditing), danhSachDauRa: newDauRa };
        }
        return t;
      });
    };
    setInlineTasks((prev: any[]) => {
      const next = updater(prev);
      inlineTasksRef.current = next;
      return next;
    });
  }, [normalizeProductAttachments, viewOnly, nhiemVuHeThong, nhiemVuPhatSinh, vaiTroDanhGia]);

  const handleAddInlineProduct = React.useCallback((id: string) => {
    if (viewOnly) return;
    setInlineTasks((prev: any[]) => prev.map(t => {
      if (t.id === id) {
        return { ...t, danhSachDauRa: [...(t.danhSachDauRa || []), normalizeProductAttachments({ tenSanPhamDauRa: "" })] };
      }
      return t;
    }));
  }, [normalizeProductAttachments, viewOnly]);

  const handleRemoveInlineProduct = React.useCallback((id: string, index: number) => {
    if (viewOnly) return;
    setInlineTasks((prev: any[]) => prev.map(t => {
      if (t.id === id) {
        const newDauRa = (t.danhSachDauRa || []).filter((_: any, i: number) => i !== index);
        if (newDauRa.length === 0) newDauRa.push(normalizeProductAttachments({ tenSanPhamDauRa: "" }));
        return { ...t, danhSachDauRa: newDauRa };
      }
      return t;
    }));
  }, [normalizeProductAttachments, viewOnly]);

  const handleRemoveInlineTask = React.useCallback((id: string) => {
    if (viewOnly) return;
    setInlineTasks((prev: any[]) => prev.filter(t => t.id !== id));
    setEditingTaskIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [viewOnly]);

  const handleEditTaskInline = React.useCallback((task: any) => {
    if (viewOnly) return;
    const inlineId = task.id;
    setEditingTaskIds(prev => new Set(prev).add(inlineId));
    setInlineTasks(prev => {
      if (prev.find(t => t.id === inlineId)) return prev;
      const next = [...prev, {
        ...task,
        id: inlineId,
        isEditing: true,
        typeNhiemVu: task.typeNhiemVu || 'HETHONG',
        tenNhiemVuDayDu: task.tenNhiemVuDayDu || task.tenNhiemVuRutGon || '',
        danhSachDauRa: normalizeTaskAttachments(task).danhSachDauRa,
        boTieuChiList: task.boTieuChiList || [],
        dbId: inlineId,
        __noteSnapshot: getNoteSnapshot(task),
      }];
      inlineTasksRef.current = next;
      return next;
    });
  }, [getNoteSnapshot, normalizeTaskAttachments, viewOnly]);

  const handleCalculateInlineField = React.useCallback(async (id: string, productIndex: number, targetColumn: string, resultField: string) => {
    if (viewOnly) return;
    const currentInlineTask = inlineTasksRef.current.find((t: any) => t.id === id);
    if (!currentInlineTask || !currentInlineTask.danhSachDauRa || !currentInlineTask.danhSachDauRa[productIndex]) return;
    try {
      const product = currentInlineTask.danhSachDauRa[productIndex];
      const baseDiem = Number(product.diemTheoBoTieuChi || currentInlineTask.diemBoTieuChi || 0);
      const diemCoSo = chucVuHeSo !== null ? baseDiem * chucVuHeSo : baseDiem;

      // Khi vai trò đánh giá là cấp trên, đọc điểm từ scoresByRole thay vì root-level product
      // vì handleInlineProductChange chỉ cập nhật scoresByRole cho vai trò cấp trên.
      const currentEvalRole = normalizeRoleKey(vaiTroDanhGia || "CaNhan");
      const roleData = (currentEvalRole !== "CaNhan" && product.scoresByRole?.[currentEvalRole])
        ? product.scoresByRole[currentEvalRole]
        : product;

      // Điểm số lượng luôn tính trên điểm thực tế sau hệ số, không dùng công thức
      // cấu hình có thể đang tham chiếu nhầm điểm bộ tiêu chí gốc.
      if (targetColumn === "ChamDiemSoLuong_Diem" || targetColumn === "ChamDiemSoLuong_KhongHoanThanh") {
        const soLuongHoanThanh = Math.max(0, Math.min(
          diemCoSo,
          Number(roleData.chamDiemSoLuong_HoanThanh || 0),
        ));
        const soLuongKhongHoanThanh = Math.max(0, diemCoSo - soLuongHoanThanh);
        const diemPhanTram = diemCoSo > 0 ? (soLuongHoanThanh / diemCoSo) * 100 : 0;
        handleInlineProductChange(id, productIndex, {
          chamDiemSoLuong_HoanThanh: soLuongHoanThanh,
          chamDiemSoLuong_KhongHoanThanh: soLuongKhongHoanThanh,
          chamDiemSoLuong_Diem: Math.max(0, Math.min(100, diemPhanTram)),
        });
        return;
      }

      const resFormula = await kPI_CauHinhCongThucNhiemVuService.getFormula(
        "KPI_NhiemVu",
        targetColumn,
        selectedDot || "",
        currentUser?.departmentId
      );

      if (resFormula.status && resFormula.data) {
        const configId = resFormula.data.id;
        if (!configId) return;

        const diemHeSo = chucVuHeSo !== null ? baseDiem * chucVuHeSo : baseDiem;

        const parameters = {
          ChamDiemSoLuong_HoanThanh: roleData.chamDiemSoLuong_HoanThanh || 0,
          ChamDiemSoLuong_KhongHoanThanh: roleData.chamDiemSoLuong_KhongHoanThanh || 0,
          ChamDiemChatLuong_KhongDat: roleData.chamDiemChatLuong_KhongDat || 0,
          ChamDiemChatLuong_SoDiemConLai: roleData.chamDiemChatLuong_SoDiemConLai || 0,
          ChamDiemTienDo_KhongDat: roleData.chamDiemTienDo_KhongDat || 0,
          ChamDiemTienDo_SoDiemConLai: roleData.chamDiemTienDo_SoDiemConLai || 0,
          DiemTheoBoTieuChi: baseDiem,
          DiemBoTieuChi: baseDiem,
          DiemHeSo: diemHeSo,
        };

        const resCalc = await kPI_CauHinhCongThucNhiemVuService.calculateFormulaV2(configId, parameters);
        if (resCalc.status && resCalc.data !== undefined) {
          const val = Math.max(0, Number(resCalc.data) || 0);
          handleInlineProductChange(id, productIndex, resultField, val);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [currentUser, selectedDot, handleInlineProductChange, chucVuHeSo, viewOnly, vaiTroDanhGia]);

  const fetchNhiemVu = React.useCallback(async (targetIdLyLich: string, phieuIdOverride?: string | null) => {
    if (targetIdLyLich && selectedDot) {
      try {
        const resHeThong = await kPI_NhiemVuService.getNhiemVuByTypeAndLyLich(targetIdLyLich, TypeNhiemVuConstant.HETHONG, selectedDot);
        const resPhatSinh = await kPI_NhiemVuService.getNhiemVuByTypeAndLyLich(targetIdLyLich, TypeNhiemVuConstant.PHATSINH, selectedDot);

        let htTasks = (resHeThong?.data || []).map(normalizeTaskAttachments);
        let psTasks = (resPhatSinh?.data || []).map(normalizeTaskAttachments);

        const effPhieu = phieuIdOverride || idPhieuProp || effectiveIdPhieuProp || searchParams.get("idPhieuDanhGia") || searchParams.get("idPhieu");
        let chiTietList: any[] = [];
        if (effPhieu) {
          try {
            const resChiTiet = await kPI_DauRaNhiemVu_ChiTietDanhGiaService.getByPhieu(effPhieu);
            chiTietList = Array.isArray(resChiTiet) ? resChiTiet : (Array.isArray(resChiTiet?.data) ? resChiTiet.data : []);
          } catch (e) {
            console.warn("Không tải được chi tiết đánh giá:", e);
          }
        }

        const scoresByRole = new Map<string, Map<string, any>>();
        chiTietList.forEach((ct: any) => {
          const rawVt = (ct.vaiTroDanhGia || ct.VaiTroDanhGia || "").toString().trim();
          const matchedKey = normalizeRoleKey(rawVt);
          if (!scoresByRole.has(matchedKey)) {
            scoresByRole.set(matchedKey, new Map<string, any>());
          }
          const idDauRa = (ct.idDauRaNhiemVu || ct.IdDauRaNhiemVu || "").toString().trim().toLowerCase();
          if (idDauRa) {
            scoresByRole.get(matchedKey)!.set(idDauRa, ct);
          }
        });

        // 1. Nhận diện vai trò đang thao tác và vai trò theo trạng thái
        const normVaiTro = vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia) : "";
        const sttKey = currentTrangThai ? currentTrangThai.trim().toLowerCase() : "";
        const normStatusRole = sttKey ? (MAP_TRANG_THAI_TO_VAI_TRO[sttKey] || "") : "";

        // 2. Thu thập các vai trò cấp trên thực tế có mặt trong phiếu (đã có điểm, đang chấm, hoặc đang chờ duyệt)
        const actualUpperRoles = new Set<string>();

        scoresByRole.forEach((roleMap, roleKey) => {
          const normKey = normalizeRoleKey(roleKey);
          if (normKey && normKey !== "CaNhan" && roleMap && roleMap.size > 0) {
            actualUpperRoles.add(normKey);
          }
        });

        if (normVaiTro && normVaiTro !== "CaNhan") {
          actualUpperRoles.add(normVaiTro);
        }

        // Chỉ thêm vai trò cấp trên nếu vai trò đó đang được chỉnh sửa trực tiếp bởi người dùng đó
        if (normStatusRole && normStatusRole !== "CaNhan" && normVaiTro === normStatusRole && !viewOnly) {
          actualUpperRoles.add(normStatusRole);
        }

        // 3. Nhận diện ngữ cảnh luồng: TT (Trung tâm), VP (Văn phòng), Vụ, hay Cục/Phòng
        const isTTContext =
          normVaiTro === "PhoGiamDocTT" || normVaiTro === "GiamDocTT" ||
          actualUpperRoles.has("PhoGiamDocTT") || actualUpperRoles.has("GiamDocTT") ||
          sttKey.includes("giamdoctt") || sttKey.includes("phogiamdoctt");

        const isTTAltContext =
          normVaiTro === "PhoGDTT" || normVaiTro === "GD" ||
          actualUpperRoles.has("PhoGDTT") || actualUpperRoles.has("GD");

        const isVPContext =
          normVaiTro === "PhoChanhVanPhong" || normVaiTro === "ChanhVanPhong" ||
          actualUpperRoles.has("PhoChanhVanPhong") || actualUpperRoles.has("ChanhVanPhong") ||
          actualUpperRoles.has("PHOCHANHVANPHONG") ||
          sttKey.includes("chanhvanphong") || sttKey.includes("phochanhvanphong");

        const isVuContext = isVuDepartment(tenDonVi || phieuInfo?.tenDonVi || currentUser?.tenDonVi_txt) ||
          normVaiTro === "PhoVuTruong" || normVaiTro === "VuTruong" ||
          actualUpperRoles.has("PhoVuTruong") || actualUpperRoles.has("VuTruong") ||
          sttKey.includes("vutruong") || sttKey.includes("vutrong");

        const fullRoleHierarchy = isTTContext
          ? ORDERED_ROLE_CODES_TT
          : isTTAltContext
            ? ORDERED_ROLE_CODES_TT_ALT
            : isVPContext
              ? ORDERED_ROLE_CODES_VP
              : isVuContext
                ? ORDERED_ROLE_CODES_VU
                : ORDERED_ROLE_CODES_CUC;

        // 4. Xây dựng danh sách vai trò: Luôn có "CaNhan" + các vai trò cấp trên thực tế theo đúng thứ tự phân cấp
        const determinedRoleCodes: string[] = [
          "CaNhan",
          ...fullRoleHierarchy.filter(code => code !== "CaNhan" && actualUpperRoles.has(code))
        ];

        // Fallback: nếu là trạng thái đã duyệt nhưng chưa có role cấp trên nào trong set, thêm role cấp trên tương ứng
        if (determinedRoleCodes.length === 1 && sttKey === "daduyet") {
          const defaultUpper = isTTContext ? "GiamDocTT"
            : isTTAltContext ? "GD"
              : isVPContext ? "ChanhVanPhong"
                : isVuContext ? "VuTruong"
                  : "PhoTruongPhong";
          determinedRoleCodes.push(defaultUpper);
        }

        const determinedRoles = determinedRoleCodes.map(code => ALL_ROLES_CONFIG[code] || {
          code,
          name: code,
          shortLabel: code,
          color: "#4b5563",
          bgColor: "#f3f4f6",
          order: 99,
        });
        setActiveRoles(determinedRoles);

        const mapTasksWithRoles = (taskList: any[]) => {
          return taskList.map((task: any) => {
            const updatedDauRa = (task.danhSachDauRa || []).map((sp: any) => {
              const spId = String(sp.id || sp.idDauRaNhiemVu || sp.Id || "").trim().toLowerCase();
              const rawDiemBoTieuChi = Number(sp.diemTheoBoTieuChi ?? task.diemBoTieuChi ?? 0);
              const diemCoSo = chucVuHeSo !== null ? rawDiemBoTieuChi * chucVuHeSo : rawDiemBoTieuChi;

              const scoresByRoleData: Record<string, any> = {};
              let previousRoleData: any = null;

              determinedRoles.forEach((role, rIdx) => {
                const normRole = normalizeRoleKey(role.code);
                const roleScore = scoresByRole.get(normRole)?.get(spId) || scoresByRole.get(role.code)?.get(spId);
                let roleData: any;

                if (rIdx === 0) {
                  // CaNhan
                  roleData = {
                    chamDiemSoLuong_HoanThanh: roleScore?.chamDiemSoLuong_HoanThanh ?? roleScore?.ChamDiemSoLuong_HoanThanh ?? sp.chamDiemSoLuong_HoanThanh ?? diemCoSo,
                    chamDiemSoLuong_KhongHoanThanh: roleScore?.chamDiemSoLuong_KhongHoanThanh ?? roleScore?.ChamDiemSoLuong_KhongHoanThanh ?? sp.chamDiemSoLuong_KhongHoanThanh ?? 0,
                    chamDiemSoLuong_Diem: roleScore?.chamDiemSoLuong_Diem ?? roleScore?.ChamDiemSoLuong_Diem ?? sp.chamDiemSoLuong_Diem ?? 100,
                    chamDiemChatLuong_KhongDat: roleScore?.chamDiemChatLuong_KhongDat ?? roleScore?.ChamDiemChatLuong_KhongDat ?? sp.chamDiemChatLuong_KhongDat ?? 0,
                    chamDiemChatLuong_SoDiemConLai: roleScore?.chamDiemChatLuong_SoDiemConLai ?? roleScore?.ChamDiemChatLuong_SoDiemConLai ?? sp.chamDiemChatLuong_SoDiemConLai ?? diemCoSo,
                    chamDiemChatLuong_Diem: roleScore?.chamDiemChatLuong_Diem ?? roleScore?.ChamDiemChatLuong_Diem ?? sp.chamDiemChatLuong_Diem ?? 100,
                    chamDiemTienDo_KhongDat: roleScore?.chamDiemTienDo_KhongDat ?? roleScore?.ChamDiemTienDo_KhongDat ?? sp.chamDiemTienDo_KhongDat ?? 0,
                    chamDiemTienDo_SoDiemConLai: roleScore?.chamDiemTienDo_SoDiemConLai ?? roleScore?.ChamDiemTienDo_SoDiemConLai ?? sp.chamDiemTienDo_SoDiemConLai ?? diemCoSo,
                    chamDiemTienDo_Diem: roleScore?.chamDiemTienDo_Diem ?? roleScore?.ChamDiemTienDo_Diem ?? sp.chamDiemTienDo_Diem ?? 100,
                    ghiChuGiaTrinh: roleScore?.ghiChu ?? roleScore?.GhiChu ?? sp.ghiChuGiaTrinh ?? "",
                    tenNguoiDanhGia: roleScore?.tenNguoiDanhGia ?? roleScore?.TenNguoiDanhGia ?? "",
                    userName: roleScore?.userName ?? roleScore?.UserName ?? "",
                    tenChucVu: roleScore?.tenChucVu ?? roleScore?.TenChucVu ?? "",
                  };
                } else {
                  // Cấp trên kế thừa từ previousRoleData nếu đang chấm trực tiếp, ngược lại không gán điểm ảo
                  const prev = previousRoleData;
                  const isCurrentRoleEditing = !viewOnly && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia).toLowerCase() === normRole.toLowerCase() : false);
                  roleData = roleScore ? {
                    chamDiemSoLuong_HoanThanh: roleScore.chamDiemSoLuong_HoanThanh ?? roleScore.ChamDiemSoLuong_HoanThanh ?? prev?.chamDiemSoLuong_HoanThanh ?? diemCoSo,
                    chamDiemSoLuong_KhongHoanThanh: roleScore.chamDiemSoLuong_KhongHoanThanh ?? roleScore.ChamDiemSoLuong_KhongHoanThanh ?? prev?.chamDiemSoLuong_KhongHoanThanh ?? 0,
                    chamDiemSoLuong_Diem: roleScore.chamDiemSoLuong_Diem ?? roleScore.ChamDiemSoLuong_Diem ?? prev?.chamDiemSoLuong_Diem ?? 100,
                    chamDiemChatLuong_KhongDat: roleScore.chamDiemChatLuong_KhongDat ?? roleScore.ChamDiemChatLuong_KhongDat ?? prev?.chamDiemChatLuong_KhongDat ?? 0,
                    chamDiemChatLuong_SoDiemConLai: roleScore.chamDiemChatLuong_SoDiemConLai ?? roleScore.ChamDiemChatLuong_SoDiemConLai ?? prev?.chamDiemChatLuong_SoDiemConLai ?? diemCoSo,
                    chamDiemChatLuong_Diem: roleScore.chamDiemChatLuong_Diem ?? roleScore.ChamDiemChatLuong_Diem ?? prev?.chamDiemChatLuong_Diem ?? 100,
                    chamDiemTienDo_KhongDat: roleScore.chamDiemTienDo_KhongDat ?? roleScore.ChamDiemTienDo_KhongDat ?? prev?.chamDiemTienDo_KhongDat ?? 0,
                    chamDiemTienDo_SoDiemConLai: roleScore.chamDiemTienDo_SoDiemConLai ?? roleScore.ChamDiemTienDo_SoDiemConLai ?? prev?.chamDiemTienDo_SoDiemConLai ?? diemCoSo,
                    chamDiemTienDo_Diem: roleScore.chamDiemTienDo_Diem ?? roleScore.ChamDiemTienDo_Diem ?? prev?.chamDiemTienDo_Diem ?? 100,
                    ghiChuGiaTrinh: roleScore.ghiChu ?? roleScore.GhiChu ?? prev?.ghiChuGiaTrinh ?? "",
                    tenNguoiDanhGia: roleScore.tenNguoiDanhGia ?? roleScore.TenNguoiDanhGia ?? "",
                    userName: roleScore.userName ?? roleScore.UserName ?? "",
                    tenChucVu: roleScore.tenChucVu ?? roleScore.TenChucVu ?? "",
                  } : (isCurrentRoleEditing ? {
                    ...prev,
                    tenNguoiDanhGia: "",
                    userName: "",
                    tenChucVu: "",
                  } : null);
                }

                scoresByRoleData[role.code] = roleData;
                if (roleData) {
                  previousRoleData = roleData;
                }
              });

              const currentEvaluatingRoleCode = normalizeRoleKey(vaiTroDanhGia || "CaNhan");
              const activeRoleData = scoresByRoleData[currentEvaluatingRoleCode] || scoresByRoleData[vaiTroDanhGia || "CaNhan"] || scoresByRoleData["CaNhan"];

              return {
                ...sp,
                scoresByRole: scoresByRoleData,
                caNhan: scoresByRoleData["CaNhan"],
                phoPhong: scoresByRoleData["PhoTruongPhong"],
                ...activeRoleData,
              };
            });
            return { ...task, danhSachDauRa: updatedDauRa };
          });
        };

        htTasks = mapTasksWithRoles(htTasks);
        psTasks = mapTasksWithRoles(psTasks);

        setNhiemVuHeThong(htTasks);
        setNhiemVuPhatSinh(psTasks);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhiệm vụ:", error);
      }
    }
  }, [normalizeTaskAttachments, selectedDot, idPhieuProp, effectiveIdPhieuProp, searchParams, vaiTroDanhGia, currentTrangThai]);

  const handleSaveInlineTasks = React.useCallback(async (phieuIdOverride?: string | null) => {
    if (viewOnly) return true; // Bỏ qua yên lặng - panel chỉ xem không cần lưu
    const allInlineTasks = (inlineTasksRef.current && inlineTasksRef.current.length > 0)
      ? inlineTasksRef.current
      : [...nhiemVuHeThong, ...nhiemVuPhatSinh];
    if (allInlineTasks.length === 0) return true;

    const effectiveIdPhieu = phieuIdOverride || queryIdPhieu || idPhieuProp || searchParams.get("idPhieuDanhGia") || searchParams.get("idPhieu") || null;
    const currentVaiTro = normalizeRoleKey(vaiTroDanhGia || "CaNhan");
    const isCanNhan = currentVaiTro === "CaNhan";

    if (isCanNhan) {
      // 1. Kiểm tra miêu tả nhiệm vụ
      const emptyDescTask = allInlineTasks.find((t: any) => !t.tenNhiemVuDayDu || !t.tenNhiemVuDayDu.trim());
      if (emptyDescTask) {
        if (!silentSave) {
          message.error("Không thể lưu: Vui lòng nhập đầy đủ 'Miêu tả công việc' cho tất cả các nhiệm vụ!");
        }
        return { error: true, message: "Vui lòng nhập đầy đủ 'Miêu tả công việc' cho tất cả các nhiệm vụ!", section: "section2", taskId: emptyDescTask.clientKey || emptyDescTask.dbId };
      }

      // 2. Kiểm tra tên sản phẩm đầu ra
      const emptyProductTask = allInlineTasks.find((t: any) =>
        t.danhSachDauRa && t.danhSachDauRa.some((sp: any) => !sp.tenSanPhamDauRa || !sp.tenSanPhamDauRa.trim())
      );
      if (emptyProductTask) {
        if (!silentSave) {
          message.error("Không thể lưu: Vui lòng nhập đầy đủ 'Sản phẩm đầu ra' cho tất cả các dòng!");
        }
        return { error: true, message: "Vui lòng nhập đầy đủ 'Sản phẩm đầu ra' cho tất cả các dòng!", section: "section2", taskId: emptyProductTask.clientKey || emptyProductTask.dbId };
      }

      // 3. Lưu cấu trúc nhiệm vụ và sản phẩm đầu ra vào KPI_NhiemVu & KPI_DauRaNhiemVu
      const dataToSend = allInlineTasks.map((task: any) => ({
        ...(task.dbId ? { id: task.dbId } : {}),
        typeNhiemVu: task.typeNhiemVu,
        tenNhiemVuDayDu: task.tenNhiemVuDayDu,
        danhSachDauRa: (task.danhSachDauRa || []).map((sp: any) => {
          const diemCoSo = Number(sp.diemTheoBoTieuChi || task.diemBoTieuChi || 0);
          return {
            ...(sp.id ? { id: sp.id } : {}),
            clientKey: sp.clientKey || sp.id || createClientKey(),
            keptAttachmentIds: sp.keptAttachmentIds || [],
            attachmentsTouched: Boolean(sp.attachmentsTouched),
            tenSanPhamDauRa: sp.tenSanPhamDauRa,
            chamDiemSoLuong_HoanThanh: (sp.chamDiemSoLuong_HoanThanh !== undefined && sp.chamDiemSoLuong_HoanThanh !== null && sp.chamDiemSoLuong_HoanThanh !== "") ? sp.chamDiemSoLuong_HoanThanh : diemCoSo,
            chamDiemSoLuong_KhongHoanThanh: sp.chamDiemSoLuong_KhongHoanThanh ?? 0,
            chamDiemSoLuong_Diem: sp.chamDiemSoLuong_Diem !== undefined && sp.chamDiemSoLuong_Diem !== null ? Math.max(0, sp.chamDiemSoLuong_Diem) : (diemCoSo > 0 ? 100 : 0),
            chamDiemChatLuong_KhongDat: sp.chamDiemChatLuong_KhongDat ?? 0,
            chamDiemChatLuong_SoDiemConLai: (sp.chamDiemChatLuong_SoDiemConLai !== undefined && sp.chamDiemChatLuong_SoDiemConLai !== null && sp.chamDiemChatLuong_SoDiemConLai !== "") ? sp.chamDiemChatLuong_SoDiemConLai : diemCoSo,
            chamDiemChatLuong_Diem: sp.chamDiemChatLuong_Diem !== undefined && sp.chamDiemChatLuong_Diem !== null ? Math.max(0, sp.chamDiemChatLuong_Diem) : (diemCoSo > 0 ? 100 : 0),
            chamDiemTienDo_KhongDat: sp.chamDiemTienDo_KhongDat ?? 0,
            chamDiemTienDo_SoDiemConLai: (sp.chamDiemTienDo_SoDiemConLai !== undefined && sp.chamDiemTienDo_SoDiemConLai !== null && sp.chamDiemTienDo_SoDiemConLai !== "") ? sp.chamDiemTienDo_SoDiemConLai : diemCoSo,
            chamDiemTienDo_Diem: sp.chamDiemTienDo_Diem !== undefined && sp.chamDiemTienDo_Diem !== null ? Math.max(0, sp.chamDiemTienDo_Diem) : (diemCoSo > 0 ? 100 : 0),
            diemTheoBoTieuChi: sp.diemTheoBoTieuChi || task.diemBoTieuChi,
            ghiChuGiaTrinh: sp.ghiChuGiaTrinh,
            tieuChiId: sp.tieuChiId,
            tenTieuChi: sp.tenTieuChi,
          };
        }),
        boTieuChiList: task.boTieuChiList || [],
        idLyLich: targetUserId || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id || null,
        idDotTheoDoiDanhGia: selectedDot || null,
        idPhieuDanhGia: effectiveIdPhieu,
      }));

      let productMappings: any[] = [];
      try {
        const formData = new FormData();
        formData.append("Payload", JSON.stringify(dataToSend));
        allInlineTasks.forEach((task: any) => {
          (task.danhSachDauRa || []).forEach((product: any) => {
            const clientKey = product.clientKey || product.id;
            (product.newFiles || []).forEach((file: File) => {
              formData.append("Files", file, file.name);
              formData.append("FileProductKeys", clientKey);
            });
          });
        });

        const res = await kPI_NhiemVuService.saveWithAttachments(formData);
        if (!res.status) {
          const errMsg = res.message || (res as any)?.Message || (res as any)?.data?.message || "Có lỗi xảy ra khi lưu nhiệm vụ";
          if (!silentSave) {
            message.error(errMsg);
          }
          return { error: true, message: errMsg, section: "section2" };
        }
        productMappings = (res as any)?.data?.items || (res as any)?.data?.data?.items || (res as any)?.items || [];
      } catch (error: any) {
        console.error("Lỗi khi lưu nhiệm vụ:", error);
        const errMsg = error?.response?.data?.message || error?.response?.data?.Message || error?.message || "Có lỗi xảy ra khi lưu nhiệm vụ";
        if (!silentSave) {
          message.error(errMsg);
        }
        return { error: true, message: errMsg, section: "section2" };
      }

      // 4. Lưu chi tiết đánh giá của Cá nhân vào KPI_DauRaNhiemVu_ChiTietDanhGia
      if (effectiveIdPhieu) {
        try {
          const mappingDict = new Map<string, string>();
          productMappings.forEach((m: any) => {
            const cKey = m.clientKey || m.ClientKey;
            const pId = m.productId || m.ProductId;
            if (cKey && pId) {
              mappingDict.set(cKey, pId);
            }
          });

          // Nếu có product chưa có ID, thử lấy danh sách nhiệm vụ mới nhất từ DB
          let dbTasks: any[] = [];
          const hasMissingId = dataToSend.some((task: any) =>
            (task.danhSachDauRa || []).some((sp: any) => !sp.id && !mappingDict.get(sp.clientKey))
          );
          if (hasMissingId && targetUserId && selectedDot) {
            try {
              const [resHT, resPS] = await Promise.all([
                kPI_NhiemVuService.getNhiemVuByTypeAndLyLich(targetUserId, TypeNhiemVuConstant.HETHONG, selectedDot),
                kPI_NhiemVuService.getNhiemVuByTypeAndLyLich(targetUserId, TypeNhiemVuConstant.PHATSINH, selectedDot),
              ]);
              dbTasks = [...(resHT?.data || []), ...(resPS?.data || [])];
            } catch (err) {
              console.warn("Không thể tải lại danh sách nhiệm vụ từ DB:", err);
            }
          }

          const itemsToSave: any[] = [];
          dataToSend.forEach((task: any) => {
            (task.danhSachDauRa || []).forEach((sp: any, pIdx: number) => {
              let dauRaId = sp.id || mappingDict.get(sp.clientKey);
              if (!dauRaId && dbTasks.length > 0) {
                const matchedTask = dbTasks.find((t: any) =>
                  (t.tenNhiemVuDayDu || "").trim() === (task.tenNhiemVuDayDu || "").trim()
                );
                if (matchedTask?.danhSachDauRa?.[pIdx]?.id) {
                  dauRaId = matchedTask.danhSachDauRa[pIdx].id;
                }
              }

              if (dauRaId) {
                itemsToSave.push({
                  idDauRaNhiemVu: dauRaId,
                  idPhieuDanhGia: effectiveIdPhieu,
                  vaiTroDanhGia: "CaNhan",
                  nguoiDanhGiaId: currentUser?.id,
                  chamDiemSoLuong_HoanThanh: sp.chamDiemSoLuong_HoanThanh ?? 0,
                  chamDiemSoLuong_KhongHoanThanh: sp.chamDiemSoLuong_KhongHoanThanh ?? 0,
                  chamDiemSoLuong_Diem: sp.chamDiemSoLuong_Diem !== undefined && sp.chamDiemSoLuong_Diem !== null ? Math.max(0, sp.chamDiemSoLuong_Diem) : (sp.chamDiemSoLuong_Diem ?? 0),
                  chamDiemChatLuong_KhongDat: sp.chamDiemChatLuong_KhongDat ?? 0,
                  chamDiemChatLuong_SoDiemConLai: sp.chamDiemChatLuong_SoDiemConLai !== undefined && sp.chamDiemChatLuong_SoDiemConLai !== null ? Math.max(0, sp.chamDiemChatLuong_SoDiemConLai) : (sp.chamDiemChatLuong_SoDiemConLai ?? 0),
                  chamDiemChatLuong_Diem: sp.chamDiemChatLuong_Diem !== undefined && sp.chamDiemChatLuong_Diem !== null ? Math.max(0, sp.chamDiemChatLuong_Diem) : (sp.chamDiemChatLuong_Diem ?? 0),
                  chamDiemTienDo_KhongDat: sp.chamDiemTienDo_KhongDat ?? 0,
                  chamDiemTienDo_SoDiemConLai: sp.chamDiemTienDo_SoDiemConLai !== undefined && sp.chamDiemTienDo_SoDiemConLai !== null ? Math.max(0, sp.chamDiemTienDo_SoDiemConLai) : (sp.chamDiemTienDo_SoDiemConLai ?? 0),
                  chamDiemTienDo_Diem: sp.chamDiemTienDo_Diem !== undefined && sp.chamDiemTienDo_Diem !== null ? Math.max(0, sp.chamDiemTienDo_Diem) : (sp.chamDiemTienDo_Diem ?? 0),
                  ghiChu: sp.ghiChuGiaTrinh || "",
                });
              }
            });
          });

          if (itemsToSave.length > 0) {
            const resBatch = await kPI_DauRaNhiemVu_ChiTietDanhGiaService.saveBatch({
              idPhieuDanhGia: effectiveIdPhieu,
              vaiTroDanhGia: "CaNhan",
              nguoiDanhGiaId: currentUser?.id,
              items: itemsToSave,
            });
            console.log("saveBatch for CaNhan:", resBatch);
          }
        } catch (e) {
          console.warn("Lỗi lưu KPI_DauRaNhiemVu_ChiTietDanhGia cho Cá nhân:", e);
        }
      }
    } else {
      // 5. Cấp trên (Phó phòng, Trưởng phòng, Cục phó, Cục trưởng): LƯU TRỰC TIẾP VÀO KPI_DauRaNhiemVu_ChiTietDanhGia
      if (effectiveIdPhieu) {
        try {
          const itemsToSave: any[] = [];
          allInlineTasks.forEach((task: any) => {
            (task.danhSachDauRa || []).forEach((sp: any) => {
              const dauRaId = sp.id || sp.idDauRaNhiemVu || sp.Id;
              const rawDiem = Number(sp.diemTheoBoTieuChi ?? task.diemBoTieuChi ?? 0);
              const diemCoSo = chucVuHeSo !== null ? rawDiem * chucVuHeSo : rawDiem;

              const currentRoleData = sp.scoresByRole?.[currentVaiTro] || (currentVaiTro === "PhoTruongPhong" ? sp.phoPhong : sp.caNhan) || sp;
              if (dauRaId) {
                itemsToSave.push({
                  idDauRaNhiemVu: dauRaId,
                  idPhieuDanhGia: effectiveIdPhieu,
                  vaiTroDanhGia: currentVaiTro,
                  nguoiDanhGiaId: currentUser?.id,
                  chamDiemSoLuong_HoanThanh: currentRoleData.chamDiemSoLuong_HoanThanh ?? currentRoleData.soLuongHoanThanh ?? sp.chamDiemSoLuong_HoanThanh ?? diemCoSo,
                  chamDiemSoLuong_KhongHoanThanh: currentRoleData.chamDiemSoLuong_KhongHoanThanh ?? currentRoleData.soLuongKhongHoanThanh ?? sp.chamDiemSoLuong_KhongHoanThanh ?? 0,
                  chamDiemSoLuong_Diem: currentRoleData.chamDiemSoLuong_Diem !== undefined && currentRoleData.chamDiemSoLuong_Diem !== null ? Math.max(0, currentRoleData.chamDiemSoLuong_Diem) : (currentRoleData.soLuongPhanTram ?? 100),
                  chamDiemChatLuong_KhongDat: currentRoleData.chamDiemChatLuong_KhongDat ?? currentRoleData.soLanKhongDat ?? sp.chamDiemChatLuong_KhongDat ?? 0,
                  chamDiemChatLuong_SoDiemConLai: currentRoleData.chamDiemChatLuong_SoDiemConLai !== undefined && currentRoleData.chamDiemChatLuong_SoDiemConLai !== null ? Math.max(0, currentRoleData.chamDiemChatLuong_SoDiemConLai) : (currentRoleData.chatLuongConLai ?? diemCoSo),
                  chamDiemChatLuong_Diem: currentRoleData.chamDiemChatLuong_Diem !== undefined && currentRoleData.chamDiemChatLuong_Diem !== null ? Math.max(0, currentRoleData.chamDiemChatLuong_Diem) : (currentRoleData.chatLuongPhanTram ?? 100),
                  chamDiemTienDo_KhongDat: currentRoleData.chamDiemTienDo_KhongDat ?? currentRoleData.soLanCham ?? sp.chamDiemTienDo_KhongDat ?? 0,
                  chamDiemTienDo_SoDiemConLai: currentRoleData.chamDiemTienDo_SoDiemConLai !== undefined && currentRoleData.chamDiemTienDo_SoDiemConLai !== null ? Math.max(0, currentRoleData.chamDiemTienDo_SoDiemConLai) : (currentRoleData.tienDoConLai ?? diemCoSo),
                  chamDiemTienDo_Diem: currentRoleData.chamDiemTienDo_Diem !== undefined && currentRoleData.chamDiemTienDo_Diem !== null ? Math.max(0, currentRoleData.chamDiemTienDo_Diem) : (currentRoleData.tienDoPhanTram ?? 100),
                  ghiChu: currentRoleData.ghiChuGiaTrinh || currentRoleData.ghiChu || sp.ghiChuGiaTrinh || "",
                });
              }
            });
          });

          if (itemsToSave.length > 0) {
            const resBatch = await kPI_DauRaNhiemVu_ChiTietDanhGiaService.saveBatch({
              idPhieuDanhGia: effectiveIdPhieu,
              vaiTroDanhGia: currentVaiTro,
              nguoiDanhGiaId: currentUser?.id,
              items: itemsToSave,
            });
            if (resBatch && resBatch.status === false) {
              return { error: true, message: resBatch.message || "Lỗi lưu chi tiết đánh giá", section: "section2" };
            }
          }
        } catch (e: any) {
          console.error("Lỗi khi lưu batch chi tiết đánh giá cho cấp trên:", e);
          return { error: true, message: e?.message || "Lỗi lưu chi tiết đánh giá", section: "section2" };
        }
      }
    }

    if (!silentSave) {
      message.success("Lưu đánh giá thành công");
    }
    setInlineTasks([]);
    setEditingTaskIds(new Set());
    fetchNhiemVu(targetUserId || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id || "", effectiveIdPhieu);
    return true;
  }, [createClientKey, currentUser, fetchNhiemVu, queryIdPhieu, idPhieuProp, effectiveIdPhieuProp, searchParams, selectedDot, silentSave, targetUserId, vaiTroDanhGia, viewOnly]);

  useEffect(() => {
    const fetchHeSoLanhDao = async () => {
      setChucVuHeSo(null);
      setTenChucVuLanhDao("");
      const targetIdLyLich = idLyLichProp || targetUserId || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id;
      if (!selectedDot || (!queryIdPhieu && !targetIdLyLich)) return;

      try {
        const res = await kPI_NhiemVuService.getHeSoLanhDaoApDung(queryIdPhieu, selectedDot, targetIdLyLich);
        const data = res?.status ? res.data : null;
        setTenChucVuLanhDao(data?.tenChucVu || data?.chucVuCode || "");
        if (data?.coApDungHeSo && data?.heSo !== null && data?.heSo !== undefined) {
          setChucVuHeSo(Number(data.heSo));
        }
      } catch (error) {
        console.error("Lỗi lấy hệ số lãnh đạo:", error);
      }
    };
    fetchHeSoLanhDao();
  }, [currentUser, idLyLichProp, queryIdPhieu, selectedDot, targetUserId]);

  useEffect(() => {
    const fetchDonVi = async () => {
      const donViId = currentUser?.donViId || currentUser?.departmentId;
      if (donViId) {
        try {
          const res = await departmentService.get(donViId);
          if (res.data) {
            setTenDonVi(res.data.name || "");
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin đơn vị:", error);
        }
      }
    };

    const fetchDotDanhGia = async () => {
      try {
        const options = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
        setDotDanhGiaOptions(options);
        if (queryIdDot) {
          setSelectedDot(queryIdDot);
        } else if (options.length > 0) {
          setSelectedDot(options[0].value);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đợt đánh giá:", error);
      }
    };

    fetchDonVi();
    fetchDotDanhGia();
  }, [currentUser]);



  const fetchKetQuaThucHien = async (targetIdLyLich: string) => {
    const queryIdPhieu = searchParams.get("idPhieuDanhGia") || searchParams.get("idPhieu");
    if (queryIdPhieu || (selectedDot && targetIdLyLich)) {
      try {
        const res = await kPI_NhiemVuService.getKetQuaThucHien(queryIdPhieu, selectedDot, targetIdLyLich);
        if (res?.status && res?.data) {
          if (res.data.ketQuaLinhVucPhanTram !== null && res.data.ketQuaLinhVucPhanTram !== undefined) {
            setKqLinhVucPercent(res.data.ketQuaLinhVucPhanTram);
          }
          if (res.data.khaNangToChucPhanTram !== null && res.data.khaNangToChucPhanTram !== undefined) {
            setKnToChucPercent(res.data.khaNangToChucPhanTram);
          }
          if (res.data.nangLucTapHopPhanTram !== null && res.data.nangLucTapHopPhanTram !== undefined) {
            setNlTapHopPercent(res.data.nangLucTapHopPhanTram);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy kết quả thực hiện nhiệm vụ từ DB:", error);
      }
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      let targetIdLyLich = idLyLichProp || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id;

      const queryIdPhieu = idPhieuProp || searchParams.get("idPhieuDanhGia") || searchParams.get("idPhieu");
      if (queryIdPhieu) {
        try {
          const resPhieu = await kPI_PhieuDanhGiaService.getById(queryIdPhieu);
          if (resPhieu?.data) {
            setPhieuInfo(resPhieu.data);
            if (resPhieu.data.idLyLich) {
              targetIdLyLich = resPhieu.data.idLyLich;
            }
          }
        } catch (error) {
          console.error("Lỗi khi fetch phieu", error);
        }
      }

      let effectivePhieu = queryIdPhieu || idPhieuProp || effectiveIdPhieuProp;

      if (!effectivePhieu && targetIdLyLich && selectedDot) {
        try {
          const resSearch = await kPI_PhieuDanhGiaService.getData({
            pageIndex: 1,
            pageSize: 1,
            idLyLich: targetIdLyLich,
            idDotDanhGia: selectedDot,
          });
          if (resSearch?.data?.items?.length > 0) {
            effectivePhieu = resSearch.data.items[0].id;
            setPhieuInfo(resSearch.data.items[0]);
          }
        } catch (error) {
          console.warn("Lỗi khi tìm phiếu:", error);
        }
      }

      setTargetUserId(targetIdLyLich);
      if (targetIdLyLich && selectedDot) {
        fetchNhiemVu(targetIdLyLich, effectivePhieu);
        fetchKetQuaThucHien(targetIdLyLich);
      }
    };

    if (currentUser && selectedDot) {
      fetchInitialData();
    }
  }, [currentUser, idLyLichProp, idPhieuProp, effectiveIdPhieuProp, selectedDot, searchParams, fetchNhiemVu]);

  const handleDeleteTask = React.useCallback(async (id: string) => {
    if (viewOnly) return;
    try {
      const res = await kPI_NhiemVuService.delete(id);
      if (res.status) {
        message.success("Xóa nhiệm vụ thành công");
        fetchNhiemVu(targetUserId || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id || "");
      } else {
        message.error(res.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi xóa nhiệm vụ");
    }
  }, [fetchNhiemVu, targetUserId, currentUser, viewOnly]);

  const formatPercent = (val: any) => {
    if (val === null || val === undefined || val === "") return "";
    let num = Number(val);
    if (isNaN(num)) return val;
    if (num < 0) num = 0;
    return `${formatDisplayScore(num)}%`;
  };

  const getProductScoreValues = (product: any, fallbackBaseScore?: number) => {
    const diemBoTieuChi = Number(product?.diemTheoBoTieuChi ?? fallbackBaseScore ?? 0);
    const diemCoSo = chucVuHeSo !== null ? diemBoTieuChi * chucVuHeSo : diemBoTieuChi;

    const calcScoresForObj = (p: any, fallbackObj?: any) => {
      const src = p;
      const fb = fallbackObj;

      if (!src && !fb && !diemCoSo) {
        return {
          soLuongHoanThanh: undefined,
          soLuongKhongHoanThanh: undefined,
          soLuongPhanTram: undefined,
          soLanKhongDat: undefined,
          chatLuongConLai: undefined,
          chatLuongPhanTram: undefined,
          soLanCham: undefined,
          tienDoConLai: undefined,
          tienDoPhanTram: undefined,
          ghiChu: "",
        };
      }

      const hasSlKhongHT = src?.chamDiemSoLuong_KhongHoanThanh !== undefined && src?.chamDiemSoLuong_KhongHoanThanh !== null && src?.chamDiemSoLuong_KhongHoanThanh !== "";
      const hasSlHT = src?.chamDiemSoLuong_HoanThanh !== undefined && src?.chamDiemSoLuong_HoanThanh !== null && src?.chamDiemSoLuong_HoanThanh !== "";

      let soLuongHoanThanh: number;
      let soLuongKhongHoanThanh: number;

      if (hasSlKhongHT) {
        soLuongKhongHoanThanh = Number(src.chamDiemSoLuong_KhongHoanThanh);
        soLuongHoanThanh = hasSlHT ? Number(src.chamDiemSoLuong_HoanThanh) : Math.max(0, diemCoSo - soLuongKhongHoanThanh);
      } else if (hasSlHT) {
        soLuongHoanThanh = Number(src.chamDiemSoLuong_HoanThanh);
        soLuongKhongHoanThanh = Math.max(0, diemCoSo - soLuongHoanThanh);
      } else if (src?.soLuongKhongHoanThanh !== undefined || src?.soLuongHoanThanh !== undefined) {
        soLuongKhongHoanThanh = Number(src.soLuongKhongHoanThanh ?? 0);
        soLuongHoanThanh = src.soLuongHoanThanh !== undefined ? Number(src.soLuongHoanThanh) : Math.max(0, diemCoSo - soLuongKhongHoanThanh);
      } else if (fb) {
        soLuongHoanThanh = fb.soLuongHoanThanh ?? (diemCoSo > 0 ? diemCoSo : 0);
        soLuongKhongHoanThanh = fb.soLuongKhongHoanThanh ?? Math.max(0, diemCoSo - soLuongHoanThanh);
      } else {
        soLuongHoanThanh = diemCoSo > 0 ? diemCoSo : 0;
        soLuongKhongHoanThanh = 0;
      }
      const soLuongPhanTram = diemCoSo > 0 ? Math.max(0, Math.min(100, (soLuongHoanThanh / diemCoSo) * 100)) : 100;

      const hasClKhongDat = src?.chamDiemChatLuong_KhongDat !== undefined && src?.chamDiemChatLuong_KhongDat !== null && src?.chamDiemChatLuong_KhongDat !== "";
      const hasClConLai = src?.chamDiemChatLuong_SoDiemConLai !== undefined && src?.chamDiemChatLuong_SoDiemConLai !== null && src?.chamDiemChatLuong_SoDiemConLai !== "";

      let soLanKhongDat: number;
      let chatLuongConLai: number;

      if (hasClKhongDat) {
        soLanKhongDat = Number(src.chamDiemChatLuong_KhongDat);
        chatLuongConLai = hasClConLai ? Number(src.chamDiemChatLuong_SoDiemConLai) : Math.max(0, diemCoSo - (soLanKhongDat * 0.25 * diemCoSo));
      } else if (hasClConLai) {
        chatLuongConLai = Number(src.chamDiemChatLuong_SoDiemConLai);
        soLanKhongDat = diemCoSo > 0 ? Math.max(0, (diemCoSo - chatLuongConLai) / (0.25 * diemCoSo)) : 0;
      } else if (src?.soLanKhongDat !== undefined || src?.chatLuongConLai !== undefined) {
        soLanKhongDat = Number(src.soLanKhongDat ?? 0);
        chatLuongConLai = src.chatLuongConLai !== undefined ? Number(src.chatLuongConLai) : Math.max(0, diemCoSo - (soLanKhongDat * 0.25 * diemCoSo));
      } else if (fb) {
        soLanKhongDat = fb.soLanKhongDat ?? 0;
        chatLuongConLai = fb.chatLuongConLai ?? Math.max(0, diemCoSo - (soLanKhongDat * 0.25 * diemCoSo));
      } else {
        soLanKhongDat = 0;
        chatLuongConLai = diemCoSo > 0 ? diemCoSo : 0;
      }
      const chatLuongPhanTram = diemCoSo > 0 ? Math.max(0, Math.min(100, (chatLuongConLai / diemCoSo) * 100)) : 100;

      const hasTdCham = src?.chamDiemTienDo_KhongDat !== undefined && src?.chamDiemTienDo_KhongDat !== null && src?.chamDiemTienDo_KhongDat !== "";
      const hasTdConLai = src?.chamDiemTienDo_SoDiemConLai !== undefined && src?.chamDiemTienDo_SoDiemConLai !== null && src?.chamDiemTienDo_SoDiemConLai !== "";

      let soLanCham: number;
      let tienDoConLai: number;

      if (hasTdCham) {
        soLanCham = Number(src.chamDiemTienDo_KhongDat);
        tienDoConLai = hasTdConLai ? Number(src.chamDiemTienDo_SoDiemConLai) : Math.max(0, diemCoSo - (soLanCham * 0.25 * diemCoSo));
      } else if (hasTdConLai) {
        tienDoConLai = Number(src.chamDiemTienDo_SoDiemConLai);
        soLanCham = diemCoSo > 0 ? Math.max(0, (diemCoSo - tienDoConLai) / (0.25 * diemCoSo)) : 0;
      } else if (src?.soLanCham !== undefined || src?.tienDoConLai !== undefined) {
        soLanCham = Number(src.soLanCham ?? 0);
        tienDoConLai = src.tienDoConLai !== undefined ? Number(src.tienDoConLai) : Math.max(0, diemCoSo - (soLanCham * 0.25 * diemCoSo));
      } else if (fb) {
        soLanCham = fb.soLanCham ?? 0;
        tienDoConLai = fb.tienDoConLai ?? Math.max(0, diemCoSo - (soLanCham * 0.25 * diemCoSo));
      } else {
        soLanCham = 0;
        tienDoConLai = diemCoSo > 0 ? diemCoSo : 0;
      }
      const tienDoPhanTram = diemCoSo > 0 ? Math.max(0, Math.min(100, (tienDoConLai / diemCoSo) * 100)) : 100;

      return {
        soLuongHoanThanh,
        soLuongKhongHoanThanh,
        soLuongPhanTram,
        soLanKhongDat,
        chatLuongConLai,
        chatLuongPhanTram,
        soLanCham,
        tienDoConLai,
        tienDoPhanTram,
        ghiChu: src?.ghiChuGiaTrinh || src?.ghiChu || fb?.ghiChu || "",
        tenNguoiDanhGia: src?.tenNguoiDanhGia ?? src?.TenNguoiDanhGia ?? fb?.tenNguoiDanhGia ?? "",
        userName: src?.userName ?? src?.UserName ?? fb?.userName ?? "",
        tenChucVu: src?.tenChucVu ?? src?.TenChucVu ?? fb?.tenChucVu ?? "",
      };
    };

    const scoresByRoleObj: Record<string, any> = {};
    let prevRoleScoreObj: any = undefined;
    activeRoles.forEach((role) => {
      const normRole = normalizeRoleKey(role.code);
      const isRoleEditing = !viewOnly && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia).toLowerCase() === normRole.toLowerCase() : role.code === "CaNhan");
      const roleData = product?.scoresByRole?.[normRole] || product?.scoresByRole?.[role.code] || (normRole === "PhoTruongPhong" ? (product?.phoPhong || product?.scoresByRole?.["PhoPhong"]) : (normRole === "CaNhan" ? (product?.caNhan || product) : product?.[role.code.toLowerCase()]));
      const hasDirectData = Boolean(roleData && (roleData.chamDiemSoLuong_HoanThanh !== undefined || roleData.soLuongHoanThanh !== undefined));
      const scoreObj = (hasDirectData || normRole === "CaNhan" || isRoleEditing)
        ? calcScoresForObj(roleData, isRoleEditing ? prevRoleScoreObj : undefined)
        : undefined;
      scoresByRoleObj[normRole] = scoreObj;
      scoresByRoleObj[role.code] = scoreObj;
      if (scoreObj) {
        prevRoleScoreObj = scoreObj;
      }
    });

    const currentRoleCode = normalizeRoleKey(effectiveRoleCode || vaiTroDanhGia || "CaNhan");
    const activeScores = scoresByRoleObj[currentRoleCode] || scoresByRoleObj["CaNhan"] || calcScoresForObj(product);

    return {
      diemBoTieuChi,
      diemCoSo,
      diemHeSo: chucVuHeSo !== null ? diemCoSo : null,
      scoresByRole: scoresByRoleObj,
      caNhan: scoresByRoleObj["CaNhan"],
      phoPhong: scoresByRoleObj["PhoTruongPhong"],
      soLuongHoanThanh: activeScores.soLuongHoanThanh,
      soLuongKhongHoanThanh: activeScores.soLuongKhongHoanThanh,
      soLuongPhanTram: activeScores.soLuongPhanTram,
      soLanKhongDat: activeScores.soLanKhongDat,
      chatLuongConLai: activeScores.chatLuongConLai,
      chatLuongPhanTram: activeScores.chatLuongPhanTram,
      soLanCham: activeScores.soLanCham,
      tienDoConLai: activeScores.tienDoConLai,
      tienDoPhanTram: activeScores.tienDoPhanTram,
    };
  };

  const mapNhiemVuToTableItems = (nv: any, index: number, sttPrefix: string) => {
    const products = nv.danhSachDauRa && nv.danhSachDauRa.length > 0 ? nv.danhSachDauRa : [{}];
    const isSingleProduct = products.length === 1;
    return products.map((sp: any, i: number) => {
      const scores = getProductScoreValues(sp, (i === 0 && isSingleProduct) ? nv.diemBoTieuChi : undefined);
      return ({
        key: `item-${nv.id || 'inline'}-${index}-${i}`,
        stt: `${sttPrefix}${index + 1}`,
        inlineTaskId: nv.id,
        mieuTa: nv.tenNhiemVuDayDu || nv.tenNhiemVuRutGon || "",
        sanPham: sp.tenSanPhamDauRa || (i === 0 && isSingleProduct ? nv.ketQuaXuLyMoiNhat || "" : ""),
        canCu: sp.tenTieuChi || (nv.boTieuChiList?.[i] || (isSingleProduct ? nv.boTieuChiList?.join(', ') : "")) || sp.tieuChiId || "",
        diemBoTieuChi: formatDisplayScore(sp.diemTheoBoTieuChi ?? (i === 0 && isSingleProduct ? nv.diemBoTieuChi : "") ?? ""),
        diemHeSo: formatDisplayScore(scores.diemHeSo),
        scoresByRole: scores.scoresByRole,
        caNhanScores: scores.caNhan,
        phoPhongScores: scores.phoPhong,
        slHoanThanh: formatDisplayScore(scores.soLuongHoanThanh ?? ""),
        slKhongHoanThanh: formatDisplayScore(scores.soLuongKhongHoanThanh),
        slDiemPhanTram: formatPercent(scores.soLuongPhanTram),
        clSoLanKhongDat: formatDisplayScore(scores.soLanKhongDat ?? ""),
        clDiemConLai: formatDisplayScore(scores.chatLuongConLai),
        clDiemPhanTram: formatPercent(scores.chatLuongPhanTram),
        tdSoLanCham: formatDisplayScore(scores.soLanCham ?? ""),
        tdDiemConLai: formatDisplayScore(scores.tienDoConLai),
        tdDiemPhanTram: formatPercent(scores.tienDoPhanTram),
        ghiChu: sp.ghiChuGiaTrinh || (i === 0 && isSingleProduct ? nv.ghiChuGiaTrinh : ""),
        taiLieu: normalizeProductAttachments(sp),
        rowSpan: i === 0 ? products.length : 0,

        isEditing: nv.isEditing,
        taskData: nv,
        productIndex: i,
        isLastProductInTask: i === products.length - 1,
        totalProductsInTask: products.length,
      });
    });
  };

  const renderTotalRow = (key: string, title: React.ReactNode, items: any[], extraAction?: React.ReactNode) => {
    const allProducts = items.flatMap(item => (item.danhSachDauRa && item.danhSachDauRa.length > 0)
      ? item.danhSachDauRa
      : [{ diemTheoBoTieuChi: item.diemBoTieuChi }]);
    const productScores = allProducts.map((product, index) => getProductScoreValues(product, product.diemTheoBoTieuChi ?? (index === 0 ? undefined : 0)));
    const sumCanCu = productScores.reduce((sum, score) => sum + score.diemBoTieuChi, 0);
    const sumBoTieuChi = sumCanCu;
    const sumHeSo = chucVuHeSo !== null ? productScores.reduce((sum, score) => sum + score.diemCoSo, 0) : 0;
    const baseDiem = chucVuHeSo !== null ? sumHeSo : sumBoTieuChi;

    if (effectiveMergedRoleView) {
      const roleTotals = activeRoles.map((role) => {
        const isCaNhan = normalizeRoleKey(role.code) === "CaNhan";
        const hasScores = productScores.some((score) => score.scoresByRole?.[role.code]?.soLuongHoanThanh !== undefined);
        const isRoleEditing = !viewOnly && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia).toLowerCase() === normalizeRoleKey(role.code).toLowerCase() : false);

        if (!isCaNhan && !hasScores && !isRoleEditing) {
          return {
            role,
            hasEvaluated: false,
            sumSlHT: null, sumSlKHT: null, slPercent: null,
            sumClKD: null, sumClCL: null, clPercent: null,
            sumTdCM: null, sumTdCL: null, tdPercent: null,
          };
        }

        const sumSlHT = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.soLuongHoanThanh ?? 0), 0);
        const sumSlKHT = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.soLuongKhongHoanThanh ?? 0), 0);
        const slPercent = baseDiem ? Math.max(0, (sumSlHT / baseDiem) * 100) : 0;

        const sumClKD = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.soLanKhongDat ?? 0), 0);
        const sumClCL = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.chatLuongConLai ?? 0), 0);
        const clPercent = baseDiem ? Math.max(0, (sumClCL / baseDiem) * 100) : 0;

        const sumTdCM = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.soLanCham ?? 0), 0);
        const sumTdCL = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.tienDoConLai ?? 0), 0);
        const tdPercent = baseDiem ? Math.max(0, (sumTdCL / baseDiem) * 100) : 0;

        return {
          role,
          hasEvaluated: true,
          sumSlHT, sumSlKHT, slPercent,
          sumClKD, sumClCL, clPercent,
          sumTdCM, sumTdCL, tdPercent,
        };
      });

      return {
        key,
        stt: (
          <div style={{ display: "flex", alignItems: "center", justifyContent: extraAction ? "space-between" : "center", padding: "0 8px" }}>
            <strong>{title}</strong>
            {extraAction}
          </div>
        ),
        mieuTa: "",
        sanPham: "",
        canCu: <strong>{formatDisplayScore(sumCanCu)}</strong>,
        diemBoTieuChi: <strong>{formatDisplayScore(sumBoTieuChi)}</strong>,
        ...(chucVuHeSo !== null ? { diemHeSo: <strong>{formatDisplayScore(sumHeSo)}</strong> } : {}),
        nguoiDanhGia: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {activeRoles.map((role, idx) => (
              <React.Fragment key={role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: role.color, fontWeight: 600 }}>{role.shortLabel || role.name}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        slHoanThanh: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.sumSlHT !== null ? formatDisplayScore(rt.sumSlHT) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        slKhongHoanThanh: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.sumSlKHT !== null ? formatDisplayScore(rt.sumSlKHT) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        slDiemPhanTram: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.slPercent !== null ? formatPercent(rt.slPercent) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        clSoLanKhongDat: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.sumClKD !== null ? formatDisplayScore(rt.sumClKD) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        clDiemConLai: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.sumClCL !== null ? formatDisplayScore(rt.sumClCL) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        clDiemPhanTram: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.clPercent !== null ? formatPercent(rt.clPercent) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        tdSoLanCham: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.sumTdCM !== null ? formatDisplayScore(rt.sumTdCM) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        tdDiemConLai: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.sumTdCL !== null ? formatDisplayScore(rt.sumTdCL) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
        tdDiemPhanTram: (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", alignItems: "center" }}>
            {roleTotals.map((rt, idx) => (
              <React.Fragment key={rt.role.code}>
                {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", width: "100%", margin: "1px 0", opacity: 0.8 }} />}
                <span style={{ color: rt.hasEvaluated ? rt.role.color : "#9ca3af", fontWeight: 600 }}>{rt.tdPercent !== null ? formatPercent(rt.tdPercent) : "—"}</span>
              </React.Fragment>
            ))}
          </div>
        ),
      };
    }

    const currentRoleCode = normalizeRoleKey(effectiveRoleCode || vaiTroDanhGia || "CaNhan");
    const sumSlHoanThanh = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[currentRoleCode]?.soLuongHoanThanh ?? score.soLuongHoanThanh ?? 0), 0);
    const sumSlKhongHoanThanh = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[currentRoleCode]?.soLuongKhongHoanThanh ?? score.soLuongKhongHoanThanh ?? 0), 0);
    const sumClKhongDat = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[currentRoleCode]?.soLanKhongDat ?? score.soLanKhongDat ?? 0), 0);
    const sumClConLai = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[currentRoleCode]?.chatLuongConLai ?? score.chatLuongConLai ?? 0), 0);
    const sumTdCham = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[currentRoleCode]?.soLanCham ?? score.soLanCham ?? 0), 0);
    const sumTdConLai = productScores.reduce((sum, score) => sum + (score.scoresByRole?.[currentRoleCode]?.tienDoConLai ?? score.tienDoConLai ?? 0), 0);
    const slDiemPhanTram = baseDiem ? Math.max(0, (sumSlHoanThanh / baseDiem) * 100) : 0;
    const clDiemPhanTram = baseDiem ? Math.max(0, (sumClConLai / baseDiem) * 100) : 0;
    const tdDiemPhanTram = baseDiem ? Math.max(0, (sumTdConLai / baseDiem) * 100) : 0;

    return {
      key,
      stt: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: extraAction ? "space-between" : "center", padding: "0 8px" }}>
          <strong>{title}</strong>
          {extraAction}
        </div>
      ),
      mieuTa: "",
      sanPham: "",
      canCu: <strong>{formatDisplayScore(sumCanCu)}</strong>,
      diemBoTieuChi: <strong>{formatDisplayScore(sumBoTieuChi)}</strong>,
      ...(chucVuHeSo !== null ? { diemHeSo: <strong>{formatDisplayScore(sumHeSo)}</strong> } : {}),
      nguoiDanhGia: "",
      slHoanThanh: <strong>{formatDisplayScore(sumSlHoanThanh)}</strong>,
      slKhongHoanThanh: <strong>{formatDisplayScore(sumSlKhongHoanThanh)}</strong>,
      slDiemPhanTram: <strong>{baseDiem ? formatPercent(slDiemPhanTram) : ""}</strong>,
      clSoLanKhongDat: <strong>{formatDisplayScore(sumClKhongDat)}</strong>,
      clDiemConLai: <strong>{formatDisplayScore(sumClConLai)}</strong>,
      clDiemPhanTram: <strong>{baseDiem ? formatPercent(clDiemPhanTram) : ""}</strong>,
      tdSoLanCham: <strong>{formatDisplayScore(sumTdCham)}</strong>,
      tdDiemConLai: <strong>{formatDisplayScore(sumTdConLai)}</strong>,
      tdDiemPhanTram: <strong>{baseDiem ? formatPercent(tdDiemPhanTram) : ""}</strong>,
    };
  };

  const isEvaluatingPhoPhong = vaiTroDanhGia === "PhoTruongPhong";

  const columns = React.useMemo<any[]>(() => [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 15,
      align: "center",
      render: (text: any, record: any) => {
        if (record.key?.startsWith('group-total')) {
          return { children: text, props: { colSpan: 3 } };
        }
        return { children: <strong style={{ whiteSpace: "nowrap" }}>{text}</strong>, props: { colSpan: 1, rowSpan: record.rowSpan ?? 1 } };
      },
    },
    {
      title: "Miêu tả công việc",
      dataIndex: "mieuTa",
      key: "mieuTa",
      width: 160,
      render: (text: any, record: any) => {
        if (record.key?.startsWith('group-total')) {
          return { props: { colSpan: 0 } };
        }

        let children = text;
        if (record.isEditing && canAddEditTasks && record.productIndex === 0) {
          children = (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                <InlineInput type="textarea" autoSize placeholder="Miêu tả" value={record.taskData?.tenNhiemVuDayDu || record.taskData?.tenNhiemVuRutGon || ""} onChange={(val: any) => handleInlineTaskChange(record.inlineTaskId, 'tenNhiemVuDayDu', val)} />
                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveInlineTask(record.inlineTaskId)} title="Xóa nhiệm vụ này" />
              </div>
            </div>
          );
        } else if (!record.isEditing && record.productIndex === 0 && canAddEditTasks) {
          children = (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ flex: 1 }}>{text}</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <Button size="small" type="text" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => handleEditTaskInline(record.taskData)} title="Cập nhật nhiệm vụ" />
                <Popconfirm title="Bạn có chắc chắn muốn xóa nhiệm vụ này không?" onConfirm={() => handleDeleteTask(record.taskData.id)}>
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} title="Xóa nhiệm vụ" />
                </Popconfirm>
              </div>
            </div>
          );
        }
        return { children, props: { rowSpan: record.rowSpan ?? 1 } };
      },
    },
    {
      title: "Sản phẩm đầu ra",
      dataIndex: "sanPham",
      key: "sanPham",
      width: 190,
      render: (text: any, record: any) => {
        if (record.key?.startsWith('group-total')) {
          return { props: { colSpan: 0 } };
        }

        const isDataItem = record.key?.startsWith('item-');
        if (!isDataItem) {
          return text;
        }

        const isEditing = record.isEditing && canAddEditTasks;
        const isLastProductInTask = record.isLastProductInTask;
        const totalProducts = record.totalProductsInTask ?? record.taskData?.danhSachDauRa?.length ?? 1;

        const hasMieuTa = !!(record.taskData?.tenNhiemVuDayDu || record.taskData?.tenNhiemVuRutGon || (typeof record.mieuTa === 'string' ? record.mieuTa : '') || "").trim();
        const hasEmptyProductInTask = record.taskData?.danhSachDauRa?.some((sp: any) => !(sp.tenSanPhamDauRa || "").trim()) ?? !(typeof text === 'string' && text.trim());
        const isAddProductDisabled = !hasMieuTa || hasEmptyProductInTask;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <InlineInput
                    type="textarea"
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    placeholder="Tên SP"
                    value={text}
                    onChange={(val: any) => handleInlineProductChange(record.inlineTaskId, record.productIndex, 'tenSanPhamDauRa', val)}
                  />
                ) : (
                  <span
                    style={{ cursor: canAddEditTasks ? 'pointer' : 'default', color: canAddEditTasks ? '#1890ff' : 'inherit', textDecoration: canAddEditTasks ? 'underline' : 'none' }}
                    onClick={() => {
                      if (canAddEditTasks && !isEditing) {
                        handleEditTaskInline(record.taskData);
                      }
                    }}
                    title={canAddEditTasks ? "Nhấn để chỉnh sửa tên sản phẩm" : undefined}
                  >
                    {text || (canAddEditTasks ? '(Nhập tên SP)' : '-')}
                  </span>
                )}
              </div>

              {canAddEditTasks && (
                <Tooltip title="Mở chi tiết chấm điểm sản phẩm">
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ fontSize: '11px', padding: '0 6px', height: '22px', backgroundColor: '#0f766e', borderColor: '#0f766e', color: '#ffffff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isEditing) {
                        handleEditTaskInline(record.taskData);
                      }
                      handleOpenProductModal(record.inlineTaskId, record.productIndex, record.taskData);
                    }}
                  />
                </Tooltip>
              )}

              {canAddEditTasks && totalProducts > 1 && (
                <Tooltip title="Xóa sản phẩm này">
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    style={{ padding: '0 4px', height: '22px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isEditing) {
                        handleEditTaskInline(record.taskData);
                      }
                      handleRemoveInlineProduct(record.inlineTaskId, record.productIndex);
                    }}
                  />
                </Tooltip>
              )}
            </div>

            {canAddEditTasks && isLastProductInTask && (
              <div style={{ marginTop: '2px' }}>
                <Tooltip title={isAddProductDisabled ? "Vui lòng nhập Miêu tả công việc và Tên sản phẩm trước khi thêm sản phẩm mới" : ""}>
                  <span style={{ display: 'block', width: '100%' }}>
                    <Button
                      size="small"
                      type="dashed"
                      icon={<PlusOutlined />}
                      disabled={isAddProductDisabled}
                      style={{
                        fontSize: '11px',
                        width: '100%',
                        color: isAddProductDisabled ? '#8c8c8c' : '#0f766e',
                        borderColor: isAddProductDisabled ? '#d9d9d9' : '#0f766e',
                        backgroundColor: '#ffffff',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isEditing) {
                          handleEditTaskInline(record.taskData);
                        }
                        handleAddInlineProduct(record.inlineTaskId);
                      }}
                    >
                      Thêm sản phẩm
                    </Button>
                  </span>
                </Tooltip>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Căn cứ chấm theo Bộ tiêu chí",
      dataIndex: "canCu",
      key: "canCu",
      width: 200,
      align: "center",
      render: (text: any, record: any) => {
        if (!record.key?.startsWith('item-')) return text;
        if (record.isEditing && canAddEditTasks) {
          return (
            <TieuChiSuggestor
              value={record?.taskData?.danhSachDauRa?.[record?.productIndex]?.tenTieuChi || record?.taskData?.danhSachDauRa?.[record?.productIndex]?.tieuChiId || ""}
              onClick={() => {
                if (record) {
                  setActiveTaskId(record.inlineTaskId);
                  setActiveProductIndex(record.productIndex);
                  setChonTieuChiVisible(true);
                }
              }}
              onClear={() => {
                if (record) {
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'tieuChiId', null);
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'tenTieuChi', '');
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'diemTheoBoTieuChi', 0);
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_HoanThanh', 0);
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_KhongHoanThanh', 0);
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_Diem', 0);
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemChatLuong_SoDiemConLai', 0);
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemChatLuong_Diem', 0);
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemTienDo_SoDiemConLai', 0);
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemTienDo_Diem', 0);
                }
              }}
            />
          );
        }
        return (
          <span
            style={{ cursor: canAddEditTasks ? 'pointer' : 'default', color: canAddEditTasks ? '#1890ff' : 'inherit' }}
            onClick={() => {
              if (canAddEditTasks) {
                if (!record.isEditing) {
                  handleEditTaskInline(record.taskData);
                }
                setActiveTaskId(record.inlineTaskId);
                setActiveProductIndex(record.productIndex);
                setChonTieuChiVisible(true);
              }
            }}
            title={canAddEditTasks ? "Nhấn để chọn tiêu chí" : undefined}
          >
            {text || (canAddEditTasks ? "(Chọn tiêu chí)" : "-")}
          </span>
        );
      }
    },
    {
      title: "Điểm Bộ tiêu chí",
      dataIndex: "diemBoTieuChi",
      key: "diemBoTieuChi",
      width: 80,
      align: "center",
      render: (text: any, record: any) => {
        if (!record.key?.startsWith('item-')) return text;
        if (record.isEditing && canAddEditTasks) {
          return (
            <InlineInputNumber
              disabled={true}
              value={record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi}
              onChange={(v: any) => handleInlineProductChange(record.inlineTaskId, record.productIndex, 'diemTheoBoTieuChi', v)}
              onCalculate={() => {
                handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_Diem", "chamDiemSoLuong_Diem");
                handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemChatLuong_Diem", "chamDiemChatLuong_Diem");
                handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemTienDo_Diem", "chamDiemTienDo_Diem");
              }}
            />
          );
        }
        return text;
      }
    },
    ...(chucVuHeSo !== null ? [{
      title: `Điểm theo hệ số lãnh đạo (${tenChucVuLanhDao || 'Lãnh đạo'} = ${formatDisplayScore(chucVuHeSo)} x Điểm Bộ tiêu chí)`,
      dataIndex: "diemHeSo",
      key: "diemHeSo",
      width: 90,
      align: "center",
      render: (text: any, record: any) => {
        if (!record.key?.startsWith('item-')) return text;
        if (record.isEditing && editEnabled) {
          const numVal = text !== null && text !== undefined && text !== "" ? Number(text) : undefined;
          return <InputNumber style={{ width: '100%', opacity: 0.65 }} disabled value={Number.isFinite(numVal) ? Number(numVal!.toFixed(2)) : text} precision={2} size="small" />;
        }
        return text;
      }
    }] : []),
    {
      title: "Người đánh giá",
      dataIndex: "nguoiDanhGia",
      key: "nguoiDanhGia",
      width: effectiveMergedRoleView ? 105 : 120,
      align: "center",
      render: (text: any, record: any) => {
        if (record.key?.startsWith('group-total')) {
          return text;
        }
        if (!record.key?.startsWith('item-')) return text;

        if (effectiveMergedRoleView) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', justifyContent: 'center' }}>
              {activeRoles.map((role, idx) => (
                <React.Fragment key={role.code}>
                  {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', width: '100%', margin: '1px 0', opacity: 0.8 }} />}
                  <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: role.color, fontWeight: 600, fontSize: '11.5px' }}>{role.shortLabel || role.name}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          );
        }

        const currentRoleInfo = activeRoles.find(r => r.code === effectiveRoleCode) || ALL_ROLES_CONFIG[effectiveRoleCode] || { shortLabel: effectiveRoleCode, name: effectiveRoleCode, color: '#1d4ed8' };

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <span style={{ color: currentRoleInfo.color, fontWeight: 600, fontSize: '12px' }}>
              {currentRoleInfo.shortLabel || currentRoleInfo.name}
            </span>
            <Tooltip title="Xem chi tiết các cấp đánh giá và điểm số">
              <Button
                type="text"
                shape="circle"
                size="small"
                icon={<InfoCircleOutlined style={{ color: '#0284c7', fontSize: '14px' }} />}
                style={{ width: '20px', height: '20px', minWidth: '20px', padding: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEvaluatorsModal(record);
                }}
              />
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: "Chấm điểm số lượng",
      children: [
        {
          title: "Hoàn thành", dataIndex: "slHoanThanh", key: "slHoanThanh", align: "center", width: 100, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;

            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.soLuongHoanThanh;
                    const isCurrentEditingRole = editEnabled && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia).toLowerCase() === normalizeRoleKey(role.code).toLowerCase() : role.code === "CaNhan");

                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isCurrentEditingRole ? (
                            <InlineInputNumber
                              precision={isMultiCap ? (Number.isInteger(Number(maxScore)) ? 0 : 1) : 2}
                              step={isMultiCap ? 1 : 0.01}
                              clampToBounds={isMultiCap}
                              min={0}
                              max={maxScore}
                              placeholder="0"
                              value={roleScore !== undefined && roleScore !== null ? Number(roleScore) : (maxScore || undefined)}
                              style={{ width: '100%', borderColor: role.color }}
                              onChange={(v: any) => {
                                const hoanThanh = Number(v ?? maxScore);
                                const khongHoanThanh = Math.max(0, maxScore - hoanThanh);
                                const diemPhanTram = maxScore > 0 ? (hoanThanh / maxScore) * 100 : 0;
                                handleInlineProductChange(record.inlineTaskId, record.productIndex, {
                                  chamDiemSoLuong_HoanThanh: hoanThanh,
                                  chamDiemSoLuong_KhongHoanThanh: Number(khongHoanThanh.toFixed(2)),
                                  chamDiemSoLuong_Diem: Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)),
                                });
                              }}
                              onCalculate={async () => {
                                await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_KhongHoanThanh", "chamDiemSoLuong_KhongHoanThanh");
                                await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_Diem", "chamDiemSoLuong_Diem");
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: (roleScore !== undefined && roleScore !== null) ? role.color : "#9ca3af" }}>{(roleScore !== undefined && roleScore !== null) ? (formatDisplayScore(roleScore) || '0') : '—'}</span>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }

            return editEnabled ? (
              <InlineInputNumber
                precision={isMultiCap ? (Number.isInteger(Number(maxScore)) ? 0 : 1) : 2}
                step={isMultiCap ? 1 : 0.01}
                clampToBounds={isMultiCap}
                min={0}
                max={maxScore}
                placeholder="HT"
                value={record.scoresByRole?.[effectiveRoleCode]?.soLuongHoanThanh !== undefined && record.scoresByRole?.[effectiveRoleCode]?.soLuongHoanThanh !== null ? Number(record.scoresByRole[effectiveRoleCode].soLuongHoanThanh) : (text !== "" && text !== undefined && text !== null ? Number(text) : (maxScore || undefined))}
                style={{ width: '100%' }}
                onChange={(v: any) => {
                  const hoanThanh = Number(v ?? maxScore);
                  const khongHoanThanh = Math.max(0, maxScore - hoanThanh);
                  const diemPhanTram = maxScore > 0 ? (hoanThanh / maxScore) * 100 : 0;
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, {
                    chamDiemSoLuong_HoanThanh: hoanThanh,
                    chamDiemSoLuong_KhongHoanThanh: Number(khongHoanThanh.toFixed(2)),
                    chamDiemSoLuong_Diem: Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)),
                  });
                }}
                onCalculate={async () => {
                  await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_KhongHoanThanh", "chamDiemSoLuong_KhongHoanThanh");
                  await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_Diem", "chamDiemSoLuong_Diem");
                }}
              />
            ) : text;
          }
        },
        {
          title: <span>Không hoàn thành {renderInfoIcon("Không hoàn thành (Số lượng)",
            <div>
              <strong>Công thức: {chucVuHeSo !== null ? "(8) = (6) - (7)" : "(7) = (5) - (6)"}</strong><br /><br />
              Trong đó:<br />
              {chucVuHeSo !== null ? "(6): Điểm theo hệ số lãnh đạo" : "(5): Điểm theo bộ tiêu chí"}<br />
              {chucVuHeSo !== null ? "(7): Số lượng Hoàn thành" : "(6): Số lượng Hoàn thành"}<br />
              {chucVuHeSo !== null ? "(8): Số lượng không hoàn thành" : "(7): Số lượng không hoàn thành"}
            </div>
          )}</span>, dataIndex: "slKhongHoanThanh", key: "slKhongHoanThanh", align: "center", width: 100, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;

            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.soLuongKhongHoanThanh;
                    const isCurrentEditingRole = editEnabled && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia) === normalizeRoleKey(role.code) : role.code === "CaNhan");

                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isCurrentEditingRole ? (
                            <InlineInputNumber
                              precision={isMultiCap ? (Number.isInteger(Number(maxScore)) ? 0 : 1) : 2}
                              step={isMultiCap ? 1 : 0.01}
                              clampToBounds={isMultiCap}
                              min={0}
                              max={maxScore}
                              placeholder="0"
                              value={roleScore !== undefined && roleScore !== null ? Number(roleScore) : 0}
                              style={{ width: '100%', borderColor: role.color }}
                              onChange={(v: any) => {
                                const khongHoanThanh = Number(v ?? 0);
                                const hoanThanh = Math.max(0, maxScore - khongHoanThanh);
                                const diemPhanTram = maxScore > 0 ? (hoanThanh / maxScore) * 100 : 0;
                                handleInlineProductChange(record.inlineTaskId, record.productIndex, {
                                  chamDiemSoLuong_KhongHoanThanh: khongHoanThanh,
                                  chamDiemSoLuong_HoanThanh: Number(hoanThanh.toFixed(2)),
                                  chamDiemSoLuong_Diem: Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)),
                                });
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: (roleScore !== undefined && roleScore !== null) ? role.color : "#9ca3af" }}>{(roleScore !== undefined && roleScore !== null) ? (formatDisplayScore(roleScore) || '0') : '—'}</span>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }

            return editEnabled ? (
              <InlineInputNumber
                precision={isMultiCap ? (Number.isInteger(Number(maxScore)) ? 0 : 1) : 2}
                step={isMultiCap ? 1 : 0.01}
                clampToBounds={isMultiCap}
                min={0}
                max={maxScore}
                placeholder="0"
                value={record.scoresByRole?.[effectiveRoleCode]?.soLuongKhongHoanThanh !== undefined && record.scoresByRole?.[effectiveRoleCode]?.soLuongKhongHoanThanh !== null ? Number(record.scoresByRole[effectiveRoleCode].soLuongKhongHoanThanh) : (text !== "" && text !== undefined && text !== null ? Number(text) : 0)}
                style={{ width: '100%' }}
                onChange={(v: any) => {
                  const khongHoanThanh = Number(v ?? 0);
                  const hoanThanh = Math.max(0, maxScore - khongHoanThanh);
                  const diemPhanTram = maxScore > 0 ? (hoanThanh / maxScore) * 100 : 0;
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, {
                    chamDiemSoLuong_KhongHoanThanh: khongHoanThanh,
                    chamDiemSoLuong_HoanThanh: Number(hoanThanh.toFixed(2)),
                    chamDiemSoLuong_Diem: Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)),
                  });
                }}
                onCalculate={() => handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_Diem", "chamDiemSoLuong_Diem")}
              />
            ) : text;
          }
        },
        {
          title: <span>Điểm (%) {renderInfoIcon("Điểm (%) Số lượng",
            <div>
              <strong>Công thức: {chucVuHeSo !== null ? "(9) = (7) / (6) * 100%" : "(8) = (6) / (5) * 100%"}</strong><br /><br />
              Trong đó:<br />
              {chucVuHeSo !== null ? "(6): Điểm theo hệ số lãnh đạo" : "(5): Điểm theo Bộ tiêu chí"}<br />
              {chucVuHeSo !== null ? "(7): Số lượng Hoàn thành" : "(6): Số lượng Hoàn thành"}<br />
              {chucVuHeSo !== null ? "(9): Điểm (%) Số lượng" : "(8): Điểm (%) Số lượng"}
            </div>
          )}</span>, dataIndex: "slDiemPhanTram", key: "slDiemPhanTram", align: "center", width: 90, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.soLuongPhanTram;
                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 600, color: (roleScore !== undefined && roleScore !== null) ? role.color : "#9ca3af" }}>{(roleScore !== undefined && roleScore !== null) ? (formatPercent(roleScore) || '100%') : '—'}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }
            return text;
          }
        },
      ],
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          Chấm điểm chất lượng<br />
          <span style={{ color: "#ffd666", fontWeight: "normal", fontSize: "11px" }}>(Trừ 25%/lần)</span>
        </div>
      ),
      children: [
        {
          title: "Không đạt", dataIndex: "clSoLanKhongDat", key: "clSoLanKhongDat", align: "center", width: 100, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;

            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.soLanKhongDat;
                    const isCurrentEditingRole = editEnabled && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia) === normalizeRoleKey(role.code) : role.code === "CaNhan");

                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isCurrentEditingRole ? (
                            <InlineInputNumber
                              precision={isMultiCap ? (Number.isInteger(Number(maxScore)) ? 0 : 1) : 2}
                              step={isMultiCap ? 1 : 0.01}
                              clampToBounds={isMultiCap}
                              min={0}
                              max={maxScore}
                              placeholder="0"
                              value={roleScore !== undefined && roleScore !== null ? Number(roleScore) : 0}
                              style={{ width: '100%', borderColor: role.color }}
                              onChange={(v: any) => {
                                const soLanKhongDat = Number(v ?? 0);
                                const conLai = Math.max(0, maxScore - (soLanKhongDat * 0.25 * maxScore));
                                const diemPhanTram = maxScore > 0 ? (conLai / maxScore) * 100 : 0;
                                handleInlineProductChange(record.inlineTaskId, record.productIndex, {
                                  chamDiemChatLuong_KhongDat: soLanKhongDat,
                                  chamDiemChatLuong_SoDiemConLai: Number(conLai.toFixed(2)),
                                  chamDiemChatLuong_Diem: Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)),
                                });
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: (roleScore !== undefined && roleScore !== null) ? role.color : "#9ca3af" }}>{(roleScore !== undefined && roleScore !== null) ? (formatDisplayScore(roleScore) || '0') : '—'}</span>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }

            return editEnabled ? (
              <InlineInputNumber
                precision={isMultiCap ? (Number.isInteger(Number(maxScore)) ? 0 : 1) : 2}
                step={isMultiCap ? 1 : 0.01}
                clampToBounds={isMultiCap}
                min={0}
                max={maxScore}
                placeholder="0"
                value={record.scoresByRole?.[effectiveRoleCode]?.soLanKhongDat !== undefined && record.scoresByRole?.[effectiveRoleCode]?.soLanKhongDat !== null ? Number(record.scoresByRole[effectiveRoleCode].soLanKhongDat) : (text !== "" && text !== undefined && text !== null ? Number(text) : 0)}
                style={{ width: '100%' }}
                onChange={(v: any) => {
                  const soLanKhongDat = Number(v ?? 0);
                  const conLai = Math.max(0, maxScore - (soLanKhongDat * 0.25 * maxScore));
                  const diemPhanTram = maxScore > 0 ? (conLai / maxScore) * 100 : 0;
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, {
                    chamDiemChatLuong_KhongDat: soLanKhongDat,
                    chamDiemChatLuong_SoDiemConLai: Number(conLai.toFixed(2)),
                    chamDiemChatLuong_Diem: Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)),
                  });
                }}
                onCalculate={async () => {
                  await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemChatLuong_SoDiemConLai", "chamDiemChatLuong_SoDiemConLai");
                  await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemChatLuong_Diem", "chamDiemChatLuong_Diem");
                }}
              />
            ) : text;
          }
        },
        {
          title: <span>Điểm còn lại {renderInfoIcon("Số điểm còn lại (Chất lượng)",
            <div>
              <strong>Công thức: {chucVuHeSo !== null ? "(11) = (6) - ((10) * 25% * (6))" : "(10) = (5) - ((9) * 25% * (5))"}</strong><br /><br />
              Trong đó:<br />
              {chucVuHeSo !== null ? "(6): Điểm theo hệ số lãnh đạo" : "(5): Điểm theo Bộ tiêu chí"}<br />
              {chucVuHeSo !== null ? "(10): Số lần không đạt" : "(9): Số lần không đạt"}<br />
              {chucVuHeSo !== null ? "(11): Số điểm còn lại (Chất lượng)" : "(10): Số điểm còn lại (Chất lượng)"}
            </div>
          )}</span>, dataIndex: "clDiemConLai", key: "clDiemConLai", align: "center", width: 90, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;
            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.chatLuongConLai;
                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 600, color: (roleScore !== undefined && roleScore !== null) ? role.color : "#9ca3af" }}>{(roleScore !== undefined && roleScore !== null) ? (formatDisplayScore(roleScore) || '0') : '—'}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }
            return text;
          }
        },
        {
          title: <span>Điểm (%) {renderInfoIcon("Điểm (%) Chất lượng",
            <div>
              <strong>Công thức: {chucVuHeSo !== null ? "(12) = (11) / (6) * 100%" : "(11) = (10) / (5) * 100%"}</strong><br /><br />
              Trong đó:<br />
              {chucVuHeSo !== null ? "(6): Điểm theo hệ số lãnh đạo" : "(5): Điểm theo Bộ tiêu chí"}<br />
              {chucVuHeSo !== null ? "(11): Số điểm còn lại (Chất lượng)" : "(10): Số điểm còn lại (Chất lượng)"}
              {chucVuHeSo !== null ? "(12): Điểm (%) Chất lượng" : "(11): Điểm (%) Chất lượng"}
            </div>
          )}</span>, dataIndex: "clDiemPhanTram", key: "clDiemPhanTram", align: "center", width: 90, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.chatLuongPhanTram;
                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 600, color: (roleScore !== undefined && roleScore !== null) ? role.color : "#9ca3af" }}>{(roleScore !== undefined && roleScore !== null) ? (formatPercent(roleScore) || '100%') : '—'}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }
            return text;
          }
        },
      ],
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          Chấm điểm tiến độ<br />
          <span style={{ color: "#ffd666", fontWeight: "normal", fontSize: "11px" }}>(Trừ 25%/lần)</span>
        </div>
      ),
      children: [
        {
          title: "Chậm muộn", dataIndex: "tdSoLanCham", key: "tdSoLanCham", align: "center", width: 100, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;

            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.soLanCham;
                    const isCurrentEditingRole = editEnabled && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia) === normalizeRoleKey(role.code) : role.code === "CaNhan");

                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isCurrentEditingRole ? (
                            <InlineInputNumber
                              precision={isMultiCap ? (Number.isInteger(Number(maxScore)) ? 0 : 1) : 2}
                              step={isMultiCap ? 1 : 0.01}
                              clampToBounds={isMultiCap}
                              min={0}
                              max={maxScore}
                              placeholder="0"
                              value={roleScore !== undefined && roleScore !== null ? Number(roleScore) : 0}
                              style={{ width: '100%', borderColor: role.color }}
                              onChange={(v: any) => {
                                const soLanCham = Number(v ?? 0);
                                const conLai = Math.max(0, maxScore - (soLanCham * 0.25 * maxScore));
                                const diemPhanTram = maxScore > 0 ? (conLai / maxScore) * 100 : 0;
                                handleInlineProductChange(record.inlineTaskId, record.productIndex, {
                                  chamDiemTienDo_KhongDat: soLanCham,
                                  chamDiemTienDo_SoDiemConLai: Number(conLai.toFixed(2)),
                                  chamDiemTienDo_Diem: Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)),
                                });
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: role.color }}>{formatDisplayScore(roleScore ?? 0) || '0'}</span>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }

            return editEnabled ? (
              <InlineInputNumber
                precision={isMultiCap ? (Number.isInteger(Number(maxScore)) ? 0 : 1) : 2}
                step={isMultiCap ? 1 : 0.01}
                clampToBounds={isMultiCap}
                min={0}
                max={maxScore}
                placeholder="0"
                value={record.scoresByRole?.[effectiveRoleCode]?.soLanCham !== undefined && record.scoresByRole?.[effectiveRoleCode]?.soLanCham !== null ? Number(record.scoresByRole[effectiveRoleCode].soLanCham) : (text !== "" && text !== undefined && text !== null ? Number(text) : 0)}
                style={{ width: '100%' }}
                onChange={(v: any) => {
                  const soLanCham = Number(v ?? 0);
                  const conLai = Math.max(0, maxScore - (soLanCham * 0.25 * maxScore));
                  const diemPhanTram = maxScore > 0 ? (conLai / maxScore) * 100 : 0;
                  handleInlineProductChange(record.inlineTaskId, record.productIndex, {
                    chamDiemTienDo_KhongDat: soLanCham,
                    chamDiemTienDo_SoDiemConLai: Number(conLai.toFixed(2)),
                    chamDiemTienDo_Diem: Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)),
                  });
                }}
                onCalculate={async () => {
                  await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemTienDo_SoDiemConLai", "chamDiemTienDo_SoDiemConLai");
                  await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemTienDo_Diem", "chamDiemTienDo_Diem");
                }}
              />
            ) : text;
          }
        },
        {
          title: <span>Điểm còn lại {renderInfoIcon("Số điểm còn lại (Tiến độ)",
            <div>
              <strong>Công thức: {chucVuHeSo !== null ? "(14) = (6) - ((13) * 25% * (6))" : "(13) = (5) - ((12) * 25% * (5))"}</strong><br /><br />
              Trong đó:<br />
              {chucVuHeSo !== null ? "(6): Điểm theo hệ số lãnh đạo" : "(5): Điểm theo Bộ tiêu chí"}<br />
              {chucVuHeSo !== null ? "(13): Số lần chậm muộn" : "(12): Số lần chậm muộn"}<br />
              {chucVuHeSo !== null ? "(14): Số điểm còn lại (Tiến độ)" : "(13): Số điểm còn lại (Tiến độ)"}
            </div>
          )}</span>, dataIndex: "tdDiemConLai", key: "tdDiemConLai", align: "center", width: 90, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;
            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.tienDoConLai;
                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 600, color: (roleScore !== undefined && roleScore !== null) ? role.color : "#9ca3af" }}>{(roleScore !== undefined && roleScore !== null) ? (formatDisplayScore(roleScore) || '0') : '—'}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }
            return text;
          }
        },
        {
          title: <span>Điểm (%) {renderInfoIcon("Điểm (%) Tiến độ",
            <div>
              <strong>Công thức: {chucVuHeSo !== null ? "(15) = (14) / (6) * 100%" : "(14) = (13) / (5) * 100%"}</strong><br /><br />
              Trong đó:<br />
              {chucVuHeSo !== null ? "(6): Điểm theo hệ số lãnh đạo" : "(5): Điểm theo Bộ tiêu chí"}<br />
              {chucVuHeSo !== null ? "(14): Số điểm còn lại (Tiến độ)" : "(13): Số điểm còn lại (Tiến độ)"}
              {chucVuHeSo !== null ? "(15): Điểm (%) Tiến độ" : "(14): Điểm (%) Tiến độ"}
            </div>
          )}</span>, dataIndex: "tdDiemPhanTram", key: "tdDiemPhanTram", align: "center", width: 90, render: (text: any, record: any) => {
            if (!record.key?.startsWith('item-')) return text;
            if (effectiveMergedRoleView) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {activeRoles.map((role, idx) => {
                    const roleScore = record.scoresByRole?.[role.code]?.tienDoPhanTram;
                    return (
                      <React.Fragment key={role.code}>
                        {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                        <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 600, color: (roleScore !== undefined && roleScore !== null) ? role.color : "#9ca3af" }}>{(roleScore !== undefined && roleScore !== null) ? (formatPercent(roleScore) || '100%') : '—'}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }
            return text;
          }
        },
      ],
    },
    {
      title: "Ghi chú/Giải trình",
      dataIndex: "ghiChu",
      key: "ghiChu",
      width: 140,
      align: "center",
      render: (text: any, record: any) => {
        if (!record.key?.startsWith("item-")) return text;

        if (effectiveMergedRoleView) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
              {activeRoles.map((role, idx) => {
                const roleGhiChu = record.scoresByRole?.[role.code]?.ghiChu;
                const isCurrentEditingRole = editEnabled && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia).toLowerCase() === normalizeRoleKey(role.code).toLowerCase() : role.code === "CaNhan");

                return (
                  <React.Fragment key={role.code}>
                    {idx > 0 && <div style={{ borderTop: '1px dashed #cbd5e1', margin: '1px 0', opacity: 0.8 }} />}
                    <div style={{ minHeight: '26px', display: 'flex', alignItems: 'center' }}>
                      {isCurrentEditingRole ? (
                        <InlineInput
                          type="textarea"
                          rows={1}
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          placeholder="Ghi chú"
                          value={roleGhiChu || ""}
                          style={{ fontSize: '11px', borderColor: role.color }}
                          onChange={(val: any) => handleInlineProductChange(record.inlineTaskId, record.productIndex, 'ghiChuGiaTrinh', val)}
                        />
                      ) : (
                        <span style={{ fontSize: '11px', color: role.color }}>{roleGhiChu || '—'}</span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <KpiAttachmentCell
                product={record.taskData?.danhSachDauRa?.[record.productIndex] || record.taiLieu}
                canEdit={editEnabled}
                enablePreview={enableAttachmentPreview}
                onFilesSelected={(files) => handleAttachmentFiles(record.inlineTaskId, record.productIndex, files, record.taskData)}
                onAddUploadedAttachments={(items) => handleAddUploadedAttachments(record.inlineTaskId, record.productIndex, items, record.taskData)}
                onRemoveExisting={(id) => handleRemoveExistingAttachment(record.inlineTaskId, record.productIndex, id, record.taskData)}
                onRemoveNew={(file) => handleRemoveNewAttachment(record.inlineTaskId, record.productIndex, file, record.taskData)}
              />
            </div>
          );
        }

        const noteValue = getNoteValue(record.taskData, record.productIndex);
        const hasNote = Boolean(noteValue.trim());
        const noteDirty = isNoteDirty(record.taskData, record.productIndex);
        const noteButtonStyle = {
          width: 28,
          height: 28,
          padding: 0,
          borderColor: noteDirty ? "#f59e0b" : "#4b5563",
          color: noteDirty ? "#f59e0b" : "#9ca3af",
          backgroundColor: "transparent",
        };

        return (
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {hasNote ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                <div
                  onClick={() => handleOpenNoteModal(record.inlineTaskId, record.productIndex, record.taskData, !editEnabled)}
                  style={{
                    flex: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: noteDirty ? '#f59e0b' : '#1677ff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    textDecoration: 'underline',
                    textAlign: 'center'
                  }}
                  title={editEnabled ? "Nhấn để sửa ghi chú" : "Nhấn để xem ghi chú"}
                >
                  {noteValue.length > 80 ? `${noteValue.substring(0, 80)}...` : noteValue}
                </div>
              </div>
            ) : editEnabled ? (
              <Tooltip title="Tạo ghi chú">
                <Button
                  size="small"
                  type="dashed"
                  icon={<PlusOutlined />}
                  style={noteDirty ? { borderColor: "#f59e0b", color: "#f59e0b" } : undefined}
                  onClick={() => handleOpenNoteModal(record.inlineTaskId, record.productIndex, record.taskData)}
                >
                  Tạo ghi chú
                </Button>
              </Tooltip>
            ) : (
              <span style={{ color: "#9ca3af" }}>-</span>
            )}
            <KpiAttachmentCell
              product={record.taskData?.danhSachDauRa?.[record.productIndex] || record.taiLieu}
              canEdit={editEnabled}
              enablePreview={enableAttachmentPreview}
              onFilesSelected={(files) => handleAttachmentFiles(record.inlineTaskId, record.productIndex, files, record.taskData)}
              onAddUploadedAttachments={(items) => handleAddUploadedAttachments(record.inlineTaskId, record.productIndex, items, record.taskData)}
              onRemoveExisting={(id) => handleRemoveExistingAttachment(record.inlineTaskId, record.productIndex, id, record.taskData)}
              onRemoveNew={(file) => handleRemoveNewAttachment(record.inlineTaskId, record.productIndex, file, record.taskData)}
            />
          </div>
        );
      }
    }
  ], [vaiTroDanhGia, effectiveRoleCode, selectedCompactRole, isEvaluatingPhoPhong, chucVuHeSo, tenChucVuLanhDao, editEnabled, enableAttachmentPreview, effectiveMergedRoleView, displayMode, isMergedRoleView, isMultiCap, activeRoles, getNoteValue, isNoteDirty, handleOpenNoteModal, handleAttachmentFiles, handleAddUploadedAttachments, handleRemoveExistingAttachment, handleRemoveNewAttachment, handleCalculateInlineField, handleAddInlineProduct, handleInlineProductChange, handleInlineTaskChange, handleRemoveInlineProduct, handleRemoveInlineTask, handleDeleteTask, handleEditTaskInline, handleOpenProductModal, setActiveTaskId, setActiveProductIndex, setChonTieuChiVisible, setInlineTasks]);

  const visibleNhiemVuHeThong = React.useMemo(() => {
    const existingIds = new Set(nhiemVuHeThong.map((nv) => nv.id));
    const mappedExisting = nhiemVuHeThong.map((nv) => {
      const inlineVersion = inlineTasks.find((t) => t.id === nv.id || t.dbId === nv.id);
      return inlineVersion || nv;
    });
    const newInlineTasks = inlineTasks.filter(
      (t) => t.typeNhiemVu === 'HETHONG' && !existingIds.has(t.id) && (!t.dbId || !existingIds.has(t.dbId))
    );
    return [...mappedExisting, ...newInlineTasks];
  }, [nhiemVuHeThong, inlineTasks]);

  const visibleNhiemVuPhatSinh = React.useMemo(() => {
    const existingIds = new Set(nhiemVuPhatSinh.map((nv) => nv.id));
    const mappedExisting = nhiemVuPhatSinh.map((nv) => {
      const inlineVersion = inlineTasks.find((t) => t.id === nv.id || t.dbId === nv.id);
      return inlineVersion || nv;
    });
    const newInlineTasks = inlineTasks.filter(
      (t) => t.typeNhiemVu === 'PHATSINH' && !existingIds.has(t.id) && (!t.dbId || !existingIds.has(t.dbId))
    );
    return [...mappedExisting, ...newInlineTasks];
  }, [nhiemVuPhatSinh, inlineTasks]);

  const data = [
    {
      key: "header-num",
      stt: "(1)",
      mieuTa: <div style={{ textAlign: "center", fontWeight: "bold" }}>(2)</div>,
      sanPham: <div style={{ textAlign: "center", fontWeight: "bold" }}>(3)</div>,
      canCu: <div style={{ textAlign: "center", fontWeight: "bold" }}>(4)</div>,
      ...(chucVuHeSo !== null
        ? {
          diemBoTieuChi: <div style={{ textAlign: "center", fontWeight: "bold" }}>(5)</div>,
          diemHeSo: <div style={{ textAlign: "center", fontWeight: "bold" }}>(6)</div>,
          nguoiDanhGia: "",
          slHoanThanh: <div style={{ textAlign: "center", fontWeight: "bold" }}>(7)</div>,
          slKhongHoanThanh: <div style={{ textAlign: "center", fontWeight: "bold" }}>(8)</div>,
          slDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(9)=(7)/(6)</div>,
          clSoLanKhongDat: <div style={{ textAlign: "center", fontWeight: "bold" }}>(10)</div>,
          clDiemConLai: <div style={{ textAlign: "center", fontWeight: "bold" }}>(11)</div>,
          clDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(12)=(11)/(6)</div>,
          tdSoLanCham: <div style={{ textAlign: "center", fontWeight: "bold" }}>(13)</div>,
          tdDiemConLai: <div style={{ textAlign: "center", fontWeight: "bold" }}>(14)</div>,
          tdDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(15)=(14)/(6)</div>,
          ghiChu: <div style={{ textAlign: "center", fontWeight: "bold" }}>(16)</div>,
        }
        : {
          diemBoTieuChi: <div style={{ textAlign: "center", fontWeight: "bold" }}>(5)</div>,
          nguoiDanhGia: "",
          slHoanThanh: <div style={{ textAlign: "center", fontWeight: "bold" }}>(6)</div>,
          slKhongHoanThanh: <div style={{ textAlign: "center", fontWeight: "bold" }}>(7)</div>,
          slDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(8)=(6)/(5)</div>,
          clSoLanKhongDat: <div style={{ textAlign: "center", fontWeight: "bold" }}>(9)</div>,
          clDiemConLai: <div style={{ textAlign: "center", fontWeight: "bold" }}>(10)</div>,
          clDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(11)=(10)/(5)</div>,
          tdSoLanCham: <div style={{ textAlign: "center", fontWeight: "bold" }}>(12)</div>,
          tdDiemConLai: <div style={{ textAlign: "center", fontWeight: "bold" }}>(13)</div>,
          tdDiemPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(14)=(13)/(5)</div>,
          ghiChu: <div style={{ textAlign: "center", fontWeight: "bold" }}>(15)</div>,
        }),
    },
    {
      key: "group-1",
      stt: "I",
      mieuTa: <strong>Nhiệm vụ đã có trong kế hoạch/ phân công</strong>,
    },
    ...visibleNhiemVuHeThong.flatMap((nv, index) => mapNhiemVuToTableItems({ ...nv, typeNhiemVu: 'HETHONG' }, index, "")),
    renderTotalRow("group-total-1", "Tổng (1)", visibleNhiemVuHeThong, canAddEditTasks ? (
      <Button
        size="small"
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleInitInlineTask('HETHONG')}
        style={{ backgroundColor: "#0f766e", borderColor: "#0f766e", color: "#ffffff", fontWeight: 600 }}
      >
        Thêm nhiệm vụ
      </Button>
    ) : null),
    {
      key: "group-2",
      stt: "II",
      mieuTa: <strong>Nhiệm vụ đảm nhận thêm hoặc đột xuất, phát sinh (*)</strong>,
    },
    ...visibleNhiemVuPhatSinh.flatMap((nv, index) => mapNhiemVuToTableItems({ ...nv, typeNhiemVu: 'PHATSINH' }, index, "")),
    renderTotalRow("group-total-2", "Tổng (2)", visibleNhiemVuPhatSinh, canAddEditTasks ? (
      <Button
        size="small"
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleInitInlineTask('PHATSINH')}
        style={{ backgroundColor: "#0f766e", borderColor: "#0f766e", color: "#ffffff", fontWeight: 600 }}
      >
        Thêm nhiệm vụ
      </Button>
    ) : null),
    renderTotalRow("group-total-3", "Tổng điểm (3) = Tổng (1) + Tổng (2)", [...visibleNhiemVuHeThong, ...visibleNhiemVuPhatSinh]),
  ];

  const allNhiemVu = [...visibleNhiemVuHeThong, ...visibleNhiemVuPhatSinh];
  const allProductsB = allNhiemVu.flatMap(item => (item.danhSachDauRa && item.danhSachDauRa.length > 0)
    ? item.danhSachDauRa
    : [{ diemTheoBoTieuChi: item.diemBoTieuChi }]);
  const productScoresB = allProductsB.map((product) => getProductScoreValues(product, product.diemTheoBoTieuChi));

  const sumBoTieuChiB = productScoresB.reduce((sum, score) => sum + score.diemBoTieuChi, 0);
  const sumHeSoB = chucVuHeSo !== null ? productScoresB.reduce((sum, score) => sum + score.diemCoSo, 0) : 0;
  const baseDiemB = chucVuHeSo !== null ? sumHeSoB : sumBoTieuChiB;
  const hasScoringData = productScoresB.some((score) => score.diemBoTieuChi > 0);

  const roleScoresSummaryB = activeRoles.map((role) => {
    const isCaNhan = normalizeRoleKey(role.code) === "CaNhan";
    const hasRoleScored = productScoresB.some((score) => score.scoresByRole?.[role.code]?.soLuongHoanThanh !== undefined);
    const isRoleEditing = !viewOnly && (vaiTroDanhGia ? normalizeRoleKey(vaiTroDanhGia).toLowerCase() === normalizeRoleKey(role.code).toLowerCase() : false);

    if (!isCaNhan && !hasRoleScored && !isRoleEditing) {
      return {
        role,
        sumSlHT_B: null,
        sumClCL_B: null,
        sumTdCL_B: null,
        percentSl_B: null,
        percentCl_B: null,
        percentTd_B: null,
        finalScoreNum: null,
        finalScoreStr: "—",
        hasEvaluated: false,
      };
    }

    const sumSlHT_B = productScoresB.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.soLuongHoanThanh ?? 0), 0);
    const sumClCL_B = productScoresB.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.chatLuongConLai ?? 0), 0);
    const sumTdCL_B = productScoresB.reduce((sum, score) => sum + (score.scoresByRole?.[role.code]?.tienDoConLai ?? 0), 0);

    const percentSl_B = baseDiemB ? Math.max(0, (sumSlHT_B / baseDiemB) * 100) : 0;
    const percentCl_B = baseDiemB ? Math.max(0, (sumClCL_B / baseDiemB) * 100) : 0;
    const percentTd_B = baseDiemB ? Math.max(0, (sumTdCL_B / baseDiemB) * 100) : 0;

    const finalScoreNum = hasScoringData
      ? Math.max(0, chucVuHeSo !== null
        ? (percentSl_B + percentCl_B + percentTd_B + kqLinhVucPercent + knToChucPercent + nlTapHopPercent) / 6
        : (percentSl_B + percentCl_B + percentTd_B) / 3)
      : 0;
    const finalScoreStr = formatPercent(finalScoreNum);

    return {
      role,
      sumSlHT_B, sumClCL_B, sumTdCL_B,
      percentSl_B, percentCl_B, percentTd_B,
      finalScoreNum, finalScoreStr,
      hasEvaluated: isCaNhan || hasRoleScored,
    };
  });

  const currentRoleCode = vaiTroDanhGia || (activeRoles[activeRoles.length - 1]?.code || "CaNhan");
  const activeRoleSummary = roleScoresSummaryB.find(r => r.role.code === currentRoleCode && r.finalScoreNum !== null) || roleScoresSummaryB[0];
  const effectiveFinalScoreNum = activeRoleSummary?.finalScoreNum ?? 0;
  const finalScoreNum = effectiveFinalScoreNum;
  const finalScoreStr = activeRoleSummary?.finalScoreStr ?? "0%";

  const sumSlHoanThanhB = activeRoleSummary?.sumSlHT_B ?? 0;
  const sumClConLaiB = activeRoleSummary?.sumClCL_B ?? 0;
  const sumTdConLaiB = activeRoleSummary?.sumTdCL_B ?? 0;
  const percentSlB = activeRoleSummary?.percentSl_B ?? 0;
  const percentClB = activeRoleSummary?.percentCl_B ?? 0;
  const percentTdB = activeRoleSummary?.percentTd_B ?? 0;

  const prevTaskScoreRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (allNhiemVu.length === 0 || !hasScoringData) {
      // Đang tải dữ liệu hoặc chưa có dữ liệu, không bắn điểm 0 làm đè điểm đã lưu của phiếu
      return;
    }

    const calculatedScore = (effectiveFinalScoreNum * 70) / 100;
    const scoresMap: Record<string, number> = {};
    roleScoresSummaryB.forEach((summary) => {
      if (summary.finalScoreNum !== null && summary.finalScoreNum !== undefined) {
        const score70 = Math.round(((summary.finalScoreNum * 70) / 100) * 100) / 100;
        scoresMap[summary.role.code] = score70;
      }
    });

    if (onTaskScoreChange) {
      if (prevTaskScoreRef.current === null || Math.abs(prevTaskScoreRef.current - calculatedScore) > 0.001) {
        prevTaskScoreRef.current = calculatedScore;
        onTaskScoreChange(calculatedScore, scoresMap);
      }
    }
  }, [allNhiemVu.length, hasScoringData, effectiveFinalScoreNum, roleScoresSummaryB, onTaskScoreChange]);

  const prevRoleScoresRef = React.useRef<string>("");
  React.useEffect(() => {
    if (allNhiemVu.length === 0 || !hasScoringData) return;

    const scoresMap: Record<string, number> = {};
    roleScoresSummaryB.forEach((summary) => {
      if (summary.finalScoreNum !== null && summary.finalScoreNum !== undefined) {
        const score70 = Math.round(((summary.finalScoreNum * 70) / 100) * 100) / 100;
        scoresMap[summary.role.code] = score70;
      }
    });

    const serialized = JSON.stringify(scoresMap);
    if (prevRoleScoresRef.current !== serialized) {
      prevRoleScoresRef.current = serialized;
      onRoleTaskScoresChange?.(scoresMap);
    }
  }, [allNhiemVu.length, hasScoringData, roleScoresSummaryB, onRoleTaskScoresChange]);

  const columnsB = React.useMemo<any[]>(() => [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 45,
      align: "center",
      render: (text: any, record: any) => {
        if (record.key === 'row-iv') {
          return { children: text, props: { colSpan: 1 } };
        }
        return <span style={{ whiteSpace: "nowrap" }}>{text}</span>;
      }
    },
    {
      title: chucVuHeSo !== null ? "Đối với công chức giữ chức vụ lãnh đạo" : "Đối với công chức không giữ chức vụ lãnh đạo",
      dataIndex: "mieuTa",
      key: "mieuTa",
      width: 250,
      render: (text: any, record: any) => {
        return { children: text, props: { colSpan: 1 } };
      }
    },
    {
      title: "Điểm theo Bộ tiêu chí",
      dataIndex: "diemBoTieuChi",
      key: "diemBoTieuChi",
      align: "center",
      width: 45,
      render: (text: any, record: any) => {
        if (record.key === 'row-iv') {
          return {
            children: <strong style={{ fontSize: '1.2em' }}>{record.finalScore}</strong>,
            props: { colSpan: chucVuHeSo !== null ? 12 : 7, style: { background: '#92d050', textAlign: 'center' } },
          };
        }
        return text;
      }
    },
    ...(chucVuHeSo !== null ? [{
      title: `Điểm theo hệ số lãnh đạo (${tenChucVuLanhDao || 'Lãnh đạo'} = ${formatDisplayScore(chucVuHeSo)} x Điểm Bộ tiêu chí)`,
      dataIndex: "diemHeSo",
      key: "diemHeSo",
      align: "center",
      width: 45,
      render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
    }] : []),
    {
      title: chucVuHeSo !== null ? "Khối lượng" : "Chấm điểm số lượng",
      children: [
        {
          title: <span>Điểm cuối cùng {renderInfoIcon("Điểm cuối cùng (Số lượng)",
            <div>
              <strong>Điểm cuối cùng (Số lượng)</strong><br /><br />
              Là Tổng của tất cả các cột {chucVuHeSo !== null ? "(7)" : "(6)"} "Hoàn thành" ở Phần A.
            </div>
          )}</span>, dataIndex: "klDiem", key: "klDiem", align: "center", width: 45, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
        },
        {
          title: <span>Điểm tiêu chí (%) {renderInfoIcon("Điểm tiêu chí (%) Số lượng",
            <div>
              <strong>Công thức tính Điểm tiêu chí (%)</strong><br /><br />
              = (Tổng tất cả cột {chucVuHeSo !== null ? "(7)" : "(6)"} ở Phần A / Tổng tất cả cột {chucVuHeSo !== null ? "(6)" : "(5)"} ở Phần A) * 100%
            </div>
          )}</span>, dataIndex: "klPhanTram", key: "klPhanTram", align: "center", width: 45, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
        },
      ]
    },
    {
      title: chucVuHeSo !== null ? "Chất lượng" : (
        <div style={{ textAlign: "center" }}>
          Chấm điểm chất lượng<br />
          <span style={{ color: "#ffd666", fontWeight: "normal" }}>(Trừ 25%/lần không đạt)</span>
        </div>
      ),
      children: [
        {
          title: <span>Điểm cuối cùng {renderInfoIcon("Điểm cuối cùng (Chất lượng)",
            <div>
              <strong>Điểm cuối cùng (Chất lượng)</strong><br /><br />
              Là Tổng của tất cả các cột {chucVuHeSo !== null ? "(11)" : "(10)"} "Số điểm còn lại" ở Phần A.
            </div>
          )}</span>, dataIndex: "clDiem", key: "clDiem", align: "center", width: 45, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
        },
        {
          title: <span>Điểm tiêu chí (%) {renderInfoIcon("Điểm tiêu chí (%) Chất lượng",
            <div>
              <strong>Công thức tính Điểm tiêu chí (%)</strong><br /><br />
              = (Tổng tất cả cột {chucVuHeSo !== null ? "(11)" : "(10)"} ở Phần A / Tổng tất cả cột {chucVuHeSo !== null ? "(6)" : "(5)"} ở Phần A) * 100%
            </div>
          )}</span>, dataIndex: "clPhanTram", key: "clPhanTram", align: "center", width: 45, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
        },
      ]
    },
    {
      title: chucVuHeSo !== null ? "Tiến độ" : (
        <div style={{ textAlign: "center" }}>
          Chấm điểm tiến độ<br />
          <span style={{ color: "#ffd666", fontWeight: "normal" }}>(Trừ 25%/lần chậm muộn)</span>
        </div>
      ),
      children: [
        {
          title: <span>Điểm cuối cùng {renderInfoIcon("Điểm cuối cùng (Tiến độ)",
            <div>
              <strong>Điểm cuối cùng (Tiến độ)</strong><br /><br />
              Là Tổng của tất cả các cột {chucVuHeSo !== null ? "(14)" : "(13)"} "Số điểm còn lại" ở Phần A.
            </div>
          )}</span>, dataIndex: "tdDiem", key: "tdDiem", align: "center", width: 45, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
        },
        {
          title: <span>Điểm tiêu chí (%) {renderInfoIcon("Điểm tiêu chí (%) Tiến độ",
            <div>
              <strong>Công thức tính Điểm tiêu chí (%)</strong><br /><br />
              = (Tổng tất cả cột {chucVuHeSo !== null ? "(14)" : "(13)"} ở Phần A / Tổng tất cả cột {chucVuHeSo !== null ? "(6)" : "(5)"} ở Phần A) * 100%
            </div>
          )}</span>, dataIndex: "tdPhanTram", key: "tdPhanTram", align: "center", width: 45, render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
        },
      ]
    },
    ...(chucVuHeSo !== null ? [
      {
        title: "Kết quả hoạt động của lĩnh vực được giao (**)",
        dataIndex: "kqLinhVuc",
        key: "kqLinhVuc",
        align: "center",
        width: 120,
        render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
      },
      {
        title: "Khả năng tổ chức triển khai thực hiện nhiệm vụ",
        dataIndex: "knToChuc",
        key: "knToChuc",
        align: "center",
        width: 120,
        render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
      },
      {
        title: "Năng lực tập hợp, đoàn kết công chức",
        dataIndex: "nlTapHop",
        key: "nlTapHop",
        align: "center",
        width: 120,
        render: (text: any, record: any) => (record.key === 'row-iv' ? { props: { colSpan: 0 } } : text)
      }
    ] : []),
    {
      title: "Ghi chú/Giải trình",
      dataIndex: "ghiChu",
      key: "ghiChu",
      width: 90,
      render: (text: any, record: any) => (record.key === 'row-iv' && chucVuHeSo !== null ? { props: { colSpan: 0 } } : text)
    }
  ], [chucVuHeSo, tenChucVuLanhDao]);

  const dataB = [
    {
      key: "header-num-b",
      stt: chucVuHeSo !== null ? <div style={{ textAlign: "center", fontWeight: "bold" }}>(1)</div> : "",
      mieuTa: chucVuHeSo !== null ? <div style={{ textAlign: "center", fontWeight: "bold" }}>(2)</div> : "",
      diemBoTieuChi: chucVuHeSo !== null ? <div style={{ textAlign: "center", fontWeight: "bold" }}>(3)</div> : <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(1)</div>,
      ...(chucVuHeSo !== null
        ? {
          diemHeSo: <div style={{ textAlign: "center", fontWeight: "bold" }}>(4)</div>,
          klDiem: <div style={{ textAlign: "center", fontWeight: "bold" }}>(5)</div>,
          klPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(6)=(5)/(4)</div>,
          clDiem: <div style={{ textAlign: "center", fontWeight: "bold" }}>(7)</div>,
          clPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(8)=(7)/(4)</div>,
          tdDiem: <div style={{ textAlign: "center", fontWeight: "bold" }}>(9)</div>,
          tdPhanTram: <div style={{ textAlign: "center", fontWeight: "bold" }}>(10)=(9)/(4)</div>,
          kqLinhVuc: <div style={{ textAlign: "center", fontWeight: "bold" }}>(11)</div>,
          knToChuc: <div style={{ textAlign: "center", fontWeight: "bold" }}>(12)</div>,
          nlTapHop: <div style={{ textAlign: "center", fontWeight: "bold" }}>(13)</div>,
          ghiChu: <div style={{ textAlign: "center", fontWeight: "bold" }}>(14)</div>,
        }
        : {
          klDiem: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(2)</div>,
          klPhanTram: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(3)=(2)/(1)</div>,
          clDiem: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(4)</div>,
          clPhanTram: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(5)=(4)/(1)</div>,
          tdDiem: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(6)</div>,
          tdPhanTram: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(7)=(6)/(1)</div>,
          ghiChu: <div style={{ textAlign: "center", fontWeight: "bold", fontStyle: "italic" }}>(8)</div>,
        })
    },
    {
      key: "row-iii",
      stt: <strong style={{ textAlign: "center", display: "block" }}>III</strong>,
      mieuTa: <strong style={{ textAlign: "center", display: "block" }}>Chấm điểm theo từng tiêu chí</strong>,
      diemBoTieuChi: formatDisplayScore(sumBoTieuChiB),
      ...(chucVuHeSo !== null ? { diemHeSo: formatDisplayScore(sumHeSoB) } : {}),
      klDiem: effectiveMergedRoleView ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px" }}>
          {roleScoresSummaryB.map((rs, idx) => (
            <React.Fragment key={rs.role.code}>
              {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", margin: "1px 0", opacity: 0.8 }} />}
              <span style={{ color: rs.role.color, fontWeight: 600 }}>{rs.role.shortLabel}: {formatDisplayScore(rs.sumSlHT_B)}</span>
            </React.Fragment>
          ))}
        </div>
      ) : formatDisplayScore(sumSlHoanThanhB),
      klPhanTram: effectiveMergedRoleView ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px" }}>
          {roleScoresSummaryB.map((rs, idx) => (
            <React.Fragment key={rs.role.code}>
              {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", margin: "1px 0", opacity: 0.8 }} />}
              <span style={{ color: rs.role.color, fontWeight: 600 }}>{rs.role.shortLabel}: {formatPercent(rs.percentSl_B)}</span>
            </React.Fragment>
          ))}
        </div>
      ) : formatPercent(percentSlB),
      clDiem: effectiveMergedRoleView ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px" }}>
          {roleScoresSummaryB.map((rs, idx) => (
            <React.Fragment key={rs.role.code}>
              {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", margin: "1px 0", opacity: 0.8 }} />}
              <span style={{ color: rs.role.color, fontWeight: 600 }}>{rs.role.shortLabel}: {formatDisplayScore(rs.sumClCL_B)}</span>
            </React.Fragment>
          ))}
        </div>
      ) : formatDisplayScore(sumClConLaiB),
      clPhanTram: effectiveMergedRoleView ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px" }}>
          {roleScoresSummaryB.map((rs, idx) => (
            <React.Fragment key={rs.role.code}>
              {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", margin: "1px 0", opacity: 0.8 }} />}
              <span style={{ color: rs.role.color, fontWeight: 600 }}>{rs.role.shortLabel}: {formatPercent(rs.percentCl_B)}</span>
            </React.Fragment>
          ))}
        </div>
      ) : formatPercent(percentClB),
      tdDiem: effectiveMergedRoleView ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px" }}>
          {roleScoresSummaryB.map((rs, idx) => (
            <React.Fragment key={rs.role.code}>
              {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", margin: "1px 0", opacity: 0.8 }} />}
              <span style={{ color: rs.role.color, fontWeight: 600 }}>{rs.role.shortLabel}: {formatDisplayScore(rs.sumTdCL_B)}</span>
            </React.Fragment>
          ))}
        </div>
      ) : formatDisplayScore(sumTdConLaiB),
      tdPhanTram: effectiveMergedRoleView ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px" }}>
          {roleScoresSummaryB.map((rs, idx) => (
            <React.Fragment key={rs.role.code}>
              {idx > 0 && <div style={{ borderTop: "1px dashed #cbd5e1", margin: "1px 0", opacity: 0.8 }} />}
              <span style={{ color: rs.role.color, fontWeight: 600 }}>{rs.role.shortLabel}: {formatPercent(rs.percentTd_B)}</span>
            </React.Fragment>
          ))}
        </div>
      ) : formatPercent(percentTdB),
      ...(chucVuHeSo !== null ? {
        kqLinhVuc: (
          <Select
            value={kqLinhVucPercent}
            disabled={!canEditLeadershipPercentages}
            onChange={(val) => setKqLinhVucPercent(val)}
            options={[
              { label: "100%", value: 100 },
              { label: "50%", value: 50 },
            ]}
            style={{ width: "85px" }}
          />
        ),
        knToChuc: (
          <Select
            value={knToChucPercent}
            disabled={!canEditLeadershipPercentages}
            onChange={(val) => setKnToChucPercent(val || 0)}
            options={[
              { label: "100%", value: 100 },
              { label: "50%", value: 50 },
            ]}
            style={{ width: "85px" }}
          />
        ),
        nlTapHop: (
          <Select
            value={nlTapHopPercent}
            disabled={!canEditLeadershipPercentages}
            onChange={(val) => setNlTapHopPercent(val || 0)}
            options={[
              { label: "100%", value: 100 },
              { label: "50%", value: 50 },
            ]}
            style={{ width: "85px" }}
          />
        ),
      } : {}),
      ghiChu: "",
    },
    {
      key: "row-iv",
      stt: <strong style={{ textAlign: "center", display: "block" }}>IV</strong>,
      mieuTa: <strong>Điểm tiêu chí kết quả thực hiện nhiệm vụ = {chucVuHeSo !== null ? "[(6)+(8)+(10)+(11)+(12)+(13)]/6" : "(điểm số lượng + điểm chất lượng + điểm tiến độ)/3"}</strong>,
      finalScore: effectiveMergedRoleView ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {roleScoresSummaryB.map((rs, idx) => (
            <React.Fragment key={rs.role.code}>
              {idx > 0 && <span style={{ color: "#64748b", fontWeight: 700 }}> - </span>}
              <span style={{ background: rs.role.bgColor, color: rs.role.color, padding: "3px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "13px" }}>
                {rs.role.shortLabel}: {rs.finalScoreStr}
              </span>
            </React.Fragment>
          ))}
        </div>
      ) : finalScoreStr
    }
  ];

  const handleSaveTaskScores = async (phieuIdOverride?: string | null) => {
    if (viewOnly) return true; // Bỏ qua yên lặng - panel chỉ xem không cần lưu
    const effectivePhieuId = phieuIdOverride || idPhieuProp || effectiveIdPhieuProp || searchParams.get('idPhieu') || searchParams.get('idPhieuDanhGia');
    const isTasksSaved = await handleSaveInlineTasks(effectivePhieuId);
    if (isTasksSaved !== true && isTasksSaved?.error) return isTasksSaved;
    if (!isTasksSaved) return { error: true, message: "Lưu nhiệm vụ thất bại", section: "section2" };

    // Cấp trên (Phó phòng, Trưởng phòng, ...) chỉ lưu chi tiết điểm vào KPI_DauRaNhiemVu_ChiTietDanhGia qua handleSaveInlineTasks
    if (vaiTroDanhGia && vaiTroDanhGia !== "CaNhan") {
      if (!silentSave) {
        message.success("Lưu đánh giá thành công");
      }
      return true;
    }

    // Cá nhân: Lưu thêm kết quả tổng hợp vào KPI_KetQuaThucHienNhiemVu
    const dataToSave = {
      idPhieuDanhGia: effectivePhieuId || null,
      idLyLich: targetUserId || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id || null,
      idDotDanhGia: selectedDot || null,
      diemBoTieuChi: sumBoTieuChiB,
      diemHeSoLanhDao: sumHeSoB,
      khoiLuongDiem: sumSlHoanThanhB,
      khoiLuongPhanTram: percentSlB,
      chatLuongDiem: sumClConLaiB,
      chatLuongPhanTram: percentClB,
      tienDoDiem: sumTdConLaiB,
      tienDoPhanTram: percentTdB,
      ketQuaLinhVucPhanTram: kqLinhVucPercent,
      khaNangToChucPhanTram: knToChucPercent,
      nangLucTapHopPhanTram: nlTapHopPercent,
      diemTieuChiKetQua: finalScoreNum
    };
    try {
      if (!silentSave) {
        message.info("Đang lưu kết quả...");
      }
      if (effectivePhieuId) {
        const res = await kPI_NhiemVuService.saveKetQua(dataToSave);
        if (res?.status) {
          onTaskScoreChange?.((finalScoreNum * 70) / 100);
          if (selectedDot) {
            const snapshotRes = await kPI_NhiemVuService.getHeSoLanhDaoApDung(effectivePhieuId, selectedDot);
            const snapshot = snapshotRes?.status ? snapshotRes.data : null;
            setTenChucVuLanhDao(snapshot?.tenChucVu || snapshot?.chucVuCode || "");
            setChucVuHeSo(snapshot?.coApDungHeSo && snapshot?.heSo !== null && snapshot?.heSo !== undefined
              ? Number(snapshot.heSo)
              : null);
          }
        }
      }
      if (!silentSave) {
        message.success("Lưu kết quả thực hiện nhiệm vụ thành công");
      }
      return true;
    } catch (error) {
      console.error("Lỗi khi lưu kết quả:", error);
      return true;
    }
  };

  React.useEffect(() => {
    if (saveRef) {
      if (typeof saveRef === "function") {
        saveRef(handleSaveTaskScores);
      } else {
        saveRef.current = handleSaveTaskScores;
      }
    }
  }, [saveRef, handleSaveTaskScores]);

  const onTaskScoreChangeRef = React.useRef(onTaskScoreChange);
  const lastEmittedScoreRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    onTaskScoreChangeRef.current = onTaskScoreChange;
  }, [onTaskScoreChange]);

  React.useEffect(() => {
    if (typeof finalScoreNum === "number" && !isNaN(finalScoreNum) && (allNhiemVu.length > 0 && hasScoringData)) {
      const scoreOutOf70 = Math.round(((finalScoreNum * 70) / 100) * 100) / 100;
      if (lastEmittedScoreRef.current !== scoreOutOf70) {
        lastEmittedScoreRef.current = scoreOutOf70;
        const scoresMap: Record<string, number> = {};
        roleScoresSummaryB.forEach((summary) => {
          if (summary.finalScoreNum !== null && summary.finalScoreNum !== undefined) {
            const s70 = Math.round(((summary.finalScoreNum * 70) / 100) * 100) / 100;
            scoresMap[summary.role.code] = s70;
          }
        });
        onTaskScoreChangeRef.current?.(scoreOutOf70, scoresMap);
      }
    }
  }, [finalScoreNum, allNhiemVu.length, hasScoringData, roleScoresSummaryB]);

  const isSection1Present = hasSection1Header !== undefined ? hasSection1Header : (hideHeader ?? false);
  const section1Offset = isSection1Present ? 44 : 0;
  const baseTop = isModal ? 0 : 106;
  const headerStickyTop = `${baseTop + section1Offset}px`;
  const tableHeaderTop = `${baseTop + section1Offset + 44}px`;

  if (checkingPermission) {
    return (
      <Card className="customCardShadow" bordered={false} style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </Card>
    );
  }

  return (
    <Card className="kpi-white-mode kpi-allow-sticky" bordered={false} styles={{ body: { padding: 0 } }}>
      {!hideHeader && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0px" }}>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/kPI_PhieuDanhGia/CaNhan')}
            style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f", color: "#fff" }}
          >
            Quay lại phiếu đánh giá cá nhân
          </Button>
        </div>
      )}


      {!hideHeader && (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: "20px" }}
            message={
              <div style={{ fontSize: "13.5px", lineHeight: "1.6" }}>
                <div>
                  <strong>(*)</strong> Công chức được giao đảm nhận thêm nhiệm vụ từ công chức khác hoặc công việc đột xuất, phát sinh thì nhiệm vụ này được tính ngoài tổng số nhiệm vụ được giao ban đầu và được tính thêm điểm tiêu chí kết quả thực hiện nhiệm vụ.
                </div>
                <div style={{ marginTop: "6px" }}>
                  <strong>(**)</strong> Chỉ chấm 100% hoặc 50% đối với các tiêu chí: Kết quả hoạt động của lĩnh vực được giao, khả năng tổ chức triển khai thực hiện nhiệm vụ, năng lực tập hợp đoàn kết (quy định tại điểm a, khoản 3, Điều 15 Nghị định số 335/2025/NĐ-CP)
                </div>
              </div>
            }
          />
          <div style={{ textAlign: "center", marginBottom: "0px" }}>
            <Title level={4} style={{ marginTop: "30px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              Biểu chấm điểm tiêu chí kết quả thực hiện nhiệm vụ {selectedDot && dotDanhGiaOptions.find(d => d.value === selectedDot)?.label ? `- ${dotDanhGiaOptions.find(d => d.value === selectedDot)?.label}` : ""}
            </Title>
          </div>
        </>
      )}

      <div style={{ position: "relative", marginBottom: 0, "--table-header-top": tableHeaderTop } as React.CSSProperties}>
        <div style={{
          position: "sticky",
          top: headerStickyTop,
          zIndex: 20,
          height: "44px",
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)",
          color: "#fff",
          padding: "0 8px",
          fontSize: "15px",
          fontWeight: "700",
          borderRadius: "0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #67e8f9",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span>A. CHẤM ĐIỂM KẾT QUẢ TỪNG NHIỆM VỤ TRONG THÁNG</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Segmented
              size="small"
              className="kpi-toggle-rounded"
              value={displayMode}
              onChange={(val) => setDisplayMode(val as "full" | "compact")}
              options={[
                { label: "Hiển thị đầy đủ", value: "full", icon: <TeamOutlined /> },
                { label: "Thu gọn", value: "compact", icon: <UserOutlined /> },
              ]}
              style={{
                textTransform: "none",
                letterSpacing: "normal",
              }}
            />
            {displayMode === "compact" && activeRoles && activeRoles.length > 1 && (
              <Select
                size="small"
                value={selectedCompactRole}
                onChange={(val) => setSelectedCompactRole(val)}
                options={activeRoles.map(r => ({ label: `Cấp: ${r.shortLabel || r.name}`, value: r.code }))}
                style={{ minWidth: 120, textTransform: "none", letterSpacing: "normal" }}
              />
            )}
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setViewBoTieuChiModalVisible(true)}
              style={{
                backgroundColor: "#ffffff",
                color: "#0f766e",
                fontWeight: 600,
                borderColor: "#ffffff",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Xem bộ tiêu chí đang dùng
            </Button>
          </div>
        </div>

        <Table
          className="table_component expand-table-body"
          columns={columns}
          dataSource={data}
          rowKey="key"
          bordered
          size="small"
          pagination={false}
          scroll={{ x: 'max-content', y: 1 }}
          rowClassName={(record) => {
            if (record.key.startsWith('group-total')) return 'bg-gray-100 font-bold';
            if (record.key.startsWith('group-')) return 'bg-blue-50';
            return '';
          }}
          components={TABLE_COMPONENTS}
        />
      </div>

      <div style={{ position: "relative", marginTop: "40px", marginBottom: "0px", "--table-header-top": tableHeaderTop } as React.CSSProperties}>
        <div style={{
          position: "sticky",
          top: headerStickyTop,
          zIndex: 20,
          height: "44px",
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)",
          color: "#fff",
          padding: "0 8px",
          fontSize: "15px",
          fontWeight: "700",
          borderRadius: "0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #67e8f9",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span>B. KẾT QUẢ THỰC HIỆN NHIỆM VỤ</span>
        </div>

        <Table
          className="table_component expand-table-body"
          columns={columnsB}
          dataSource={dataB}
          bordered
          size="small"
          rowKey="key"
          pagination={false}
          scroll={{ x: 'max-content', y: 1 }}
          components={TABLE_COMPONENTS}
        />

        <div style={{ marginTop: "20px", fontSize: "16px", paddingLeft: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Sau khi hoàn thành việc chấm điểm theo Bộ tiêu chí, điểm tiêu chí kết quả thực hiện nhiệm vụ tháng {selectedDot ? (dotDanhGiaOptions.find(d => d.value === selectedDot)?.label || "....") : "...."} là:
            {effectiveMergedRoleView ? (
              <span style={{ marginLeft: "20px", fontWeight: 700 }}>
                {roleScoresSummaryB.map((rs, idx) => (
                  <React.Fragment key={rs.role.code}>
                    {idx > 0 && <span style={{ color: "#64748b", margin: "0 8px" }}> - </span>}
                    <span style={{ color: rs.role.color }}>{rs.role.shortLabel}: {rs.finalScoreStr}</span>
                  </React.Fragment>
                ))}
              </span>
            ) : (
              <strong style={{ marginLeft: "20px" }}>{finalScoreStr}</strong>
            )}
          </span>
          {!hideSaveButton && !viewOnly && (
            <Button
              type="primary"
              size="large"
              className="hover:-translate-y-1 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderColor: "transparent",
                boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)",
                fontWeight: "700",
                padding: "0 40px",
                height: "48px",
                fontSize: "16px",
                borderRadius: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
              onClick={() => handleSaveTaskScores()}
            >
              Lưu kết quả
            </Button>
          )}
        </div>
      </div>

      {chonTieuChiVisible && (
        <ModalChonTieuChi
          visible={chonTieuChiVisible}
          onCancel={() => setChonTieuChiVisible(false)}
          onSelectMultiple={handleSelectTieuChi}
          idDotDanhGia={selectedDot}
          idLyLich={effectiveIdLyLich}
          donViId={phieuInfo?.donVi || currentUser?.donViId}
          initialSelectedNames={
            activeTaskId && activeProductIndex !== null && inlineTasks.find(t => t.id === activeTaskId)?.danhSachDauRa?.[activeProductIndex]?.tenTieuChi
              ? [inlineTasks.find(t => t.id === activeTaskId).danhSachDauRa[activeProductIndex].tenTieuChi]
              : []
          }
          tenNhiemVu={activeTaskId ? (inlineTasks.find(t => t.id === activeTaskId)?.tenNhiemVuDayDu || inlineTasks.find(t => t.id === activeTaskId)?.tenNhiemVuRutGon || "") : ""}
          tenSanPham={activeTaskId && activeProductIndex !== null ? inlineTasks.find(t => t.id === activeTaskId)?.danhSachDauRa?.[activeProductIndex]?.tenSanPhamDauRa : ""}
          relatedTieuChiIds={
            activeTaskId && activeProductIndex !== null
              ? inlineTasks.find(t => t.id === activeTaskId)?.danhSachDauRa
                ?.filter((_: any, i: number) => i !== activeProductIndex)
                ?.map((d: any) => d.tieuChiId)
                ?.filter(Boolean) || []
              : []
          }
        />
      )}

      <ModalNhapChiTietSanPham
        visible={productModalState.visible}
        onCancel={() => setProductModalState(prev => ({ ...prev, visible: false }))}
        onSave={handleSaveProductFromModal}
        initialData={productModalState.initialData}
        chucVuHeSo={chucVuHeSo}
        idDotDanhGia={selectedDot}
        tenNhiemVu={productModalState.tenNhiemVu}
        idLyLich={effectiveIdLyLich}
        donViId={phieuInfo?.donVi || currentUser?.donViId}
      />

      <KpiNoteModal
        visible={noteModalState.visible}
        value={noteModalState.value}
        readOnly={noteModalState.readOnly}
        viewOnly={viewOnly}
        onCancel={closeNoteModal}
        onSave={handleSaveNote}
      />

      <Modal
        title={<span style={{ color: "#ffffff", fontSize: "16px", fontWeight: 700, textTransform: "uppercase" }}>{infoModalTitle}</span>}
        closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
        styles={{
          header: { padding: "12px 24px", overflow: "hidden", borderRadius: "8px 8px 0 0", margin: 0, background: "#0355a2" },
        }}
        open={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setInfoModalVisible(false)} style={{ backgroundColor: "#0355a2", borderColor: "#0355a2", color: "#ffffff" }}>
            Đóng
          </Button>,
        ]}
      >
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{infoModalContent}</div>
      </Modal>

      <ModalXemBoTieuChi
        visible={viewBoTieuChiModalVisible}
        onClose={() => setViewBoTieuChiModalVisible(false)}
        idDotDanhGia={queryIdDot}
        donViId={currentUser?.departmentId}
      />

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#ffffff', fontSize: '18px' }} />
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }}>
              CHI TIẾT KẾT QUẢ ĐÁNH GIÁ THEO TỪNG CẤP THẨM QUYỀN
            </span>
          </div>
        }
        closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
        styles={{
          header: { padding: "14px 24px", overflow: "hidden", borderRadius: "8px 8px 0 0", margin: 0, background: "#0355a2" },
          body: { padding: 0 }
        }}
        open={evaluatorModalState.visible}
        onCancel={() => setEvaluatorModalState(prev => ({ ...prev, visible: false }))}
        width={1050}
        style={{ top: 20 }}
        footer={[
          <Button key="close" type="primary" onClick={() => setEvaluatorModalState(prev => ({ ...prev, visible: false }))} style={{ backgroundColor: '#0355a2', borderColor: '#0355a2', color: '#ffffff' }}>
            Đóng
          </Button>,
        ]}
      >
        {evaluatorModalState.record && (
          <div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Nhiệm vụ:</div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                  {evaluatorModalState.record.taskData?.tenNhiemVuDayDu || evaluatorModalState.record.taskData?.tenNhiemVuRutGon || evaluatorModalState.record.mieuTa || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Sản phẩm đầu ra:</div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0369a1' }}>
                  {evaluatorModalState.record.sanPham || evaluatorModalState.record.taskData?.danhSachDauRa?.[evaluatorModalState.record.productIndex]?.tenSanPhamDauRa || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Căn cứ chấm theo Bộ tiêu chí:</div>
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  {evaluatorModalState.record.canCu || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Điểm cơ sở:</div>
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  Điểm BTC: <strong style={{ color: '#0f766e' }}>{evaluatorModalState.record.diemBoTieuChi || 0}</strong>
                  {chucVuHeSo !== null && (
                    <span style={{ marginLeft: '8px' }}>
                      | Điểm hệ số ({formatDisplayScore(chucVuHeSo)}): <strong style={{ color: '#0f766e' }}>{evaluatorModalState.record.diemHeSo}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Table
              bordered
              size="small"
              pagination={false}
              components={EVALUATOR_MODAL_TABLE_COMPONENTS}
              dataSource={activeRoles.map((role) => {
                const normRole = normalizeRoleKey(role.code);
                const roleScore = evaluatorModalState.record?.scoresByRole?.[normRole] || evaluatorModalState.record?.scoresByRole?.[role.code] || {};
                return {
                  key: role.code,
                  role,
                  roleScore,
                };
              })}
              columns={[
                {
                  title: 'Cấp thẩm quyền',
                  dataIndex: 'role',
                  key: 'role',
                  width: 140,
                  align: 'center',
                  render: (role: EvaluatorRoleInfo) => (
                    <Tag
                      style={{
                        color: role.color,
                        backgroundColor: role.bgColor,
                        borderColor: role.color,
                        fontWeight: 700,
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '4px',
                      }}
                    >
                      {role.name || role.shortLabel}
                    </Tag>
                  ),
                },
                {
                  title: 'Người đánh giá',
                  key: 'evaluatorInfo',
                  width: 210,
                  render: (_: any, item: any) => {
                    const { role, roleScore } = item;
                    const tenNguoiDanhGia = roleScore?.tenNguoiDanhGia || (role.code === 'CaNhan' ? (phieuInfo?.tenNguoiDanhGia || phieuInfo?.tenNguoiDuocDanhGia || currentUser?.name || currentUser?.fullName || currentUser?.userName || 'Cá nhân') : '');
                    const userName = roleScore?.userName || (role.code === 'CaNhan' ? (phieuInfo?.userName || currentUser?.userName || '') : '');
                    const tenChucVu = roleScore?.tenChucVu || (role.code === 'CaNhan' ? (phieuInfo?.tenChucVu || currentUser?.tenChucVu || '') : '');

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
                          {tenNguoiDanhGia || 'Chưa có thông tin'}
                        </div>
                        {userName && (
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            Tài khoản: <span style={{ color: '#0284c7', fontWeight: 600 }}>@{userName}</span>
                          </div>
                        )}
                        {tenChucVu && (
                          <div style={{ fontSize: '11px', color: '#475569' }}>
                            Chức vụ: {tenChucVu}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  title: 'Chấm điểm số lượng',
                  children: [
                    {
                      title: 'Hoàn thành',
                      align: 'center',
                      width: 85,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemSoLuong_HoanThanh ?? item.roleScore?.soLuongHoanThanh;
                        return <span style={{ fontWeight: 600, color: '#16a34a' }}>{val !== undefined && val !== null ? formatDisplayScore(val) : '—'}</span>;
                      }
                    },
                    {
                      title: 'Không HT',
                      align: 'center',
                      width: 85,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemSoLuong_KhongHoanThanh ?? item.roleScore?.soLuongKhongHoanThanh;
                        return <span style={{ fontWeight: 600, color: Number(val) > 0 ? '#dc2626' : '#64748b' }}>{val !== undefined && val !== null ? formatDisplayScore(val) : '—'}</span>;
                      }
                    },
                    {
                      title: 'Điểm (%)',
                      align: 'center',
                      width: 85,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemSoLuong_Diem ?? item.roleScore?.soLuongPhanTram;
                        return <span style={{ fontWeight: 700, color: item.role.color }}>{val !== undefined && val !== null ? formatPercent(val) : '100%'}</span>;
                      }
                    },
                  ]
                },
                {
                  title: 'Chấm điểm chất lượng',
                  children: [
                    {
                      title: 'Không đạt',
                      align: 'center',
                      width: 80,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemChatLuong_KhongDat ?? item.roleScore?.soLanKhongDat;
                        return <span style={{ fontWeight: 600, color: Number(val) > 0 ? '#dc2626' : '#64748b' }}>{val !== undefined && val !== null ? formatDisplayScore(val) : '—'}</span>;
                      }
                    },
                    {
                      title: 'Còn lại',
                      align: 'center',
                      width: 80,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemChatLuong_SoDiemConLai ?? item.roleScore?.chatLuongConLai;
                        return <span style={{ fontWeight: 600, color: '#16a34a' }}>{val !== undefined && val !== null ? formatDisplayScore(val) : '—'}</span>;
                      }
                    },
                    {
                      title: 'Điểm (%)',
                      align: 'center',
                      width: 85,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemChatLuong_Diem ?? item.roleScore?.chatLuongPhanTram;
                        return <span style={{ fontWeight: 700, color: item.role.color }}>{val !== undefined && val !== null ? formatPercent(val) : '100%'}</span>;
                      }
                    },
                  ]
                },
                {
                  title: 'Chấm điểm tiến độ',
                  children: [
                    {
                      title: 'Chậm',
                      align: 'center',
                      width: 75,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemTienDo_KhongDat ?? item.roleScore?.soLanCham;
                        return <span style={{ fontWeight: 600, color: Number(val) > 0 ? '#dc2626' : '#64748b' }}>{val !== undefined && val !== null ? formatDisplayScore(val) : '—'}</span>;
                      }
                    },
                    {
                      title: 'Còn lại',
                      align: 'center',
                      width: 80,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemTienDo_SoDiemConLai ?? item.roleScore?.tienDoConLai;
                        return <span style={{ fontWeight: 600, color: '#16a34a' }}>{val !== undefined && val !== null ? formatDisplayScore(val) : '—'}</span>;
                      }
                    },
                    {
                      title: 'Điểm (%)',
                      align: 'center',
                      width: 85,
                      render: (_: any, item: any) => {
                        const val = item.roleScore?.chamDiemTienDo_Diem ?? item.roleScore?.tienDoPhanTram;
                        return <span style={{ fontWeight: 700, color: item.role.color }}>{val !== undefined && val !== null ? formatPercent(val) : '100%'}</span>;
                      }
                    },
                  ]
                },
                {
                  title: 'Ghi chú / Giải trình',
                  key: 'ghiChu',
                  width: 150,
                  render: (_: any, item: any) => {
                    const note = item.roleScore?.ghiChuGiaTrinh || item.roleScore?.ghiChu;
                    return <div style={{ fontSize: '12px', color: note ? '#334155' : '#94a3b8' }}>{note || '—'}</div>;
                  }
                }
              ]}
            />
          </div>
        )}
      </Modal>
    </Card>
  );
}
