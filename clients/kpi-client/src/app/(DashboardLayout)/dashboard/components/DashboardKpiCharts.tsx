"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Row, Col, Spin, Typography, Select, Empty, Modal, Table, Tag, Button, Space, Progress, ConfigProvider } from "antd";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart, Area, LabelList, PieChart, Pie, Cell
} from "recharts";
import kPI_TieuChiChung_DiemSoService from "@/services/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSoService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import { KPI_TongHopToanCucDto, KPI_TongHopTieuChiChungNhanSuDto } from "@/types/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSo";
import { DropdownOption } from "@/types/general";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  EyeOutlined,
  UserOutlined,
  CheckCircleFilled,
  WarningFilled,
  BarChartOutlined,
  FundOutlined,
  AreaChartOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  TableOutlined
} from "@ant-design/icons";
import KPI_PhieuDanhGiaDetail from "../../kPI_PhieuDanhGia/detail";
import Link from "next/link";
import KpiSummaryTable from "@/components/shared-components/KpiSummaryTable";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { ChucVuThuTuType } from "@/types/dM_DuLieuDanhMuc/dto";

const { Title, Text } = Typography;

const trangThaiDict: Record<string, { label: string, color: string }> = {
  'KhoiTao': { label: 'Khởi tạo', color: 'blue' },
  'GuiPhoTruongPhong': { label: 'Gửi P.Trưởng phòng', color: 'cyan' },
  'GuiTruongPhong': { label: 'Gửi Trưởng phòng', color: 'orange' },
  'GuiPhoCucTruong': { label: 'Gửi P.Cục trưởng', color: 'purple' },
  'GuiCucTruong': { label: 'Gửi Cục trưởng', color: 'purple' },
  'GuiPhoVuTruong': { label: 'Gửi P.Vụ trưởng', color: 'cyan' },
  'GuiVuTruong': { label: 'Gửi Vụ trưởng', color: 'purple' },
  'GuiPhoGiamDocTT': { label: 'Gửi P.Giám đốc TT', color: 'cyan' },
  'GuiGiamDocTT': { label: 'Gửi Giám đốc TT', color: 'purple' },
  'GuiPhoChanhVanPhong': { label: 'Gửi Phó Chánh VP', color: 'cyan' },
  'GuiChanhVanPhong': { label: 'Gửi Chánh VP', color: 'purple' },
  'DaDuyet': { label: 'Đã duyệt', color: 'green' },
  'TuChoi': { label: 'Từ chối', color: 'red' },
  'TraVe': { label: 'Trả về', color: 'volcano' },
  'ThuHoi': { label: 'Thu hồi', color: 'volcano' },
  'TraLai': { label: 'Trả lại', color: 'red' },
};

const VAI_TRO_OPTIONS = [
  { value: "CaNhan", label: "Cá nhân tự đánh giá" },
  { value: "PhoTruongPhong", label: "Phó Trưởng phòng đánh giá" },
  { value: "TruongPhong", label: "Trưởng phòng đánh giá" },
  { value: "PhoCucTruong", label: "Phó Cục trưởng đánh giá" },
  { value: "CucTruong", label: "Cục trưởng đánh giá" },
  { value: "PhoVuTruong", label: "Phó Vụ trưởng đánh giá" },
  { value: "VuTruong", label: "Vụ trưởng đánh giá" },
  { value: "PhoGiamDocTT", label: "Phó Giám đốc TT đánh giá" },
  { value: "GiamDocTT", label: "Giám đốc TT đánh giá" },
  { value: "PhoChanhVanPhong", label: "Phó Chánh Văn phòng đánh giá" },
  { value: "ChanhVanPhong", label: "Chánh Văn phòng đánh giá" },
];

const toRoman = (value: number) => {
  const romanMap: Array<[number, string]> = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let number = value;
  let result = "";
  romanMap.forEach(([unit, symbol]) => {
    while (number >= unit) {
      result += symbol;
      number -= unit;
    }
  });
  return result || String(value);
};

const roundAverage = (items: any[], field: string): number | null => {
  const values = items.map((item) => item[field]).filter((value) => value != null).map(Number);
  return values.length > 0 ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100 : null;
};

export default function DashboardKpiCharts() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null); // any to handle both ToanCuc and TieuChiChung
  const [chucVuThuTu, setChucVuThuTu] = useState<ChucVuThuTuType[]>([]);

  const [dotOptions, setDotOptions] = useState<DropdownOption[]>([]);
  const [idDot, setIdDot] = useState<string | undefined>(undefined);
  const [vaiTroDanhGia, setVaiTroDanhGia] = useState<string | undefined>(undefined);
  const vaiTroDanhGiaLabel = VAI_TRO_OPTIONS.find((item) => item.value === vaiTroDanhGia)?.label || vaiTroDanhGia || "vai trò đã chọn";

  // Redux user states
  const currentUser = useSelector((state: any) => state.auth.User);
  const userRoles: string[] = currentUser?.listRole || [];
  const isLanhDaoCuc = useMemo(() => userRoles.some((r: string) => r.includes("CucTruong") || r === "LanhDaoCuc" || r === "Admin"), [userRoles]);


  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<{ id: string, name: string } | null>(null);
  const [departmentDetails, setDepartmentDetails] = useState<KPI_TongHopTieuChiChungNhanSuDto[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10);

  // PhieuDanhGia Detail states
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);

  const [selectedDeptIdForChart, setSelectedDeptIdForChart] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadChucVuThuTu = async () => {
      try {
        const response = await duLieuDanhMucService.getChucVuThuTu();
        if (isMounted && response.status && response.data) {
          setChucVuThuTu(response.data);
        }
      } catch (err) {
        console.error("Lỗi tải thứ tự chức vụ:", err);
      }
    };

    loadChucVuThuTu();
    return () => {
      isMounted = false;
    };
  }, []);

  // Unified data initialization effect
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        let currentIdDot = idDot;

        // Fetch dropdown options if empty
        let currentDotOptions = dotOptions;
        if (!currentDotOptions || currentDotOptions.length === 0) {
          const dots = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
          currentDotOptions = dots || [];
          if (isMounted) setDotOptions(currentDotOptions);
        }

        // Auto-select current month dot if idDot is not set yet
        if (!currentIdDot && currentDotOptions.length > 0) {
          const now = new Date();
          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();

          const matchedDot = currentDotOptions.find((d: any) => {
            const label = (d.label || d.text || "").toString();
            return label.includes(`Tháng ${currentMonth}`) && label.includes(`Năm ${currentYear}`);
          });

          currentIdDot = matchedDot?.value ? matchedDot.value.toString() : currentDotOptions[0].value.toString();
          if (isMounted) setIdDot(currentIdDot);
        }

        if (!currentIdDot) {
          if (isMounted) setLoading(false);
          return;
        }

        // Fetch KPI data
        const searchData = {
          type: "Thang",
          idDot: currentIdDot,
          vaiTroDanhGia: vaiTroDanhGia || undefined,
        };
        let res;
        if (isLanhDaoCuc) {
          res = await kPI_TieuChiChung_DiemSoService.getTongHopToanCuc(searchData);
        } else {
          res = await kPI_TieuChiChung_DiemSoService.getTongHopTieuChi(searchData);
        }

        if (isMounted) {
          if (res && res.status && res.data) {
            setData(res.data);
          } else {
            setData(null);
          }
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu KPI Dashboard:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [idDot, currentUser, isLanhDaoCuc, vaiTroDanhGia]);

  const handleBarClick = async (clickedData: any) => {
    const itemData = clickedData?.payload || clickedData;

    if (!itemData || !idDot) return;

    // Nếu click vào thanh của cá nhân (có lyLichId)
    if (itemData.lyLichId) {
      const pbId = itemData.phongBanId || selectedDeptIdForChart || currentUser?.departmentId || "unknown";
      setSelectedDepartment({ id: pbId, name: itemData.name || "Chi tiết" });
      setIsModalVisible(true);

      if (isLanhDaoCuc) {
        let foundPerson = null;
        // Tìm cá nhân trong tất cả các phòng ban
        if (data?.listPhongBan) {
          for (const pb of data.listPhongBan) {
            const p = pb.listThongTinNhanSu?.find((ns: any) => ns.lyLichId === itemData.lyLichId);
            if (p) {
              foundPerson = p;
              break;
            }
          }
        }
        if (foundPerson) {
          setDepartmentDetails([foundPerson]);
        } else {
          setDepartmentDetails([]);
        }
      } else {
        if (data?.listThongTinNhanSu) {
          setDepartmentDetails(data.listThongTinNhanSu.filter((ns: any) => ns.lyLichId === itemData.lyLichId));
        } else {
          setDepartmentDetails([]);
        }
      }
      return;
    }

    // Nếu click vào thanh của phòng ban (chỉ có ở biểu đồ 1 & 2 khi là Lãnh đạo)
    const pbId = itemData?.phongBanId || currentUser?.departmentId || "unknown";

    setSelectedDepartment({ id: pbId, name: itemData?.name || "Chi tiết" });
    setIsModalVisible(true);

    if (isLanhDaoCuc) {
      // Tìm phòng ban trong data hiện tại
      const foundPb = data?.listPhongBan?.find((pb: any) => pb.phongBanId === itemData.phongBanId);
      if (foundPb && foundPb.listThongTinNhanSu) {
        setDepartmentDetails(foundPb.listThongTinNhanSu);
      } else {
        setDepartmentDetails([]);
      }
    } else {
      if (data?.listThongTinNhanSu && itemData?.lyLichId) {
        setDepartmentDetails(data.listThongTinNhanSu.filter((ns: any) => ns.lyLichId === itemData.lyLichId));
      } else {
        setDepartmentDetails([]);
      }
    }
  };

  // Table columns for the modal
  const modalColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: any, index: number) => (modalPage - 1) * modalPageSize + index + 1
    },
    {
      title: "Họ và tên",
      dataIndex: "tenNhanSu",
      key: "tenNhanSu",
      render: (val: string, record: any) => (
        <Space>
          <Text strong>{val || "-"}</Text>
          {record.lyLichId === currentUser?.idLyLich && (
            <Tag color="volcano" style={{ borderRadius: "10px" }}>Bạn</Tag>
          )}
        </Space>
      )
    },
    {
      title: "Chức vụ",
      dataIndex: "chucVu_txt",
      key: "chucVu_txt",
    },
    {
      title: "Phòng ban",
      dataIndex: "tenPhongBan",
      key: "tenPhongBan",
      render: (val: string) => <Text>{val || selectedDepartment?.name || "-"}</Text>
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center" as const,
      width: 140,
      render: (val: string) => {
        const conf = trangThaiDict[val] || { label: val || "-", color: 'default' };
        return <Tag color={conf.color}>{conf.label}</Tag>;
      }
    },
    {
      title: "Tỷ lệ hoàn thành (%)",
      dataIndex: "diemTieuChiKetQuaNV_TheoDiem",
      key: "diemTieuChiKetQuaNV_TheoDiem",
      render: (val: number, record: any) => record.duDiemNhiemVuTheoVaiTro === false ? (
        <Tag color="warning" icon={<WarningFilled />}>
          Thiếu {record.soDauRaThieuDiem || 0} đầu ra
        </Tag>
      ) : val != null ? <Tag color="cyan">{Number(val).toFixed(2)}%</Tag> : "-"
    },
    {
      title: "Điểm tiêu chí chung",
      dataIndex: "diemTieuChiChung",
      key: "diemTieuChiChung",
      render: (val: number) => val != null ? <Tag color="purple">{Number(val).toFixed(2)}</Tag> : "-"
    },
    {
      title: "Tổng điểm thực tế",
      key: "diemTheoBTC_TongThucTe",
      render: (_: any, record: any) => {
        if (record.diemTieuChiChung == null || record.diemTieuChiKetQuaNV_TheoThang == null) return "-";
        const total = record.diemTieuChiChung + record.diemTieuChiKetQuaNV_TheoThang;
        return <Tag color="blue">{Number(total).toFixed(2)}</Tag>;
      }
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          title="Xem chi tiết phiếu đánh giá"
          onClick={() => {
            setDetailItem({
              idLyLich: record.lyLichId,
              idPhieuDanhGia: record.idPhieuDanhGia,
              idDotDanhGia: idDot,
              tenChuPhieu: record.tenNhanSu,
              tenDotDanhGia: dotOptions.find((d: any) => d.value == idDot)?.label || "Đợt đánh giá",
              fallbackDiemTieuChiChung: record.diemTieuChiChung,
              fallbackDiemThucHienNhiemVu: record.diemTieuChiKetQuaNV_TheoThang,
              fallbackTongDiem: (record.diemTieuChiChung || 0) + (record.diemTieuChiKetQuaNV_TheoThang || 0),
            });
            setIsDetailVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  // Process data for charts
  const chartData = useMemo(() => {
    if (!data) return [];

    if (isLanhDaoCuc) {
      if (!data.listPhongBan) return [];
      return data.listPhongBan.map((pb: any) => {
        const children = pb.listThongTinNhanSu || [];
        let sumTyLe = 0, countTyLe = 0;
        let sumChung = 0, countChung = 0;
        let sumThucTe = 0, countThucTe = 0;
        let soDauRaThieuDiem = 0, soNhanSuThieu = 0;

        children.forEach((c: any) => {
          if (c.diemTieuChiKetQuaNV_TheoDiem != null) {
            sumTyLe += c.diemTieuChiKetQuaNV_TheoDiem;
            countTyLe++;
          }
          if (c.diemTieuChiChung != null) {
            sumChung += c.diemTieuChiChung;
            countChung++;
          }
          if (c.diemTieuChiKetQuaNV_TheoThang != null && c.diemTieuChiChung != null) {
            sumThucTe += c.diemTieuChiKetQuaNV_TheoThang + c.diemTieuChiChung;
            countThucTe++;
          }
          if (c.duDiemNhiemVuTheoVaiTro === false) {
            soNhanSuThieu++;
            soDauRaThieuDiem += Number(c.soDauRaThieuDiem || 0);
          }
        });

        const avgTyLe = countTyLe > 0 ? Math.round((sumTyLe / countTyLe) * 100) / 100 : null;
        const avgChung = countChung > 0 ? Math.round((sumChung / countChung) * 100) / 100 : null;
        const avgThucTe = countThucTe > 0 ? Math.round((sumThucTe / countThucTe) * 100) / 100 : null;

        // Make department name shorter for chart
        const shortName = pb.tenPhongBan?.replace("Phòng", "").replace("Ban", "").trim() || "N/A";

        return {
          phongBanId: pb.phongBanId,
          name: pb.tenPhongBan || "N/A",
          shortName: shortName.length > 15 ? shortName.substring(0, 15) + "..." : shortName,
          avgTyLe,
          avgChung,
          avgThucTe,
          duDiemNhiemVuTheoVaiTro: soNhanSuThieu === 0,
          soDauRaThieuDiem,
          soNhanSuThieu,
          totalNhanSu: children.length
        };
      }).filter((d: any) => d.totalNhanSu > 0).sort((a: any, b: any) => (b.avgTyLe ?? -1) - (a.avgTyLe ?? -1));
    } else {
      // Dành cho Trưởng phòng: lấy danh sách cá nhân trong phòng ban
      if (!data.listThongTinNhanSu) return [];
      return data.listThongTinNhanSu.map((ns: any) => {
        const ten = ns.tenNhanSu || "N/A";
        // Lấy tên cuối cùng làm shortName
        const nameParts = ten.split(' ');
        const shortName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : ten;

        const diemNV = ns.diemTieuChiKetQuaNV_TheoThang ?? null;
        const diemChung = ns.diemTieuChiChung ?? null;

        return {
          lyLichId: ns.lyLichId,
          name: ten,
          shortName: shortName,
          avgTyLe: ns.diemTieuChiKetQuaNV_TheoDiem ?? null,
          avgChung: diemChung,
          avgThucTe: diemNV != null && diemChung != null ? Math.round((diemNV + diemChung) * 100) / 100 : null,
          diemQuyDoi: diemNV,
          duDiemNhiemVuTheoVaiTro: ns.duDiemNhiemVuTheoVaiTro !== false,
          soDauRaThieuDiem: ns.soDauRaThieuDiem || 0,
          totalNhanSu: 1 // Dummy for map
        };
      }).sort((a: any, b: any) => (b.avgTyLe ?? -1) - (a.avgTyLe ?? -1));
    }
  }, [data, isLanhDaoCuc]);

  const chartDataCaNhan = useMemo(() => {
    if (!data) return [];

    let listNhanSu: any[] = [];
    if (isLanhDaoCuc) {
      if (!data.listPhongBan || !selectedDeptIdForChart) return [];
      const selectedDept = data.listPhongBan.find((pb: any) => pb.phongBanId === selectedDeptIdForChart);
      if (!selectedDept || !selectedDept.listThongTinNhanSu) return [];
      listNhanSu = selectedDept.listThongTinNhanSu;
    } else {
      if (!data.listThongTinNhanSu) return [];
      listNhanSu = data.listThongTinNhanSu;
    }

    return listNhanSu.map((ns: any) => {
      const ten = ns.tenNhanSu || "N/A";
      const nameParts = ten.split(' ');
      const shortName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : ten;

      const diemNV = ns.diemTieuChiKetQuaNV_TheoThang ?? null;
      const diemChung = ns.diemTieuChiChung ?? null;

      return {
        lyLichId: ns.lyLichId,
        name: ten,
        shortName: shortName,
        avgTyLe: ns.diemTieuChiKetQuaNV_TheoDiem ?? null,
        avgChung: diemChung,
        avgThucTe: diemNV != null || diemChung != null
          ? Math.round((Number(diemNV ?? 0) + Number(diemChung ?? 0)) * 100) / 100
          : null,
        diemQuyDoi: diemNV,
        duDiemNhiemVuTheoVaiTro: ns.duDiemNhiemVuTheoVaiTro !== false,
        soDauRaThieuDiem: ns.soDauRaThieuDiem || 0,
        chucVu: ns.chucVu_txt || "Khác",
        totalNhanSu: 1
      };
    }).sort((a: any, b: any) => (b.avgThucTe ?? -1) - (a.avgThucTe ?? -1));
  }, [data, isLanhDaoCuc, selectedDeptIdForChart]);

  const renderKpiTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload || {};
    return (
      <div style={{ background: "#fff", border: "1px solid #d9d9d9", borderRadius: 8, padding: "10px 12px", boxShadow: "0 4px 12px rgba(0,0,0,.12)" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.name || label}</div>
        {payload.map((entry: any) => entry.value != null && (
          <div key={entry.dataKey} style={{ color: entry.color || entry.stroke || "#334155" }}>
            {entry.name}: {entry.value}
          </div>
        ))}
        {item.duDiemNhiemVuTheoVaiTro === false && (
          <div style={{ color: "#d97706", marginTop: 8, fontWeight: 600 }}>
            <WarningFilled /> Thiếu điểm nhiệm vụ của {vaiTroDanhGiaLabel}: {item.soDauRaThieuDiem || 0} đầu ra
            {item.soNhanSuThieu ? ` thuộc ${item.soNhanSuThieu} nhân sự` : ""}.
          </div>
        )}
      </div>
    );
  };

  const distributionData = useMemo(() => {
    if (!chartDataCaNhan || chartDataCaNhan.length === 0) return { scoreData: [], statusData: [] };

    // 1. Phân bố điểm số (Dựa trên Tổng điểm thực tế)
    let xuatSac = 0, tot = 0, kha = 0, canCaiThien = 0;
    chartDataCaNhan.forEach((item) => {
      const score = item.avgThucTe;
      if (score == null) return;
      if (score >= 90) xuatSac++;
      else if (score >= 70) tot++;
      else if (score >= 50) kha++;
      else canCaiThien++;
    });

    const scoreData = [
      { name: "Xuất sắc (>= 90)", value: xuatSac, color: "#10b981" },
      { name: "Tốt (70 - 89)", value: tot, color: "#3b82f6" },
      { name: "Khá (50 - 69)", value: kha, color: "#f59e0b" },
      { name: "Cần cải thiện (< 50)", value: canCaiThien, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // 2. Trạng thái tiến độ (Dựa vào original data vì chartDataCaNhan không chứa trangThai)
    const statusCounts: Record<string, number> = {};
    const rawData = !isLanhDaoCuc && data?.listThongTinNhanSu ? data.listThongTinNhanSu : [];

    rawData.forEach((ns: any) => {
      const st = ns.trangThai || "Khác";
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    const statusData = Object.keys(statusCounts).map(st => {
      const conf = trangThaiDict[st] || { label: st, color: "#8884d8" };
      let hexColor = "#8884d8";
      if (conf.color === "blue") hexColor = "#3b82f6";
      else if (conf.color === "cyan") hexColor = "#06b6d4";
      else if (conf.color === "orange") hexColor = "#f97316";
      else if (conf.color === "green") hexColor = "#10b981";
      else if (conf.color === "red") hexColor = "#ef4444";
      else if (conf.color === "purple") hexColor = "#a855f7";

      return {
        name: conf.label,
        value: statusCounts[st],
        color: hexColor
      };
    });

    return { scoreData, statusData };
  }, [chartDataCaNhan, data, isLanhDaoCuc]);

  const renderCustomScorePieLabel = useCallback((props: any) => {
    const { x, y, cx, cy, textAnchor, name, value, percent } = props;
    const shortName = name ? name.replace(/\s*\(.*?\)/, '').trim() : '';
    const percentStr = `${((percent || 0) * 100).toFixed(0)}%`;

    let adjustedX = x;
    let adjustedY = y;
    let line1Dy = "-0.35em";
    let line2Dy = "1.25em";

    // Xử lý đè chữ khi đường kẻ (leader line) nối từ lát cắt tới nhãn
    const isTop = cy != null ? y < cy : true;
    const isNearVertical = (cx != null && Math.abs(x - cx) < 20) || textAnchor === "middle";

    if (isNearVertical) {
      if (isTop) {
        // Lát cắt nằm ở đỉnh trên: đường kẻ đi từ dưới lên y -> đẩy toàn bộ text lên trên y để đường kẻ dừng bên dưới nhãn
        adjustedY = y - 16;
        line1Dy = "-0.4em";
        line2Dy = "1.25em";
      } else {
        // Lát cắt nằm ở đáy dưới: đường kẻ đi từ trên xuống y -> đẩy toàn bộ text xuống dưới y
        adjustedY = y + 16;
        line1Dy = "0.4em";
        line2Dy = "1.25em";
      }
    } else if (textAnchor === "start") {
      adjustedX = x + 6;
    } else if (textAnchor === "end") {
      adjustedX = x - 6;
    }

    return (
      <text
        x={adjustedX}
        y={adjustedY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={12}
        style={{ paintOrder: "stroke fill" }}
      >
        <tspan x={adjustedX} dy={line1Dy} fontWeight={600} fill="#1e293b" stroke="#ffffff" strokeWidth={3} strokeLinejoin="round">
          {shortName}
        </tspan>
        <tspan x={adjustedX} dy={line2Dy} fill="#64748b" fontSize={11} stroke="#ffffff" strokeWidth={2.5} strokeLinejoin="round">
          {`${value} người (${percentStr})`}
        </tspan>
      </text>
    );
  }, []);

  const renderCustomStatusPieLabel = useCallback((props: any) => {
    const { x, y, cx, cy, textAnchor, name, value } = props;

    let adjustedX = x;
    let adjustedY = y;
    let line1Dy = "-0.35em";
    let line2Dy = "1.25em";

    const isTop = cy != null ? y < cy : true;
    const isNearVertical = (cx != null && Math.abs(x - cx) < 20) || textAnchor === "middle";

    if (isNearVertical) {
      if (isTop) {
        adjustedY = y - 16;
        line1Dy = "-0.4em";
        line2Dy = "1.25em";
      } else {
        adjustedY = y + 16;
        line1Dy = "0.4em";
        line2Dy = "1.25em";
      }
    } else if (textAnchor === "start") {
      adjustedX = x + 6;
    } else if (textAnchor === "end") {
      adjustedX = x - 6;
    }

    return (
      <text
        x={adjustedX}
        y={adjustedY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={12}
        style={{ paintOrder: "stroke fill" }}
      >
        <tspan x={adjustedX} dy={line1Dy} fontWeight={600} fill="#1e293b" stroke="#ffffff" strokeWidth={3} strokeLinejoin="round">
          {name}
        </tspan>
        <tspan x={adjustedX} dy={line2Dy} fill="#64748b" fontSize={11} stroke="#ffffff" strokeWidth={2.5} strokeLinejoin="round">
          {`${value} phiếu`}
        </tspan>
      </text>
    );
  }, []);

  useEffect(() => {
    if (isLanhDaoCuc && data?.listPhongBan?.length > 0 && !selectedDeptIdForChart) {
      setSelectedDeptIdForChart(data.listPhongBan[0].phongBanId);
    }
  }, [data, isLanhDaoCuc, selectedDeptIdForChart]);

  const evalStats = useMemo(() => {
    if (!data) return { total: 0, evaluated: 0, pending: 0, departments: [], statuses: {} };

    let total = 0;
    let evaluated = 0;
    const departments: any[] = [];
    const statuses: Record<string, number> = {};

    if (isLanhDaoCuc && data.listPhongBan) {
      data.listPhongBan.forEach((pb: any) => {
        const children = pb.listThongTinNhanSu || [];
        let deptTotal = children.length;
        let deptEval = 0;

        children.forEach((c: any) => {
          if (c.daDanhGia) {
            deptEval++;
            const st = c.trangThai || 'Khác';
            statuses[st] = (statuses[st] || 0) + 1;
          }
        });

        total += deptTotal;
        evaluated += deptEval;

        departments.push({
          id: pb.phongBanId,
          name: pb.tenPhongBan || "Khác",
          total: deptTotal,
          evaluated: deptEval,
          pending: deptTotal - deptEval
        });
      });
    }

    // Đưa mục "Khác" (hoặc không xác định) xuống cuối danh sách phòng ban
    departments.sort((a: any, b: any) => {
      const isOtherA = !a.name || a.name.trim().toLowerCase() === "khác" || a.name.trim().toLowerCase() === "other";
      const isOtherB = !b.name || b.name.trim().toLowerCase() === "khác" || b.name.trim().toLowerCase() === "other";
      if (isOtherA && !isOtherB) return 1;
      if (!isOtherA && isOtherB) return -1;
      return 0;
    });

    return { total, evaluated, pending: total - evaluated, departments, statuses };
  }, [data, isLanhDaoCuc]);

  const handleScorePieClick = (clickedData: any) => {
    if (!data?.listThongTinNhanSu) return;
    const sliceName = clickedData.name || clickedData.payload?.name;
    if (!sliceName) return;

    // Keep the click filter consistent with distributionData, which groups
    // people by the actual score from task points + common criteria points.
    const getActualScore = (ns: any): number | null => {
      if (ns.diemTieuChiKetQuaNV_TheoThang == null || ns.diemTieuChiChung == null) {
        return null;
      }

      return Math.round(
        (Number(ns.diemTieuChiKetQuaNV_TheoThang) + Number(ns.diemTieuChiChung)) * 100,
      ) / 100;
    };

    const filtered = data.listThongTinNhanSu.filter((ns: any) => {
      const score = getActualScore(ns);
      if (score == null) return false;

      if (sliceName.includes("Xuất sắc")) return score >= 90;
      if (sliceName.includes("Tốt")) return score >= 70 && score < 90;
      if (sliceName.includes("Khá")) return score >= 50 && score < 70;
      return score < 50;
    });

    setSelectedDepartment({ id: 'score', name: `Phân bố điểm - ${sliceName}` });
    setDepartmentDetails(filtered);
    setIsModalVisible(true);
  };

  const handleStatusPieClick = (clickedData: any) => {
    if (!data?.listThongTinNhanSu) return;
    const sliceName = clickedData.name || clickedData.payload?.name;
    if (!sliceName) return;

    let statusKey = "";
    for (const key in trangThaiDict) {
      if (trangThaiDict[key].label === sliceName) {
        statusKey = key;
        break;
      }
    }

    let filtered: any[] = [];
    if (statusKey) {
      filtered = data.listThongTinNhanSu.filter((ns: any) => ns.trangThai === statusKey);
    } else if (sliceName === "Khác") {
      filtered = data.listThongTinNhanSu.filter((ns: any) => !ns.trangThai || !trangThaiDict[ns.trangThai]);
    }

    setSelectedDepartment({ id: 'status', name: `Trạng thái - ${sliceName}` });
    setDepartmentDetails(filtered);
    setIsModalVisible(true);
  };

  const handleNumberClick = (record: any, type: 'ALL' | 'EVALUATED' | 'PENDING') => {
    const typeText = type === 'ALL' ? 'Tổng nhân sự' : type === 'EVALUATED' ? 'Đã đánh giá' : 'Chưa đánh giá';
    setSelectedDepartment({ id: record.id, name: `${record.name} - ${typeText}` });
    setIsModalVisible(true);

    if (isLanhDaoCuc) {
      const foundPb = data?.listPhongBan?.find((pb: any) => pb.phongBanId === record.id);
      if (foundPb && foundPb.listThongTinNhanSu) {
        let list = foundPb.listThongTinNhanSu;
        if (type === 'EVALUATED') {
          list = list.filter((c: any) => c.daDanhGia);
        } else if (type === 'PENDING') {
          list = list.filter((c: any) => !c.daDanhGia);
        }
        setDepartmentDetails(list);
      } else {
        setDepartmentDetails([]);
      }
    }
  };

  const handleGlobalCardClick = (type: 'ALL' | 'EVALUATED' | 'PENDING') => {
    const typeText = type === 'ALL' ? 'Tổng nhân sự toàn Cục' : type === 'EVALUATED' ? 'Đã đánh giá toàn Cục' : 'Chưa đánh giá toàn Cục';
    setSelectedDepartment({ id: 'all', name: typeText });
    setIsModalVisible(true);

    if (isLanhDaoCuc && data?.listPhongBan) {
      let allPersonnel: any[] = [];
      data.listPhongBan.forEach((pb: any) => {
        if (pb.listThongTinNhanSu) {
          allPersonnel = [...allPersonnel, ...pb.listThongTinNhanSu.map((ns: any) => ({ ...ns, tenPhongBan: pb.tenPhongBan }))];
        }
      });

      if (type === 'EVALUATED') {
        allPersonnel = allPersonnel.filter((c: any) => c.daDanhGia);
      } else if (type === 'PENDING') {
        allPersonnel = allPersonnel.filter((c: any) => !c.daDanhGia);
      }
      setDepartmentDetails(allPersonnel);
    } else {
      setDepartmentDetails([]);
    }
  };

  const handleStatusClick = (st: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const conf = trangThaiDict[st] || { label: st, color: 'default' };
    setSelectedDepartment({ id: 'all', name: `Đã đánh giá toàn Cục - ${conf.label}` });
    setIsModalVisible(true);

    if (isLanhDaoCuc && data?.listPhongBan) {
      let allPersonnel: any[] = [];
      data.listPhongBan.forEach((pb: any) => {
        if (pb.listThongTinNhanSu) {
          allPersonnel = [...allPersonnel, ...pb.listThongTinNhanSu.map((ns: any) => ({ ...ns, tenPhongBan: pb.tenPhongBan }))];
        }
      });

      allPersonnel = allPersonnel.filter((c: any) => c.daDanhGia && (c.trangThai === st || (!c.trangThai && st === 'Khác')));
      setDepartmentDetails(allPersonnel);
    } else {
      setDepartmentDetails([]);
    }
  };

  const top5Items = chartData.slice(0, 5);
  const missingTaskSummary = useMemo(() => {
    if (!vaiTroDanhGia || !data) return { people: 0, outputs: 0 };
    const personnel = isLanhDaoCuc
      ? (data.listPhongBan || []).flatMap((pb: any) => pb.listThongTinNhanSu || [])
      : (data.listThongTinNhanSu || []);
    const missing = personnel.filter((item: any) => item.duDiemNhiemVuTheoVaiTro === false);
    return {
      people: missing.length,
      outputs: missing.reduce((sum: number, item: any) => sum + Number(item.soDauRaThieuDiem || 0), 0),
    };
  }, [data, isLanhDaoCuc, vaiTroDanhGia]);

  const allSummaryPersonnel = useMemo(() => {
    if (!data) return [];
    const personnel = isLanhDaoCuc
      ? (data.listPhongBan || []).flatMap((pb: any) => (pb.listThongTinNhanSu || []).map((item: any) => ({
        ...item,
        tenPhongBan: item.tenPhongBan || pb.tenPhongBan,
      })))
      : (data.listThongTinNhanSu || []);

    const sortedChucVu = [...chucVuThuTu].sort((a, b) => {
      const priorityA = a.thuTu ?? Number.MAX_SAFE_INTEGER;
      const priorityB = b.thuTu ?? Number.MAX_SAFE_INTEGER;
      return priorityA - priorityB || a.maChucVu.localeCompare(b.maChucVu);
    });
    const chucVuRankByCode = new Map(sortedChucVu.map((item, index) => [item.maChucVu, index]));
    const chucVuColorByCode = new Map(
      sortedChucVu.map((item, index) => [
        item.maChucVu,
        item.maChucVu === "TruongPhong"
          ? "#7c3aed"
          : `hsl(${Math.round((index * 360) / Math.max(sortedChucVu.length, 1))}, 65%, 42%)`,
      ]),
    );

    return [...personnel]
      .map((item: any) => ({
        ...item,
        chucVuColor: chucVuColorByCode.get(item.chucVu),
      }))
      .sort((a: any, b: any) => {
        const rankA = chucVuRankByCode.get(a.chucVu) ?? Number.MAX_SAFE_INTEGER;
        const rankB = chucVuRankByCode.get(b.chucVu) ?? Number.MAX_SAFE_INTEGER;

        return rankA - rankB || String(a.tenNhanSu || "").localeCompare(String(b.tenNhanSu || ""), "vi");
      });
  }, [chucVuThuTu, data, isLanhDaoCuc]);

  const summaryTableData = useMemo(() => {
    if (!isLanhDaoCuc) return allSummaryPersonnel;

    return (data?.listPhongBan || []).map((pb: any, departmentIndex: number) => {
      const children = allSummaryPersonnel
        .filter((item: any) => item.phongBanId === pb.phongBanId)
        .map((item: any, personnelIndex: number) => ({
          ...item,
          tenPhongBan: item.tenPhongBan || pb.tenPhongBan,
          stt: personnelIndex + 1,
          isDepartment: false,
          key: item.lyLichId || `personnel-${departmentIndex}-${personnelIndex}`,
        }));

      const sum = (field: string) => Math.round(children.reduce((total: number, item: any) => total + Number(item[field] || 0), 0) * 100) / 100;
      const missingPersonnel = children.filter((item: any) => item.duDiemNhiemVuTheoVaiTro === false);
      return {
        id: pb.phongBanId || `department-${departmentIndex}`,
        lyLichId: undefined,
        phongBanId: pb.phongBanId,
        tenNhanSu: pb.tenPhongBan || "Phòng ban",
        chucVu_txt: `${children.length} nhân sự`,
        isDepartment: true,
        sttRom: toRoman(departmentIndex + 1),
        diemTheoBTC_TrongKeHoach: sum("diemTheoBTC_TrongKeHoach"),
        diemTheoBTC_DamNhanDotXuat: sum("diemTheoBTC_DamNhanDotXuat"),
        diemTheoBTC_TongThucTe: sum("diemTheoBTC_TongThucTe"),
        diemTieuChiKetQuaNV_TheoDiem: roundAverage(children, "diemTieuChiKetQuaNV_TheoDiem"),
        diemTieuChiKetQuaNV_TheoThang: roundAverage(children, "diemTieuChiKetQuaNV_TheoThang"),
        diemTieuChiChung: roundAverage(children, "diemTieuChiChung"),
        duDiemNhiemVuTheoVaiTro: missingPersonnel.length === 0,
        soNhanSuThieuDiem: missingPersonnel.length,
        soDauRaThieuDiem: missingPersonnel.reduce((total: number, item: any) => total + Number(item.soDauRaThieuDiem || 0), 0),
        children: children.length > 0 ? children : undefined,
      };
    });
  }, [allSummaryPersonnel, data, isLanhDaoCuc]);

  const fullReportHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("phamVi", isLanhDaoCuc ? "ToanCuc" : "PhongBan");
    if (idDot) params.set("idDot", idDot);
    if (vaiTroDanhGia) params.set("vaiTroDanhGia", vaiTroDanhGia);
    if (!isLanhDaoCuc && currentUser?.departmentId) params.set("phongBanId", currentUser.departmentId);
    return `/kPI_TongHopKetQuaTheoDoi?${params.toString()}`;
  }, [currentUser?.departmentId, idDot, isLanhDaoCuc, vaiTroDanhGia]);

  return (
    <div className="flex flex-col gap-4 mb-4">
      {isLanhDaoCuc && (
        <Card
          className="customCardShadow"
          title={<span className="text-white font-bold text-base uppercase">Tiến độ đánh giá toàn Cục</span>} headStyle={{ backgroundColor: "#0355a2", borderBottom: "none", borderRadius: "8px 8px 0 0" }}
          extra={
            <Space wrap onClick={(e) => e.stopPropagation()}>
              <Select
                size="middle"
                placeholder="Tất cả vai trò / Điểm trên phiếu"
                allowClear
                value={vaiTroDanhGia}
                onChange={(val) => setVaiTroDanhGia(val || undefined)}
                options={VAI_TRO_OPTIONS}
                style={{ width: 250 }}
              />
              <Select
                size="middle"
                placeholder="Chọn đợt đánh giá"
                value={idDot}
                onChange={(val) => setIdDot(val)}
                options={dotOptions.map((item: any) => ({
                  value: item.value?.toString() || "",
                  label: item.text || item.label,
                }))}
                style={{ width: 350 }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Space>
          }
          style={{ borderRadius: "12px", border: "none" }}
        >
          <Spin spinning={loading}>
            <div className="mb-2">

              <Row gutter={[16, 16]} className="mb-6" align="stretch">
                <Col xs={24} md={8}>
                  <div onClick={() => handleGlobalCardClick('ALL')} className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-4 rounded-xl flex flex-col shadow-sm h-full relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
                      <UserOutlined style={{ fontSize: 80 }} />
                    </div>
                    <div className="flex items-center mb-auto relative z-10">
                      <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-3 rounded-xl shadow-inner mr-4">
                        <UserOutlined style={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <div className="text-blue-800 font-bold uppercase tracking-wide text-sm">Tổng số nhân sự</div>
                        <div className="text-3xl font-extrabold text-slate-800 leading-none mt-1">{evalStats.total}</div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <div onClick={() => handleGlobalCardClick('EVALUATED')} className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4 rounded-xl flex flex-col shadow-sm h-full relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
                      <CheckCircleFilled style={{ fontSize: 80 }} />
                    </div>
                    <div className="flex items-center mb-3 relative z-10">
                      <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-3 rounded-xl shadow-inner mr-4">
                        <CheckCircleFilled style={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <div className="text-emerald-800 font-bold uppercase tracking-wide text-sm">Đã đánh giá</div>
                        <div className="text-3xl font-extrabold text-slate-800 leading-none mt-1">
                          {evalStats.evaluated}
                          <span className="text-base font-normal text-slate-500 ml-2">
                            ({evalStats.total > 0 ? Math.round((evalStats.evaluated / evalStats.total) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {Object.keys(evalStats.statuses).length > 0 && (
                      <div className="mt-auto pt-3 border-t border-emerald-100/60 relative z-10">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(evalStats.statuses).map(([st, count]) => {
                            const conf = trangThaiDict[st] || { label: st, color: 'default' };
                            return (
                              <Tag
                                color={conf.color}
                                key={st}
                                className="m-0 rounded-md border-0 px-2 py-0.5 font-medium shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={(e) => handleStatusClick(st, e)}
                              >
                                {conf.label}: <span className="font-bold">{count}</span>
                              </Tag>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </Col>

                <Col xs={24} md={8}>
                  <div onClick={() => handleGlobalCardClick('PENDING')} className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-4 rounded-xl flex flex-col shadow-sm h-full relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
                      <WarningFilled style={{ fontSize: 80 }} />
                    </div>
                    <div className="flex items-center mb-auto relative z-10">
                      <div className="bg-gradient-to-br from-rose-400 to-rose-600 text-white p-3 rounded-xl shadow-inner mr-4">
                        <WarningFilled style={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <div className="text-rose-800 font-bold uppercase tracking-wide text-sm">Chưa đánh giá</div>
                        <div className="text-3xl font-extrabold text-slate-800 leading-none mt-1">
                          {evalStats.pending}
                          <span className="text-base font-normal text-slate-500 ml-2">
                            ({evalStats.total > 0 ? Math.round((evalStats.pending / evalStats.total) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {evalStats.departments.length > 0 && (
                <Card title={<span className="text-white font-bold text-base uppercase">Chi tiết tiến độ đánh giá theo Phòng ban</span>} size="small" className="mb-6 shadow-sm border-slate-200" headStyle={{ backgroundColor: "#0355a2", borderBottom: "none", borderRadius: "8px 8px 0 0" }}>
                  <ConfigProvider theme={{ components: { Table: { headerBg: "#0355a2", headerColor: "#ffffff" } } }}>
                    <Table
                      dataSource={evalStats.departments}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      columns={[
                        { title: "Phòng ban", dataIndex: "name", key: "name", render: (text) => <Text strong className="text-[#0355a2]">{text}</Text> },
                        { title: "Tổng nhân sự", dataIndex: "total", key: "total", align: "center", width: 120, render: (val, record) => <span style={{ cursor: "pointer", color: "#0355a2", textDecoration: "underline" }} onClick={() => handleNumberClick(record, 'ALL')}>{val}</span> },
                        { title: "Đã đánh giá", dataIndex: "evaluated", key: "evaluated", align: "center", width: 120, render: (val, record) => <Tag color="success" className="w-full text-center text-sm" style={{ cursor: "pointer" }} onClick={() => handleNumberClick(record, 'EVALUATED')}>{val}</Tag> },
                        { title: "Chưa đánh giá", dataIndex: "pending", key: "pending", align: "center", width: 120, render: (val, record) => val > 0 ? <Tag color="error" className="w-full text-center text-sm" style={{ cursor: "pointer" }} onClick={() => handleNumberClick(record, 'PENDING')}>{val}</Tag> : <Text type="secondary">-</Text> },
                        {
                          title: "Tỷ lệ", key: "percent", width: 200, render: (_, record) => (
                            <Progress percent={record.total > 0 ? Math.round((record.evaluated / record.total) * 100) : 0} size="small" />
                          )
                        }
                      ]}
                    />
                  </ConfigProvider>
                </Card>
              )}
            </div>
          </Spin>
        </Card>
      )}

      <Card
        className="customCardShadow kpi-dashboard-card"
        headStyle={{ backgroundColor: "#0355a2", borderBottom: "none" }}
        title={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "white", fontWeight: "bold", textTransform: "uppercase", flexWrap: "wrap", gap: 12 }}>
            <span>Thống kê kết quả theo dõi, đánh giá KPI</span>
            <Space wrap onClick={(e) => e.stopPropagation()}>
              <Select
                size="middle"
                placeholder="Tất cả vai trò / Điểm trên phiếu"
                allowClear
                value={vaiTroDanhGia}
                onChange={(val) => setVaiTroDanhGia(val || undefined)}
                options={VAI_TRO_OPTIONS}
                style={{ width: 250, textTransform: "none", fontWeight: "normal" }}
              />
              <Select
                size="middle"
                placeholder="Chọn đợt đánh giá"
                value={idDot}
                onChange={(val) => setIdDot(val)}
                options={dotOptions.map((item: any) => ({
                  value: item.value?.toString() || "",
                  label: item.text || item.label,
                }))}
                style={{ width: 350, textTransform: "none", fontWeight: "normal" }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </Space>
          </div>
        }
        style={{ border: "1px solid #cbd5e1", background: "#f8fafc", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)" }}
        bodyStyle={{ padding: "20px", background: "#f8fafc" }}
      >
        <Spin spinning={loading}>
          {missingTaskSummary.people > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Tag
                color="orange"
                icon={<WarningFilled style={{ color: "#d46b08", fontSize: 16 }} />}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  maxWidth: "100%",
                  padding: "9px 14px",
                  whiteSpace: "normal",
                  lineHeight: 1.55,
                  color: "#ad4e00",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #fff7e6 0%, #fff1e6 100%)",
                  border: "1px solid #ffbb96",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(212, 107, 8, 0.14)",
                }}
              >
                Thiếu điểm nhiệm vụ của {vaiTroDanhGiaLabel}: {missingTaskSummary.outputs} đầu ra thuộc {missingTaskSummary.people} nhân sự. Các điểm thiếu được giữ trống.
              </Tag>
            </div>
          )}


          {chartData.length > 0 ? (
            <>
              <Row gutter={[24, 24]}>
                {/* Chart 1: Average Task Completion Rate (Tỷ lệ hoàn thành nhiệm vụ) */}
                <Col xs={24} lg={12}>
                  <Card
                    className="kpi-dashboard-card"
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 4, height: 18, borderRadius: 4, background: '#1d4ed8', display: 'inline-block', flexShrink: 0 }} />
                        <BarChartOutlined style={{ color: "#1d4ed8", fontSize: 16 }} />
                        <span style={{ color: "#1e3a8a", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                          {`Tỷ lệ hoàn thành nhiệm vụ theo ${isLanhDaoCuc ? "Phòng ban" : "Cá nhân"} (%)`}
                        </span>
                      </div>
                    }
                    size="small"
                    bordered={false}
                    headStyle={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderBottom: "1px solid #bfdbfe", padding: "14px 20px" }}
                    style={{ border: "1px solid #bfdbfe", background: "#ffffff", boxShadow: "0 4px 16px rgba(30, 58, 138, 0.06)" }}
                    bodyStyle={{ padding: "16px 16px 10px 16px" }}
                  >
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={top5Items}
                          margin={{ top: 30, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, (dataMax: number) => Math.max(100, Math.ceil(dataMax * 1.15))]} tick={{ fontSize: 12 }} />
                          <RechartsTooltip content={renderKpiTooltip} />
                          <Legend />
                          <Bar
                            dataKey="avgTyLe"
                            name="Tỷ lệ HT (%)"
                            fill="#0355a2"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                            onClick={handleBarClick}
                            style={{ cursor: 'pointer' }}
                          >
                            <LabelList
                              dataKey="avgTyLe"
                              position="top"
                              formatter={(val: any) => (val != null && val !== "" ? `${val}%` : "")}
                              style={{ fontSize: 13, fontWeight: 700, fill: "#0355a2" }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>

                {/* Chart 2: Average Common Criteria Points vs Actual Tasks Points */}
                <Col xs={24} lg={12}>
                  <Card
                    className="kpi-dashboard-card"
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 4, height: 18, borderRadius: 4, background: '#059669', display: 'inline-block', flexShrink: 0 }} />
                        <FundOutlined style={{ color: "#059669", fontSize: 16 }} />
                        <span style={{ color: "#065f46", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                          {`So sánh điểm Tiêu chí chung & Điểm thực tế theo ${isLanhDaoCuc ? "Phòng ban" : "Cá nhân"}`}
                        </span>
                      </div>
                    }
                    size="small"
                    bordered={false}
                    headStyle={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", borderBottom: "1px solid #bbf7d0", padding: "14px 20px" }}
                    style={{ border: "1px solid #bbf7d0", background: "#ffffff", boxShadow: "0 4px 16px rgba(6, 95, 70, 0.06)" }}
                    bodyStyle={{ padding: "16px 16px 10px 16px" }}
                  >
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <ComposedChart
                          data={chartData.slice(0, 10)} // Show up to 10 items
                          margin={{ top: 30, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, (dataMax: number) => Math.max(100, Math.ceil(dataMax * 1.15))]} tick={{ fontSize: 12 }} />
                          <RechartsTooltip content={renderKpiTooltip} />
                          <Legend />
                          <Bar
                            dataKey="avgThucTe"
                            name="Điểm thực tế (TB)"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                            onClick={handleBarClick}
                            style={{ cursor: 'pointer' }}
                          >
                            <LabelList
                              dataKey="avgThucTe"
                              position="top"
                              formatter={(val: any) => (val != null && val !== "" ? `${val}` : "")}
                              style={{ fontSize: 13, fontWeight: 700, fill: "#059669" }}
                            />
                          </Bar>
                          <Line
                            type="monotone"
                            dataKey="avgChung"
                            name="Điểm tiêu chí chung (TB)"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                          >
                            <LabelList
                              dataKey="avgChung"
                              position="top"
                              formatter={(val: any) => (val != null && val !== "" ? `${val}` : "")}
                              style={{ fontSize: 13, fontWeight: 700, fill: "#d97706" }}
                            />
                          </Line>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>

                {/* Chart 3: Tỷ lệ hoàn thành vs Cơ cấu điểm 70/30 */}
                <Col xs={24} lg={24}>
                  <Card
                    className="kpi-dashboard-card"
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 4, height: 18, borderRadius: 4, background: '#0284c7', display: 'inline-block', flexShrink: 0 }} />
                        <AreaChartOutlined style={{ color: "#0284c7", fontSize: 16 }} />
                        <span style={{ color: "#075985", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                          Phân tích Cơ cấu điểm (70/30) và Tỷ lệ hoàn thành (%) theo Cá nhân
                        </span>
                      </div>
                    }
                    size="small"
                    bordered={false}
                    headStyle={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", borderBottom: "1px solid #bae6fd", padding: "14px 20px" }}
                    style={{ border: "1px solid #bae6fd", background: "#ffffff", boxShadow: "0 4px 16px rgba(7, 89, 133, 0.06)" }}
                    bodyStyle={{ padding: "16px 16px 10px 16px" }}
                    extra={isLanhDaoCuc && (
                      <Select
                        value={selectedDeptIdForChart}
                        onChange={setSelectedDeptIdForChart}
                        style={{ width: 320 }}
                        placeholder="Chọn phòng ban"
                        options={data?.listPhongBan?.map((pb: any) => ({
                          value: pb.phongBanId,
                          label: pb.tenPhongBan
                        })) || []}
                      />
                    )}
                  >
                    <div style={{ width: '100%', height: 350 }}>
                      <ResponsiveContainer>
                        <ComposedChart
                          data={chartDataCaNhan.slice(0, 15)} // Show up to 15 items
                          margin={{ top: 30, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="left" domain={[0, (dataMax: number) => Math.max(100, Math.ceil(dataMax * 1.15))]} tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} />
                          <RechartsTooltip content={renderKpiTooltip} />
                          <Legend />
                          <Bar
                            yAxisId="right"
                            dataKey="diemQuyDoi"
                            stackId="points"
                            name="Điểm TC KQ thực hiện NV (Tối đa 70)"
                            fill="#10b981"
                            barSize={40}
                            onClick={handleBarClick}
                            style={{ cursor: 'pointer' }}
                          >
                            <LabelList
                              dataKey="diemQuyDoi"
                              position="inside"
                              formatter={(val: any) => (val && Number(val) > 0 ? `${val}` : "")}
                              style={{ fontSize: 13, fontWeight: 700, fill: "#ffffff" }}
                            />
                          </Bar>
                          <Bar
                            yAxisId="right"
                            dataKey="avgChung"
                            stackId="points"
                            name="Điểm Tiêu chí chung (Tối đa 30)"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                            onClick={handleBarClick}
                            style={{ cursor: 'pointer' }}
                          >
                            <LabelList
                              dataKey="avgChung"
                              position="insideBottom"
                              offset={10}
                              formatter={(val: any) => (val && Number(val) > 0 ? `${val}` : "")}
                              style={{ fontSize: 13, fontWeight: 700, fill: "#ffffff" }}
                            />
                          </Bar>
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="avgTyLe"
                            name="Tỷ lệ HT (%)"
                            stroke="#0355a2"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                          >
                            <LabelList
                              dataKey="avgTyLe"
                              // Keep the rate above its marker while the stacked-bar value sits at the segment bottom.
                              position="top"
                              offset={12}
                              formatter={(val: any) => (val != null && val !== "" ? `${val}%` : "")}
                              style={{ fontSize: 13, fontWeight: 700, fill: "#0355a2" }}
                            />
                          </Line>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>

                {/* Chart 4: Phân bố Xếp loại / Điểm số */}
                {!isLanhDaoCuc && distributionData.scoreData.length > 0 && (
                  <Col xs={24} lg={12}>
                    <Card
                      className="kpi-dashboard-card"
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 4, height: 18, borderRadius: 4, background: '#d97706', display: 'inline-block', flexShrink: 0 }} />
                          <PieChartOutlined style={{ color: "#d97706", fontSize: 16 }} />
                          <span style={{ color: "#92400e", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                            Phân bố Điểm số nhân sự trong phòng
                          </span>
                        </div>
                      }
                      size="small"
                      bordered={false}
                      headStyle={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", borderBottom: "1px solid #fde68a", padding: "14px 20px" }}
                      style={{ border: "1px solid #fde68a", background: "#ffffff", boxShadow: "0 4px 16px rgba(146, 64, 14, 0.06)" }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <div style={{ width: '100%', height: 360, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                            <Pie
                              data={distributionData.scoreData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={renderCustomScorePieLabel}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              onClick={handleScorePieClick}
                              style={{ cursor: 'pointer' }}
                            >
                              {distributionData.scoreData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value) => [value, "Số lượng nhân sự"]} />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 10 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </Col>
                )}

                {/* Chart 5: Trạng thái tiến độ đánh giá */}
                {!isLanhDaoCuc && distributionData.statusData.length > 0 && (
                  <Col xs={24} lg={12}>
                    <Card
                      className="kpi-dashboard-card"
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 4, height: 18, borderRadius: 4, background: '#7c3aed', display: 'inline-block', flexShrink: 0 }} />
                          <CheckCircleOutlined style={{ color: "#7c3aed", fontSize: 16 }} />
                          <span style={{ color: "#5b21b6", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                            Tiến độ nộp và Duyệt phiếu đánh giá
                          </span>
                        </div>
                      }
                      size="small"
                      bordered={false}
                      headStyle={{ background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)", borderBottom: "1px solid #e9d5ff", padding: "14px 20px" }}
                      style={{ border: "1px solid #e9d5ff", background: "#ffffff", boxShadow: "0 4px 16px rgba(91, 33, 182, 0.06)" }}
                      bodyStyle={{ padding: "16px" }}
                    >
                      <div style={{ width: '100%', height: 360, display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                            <Pie
                              data={distributionData.statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={80}
                              labelLine={true}
                              label={renderCustomStatusPieLabel}
                              fill="#8884d8"
                              paddingAngle={4}
                              dataKey="value"
                              onClick={handleStatusPieClick}
                              style={{ cursor: 'pointer' }}
                            >
                              {distributionData.statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value) => [value, "Số phiếu"]} />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 10 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>

              {summaryTableData.length > 0 && (
                <div style={{ marginTop: 32 }}>
                  <KpiSummaryTable
                    dataSource={summaryTableData}
                    summaryDataSource={allSummaryPersonnel}
                    currentUserLyLichId={currentUser?.idLyLich}
                    showFullReportLink={true}
                    defaultExpandAllRows={false}
                    missingTaskRoleLabel={vaiTroDanhGia ? vaiTroDanhGiaLabel : undefined}
                    title={
                      <div className="flex items-center justify-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 4, height: 18, borderRadius: 4, background: '#0355a2', display: 'inline-block', flexShrink: 0 }} />
                          <TableOutlined style={{ color: "#0355a2", fontSize: 16 }} />
                          <span style={{ color: "#1e3a8a", fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>
                            {isLanhDaoCuc
                              ? `BẢNG TỔNG HỢP KẾT QUẢ THEO DÕI, ĐÁNH GIÁ CẤP CỤC${data?.tenDonViSuDung ? ` (${data.tenDonViSuDung.toUpperCase()})` : ""}`
                              : `BẢNG TỔNG HỢP KẾT QUẢ THEO DÕI, ĐÁNH GIÁ CẤP PHÒNG BAN${data?.tenPhongBan ? ` (${data.tenPhongBan.toUpperCase()})` : ""}`}
                          </span>
                        </div>
                        <Link href={fullReportHref}>
                          <Button type="link" style={{ color: "#0355a2", padding: 0 }} className="font-semibold underline">
                            Xem chi tiết báo cáo đầy đủ &rarr;
                          </Button>
                        </Link>
                      </div>
                    }
                    onViewDetail={(record) => {
                      setDetailItem({
                        idLyLich: record.lyLichId,
                        idPhieuDanhGia: record.idPhieuDanhGia,
                        idDotDanhGia: idDot,
                        tenChuPhieu: record.tenNhanSu,
                        tenDotDanhGia: dotOptions.find((d: any) => d.value == idDot)?.label || "Đợt đánh giá",
                        fallbackDiemTieuChiChung: record.diemTieuChiChung,
                        fallbackDiemThucHienNhiemVu: record.diemTieuChiKetQuaNV_TheoThang,
                        fallbackTongDiem: (record.diemTieuChiChung || 0) + (record.diemTieuChiKetQuaNV_TheoThang || 0),
                      });
                      setIsDetailVisible(true);
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty description="Không có dữ liệu đánh giá cho đợt này" style={{ margin: '40px 0' }} />
          )}
        </Spin>

        {/* Modal chi tiết */}
        <Modal
          title={`Chi tiết: ${selectedDepartment?.name || ""}`}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={1200}
          destroyOnClose
        >
          <ConfigProvider theme={{ components: { Table: { headerBg: "#0355a2", headerColor: "#ffffff" } } }}>
            <Table
              dataSource={departmentDetails}
              columns={modalColumns}
              rowKey={(record) => record.lyLichId || Math.random().toString()}
              rowClassName={(record) => record.lyLichId === currentUser?.idLyLich ? "bg-blue-50" : ""}
              loading={loadingDetails}
              pagination={{
                current: modalPage,
                pageSize: modalPageSize,
                pageSizeOptions: [10, 20, 50, 100],
                showSizeChanger: true,
                onChange: (page, pageSize) => {
                  setModalPage(page);
                  setModalPageSize(pageSize);
                },
              }}
              bordered
              size="middle"
            />
          </ConfigProvider>
        </Modal>

        {/* Modal chi tiết phiếu đánh giá cá nhân */}
        {isDetailVisible && (
          <KPI_PhieuDanhGiaDetail
            item={detailItem}
            onClose={() => setIsDetailVisible(false)}
          />
        )}
      </Card>
    </div>
  );
}
