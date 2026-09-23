import { EntityType, SearchBase } from "@/types/general";

export interface VanBanPhapLuatDto extends EntityType {
  soHieu: string;
  tenVanBan: string;
  donViBanHanh?: string | null;
  ngayBanHanh?: string | null;
  ngayHieuLuc?: string | null;
  loaiVanBan?: string | null;
  linhVuc?: string | null;
  trichYeu?: string | null;
  trangThai: number;
  trangThaiName?: string | null;
  thuTu?: number | null;
  fileDinhKem?: string | null;
}

export interface VanBanPhapLuatSearch extends SearchBase {
  keyword?: string;
  soHieu?: string;
  donViBanHanh?: string;
  loaiVanBan?: string;
  linhVuc?: string;
  trangThai?: number;
  tuNgay?: string;
  denNgay?: string;
}

export interface VanBanPhapLuatCreateRequest {
  id?: string;
  soHieu: string;
  tenVanBan: string;
  donViBanHanh?: string | null;
  ngayBanHanh?: string | null;
  ngayHieuLuc?: string | null;
  loaiVanBan?: string | null;
  linhVuc?: string | null;
  trichYeu?: string | null;
  trangThai: number;
  thuTu?: number | null;
  fileDinhKem?: string | null;
}
