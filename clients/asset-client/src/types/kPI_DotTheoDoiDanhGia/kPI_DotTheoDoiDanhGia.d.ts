import { EntityType, SearchBase } from "../general";

export interface KPI_DotTheoDoiDanhGiaType extends EntityType {
  tenDotTheoDoiDanhGia: string;
	thang: number;
	quy: number;
	nam: number;
	thoiGianBatDau: Date;
	thoiGianKetThuc: Date;
	type: string;
	trangThai: string;
	defaultTieuChiChungName?: string;
	defaultTieuChiDonViName?: string;
	defaultTieuChiChung?: string;
	defaultTieuChiDonVi?: string;
}

export interface KPI_DotTheoDoiDanhGiaCreateOrUpdateType {
  id?: string;
  tenDotTheoDoiDanhGia: string;
	thang: number;
	quy: number;
	nam: number;
	thoiGianBatDau: Date;
	thoiGianKetThuc: Date;
	type: string;
	trangThai: string;

	defaultTieuChiChung?: string;
	defaultTieuChiDonVi?: string;
}

export interface KPI_DotTheoDoiDanhGiaCloneType extends KPI_DotTheoDoiDanhGiaCreateOrUpdateType {
  sourceId: string;
}

export interface KPI_DotTheoDoiDanhGiaSearchType extends SearchBase {
  tenDotTheoDoiDanhGia?: string;
	thang?: number;
	quy?: number;
	nam?: number;
	thoiGianBatDauFrom?: Date;
	thoiGianBatDauTo?: Date;
	thoiGianKetThucFrom?: Date;
	thoiGianKetThucTo?: Date;
	type?: string;
	trangThai?: string;
	defaultTieuChiChungName?: string;
	defaultTieuChiDonViName?: string;
	defaultTieuChiChung?: string;
	defaultTieuChiDonVi?: string;
}
