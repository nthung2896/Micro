"use client";
import "./BieuChamDiem.css";
import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Row, Col, Select, Button, InputNumber, Input, message, Popconfirm, Alert, Spin, Modal, Tag, Tooltip, Space } from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined, ArrowLeftOutlined, EditOutlined, ExclamationCircleFilled, EyeOutlined } from "@ant-design/icons";
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
import { useSearchParams, useRouter } from "next/navigation";
import ChiTietBieuChamDiemPage from "./ChiTiet/page";
import KpiAttachmentCell from "./KpiAttachmentCell";

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

const formatDisplayScore = (value: any) => {
  if (value === null || value === undefined || value === "") return "";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value);
  return Number(numberValue.toFixed(2)).toString();
};

export type BieuChamDiemPageProps = {
  params?: any;
  searchParams?: any;
  hideSaveButton?: boolean;
  saveRef?: React.MutableRefObject<any>;
  hideHeader?: boolean;
  idPhieu?: string;
  idDot?: string;
  idLyLich?: string;
  isModal?: boolean;
  viewOnly?: boolean;
  hasSection1Header?: boolean;
  enableAttachmentPreview?: boolean;
  onTaskScoreChange?: (scoreOutOf70: number) => void;
  silentSave?: boolean;
  vaiTroDanhGia?: string;
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
      title="Ghi chú / Giải trình"
      open={visible}
      onCancel={onCancel}
      width={650}
      destroyOnClose
      footer={readOnly ? [
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
      ] : [
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="save" type="primary" onClick={() => onSave(draft)}>
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
  silentSave = false,
  vaiTroDanhGia,
}: BieuChamDiemPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useSelector((state: any) => state.auth.User);
  const [tenDonVi, setTenDonVi] = useState<string>("");
  const [dotDanhGiaOptions, setDotDanhGiaOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedDot, setSelectedDot] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nhiemVuHeThong, setNhiemVuHeThong] = useState<any[]>([]);
  const [nhiemVuPhatSinh, setNhiemVuPhatSinh] = useState<any[]>([]);
  const [chucVuHeSo, setChucVuHeSo] = useState<number | null>(null);
  const [tenChucVuLanhDao, setTenChucVuLanhDao] = useState<string>("");
  const [kqLinhVucPercent, setKqLinhVucPercent] = useState<number>(100);
  const [knToChucPercent, setKnToChucPercent] = useState<number>(100);
  const [nlTapHopPercent, setNlTapHopPercent] = useState<number>(100);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const [checkingPermission, setCheckingPermission] = useState<boolean>(true);
  const [canEditView, setCanEditView] = useState<boolean>(true);
  const editEnabled = canEditView && !viewOnly;
  const isEvaluatingUpperRole = Boolean(vaiTroDanhGia && vaiTroDanhGia !== "CaNhan");
  const canAddEditTasks = editEnabled && !isEvaluatingUpperRole;

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
  useEffect(() => { inlineTasksRef.current = inlineTasks; }, [inlineTasks]);
  const [chonTieuChiVisible, setChonTieuChiVisible] = useState(false);
  const [editingTaskIds, setEditingTaskIds] = useState<Set<string>>(new Set());
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
    const task = inlineTasksRef.current.find((t: any) => t.id === inlineTaskId) || taskData;
    const initialData = task?.danhSachDauRa?.[productIndex] || {};
    setProductModalState({
      visible: true,
      inlineTaskId,
      productIndex,
      initialData,
      tenNhiemVu: task?.tenNhiemVuDayDu || task?.tenNhiemVuRutGon || "",
    });
  }, [viewOnly]);

  const handleSaveProductFromModal = React.useCallback((productData: any) => {
    if (viewOnly) return;
    const { inlineTaskId, productIndex } = productModalState;
    if (!inlineTaskId || productIndex === null) return;

    setInlineTasks((prev: any[]) => {
      const next = prev.map(t => {
        if (t.id === inlineTaskId) {
          const newDauRa = [...(t.danhSachDauRa || [])];
          if (productIndex >= 0 && productIndex < newDauRa.length) {
            newDauRa[productIndex] = normalizeProductAttachments({ ...newDauRa[productIndex], ...productData });
          } else {
            newDauRa.push(normalizeProductAttachments(productData));
          }
          const boTieuChiList = newDauRa.map((sp: any) => sp.tenTieuChi || sp.tieuChiId).filter(Boolean);
          const diemBoTieuChi = newDauRa.reduce((sum: number, sp: any) => sum + (sp.diemTheoBoTieuChi || 0), 0);
          return {
            ...t,
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
  }, [normalizeProductAttachments, productModalState, viewOnly]);

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
  }, [queryIdPhieu, queryIdDot, currentUser, viewOnly]);

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
    const invalid = files.find((file) => {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      return extension !== ".pdf" || file.size <= 0 || file.size > 10 * 1024 * 1024;
    });
    if (invalid) {
      message.error(`File ${invalid.name} phải là .pdf và không vượt quá 10 MB.`);
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
            // Khi chọn tiêu chí mới, mặc định hoàn thành toàn bộ điểm được giao.
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
    setInlineTasks((prev: any[]) => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }, [viewOnly]);

  const handleInlineProductChange = React.useCallback((id: string, index: number, field: string, value: any) => {
    if (viewOnly) return;
    const updater = (prev: any[]) => prev.map(t => {
      if (t.id === id) {
        const newDauRa = [...(t.danhSachDauRa || [])];
        newDauRa[index] = { ...normalizeProductAttachments(newDauRa[index]), [field]: value };
        return { ...t, danhSachDauRa: newDauRa };
      }
      return t;
    });
    setInlineTasks((prev: any[]) => {
      const next = updater(prev);
      inlineTasksRef.current = next;
      return next;
    });
  }, [normalizeProductAttachments, viewOnly]);

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

      // Điểm số lượng luôn tính trên điểm thực tế sau hệ số, không dùng công thức
      // cấu hình có thể đang tham chiếu nhầm điểm bộ tiêu chí gốc.
      if (targetColumn === "ChamDiemSoLuong_Diem" || targetColumn === "ChamDiemSoLuong_KhongHoanThanh") {
        const soLuongHoanThanh = Math.max(0, Math.min(
          diemCoSo,
          Number(product.chamDiemSoLuong_HoanThanh || 0),
        ));
        const soLuongKhongHoanThanh = Math.max(0, diemCoSo - soLuongHoanThanh);
        const diemPhanTram = diemCoSo > 0 ? (soLuongHoanThanh / diemCoSo) * 100 : 0;
        handleInlineProductChange(id, productIndex, "chamDiemSoLuong_HoanThanh", soLuongHoanThanh);
        handleInlineProductChange(id, productIndex, "chamDiemSoLuong_KhongHoanThanh", soLuongKhongHoanThanh);
        handleInlineProductChange(id, productIndex, "chamDiemSoLuong_Diem", Math.max(0, Math.min(100, diemPhanTram)));
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
          ChamDiemSoLuong_HoanThanh: product.chamDiemSoLuong_HoanThanh || 0,
          ChamDiemSoLuong_KhongHoanThanh: product.chamDiemSoLuong_KhongHoanThanh || 0,
          ChamDiemChatLuong_KhongDat: product.chamDiemChatLuong_KhongDat || 0,
          ChamDiemChatLuong_SoDiemConLai: product.chamDiemChatLuong_SoDiemConLai || 0,
          ChamDiemTienDo_KhongDat: product.chamDiemTienDo_KhongDat || 0,
          ChamDiemTienDo_SoDiemConLai: product.chamDiemTienDo_SoDiemConLai || 0,
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
  }, [currentUser, selectedDot, handleInlineProductChange, chucVuHeSo, viewOnly]);

  const fetchNhiemVu = React.useCallback(async (targetIdLyLich: string) => {
    if (targetIdLyLich && selectedDot) {
      try {
        const resHeThong = await kPI_NhiemVuService.getNhiemVuByTypeAndLyLich(targetIdLyLich, TypeNhiemVuConstant.HETHONG, selectedDot);
        setNhiemVuHeThong((resHeThong?.data || []).map(normalizeTaskAttachments));

        const resPhatSinh = await kPI_NhiemVuService.getNhiemVuByTypeAndLyLich(targetIdLyLich, TypeNhiemVuConstant.PHATSINH, selectedDot);
        setNhiemVuPhatSinh((resPhatSinh?.data || []).map(normalizeTaskAttachments));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhiệm vụ:", error);
      }
    }
  }, [normalizeTaskAttachments, selectedDot]);

  const handleSaveInlineTasks = React.useCallback(async (phieuIdOverride?: string | null) => {
    if (viewOnly) return { error: true, message: "Phiếu đang ở chế độ chỉ xem, không thể lưu.", section: "section2" };
    const allInlineTasks = inlineTasksRef.current || [];
    if (allInlineTasks.length === 0) return true;

    const effectiveIdPhieu = phieuIdOverride || queryIdPhieu || null;

    // Check if any task has empty description
    const emptyDescTask = allInlineTasks.find((t: any) => !t.tenNhiemVuDayDu || !t.tenNhiemVuDayDu.trim());
    if (emptyDescTask) {
      if (!silentSave) {
        message.error("Không thể lưu: Vui lòng nhập đầy đủ 'Miêu tả công việc' cho tất cả các nhiệm vụ!");
      }
      return { error: true, message: "Vui lòng nhập đầy đủ 'Miêu tả công việc' cho tất cả các nhiệm vụ!", section: "section2", taskId: emptyDescTask.clientKey || emptyDescTask.dbId };
    }

    // Check if any product in any task has empty product name
    const emptyProductTask = allInlineTasks.find((t: any) =>
      t.danhSachDauRa && t.danhSachDauRa.some((sp: any) => !sp.tenSanPhamDauRa || !sp.tenSanPhamDauRa.trim())
    );
    if (emptyProductTask) {
      if (!silentSave) {
        message.error("Không thể lưu: Vui lòng nhập đầy đủ 'Sản phẩm đầu ra' cho tất cả các dòng!");
      }
      return { error: true, message: "Vui lòng nhập đầy đủ 'Sản phẩm đầu ra' cho tất cả các dòng!", section: "section2", taskId: emptyProductTask.clientKey || emptyProductTask.dbId };
    }

    const dataToSend = allInlineTasks.map((task: any) => ({
      ...(task.dbId ? { id: task.dbId } : {}),
      typeNhiemVu: task.typeNhiemVu,
      tenNhiemVuDayDu: task.tenNhiemVuDayDu,
      danhSachDauRa: (task.danhSachDauRa || []).map((sp: any) => ({
        ...(sp.id ? { id: sp.id } : {}),
        clientKey: sp.clientKey || sp.id || createClientKey(),
        keptAttachmentIds: sp.keptAttachmentIds || [],
        attachmentsTouched: Boolean(sp.attachmentsTouched),
        tenSanPhamDauRa: sp.tenSanPhamDauRa,
        chamDiemSoLuong_HoanThanh: sp.chamDiemSoLuong_HoanThanh,
        chamDiemSoLuong_KhongHoanThanh: sp.chamDiemSoLuong_KhongHoanThanh,
        chamDiemSoLuong_Diem: sp.chamDiemSoLuong_Diem !== undefined && sp.chamDiemSoLuong_Diem !== null ? Math.max(0, sp.chamDiemSoLuong_Diem) : sp.chamDiemSoLuong_Diem,
        chamDiemChatLuong_KhongDat: sp.chamDiemChatLuong_KhongDat,
        chamDiemChatLuong_SoDiemConLai: sp.chamDiemChatLuong_SoDiemConLai !== undefined && sp.chamDiemChatLuong_SoDiemConLai !== null ? Math.max(0, sp.chamDiemChatLuong_SoDiemConLai) : sp.chamDiemChatLuong_SoDiemConLai,
        chamDiemChatLuong_Diem: sp.chamDiemChatLuong_Diem !== undefined && sp.chamDiemChatLuong_Diem !== null ? Math.max(0, sp.chamDiemChatLuong_Diem) : sp.chamDiemChatLuong_Diem,
        chamDiemTienDo_KhongDat: sp.chamDiemTienDo_KhongDat,
        chamDiemTienDo_SoDiemConLai: sp.chamDiemTienDo_SoDiemConLai !== undefined && sp.chamDiemTienDo_SoDiemConLai !== null ? Math.max(0, sp.chamDiemTienDo_SoDiemConLai) : sp.chamDiemTienDo_SoDiemConLai,
        chamDiemTienDo_Diem: sp.chamDiemTienDo_Diem !== undefined && sp.chamDiemTienDo_Diem !== null ? Math.max(0, sp.chamDiemTienDo_Diem) : sp.chamDiemTienDo_Diem,
        diemTheoBoTieuChi: sp.diemTheoBoTieuChi || task.diemBoTieuChi,
        ghiChuGiaTrinh: sp.ghiChuGiaTrinh,
        tieuChiId: sp.tieuChiId,
        tenTieuChi: sp.tenTieuChi,
      })),
      boTieuChiList: task.boTieuChiList || [],
      idLyLich: targetUserId || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id || null,
      idDotTheoDoiDanhGia: selectedDot || null,
      idPhieuDanhGia: effectiveIdPhieu,
    }));

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
      if (res.status) {
        if (!silentSave) {
          message.success("Lưu nhiệm vụ thành công");
        }
        setInlineTasks([]);
        setEditingTaskIds(new Set());
        fetchNhiemVu(targetUserId || currentUser?.idLyLich || currentUser?.lyLichId || currentUser?.id || "");
        return true;
      } else {
        if (!silentSave) {
          message.error(res.message || "Có lỗi xảy ra khi lưu nhiệm vụ");
        }
        return { error: true, message: res.message || "Có lỗi xảy ra khi lưu nhiệm vụ", section: "section2" };
      }
    } catch (error) {
      console.error(error);
      if (!silentSave) {
        message.error("Có lỗi xảy ra khi lưu nhiệm vụ");
      }
      return { error: true, message: "Có lỗi xảy ra khi lưu nhiệm vụ", section: "section2" };
    }
  }, [createClientKey, currentUser, fetchNhiemVu, queryIdPhieu, selectedDot, silentSave, targetUserId, viewOnly]);

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

      const queryIdPhieu = searchParams.get("idPhieuDanhGia") || searchParams.get("idPhieu");
      if (queryIdPhieu) {
        try {
          const resPhieu = await kPI_PhieuDanhGiaService.getById(queryIdPhieu);
          if (resPhieu?.data?.idLyLich) {
            targetIdLyLich = resPhieu.data.idLyLich;
          }
        } catch (error) {
          console.error("Lỗi khi fetch phieu", error);
        }
      }

      setTargetUserId(targetIdLyLich);
      if (targetIdLyLich && selectedDot) {
        fetchNhiemVu(targetIdLyLich);
        fetchKetQuaThucHien(targetIdLyLich);
      }
    };

    if (currentUser && selectedDot) {
      fetchInitialData();
    }
  }, [currentUser, idLyLichProp, selectedDot, searchParams]);

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
        if (record.isEditing && editEnabled && record.productIndex === 0) {
          children = (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                <InlineInput type="textarea" autoSize placeholder="Miêu tả" value={record.taskData?.tenNhiemVuDayDu || record.taskData?.tenNhiemVuRutGon || ""} onChange={(val: any) => handleInlineTaskChange(record.inlineTaskId, 'tenNhiemVuDayDu', val)} />
                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveInlineTask(record.inlineTaskId)} title="Xóa nhiệm vụ này" />
              </div>
            </div>
          );
        } else if (!record.isEditing && record.productIndex === 0 && editEnabled) {
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

        const isEditing = record.isEditing && editEnabled;
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
                        backgroundColor: isAddProductDisabled ? '#f5f5f5' : '#f0fdf4',
                        fontWeight: 600
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAddProductDisabled) return;
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
        return text;
      }
    },
    {
      title: "Điểm Bộ tiêu chí",
      dataIndex: "diemBoTieuChi",
      key: "diemBoTieuChi",
      width: 80,
      align: "center",
      render: (text: any, record: any) => {
        if (record.isEditing && editEnabled) {
          return <InlineInputNumber disabled={true} value={record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi} onChange={(v: any) => handleInlineProductChange(record.inlineTaskId, record.productIndex, 'diemTheoBoTieuChi', v)} onCalculate={() => { handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_Diem", "chamDiemSoLuong_Diem"); handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemChatLuong_Diem", "chamDiemChatLuong_Diem"); handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemTienDo_Diem", "chamDiemTienDo_Diem"); }} />;
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
        if (record.isEditing && editEnabled) {
          return <InputNumber style={{ width: '100%', opacity: 0.65 }} disabled value={text} size="small" />;
        }
        return text;
      }
    }] : []),
    {
      title: "Chấm điểm số lượng",
      children: [
        {
          title: "Hoàn thành", dataIndex: "slHoanThanh", key: "slHoanThanh", align: "center", width: 80, render: (text: any, record: any) => {
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;
            return record.isEditing && editEnabled ? <InlineInputNumber min={0} max={maxScore} placeholder="HT" value={text} style={{ width: '100%' }} onChange={(v: any) => {
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_HoanThanh', v);
              const khongHoanThanh = Math.max(0, maxScore - Number(v || 0));
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_KhongHoanThanh', Number(khongHoanThanh.toFixed(2)));
              const diemPhanTram = maxScore > 0 ? (Number(v || 0) / maxScore) * 100 : 0;
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_Diem', Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)));
            }} onCalculate={async () => { await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_KhongHoanThanh", "chamDiemSoLuong_KhongHoanThanh"); await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_Diem", "chamDiemSoLuong_Diem"); }} /> : text;
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
          )}</span>, dataIndex: "slKhongHoanThanh", key: "slKhongHoanThanh", align: "center", width: 80, render: (text: any, record: any) => {
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;
            return record.isEditing && editEnabled ? <InlineInputNumber min={0} max={maxScore} placeholder="KHT" value={text} style={{ width: '100%' }} onChange={(v: any) => {
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_KhongHoanThanh', v);
              const hoanThanh = Math.max(0, maxScore - Number(v || 0));
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_HoanThanh', Number(hoanThanh.toFixed(2)));
              const diemPhanTram = maxScore > 0 ? (hoanThanh / maxScore) * 100 : 0;
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemSoLuong_Diem', Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)));
            }} onCalculate={() => handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemSoLuong_Diem", "chamDiemSoLuong_Diem")} /> : text;
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
          )}</span>, dataIndex: "slDiemPhanTram", key: "slDiemPhanTram", align: "center", width: 45
        },
      ],
    },
    {
      title: () => (
        <div style={{ textAlign: "center" }}>
          Chấm điểm chất lượng<br />
          <span style={{ color: "#ffd666", fontWeight: "normal", fontSize: "11px" }}>(Trừ 25%/lần)</span>
        </div>
      ),
      children: [
        {
          title: "Không đạt", dataIndex: "clSoLanKhongDat", key: "clSoLanKhongDat", align: "center", width: 45, render: (text: any, record: any) => {
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;
            return record.isEditing && editEnabled ? <InlineInputNumber min={0} max={maxScore} placeholder="SL" value={text} style={{ width: '100%' }} onChange={(v: any) => {
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemChatLuong_KhongDat', v);
              const conLai = Math.max(0, maxScore - (Number(v || 0) * 0.25 * maxScore));
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemChatLuong_SoDiemConLai', Number(conLai.toFixed(2)));
              const diemPhanTram = maxScore > 0 ? (conLai / maxScore) * 100 : 0;
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemChatLuong_Diem', Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)));
            }} onCalculate={async () => { await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemChatLuong_SoDiemConLai", "chamDiemChatLuong_SoDiemConLai"); await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemChatLuong_Diem", "chamDiemChatLuong_Diem"); }} /> : text;
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
          )}</span>, dataIndex: "clDiemConLai", key: "clDiemConLai", align: "center", width: 80, render: (text: any) => text
        },
        {
          title: <span>Điểm (%) {renderInfoIcon("Điểm (%) Chất lượng",
            <div>
              <strong>Công thức: {chucVuHeSo !== null ? "(12) = (11) / (6) * 100%" : "(11) = (10) / (5) * 100%"}</strong><br /><br />
              Trong đó:<br />
              {chucVuHeSo !== null ? "(6): Điểm theo hệ số lãnh đạo" : "(5): Điểm theo Bộ tiêu chí"}<br />
              {chucVuHeSo !== null ? "(11): Số điểm còn lại (Chất lượng)" : "(10): Số điểm còn lại (Chất lượng)"}<br />
              {chucVuHeSo !== null ? "(12): Điểm (%) Chất lượng" : "(11): Điểm (%) Chất lượng"}
            </div>
          )}</span>, dataIndex: "clDiemPhanTram", key: "clDiemPhanTram", align: "center", width: 45
        },
      ],
    },
    {
      title: () => (
        <div style={{ textAlign: "center" }}>
          Chấm điểm tiến độ<br />
          <span style={{ color: "#ffd666", fontWeight: "normal", fontSize: "11px" }}>(Trừ 25%/lần)</span>
        </div>
      ),
      children: [
        {
          title: "Chậm muộn", dataIndex: "tdSoLanCham", key: "tdSoLanCham", align: "center", width: 45, render: (text: any, record: any) => {
            const baseScore = record.taskData?.danhSachDauRa?.[record.productIndex]?.diemTheoBoTieuChi || 0;
            const maxScore = chucVuHeSo !== null ? baseScore * chucVuHeSo : baseScore;
            return record.isEditing && editEnabled ? <InlineInputNumber min={0} max={maxScore} placeholder="SL" value={text} style={{ width: '100%' }} onChange={(v: any) => {
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemTienDo_KhongDat', v);
              const conLai = Math.max(0, maxScore - (Number(v || 0) * 0.25 * maxScore));
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemTienDo_SoDiemConLai', Number(conLai.toFixed(2)));
              const diemPhanTram = maxScore > 0 ? (conLai / maxScore) * 100 : 0;
              handleInlineProductChange(record.inlineTaskId, record.productIndex, 'chamDiemTienDo_Diem', Number(Math.max(0, Math.min(100, diemPhanTram)).toFixed(2)));
            }} onCalculate={async () => { await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemTienDo_SoDiemConLai", "chamDiemTienDo_SoDiemConLai"); await handleCalculateInlineField(record.inlineTaskId, record.productIndex, "ChamDiemTienDo_Diem", "chamDiemTienDo_Diem"); }} /> : text;
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
          )}</span>, dataIndex: "tdDiemConLai", key: "tdDiemConLai", align: "center", width: 80, render: (text: any) => text
        },
        {
          title: <span>Điểm (%) {renderInfoIcon("Điểm (%) Tiến độ",
            <div>
              <strong>Công thức: {chucVuHeSo !== null ? "(15) = (14) / (6) * 100%" : "(14) = (13) / (5) * 100%"}</strong><br /><br />
              Trong đó:<br />
              {chucVuHeSo !== null ? "(6): Điểm theo hệ số lãnh đạo" : "(5): Điểm theo Bộ tiêu chí"}<br />
              {chucVuHeSo !== null ? "(14): Số điểm còn lại (Tiến độ)" : "(13): Số điểm còn lại (Tiến độ)"}<br />
              {chucVuHeSo !== null ? "(15): Điểm (%) Tiến độ" : "(14): Điểm (%) Tiến độ"}
            </div>
          )}</span>, dataIndex: "tdDiemPhanTram", key: "tdDiemPhanTram", align: "center", width: 45
        },
      ],
    },
    {
      title: "Ghi chú/Giải trình",
      dataIndex: "ghiChu",
      key: "ghiChu",
      width: 90,
      align: "center",
      render: (text: any, record: any) => {
        if (!record.key?.startsWith("item-")) return text;

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
              onRemoveExisting={(id) => handleRemoveExistingAttachment(record.inlineTaskId, record.productIndex, id, record.taskData)}
              onRemoveNew={(file) => handleRemoveNewAttachment(record.inlineTaskId, record.productIndex, file, record.taskData)}
            />
          </div>
        );
      }
    }
  ], [chucVuHeSo, tenChucVuLanhDao, editEnabled, enableAttachmentPreview, getNoteValue, isNoteDirty, handleOpenNoteModal, handleAttachmentFiles, handleRemoveExistingAttachment, handleRemoveNewAttachment, handleCalculateInlineField, handleAddInlineProduct, handleInlineProductChange, handleInlineTaskChange, handleRemoveInlineProduct, handleRemoveInlineTask, handleDeleteTask, handleEditTaskInline, handleOpenProductModal, setActiveTaskId, setActiveProductIndex, setChonTieuChiVisible, setInlineTasks]);

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
    const soLuongHoanThanh = Number(product?.chamDiemSoLuong_HoanThanh ?? 0);
    const soLuongKhongHoanThanh = Math.max(0, diemCoSo - soLuongHoanThanh);
    const soLanKhongDat = Number(product?.chamDiemChatLuong_KhongDat ?? 0);
    const chatLuongConLai = Math.max(0, diemCoSo - soLanKhongDat * 0.25 * diemCoSo);
    const soLanCham = Number(product?.chamDiemTienDo_KhongDat ?? 0);
    const tienDoConLai = Math.max(0, diemCoSo - soLanCham * 0.25 * diemCoSo);

    return {
      diemBoTieuChi,
      diemCoSo,
      diemHeSo: chucVuHeSo !== null ? diemCoSo : null,
      soLuongHoanThanh,
      soLuongKhongHoanThanh,
      soLuongPhanTram: diemCoSo ? (soLuongHoanThanh / diemCoSo) * 100 : 0,
      soLanKhongDat,
      chatLuongConLai,
      chatLuongPhanTram: diemCoSo ? (chatLuongConLai / diemCoSo) * 100 : 0,
      soLanCham,
      tienDoConLai,
      tienDoPhanTram: diemCoSo ? (tienDoConLai / diemCoSo) * 100 : 0,
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
        slHoanThanh: formatDisplayScore(sp.chamDiemSoLuong_HoanThanh ?? ""),
        slKhongHoanThanh: formatDisplayScore(scores.soLuongKhongHoanThanh),
        slDiemPhanTram: formatPercent(scores.soLuongPhanTram),
        clSoLanKhongDat: formatDisplayScore(sp.chamDiemChatLuong_KhongDat ?? ""),
        clDiemConLai: formatDisplayScore(scores.chatLuongConLai),
        clDiemPhanTram: formatPercent(scores.chatLuongPhanTram),
        tdSoLanCham: formatDisplayScore(sp.chamDiemTienDo_KhongDat ?? ""),
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

    const sumSlHoanThanh = productScores.reduce((sum, score) => sum + score.soLuongHoanThanh, 0);
    const sumSlKhongHoanThanh = productScores.reduce((sum, score) => sum + score.soLuongKhongHoanThanh, 0);

    const sumClKhongDat = productScores.reduce((sum, score) => sum + score.soLanKhongDat, 0);
    const sumClConLai = productScores.reduce((sum, score) => sum + score.chatLuongConLai, 0);

    const sumTdCham = productScores.reduce((sum, score) => sum + score.soLanCham, 0);
    const sumTdConLai = productScores.reduce((sum, score) => sum + score.tienDoConLai, 0);

    const baseDiem = chucVuHeSo !== null ? sumHeSo : sumBoTieuChi;

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
    renderTotalRow("group-total-1", "Tổng (1)", visibleNhiemVuHeThong, editEnabled ? (
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
    renderTotalRow("group-total-2", "Tổng (2)", visibleNhiemVuPhatSinh, editEnabled ? (
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

  const sumSlHoanThanhB = productScoresB.reduce((sum, score) => sum + score.soLuongHoanThanh, 0);
  const sumClConLaiB = productScoresB.reduce((sum, score) => sum + score.chatLuongConLai, 0);
  const sumTdConLaiB = productScoresB.reduce((sum, score) => sum + score.tienDoConLai, 0);

  const baseDiemB = chucVuHeSo !== null ? sumHeSoB : sumBoTieuChiB;
  const percentSlB = baseDiemB ? Math.max(0, (sumSlHoanThanhB / baseDiemB) * 100) : 0;
  const percentClB = baseDiemB ? Math.max(0, (sumClConLaiB / baseDiemB) * 100) : 0;
  const percentTdB = baseDiemB ? Math.max(0, (sumTdConLaiB / baseDiemB) * 100) : 0;
  const hasScoringData = productScoresB.some((score) => score.diemBoTieuChi > 0);

  const finalScoreNum = hasScoringData
    ? Math.max(0, chucVuHeSo !== null
      ? (percentSlB + percentClB + percentTdB + kqLinhVucPercent + knToChucPercent + nlTapHopPercent) / 6
      : (percentSlB + percentClB + percentTdB) / 3)
    : 0;
  const finalScoreStr = formatPercent(finalScoreNum);

  React.useEffect(() => {
    if (onTaskScoreChange && allNhiemVu.length > 0) {
      onTaskScoreChange((finalScoreNum * 70) / 100);
    }
  }, [allNhiemVu.length, finalScoreNum, onTaskScoreChange]);

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
      klDiem: formatDisplayScore(sumSlHoanThanhB),
      klPhanTram: formatPercent(percentSlB),
      clDiem: formatDisplayScore(sumClConLaiB),
      clPhanTram: formatPercent(percentClB),
      tdDiem: formatDisplayScore(sumTdConLaiB),
      tdPhanTram: formatPercent(percentTdB),
      ...(chucVuHeSo !== null ? {
        kqLinhVuc: (
          <Select
            value={kqLinhVucPercent}
            disabled={viewOnly}
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
            disabled={viewOnly}
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
            disabled={viewOnly}
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
      finalScore: finalScoreStr
    }
  ];

  const handleSaveTaskScores = async (phieuIdOverride?: string | null) => {
    if (viewOnly) return { error: true, message: "Phiếu đang ở chế độ chỉ xem, không thể lưu.", section: "section2" };
    const isTasksSaved = await handleSaveInlineTasks(phieuIdOverride);
    if (isTasksSaved !== true && isTasksSaved?.error) return isTasksSaved;
    if (!isTasksSaved) return { error: true, message: "Lưu nhiệm vụ thất bại", section: "section2" };

    const idPhieuDanhGia = phieuIdOverride || searchParams.get('idPhieuDanhGia') || searchParams.get('idPhieu');
    const dataToSave = {
      idPhieuDanhGia: idPhieuDanhGia || null,
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
      const res = await kPI_NhiemVuService.saveKetQua(dataToSave);
      if (res.status) {
        onTaskScoreChange?.((finalScoreNum * 70) / 100);
        const effectiveIdPhieu = phieuIdOverride || queryIdPhieu;
        if (effectiveIdPhieu && selectedDot) {
          const snapshotRes = await kPI_NhiemVuService.getHeSoLanhDaoApDung(effectiveIdPhieu, selectedDot);
          const snapshot = snapshotRes?.status ? snapshotRes.data : null;
          setTenChucVuLanhDao(snapshot?.tenChucVu || snapshot?.chucVuCode || "");
          setChucVuHeSo(snapshot?.coApDungHeSo && snapshot?.heSo !== null && snapshot?.heSo !== undefined
            ? Number(snapshot.heSo)
            : null);
        }
        if (!silentSave) {
          message.success("Lưu kết quả thực hiện nhiệm vụ thành công");
        }
        return true;
      } else {
        if (!silentSave) {
          message.error("Lưu kết quả thực hiện nhiệm vụ thất bại");
        }
        return { error: true, message: "Lưu kết quả thực hiện nhiệm vụ thất bại", section: "section2" };
      }
    } catch (error) {
      console.error(error);
      if (!silentSave) {
        message.error("Có lỗi xảy ra khi lưu kết quả");
      }
      return { error: true, message: "Có lỗi xảy ra khi lưu kết quả thực hiện nhiệm vụ", section: "section2" };
    }
  };

  React.useEffect(() => {
    if (saveRef) {
      saveRef.current = handleSaveTaskScores;
    }
  }, [saveRef, handleSaveTaskScores]);

  const isSection1Present = hasSection1Header !== undefined ? hasSection1Header : (hideHeader ?? false);
  const section1Offset = isSection1Present ? 44 : 0;
  const baseTop = isModal ? 0 : 56;
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
    <Card className="kpi-white-mode" bordered={false} styles={{ body: { padding: 0 } }}>
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

        <Table
          className="table_component expand-table-body"
          columns={columns}
          dataSource={data}
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
          pagination={false}
          scroll={{ x: 'max-content', y: 1 }}
          components={TABLE_COMPONENTS}
        />

        <div style={{ marginTop: "20px", fontSize: "16px", paddingLeft: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Sau khi hoàn thành việc chấm điểm theo Bộ tiêu chí, điểm tiêu chí kết quả thực hiện nhiệm vụ tháng {selectedDot ? (dotDanhGiaOptions.find(d => d.value === selectedDot)?.label || "....") : "...."} là: <strong style={{ marginLeft: "20px" }}>{finalScoreStr}</strong></span>
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
        title={infoModalTitle}
        open={infoModalVisible}
        onCancel={() => setInfoModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setInfoModalVisible(false)}>
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
    </Card>
  );
}
