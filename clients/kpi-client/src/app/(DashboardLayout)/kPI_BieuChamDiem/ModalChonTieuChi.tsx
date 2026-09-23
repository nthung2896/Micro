import React, { useEffect, useState, useMemo } from "react";
import { Modal, Table, Button, TableProps, Input, List, Switch } from "antd";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import { KPI_NhomTieuChiType } from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";
import { SearchOutlined, RightOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const { Search } = Input;

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSelectMultiple: (records: KPI_NhomTieuChiType[]) => void;
  initialSelectedNames?: string[];
  idDotDanhGia?: string | null;
  tenNhiemVu?: string;
  tenSanPham?: string;
  relatedTieuChiIds?: string[];
  idLyLich?: string | null;
  donViId?: string | null;
}

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

const EMPTY_STRING_ARRAY: string[] = [];

const ModalChonTieuChi: React.FC<Props> = ({
  visible,
  onCancel,
  onSelectMultiple,
  initialSelectedNames = EMPTY_STRING_ARRAY,
  idDotDanhGia,
  tenNhiemVu,
  tenSanPham,
  relatedTieuChiIds = EMPTY_STRING_ARRAY,
  idLyLich,
  donViId,
}) => {
  const [fullTree, setFullTree] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [levelSearch, setLevelSearch] = useState<{ [key: number]: string }>({});
  const [elasticMatchedIdsByLevel, setElasticMatchedIdsByLevel] = useState<{ [level: number]: Set<string> } | null>(null);
  const [selectedLevel1, setSelectedLevel1] = useState<any | null>(null);

  const [suggestedMatchedIds, setSuggestedMatchedIds] = useState<Set<string> | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState<boolean>(true);

  const currentUser = useSelector((state: any) => state.auth.User);

  useEffect(() => {
    if (visible) {
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setLevelSearch({});
      setElasticMatchedIdsByLevel(null);
      setSelectedLevel1(null);

      const shouldSuggest = !!(tenNhiemVu || tenSanPham || (relatedTieuChiIds && relatedTieuChiIds.length > 0));
      setSuggestedMatchedIds(null);

      loadData();

      if (shouldSuggest) {
        performSuggestionSearch(tenNhiemVu, tenSanPham, relatedTieuChiIds);
      }
    }
  }, [visible, tenNhiemVu, tenSanPham, relatedTieuChiIds, idDotDanhGia, idLyLich, donViId]);

  const performSuggestionSearch = async (nv?: string, sp?: string, relatedIds?: string[]) => {
    try {
      const res = await kPI_NhomTieuChiService.getDeXuatTieuChiElastic(nv, sp, undefined, relatedIds);
      if (res && res.status && res.data) {
        setSuggestedMatchedIds(new Set(res.data.map((id: string) => String(id).toLowerCase())));
      } else {
        setSuggestedMatchedIds(null);
      }
    } catch (err) {
      console.error("Error fetching suggestion search:", err);
      setSuggestedMatchedIds(null);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const effectiveDonViId = donViId || currentUser?.donViId || currentUser?.departmentId;
      const response = await kPI_NhomTieuChiService.getTieuChiForCurrentUser(
        effectiveDonViId,
        idDotDanhGia,
        idLyLich
      );
      if (response && response.status && response.data) {
        const items = response.data;
        let clonedItems = JSON.parse(JSON.stringify(items));

        const map: any = {};
        const roots: any[] = [];

        clonedItems.forEach((item: any) => {
          map[item.id] = item;
          item.children = [];
          item.key = item.id;
        });

        clonedItems.forEach((item: any) => {
          if (item.parentID && map[item.parentID]) {
            map[item.parentID].children.push(item);
          } else {
            roots.push(item);
          }
        });

        // Sort nodes recursively by Roman numeral / number prefix
        const parseSegment = (seg: string): number | string => {
          const trimmed = seg.trim().toUpperCase();
          if (/^\d+$/.test(trimmed)) {
            return parseInt(trimmed, 10);
          }
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
          if (/^[A-Z]$/.test(trimmed)) {
            return trimmed.charCodeAt(0) - 64;
          }
          return trimmed;
        };

        const getSortKeys = (name: string): (number | string)[] => {
          if (!name) return [9999];
          const match = name.trim().match(/^([A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*)(?:\.|\s|-|:|$)/);
          if (!match) return [9999, name.trim()];
          const prefix = match[1];
          const segments = prefix.split('.');
          return segments.map(parseSegment);
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
            if (sttA !== sttB) {
              return sttA - sttB;
            }
            const nameA = a.tenNhomTieuChi || a.congViecChiTiet || a.sanPhamDauRa || '';
            const nameB = b.tenNhomTieuChi || b.congViecChiTiet || b.sanPhamDauRa || '';
            return compareNames(nameA, nameB);
          });
          nodes.forEach((node: any) => {
            if (node.children && node.children.length > 0) {
              sortTree(node.children);
            }
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
        // Auto-select first level 1 if available
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

  // ===================== Tree utilities =====================

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
          if (!isMatch) {
            continue;
          }
        }

        let filteredChildren: any[] = [];
        if (node.children && node.children.length > 0) {
          filteredChildren = filterRecursive(node.children, currentLevel + 1);
        }

        if (isDeeperSearchActive && node.children && node.children.length > 0) {
          if (filteredChildren.length === 0) {
            continue;
          }
        }

        result.push({ ...node, children: filteredChildren });
      }
      return result;
    };

    return filterRecursive(nodes, 1);
  };

  const applySuggestionSearch = (nodes: any[], matchedIds: Set<string> | null, isActive: boolean) => {
    if (!isActive || !matchedIds) return nodes;

    const filterRecursive = (currentNodes: any[]): any[] => {
      let result = [];
      for (let node of currentNodes) {
        let filteredChildren: any[] = [];
        if (node.children && node.children.length > 0) {
          filteredChildren = filterRecursive(node.children);
        }

        const isMatch = matchedIds.has(String(node.id).toLowerCase());

        if (isMatch) {
          // Nếu node này thoả mãn search (ví dụ level 3), trả về node cùng toàn bộ tiêu chí con gốc của nó
          result.push({ ...node, children: node.children });
        } else if (filteredChildren.length > 0) {
          // Nếu không thoả mãn nhưng có con thoả mãn, trả về node với các con đã filter
          result.push({ ...node, children: filteredChildren });
        }
      }
      return result;
    };

    return filterRecursive(nodes);
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
          row.stt = flattenedRows.length + 1;
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

  // ===================== Children data of selected level 1 =====================

  const childrenTree = useMemo(() => {
    if (!selectedLevel1 || !selectedLevel1.children) return [];
    return selectedLevel1.children;
  }, [selectedLevel1]);

  const childMaxDepth = useMemo(() => getMaxDepth(childrenTree), [childrenTree]);
  const filteredChildTree = useMemo(() => applyLevelSearch(childrenTree, elasticMatchedIdsByLevel, levelSearch), [childrenTree, elasticMatchedIdsByLevel, levelSearch]);
  const flattenedChildData = useMemo(() => flattenTreeForSpan(filteredChildTree, childMaxDepth), [filteredChildTree, childMaxDepth]);

  // ===================== Suggested Criteria Data =====================

  // Helper: find a node by id in the flat list of all tree items
  const findNodeInTree = (nodes: any[], id: string): any | null => {
    for (const node of nodes) {
      if (String(node.id).toLowerCase() === id.toLowerCase()) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper: find parent node that contains the child with given id
  const findParentInTree = (nodes: any[], childId: string, parent: any | null = null): any | null => {
    for (const node of nodes) {
      if (String(node.id).toLowerCase() === childId.toLowerCase()) return parent;
      if (node.children && node.children.length > 0) {
        const found = findParentInTree(node.children, childId, node);
        if (found) return found;
      }
    }
    return null;
  };

  const suggestedTree = useMemo(() => {
    if (!suggestedMatchedIds || suggestedMatchedIds.size === 0) return [];
    return applySuggestionSearch(fullTree, suggestedMatchedIds, true);
  }, [fullTree, suggestedMatchedIds, relatedTieuChiIds]);

  const maxSuggestedDepth = useMemo(() => getMaxDepth(suggestedTree), [suggestedTree]);
  const flattenedSuggestedData = useMemo(() => flattenTreeForSpan(suggestedTree, maxSuggestedDepth, true), [suggestedTree, maxSuggestedDepth]);

  const suggestedLevelNames = ["Nhóm tiêu chí", "Nhiệm vụ", "Công việc chi tiết", "Sản phẩm đầu ra"];
  const suggestedColumns: TableProps<any>["columns"] = useMemo(() => {
    const cols = [];
    cols.push({
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>STT</span>,
      dataIndex: "stt",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => ({
        children: index + 1,
      })
    });
    for (let i = 1; i <= maxSuggestedDepth; i++) {
      const colName = suggestedLevelNames[i - 1] || `Cấp ${i}`;
      cols.push({
        title: <span style={{ color: '#ffffff', fontWeight: 600 }}>{colName}</span>,
        dataIndex: `level${i}Name`,
        key: `level${i}`,
        width: i === 1 ? 250 : 300,
        render: (value: any, record: any) => ({
          children: <HighlightText text={value} highlight={""} />,
          // Không dùng props rowSpan nữa
        })
      });
    }
    cols.push(
      {
        title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Điểm</span>,
        dataIndex: "diem",
        key: "diem",
        width: 80,
        align: "center" as const,
        render: (value: any, record: any) => ({
          children: value,
        })
      },
      {
        title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Hệ số</span>,
        dataIndex: "heSo",
        key: "heSo",
        width: 80,
        align: "center" as const,
        render: (value: any, record: any) => ({
          children: value,
        })
      },
      {
        title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Ghi chú</span>,
        dataIndex: "ghiChu",
        key: "ghiChu",
        width: 150,
        render: (value: any, record: any) => ({
          children: value,
        })
      },
      {
        title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Khung điểm</span>,
        dataIndex: "khungDiemToiDa",
        key: "khungDiemToiDa",
        width: 100,
        align: "center" as const,
        render: (value: any, record: any) => ({
          children: value,
        })
      }
    );
    return cols;
  }, [maxSuggestedDepth]);

  const handleLevelSearch = (level: number, value: string) => {
    const newSearch = { ...levelSearch, [level]: value };
    setLevelSearch(newSearch);
    performSearch(newSearch);
  };

  // Column names for children (skip level 1 "Nhóm nhiệm vụ")
  const levelNames = ["Nhiệm vụ", "Công việc chi tiết", "Sản phẩm đầu ra"];

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
      render: (_: any, __: any, index: number) => {
        return {
          children: index + 1,
        };
      }
    });

    for (let i = 1; i <= childMaxDepth; i++) {
      const colName = levelNames[i - 1] || `Cấp ${i}`;
      cols.push({
        title: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
            <div style={{ textAlign: 'center', color: '#ffffff', fontWeight: 600 }}>{colName}</div>
            <Input
              placeholder={`Tìm ${colName.toLowerCase()}...`}
              allowClear
              prefix={<SearchOutlined style={{ color: '#ccc', marginRight: 4 }} />}
              onPressEnter={(e: any) => handleLevelSearch(i, e.target.value)}
              onBlur={(e: any) => handleLevelSearch(i, e.target.value)}
              onChange={(e) => {
                if (!e.target.value) handleLevelSearch(i, '');
              }}
              className="premium-search-input"
            />
          </div>
        ),
        dataIndex: `level${i}Name`,
        key: `level${i}`,
        width: 300,
        render: (value: any, record: any) => {
          let extraTab = null;
          // Chỉ thêm tag "Đề xuất" ở cột cuối cùng (Sản phẩm đầu ra)
          if (i === childMaxDepth) {
            const isRowSuggested = flattenedSuggestedData.some((s: any) => String(s.id).toLowerCase() === String(record.id).toLowerCase());
            if (isRowSuggested) {
              extraTab = (
                <span style={{
                  marginLeft: 8,
                  padding: '2px 8px',
                  background: '#ff4d4f',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(255, 77, 79, 0.2)'
                }}>
                  Đề xuất
                </span>
              );
            }
          }

          return {
            children: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ flex: 1 }}><HighlightText text={value} highlight={levelSearch[i]} /></span>
                {extraTab}
              </div>
            ),
            props: { rowSpan: record[`level${i}RowSpan`] }
          };
        }
      });
    }
    return cols;
  }, [childMaxDepth, levelSearch, flattenedSuggestedData]);

  const childColumns: TableProps<any>["columns"] = useMemo(() => [
    ...childDynamicColumns,
    {
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Điểm</span>,
      dataIndex: "diem",
      key: "diem",
      width: 80,
      align: "center" as const,
      render: (value: any, record: any) => ({
        children: value,
        props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
      })
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
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Ghi chú</span>,
      dataIndex: "ghiChu",
      key: "ghiChu",
      width: 150,
      render: (value: any, record: any) => ({
        children: value,
        props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
      })
    },
    {
      title: <span style={{ color: '#ffffff', fontWeight: 600 }}>Khung điểm</span>,
      dataIndex: "khungDiemToiDa",
      key: "khungDiemToiDa",
      width: 100,
      align: "center" as const,
      render: (value: any, record: any) => ({
        children: value,
        props: { rowSpan: record[`level${childMaxDepth}RowSpan`] }
      })
    },
  ], [childDynamicColumns, childMaxDepth]);

  // ===================== Row selection (radio - single) =====================

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: any[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
    getCheckboxProps: (record: any) => {
      const name = record.tenNhomTieuChi || record.congViecChiTiet || record.sanPhamDauRa;
      const hasDiem = record.diem !== null && record.diem !== undefined && record.diem !== "";
      const isAlreadySelected = initialSelectedNames?.includes(name);
      return {
        disabled: isAlreadySelected || !hasDiem,
        style: (!hasDiem && !isAlreadySelected) ? { display: 'none' } : undefined,
      };
    },
  };

  // ===================== Handlers =====================

  const handleSelectLevel1 = (item: any) => {
    setSelectedLevel1(item);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setLevelSearch({});
    setElasticMatchedIdsByLevel(null);
  };

  const handleConfirm = () => {
    onSelectMultiple(selectedRows);
    onCancel();
  };

  const handleRowClick = (record: any) => {
    const name = record.tenNhomTieuChi || record.congViecChiTiet || record.sanPhamDauRa;
    const hasDiem = record.diem !== null && record.diem !== undefined && record.diem !== "";
    const isAlreadySelected = initialSelectedNames?.includes(name);

    if (!isAlreadySelected && hasDiem) {
      setSelectedRowKeys([record.key]);
      setSelectedRows([record]);
    }
  };

  // ===================== Render =====================

  return (
    <Modal
      title={
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
          Chọn căn cứ tiêu chí đánh giá
        </div>
      }
      closeIcon={<span style={{ color: '#ffffff', fontSize: '16px', lineHeight: '1' }}>✕</span>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} style={{ marginRight: 8 }}>
          Hủy
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm} disabled={selectedRows.length === 0} style={{ color: '#fff', backgroundColor: '#0355a2', borderColor: '#0355a2' }}>
          Xác nhận chọn ({selectedRows.length})
        </Button>,
      ]}
      width="96vw"
      style={{ top: 15 }}
      styles={{
        header: { background: '#0355a2', padding: '12px 20px', margin: 0, borderRadius: '8px 8px 0 0' },
        body: { maxHeight: 'calc(90vh - 120px)', overflowY: 'auto', overflowX: 'hidden', padding: '16px 20px' },
        footer: { borderTop: '1px solid #f0f0f0', padding: '10px 24px', margin: 0 }
      }}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
          
          /* Làm đẹp thanh Search trên header */
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
          
          @keyframes highlight-pulse {
            0% { box-shadow: 0 0 0 0 rgba(250, 173, 20, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(250, 173, 20, 0); }
            100% { box-shadow: 0 0 0 0 rgba(250, 173, 20, 0); }
          }
          
          .suggestion-box {
            background-color: #fffbe6;
            border: 2px solid #faad14;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            animation: highlight-pulse 2s infinite;
          }
          .suggestion-text {
            color: #d46b08;
            font-weight: 600;
            margin-bottom: 12px;
            font-size: 15px;
          }
          
          .suggested-child-row > td.ant-table-cell {
            background-color: #fffbe6 !important;
          }
          .suggested-child-row:hover > td.ant-table-cell {
            background-color: #fff1b8 !important;
          }
          
          /* Highlight row trong bảng đề xuất để rõ ràng hơn */
          .suggested-table-row > td.ant-table-cell {
            background-color: #fafafa !important;
          }
        `}</style>

        {/* Phần bảng đề xuất */}
        {(!!(tenNhiemVu || tenSanPham) || (relatedTieuChiIds && relatedTieuChiIds.length > 0)) && (
          <div className="suggestion-box" style={{ padding: isSuggestionOpen ? '16px' : '12px 16px', transition: 'all 0.2s ease' }}>
            <div
              className="suggestion-text"
              onClick={() => setIsSuggestionOpen(!isSuggestionOpen)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, userSelect: 'none' }}
            >
              <span>
                {relatedTieuChiIds && relatedTieuChiIds.length > 0 ? (
                  <>Dựa vào các tiêu chí đã chọn ở sản phẩm đầu ra khác, chúng tôi đề xuất các tiêu chí cùng nhóm:</>
                ) : (
                  <>Dựa vào tên nhiệm vụ: <strong>{tenNhiemVu || '---'}</strong> - tên sản phẩm đầu ra: <strong>{tenSanPham || '---'}</strong>, chúng tôi đề xuất các tiêu chí sau:</>
                )}
              </span>
              <span style={{ fontSize: 13, color: '#d46b08', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, paddingLeft: 12 }}>
                {isSuggestionOpen ? <><UpOutlined /> Thu gọn</> : <><DownOutlined /> Mở rộng đề xuất</>}
              </span>
            </div>
            {isSuggestionOpen && (
              <div style={{ marginTop: 12 }}>
                {flattenedSuggestedData.length > 0 ? (
                  <Table
                    className="custom-bold-header"
                    rowClassName={() => "suggested-table-row"}
                    rowSelection={{
                      type: 'radio',
                      ...rowSelection,
                    }}
                    columns={suggestedColumns}
                    dataSource={flattenedSuggestedData}
                    loading={loading}
                    pagination={false}
                    scroll={{ y: 300, x: 'max-content' }}
                    bordered
                    size="small"
                    onRow={(record) => ({
                      onClick: () => handleRowClick(record),
                      style: { cursor: 'pointer' }
                    })}
                  />
                ) : (
                  <div style={{ padding: 16, textAlign: 'center', color: '#8c8c8c' }}>
                    Không tìm thấy tiêu chí đề xuất phù hợp.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Phần bảng chọn bình thường */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 450 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: '#1f2937', marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
            Chọn tiêu chí từ danh sách toàn bộ
          </div>
          <div style={{ display: 'flex', gap: 16, flex: 1 }}>
            {/* Left sidebar: Level 1 list */}
            <div style={{
              width: 280,
              minWidth: 280,
              borderRight: '1px solid #e8e8e8',
              paddingRight: 16,
              overflowY: 'auto',
              maxHeight: 500,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14, color: '#333' }}>
                Nhóm tiêu chí
              </div>
              {fullTree.map((item: any, index: number) => {
                const name = item.tenNhomTieuChi || item.congViecChiTiet || item.sanPhamDauRa || `Nhóm ${index + 1}`;
                const isActive = selectedLevel1?.id === item.id;
                return (
                  <div
                    key={item.id || index}
                    onClick={() => handleSelectLevel1(item)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 14px',
                      borderRadius: 6,
                      marginBottom: 6,
                      border: isActive ? '1px solid #1677ff' : '1px solid #e8e8e8',
                      background: isActive ? '#e6f4ff' : '#fafafa',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 13,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                    <span>{name}</span>
                    {isActive && <RightOutlined style={{ color: '#1677ff', fontSize: 12 }} />}
                  </div>
                );
              })}
            </div>

            {/* Right content: Children table */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {selectedLevel1 ? (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1677ff' }}>
                      {selectedLevel1?.tenNhomTieuChi || selectedLevel1?.congViecChiTiet || selectedLevel1?.sanPhamDauRa}
                    </div>
                  </div>
                  <Table
                    className="custom-bold-header"
                    rowSelection={{
                      type: 'radio',
                      ...rowSelection,
                    }}
                    columns={childColumns}
                    dataSource={flattenedChildData}
                    loading={loading}
                    pagination={false}
                    scroll={{ y: 400, x: 'max-content' }}
                    bordered
                    size="small"
                    onRow={(record) => ({
                      onClick: () => handleRowClick(record),
                      style: { cursor: 'pointer' }
                    })}
                  />
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                  Chọn nhóm tiêu chí bên trái để xem chi tiết
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalChonTieuChi;
