import { EntityType, SearchBase } from "../general";
import { ButtonLuongDto, ChuyenBuocLuongRequest, ThuHoiPhieuRequest, NguoiXuLyDto } from "../kPI_PhieuDanhGia/kPI_PhieuDanhGia";

export interface CheckQuyenChamDiemDto {
    isOwner: boolean;
    canEdit: boolean;
    trangThai?: string;
}

export interface KPI_PhieuDanhGiaTapTheType extends EntityType {
    idDotDanhGia?: string;
    tenDotDanhGia?: string;
    donVi?: string;
    tenDonVi?: string;
    luong?: number;
    phongBan?: string;
    tenPhongBan?: string;
    diemTieuChiChung?: number;
    diemThucHienNhiemVu?: number;
    tongDiem?: number;
    chatLuongTuDanhGia?: number;
    tenChatLuongTuDanhGia?: string;
    chatLuongCapTrenDanhGia?: number;
    tenChatLuongCapTrenDanhGia?: string;
    trangThai?: string;
    buttonLuong?: ButtonLuongDto | null;
    idBoTieuChiChung?: string;
    tenBoTieuChiChung?: string;
    idBoTieuChiNhiemVu?: string;
    tenBoTieuChiNhiemVu?: string;
    thoiGianBatDau?: string;
    thoiGianKetThuc?: string;
    thang?: number;
    quy?: number;
    nam?: number;
    trangThaiDot?: string;
}

export interface KPI_PhieuDanhGiaTapTheCreateOrUpdateType {
    id?: string;
    idDotDanhGia?: string;
    donVi?: string;
    luong?: number;
    phongBan?: string;
    diemTieuChiChung?: number;
    diemThucHienNhiemVu?: number;
    tongDiem?: number;
    chatLuongTuDanhGia?: number;
    chatLuongCapTrenDanhGia?: number;
    trangThai?: string;
}

export interface KPI_PhieuDanhGiaTapTheSearchType extends SearchBase {
    idDotDanhGia?: string;
    donVi?: string;
    idDonVi?: string;
    luong?: number;
    phongBan?: string;
    idPhongBan?: string;
    diemTieuChiChung?: number;
    diemThucHienNhiemVu?: number;
    tongDiem?: number;
    chatLuongTuDanhGia?: number;
    chatLuongCapTrenDanhGia?: number;
    trangThai?: string;
    idNguoiXuLy?: string;
    isXuLy?: boolean;
    isKhacHoanThanh?: boolean;
    quy?: number;
    thang?: number;
    nam?: number;
    [key: string]: any;
}

export interface DotDanhGiaWithPhieuTapTheType {
    idDotDanhGia: string;
    tenDotDanhGia: string;
    thang: number | null;
    quy: number | null;
    nam: number | null;
    thoiGianBatDau: string | null;
    thoiGianKetThuc: string | null;
    trangThaiDot: string;

    idPhieuDanhGia: string | null;
    idDonVi: string | null;
    tenDonVi: string | null;
    phongBan: string | null;
    tenPhongBan: string | null;

    idBoTieuChiChung?: string | null;
    tenBoTieuChiChung?: string | null;
    idBoTieuChiNhiemVu?: string | null;
    tenBoTieuChiNhiemVu?: string | null;

    diemTieuChiChung?: number | null;
    diemThucHienNhiemVu?: number | null;
    tongDiem: number | null;
    diemCapTrenTieuChiChung?: number | null;
    diemCapTrenThucHienNhiemVu?: number | null;
    diemCapTrenTongDiem?: number | null;
    chatLuongTuDanhGia?: number | null;
    tenChatLuongTuDanhGia?: string | null;
    chatLuongCapTrenDanhGia?: number | null;
    tenChatLuongCapTrenDanhGia?: string | null;

    daDanhGia: boolean;
    thoiGianTao: string | null;
    trangThai?: string | null;
    luong?: number | null;
    buttonLuong?: ButtonLuongDto | null;
}

export interface KPI_PhieuDanhGiaTapTheTabCountDto {
    choXuLy: number;
    daXuLy: number;
    hoanThanh: number;
    tatCa: number;
}

export interface KPI_TieuChiTapTheTreeDto {
    id: string;
    ten: string;
    parentId?: string | null;
    diemToiDa?: number | null;
    priority?: number | null;
    idBoTieuChi?: string | null;
    tenBoTieuChi?: string | null;
    stt: string;
    diemTuCham?: number | null;
    diemCapTren?: number | null;
    ghiChu?: string | null;
    children?: KPI_TieuChiTapTheTreeDto[];
}

export interface ScoreTapTheItemType {
    idTieuChi: string;
    diemTuCham?: number | null;
    diemCapTren?: number | null;
    ghiChu?: string | null;
}

export interface SaveScoresTapTheType {
    idPhieuDanhGia: string;
    diemTieuChiChung?: number | null;
    diemThucHienNhiemVu?: number | null;
    tongDiem?: number | null;
    chatLuongTuDanhGia?: number | null;
    chatLuongCapTrenDanhGia?: number | null;
    scores: ScoreTapTheItemType[];
}

