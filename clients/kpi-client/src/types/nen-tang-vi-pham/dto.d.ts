import { EntityType } from "@/types/general";

export interface NenTangViPhamType extends EntityType {
  tenNenTang?: string;
  tenUngDung?: string;
  nguonId?: string;
  loaiViPhamId?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  isHienThi: boolean;
  noiDung?: string;
  tenNguon?: string;
  tenLoaiViPham?: string;
  nenTangLienKetId?: string;
  tenNenTangLienKet?: string;
}
