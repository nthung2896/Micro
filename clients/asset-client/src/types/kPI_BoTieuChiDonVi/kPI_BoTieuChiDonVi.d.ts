import { EntityType, SearchBase } from "../general";

export interface KPI_BoTieuChiDonViType extends EntityType {
	soQuyetDinh: string;
	ngayQuyetDinh?: Date;
	tenBoTieuChiDonVi: string;
	idDonVi: string;
	tenDonVi?: string;
	idDot: string;
	tenDot?: string;
	apDungTuNgay: Date;
	apDungToiNgay: Date;
	cauHinhDiemLanhDaoText?: string;
	is_locked?: boolean;
	isAdmin?: boolean;
	IsAdmin?: boolean;
}

export interface KPI_BoTieuChiDonViCreateOrUpdateType {
	id?: string;
	soQuyetDinh: string;
	tenBoTieuChiDonVi: string;
	idDonVi: string;
	idDot: string;
	apDungTuNgay: Date;
	apDungToiNgay: Date;
}

export interface KPI_BoTieuChiDonViSearchType extends SearchBase {
	soQuyetDinh?: string;
	tenBoTieuChiDonVi?: string;
	idDonVi?: string;
	listIdDonVi?: string[];
	idDot?: string;
	apDungTuNgay?: Date;
	apDungToiNgay?: Date;
	is_locked?: boolean | null;
}
