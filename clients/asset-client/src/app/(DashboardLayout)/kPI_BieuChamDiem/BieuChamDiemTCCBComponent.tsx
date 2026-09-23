"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Table, Card, Input, TableProps, Typography, Spin, Modal, Button, Form, Space, Tooltip, Popconfirm, message, Switch } from "antd";
import { SearchOutlined, RightOutlined, EditOutlined, EyeOutlined, InfoCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import kPI_NhiemVuService from "@/services/kPI_NhiemVu/kPI_NhiemVuService";
import ModalNhapChiTietSanPhamTCCB from "./ModalNhapChiTietSanPhamTCCB";
import { isRomanNumeral } from "@/utils/string";

const { Title } = Typography;

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
  onTaskScoreChange?: (scoreOutOf70: number) => void;
  onIdPhieuChange?: (idPhieu: string) => void;
  silentSave?: boolean;
  vaiTroDanhGia?: string;
  isMultiCap?: boolean;
  isMergedRoleView?: boolean;
  currentTrangThai?: string;
};

const removeAccents = (str: string) => {
  if (!str) return "";
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

const HighlightText = ({ text, highlight }: { text?: string; highlight?: string }) => {
  if (!text) return null;
  if (!highlight) return <>{text}</>;

  const textStr = text.toString();
  const unaccentedText = removeAccents(textStr).toLowerCase();
  const unaccentedHighlight = removeAccents(highlight).toLowerCase();

  if (!unaccentedHighlight || unaccentedHighlight.trim() === '') return <>{textStr}</>;

  const parts = [];
  let currentIndex = 0;
  let matchIndex = unaccentedText.indexOf(unaccentedHighlight, currentIndex);

  if (matchIndex === -1) return <>{textStr}</>;

  while (matchIndex !== -1) {
    parts.push(textStr.substring(currentIndex, matchIndex));
    parts.push(
      <span key={matchIndex} style={{ backgroundColor: '#ffc069' }}>
        {textStr.substring(matchIndex, matchIndex + highlight.length)}
      </span>
    );
    currentIndex = matchIndex + highlight.length;
    matchIndex = unaccentedText.indexOf(unaccentedHighlight, currentIndex);
  }

  parts.push(textStr.substring(currentIndex));

  return <>{parts.map((part, i) => React.isValidElement(part) ? part : <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};

const renderInfoIcon = (title: string, content: React.ReactNode) => (
  <Tooltip title={<div style={{ fontSize: '12px', lineHeight: '1.4' }}>{content}</div>} placement="top">
    <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }} />
  </Tooltip>
);

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

const ColumnSearchInput = ({
  level,
  colName,
  currentValue,
  onSearch
}: {
  level: number,
  colName: string,
  currentValue: string,
  onSearch: (level: number, value: string) => void
}) => {
  const [val, setVal] = useState(currentValue || '');

  useEffect(() => {
    setVal(currentValue || '');
  }, [currentValue]);

  return (
    <Input
      placeholder={`Tìm ${colName.toLowerCase()}...`}
      allowClear
      prefix={<SearchOutlined style={{ color: '#ccc', marginRight: 4 }} />}
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        if (!e.target.value) onSearch(level, '');
      }}
      onPressEnter={() => onSearch(level, val)}
      onBlur={() => onSearch(level, val)}
      className="premium-search-input"
    />
  );
};

const calculateTaskScore = (details: Record<string, any>) => {
  const list = Object.values(details);
  if (list.length === 0) {
    return {
      sumBoTieuChi: 0,
      sumSlHoanThanh: 0,
      sumClConLai: 0,
      sumTdConLai: 0,
      percentSl: 0,
      percentCl: 0,
      percentTd: 0,
      avgPercent: 0,
      scoreOutOf70: 0,
      taskCount: 0,
    };
  }

  const sumBoTieuChi = list.reduce((sum, item) => sum + (Number(item.diemTheoBoTieuChi) || 0), 0);
  const sumSlHoanThanh = list.reduce((sum, item) => sum + (Number(item.chamDiemSoLuong_HoanThanh) || 0), 0);
  const sumClConLai = list.reduce((sum, item) => sum + (Number(item.chamDiemChatLuong_SoDiemConLai) || 0), 0);
  const sumTdConLai = list.reduce((sum, item) => sum + (Number(item.chamDiemTienDo_SoDiemConLai) || 0), 0);

  let percentSl = 0;
  let percentCl = 0;
  let percentTd = 0;

  if (sumBoTieuChi > 0) {
    percentSl = Math.max(0, (sumSlHoanThanh / sumBoTieuChi) * 100);
    percentCl = Math.max(0, (sumClConLai / sumBoTieuChi) * 100);
    percentTd = Math.max(0, (sumTdConLai / sumBoTieuChi) * 100);
  } else {
    const validItems = list.filter(
      (item) => item.chamDiemSoLuong_Diem !== undefined || item.chamDiemChatLuong_Diem !== undefined || item.chamDiemTienDo_Diem !== undefined
    );
    if (validItems.length > 0) {
      percentSl = validItems.reduce((sum, item) => sum + (Number(item.chamDiemSoLuong_Diem) || 0), 0) / validItems.length;
      percentCl = validItems.reduce((sum, item) => sum + (Number(item.chamDiemChatLuong_Diem) || 0), 0) / validItems.length;
      percentTd = validItems.reduce((sum, item) => sum + (Number(item.chamDiemTienDo_Diem) || 0), 0) / validItems.length;
    }
  }

  const avgPercent = (percentSl + percentCl + percentTd) / 3;
  const scoreOutOf70 = Number(Math.max(0, Math.min(70, (avgPercent * 70) / 100)).toFixed(2));

  return {
    sumBoTieuChi,
    sumSlHoanThanh,
    sumClConLai,
    sumTdConLai,
    percentSl,
    percentCl,
    percentTd,
    avgPercent,
    scoreOutOf70,
    taskCount: list.length,
  };
};

export default function BieuChamDiemComponent({
  params,
  searchParams: sp,
  saveRef,
  hideHeader,
  hasSection1Header,
  idPhieu: idPhieuProp,
  idDot: idDotProp,
  idLyLich: idLyLichProp,
  viewOnly = false,
  isModal = false,
  onTaskScoreChange,
  onIdPhieuChange,
}: BieuChamDiemPageProps) {
  const searchParams = useSearchParams();
  const currentUser = useSelector((state: any) => state.auth.User);
  const effectiveIdDot = idDotProp || params?.id || searchParams?.get("idDotDanhGia") || searchParams?.get("idDot") || null;
  const queryIdPhieu = idPhieuProp || searchParams?.get("idPhieuDanhGia") || searchParams?.get("idPhieu") || null;
  const [currentIdPhieu, setCurrentIdPhieu] = useState<string | null>(queryIdPhieu);

  const isSection1Present = hasSection1Header !== undefined ? hasSection1Header : (hideHeader ?? false);
  const section1Offset = isSection1Present ? 44 : 0;
  const baseTop = isModal ? 0 : 106;
  const tableHeaderTop = `${baseTop + section1Offset + 44}px`;

  const [fullTree, setFullTree] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [levelSearch, setLevelSearch] = useState<{ [key: number]: string }>({});
  const [elasticMatchedIdsByLevel, setElasticMatchedIdsByLevel] = useState<{ [level: number]: Set<string> } | null>(null);
  const [selectedLevel1, setSelectedLevel1] = useState<any | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [savedDetails, setSavedDetails] = useState<Record<string, any>>({});
  const [isCompact, setIsCompact] = useState<boolean>(false);

  const onTaskScoreChangeRef = React.useRef(onTaskScoreChange);
  useEffect(() => {
    onTaskScoreChangeRef.current = onTaskScoreChange;
  }, [onTaskScoreChange]);

  const onIdPhieuChangeRef = React.useRef(onIdPhieuChange);
  useEffect(() => {
    onIdPhieuChangeRef.current = onIdPhieuChange;
  }, [onIdPhieuChange]);

  const prevTaskScoreRef = React.useRef<number | null>(null);
  const taskScoreSummary = useMemo(() => calculateTaskScore(savedDetails), [savedDetails]);

  useEffect(() => {
    const score = taskScoreSummary.scoreOutOf70;
    if (prevTaskScoreRef.current === null || Math.abs(prevTaskScoreRef.current - score) > 0.001) {
      prevTaskScoreRef.current = score;
      onTaskScoreChangeRef.current?.(score);
    }
  }, [taskScoreSummary]);

  const handleOpenDetail = (record: any) => {
    setDetailRecord(record);
    setDetailModalVisible(true);
  };

  const handleSaveDetail = async (data: any) => {
    if (detailRecord) {
      setLoading(true);
      try {
        const targetIdLyLich = idLyLichProp || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id;

        let phieuIdToSave = currentIdPhieu;
        if (!phieuIdToSave && effectiveIdDot && targetIdLyLich) {
          try {
            const initRes = await kPI_PhieuDanhGiaService.initPhieuDanhGia(effectiveIdDot, targetIdLyLich);
            if (initRes?.status && initRes.data) {
              phieuIdToSave = initRes.data;
              setCurrentIdPhieu(phieuIdToSave);
            } else {
              message.error("Lỗi khi khởi tạo phiếu đánh giá");
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error(e);
            message.error("Có lỗi xảy ra khi tạo phiếu");
            setLoading(false);
            return;
          }
        }

        const payload = {
          id: savedDetails[detailRecord.id]?.id || null,
          idPhieuDanhGia: phieuIdToSave,
          idDotDanhGia: effectiveIdDot,
          idLyLich: targetIdLyLich,
          tieuChiId: data.tieuChiId || detailRecord.id,
          moTaCongViec: data.moTaCongViec,
          tenSanPhamDauRa: data.tenSanPhamDauRa,
          diemTheoBoTieuChi: data.diemTheoBoTieuChi,
          chamDiemSoLuong_HoanThanh: data.chamDiemSoLuong_HoanThanh,
          chamDiemSoLuong_KhongHoanThanh: data.chamDiemSoLuong_KhongHoanThanh,
          chamDiemSoLuong_Diem: data.chamDiemSoLuong_Diem,
          chamDiemChatLuong_KhongDat: data.chamDiemChatLuong_KhongDat,
          chamDiemChatLuong_SoDiemConLai: data.chamDiemChatLuong_SoDiemConLai,
          chamDiemChatLuong_Diem: data.chamDiemChatLuong_Diem,
          chamDiemTienDo_KhongDat: data.chamDiemTienDo_KhongDat,
          chamDiemTienDo_SoDiemConLai: data.chamDiemTienDo_SoDiemConLai,
          chamDiemTienDo_Diem: data.chamDiemTienDo_Diem,
          ghiChuGiaTrinh: data.ghiChuGiaTrinh,
        };

        const res = await kPI_NhiemVuService.saveNhiemVuTCCB(payload);
        if (res?.status) {
          message.success("Lưu sản phẩm thành công");
          const updatedDetails = {
            ...savedDetails,
            [detailRecord.id]: {
              ...data,
              id: typeof res.data === 'string' ? res.data : (savedDetails[detailRecord.id]?.id || res.data)
            },
          };
          setSavedDetails(updatedDetails);
          const scoreSummary = calculateTaskScore(updatedDetails);
          prevTaskScoreRef.current = scoreSummary.scoreOutOf70;
          onTaskScoreChangeRef.current?.(scoreSummary.scoreOutOf70);
          if (phieuIdToSave) {
            onIdPhieuChangeRef.current?.(phieuIdToSave);
          }
          setDetailModalVisible(false);
        } else {
          message.error(res?.message || "Lỗi khi lưu sản phẩm");
        }
      } catch (error) {
        console.error(error);
        message.error("Có lỗi xảy ra khi gọi API");
      } finally {
        setLoading(false);
      }
    } else {
      setDetailModalVisible(false);
    }
  };

  const handleDeleteDetail = async (recordId: string) => {
    const saved = savedDetails[recordId];
    if (saved && saved.id) {
      setLoading(true);
      try {
        const res = await kPI_NhiemVuService.deleteNhiemVuTCCB(saved.id);
        if (res?.status) {
          message.success("Xóa thành công");
          const next = { ...savedDetails };
          delete next[recordId];
          setSavedDetails(next);
          const scoreSummary = calculateTaskScore(next);
          prevTaskScoreRef.current = scoreSummary.scoreOutOf70;
          onTaskScoreChangeRef.current?.(scoreSummary.scoreOutOf70);
        } else {
          message.error(res?.message || "Lỗi khi xóa");
        }
      } catch (error) {
        console.error(error);
        message.error("Có lỗi xảy ra khi gọi API xóa");
      } finally {
        setLoading(false);
      }
    } else {
      const next = { ...savedDetails };
      delete next[recordId];
      setSavedDetails(next);
      const scoreSummary = calculateTaskScore(next);
      prevTaskScoreRef.current = scoreSummary.scoreOutOf70;
      onTaskScoreChangeRef.current?.(scoreSummary.scoreOutOf70);
    }
  };

  useEffect(() => {
    if (saveRef) {
      if (typeof saveRef === 'function') {
        saveRef(() => async () => true);
      } else {
        saveRef.current = async () => true;
      }
    }
  }, [saveRef]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let targetIdLyLich = idLyLichProp || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id;

        if (queryIdPhieu) {
          const resPhieu = await kPI_PhieuDanhGiaService.getById(queryIdPhieu);
          if (resPhieu?.data?.idLyLich) {
            targetIdLyLich = resPhieu.data.idLyLich;
          }
        }

        const effectiveDonViId = currentUser?.donViId || currentUser?.departmentId;
        const response = await kPI_NhomTieuChiService.getTieuChiForTCCB(
          effectiveDonViId,
          effectiveIdDot,
          targetIdLyLich
        );

        if (response && response.status && response.data) {
          const items = response.data;
          let clonedItems = JSON.parse(JSON.stringify(items));

          const map: any = {};
          const roots: any[] = [];
          const loadedSavedDetails: Record<string, any> = {};

          clonedItems.forEach((item: any) => {
            map[item.id] = item;
            item.children = [];
            item.key = item.id;

            if (item.kPI_NhiemVuDtos && item.kPI_NhiemVuDtos.length > 0) {
              const nv = item.kPI_NhiemVuDtos[0];
              const dauRa = (nv.kPI_DauRaNhiemVuDtos && nv.kPI_DauRaNhiemVuDtos.length > 0) 
                ? nv.kPI_DauRaNhiemVuDtos[0] 
                : null;
              
              loadedSavedDetails[item.id] = {
                id: nv.id,
                moTaCongViec: nv.tenNhiemVuDayDu,
                tenSanPhamDauRa: dauRa?.tenSanPhamDauRa || "",
                diemTheoBoTieuChi: nv.diemTheoBoTieuChi,
                chamDiemSoLuong_HoanThanh: nv.chamDiemSoLuong_HoanThanh,
                chamDiemSoLuong_KhongHoanThanh: nv.chamDiemSoLuong_KhongHoanThanh,
                chamDiemSoLuong_Diem: nv.chamDiemSoLuong_Diem,
                chamDiemChatLuong_KhongDat: nv.chamDiemChatLuong_KhongDat,
                chamDiemChatLuong_SoDiemConLai: nv.chamDiemChatLuong_SoDiemConLai,
                chamDiemChatLuong_Diem: nv.chamDiemChatLuong_Diem,
                chamDiemTienDo_KhongDat: nv.chamDiemTienDo_KhongDat,
                chamDiemTienDo_SoDiemConLai: nv.chamDiemTienDo_SoDiemConLai,
                chamDiemTienDo_Diem: nv.chamDiemTienDo_Diem,
                // Ghi chú thuộc sản phẩm đầu ra, không thuộc nhiệm vụ.
                ghiChuGiaTrinh: dauRa?.ghiChuGiaTrinh || "",
              };
            }
          });

          setSavedDetails(loadedSavedDetails);
          const initialSummary = calculateTaskScore(loadedSavedDetails);
          prevTaskScoreRef.current = initialSummary.scoreOutOf70;
          onTaskScoreChangeRef.current?.(initialSummary.scoreOutOf70);

          clonedItems.forEach((item: any) => {
            if (item.parentID && map[item.parentID]) {
              map[item.parentID].children.push(item);
            } else {
              roots.push(item);
            }
          });

          const parseSegment = (seg: string): number | string => {
            const trimmed = seg.trim().toUpperCase();
            if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
            if (/^[IVXLCDM]+$/.test(trimmed)) {
              const romanValues: any = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
              let total = 0, prev = 0;
              for (let i = trimmed.length - 1; i >= 0; i--) {
                const v = romanValues[trimmed[i]] || 0;
                total += v < prev ? -v : v;
                prev = v;
              }
              if (total > 0) return total;
            }
            if (/^[A-Z]$/.test(trimmed)) return trimmed.charCodeAt(0) - 64;
            return trimmed;
          };

          const getSortKeys = (name: string): (number | string)[] => {
            if (!name) return [9999];
            const match = name.trim().match(/^([A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*)(?:\.|\s|-|:|$)/);
            if (!match) return [9999, name.trim()];
            const prefix = match[1];
            return prefix.split('.').map(parseSegment);
          };

          const compareKeys = (keysA: (number | string)[], keysB: (number | string)[]): number => {
            const len = Math.max(keysA.length, keysB.length);
            for (let i = 0; i < len; i++) {
              const valA = keysA[i];
              const valB = keysB[i];
              if (valA === undefined) return -1;
              if (valB === undefined) return 1;
              if (typeof valA === 'number' && typeof valB === 'number') {
                if (valA !== valB) return valA - valB;
              } else {
                const strA = String(valA);
                const strB = String(valB);
                if (strA !== strB) return strA.localeCompare(strB);
              }
            }
            return 0;
          };

          const compareNames = (nameA: string, nameB: string): number => {
            const keysA = getSortKeys(nameA);
            const keysB = getSortKeys(nameB);
            const hasNumA = keysA[0] !== 9999;
            const hasNumB = keysB[0] !== 9999;
            if (hasNumA && !hasNumB) return -1;
            if (!hasNumA && hasNumB) return 1;
            return compareKeys(keysA, keysB);
          };

          const sortTree = (nodes: any[]) => {
            nodes.sort((a: any, b: any) => {
              const sttA = a.stt != null ? a.stt : 999999;
              const sttB = b.stt != null ? b.stt : 999999;
              if (sttA !== sttB) return sttA - sttB;
              const nameA = a.tenNhomTieuChi || a.congViecChiTiet || a.sanPhamDauRa || '';
              const nameB = b.tenNhomTieuChi || b.congViecChiTiet || b.sanPhamDauRa || '';
              return compareNames(nameA, nameB);
            });
            nodes.forEach((node: any) => {
              if (node.children && node.children.length > 0) sortTree(node.children);
            });
          };
          sortTree(roots);

          const cleanEmptyChildren = (nodes: any[]) => {
            nodes.forEach((node) => {
              if (node.children && node.children.length === 0) {
                delete node.children;
              } else if (node.children) {
                cleanEmptyChildren(node.children);
              }
            });
          };
          cleanEmptyChildren(roots);

          setFullTree(roots);
          if (roots.length > 0) {
            setSelectedLevel1(roots[0]);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser, effectiveIdDot, queryIdPhieu, idLyLichProp]);

  const getMaxDepth = (nodes: any[]): number => {
    let depth = 0;
    for (let node of nodes) {
      if (node.children && node.children.length > 0) {
        depth = Math.max(depth, 1 + getMaxDepth(node.children));
      } else {
        depth = Math.max(depth, 1);
      }
    }
    return depth;
  };

  const performSearch = async (currentSearch: { [level: number]: string }) => {
    const activeLevels = Object.entries(currentSearch).filter(([k, v]) => v && v.trim() !== "");
    if (activeLevels.length === 0) {
      setElasticMatchedIdsByLevel(null);
      return;
    }

    setLoading(true);
    try {
      const promises = activeLevels.map(([levelStr, keyword]) => {
        const queryLevel = parseInt(levelStr) + 1;
        return kPI_NhomTieuChiService.getDataElasticExact({
          keyword: keyword.trim(),
          level: queryLevel,
          isElastic: true,
          pageIndex: 1,
          pageSize: 10000,
          parentID: queryLevel === 2 ? (selectedLevel1?.id || undefined) : undefined,
        });
      });

      const responses = await Promise.all(promises);
      const idsByLevel: { [level: number]: Set<string> } = {};

      activeLevels.forEach(([levelStr], index) => {
        const columnLevel = parseInt(levelStr);
        const res = responses[index];
        const items = (res?.data as any)?.items || [];
        const set = new Set<string>();
        items.forEach((x: any) => set.add(String(x.id).toLowerCase()));
        idsByLevel[columnLevel] = set;
      });

      setElasticMatchedIdsByLevel(idsByLevel);
    } catch (err) {
      console.error(err);
      setElasticMatchedIdsByLevel({});
    } finally {
      setLoading(false);
    }
  };

  const applyLevelSearch = (
    nodes: any[],
    matchedIdsByLevel: { [level: number]: Set<string> } | null,
    currentSearch: { [level: number]: string }
  ) => {
    if (matchedIdsByLevel === null) return nodes;

    const isAnySearchActiveAtOrBelow = (level: number): boolean => {
      return Object.entries(currentSearch).some(
        ([lvl, val]) => parseInt(lvl) >= level && val && val.trim() !== ""
      );
    };

    const filterRecursive = (currentNodes: any[], currentLevel: number): any[] => {
      let result = [];
      const isSearchActiveThisLevel = !!currentSearch[currentLevel] && currentSearch[currentLevel].trim() !== "";
      const isDeeperSearchActive = isAnySearchActiveAtOrBelow(currentLevel + 1);

      for (let node of currentNodes) {
        if (isSearchActiveThisLevel) {
          const matchedSet = matchedIdsByLevel[currentLevel];
          const isMatch = matchedSet ? matchedSet.has(String(node.id).toLowerCase()) : false;
          if (!isMatch) continue;
        }

        let filteredChildren: any[] = [];
        if (node.children && node.children.length > 0) {
          filteredChildren = filterRecursive(node.children, currentLevel + 1);
        }

        if (isDeeperSearchActive && node.children && node.children.length > 0) {
          if (filteredChildren.length === 0) continue;
        }

        result.push({ ...node, children: filteredChildren });
      }
      return result;
    };

    return filterRecursive(nodes, 1);
  };

  const flattenTreeForSpan = (nodes: any[], maxDepth: number, isFlat: boolean = false) => {
    if (!nodes || nodes.length === 0) return [];
    let flattenedRows: any[] = [];

    const getLeafCount = (node: any): number => {
      if (isFlat) return 1;
      if (!node.children || node.children.length === 0) return 1;
      return node.children.reduce((acc: number, child: any) => acc + getLeafCount(child), 0);
    };

    const processLevel = (currentNodes: any[], level: number, parentRowSpans: number[], parentPathNames: string[]) => {
      for (let node of currentNodes) {
        let leaves = getLeafCount(node);

        if (!node.children || node.children.length === 0) {
          let row: any = { ...node };
          for (let i = 1; i <= maxDepth; i++) {
            if (i < level) {
              row[`level${i}RowSpan`] = isFlat ? 1 : parentRowSpans[i - 1];
              row[`level${i}Name`] = parentPathNames[i - 1];
            } else if (i === level) {
              row[`level${i}RowSpan`] = isFlat ? 1 : leaves;
              row[`level${i}Name`] = node.tenNhomTieuChi || node.congViecChiTiet || node.sanPhamDauRa;
            } else {
              row[`level${i}RowSpan`] = 1;
              row[`level${i}Name`] = "";
            }
          }
          flattenedRows.push(row);
          if (!isFlat) {
            for (let i = 0; i < parentRowSpans.length; i++) {
              parentRowSpans[i] = 0;
            }
          }
        } else {
          let newParentRowSpans = [...parentRowSpans];
          newParentRowSpans[level - 1] = isFlat ? 1 : leaves;
          let newParentPathNames = [...parentPathNames];
          newParentPathNames[level - 1] = node.tenNhomTieuChi || node.congViecChiTiet || node.sanPhamDauRa;

          processLevel(node.children, level + 1, newParentRowSpans, newParentPathNames);

          if (!isFlat) {
            for (let i = 0; i < level - 1; i++) {
              parentRowSpans[i] = 0;
            }
          }
        }
      }
    };

    processLevel(nodes, 1, Array(maxDepth).fill(0), Array(maxDepth).fill(""));
    return flattenedRows;
  };

  const childrenTree = useMemo(() => {
    if (!selectedLevel1 || !selectedLevel1.children) return [];
    
    if (isCompact) {
      const filterByDauRa = (nodes: any[]): any[] => {
        return nodes.reduce((acc: any[], node: any) => {
          const hasDauRa = !!savedDetails[node.id];

          let filteredChildren = [];
          if (node.children && node.children.length > 0) {
            filteredChildren = filterByDauRa(node.children);
          }

          if (hasDauRa || filteredChildren.length > 0) {
            acc.push({ ...node, children: filteredChildren });
          }

          return acc;
        }, []);
      };
      
      return filterByDauRa(selectedLevel1.children);
    }
    
    return selectedLevel1.children;
  }, [selectedLevel1, isCompact, savedDetails]);

  const childMaxDepth = useMemo(() => getMaxDepth(childrenTree), [childrenTree]);
  const filteredChildTree = useMemo(() => applyLevelSearch(childrenTree, elasticMatchedIdsByLevel, levelSearch), [childrenTree, elasticMatchedIdsByLevel, levelSearch]);
  const flattenedChildData = useMemo(() => flattenTreeForSpan(filteredChildTree, childMaxDepth), [filteredChildTree, childMaxDepth]);

  const handleLevelSearch = (level: number, value: string) => {
    const newSearch = { ...levelSearch, [level]: value };
    setLevelSearch(newSearch);
    performSearch(newSearch);
  };

  const levelNames = ["Nhiệm vụ", "Công việc chi tiết", "Sản phẩm đầu ra"];

  const handleSelectLevel1 = (item: any) => {
    setSelectedLevel1(item);
    setLevelSearch({});
    setElasticMatchedIdsByLevel(null);
  };

  const childDynamicColumns = useMemo(() => {
    const cols = [];
    cols.push({
      title: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
          <div style={{ textAlign: 'center', color: '#ffffff', fontWeight: 600 }}>STT</div>
        </div>
      ),
      dataIndex: "stt",
      key: "stt",
      width: 60,
      align: "center" as const,
      fixed: "left" as const,
      render: (value: any, record: any) => {
        const isRoman = isRomanNumeral(value);
        return {
          children: <span style={{ fontWeight: isRoman ? "bold" : "normal" }}>{value}</span>,
        };
      }
    });

    for (let i = 1; i <= childMaxDepth; i++) {
      const colName = levelNames[i - 1] || `Cấp ${i}`;
      cols.push({
        title: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
            <div style={{ textAlign: 'center', color: '#ffffff', fontWeight: 600 }}>
              {colName}
              <div style={{ fontSize: '11px', fontWeight: 'normal', marginTop: '2px', color: '#ffd666' }}>(Bộ tiêu chí)</div>
            </div>
            <ColumnSearchInput
              level={i}
              colName={colName}
              currentValue={levelSearch[i]}
              onSearch={handleLevelSearch}
            />
          </div>
        ),
        dataIndex: `level${i}Name`,
        key: `level${i}`,
        width: i === 1 ? 250 : 300,
        fixed: "left" as const,
        render: (value: any, record: any) => {
          return {
            children: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ flex: 1 }}><HighlightText text={value} highlight={levelSearch[i]} /></span>
              </div>
            ),
            props: { rowSpan: record[`level${i}RowSpan`] }
          };
        }
      });
    }
    return cols;
  }, [childMaxDepth, levelSearch]);

  const childColumns: TableProps<any>["columns"] = useMemo(() => [
    ...childDynamicColumns,

    {
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Điểm</span>,
      dataIndex: "diem",
      key: "diem",
      width: 80,
      align: "center" as const,
      render: (value: any, record: any) => {
        const saved = savedDetails[record.id];
        return {
          children: saved ? formatScore(saved.diemTheoBoTieuChi) : formatScore(value),
          props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
        };
      }
    },
    {
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Hệ số</span>,
      dataIndex: "heSo",
      key: "heSo",
      width: 80,
      align: "center" as const,
      render: (value: any, record: any) => ({
        children: value,
        props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
      })
    },
    {
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Thao tác</span>,
      key: "action",
      width: 80,
      align: "center" as const,
      render: (value: any, record: any) => {
        const isSaved = !!savedDetails[record.id];
        return {
          children: (
            <Space>
              {isSaved && (
                <>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleOpenDetail(record)}
                    title="Xem chi tiết nhiệm vụ"
                  />
                  <Popconfirm
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa thông tin đã nhập của nhiệm vụ này không?"
                    onConfirm={() => handleDeleteDetail(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      title="Xóa thông tin"
                      style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: '#fff' }}
                    />
                  </Popconfirm>
                </>
              )}
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => handleOpenDetail(record)}
                title={isSaved ? "Sửa nhiệm vụ" : "Nhập chi tiết nhiệm vụ"}
                style={{ borderColor: '#1677ff', color: '#1677ff' }}
              />
            </Space>
          ),
          props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
        };
      }
    },
    {
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Mô tả công việc</span>,
      dataIndex: "moTaCongViecCol",
      key: "moTaCongViecCol",
      width: 200,
      align: "center" as const,
      render: (value: any, record: any) => {
        const saved = savedDetails[record.id];
        return {
          children: saved ? saved.moTaCongViec : "",
          props: { rowSpan: record[`level2RowSpan`] }
        };
      }
    },
    {
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Sản phẩm đầu ra</span>,
      dataIndex: "sanPhamDauRaCol",
      key: "sanPhamDauRaCol",
      width: 200,
      align: "center" as const,
      render: (value: any, record: any) => {
        const saved = savedDetails[record.id];
        return {
          children: saved ? saved.tenSanPhamDauRa : "",
          props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
        };
      }
    },
    {
      title: () => (
        <div style={{ textAlign: "center", color: '#ffffff', fontWeight: 600 }}>
          Chấm điểm số lượng
        </div>
      ),
      children: [
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Hoàn thành</span>,
          dataIndex: "slHoanThanh",
          key: "slHoanThanh",
          align: "center" as const,
          width: 90,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatScore(saved.chamDiemSoLuong_HoanThanh) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        },
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Không hoàn thành {renderInfoIcon("Số lượng Không hoàn thành", <div>Điểm Không hoàn thành = Tổng điểm - Số lượng hoàn thành</div>)}</span>,
          dataIndex: "slKhongHoanThanh",
          key: "slKhongHoanThanh",
          align: "center" as const,
          width: 100,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatScore(saved.chamDiemSoLuong_KhongHoanThanh) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        },
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Điểm (%) {renderInfoIcon("Điểm (%) Số lượng", <div>% Số lượng = Số lượng hoàn thành / Tổng điểm * 100</div>)}</span>,
          dataIndex: "slDiemPhanTram",
          key: "slDiemPhanTram",
          align: "center" as const,
          width: 90,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatPercent(saved.chamDiemSoLuong_Diem) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        }
      ]
    },
    {
      title: () => (
        <div style={{ textAlign: "center", color: '#ffffff', fontWeight: 600 }}>
          Chấm điểm chất lượng<br />
          <span style={{ color: "#ffd666", fontWeight: "normal", fontSize: "11px" }}>(Trừ 25%/lần)</span>
        </div>
      ),
      children: [
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Không đạt</span>,
          dataIndex: "clKhongDat",
          key: "clKhongDat",
          align: "center" as const,
          width: 90,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatScore(saved.chamDiemChatLuong_KhongDat) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        },
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Điểm còn lại {renderInfoIcon("Điểm còn lại", <div>Điểm còn lại = Tổng điểm - (Số lần không đạt * 25% * Tổng điểm)</div>)}</span>,
          dataIndex: "clDiemConLai",
          key: "clDiemConLai",
          align: "center" as const,
          width: 100,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatScore(saved.chamDiemChatLuong_SoDiemConLai) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        },
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Điểm (%) {renderInfoIcon("Điểm (%) Chất lượng", <div>% Chất lượng = Điểm còn lại / Tổng điểm * 100</div>)}</span>,
          dataIndex: "clDiemPhanTram",
          key: "clDiemPhanTram",
          align: "center" as const,
          width: 90,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatPercent(saved.chamDiemChatLuong_Diem) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        }
      ]
    },
    {
      title: () => (
        <div style={{ textAlign: "center", color: '#ffffff', fontWeight: 600 }}>
          Chấm điểm tiến độ<br />
          <span style={{ color: "#ffd666", fontWeight: "normal", fontSize: "11px" }}>(Trừ 25%/lần)</span>
        </div>
      ),
      children: [
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Chậm muộn</span>,
          dataIndex: "tdChamMuon",
          key: "tdChamMuon",
          align: "center" as const,
          width: 90,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatScore(saved.chamDiemTienDo_KhongDat) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        },
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Điểm còn lại {renderInfoIcon("Điểm còn lại", <div>Điểm còn lại = Tổng điểm - (Số lần chậm muộn * 25% * Tổng điểm)</div>)}</span>,
          dataIndex: "tdDiemConLai",
          key: "tdDiemConLai",
          align: "center" as const,
          width: 100,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatScore(saved.chamDiemTienDo_SoDiemConLai) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        },
        {
          title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Điểm (%) {renderInfoIcon("Điểm (%) Tiến độ", <div>% Tiến độ = Điểm còn lại / Tổng điểm * 100</div>)}</span>,
          dataIndex: "tdDiemPhanTram",
          key: "tdDiemPhanTram",
          align: "center" as const,
          width: 90,
          render: (_: any, record: any) => {
            const saved = savedDetails[record.id];
            return {
              children: saved ? formatPercent(saved.chamDiemTienDo_Diem) : "",
              props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
            };
          }
        }
      ]
    },
    {
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Ghi chú/Giải trình</span>,
      dataIndex: "ghiChuGiaiTrinh",
      key: "ghiChuGiaiTrinh",
      width: 150,
      render: (_: any, record: any) => {
        const saved = savedDetails[record.id];
        return {
          children: saved ? (saved.ghiChuGiaTrinh || saved.ghiChuGiaiTrinh || saved.ghiChu || "") : "",
          props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
        };
      }
    }
  ], [childDynamicColumns, childMaxDepth, savedDetails]);

  return (
    <Card
      bordered={false}
      className="bieu-cham-diem-card custom-table-card kpi-allow-sticky"
      style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", borderRadius: "12px" }}
      bodyStyle={{ padding: 0 }}
    >
      {!hideHeader && (
        <div style={{ padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <Title level={4} style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>
            Kết quả thực hiện nhiệm vụ theo Tiêu chí TCCB
          </Title>
        </div>
      )}

      <div style={{ padding: "16px" }}>
        <style>{`
          .custom-bold-header .ant-table-thead > tr > th,
          .custom-bold-header .ant-table-thead > tr > th .ant-table-cell {
            background-color: #0355a2 !important;
            color: #ffffff !important;
            border-right: 1px solid #737373 !important;
            border-bottom: 1px solid #737373 !important;
            border-top: 1px solid #737373 !important;
          }
          .custom-bold-header .ant-table-thead > tr > th:first-child {
            border-left: 1px solid #737373 !important;
          }
          .custom-bold-header .ant-table-thead > tr > th div:not(.ant-input-affix-wrapper):not(.ant-input-wrapper),
          .custom-bold-header .ant-table-thead > tr > th span:not(.ant-input-affix-wrapper *):not(.ant-input *) {
            color: #ffffff !important;
          }
          .custom-bold-header .ant-table-thead .ant-input {
            color: #333333 !important;
            background: #ffffff !important;
          }
          .custom-bold-header .ant-table-header {
            z-index: 10 !important;
            position: relative;
          }
          .custom-bold-header .ant-table-thead > tr > th.ant-table-cell-fix-left-last,
          .custom-bold-header .ant-table-thead > tr > th.ant-table-cell-fix-left {
            transform: none !important;
          }
          
          /* Search header */
          .premium-search-input {
            border-radius: 20px !important;
            border: none !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
            padding: 4px 14px !important;
            transition: all 0.3s ease;
          }
          .premium-search-input:hover, .premium-search-input-focused {
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
          }
          .premium-search-input input {
            font-size: 13px;
          }
          .custom-bold-header .ant-table-tbody > tr > td {
            border-right: 1px solid #f0f0f0 !important;
            border-bottom: 1px solid #f0f0f0 !important;
          }
          .custom-bold-header .ant-table-tbody > tr > td:first-child {
            border-left: 1px solid #f0f0f0 !important;
          }
          .custom-bold-header .ant-btn.ant-btn-dangerous,
          .custom-bold-header .ant-btn.ant-btn-dangerous:hover,
          .custom-bold-header .ant-btn.ant-btn-dangerous:focus {
            background-color: #ff4d4f !important;
            border-color: #ff4d4f !important;
            color: #ffffff !important;
          }
          
          @keyframes blinkRed {
            0% { color: #ff4d4f; opacity: 1; }
            50% { color: #ff4d4f; opacity: 0.4; }
            100% { color: #ff4d4f; opacity: 1; }
          }
          .blink-red-text {
            animation: blinkRed 1.5s infinite ease-in-out;
            font-weight: 700;
            margin-left: 4px;
          }
        `}</style>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {/* Top bar: Level 1 list */}
            <div style={{
              display: 'flex',
              gap: 8,
              borderBottom: '1px solid #e8e8e8',
              paddingBottom: 16,
              flexWrap: 'wrap',
            }}>
              {fullTree.map((item: any, index: number) => {
                const name = item.tenNhomTieuChi || item.congViecChiTiet || item.sanPhamDauRa || `Nhóm ${index + 1}`;
                const isActive = selectedLevel1?.id === item.id;
                
                const countDauRa = (node: any): number => {
                  let count = 0;
                  if (savedDetails[node.id]) {
                    count += 1;
                  }
                  if (node.children && node.children.length > 0) {
                    node.children.forEach((child: any) => {
                      count += countDauRa(child);
                    });
                  }
                  return count;
                };
                const productCount = countDauRa(item);
                
                return (
                  <div
                    key={item.id || index}
                    onClick={() => handleSelectLevel1(item)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: isActive ? '1px solid #1677ff' : '1px solid #e8e8e8',
                      background: isActive ? '#e6f4ff' : '#fafafa',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 13,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = '#f0f5ff';
                        (e.currentTarget as HTMLElement).style.borderColor = '#91caff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = '#fafafa';
                        (e.currentTarget as HTMLElement).style.borderColor = '#e8e8e8';
                      }
                    }}
                  >
                    <span>{name} {productCount > 0 && <span className="blink-red-text">({productCount})</span>}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom content: Children table */}
            <div style={{ flex: 1, overflow: 'visible' }}>
              {selectedLevel1 ? (
                <>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1677ff' }}>
                      {selectedLevel1?.tenNhomTieuChi || selectedLevel1?.congViecChiTiet || selectedLevel1?.sanPhamDauRa}
                    </div>
                    <div>
                      <span style={{ marginRight: 8, fontWeight: 500, color: '#333' }}>Chế độ hiển thị:</span>
                      <Switch 
                        checkedChildren="Thu gọn" 
                        unCheckedChildren="Chi tiết" 
                        checked={isCompact} 
                        onChange={(checked) => setIsCompact(checked)} 
                      />
                    </div>
                  </div>
                  <Table
                    columns={childColumns}
                    dataSource={flattenedChildData}
                    pagination={false}
                    rowKey={(record: any, index?: number) => (record?.id ? String(record.id) : String(index))}
                    bordered
                    size="small"
                    className="custom-bold-header"
                    scroll={{ x: 'max-content', y: 'calc(100vh - 350px)' }}
                    style={{ "--table-header-top": tableHeaderTop } as React.CSSProperties}
                  />
                  {taskScoreSummary.taskCount > 0 && (
                    <div style={{
                      marginTop: 12,
                      padding: "10px 16px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12
                    }}>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#1e293b" }}>
                        <span><strong>Số nhiệm vụ đã chấm:</strong> {taskScoreSummary.taskCount}</span>
                        <span><strong>% Số lượng:</strong> {formatPercent(taskScoreSummary.percentSl)}</span>
                        <span><strong>% Chất lượng:</strong> {formatPercent(taskScoreSummary.percentCl)}</span>
                        <span><strong>% Tiến độ:</strong> {formatPercent(taskScoreSummary.percentTd)}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>
                        Điểm kết quả thực hiện nhiệm vụ: <span style={{ fontSize: 16, color: "#047857" }}>{formatScore(taskScoreSummary.scoreOutOf70)}/70</span> điểm
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                  Chọn nhóm tiêu chí bên trái để xem chi tiết
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ModalNhapChiTietSanPhamTCCB
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        onSave={handleSaveDetail}
        initialData={detailRecord ? (() => {
          let pathParts = [];
          if (selectedLevel1) {
            pathParts.push(selectedLevel1.tenNhomTieuChi || selectedLevel1.congViecChiTiet || selectedLevel1.sanPhamDauRa);
          }
          for (let i = 1; i <= childMaxDepth; i++) {
            const levelVal = detailRecord[`level${i}Name`];
            if (levelVal) {
              pathParts.push(levelVal);
            }
          }
          const tieuChiName = pathParts.length > 0
            ? pathParts.join(' / ')
            : (detailRecord.congViecChiTiet || detailRecord.tenNhomTieuChi || detailRecord.id);

          // Mỗi sản phẩm đầu ra giữ mô tả riêng; không kế thừa mô tả từ sản phẩm cùng công việc chi tiết.
          const savedData = savedDetails[detailRecord.id] || {};

          return {
            ...savedData,
            tieuChiId: savedData.tieuChiId || detailRecord.id,
            tenTieuChi: savedData.tenTieuChi || tieuChiName,
            diemTheoBoTieuChi: savedData.diemTheoBoTieuChi || detailRecord.diem || detailRecord.diemBoTieuChi || 0,
          };
        })() : undefined}
        idDotDanhGia={effectiveIdDot}
        idLyLich={idLyLichProp || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id}
        donViId={currentUser?.donViId || currentUser?.departmentId}
      />
    </Card>
  );
}
