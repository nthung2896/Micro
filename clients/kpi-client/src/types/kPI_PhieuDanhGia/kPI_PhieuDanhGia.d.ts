import { EntityType, SearchBase } from "../general";

export interface KPI_PhieuDanhGiaType extends EntityType {
	idLyLich: string;
	hoTen?: string;
	idDotDanhGia?: string;
	donVi: string;
	tenDonVi?: string;
	phongBan: string;
	tenPhongBan?: string;
	diemTieuChiChung: number;
	diemThucHienNhiemVu: number;
	tongDiem: number;
	uuDiem: string;
	hanChe: string;
	yKienNhanXet: string;
}

export interface KPI_PhieuDanhGiaCreateOrUpdateType {
	id?: string;
	idLyLich: string;
	idDotDanhGia?: string;
	donVi: string;
	phongBan: string;
	diemTieuChiChung: number;
	diemThucHienNhiemVu: number;
	tongDiem: number;
	uuDiem: string;
	hanChe: string;
	yKienNhanXet: string;
}

export interface KPI_PhieuDanhGiaSearchType extends SearchBase {
	idLyLich?: string;
	idDotDanhGia?: string;
	nam?: number;
	thang?: number;
	donVi?: string;
	phongBan?: string;
	diemTieuChiChung?: number;
	diemThucHienNhiemVu?: number;
	tongDiem?: number;
	uuDiem?: string;
	hanChe?: string;
	yKienNhanXet?: string;
	idNguoiXuLy?: string;
	buttonLuong?: ButtonLuongDto | null;
	isXuLy?: boolean;
	isKhacHoanThanh?: boolean;
	[key: string]: any;
}

export interface DotDanhGiaWithPhieuType {
	idDotDanhGia: string;
	tenDotDanhGia: string;
	thang: number | null;
	quy: number | null;
	nam: number | null;
	thoiGianBatDau: string | null;
	thoiGianKetThuc: string | null;
	trangThaiDot: string;
	idPhieuDanhGia: string | null;
	idLyLich: string | null;
	idDonVi?: string | null;
	idPhongBan?: string | null;
	isCT_PCT: boolean;
	isTP_PTP: boolean;
	isPhoPhongTroLen?: boolean;
	isCT?: boolean;
	isPCT?: boolean;
	isTP?: boolean;
	isPTP?: boolean;
	chucVuNguoiThaoTac?: string | null;
	evaluationWorkflowType?: string | null;
	visibleEvaluationColumns?: EvaluationColumnDto[];
	evaluationRoleScores?: Record<string, EvaluationRoleScoreDto>;
	// Cờ cột hiển thị - do backend tính toán dựa trên chức vụ người đăng nhập
	showTruongPhongCol?: boolean;
	showPhoCucCol?: boolean;
	showCucTruongCol?: boolean;
	showPhoVuTruongCol?: boolean;
	showVuTruongCol?: boolean;
	tenChuPhieu?: string | null;
	chucVuChuPhieu?: string | null;
	donViChuPhieu?: string | null;
	phongBanChuPhieu?: string | null;
	idBoTieuChiChung?: string | null;
	idBoTieuChiNhiemVu?: string | null;
	tenBoTieuChiChung?: string | null;
	tenBoTieuChiNhiemVu?: string | null;
	diemTieuChiChung?: number | null;
	diemThucHienNhiemVu?: number | null;
	tongDiem: number | null;
	phoVuTruong_DiemThucHienNhiemVu?: number | null;
	phoVuTruong_DiemTieuChiChung?: number | null;
	phoVuTruong_TongDiem?: number | null;
	vuTruong_DiemThucHienNhiemVu?: number | null;
	vuTruong_DiemTieuChiChung?: number | null;
	vuTruong_TongDiem?: number | null;
	diemTheoBoTieuChi?: number | null;
	diemSoLuong?: number | null;
	diemChatLuong?: number | null;
	diemTienDo?: number | null;
	daDanhGia: boolean;
	daDanhGiaNhiemVu: boolean;
	thoiGianTao: Date;
	trangThai?: string | null;
	idNguoiXuLyHienTai?: string | null;
	tenNguoiXuLyHienTai?: string | null;
	trangThaiBuocXuLyHienThi?: string | null;
	luong?: number;
	buttonLuong?: ButtonLuongDto | null;
	isShowButton?: boolean;
}

export interface EvaluationColumnDto {
	roleCode: string;
	title: string;
	order: number;
	color: string;
	targetStatus: string;
	viewRoleCode?: string;
}

export interface EvaluationRoleScoreDto {
	diemTieuChiChung?: number | null;
	diemThucHienNhiemVu?: number | null;
	tongDiem?: number | null;
}

export interface ThongKePhieuDanhGiaTheoThangType {
	thang: number;
	idPhieuDanhGia: string | null;
	idDotDanhGia: string | null;
	tenDotDanhGia: string | null;
	diemTieuChiChung: number | null;
	diemThucHienNhiemVu: number | null;
	tongDiem: number | null;
	thoiGianTao: string | null;
	tenTieuChiChung: string;
	diemToiDaTieuChiChung: number;
	tenTieuChiKetQua: string;
	diemToiDaTieuChiKetQua: number;
	diemTheoBoTieuChi?: number | null;
	diemSoLuong?: number | null;
	diemChatLuong?: number | null;
	diemTienDo?: number | null;
	soLuongKhongHoanThanh?: number | null;
	chatLuongKhongDat?: number | null;
	tienDoChamMuon?: number | null;
}

export interface ButtonLuongDto {
	trangThaiHienTai: string;
	trangThaiTiepTheo: string;
	tenButton: string;
	chucVuNguoiXuLy?: string | null;
	canChonNguoiXuLy: boolean;
}

export interface ChuyenBuocLuongRequest {
	idPhieuDanhGia: string;
	idNguoiGui: string;
	idNguoiXuLy?: string;
	ghiChu?: string;
	isTuChoi?: boolean;
}

export interface ThuHoiPhieuRequest {
	idPhieuDanhGia: string;
	idNguoiThuHoi: string;
	ghiChu?: string;
}

export interface NguoiXuLyDto {
	id: string;
	hoTen: string;
	chucVu?: string;
}

export interface KPI_PhieuDanhGiaTabCountDto {
	choXuLy: number;
	daXuLy: number;
	daDuyet: number;
	tongNhanSu: number;
	daGui: number;
	chuaGui: number;
}

