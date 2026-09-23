"use client";
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Button, message, Card, Tag, Space, Modal, Select, Input, InputNumber, Row, Col, Divider, Tooltip, Spin, Empty } from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  UndoOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  ApartmentOutlined,
  FileProtectOutlined,
  CheckOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import kPI_PhieuDanhGiaTapTheService from "@/services/kPI_PhieuDanhGiaTapThe/kPI_PhieuDanhGiaTapTheService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import departmentService from "@/services/department/department.service";
import kPI_QuaTrinhXuLyPhieuDanhGiaService from "@/services/kPI_QuaTrinhXuLyPhieuDanhGia/kPI_QuaTrinhXuLyPhieuDanhGiaService";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  KPI_TieuChiTapTheTreeDto,
  ScoreTapTheItemType,
} from "@/types/kPI_PhieuDanhGiaTapThe/kPI_PhieuDanhGiaTapThe";

const TRANG_THAI = {
  KHOI_TAO: "KhoiTao",
  GUI_TRUONG_PHONG: "GuiTruongPhong",
  GUI_CUC_TRUONG: "GuiCucTruong",
  GUI_VU_TCCB: "GuiVuTCCB",
  DA_DUYET: "DaDuyet",
  TRA_VE: "TraVe",
};

const trangThaiConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  [TRANG_THAI.KHOI_TAO]: { color: "blue", label: "Khởi tạo", icon: <ClockCircleOutlined /> },
  [TRANG_THAI.GUI_TRUONG_PHONG]: { color: "cyan", label: "Chờ Trưởng phòng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_CUC_TRUONG]: { color: "cyan", label: "Chờ Cục/Vụ trưởng đánh giá", icon: <SendOutlined /> },
  [TRANG_THAI.GUI_VU_TCCB]: { color: "cyan", label: "Chờ Vụ TCCB thẩm định", icon: <SendOutlined /> },
  [TRANG_THAI.DA_DUYET]: { color: "green", label: "Đã phê duyệt hoàn tất", icon: <CheckCircleOutlined /> },
  [TRANG_THAI.TRA_VE]: { color: "red", label: "Trả về chỉnh sửa", icon: <RollbackOutlined /> },
};

// 4 Mức xếp loại chuẩn theo Phụ lục số 01 (Kèm Quyết định số 392/QĐ-BDTTG)
const XEP_LOAI_OPTIONS_TU_DANH_GIA = [
  {
    value: 1,
    title: "Hoàn thành xuất sắc nhiệm vụ",
    badgeColor: "#16a34a",
    description:
      "(1) Đạt từ 90 điểm trở lên, (2) Hoàn thành 100% các nhiệm vụ được giao, đúng thời hạn, bảo đảm chất lượng, hiệu quả; (3) Có ít nhất 30% nhiệm vụ hoàn thành vượt mức yêu cầu; (4) Không có đơn vị cấp dưới trực tiếp (nếu có) bị xếp loại chất lượng ở mức không hoàn thành nhiệm vụ; (5) Đã khắc phục toàn bộ hạn chế, khuyết điểm được chỉ ra từ kỳ đánh giá trước hoặc từ kết luận thanh tra, kiểm tra của cơ quan có thẩm quyền (nếu có).",
  },
  {
    value: 2,
    title: "Hoàn thành tốt nhiệm vụ",
    badgeColor: "#2563eb",
    description:
      "(1) Đạt từ 70 đến dưới 90 điểm; (2) Hoàn thành 100% các nhiệm vụ được giao, đúng thời hạn, bảo đảm chất lượng, hiệu quả.",
  },
  {
    value: 3,
    title: "Hoàn thành nhiệm vụ",
    badgeColor: "#d97706",
    description:
      "(1) Đạt từ 50 đến dưới 70 điểm; (2) Hoàn thành 100% các nhiệm vụ được giao, số nhiệm vụ chưa bảo đảm tiến độ không vượt quá 20%.",
  },
  {
    value: 4,
    title: "Không hoàn thành nhiệm vụ",
    badgeColor: "#dc2626",
    description:
      "Có tổng điểm đánh giá dưới 50 điểm hoặc bị cấp có thẩm quyền kết luận có sai phạm trong công tác cán bộ, mất đoàn kết nội bộ, bè phái, chạy chức, chạy quyền hoặc hoàn thành dưới 70% nhiệm vụ theo chương trình, kế hoạch trong năm.",
  },
];

const XEP_LOAI_OPTIONS_CAP_TREN = [
  { value: 1, title: "Hoàn thành xuất sắc nhiệm vụ", color: "#16a34a" },
  { value: 2, title: "Hoàn thành tốt nhiệm vụ", color: "#2563eb" },
  { value: 3, title: "Hoàn thành nhiệm vụ", color: "#d97706" },
  { value: 4, title: "Không hoàn thành nhiệm vụ", color: "#dc2626" },
];

const getTenXepLoai = (val?: number | string | null) => {
  const num = Number(val);
  switch (num) {
    case 1: return "Hoàn thành xuất sắc nhiệm vụ";
    case 2: return "Hoàn thành tốt nhiệm vụ";
    case 3: return "Hoàn thành nhiệm vụ";
    case 4: return "Không hoàn thành nhiệm vụ";
    default: return "";
  }
};

const getRoleLabel = (role?: string | null) => {
  switch (role) {
    case "TruongPhong": return "Trưởng phòng";
    case "PhoTruongPhong": return "Phó Trưởng phòng";
    case "CucTruong": return "Cục trưởng";
    case "PhoCucTruong": return "Phó Cục trưởng";
    case "VuTruong": return "Vụ trưởng";
    case "PhoVuTruong": return "Phó Vụ trưởng";
    case "ChuyenVienTCCB": return "Chuyên viên Vụ TCCB";
    case "QLNS_VuTCCB": return "QLNS Đơn vị Vụ TCCB";
    default: return role || "Cấp trên";
  }
};


export default function DanhGiaTapTheMultiCapComponent({
  idPhieu: idPhieuProp,
  idDot: idDotProp,
  donViId: donViIdProp,
  phongBan: phongBanProp,
}: {
  idPhieu?: string;
  idDot?: string;
  donViId?: string;
  phongBan?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useSelector((state: any) => state.auth.User);

  const queryDot = idDotProp || searchParams.get("idDot") || searchParams.get("idDotDanhGia") || "";
  const queryDonVi = donViIdProp || searchParams.get("donViId") || searchParams.get("idDonVi") || "";
  const queryPhongBan = phongBanProp || searchParams.get("phongBan") || searchParams.get("idPhongBan") || "";
  const queryPhieu = (idPhieuProp && idPhieuProp !== queryDot) ? idPhieuProp : (searchParams.get("idPhieu") || searchParams.get("idPhieuDanhGia") || "");
  const isViewOnlyParam = searchParams.get("viewOnly") === "true";

  const [phieuInfo, setPhieuInfo] = useState<any>(null);
  const [dotDanhGiaInfo, setDotDanhGiaInfo] = useState<any>(null);
  const [donViInfo, setDonViInfo] = useState<any>(null);
  const [activeProcess, setActiveProcess] = useState<any>(null);
  const [quyenChamDiem, setQuyenChamDiem] = useState<any>(null);

  const [currentIdPhieu, setCurrentIdPhieu] = useState<string | undefined>(
    (queryPhieu && queryPhieu.trim() !== "") ? queryPhieu : (idPhieuProp && idPhieuProp !== queryDot ? idPhieuProp : undefined)
  );

  const effectiveIdDot = queryDot || phieuInfo?.idDotDanhGia || "";
  const effectiveIdPhieu = currentIdPhieu || ((queryPhieu && queryPhieu.trim() !== "") ? queryPhieu : undefined) || phieuInfo?.id || undefined;
  const effectiveDonViId = queryDonVi || phieuInfo?.donVi || user?.donViId || user?.donViSuDungId || "";

  const [saving, setSaving] = useState(false);
  const [transitionSaving, setTransitionSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const saveOperationRef = useRef(false);
  const fetchInfoRequestRef = useRef(0);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Cây tiêu chí động lấy từ cấu hình đợt/đơn vị
  const [criteriaTree, setCriteriaTree] = useState<KPI_TieuChiTapTheTreeDto[]>([]);
  const [tenBoChung, setTenBoChung] = useState<string>("");
  const [tenBoNhiemVu, setTenBoNhiemVu] = useState<string>("");
  const [diemTuChamMap, setDiemTuChamMap] = useState<Record<string, number | null>>({});
  const [diemCapTrenMap, setDiemCapTrenMap] = useState<Record<string, number | null>>({});
  const [ghiChuMap, setGhiChuMap] = useState<Record<string, string>>({});

  // Điểm xếp loại chất lượng phần II và III
  const [chatLuongTuDanhGia, setChatLuongTuDanhGia] = useState<number | null>(null);
  const [chatLuongCapTrenDanhGia, setChatLuongCapTrenDanhGia] = useState<number | null>(null);

  // Section B - Điểm thực hiện nhiệm vụ từ BieuChamDiemV2
  const childParams = useMemo(() => ({ id: effectiveIdDot }), [effectiveIdDot]);
  const effectiveIdLyLich = useMemo(() => {
    return searchParams.get("idLyLich") || user?.idLyLich || user?.lyLichId || user?.id;
  }, [searchParams, user]);

  const isNhiemVuGroup = useCallback((g: KPI_TieuChiTapTheTreeDto) => {
    return (
      g.diemToiDa === 70 ||
      g.id === "00000000-0000-0000-0000-000000000002" ||
      (g.ten && (g.ten.toLowerCase().includes("nhiệm vụ") || g.ten.toLowerCase().includes("kết quả thực hiện")))
    );
  }, []);

  // Tính tổng điểm động
  const {
    tongDiemToiDa,
    tongDiemChungTuCham,
    tongDiemNhiemVuTuCham,
    tongDiemTuCham,
    tongDiemChungCapTren,
    tongDiemNhiemVuCapTren,
    tongDiemCapTren,
  } = useMemo(() => {
    if (criteriaTree && criteriaTree.length > 0) {
      let maxScore = 0;
      let chungTC = 0;
      let nvTC = 0;
      let chungCT = 0;
      let nvCT = 0;

      criteriaTree.forEach((group) => {
        const isNv = isNhiemVuGroup(group);

        const sumGroup = (nodes?: KPI_TieuChiTapTheTreeDto[]) => {
          if (!nodes) return;
          nodes.forEach((node) => {
            if (!node.children || node.children.length === 0) {
              maxScore += node.diemToiDa || 0;
              const rawTC = diemTuChamMap[node.id];
              const tc = (rawTC !== undefined && rawTC !== null) ? Number(rawTC) : (node.diemTuCham ?? node.diemToiDa ?? 0);
              const rawCT = diemCapTrenMap[node.id];
              const ct = (rawCT !== undefined && rawCT !== null) ? Number(rawCT) : (node.diemCapTren ?? node.diemToiDa ?? 0);
              if (!isNv) {
                chungTC += tc;
                chungCT += ct;
              } else {
                nvTC += tc;
                nvCT += ct;
              }
            } else {
              sumGroup(node.children);
            }
          });
        };
        sumGroup(group.children);
      });

      return {
        tongDiemToiDa: maxScore || 100,
        tongDiemChungTuCham: Math.round(chungTC * 10) / 10,
        tongDiemNhiemVuTuCham: Math.round(nvTC * 10) / 10,
        tongDiemTuCham: Math.round((chungTC + nvTC) * 10) / 10,
        tongDiemChungCapTren: Math.round(chungCT * 10) / 10,
        tongDiemNhiemVuCapTren: Math.round(nvCT * 10) / 10,
        tongDiemCapTren: Math.round((chungCT + nvCT) * 10) / 10,
      };
    }

    return {
      tongDiemToiDa: 100,
      tongDiemChungTuCham: 0,
      tongDiemNhiemVuTuCham: 0,
      tongDiemTuCham: 0,
      tongDiemChungCapTren: 0,
      tongDiemNhiemVuCapTren: 0,
      tongDiemCapTren: 0,
    };
  }, [criteriaTree, diemTuChamMap, diemCapTrenMap, isNhiemVuGroup]);

  const effectiveDiemNhiemVuTuCham = tongDiemNhiemVuTuCham;
  const effectiveTongDiemTuCham = tongDiemTuCham;

  // Phân tách cây tiêu chí thành Phần A (Tiêu chí chung 30đ) và Phần B (Tiêu chí nhiệm vụ 70đ)
  const tieuChiChungTree = useMemo(() => {
    if (!criteriaTree || criteriaTree.length === 0) return [];
    const chungNodes = criteriaTree.filter((g) => !isNhiemVuGroup(g));
    return chungNodes.length > 0 ? chungNodes : criteriaTree;
  }, [criteriaTree, isNhiemVuGroup]);

  const tieuChiNhiemVuTree = useMemo(() => {
    if (!criteriaTree || criteriaTree.length === 0) return [];
    return criteriaTree.filter((g) => isNhiemVuGroup(g));
  }, [criteriaTree, isNhiemVuGroup]);

  const handleDiemTuChamChange = (id: string, val: number | null, max?: number | null) => {
    if (!canOwnerAction) return;
    const maxVal = max ?? 100;
    const cleanVal = val === null ? null : Math.max(0, Math.min(Number(val), maxVal));
    setDiemTuChamMap((prev) => ({
      ...prev,
      [id]: cleanVal,
    }));
  };

  const handleDiemCapTrenChange = (id: string, val: number | null, max?: number | null) => {
    if (!canSupervisorAction) return;
    const maxVal = max ?? 100;
    const cleanVal = val === null ? null : Math.max(0, Math.min(Number(val), maxVal));
    setDiemCapTrenMap((prev) => ({
      ...prev,
      [id]: cleanVal,
    }));
  };


  // Modal chuyển bước luồng
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
    const requestId = ++fetchInfoRequestRef.current;
    const isLatestRequest = () => requestId === fetchInfoRequestRef.current;
    let targetPhieuId = currentIdPhieu || (queryPhieu && queryPhieu !== queryDot ? queryPhieu : undefined);
    let targetDotId = queryDot;
    let targetDonViId = queryDonVi || user?.donViId || user?.donViSuDungId || "";
    let targetPhongBan = queryPhongBan || "";

    setIsInitialLoading(true);
    try {
      if (targetPhieuId && targetPhieuId !== "undefined" && targetPhieuId !== "null") {
        const resPhieu = await kPI_PhieuDanhGiaTapTheService.getById(targetPhieuId);
        if (resPhieu?.data && isLatestRequest()) {
          const phieu = resPhieu.data;
          setPhieuInfo(phieu);
          if (phieu.idDotDanhGia) targetDotId = phieu.idDotDanhGia;
          if (phieu.donVi) targetDonViId = phieu.donVi;
          if (phieu.phongBan) targetPhongBan = phieu.phongBan;
          if (phieu.chatLuongTuDanhGia !== undefined && phieu.chatLuongTuDanhGia !== null) {
            setChatLuongTuDanhGia(phieu.chatLuongTuDanhGia);
          }
          if (phieu.chatLuongCapTrenDanhGia !== undefined && phieu.chatLuongCapTrenDanhGia !== null) {
            setChatLuongCapTrenDanhGia(phieu.chatLuongCapTrenDanhGia);
          }

          // Khôi phục điểm nếu có
          if (phieu.diemTieuChiChung !== undefined && phieu.diemTieuChiChung !== null) {
            const diemChung = Number(phieu.diemTieuChiChung);
            const perChung = Math.round((diemChung / 3) * 10) / 10;
            setDiemTuChamMap((prev) => ({
              ...prev,
              tc_chung_1: perChung,
              tc_chung_2: perChung,
              tc_chung_3: diemChung - perChung * 2,
            }));
          }
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
      } else if (targetDotId && targetDonViId) {
        const resSearch = await kPI_PhieuDanhGiaTapTheService.getData({
          pageIndex: 1,
          pageSize: 1,
          idDotDanhGia: targetDotId,
          idDonVi: targetDonViId,
          phongBan: targetPhongBan || undefined,
        });
        if (resSearch?.data?.items && resSearch.data.items.length > 0 && isLatestRequest()) {
          const phieu = resSearch.data.items[0];
          const foundPhieuId = phieu.id;
          setCurrentIdPhieu(foundPhieuId);
          targetPhieuId = foundPhieuId;
          if (foundPhieuId) {
            const resPhieu = await kPI_PhieuDanhGiaTapTheService.getById(foundPhieuId);
            if (resPhieu?.data && isLatestRequest()) {
              setPhieuInfo(resPhieu.data);
              if (resPhieu.data.chatLuongTuDanhGia !== undefined && resPhieu.data.chatLuongTuDanhGia !== null) {
                setChatLuongTuDanhGia(resPhieu.data.chatLuongTuDanhGia);
              }
              if (resPhieu.data.chatLuongCapTrenDanhGia !== undefined && resPhieu.data.chatLuongCapTrenDanhGia !== null) {
                setChatLuongCapTrenDanhGia(resPhieu.data.chatLuongCapTrenDanhGia);
              }
            } else {
              setPhieuInfo(phieu);
            }
          }
        } else {
          // Tự động khởi tạo phiếu tập thể nếu chưa có
          const resInit = await kPI_PhieuDanhGiaTapTheService.initPhieuDanhGiaTapThe(
            targetDotId,
            targetDonViId,
            targetPhongBan || user?.phongBanId || undefined
          );
          if (resInit?.status && resInit?.data && isLatestRequest()) {
            const newPhieuId = resInit.data;
            setCurrentIdPhieu(newPhieuId);
            targetPhieuId = newPhieuId;
            const resPhieu = await kPI_PhieuDanhGiaTapTheService.getById(newPhieuId);
            if (resPhieu?.data && isLatestRequest()) {
              setPhieuInfo(resPhieu.data);
            }
          }
        }
      }

      if (targetDotId) {
        const resDot = await kPI_DotTheoDoiDanhGiaService.getById(targetDotId);
        if (resDot?.data && isLatestRequest()) setDotDanhGiaInfo(resDot.data);
      }

      if (targetDonViId) {
        const resDonVi = await departmentService.get(targetDonViId);
        if (resDonVi?.data && isLatestRequest()) setDonViInfo(resDonVi.data);
      }

      // Lấy tên bộ tiêu chí từ cấu hình đợt
      const currentUserId = String(user?.id || user?.userId || "");
      if (targetDotId && currentUserId) {
        try {
          const resDots = await kPI_PhieuDanhGiaTapTheService.getDotDanhGiaWithPhieu(currentUserId, {
            pageIndex: 1,
            pageSize: 1,
            idDotDanhGia: targetDotId,
            idDonVi: targetDonViId || undefined,
          });
          if (resDots?.data?.items?.length > 0) {
            const item = resDots.data.items[0];
            if (item.tenBoTieuChiChung) setTenBoChung(item.tenBoTieuChiChung);
            if (item.tenBoTieuChiNhiemVu) setTenBoNhiemVu(item.tenBoTieuChiNhiemVu);
          }
        } catch (eDots) {
          console.warn("Không lấy được tên bộ tiêu chí từ đợt:", eDots);
        }
      }

      // Tải bộ tiêu chí động cho tập thể
      if (targetDotId) {
        try {
          let tree: KPI_TieuChiTapTheTreeDto[] = [];

          // 1. Thử gọi API GetTreeDataForTapThe
          const resCriteria = await kPI_PhieuDanhGiaTapTheService.getTreeDataForTapThe(
            targetDotId,
            targetPhieuId || currentIdPhieu || undefined,
            targetDonViId || undefined
          );

          if (resCriteria?.data && Array.isArray(resCriteria.data) && resCriteria.data.length > 0) {
            tree = resCriteria.data;
          }

          // 2. Nếu API trên trả về 6 tiêu chí cũ hoặc chưa cập nhật, lấy động từ kPI_TieuChiChungService giống hệt DanhGiaMultiCap
          if (!tree || tree.length === 0) {
            const resChung = await kPI_TieuChiChungService.getTreeDataForDot(
              targetDotId,
              undefined,
              targetPhieuId || currentIdPhieu || undefined,
              targetDonViId || undefined
            );

            if (resChung?.data && Array.isArray(resChung.data) && resChung.data.length > 0) {
              const sectionChung: KPI_TieuChiTapTheTreeDto = {
                id: "00000000-0000-0000-0000-000000000001",
                ten: "TIÊU CHÍ CHUNG",
                stt: "I",
                diemToiDa: 30,
                tenBoTieuChi: tenBoChung || "Bộ tiêu chí chung",
                children: resChung.data.map((node: any, idx: number) => ({
                  id: node.id,
                  ten: node.ten,
                  parentId: node.parentId,
                  stt: (idx + 1).toString(),
                  diemToiDa: node.myProperty ?? node.diemToiDa,
                  diemTuCham: node.diemTuCham,
                  children: node.children?.map((child: any, cIdx: number) => ({
                    id: child.id,
                    ten: child.ten,
                    parentId: child.parentId,
                    stt: `${idx + 1}.${cIdx + 1}`,
                    diemToiDa: child.myProperty ?? child.diemToiDa,
                    diemTuCham: child.diemTuCham,
                    children: []
                  })) || []
                }))
              };

              const sectionNhiemVu: KPI_TieuChiTapTheTreeDto = {
                id: "00000000-0000-0000-0000-000000000002",
                ten: "TIÊU CHÍ VỀ KẾT QUẢ THỰC HIỆN NHIỆM VỤ",
                stt: "II",
                diemToiDa: 70,
                tenBoTieuChi: tenBoNhiemVu || "Bộ tiêu chí nhiệm vụ",
                children: [
                  {
                    id: "00000000-0000-0000-0000-000000000021",
                    ten: "Khối lượng kết quả thực hiện nhiệm vụ",
                    stt: "1",
                    diemToiDa: 25,
                    tenBoTieuChi: tenBoNhiemVu,
                  },
                  {
                    id: "00000000-0000-0000-0000-000000000022",
                    ten: "Chất lượng kết quả thực hiện nhiệm vụ",
                    stt: "2",
                    diemToiDa: 25,
                    tenBoTieuChi: tenBoNhiemVu,
                  },
                  {
                    id: "00000000-0000-0000-0000-000000000023",
                    ten: "Tiến độ thực hiện nhiệm vụ",
                    stt: "3",
                    diemToiDa: 20,
                    tenBoTieuChi: tenBoNhiemVu,
                  },
                ]
              };

              tree = [sectionChung, sectionNhiemVu];
            }
          }

          if (tree && tree.length > 0 && isLatestRequest()) {
            setCriteriaTree(tree);

            const initialTuCham: Record<string, number | null> = {};
            const initialCapTren: Record<string, number | null> = {};
            const initialGhiChu: Record<string, string> = {};

            const extractScores = (nodes: KPI_TieuChiTapTheTreeDto[]) => {
              for (const node of nodes) {
                if (!node.children || node.children.length === 0) {
                  const valTC = (node.diemTuCham !== undefined && node.diemTuCham !== null)
                    ? Number(node.diemTuCham)
                    : (node.diemToiDa ?? null);
                  initialTuCham[node.id] = valTC;

                  const valCT = (node.diemCapTren !== undefined && node.diemCapTren !== null)
                    ? Number(node.diemCapTren)
                    : (node.diemToiDa ?? null);
                  initialCapTren[node.id] = valCT;

                  if (node.ghiChu) {
                    initialGhiChu[node.id] = node.ghiChu;
                  }
                } else {
                  extractScores(node.children);
                }
              }
            };
            extractScores(tree);

            setDiemTuChamMap((prev) => ({ ...initialTuCham, ...prev }));
            setDiemCapTrenMap((prev) => ({ ...initialCapTren, ...prev }));
            setGhiChuMap((prev) => ({ ...initialGhiChu, ...prev }));
          }
        } catch (errCriteria) {
          console.warn("Không tải được cây tiêu chí động:", errCriteria);
        }
      }

      const checkPhieuId = targetPhieuId || currentIdPhieu;
      if (checkPhieuId) {
        const resQuyen = await kPI_PhieuDanhGiaTapTheService.checkQuyenChamDiem(checkPhieuId, targetDonViId, targetDotId);
        if (resQuyen?.data && isLatestRequest()) {
          setQuyenChamDiem(resQuyen.data);
        }
      }
    } catch (e) {
      console.warn("Lỗi khi tải thông tin phiếu tập thể:", e);
    } finally {
      if (isLatestRequest()) {
        setIsInitialLoading(false);
      }
    }
  }, [currentIdPhieu, queryPhieu, queryDot, queryDonVi, queryPhongBan, user]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const trangThai = phieuInfo?.trangThai || TRANG_THAI.KHOI_TAO;
  const isDaDuyet = trangThai === TRANG_THAI.DA_DUYET;

  // Phân quyền cho tập thể
  const isOwner = useMemo(() => {
    if (quyenChamDiem?.isOwner !== undefined) return quyenChamDiem.isOwner;
    const userDonVi = user?.donViId || user?.donViSuDungId;
    return !!(userDonVi && phieuInfo?.donVi && userDonVi.toLowerCase() === phieuInfo.donVi.toLowerCase());
  }, [quyenChamDiem, user, phieuInfo]);

  const canEditFromBackend = useMemo(() => {
    if (isViewOnlyParam) return false;
    if (quyenChamDiem?.canEdit !== undefined) return quyenChamDiem.canEdit;
    return trangThai === TRANG_THAI.KHOI_TAO || trangThai === TRANG_THAI.TRA_VE;
  }, [isViewOnlyParam, quyenChamDiem, trangThai]);

  const canOwnerAction = useMemo(() => {
    if (isViewOnlyParam || isDaDuyet) return false;
    return isOwner && (trangThai === TRANG_THAI.KHOI_TAO || trangThai === TRANG_THAI.TRA_VE);
  }, [isViewOnlyParam, isDaDuyet, isOwner, trangThai]);

  const canSupervisorAction = useMemo(() => {
    if (isViewOnlyParam || isDaDuyet) return false;
    return !isOwner && canEditFromBackend && trangThai !== TRANG_THAI.KHOI_TAO && trangThai !== TRANG_THAI.TRA_VE;
  }, [isViewOnlyParam, isDaDuyet, isOwner, canEditFromBackend, trangThai]);

  const canThuHoi = useMemo(() => {
    if (isViewOnlyParam || !effectiveIdPhieu || isDaDuyet) return false;
    const isSubmitted = trangThai !== TRANG_THAI.KHOI_TAO && trangThai !== TRANG_THAI.TRA_VE;
    if (!isSubmitted) return false;

    const myUserId = String(user?.id || user?.userId || "").toLowerCase();
    const procNguoiGui = String(activeProcess?.idNguoiGui || "").toLowerCase();
    const isPrevSender = !!(procNguoiGui && procNguoiGui === myUserId);
    const isEligibleUser = isOwner || isPrevSender;
    const isNotProcessedYet = activeProcess ? activeProcess.isXuLy === false : true;

    return isEligibleUser && isNotProcessedYet;
  }, [isViewOnlyParam, effectiveIdPhieu, isDaDuyet, trangThai, activeProcess, user, isOwner]);

  const canEditAny = canOwnerAction || canSupervisorAction || canEditFromBackend;

  const nextStepInfo = useMemo(() => {
    if (phieuInfo?.buttonLuong) {
      const button = phieuInfo.buttonLuong;
      const isFinal = button.trangThaiTiepTheo === TRANG_THAI.DA_DUYET || !button.chucVuNguoiXuLy;
      const chucVuNhan = button.chucVuNguoiXuLy || undefined;
      const roleLabel = chucVuNhan ? getRoleLabel(chucVuNhan) : "Cấp trên";
      return {
        nextStatus: button.trangThaiTiepTheo,
        buttonText: isFinal
          ? "Lưu và Phê duyệt hoàn tất"
          : `Lưu và ${button.tenButton ? button.tenButton : `Gửi ${roleLabel}`}`,
        chucVuNhan,
        isFinal,
        canChonNguoiXuLy: button.canChonNguoiXuLy ?? true,
        isLoading: false,
      };
    }

    if (isInitialLoading) {
      return {
        nextStatus: "",
        buttonText: "Đang tải luồng...",
        chucVuNhan: undefined,
        isFinal: false,
        canChonNguoiXuLy: true,
        isLoading: true,
      };
    }

    return {
      nextStatus: TRANG_THAI.DA_DUYET,
      buttonText: "Lưu và Phê duyệt",
      chucVuNhan: undefined,
      isFinal: true,
      canChonNguoiXuLy: false,
      isLoading: false,
    };
  }, [phieuInfo, isInitialLoading]);

  // Gợi ý mức xếp loại theo tổng điểm
  const suggestedRating = useMemo(() => {
    const score = canSupervisorAction ? tongDiemCapTren : effectiveTongDiemTuCham;
    if (score >= 90) return 1;
    if (score >= 70) return 2;
    if (score >= 50) return 3;
    return 4;
  }, [canSupervisorAction, tongDiemCapTren, effectiveTongDiemTuCham]);

  // Lưu toàn bộ phiếu đánh giá tập thể
  const handleSaveAll = async (isHoanTat = false, operation: "save" | "transition" = "save") => {
    if (!canEditAny) {
      message.warning({ content: "Bạn không có quyền chỉnh sửa phiếu ở trạng thái này!", key: "save_tapthe" });
      return null;
    }

    if (saveOperationRef.current) return null;
    saveOperationRef.current = true;

    try {
      if (operation === "transition") {
        setTransitionSaving(true);
      } else {
        setSaving(true);
      }
      const phieuId = effectiveIdPhieu || currentIdPhieu;
      if (!phieuId) {
        message.error({ content: "Không tìm thấy phiếu đánh giá tập thể!", key: "save_tapthe" });
        return null;
      }

      // 2. Thu thập điểm chi tiết của tất cả các tiêu chí lá
      const scoresToSave: ScoreTapTheItemType[] = [];
      if (criteriaTree && criteriaTree.length > 0) {
        const collectLeaves = (nodes: KPI_TieuChiTapTheTreeDto[]) => {
          for (const node of nodes) {
            if (!node.children || node.children.length === 0) {
              scoresToSave.push({
                idTieuChi: node.id,
                diemTuCham: diemTuChamMap[node.id] !== undefined ? diemTuChamMap[node.id] : (node.diemTuCham ?? null),
                diemCapTren: diemCapTrenMap[node.id] !== undefined ? diemCapTrenMap[node.id] : (node.diemCapTren ?? null),
                ghiChu: ghiChuMap[node.id] || null,
              });
            } else {
              collectLeaves(node.children);
            }
          }
        };
        collectLeaves(criteriaTree);
      }

      // 3. Lưu chi tiết điểm tiêu chí và xếp loại
      const resSave = await kPI_PhieuDanhGiaTapTheService.saveScoresTapThe({
        idPhieuDanhGia: phieuId,
        diemTieuChiChung: tongDiemChungTuCham,
        diemThucHienNhiemVu: effectiveDiemNhiemVuTuCham,
        tongDiem: effectiveTongDiemTuCham,
        chatLuongTuDanhGia: chatLuongTuDanhGia ?? suggestedRating,
        chatLuongCapTrenDanhGia: chatLuongCapTrenDanhGia ?? (canSupervisorAction ? suggestedRating : undefined),
        scores: scoresToSave,
      });

      if (resSave && resSave.status === false) {
        message.error({ content: resSave.message || "Lưu phiếu đánh giá thất bại!", key: "save_tapthe" });
        return null;
      }

      message.success({ content: "Lưu phiếu đánh giá tập thể thành công!", key: "save_tapthe" });
      await fetchInfo();
      return phieuId;
    } catch (error) {
      console.error("Lỗi khi lưu phiếu tập thể:", error);
      message.error({ content: "Lưu phiếu đánh giá tập thể thất bại!", key: "save_tapthe" });
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
    const phieuId = effectiveIdPhieu || currentIdPhieu;
    if (!phieuId) {
      toast.error("Vui lòng lưu phiếu trước khi thực hiện!");
      return;
    }

    if (action === "return") {
      setChuyenBuocModal({
        visible: true,
        type: "return",
        title: "Xác nhận trả về cấp dưới",
        content: "Phiếu đánh giá tập thể sẽ được trả về cho cấp dưới điều chỉnh lại kết quả.",
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

    const savedPhieuId = await handleSaveAll(action === "approve", "transition");
    if (!savedPhieuId) return;

    if (nextStepInfo?.isFinal || action === "approve") {
      setChuyenBuocModal({
        visible: true,
        type: "approve",
        title: "Xác nhận phê duyệt hoàn tất",
        content: "Phê duyệt kết quả đánh giá tập thể cho đơn vị này? Sau khi phê duyệt sẽ không thể chỉnh sửa.",
        listNguoiXuLy: [],
        selectedNguoiXuLyId: undefined,
        ghiChu: "",
      });
      return;
    }

    let listNguoiXuLy: any[] = [];
    if (nextStepInfo?.chucVuNhan) {
      try {
        const resNguoi = await kPI_PhieuDanhGiaTapTheService.getNguoiXuLy(phieuId, nextStepInfo.chucVuNhan);
        if (resNguoi?.data && Array.isArray(resNguoi.data)) {
          listNguoiXuLy = resNguoi.data;
        }
      } catch (e) {
        console.warn("Không tải được danh sách người nhận:", e);
      }
    }

    if (nextStepInfo?.canChonNguoiXuLy && nextStepInfo?.chucVuNhan && listNguoiXuLy.length === 0) {
      toast.warning(`Không tìm thấy ${getRoleLabel(nextStepInfo.chucVuNhan)} để nhận phiếu. Vui lòng kiểm tra phân quyền.`);
      return;
    }

    setChuyenBuocModal({
      visible: true,
      type: "send",
      title: nextStepInfo?.buttonText || "Lưu và Chuyển bước",
      content: `Lưu và chuyển phiếu đánh giá tập thể lên bước tiếp theo?`,
      listNguoiXuLy,
      selectedNguoiXuLyId: listNguoiXuLy.length > 0 ? listNguoiXuLy[0].id : undefined,
      ghiChu: "",
    });
  };

  const handleConfirmChuyenBuoc = async () => {
    const phieuId = effectiveIdPhieu || currentIdPhieu;
    if (!phieuId) return;

    const isReturn = chuyenBuocModal.type === "return";
    if (!isReturn && nextStepInfo?.canChonNguoiXuLy && !chuyenBuocModal.selectedNguoiXuLyId && !nextStepInfo.isFinal) {
      toast.warning("Vui lòng chọn người xử lý tiếp theo.");
      return;
    }

    if (isReturn) {
      const saveOk = await handleSaveAll(false, "transition");
      if (!saveOk) return;
    }

    setLoading(true);
    try {
      const response = await kPI_PhieuDanhGiaTapTheService.chuyenBuocLuong({
        idPhieuDanhGia: phieuId,
        idNguoiGui: user?.id || user?.userId || "",
        idNguoiXuLy: chuyenBuocModal.selectedNguoiXuLyId,
        ghiChu: chuyenBuocModal.ghiChu || (isReturn ? "Trả về cấp dưới" : "Chuyển bước luồng đánh giá tập thể"),
        isTuChoi: isReturn,
      });

      if (!response?.status) {
        toast.error(response?.message || "Không thể chuyển bước luồng đánh giá.");
        return;
      }

      setChuyenBuocModal((prev) => ({ ...prev, visible: false }));
      toast.success(isReturn ? "Đã trả phiếu về cấp dưới!" : "Chuyển bước đánh giá tập thể thành công!");
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
      const res = await kPI_PhieuDanhGiaTapTheService.thuHoiPhieu({
        idPhieuDanhGia: phieuId,
        idNguoiThuHoi: user?.id || user?.userId || "",
        ghiChu: thuHoiGhiChu || "Đơn vị thu hồi phiếu đánh giá tập thể",
      });

      if (res && res.status !== false) {
        toast.success("Thu hồi phiếu đánh giá tập thể thành công!");
        setThuHoiModalVisible(false);
        setThuHoiGhiChu("");
        await fetchInfo();
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
  const showCapTrenCol = canSupervisorAction || isDaDuyet || chatLuongCapTrenDanhGia !== null;
  const tenDonViHienThi = phieuInfo?.tenDonVi || donViInfo?.name || "TÊN CƠ QUAN, TỔ CHỨC, ĐƠN VỊ";
  const namHienThi = dotDanhGiaInfo?.nam || new Date().getFullYear();

  const TH_STYLE: React.CSSProperties = {
    background: "#0355a2",
    color: "#ffffff",
    border: "1px solid #3b82f6",
    textAlign: "center",
    padding: "10px 8px",
    fontSize: "13px",
    fontWeight: 600,
    verticalAlign: "middle",
  };

  const toRoman = (num: number): string => {
    const romanMap: [number, string][] = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
    ];
    let res = "";
    let n = num;
    for (const [val, letter] of romanMap) {
      while (n >= val) {
        res += letter;
        n -= val;
      }
    }
    return res || `${num}`;
  };

  const formatGroupTitle = (group: KPI_TieuChiTapTheTreeDto, idx: number, prefixRoman?: string): string => {
    const roman = prefixRoman || toRoman(idx + 1);
    let ten = (group.ten || "").trim();
    // Loại bỏ tiền tố chữ cái hoặc số cũ như "A.", "B.", "I.", "II." nếu có
    ten = ten.replace(/^(?:[A-Z]|[IVXLCDM]+|\d+)[.\s-]+\s*/i, "");
    return `${roman}. ${ten}`.toUpperCase();
  };

  const getGroupScores = useCallback((group: KPI_TieuChiTapTheTreeDto) => {
    let tuCham = 0;
    let capTren = 0;
    let max = group.diemToiDa || 0;

    const sumNodes = (nodes?: KPI_TieuChiTapTheTreeDto[]) => {
      if (!nodes) return;
      nodes.forEach((n) => {
        if (!n.children || n.children.length === 0) {
          const rawTC = diemTuChamMap[n.id];
          const valTC = (rawTC !== undefined && rawTC !== null) ? Number(rawTC) : (n.diemTuCham ?? n.diemToiDa ?? 0);
          const rawCT = diemCapTrenMap[n.id];
          const valCT = (rawCT !== undefined && rawCT !== null) ? Number(rawCT) : (n.diemCapTren ?? n.diemToiDa ?? 0);

          tuCham += valTC;
          capTren += valCT;
          if (!group.diemToiDa) max += (n.diemToiDa || 0);
        } else {
          sumNodes(n.children);
        }
      });
    };
    sumNodes(group.children);

    return {
      groupMax: max,
      groupTuCham: Math.round(tuCham * 10) / 10,
      groupCapTren: Math.round(capTren * 10) / 10,
    };
  }, [diemTuChamMap, diemCapTrenMap]);

  const renderTreeRows = useCallback((nodes?: KPI_TieuChiTapTheTreeDto[], depth: number = 0): React.ReactNode => {
    if (!nodes || nodes.length === 0) return null;
    return nodes.map((child) => {
      const hasSubChildren = child.children && child.children.length > 0;
      if (hasSubChildren) {
        let subMax = child.diemToiDa || 0;
        let subTuCham = 0;
        let subCapTren = 0;

        const sumSub = (subNodes?: KPI_TieuChiTapTheTreeDto[]) => {
          if (!subNodes) return;
          subNodes.forEach((n) => {
            if (!n.children || n.children.length === 0) {
              const rawTC = diemTuChamMap[n.id];
              const valTC = (rawTC !== undefined && rawTC !== null) ? Number(rawTC) : (n.diemTuCham ?? n.diemToiDa ?? 0);
              const rawCT = diemCapTrenMap[n.id];
              const valCT = (rawCT !== undefined && rawCT !== null) ? Number(rawCT) : (n.diemCapTren ?? n.diemToiDa ?? 0);

              subTuCham += valTC;
              subCapTren += valCT;
              if (!child.diemToiDa) subMax += (n.diemToiDa || 0);
            } else {
              sumSub(n.children);
            }
          });
        };
        sumSub(child.children);

        return (
          <React.Fragment key={child.id}>
            <tr style={{ background: "#dbeafe", fontWeight: 700, color: "#1e3a8a" }}>
              <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center" }}>
                {child.stt}
              </td>
              <td style={{ border: "1px solid #cbd5e1", padding: "8px 12px", paddingLeft: `${12 + depth * 16}px` }}>
                {child.ten}
              </td>
              <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center" }}>
                {subMax}
              </td>
              <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center", fontWeight: 700, color: "#ea580c" }}>
                {Math.round(subTuCham * 10) / 10}
              </td>
              {showCapTrenCol && (
                <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center", fontWeight: 700, color: "#0355a2" }}>
                  {Math.round(subCapTren * 10) / 10}
                </td>
              )}
            </tr>
            {renderTreeRows(child.children, depth + 1)}
          </React.Fragment>
        );
      }

      // Dòng tiêu chí lá (chấm điểm)
      const rawScore = diemTuChamMap[child.id];
      const tuChamVal = rawScore !== undefined && rawScore !== null ? Number(rawScore) : (child.diemTuCham ?? child.diemToiDa ?? 0);
      const rawCapTren = diemCapTrenMap[child.id];
      const capTrenVal = rawCapTren !== undefined && rawCapTren !== null ? Number(rawCapTren) : (child.diemCapTren ?? child.diemToiDa ?? 0);
      const maxVal = child.diemToiDa ?? 100;

      return (
        <tr key={child.id} style={{ background: "#ffffff" }} className="hover:bg-slate-50">
          <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center", verticalAlign: "top" }}>
            {child.stt}
          </td>
          <td style={{ border: "1px solid #cbd5e1", padding: "8px 12px", paddingLeft: `${12 + depth * 16}px`, textAlign: "justify", verticalAlign: "top" }}>
            <div style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
              {child.ten}
            </div>
          </td>
          <td style={{ border: "1px solid #cbd5e1", padding: "8px", textAlign: "center", fontWeight: 600, verticalAlign: "top" }}>
            {child.diemToiDa}
          </td>
          <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", textAlign: "center", verticalAlign: "top" }}>
            {canOwnerAction ? (
              <InputNumber
                min={0}
                max={maxVal}
                step={0.5}
                precision={1}
                value={tuChamVal}
                onChange={(val) => handleDiemTuChamChange(child.id, val, maxVal)}
                style={{ width: "85px", fontWeight: 600 }}
                className="[&_input]:!text-center"
              />
            ) : (
              <span style={{ fontWeight: 600 }}>{tuChamVal}</span>
            )}
          </td>
          {showCapTrenCol && (
            <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", textAlign: "center", verticalAlign: "top" }}>
              {canSupervisorAction ? (
                <InputNumber
                  min={0}
                  max={maxVal}
                  step={0.5}
                  precision={1}
                  value={capTrenVal}
                  onChange={(val) => handleDiemCapTrenChange(child.id, val, maxVal)}
                  style={{ width: "85px", fontWeight: 600 }}
                  className="[&_input]:!text-center"
                />
              ) : (
                <span style={{ fontWeight: 600, color: "#0355a2" }}>
                  {capTrenVal}
                </span>
              )}
            </td>
          )}
        </tr>
      );
    });
  }, [diemTuChamMap, diemCapTrenMap, canOwnerAction, canSupervisorAction, showCapTrenCol, handleDiemTuChamChange, handleDiemCapTrenChange]);

  return (
    <>
      <AutoBreadcrumb />
      <div className="kpi-custom-container" style={{ padding: "0 10px 90px 10px", marginTop: 10 }}>
        {/* Nút Quay lại & Trạng thái */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Button
            type="primary"
            className="btn-custom-back"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/kPI_PhieuDanhGia/TapThe");
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

          <Space size={8}>
            <Tag icon={tt.icon} color={tt.color} style={{ fontSize: 13, padding: "4px 14px", borderRadius: 20 }}>
              {tt.label}
            </Tag>
            {phieuInfo?.luong && (
              <Tag color="geekblue" style={{ fontSize: 12, borderRadius: 6, margin: 0 }}>
                {phieuInfo.luong === 101 ? "Luồng Phòng ban" : "Luồng Đơn vị"}
              </Tag>
            )}
          </Space>
        </div>

        {/* TỜ PHIẾU ĐÁNH GIÁ TẬP THỂ CHUẨN PHỤ LỤC SỐ 01 - HEADER THÔNG TIN */}
        <Card
          className="customCardShadow"
          style={{
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            background: "#ffffff",
            marginBottom: 20,
          }}
          styles={{ body: { padding: "28px 36px" } }}
        >
          {/* Header trích yếu Quyết định 392/QĐ-BDTTG */}
          <div style={{ textAlign: "center", fontSize: "12px", color: "#64748b", fontStyle: "italic", marginBottom: 8 }}>
            (Kèm theo Quy chế đánh giá, xếp loại chất lượng đối với đơn vị hành chính và công chức thuộc Bộ Dân tộc và Tôn giáo ban hành kèm theo Quyết định số 392/QĐ-BDTTG ngày 29/6/2026 của Bộ trưởng Bộ Dân tộc và Tôn giáo)
          </div>
          <div style={{ textAlign: "right", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
            Phụ lục số 01
          </div>

          {/* 2 Cột Quốc hiệu tiêu ngữ và Tên cơ quan đơn vị */}
          <Row gutter={[24, 16]} style={{ marginBottom: 28 }} align="top">
            <Col xs={24} sm={12} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", textTransform: "uppercase" }}>
                {tenDonViHienThi}
              </div>
              {phieuInfo?.tenPhongBan && (
                <div style={{ fontWeight: 600, fontSize: "13px", color: "#334155", textTransform: "uppercase" }}>
                  {phieuInfo.tenPhongBan}
                </div>
              )}
              <div style={{ width: 80, height: 1, background: "#0f172a", margin: "6px auto 0 auto" }} />
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", textTransform: "uppercase" }}>
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>
                Độc lập - Tự do - Hạnh phúc
              </div>
              <div style={{ width: 140, height: 1, background: "#0f172a", margin: "6px auto 0 auto" }} />
            </Col>
          </Row>

          {/* Tiêu đề phiếu */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0355a2", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px" }}>
              PHIẾU ĐÁNH GIÁ, XẾP LOẠI CHẤT LƯỢNG ĐỐI VỚI TẬP THỂ
            </h2>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
              Năm {namHienThi}
            </div>
            {dotDanhGiaInfo?.tenDotTheoDoiDanhGia && (
              <div style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic", marginTop: 2 }}>
                (Kỳ theo dõi, đánh giá: <strong>{dotDanhGiaInfo.tenDotTheoDoiDanhGia}</strong>)
              </div>
            )}
          </div>

          {/* Hiển thị thông tin 2 bộ tiêu chí đang áp dụng */}
          {(tenBoChung || tenBoNhiemVu) && (
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
              {tenBoChung && (
                <Tag color="success" style={{ fontSize: 13, padding: "6px 14px", borderRadius: "6px" }}>
                  <strong>Bộ tiêu chí chung:</strong> {tenBoChung}
                </Tag>
              )}
              {tenBoNhiemVu && (
                <Tag color="processing" style={{ fontSize: 13, padding: "6px 14px", borderRadius: "6px" }}>
                  <strong>Bộ tiêu chí nhiệm vụ:</strong> {tenBoNhiemVu}
                </Tag>
              )}
            </div>
          )}
        </Card>

        {/* PHẦN I: I. TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI */}
        <div style={{ marginBottom: 24 }}>
          {/* Header Sticky Cam Phần I chuẩn style DanhGiaMultiCap */}
          <div
            style={{
              position: "sticky",
              top: "56px",
              zIndex: 30,
              height: "44px",
              boxSizing: "border-box",
              background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
              color: "#fff",
              padding: "0 16px",
              fontSize: "15px",
              fontWeight: "700",
              borderRadius: "8px 8px 0 0",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #fdba74",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>I. TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI</span>
            <Space size={8} style={{ textTransform: "none", letterSpacing: "normal" }}>
              <Tag color="#fff" style={{ color: "#c2410c", fontWeight: 700, margin: 0, fontSize: 13, border: "none", padding: "2px 10px", borderRadius: "4px" }}>
                Tổng điểm tối đa: 100đ
              </Tag>
              <Tag color="#fff" style={{ color: "#c2410c", fontWeight: 700, margin: 0, fontSize: 13, border: "none", padding: "2px 10px", borderRadius: "4px" }}>
                Đơn vị tự chấm: {effectiveTongDiemTuCham}đ
              </Tag>
              {showCapTrenCol && (
                <Tag color="#fff" style={{ color: "#0355a2", fontWeight: 700, margin: 0, fontSize: 13, border: "none", padding: "2px 10px", borderRadius: "4px" }}>
                  Cấp trên chấm: {tongDiemCapTren}đ
                </Tag>
              )}
            </Space>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "16px 20px 24px 20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            {/* PHẦN A: TIÊU CHÍ CHUNG (30 ĐIỂM) */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)",
                  color: "#fff",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: "700",
                  borderRadius: "6px 6px 0 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: "2px solid #67e8f9",
                }}
              >
                <span>A. TIÊU CHÍ CHUNG {tenBoChung ? `(${tenBoChung})` : "(30 ĐIỂM)"}</span>
                <Tag color="#fff" style={{ color: "#0f766e", fontWeight: 700, margin: 0, border: "none", padding: "2px 10px", borderRadius: "4px" }}>
                  30 ĐIỂM
                </Tag>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #cbd5e1",
                    borderTop: "none",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ ...TH_STYLE, width: "60px" }}>STT</th>
                      <th style={{ ...TH_STYLE, textAlign: "center" }}>Tiêu chí chấm điểm</th>
                      <th style={{ ...TH_STYLE, width: "110px" }}>Điểm tối đa</th>
                      <th style={{ ...TH_STYLE, width: "150px" }}>Điểm do Đơn vị tự chấm</th>
                      {showCapTrenCol && (
                        <th style={{ ...TH_STYLE, width: "150px" }}>Điểm cấp trên đánh giá</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isInitialLoading ? (
                      <tr>
                        <td colSpan={showCapTrenCol ? 5 : 4} style={{ textAlign: "center", padding: "60px 20px" }}>
                          <Spin size="large" tip="Đang tải bộ tiêu chí đánh giá...">
                            <div style={{ minHeight: "60px" }} />
                          </Spin>
                        </td>
                      </tr>
                    ) : tieuChiChungTree && tieuChiChungTree.length > 0 ? (
                      <>
                        {tieuChiChungTree.map((group, groupIdx) => {
                          const { groupMax, groupTuCham, groupCapTren } = getGroupScores(group);
                          const roman = toRoman(groupIdx + 1);
                          const title = formatGroupTitle(group, groupIdx);

                          return (
                            <React.Fragment key={group.id || groupIdx}>
                              {/* HÀNG NHÓM (I, II, III...) */}
                              <tr
                                style={{
                                  background: "linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)",
                                  color: "#ffffff",
                                  fontWeight: 700,
                                }}
                              >
                                <td style={{ border: "1px solid #0f766e", padding: "10px 8px", textAlign: "center", fontSize: "14px" }}>
                                  {roman}
                                </td>
                                <td style={{ border: "1px solid #0f766e", padding: "10px 12px", textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.5px" }}>
                                  {title} {group.tenBoTieuChi ? `(${group.tenBoTieuChi})` : ""}
                                </td>
                                <td style={{ border: "1px solid #0f766e", padding: "10px 8px", textAlign: "center", fontSize: "14px" }}>
                                  {groupMax}
                                </td>
                                <td style={{ border: "1px solid #0f766e", padding: "10px 8px", textAlign: "center", fontWeight: 700, color: "#fef08a", fontSize: "14px" }}>
                                  {groupTuCham}
                                </td>
                                {showCapTrenCol && (
                                  <td style={{ border: "1px solid #0f766e", padding: "10px 8px", textAlign: "center", fontWeight: 700, color: "#bae6fd", fontSize: "14px" }}>
                                    {groupCapTren}
                                  </td>
                                )}
                              </tr>

                              {/* Các tiêu chí con trong nhóm */}
                              {renderTreeRows(group.children, 0)}
                            </React.Fragment>
                          );
                        })}

                        {/* DÒNG TỔNG CỘNG TIÊU CHÍ CHUNG */}
                        <tr style={{ background: "#f1f5f9", fontWeight: 800, borderTop: "2px solid #cbd5e1" }}>
                          <td colSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 14px", textAlign: "center", textTransform: "uppercase", fontSize: "14px", color: "#0f172a" }}>
                            TỔNG ĐIỂM TIÊU CHÍ CHUNG
                          </td>
                          <td style={{ border: "1px solid #cbd5e1", padding: "12px 8px", textAlign: "center", fontSize: "15px", fontWeight: 700 }}>
                            30
                          </td>
                          <td style={{ border: "1px solid #cbd5e1", padding: "12px 8px", textAlign: "center", color: "#c2410c", fontSize: "16px", fontWeight: 800 }}>
                            {tongDiemChungTuCham}
                          </td>
                          {showCapTrenCol && (
                            <td style={{ border: "1px solid #cbd5e1", padding: "12px 8px", textAlign: "center", color: "#0355a2", fontSize: "16px", fontWeight: 800 }}>
                              {tongDiemChungCapTren}
                            </td>
                          )}
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={showCapTrenCol ? 5 : 4} style={{ textAlign: "center", padding: "60px 20px" }}>
                          <Empty description="Chưa có dữ liệu bộ tiêu chí chung cho đợt này" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PHẦN B: TIÊU CHÍ VỀ KẾT QUẢ THỰC HIỆN NHIỆM VỤ (70 ĐIỂM) */}
            <div id="danhgia-section2" style={{ marginTop: "24px", marginBottom: "20px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)",
                  color: "#fff",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: "700",
                  borderRadius: "6px 6px 0 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: "2px solid #93c5fd",
                }}
              >
                <span>B. TIÊU CHÍ VỀ KẾT QUẢ THỰC HIỆN NHIỆM VỤ {tenBoNhiemVu ? `(${tenBoNhiemVu})` : "(70 ĐIỂM)"}</span>
                <Tag color="#fff" style={{ color: "#1d4ed8", fontWeight: 700, margin: 0, border: "none", padding: "2px 10px", borderRadius: "4px" }}>
                  70 ĐIỂM
                </Tag>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #cbd5e1",
                    borderTop: "none",
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ ...TH_STYLE, width: "60px" }}>STT</th>
                      <th style={{ ...TH_STYLE, textAlign: "center" }}>Tiêu chí chấm điểm</th>
                      <th style={{ ...TH_STYLE, width: "110px" }}>Điểm tối đa</th>
                      <th style={{ ...TH_STYLE, width: "150px" }}>Điểm do Đơn vị tự chấm</th>
                      {showCapTrenCol && (
                        <th style={{ ...TH_STYLE, width: "150px" }}>Điểm cấp trên đánh giá</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isInitialLoading ? (
                      <tr>
                        <td colSpan={showCapTrenCol ? 5 : 4} style={{ textAlign: "center", padding: "40px 20px" }}>
                          <Spin size="large" tip="Đang tải tiêu chí thực hiện nhiệm vụ...">
                            <div style={{ minHeight: "40px" }} />
                          </Spin>
                        </td>
                      </tr>
                    ) : tieuChiNhiemVuTree && tieuChiNhiemVuTree.length > 0 ? (
                      <>
                        {tieuChiNhiemVuTree.map((group, groupIdx) => {
                          const { groupMax, groupTuCham, groupCapTren } = getGroupScores(group);
                          const roman = toRoman(tieuChiChungTree.length + groupIdx + 1);
                          const title = formatGroupTitle(group, groupIdx, roman);

                          return (
                            <React.Fragment key={group.id || groupIdx}>
                              {/* HÀNG NHÓM (II...) */}
                              <tr
                                style={{
                                  background: "linear-gradient(135deg, #1e40af 0%, #0284c7 100%)",
                                  color: "#ffffff",
                                  fontWeight: 700,
                                }}
                              >
                                <td style={{ border: "1px solid #1e40af", padding: "10px 8px", textAlign: "center", fontSize: "14px" }}>
                                  {roman}
                                </td>
                                <td style={{ border: "1px solid #1e40af", padding: "10px 12px", textTransform: "uppercase", fontSize: "14px", letterSpacing: "0.5px" }}>
                                  {title} {group.tenBoTieuChi ? `(${group.tenBoTieuChi})` : ""}
                                </td>
                                <td style={{ border: "1px solid #1e40af", padding: "10px 8px", textAlign: "center", fontSize: "14px" }}>
                                  {groupMax}
                                </td>
                                <td style={{ border: "1px solid #1e40af", padding: "10px 8px", textAlign: "center", fontWeight: 700, color: "#fef08a", fontSize: "14px" }}>
                                  {groupTuCham}
                                </td>
                                {showCapTrenCol && (
                                  <td style={{ border: "1px solid #1e40af", padding: "10px 8px", textAlign: "center", fontWeight: 700, color: "#bae6fd", fontSize: "14px" }}>
                                    {groupCapTren}
                                  </td>
                                )}
                              </tr>

                              {/* Các tiêu chí con trong nhóm */}
                              {renderTreeRows(group.children, 0)}
                            </React.Fragment>
                          );
                        })}

                        {/* DÒNG TỔNG CỘNG TIÊU CHÍ NHIỆM VỤ */}
                        <tr style={{ background: "#f1f5f9", fontWeight: 800, borderTop: "2px solid #cbd5e1" }}>
                          <td colSpan={2} style={{ border: "1px solid #cbd5e1", padding: "12px 14px", textAlign: "center", textTransform: "uppercase", fontSize: "14px", color: "#0f172a" }}>
                            TỔNG ĐIỂM TIÊU CHÍ NHIỆM VỤ
                          </td>
                          <td style={{ border: "1px solid #cbd5e1", padding: "12px 8px", textAlign: "center", fontSize: "15px", fontWeight: 700 }}>
                            70
                          </td>
                          <td style={{ border: "1px solid #cbd5e1", padding: "12px 8px", textAlign: "center", color: "#c2410c", fontSize: "16px", fontWeight: 800 }}>
                            {tongDiemNhiemVuTuCham}
                          </td>
                          {showCapTrenCol && (
                            <td style={{ border: "1px solid #cbd5e1", padding: "12px 8px", textAlign: "center", color: "#0355a2", fontSize: "16px", fontWeight: 800 }}>
                              {tongDiemNhiemVuCapTren}
                            </td>
                          )}
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan={showCapTrenCol ? 5 : 4} style={{ textAlign: "center", padding: "40px 20px" }}>
                          <Empty description="Chưa có dữ liệu tiêu chí nhiệm vụ cho đợt này" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BẢNG TỔNG HỢP SO SÁNH CÁC CẤP ĐÁNH GIÁ TẬP THỂ */}
            <div style={{ marginTop: "20px", marginBottom: "14px" }}>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b", marginBottom: 10 }}>
                Tổng hợp kết quả đánh giá tập thể theo từng cấp thẩm quyền:
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#334155", fontWeight: 700, width: "38%" }}>Nội dung đánh giá</th>
                      <th style={{ padding: "10px 14px", color: "#c2410c", fontWeight: 700, borderLeft: "1px solid #cbd5e1" }}>
                        Đơn vị tự chấm
                      </th>
                      {showCapTrenCol && (
                        <th style={{ padding: "10px 14px", color: "#0355a2", fontWeight: 700, borderLeft: "1px solid #cbd5e1" }}>
                          Cấp trên đánh giá
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600 }}>1. Tiêu chí chung (A) (30 điểm)</td>
                      <td style={{ padding: "9px 14px", borderLeft: "1px solid #e2e8f0", fontWeight: 600, color: "#0891b2" }}>
                        {tongDiemChungTuCham}/30
                      </td>
                      {showCapTrenCol && (
                        <td style={{ padding: "9px 14px", borderLeft: "1px solid #e2e8f0", fontWeight: 600, color: "#0891b2" }}>
                          {tongDiemChungCapTren}/30
                        </td>
                      )}
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600 }}>2. Tiêu chí nhiệm vụ (B) (70 điểm)</td>
                      <td style={{ padding: "9px 14px", borderLeft: "1px solid #e2e8f0", fontWeight: 600, color: "#7c3aed" }}>
                        {effectiveDiemNhiemVuTuCham}/70
                      </td>
                      {showCapTrenCol && (
                        <td style={{ padding: "9px 14px", borderLeft: "1px solid #e2e8f0", fontWeight: 600, color: "#7c3aed" }}>
                          {tongDiemNhiemVuCapTren}/70
                        </td>
                      )}
                    </tr>
                    <tr style={{ background: "#f0fdf4", fontWeight: 700 }}>
                      <td style={{ padding: "11px 14px", textAlign: "left", color: "#166534", fontSize: "14px" }}>3. Tổng điểm đánh giá tập thể (100 điểm)</td>
                      <td style={{ padding: "11px 14px", borderLeft: "1px solid #e2e8f0", color: "#c2410c", fontSize: "16px", fontWeight: 800 }}>
                        {effectiveTongDiemTuCham}/100 điểm
                      </td>
                      {showCapTrenCol && (
                        <td style={{ padding: "11px 14px", borderLeft: "1px solid #e2e8f0", color: "#15803d", fontSize: "16px", fontWeight: 800 }}>
                          {tongDiemCapTren}/100 điểm
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* DẢI TỔNG HỢP TOÀN PHẦN I */}
            <div
              style={{
                marginTop: "14px",
                padding: "14px 18px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: "14px", color: "#334155", fontWeight: 600 }}>
                Tổng điểm đánh giá tập thể năm <strong>{namHienThi}</strong> (Tối đa: <strong>100 điểm</strong>):
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                {/* Khối đơn vị tự chấm */}
                <div style={{ padding: "6px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: 700, color: "#c2410c", fontSize: "13px" }}>Đơn vị tự chấm:</span>
                  <span style={{ fontSize: "13px", color: "#475569" }}>Chung (A): <strong style={{ color: "#0f766e" }}>{tongDiemChungTuCham}/30</strong></span>
                  <span style={{ color: "#cbd5e1" }}>|</span>
                  <span style={{ fontSize: "13px", color: "#475569" }}>Nhiệm vụ (B): <strong style={{ color: "#2563eb" }}>{effectiveDiemNhiemVuTuCham}/70</strong></span>
                  <span style={{ color: "#cbd5e1" }}>|</span>
                  <span style={{ fontSize: "14px", color: "#c2410c", fontWeight: 800 }}>Tổng: {effectiveTongDiemTuCham}/100đ</span>
                </div>

                {/* Khối cấp trên đánh giá */}
                {showCapTrenCol && (
                  <div style={{ padding: "6px 14px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: 700, color: "#0355a2", fontSize: "13px" }}>Cấp trên đánh giá:</span>
                    <span style={{ fontSize: "13px", color: "#475569" }}>Chung (A): <strong style={{ color: "#0f766e" }}>{tongDiemChungCapTren}/30</strong></span>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span style={{ fontSize: "13px", color: "#475569" }}>Nhiệm vụ (B): <strong style={{ color: "#2563eb" }}>{tongDiemNhiemVuCapTren}/70</strong></span>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span style={{ fontSize: "14px", color: "#0355a2", fontWeight: 800 }}>Tổng: {tongDiemCapTren}/100đ</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN II: II. ĐƠN VỊ TỰ ĐÁNH GIÁ, XẾP LOẠI CHẤT LƯỢNG */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              position: "sticky",
              top: "56px",
              zIndex: 30,
              height: "44px",
              boxSizing: "border-box",
              background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
              color: "#fff",
              padding: "0 16px",
              fontSize: "15px",
              fontWeight: "700",
              borderRadius: "8px 8px 0 0",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #fdba74",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>II. ĐƠN VỊ TỰ ĐÁNH GIÁ, XẾP LOẠI CHẤT LƯỢNG</span>
            {chatLuongTuDanhGia && (
              <Tag color="#fff" style={{ color: "#c2410c", fontWeight: 700, margin: 0, fontSize: 13, border: "none", padding: "2px 10px", borderRadius: "4px" }}>
                {getTenXepLoai(chatLuongTuDanhGia)}
              </Tag>
            )}
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "20px 24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {XEP_LOAI_OPTIONS_TU_DANH_GIA.map((opt) => {
                const isSelected = (chatLuongTuDanhGia ?? suggestedRating) === opt.value;
                const canSelect = canOwnerAction;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      if (canSelect) setChatLuongTuDanhGia(opt.value);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: 8,
                      border: isSelected ? "2px solid #ea580c" : "1px solid #cbd5e1",
                      background: isSelected ? "#fff7ed" : "#ffffff",
                      cursor: canSelect ? "pointer" : "default",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected ? "0 2px 8px rgba(234, 88, 12, 0.12)" : "none",
                    }}
                  >
                    <input
                      type="radio"
                      name="chatLuongTuDanhGia"
                      checked={isSelected}
                      disabled={!canSelect}
                      onChange={() => {
                        if (canSelect) setChatLuongTuDanhGia(opt.value);
                      }}
                      style={{ marginTop: "4px", width: "18px", height: "18px", accentColor: "#ea580c", cursor: canSelect ? "pointer" : "default" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: isSelected ? "#c2410c" : "#1e293b", marginBottom: 4 }}>
                        {opt.title}
                        {suggestedRating === opt.value && (
                          <Tag color="orange" style={{ marginLeft: 8, fontSize: 11 }}>
                            Gợi ý theo tổng điểm ({tongDiemTuCham}đ)
                          </Tag>
                        )}
                      </div>
                      <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", textAlign: "justify" }}>
                        {opt.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PHẦN III: III. KẾT QUẢ XẾP LOẠI CHẤT LƯỢNG CỦA CẤP CÓ THẨM QUYỀN */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              position: "sticky",
              top: "56px",
              zIndex: 30,
              height: "44px",
              boxSizing: "border-box",
              background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
              color: "#fff",
              padding: "0 16px",
              fontSize: "15px",
              fontWeight: "700",
              borderRadius: "8px 8px 0 0",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #fdba74",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>III. KẾT QUẢ XẾP LOẠI CHẤT LƯỢNG CỦA CẤP CÓ THẨM QUYỀN</span>
            {chatLuongCapTrenDanhGia && (
              <Tag color="#fff" style={{ color: "#047857", fontWeight: 700, margin: 0, fontSize: 13, border: "none", padding: "2px 10px", borderRadius: "4px" }}>
                {getTenXepLoai(chatLuongCapTrenDanhGia)}
              </Tag>
            )}
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "20px 24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            {!canSupervisorAction && !chatLuongCapTrenDanhGia && (
              <div style={{ marginBottom: 14, color: "#64748b", fontStyle: "italic", fontSize: "13px" }}>
                * Chưa có kết quả xếp loại của cấp có thẩm quyền (sẽ do cấp có thẩm quyền đánh giá tại các bước tiếp theo).
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
              {XEP_LOAI_OPTIONS_CAP_TREN.map((opt) => {
                const isSelected = chatLuongCapTrenDanhGia === opt.value;
                const canSelect = canSupervisorAction;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      if (canSelect) setChatLuongCapTrenDanhGia(opt.value);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 16px",
                      borderRadius: 8,
                      border: isSelected ? "2px solid #059669" : "1px solid #cbd5e1",
                      background: isSelected ? "#ecfdf5" : "#ffffff",
                      cursor: canSelect ? "pointer" : "default",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected ? "0 2px 8px rgba(5, 150, 105, 0.12)" : "none",
                    }}
                  >
                    <input
                      type="radio"
                      name="chatLuongCapTrenDanhGia"
                      checked={isSelected}
                      disabled={!canSelect}
                      onChange={() => {
                        if (canSelect) setChatLuongCapTrenDanhGia(opt.value);
                      }}
                      style={{ width: "18px", height: "18px", accentColor: "#059669", cursor: canSelect ? "pointer" : "default" }}
                    />
                    <div style={{ fontWeight: 600, fontSize: "14px", color: isSelected ? "#047857" : "#1e293b" }}>
                      {opt.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHỮ KÝ XÁC NHẬN CUỐI TRANG */}
        <Card
          className="customCardShadow"
          style={{
            marginBottom: 24,
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
          styles={{ body: { padding: "24px 32px" } }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} style={{ textAlign: "center" }}>
              <div style={{ fontStyle: "italic", fontSize: "13px", color: "#475569", marginBottom: 6 }}>
                ......, ngày....tháng.....năm.....
              </div>
              <div style={{ fontWeight: 700, fontSize: "14px", textTransform: "uppercase", color: "#0f172a" }}>
                ĐƠN VỊ TỰ XẾP LOẠI
              </div>
              <div style={{ fontStyle: "italic", fontSize: "12px", color: "#64748b", marginBottom: 40 }}>
                (Ký tên, ghi rõ họ tên)
              </div>
              {phieuInfo?.nguoiTao && (
                <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>
                  {phieuInfo.nguoiTao}
                </div>
              )}
            </Col>

            <Col xs={24} sm={12} style={{ textAlign: "center" }}>
              <div style={{ fontStyle: "italic", fontSize: "13px", color: "#475569", marginBottom: 6 }}>
                ......, ngày....tháng.....năm.....
              </div>
              <div style={{ fontWeight: 700, fontSize: "14px", textTransform: "uppercase", color: "#0f172a" }}>
                CẤP CÓ THẨM QUYỀN XẾP LOẠI
              </div>
              <div style={{ fontStyle: "italic", fontSize: "12px", color: "#64748b", marginBottom: 40 }}>
                (Ký tên, ghi rõ họ tên)
              </div>
              {isDaDuyet && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: 13, padding: "2px 10px" }}>
                    Đã ký duyệt điện tử
                  </Tag>
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {/* Master Workflow Action Bar */}
        {!isDaDuyet && !isViewOnlyParam && (canEditAny || canThuHoi) && (
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
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "saturate(180%) blur(20px)",
                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                padding: "12px 18px",
                borderRadius: "14px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)"
              }}
            >
              {/* Nút Thu hồi */}
              {canThuHoi && (
                <Button
                  type="primary"
                  className="btn-custom-recall"
                  icon={<UndoOutlined />}
                  onClick={() => setThuHoiModalVisible(true)}
                  loading={thuHoiLoading}
                  style={{
                    height: "40px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    padding: "0 18px",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                  }}
                >
                  Thu hồi phiếu
                </Button>
              )}

              {/* Nút Lưu đánh giá */}
              {canEditAny && (
                <Button
                  type="primary"
                  className="btn-custom-draft"
                  icon={saving ? <LoadingOutlined /> : <SaveOutlined />}
                  onClick={() => handleSaveAll(false, "save")}
                  loading={saving}
                  disabled={transitionSaving}
                  style={{
                    height: "40px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    padding: "0 18px",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  Lưu đánh giá
                </Button>
              )}

              {/* Nút Trả về */}
              {canSupervisorAction && (
                <Button
                  danger
                  icon={<RollbackOutlined />}
                  onClick={() => handleOpenChuyenBuocModal("return")}
                  disabled={saving || transitionSaving}
                  style={{
                    height: "40px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    padding: "0 18px",
                    boxShadow: "0 4px 12px rgba(255, 77, 79, 0.2)",
                  }}
                >
                  Trả về
                </Button>
              )}

              {/* Nút Chuyển bước luồng / Phê duyệt */}
              {canEditAny && (
                <Button
                  type="primary"
                  className={nextStepInfo.isFinal ? "btn-custom-approve" : "btn-custom-submit"}
                  icon={transitionSaving ? <LoadingOutlined /> : nextStepInfo.isFinal ? <CheckCircleOutlined /> : <SendOutlined />}
                  onClick={() => handleOpenChuyenBuocModal(nextStepInfo.isFinal ? "approve" : "send")}
                  loading={transitionSaving}
                  disabled={saving || nextStepInfo.isLoading}
                  style={{
                    height: "40px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    padding: "0 22px",
                    boxShadow: nextStepInfo.isFinal
                      ? "0 4px 14px rgba(5, 150, 105, 0.4)"
                      : "0 4px 14px rgba(234, 88, 12, 0.4)",
                  }}
                >
                  {nextStepInfo.buttonText}
                </Button>
              )}
            </div>
          </>
        )}

        {/* Modal chuyển bước luồng / Phê duyệt / Trả về */}
        <Modal
          open={chuyenBuocModal.visible}
          title={
            <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "16px" }}>
              {chuyenBuocModal.title}
            </span>
          }
          closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
          onOk={handleConfirmChuyenBuoc}
          onCancel={() => setChuyenBuocModal((prev) => ({ ...prev, visible: false }))}
          okText={<span style={{ color: "#ffffff", fontWeight: 600 }}>{chuyenBuocModal.type === "return" ? "Xác nhận trả về" : "Xác nhận gửi"}</span>}
          cancelText="Hủy"
          confirmLoading={loading}
          styles={{
            header: {
              background: chuyenBuocModal.type === "return"
                ? "#dc2626"
                : chuyenBuocModal.type === "approve"
                  ? "#059669"
                  : "#0355a2",
              padding: "12px 16px",
              margin: 0,
              borderRadius: "8px 8px 0 0",
            },
            body: { padding: "16px 20px 8px" },
          }}
          okButtonProps={{
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
          <div>
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
              Xác nhận thu hồi phiếu đánh giá tập thể
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
            body: { padding: "16px 20px 8px" },
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
          <div>
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              Bạn có chắc chắn muốn thu hồi lại phiếu đánh giá tập thể này không? Sau khi thu hồi, phiếu sẽ quay về trạng thái <b>Khởi tạo</b> và đơn vị có thể điều chỉnh lại kết quả.
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
