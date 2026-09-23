import { EntityType, SearchBase } from "@/types/general";

export interface TinTucDto extends EntityType {
  tieuDe: string;
  slug?: string | null;
  moTaNgan?: string | null;
  noiDung?: string | null;
  anhDaiDien?: string | null;
  danhMucId?: string | null;
  tenDanhMuc?: string | null;
  trangThai: number;
  trangThaiName?: string | null;
  ngayXuatBan?: string | null;
  luotXem: number;
  isNoiBat: boolean;
  thuTu?: number | null;
  tags?: string | null;
  departmentId?: string | null;
}

export interface TinTucSearch extends SearchBase {
  keyword?: string;
  danhMucId?: string;
  tenDanhMuc?: string;
  trangThai?: number;
  isNoiBat?: boolean;
  tuNgay?: string;
  denNgay?: string;
  departmentId?: string;
}

export interface TinTucCreateRequest {
  id?: string;
  tieuDe: string;
  slug?: string;
  moTaNgan?: string;
  noiDung?: string;
  anhDaiDien?: string;
  danhMucId?: string;
  tenDanhMuc?: string;
  trangThai: number;
  ngayXuatBan?: string;
  isNoiBat: boolean;
  thuTu?: number;
  tags?: string;
  departmentId?: string;
}
