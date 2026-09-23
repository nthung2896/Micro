import { EntityType, SearchBase } from "../general";

export interface KPI_CauHinhCongThucNhiemVuType extends EntityType {
  idDonVi?: string | null;
	idDotDanhGia?: string | null;
	targetTable: string;
	targetColumn: string;
	fomula: string;
	tenDonVi?: string;
	tenDotDanhGia?: string;
	type?: string;
}

export interface KPI_CauHinhCongThucNhiemVuCreateOrUpdateType {
  id?: string;
  idDonVi?: string | null;
	idDotDanhGia?: string | null;
	targetTable: string;
	targetColumn: string;
	fomula: string;
}

export interface KPI_CauHinhCongThucNhiemVuSearchType extends SearchBase {
  idDonVi?: string;
	idDotDanhGia?: string;
	targetTable?: string;
	targetColumn?: string;
	fomula?: string;
}
