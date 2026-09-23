import { EntityType, SearchBase } from "@/types/general";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

export interface LegalDocumentDto extends EntityType {
  loaiVanBan?: string | null;
  code?: string | null;
  publicDate?: string | null;
  publicBy?: string | null;
  activedDate?: string | null;
  expiredDate?: string | null;
  signedBy?: string | null;
  document: string;
  description?: string | null;
  content?: string | null;
  status?: string | null;
  statusName?: string | null;
  loaiHeThong?: string | null;
  loaiHeThongName?: string | null;
  dinhKem?: TaiLieuDinhKemType[] | null;
}

export interface LegalDocumentSearch extends SearchBase {
  keyword?: string;
  code?: string;
  loaiVanBan?: string;
  status?: string;
  loaiHeThong?: string;
  tuNgay?: string;
  denNgay?: string;
  publicBy?: string;
  signedBy?: string;
  activedDateFrom?: string;
  activedDateTo?: string;
  expiredDateFrom?: string;
  expiredDateTo?: string;
  description?: string;
}

export interface LegalDocumentCreateRequest {
  id?: string;
  loaiVanBan?: string | null;
  code?: string | null;
  publicDate?: string | null;
  publicBy?: string | null;
  activedDate?: string | null;
  expiredDate?: string | null;
  signedBy?: string | null;
  document: string;
  description?: string | null;
  content?: string | null;
  status?: string | null;
  loaiHeThong?: string | null;
}
