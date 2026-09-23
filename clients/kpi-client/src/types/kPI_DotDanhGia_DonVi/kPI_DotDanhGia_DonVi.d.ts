import { EntityType, SearchBase } from "../general";

export interface KPI_DotDanhGia_DonViType extends EntityType {
  idDotDanhGia: string;
	idDonVi: string;
	idBoChiSoNhiemVu?: string;
	idBoTieuChiChung?: string;
}

export interface KPI_DotDanhGia_DonViCreateOrUpdateType {
  id?: string;
  idDotDanhGia: string;
	idDonVi: string;
	idBoChiSoNhiemVu?: string;
	idBoTieuChiChung?: string;
}

export interface KPI_DotDanhGia_DonViSearchType extends SearchBase {
  idDotDanhGia?: string;
	idDonVi?: string;
	idBoChiSoNhiemVu?: string;
	idBoTieuChiChung?: string;
}
