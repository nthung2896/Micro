"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Card,
    Table,
    Select,
    Button,
    Space,
    Spin,
    Tag,
    Typography,
    Row,
    Col,
    Segmented,
    ConfigProvider,
} from "antd";
import type { TableProps } from "antd";
import {
    SearchOutlined,
    ReloadOutlined,
    PrinterOutlined,
    CalendarOutlined,
    ApartmentOutlined,
    TableOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import withAuthorization from "@/libs/authentication";
import kPI_TieuChiChung_DiemSoService from "@/services/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSoService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import departmentService from "@/services/department/department.service";
import {
    KPI_TongHopTieuChiChungDto,
    KPI_TongHopToanCucDto,
    KPI_TongHopTieuChiChungNhanSuDto,
    KPI_TongHopTieuChiChungSearchDto,
} from "@/types/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSo";
import { DropdownOption } from "@/types/general";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const GUID_EMPTY = "00000000-0000-0000-0000-000000000000";
const isGuidEmpty = (id?: string | null) => !id || id === GUID_EMPTY;

const KPITongHopKetQuaTheoDoiPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<KPI_TongHopTieuChiChungDto | null>(null);
    const [dataToanCuc, setDataToanCuc] = useState<KPI_TongHopToanCucDto | null>(null);

    // Lấy thông tin user đăng nhập từ Redux store
    const currentUser = useSelector((state: any) => state.auth.User);
    const userRoles: string[] = currentUser?.listRole || [];
    const userDonViId: string | undefined = currentUser?.donViId;
    const userDepartmentId: string | undefined = currentUser?.departmentId;

    // Xác định quyền: LanhDaoCuc/CucTruong được xem ToanCuc + PhongBan (chọn PB), TruongPhong chỉ xem PhongBan (fix PB)
    const isLanhDaoCuc = useMemo(() => userRoles.some((r: string) => r.includes("CucTruong") || r === "LanhDaoCuc"), [userRoles]);
    const isTruongPhongCuc = useMemo(() => userRoles.some((r: string) => r.includes("TruongPhong") || r === "TruongPhongCuc"), [userRoles]);
    // Có quyền xem toàn cục không
    const canViewToanCuc = isLanhDaoCuc;
    // Có quyền chọn dropdown phòng ban không (chỉ Cục Trưởng/Lãnh đạo Cục)
    const canSelectPhongBan = isLanhDaoCuc;

    // Filter states
    const [phamVi, setPhamVi] = useState<"PhongBan" | "ToanCuc">("PhongBan");
    const [type, setType] = useState<"Thang" | "Quy">("Thang");
    const [donViSuDungId, setDonViSuDungId] = useState<string | undefined>(undefined);
    const [phongBanId, setPhongBanId] = useState<string | undefined>(undefined);
    const [idDot, setIdDot] = useState<string | undefined>(undefined);
    const [quy, setQuy] = useState<number>(Math.floor((new Date().getMonth()) / 3) + 1);
    const [nam, setNam] = useState<number>(new Date().getFullYear());

    // Dropdown data
    const [dotOptions, setDotOptions] = useState<DropdownOption[]>([]);
    const [phongBanOptions, setPhongBanOptions] = useState<DropdownOption[]>([]);
    const [donViOptions, setDonViOptions] = useState<DropdownOption[]>([]);

    // Khi user info load xong -> set mặc định phongBanId, donViSuDungId theo role
    useEffect(() => {
        if (currentUser) {
            // LanhDaoCuc: donViSuDungId fix theo cục, phongBanId mặc định undefined (cho chọn)
            if (isLanhDaoCuc) {
                if (!isGuidEmpty(userDonViId)) {
                    setDonViSuDungId(userDonViId);
                }
            }
            // TruongPhongCuc hoặc role khác: fix phòng ban theo tài khoản
            else if (!isGuidEmpty(userDepartmentId)) {
                setPhongBanId(userDepartmentId);
            }
        }
    }, [currentUser, isLanhDaoCuc, userDonViId, userDepartmentId]);

    // Load dropdowns
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [dots, depts] = await Promise.all([
                    kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown(),
                    departmentService.getDropDepartment(),
                ]);
                setDotOptions(dots || []);
                if (depts && (depts as any).data) {
                    setPhongBanOptions((depts as any).data);
                } else if (Array.isArray(depts)) {
                    setPhongBanOptions(depts);
                }
            } catch (err) {
                console.error("Lỗi tải dữ liệu bộ lọc:", err);
            }
        };
        fetchDropdowns();
    }, []);

    // Fetch report data
    const fetchTongHopData = useCallback(async () => {
        setLoading(true);
        try {
            if (phamVi === "PhongBan") {
                const searchData: KPI_TongHopTieuChiChungSearchDto = {
                    type,
                    phongBanId: isGuidEmpty(phongBanId) ? undefined : phongBanId,
                    idDot: type === "Thang" ? (isGuidEmpty(idDot) ? undefined : idDot) : undefined,
                    quy: type === "Quy" ? quy : undefined,
                    nam: type === "Quy" ? nam : undefined,
                };

                const res = await kPI_TieuChiChung_DiemSoService.getTongHopTieuChi(searchData);
                if (res && res.status && res.data) {
                    setData(res.data);
                    if (!phongBanId && !isGuidEmpty(res.data.phongBanId)) {
                        setPhongBanId(res.data.phongBanId);
                    }
                    if (type === "Thang" && !idDot && !isGuidEmpty(res.data.idDot)) {
                        setIdDot(res.data.idDot);
                    }
                } else {
                    toast.error(res?.message || "Không thể tải dữ liệu tổng hợp phòng ban.");
                }
            } else {
                const searchData: KPI_TongHopTieuChiChungSearchDto = {
                    type,
                    donViSuDungId: isGuidEmpty(donViSuDungId) ? undefined : donViSuDungId,
                    phongBanId: isGuidEmpty(phongBanId) ? undefined : phongBanId,
                    idDot: type === "Thang" ? (isGuidEmpty(idDot) ? undefined : idDot) : undefined,
                    quy: type === "Quy" ? quy : undefined,
                    nam: type === "Quy" ? nam : undefined,
                };

                const res = await kPI_TieuChiChung_DiemSoService.getTongHopToanCuc(searchData);
                if (res && res.status && res.data) {
                    setDataToanCuc(res.data);
                    if (!donViSuDungId && !isGuidEmpty(res.data.donViSuDungId)) {
                        setDonViSuDungId(res.data.donViSuDungId);
                    }
                    if (type === "Thang" && !idDot && !isGuidEmpty(res.data.idDot)) {
                        setIdDot(res.data.idDot);
                    }
                } else {
                    toast.error(res?.message || "Không thể tải dữ liệu tổng hợp toàn cục.");
                }
            }
        } catch (err) {
            console.error("Lỗi tải tổng hợp:", err);
            toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    }, [type, phamVi, donViSuDungId, phongBanId, idDot, quy, nam]);

    // Initial fetch when switching type or phamVi
    useEffect(() => {
        fetchTongHopData();
    }, [type, phamVi]);

    const handleSearch = () => {
        fetchTongHopData();
    };

    const handleReset = () => {
        // Reset lại nhưng giữ giá trị fix theo role
        if (isLanhDaoCuc) {
            setDonViSuDungId(isGuidEmpty(userDonViId) ? undefined : userDonViId);
            setPhongBanId(undefined);
        } else {
            setDonViSuDungId(undefined);
            setPhongBanId(isGuidEmpty(userDepartmentId) ? undefined : userDepartmentId);
        }
        setIdDot(undefined);
        setQuy(Math.floor((new Date().getMonth()) / 3) + 1);
        setNam(new Date().getFullYear());
        setTimeout(() => {
            fetchTongHopData();
        }, 100);
    };

    const handlePrint = () => {
        window.print();
    };

    const toRoman = (num: number): string => {
        const romanMap: [number, string][] = [
            [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
        ];
        let result = "";
        for (const [val, char] of romanMap) {
            while (num >= val) {
                result += char;
                num -= val;
            }
        }
        return result || `${num}`;
    };

    const listNhanSu = useMemo(() => {
        if (phamVi === "PhongBan") {
            return (data?.listThongTinNhanSu || []).map((item, idx) => ({
                ...item,
                stt: idx + 1,
                isDepartment: false,
            }));
        } else {
            const listPB = dataToanCuc?.listPhongBan || [];
            return listPB.map((pb: any, index: number) => {
                const children = (pb.listThongTinNhanSu || []).map((child: any, childIdx: number) => ({
                    ...child,
                    stt: childIdx + 1,
                    isDepartment: false,
                    key: child.lyLichId || `child-${index}-${childIdx}`,
                }));

                if (type === "Thang") {
                    let sumKH = 0, sumDX = 0, sumTT = 0, sumDiem = 0, sumThang70 = 0, countDiem = 0, sumChung = 0, countChung = 0;
                    children.forEach((c: any) => {
                        sumKH += c.diemTheoBTC_TrongKeHoach || 0;
                        sumDX += c.diemTheoBTC_DamNhanDotXuat || 0;
                        sumTT += c.diemTheoBTC_TongThucTe || 0;
                        if (c.diemTieuChiKetQuaNV_TheoDiem != null) { sumDiem += c.diemTieuChiKetQuaNV_TheoDiem; countDiem++; }
                        if (c.diemTieuChiKetQuaNV_TheoThang != null) { sumThang70 += c.diemTieuChiKetQuaNV_TheoThang; }
                        if (c.diemTieuChiChung != null) { sumChung += c.diemTieuChiChung; countChung++; }
                    });
                    return {
                        lyLichId: pb.phongBanId || `dept-${index}`,
                        tenNhanSu: pb.tenPhongBan || "Phòng ban",
                        chucVu_txt: `${children.length} nhân sự`,
                        isDepartment: true,
                        sttRom: toRoman(index + 1),
                        diemTheoBTC_TrongKeHoach: Math.round(sumKH * 100) / 100,
                        diemTheoBTC_DamNhanDotXuat: Math.round(sumDX * 100) / 100,
                        diemTheoBTC_TongThucTe: Math.round(sumTT * 100) / 100,
                        diemTieuChiKetQuaNV_TheoDiem: countDiem > 0 ? Math.round((sumDiem / countDiem) * 100) / 100 : null,
                        diemTieuChiKetQuaNV_TheoThang: countDiem > 0 ? Math.round((sumThang70 / countDiem) * 100) / 100 : null,
                        diemTieuChiChung: countChung > 0 ? Math.round((sumChung / countChung) * 100) / 100 : null,
                        children: children.length > 0 ? children : undefined,
                    };
                } else {
                    let sumKH = 0, sumDX = 0, sumTT = 0;
                    let sumT1 = 0, countT1 = 0;
                    let sumT2 = 0, countT2 = 0;
                    let sumT3 = 0, countT3 = 0;
                    let sumTB = 0, countTB = 0;
                    let sumChung = 0, countChung = 0;
                    let sumQuy = 0, countQuy = 0;
                    children.forEach((c: any) => {
                        sumKH += c.diemTheoBTC_TrongKeHoach || 0;
                        sumDX += c.diemTheoBTC_DamNhanDotXuat || 0;
                        sumTT += c.diemTheoBTC_TongThucTe || 0;
                        if (c.diemTieuChiKQNhiemVu_ThangThuNhat != null) { sumT1 += c.diemTieuChiKQNhiemVu_ThangThuNhat; countT1++; }
                        if (c.diemTieuChiKQNhiemVu_ThangThuHai != null) { sumT2 += c.diemTieuChiKQNhiemVu_ThangThuHai; countT2++; }
                        if (c.diemTieuChiKQNhiemVu_ThangCuoi != null) { sumT3 += c.diemTieuChiKQNhiemVu_ThangCuoi; countT3++; }
                        if (c.diemTieuChiKQNhiemVu_TrungBinh != null) { sumTB += c.diemTieuChiKQNhiemVu_TrungBinh; countTB++; }
                        if (c.diemTieuChiChung != null) { sumChung += c.diemTieuChiChung; countChung++; }
                        if (c.diemTheoDoiDanhGiaQuy != null) { sumQuy += c.diemTheoDoiDanhGiaQuy; countQuy++; }
                    });
                    return {
                        lyLichId: pb.phongBanId || `dept-${index}`,
                        tenNhanSu: pb.tenPhongBan || "Phòng ban",
                        chucVu_txt: `${children.length} nhân sự`,
                        isDepartment: true,
                        sttRom: toRoman(index + 1),
                        diemTheoBTC_TrongKeHoach: Math.round(sumKH * 100) / 100,
                        diemTheoBTC_DamNhanDotXuat: Math.round(sumDX * 100) / 100,
                        diemTheoBTC_TongThucTe: Math.round(sumTT * 100) / 100,
                        diemTieuChiKQNhiemVu_ThangThuNhat: countT1 > 0 ? Math.round((sumT1 / countT1) * 100) / 100 : null,
                        diemTieuChiKQNhiemVu_ThangThuHai: countT2 > 0 ? Math.round((sumT2 / countT2) * 100) / 100 : null,
                        diemTieuChiKQNhiemVu_ThangCuoi: countT3 > 0 ? Math.round((sumT3 / countT3) * 100) / 100 : null,
                        diemTieuChiKQNhiemVu_TrungBinh: countTB > 0 ? Math.round((sumTB / countTB) * 100) / 100 : null,
                        diemTieuChiChung: countChung > 0 ? Math.round((sumChung / countChung) * 100) / 100 : null,
                        diemTheoDoiDanhGiaQuy: countQuy > 0 ? Math.round((sumQuy / countQuy) * 100) / 100 : null,
                        children: children.length > 0 ? children : undefined,
                    };
                }
            });
        }
    }, [data, dataToanCuc, phamVi, type]);

    // Cấu trúc cột Mẫu số 03 (Theo Tháng)
    const columnsThang: TableProps<KPI_TongHopTieuChiChungNhanSuDto>["columns"] = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 70,
            align: "center",
            render: (_: any, record: any, index: number) => {
                if (record.isDepartment) {
                    return <Tag color="blue" style={{ fontWeight: 700, fontSize: "13px" }}>{record.sttRom || (index + 1)}</Tag>;
                }
                return <Text strong>{record.stt || index + 1}</Text>;
            },
        },
        {
            title: "Họ và tên / Phòng ban",
            dataIndex: "tenNhanSu",
            key: "tenNhanSu",
            width: 220,
            align: "left",
            render: (val: string, record: any) => {
                if (record.isDepartment) {
                    return (
                        <Text strong style={{ color: "#0355a2", fontSize: "15px" }} className="uppercase tracking-wide">
                            {val || "-"}
                        </Text>
                    );
                }
                return (
                    <Text strong style={{ color: "#1f1f1f", fontSize: "14px", paddingLeft: "12px" }}>
                        {val || "-"}
                    </Text>
                );
            },
        },
        {
            title: "Chức vụ / Số lượng",
            dataIndex: "chucVu_txt",
            key: "chucVu_txt",
            width: 160,
            align: "left",
            render: (val: string, record: any) => {
                if (record.isDepartment) {
                    return <Tag color="cyan" style={{ fontWeight: 600 }}>{val || "-"}</Tag>;
                }
                return <Text type="secondary">{val || "-"}</Text>;
            },
        },
        {
            title: "Điểm nhiệm vụ theo Bộ tiêu chí",
            key: "boTieuChi",
            children: [
                {
                    title: "Nhiệm vụ trong kế hoạch",
                    dataIndex: "diemTheoBTC_TrongKeHoach",
                    key: "diemTheoBTC_TrongKeHoach",
                    width: 150,
                    align: "right",
                    render: (val: number) => val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0,
                },
                {
                    title: "Nhiệm vụ phát sinh / đột xuất",
                    dataIndex: "diemTheoBTC_DamNhanDotXuat",
                    key: "diemTheoBTC_DamNhanDotXuat",
                    width: 150,
                    align: "right",
                    render: (val: number) => val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0,
                },
                {
                    title: "Tổng điểm thực tế",
                    dataIndex: "diemTheoBTC_TongThucTe",
                    key: "diemTheoBTC_TongThucTe",
                    width: 140,
                    align: "right",
                    render: (val: number) => (
                        <Tag color="blue" style={{ fontWeight: 600, fontSize: "13px", padding: "2px 8px" }}>
                            {val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0}
                        </Tag>
                    ),
                },
            ],
        },
        {
            title: "Kết quả thực hiện nhiệm vụ",
            key: "ketQuaNV",
            children: [
                {
                    title: "Tỷ lệ hoàn thành (%)",
                    dataIndex: "diemTieuChiKetQuaNV_TheoDiem",
                    key: "diemTieuChiKetQuaNV_TheoDiem",
                    width: 140,
                    align: "right",
                    render: (val: number) =>
                        val != null ? (
                            <Tag color="cyan" style={{ fontWeight: 600, fontSize: "13px" }}>
                                {Number(val).toFixed(2).replace(/\.00$/, '')}%
                            </Tag>
                        ) : (
                            "-"
                        ),
                },
                {
                    title: "Điểm quy đổi (Thang 70)",
                    dataIndex: "diemTieuChiKetQuaNV_TheoThang",
                    key: "diemTieuChiKetQuaNV_TheoThang",
                    width: 160,
                    align: "right",
                    render: (val: number) =>
                        val != null ? (
                            <Tag color="green" style={{ fontWeight: 700, fontSize: "14px", padding: "4px 10px" }}>
                                {Number(val).toFixed(2).replace(/\.00$/, '')}
                            </Tag>
                        ) : (
                            "-"
                        ),
                },
            ],
        },
        {
            title: "Điểm tiêu chí chung",
            dataIndex: "diemTieuChiChung",
            key: "diemTieuChiChung",
            width: 150,
            align: "right",
            render: (val: number) =>
                val != null ? (
                    <Tag color="purple" style={{ fontWeight: 600, fontSize: "13px" }}>
                        {Number(val).toFixed(2).replace(/\.00$/, '')}
                    </Tag>
                ) : (
                    "-"
                ),
        },
        {
            title: "Ghi chú / Giải trình",
            dataIndex: "ghiChu",
            key: "ghiChu",
            width: 220,
            align: "left",
            render: (val: string) => <Text type="secondary">{val || "-"}</Text>,
        },
    ];

    // Cấu trúc cột Mẫu số 04 (Theo Quý)
    const columnsQuy: TableProps<KPI_TongHopTieuChiChungNhanSuDto>["columns"] = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 70,
            align: "center",
            render: (_: any, record: any, index: number) => {
                if (record.isDepartment) {
                    return <Tag color="blue" style={{ fontWeight: 700, fontSize: "13px" }}>{record.sttRom || (index + 1)}</Tag>;
                }
                return <Text strong>{record.stt || index + 1}</Text>;
            },
        },
        {
            title: "Họ và tên / Phòng ban",
            dataIndex: "tenNhanSu",
            key: "tenNhanSu",
            width: 220,
            align: "left",
            render: (val: string, record: any) => {
                if (record.isDepartment) {
                    return (
                        <Text strong style={{ color: "#0355a2", fontSize: "15px" }} className="uppercase tracking-wide">
                            {val || "-"}
                        </Text>
                    );
                }
                return (
                    <Text strong style={{ color: "#1f1f1f", fontSize: "14px", paddingLeft: "12px" }}>
                        {val || "-"}
                    </Text>
                );
            },
        },
        {
            title: (
                <div style={{ textAlign: "center" }}>
                    Chức vụ / Số lượng<br /><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "12px" }}>(3)</span>
                </div>
            ),
            dataIndex: "chucVu_txt",
            key: "chucVu_txt",
            width: 160,
            align: "left",
            render: (val: string, record: any) => {
                if (record.isDepartment) {
                    return <Tag color="cyan" style={{ fontWeight: 600 }}>{val || "-"}</Tag>;
                }
                return <Text type="secondary">{val || "-"}</Text>;
            },
        },
        {
            title: "Điểm nhiệm vụ theo Bộ tiêu chí",
            key: "boTieuChiQuy",
            children: [
                {
                    title: "Nhiệm vụ trong kế hoạch",
                    dataIndex: "diemTheoBTC_TrongKeHoach",
                    key: "diemTheoBTC_TrongKeHoach",
                    width: 150,
                    align: "right",
                    render: (val: number) => val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0,
                },
                {
                    title: "Nhiệm vụ phát sinh / đột xuất",
                    dataIndex: "diemTheoBTC_DamNhanDotXuat",
                    key: "diemTheoBTC_DamNhanDotXuat",
                    width: 150,
                    align: "right",
                    render: (val: number) => val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0,
                },
                {
                    title: "Tổng điểm thực tế",
                    dataIndex: "diemTheoBTC_TongThucTe",
                    key: "diemTheoBTC_TongThucTe",
                    width: 140,
                    align: "right",
                    render: (val: number) => (
                        <Tag color="blue" style={{ fontWeight: 600, fontSize: "13px", padding: "2px 8px" }}>
                            {val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : 0}
                        </Tag>
                    ),
                },
            ],
        },
        {
            title: "Kết quả thực hiện nhiệm vụ các tháng",
            key: "ketQuaNVQuy",
            children: [
                {
                    title: (
                        <div style={{ textAlign: "center" }}>
                            Tháng thứ nhất<br /><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "12px" }}>(4)</span>
                        </div>
                    ),
                    dataIndex: "diemTieuChiKQNhiemVu_ThangThuNhat",
                    key: "diemTieuChiKQNhiemVu_ThangThuNhat",
                    width: 130,
                    align: "right",
                    render: (val: number) => (val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : "-"),
                },
                {
                    title: (
                        <div style={{ textAlign: "center" }}>
                            Tháng thứ hai<br /><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "12px" }}>(5)</span>
                        </div>
                    ),
                    dataIndex: "diemTieuChiKQNhiemVu_ThangThuHai",
                    key: "diemTieuChiKQNhiemVu_ThangThuHai",
                    width: 130,
                    align: "right",
                    render: (val: number) => (val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : "-"),
                },
                {
                    title: (
                        <div style={{ textAlign: "center" }}>
                            Tháng cuối quý<br /><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "12px" }}>(6)</span>
                        </div>
                    ),
                    dataIndex: "diemTieuChiKQNhiemVu_ThangCuoi",
                    key: "diemTieuChiKQNhiemVu_ThangCuoi",
                    width: 130,
                    align: "right",
                    render: (val: number) => (val != null ? Number(val).toFixed(2).replace(/\.00$/, '') : "-"),
                },
                {
                    title: (
                        <div style={{ textAlign: "center" }}>
                            Điểm trung bình quý<br /><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "12px" }}>(7)=(4+5+6)/3</span>
                        </div>
                    ),
                    dataIndex: "diemTieuChiKQNhiemVu_TrungBinh",
                    key: "diemTieuChiKQNhiemVu_TrungBinh",
                    width: 160,
                    align: "right",
                    render: (val: number) =>
                        val != null ? (
                            <Tag color="blue" style={{ fontWeight: 600, fontSize: "13px", padding: "2px 8px" }}>
                                {Number(val).toFixed(2).replace(/\.00$/, '')}
                            </Tag>
                        ) : (
                            "-"
                        ),
                },
            ],
        },
        {
            title: (
                <div style={{ textAlign: "center" }}>
                    Điểm tiêu chí chung<br /><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "12px" }}>(8)</span>
                </div>
            ),
            dataIndex: "diemTieuChiChung",
            key: "diemTieuChiChung",
            width: 150,
            align: "right",
            render: (val: number) =>
                val != null ? (
                    <Tag color="purple" style={{ fontWeight: 600, fontSize: "13px" }}>
                        {Number(val).toFixed(2).replace(/\.00$/, '')}
                    </Tag>
                ) : (
                    "-"
                ),
        },
        {
            title: (
                <div style={{ textAlign: "center" }}>
                    Tổng điểm đánh giá Quý<br /><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "12px" }}>(9)=(7)+(8)</span>
                </div>
            ),
            dataIndex: "diemTheoDoiDanhGiaQuy",
            key: "diemTheoDoiDanhGiaQuy",
            width: 180,
            align: "right",
            render: (val: number) =>
                val != null ? (
                    <Tag color="green" style={{ fontWeight: 700, fontSize: "14px", padding: "4px 10px" }}>
                        {Number(val).toFixed(2).replace(/\.00$/, '')}
                    </Tag>
                ) : (
                    "-"
                ),
        },
        {
            title: (
                <div style={{ textAlign: "center" }}>
                    Ghi chú / Giải trình<br /><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "12px" }}>(10)</span>
                </div>
            ),
            dataIndex: "ghiChu",
            key: "ghiChu",
            width: 220,
            align: "left",
            render: (val: string) => <Text type="secondary">{val || "-"}</Text>,
        },
    ];

    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        headerBg: "#0355a2",
                        headerColor: "#ffffff",
                    },
                },
            }}
        >
            <div className="p-6 bg-slate-50 min-h-screen">
                <AutoBreadcrumb />

                {/* Filter Card */}
                <Card
                    bordered={false}
                    className="mb-6 shadow-sm rounded-2xl bg-white transition-all duration-300"
                    bodyStyle={{ padding: "24px" }}
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                <TableOutlined className="text-lg" />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
                                    Tổng hợp Kết quả Theo dõi, Đánh giá
                                </Title>
                                <Text className="text-slate-500 text-xs">
                                    Xem báo cáo chi tiết theo biểu mẫu Mẫu số 03 (Tháng) & Mẫu số 04 (Quý)
                                </Text>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {canViewToanCuc ? (
                                <Segmented
                                    size="medium"
                                    value={phamVi}
                                    onChange={(val) => setPhamVi(val as "PhongBan" | "ToanCuc")}
                                    options={[
                                        { label: "Theo Phòng ban", value: "PhongBan" },
                                        { label: "Toàn cục (Theo Đơn vị)", value: "ToanCuc" },
                                    ]}
                                    className="bg-blue-50 border border-blue-100 p-1 rounded-xl font-semibold text-blue-700"
                                />
                            ) : (
                                <Tag color="blue" className="text-sm font-semibold px-3 py-1 rounded-xl">
                                    Theo Phòng ban
                                </Tag>
                            )}
                            <Segmented
                                size="medium"
                                value={type}
                                onChange={(val) => setType(val as "Thang" | "Quy")}
                                options={[
                                    { label: "Theo Tháng (Mẫu số 03)", value: "Thang" },
                                    { label: "Theo Quý (Mẫu số 04)", value: "Quy" },
                                ]}
                                className="bg-slate-100 p-1 rounded-xl font-medium"
                            />
                        </div>
                    </div>

                    {/* Controls Form */}
                    <Row gutter={[16, 16]} align="middle">
                        {phamVi === "ToanCuc" ? (
                            <Col xs={24} sm={12} md={6}>
                                <div className="flex flex-col gap-1.5">
                                    <Text className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                        <ApartmentOutlined /> Đơn vị sử dụng
                                    </Text>
                                    <Select
                                        size="medium"
                                        placeholder="Đơn vị theo tài khoản đăng nhập"
                                        value={isGuidEmpty(donViSuDungId) ? undefined : donViSuDungId}
                                        disabled
                                        options={[{
                                            value: donViSuDungId || "",
                                            label: currentUser?.tenDonVi_txt || "Đơn vị đăng nhập",
                                        }]}
                                        className="w-full rounded-xl"
                                    />
                                </div>
                            </Col>
                        ) : null}

                        <Col xs={24} sm={12} md={phamVi === "ToanCuc" ? 6 : (type === "Thang" ? 8 : 6)}>
                            <div className="flex flex-col gap-1.5">
                                <Text className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <ApartmentOutlined /> {phamVi === "ToanCuc" ? "Lọc theo Phòng ban" : "Phòng ban / Đơn vị"}
                                </Text>
                                {canSelectPhongBan ? (
                                    <Select
                                        size="medium"
                                        placeholder={phamVi === "ToanCuc" ? "Tất cả phòng ban (hoặc Chọn phòng ban)" : "Hãy chọn phòng ban"}
                                        allowClear
                                        value={isGuidEmpty(phongBanId) ? undefined : phongBanId}
                                        onChange={(val) => setPhongBanId(val)}
                                        options={phongBanOptions.map((item: any) => ({
                                            value: item.value,
                                            label: item.text || item.label,
                                        }))}
                                        className="w-full rounded-xl"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                ) : (
                                    <Select
                                        size="medium"
                                        placeholder="Phòng ban theo tài khoản đăng nhập"
                                        value={isGuidEmpty(phongBanId) ? undefined : phongBanId}
                                        disabled
                                        options={phongBanOptions
                                            .filter((item: any) => item.value === phongBanId)
                                            .map((item: any) => ({
                                                value: item.value,
                                                label: item.text || item.label,
                                            }))}
                                        className="w-full rounded-xl"
                                    />
                                )}
                            </div>
                        </Col>

                        {type === "Thang" ? (
                            <Col xs={24} sm={12} md={phamVi === "ToanCuc" ? 6 : 8}>
                                <div className="flex flex-col gap-1.5">
                                    <Text className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                        <CalendarOutlined /> Đợt đánh giá
                                    </Text>
                                    <Select
                                        size="medium"
                                        placeholder="Chọn đợt đánh giá (mặc định mới nhất)"
                                        allowClear
                                        value={idDot}
                                        onChange={(val) => setIdDot(val)}
                                        options={dotOptions.map((item: any) => ({
                                            value: item.value,
                                            label: item.text || item.label,
                                        }))}
                                        className="w-full rounded-xl"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </div>
                            </Col>
                        ) : (
                            <>
                                <Col xs={12} sm={6} md={phamVi === "ToanCuc" ? 3 : 4}>
                                    <div className="flex flex-col gap-1.5">
                                        <Text className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                            <CalendarOutlined /> Quý
                                        </Text>
                                        <Select
                                            size="medium"
                                            value={quy}
                                            onChange={(val) => setQuy(val)}
                                            options={[
                                                { value: 1, label: "Quý I" },
                                                { value: 2, label: "Quý II" },
                                                { value: 3, label: "Quý III" },
                                                { value: 4, label: "Quý IV" },
                                            ]}
                                            className="w-full rounded-xl"
                                        />
                                    </div>
                                </Col>
                                <Col xs={12} sm={6} md={phamVi === "ToanCuc" ? 3 : 4}>
                                    <div className="flex flex-col gap-1.5">
                                        <Text className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                            <CalendarOutlined /> Năm
                                        </Text>
                                        <Select
                                            size="medium"
                                            value={nam}
                                            onChange={(val) => setNam(val)}
                                            options={[
                                                { value: 2024, label: "Năm 2024" },
                                                { value: 2025, label: "Năm 2025" },
                                                { value: 2026, label: "Năm 2026" },
                                                { value: 2027, label: "Năm 2027" },
                                            ]}
                                            className="w-full rounded-xl"
                                        />
                                    </div>
                                </Col>
                            </>
                        )}

                        <Col xs={24} sm={24} md={phamVi === "ToanCuc" ? 6 : (type === "Thang" ? 8 : 10)} className="flex items-end justify-end mt-auto pt-5">
                            <Space size="middle" className="w-full justify-end">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleReset}
                                    className="rounded-xl border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-500 font-medium"
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleSearch}
                                    className="rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold shadow-md shadow-blue-500/20 px-4"
                                >
                                    Tìm kiếm
                                </Button>
                                <Button
                                    icon={<PrinterOutlined />}
                                    onClick={handlePrint}
                                    className="rounded-xl border-slate-300 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 font-medium hidden sm:inline-flex items-center"
                                >
                                    In bảng
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Table Content Card */}
                <Card
                    bordered={false}
                    className="shadow-sm rounded-2xl bg-white overflow-hidden"
                    bodyStyle={{ padding: "28px" }}
                >
                    {/* Business Report Title Header */}
                    <div className="text-center mb-8 pb-6 border-b border-slate-100">
                        <Title level={3} style={{ color: "#1e293b", margin: "0 0 8px 0", letterSpacing: "0.5px" }}>
                            {type === "Thang"
                                ? `BẢNG TỔNG HỢP KẾT QUẢ THỰC HIỆN NHIỆM VỤ ${phamVi === "ToanCuc" ? (dataToanCuc?.tenDot?.toUpperCase() || "") : (data?.tenDot?.toUpperCase() || "")}`
                                : `BẢNG TỔNG HỢP KẾT QUẢ THEO DÕI, ĐÁNH GIÁ ${phamVi === "ToanCuc" ? (dataToanCuc?.tenDot?.toUpperCase() || "") : (data?.tenDot?.toUpperCase() || "")}`}
                        </Title>
                        <div className="flex items-center justify-center gap-4 text-slate-600 font-medium text-sm flex-wrap">
                            {phamVi === "PhongBan" ? (
                                <div className="flex items-center gap-1.5">
                                    <span>Phòng ban / Đơn vị:</span>
                                    <Text strong className="text-blue-600">
                                        {!isGuidEmpty(data?.tenPhongBan)
                                            ? data?.tenPhongBan
                                            : (!isGuidEmpty(phongBanId)
                                                ? phongBanOptions.find((p: any) => p.value === phongBanId)?.label || "Phòng ban"
                                                : "Hãy chọn phòng ban")}
                                    </Text>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <span>Đơn vị sử dụng (Toàn cục):</span>
                                    <Text strong className="text-blue-600">
                                        {!isGuidEmpty(dataToanCuc?.tenDonViSuDung)
                                            ? dataToanCuc?.tenDonViSuDung
                                            : "Toàn bộ đơn vị / Tất cả phòng ban"}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>

                    <Spin spinning={loading} tip="Đang tổng hợp dữ liệu..." size="large">
                        <Table
                            bordered
                            columns={type === "Thang" ? columnsThang : columnsQuy}
                            dataSource={listNhanSu}
                            rowKey="lyLichId"
                            rowClassName={(record: any) => (record.isDepartment ? "bg-blue-50/80 font-semibold" : "")}
                            pagination={false}
                            expandable={phamVi === "ToanCuc" ? { defaultExpandAllRows: true } : undefined}
                            scroll={{ x: 1200 }}
                            summary={(pageData) => {
                                if (!pageData || pageData.length === 0) return null;

                                const allEmployees = phamVi === "ToanCuc"
                                    ? (dataToanCuc?.listPhongBan?.flatMap((pb: any) => pb.listThongTinNhanSu || []) || [])
                                    : pageData;

                                if (allEmployees.length === 0) return null;

                                if (type === "Thang") {
                                    let sumKH = 0;
                                    let sumDX = 0;
                                    let sumTT = 0;
                                    let sumDiem = 0;
                                    let sumThang70 = 0;
                                    let countDiem = 0;
                                    let sumChung = 0;
                                    let countChung = 0;

                                    allEmployees.forEach((item: any) => {
                                        sumKH += item.diemTheoBTC_TrongKeHoach || 0;
                                        sumDX += item.diemTheoBTC_DamNhanDotXuat || 0;
                                        sumTT += item.diemTheoBTC_TongThucTe || 0;
                                        if (item.diemTieuChiKetQuaNV_TheoDiem != null) {
                                            sumDiem += item.diemTieuChiKetQuaNV_TheoDiem;
                                            countDiem += 1;
                                        }
                                        if (item.diemTieuChiKetQuaNV_TheoThang != null) {
                                            sumThang70 += item.diemTieuChiKetQuaNV_TheoThang;
                                        }
                                        if (item.diemTieuChiChung != null) {
                                            sumChung += item.diemTieuChiChung;
                                            countChung += 1;
                                        }
                                    });

                                    const avgDiem = countDiem > 0 ? (sumDiem / countDiem).toFixed(2).replace(/\.00$/, '') : "-";
                                    const avgThang70 = countDiem > 0 ? (sumThang70 / countDiem).toFixed(2).replace(/\.00$/, '') : "-";
                                    const avgChung = countChung > 0 ? (sumChung / countChung).toFixed(2).replace(/\.00$/, '') : "-";

                                    return (
                                        <Table.Summary.Row className="bg-slate-50 font-semibold">
                                            <Table.Summary.Cell index={0} align="center">
                                                <Text strong>TB / TỔNG</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1} colSpan={2}>
                                                <Text strong className="text-slate-700">
                                                    {phamVi === "ToanCuc" ? `Tổng hợp toàn cục (${allEmployees.length} nhân sự)` : `Tổng hợp (${allEmployees.length} nhân sự)`}
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={3} align="right">
                                                <Text strong>{Math.round(sumKH * 100) / 100}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={4} align="right">
                                                <Text strong>{Math.round(sumDX * 100) / 100}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={5} align="right">
                                                <Tag color="blue" style={{ fontWeight: 700, fontSize: "13px" }}>
                                                    {Math.round(sumTT * 100) / 100}
                                                </Tag>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={6} align="right">
                                                <Text strong className="text-cyan-600">
                                                    {avgDiem !== "-" ? `${avgDiem}%` : "-"}
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={7} align="right">
                                                <Tag color="green" style={{ fontWeight: 700, fontSize: "14px" }}>
                                                    {avgThang70}
                                                </Tag>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={8} align="right">
                                                {avgChung !== "-" ? (
                                                    <Tag color="purple" style={{ fontWeight: 700, fontSize: "13px" }}>
                                                        {avgChung}
                                                    </Tag>
                                                ) : (
                                                    "-"
                                                )}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={9} />
                                        </Table.Summary.Row>
                                    );
                                } else {
                                    let sumKH = 0, sumDX = 0, sumTT = 0;
                                    let sumT1 = 0, countT1 = 0;
                                    let sumT2 = 0, countT2 = 0;
                                    let sumT3 = 0, countT3 = 0;
                                    let sumTB = 0, countTB = 0;
                                    let sumChung = 0, countChung = 0;
                                    let sumQuy = 0, countQuy = 0;

                                    allEmployees.forEach((item: any) => {
                                        sumKH += item.diemTheoBTC_TrongKeHoach || 0;
                                        sumDX += item.diemTheoBTC_DamNhanDotXuat || 0;
                                        sumTT += item.diemTheoBTC_TongThucTe || 0;
                                        if (item.diemTieuChiKQNhiemVu_ThangThuNhat != null) { sumT1 += item.diemTieuChiKQNhiemVu_ThangThuNhat; countT1++; }
                                        if (item.diemTieuChiKQNhiemVu_ThangThuHai != null) { sumT2 += item.diemTieuChiKQNhiemVu_ThangThuHai; countT2++; }
                                        if (item.diemTieuChiKQNhiemVu_ThangCuoi != null) { sumT3 += item.diemTieuChiKQNhiemVu_ThangCuoi; countT3++; }
                                        if (item.diemTieuChiKQNhiemVu_TrungBinh != null) { sumTB += item.diemTieuChiKQNhiemVu_TrungBinh; countTB++; }
                                        if (item.diemTieuChiChung != null) { sumChung += item.diemTieuChiChung; countChung++; }
                                        if (item.diemTheoDoiDanhGiaQuy != null) { sumQuy += item.diemTheoDoiDanhGiaQuy; countQuy++; }
                                    });

                                    return (
                                        <Table.Summary.Row className="bg-slate-50 font-semibold">
                                            <Table.Summary.Cell index={0} align="center">
                                                <Text strong>TB / TỔNG</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1} colSpan={2}>
                                                <Text strong className="text-slate-700">
                                                    {phamVi === "ToanCuc" ? `Tổng hợp toàn cục (${allEmployees.length} nhân sự)` : `Tổng hợp toàn phòng (${allEmployees.length} nhân sự)`}
                                                </Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={3} align="right">
                                                <Text strong>{Math.round(sumKH * 100) / 100}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={4} align="right">
                                                <Text strong>{Math.round(sumDX * 100) / 100}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={5} align="right">
                                                <Tag color="blue" style={{ fontWeight: 700, fontSize: "13px" }}>
                                                    {Math.round(sumTT * 100) / 100}
                                                </Tag>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={6} align="right">
                                                {countT1 > 0 ? (sumT1 / countT1).toFixed(2).replace(/\.00$/, '') : "-"}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={7} align="right">
                                                {countT2 > 0 ? (sumT2 / countT2).toFixed(2).replace(/\.00$/, '') : "-"}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={8} align="right">
                                                {countT3 > 0 ? (sumT3 / countT3).toFixed(2).replace(/\.00$/, '') : "-"}
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={9} align="right">
                                                <Tag color="blue" style={{ fontWeight: 700, fontSize: "13px" }}>
                                                    {countTB > 0 ? (sumTB / countTB).toFixed(2).replace(/\.00$/, '') : "-"}
                                                </Tag>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={10} align="right">
                                                <Tag color="purple" style={{ fontWeight: 700, fontSize: "13px" }}>
                                                    {countChung > 0 ? (sumChung / countChung).toFixed(2).replace(/\.00$/, '') : "-"}
                                                </Tag>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={11} align="right">
                                                <Tag color="green" style={{ fontWeight: 700, fontSize: "14px" }}>
                                                    {countQuy > 0 ? (sumQuy / countQuy).toFixed(2).replace(/\.00$/, '') : "-"}
                                                </Tag>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={12} />
                                        </Table.Summary.Row>
                                    );
                                }
                            }}
                        />
                    </Spin>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default withAuthorization(KPITongHopKetQuaTheoDoiPage, "");
