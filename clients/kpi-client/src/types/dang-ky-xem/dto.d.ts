import { EntityType } from "@/types/general";

export interface DangKyXemType extends EntityType {
  id?: string;
  hoTen?: string;
  noiDung?: string;
  noiDungKhac?: string;
  trangThai?: number;
  lyDoTuChoi?: string;
  nenTangMuonXem?: string;
  noiDungMuonXem?: string;
  typeGuiDeXuat?: number;
  typeGuiDeXuat_txt?: string;
  trangThai_txt?: string;
  nenTangDaGan?: string;
  createdId?: string;
  tuNgay?: string | null;
  denNgay?: string | null;
}
