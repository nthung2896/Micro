import { PhongTroCreateOrUpdateType } from "@/types/phongTro/phongTro";

export interface DangTinFormValues extends PhongTroCreateOrUpdateType {
  soNha?: string;
  duongPho?: string;
}

export interface ImageItem {
  uid: string;
  url: string;
  fileId?: string;
  tenTaiLieu?: string;
  isAvatar?: boolean;
}
