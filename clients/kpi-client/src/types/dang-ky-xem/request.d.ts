import { SearchBase } from "@/types/general";

export interface DangKyXemRequestType {
  id?: string;
  hoTen?: string;
  noiDung?: string;
  noiDungKhac?: string;
  trangThai?: number;
  lyDoTuChoi?: string;
  nenTangMuonXem?: string;
  noiDungMuonXem?: string;
  typeGuiDeXuat?: number;
  tuNgay?: string | null;
  denNgay?: string | null;
}

export interface DangKyXemSearchType extends SearchBase {
  query?: string;
  hoTenFilter?: string;
  noiDungFilter?: string;
  trangThaiFilter?: number;
  nenTangMuonXemFilter?: string;
  typeGuiDeXuatFilter?: number;
}

import { PlatformManageSearchType } from "../platformManage/request";

export interface DangKyXemNenTangSearchType extends PlatformManageSearchType {
  displayDateFrom?: string;
  displayDateTo?: string;
  displayDateRange?: [any, any];
}
