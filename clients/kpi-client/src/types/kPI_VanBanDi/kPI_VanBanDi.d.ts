import { EntityType, SearchBase } from "../general";

export interface KPI_VanBanDiType extends EntityType {
  doMat: number;
	departmentId: number;
	loaiVanBan: string;
	soHieu: string;
	doKhan: string;
	trichYeu: string;
	hanXuLy: Date;
	soBan: number;
	soDi: string;
	soVanBanId: number;
	ngayBanHanh: Date;
	isCapSo: boolean;
	ngayVanBan: Date;
	nguoiSoanThao: number;
	trichYeuNormalized: string;
	trangThai: string;
	ghiChu: string;
}

export interface KPI_VanBanDiCreateOrUpdateType {
  id?: string;
  doMat: number;
	departmentId: number;
	loaiVanBan: string;
	soHieu: string;
	doKhan: string;
	trichYeu: string;
	hanXuLy: Date;
	soBan: number;
	soDi: string;
	soVanBanId: number;
	ngayBanHanh: Date;
	isCapSo: boolean;
	ngayVanBan: Date;
	nguoiSoanThao: number;
	trichYeuNormalized: string;
	trangThai: string;
	ghiChu: string;
}

export interface KPI_VanBanDiSearchType extends SearchBase {
  doMat?: number;
	departmentId?: number;
	loaiVanBan?: string;
	soHieu?: string;
	doKhan?: string;
	trichYeu?: string;
	hanXuLyFrom?: Date;
	hanXuLyTo?: Date;
	soBan?: number;
	soDi?: string;
	soVanBanId?: number;
	ngayBanHanhFrom?: Date;
	ngayBanHanhTo?: Date;
	isCapSo?: boolean;
	ngayVanBanFrom?: Date;
	ngayVanBanTo?: Date;
	nguoiSoanThao?: number;
	trichYeuNormalized?: string;
	trangThai?: string;
	ghiChu?: string;
}
