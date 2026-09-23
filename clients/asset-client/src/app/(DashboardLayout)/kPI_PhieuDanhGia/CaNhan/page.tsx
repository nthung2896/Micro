"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Flex from "@/components/shared-components/Flex";
import { ResponsePageList } from "@/types/general";
import withAuthorization from "@/libs/authentication";
import { setIsLoading } from "@/store/general/GeneralSlice";
import { useSelector } from "@/store/hooks";
import { AppDispatch } from "@/store/store";
import * as extensions from "@/utils/extensions";
import {
  ApartmentOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  RollbackOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  FormProps,
  MenuProps,
  Modal,
  Pagination,
  Space,
  Table,
  TableProps,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_PhieuDanhGiaDetail from "../detail";
import Search from "../search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_PhieuDanhGiaSearchType,
} from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import ChonNguoiXuLyModal from "../ChonNguoiXuLyModal";
import LichSuXuLyModal from "../LichSuXuLyModal";
import ModalXemToanBoTieuChi from "../../kPI_BieuChamDiem/ModalXemToanBoTieuChi";

const formatExcelScore = (value: unknown) => {
  if (value == null || value === "") return "-";
  const numberValue = Number(value);
  return Number.isFinite(numberValue)
    ? numberValue.toFixed(2).replace(/\.00$/, "")
    : String(value);
};

const formatExcelDate = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("vi-VN");
};

const getExcelTrangThaiPhieu = (trangThai?: string) => {
  const labels: Record<string, string> = {
    KhoiTao: "Khởi tạo",
    GuiPhoTruongPhong: "Chờ Phó Trưởng phòng duyệt",
    GuiPhoVuTruong: "Chờ Phó Vụ trưởng duyệt",
    GuiVuTruong: "Chờ Vụ trưởng duyệt",
    GuiTruongPhong: "Chờ Trưởng phòng duyệt",
    GuiPhoCucTruong: "Chờ Phó Cục trưởng duyệt",
    GuiCucTruong: "Chờ Cục trưởng duyệt",
    GuiPhoGiamDocTT: "Chờ Phó Giám đốc TT duyệt",
    GuiGiamDocTT: "Chờ Giám đốc TT duyệt",
    GuiPhoChanhVanPhong: "Chờ Phó Chánh Văn phòng duyệt",
    GuiChanhVanPhong: "Chờ Chánh Văn phòng duyệt",
    DaDuyet: "Đã duyệt",
    TuChoi: "Từ chối",
    TraVe: "Trả về",
    ThuHoi: "Thu hồi",
  };
  return trangThai ? labels[trangThai] || trangThai : "Chưa tạo phiếu";
};


const KPI_PhieuDanhGiaPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.User);
  const [data, setData] = useState<ResponsePageList<any>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const requestedTab = searchParams.get("tab");
  const initialTab = requestedTab === "choXuLy" || requestedTab === "daDuyet"
    ? requestedTab
    : "danhGiaTheoDot";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [counts, setCounts] = useState<{
    danhGiaTheoDot: number;
    choXuLy: number;
    daXuLy: number;
    daDuyet: number;
  }>({
    danhGiaTheoDot: 0,
    choXuLy: 0,
    daXuLy: 0,
    daDuyet: 0,
  });
  const [searchValues, setSearchValues] = useState<KPI_PhieuDanhGiaSearchType | null>(
    null
  );
  const loading = useSelector((state: any) => state.general.isLoading);
  const [currentItem, setCurentItem] = useState<any | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [toanBoTieuChiVisible, setToanBoTieuChiVisible] = useState(false);
  const [selectedDotDanhGiaTieuChi, setSelectedDotDanhGiaTieuChi] = useState<string | null>(null);
  const [selectedDonViId, setSelectedDonViId] = useState<string | null>(null);
  const [selectedIdLyLich, setSelectedIdLyLich] = useState<string | null>(null);

  const [workflowModalState, setWorkflowModalState] = useState<{
    visible: boolean;
    idPhieuDanhGia: string;
    chucVuNguoiXuLy?: string | null;
    tenButton: string;
    canChonNguoiXuLy?: boolean;
    isTuChoi?: boolean;
  }>({
    visible: false,
    idPhieuDanhGia: "",
    chucVuNguoiXuLy: "",
    tenButton: "",
    canChonNguoiXuLy: true,
    isTuChoi: false,
  });

  const [lichSuModalState, setLichSuModalState] = useState<{
    visible: boolean;
    idPhieuDanhGia: string | null;
  }>({
    visible: false,
    idPhieuDanhGia: null,
  });

  const handleWorkflowSubmit = async (idNguoiXuLy: string, ghiChu?: string) => {
    if (!user?.id) return;
    if (!workflowModalState.idPhieuDanhGia) {
      toast.warning("Chưa tạo phiếu đánh giá. Vui lòng bấm 'Tạo phiếu' trước khi gửi!");
      return;
    }
    try {
      dispatch(setIsLoading(true));
      const response = await kPI_PhieuDanhGiaService.chuyenBuocLuong({
        idPhieuDanhGia: workflowModalState.idPhieuDanhGia,
        idNguoiGui: user.id,
        idNguoiXuLy: idNguoiXuLy || undefined,
        ghiChu,
        isTuChoi: workflowModalState.isTuChoi,
      });
      if (response && response.status) {
        toast.success(
          workflowModalState.isTuChoi
            ? "Từ chối phiếu đánh giá thành công!"
            : "Chuyển bước luồng thành công!"
        );
        setWorkflowModalState((prev) => ({ ...prev, visible: false }));
        handleLoadData();
      } else {
        toast.error(response?.message || "Đã xảy ra lỗi khi thực hiện thao tác.");
      }
    } catch (error: any) {
      console.error("Lỗi khi xử lý luồng:", error);
      toast.error(error?.message || "Đã xảy ra lỗi hệ thống.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const renderTrangThaiPhieu = (trangThai?: string) => {
    const tagStyle = { borderRadius: "12px", padding: "2px 10px", fontSize: "13px" };
    if (!trangThai) return <Tag color="default" style={tagStyle}>Chưa tạo phiếu</Tag>;
    switch (trangThai) {
      case "KhoiTao":
        return <Tag color="processing" style={tagStyle}>Khởi tạo</Tag>;
      case "GuiPhoTruongPhong":
        return <Tag color="warning" style={tagStyle}>Chờ Phó Trưởng phòng duyệt</Tag>;
      case "GuiPhoVuTruong":
        return <Tag color="warning" style={tagStyle}>Chờ Phó Vụ trưởng duyệt</Tag>;
      case "GuiVuTruong":
        return <Tag color="purple" style={tagStyle}>Chờ Vụ trưởng duyệt</Tag>;
      case "GuiTruongPhong":
        return <Tag color="warning" style={tagStyle}>Chờ Trưởng phòng duyệt</Tag>;
      case "GuiPhoCucTruong":
        return <Tag color="purple" style={tagStyle}>Chờ Phó Cục trưởng duyệt</Tag>;
      case "GuiCucTruong":
        return <Tag color="purple" style={tagStyle}>Chờ Cục trưởng duyệt</Tag>;
      case "GuiPhoGiamDocTT":
        return <Tag color="warning" style={tagStyle}>Chờ Phó Giám đốc TT duyệt</Tag>;
      case "GuiGiamDocTT":
        return <Tag color="purple" style={tagStyle}>Chờ Giám đốc TT duyệt</Tag>;
      case "GuiPhoChanhVanPhong":
        return <Tag color="warning" style={tagStyle}>Chờ Phó Chánh Văn phòng duyệt</Tag>;
      case "GuiChanhVanPhong":
        return <Tag color="purple" style={tagStyle}>Chờ Chánh Văn phòng duyệt</Tag>;
      case "DaDuyet":
        return <Tag color="success" style={tagStyle} icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
      case "TuChoi":
        return <Tag color="error" style={tagStyle} icon={<CloseCircleOutlined />}>Từ chối</Tag>;
      case "TraVe":
        return <Tag color="error" style={tagStyle} icon={<RollbackOutlined />}>Trả về</Tag>;
      case "ThuHoi":
        return <Tag color="error" style={tagStyle} icon={<RollbackOutlined />}>Thu hồi</Tag>;
      default:
        return <Tag color="default" style={tagStyle}>{trangThai}</Tag>;
    }
  };

  const tableColumns: TableProps<any>["columns"] = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên đợt đánh giá",
      dataIndex: "tenDotDanhGia",
      width: 180,
      render: (_: any, record: any) => {
        let trangThaiTag = null;
        if (record.trangThaiDot === "ACTIVE" || record.trangThaiDot === "Đang hoạt động") {
          trangThaiTag = (
            <Tag color="success" style={{ borderRadius: "12px", padding: "0 8px", fontSize: "12px", marginTop: "4px" }} icon={<CheckCircleOutlined />}>
              Đang hoạt động
            </Tag>
          );
        } else if (record.trangThaiDot === "CLOSED" || record.trangThaiDot === "Đã đóng/Kết thúc") {
          trangThaiTag = (
            <Tag color="default" style={{ borderRadius: "12px", padding: "0 8px", fontSize: "12px", marginTop: "4px" }} icon={<CloseCircleOutlined />}>
              Đã đóng/Kết thúc
            </Tag>
          );
        } else {
          trangThaiTag = (
            <Tag color="default" style={{ borderRadius: "12px", padding: "0 8px", fontSize: "12px", marginTop: "4px" }}>
              {record.trangThaiDot || "Chưa xác định"}
            </Tag>
          );
        }
        return (
          <Space direction="vertical" size={2}>
            <span style={{ fontWeight: 500 }}>{record.tenDotDanhGia}</span>
            {trangThaiTag}
          </Space>
        );
      },
    },
    {
      title: "Bộ tiêu chí",
      dataIndex: "boTieuChi",
      width: 320,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={8} style={{ width: "100%", padding: "4px 0" }}>
          <div style={{ fontSize: "13px", display: "flex", alignItems: "flex-start", gap: 6 }}>
            <strong style={{ whiteSpace: "nowrap" }}>Chung:</strong> 
            {record.tenBoTieuChiChung ? (
              <Tag 
                color="cyan" 
                style={{ borderRadius: "12px", padding: "2px 8px", cursor: "pointer", fontSize: "12px", whiteSpace: "normal", height: "auto", margin: 0, borderStyle: "dashed" }} 
                onClick={() => { setSelectedDotDanhGiaTieuChi(record.idDotDanhGia); setSelectedIdLyLich(record.idLyLich); setSelectedDonViId(record.idDonVi); setToanBoTieuChiVisible(true); }}
              >
                {record.tenBoTieuChiChung}
              </Tag>
            ) : <span>-</span>}
          </div>
          <div style={{ fontSize: "13px", display: "flex", alignItems: "flex-start", gap: 6 }}>
            <strong style={{ whiteSpace: "nowrap" }}>Nhiệm vụ:</strong> 
            {record.tenBoTieuChiNhiemVu ? (
              <Tag 
                color="processing" 
                style={{ borderRadius: "12px", padding: "2px 8px", cursor: "pointer", fontSize: "12px", whiteSpace: "normal", height: "auto", margin: 0, borderStyle: "dashed" }} 
                onClick={() => { setSelectedDotDanhGiaTieuChi(record.idDotDanhGia); setSelectedIdLyLich(record.idLyLich); setSelectedDonViId(record.idDonVi); setToanBoTieuChiVisible(true); }}
              >
                {record.tenBoTieuChiNhiemVu}
              </Tag>
            ) : <span>-</span>}
          </div>
        </Space>
      )
    },
    {
      title: "Chủ phiếu",
      dataIndex: "tenChuPhieu",
      key: "tenChuPhieu",
      width: 150,
      render: (_: any, record: any) => (
        <div style={{ padding: "4px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontWeight: 600, color: "#0355a2", fontSize: "14px" }}>
              {record.tenChuPhieu || (record.idLyLich ? "Cán bộ đánh giá" : "-")}
            </span>
            {record.chucVuChuPhieu && (
              <Tag color="blue" style={{ margin: 0, borderRadius: "4px", fontSize: "11px", fontWeight: 500 }}>
                {record.chucVuChuPhieu}
              </Tag>
            )}
          </div>
          {(record.donViChuPhieu || record.phongBanChuPhieu) && (
            <div
              style={{
                fontSize: "12px",
                color: "#555",
                backgroundColor: "#f9fafb",
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #eaeaea",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {record.donViChuPhieu && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, color: "#333" }}>
                  <BankOutlined style={{ color: "#1890ff" }} />
                  <span>{record.donViChuPhieu}</span>
                </div>
              )}
              {record.phongBanChuPhieu && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    paddingLeft: record.donViChuPhieu ? "14px" : "0px",
                    color: "#555",
                  }}
                >
                  <ApartmentOutlined style={{ color: "#52c41a" }} />
                  <span
                    style={{
                      backgroundColor: "#fff",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      border: "1px solid #e8e8e8",
                    }}
                  >
                    {record.phongBanChuPhieu}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "thoiGian",
      width: 120,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={2}>
          <div style={{ fontSize: "13px" }}>
            <span style={{ color: "#8c8c8c" }}>Bắt đầu: </span>
            <span style={{ fontWeight: 500 }}>{record.thoiGianBatDau ? new Date(record.thoiGianBatDau).toLocaleDateString("vi-VN") : "-"}</span>
          </div>
          <div style={{ fontSize: "13px" }}>
            <span style={{ color: "#8c8c8c" }}>Kết thúc: </span>
            <span style={{ fontWeight: 500 }}>{record.thoiGianKetThuc ? new Date(record.thoiGianKetThuc).toLocaleDateString("vi-VN") : "-"}</span>
          </div>
        </Space>
      ),
    },


    {
      title: "Kết quả điểm",
      key: "ketQuaDiem",
      width: 140,
      render: (_: any, record: any) => {
        if (!record.daDanhGia) return <span style={{ color: "#999" }}>-</span>;
        return (
          <Space direction="vertical" size={2} style={{ display: "flex" }}>
            <div style={{ fontSize: "13px" }}>
              Điểm nhiệm vụ: <span style={{ fontWeight: 600, color: "#0355a2" }}>
                {record.diemThucHienNhiemVu != null 
                  ? Number(record.diemThucHienNhiemVu).toFixed(2).replace(/\.00$/, '') 
                  : (record.tongDiem != null && record.diemTieuChiChung != null) 
                    ? Number(record.tongDiem - record.diemTieuChiChung).toFixed(2).replace(/\.00$/, '') 
                    : "-"}
              </span>
            </div>
            <div style={{ fontSize: "13px" }}>
              Điểm tiêu chí chung: <span style={{ fontWeight: 600, color: "#0891b2" }}>{record.diemTieuChiChung != null ? Number(record.diemTieuChiChung).toFixed(2).replace(/\.00$/, '') : "-"}</span>
            </div>
            <div style={{ fontSize: "13px", marginTop: "2px" }}>
              <Tag color="purple" style={{ fontWeight: 700, margin: 0 }}>
                Tổng: {record.tongDiem != null ? Number(record.tongDiem).toFixed(2).replace(/\.00$/, '') : "-"}
              </Tag>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Trạng thái phiếu",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 120,
      render: (_: any, record: any) => renderTrangThaiPhieu(record.trangThai),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 110,
      render: (_: any, record: any) => {
        const items: MenuProps["items"] = [
          {
            label: "Xem phiếu",
            key: "1",
            icon: <EyeOutlined />,
            onClick: () => {
              if (record.idPhieuDanhGia) {
                setCurentItem({ ...record, viewMode: activeTab === "choXuLy" ? (record.viewMode || "PhoTruongPhong") : "CaNhan" });
                setIsOpenDetail(true);
              } else {
                toast.warning("Phiếu chưa được đánh giá");
              }
            },
          },
        ];

        const isKhoiTaoOrTraVe = !record.trangThai || record.trangThai === "KhoiTao" || record.trangThai === "TraVe";

        // Chỉ khi ở tab đầu tiên (danhGiaTheoDot) hoặc tab choXuLy và trạng thái Khởi tạo/Trả về thì mới được chỉnh sửa / hiển thị button Phiếu đánh giá
        const canEdit = (activeTab === "danhGiaTheoDot" || activeTab === "choXuLy") && isKhoiTaoOrTraVe;
        if (canEdit) {
          // items.push({
          //   label: "Phiếu đánh giá",
          //   key: "2",
          //   icon: <EditOutlined />,
          //   onClick: () => {
          //     if (record.idPhieuDanhGia) {
          //       router.push(`/kPI_PhieuDanhGia/DanhGia/${record.idDotDanhGia}?idPhieu=${record.idPhieuDanhGia}`);
          //     } else {
          //       router.push(`/kPI_PhieuDanhGia/DanhGia/${record.idDotDanhGia}`);
          //     }
          //   },
          // });
          items.push({
            label: <span style={{ color: "#10b981", fontWeight: "500" }}>Phiếu đánh giá</span>,
            key: "2_2",
            icon: <EditOutlined style={{ color: "#10b981" }} />,
            onClick: () => {
              if (record.idPhieuDanhGia) {
                router.push(`/kPI_PhieuDanhGia/DanhGia2/${record.idDotDanhGia}?idPhieu=${record.idPhieuDanhGia}&idDotDanhGia=${record.idDotDanhGia}&idPhieuDanhGia=${record.idPhieuDanhGia}`);
              } else {
                router.push(`/kPI_PhieuDanhGia/DanhGia2/${record.idDotDanhGia}?idDotDanhGia=${record.idDotDanhGia}`);
              }
            },
          });
        }

        const canShowButtonLuong =
          record.isShowButton &&
          record.buttonLuong &&
          record.daDanhGia &&
          !!record.idPhieuDanhGia;

        if (canShowButtonLuong) {
          items.push({
            label: record.buttonLuong.tenButton,
            key: "action_next",
            icon: record.buttonLuong.canChonNguoiXuLy ? <SendOutlined style={{ color: "#1890ff" }} /> : <CheckCircleOutlined style={{ color: "green" }} />,
            onClick: () => {
              if (!record.idPhieuDanhGia || !record.daDanhGia) {
                toast.warning("Vui lòng tạo phiếu đánh giá trước khi gửi!");
                return;
              }
              setWorkflowModalState({
                visible: true,
                idPhieuDanhGia: record.idPhieuDanhGia,
                chucVuNguoiXuLy: record.buttonLuong?.chucVuNguoiXuLy,
                tenButton: record.buttonLuong?.tenButton || "Xử lý phiếu",
                canChonNguoiXuLy: record.buttonLuong?.canChonNguoiXuLy ?? true,
                isTuChoi: false,
              });
            },
          });
        }

        if (activeTab === "choXuLy" && record.isShowButton && record.trangThai && !isKhoiTaoOrTraVe) {
          items.push({
            label: "Trả về",
            key: "action_return",
            icon: <RollbackOutlined style={{ color: "#faad14" }} />,
            danger: true,
            onClick: () => {
              setWorkflowModalState({
                visible: true,
                idPhieuDanhGia: record.idPhieuDanhGia || "",
                chucVuNguoiXuLy: null,
                tenButton: "Trả về phiếu đánh giá",
                canChonNguoiXuLy: false,
                isTuChoi: true,
              });
            },
          });
        }

        if (record.idPhieuDanhGia) {
          items.push({
            label: "Quá trình xử lý",
            key: "action_history",
            icon: <HistoryOutlined style={{ color: "#1890ff" }} />,
            onClick: () => {
              setLichSuModalState({
                visible: true,
                idPhieuDanhGia: record.idPhieuDanhGia,
              });
            },
          });
        }

        return (
          <Space size="small">
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button onClick={(e) => e.preventDefault()} type="default" >
                <Space>
                  Thao tác
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];


  const styledColumns = useMemo(
    () =>
      tableColumns.map((col) => ({
        ...col,
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#0355a2",
            color: "#ffffff",
            fontWeight: 600,
            textAlign: "center" as any,
          },
        }),
      })),
    [tableColumns]
  );

  const excelColumns = useMemo(
    () => [
      {
        title: "Tên đợt đánh giá",
        key: "tenDotDanhGia",
        dataIndex: "tenDotDanhGia",
        width: 180,
        exportRender: (value: unknown) => value || "-",
      },
      {
        title: "Bộ tiêu chí chung",
        key: "tenBoTieuChiChung",
        dataIndex: "tenBoTieuChiChung",
        width: 220,
        exportRender: (value: unknown) => value || "-",
      },
      {
        title: "Bộ tiêu chí nhiệm vụ",
        key: "tenBoTieuChiNhiemVu",
        dataIndex: "tenBoTieuChiNhiemVu",
        width: 260,
        exportRender: (value: unknown) => value || "-",
      },
      {
        title: "Chủ phiếu",
        key: "chuPhieu",
        width: 190,
        exportRender: (_: unknown, record: any) =>
          record.tenChuPhieu || (record.idLyLich ? "Cán bộ đánh giá" : "-"),
      },
      {
        title: "Thời gian bắt đầu",
        key: "thoiGianBatDau",
        dataIndex: "thoiGianBatDau",
        width: 130,
        exportRender: (value: unknown) => formatExcelDate(value),
      },
      {
        title: "Thời gian kết thúc",
        key: "thoiGianKetThuc",
        dataIndex: "thoiGianKetThuc",
        width: 130,
        exportRender: (value: unknown) => formatExcelDate(value),
      },
      {
        title: "Điểm nhiệm vụ",
        key: "diemThucHienNhiemVu",
        width: 110,
        exportRender: (_: unknown, record: any) =>
          formatExcelScore(
            record.diemThucHienNhiemVu != null
              ? record.diemThucHienNhiemVu
              : record.tongDiem != null && record.diemTieuChiChung != null
                ? Number(record.tongDiem) - Number(record.diemTieuChiChung)
                : null
          ),
      },
      {
        title: "Điểm tiêu chí chung",
        key: "diemTieuChiChung",
        dataIndex: "diemTieuChiChung",
        width: 130,
        exportRender: (value: unknown) => formatExcelScore(value),
      },
      {
        title: "Điểm tổng",
        key: "tongDiem",
        dataIndex: "tongDiem",
        width: 100,
        exportRender: (value: unknown) => formatExcelScore(value),
      },
      {
        title: "Trạng thái phiếu",
        key: "trangThai",
        dataIndex: "trangThai",
        width: 135,
        exportRender: (value: unknown) => getExcelTrangThaiPhieu(value as string),
      },
    ],
    []
  );

  const currentTabFilter = useMemo(() => {
    if (activeTab === "danhGiaTheoDot") {
      return { idLyLich: user?.idLyLich || "" };
    }
    if (activeTab === "choXuLy") {
      return { idNguoiXuLy: user?.id, isXuLy: false, isKhacHoanThanh: true };
    }
    if (activeTab === "daXuLy") {
      return { idNguoiXuLy: user?.id, isXuLy: true, isKhacHoanThanh: true };
    }
    if (activeTab === "daDuyet") {
      return { idNguoiXuLy: user?.id, isXuLy: true, isKhacHoanThanh: false };
    }
    return {};
  }, [activeTab, user?.id, user?.idLyLich]);

  const handleDelete = async () => {
    const response = await kPI_PhieuDanhGiaService.delete(confirmDeleteId ?? "");
    if (response.status) {
      toast.success("Xóa thành công");
      handleLoadData();
    }
    setConfirmDeleteId(null);
  };

  const toggleSearch = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const onFinishSearch: FormProps<KPI_PhieuDanhGiaSearchType>["onFinish"] = async (
    values
  ) => {
    try {
      setSearchValues(values);
      await handleLoadData(values);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
    }
  };

  const fetchTabCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const baseSearch = {
        ...(searchValues || {}),
        idLyLich: user.idLyLich,
        pageIndex: 1,
        pageSize: 1,
      };
      const [resDot, resTabCounts] = await Promise.all([
        kPI_PhieuDanhGiaService.getDotDanhGiaWithPhieu(user.id, baseSearch),
        kPI_PhieuDanhGiaService.getTabCounts(user.id, searchValues || {}),
      ]);
      setCounts({
        danhGiaTheoDot: resDot?.data?.totalCount || 0,
        choXuLy: resTabCounts?.data?.choXuLy || 0,
        daXuLy: resTabCounts?.data?.daXuLy || 0,
        daDuyet: resTabCounts?.data?.daDuyet || 0,
      });
    } catch (error) {
      console.error("Lỗi khi tải số lượng tab:", error);
    }
  }, [user?.id, user?.idLyLich, searchValues]);

  const handleLoadData = useCallback(
    async (searchDataOverride?: KPI_PhieuDanhGiaSearchType) => {
      dispatch(setIsLoading(true));

      let tabFilter: any = {};
      if (activeTab === "danhGiaTheoDot") {
        tabFilter = {
          idLyLich: user?.idLyLich || "",
        };
      } else if (activeTab === "choXuLy") {
        tabFilter = {
          idNguoiXuLy: user?.id,
          isXuLy: false,
          isKhacHoanThanh: true,
        };
      } else if (activeTab === "daXuLy") {
        tabFilter = {
          idNguoiXuLy: user?.id,
          isXuLy: true,
          isKhacHoanThanh: true,
        };
      } else if (activeTab === "daDuyet") {
        tabFilter = {
          idNguoiXuLy: user?.id,
          isXuLy: true,
          isKhacHoanThanh: false,
        };
      }
      const searchData = {
        pageIndex,
        pageSize,
        ...(searchValues || {}),
        ...tabFilter,
        ...(searchDataOverride || {}),
      };

      if (user?.id) {
        const response = await kPI_PhieuDanhGiaService.getDotDanhGiaWithPhieu(user.id, searchData);
        if (response != null && response.data != null) {
          const data = response.data;
          setData(data);
        }
        fetchTabCounts();
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues, user?.id, activeTab, fetchTabCounts]
  );

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        className="mb-2 "
      >
        <AutoBreadcrumb />
        <div style={{ paddingLeft: 15 }} className="btn-group">
          <Button
            onClick={() => toggleSearch()}
            type="primary"

            icon={isPanelVisible ? <CloseOutlined /> : <SearchOutlined />}
          >
            {isPanelVisible ? "Ẩn tìm kiếm" : "Tìm kiếm"}
          </Button>
        </div>
      </Flex>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onlyDotFilter
          columns={excelColumns}
          extraFilter={currentTabFilter}
          colorExcelHeader
        />
      )}
      {isOpenDetail && (
        <KPI_PhieuDanhGiaDetail item={currentItem} onClose={handleCloseDetail} />
      )}

      {confirmDeleteId && (
        <Modal
          title="Xác nhận xóa"
          open={true}
          onOk={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa mục này?</p>
        </Modal>
      )}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setPageIndex(1);
        }}
        items={[
          {
            key: "danhGiaTheoDot",
            label: (
              <Tooltip placement="top" title="Danh sách các đợt đánh giá áp dụng cho cá nhân để thực hiện lập phiếu và tự chấm điểm.">
                <Space>
                  <span style={{ fontWeight: 600 }}>Đánh giá theo đợt</span>
                  <Tag color="orange" style={{ borderRadius: "10px", fontWeight: "bold" }}>
                    {counts.danhGiaTheoDot}
                  </Tag>
                </Space>
              </Tooltip>
            ),
          },
          {
            key: "choXuLy",
            label: (
              <Space>
                <span style={{ fontWeight: 600 }}>Chờ xử lý</span>
                <Tag color="error" style={{ borderRadius: "10px", fontWeight: "bold" }}>
                  {counts.choXuLy}
                </Tag>
              </Space>
            ),
          },
          {
            key: "daXuLy",
            label: (
              <Space>
                <span style={{ fontWeight: 600 }}>Đã xử lý</span>
                <Tag color="processing" style={{ borderRadius: "10px", fontWeight: "bold" }}>
                  {counts.daXuLy}
                </Tag>
              </Space>
            ),
          },
          {
            key: "daDuyet",
            label: (
              <Space>
                <span style={{ fontWeight: 600 }}>Đã duyệt</span>
                <Tag color="success" style={{ borderRadius: "10px", fontWeight: "bold" }}>
                  {counts.daDuyet}
                </Tag>
              </Space>
            ),
          },
        ]}
        className="mt-2"
      />
      <Card className={"customCardShadow"}>
        <div className="table-responsive">
          <Table
            columns={styledColumns}
            bordered
            dataSource={data?.items}
            rowKey="id"
            scroll={{ x: "max-content" }}
            pagination={false}
            loading={loading}
          />
        </div>
        <Pagination
          className="mt-2"
          total={data?.totalCount}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} trong ${total} dữ liệu`
          }
          pageSize={pageSize}
          defaultCurrent={1}
          onChange={(e) => {
            setPageIndex(e);
          }}
          onShowSizeChange={(current, pageSize) => {
            setPageIndex(current);
            setPageSize(pageSize);
          }}

          align="end"
        />
      </Card>

      <ChonNguoiXuLyModal
        visible={workflowModalState.visible}
        onClose={() => setWorkflowModalState((prev) => ({ ...prev, visible: false }))}
        onSubmit={handleWorkflowSubmit}
        idPhieuDanhGia={workflowModalState.idPhieuDanhGia}
        chucVuNguoiXuLy={workflowModalState.chucVuNguoiXuLy}
        tenButton={workflowModalState.tenButton}
        canChonNguoiXuLy={workflowModalState.canChonNguoiXuLy}
        isTuChoi={workflowModalState.isTuChoi}
      />

      <LichSuXuLyModal
        visible={lichSuModalState.visible}
        idPhieuDanhGia={lichSuModalState.idPhieuDanhGia}
        onClose={() => setLichSuModalState({ visible: false, idPhieuDanhGia: null })}
      />

      <ModalXemToanBoTieuChi
        visible={toanBoTieuChiVisible}
        onClose={() => setToanBoTieuChiVisible(false)}
        idDotDanhGia={selectedDotDanhGiaTieuChi}
        idLyLich={selectedIdLyLich}
        donViId={selectedDonViId}
      />
    </>
  );
};

export default withAuthorization(KPI_PhieuDanhGiaPage, "");
