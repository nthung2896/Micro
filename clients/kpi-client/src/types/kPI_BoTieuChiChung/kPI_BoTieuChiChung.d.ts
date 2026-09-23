import { EntityType, SearchBase } from "../general";
import { KPI_BoTieuChiChungTypeValue } from "@/constants/KPI_BoTieuChiChungTypeConstant";

export interface KPI_BoTieuChiChungType extends EntityType {
  soQuyetDinh: string;
  tenBoTieuChiDonVi: string;
  type: KPI_BoTieuChiChungTypeValue | null;
  idDonVi?: string;
  idDot?: string;
  ngayQuyetDinh?: Date;
  apDungTuNgay?: Date;
  apDungToiNgay?: Date;
  isActive?: boolean;
  tenDot?: string;
  tenDonVi?: string;
  isAdmin?: boolean;
  IsAdmin?: boolean;
}

export interface KPI_BoTieuChiChungCreateOrUpdateType {
  id?: string;
  soQuyetDinh: string;
  tenBoTieuChiDonVi: string;
  type?: KPI_BoTieuChiChungTypeValue | null;
  idDonVi?: string;
  idDot?: string;
  ngayQuyetDinh?: Date;
  apDungTuNgay?: Date;
  apDungToiNgay?: Date;
  isActive?: boolean;
}

export interface KPI_BoTieuChiChungSearchType extends SearchBase {
  soQuyetDinh?: string;
  tenBoTieuChiDonVi?: string;
  type?: KPI_BoTieuChiChungTypeValue;
  idDonVi?: string;
  idDot?: string;
  isActive?: boolean;
}
