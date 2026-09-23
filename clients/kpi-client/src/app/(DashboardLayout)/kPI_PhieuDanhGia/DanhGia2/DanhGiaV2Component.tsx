"use client";
import "@/app/(DashboardLayout)/kPI_PhieuDanhGia/DanhGia/[id]/DanhGia.css";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Card, Table, Typography, Button, Space, InputNumber, Row, Col, Input, Alert, Switch, Modal, Spin, Empty, Collapse, Radio, Tag } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";
import kPI_LyLich2CService from "@/services/kPI_LyLich2C/kPI_LyLich2CService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import kPI_TieuChiChung_DiemSoService from "@/services/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSoService";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import {
  KPI_TieuChiChung_DiemSoDanhSachKeThuaResponse,
  KPI_TieuChiChung_DiemSoKeThuaSource,
  KPI_TieuChiChung_DiemSoKeThuaTreeNode,
} from "@/types/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSo";

const { Title, Text } = Typography;

export type SupervisorColumnConfig = {
  role: string;
  title: string;
  scores: Record<string, number | null | undefined>;
  canEdit: boolean;
  total?: number;
  onScoreInput?: (id: string, value: number | null) => void;
  onScoreChange?: (id: string, value: number | null) => void;
};

export type MultiCapSummaryRole = {
  role: string;
  title: string;
  diemTieuChiChung: number | null;
  diemThucHienNhiemVu: number | null;
  tongDiem: number | null;
  isEditing?: boolean;
  hasEvaluated?: boolean;
};

export type DanhGiaV2PageProps = {
  params?: { id: string };
  searchParams?: any;
  extraSectionIContent?: React.ReactNode;
  hideSaveButton?: boolean;
  saveRef?: React.MutableRefObject<any> | ((fn: any) => void);
  hideHeader?: boolean;
  idPhieu?: string;
  idDot?: string;
  idLyLich?: string;
  isModal?: boolean;
  viewOnly?: boolean;
  silentSave?: boolean;
  vaiTroDanhGia?: string;
  selfScoreTitle?: string;
  showPtpColumn?: boolean;
  supervisorScoreTitle?: string;
  ptpScores?: Record<string, number | null | undefined>;
  ptpCanEdit?: boolean;
  ptpTotal?: number;
  onPtpScoreInput?: (id: string, value: number | null) => void;
  onPtpScoreChange?: (id: string, value: number | null) => void;
  supervisorColumns?: SupervisorColumnConfig[];
  multiCapSummaryRoles?: MultiCapSummaryRole[];
  scorePrecision?: number;
  scoreStep?: number;
  showCollapseAllToggle?: boolean;
  canInheritScores?: boolean;
  diemThucHienNhiemVuProp?: number;
};

type PtpScoreInputProps = {
  value: number;
  max: number;
  disabled: boolean;
  precision?: number;
  step?: number;
  onInput?: (value: number | null) => void;
  onCommit?: (value: number | null) => void;
};

const normalizeScoreValue = (
  value: number | null | undefined,
  precision: number,
  min = 0,
  max?: number,
) => {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return value;
  const roundedValue = Number(Number(value).toFixed(precision));
  const boundedMin = Math.max(min, roundedValue);
  const boundedValue = max !== undefined && Number.isFinite(max) ? Math.min(max, boundedMin) : boundedMin;
  return Number(boundedValue.toFixed(precision));
};

const PtpScoreInput = React.memo(function PtpScoreInput({
  value,
  max,
  disabled,
  precision = 2,
  step = 0.01,
  onInput,
  onCommit,
}: PtpScoreInputProps) {
  const [draftValue, setDraftValue] = useState<number | null>(() => normalizeScoreValue(value, precision, 0, max) ?? null);
  const isEditingRef = useRef(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (!isEditingRef.current) {
      setDraftValue(normalizeScoreValue(value, precision, 0, max) ?? null);
    }
  }, [value, max, precision]);

  const handleChange = useCallback((nextValue: number | null) => {
    isEditingRef.current = true;
    const cleanValue = normalizeScoreValue(nextValue, precision, 0, max) ?? null;
    setDraftValue(cleanValue);
    onInput?.(cleanValue);
  }, [max, onInput, precision]);

  const handleBlur = useCallback(() => {
    isEditingRef.current = false;
    onCommit?.(normalizeScoreValue(draftValue, precision, 0, max) ?? null);
  }, [draftValue, max, onCommit, precision]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    isEditingRef.current = true;
    if (draftValue === 0) {
      requestAnimationFrame(() => event.target.select());
    }
  }, [draftValue]);

  React.useLayoutEffect(() => {
    if (isEditingRef.current && inputRef.current) {
      const domInput = inputRef.current.input || inputRef.current.nativeElement || inputRef.current;
      if (domInput && document.activeElement !== domInput) {
        domInput.focus?.();
      }
    }
  });

  return (
    <InputNumber
      ref={inputRef}
      min={0}
      max={max}
      precision={precision}
      step={step}
      value={draftValue === null ? undefined : normalizeScoreValue(draftValue, precision, 0, max)}
      disabled={disabled}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      formatter={(v: any) => {
        if (v === null || v === undefined || v === "") return "";
        const num = Number(v);
        if (!Number.isFinite(num)) return `${v}`;
        return String(normalizeScoreValue(num, precision, 0, max));
      }}
      parser={(displayValue: any) => {
        if (!displayValue) return "" as any;
        const clean = String(displayValue).replace(/,/g, ".");
        const num = Number(clean);
        return (Number.isFinite(num) ? normalizeScoreValue(num, precision, 0, max) : clean) as any;
      }}
      style={{ width: "100%" }}
      className="[&_input]:!text-center"
    />
  );
});

type SelfScoreInputProps = {
  value: number;
  max: number;
  disabled: boolean;
  precision?: number;
  step?: number;
  onChange: (value: number | null) => void;
};

const SelfScoreInput = React.memo(function SelfScoreInput({
  value,
  max,
  disabled,
  precision = 2,
  step = 0.01,
  onChange,
}: SelfScoreInputProps) {
  const [draftValue, setDraftValue] = useState<number | null>(() => normalizeScoreValue(value, precision, 0, max) ?? null);
  const isEditingRef = useRef(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (!isEditingRef.current) {
      setDraftValue(normalizeScoreValue(value, precision, 0, max) ?? null);
    }
  }, [value, max, precision]);

  const handleChange = useCallback((nextValue: number | null) => {
    isEditingRef.current = true;
    const cleanVal = normalizeScoreValue(nextValue, precision, 0, max) ?? null;
    setDraftValue(cleanVal);
    onChange(cleanVal);
  }, [max, onChange, precision]);

  const handleBlur = useCallback(() => {
    isEditingRef.current = false;
    onChange(normalizeScoreValue(draftValue, precision, 0, max) ?? null);
  }, [draftValue, max, onChange, precision]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    isEditingRef.current = true;
    if (draftValue === 0) {
      requestAnimationFrame(() => event.target.select());
    }
  }, [draftValue]);

  React.useLayoutEffect(() => {
    if (isEditingRef.current && inputRef.current) {
      const domInput = inputRef.current.input || inputRef.current.nativeElement || inputRef.current;
      if (domInput && document.activeElement !== domInput) {
        domInput.focus?.();
      }
    }
  });

  return (
    <InputNumber
      ref={inputRef}
      min={0}
      max={max}
      precision={precision}
      step={step}
      value={draftValue === null ? undefined : normalizeScoreValue(draftValue, precision, 0, max)}
      disabled={disabled}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      formatter={(v: any) => {
        if (v === null || v === undefined || v === "") return "";
        const num = Number(v);
        if (!Number.isFinite(num)) return `${v}`;
        return String(normalizeScoreValue(num, precision, 0, max));
      }}
      parser={(displayValue: any) => {
        if (!displayValue) return "" as any;
        const clean = String(displayValue).replace(/,/g, ".");
        const num = Number(clean);
        return (Number.isFinite(num) ? normalizeScoreValue(num, precision, 0, max) : clean) as any;
      }}
      style={{ width: "100%" }}
      className="[&_input]:!text-center"
    />
  );
});

const SECTION1_TABLE_COMPONENTS = {
  header: {
    cell: (props: any) => (
      <th {...props} style={{ ...props.style, textAlign: 'center', background: '#0355a2', color: '#fff', border: '1px solid #3b82f6', padding: '8px 4px', fontSize: '13px', fontWeight: 600 }}>
        {props.children}
      </th>
    ),
  },
};

const getInheritanceSourceKey = (source: KPI_TieuChiChung_DiemSoKeThuaSource, index: number) =>
  source.idPhieuDanhGia || source.idDotDanhGia || String(index);

const collectInheritanceLeafScores = (
  nodes: KPI_TieuChiChung_DiemSoKeThuaTreeNode[],
  scores: Array<{ id: string; score: number }> = [],
) => {
  nodes.forEach((node) => {
    if (node.children?.length) {
      collectInheritanceLeafScores(node.children, scores);
      return;
    }

    if (node.idTieuChiChung) {
      const score = Number(node.diemTuCham);
      scores.push({
        id: node.idTieuChiChung,
        score: Number.isFinite(score) ? score : 0,
      });
    }
  });

  return scores;
};

const collectTreeLeafIds = (nodes: any[], ids: string[] = []) => {
  nodes.forEach((node) => {
    if (node.children?.length) {
      collectTreeLeafIds(node.children, ids);
      return;
    }

    const id = node.id || node.idTieuChiChung;
    if (id) {
      ids.push(String(id));
    }
  });

  return ids;
};

export default function DanhGiaV2Component({
  params,
  searchParams: sp,
  extraSectionIContent,
  hideSaveButton,
  saveRef,
  hideHeader,
  idPhieu: idPhieuProp,
  idDot: idDotProp,
  idLyLich: idLyLichProp,
  isModal,
  viewOnly = false,
  silentSave = false,
  vaiTroDanhGia,
  selfScoreTitle = "Điểm do cá nhân tự chấm",
  showPtpColumn = false,
  supervisorScoreTitle = "PTP đánh giá",
  ptpScores = {},
  ptpCanEdit = false,
  ptpTotal = 0,
  onPtpScoreInput,
  onPtpScoreChange,
  supervisorColumns,
  multiCapSummaryRoles,
  scorePrecision = 2,
  scoreStep = 0.01,
  showCollapseAllToggle = false,
  canInheritScores,
  diemThucHienNhiemVuProp,
}: DanhGiaV2PageProps) {
  const router = useRouter();
  const user = useSelector((state: any) => state.auth.User);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [lyLichInfo, setLyLichInfo] = useState<any>(null);
  const [hasLoadedLyLich, setHasLoadedLyLich] = useState(false);
  const [dotDanhGiaInfo, setDotDanhGiaInfo] = useState<any>(null);
  const [phieuDanhGiaInfo, setPhieuDanhGiaInfo] = useState<any>(null);
  const [expandedKeys, setExpandedKeys] = useState<readonly React.Key[]>([]);
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);
  const [isInheritanceModalOpen, setIsInheritanceModalOpen] = useState(false);
  const [inheritanceData, setInheritanceData] = useState<KPI_TieuChiChung_DiemSoDanhSachKeThuaResponse | null>(null);
  const [inheritanceLoading, setInheritanceLoading] = useState(false);
  const [inheritanceError, setInheritanceError] = useState<string | null>(null);
  const [selectedInheritanceSourceKey, setSelectedInheritanceSourceKey] = useState<string | undefined>();
  const inheritanceRequestIdRef = useRef(0);
  const searchParams = useSearchParams();
  const effectiveIdPhieu = idPhieuProp || searchParams?.get("idPhieu") || searchParams?.get("idPhieuDanhGia");
  const effectiveIdDot = idDotProp || searchParams?.get("idDot") || searchParams?.get("idDotDanhGia") || (params?.id !== effectiveIdPhieu ? params?.id : undefined);

  const isReadOnly = viewOnly || Boolean(phieuDanhGiaInfo?.trangThai && phieuDanhGiaInfo.trangThai !== "KhoiTao" && phieuDanhGiaInfo.trangThai !== "TraVe");
  // Cờ từ màn hình cha xác định quyền sở hữu phiếu; trạng thái read-only vẫn
  // luôn là điều kiện chặn cuối cùng để nút không xuất hiện ở chế độ xem.
  const canUseScoreInheritance = !isReadOnly && (canInheritScores ?? true);

  const [uuDiem, setUuDiem] = useState("");
  const [hanChe, setHanChe] = useState("");
  const [yKienNhanXet, setYKienNhanXet] = useState("");
  const [diemThucHienNhiemVu, setDiemThucHienNhiemVu] = useState<number>(() => diemThucHienNhiemVuProp ?? 0);

  useEffect(() => {
    if (diemThucHienNhiemVuProp !== undefined) {
      setDiemThucHienNhiemVu(diemThucHienNhiemVuProp);
    }
  }, [diemThucHienNhiemVuProp]);

  // State điểm chỉ nên chứa tiêu chí lá. Vẫn lọc lại ở đây để dữ liệu cũ
  // (ví dụ score của bộ tiêu chí đã thay thế) không thể làm sai tổng/payload.
  const leafCriterionIdSet = useMemo(
    () => new Set(collectTreeLeafIds(treeData).map((id) => id.toLowerCase())),
    [treeData]
  );

  const totalTieuChiChung = useMemo(() => {
    return Object.entries(scores).reduce((sum, [id, score]) => {
      return leafCriterionIdSet.has(id.toLowerCase()) ? sum + (Number(score) || 0) : sum;
    }, 0);
  }, [scores, leafCriterionIdSet]);

  const allTreeKeys = useMemo(() => {
    const keys: React.Key[] = [];
    const collectKeys = (nodes: any[]) => {
      nodes.forEach((node) => {
        keys.push(node.id);
        if (node.children?.length) collectKeys(node.children);
      });
    };
    collectKeys(treeData);
    return keys;
  }, [treeData]);

  const formatDisplayScore = (value: any) => {
    if (value === null || value === undefined || value === "") return "";
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return String(value);
    return Number(numberValue.toFixed(2)).toString();
  };

  useEffect(() => {
    const targetIdLyLich = idLyLichProp || user?.idLyLich || user?.lyLichId || user?.id;
    if ((targetIdLyLich && effectiveIdDot) || effectiveIdPhieu) {
      fetchData();
    }
  }, [user, effectiveIdDot, effectiveIdPhieu, idLyLichProp]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let targetIdLyLich = idLyLichProp || user?.idLyLich || user?.lyLichId || user?.id;
      let targetDotId = idDotProp || searchParams?.get("idDot") || searchParams?.get("idDotDanhGia") || (params?.id !== effectiveIdPhieu ? params?.id : undefined);

      if (effectiveIdPhieu) {
        const resPhieu = await kPI_PhieuDanhGiaService.getById(effectiveIdPhieu);
        if (resPhieu?.data) {
          const phieu = resPhieu.data;
          setPhieuDanhGiaInfo(phieu);
          setUuDiem(phieu.uuDiem || "");
          setHanChe(phieu.hanChe || "");
          setYKienNhanXet(phieu.yKienNhanXet || "");
          setDiemThucHienNhiemVu(phieu.diemThucHienNhiemVu || 0);
          if (phieu.idLyLich) {
            targetIdLyLich = phieu.idLyLich;
          }
          if (phieu.idDotDanhGia) {
            targetDotId = phieu.idDotDanhGia;
          }
        }
      } else if (targetDotId) {
        const res = await kPI_PhieuDanhGiaService.getData({
          pageIndex: 1,
          pageSize: 1,
          idLyLich: targetIdLyLich,
          idDotDanhGia: targetDotId
        });
        if (res?.data?.items?.length > 0) {
          const phieu = res.data.items[0];
          setPhieuDanhGiaInfo(phieu);
          setUuDiem(phieu.uuDiem || "");
          setHanChe(phieu.hanChe || "");
          setYKienNhanXet(phieu.yKienNhanXet || "");
          setDiemThucHienNhiemVu(phieu.diemThucHienNhiemVu || 0);
        }
      }

      await Promise.all([
        fetchCriteria(targetIdLyLich, targetDotId || undefined, effectiveIdPhieu || undefined),
        fetchLyLich(targetIdLyLich),
        fetchDotDanhGia(targetDotId || undefined)
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLyLich = async (targetId: string) => {
    if (targetId) {
      setHasLoadedLyLich(false);
      setLyLichInfo(null);
      try {
        const res = await kPI_LyLich2CService.getById(targetId);
        if (res && res.data) {
          setLyLichInfo(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setHasLoadedLyLich(true);
      }
    }
  };

  const fetchDotDanhGia = async (targetDotId?: string | null) => {
    const dotId = targetDotId || effectiveIdDot;
    if (dotId) {
      try {
        const res = await kPI_DotTheoDoiDanhGiaService.getById(dotId);
        if (res && res.data) {
          setDotDanhGiaInfo(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const fetchCriteria = async (targetIdLyLich: string, targetDotId?: string | null, targetPhieuId?: string | null) => {
    setLoading(true);
    try {
      const dotId = targetDotId || effectiveIdDot || "";
      const phieuId = targetPhieuId || effectiveIdPhieu || undefined;
      const res = await kPI_TieuChiChungService.getTreeDataForDot(
        dotId,
        targetIdLyLich,
        phieuId
      );
      if (res && res.data) {
        const tree = res.data;

        const allIds: string[] = [];
        const loadedScores: Record<string, number> = {};

        const extractData = (nodes: any[]) => {
          nodes.forEach((node) => {
            allIds.push(node.id);
            const isLeaf = !node.children || node.children.length === 0;
            if (isLeaf) {
              // Mọi tiêu chí lá phải có mặt trong payload lưu, kể cả khi
              // người dùng chưa nhập và điểm đang hiển thị là 0. Nếu chỉ
              // gửi các dòng > 0 thì PTP không có Id điểm cá nhân để lưu.
              loadedScores[node.id] = node.diemTuCham ?? 0;
            }
            if (node.children && node.children.length > 0) {
              extractData(node.children);
            }
          });
        };
        extractData(tree);

        setExpandedKeys(isAllCollapsed ? [] : allIds);
        setTreeData(tree);
        setScores(loadedScores);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = useCallback((id: string, value: number | null) => {
    setScores((prev) => (prev[id] === (value || 0) ? prev : { ...prev, [id]: value || 0 }));
  }, []);

  const handleCollapseAllChange = useCallback((collapsed: boolean) => {
    setIsAllCollapsed(collapsed);
    setExpandedKeys(collapsed ? [] : allTreeKeys);
  }, [allTreeKeys]);

  const inheritanceSources = inheritanceData?.danhSachNguon ?? [];
  const selectedInheritanceSource = useMemo(
    () => inheritanceSources.find(
      (source, index) => getInheritanceSourceKey(source, index) === selectedInheritanceSourceKey
    ),
    [inheritanceSources, selectedInheritanceSourceKey]
  );

  const handleCloseInheritanceModal = useCallback(() => {
    inheritanceRequestIdRef.current += 1;
    setIsInheritanceModalOpen(false);
    setInheritanceData(null);
    setInheritanceLoading(false);
    setInheritanceError(null);
    setSelectedInheritanceSourceKey(undefined);
  }, []);

  const handleOpenInheritanceModal = useCallback(async () => {
    const requestId = inheritanceRequestIdRef.current + 1;
    inheritanceRequestIdRef.current = requestId;

    setIsInheritanceModalOpen(true);
    setInheritanceData(null);
    setInheritanceError(null);
    setSelectedInheritanceSourceKey(undefined);

    const idDotDanhGia = effectiveIdDot || phieuDanhGiaInfo?.idDotDanhGia;
    if (!idDotDanhGia) {
      setInheritanceLoading(false);
      setInheritanceError("Không xác định được đợt đánh giá hiện tại.");
      return;
    }

    setInheritanceLoading(true);
    try {
      const response = await kPI_TieuChiChung_DiemSoService.getDanhSachKeThua(idDotDanhGia);
      if (inheritanceRequestIdRef.current !== requestId) return;

      if (response?.status === false) {
        setInheritanceError(response.message || "Không thể tải danh sách điểm kế thừa.");
        return;
      }

      setInheritanceData(response?.data || {
        idBoTieuChiChung: "",
        tenBoTieuChiChung: "",
        danhSachNguon: [],
      });
    } catch (error: any) {
      if (inheritanceRequestIdRef.current !== requestId) return;
      setInheritanceError(
        typeof error === "string"
          ? error
          : error?.message || "Không thể tải danh sách điểm kế thừa."
      );
    } finally {
      if (inheritanceRequestIdRef.current === requestId) {
        setInheritanceLoading(false);
      }
    }
  }, [effectiveIdDot, phieuDanhGiaInfo?.idDotDanhGia]);

  const handleApplyInheritance = useCallback(() => {
    if (!selectedInheritanceSource) return;

    const inheritedLeafScores = collectInheritanceLeafScores(
      selectedInheritanceSource.cayTieuChi || []
    );
    const inheritedScoresById = new Map(
      inheritedLeafScores.map(({ id, score }) => [id.toLowerCase(), score])
    );
    const currentLeafIds = collectTreeLeafIds(treeData);

    setScores(() => {
      if (currentLeafIds.length === 0) {
        return inheritedLeafScores.reduce<Record<string, number>>((next, item) => {
          next[item.id] = item.score;
          return next;
        }, {});
      }

      return currentLeafIds.reduce<Record<string, number>>((next, id) => {
        next[id] = inheritedScoresById.get(id.toLowerCase()) ?? 0;
        return next;
      }, {});
    });

    handleCloseInheritanceModal();
    toast.success("Đã kế thừa điểm tiêu chí chung. Hãy lưu phiếu để lưu thay đổi.");
  }, [handleCloseInheritanceModal, selectedInheritanceSource, treeData]);

  const handleSave = async () => {
    const idLyLich = idLyLichProp || phieuDanhGiaInfo?.idLyLich || user?.idLyLich || user?.lyLichId || user?.id;
    const targetDotId = idDotProp || params?.id;
    if (!idLyLich || !targetDotId) {
      toast.error("Không đủ thông tin để lưu!");
      return { error: true, message: "Không đủ thông tin để lưu phiếu đánh giá!", section: "section1" };
    }

    const scoresToSave = Object.keys(scores)
      .filter(key => leafCriterionIdSet.has(key.toLowerCase()))
      .filter(key => scores[key] !== undefined && scores[key] !== null)
      .map(key => ({
        idTieuChiChung: key,
        diemTuCham: scores[key]
      }));

    try {
      setLoading(true);
      const response = await kPI_TieuChiChung_DiemSoService.saveScoresV2({
        idPhieuDanhGia: effectiveIdPhieu || undefined,
        idLyLich: idLyLich,
        idDotDanhGia: targetDotId || params?.id || "",
        uuDiem: uuDiem,
        hanChe: hanChe,
        yKienNhanXet: yKienNhanXet,
        diemTieuChiChung: totalTieuChiChung,
        diemThucHienNhiemVu: diemThucHienNhiemVu,
        tongDiem: totalTieuChiChung + diemThucHienNhiemVu,
        vaiTroDanhGia: vaiTroDanhGia,
        scores: scoresToSave
      });

      if (response.status) {
        if (!silentSave) {
          toast.success("Lưu đánh giá thành công!");
        }
        return response.data || true;
      } else {
        if (!silentSave) {
          toast.error(response.message || "Lưu đánh giá thất bại!");
        }
        return { error: true, message: response.message || "Lưu tiêu chí chung thất bại!", section: "section1" };
      }
    } catch (error) {
      console.error(error);
      if (!silentSave) {
        toast.error("Đã xảy ra lỗi khi lưu đánh giá.");
      }
      return { error: true, message: "Đã xảy ra lỗi khi lưu tiêu chí chung.", section: "section1" };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (saveRef) {
      if (typeof saveRef === "function") {
        saveRef(handleSave);
      } else {
        saveRef.current = handleSave;
      }
    }
  }, [saveRef, handleSave]);

  const attachTaskScoreChange = (element: React.ReactElement<any>): React.ReactElement<any> => {
    const children = element.props?.children;

    if (React.Children.count(children) === 0) {
      const originalHandler = element.props?.onTaskScoreChange;
      return React.cloneElement(element, {
        onTaskScoreChange: (...args: any[]) => {
          setDiemThucHienNhiemVu(args[0]);
          (originalHandler as any)?.(...args);
        },
      });
    }

    const renderedChildren = React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? attachTaskScoreChange(child as React.ReactElement<any>)
        : child,
    );

    return React.cloneElement(element, undefined, renderedChildren);
  };

  const renderedExtraSectionIContent = React.useMemo(() => {
    if (!React.isValidElement(extraSectionIContent)) return extraSectionIContent;
    return attachTaskScoreChange(extraSectionIContent as React.ReactElement<any>);
  }, [extraSectionIContent]);

  const columns = React.useMemo(() => [
    {
      title: "TT",
      dataIndex: "stt",
      key: "stt",
      align: "center" as const,
      width: 80,
      render: (text: string, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        return <span style={{ fontWeight: hasChildren ? "bold" : "normal", whiteSpace: "nowrap" }}>{text}</span>;
      }
    },
    {
      title: "Tiêu chí chấm điểm",
      dataIndex: "ten",
      key: "ten",
      render: (text: string, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        return <span style={{ fontWeight: hasChildren ? "bold" : "normal" }}>{text}</span>;
      }
    },
    {
      title: "Điểm tối đa",
      dataIndex: "myProperty",
      key: "maxScore",
      align: "center" as const,
      width: 100,
      render: (text: any, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        return <span style={{ fontWeight: hasChildren ? "bold" : "normal" }}>{text}</span>;
      }
    },
    {
      title: canUseScoreInheritance ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span>{selfScoreTitle}</span>
          <Button
            size="small"
            onClick={handleOpenInheritanceModal}
            style={{ fontSize: 12, lineHeight: "20px", height: 22, padding: "0 8px", whiteSpace: "nowrap" }}
          >
            Kế thừa điểm
          </Button>
        </div>
      ) : selfScoreTitle,
      key: "selfScore",
      align: "center" as const,
      width: canUseScoreInheritance ? 170 : 140,
      render: (_: any, record: any) => {
        const hasChildren = record.children && record.children.length > 0;
        if (hasChildren) {
          return null;
        }
        return (
          <SelfScoreInput
            max={record.myProperty ? parseFloat(record.myProperty) : 100}
            value={scores[record.id] || 0}
            disabled={isReadOnly}
            precision={scorePrecision}
            step={scoreStep}
            onChange={(val) => handleScoreChange(record.id, val)}
          />
        );
      },
    },
    ...(supervisorColumns && supervisorColumns.length > 0
      ? supervisorColumns.map((col) => ({
          title: col.title,
          key: `supervisorScore_${col.role}`,
          align: "center" as const,
          width: 140,
          render: (_: any, record: any) => {
            const hasChildren = record.children && record.children.length > 0;
            if (hasChildren) {
              return null;
            }

            if (!col.canEdit && (col.scores[record.id] === null || col.scores[record.id] === undefined)) {
              return <span style={{ color: "#9ca3af" }}>—</span>;
            }

            return (
              <PtpScoreInput
                value={col.scores[record.id] ?? 0}
                max={record.myProperty ? parseFloat(record.myProperty) : 100}
                disabled={!col.canEdit}
                precision={scorePrecision}
                step={scoreStep}
                onInput={(val) => {
                  if (col.canEdit) {
                    col.onScoreInput?.(record.id, val);
                  }
                }}
                onCommit={(val) => {
                  if (col.canEdit) {
                    col.onScoreChange?.(record.id, val);
                  }
                }}
              />
            );
          },
        }))
      : showPtpColumn
        ? [
            {
              title: supervisorScoreTitle,
              key: "ptpScore",
              align: "center" as const,
              width: 140,
              render: (_: any, record: any) => {
                const hasChildren = record.children && record.children.length > 0;
                if (hasChildren) {
                  return null;
                }

                if (!ptpCanEdit && (ptpScores[record.id] === null || ptpScores[record.id] === undefined)) {
                  return <span style={{ color: "#9ca3af" }}>—</span>;
                }

                return (
                  <PtpScoreInput
                    value={ptpScores[record.id] ?? 0}
                    max={record.myProperty ? parseFloat(record.myProperty) : 100}
                    disabled={!ptpCanEdit}
                    precision={scorePrecision}
                    step={scoreStep}
                    onInput={(val) => {
                      if (ptpCanEdit) {
                        onPtpScoreInput?.(record.id, val);
                      }
                    }}
                    onCommit={(val) => {
                      if (ptpCanEdit) {
                        onPtpScoreChange?.(record.id, val);
                      }
                    }}
                  />
                );
              },
            },
          ]
        : []),
  ], [
    selfScoreTitle,
    scores,
    isReadOnly,
    handleScoreChange,
    supervisorColumns,
    showPtpColumn,
    supervisorScoreTitle,
    ptpScores,
    ptpCanEdit,
    onPtpScoreInput,
    onPtpScoreChange,
    scorePrecision,
    scoreStep,
  ]);
  const effectiveMultiCapSummary = useMemo(() => {
    if (!multiCapSummaryRoles || multiCapSummaryRoles.length <= 1) return null;
    return multiCapSummaryRoles.map((r) => {
      const isRoleActive = r.hasEvaluated || r.isEditing;
      let liveTcc: number | null = r.diemTieuChiChung ?? null;
      if (r.role === "CaNhan") {
        liveTcc = totalTieuChiChung;
      } else if (isRoleActive) {
        const col = supervisorColumns?.find((c) => c.role === r.role);
        if (col && col.scores && Object.keys(col.scores).length > 0) {
          liveTcc = Object.entries(col.scores).reduce<number>((sum, [criterionId, value]) => {
            return leafCriterionIdSet.has(criterionId.toLowerCase())
              ? sum + (Number(value) || 0)
              : sum;
          }, 0);
        } else if (r.isEditing && ptpScores && Object.keys(ptpScores).length > 0) {
          liveTcc = Object.entries(ptpScores).reduce<number>((sum, [criterionId, value]) => {
            return leafCriterionIdSet.has(criterionId.toLowerCase())
              ? sum + (Number(value) || 0)
              : sum;
          }, 0);
        }
      } else {
        liveTcc = null;
      }
      const liveTask = isRoleActive ? (r.diemThucHienNhiemVu ?? null) : null;
      const liveTong = (liveTcc !== null && liveTask !== null && liveTcc !== undefined && liveTask !== undefined)
        ? liveTcc + liveTask
        : null;
      return {
        ...r,
        diemTieuChiChung: liveTcc,
        diemThucHienNhiemVu: liveTask,
        tongDiem: liveTong,
      };
    });
  }, [multiCapSummaryRoles, totalTieuChiChung, supervisorColumns, leafCriterionIdSet, ptpScores]);

  const headerStickyTop = isModal ? "0px" : "106px";
  const tableHeaderTop = isModal ? "44px" : "150px";
  const isViewingSpecificPhieu = Boolean(idLyLichProp || effectiveIdPhieu || phieuDanhGiaInfo?.idLyLich);
  const profileFallback = isViewingSpecificPhieu
    ? (hasLoadedLyLich ? "Chưa cập nhật" : "Đang tải dữ liệu...")
    : undefined;
  const phieuDonVi = phieuDanhGiaInfo?.tenPhongBan
    ? [phieuDanhGiaInfo.tenPhongBan, phieuDanhGiaInfo.tenDonVi].filter(Boolean).join(" - ")
    : phieuDanhGiaInfo?.tenDonVi;
  const lyLichDonVi = lyLichInfo?.phongBanName
    ? [lyLichInfo.phongBanName, lyLichInfo.donViSuDungName].filter(Boolean).join(" - ")
    : lyLichInfo?.donViSuDungName;

  return (
    <div className={isModal ? "bg-gray-50" : ""} style={{ padding: 0 }}>
      {!hideHeader && (
        <div className="mb-2">
          <AutoBreadcrumb />
        </div>
      )}
      <Card className="customCardShadow" style={{ marginBottom: 20 }}>
        {!hideHeader && (
          <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
              <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
                Quay lại
              </Button>
            </Col>
          </Row>
        )}
        {isReadOnly && !viewOnly && (
          <Alert
            type="warning"
            showIcon
            message="Phiếu đánh giá đã bắt đầu luồng luân chuyển, bạn chỉ có thể xem chi tiết mà không thể chỉnh sửa."
            style={{ marginBottom: 20 }}
          />
        )}
        <div style={{ textAlign: "center", marginBottom: 0 }}>
          <Title level={3} style={{ color: "#0355a2", textTransform: "uppercase", marginBottom: 10 }}>PHIẾU THEO DÕI, ĐÁNH GIÁ CÔNG CHỨC</Title>
          <Text italic>(Kỳ theo dõi, đánh giá: <strong>{dotDanhGiaInfo?.tenDotTheoDoiDanhGia || "..........."}</strong>)</Text>
        </div>
        <div style={{ fontSize: 16 }}>
          <p style={{ marginBottom: 8 }}><strong>Họ và tên:</strong> {lyLichInfo?.hoTen || phieuDanhGiaInfo?.hoTen || profileFallback || user?.name || "Chưa cập nhật"}</p>
          <p style={{ marginBottom: 8 }}><strong>Chức vụ, chức danh:</strong> {lyLichInfo?.chucVuHienTaiName || lyLichInfo?.chucDanh || lyLichInfo?.chucVuHienTai || profileFallback || user?.tenChucVu || "Chưa cập nhật"}</p>
          <p style={{ marginBottom: 0 }}><strong>Đơn vị công tác:</strong> {lyLichDonVi || phieuDonVi || profileFallback || user?.tenDonVi_txt || "Chưa cập nhật"}</p>
        </div>
      </Card>

      <div style={{ position: "relative", marginBottom: 0, "--table-header-top-section1": tableHeaderTop } as React.CSSProperties}>
        <div style={{
          position: "sticky",
          top: headerStickyTop,
          zIndex: 99,
          height: "44px",
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
          color: "#fff",
          padding: "0 8px",
          fontSize: "15px",
          fontWeight: "700",
          borderRadius: "0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #fdba74",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span>I. KẾT QUẢ THEO DÕI, ĐÁNH GIÁ THEO TIÊU CHÍ CHUNG</span>
          {showCollapseAllToggle && (
            <Space size={6} style={{ textTransform: "none", letterSpacing: 0 }}>
              <span>Thu gọn tất cả</span>
              <Switch
                checked={isAllCollapsed}
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
                onChange={handleCollapseAllChange}
              />
            </Space>
          )}
        </div>

        {treeData.length > 0 ? (
          <Table
            className="table_component expand-table-body-section1"
            columns={columns}
            dataSource={treeData}
            rowKey="id"
            rowClassName={(record) => record.children && record.children.length > 0 ? "parent-row" : ""}
            pagination={false}
            bordered
            size="small"
            loading={loading}
            scroll={{ y: 1 }}
            expandable={{
              expandedRowKeys: expandedKeys,
              onExpandedRowsChange: (keys) => {
                setExpandedKeys(keys);
                setIsAllCollapsed(keys.length === 0);
              },
              expandIconColumnIndex: 1,
            }}
            components={SECTION1_TABLE_COMPONENTS}
            summary={(pageData) => {
              let totalMaxScore = 0;
              pageData.forEach((record: any) => {
                totalMaxScore += parseFloat(record.myProperty || "0");
              });
              const totalSelfScore = totalTieuChiChung;
              return (
                <Table.Summary.Row style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
                  <Table.Summary.Cell index={0} colSpan={2} align="center">
                    Tổng cộng
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    {formatDisplayScore(totalMaxScore)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    {formatDisplayScore(totalSelfScore)}
                  </Table.Summary.Cell>
                  {showPtpColumn && (
                    <Table.Summary.Cell index={3} align="center">
                      {formatDisplayScore(ptpTotal)}
                    </Table.Summary.Cell>
                  )}
                </Table.Summary.Row>
              );
            }}
          />
        ) : (
          <Table
            className="table_component expand-table-body-section1"
            columns={columns}
            dataSource={[]}
            rowKey="id"
            pagination={false}
            bordered
            size="small"
            loading={loading}
            scroll={{ y: 1 }}
            components={SECTION1_TABLE_COMPONENTS}
          />
        )}
        {extraSectionIContent && (
          <div style={{ marginTop: "20px" }}>
            {renderedExtraSectionIContent}
          </div>
        )}
      </div>

      <div style={{ position: "relative", marginBottom: 0 }}>
        <div style={{
          position: "sticky",
          top: headerStickyTop,
          zIndex: 99,
          height: "44px",
          boxSizing: "border-box",
          background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
          color: "#fff",
          padding: "0 8px",
          fontSize: "15px",
          fontWeight: "700",
          borderRadius: "0",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #fdba74",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span>II. TỔNG HỢP KẾT QUẢ THEO DÕI, ĐÁNH GIÁ CÔNG CHỨC</span>
        </div>

        <Card className="shadow-sm border-slate-200" style={{ borderRadius: "0 0 8px 8px", borderTop: "none" }}>
          {effectiveMultiCapSummary && effectiveMultiCapSummary.length > 1 ? (
            <div style={{ marginTop: 15, marginBottom: 15 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#1e293b" }}>
                Tổng hợp kết quả đánh giá theo từng cấp thẩm quyền:
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#334155", fontWeight: 700, width: "32%" }}>Nội dung đánh giá</th>
                      {effectiveMultiCapSummary.map((r) => (
                        <th key={r.role} style={{ padding: "10px 14px", color: "#0355a2", fontWeight: 700, borderLeft: "1px solid #cbd5e1" }}>
                          {r.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600 }}>1. Điểm tiêu chí chung (30đ)</td>
                      {effectiveMultiCapSummary.map((r) => (
                        <td key={r.role} style={{ padding: "9px 14px", borderLeft: "1px solid #e2e8f0", fontWeight: 600, color: "#0891b2" }}>
                          {r.diemTieuChiChung !== null && r.diemTieuChiChung !== undefined ? `${formatDisplayScore(r.diemTieuChiChung)}/30` : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600 }}>2. Điểm tiêu chí kết quả thực hiện nhiệm vụ (70đ)</td>
                      {effectiveMultiCapSummary.map((r) => (
                        <td key={r.role} style={{ padding: "9px 14px", borderLeft: "1px solid #e2e8f0", fontWeight: 600, color: "#7c3aed" }}>
                          {r.diemThucHienNhiemVu !== null && r.diemThucHienNhiemVu !== undefined ? `${formatDisplayScore(r.diemThucHienNhiemVu)}/70` : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr style={{ background: "#f0fdf4", fontWeight: 700 }}>
                      <td style={{ padding: "11px 14px", textAlign: "left", color: "#166534", fontSize: "14px" }}>3. Tổng điểm theo dõi, đánh giá công chức (100đ)</td>
                      {effectiveMultiCapSummary.map((r) => (
                        <td key={r.role} style={{ padding: "11px 14px", borderLeft: "1px solid #e2e8f0", color: "#15803d", fontSize: "15px" }}>
                          {r.tongDiem !== null && r.tongDiem !== undefined ? (
                            <span>
                              {formatDisplayScore(r.tongDiem)}/100
                              {r.isEditing && (
                                <Tag color="processing" style={{ marginLeft: 6, fontSize: 11, verticalAlign: "middle" }}>Đang chấm</Tag>
                              )}
                            </span>
                          ) : (
                            <Tag color="warning" style={{ fontSize: 13, padding: "2px 8px" }}>Chưa đánh giá</Tag>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 15 }}>
              <p><strong>1. Điểm tiêu chí chung:</strong> {formatDisplayScore(totalTieuChiChung)}/30</p>
              <p><strong>2. Điểm tiêu chí kết quả thực hiện nhiệm vụ:</strong> {formatDisplayScore(diemThucHienNhiemVu)}/70</p>
              <p><strong>3. Tổng điểm theo dõi, đánh giá công chức:</strong> {formatDisplayScore(totalTieuChiChung + diemThucHienNhiemVu)}/100</p>
            </div>
          )}
          <div style={{ marginTop: 15 }}>
            <p><strong>4. Ưu điểm, kết quả đạt được:</strong></p>
            <Input.TextArea
              rows={4}
              value={uuDiem}
              disabled={isReadOnly}
              onChange={(e) => setUuDiem(e.target.value)}
              placeholder="Nhập ưu điểm, kết quả đạt được..."
            />
          </div>
          <div style={{ marginTop: 15 }}>
            <p><strong>5. Tồn tại, hạn chế và nguyên nhân:</strong></p>
            <Input.TextArea
              rows={4}
              value={hanChe}
              disabled={isReadOnly}
              onChange={(e) => setHanChe(e.target.value)}
              placeholder="Nhập tồn tại, hạn chế và nguyên nhân..."
            />
          </div>
          <div style={{ marginTop: 15 }}>
            <p><strong>6. Đề xuất, kiến nghị (nếu có):</strong></p>
            <Input.TextArea
              rows={4}
              value={yKienNhanXet}
              disabled={isReadOnly}
              onChange={(e) => setYKienNhanXet(e.target.value)}
              placeholder="Nhập đề xuất, kiến nghị..."
            />
          </div>
          {!isReadOnly && !hideSaveButton && (
            <div style={{ textAlign: "right", marginTop: 20 }}>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="large" style={{ fontWeight: 600, padding: "0 30px" }}>
                Lưu phiếu đánh giá
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Modal
        title="Kế thừa điểm tiêu chí chung"
        open={isInheritanceModalOpen}
        onCancel={handleCloseInheritanceModal}
        width={920}
        footer={[
          <Button key="close" onClick={handleCloseInheritanceModal}>
            Đóng
          </Button>,
          <Button
            key="apply"
            type="primary"
            onClick={handleApplyInheritance}
            disabled={!selectedInheritanceSource || inheritanceLoading}
            style={{ color: "#fff" }}
          >
            <span style={{ color: "#fff" }}>Kế thừa</span>
          </Button>,
        ]}
      >
        {inheritanceLoading ? (
          <div style={{ padding: "36px 0", textAlign: "center" }}>
            <Spin tip="Đang tải danh sách phiếu có thể kế thừa..." />
          </div>
        ) : inheritanceError ? (
          <Alert type="error" showIcon message={inheritanceError} />
        ) : inheritanceData ? (
          <div>
            {inheritanceData.tenBoTieuChiChung && (
              <Alert
                type="info"
                showIcon
                message={`Bộ tiêu chí hiện tại: ${inheritanceData.tenBoTieuChiChung}`}
                style={{ marginBottom: 16 }}
              />
            )}

            {inheritanceSources.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có phiếu cùng bộ tiêu chí phù hợp để kế thừa điểm."
              />
            ) : (
              <Collapse
                items={inheritanceSources.map((source, index) => {
                  const sourceKey = getInheritanceSourceKey(source, index);
                  const isSelected = selectedInheritanceSourceKey === sourceKey;

                  return {
                    key: sourceKey,
                    label: (
                      <Space size={8} wrap>
                        <Radio
                          checked={isSelected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => setSelectedInheritanceSourceKey(sourceKey)}
                        >
                          <span style={{ fontWeight: 600 }}>
                            {source.tenDotDanhGia || "Đợt đánh giá chưa có tên"}
                          </span>
                        </Radio>
                        <Text type="secondary">
                          Tổng điểm tiêu chí chung: {formatDisplayScore(source.tongDiemTieuChiChung)}
                        </Text>
                      </Space>
                    ),
                    children: (
                      <Table
                        columns={[
                          {
                            title: "TT",
                            dataIndex: "stt",
                            key: "stt",
                            width: 80,
                            align: "center" as const,
                            render: (value: string, record: KPI_TieuChiChung_DiemSoKeThuaTreeNode) => (
                              <span style={{ fontWeight: record.children?.length ? 600 : 400 }}>{value}</span>
                            ),
                          },
                          {
                            title: "Tiêu chí chấm điểm",
                            dataIndex: "ten",
                            key: "ten",
                            render: (value: string, record: KPI_TieuChiChung_DiemSoKeThuaTreeNode) => (
                              <span style={{ fontWeight: record.children?.length ? 600 : 400 }}>{value}</span>
                            ),
                          },
                          {
                            title: "Điểm tối đa",
                            dataIndex: "diemToiDa",
                            key: "diemToiDa",
                            width: 110,
                            align: "center" as const,
                            render: (value: number, record: KPI_TieuChiChung_DiemSoKeThuaTreeNode) => (
                              <span style={{ fontWeight: record.children?.length ? 600 : 400 }}>
                                {formatDisplayScore(value)}
                              </span>
                            ),
                          },
                          {
                            title: "Điểm tự chấm",
                            dataIndex: "diemTuCham",
                            key: "diemTuCham",
                            width: 120,
                            align: "center" as const,
                            render: (value: number, record: KPI_TieuChiChung_DiemSoKeThuaTreeNode) => (
                              <span style={{ fontWeight: record.children?.length ? 600 : 400 }}>
                                {formatDisplayScore(value)}
                              </span>
                            ),
                          },
                        ]}
                        dataSource={source.cayTieuChi || []}
                        rowKey="idTieuChiChung"
                        pagination={false}
                        bordered
                        size="small"
                        scroll={{ x: 640 }}
                        expandable={{
                          defaultExpandAllRows: true,
                          expandIconColumnIndex: 1,
                        }}
                      />
                    ),
                  };
                })}
              />
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
