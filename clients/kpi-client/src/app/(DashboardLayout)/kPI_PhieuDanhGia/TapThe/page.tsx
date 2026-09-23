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
    UndoOutlined,
    SearchOutlined,
    SendOutlined,
    TeamOutlined,
    ApartmentOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Dropdown,
    FormProps,
    Input,
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
    KPI_PhieuDanhGiaTapTheSearchType,
    DotDanhGiaWithPhieuTapTheType,
} from "@/types/kPI_PhieuDanhGiaTapThe/kPI_PhieuDanhGiaTapThe";
import kPI_PhieuDanhGiaTapTheService from "@/services/kPI_PhieuDanhGiaTapThe/kPI_PhieuDanhGiaTapTheService";
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
        GuiTruongPhong: "Chờ Trưởng phòng duyệt",
        GuiPhoCucTruong: "Chờ Phó Cục trưởng duyệt",
        GuiCucTruong: "Chờ Cục/Vụ trưởng duyệt",
        GuiVuTCCB: "Chờ Vụ TCCB thẩm định",
        DaDuyet: "Đã duyệt",
        TuChoi: "Từ chối",
        TraVe: "Trả về",
    };
    return trangThai ? labels[trangThai] || trangThai : "Chưa tạo phiếu";
};

const KPI_PhieuDanhGiaTapThePage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: any) => state.auth.User);
    const [data, setData] = useState<ResponsePageList<DotDanhGiaWithPhieuTapTheType[]>>();
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
    const [searchValues, setSearchValues] = useState<KPI_PhieuDanhGiaTapTheSearchType | null>(
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

    const [thuHoiModalState, setThuHoiModalState] = useState<{
        visible: boolean;
        idPhieuDanhGia: string | null;
        ghiChu: string;
        loading: boolean;
    }>({
        visible: false,
        idPhieuDanhGia: null,
        ghiChu: "",
        loading: false,
    });

    const handleThuHoiSubmit = async () => {
        if (!user?.id || !thuHoiModalState.idPhieuDanhGia) return;
        try {
            setThuHoiModalState((prev) => ({ ...prev, loading: true }));
            const response = await kPI_PhieuDanhGiaTapTheService.thuHoiPhieu({
                idPhieuDanhGia: thuHoiModalState.idPhieuDanhGia,
                idNguoiThuHoi: user.id,
                ghiChu: thuHoiModalState.ghiChu || "Đơn vị thu hồi phiếu đánh giá tập thể",
            });
            if (response && response.status !== false) {
                toast.success("Thu hồi phiếu đánh giá tập thể thành công!");
                setThuHoiModalState({ visible: false, idPhieuDanhGia: null, ghiChu: "", loading: false });
                handleLoadData();
            } else {
                toast.error(response?.message || "Thu hồi phiếu đánh giá tập thể thất bại!");
            }
        } catch (error: any) {
            console.error("Lỗi khi thu hồi phiếu tập thể:", error);
            toast.error(error?.message || "Đã xảy ra lỗi hệ thống khi thu hồi.");
        } finally {
            setThuHoiModalState((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleWorkflowSubmit = async (idNguoiXuLy: string, ghiChu?: string) => {
        const idNguoiGui = user?.id || user?.userId;
        if (!idNguoiGui) return;
        if (!workflowModalState.idPhieuDanhGia) {
            toast.warning("Chưa tạo phiếu đánh giá tập thể. Vui lòng lập phiếu trước khi gửi!");
            return;
        }
        try {
            dispatch(setIsLoading(true));
            const response = await kPI_PhieuDanhGiaTapTheService.chuyenBuocLuong({
                idPhieuDanhGia: workflowModalState.idPhieuDanhGia,
                idNguoiGui,
                idNguoiXuLy: idNguoiXuLy || undefined,
                ghiChu,
                isTuChoi: workflowModalState.isTuChoi,
            });
            if (response && response.status) {
                toast.success(
                    workflowModalState.isTuChoi
                        ? "Từ chối/trả về phiếu đánh giá tập thể thành công!"
                        : "Chuyển bước luồng tập thể thành công!"
                );
                setWorkflowModalState((prev) => ({ ...prev, visible: false }));
                handleLoadData();
            } else {
                toast.error(response?.message || "Đã xảy ra lỗi khi thực hiện thao tác.");
            }
        } catch (error: any) {
            console.error("Lỗi khi xử lý luồng tập thể:", error);
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
            case "GuiTruongPhong":
                return <Tag color="warning" style={tagStyle}>Chờ Trưởng phòng duyệt</Tag>;
            case "GuiPhoCucTruong":
                return <Tag color="purple" style={tagStyle}>Chờ Phó Cục trưởng duyệt</Tag>;
            case "GuiCucTruong":
                return <Tag color="purple" style={tagStyle}>Chờ Cục/Vụ trưởng duyệt</Tag>;
            case "GuiVuTCCB":
                return <Tag color="orange" style={tagStyle}>Chờ Vụ TCCB thẩm định</Tag>;
            case "DaDuyet":
                return <Tag color="success" style={tagStyle} icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
            case "TuChoi":
                return <Tag color="error" style={tagStyle} icon={<CloseCircleOutlined />}>Từ chối</Tag>;
            case "TraVe":
                return <Tag color="error" style={tagStyle} icon={<RollbackOutlined />}>Trả về</Tag>;
            default:
                return <Tag color="default" style={tagStyle}>{trangThai}</Tag>;
        }
    };

    const tableColumns: TableProps<DotDanhGiaWithPhieuTapTheType>["columns"] = [
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
            width: 190,
            render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => {
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
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{record.tenDotDanhGia}</span>
                        {trangThaiTag}
                    </Space>
                );
            },
        },
        {
            title: "Tập thể / Đơn vị",
            dataIndex: "tenDonVi",
            key: "tenDonVi",
            width: 210,
            render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => {
                return (
                    <div>
                        <div style={{ fontWeight: 600, color: "#0369a1", display: "flex", alignItems: "center", gap: 4 }}>
                            <BankOutlined />
                            {record.tenDonVi || "Chưa xác định"}
                        </div>
                        {record.tenPhongBan && (
                            <div style={{ fontSize: "12px", color: "#475569", marginTop: "3px", display: "flex", alignItems: "center", gap: 4 }}>
                                <ApartmentOutlined />
                                {record.tenPhongBan}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Bộ tiêu chí",
            dataIndex: "boTieuChi",
            width: 320,
            render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => (
                <Space direction="vertical" size={8} style={{ width: "100%", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontWeight: 600, color: "#475569", fontSize: "13px", width: "70px", flexShrink: 0, paddingTop: "4px" }}>Chung:</span>
                        {record.tenBoTieuChiChung ? (
                            <div
                                style={{
                                    backgroundColor: "#dcfce7",
                                    color: "#15803d",
                                    borderRadius: "6px",
                                    padding: "4px 10px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    lineHeight: "1.4",
                                    flex: 1,
                                    transition: "all 0.2s ease",
                                    border: "1px solid #bbf7d0"
                                }}
                                onClick={() => {
                                    setSelectedDotDanhGiaTieuChi(record.idDotDanhGia);
                                    setSelectedDonViId(record.idDonVi || null);
                                    setToanBoTieuChiVisible(true);
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bbf7d0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                            >
                                {record.tenBoTieuChiChung}
                            </div>
                        ) : <span style={{ color: "#9ca3af", paddingTop: "4px", fontSize: "13px" }}>-</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontWeight: 600, color: "#475569", fontSize: "13px", width: "70px", flexShrink: 0, paddingTop: "4px" }}>Nhiệm vụ:</span>
                        {record.tenBoTieuChiNhiemVu ? (
                            <div
                                style={{
                                    backgroundColor: "#eff6ff",
                                    color: "#1d4ed8",
                                    borderRadius: "6px",
                                    padding: "4px 10px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    lineHeight: "1.4",
                                    flex: 1,
                                    transition: "all 0.2s ease",
                                    border: "1px solid #bfdbfe"
                                }}
                                onClick={() => {
                                    setSelectedDotDanhGiaTieuChi(record.idDotDanhGia);
                                    setSelectedDonViId(record.idDonVi || null);
                                    setToanBoTieuChiVisible(true);
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                            >
                                {record.tenBoTieuChiNhiemVu}
                            </div>
                        ) : <span style={{ color: "#9ca3af", paddingTop: "4px", fontSize: "13px" }}>-</span>}
                    </div>
                </Space>
            ),
        },
        {
            title: "Thời gian",
            dataIndex: "thoiGian",
            width: 135,
            render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Từ: {record.thoiGianBatDau ? extensions.formatDate(record.thoiGianBatDau) : "-"}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Đến: {record.thoiGianKetThuc ? extensions.formatDate(record.thoiGianKetThuc) : "-"}
                    </span>
                </Space>
            ),
        },
        {
            title: "Điểm đánh giá",
            dataIndex: "diemDanhGia",
            key: "diemDanhGia",
            align: "center",
            width: 140,
            render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => {
                if (!record.daDanhGia && !record.tongDiem && !record.diemTieuChiChung && !record.diemThucHienNhiemVu) {
                    return <span style={{ color: "#9ca3af" }}>-</span>;
                }

                return (
                    <Space direction="vertical" size={1} style={{ width: "100%", alignItems: "center" }}>
                        <div style={{ fontSize: "12px" }}>
                            <span style={{ color: "#64748b" }}>TC chung: </span>
                            <span style={{ fontWeight: 600, color: "#0284c7" }}>
                                {record.diemTieuChiChung != null ? Number(record.diemTieuChiChung).toFixed(2).replace(/\.00$/, '') : "-"}
                            </span>
                        </div>
                        <div style={{ fontSize: "12px" }}>
                            <span style={{ color: "#64748b" }}>Nhiệm vụ: </span>
                            <span style={{ fontWeight: 600, color: "#0d9488" }}>
                                {record.diemThucHienNhiemVu != null ? Number(record.diemThucHienNhiemVu).toFixed(2).replace(/\.00$/, '') : "-"}
                            </span>
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
            title: "Xếp loại chất lượng",
            dataIndex: "xepLoai",
            key: "xepLoai",
            align: "center",
            width: 170,
            render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => {
                return (
                    <Space direction="vertical" size={2} style={{ width: "100%", alignItems: "center" }}>
                        {record.tenChatLuongTuDanhGia && (
                            <Tooltip title="Tự xếp loại">
                                <Tag color="cyan" style={{ borderRadius: "10px", fontSize: "11px", margin: 0 }}>
                                    Tự ĐG: {record.tenChatLuongTuDanhGia}
                                </Tag>
                            </Tooltip>
                        )}
                        {record.tenChatLuongCapTrenDanhGia && (
                            <Tooltip title="Cấp trên xếp loại">
                                <Tag color="blue" style={{ borderRadius: "10px", fontSize: "11px", margin: 0 }}>
                                    Cấp trên: {record.tenChatLuongCapTrenDanhGia}
                                </Tag>
                            </Tooltip>
                        )}
                        {!record.tenChatLuongTuDanhGia && !record.tenChatLuongCapTrenDanhGia && (
                            <span style={{ color: "#9ca3af" }}>-</span>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Trạng thái phiếu",
            dataIndex: "trangThai",
            key: "trangThai",
            align: "center",
            width: 130,
            render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => renderTrangThaiPhieu(record.trangThai || undefined),
        },
        {
            title: "Thao tác",
            dataIndex: "actions",
            fixed: "right",
            align: "center",
            width: 110,
            render: (_: any, record: DotDanhGiaWithPhieuTapTheType) => {
                const items: MenuProps["items"] = [
                    {
                        label: "Xem chi tiết",
                        key: "view_detail",
                        icon: <EyeOutlined />,
                        onClick: () => {
                            const targetId = record.idPhieuDanhGia || record.idDotDanhGia;
                            router.push(
                                `/kPI_PhieuDanhGia/TapTheChiTiet/${targetId}?idDotDanhGia=${record.idDotDanhGia}&idPhieu=${record.idPhieuDanhGia || ""}&donViId=${record.idDonVi || ""}&phongBan=${record.phongBan || ""}&viewOnly=true`
                            );
                        },
                    },
                ];

                const isKhoiTaoOrTraVe = !record.trangThai || record.trangThai === "KhoiTao" || record.trangThai === "TraVe";
                const canEvaluate = (activeTab === "danhGiaTheoDot" && isKhoiTaoOrTraVe) || activeTab === "choXuLy";

                if (canEvaluate) {
                    items.push({
                        label: <span style={{ color: "#0284c7", fontWeight: "600" }}>Đánh giá tập thể</span>,
                        key: "action_danhgia_donvi",
                        icon: <EditOutlined style={{ color: "#0284c7" }} />,
                        onClick: () => {
                            const targetId = record.idPhieuDanhGia || record.idDotDanhGia;
                            router.push(
                                `/kPI_PhieuDanhGia/TapTheChiTiet/${targetId}?idDotDanhGia=${record.idDotDanhGia}&idPhieu=${record.idPhieuDanhGia || ""}&donViId=${record.idDonVi || ""}&phongBan=${record.phongBan || ""}`
                            );
                        },
                    });
                }

                const canShowButtonLuong =
                    record.buttonLuong &&
                    record.daDanhGia &&
                    !!record.idPhieuDanhGia;

                if (canShowButtonLuong && record.buttonLuong) {
                    const btn = record.buttonLuong;
                    items.push({
                        label: btn.tenButton,
                        key: "action_next",
                        icon: btn.canChonNguoiXuLy ? <SendOutlined style={{ color: "#1890ff" }} /> : <CheckCircleOutlined style={{ color: "green" }} />,
                        onClick: () => {
                            if (!record.idPhieuDanhGia || !record.daDanhGia) {
                                toast.warning("Vui lòng thực hiện đánh giá tập thể trước khi gửi!");
                                return;
                            }
                            setWorkflowModalState({
                                visible: true,
                                idPhieuDanhGia: record.idPhieuDanhGia,
                                chucVuNguoiXuLy: btn.chucVuNguoiXuLy,
                                tenButton: btn.tenButton || "Chuyển bước",
                                canChonNguoiXuLy: btn.canChonNguoiXuLy ?? true,
                                isTuChoi: false,
                            });
                        },
                    });
                }

                if (activeTab === "choXuLy" && record.trangThai && !isKhoiTaoOrTraVe) {
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
                                tenButton: "Trả về phiếu đánh giá tập thể",
                                canChonNguoiXuLy: false,
                                isTuChoi: true,
                            });
                        },
                    });
                }

                const canThuHoi = activeTab === "danhGiaTheoDot" && record.idPhieuDanhGia && record.trangThai && !isKhoiTaoOrTraVe && record.trangThai !== "DaDuyet";
                if (canThuHoi) {
                    items.push({
                        label: <span style={{ color: "#d90606ff", fontWeight: "600" }}>Thu hồi phiếu</span>,
                        key: "action_thuhoi",
                        icon: <UndoOutlined style={{ color: "#d90606ff" }} />,
                        onClick: () => {
                            setThuHoiModalState({
                                visible: true,
                                idPhieuDanhGia: record.idPhieuDanhGia || "",
                                ghiChu: "",
                                loading: false,
                            });
                        },
                    });
                }

                if (record.idPhieuDanhGia) {
                    items.push({
                        label: "Lịch sử xử lý",
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
                title: "Tập thể / Đơn vị",
                key: "tenDonVi",
                dataIndex: "tenDonVi",
                width: 200,
                exportRender: (_: unknown, record: any) =>
                    record.tenDonVi || "-",
            },
            {
                title: "Phòng ban",
                key: "tenPhongBan",
                dataIndex: "tenPhongBan",
                width: 180,
                exportRender: (_: unknown, record: any) =>
                    record.tenPhongBan || "-",
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
                width: 240,
                exportRender: (value: unknown) => value || "-",
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
                title: "Điểm TC chung",
                key: "diemTieuChiChung",
                dataIndex: "diemTieuChiChung",
                width: 120,
                exportRender: (value: unknown) => formatExcelScore(value),
            },
            {
                title: "Điểm nhiệm vụ",
                key: "diemThucHienNhiemVu",
                dataIndex: "diemThucHienNhiemVu",
                width: 120,
                exportRender: (value: unknown) => formatExcelScore(value),
            },
            {
                title: "Tổng điểm",
                key: "tongDiem",
                dataIndex: "tongDiem",
                width: 100,
                exportRender: (value: unknown) => formatExcelScore(value),
            },
            {
                title: "Tự xếp loại",
                key: "tenChatLuongTuDanhGia",
                dataIndex: "tenChatLuongTuDanhGia",
                width: 160,
                exportRender: (value: unknown) => value || "-",
            },
            {
                title: "Cấp trên xếp loại",
                key: "tenChatLuongCapTrenDanhGia",
                dataIndex: "tenChatLuongCapTrenDanhGia",
                width: 160,
                exportRender: (value: unknown) => value || "-",
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
            return { donVi: user?.donViId || user?.donViSuDungId || undefined };
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
    }, [activeTab, user?.id, user?.donViId, user?.donViSuDungId]);

    const handleDelete = async () => {
        const response = await kPI_PhieuDanhGiaTapTheService.delete(confirmDeleteId ?? "");
        if (response.status) {
            toast.success("Xóa thành công");
            handleLoadData();
        }
        setConfirmDeleteId(null);
    };

    const toggleSearch = () => {
        setIsPanelVisible(!isPanelVisible);
    };

    const onFinishSearch: FormProps<KPI_PhieuDanhGiaTapTheSearchType>["onFinish"] = async (
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
            const baseSearch: any = {
                ...(searchValues || {}),
                pageIndex: 1,
                pageSize: 1,
            };
            if (user?.donViId || user?.donViSuDungId) {
                baseSearch.donVi = user.donViId || user.donViSuDungId;
            }
            const [resDot, resTabCounts] = await Promise.all([
                kPI_PhieuDanhGiaTapTheService.getDotDanhGiaWithPhieu(user.id, baseSearch),
                kPI_PhieuDanhGiaTapTheService.getTabCounts(user.id, searchValues || {}),
            ]);
            setCounts({
                danhGiaTheoDot: resDot?.data?.totalCount || 0,
                choXuLy: resTabCounts?.data?.choXuLy || 0,
                daXuLy: resTabCounts?.data?.daXuLy || 0,
                daDuyet: resTabCounts?.data?.hoanThanh || 0,
            });
        } catch (error) {
            console.error("Lỗi khi tải số lượng tab tập thể:", error);
        }
    }, [user?.id, user?.donViId, user?.donViSuDungId, searchValues]);

    const handleLoadData = useCallback(
        async (searchDataOverride?: KPI_PhieuDanhGiaTapTheSearchType) => {
            if (!user?.id) return;
            dispatch(setIsLoading(true));

            let tabFilter: any = {};
            if (activeTab === "danhGiaTheoDot") {
                tabFilter = {
                    donVi: user?.donViId || user?.donViSuDungId || undefined,
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

            const searchData: KPI_PhieuDanhGiaTapTheSearchType = {
                pageIndex,
                pageSize,
                ...(searchValues || {}),
                ...tabFilter,
                ...(searchDataOverride || {}),
            };

            try {
                const response = await kPI_PhieuDanhGiaTapTheService.getDotDanhGiaWithPhieu(user.id, searchData);

                if (response != null && response.data != null) {
                    setData(response.data as any);
                }
                fetchTabCounts();
            } catch (error) {
                console.error("Lỗi tải danh sách phiếu tập thể:", error);
            } finally {
                dispatch(setIsLoading(false));
            }
        },
        [dispatch, pageIndex, pageSize, searchValues, user?.id, user?.donViId, user?.donViSuDungId, activeTab, fetchTabCounts]
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
                className="mb-2"
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
                    onFinish={onFinishSearch as any}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    onlyDotFilter
                    dotType="TapThe"
                    columns={excelColumns}
                    extraFilter={currentTabFilter}
                    fetchDataFn={(params) =>
                        kPI_PhieuDanhGiaTapTheService.getDotDanhGiaWithPhieu(user?.id, params)
                    }
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
                    <p>Bạn có chắc chắn muốn xóa phiếu đánh giá tập thể này?</p>
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
                            <Tooltip placement="top" title="Danh sách các đợt đánh giá áp dụng cho tập thể/đơn vị để thực hiện lập phiếu và tự chấm điểm.">
                                <Space>
                                    <TeamOutlined />
                                    <span style={{ fontWeight: 600 }}>Đánh giá tập thể theo đợt</span>
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
                        columns={styledColumns as any}
                        bordered
                        dataSource={data?.items}
                        rowKey={(record: any) => record.idPhieuDanhGia || record.idDotDanhGia || record.id}
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

            {/* Modal xác nhận thu hồi phiếu tập thể */}
            <Modal
                open={thuHoiModalState.visible}
                title={
                    <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "16px" }}>
                        Xác nhận thu hồi phiếu đánh giá tập thể
                    </span>
                }
                closeIcon={<span style={{ color: "#ffffff", fontSize: "16px", lineHeight: "1" }}>✕</span>}
                onOk={handleThuHoiSubmit}
                onCancel={() => setThuHoiModalState({ visible: false, idPhieuDanhGia: null, ghiChu: "", loading: false })}
                okText={<span style={{ color: "#ffffff", fontWeight: 600 }}>Xác nhận thu hồi</span>}
                cancelText="Hủy"
                confirmLoading={thuHoiModalState.loading}
                styles={{
                    header: {
                        background: "#d97706",
                        padding: "12px 16px",
                        margin: 0,
                        borderRadius: "8px 8px 0 0",
                    },
                    body: { padding: 0 },
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
                <div style={{ paddingTop: 8 }}>
                    <p style={{ fontSize: 14, marginBottom: 12 }}>
                        Bạn có chắc chắn muốn thu hồi lại phiếu đánh giá tập thể này không? Sau khi thu hồi, phiếu sẽ quay về trạng thái <b>Khởi tạo</b> và đơn vị có thể chỉnh sửa lại dữ liệu để gửi lại sau.
                    </p>
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Lý do thu hồi (không bắt buộc):</div>
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập lý do thu hồi..."
                            value={thuHoiModalState.ghiChu}
                            onChange={(e) => setThuHoiModalState((prev) => ({ ...prev, ghiChu: e.target.value }))}
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default withAuthorization(KPI_PhieuDanhGiaTapThePage, "");
