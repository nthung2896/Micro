"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Flex from "@/components/shared-components/Flex";
import { DropdownOption, ResponsePageList } from "@/types/general";
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
  CrownOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  PlusCircleOutlined,
  RollbackOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Dropdown,
  FormProps,
  MenuProps,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  TableProps,
  Tabs,
  Tag,
  Tooltip,
  Popover,
} from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import KPI_PhieuDanhGiaDetail from "../detail";
import Search from "../search";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import {
  KPI_PhieuDanhGiaSearchType,
  KPI_PhieuDanhGiaType,
} from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";
import kPI_PhieuDanhGiaService from "@/services/kPI_PhieuDanhGia/kPI_PhieuDanhGiaService";
import KPI_PhieuDanhGiaCreateOrUpdate from "../createOrUpdate";
import ChonNguoiXuLyModal from "../ChonNguoiXuLyModal";
import LichSuXuLyModal from "../LichSuXuLyModal";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import { KPI_DotTheoDoiDanhGiaType } from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";
import departmentService from "@/services/department/department.service";
import ModalXemToanBoTieuChi from "../../kPI_BieuChamDiem/ModalXemToanBoTieuChi";

const KPI_PhieuDanhGiaDanhSachNhanSu2Page: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.User);
  const [data, setData] = useState<ResponsePageList<any>>();
  const [pageSize, setPageSize] = useState<number>(20);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [dotOptions, setDotOptions] = useState<DropdownOption[]>([]);
  const [phongBanOptions, setPhongBanOptions] = useState<DropdownOption[]>([]);
  const [selectedDot, setSelectedDot] = useState<KPI_DotTheoDoiDanhGiaType | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);

  const [toanBoTieuChiVisible, setToanBoTieuChiVisible] = useState(false);
  const [selectedDotDanhGiaTieuChi, setSelectedDotDanhGiaTieuChi] = useState<string | null>(null);
  const [selectedDonViId, setSelectedDonViId] = useState<string | null>(null);
  const [selectedIdLyLich, setSelectedIdLyLich] = useState<string | null>(null);

  const [isLoadedDots, setIsLoadedDots] = useState<boolean>(false);

  useEffect(() => {
    const fetchDots = async () => {
      try {
        const dots = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
        setDotOptions(dots || []);
        if (dots && dots.length > 0) {
          const firstId = dots[0].value;
          const res = await kPI_DotTheoDoiDanhGiaService.getById(firstId);
          if (res && res.data) {
            setSelectedDot(res.data);
          }
          const initSearch = { idDotDanhGia: firstId };
          setSearchValues(initSearch);
          setIsLoadedDots(true);
          handleLoadData(initSearch);
        } else {
          setIsLoadedDots(true);
          handleLoadData();
        }
      } catch (err) {
        console.error(err);
        setIsLoadedDots(true);
        handleLoadData();
      }
    };

    const fetchPhongBan = async () => {
      try {
        const userDonVi = user?.donViSuDungId || user?.donViId || user?.idDonVi;
        let pbs;
        if (userDonVi) {
          pbs = await departmentService.getDropdownLevel1(userDonVi);
        } else {
          pbs = await departmentService.getDropDownPhong();
        }
        if (pbs) {
          const list = Array.isArray(pbs) ? pbs : (pbs.data || []);
          const normalized = list
            .map((item: any) => ({
              value: (item.value || item.id || item.key || "").toString(),
              label: (item.label || item.text || item.name || item.title || "").toString(),
            }))
            .filter((item: any) => item.value && item.label);
          setPhongBanOptions(normalized);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDots();
    fetchPhongBan();
  }, [user?.donViId]);

  const [activeTab, setActiveTab] = useState<string>("choXuLy");
  const [counts, setCounts] = useState<{
    danhGiaTheoDot: number;
    choXuLy: number;
    daXuLy: number;
    daDuyet: number;
    tongNhanSu: number;
    daGui: number;
    chuaGui: number;
  }>({
    danhGiaTheoDot: 0,
    choXuLy: 0,
    daXuLy: 0,
    daDuyet: 0,
    tongNhanSu: 0,
    daGui: 0,
    chuaGui: 0,
  });

  const [searchValues, setSearchValues] = useState<KPI_PhieuDanhGiaSearchType | null>(null);
  const loading = useSelector((state) => state.general.isLoading);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurentItem] = useState<any | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      ),
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
                  ? Number(record.diemThucHienNhiemVu).toFixed(2).replace(/\.00$/, "")
                  : (record.tongDiem != null && record.diemTieuChiChung != null)
                    ? Number(record.tongDiem - record.diemTieuChiChung).toFixed(2).replace(/\.00$/, "")
                    : "-"}
              </span>
            </div>
            <div style={{ fontSize: "13px" }}>
              Điểm tiêu chí chung: <span style={{ fontWeight: 600, color: "#0891b2" }}>{record.diemTieuChiChung != null ? Number(record.diemTieuChiChung).toFixed(2).replace(/\.00$/, "") : "-"}</span>
            </div>
            <div style={{ fontSize: "13px", marginTop: "2px" }}>
              <Tag color="purple" style={{ fontWeight: 700, margin: 0 }}>
                Tổng: {record.tongDiem != null ? Number(record.tongDiem).toFixed(2).replace(/\.00$/, "") : "-"}
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
      width: 100,
      render: (_: any, record: any) => renderTrangThaiPhieu(record.trangThai),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      fixed: "right",
      align: "center",
      width: 130,
      render: (_: any, record: any) => {
        const isKhoiTaoOrTraVe = !record.trangThai || record.trangThai === "KhoiTao" || record.trangThai === "TraVe";
        const canEdit = (activeTab === "danhGiaTheoDot" && isKhoiTaoOrTraVe) || activeTab === "choXuLy";

        const items: MenuProps["items"] = [
          {
            label: "Xem phiếu",
            key: "1",
            icon: <EyeOutlined />,
            onClick: () => {
              if (record.idPhieuDanhGia) {
                setCurentItem(record);
                setIsOpenDetail(true);
              } else {
                toast.warning("Phiếu chưa được đánh giá");
              }
            },
          },
        ];

        // Đánh giá nhiều cấp
        if (canEdit) {
          items.push({
            label: <span style={{ color: "#7c3aed", fontWeight: "600" }}>Đánh giá theo nhiệm vụ kê khai</span>,
            key: "multilevel",
            icon: <CrownOutlined style={{ color: "#7c3aed" }} />,
            onClick: () => {
              const phieuTarget = record.idPhieuDanhGia || record.idDotDanhGia;
              router.push(`/kPI_PhieuDanhGia/DanhGiaMultiCap/${phieuTarget}?idDot=${record.idDotDanhGia}&idLyLich=${record.idLyLich}`);
            },
          });
        }

        const canShowButtonLuong =
          record.isShowButton &&
          record.buttonLuong &&
          (activeTab === "choXuLy" && record.trangThai);

        if (canShowButtonLuong) {
          items.push({
            label: record.buttonLuong.tenButton,
            key: "action_next",
            icon: record.buttonLuong.canChonNguoiXuLy ? <SendOutlined /> : <CheckCircleOutlined style={{ color: "green" }} />,
            onClick: () => {
              setWorkflowModalState({
                visible: true,
                idPhieuDanhGia: record.idPhieuDanhGia || "",
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
              <Button onClick={(e) => e.preventDefault()} type="default">
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
          },
        }),
      })),
    [tableColumns]
  );

  const hanleCreateEditSuccess = () => {
    handleLoadData();
    setCurentItem(null);
  };

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

  const fetchTabCounts = useCallback(async (searchOverride?: KPI_PhieuDanhGiaSearchType) => {
    if (!user?.id) return;
    try {
      const activeSearchValues = {
        ...(searchValues || {}),
        ...(searchOverride || {}),
      };
      const resTabCounts = await kPI_PhieuDanhGiaService.getTabCounts(user.id, activeSearchValues);
      setCounts({
        danhGiaTheoDot: 0,
        choXuLy: resTabCounts?.data?.choXuLy || 0,
        daXuLy: resTabCounts?.data?.daXuLy || 0,
        daDuyet: resTabCounts?.data?.daDuyet || 0,
        tongNhanSu: resTabCounts?.data?.tongNhanSu || 0,
        daGui: resTabCounts?.data?.daGui || 0,
        chuaGui: resTabCounts?.data?.chuaGui || 0,
      });
    } catch (error) {
      console.error("Lỗi khi tải số lượng tab:", error);
    }
  }, [user?.id, searchValues]);

  const handleLoadData = useCallback(
    async (searchDataOverride?: KPI_PhieuDanhGiaSearchType) => {
      dispatch(setIsLoading(true));

      let tabFilter: any = {};
      if (activeTab === "danhGiaTheoDot") {
        tabFilter = {
          idLyLich: user?.idLyLich || undefined,
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

      const activeSearch = {
        ...(searchValues || {}),
        ...(searchDataOverride || {}),
      };

      const searchData = {
        pageIndex,
        pageSize,
        ...activeSearch,
        ...tabFilter,
      };

      if (user?.id) {
        const response = await kPI_PhieuDanhGiaService.getDotDanhGiaWithPhieu(user.id, searchData);
        if (response != null && response.data != null) {
          const data = response.data;
          setData(data);
        }
        await fetchTabCounts(activeSearch);
      }
      dispatch(setIsLoading(false));
    },
    [dispatch, pageIndex, pageSize, searchValues, user?.id, activeTab, fetchTabCounts]
  );

  const handleShowModal = (isEdit?: boolean, item?: KPI_PhieuDanhGiaType) => {
    setIsOpenModal(true);
    if (isEdit) {
      setCurentItem(item ?? null);
    }
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setCurentItem(null);
  };

  const handleCloseDetail = () => {
    setIsOpenDetail(false);
  };

  useEffect(() => {
    if (isLoadedDots) {
      handleLoadData();
    }
  }, [pageIndex, pageSize, activeTab]);

  const onSelectDot = async (idDot: string) => {
    setPageIndex(1);
    if (!idDot) {
      setSelectedDot(null);
      const values = { ...(searchValues || {}), idDotDanhGia: undefined };
      setSearchValues(values);
      await handleLoadData(values);
      return;
    }
    try {
      const res = await kPI_DotTheoDoiDanhGiaService.getById(idDot);
      if (res && res.data) {
        setSelectedDot(res.data);
      }
    } catch (e) {
      console.error(e);
    }
    const values = { ...(searchValues || {}), idDotDanhGia: idDot };
    setSearchValues(values);
    await handleLoadData(values);
  };

  const onSelectPhongBan = async (phongBanValue: string) => {
    const values = { ...(searchValues || {}), phongBan: phongBanValue || undefined };
    setSearchValues(values);
    setPageIndex(1);
    await handleLoadData(values);
  };

  const currentTabFilter = useMemo(() => {
    if (activeTab === "danhGiaTheoDot") {
      return { idLyLich: user?.idLyLich || undefined };
    } else if (activeTab === "choXuLy") {
      return { idNguoiXuLy: user?.id, isXuLy: false, isKhacHoanThanh: true };
    } else if (activeTab === "daXuLy") {
      return { idNguoiXuLy: user?.id, isXuLy: true, isKhacHoanThanh: true };
    } else if (activeTab === "daDuyet") {
      return { idNguoiXuLy: user?.id, isXuLy: true, isKhacHoanThanh: false };
    }
    return {};
  }, [activeTab, user?.id, user?.idLyLich]);

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
          <Button
            onClick={() => {
              handleShowModal();
            }}
            type="primary"
            icon={<PlusCircleOutlined />}
          >
            Thêm mới
          </Button>
          {isOpenModal && (
            <KPI_PhieuDanhGiaCreateOrUpdate
              onSuccess={hanleCreateEditSuccess}
              onClose={handleClose}
              item={currentItem}
            />
          )}
        </div>
      </Flex>
      <Card
        className="customCardShadow mb-3"
        style={{ backgroundColor: "#f4f7fe", border: "1px solid #e2e8f0" }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ color: "#0355a2", fontSize: "16px", fontWeight: "bold" }}>
              {selectedDot ? selectedDot.tenDotTheoDoiDanhGia : "Danh sách nhân sự đánh giá nhiều cấp"}
            </span>
            <Popover
              content={
                <div style={{ width: 350 }}>
                  <div style={{ marginBottom: 8, fontWeight: "bold", color: "#333" }}>Chọn đợt đánh giá khác:</div>
                  <Select
                    showSearch
                    style={{ width: "100%" }}
                    placeholder="Chọn đợt đánh giá"
                    allowClear
                    onChange={onSelectDot}
                    value={searchValues?.idDotDanhGia}
                    options={dotOptions}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </div>
              }
              trigger="click"
              placement="bottomLeft"
            >
              <Button size="small" type="primary" style={{ borderRadius: 16, color: "#fff" }}>
                Thay đổi đợt <DownOutlined style={{ fontSize: 10, color: "#fff" }} />
              </Button>
            </Popover>
          </div>
        }
        extra={
          phongBanOptions && phongBanOptions.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: "normal", fontSize: "14px", color: "#555" }}>Phòng ban:</span>
              <Select
                showSearch
                style={{ width: 250 }}
                placeholder="Tất cả phòng ban"
                allowClear
                onChange={onSelectPhongBan}
                value={searchValues?.phongBan}
                options={phongBanOptions.map((x) => ({ label: x.label, value: x.label }))}
                filterOption={(input, option) =>
                  (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>
          ) : null
        }
      >
        {selectedDot ? (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "16px",
                  border: "1px solid #e0e7ff",
                  borderRadius: "8px",
                  flexWrap: "wrap",
                  gap: "16px",
                  backgroundColor: "#ebf2fa",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>ĐỢT ĐÁNH GIÁ</div>
                  <div style={{ color: "#006d75", fontWeight: "bold", fontSize: "14px" }}>
                    {selectedDot.tenDotTheoDoiDanhGia}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>THỜI GIAN BẮT ĐẦU</div>
                  <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>
                    {selectedDot.thoiGianBatDau ? new Date(selectedDot.thoiGianBatDau).toLocaleDateString("vi-VN") : "---"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>THỜI GIAN KẾT THÚC</div>
                  <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>
                    {selectedDot.thoiGianKetThuc ? new Date(selectedDot.thoiGianKetThuc).toLocaleDateString("vi-VN") : "---"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>TRẠNG THÁI ĐỢT</div>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>
                    {selectedDot.trangThai === "ACTIVE" || selectedDot.trangThai === "Đang hoạt động" ? (
                      <Tag color="success" style={{ margin: 0 }}>Đang hoạt động</Tag>
                    ) : (
                      <Tag color="default" style={{ margin: 0 }}>Đã đóng</Tag>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>THỐNG KÊ (ĐƠN VỊ)</div>
                  <div style={{ fontWeight: 600, fontSize: "14px", display: "flex", gap: "8px" }}>
                    <span style={{ color: "#059669" }}>Đã gửi: {counts?.daGui || 0}</span>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <span style={{ color: "#dc2626" }}>Chưa gửi: {counts?.chuaGui || 0}</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
            Vui lòng chọn đợt đánh giá để xem chi tiết
          </div>
        )}
      </Card>
      {isPanelVisible && (
        <Search
          onFinish={onFinishSearch}
          pageIndex={pageIndex}
          pageSize={pageSize}
          columns={styledColumns as any[]}
          extraFilter={currentTabFilter}
          onlyDotFilter
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

      {toanBoTieuChiVisible && selectedDotDanhGiaTieuChi && selectedIdLyLich && (
        <ModalXemToanBoTieuChi
          visible={toanBoTieuChiVisible}
          onClose={() => setToanBoTieuChiVisible(false)}
          idDotDanhGia={selectedDotDanhGiaTieuChi}
          donViId={selectedDonViId}
          idLyLich={selectedIdLyLich}
        />
      )}

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setPageIndex(1);
        }}
        items={[
          {
            key: "choXuLy",
            label: (
              <Tooltip placement="top" title="Danh sách các phiếu đánh giá đang chờ bạn xem xét, thẩm định hoặc chấm điểm bước tiếp theo.">
                <Space>
                  <span style={{ fontWeight: 600 }}>Chờ xử lý</span>
                  <Tag color="red" style={{ borderRadius: "10px", fontWeight: "bold" }}>
                    {counts.choXuLy}
                  </Tag>
                </Space>
              </Tooltip>
            ),
          },
          {
            key: "daXuLy",
            label: (
              <Tooltip placement="top" title="Danh sách các phiếu đánh giá mà bạn đã hoàn tất xử lý và chuyển tiếp sang bước tiếp theo.">
                <Space>
                  <span style={{ fontWeight: 600 }}>Đã xử lý</span>
                  <Tag color="blue" style={{ borderRadius: "10px", fontWeight: "bold" }}>
                    {counts.daXuLy}
                  </Tag>
                </Space>
              </Tooltip>
            ),
          },
          {
            key: "daDuyet",
            label: (
              <Tooltip placement="top" title="Danh sách các phiếu đánh giá đã hoàn tất toàn bộ quy trình và được phê duyệt chính thức.">
                <Space>
                  <span style={{ fontWeight: 600 }}>Đã duyệt</span>
                  <Tag color="green" style={{ borderRadius: "10px", fontWeight: "bold" }}>
                    {counts.daDuyet}
                  </Tag>
                </Space>
              </Tooltip>
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
    </>
  );
};

export default withAuthorization(KPI_PhieuDanhGiaDanhSachNhanSu2Page, "");
