import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  RotateCcw,
  Filter,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  Network,
  FolderTree,
  Table as TableIcon,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Phone,
  Mail,
  CornerDownRight
} from 'lucide-react';
import { decodeVietnamese } from './App';

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  parentId?: string | null;
  parentName?: string | null;
  level: number;
  priority: number;
  loai: string;
  isActive: boolean;
  address?: string;
  hotline?: string;
  email?: string;
  createdDate: string;
}

export interface DepartmentTreeNode extends DepartmentItem {
  stt: string;
  children?: DepartmentTreeNode[];
}

interface DepartmentsTabProps {
  token: string | null;
  notify: (text: string, type?: 'success' | 'error') => void;
  onRefreshEvents?: () => void;
}

const API_BASE = 'http://localhost:5001/api/auth';

export const DepartmentsTab: React.FC<DepartmentsTabProps> = ({ token, notify, onRefreshEvents }) => {
  const [rawDepartments, setRawDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // View Mode: 'tree' | 'table' (Giống hệt Segmented bên asset-client / kpi-client)
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');

  // Search & Filter
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLoai, setSearchLoai] = useState('ALL');
  const [searchStatus, setSearchStatus] = useState('ALL');

  // Tree state: set các ID đang mở rộng
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [confirmDeleteDept, setConfirmDeleteDept] = useState<DepartmentItem | null>(null);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formLevel, setFormLevel] = useState<number>(1);
  const [formLoai, setFormLoai] = useState('PHONG_BAN');
  const [formPriority, setFormPriority] = useState<number>(1);
  const [formAddress, setFormAddress] = useState('');
  const [formHotline, setFormHotline] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Fetch API
  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const list: DepartmentItem[] = json.data;
          setRawDepartments(list);
          // Mặc định mở rộng tất cả các node cấp 1 và cấp 2
          const defaultExpanded = new Set<string>();
          list.forEach(d => defaultExpanded.add(d.id));
          setExpandedNodeIds(defaultExpanded);
        }
      }
    } catch {
      notify('Không thể kết nối đến Identity Service', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, notify]);

  useEffect(() => {
    if (token) {
      fetchDepartments();
    }
  }, [token, fetchDepartments]);

  // Build Tree Structure từ mảng phẳng
  const buildTree = useCallback((items: DepartmentItem[]): DepartmentTreeNode[] => {
    const map = new Map<string, DepartmentTreeNode>();
    const roots: DepartmentTreeNode[] = [];

    // Khởi tạo map
    items.forEach((item) => {
      map.set(item.id, { ...item, stt: '', children: [] });
    });

    // Tạo liên kết cha - con
    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    // Hàm đệ quy gán STT (1, 1.1, 1.2...) và sắp xếp theo priority
    const assignSttAndSort = (nodes: DepartmentTreeNode[], prefix = ''): DepartmentTreeNode[] => {
      nodes.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
      return nodes.map((node, index) => {
        const stt = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
        node.stt = stt;
        if (node.children && node.children.length > 0) {
          node.children = assignSttAndSort(node.children, stt);
        }
        return node;
      });
    };

    return assignSttAndSort(roots);
  }, []);

  // Filter cây đệ quy
  const filterTree = useCallback((nodes: DepartmentTreeNode[], kw: string, loai: string, status: string): DepartmentTreeNode[] => {
    const k = kw.toLowerCase().trim();

    return nodes.reduce<DepartmentTreeNode[]>((acc, node) => {
      const filteredChildren = node.children ? filterTree(node.children, kw, loai, status) : [];

      const matchKw = !k ||
        node.name.toLowerCase().includes(k) ||
        node.code.toLowerCase().includes(k) ||
        (node.shortName && node.shortName.toLowerCase().includes(k));

      const matchLoai = loai === 'ALL' || node.loai === loai;
      const matchStatus = status === 'ALL' || (status === 'ACTIVE' ? node.isActive : !node.isActive);

      const selfMatch = matchKw && matchLoai && matchStatus;

      if (selfMatch || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren
        });
      }
      return acc;
    }, []);
  }, []);

  // Toàn bộ cây dữ liệu đã qua lọc
  const treeData = useMemo(() => {
    const fullTree = buildTree(rawDepartments);
    if (!searchKeyword && searchLoai === 'ALL' && searchStatus === 'ALL') {
      return fullTree;
    }
    return filterTree(fullTree, searchKeyword, searchLoai, searchStatus);
  }, [rawDepartments, searchKeyword, searchLoai, searchStatus, buildTree, filterTree]);

  // Toggle expand/collapse 1 node
  const toggleNode = (id: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Mở rộng hoặc thu gọn toàn bộ cây
  const handleExpandAll = () => {
    const all = new Set<string>();
    rawDepartments.forEach(d => all.add(d.id));
    setExpandedNodeIds(all);
  };

  const handleCollapseAll = () => {
    setExpandedNodeIds(new Set());
  };

  // Handlers mở Modal
  const handleOpenCreateRoot = () => {
    setFormCode('');
    setFormName('');
    setFormShortName('');
    setFormParentId('');
    setFormLevel(1);
    setFormLoai('DON_VI');
    setFormPriority(rawDepartments.length + 1);
    setFormAddress('');
    setFormHotline('');
    setFormEmail('');
    setFormIsActive(true);
    setIsCreateModalOpen(true);
  };

  const handleOpenCreateChild = (parent: DepartmentItem) => {
    setFormCode('');
    setFormName('');
    setFormShortName('');
    setFormParentId(parent.id);
    setFormLevel(parent.level + 1);
    setFormLoai(parent.level === 1 ? 'PHONG_BAN' : 'TO_NHOM');
    setFormPriority(1);
    setFormAddress(parent.address || '');
    setFormHotline('');
    setFormEmail('');
    setFormIsActive(true);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (d: DepartmentItem) => {
    setSelectedDept(d);
    setFormCode(d.code);
    setFormName(d.name);
    setFormShortName(d.shortName || '');
    setFormParentId(d.parentId || '');
    setFormLevel(d.level);
    setFormLoai(d.loai);
    setFormPriority(d.priority);
    setFormAddress(d.address || '');
    setFormHotline(d.hotline || '');
    setFormEmail(d.email || '');
    setFormIsActive(d.isActive);
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = (d: DepartmentItem) => {
    setSelectedDept(d);
    setIsDetailModalOpen(true);
  };

  // Lưu tạo mới
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      notify('Mã và tên phòng ban không được để trống!', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
          shortName: formShortName.trim() || null,
          parentId: formParentId ? formParentId : null,
          level: formParentId ? (formLevel || 2) : 1,
          loai: formLoai,
          priority: formPriority || 1,
          isActive: formIsActive,
          address: formAddress.trim() || null,
          hotline: formHotline.trim() || null,
          email: formEmail.trim() || null
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Tạo mới "${formName}" và phát sự kiện RabbitMQ thành công!`);
        setIsCreateModalOpen(false);
        fetchDepartments();
        onRefreshEvents?.();
      } else {
        notify(json.message || 'Lỗi khi tạo phòng ban', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  // Lưu chỉnh sửa
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    try {
      const res = await fetch(`${API_BASE}/departments/${selectedDept.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName.trim(),
          shortName: formShortName.trim() || null,
          parentId: formParentId ? formParentId : null,
          level: formLevel,
          loai: formLoai,
          priority: formPriority,
          isActive: formIsActive,
          address: formAddress.trim() || null,
          hotline: formHotline.trim() || null,
          email: formEmail.trim() || null
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Cập nhật "${formName}" và đồng bộ RabbitMQ thành công!`);
        setIsEditModalOpen(false);
        fetchDepartments();
        onRefreshEvents?.();
      } else {
        notify(json.message || 'Lỗi khi cập nhật', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  // Xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!confirmDeleteDept) return;

    try {
      const res = await fetch(`${API_BASE}/departments/${confirmDeleteDept.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Xóa phòng ban "${confirmDeleteDept.name}" và đồng bộ RabbitMQ thành công!`);
        setConfirmDeleteDept(null);
        fetchDepartments();
        onRefreshEvents?.();
      } else {
        notify(json.message || 'Lỗi khi xóa phòng ban', 'error');
      }
    } catch {
      notify('Lỗi kết nối tới Identity Service', 'error');
    }
  };

  // Helper render Badge loại đơn vị
  const renderLoaiBadge = (loai: string, level: number) => {
    if (loai === 'DON_VI' || level === 1) {
      return (
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#e6f4ff', color: '#005baa', border: '1px solid #91caff' }}>
          🏢 Đơn vị / Cơ quan
        </span>
      );
    }
    if (loai === 'TRUNG_TAM') {
      return (
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' }}>
          🏛️ Trung tâm
        </span>
      );
    }
    if (loai === 'TO_NHOM') {
      return (
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' }}>
          👥 Tổ / Nhóm
        </span>
      );
    }
    return (
      <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' }}>
        📁 Phòng ban
      </span>
    );
  };

  // Helper render Node đệ quy trong chế độ Tree View
  const renderTreeNode = (node: DepartmentTreeNode, depth = 0) => {
    const isExpanded = expandedNodeIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isRoot = depth === 0;

    return (
      <div key={node.id} style={{ marginBottom: '8px' }}>
        {/* Row Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: isRoot ? '#f8fafd' : '#ffffff',
          borderRadius: '8px',
          border: isRoot ? '1px solid #bae0ff' : '1px solid #e5e7eb',
          boxShadow: isRoot ? '0 1px 3px rgba(0, 91, 170, 0.08)' : '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'all 0.15s ease'
        }}>
          {/* Left Info with Indent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            {/* Expand / Collapse Button */}
            <button
              onClick={() => toggleNode(node.id)}
              disabled={!hasChildren}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                background: hasChildren ? '#ffffff' : '#f5f5f5',
                color: hasChildren ? '#005baa' : '#bfbfbf',
                cursor: hasChildren ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />
              ) : (
                <span style={{ fontSize: '10px' }}>•</span>
              )}
            </button>

            {/* STT Badge */}
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              background: isRoot ? '#005baa' : '#f0f0f0',
              color: isRoot ? '#ffffff' : '#4b5563',
              padding: '1px 6px',
              borderRadius: '4px',
              minWidth: '24px',
              textAlign: 'center'
            }}>
              {node.stt}
            </span>

            {/* Department Name & Code */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: isRoot ? 700 : 600, fontSize: isRoot ? '14px' : '13.5px', color: isRoot ? '#005baa' : '#1f2937' }}>
                {decodeVietnamese(node.name)}
              </span>

              <code style={{ fontSize: '11px', background: '#eef2ff', color: '#4338ca', padding: '1px 6px', borderRadius: '4px', border: '1px solid #c7d2fe' }}>
                {node.code}
              </code>

              {node.shortName && (
                <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px' }}>
                  ({node.shortName})
                </span>
              )}

              {renderLoaiBadge(node.loai, node.level)}

              {/* Status Pill */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '10px',
                background: node.isActive ? '#f6ffed' : '#fff2f0',
                color: node.isActive ? '#389e0d' : '#cf1322',
                border: `1px solid ${node.isActive ? '#b7eb8f' : '#ffccc7'}`
              }}>
                {node.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                <span>{node.isActive ? 'Hoạt động' : 'Tạm dừng'}</span>
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => handleOpenCreateChild(node)}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#005baa', borderColor: '#91caff', background: '#e6f4ff' }}
              title="Thêm phòng ban / đơn vị trực thuộc"
            >
              <FolderPlus size={14} />
              <span>+ Đơn vị con</span>
            </button>

            <button
              onClick={() => handleOpenDetail(node)}
              style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #d9d9d9', background: '#ffffff', color: '#005baa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Xem thông tin chi tiết"
            >
              <Eye size={14} />
            </button>

            <button
              onClick={() => handleOpenEdit(node)}
              style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #d9d9d9', background: '#ffffff', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Chỉnh sửa thông tin"
            >
              <Edit size={14} />
            </button>

            <button
              onClick={() => setConfirmDeleteDept(node)}
              style={{ width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #d9d9d9', background: '#ffffff', color: '#cf1322', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Xóa phòng ban"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Child Subtree */}
        {hasChildren && isExpanded && (
          <div style={{
            marginLeft: '20px',
            paddingLeft: '14px',
            borderLeft: '2px dashed #91caff',
            marginTop: '8px'
          }}>
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Helper render dòng trong chế độ Table View phẳng
  const renderTableRows = (nodes: DepartmentTreeNode[], depth = 0): React.ReactNode[] => {
    let rows: React.ReactNode[] = [];

    nodes.forEach((node) => {
      const isExpanded = expandedNodeIds.has(node.id);
      const hasChildren = node.children && node.children.length > 0;
      const isRoot = depth === 0;

      rows.push(
        <tr
          key={node.id}
          style={{
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: isRoot ? '#fafcff' : '#ffffff',
            fontSize: '13px'
          }}
        >
          <td style={{ padding: '12px 14px', textAlign: 'center', color: '#6b7280', fontWeight: 600 }}>
            {node.stt}
          </td>

          <td style={{ padding: '12px 14px', fontWeight: 600 }}>
            <code style={{ background: '#f0f5ff', color: '#005baa', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d6e4ff' }}>
              {node.code}
            </code>
          </td>

          <td style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: `${depth * 22}px` }}>
              {depth > 0 && (
                <CornerDownRight size={14} style={{ color: '#91caff', flexShrink: 0 }} />
              )}
              {hasChildren && (
                <button
                  onClick={() => toggleNode(node.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#005baa',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              <span style={{ fontWeight: isRoot ? 700 : 500, color: isRoot ? '#005baa' : '#111827' }}>
                {decodeVietnamese(node.name)}
              </span>
              {node.shortName && (
                <span style={{ fontSize: '11px', color: '#6b7280' }}>({node.shortName})</span>
              )}
            </div>
          </td>

          <td style={{ padding: '12px 14px' }}>
            {renderLoaiBadge(node.loai, node.level)}
          </td>

          <td style={{ padding: '12px 14px', fontSize: '12px', color: '#4b5563' }}>
            {node.hotline && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {node.hotline}</div>}
            {node.email && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {node.email}</div>}
            {!node.hotline && !node.email && <span style={{ color: '#9ca3af' }}>—</span>}
          </td>

          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '10px',
              background: node.isActive ? '#f6ffed' : '#fff2f0',
              color: node.isActive ? '#389e0d' : '#cf1322',
              border: `1px solid ${node.isActive ? '#b7eb8f' : '#ffccc7'}`
            }}>
              {node.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
              <span>{node.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span>
            </span>
          </td>

          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <button
                onClick={() => handleOpenCreateChild(node)}
                style={{ background: '#e6f4ff', border: '1px solid #91caff', borderRadius: '4px', padding: '4px 6px', color: '#005baa', cursor: 'pointer' }}
                title="Thêm đơn vị con trực thuộc"
              >
                <Plus size={13} />
              </button>
              <button
                onClick={() => handleOpenEdit(node)}
                style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px', padding: '4px 6px', color: '#d46b08', cursor: 'pointer' }}
                title="Sửa"
              >
                <Edit size={13} />
              </button>
              <button
                onClick={() => setConfirmDeleteDept(node)}
                style={{ background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '4px', padding: '4px 6px', color: '#cf1322', cursor: 'pointer' }}
                title="Xóa"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </td>
        </tr>
      );

      if (hasChildren && isExpanded) {
        rows = rows.concat(renderTableRows(node.children!, depth + 1));
      }
    });

    return rows;
  };

  return (
    <div className="tab-pane animate-fade-in">
      {/* 1. Page Header & View Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        background: '#ffffff',
        padding: '16px 20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #005baa 0%, #003a6c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Network size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Cơ Cấu Tổ Chức & Sơ Đồ Cây Phòng Ban
            </h2>
            <p style={{ fontSize: '12.5px', color: '#6b7280', margin: '2px 0 0 0' }}>
              Master Data gốc của cơ quan — Tự động đồng bộ sang Phân hệ Quản lý Tài sản & Đánh giá KPI qua RabbitMQ
            </p>
          </div>
        </div>

        {/* Right Tools: View Mode Toggle & Add Root Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Segmented View Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f3f4f6',
            padding: '3px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setViewMode('tree')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'tree' ? '#ffffff' : 'transparent',
                color: viewMode === 'tree' ? '#005baa' : '#6b7280',
                fontWeight: viewMode === 'tree' ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: viewMode === 'tree' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <FolderTree size={15} />
              <span>Dạng Cây (Tree)</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#005baa' : '#6b7280',
                fontWeight: viewMode === 'table' ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              <TableIcon size={15} />
              <span>Dạng Bảng (Table)</span>
            </button>
          </div>

          <button
            onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Filter size={15} />
            <span>{isSearchPanelOpen ? 'Thu gọn' : 'Bộ lọc'}</span>
          </button>

          <button
            onClick={handleOpenCreateRoot}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Thêm Đơn Vị Gốc</span>
          </button>
        </div>
      </div>

      {/* 2. Collapsible Filter Panel */}
      {isSearchPanelOpen && (
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '16px 20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Từ khóa tìm kiếm
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Mã, tên, viết tắt..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Loại hình tổ chức
              </label>
              <select
                className="input-field"
                value={searchLoai}
                onChange={(e) => setSearchLoai(e.target.value)}
              >
                <option value="ALL">-- Tất cả loại hình --</option>
                <option value="DON_VI">Đơn vị / Cơ quan</option>
                <option value="PHONG_BAN">Phòng ban</option>
                <option value="TRUNG_TAM">Trung tâm</option>
                <option value="TO_NHOM">Tổ / Nhóm trực thuộc</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Trạng thái hoạt động
              </label>
              <select
                className="input-field"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              >
                <option value="ALL">-- Tất cả trạng thái --</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', gap: '8px' }}>
            <button
              onClick={() => {
                setSearchKeyword('');
                setSearchLoai('ALL');
                setSearchStatus('ALL');
              }}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Tree / Table Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '16px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Tree Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Tổng cộng: <strong>{rawDepartments.length}</strong> đơn vị / phòng ban</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExpandAll}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              Mở rộng tất cả
            </button>
            <button
              onClick={handleCollapseAll}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              Thu gọn tất cả
            </button>
          </div>
        </div>

        {/* Loading / Empty State */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Đang tải dữ liệu sơ đồ tổ chức...
          </div>
        ) : treeData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Không tìm thấy phòng ban nào phù hợp với điều kiện tìm kiếm.
          </div>
        ) : viewMode === 'tree' ? (
          /* CHẾ ĐỘ 1: DẠNG CÂY TRỰC QUAN (TREE VIEW) */
          <div>
            {treeData.map((node) => renderTreeNode(node, 0))}
          </div>
        ) : (
          /* CHẾ ĐỘ 2: DẠNG BẢNG PHÂN CẤP (TABLE VIEW) */
          <div style={{ overflowX: 'auto' }}>
            <table className="corporate-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#005baa', color: '#ffffff', textAlign: 'left', fontSize: '13px' }}>
                  <th style={{ padding: '12px 14px', width: '70px', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '12px 14px', width: '130px' }}>Mã Đơn Vị</th>
                  <th style={{ padding: '12px 14px' }}>Tên Phòng Ban / Đơn Vị</th>
                  <th style={{ padding: '12px 14px', width: '150px' }}>Loại Hình</th>
                  <th style={{ padding: '12px 14px', width: '190px' }}>Thông Tin Liên Hệ</th>
                  <th style={{ padding: '12px 14px', width: '120px', textAlign: 'center' }}>Trạng Thái</th>
                  <th style={{ padding: '12px 14px', width: '110px', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {renderTableRows(treeData, 0)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: THÊM MỚI PHÒNG BAN / ĐƠN VỊ (FIX HOÀN TOÀN LỖI TRÀN MÀN HÌNH)      */}
      {/* ========================================================================= */}
      {isCreateModalOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '60px 16px 40px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '720px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#e6f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#005baa' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Thêm Mới Phòng Ban / Cơ Cấu Tổ Chức
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                    Master Data gốc sẽ được tự động đồng bộ sang Phân hệ Quản lý Tài sản và KPI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCreate}>
              <div style={{ padding: '24px 24px 16px' }}>
                
                {/* Trực thuộc đơn vị cha */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Trực thuộc Đơn vị / Phòng ban cha
                  </label>
                  <select
                    className="input-field"
                    value={formParentId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setFormParentId(pid);
                      if (pid) {
                        const p = rawDepartments.find(d => d.id === pid);
                        setFormLevel(p ? p.level + 1 : 2);
                      } else {
                        setFormLevel(1);
                      }
                    }}
                  >
                    <option value="">-- Đơn vị cấp cao nhất (Root - Không trực thuộc) --</option>
                    {rawDepartments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.level === 1 ? '🏢 ' : '  └─ '} {decodeVietnamese(d.name)} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mã & Tên viết tắt */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Mã phòng ban <span style={{ color: '#ff4d4f' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="VD: TC_KT, CSVC_TS..."
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Tên viết tắt
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="VD: TCKT, CSVC..."
                      value={formShortName}
                      onChange={(e) => setFormShortName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tên phòng ban đầy đủ */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Tên phòng ban / Đơn vị đầy đủ <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="VD: Phòng Tài Chính - Kế Toán..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* Loại hình & Thứ tự ưu tiên */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Loại hình tổ chức
                    </label>
                    <select
                      className="input-field"
                      value={formLoai}
                      onChange={(e) => setFormLoai(e.target.value)}
                    >
                      <option value="DON_VI">Đơn vị / Cơ quan</option>
                      <option value="PHONG_BAN">Phòng ban</option>
                      <option value="TRUNG_TAM">Trung tâm</option>
                      <option value="TO_NHOM">Tổ / Nhóm</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Thứ tự hiển thị (Ưu tiên)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={formPriority}
                      onChange={(e) => setFormPriority(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>

                {/* Hotline & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Điện thoại liên hệ
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="VD: 024.3888.1111"
                      value={formHotline}
                      onChange={(e) => setFormHotline(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Email phòng ban
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="VD: phongban@ebizoffice.vn"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Địa chỉ */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Địa chỉ / Vị trí phòng làm việc
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="VD: Phòng 301, Tầng 3, Tòa nhà Trụ Sở Chính..."
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>

                {/* Trạng thái hoạt động */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="createDeptIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="createDeptIsActive" style={{ fontSize: '13.5px', color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                    Kích hoạt trạng thái hoạt động ngay
                  </label>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '12px 24px',
                borderTop: '1px solid #f0f0f0',
                background: '#ffffff'
              }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Lưu & Đồng Bộ RabbitMQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CHỈNH SỬA PHÒNG BAN                                              */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedDept && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1050,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '60px 16px 40px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '720px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#fffbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <Edit size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Chỉnh Sửa Phòng Ban: <code>{selectedDept.code}</code>
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                    Thay đổi sẽ được phát tán ngay lập tức sang các service con qua RabbitMQ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit}>
              <div style={{ padding: '24px 24px 16px' }}>

                {/* Trực thuộc đơn vị cha */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Trực thuộc Đơn vị cha
                  </label>
                  <select
                    className="input-field"
                    value={formParentId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setFormParentId(pid);
                      if (pid) {
                        const p = rawDepartments.find(d => d.id === pid);
                        setFormLevel(p ? p.level + 1 : 2);
                      } else {
                        setFormLevel(1);
                      }
                    }}
                  >
                    <option value="">-- Đơn vị cấp cao nhất (Root) --</option>
                    {rawDepartments.filter(d => d.id !== selectedDept.id).map(d => (
                      <option key={d.id} value={d.id}>
                        {d.level === 1 ? '🏢 ' : '  └─ '} {decodeVietnamese(d.name)} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mã & Tên viết tắt */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Mã phòng ban (Không thể sửa)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formCode}
                      disabled
                      style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Tên viết tắt
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formShortName}
                      onChange={(e) => setFormShortName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tên phòng ban đầy đủ */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Tên phòng ban / Đơn vị đầy đủ <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* Loại hình & Thứ tự ưu tiên */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Loại hình tổ chức
                    </label>
                    <select
                      className="input-field"
                      value={formLoai}
                      onChange={(e) => setFormLoai(e.target.value)}
                    >
                      <option value="DON_VI">Đơn vị / Cơ quan</option>
                      <option value="PHONG_BAN">Phòng ban</option>
                      <option value="TRUNG_TAM">Trung tâm</option>
                      <option value="TO_NHOM">Tổ / Nhóm</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={formPriority}
                      onChange={(e) => setFormPriority(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>

                {/* Hotline & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Điện thoại liên hệ
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formHotline}
                      onChange={(e) => setFormHotline(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Email phòng ban
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Địa chỉ */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Địa chỉ / Vị trí phòng làm việc
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>

                {/* Trạng thái hoạt động */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="editDeptIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="editDeptIsActive" style={{ fontSize: '13.5px', color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
                    Trạng thái hoạt động (Có hiệu lực)
                  </label>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '12px 24px',
                borderTop: '1px solid #f0f0f0',
                background: '#ffffff'
              }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  Lưu Thay Đổi & Đồng Bộ
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: XEM CHI TIẾT PHÒNG BAN                                           */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedDept && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '60px 16px 40px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              background: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} style={{ color: '#005baa' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Thông Tin Chi Tiết Phòng Ban
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8c8c8c', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', fontSize: '13.5px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '12px', columnGap: '10px' }}>
                <div style={{ fontWeight: 600, color: '#6b7280' }}>Mã phòng ban:</div>
                <div><code>{selectedDept.code}</code></div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Tên phòng ban:</div>
                <div style={{ fontWeight: 700, color: '#005baa' }}>{decodeVietnamese(selectedDept.name)}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Tên viết tắt:</div>
                <div>{selectedDept.shortName || '—'}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Trực thuộc:</div>
                <div>{selectedDept.parentName ? decodeVietnamese(selectedDept.parentName) : 'Đơn vị cấp cao nhất (Root)'}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Loại hình:</div>
                <div>{renderLoaiBadge(selectedDept.loai, selectedDept.level)}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Điện thoại:</div>
                <div>{selectedDept.hotline || '—'}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Email:</div>
                <div>{selectedDept.email || '—'}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Địa chỉ / Vị trí:</div>
                <div>{selectedDept.address || '—'}</div>

                <div style={{ fontWeight: 600, color: '#6b7280' }}>Trạng thái:</div>
                <div>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: selectedDept.isActive ? '#f6ffed' : '#fff2f0',
                    color: selectedDept.isActive ? '#389e0d' : '#cf1322',
                    border: `1px solid ${selectedDept.isActive ? '#b7eb8f' : '#ffccc7'}`
                  }}>
                    {selectedDept.isActive ? '● Đang hoạt động' : '● Tạm ngưng'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', padding: '12px 24px', background: '#ffffff' }}>
              <button onClick={() => setIsDetailModalOpen(false)} className="btn-primary">
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* POPCONFIRM: XÁC NHẬN XÓA PHÒNG BAN                                        */}
      {/* ========================================================================= */}
      {confirmDeleteDept && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '100px 16px 40px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertCircle size={22} style={{ color: '#ff4d4f' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Xác nhận xóa phòng ban
              </h3>
            </div>

            <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5, marginBottom: '20px' }}>
              Bạn có chắc chắn muốn xóa phòng ban <strong>{confirmDeleteDept.code}</strong> ({decodeVietnamese(confirmDeleteDept.name)}) không? Hành động này sẽ phát sự kiện xóa sang các phân hệ trực thuộc qua RabbitMQ.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setConfirmDeleteDept(null)} className="btn-secondary">
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-primary"
                style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
