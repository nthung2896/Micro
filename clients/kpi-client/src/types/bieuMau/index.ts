import { EntityType, SearchBase } from "@/types/general";

export interface BieuMauDto extends EntityType {
  tenTaiLieu: string;
  moTa?: string | null;
  loaiBieuMau?: string | null;
  trangThai: number;
  trangThaiName?: string | null;
  thuTu?: number | null;
  fileDinhKem?: string | null;
}

export interface BieuMauSearch extends SearchBase {
  keyword?: string;
  loaiBieuMau?: string;
  trangThai?: number;
}

export interface BieuMauCreateRequest {
  id?: string;
  tenTaiLieu: string;
  moTa?: string | null;
  loaiBieuMau?: string | null;
  trangThai: number;
  thuTu?: number | null;
  fileDinhKem?: string | null;
}
